<?php

namespace App\Services\Builder;

use App\Models\PlaylistBuildJob;
use App\Models\User;
use App\Services\Platform\PlatformFactory;
use App\Traits\LogsOperations;
use Exception;

class PlaylistBuilderService
{
    use LogsOperations;

    private PlatformFactory $platformFactory;

    public function __construct(PlatformFactory $platformFactory)
    {
        $this->platformFactory = $platformFactory;
    }

    /**
     * Build playlists across multiple platforms
     *
     * @param PlaylistBuildJob $job
     * @return array Results for each platform
     * @throws Exception
     */
    public function buildPlaylists(PlaylistBuildJob $job): array {
        $results = [];

        // Mark job as processing
        $job->markAsProcessing();

        // Validate track limit (5 tracks max)
        if (count($job->selected_tracks) > 5) {
            throw new Exception('Maximum 5 tracks allowed per playlist');
        }

        // Group tracks by platform for efficient processing
        $tracksByPlatform = $this->groupTracksByPlatform($job->selected_tracks);

        // Process each selected platform
        foreach ($job->selected_platforms as $platformName) {
            try {
                $platform = $this->platformFactory->make($platformName);

                // Check connection (exceptions will bubble up)
                $platform->isConnected($job->user);

                // Create playlist on this platform
                $playlistData = $platform->createPlaylist(
                    $job->user,
                    $job->playlist_name,
                    $job->playlist_description
                );

                $playlistId = $playlistData['id'];

                // Get tracks for this platform
                $platformTracks = $tracksByPlatform[$platformName] ?? [];

                if (!empty($platformTracks)) {
                    // Extract track IDs for this platform
                    $trackIds = array_column($platformTracks, 'track_id');

                    // Add tracks to the playlist
                    $platform->addTracksToPlaylist($playlistId, $trackIds, $job->user);
                }

                $results[$platformName] = [
                    'success' => true,
                    'playlist_id' => $playlistId,
                    'playlist_url' => $playlistData['url'] ?? null,
                    'tracks_added' => count($platformTracks),
                ];

                $this->logOperationSuccess(
                    "Created playlist '{$job->playlist_name}' on {$platformName}",
                    $this->createUserContext($job->user, [
                        'platform' => $platformName,
                        'tracks_count' => count($platformTracks),
                        'playlist_id' => $playlistId,
                    ])
                );

            } catch (Exception $e) {
                $results[$platformName] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                ];

                $this->logOperationFailure(
                    "Failed to create playlist on {$platformName}",
                    $e,
                    $this->createUserContext($job->user, [
                        'platform' => $platformName,
                    ])
                );
            }
        }

        // Update job with final results
        $hasErrors = collect($results)->contains(function ($result) {
            return isset($result['success']) && $result['success'] === false;
        });

        if ($hasErrors) {
            $job->markAsFailed('Some platforms failed to create playlists');
        } else {
            $job->markAsCompleted($results);
        }

        return $results;
    }

    /**
     * Group selected tracks by platform
     *
     * @param array $selectedTracks
     * @return array
     */
    private function groupTracksByPlatform(array $selectedTracks): array
    {
        $grouped = [];

        foreach ($selectedTracks as $track) {
            $platform = $track['platform'];
            if (!isset($grouped[$platform])) {
                $grouped[$platform] = [];
            }
            $grouped[$platform][] = $track;
        }

        return $grouped;
    }
}
