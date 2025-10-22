<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Converter\PlaylistConverterService;
use App\Services\Spotify\SpotifyPlaylistService;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversionController extends Controller
{
    public function __construct(
        private PlaylistConverterService $converter,
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
        
        return Inertia::render('Convert', [
            'spotifyPlaylists' => $spotifyPlaylists,
            'youtubePlaylists' => $youtubePlaylists,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_playlist_id' => 'required|string',
            'source_platform' => 'required|in:spotify,youtube',
            'target_platform' => 'required|in:spotify,youtube',
        ]);

        try {
            $user = $request->user();
            
            $job = $this->converter->convert(
                $validated['source_playlist_id'],
                $validated['source_platform'],
                $validated['target_platform'],
                $user
            );

            return redirect()->route('convert.show', $job->id)
                ->with('success', 'Conversion started!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $job = $this->converter->getConversionStatus($id, $user);

        if (!$job) {
            return redirect()->route('convert.index')
                ->with('error', 'Conversion not found');
        }

        return Inertia::render('Convert/Progress', [
            'conversion' => $job,
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $conversions = $this->converter->getUserConversions($user);

        return Inertia::render('Convert/History', [
            'conversions' => $conversions,
        ]);
    }
}