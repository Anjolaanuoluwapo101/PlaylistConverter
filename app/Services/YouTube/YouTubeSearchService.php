<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class YouTubeSearchService
{
    public function __construct(
        private YouTubePlaylistService $playlistService
    ) {}
 
    public function findTrack(string $artist, string $title, User $user): ?array
    {
        // Try with artist and title
        $query = "{$artist} {$title} official audio";
        $result = $this->playlistService->searchTrack($query, $user);

        if ($result) {
            return $result;
        }

        // Try without "official audio"
        $query = "{$artist} {$title}";
        $result = $this->playlistService->searchTrack($query, $user);

        if ($result) {
            return $result;
        }

        // Try cleaned query
        $cleanQuery = $this->cleanSearchQuery($artist, $title);
        $result = $this->playlistService->searchTrack($cleanQuery, $user);

        if (!$result) {
            Log::warning("YouTube track not found for artist '{$artist}' and title '{$title}' for user " . $user->id, [
                'queries' => [
                    "{$artist} {$title} official audio",
                    "{$artist} {$title}",
                    $cleanQuery,
                ],
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

        return $clean($artist) . ' ' . $clean($title) . ' audio';
    }
}