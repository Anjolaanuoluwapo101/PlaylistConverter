<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConversionJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_playlist_id',
        'target_platform',
        'status',
        'total_tracks',
        'matched_tracks',
        'failed_tracks',
        'progress_percentage',
        'target_playlist_id',
        'error_message',
        'failed_track_details',
    ];

    protected $casts = [
        'total_tracks' => 'integer',
        'matched_tracks' => 'integer',
        'failed_tracks' => 'integer',
        'progress_percentage' => 'integer',
        'failed_track_details' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sourcePlaylist()
    {
        return $this->belongsTo(Playlist::class, 'source_playlist_id');
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
