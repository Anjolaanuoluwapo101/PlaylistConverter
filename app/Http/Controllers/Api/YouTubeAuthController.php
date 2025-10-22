<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\YouTube\YouTubeAuthService;
use Illuminate\Http\Request;

class YouTubeAuthController extends Controller
{
    public function __construct(
        private YouTubeAuthService $youtubeAuth
    ) {}

    public function redirect()
    {
        $url = $this->youtubeAuth->getAuthorizationUrl();
        
        return response()->json([
            'url' => $url
        ]);
    }

    public function callback(Request $request)
    {
        try {
            $code = $request->query('code');
            
            if (!$code) {
                return response()->json([
                    'error' => 'No authorization code provided'
                ], 400);
            }

            $tokenData = $this->youtubeAuth->handleCallback($code);
            
            $user = $request->user();
            $user->update([
                'youtube_access_token' => $tokenData['access_token'],
                'youtube_refresh_token' => $tokenData['refresh_token'],
                'youtube_token_expires_at' => $tokenData['expires_at'],
            ]);

            // Redirect to frontend with success
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect()->away("{$frontendUrl}/dashboard?youtube=connected");

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to authenticate with YouTube',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function status(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'connected' => $user->hasYoutubeToken(),
            'expires_at' => $user->youtube_token_expires_at,
        ]);
    }

    public function disconnect(Request $request)
    {
        $user = $request->user();
        $user->update([
            'youtube_access_token' => null,
            'youtube_refresh_token' => null,
            'youtube_token_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'YouTube disconnected successfully'
        ]);
    }
}