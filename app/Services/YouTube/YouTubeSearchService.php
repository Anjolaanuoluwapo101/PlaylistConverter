<?php

namespace App\Services\YouTube;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class YouTubeSearchService
{
    public function __construct(
        private YouTubePlaylistService $playlistService
    ) {}
 
}