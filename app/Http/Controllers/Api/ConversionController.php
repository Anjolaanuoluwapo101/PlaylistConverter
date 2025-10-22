<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Converter\PlaylistConverterService;
use App\Services\Platform\PlatformFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ConversionController extends Controller
{
    public function __construct(
        private PlaylistConverterService $converterService,
        private PlatformFactory $platformFactory
    ) {}

    /**
     * Start a playlist conversion
     */
    public function convert(Request $request)
    {
        Log::info("Conversion request received", [
            'user_id' => $request->user()->id,
            'request_data' => $request->all()
        ]);

        $availablePlatforms = $this->platformFactory->getAvailablePlatforms();

        $validated = $request->validate([
            'source_playlist_id' => 'required|string', // Can be ID or URL
            'source_platform' => ['required', 'string', Rule::in($availablePlatforms)],
            'target_platform' => ['required', 'string', Rule::in($availablePlatforms)],
        ]);

        Log::info("Validation passed", ['validated_data' => $validated]);

        $sourcePlaylistId = $validated['source_playlist_id'];

        // Parse URL to extract playlist ID if it's a URL
        $parsedPlaylistId = $this->parsePlaylistUrl($sourcePlaylistId, $validated['source_platform']);

        try {
            $user = $request->user();

            $conversionJob = $this->converterService->convert(
                $parsedPlaylistId,
                $validated['source_platform'],
                $validated['target_platform'],
                $user
            );

            Log::info("Conversion initiated successfully", [
                'job_id' => $conversionJob->id,
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Conversion started successfully',
                'job' => [
                    'id' => $conversionJob->id,
                    'status' => $conversionJob->status,
                    'source_playlist' => [
                        'id' => $conversionJob->sourcePlaylist->id,
                        'name' => $conversionJob->sourcePlaylist->name,
                        'platform' => $conversionJob->sourcePlaylist->source_platform,
                    ],
                    'target_platform' => $conversionJob->target_platform,
                    'total_tracks' => $conversionJob->total_tracks,
                    'matched_tracks' => $conversionJob->matched_tracks,
                    'failed_tracks' => $conversionJob->failed_tracks,
                    'progress_percentage' => $conversionJob->progress_percentage,
                    'target_playlist_id' => $conversionJob->target_playlist_id,
                    'created_at' => $conversionJob->created_at,
                ],
            ], 201);

        } catch (\InvalidArgumentException $e) {
            Log::warning("Invalid conversion request", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Invalid request',
                'message' => $e->getMessage(),
            ], 400);

        } catch (\Exception $e) {
            Log::error("Conversion failed", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Conversion failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    *
    */

    /**
     * Get conversion job status
     */
    public function status(Request $request, int $jobId)
    {
        Log::info("Status check requested", [
            'user_id' => $request->user()->id,
            'job_id' => $jobId
        ]);

        try {
            $user = $request->user();
            $job = $this->converterService->getConversionStatus($jobId, $user);

            if (!$job) {
                Log::warning("Conversion job not found", [
                    'user_id' => $user->id,
                    'job_id' => $jobId
                ]);

                return response()->json([
                    'error' => 'Conversion job not found',
                ], 404);
            }

            Log::info("Status retrieved successfully", [
                'job_id' => $jobId,
                'status' => $job->status,
                'progress' => $job->progress_percentage
            ]);

            return response()->json([
                'job' => [
                    'id' => $job->id,
                    'status' => $job->status,
                    'source_playlist' => [
                        'id' => $job->sourcePlaylist->id,
                        'name' => $job->sourcePlaylist->name,
                        'platform' => $job->sourcePlaylist->source_platform,
                        'track_count' => $job->sourcePlaylist->track_count,
                    ],
                    'target_platform' => $job->target_platform,
                    'target_playlist_id' => $job->target_playlist_id,
                    'total_tracks' => $job->total_tracks,
                    'matched_tracks' => $job->matched_tracks,
                    'failed_tracks' => $job->failed_tracks,
                    'progress_percentage' => $job->progress_percentage,
                    'error_message' => $job->error_message,
                    'failed_track_details' => $job->failed_track_details,
                    'created_at' => $job->created_at,
                    'updated_at' => $job->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to retrieve conversion status", [
                'user_id' => $request->user()->id,
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve status',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all conversions for the authenticated user
     */
    public function history(Request $request)
    {
        Log::info("Fetching all conversions for user", [
            'user_id' => $request->user()->id
        ]);

        try {
            $user = $request->user();
            $conversions = $this->converterService->getUserConversions($user);

            Log::info("Conversions retrieved successfully", [
                'user_id' => $user->id,
                'count' => count($conversions)
            ]);

            return response()->json([
                'conversions' => array_map(function ($job) {
                    return [
                        'id' => $job['id'],
                        'status' => $job['status'],
                        'source_playlist' => [
                            'name' => $job['source_playlist']['name'],
                            'platform' => $job['source_playlist']['source_platform'],
                        ],
                        'target_platform' => $job['target_platform'],
                        'total_tracks' => $job['total_tracks'],
                        'matched_tracks' => $job['matched_tracks'],
                        'failed_tracks' => $job['failed_tracks'],
                        'progress_percentage' => $job['progress_percentage'],
                        'created_at' => $job['created_at'],
                    ];
                }, $conversions),
                'count' => count($conversions),
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to retrieve user conversions", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve conversions',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available platforms
     */
    public function platforms()
    {
        Log::info("Available platforms requested");

        $platforms = $this->platformFactory->getAvailablePlatforms();

        Log::info("Available platforms retrieved", ['platforms' => $platforms]);

        return response()->json([
            'platforms' => $platforms,
        ]);
    }

    /**
     * Get user's connected platforms
     */
    public function connectedPlatforms(Request $request)
    {
        $user = $request->user();

        Log::info("Checking connected platforms", ['user_id' => $user->id]);

        $connected = [
            'spotify' => $user->hasSpotifyToken(),
            'youtube' => $user->hasYoutubeToken(),
        ];

        Log::info("Connected platforms retrieved", [
            'user_id' => $user->id,
            'connected' => $connected
        ]);

        return response()->json([
            'connected_platforms' => $connected,
        ]);
    }

    /**
     * Delete/Cancel a conversion job
     */
    public function destroy(Request $request, int $jobId)
    {
        Log::info("Delete conversion requested", [
            'user_id' => $request->user()->id,
            'job_id' => $jobId
        ]);

        try {
            $user = $request->user();
            $job = $this->converterService->getConversionStatus($jobId, $user);

            if (!$job) {
                Log::warning("Conversion job not found for deletion", [
                    'user_id' => $user->id,
                    'job_id' => $jobId
                ]);

                return response()->json([
                    'error' => 'Conversion job not found',
                ], 404);
            }



            return response()->json([
                'message' => 'Conversion job deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to delete conversion job", [
                'user_id' => $request->user()->id,
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to delete conversion job',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse playlist URL to extract playlist ID
     */
    private function parsePlaylistUrl(string $input, string $platform): string
    {
        // If it's already an ID (no URL patterns), return as is
        if (!preg_match('/^https?:\/\//', $input)) {
            return $input;
        }

        switch ($platform) {
            case 'spotify':
                // Spotify playlist URLs: https://open.spotify.com/playlist/{id}
                if (preg_match('/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/', $input, $matches)) {
                    return $matches[1];
                }
                break;

            case 'youtube':
                // YouTube playlist URLs: https://www.youtube.com/playlist?list={id}
                if (preg_match('/youtube\.com\/playlist\?list=([A-Za-z0-9_-]+)/', $input, $matches)) {
                    return $matches[1];
                }
                // YouTube Music playlist URLs: https://music.youtube.com/playlist?list={id}
                if (preg_match('/music\.youtube\.com\/playlist\?list=([A-Za-z0-9_-]+)/', $input, $matches)) {
                    return $matches[1];
                }
                break;
        }

        // If URL pattern doesn't match, throw an error
        throw new \InvalidArgumentException("Invalid playlist URL for platform: {$platform}");
    }
}
