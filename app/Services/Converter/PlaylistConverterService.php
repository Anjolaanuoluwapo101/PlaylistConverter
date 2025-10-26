<?php

namespace App\Services\Converter;

use App\Models\User;
use App\Models\Playlist;
use App\Models\ConversionJob;
use App\Models\Track;
use App\Services\Platform\PlatformFactory;
use App\Jobs\ConvertPlaylistJob as ConvertPlaylistJobQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlaylistConverterService
{
    public function __construct(
        private PlatformFactory $platformFactory
    ) {
    }

    /**
     * Perform a playlist conversion using an existing job
     */
    public function convert(
        string $sourcePlaylistId,
        string $sourcePlatform,
        string $targetPlatform,
        User $user,
        ConversionJob $job
    ): ConversionJob {
        Log::info("Initiating playlist conversion", [
            'user_id' => $user->id,
            'source_playlist_id' => $sourcePlaylistId,
            'source_platform' => $sourcePlatform,
            'target_platform' => $targetPlatform
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

        if ($sourcePlatform === $targetPlatform) {
            Log::error("Source and target platforms are the same", [
                'platform' => $sourcePlatform
            ]);
            throw new \InvalidArgumentException('Source and target platforms cannot be the same');
        }

        // Get platform instances
        $sourcePlatformInstance = $this->platformFactory->make($sourcePlatform);
        $targetPlatformInstance = $this->platformFactory->make($targetPlatform);

        // Check connections
        if (!$sourcePlatformInstance->isConnected($user)) {
            Log::error("Source platform not connected", [
                'user_id' => $user->id,
                'platform' => $sourcePlatform
            ]);
            throw new \Exception("{$sourcePlatform} account not connected");
        }

        if (!$targetPlatformInstance->isConnected($user)) {
            Log::error("Target platform not connected", [
                'user_id' => $user->id,
                'platform' => $targetPlatform
            ]);
            throw new \Exception("{$targetPlatform} account not connected");
        }

        DB::beginTransaction();

        try {
            // Fetch source playlist data
            Log::info("Fetching source playlist data", [
                'playlist_id' => $sourcePlaylistId,
                'platform' => $sourcePlatform
            ]);

            $playlistData = $sourcePlatformInstance->getPlaylistData($sourcePlaylistId, $user);
            Log::info("Source playlist data fetched", [
                'data' => $playlistData
            ]);
            // Save playlist to database
            $trackCount = count($playlistData['tracks']['items'] ?? $playlistData['tracks']);
            Log::info("Saving playlist to database", [
                'name' => $playlistData['name'],
                'track_count' => $trackCount
            ]);

            $playlist = Playlist::create([
                'user_id' => $user->id,
                'source_platform' => $sourcePlatform,
                'source_playlist_id' => $sourcePlaylistId,
                'name' => $playlistData['name'],
                'description' => $playlistData['description'] ?? '',
                'track_count' => $trackCount,
                'image_url' => $playlistData['image_url'] ?? null,
            ]);

            Log::info("Playlist saved to database", ['playlist_id' => $playlist->id]);

            // Save tracks
            Log::info("Saving tracks to database", ['count' => $trackCount]);

            foreach ($playlistData['tracks']['items'] as $track) {
                Track::create([
                    'playlist_id' => $playlist->id,
                    'source_track_id' => $track['id'],
                    'title' => $track['title'],
                    'artist' => $track['artist'],
                    'album' => $track['album'] ?? null,
                    'duration_ms' => $track['duration_ms'] ?? null,
                ]);
            }

            Log::info("Tracks saved to database successfully");

            // Update the job with playlist and track info
            $job->update([
                'source_playlist_id' => $playlist->id,
                'total_tracks' => $trackCount,
            ]);

            Log::info("Conversion job updated", ['job_id' => $job->id]);

            DB::commit();

            // Perform the conversion immediately
            $this->performConversion($job, $user);
            Log::info("Conversion job performed immediately (not queued)", [
                'job_id' => $job->id
            ]);

            return $job->fresh();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to initiate playlist conversion", [
                'user_id' => $user->id,
                'source_playlist_id' => $sourcePlaylistId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Perform the actual conversion (called by the queue job)
     */
    public function performConversion(ConversionJob $job, User $user): void
    {
        Log::info("Starting conversion execution", [
            'job_id' => $job->id,
            'target_platform' => $job->target_platform
        ]);

        try {
            $playlist = $job->sourcePlaylist;
            $targetPlatform = $this->platformFactory->make($job->target_platform);

            // Create target playlist
            $targetName = $job->target_playlist_name ?? "{$playlist->name} (Converted)";
            $targetDescription = $job->target_playlist_description ?? $playlist->description;

            Log::info("Creating target playlist", [
                'name' => $targetName,
                'custom_name' => $job->target_playlist_name !== null
            ]);

            $targetPlaylistData = $targetPlatform->createPlaylist(
                $user,
                $targetName,
                $targetDescription
            );

            $job->update(['target_playlist_id' => $targetPlaylistData['id']]);

            Log::info("Target playlist created", [
                'playlist_id' => $targetPlaylistData['id']
            ]);

            // Convert tracks
            $tracks = $playlist->tracks;
            $totalTracks = $tracks->count();
            $matchedTracks = 0;
            $failedTracks = [];

            Log::info("Starting track conversion", ['total_tracks' => $totalTracks]);

            foreach ($tracks as $index => $track) {
                Log::info("Converting track", [
                    'index' => $index + 1,
                    'total' => $totalTracks,
                    'artist' => $track->artist,
                    'title' => $track->title
                ]);

                try {
                    $found = $this->findAndAddTrack(
                        $track,
                        $targetPlaylistData['id'],
                        $targetPlatform,
                        $user
                    );

                    if ($found) {
                        $matchedTracks++;
                        Log::info("Track converted successfully", [
                            'artist' => $track->artist,
                            'title' => $track->title
                        ]);
                    } else {
                        $failedTracks[] = [
                            'title' => $track->title,
                            'artist' => $track->artist,
                            'reason' => 'Not found on target platform',
                        ];
                        Log::warning("Track not found on target platform", [
                            'artist' => $track->artist,
                            'title' => $track->title
                        ]);
                    }

                } catch (\Exception $e) {
                    $failedTracks[] = [
                        'title' => $track->title,
                        'artist' => $track->artist,
                        'reason' => $e->getMessage(),
                    ];
                    Log::error("Failed to convert track", [
                        'artist' => $track->artist,
                        'title' => $track->title,
                        'error' => $e->getMessage()
                    ]);
                }

                // Update progress
                $progress = (int) ((($index + 1) / $totalTracks) * 100);
                $job->update([
                    'matched_tracks' => $matchedTracks,
                    'failed_tracks' => count($failedTracks),
                    'progress_percentage' => $progress,
                ]);

                Log::info("Progress updated", [
                    'progress' => $progress,
                    'matched' => $matchedTracks,
                    'failed' => count($failedTracks)
                ]);
            }

            // Mark as completed
            $job->update([
                'status' => 'completed',
                'failed_track_details' => $failedTracks,
            ]);

            Log::info("Conversion execution completed", [
                'job_id' => $job->id,
                'total_tracks' => $totalTracks,
                'matched_tracks' => $matchedTracks,
                'failed_tracks' => count($failedTracks)
            ]);

        } catch (\Exception $e) {
            $job->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error("Conversion execution failed", [
                'job_id' => $job->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Find track on target platform and add to playlist
     */
    private function findAndAddTrack(
        Track $track,
        string $targetPlaylistId,
        $targetPlatform,
        User $user
    ): bool {
        Log::info("Finding and adding track", [
            'artist' => $track->artist,
            'title' => $track->title,
            'target_platform' => $targetPlatform->getName()
        ]);

        try {
            // Search for track on target platform
            $result = $targetPlatform->searchTrack($track->artist, $track->title, $user);

            if (!$result || $result === null) {
                Log::warning("Track search returned no results", [
                    'artist' => $track->artist,
                    'title' => $track->title
                ]);
                return false;
            }

            // Add track to playlist
            $added = $targetPlatform->addTrackToPlaylist(
                $targetPlaylistId,
                $result['id'],
                $user
            );

            if ($added) {
                Log::info("Track successfully added to target playlist", [
                    'artist' => $track->artist,
                    'title' => $track->title,
                    'matched_track' => $result['title']
                ]);
            }

            return $added;

        } catch (\Exception $e) {
            Log::error("Exception while finding and adding track", [
                'artist' => $track->artist,
                'title' => $track->title,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get conversion job status
     */
    public function getConversionStatus(int $jobId, User $user): ?ConversionJob
    {
        Log::info("Fetching conversion status", [
            'job_id' => $jobId,
            'user_id' => $user->id
        ]);

        $job = ConversionJob::where('id', $jobId)
            ->where('user_id', $user->id)
            ->with('sourcePlaylist')
            ->first();

        if (!$job) {
            Log::warning("Conversion job not found", [
                'job_id' => $jobId,
                'user_id' => $user->id
            ]);
        }

        return $job;
    }

    /**
     * Get all conversion jobs for a user
     */
    public function getUserConversions(User $user): array
    {
        Log::info("Fetching user conversions", ['user_id' => $user->id]);

        $jobs = ConversionJob::where('user_id', $user->id)
            ->with('sourcePlaylist')
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info("User conversions fetched", [
            'user_id' => $user->id,
            'count' => $jobs->count()
        ]);

        return $jobs->toArray();
    }
}