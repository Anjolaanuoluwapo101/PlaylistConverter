<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SyncJob;
use App\Services\Converter\PlaylistSyncService;
use App\Services\Platform\PlatformFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Jobs\SyncPlaylistJob;

class SyncController extends Controller
{
    public function __construct(
        private PlaylistSyncService $syncService,
        private PlatformFactory $platformFactory
    ) {
    }

    /**
     * Sync playlists
     */
    public function sync(Request $request)
    {
        Log::info("Sync request received", [
            'user_id' => $request->user()->id,
            'request_data' => $request->all()
        ]);

        $availablePlatforms = $this->platformFactory->getAvailablePlatforms();

        $validated = $request->validate([
            'source_playlist_id' => 'required|string',
            'source_platform' => ['required', 'string', Rule::in($availablePlatforms)],
            'target_playlist_id' => 'required|string',
            'target_platform' => ['required', 'string', Rule::in($availablePlatforms)],
            'remove_extras' => 'boolean',
        ]);

        try {
            $user = $request->user();

            $syncJob = $this->syncService->sync(
                $validated['source_playlist_id'],
                $validated['source_platform'],
                $validated['target_playlist_id'],
                $validated['target_platform'],
                $user,
                $validated['remove_extras'] ?? false
            );

            Log::info("Sync job created successfully", [
                'user_id' => $user->id,
                'job_id' => $syncJob->id
            ]);

            return response()->json([
                'message' => 'Playlist sync completed',
                'job' => $syncJob,
                'results' => $syncJob->results,
            ]);

        } catch (\InvalidArgumentException $e) {
            Log::warning("Invalid sync request", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Invalid request',
                'message' => $e->getMessage(),
            ], 400);

        } catch (\Exception $e) {
            Log::error("Sync failed", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Sync failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Get sync job status
     */
    public function getSyncStatus(Request $request, int $jobId)
    {
        Log::info("Fetching sync status", [
            'job_id' => $jobId,
            'user_id' => $request->user()->id
        ]);

        $job = SyncJob::where('id', $jobId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$job) {
            Log::warning("Sync job not found", [
                'job_id' => $jobId,
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'error' => 'Sync job not found'
            ], 404);
        }

        return response()->json([
            'job' => $job,
            'results' => $job->results,
        ]);
    }

    /**
     * Get all sync jobs for a user
     */
    public function getUserSyncs(Request $request)
    {
        Log::info("Fetching user syncs", ['user_id' => $request->user()->id]);

        $jobs = SyncJob::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info("User syncs fetched", [
            'user_id' => $request->user()->id,
            'count' => $jobs->count()
        ]);

        return response()->json([
            'syncs' => $jobs,
        ]);
    }

    /**
     * Queue a playlist sync job
     */
    public function syncQueued(Request $request)
    {
        Log::info("Queued sync request received", [
            'user_id' => $request->user()->id,
            'request_data' => $request->all()
        ]);

        $availablePlatforms = $this->platformFactory->getAvailablePlatforms();

        $validated = $request->validate([
            'source_playlist_id' => 'required|string',
            'source_platform' => ['required', 'string', Rule::in($availablePlatforms)],
            'target_playlist_id' => 'required|string',
            'target_platform' => ['required', 'string', Rule::in($availablePlatforms)],
            'remove_extras' => 'boolean',
        ]);

        try {
            $user = $request->user();

            // Create sync job first
            $syncJob = SyncJob::create([
                'user_id' => $user->id,
                'source_playlist_id' => $validated['source_playlist_id'],
                'source_platform' => $validated['source_platform'],
                'target_playlist_id' => $validated['target_playlist_id'],
                'target_platform' => $validated['target_platform'],
                'remove_extras' => $validated['remove_extras'] ?? false,
                'status' => 'pending',
            ]);

            // Dispatch to queue
            SyncPlaylistJob::dispatch($syncJob->id);

            Log::info("Sync job dispatched to queue", [
                'user_id' => $user->id,
                'job_id' => $syncJob->id,
                'queue' => "sync-{$validated['source_platform']}-to-{$validated['target_platform']}"
            ]);

            return response()->json([
                'message' => 'Playlist sync queued successfully',
                'job_id' => $syncJob->id,
                'info' => 'The sync will be processed in the background. This may take a few minutes.',
            ], 202); // 202 Accepted

        } catch (\InvalidArgumentException $e) {
            Log::warning("Invalid queued sync request", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Invalid request',
                'message' => $e->getMessage(),
            ], 400);

        } catch (\Exception $e) {
            Log::error("Failed to queue sync", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to queue sync',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}