<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\BuildPlaylistJob;
use App\Models\PlaylistBuildJob;
use App\Services\Builder\PlaylistBuilderService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Spatie\ResponseCache\Facades\ResponseCache;

class BuildController extends Controller
{
    public function __construct(
        private PlaylistBuilderService $builderService
    ) {}

    /**
     * Start building playlists across multiple platforms
     */
    public function build(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'playlist_name' => 'required|string|max:255',
            'playlist_description' => 'nullable|string|max:1000',
            'selected_platforms' => 'required|array|min:1|max:2', // Max 2 platforms
            'selected_platforms.*' => 'string|in:spotify,youtube',
            'selected_tracks' => 'required|array|min:1|max:5', // Max 5 tracks
            'selected_tracks.*.track_id' => 'required|string',
            'selected_tracks.*.platform' => 'required|string|in:spotify,youtube',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();

        // Create build job record first
        $buildJob = PlaylistBuildJob::create([
            'user_id' => $user->id,
            'playlist_name' => $request->playlist_name,
            'playlist_description' => $request->playlist_description ?: '',
            'selected_platforms' => $request->selected_platforms,
            'selected_tracks' => $request->selected_tracks,
            'status' => PlaylistBuildJob::STATUS_PENDING,
        ]);

        // Dispatch to queue
        // BuildPlaylistJob::dispatch($buildJob);

        try {
            // Perform synchronous build using the service with job instance
            $results = $this->builderService->buildPlaylists($buildJob);

            // Clear playlist caches for each selected platform after successful build
            foreach ($request->selected_platforms as $platform) {
                ResponseCache::forget("/playlists/{$platform}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Playlist build completed successfully',
                'job_id' => $buildJob->id,
                'results' => $results,
            ]);

        } catch (\App\Exceptions\PlatformException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Platform connection error',
                'error' => $e->getMessage(),
            ], 401);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Playlist build failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the status of a build job
     */
    public function status(Request $request, $jobId): JsonResponse
    {
        $user = Auth::user();

        $job = PlaylistBuildJob::where('id', $jobId)
            ->where('user_id', $user->id)
            ->first();

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Job not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'job' => [
                'id' => $job->id,
                'status' => $job->status,
                'playlist_name' => $job->playlist_name,
                'selected_platforms' => $job->selected_platforms,
                'results' => $job->results,
                'error_message' => $job->error_message,
                'created_at' => $job->created_at,
                'updated_at' => $job->updated_at,
            ],
        ]);
    }

    /**
     * Get user's build jobs
     */
    public function jobs(Request $request): JsonResponse
    {
        $user = Auth::user();

        $jobs = PlaylistBuildJob::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'jobs' => $jobs,
        ]);
    }
}
