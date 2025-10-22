<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_platform',
        'source_playlist_id',
        'name',
        'description',
        'track_count',
        'image_url',
    ];

    protected $casts = [
        'track_count' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tracks()
    {
        return $this->hasMany(Track::class);
    }

    public function conversionJobs()
    {
        return $this->hasMany(ConversionJob::class, 'source_playlist_id');
    }
}
