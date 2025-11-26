<?php

namespace App\Services\Spotify;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

trait SpotifySettingsTrait
{
    protected $playlistUrl = 'https://api.spotify.com/v1/playlists';
    /**
     * Update playlist name
     */
    public function updatePlaylistName(string $playlistId, string $name, User $user): bool
    {
        Log::info("Updating Spotify playlist name", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'new_name' => $name
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            $response = Http::withToken($token)->put(
                $this->playlistUrl . "/{$playlistId}",
                ['name' => $name]
            );

            if ($response->successful()) {
                Log::info("Spotify playlist name updated", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                return true;
            }

            Log::warning("Failed to update Spotify playlist name", [
                'user_id' => $user->id,
                'playlist_id' => $playlistId,
                'status' => $response->status()
            ]);
            
            throw new Exception("Failed to update Spotify playlist name. Status: " . $response->status());

        } catch (\Exception $e) {
            Log::error("Error updating Spotify playlist name", [
                'user_id' => $user->id,
                'playlist_id' => $playlistId,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating Spotify playlist name: " . $e->getMessage());
        }
    }

    /**
     * Update playlist description
     */
    public function updatePlaylistDescription(string $playlistId, string $description, User $user): bool
    {
        Log::info("Updating Spotify playlist description", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            $response = Http::withToken($token)->put(
                $this->playlistUrl . "/{$playlistId}",
                ['description' => $description]
            );

            if (!$response->successful()) {
                throw new Exception("Failed to update Spotify playlist description. Status: " . $response->status());
            }else{
                return true;
            }

        } catch (Exception $e) {
            Log::error("Error updating Spotify playlist description", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating Spotify playlist description: " . $e->getMessage());
        }
    }

    /**
     * Update playlist privacy (public/private)
     */
    public function updatePlaylistPrivacy(string $playlistId, bool $isPublic, User $user): bool
    {
        Log::info("Updating Spotify playlist privacy", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'public' => $isPublic
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            $response = Http::withToken($token)->put(
                $this->playlistUrl . "/{$playlistId}",
                ['public' => $isPublic]
            );

            if (!$response->successful()) {
                throw new Exception("Failed to update Spotify playlist privacy. Status: " . $response->status());
            }else{
                return true;
            }

        } catch (Exception $e) {
            Log::error("Error updating Spotify playlist privacy", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating Spotify playlist privacy: " . $e->getMessage());
        }
    }

    /**
     * Update playlist collaborative status
     */
    public function updatePlaylistCollaborative(string $playlistId, bool $collaborative, User $user): bool
    {
        Log::info("Updating Spotify playlist collaborative status", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'collaborative' => $collaborative
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            $response = Http::withToken($token)->put(
                $this->playlistUrl . "/{$playlistId}",
                ['collaborative' => $collaborative]
            );

            if (!$response->successful()) {
                throw new Exception("Failed to update Spotify playlist collaborative status. Status: " . $response->status());
            }else{
                return true;
            }

        } catch (Exception $e) {
            Log::error("Error updating Spotify playlist collaborative", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating Spotify playlist collaborative: " . $e->getMessage());
        }
    }

    /**
     * Update multiple playlist settings at once
     */
    public function updatePlaylistSettings(string $playlistId, array $settings, User $user): bool
    {
        Log::info("Updating Spotify playlist settings", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'settings' => array_keys($settings)
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            // Build update data
            $updateData = [];
            
            if (isset($settings['name'])) {
                $updateData['name'] = $settings['name'];
            }
            
            if (isset($settings['description'])) {
                $updateData['description'] = $settings['description'];
            }
            
            if (isset($settings['public'])) {
                $updateData['public'] = (bool) $settings['public'];
            }
            
            if (isset($settings['collaborative'])) {
                $updateData['collaborative'] = (bool) $settings['collaborative'];
            }

            $response = Http::withToken($token)->put(
                $this->playlistUrl . "/{$playlistId}",
                $updateData
            );

            if ($response->successful()) {
                Log::info("Spotify playlist settings updated successfully", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                return true;
            }

            throw new Exception("Failed to update Spotify playlist settings. Status: " . $response->status());

        } catch (\Exception $e) {
            Log::error("Error updating Spotify playlist settings", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating Spotify playlist settings: " . $e->getMessage());
        }
    }

    /**
     * Upload custom playlist cover image
     */
    public function updatePlaylistCover(string $playlistId, string $base64Image, User $user): bool
    {
        Log::info("Updating Spotify playlist cover", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            // Image must be base64 encoded JPEG, less than 256KB
            $response = Http::withToken($token)
                ->withHeaders(['Content-Type' => 'image/jpeg'])
                ->withBody($base64Image, 'image/jpeg')
                ->put($this->playlistUrl . "/{$playlistId}/images");

            if ($response->successful()) {
                Log::info("Spotify playlist cover updated", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                return true;
            }

            throw new Exception("Failed to update Spotify playlist cover. Status: " . $response->status());

        } catch (\Exception $e) {
            Log::error("Error updating Spotify playlist cover", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Get current playlist settings
     */
    public function getPlaylistSettings(string $playlistId, User $user): ?array
    {
        Log::info("Fetching Spotify playlist settings", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            
            $response = Http::withToken($token)->get(
                $this->playlistUrl . "/{$playlistId}",
                ['fields' => 'name,description,public,collaborative,images']
            );

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'name' => $data['name'],
                    'description' => $data['description'] ?? '',
                    'public' => $data['public'] ?? false,
                    'collaborative' => $data['collaborative'] ?? false,
                    'cover_image' => $data['images'][0]['url'] ?? null,
                ];
            }

            return null;

        } catch (\Exception $e) {
            Log::error("Error fetching Spotify playlist settings", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}