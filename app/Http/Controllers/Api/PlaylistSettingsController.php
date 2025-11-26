<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Platform\PlatformFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlaylistSettingsController extends Controller
{
    public function __construct(
        private PlatformFactory $platformFactory
    ) {
    }

    /**
     * Get playlist settings
     */
    public function show(Request $request, string $platform, string $playlistId)
    {
        try {
            $user = $request->user();

            if (!$this->platformFactory->isSupported($platform)) {
                return response()->json(['error' => 'Invalid platform'], 400);
            }

            $platformInstance = $this->platformFactory->make($platform);

            if (!$platformInstance->isConnected($user)) {
                return response()->json(['error' => "{$platform} account not connected"], 401);
            }

            $settings = $platformInstance->getPlaylistSettings($playlistId, $user);

            if (!$settings) {
                return response()->json(['error' => 'Playlist not found'], 404);
            }

            return response()->json(['settings' => $settings]);

        } catch (\Exception $e) {
            Log::error("Failed to get playlist settings", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to get playlist settings',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update playlist settings
     */
    public function update(Request $request, string $platform, string $playlistId)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255', //Both
            'description' => 'sometimes|string|max:5000', //Both 
            'public' => 'sometimes|boolean', // Spotify
            'collaborative' => 'sometimes|boolean', // Spotify only
            'privacy_status' => 'sometimes|in:public,private,unlisted', // YouTube
        ]);

        try {
            $user = $request->user();

            if (!$this->platformFactory->isSupported($platform)) {
                return response()->json(['error' => 'Invalid platform'], 400);
            }

            $platformInstance = $this->platformFactory->make($platform);

            if (!$platformInstance->isConnected($user)) {
                return response()->json(['error' => "{$platform} account not connected"], 401);
            }

            $success = $platformInstance->updatePlaylistSettings($playlistId, $validated, $user);

            if ($success) {
                return response()->json([
                    'message' => 'Playlist settings updated successfully',
                    'settings' => $platformInstance->getPlaylistSettings($playlistId, $user)
                ]);
            }

            return response()->json(['error' => 'Failed to update playlist settings'], 500);

        } catch (\Exception $e) {
            Log::error("Failed to update playlist settings", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to update playlist settings',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function updateCover(Request $request, string $platform, string $playlistId)
    {
        if ($platform !== 'spotify') {
            return response()->json(['error' => 'Cover update only supported for Spotify'], 400);
        }

        $validated = $request->validate([
            'image' => 'required|string', // Base64 encoded JPEG
        ]);

        try {
            $user = $request->user();
            $platformInstance = $this->platformFactory->make('spotify');

            if (!$platformInstance->isConnected($user)) {
                return response()->json(['error' => 'Spotify account not connected'], 401);
            }
            Log::info("Updating playlist cover", [
                'playlist_id' => $playlistId,
                'user_id' => $user->id
            ]);
             
            $platformInstance->updatePlaylistCover($playlistId, $validated['image'], $user);
            

            return response()->json(['error' => 'Failed to update playlist cover'], 500);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update playlist cover',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}