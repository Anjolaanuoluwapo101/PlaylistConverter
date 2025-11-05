<?php

namespace App\Services\Converter;

use App\Models\User;
use App\Models\SyncJob;
use App\Services\Platform\PlatformFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlaylistSyncService
{
    public function __construct(
        private PlatformFactory $platformFactory
    ) {}

    /**
     * Perform a playlist sync using an existing job
     */
    public function sync(
        string $sourcePlaylistId,
        string $sourcePlatform,
        string $targetPlaylistId,
        string $targetPlatform,
        User $user,
        SyncJob $job
    ): SyncJob {
        Log::info("Initiating playlist sync", [
            'user_id' => $user->id,
            'source_playlist_id' => $sourcePlaylistId,
            'source_platform' => $sourcePlatform,
            'target_playlist_id' => $targetPlaylistId,
            'target_platform' => $targetPlatform,
            'remove_extras' => $job->remove_extras
        ]);

        // Validate platforms
        if (!$this->platformFactory->isSupported($sourcePlatform)) {
            Log::error("Invalid source platform", ['platform' => $sourcePlatform]);
            throw new \InvalidArgumentException("Invalid source platform: {$sourcePlatform}");
        }

        if (!$this->platformFactory->isSupported($targetPlatform)) {
            Log::error("Invalid target platform", ['platform' => $targetPlatform]);
            throw new \InvalidArgumentException("Invalid target platform: {$targetPlatform}");
        }

        // Check connections (exceptions will bubble up)
        $sourcePlatformInstance = $this->platformFactory->make($sourcePlatform);
        $targetPlatformInstance = $this->platformFactory->make($targetPlatform);

        $sourcePlatformInstance->isConnected($user);
        $targetPlatformInstance->isConnected($user);

        // Perform the sync immediately using the provided job
        $this->performSyncing($job, $user);
        Log::info("Sync job performed immediately (not queued)", [
            'job_id' => $job->id
        ]);

        return $job->fresh();
    }

    /**
     * Perform the actual syncing (called by the queue job)
     */
    public function performSyncing(SyncJob $job, User $user): void
    {
        Log::info("Starting playlist sync", [
            'job_id' => $job->id,
            'user_id' => $user->id,
            'source_playlist_id' => $job->source_playlist_id,
            'source_platform' => $job->source_platform,
            'target_playlist_id' => $job->target_playlist_id,
            'target_platform' => $job->target_platform,
            'remove_extras' => $job->remove_extras
        ]);

        try {
            $job->update(['status' => 'processing']);

            // Validate platforms
            if (!$this->platformFactory->isSupported($job->source_platform)) {
                throw new \InvalidArgumentException("Invalid source platform: {$job->source_platform}");
            }

            if (!$this->platformFactory->isSupported($job->target_platform)) {
                throw new \InvalidArgumentException("Invalid target platform: {$job->target_platform}");
            }

            $sourcePlatformInstance = $this->platformFactory->make($job->source_platform);
            $targetPlatformInstance = $this->platformFactory->make($job->target_platform);

            // Check connections (exceptions will bubble up)
            $sourcePlatformInstance->isConnected($user);
            $targetPlatformInstance->isConnected($user);

            // Fetch both playlists
            $sourcePlaylist = $sourcePlatformInstance->getPlaylistById($job->source_playlist_id, $user);
            if (!$sourcePlaylist) {
                throw new \Exception("Source playlist not found");
            }

            $targetPlaylist = $targetPlatformInstance->getPlaylistById($job->target_playlist_id, $user);
            if (!$targetPlaylist) {
                throw new \Exception("Target playlist not found");
            }

            

            // Compare playlists
            $comparison = $this->comparePlaylists(
                $sourcePlaylist['tracks']['items'],
                $targetPlaylist['tracks']['items'],
                $job->source_platform,
                $job->target_platform
            );

            Log::info("Playlist comparison completed", [
                'tracks_to_add' => count($comparison['to_add']),
                'tracks_to_remove' => count($comparison['to_remove']),
                'tracks_in_sync' => count($comparison['in_sync'])
            ]);

            // Update job with comparison results
            $job->update([
                'tracks_to_add' => count($comparison['to_add']),
                'tracks_to_remove' => $job->remove_extras ? count($comparison['to_remove']) : 0,
                'tracks_in_sync' => count($comparison['in_sync']),
            ]);

            $results = [
                'source_playlist' => [
                    'id' => $job->source_playlist_id,
                    'name' => $sourcePlaylist['name'],
                    'platform' => $job->source_platform,
                    'track_count' => count($sourcePlaylist['tracks']),
                ],
                'target_playlist' => [
                    'id' => $job->target_playlist_id,
                    'name' => $targetPlaylist['name'],
                    'platform' => $job->target_platform,
                    'track_count' => count($targetPlaylist['tracks']),
                ],
                'tracks_to_add' => count($comparison['to_add']),
                'tracks_to_remove' => $job->remove_extras ? count($comparison['to_remove']) : 0,
                'tracks_in_sync' => count($comparison['in_sync']),
                'added' => [],
                'removed' => [],
                'failed_to_add' => [],
                'failed_to_remove' => [],
            ];

            // Add missing tracks
            foreach ($comparison['to_add'] as $track) {
                try {
                    $found = $targetPlatformInstance->searchTrack($track['artist'], $track['title'], $user);

                    if ($found) {
                        $added = $targetPlatformInstance->addTrackToPlaylist(
                            $job->target_playlist_id,
                            $found['id'],
                            $user
                        );

                        if ($added) {
                            $results['added'][] = [
                                'title' => $track['title'],
                                'artist' => $track['artist'],
                                'matched' => $found['title'],
                            ];
                            $job->increment('added_count');
                            Log::info("Track added during sync", [
                                'title' => $track['title'],
                                'artist' => $track['artist']
                            ]);
                        } else {
                            $results['failed_to_add'][] = [
                                'title' => $track['title'],
                                'artist' => $track['artist'],
                                'reason' => 'Failed to add to playlist',
                            ];
                            $job->increment('failed_to_add_count');
                        }
                    } else {
                        $results['failed_to_add'][] = [
                            'title' => $track['title'],
                            'artist' => $track['artist'],
                            'reason' => 'Not found on target platform',
                        ];
                        $job->increment('failed_to_add_count');
                        Log::warning("Track not found during sync", [
                            'title' => $track['title'],
                            'artist' => $track['artist']
                        ]);
                    }
                } catch (\Exception $e) {
                    $results['failed_to_add'][] = [
                        'title' => $track['title'],
                        'artist' => $track['artist'],
                        'reason' => $e->getMessage(),
                    ];
                    $job->increment('failed_to_add_count');
                    Log::error("Error adding track during sync", [
                        'title' => $track['title'],
                        'error' => $e->getMessage()
                    ]);
                }

                // Update progress
                $progress = (int) ((($job->added_count + $job->failed_to_add_count) / max(1, $job->tracks_to_add)) * 100);
                $job->update(['progress_percentage' => $progress]);
            }

            // Remove extra tracks if requested
            if ($job->remove_extras) {
                foreach ($comparison['to_remove'] as $track) {
                    try {
                        $removed = $targetPlatformInstance->removeTrackFromPlaylist(
                            $job->target_playlist_id,
                            $track['id'],
                            $user
                        );

                        if ($removed) {
                            $results['removed'][] = [
                                'title' => $track['title'],
                                'artist' => $track['artist'],
                            ];
                            $job->increment('removed_count');
                            Log::info("Track removed during sync", [
                                'title' => $track['title'],
                                'artist' => $track['artist']
                            ]);
                        } else {
                            $results['failed_to_remove'][] = [
                                'title' => $track['title'],
                                'artist' => $track['artist'],
                                'reason' => 'Failed to remove from playlist',
                            ];
                            $job->increment('failed_to_remove_count');
                        }
                    } catch (\Exception $e) {
                        $results['failed_to_remove'][] = [
                            'title' => $track['title'],
                            'artist' => $track['artist'],
                            'reason' => $e->getMessage(),
                        ];
                        $job->increment('failed_to_remove_count');
                        Log::error("Error removing track during sync", [
                            'title' => $track['title'],
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }

            // Mark as completed
            $job->update([
                'status' => 'completed',
                'results' => $results,
            ]);

            Log::info("Playlist sync completed", [
                'job_id' => $job->id,
                'added' => $job->added_count,
                'removed' => $job->removed_count,
                'failed_to_add' => $job->failed_to_add_count,
                'failed_to_remove' => $job->failed_to_remove_count
            ]);

        } catch (\Exception $e) {
            $job->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error("Playlist sync failed", [
                'job_id' => $job->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Compare source and target playlists to find differences
     */
    private function comparePlaylists(
        array $sourceTracks,
        array $targetTracks,
        string $sourcePlatform,
        string $targetPlatform
    ): array {
        // Normalize tracks for comparison (use artist + title as key)
        $sourceNormalized = $this->normalizeTracks($sourceTracks);
        $targetNormalized = $this->normalizeTracks($targetTracks);

        $toAdd = [];
        $toRemove = [];
        $inSync = [];

        // Find tracks in source but not in target (need to add)
        foreach ($sourceTracks as $track) {
            $key = $this->getTrackKey($track);
            if (!isset($targetNormalized[$key])) {
                $toAdd[] = $track;
            } else {
                $inSync[] = $track;
            }
        }

        // Find tracks in target but not in source (can remove)
        foreach ($targetTracks as $track) {
            $key = $this->getTrackKey($track);
            if (!isset($sourceNormalized[$key])) {
                $toRemove[] = $track;
            }
        }

        return [
            'to_add' => $toAdd,
            'to_remove' => $toRemove,
            'in_sync' => $inSync,
        ];
    }

    /**
     * Normalize tracks into a keyed array for comparison
     */
    private function normalizeTracks(array $tracks): array
    {
        $normalized = [];
        foreach ($tracks as $track) {
            $key = $this->getTrackKey($track);
            $normalized[$key] = $track;
        }
        return $normalized;
    }

    /**
     * Get a unique key for a track (normalized artist + title)
     */
    private function getTrackKey(array $track): string
    {
        $artist = $this->normalizeString($track['artist'] ?? '');
        $title = $this->normalizeString($track['title'] ?? '');
        return "{$artist}|||{$title}";
    }

    /**
     * Normalize string for comparison (lowercase, remove special chars, trim)
     */
    private function normalizeString(string $str): string
    {
        $str = strtolower($str);
        // Remove special characters
        $str = preg_replace('/[^\w\s]/', '', $str);
        // Remove extra spaces
        $str = preg_replace('/\s+/', ' ', $str);
        return trim($str);
    }
}