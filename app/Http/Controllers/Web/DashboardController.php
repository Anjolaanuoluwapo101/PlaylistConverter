<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ConversionJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get recent conversions
        $recentConversions = ConversionJob::where('user_id', $user->id)
            ->with('sourcePlaylist')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('Dashboard', [
            'stats' => [
                'total_conversions' => ConversionJob::where('user_id', $user->id)->count(),
                'completed_conversions' => ConversionJob::where('user_id', $user->id)
                    ->where('status', 'completed')->count(),
                'has_spotify' => $user->hasSpotifyToken(),
                'has_youtube' => $user->hasYoutubeToken(),
            ],
            'recentConversions' => $recentConversions,
        ]);
    }
}