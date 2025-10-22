<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\SyncJob;
use App\Services\Converter\PlaylistSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncPlaylistJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $syncJobId
    ) {
        Log::info("SyncPlaylistJob created", [
            'sync_job_id' => $syncJobId
        ]);
    }

    /**
     * Execute the job.
     */
    public function handle(PlaylistSyncService $syncService): void
    {
        Log::info("SyncPlaylistJob started", [
            'sync_job_id' => $this->syncJobId
        ]);

        try {
            // Fetch the sync job
            $syncJob = SyncJob::findOrFail($this->syncJobId);

            // Fetch fresh user instance
            $user = User::findOrFail($syncJob->user_id);

            Log::info("User and sync job fetched in sync job", [
                'user_id' => $user->id,
                'sync_job_id' => $syncJob->id,
                'has_source_token' => $syncJob->source_platform === 'spotify'
                    ? !empty($user->spotify_access_token)
                    : !empty($user->youtube_access_token),
                'has_target_token' => $syncJob->target_platform === 'spotify'
                    ? !empty($user->spotify_access_token)
                    : !empty($user->youtube_access_token)
            ]);

            // Perform the sync
            $syncService->performSyncing($syncJob, $user);

            Log::info("SyncPlaylistJob completed successfully", [
                'sync_job_id' => $this->syncJobId,
                'user_id' => $user->id
            ]);

        } catch (\Exception $e) {
            Log::error("SyncPlaylistJob failed", [
                'sync_job_id' => $this->syncJobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Update sync job status if it exists
            try {
                $syncJob = SyncJob::find($this->syncJobId);
                if ($syncJob) {
                    $syncJob->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                }
            } catch (\Exception $updateException) {
                Log::error("Failed to update sync job status", [
                    'sync_job_id' => $this->syncJobId,
                    'error' => $updateException->getMessage()
                ]);
            }

            // Re-throw to mark job as failed
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("SyncPlaylistJob failed after all retries", [
            'sync_job_id' => $this->syncJobId,
            'error' => $exception->getMessage()
        ]);

        // Update sync job status if it exists
        try {
            $syncJob = SyncJob::find($this->syncJobId);
            if ($syncJob) {
                $syncJob->update([
                    'status' => 'failed',
                    'error_message' => $exception->getMessage(),
                ]);
            }
        } catch (\Exception $updateException) {
            Log::error("Failed to update sync job status in failed handler", [
                'sync_job_id' => $this->syncJobId,
                'error' => $updateException->getMessage()
            ]);
        }
    }
}