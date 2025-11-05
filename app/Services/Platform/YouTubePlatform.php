<?php

namespace App\Services\Platform;

use App\Models\User;
use App\Services\YouTube\YouTubePlaylistService;
use App\Services\YouTube\YouTubeSearchService;

use App\Exceptions\PlatformException;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Log;

class YouTubePlatform implements PlatformInterface
{

    private int $defaultLimit = 20; 

    public function __construct(
        private YouTubePlaylistService $playlistService,
        private YouTubeSearchService $searchService
    ) {}

    public function getName(): string
    {
        return 'youtube';
    }

    public function isConnected(User $user): bool
    {
        Log::info('YouTube connection check', [
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $connected = $this->playlistService->isConnected($user);

            Log::info('YouTube connection check completed successfully', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'connected' => $connected
            ]);
            return $connected;
        } catch (\Exception $e) {
            Log::error('YouTube connection check failed', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to check YouTube connection',
                'youtube',
                'connection_check',
                $user->id,
                0,
                $e
            );
        }
    }

    public function getUserPlaylists(User $user, ?int $limit = null, $pageToken = null,  ?string $sortBy = null, ?string $order = null): array
    {
        $limit = $limit ?? $this->defaultLimit;

        try {

            $playlists = $this->playlistService->getUserPlaylists($user, $limit, $pageToken, $sortBy, $order);

            // Validate response structure
            if (!isset($playlists['items']) || !is_array($playlists['items'])) {
                throw new \Exception('Invalid playlist response structure');
            }

            return $playlists;
        } catch (\Exception $e) {
            throw new PlatformException(
                $e->getMessage(),
                'youtube',
                'get_user_playlists',
                $user->id,
                0,
                $e
            );
        }
    }

    public function getPlaylistData(string $playlistId, User $user): array
    {
        Log::info('Fetching YouTube playlist data', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $playlists = $this->getUserPlaylists($user);
            $playlistInfo = collect($playlists["items"])->firstWhere('id', $playlistId);

            if (!$playlistInfo) {
                Log::warning('YouTube playlist not found', [
                    'playlist_id' => $playlistId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                ]);
                throw new PlatformException(
                    'Playlist not found',
                    'youtube',
                    'get_playlist_data',
                    $user->id
                );
            }

            $tracks = $this->getPlaylistTracks($playlistId, $user);

            $data = [
                'id' => $playlistId,
                'name' => $playlistInfo['snippet']['title'],
                'description' => $playlistInfo['snippet']['description'] ?? '',
                'image_url' => $playlistInfo['snippet']['thumbnails']['default']['url'] ?? null,
                'tracks' => $tracks,
            ];

            Log::info('Fetching YouTube playlist data completed successfully', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'track_count' => count($tracks['items'] ?? [])
            ]);

            return $data;
        } catch (PlatformException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Fetching YouTube playlist data failed', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to fetch YouTube playlist data',
                'youtube',
                'get_playlist_data',
                $user->id,
                0,
                $e
            );
        }
    }

    public function getPlaylistTracks(string $playlistId, User $user, ?int $limit = null, $pageToken = null,  ?string $sortBy = null, ?string $order = null): array
    {
        $limit = $limit ?? $this->defaultLimit;
        Log::info('Fetching YouTube playlist tracks', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'limit' => $limit,
            'page_token' => $pageToken
        ]);

        try {
            $tracks = $this->playlistService->getPlaylistTracks($playlistId, $user, $limit, $pageToken, $sortBy, $order);
            Log::info('Fetching YouTube playlist tracks completed successfully', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'limit' => $limit,
                'page_token' => $pageToken,
                'track_count' => count($tracks['items'] ?? [])
            ]);
            return $tracks;
        } catch (\Exception $e) {
            Log::error('Fetching YouTube playlist tracks failed', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'limit' => $limit,
                'page_token' => $pageToken,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to fetch YouTube playlist tracks',
                'youtube',
                'get_playlist_tracks',
                $user->id,
                0,
                $e
            );
        }
    }

    public function createPlaylist(User $user, string $name, string $description = ''): array
    {
        Log::info('Creating YouTube playlist', [
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'playlist_name' => $name,
            'description' => $description
        ]);

        try {
            $playlist = $this->playlistService->createPlaylist($user, $name, $description);
            Log::info('Creating YouTube playlist completed successfully', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'playlist_name' => $name,
                'description' => $description,
                'created_playlist_id' => $playlist['id']
            ]);
            return $playlist;
        } catch (\Exception $e) {
            Log::error('Creating YouTube playlist failed', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'playlist_name' => $name,
                'description' => $description,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to create YouTube playlist',
                'youtube',
                'create_playlist',
                $user->id,
                0,
                $e
            );
        }
    }

    public function searchTrack(string $artist, string $title, User $user): ?array
    {
        Log::info('Searching for track on YouTube', [
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'artist' => $artist,
            'title' => $title
        ]);

        try {
            // Get multiple results from the service
            $results = $this->playlistService->searchTrack($artist, $title, $user);

            if (empty($results)) {
                throw new PlatformException("No tracks found on YouTube", 'youtube', 'search_track', $user->id);
            }

            // Clean the title for matching
            $cleanTitle = $this->cleanTitle($title);

            // Find the best match from the results
            $bestMatch = $this->findBestMatch($results, $artist, $cleanTitle);

            if (!$bestMatch) {
                throw new PlatformException("No suitable match found on YouTube", 'youtube', 'search_track', $user->id);
            }

            Log::info('Searching for track on YouTube completed successfully', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'artist' => $artist,
                'title' => $title,
                'found_track' => $bestMatch['title']
            ]);

            return $bestMatch;
        } catch (PlatformException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Searching for track on YouTube failed', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'artist' => $artist,
                'title' => $title,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to search track on YouTube',
                'youtube',
                'search_track',
                $user->id,
                0,
                $e
            );
        }
    }

    public function searchTracks(string $artist, string $title, User $user): ?array
    {
        Log::info('Searching for tracks on YouTube (unprocessed)', [
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'artist' => $artist,
            'title' => $title
        ]);

        try {
            // Get unprocessed results from the service
            $results = $this->playlistService->searchTrack($artist, $title, $user);

            if (empty($results)) {
                Log::warning('No tracks found on YouTube', [
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                    'artist' => $artist,
                    'title' => $title
                ]);
                return null;
            }

            Log::info('Searching for tracks on YouTube (unprocessed) completed successfully', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'artist' => $artist,
                'title' => $title,
                'results_count' => count($results)
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error('Searching for tracks on YouTube (unprocessed) failed', [
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'artist' => $artist,
                'title' => $title,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            return null;
        }
    }

    public function addTrackToPlaylist(string $playlistId, string $trackId, User $user): bool
    {
        Log::info('Adding track to YouTube playlist', [
            'playlist_id' => $playlistId,
            'track_id' => $trackId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $success = $this->playlistService->addTrackToPlaylist($playlistId, $trackId, $user);

            if ($success) {
                Log::info('Adding track to YouTube playlist completed successfully', [
                    'playlist_id' => $playlistId,
                    'track_id' => $trackId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                ]);
            } else {
                Log::warning('Failed to add track to YouTube playlist', [
                    'playlist_id' => $playlistId,
                    'track_id' => $trackId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            Log::error('Adding track to YouTube playlist failed', [
                'playlist_id' => $playlistId,
                'track_id' => $trackId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            return false;
        }
    }

    public function addTracksToPlaylist(string $playlistId, array $trackIds, User $user): void
    {
        Log::info('Adding multiple tracks to YouTube playlist', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'track_count' => count($trackIds)
        ]);

        $successCount = 0;
        $failedCount = 0;

        foreach ($trackIds as $trackId) {
            if ($this->addTrackToPlaylist($playlistId, $trackId, $user)) {
                $successCount++;
            } else {
                $failedCount++;
            }
        }

        Log::info('Adding multiple tracks to YouTube playlist completed successfully', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
            'track_count' => count($trackIds),
            'success_count' => $successCount,
            'failed_count' => $failedCount
        ]);
    }

    public function removeTrackFromPlaylist(string $playlistId, string $trackId, User $user): bool
    {
        Log::info('Removing track from YouTube playlist', [
            'playlist_id' => $playlistId,
            'track_id' => $trackId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $success = $this->playlistService->removeTrackFromPlaylist($playlistId, $trackId, $user);

            if ($success) {
                Log::info('Removing track from YouTube playlist completed successfully', [
                    'playlist_id' => $playlistId,
                    'track_id' => $trackId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                ]);
            } else {
                throw new PlatformException("Failed to remove track from YouTube playlist", 'youtube', 'remove_track_from_playlist', $user->id);
            }

            return $success;

        } catch (\Exception $e) {
            Log::error('Removing track from YouTube playlist failed', [
                'playlist_id' => $playlistId,
                'track_id' => $trackId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to remove track from YouTube playlist',
                'youtube',
                'remove_track_from_playlist',
                $user->id,
                0,
                $e
            );
        }
    }

    public function getPlaylistById(string $playlistId, User $user): ?array
    {
        Log::info('Fetching YouTube playlist by ID', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $playlist = $this->playlistService->getPlaylistById($playlistId, $user);

            if ($playlist) {
                Log::info('Fetching YouTube playlist by ID completed successfully', [
                    'playlist_id' => $playlistId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                    'track_count' => count($playlist['tracks']['items'] ?? [])
                ]);
            } else {
                throw new PlatformException("YouTube playlist not found by ID", 'youtube', 'get_playlist_by_id', $user->id);
            }

            return $playlist;

        } catch (\Exception $e) {
            Log::error('Fetching YouTube playlist by ID failed', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to fetch YouTube playlist by ID',
                'youtube',
                'get_playlist_by_id',
                $user->id,
                0,
                $e
            );
        }
    }

    public function deletePlaylist(string $playlistId, User $user): bool
    {
        Log::info('Deleting YouTube playlist', [
            'playlist_id' => $playlistId,
            'user_id' => $user->id,
            'service' => get_class($this),
            'timestamp' => now()->toISOString(),
        ]);

        try {
            $success = $this->playlistService->deletePlaylist($playlistId, $user);

            if ($success) {
                Log::info('Deleting YouTube playlist completed successfully', [
                    'playlist_id' => $playlistId,
                    'user_id' => $user->id,
                    'service' => get_class($this),
                    'timestamp' => now()->toISOString(),
                ]);
            } else {
                throw new PlatformException("Failed to delete YouTube playlist", 'youtube', 'delete_playlist', $user->id);
            }

            return $success;

        } catch (\Exception $e) {
            Log::error('Deleting YouTube playlist failed', [
                'playlist_id' => $playlistId,
                'user_id' => $user->id,
                'service' => get_class($this),
                'timestamp' => now()->toISOString(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
            ]);
            throw new PlatformException(
                'Failed to delete YouTube playlist',
                'youtube',
                'delete_playlist',
                $user->id,
                0,
                $e
            );
        }
    }

    /**
     * Clean track title by removing brackets, parentheses, and non-alphabetic symbols.
     *
     * @param string $title Raw track title
     * @return string Cleaned title
     */
    private function cleanTitle(string $title): string
    {
        // Remove content within brackets and parentheses
        $title = preg_replace('/\([^)]*\)/', '', $title); // Remove parentheses and content
        $title = preg_replace('/\[[^\]]*\]/', '', $title); // Remove square brackets and content
        $title = preg_replace('/\{[^}]*\}/', '', $title); // Remove curly brackets and content

        // Remove non-alphabetic symbols but keep spaces and basic punctuation
        $title = preg_replace('/[^a-zA-Z\s\'-]/', '', $title);

        // Clean up extra spaces
        $title = preg_replace('/\s+/', ' ', trim($title));

        return trim($title);
    }

    /**
     * Find the best matching track from search results based on artist and title similarity.
     *
     * @param array $items Search results from YouTube API
     * @param string $targetArtist Target artist name
     * @param string $targetTitle Target track title
     * @return array|null Best matching item or null if no good match found
     */
    private function findBestMatch(array $items, string $targetArtist, string $targetTitle): ?array
    {
        $bestMatch = null;
        $bestScore = 0;

        foreach ($items as $item) {
            $itemTitle = strtolower($item['title']);
            $itemArtist = strtolower($item['artist']);

            $targetTitleLower = strtolower($targetTitle);
            $targetArtistLower = strtolower($targetArtist);

            // Calculate similarity scores (0-100)
            $titleSimilarity = $this->calculateSimilarity($targetTitleLower, $itemTitle);
            $artistSimilarity = $this->calculateSimilarity($targetArtistLower, $itemArtist);

            // Weighted score: title is more important (70%), artist (30%)
            $score = ($titleSimilarity * 0.7) + ($artistSimilarity * 0.3);

            // Bonus for exact matches
            if ($itemTitle === $targetTitleLower) {
                $score += 20;
            }
            if ($itemArtist === $targetArtistLower) {
                $score += 10;
            }

            // Check if this item contains both artist and title in the title string
            if (str_contains($itemTitle, $targetArtistLower) && str_contains($itemTitle, $targetTitleLower)) {
                $score += 15;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $item;
            }
        }

        // Only return if score is above threshold (avoids very poor matches)
        return $bestScore >= 30 ? $bestMatch : null;
    }

    /**
     * Calculate similarity percentage between two strings using PHP's similar_text.
     *
     * @param string $str1 First string
     * @param string $str2 Second string
     * @return float Similarity percentage (0-100)
     */
    private function calculateSimilarity(string $str1, string $str2): float
    {
        if (empty($str1) || empty($str2)) {
            return 0.0;
        }

        similar_text($str1, $str2, $percent);
        return (float) $percent;
    }
}
