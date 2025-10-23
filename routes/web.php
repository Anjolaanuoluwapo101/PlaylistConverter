<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\PlatformController;
use App\Http\Controllers\Api\PlaylistController as ApiPlaylistController;
use App\Http\Controllers\Api\ConversionController as ApiConversionController;
use App\Http\Controllers\Api\SyncController as ApiSyncController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    
    // Platform connections
    // Route::get('/platforms', [PlatformController::class, 'index'])->name('platforms.index');
    Route::get('/platforms/spotify/connect', [PlatformController::class, 'connectSpotify'])->name('platforms.spotify.connect');
    Route::get('/platforms/youtube/connect', [PlatformController::class, 'connectYoutube'])->name('platforms.youtube.connect');
    Route::post('/platforms/spotify/disconnect', [PlatformController::class, 'disconnectSpotify'])->name('platforms.spotify.disconnect');
    Route::post('/platforms/youtube/disconnect', [PlatformController::class, 'disconnectYoutube'])->name('platforms.youtube.disconnect');
    
    // Playlists
    Route::get('/playlists/show', function(){
        return Inertia::render('playlist');
    })->name('playlist');
    Route::prefix('playlists')->group(function () {
        Route::get('/spotify', action: [ApiPlaylistController::class, 'getSpotifyPlaylists'])->middleware('cacheResponse:3000');
        Route::get('/youtube', [ApiPlaylistController::class, 'getYoutubePlaylists'])->middleware('cacheResponse:3000');
        Route::get('/spotify/{playlistId}/tracks', [ApiPlaylistController::class, 'getSpotifyPlaylistTracks'])->middleware('cacheResponse:3000');
        Route::get('/youtube/{playlistId}/tracks', [ApiPlaylistController::class, 'getYoutubePlaylistTracks'])->middleware('cacheResponse:3000');
        Route::delete('/{platform}', [ApiPlaylistController::class, 'destroyPlaylists']);
        Route::delete('/{platform}/{playlistId}/tracks', [ApiPlaylistController::class, 'destroyTracks']);
   
    });

    // Conversions
    Route::get('/convert', function(){
        return Inertia::render('convert');
    })->name('convert');
    Route::post('/convert', [ApiConversionController::class, 'convert'])->name('convert.convert');
    Route::get('/convert/history', [ApiConversionController::class, 'history'])->middleware('cacheResponse:3000');
    Route::get('/convert/{id}', [ApiConversionController::class, 'status'])->name('convert.status');
    
    // Sync
    Route::get('/sync', function(){
        return Inertia::render('sync');
    });
    Route::post('/sync', [ApiSyncController::class, 'sync']);
    Route::get('/sync/history', [ApiSyncController::class, 'getUserSyncs']);
    Route::get('/sync/{jobId}', [ApiSyncController::class, 'getSyncStatus']);

    Route::get('/platforms/connected', [ApiConversionController::class, 'connectedPlatforms'])->middleware('cacheResponse:3000')->name('platforms.connected');

});

//callbacks
Route::get('/auth/spotify/callback', [PlatformController::class, 'spotifyCallback'])->name('platforms.spotify.callback');
Route::get('/auth/youtube/callback', [PlatformController::class, 'youtubeCallback'])->name('platforms.youtube.callback');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
