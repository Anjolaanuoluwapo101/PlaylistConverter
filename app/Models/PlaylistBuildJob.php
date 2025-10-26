<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaylistBuildJob extends Model
{
    use \App\Traits\LogsOperations;

    protected $fillable = [
        'user_id',
        'playlist_name',
        'playlist_description',
        'selected_platforms',
        'selected_tracks',
        'status',
        'results',
        'error_message',
    ];

    protected $casts = [
        'selected_platforms' => 'array',
        'selected_tracks' => 'array',
        'results' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    // Helper methods for status checks
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    // Status update methods
    public function markAsProcessing(): void
    {
        $this->update(['status' => self::STATUS_PROCESSING]);
    }

    public function markAsCompleted(array $results = null): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'results' => $results,
        ]);
    }


    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
        ]);
    }
}
