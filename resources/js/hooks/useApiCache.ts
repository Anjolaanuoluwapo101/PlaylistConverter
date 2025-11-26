import { useCallback } from 'react';
import { platformCache, playlistCache, trackCache, syncCache, cacheKeys } from '../utils/apiCache';
import axios from 'axios';


export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  image?: string;
  duration_ms: number;
}

export interface TracksResponse {
  tracks: {
    items: Track[];
    count: number;
    offset?: number;
    next_page_token?: string | null;
    prev_page_token?: string | null;
    has_more?: boolean;
    has_previous?: boolean;
    total?: number;
  };
  count: number;
  offset?: number;
  next_page_token?: string | null;
  prev_page_token?: string | null;
  has_more?: boolean;
  has_previous?: boolean;
  total?: number;
}


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

  

  const getPlaylistTracks = useCallback(async (setError: (error: string) => void, setIsLoading: (isLoading: boolean) => void, setPagination: (pagination: any) => void, setTracks: (tracks: any[]) => void, platformId: string, playlistId: string, limit: number = 20, offset: number | null = null, pageToken: string | null = null, sortByParam: string | null = null, orderParam: string | null = null) => {
    setIsLoading(true);
    try {
      let url = `/playlists/${platformId}/${playlistId}/tracks?limit=${limit}`
      if (platformId === 'spotify' && offset !== null) {
        url += `&offset=${offset}`;
      } else if (platformId === 'youtube' && pageToken) {
        url += `&page_token=${pageToken}`;
      }

      // Add sorting parameters
      if (sortByParam) {
        url += `&sort_by=${sortByParam}`;
      }
      if (orderParam) {
        url += `&order=${orderParam}`;
      }

      return trackCache.getOrFetch(
        cacheKeys.playlistTracks(platformId, playlistId),
        async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch tracks');
          }
          const data: TracksResponse = await response.json();
          setTracks(data.tracks.items);

          // Update pagination state
          setPagination({
            offset: offset || 0,
            pageToken: pageToken || null,
            prevPageToken: data.tracks.prev_page_token || null,
            hasMore: data.tracks.has_more || false,
            hasPrevious: data.tracks.has_previous || false,
            total: data.tracks.total || 0
          });

          setIsLoading(false);
        }
      );
    } catch (error) {
      setError('Failed to load tracks');
      setIsLoading(false);
    }
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
