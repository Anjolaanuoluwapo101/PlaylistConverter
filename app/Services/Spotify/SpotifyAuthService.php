<?php

namespace App\Services\Spotify;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SpotifyAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $baseUrl = 'https://api.spotify.com/v1';
    private string $authUrl = 'https://accounts.spotify.com/api/token';

    public function __construct()
    {
        $this->clientId = config('services.spotify.client_id');
        $this->clientSecret = config('services.spotify.client_secret');
        $this->redirectUri = config('services.spotify.redirect');
    }

    public function getAuthorizationUrl(): string
    {
        $scopes = [
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public',
            'playlist-modify-private',
        ];

        $query = http_build_query([
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(' ', $scopes),
        ]);

        return "https://accounts.spotify.com/authorize?{$query}";
    }

    public function handleCallback(string $code): array
    {
        $response = Http::asForm()->post($this->authUrl, [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $this->redirectUri,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
        ]);

        if ($response->failed()) {
            Log::error('Failed to get Spotify access token', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            throw new \Exception('Failed to get Spotify access token');
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'],
            'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ];
    }

    public function refreshToken(User $user): array
    {
        $response = Http::asForm()->post($this->authUrl, [
            'grant_type' => 'refresh_token',
            'refresh_token' => $user->spotify_refresh_token,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
        ]);

        if ($response->failed()) {
            Log::error('Failed to refresh Spotify token for user ' . $user->id, [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            // throw new \Exception('Failed to refresh Spotify token');
            return [
                'error' => $response->status()
            ];
        }

        $data = $response->json();

        $user->update([
            'spotify_access_token' => $data['access_token'],
            'spotify_token_expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ]);

        return [
            'access_token' => $data['access_token'],
            'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ];
    }

    public function getValidToken(User $user): string
    {
        if (!$user->spotify_token_expires_at || Carbon::now()->greaterThan($user->spotify_token_expires_at)) {
            $tokenData = $this->refreshToken($user);
            if(isset($tokenData['error'])){
                throw new \Exception('Failed to refresh Spotify token');
            }
            return $tokenData['access_token'];
        }

        return $user->spotify_access_token;
    }
}