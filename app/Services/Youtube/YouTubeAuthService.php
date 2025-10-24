<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class YouTubeAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $tokenUrl = 'https://oauth2.googleapis.com/token';

    public function __construct()
    {
        $this->clientId = config('services.youtube.client_id');
        $this->clientSecret = config('services.youtube.client_secret');
        $this->redirectUri = config('services.youtube.redirect');
    }

    public function getAuthorizationUrl(): string
    {
        $scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube',
        ];

        $query = http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        return "https://accounts.google.com/o/oauth2/v2/auth?{$query}";
    }

    public function handleCallback(string $code): array
    {
        $response = Http::asForm()->post($this->tokenUrl, [
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if ($response->failed()) {
            Log::error('Failed to get YouTube access token', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            throw new \Exception('Failed to get YouTube access token');
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? null,
            'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ];
    }

    public function refreshToken(User $user): array
    {
        if (!$user->youtube_refresh_token) {
            Log::error('No YouTube refresh token available for user ' . $user->id);
            throw new \Exception('No refresh token available');
        }

        $response = Http::asForm()->post($this->tokenUrl, [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $user->youtube_refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            Log::error('Failed to refresh YouTube token for user ' . $user->id, [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            // throw new \Exception('Failed to refresh YouTube token');
            return [
                'error' => $response->status()
            ];
        }

        $data = $response->json();

        $user->update([
            'youtube_access_token' => $data['access_token'],
            'youtube_token_expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ]);

        return [
            'access_token' => $data['access_token'],
            'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ];
    }

    public function getValidToken(User $user): string
    {
        if (!$user->youtube_token_expires_at || Carbon::now()->greaterThan($user->youtube_token_expires_at)) {
            $tokenData = $this->refreshToken($user);
            if(isset($tokenData['error'])){
                throw new \Exception('Failed to refresh Spotify token');
            }
            return $tokenData['access_token'];
        }

        return $user->youtube_access_token;
    }
}