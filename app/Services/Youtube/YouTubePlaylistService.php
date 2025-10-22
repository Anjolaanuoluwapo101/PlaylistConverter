<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function getUserPlaylists(User $user, ?int $limit = 20, ?string $pageToken = null): array
    {
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

            return [
                'items' => $data['items'] ?? [],
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

    public function getPlaylistTracks(string $playlistId, User $user, ?int $limit = 20, ?string $pageToken = null): array
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

            $items = [];
            foreach ($data['items'] ?? [] as $item) {
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

    public function searchTrack(string $query, User $user): ?array
    {
        try {
            $token = $this->authService->getValidToken($user);

            $response = Http::withToken($token)->get("{$this->baseUrl}/search", [
                'part' => 'snippet',
                'q' => $query,
                'type' => 'video',
                'videoCategoryId' => '10', // Music category
                'maxResults' => 1,
            ]);

            if ($response->failed()) {
                return null;
            }

            $data = $response->json();

            if (empty($data['items'])) {
                return null;
            }

            $video = $data['items'][0];

            return [
                'id' => $video['id']['videoId'],
                'title' => $video['snippet']['title'],
                'artist' => $video['snippet']['channelTitle'],
            ];
        } catch (\Exception $e) {
            return null;
        }
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
