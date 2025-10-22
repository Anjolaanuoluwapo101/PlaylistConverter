<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpotifyAuthController extends Controller
{
    public function __construct(
        private SpotifyAuthService $spotifyAuth
    ) {}

    public function redirect()
    {
        $url = $this->spotifyAuth->getAuthorizationUrl();
        return response()->json(['url' => $url]);
    }

    public function callback(Request $request)
    {
        try {
            $code = $request->query('code');
            
            if (!$code) {
                return response()->json(['error' => 'No authorization code provided'], 400);
            }

            $tokenData = $this->spotifyAuth->handleCallback($code);
            Log::info('Spotify token data', $tokenData);

            // Update the authenticated user
            $user = $request->user();
            $user->update([
                'spotify_access_token' => $tokenData['access_token'],
                'spotify_refresh_token' => $tokenData['refresh_token'],
                'spotify_token_expires_at' => $tokenData['expires_at'],
            ]);

            // Redirect to frontend with success
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect("{$frontendUrl}/dashboard?spotify=connected");

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function status(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'connected' => $user->hasSpotifyToken(),
            'expires_at' => $user->spotify_token_expires_at,
        ]);
    }

    public function disconnect(Request $request)
    {
        $user = $request->user();
        $user->update([
            'spotify_access_token' => null,
            'spotify_refresh_token' => null,
            'spotify_token_expires_at' => null,
        ]);

        return response()->json(['message' => 'Spotify disconnected successfully']);
    }
}