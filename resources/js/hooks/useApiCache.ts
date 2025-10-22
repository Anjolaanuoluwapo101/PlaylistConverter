import { useCallback } from 'react';
import { platformCache, playlistCache, trackCache, syncCache, cacheKeys } from '../utils/apiCache';
import axios from 'axios';

/**
 * React hook for cached API calls
 * Provides a clean interface for components to use caching
 */

export function usePlatformCache() {
  const getConnectedPlatforms = useCallback(async () => {
    return platformCache.getOrFetch(
      cacheKeys.platforms(),
      async () => {
        const response = await axios.get('/platforms/connected');
        return response.data;
      }
    );
  }, []);

  const invalidatePlatformCache = useCallback(() => {
    platformCache.invalidate(cacheKeys.platforms());
  }, []);

  return {
    getConnectedPlatforms,
    invalidatePlatformCache
  };
}

export function usePlaylistCache() {
  const getPlaylists = useCallback(async (platform: string) => {
    return playlistCache.getOrFetch(
      cacheKeys.playlists(platform),
      async () => {
        const response = await axios.get(`/playlists/${platform}`);
        return response.data;
      }
    );
  }, []);

  const getPlaylistTracks = useCallback(async (platform: string, playlistId: string) => {
    return trackCache.getOrFetch(
      cacheKeys.playlistTracks(platform, playlistId),
      async () => {
        const response = await axios.get(`/playlists/${platform}/${playlistId}/tracks`);
        return response.data;
      }
    );
  }, []);

  const invalidatePlaylistCache = useCallback((platform?: string) => {
    if (platform) {
      playlistCache.invalidatePattern(platform);
      trackCache.invalidatePattern(platform);
    } else {
      playlistCache.clear();
      trackCache.clear();
    }
  }, []);

  return {
    getPlaylists,
    getPlaylistTracks,
    invalidatePlaylistCache
  };
}

export function useConversionCache() {
  const getConversionStatus = useCallback(async (jobId: string) => {
    // Don't cache conversion status as it changes frequently
    const response = await axios.get(`/convert/${jobId}`);
    return response.data;
  }, []);

  const getConversionHistory = useCallback(async () => {
    return platformCache.getOrFetch(
      cacheKeys.conversionHistory(),
      async () => {
        const response = await axios.get('/convert/history');
        return response.data;
      }
    );
  }, []);

  const invalidateConversionHistory = useCallback(() => {
    platformCache.invalidate(cacheKeys.conversionHistory());
  }, []);

  return {
    getConversionStatus,
    getConversionHistory,
    invalidateConversionHistory
  };
}


export function useSyncCache() {
  const getSyncStatus = useCallback(async (jobId: string) => {
    // Don't cache sync status as it changes frequently
    const response = await axios.get(`/sync/${jobId}`);
    return response.data;
  }, []);

  const getSyncHistory = useCallback(async () => {
    return platformCache.getOrFetch(
      `sync_history`,
      async () => {
        const response = await axios.get('/sync/history');
        return response.data;
      }
    );
  }, []);

  const invalidateSyncHistory = useCallback(() => {
    platformCache.invalidate(`sync_history`);
  }, []);

  return {
    getSyncStatus,
    getSyncHistory,
    invalidateSyncHistory
  };
}


// Combined hook for all caching needs
export default function useApiCache() {
  const platforms = usePlatformCache();
  const playlists = usePlaylistCache();
  const conversions = useConversionCache();
  const syncs = useSyncCache();

  const clearAllCache = useCallback(() => {
    platformCache.clear();
    playlistCache.clear();
    trackCache.clear();
    syncCache.clear();
  }, []);

  return {
    platforms,
    playlists,
    conversions,
    syncs,
    clearAllCache
  };
}
