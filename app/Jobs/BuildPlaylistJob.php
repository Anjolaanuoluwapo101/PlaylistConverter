<?php

namespace App\Jobs;

use App\Models\PlaylistBuildJob;
use App\Services\Builder\PlaylistBuilderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Exception;

class BuildPlaylistJob implements ShouldQueue
{
    use Queueable;

    public PlaylistBuildJob $buildJob;

    /**
     * Create a new job instance.
     */
    public function __construct(PlaylistBuildJob $buildJob)
    {
        $this->buildJob = $buildJob;
    }

    /**
     * Execute the job.
     */
    public function handle(PlaylistBuilderService $builderService): void
    {
        try {
            // Mark job as processing
            $this->buildJob->markAsProcessing();

            // Build playlists across platforms with extracted parameters
            $results = $builderService->buildPlaylists(
                $this->buildJob->user,
                $this->buildJob->selected_tracks,
                $this->buildJob->selected_platforms,
                $this->buildJob->playlist_name,
                $this->buildJob->playlist_description
            );

            // Mark job as completed with results
            $this->buildJob->markAsCompleted($results);

            Log::info("BuildPlaylistJob completed successfully", [
                'job_id' => $this->buildJob->id,
                'user_id' => $this->buildJob->user_id,
                'platforms' => $this->buildJob->selected_platforms,
            ]);

        } catch (Exception $e) {
            // Mark job as failed
            $this->buildJob->markAsFailed($e->getMessage());

            Log::error("BuildPlaylistJob failed", [
                'job_id' => $this->buildJob->id,
                'user_id' => $this->buildJob->user_id,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to mark job as failed in queue
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        // Ensure job is marked as failed if not already
        if (!$this->buildJob->isFailed()) {
            $this->buildJob->markAsFailed($exception->getMessage());
        }

        Log::error("BuildPlaylistJob failed permanently", [
            'job_id' => $this->buildJob->id,
            'user_id' => $this->buildJob->user_id,
            'error' => $exception->getMessage(),
        ]);
    }
}
