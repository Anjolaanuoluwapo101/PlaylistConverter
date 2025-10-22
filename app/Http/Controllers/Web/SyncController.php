<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Converter\PlaylistSyncService;
use App\Services\Spotify\SpotifyPlaylistService;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SyncController extends Controller
{
    public function __construct(
        private PlaylistSyncService $sync,
        private SpotifyPlaylistService $spotifyPlaylist,
        private YouTubePlaylistService $youtubePlaylist
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        
        $spotifyPlaylists = $user->hasSpotifyToken() 
            ? $this->spotifyPlaylist->getUserPlaylists($user) 
            : [];
            
        $youtubePlaylists = $user->hasYoutubeToken() 
            ? $this->youtubePlaylist->getUserPlaylists($user) 
            : [];
        
        return Inertia::render('Sync/Index', [
            'spotifyPlaylists' => $spotifyPlaylists,
            'youtubePlaylists' => $youtubePlaylists,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_playlist_id' => 'required|string',
            'source_platform' => 'required|in:spotify,youtube',
            'target_playlist_id' => 'required|string',
            'target_platform' => 'required|in:spotify,youtube',
            'remove_extras' => 'boolean',
        ]);

        try {
            $user = $request->user();
            
            $results = $this->sync->sync(
                $validated['source_playlist_id'],
                $validated['source_platform'],
                $validated['target_playlist_id'],
                $validated['target_platform'],
                $user,
                $validated['remove_extras'] ?? false
            );

            return back()->with('success', 'Sync completed!')
                ->with('syncResults', $results);

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}