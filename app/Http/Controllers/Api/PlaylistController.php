<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlaylistResource;
use App\Services\Platform\PlatformFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\ResponseCache\Facades\ResponseCache;

class PlaylistController extends Controller
{
    public function __construct(
        private PlatformFactory $platformFactory
    ) {
    }

    public function getUserPlaylists(Request $request, string $platform)
    {
        try {
            $user = $request->user();
            $platformService = $this->platformFactory->make($platform);

            if (!$platformService->isConnected($user)) {
                return response()->json([
                    'error' => ucfirst($platform) . ' account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $offset = $request->query('offset');
            $sortBy = $request->query('sort_by');
            $order = $request->query('order');

            // Convert offset to int for Spotify, keep as string for YouTube
            if ($platform === 'spotify' && $offset !== null) {
                $offset = (int) $offset;
            }

            $playlists = $platformService->getUserPlaylists($user, $limit, $offset, $sortBy, $order);
            if (isset($playlists["error"])) {
                return response()->json([
                    'error' => $playlists["error"]
                ], 400);
            }
            return $playlists;



            // Normalize the data
            $data = PlaylistResource::collection($playlists['items']);
            $playlists["data"] = $data;

            Log::info("Fetched {$platform} playlists", [
                'user_id' => $user->id,
                'fetched_count' => count($playlists),
            ]);

            return $playlists;

        } catch (\Exception $e) {
            Log::error("Failed to fetch {$platform} playlists", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]); 
            return response()->json([
                'error' => 'Failed to fetch ' . ucfirst($platform) . ' playlists',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPlaylistTracks(Request $request, string $platform, string $playlistId)
    {
        try {
            $user = $request->user();
            $platformService = $this->platformFactory->make($platform);

            if (!$platformService->isConnected($user)) {
                return response()->json([
                    'error' => ucfirst($platform) . ' account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $offset = $request->query('offset');
            $sortBy = $request->query('sort_by');
            $order = $request->query('order');

            // Convert offset to int for Spotify, keep as string for YouTube
            if ($platform === 'spotify' && $offset !== null) {
                $offset = (int) $offset;
            }

            $tracks = $platformService->getPlaylistTracks($playlistId, $user, $limit, $offset, $sortBy, $order);
            if (isset($tracks["error"])) {
                return response()->json([
                    'error' => $tracks["error"]
                ], 400);
            }

            Log::info("Fetched {$platform} playlist tracks", [
                'user_id' => $user->id,
                'playlist_id' => $playlistId,
                'fetched_count' => count($tracks),
                'tracks' => $tracks
            ]);

            return response()->json([
                'tracks' => $tracks,
                'count' => count($tracks)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch playlist tracks',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function spotifySearch(Request $request)
    {
        $request->validate([
            'artist' => 'required|string',
            'title' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $platform = $this->platformFactory->make('spotify');

            if (!$platform->isConnected($user)) {
                return response()->json([
                    'error' => 'Spotify account not connected'
                ], 401);
            }

            $result = $platform->searchTracks($request->artist, $request->title, $user);

            if (!$result) {
                return response()->json([
                    'found' => false,
                    'message' => 'Track not found'
                ]);
            }

            return response()->json([
                'found' => true,
                'tracks' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function youtubeSearch(Request $request)
    {
        $request->validate([
            'artist' => 'required|string',
            'title' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $platform = $this->platformFactory->make('youtube');

            if (!$platform->isConnected($user)) {
                return response()->json([
                    'error' => 'YouTube account not connected'
                ], 401);
            }

            $result = $platform->searchTracks($request->artist, $request->title, $user);

            if (!$result) {
                return response()->json([
                    'found' => false,
                    'message' => 'Track not found'
                ]);
            }

            return response()->json([
                'found' => true,
                'tracks' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroyTracks(Request $request, string $platform, string $playlistId)
    {
        try {
            $user = $request->user();

            // Validate request data
            $request->validate([
                'track_ids' => 'required|array',
                'track_ids.*' => 'required|string'
            ]);

            $trackIds = $request->input('track_ids');

            if (!in_array($platform, ['spotify', 'youtube'])) {
                return response()->json([
                    'error' => 'Invalid platform'
                ], 400);
            }

            $platformService = $this->platformFactory->make($platform);

            $results = [
                'removed' => [],
                'failed' => [],
                'errors' => []
            ];

            foreach ($trackIds as $trackId) {
                try {
                    $success = $platformService->removeTrackFromPlaylist($playlistId, $trackId, $user);

                    if ($success) {
                        $results['removed'][] = $trackId;
                    } else {
                        $results['failed'][] = $trackId;
                    }
                } catch (\Exception $e) {
                    $results['failed'][] = $trackId;
                    $results['errors'][] = [
                        'track_id' => $trackId,
                        'error' => $e->getMessage()
                    ];
                }
            }

            ResponseCache::forget("/playlists/$platform/$playlistId/tracks");

            return response()->json([
                'message' => 'Batch track removal completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process track removal request',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroyPlaylists(Request $request, string $platform)
    {
        try {
            $user = $request->user();

            // Validate request data
            $request->validate([
                'playlist_ids' => 'required|array',
                'playlist_ids.*' => 'required|string'
            ]);

            $playlistIds = $request->input('playlist_ids');

            if (!in_array($platform, ['spotify', 'youtube'])) {
                return response()->json([
                    'error' => 'Invalid platform'
                ], 400);
            }

            $platformService = $this->platformFactory->make($platform);

            $results = [
                'deleted' => [],
                'failed' => [],
                'errors' => []
            ];

            foreach ($playlistIds as $playlistId) {
                try {
                    $success = $platformService->deletePlaylist($playlistId, $user);

                    if ($success) {
                        $results['deleted'][] = $playlistId;
                    } else {
                        $results['failed'][] = $playlistId;
                    }
                } catch (\Exception $e) {
                    $results['failed'][] = $playlistId;
                    $results['errors'][] = [
                        'playlist_id' => $playlistId,
                        'error' => $e->getMessage()
                    ];
                }
            }

            //Forget the current playlist cache
            ResponseCache::forget("/playlists/$platform");

            return response()->json([
                'message' => 'Batch playlist deletion completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process playlist deletion request',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}