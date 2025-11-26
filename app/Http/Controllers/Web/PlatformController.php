<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Platform\PlatformFactory;
use App\Services\Spotify\SpotifyAuthService;
use App\Services\YouTube\YouTubeAuthService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\ResponseCache\Facades\ResponseCache;

class PlatformController extends Controller
{
    public function __construct(
        private PlatformFactory $platformFactory,
        private SpotifyAuthService $spotifyAuth,
        private YouTubeAuthService $youtubeAuth
    ) {}

    /**
     * Connect to a platform
     */
    public function connect(string $platform)
    {
        // Validate platform
        if (!$this->platformFactory->isSupported($platform)) {
            abort(404, 'Platform not supported');
        }

        // Get the appropriate auth service
        $authService = $this->getAuthService($platform);
        
        $url = $authService->getAuthorizationUrl();
        return Inertia::location($url);
    }

    /**
     * Handle OAuth callback for a platform
     */
    public function callback(Request $request, string $platform)
    {
        // Validate platform
        if (!$this->platformFactory->isSupported($platform)) {
            abort(404, 'Platform not supported');
        }

        $code = $request->query('code');
        
        if (!$code) {
            die("Nope.");
        }

        try {
            // Get the appropriate auth service
            $authService = $this->getAuthService($platform);
            $tokenData = $authService->handleCallback($code);
            
            $user = $request->user();
            
            // Update user with platform tokens
            $this->updateUserTokens($user, $platform, $tokenData);

            return redirect()->route('dashboard')
                ->with('success', ucfirst($platform) . ' connected successfully!');

        } catch (\Exception $e) {
            return redirect()->route('dashboard')
                ->with('error', 'Failed to connect ' . ucfirst($platform) . ': ' . $e->getMessage());
        }
    }

    /**
     * Disconnect a platform
     */
    public function disconnect(Request $request, string $platform)
    {
        // Validate platform
        if (!$this->platformFactory->isSupported($platform)) {
            abort(404, 'Platform not supported');
        }

        $user = $request->user();
        
        // Clear platform tokens
        $this->clearUserTokens($user, $platform);

        // Clear platform-related caches
        $this->clearPlatformCaches($platform);

        return redirect()->route('profile.edit')
            ->with('platformLogout', true);
    }

    /**
     * Get the appropriate auth service for a platform
     */
    private function getAuthService(string $platform)
    {
        return match($platform) {
            'spotify' => $this->spotifyAuth,
            'youtube' => $this->youtubeAuth,
            default => throw new \InvalidArgumentException("Unsupported platform: {$platform}")
        };
    }

    /**
     * Update user tokens based on platform
     */
    private function updateUserTokens($user, string $platform, array $tokenData)
    {
        $updateData = [
            'access_token' => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'] ?? null,
            'token_expires_at' => $tokenData['expires_at'],
        ];

        switch ($platform) {
            case 'spotify':
                $user->update([
                    'spotify_access_token' => $updateData['access_token'],
                    'spotify_refresh_token' => $updateData['refresh_token'],
                    'spotify_token_expires_at' => $updateData['token_expires_at'],
                ]);
                break;
                
            case 'youtube':
                $user->update([
                    'youtube_access_token' => $updateData['access_token'],
                    'youtube_refresh_token' => $updateData['refresh_token'],
                    'youtube_token_expires_at' => $updateData['token_expires_at'],
                ]);
                break;
                
            default:
                throw new \InvalidArgumentException("Unsupported platform: {$platform}");
        }
    }

    /**
     * Clear user tokens for a platform
     */
    private function clearUserTokens($user, string $platform)
    {
        switch ($platform) {
            case 'spotify':
                $user->update([
                    'spotify_access_token' => null,
                    'spotify_refresh_token' => null,
                    'spotify_token_expires_at' => null,
                ]);
                break;
                
            case 'youtube':
                $user->update([
                    'youtube_access_token' => null,
                    'youtube_refresh_token' => null,
                    'youtube_token_expires_at' => null,
                ]);
                break;
                
            default:
                throw new \InvalidArgumentException("Unsupported platform: {$platform}");
        }
    }

    /**
     * Clear caches related to a platform
     */
    private function clearPlatformCaches(string $platform)
    {
        ResponseCache::forget("/playlists/{$platform}");
        ResponseCache::forget('/convert/history');
        ResponseCache::forget('/platforms/connected');
    }
}