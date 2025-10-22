<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyPlaylistService;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    public function __construct(
        private SpotifyPlaylistService $spotifyPlaylist,
        private YouTubePlaylistService $youtubePlaylist
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        
        $spotifyPlaylists = [];
        $youtubePlaylists = [];
        
        try {
            if ($user->hasSpotifyToken()) {
                $spotifyPlaylists = $this->spotifyPlaylist->getUserPlaylists($user);
            }
        } catch (\Exception $e) {
            // Handle error silently or show message
        }
        
        try {
            if ($user->hasYoutubeToken()) {
                $youtubePlaylists = $this->youtubePlaylist->getUserPlaylists($user);
            }
        } catch (\Exception $e) {
            // Handle error silently or show message
        }
        
        return Inertia::render('Playlists/Index', [
            'spotifyPlaylists' => $spotifyPlaylists,
            'youtubePlaylists' => $youtubePlaylists,
        ]);
    }

    public function show(Request $request, string $platform, string $id)
    {
        $user = $request->user();
        
        try {
            if ($platform === 'spotify') {
                $playlist = $this->spotifyPlaylist->getPlaylistById($id, $user);
                $tracks = $this->spotifyPlaylist->getPlaylistTracks($id, $user);
            } else {
                $playlist = $this->youtubePlaylist->getPlaylistById($id, $user);
                $tracks = $this->youtubePlaylist->getPlaylistTracks($id, $user);
            }
            
            return Inertia::render('Playlists/Show', [
                'platform' => $platform,
                'playlist' => $playlist,
                'tracks' => $tracks,
            ]);
            
        } catch (\Exception $e) {
            return redirect()->route('playlists.index')
                ->with('error', 'Failed to load playlist');
        }
    }
}