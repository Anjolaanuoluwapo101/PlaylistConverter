<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait LogsOperations
{
    /**
     * Log an operation start with consistent context
     */
    protected function logOperationStart(string $operation, array $context = []): void
    {
        $this->log('info', "Starting {$operation}", $context);
    }

    /**
     * Log an operation success with consistent context
     */
    protected function logOperationSuccess(string $operation, array $context = []): void
    {
        $this->log('info', "{$operation} completed successfully", $context);
    }

    /**
     * Log an operation failure with consistent context
     */
    protected function logOperationFailure(string $operation, \Throwable $exception, array $context = []): void
    {
        $this->log('error', "{$operation} failed", array_merge($context, [
            'error' => $exception->getMessage(),
            'error_class' => get_class($exception),
        ]));
    }

    /**
     * Log a warning with consistent context
     */
    protected function logWarning(string $message, array $context = []): void
    {
        $this->log('warning', $message, $context);
    }

    /**
     * Log debug information with consistent context
     */
    protected function logDebug(string $message, array $context = []): void
    {
        $this->log('debug', $message, $context);
    }

    /**
     * Log with consistent context formatting
     */
    protected function log(string $level, string $message, array $context = []): void
    {
        // Add service class name to context if not already present
        if (!isset($context['service'])) {
            $context['service'] = get_class($this);
        }

        // Add timestamp for better tracking
        $context['timestamp'] = now()->toISOString();

        Log::{$level}($message, $context);
    }

    /**
     * Create standardized context for user operations
     */
    protected function createUserContext($user, array $additional = []): array
    {
        return array_merge([
            'user_id' => $user->id ?? 'unknown',
        ], $additional);
    }

    /**
     * Create standardized context for playlist operations
     */
    protected function createPlaylistContext(string $playlistId, array $additional = []): array
    {
        return array_merge([
            'playlist_id' => $playlistId,
        ], $additional);
    }

    /**
     * Create standardized context for track operations
     */
    protected function createTrackContext(string $trackId = null, array $additional = []): array
    {
        $context = $additional;
        if ($trackId) {
            $context['track_id'] = $trackId;
        }
        return $context;
    }

    /**
     * Create standardized context for API operations
     */
    protected function createApiContext(string $method, string $endpoint, array $additional = []): array
    {
        return array_merge([
            'api_method' => $method,
            'api_endpoint' => $endpoint,
        ], $additional);
    }
}
