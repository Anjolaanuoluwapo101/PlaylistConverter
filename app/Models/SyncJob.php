<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SyncJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_playlist_id',
        'source_platform',
        'target_playlist_id',
        'target_platform',
        'remove_extras',
        'status',
        'tracks_to_add',
        'tracks_to_remove',
        'tracks_in_sync',
        'added_count',
        'removed_count',
        'failed_to_add_count',
        'failed_to_remove_count',
        'progress_percentage',
        'results',
        'error_message',
    ];

    protected $casts = [
        'remove_extras' => 'boolean',
        'tracks_to_add' => 'integer',
        'tracks_to_remove' => 'integer',
        'tracks_in_sync' => 'integer',
        'added_count' => 'integer',
        'removed_count' => 'integer',
        'failed_to_add_count' => 'integer',
        'failed_to_remove_count' => 'integer',
        'progress_percentage' => 'integer',
        'results' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
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
