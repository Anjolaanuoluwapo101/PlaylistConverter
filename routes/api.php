<?php

use Illuminate\Support\Facades\Route;
use illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpotifyAuthController;
use App\Http\Controllers\Api\YouTubeAuthController;
use App\Http\Controllers\Api\PlaylistController;
use App\Http\Controllers\Api\ConversionController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\BuildController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Spotify Auth
    Route::prefix('auth/spotify')->group(function () {
        Route::get('/redirect', [SpotifyAuthController::class, 'redirect']);
        Route::get('/status', [SpotifyAuthController::class, 'status']);
        Route::post('/disconnect', [SpotifyAuthController::class, 'disconnect']);
    });

    // YouTube Auth
    Route::prefix('auth/youtube')->group(function () {
        Route::get('/redirect', [YouTubeAuthController::class, 'redirect']);
        Route::get('/status', [YouTubeAuthController::class, 'status']);
        Route::post('/disconnect', [YouTubeAuthController::class, 'disconnect']);
    });


    // OAuth callbacks (no auth required)
    Route::get('/auth/spotify/callback', [SpotifyAuthController::class, 'callback']);
    Route::get('/auth/youtube/callback', [YouTubeAuthController::class, 'callback']);


    Route::prefix('playlists')->group(function () {
        Route::get('/spotify', [PlaylistController::class, 'getSpotifyPlaylists']);
        Route::get('/spotify/{playlistId}/tracks', [PlaylistController::class, 'getSpotifyPlaylistTracks']);
        Route::get('/youtube', [PlaylistController::class, 'getYoutubePlaylists']);
        Route::get('/youtube/{playlistId}/tracks', [PlaylistController::class, 'getYoutubePlaylistTracks']);
        Route::delete('/{platform}', [PlaylistController::class, 'destroyPlaylists']);
        Route::delete('/{platform}/{playlistId}/tracks', [PlaylistController::class, 'destroyTracks']);
    });

    // Test search endpoints
    Route::post('/test/spotify/search', [PlaylistController::class, 'spotifySearch']);
    Route::post('/test/youtube/search', [PlaylistController::class, 'youtubeSearch']);

    // Conversions
    Route::prefix('conversions')->group(function () {
        Route::get('/', [ConversionController::class, 'index']);
        Route::post('/', [ConversionController::class, 'convert']);
        Route::get('/{jobId}', [ConversionController::class, 'status']);
        Route::delete('/{jobId}', [ConversionController::class, 'destroy']);
    });

    // Platform info
    Route::get('/platforms', [ConversionController::class, 'platforms']);
    Route::get('/platforms/connected', [ConversionController::class, 'connectedPlatforms']);

    // Playlist sync
    Route::prefix('sync')->group(function () {
        Route::post('/', [SyncController::class, 'sync']);
        Route::post('/queued', [SyncController::class, 'syncQueued']);
        Route::get('/status/{jobId}', [SyncController::class, 'getSyncStatus']);
        Route::get('/user', [SyncController::class, 'getUserSyncs']);
    });

    // Playlist build
    Route::prefix('build')->group(function () {
        Route::post('/', [BuildController::class, 'build']);
        Route::get('/jobs', [BuildController::class, 'jobs']);
        Route::get('/status/{jobId}', [BuildController::class, 'status']);
    });
});
