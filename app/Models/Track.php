<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Track extends Model
{
    use HasFactory;

    protected $fillable = [
        'playlist_id',
        'source_track_id',
        'title',
        'artist',
        'album',
        'duration_ms',
    ];

    protected $casts = [
        'duration_ms' => 'integer',
    ];

    // Relationships
    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    // Helper method to get search query
    public function getSearchQuery(): string
    {
        return "{$this->artist} {$this->title}";
    }
}
