<?php

namespace App\Services\Spotify;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class SpotifySearchService
{
    public function __construct(
        private SpotifyPlaylistService $playlistService
    ) {}

    public function findTrack(string $artist, string $title, User $user): ?array
    {
        // Try exact match first
        $query = "{$artist} {$title}";
        $result = $this->playlistService->searchTrack($query, $user);

        if ($result) {
            return $result;
        }

        // Try without special characters
        $cleanQuery = $this->cleanSearchQuery($artist, $title);
        $result = $this->playlistService->searchTrack($cleanQuery, $user);

        if (!$result) {
            Log::warning("Spotify track not found for artist '{$artist}' and title '{$title}' for user " . $user->id, [
                'original_query' => "{$artist} {$title}",
                'cleaned_query' => $cleanQuery,
            ]);
        }

        return $result;
    }

    private function cleanSearchQuery(string $artist, string $title): string
    {
        $clean = function($str) {
            // Remove special characters and extra spaces
            $str = preg_replace('/[^\w\s]/', '', $str);
            $str = preg_replace('/\s+/', ' ', $str);
            return trim($str);
        };

        return $clean($artist) . ' ' . $clean($title);
    }
}