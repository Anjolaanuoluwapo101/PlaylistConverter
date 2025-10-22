<?php

namespace App\Services\Platform;

use App\Models\User;

interface PlatformInterface
{
    /**
     * Get platform name
     */
    public function getName(): string;

    /**
     * Check if user has connected this platform
     */
    public function isConnected(User $user): bool;

    /**
     * Get user's playlists
     */
    // public function getUserPlaylists(User $user): array;

    /**
     * Get playlist details with tracks
     */
    public function getPlaylistData(string $playlistId, User $user): array;

    /**
     * Get tracks from a playlist
     */
    // public function getPlaylistTracks(string $playlistId, User $user): array;

    /**
     * Create a new playlist
     */
    public function createPlaylist(User $user, string $name, string $description = ''): array;

    /**
     * Delete a playlist
     */
    public function deletePlaylist(string $playlistId, User $user): bool;

    /**
     * Search for a track
     */
    public function searchTrack(string $artist, string $title, User $user): ?array;

    /**
     * Add track to playlist
     */
    public function addTrackToPlaylist(string $playlistId, string $trackId, User $user): bool;

    /**
     * Add multiple tracks to playlist (batch)
     */
    public function addTracksToPlaylist(string $playlistId, array $trackIds, User $user): void;

    public function removeTrackFromPlaylist(string $playlistId, string $trackId, User $user): bool;

    public function getPlaylistById(string $playlistId, User $user): ?array;

    /**
     * Get user's playlists
     * @param User $user
     * @param int|null $limit Optional limit for pagination
     * @param int|string|null $offset Offset (Spotify) or pageToken (YouTube)
     */
    public function getUserPlaylists(User $user, int $limit , $offset = null): array;

    /**
     * Get tracks from a playlist
     * @param string $playlistId
     * @param User $user
     * @param int|null $limit Optional limit for pagination
     * @param int|string|null $offset Offset (Spotify) or pageToken (YouTube)
     */
    public function getPlaylistTracks(string $playlistId, User $user, ?int $limit = null, $offset = null): array;

}