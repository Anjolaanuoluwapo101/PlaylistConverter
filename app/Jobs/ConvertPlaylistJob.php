<?php

namespace App\Jobs;

use App\Models\ConversionJob;
use App\Models\User;
use App\Services\Converter\PlaylistConverterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ConvertPlaylistJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour timeout
    public $tries = 1; // Retry 3 times on failure

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $conversionJobId,
        public int $userId,
        public string $sourcePlatform,
        public string $targetPlatform
    ) {
        // Set the queue name based on conversion direction
        $this->onQueue($this->getQueueName($sourcePlatform, $targetPlatform));
        
        Log::info("ConvertPlaylistJob created", [
            'conversion_job_id' => $conversionJobId,
            'user_id' => $userId,
            'queue' => $this->queue
        ]);
    }

    /**
     * Get queue name based on platforms
     */
    private function getQueueName(string $source, string $target): string
    {
        return "conversions-{$source}-to-{$target}";
    }

    /**
     * Execute the job.
     */
    public function handle(PlaylistConverterService $converterService): void
    {
        Log::info("ConvertPlaylistJob started", [
            'conversion_job_id' => $this->conversionJobId,
            'user_id' => $this->userId,
            'queue' => $this->queue
        ]);

        try {
            // Get the conversion job and user
            $conversionJob = ConversionJob::with('sourcePlaylist')->findOrFail($this->conversionJobId);
            $user = User::findOrFail($this->userId);

            Log::info("User fetched for conversion", [
                'user_id' => $user->id,
                'has_spotify_token' => $user->hasSpotifyToken(),
                'has_youtube_token' => $user->hasYoutubeToken(),
                'spotify_token_preview' => substr($user->spotify_token, 0, 4) . '...' . substr($user->spotify_token, -4),
                'youtube_token_preview' => substr($user->youtube_token, 0, 4) . '...' . substr($user->youtube_token, -4),
            ]); 

            // Mark as processing
            $conversionJob->update(['status' => 'processing']);

            Log::info("Starting conversion process", [
                'conversion_job_id' => $this->conversionJobId,
                'playlist_name' => $conversionJob->sourcePlaylist->name
            ]);

            // Perform the conversion using the existing service method
            $converterService->performConversion($conversionJob, $user);

            Log::info("ConvertPlaylistJob completed successfully", [
                'conversion_job_id' => $this->conversionJobId,
                'matched_tracks' => $conversionJob->fresh()->matched_tracks,
                'failed_tracks' => $conversionJob->fresh()->failed_tracks
            ]);

        } catch (\Exception $e) {
            Log::error("ConvertPlaylistJob failed", [
                'conversion_job_id' => $this->conversionJobId,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Update job status to failed
            $conversionJob = ConversionJob::find($this->conversionJobId);
            if ($conversionJob) {
                $conversionJob->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
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
        Log::error("ConvertPlaylistJob failed after all retries", [
            'conversion_job_id' => $this->conversionJobId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage()
        ]);

        // Update the conversion job status
        $conversionJob = ConversionJob::find($this->conversionJobId);
        if ($conversionJob) {
            $conversionJob->update([
                'status' => 'failed',
                'error_message' => 'Job failed after maximum retries: ' . $exception->getMessage(),
            ]);
        }
    }
}