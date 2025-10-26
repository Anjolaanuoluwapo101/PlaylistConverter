<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'spotify_access_token',
        'spotify_refresh_token',
        'spotify_token_expires_at',
        'youtube_access_token',
        'youtube_refresh_token',
        'youtube_token_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'spotify_access_token',
        'spotify_refresh_token',
        'youtube_access_token',
        'youtube_refresh_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'spotify_token_expires_at' => 'datetime',
            'youtube_token_expires_at' => 'datetime',
        ];
    }

    // Relationships
    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }

    public function conversionJobs()
    {
        return $this->hasMany(ConversionJob::class);
    }

    // Helper methods
    public function hasSpotifyToken(): bool
    {
        return !empty($this->spotify_access_token);
    }

    public function hasYoutubeToken(): bool
    {
        return !empty($this->youtube_access_token);
    }
    
}