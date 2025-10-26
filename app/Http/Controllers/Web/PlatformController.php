<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyAuthService;
use App\Services\YouTube\YouTubeAuthService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\ResponseCache\Facades\ResponseCache;

class PlatformController extends Controller
{
    public function __construct(
        private SpotifyAuthService $spotifyAuth,
        private YouTubeAuthService $youtubeAuth
    ) {}

    public function connectSpotify()
    {
        $url = $this->spotifyAuth->getAuthorizationUrl();
        return Inertia::location($url); // Redirect to Spotify OAuth
    }

    public function connectYoutube()
    {
        $url = $this->youtubeAuth->getAuthorizationUrl();
        return Inertia::location($url); // Redirect to YouTube OAuth
    }

    public function spotifyCallback(Request $request)
    {
        $code = $request->query('code');
        
        if (!$code) {
            return redirect()->route('platforms.index')
                ->with('error', 'Failed to connect Spotify');
        }

        try {
            $tokenData = $this->spotifyAuth->handleCallback($code);
            
            $user = $request->user();
            $user->update([
                'spotify_access_token' => $tokenData['access_token'],
                'spotify_refresh_token' => $tokenData['refresh_token'],
                'spotify_token_expires_at' => $tokenData['expires_at'],
            ]);

            return redirect()->route('dashboard')
                ->with('success', 'Spotify connected successfully!');

        } catch (\Exception $e) {
            return redirect()->route('dashboard')
                ->with('error', 'Failed to connect Spotify: ' . $e->getMessage());
        }
    }

    public function youtubeCallback(Request $request)
    {
        $code = $request->query('code');
        
        if (!$code) {
            return redirect()->route('platforms.index')
                ->with('error', 'Failed to connect YouTube');
        }

        try {
            $tokenData = $this->youtubeAuth->handleCallback($code);
            
            $user = $request->user();
            $user->update([
                'youtube_access_token' => $tokenData['access_token'],
                'youtube_refresh_token' => $tokenData['refresh_token'],
                'youtube_token_expires_at' => $tokenData['expires_at'],
            ]);

            return redirect()->route('dashboard')
                ->with('success', 'YouTube connected successfully!');

        } catch (\Exception $e) {
            return redirect()->route('dashboard')
                ->with('error', 'Failed to connect YouTube: ' . $e->getMessage());
        }
    }

    public function disconnectSpotify(Request $request)
    {
        $user = $request->user();
        $user->update([
            'spotify_access_token' => null,
            'spotify_refresh_token' => null,
            'spotify_token_expires_at' => null,
        ]);

        // Clear Spotify-related caches after disconnect
        ResponseCache::forget('/playlists/spotify');
        ResponseCache::forget('/convert/history');
        ResponseCache::forget('/platforms/connected');

        return redirect()->route('platforms.index')
            ->with('success', 'Spotify disconnected successfully');
    }

    public function disconnectYoutube(Request $request)
    {
        $user = $request->user();
        $user->update([
            'youtube_access_token' => null,
            'youtube_refresh_token' => null,
            'youtube_token_expires_at' => null,
        ]);

        // Clear YouTube-related caches after disconnect
        ResponseCache::forget('/playlists/youtube');
        ResponseCache::forget('/convert/history');
        ResponseCache::forget('/platforms/connected');

        return redirect()->route('platforms.index')
            ->with('success', 'YouTube disconnected successfully');
    }
}