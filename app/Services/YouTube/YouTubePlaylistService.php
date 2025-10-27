<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\YouTube\YouTubeAuthService;
use Illuminate\Support\Facades\Cache;

class YouTubePlaylistService
{
    private string $baseUrl = 'https://www.googleapis.com/youtube/v3';

    public function __construct(
        private YouTubeAuthService $authService 
    ) {
    }

    // public function getUserPlaylists(User $user): array
    // {
    //     $token = $this->authService->getValidToken($user);
    //     $playlists = [];
    //     $pageToken = null;

    //     do {
    //         $params = [
    //             'part' => 'snippet,contentDetails',
    //             'mine' => 'true',
    //             'maxResults' => 50,
    //         ];

    //         if ($pageToken) {
    //             $params['pageToken'] = $pageToken;
    //         }

    //         $response = Http::withToken($token)->get("{$this->baseUrl}/playlists", $params);

    //         if ($response->failed()) {
    //             Log::error('Failed to fetch YouTube playlists for user ' . $user->id, [
    //                 'status' => $response->status(),
    //                 'response' => $response->body(),
    //             ]);
    //             throw new \Exception('Failed to fetch YouTube playlists');
    //         }

    //         $data = $response->json();
    //         $playlists = array_merge($playlists, $data['items'] ?? []);
    //         $pageToken = $data['nextPageToken'] ?? null;

    //     } while ($pageToken);

    //     return $playlists;
    // }

    // public function isConnected(User $user): bool
    // {
    //     $cacheKey = "youtube_connected_{$user->id}";
        
    //     return Cache::remember($cacheKey, 300, function() use ($user, $cacheKey) {
    //         // ... all the validation logic from above ...
    //         Log::info("Checking Youtube connection validity (fresh check)", [
    //         'user_id' => $user->id,
    //         'has_access_token' => !empty($user->youtube_access_token),
    //     ]);

    //     if (empty($user->spotify_access_token) || empty($user->spotify_refresh_token)) {
    //         Log::info("Spotify not connected - missing tokens", ['user_id' => $user->id]);
    //         return false;
    //     }

    //     try {
    //         $token = $this->authService->getValidToken($user);
    //         $response = Http::withToken($token)->get('https://www.googleapis.com/youtube/v3');

    //         if ($response->successful()) {
    //             Log::info("Yotube connection valid", [
    //                 'user_id' => $user->id,
    //                 'spotify_user_id' => $response->json()['id'] ?? 'unknown'
    //             ]);
    //             return true;
    //         }

    //         Log::warning("Youtube token invalid", [
    //             'user_id' => $user->id,
    //             'status' => $response->status()
    //         ]);
            
    //         $user->update([
    //             'youtube_access_token' => null,
    //             'youtube_refresh_token' => null,
    //             'youtube_token_expires_at' => null,
    //         ]);
            
    //         // Clear cache
    //         Cache::forget($cacheKey);
            
    //         return false;

    //     } catch (\Exception $e) {
    //         Log::error("Spotify connection check failed", [
    //             'user_id' => $user->id,
    //             'error' => $e->getMessage()
    //         ]);
            
    //         $user->update([
    //             'youtube_access_token' => null,
    //             'youtube_refresh_token' => null,
    //             'youtube_token_expires_at' => null,
    //         ]);
            
    //         // Clear cache
    //         Cache::forget($cacheKey);
            
    //         return false;
    //     }
            
    //     });
    // }

    public function isConnected($user) : bool {
        $connected = $user->hasYoutubeToken();
        if(!$connected){
            if($user->youtube_refresh_token){
                $this->authService->refreshToken($user);
            }
            return false;
        }else{
            return true;
        }
    }


    public function getUserPlaylists(
        User $user,
        ?int $limit = 20,
        ?string $pageToken = null,
        ?string $sortBy = null,
        ?string $order = null
    ): array {
        try {
            if ($limit === null) {
                throw new \Exception('Pagination parameters are required.');
            }

            $token = $this->authService->getValidToken($user);
            $params = [
                'part' => 'snippet,contentDetails',
                'mine' => 'true',
                'maxResults' => min($limit, 50), // YouTube max is 50
            ];

            if ($pageToken) {
                $params['pageToken'] = $pageToken;
            }

            $response = Http::withToken($token)->get("{$this->baseUrl}/playlists", $params);

            if ($response->failed()) {
                throw new \Exception('Failed to fetch YouTube playlists');
            }

            $data = $response->json();
            $sorted = null;

            if ($sortBy !== null) {
                $sorted = collect($data['items'])->sortBy(function ($playlist) use ($sortBy) {
                    switch ($sortBy) {
                        case 'name':
                            return strtolower($playlist['snippet']['title']);
                        case 'tracks':
                            return $playlist['contentDetails']['itemCount'] ?? 0;
                        case 'date':
                        default:
                            // Use published date
                            return $playlist['snippet']['publishedAt'] ?? '';
                    }
                }, SORT_REGULAR, $order === 'desc');

                $sorted = $sorted->values()->all();
            }

            return [
                'items' => $sorted ?? $data['items'] ?? [],
                'total' => $data['pageInfo']['totalResults'] ?? 0,
                'next_page_token' => $data['nextPageToken'] ?? null,
                'prev_page_token' => $data['prevPageToken'] ?? null,
                'has_more' => isset($data['nextPageToken']),
                'has_previous' => isset($data['prevPageToken']),
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }



    // public function getPlaylistTracks(string $playlistId, User $user): array
    // {
    //     $token = $this->authService->getValidToken($user);
    //     $tracks = [];
    //     $pageToken = null;

    //     do {
    //         $params = [
    //             'part' => 'snippet,contentDetails',
    //             'playlistId' => $playlistId,
    //             'maxResults' => 50,
    //         ];

    //         if ($pageToken) {
    //             $params['pageToken'] = $pageToken;
    //         }

    //         $response = Http::withToken($token)->get("{$this->baseUrl}/playlistItems", $params);

    //         if ($response->failed()) {
    //             Log::error("Failed to fetch tracks for YouTube playlist {$playlistId} for user " . $user->id, [
    //                 'status' => $response->status(),
    //                 'response' => $response->body(),
    //             ]);
    //             throw new \Exception('Failed to fetch playlist tracks');
    //         }

    //         $data = $response->json();

    //         foreach ($data['items'] ?? [] as $item) {
    //             $tracks[] = [
    //                 'id' => $item['contentDetails']['videoId'],
    //                 'title' => $item['snippet']['title'],
    //                 'artist' => $item['snippet']['videoOwnerChannelTitle'] ?? 'Unknown',
    //                 'album' => null,
    //                 'duration_ms' => null,
    //             ];
    //         }

    //         $pageToken = $data['nextPageToken'] ?? null;

    //     } while ($pageToken);

    //     return $tracks;
    // }

    public function getPlaylistTracks(string $playlistId, User $user, ?int $limit = 20, ?string $pageToken = null, ?string $sortBy = null, ?string $order = null): array
    {
        try {
            if ($limit === null) {
                throw new \Exception('Pagination parameters are required.');
            }

            $token = $this->authService->getValidToken($user);

            $params = [
                'part' => 'snippet,contentDetails',
                'playlistId' => $playlistId,
                'maxResults' => min($limit, 50), // YouTube max is 50
            ];

            if ($pageToken) {
                $params['pageToken'] = $pageToken;
            }

            $response = Http::withToken($token)->get("{$this->baseUrl}/playlistItems", $params);

            if ($response->failed()) {
                throw new \Exception('Failed to fetch playlist tracks');
            }

            $data = $response->json();
            Log::info('Yotube Fetched',[
                $data
            ]);

            if ($sortBy !== null) {
                $sorted = collect($data['items'])->sortBy(function ($track) use ($sortBy) {
                    switch ($sortBy) {
                        case 'title':
                            return strtolower($track['title']);
                        case 'artist':
                            return strtolower($track['artist']);
                        case 'date':
                        default:
                            // YouTube tracks don't have date added, maintain order
                            return $track['id'];
                    }
                }, SORT_REGULAR, $order === 'desc');

                $sorted = $sorted->values()->all();
            }


            $items = [];


            foreach ($sorted ?? $data['items'] as $item) {
                $items[] = [
                    'id' => $item['contentDetails']['videoId'],
                    'title' => $item['snippet']['title'],
                    'artist' => $item['snippet']['videoOwnerChannelTitle'] ?? 'Unknown',
                    'album' => null,
                    'duration_ms' => null,
                    'image_url' => $item['snippet']['thumbnails']['default']['url'] ??
                        $item['snippet']['thumbnails']['medium']['url'] ??
                        $item['snippet']['thumbnails']['high']['url'] ?? null,
                ];
            }

            return [
                'items' => $items,
                'total' => $data['pageInfo']['totalResults'] ?? 0,
                'next_page_token' => $data['nextPageToken'] ?? null,
                'prev_page_token' => $data['prevPageToken'] ?? null,
                'has_more' => isset($data['nextPageToken']),
                'has_previous' => isset($data['prevPageToken']),
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }



    public function createPlaylist(User $user, string $name, string $description = ''): array
    {
        try {
            $token = $this->authService->getValidToken($user);

            // YouTube API: part goes in query string, data in body
            $response = Http::withToken($token)
                ->withQueryParameters(['part' => 'contentDetails,snippet,status,id,player'])
                ->asJson()
                ->post("{$this->baseUrl}/playlists", [
                    'snippet' => [
                        'title' => $name,
                        'description' => $description,

                    ],
                ]);

            if ($response->failed()) {
                throw new \Exception('Failed to create YouTube playlist: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function addTrackToPlaylist(string $playlistId, string $videoId, User $user): bool
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)
                ->withQueryParameters(['part' => 'contentDetails,snippet,status'])
                ->asJson()
                ->post("{$this->baseUrl}/playlistItems", [
                    //'json' => [
                    'snippet' => [
                        'playlistId' => $playlistId,
                        'resourceId' => [
                            'kind' => 'youtube#video',
                            'videoId' => $videoId,
                        ],
                    ]
                    //],
                ]);

            if ($response->failed()) {
                return false;
            }

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function deletePlaylist(string $playlistId, User $user): bool
    {
        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();

            $response = $client->delete('https://www.googleapis.com/youtube/v3/playlists', [
                'query' => [
                    'id' => $playlistId,
                ],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                ],
            ]);

            return $response->getStatusCode() === 204;
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            return false;
        }
    }

    public function searchTrack(string $artist, string $title, User $user): ?array
    {
        try {
            // Clean the title by removing brackets, parentheses, and non-alphabetic symbols
            $cleanTitle = $this->cleanTitle($title);
            $token = $this->authService->getValidToken($user);
            $query = "$cleanTitle $artist";
            $response = Http::withToken($token)->get("{$this->baseUrl}/search", [
                'part' => 'snippet',
                'q' => $query,
                'type' => 'video',
                'videoCategoryId' => '10', // Music category
                'maxResults' => 5, // Return multiple results for platform-level matching
            ]);

            if ($response->failed()) {
                return null;
            }

            $data = $response->json();

            if (empty($data['items'])) {
                return null;
            }

            // Return all results for platform-level best match selection
            $results = [];
            foreach ($data['items'] as $item) {
                $results[] = [
                    'id' => $item['id']['videoId'],
                    'title' => $item['snippet']['title'],
                    'artist' => $item['snippet']['channelTitle'],
                ];
            }

            return $results;
        } catch (\Exception $e) {
            return null;
        }
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
            $itemTitle = strtolower($item['snippet']['title']);
            $itemArtist = strtolower($item['snippet']['channelTitle']);

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

    public function removeTrackFromPlaylist(string $playlistId, string $videoId, User $user): bool
    {
        try {
            $token = $this->authService->getValidToken($user);

            // First, get playlist items to find the item ID
            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/playlistItems", [
                    'part' => 'id,snippet',
                    'playlistId' => $playlistId,
                    'videoId' => $videoId,
                ]);

            if ($response->failed()) {
                return false;
            }

            $data = $response->json();

            if (empty($data['items'])) {
                return false;
            }

            $playlistItemId = $data['items'][0]['id'];

            // Now delete the playlist item
            $deleteResponse = Http::withToken($token)
                ->delete("{$this->baseUrl}/playlistItems?id={$playlistItemId}");

            if ($deleteResponse->failed()) {
                return false;
            }

            return $deleteResponse->status() === 204;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getPlaylistById(string $playlistId, User $user): ?array
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/playlists", [
                    'part' => 'snippet,contentDetails',
                    'id' => $playlistId,
                ]);

            if ($response->failed()) {
                return null;
            }

            $data = $response->json();

            if (empty($data['items'])) {
                return null;
            }

            $playlist = $data['items'][0];
            $tracks = $this->getPlaylistTracks($playlistId, $user);

            return [
                'id' => $playlistId,
                'name' => $playlist['snippet']['title'],
                'description' => $playlist['snippet']['description'] ?? '',
                'image_url' => $playlist['snippet']['thumbnails']['default']['url'] ?? null,
                'tracks' => $tracks,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}
