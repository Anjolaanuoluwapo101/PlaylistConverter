<?php

namespace App\Services\Platform;

use App\Models\User;
use App\Services\YouTube\YouTubePlaylistService;
use App\Services\YouTube\YouTubeSearchService;
use App\Traits\LogsOperations;
use App\Exceptions\PlatformException;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Log;

class YouTubePlatform implements PlatformInterface
{
    use LogsOperations;

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
        $this->logOperationStart('YouTube connection check', $this->createUserContext($user));

        try {
            $connected = $this->playlistService->isConnected($user);
            if(isset($connected['error'])){
                return false;
            }
            $this->logOperationSuccess('YouTube connection check', $this->createUserContext($user, [
                'connected' => $connected
            ]));
            return $connected;
        } catch (\Exception $e) {
            $this->logOperationFailure('YouTube connection check', $e, $this->createUserContext($user));
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
                'Failed to fetch YouTube playlists',
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
        $this->logOperationStart('Fetching YouTube playlist data', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));

        try {
            $playlists = $this->getUserPlaylists($user);
            $playlistInfo = collect($playlists["items"])->firstWhere('id', $playlistId);

            if (!$playlistInfo) {
                $this->logWarning('YouTube playlist not found', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
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

            $this->logOperationSuccess('Fetching YouTube playlist data', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
                'track_count' => count($tracks['items'] ?? [])
            ])));

            return $data;
        } catch (PlatformException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->logOperationFailure('Fetching YouTube playlist data', $e, $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
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
        $this->logOperationStart('Fetching YouTube playlist tracks', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
            'limit' => $limit,
            'page_token' => $pageToken
        ])));

        try {
            $tracks = $this->playlistService->getPlaylistTracks($playlistId, $user, $limit, $pageToken, $sortBy, $order);
            $this->logOperationSuccess('Fetching YouTube playlist tracks', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
                'limit' => $limit,
                'page_token' => $pageToken,
                'track_count' => count($tracks['items'] ?? [])
            ])));
            return $tracks;
        } catch (\Exception $e) {
            $this->logOperationFailure('Fetching YouTube playlist tracks', $e, $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
                'limit' => $limit,
                'page_token' => $pageToken
            ])));
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
        $this->logOperationStart('Creating YouTube playlist', $this->createUserContext($user, [
            'playlist_name' => $name,
            'description' => $description
        ]));

        try {
            $playlist = $this->playlistService->createPlaylist($user, $name, $description);
            $this->logOperationSuccess('Creating YouTube playlist', $this->createUserContext($user, [
                'playlist_name' => $name,
                'description' => $description,
                'created_playlist_id' => $playlist['id']
            ]));
            return $playlist;
        } catch (\Exception $e) {
            $this->logOperationFailure('Creating YouTube playlist', $e, $this->createUserContext($user, [
                'playlist_name' => $name,
                'description' => $description
            ]));
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
        $this->logOperationStart('Searching for track on YouTube', $this->createUserContext($user, [
            'artist' => $artist,
            'title' => $title
        ]));

        try {
            // Get multiple results from the service
            $results = $this->playlistService->searchTrack($artist, $title, $user);

            if (empty($results)) {
                $this->logWarning('No tracks found on YouTube', $this->createUserContext($user, [
                    'artist' => $artist,
                    'title' => $title
                ]));
                return null;
            }

            // Clean the title for matching
            $cleanTitle = $this->cleanTitle($title);

            // Find the best match from the results
            $bestMatch = $this->findBestMatch($results, $artist, $cleanTitle);

            if (!$bestMatch) {
                $this->logWarning('No suitable match found on YouTube', $this->createUserContext($user, [
                    'artist' => $artist,
                    'title' => $title
                ]));
                return null;
            }

            $this->logOperationSuccess('Searching for track on YouTube', $this->createUserContext($user, [
                'artist' => $artist,
                'title' => $title,
                'found_track' => $bestMatch['title']
            ]));

            return $bestMatch;
        } catch (\Exception $e) {
            $this->logOperationFailure('Searching for track on YouTube', $e, $this->createUserContext($user, [
                'artist' => $artist,
                'title' => $title
            ]));
            return null;
        }
    }

    public function searchTracks(string $artist, string $title, User $user): ?array
    {
        $this->logOperationStart('Searching for tracks on YouTube (unprocessed)', $this->createUserContext($user, [
            'artist' => $artist,
            'title' => $title
        ]));

        try {
            // Get unprocessed results from the service
            $results = $this->playlistService->searchTrack($artist, $title, $user);

            if (empty($results)) {
                $this->logWarning('No tracks found on YouTube', $this->createUserContext($user, [
                    'artist' => $artist,
                    'title' => $title
                ]));
                return null;
            }

            $this->logOperationSuccess('Searching for tracks on YouTube (unprocessed)', $this->createUserContext($user, [
                'artist' => $artist,
                'title' => $title,
                'results_count' => count($results)
            ]));

            return $results;
        } catch (\Exception $e) {
            $this->logOperationFailure('Searching for tracks on YouTube (unprocessed)', $e, $this->createUserContext($user, [
                'artist' => $artist,
                'title' => $title
            ]));
            return null;
        }
    }

    public function addTrackToPlaylist(string $playlistId, string $trackId, User $user): bool
    {
        $this->logOperationStart('Adding track to YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));

        try {
            $success = $this->playlistService->addTrackToPlaylist($playlistId, $trackId, $user);

            if ($success) {
                $this->logOperationSuccess('Adding track to YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            } else {
                $this->logWarning('Failed to add track to YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            }

            return $success;
        } catch (\Exception $e) {
            $this->logOperationFailure('Adding track to YouTube playlist', $e, $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            return false;
        }
    }

    public function addTracksToPlaylist(string $playlistId, array $trackIds, User $user): void
    {
        $this->logOperationStart('Adding multiple tracks to YouTube playlist', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
            'track_count' => count($trackIds)
        ])));

        $successCount = 0;
        $failedCount = 0;

        foreach ($trackIds as $trackId) {
            if ($this->addTrackToPlaylist($playlistId, $trackId, $user)) {
                $successCount++;
            } else {
                $failedCount++;
            }
        }

        $this->logOperationSuccess('Adding multiple tracks to YouTube playlist', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
            'track_count' => count($trackIds),
            'success_count' => $successCount,
            'failed_count' => $failedCount
        ])));
    }

    public function removeTrackFromPlaylist(string $playlistId, string $trackId, User $user): bool
    {
        $this->logOperationStart('Removing track from YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));

        try {
            $success = $this->playlistService->removeTrackFromPlaylist($playlistId, $trackId, $user);

            if ($success) {
                $this->logOperationSuccess('Removing track from YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            } else {
                $this->logWarning('Failed to remove track from YouTube playlist', $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            }

            return $success;

        } catch (\Exception $e) {
            $this->logOperationFailure('Removing track from YouTube playlist', $e, $this->createPlaylistContext($playlistId, $this->createTrackContext($trackId, $this->createUserContext($user))));
            return false;
        }
    }

    public function getPlaylistById(string $playlistId, User $user): ?array
    {
        $this->logOperationStart('Fetching YouTube playlist by ID', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));

        try {
            $playlist = $this->playlistService->getPlaylistById($playlistId, $user);

            if ($playlist) {
                $this->logOperationSuccess('Fetching YouTube playlist by ID', $this->createPlaylistContext($playlistId, $this->createUserContext($user, [
                    'track_count' => count($playlist['tracks']['items'] ?? [])
                ])));
            } else {
                $this->logWarning('YouTube playlist not found by ID', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
            }

            return $playlist;

        } catch (\Exception $e) {
            $this->logOperationFailure('Fetching YouTube playlist by ID', $e, $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
            return null;
        }
    }

    public function deletePlaylist(string $playlistId, User $user): bool
    {
        $this->logOperationStart('Deleting YouTube playlist', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));

        try {
            $success = $this->playlistService->deletePlaylist($playlistId, $user);

            if ($success) {
                $this->logOperationSuccess('Deleting YouTube playlist', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
            } else {
                $this->logWarning('Failed to delete YouTube playlist', $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
            }

            return $success;

        } catch (\Exception $e) {
            $this->logOperationFailure('Deleting YouTube playlist', $e, $this->createPlaylistContext($playlistId, $this->createUserContext($user)));
            return false;
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
