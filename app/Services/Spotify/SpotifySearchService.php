<?php

namespace App\Services\Spotify;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class SpotifySearchService
{
    public function __construct(
        private SpotifyPlaylistService $playlistService
    ) {}

    
}