<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlaylistResource;
use App\Services\Spotify\SpotifyPlaylistService;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlaylistController extends Controller
{
    public function __construct(
        private SpotifyPlaylistService $spotifyPlaylist,
        private YouTubePlaylistService $youtubePlaylist
    ) {
    }

    public function getSpotifyPlaylists(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->hasSpotifyToken()) {
                return response()->json([
                    'error' => 'Spotify account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $offset = $request->query('offset') ? (int) $request->query('offset') : null;

            $playlists = $this->spotifyPlaylist->getUserPlaylists($user, $limit, $offset);
            if(isset($playlists["error"])){
                return response()->json([
                    'error' => $playlists["error"]
                ], 400);
            }
            $data = PlaylistResource::collection($playlists['items']);
            
            $playlists["data"] = $data;
            return $playlists;

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch Spotify playlists',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getSpotifyPlaylistTracks(Request $request, string $playlistId)
    {
        try {
            $user = $request->user();

            if (!$user->hasSpotifyToken()) {
                return response()->json([
                    'error' => 'Spotify account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $offset = $request->query('offset') ? (int) $request->query('offset') : null;

            $tracks = $this->spotifyPlaylist->getPlaylistTracks($playlistId, $user, $limit, $offset);
            if(isset($tracks["error"])){
                return response()->json([
                    'error' => $tracks["error"]
                ], 400);
            }
            Log::info("Fetched Spotify playlist tracks", [
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

    public function getYoutubePlaylists(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->hasYoutubeToken()) {
                return response()->json([
                    'error' => 'YouTube account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $pageToken = $request->query('page_token');

            $playlists = $this->youtubePlaylist->getUserPlaylists($user, $limit, $pageToken);
            if(isset($playlists["error"])){
                return response()->json([
                    'error' => $playlists["error"]
                ], 400);
            }
            Log::info("Fetched YouTube playlists", [
                'user_id' => $user->id,
                'fetched_count' => count($playlists),
            ]); 
            //Normalize the data
            $data = PlaylistResource::collection($playlists["items"]);
            // replace items key in $playlists with $data
            $playlists["data"] = $data;
            return $playlists;

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch YouTube playlists',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getYoutubePlaylistTracks(Request $request, string $playlistId)
    {
        try {
            $user = $request->user();

            if (!$user->hasYoutubeToken()) {
                return response()->json([
                    'error' => 'YouTube account not connected'
                ], 401);
            }

            $limit = $request->query('limit') ? (int) $request->query('limit') : null;
            $pageToken = $request->query('page_token');

            $tracks = $this->youtubePlaylist->getPlaylistTracks($playlistId, $user, $limit, $pageToken);
            if(isset($tracks["error"])){
                return response()->json([
                    'error' => $tracks["error"]
                ], 400);
            }
            Log::info("Fetched YouTube playlist tracks", [
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

    public function testSpotifySearch(Request $request)
    {
        $request->validate([
            'artist' => 'required|string',
            'title' => 'required|string',
        ]);

        try {
            $user = $request->user();

            if (!$user->hasSpotifyToken()) {
                return response()->json([
                    'error' => 'Spotify account not connected'
                ], 401);
            }

            $query = "{$request->artist} {$request->title}";
            $result = $this->spotifyPlaylist->searchTrack($query, $user);

            if (!$result) {
                return response()->json([
                    'found' => false,
                    'message' => 'Track not found'
                ]);
            }

            return response()->json([
                'found' => true,
                'track' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function testYoutubeSearch(Request $request)
    {
        $request->validate([
            'artist' => 'required|string',
            'title' => 'required|string',
        ]);

        try {
            $user = $request->user();

            if (!$user->hasYoutubeToken()) {
                return response()->json([
                    'error' => 'YouTube account not connected'
                ], 401);
            }

            $query = "{$request->artist} {$request->title}";
            $result = $this->youtubePlaylist->searchTrack($query, $user);

            if (!$result) {
                return response()->json([
                    'found' => false,
                    'message' => 'Track not found'
                ]);
            }

            return response()->json([
                'found' => true,
                'track' => $result
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

            $platformService = $platform === 'spotify'
                ? $this->spotifyPlaylist
                : $this->youtubePlaylist;

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

            $platformService = $platform === 'spotify'
                ? $this->spotifyPlaylist
                : $this->youtubePlaylist;

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