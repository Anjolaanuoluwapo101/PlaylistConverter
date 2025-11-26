<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

trait YouTubeSettingsTrait
{

    protected $playlistUrl = 'https://www.googleapis.com/youtube/v3/playlists';
    /**
     * Update playlist name (title)
     */
    public function updatePlaylistName(string $playlistId, string $name, User $user): bool
    {
        Log::info("Updating YouTube playlist name", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'new_name' => $name
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();
            
            $response = $client->put($this->playlistUrl, [
                'query' => ['part' => 'snippet'],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'id' => $playlistId,
                    'snippet' => [
                        'title' => $name,
                    ],
                ],
            ]);

            if ($response->getStatusCode() === 200) {
                Log::info("YouTube playlist name updated", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                return true;
            }

            throw new Exception("Failed to update YouTube playlist name. Status: " . $response->getStatusCode());

        } catch (\Exception $e) {
            Log::error("Error updating YouTube playlist name", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating YouTube playlist name: " . $e->getMessage());
        }
    }

    /**
     * Update playlist description
     */
    public function updatePlaylistDescription(string $playlistId, string $description, User $user): bool
    {
        Log::info("Updating YouTube playlist description", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();
            
            $response = $client->put($this->playlistUrl, [
                'query' => ['part' => 'snippet'],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'id' => $playlistId,
                    'snippet' => [
                        'description' => $description,
                    ],
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception("Failed to update YouTube playlist description. Status: " . $response->getStatusCode());
            }else{
                return true;
            }

        } catch (\Exception $e) {
            Log::error("Error updating YouTube playlist description", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating YouTube playlist description: " . $e->getMessage());
        }
    }

    /**
     * Update playlist privacy status
     */
    public function updatePlaylistPrivacy(string $playlistId, string $privacyStatus, User $user): bool
    {
        // privacyStatus: 'public', 'private', or 'unlisted'
        if (!in_array($privacyStatus, ['public', 'private', 'unlisted'])) {
            Log::warning("Invalid YouTube privacy status", ['status' => $privacyStatus]);
            throw new Exception("Invalid YouTube privacy status: " . $privacyStatus);
        }

        Log::info("Updating YouTube playlist privacy", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'privacy_status' => $privacyStatus
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();
            
            $response = $client->put($this->playlistUrl, [
                'query' => ['part' => 'status'],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'id' => $playlistId,
                    'status' => [
                        'privacyStatus' => $privacyStatus,
                    ],
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception("Failed to update YouTube playlist privacy. Status: " . $response->getStatusCode());
            }else{
                return true;
            }

        } catch (\Exception $e) {
            Log::error("Error updating YouTube playlist privacy", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating YouTube playlist privacy: " . $e->getMessage());
        }
    }

    /**
     * Update multiple playlist settings at once
     */
    public function updatePlaylistSettings(string $playlistId, array $settings, User $user): bool
    {
        Log::info("Updating YouTube playlist settings", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId,
            'settings' => array_keys($settings)
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();
            
            // Build parts to update
            $parts = [];
            $updateData = ['id' => $playlistId];
            
            if (isset($settings['name']) || isset($settings['description'])) {
                $parts[] = 'snippet';
                $updateData['snippet'] = [];
                
                if (isset($settings['name'])) {
                    $updateData['snippet']['title'] = $settings['name'];
                }
                
                if (isset($settings['description'])) {
                    $updateData['snippet']['description'] = $settings['description'];
                }
            }
            
            if (isset($settings['privacy_status'])) {
                $parts[] = 'status';
                $updateData['status'] = [
                    'privacyStatus' => $settings['privacy_status'],
                ];
            }

            if (empty($parts)) {
                Log::warning("No valid settings to update", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                throw new Exception("No valid settings to update");
            }

            $response = $client->put($this->playlistUrl, [
                'query' => ['part' => implode(',', $parts)],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                ],
                'json' => $updateData,
            ]);

            if ($response->getStatusCode() === 200) {
                Log::info("YouTube playlist settings updated successfully", [
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId
                ]);
                return true;
            }

            throw new Exception("Failed to update YouTube playlist settings. Status: " . $response->getStatusCode());

        } catch (\Exception $e) {
            Log::error("Error updating YouTube playlist settings", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw new Exception("Error updating YouTube playlist settings: " . $e->getMessage());
        }
    }

    /**
     * Get current playlist settings
     */
    public function getPlaylistSettings(string $playlistId, User $user): ?array
    {
        Log::info("Fetching YouTube playlist settings", [
            'user_id' => $user->id,
            'playlist_id' => $playlistId
        ]);

        try {
            $token = $this->authService->getValidToken($user);
            $client = new \GuzzleHttp\Client();
            
            $response = $client->get($this->playlistUrl, [
                'query' => [
                    'part' => 'snippet,status',
                    'id' => $playlistId,
                ],
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Accept' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!empty($data['items'])) {
                $playlist = $data['items'][0];
                
                return [
                    'name' => $playlist['snippet']['title'],
                    'description' => $playlist['snippet']['description'] ?? '',
                    'privacy_status' => $playlist['status']['privacyStatus'] ?? 'private',
                    'thumbnail' => $playlist['snippet']['thumbnails']['default']['url'] ?? null,
                ];
            }

            return null;

        } catch (\Exception $e) {
            Log::error("Error fetching YouTube playlist settings", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Update playlist cover image
     */
    public function updatePlaylistCover(string $playlistId, string $imagePath, User $user): bool
    {
        throw new Exception("Cover image update not supported for YouTube");
    }
}