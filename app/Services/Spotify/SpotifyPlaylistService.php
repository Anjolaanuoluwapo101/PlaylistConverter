<?php

namespace App\Services\Spotify;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Spotify\SpotifyAuthService;
use Illuminate\Support\Facades\Cache;

class SpotifyPlaylistService
{
    private string $baseUrl = 'https://api.spotify.com/v1';

    public function __construct(
        private SpotifyAuthService $authService
    ) {
    }

    // public function getUserPlaylists(User $user): array
    // {
    //     $token = $this->authService->getValidToken($user);
    //     $playlists = [];
    //     $url = "{$this->baseUrl}/me/playlists?limit=50";

    //     do {
    //         $response = Http::withToken($token)->get($url);

    //         if ($response->failed()) {
    //             Log::error('Failed to fetch Spotify playlists for user ' . $user->id, [
    //                 'status' => $response->status(),
    //                 'response' => $response->body(),
    //             ]);
    //             throw new \Exception('Failed to fetch Spotify playlists');
    //         }

    //         $data = $response->json();
    //         $playlists = array_merge($playlists, $data['items']);
    //         $url = $data['next'] ?? null;

    //     } while ($url);

    //     return $playlists;
    // }

    // public function isConnected(User $user): bool
    // {
    //     $cacheKey = "spotify_connected_{$user->id}";

    //     return Cache::remember($cacheKey, 300, function () use ($user, $cacheKey) {
    //         Log::info("Checking Spotify connection validity (fresh check)", [
    //             'user_id' => $user->id,
    //             'has_access_token' => !empty($user->hasSpotifyToken()),
    //             'token_expires_at' => $user->spotify_token_expires_at,
    //         ]);

    //         if (empty($user->spotify_access_token)) {
    //             Log::info("Spotify not connected - missing tokens", ['user_id' => $user->id]);
    //             return false;
    //         }

    //         try {
    //             $token = $this->authService->getValidToken($user);
    //             $response = Http::withToken($token)->get('https://api.spotify.com/v1/me');

    //             if ($response->successful()) {
    //                 Log::info("Spotify connection valid", [
    //                     'user_id' => $user->id,
    //                     'spotify_user_id' => $response->json()['id'] ?? 'unknown'
    //                 ]);
    //                 return true;
    //             }

    //             Log::warning("Spotify token invalid", [
    //                 'user_id' => $user->id,
    //                 'status' => $response->status()
    //             ]);

    //             $user->update([
    //                 'spotify_access_token' => null,
    //                 'spotify_refresh_token' => null,
    //                 'spotify_token_expires_at' => null,
    //             ]);

    //             // Clear cache
    //             Cache::forget($cacheKey);

    //             return false;

    //         } catch (\Exception $e) {
    //             Log::error("Spotify connection check failed", [
    //                 'user_id' => $user->id,
    //                 'error' => $e->getMessage()
    //             ]);

    //             $user->update([
    //                 'spotify_access_token' => null,
    //                 'spotify_refresh_token' => null,
    //                 'spotify_token_expires_at' => null,
    //             ]);

    //             // Clear cache
    //             Cache::forget($cacheKey);

    //             return false;
    //         }
    //     });
    // }

    public function isConnected($user) : bool {
        $connected = $user->hasSpotifyToken();
        if(!$connected){
            $this->authService->refreshToken($user);
            return true;
        }else{
            return true;
        }
    }


    public function getUserPlaylists(
        User $user,
        ?int $limit = 20,
        ?int $offset = null,
        ?string $sortBy = null,
        ?string $order = null
    ): array {
        try {
            if ($limit === null) {
                throw new \Exception('Pagination parameters are required.');
            }

            $token = $this->authService->getValidToken($user);
            $url = "{$this->baseUrl}/me/playlists";
            $offset = $offset ?? 0;
            $params = [
                'limit' => min($limit, 50), // Spotify max is 50
                'offset' => $offset,
            ];

            $response = Http::withToken($token)->get($url, $params);

            if ($response->failed()) {
                throw new \Exception('Failed to fetch Spotify playlists');
            }

            $data = $response->json();

            $sorted = null;

            if ($sortBy !== null) {
                $sorted = collect($data['items'])->sortBy(function ($playlist) use ($sortBy) {
                    switch ($sortBy) {
                        case 'name':
                            return strtolower($playlist['name']);
                        case 'tracks':
                            return $playlist['track_count'] ?? 0;
                        case 'date':
                        default:
                            // Spotify doesn't provide creation date, use order returned
                            return $playlist['id'];
                    }
                }, SORT_REGULAR, $order === 'desc');

                $sorted = $sorted->values()->all();
            }

            return [
                'items' => $sorted ?? $data['items'],
                'total' => $data['total'],
                'limit' => $data['limit'],
                'offset' => $data['offset'],
                'has_more' => ($data['offset'] + $data['limit']) < $data['total'],
                'has_previous' => $data['offset'] > 0,
                'next_offset' => ($data['offset'] + $data['limit']) < $data['total']
                    ? $data['offset'] + $data['limit']
                    : null,
                'prev_offset' => $data['offset'] > 0
                    ? max(0, $data['offset'] - $data['limit'])
                    : null,
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }


    // public function getPlaylistTracks(string $playlistId, User $user): array
    // {
    //     $token = $this->authService->getValidToken($user);
    //     $tracks = [];
    //     $url = "{$this->baseUrl}/playlists/{$playlistId}/tracks?limit=100";

    //     do {
    //         $response = Http::withToken($token)->get($url);

    //         if ($response->failed()) {
    //             Log::error("Failed to fetch tracks for playlist {$playlistId} for user " . $user->id, [
    //                 'status' => $response->status(),
    //                 'response' => $response->body(),
    //             ]);
    //             throw new \Exception('Failed to fetch playlist tracks');
    //         }

    //         $data = $response->json();

    //         foreach ($data['items'] as $item) {
    //             if ($item['track']) {
    //                 $tracks[] = [
    //                     'id' => $item['track']['id'],
    //                     'title' => $item['track']['name'],
    //                     'artist' => $item['track']['artists'][0]['name'] ?? 'Unknown',
    //                     'album' => $item['track']['album']['name'] ?? null,
    //                     'image' => $item['track']['album']["images"][0]["url"] ?? null,
    //                     'duration_ms' => $item['track']['duration_ms'] ?? null,
    //                 ];
    //             }
    //         }

    //         $url = $data['next'] ?? null;

    //     } while ($url);

    //     return $tracks;
    // }

    public function getPlaylistTracks(
        string $playlistId,
        User $user,
        ?int $limit = 20,
        ?int $offset = null,
        ?string $sortBy = null,
        ?string $order = null
    ): array {
        try {
            if ($limit === null) {
                throw new \Exception('Pagination parameters are required.');
            }

            $token = $this->authService->getValidToken($user);
            $url = "{$this->baseUrl}/playlists/{$playlistId}/tracks";
            $offset = $offset ?? 0;
            $params = [
                'limit' => min($limit, 100), // Spotify max is 100
                'offset' => $offset,
            ];

            $response = Http::withToken($token)->get($url, $params);

            if ($response->failed()) {
                throw new \Exception('Failed to fetch playlist tracks');
            }

            $data = $response->json();
            Log::info("data response", [
                $data
            ]);
            $sorted = null;

            if ($sortBy !== null) {
                $sorted = collect($data['items'])->sortBy(function ($track) use ($sortBy) {
                    switch ($sortBy) {
                        case 'title':
                            return strtolower($track['track']['name']);
                        case 'artist':
                            return strtolower($track['track']['artists'][0]['name']);
                        case 'duration':
                            return $track['track']['duration_ms'] ?? 0;
                        case 'date':
                        default:
                            // Maintain playlist order for 'date' (Spotify adds tracks chronologically)
                            return $track['track']['id'];
                    }
                }, SORT_REGULAR, $order === 'desc');

                $sorted = $sorted->values()->all();
            }

            $items = [];

            foreach ($sorted ?? $data['items'] as $item) {
                if ($item['track']) {
                    $items[] = [
                        'id' => $item['track']['id'],
                        'title' => $item['track']['name'],
                        'artist' => $item['track']['artists'][0]['name'] ?? 'Unknown',
                        'album' => $item['track']['album']['name'] ?? null,
                        'duration_ms' => $item['track']['duration_ms'] ?? null,
                        'image_url' => $item['track']['album']['images'][0]['url'] ?? null,
                    ];
                }
            }

            return [
                'items' => $items,
                'total' => $data['total'],
                'limit' => $data['limit'],
                'offset' => $data['offset'],
                'has_more' => ($data['offset'] + $data['limit']) < $data['total'],
                'has_previous' => $data['offset'] > 0,
                'next_offset' => ($data['offset'] + $data['limit']) < $data['total']
                    ? $data['offset'] + $data['limit']
                    : null,
                'prev_offset' => $data['offset'] > 0
                    ? max(0, $data['offset'] - $data['limit'])
                    : null,
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }


    public function createPlaylist(User $user, string $name, string $description = ''): array
    {
        try {
            $token = $this->authService->getValidToken($user);

            // First, get user's Spotify ID
            $userResponse = Http::withToken($token)->get("{$this->baseUrl}/me");

            if ($userResponse->failed()) {
                throw new \Exception('Failed to fetch Spotify user ID');
            }

            $spotifyUserId = $userResponse->json()['id'];

            $response = Http::withToken($token)->post(
                "{$this->baseUrl}/users/{$spotifyUserId}/playlists",
                [
                    'name' => $name,
                    'description' => $description,
                    'public' => false,
                ]
            );

            if ($response->failed()) {
                throw new \Exception('Failed to create Spotify playlist');
            }

            return $response->json();
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function addTracksToPlaylist(string $playlistId, array $trackUris, User $user): void
    {
        try {
            $token = $this->authService->getValidToken($user);

            // Spotify allows max 100 tracks per request
            $chunks = array_chunk($trackUris, 100);

            foreach ($chunks as $chunk) {
                $response = Http::withToken($token)->post(
                    "{$this->baseUrl}/playlists/{$playlistId}/tracks",
                    ['uris' => $chunk]
                );

                if ($response->failed()) {
                    throw new \Exception('Failed to add tracks to Spotify playlist');
                }
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function searchTrack(string $query, User $user): ?array
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)->get("{$this->baseUrl}/search", [
                'q' => $query,
                'type' => 'track',
                'limit' => 1,
            ]);

            if ($response->failed()) {
                return null;
            }

            $data = $response->json();

            if (empty($data['tracks']['items'])) {
                return null;
            }

            $track = $data['tracks']['items'][0];

            return [
                'id' => $track['id'],
                'uri' => $track['uri'],
                'title' => $track['name'],
                'artist' => $track['artists'][0]['name'] ?? 'Unknown',
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    public function removeTrackFromPlaylist(string $playlistId, string $trackUri, User $user): bool
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)->delete(
                "{$this->baseUrl}/playlists/{$playlistId}/tracks",
                [
                    'tracks' => [
                        ['uri' => $trackUri]
                    ]
                ]
            );

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getPlaylistById(string $playlistId, User $user): ?array
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)->get("{$this->baseUrl}/playlists/{$playlistId}");

            if ($response->failed()) {
                return null;
            }

            $playlist = $response->json();
            $tracks = $this->getPlaylistTracks($playlistId, $user);

            return [
                'id' => $playlistId,
                'name' => $playlist['name'],
                'description' => $playlist['description'] ?? '',
                'image_url' => $playlist['images'][0]['url'] ?? null,
                'tracks' => $tracks,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    public function deletePlaylist(string $playlistId, User $user): bool
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)->delete(
                "{$this->baseUrl}/playlists/{$playlistId}/followers"
            );

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}