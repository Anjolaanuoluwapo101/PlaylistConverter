import React, { useState, useEffect } from 'react';
import { NavBarData } from '@/utils/global';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import  useApiCache from '@/hooks/useApiCache';
import axios, { AxiosError } from 'axios';
import { ArrowLeftRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NavBar from '@/components/user/NavBar';
import LoadingState from '@/utils/LoadingState';
import NoPlatformsConnect from '@/utils/NoPlatformsConnect';
import PlatformDropdown from '@/utils/PlatformDropdown';
import PlaylistDropdown from '@/utils/PlaylistDropdown';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  track_count?: number;
  image_url?: string;
}

interface SyncJob {
  id: number;
  status: string;
  source_playlist_id: string;
  target_playlist_id: string;
  source_platform: string;
  target_platform: string;
  remove_extras: boolean;
  results?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const Sync: React.FC = () => {
  const { syncs: { getSyncHistory }, conversions :{ getConversionHistory} } = useApiCache();

  // State management
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [sourcePlatform, setSourcePlatform] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>('');
  const [sourcePlaylistId, setSourcePlaylistId] = useState<string>('');
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('');
  const [sourcePlaylists, setSourcePlaylists] = useState<Playlist[]>([]);
  const [targetPlaylists, setTargetPlaylists] = useState<Playlist[]>([]);
  const [fetchingSourcePlaylists, setFetchingSourcePlaylists] = useState(false);
  const [fetchingTargetPlaylists, setFetchingTargetPlaylists] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncJob, setSyncJob] = useState<SyncJob | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removeExtras, setRemoveExtras] = useState(false);
  const [useQueue, setUseQueue] = useState(false);

  // Load connected platforms and sync history on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [platformsResult, historyResult] = await Promise.all([
          checkConnectedPlatforms(),
          getSyncHistory()
        ]);

        if (platformsResult && platformsResult.connected_platforms) {
          setConnectedPlatforms(platformsResult.connected_platforms);
          const connectedKeys = Object.keys(platformsResult.connected_platforms).filter(key => platformsResult.connected_platforms[key]);
          if (connectedKeys.length > 0) {
            setSourcePlatform(connectedKeys[0]);
            // Set target to the other platform if available
            const otherPlatform = connectedKeys.find(key => key !== connectedKeys[0]);
            if (otherPlatform) {
              setTargetPlatform(otherPlatform);
            }
          }
        }

        if (historyResult.syncs) {
          setSyncHistory(historyResult.syncs);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [getConversionHistory]);

  // Fetch playlists when source platform changes
  useEffect(() => {
    if (sourcePlatform) {
      fetchPlaylists(sourcePlatform, 'source');
    }
  }, [sourcePlatform]);

  // Fetch playlists when target platform changes
  useEffect(() => {
    if (targetPlatform) {
      fetchPlaylists(targetPlatform, 'target');
    }
  }, [targetPlatform]);

  // Fetch playlists for the selected platform
  const fetchPlaylists = async (platform: string, type: 'source' | 'target') => {
    const setFetching = type === 'source' ? setFetchingSourcePlaylists : setFetchingTargetPlaylists;
    const setPlaylists = type === 'source' ? setSourcePlaylists : setTargetPlaylists;

    setFetching(true);
    setError(null);
    try {
      const response = await axios.get(`/playlists/${platform}?limit=50`);
      setPlaylists(response.data.data || []);
    } catch (err) {
      console.error(`Error fetching ${platform} playlists:`, err);
      setError(`Failed to fetch ${platform} playlists`);
      setPlaylists([]);
    } finally {
      setFetching(false);
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (!sourcePlatform || !targetPlatform || !sourcePlaylistId.trim() || !targetPlaylistId.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // if (sourcePlaylistId.trim() === targetPlaylistId.trim()) {
    //   setError('Source and target playlists cannot be the same');
    //   return;
    // }

    setSyncing(true);
    setError(null);
    setSyncJob(null);

    try {
      const endpoint = useQueue ? '/sync/queued' : '/sync';
      const response = await axios.post(endpoint, {
        source_playlist_id: sourcePlaylistId.trim(),
        source_platform: sourcePlatform,
        target_playlist_id: targetPlaylistId.trim(),
        target_platform: targetPlatform,
        remove_extras: removeExtras,
      });

      if (useQueue) {
        // For queued sync, create a job object from the response
        const job: SyncJob = {
          id: response.data.job_id,
          status: 'pending',
          source_playlist_id: sourcePlaylistId.trim(),
          target_playlist_id: targetPlaylistId.trim(),
          source_platform: sourcePlatform,
          target_platform: targetPlatform,
          remove_extras: removeExtras,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSyncJob(job);
        // Start polling for status updates
        pollSyncStatus(job.id);
      } else {
        // For immediate sync, use the returned job
        setSyncJob(response.data.job);
        // Refresh sync history
        const historyResult = await getSyncHistory();
        if (historyResult.syncs) {
          setSyncHistory(historyResult.syncs);
        }
      }
    } catch (err) {
      console.error('Sync error:', err);
      const errorData = (err as AxiosError)?.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : (errorData as { message?: string })?.message || 'Failed to start sync';
      setError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  // Poll for sync status updates
  const pollSyncStatus = async (jobId: number) => {
    console.log("Starting to poll sync status for job ID:", jobId);
    const poll = async () => {
      try {
        const response = await axios.get(`/sync/status/${jobId}`);
        const job = response.data.job;
        setSyncJob(job);

        // Continue polling if not completed or failed
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          // Refresh sync history when job completes
          const historyResult = await getSyncHistory();
          if (historyResult.syncs) {
            setSyncHistory(historyResult.syncs);
          }
        }
      } catch (err: unknown) {
        console.error('Error polling sync status:', err);
        const errorData = (err as AxiosError)?.response?.data;
        const errorMessage = typeof errorData === 'string' ? errorData : (errorData as { message?: string })?.message || 'Failed to poll sync status';
        setError(errorMessage);
      }
    };

    poll();
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', icon: Loader2, text: 'Pending' };
      case 'processing':
        return { color: 'text-blue-600', icon: Loader2, text: 'Processing' };
      case 'completed':
        return { color: 'text-green-600', icon: CheckCircle, text: 'Completed' };
      case 'failed':
        return { color: 'text-red-600', icon: AlertCircle, text: 'Failed' };
      default:
        return { color: 'text-gray-600', icon: AlertCircle, text: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const connectedPlatformKeys = Object.keys(connectedPlatforms).filter(key => connectedPlatforms[key]);

  return (
    <>
      <NavBar items={NavBarData} />
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Sync Playlists
          </h2>
          <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
            Keep your playlists synchronized across platforms
          </p>
        </div>

        {connectedPlatformKeys.length === 0 ? (
          <NoPlatformsConnect />
        ) : (
          <>
            {error && !syncing && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
              {/* Platform Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Source Platform
                  </label>
                  <PlatformDropdown
                    connectedPlatformKeys={connectedPlatformKeys}
                    selectedPlatform={sourcePlatform}
                    onSelectPlatform={(platform) => {
                      setSourcePlatform(platform);
                      setSourcePlaylistId('');
                      setSourcePlaylists([]);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Target Platform
                  </label>
                  <PlatformDropdown
                    connectedPlatformKeys={connectedPlatformKeys}
                    selectedPlatform={targetPlatform}
                    onSelectPlatform={(platform) => {
                      setTargetPlatform(platform);
                      setTargetPlaylistId('');
                      setTargetPlaylists([]);
                    }}
                  />
                </div>
              </div>

              {/* Playlist Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Source Playlist
                  </label>
                  {fetchingSourcePlaylists ? (
                    <LoadingState />
                  ) : (
                    <PlaylistDropdown
                      playlists={sourcePlaylists}
                      selectedPlaylistId={sourcePlaylistId}
                      onSelectPlaylist={setSourcePlaylistId}
                      placeholder="Select source playlist"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Target Playlist
                  </label>
                  {fetchingTargetPlaylists ? (
                    <LoadingState />
                  ) : (
                    <PlaylistDropdown
                      playlists={targetPlaylists}
                      selectedPlaylistId={targetPlaylistId}
                      onSelectPlaylist={setTargetPlaylistId}
                      placeholder="Select target playlist"
                    />
                  )}
                </div>
              </div>

              {/* Sync Options */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="removeExtras"
                    checked={removeExtras}
                    onChange={(e) => setRemoveExtras(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="removeExtras" className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Remove tracks from target playlist that are not in source playlist
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useQueue"
                    checked={useQueue}
                    onChange={(e) => setUseQueue(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="useQueue" className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Queue sync for background processing (recommended for large playlists)
                  </label>
                </div>
              </div>

              {/* Sync Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSync}
                  disabled={syncing || !sourcePlatform || !targetPlatform || !sourcePlaylistId.trim() || !targetPlaylistId.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {useQueue ? 'Queueing Sync...' : 'Syncing...'}
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-5 h-5" />
                      {useQueue ? 'Queue Sync' : 'Sync Now'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sync Status */}
            {syncJob && (
              <div className="mt-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                  Sync Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Status:</span>
                    <div className="flex items-center gap-2">
                      {React.createElement(getStatusDisplay(syncJob.status).icon, {
                        className: `w-5 h-5 ${getStatusDisplay(syncJob.status).color} ${syncJob.status === 'processing' ? 'animate-spin' : ''}`
                      })}
                      <span className={`font-semibold ${getStatusDisplay(syncJob.status).color}`}>
                        {getStatusDisplay(syncJob.status).text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Source:</span>
                    <span className="text-purple-900 dark:text-purple-100 capitalize">
                      {syncJob.source_platform}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Target:</span>
                    <span className="text-purple-900 dark:text-purple-100 capitalize">
                      {syncJob.target_platform}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Remove Extras:</span>
                    <span className="text-purple-900 dark:text-purple-100">
                      {syncJob.remove_extras ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {syncJob.status === 'completed' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Sync completed successfully!</span>
                      </div>
                      <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                        Your playlists have been synchronized.
                      </p>
                    </div>
                  )}

                  {syncJob.status === 'failed' && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Sync failed</span>
                      </div>
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        There was an error during sync. Please try again.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync History */}
            {syncHistory.length > 0 && (
              <div className="mt-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                  Sync History
                </h3>

                <div className="space-y-4">
                  {syncHistory.slice(0, 10).map((job) => (
                    <div key={job.id} className="border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-4 bg-purple-50/50 dark:bg-purple-900/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {React.createElement(getStatusDisplay(job.status).icon, {
                            className: `w-4 h-4 ${getStatusDisplay(job.status).color} ${job.status === 'processing' ? 'animate-spin' : ''}`
                          })}
                          <span className={`font-semibold ${getStatusDisplay(job.status).color}`}>
                            {getStatusDisplay(job.status).text}
                          </span>
                        </div>
                        <span className="text-sm text-purple-600/70 dark:text-purple-400/70">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-purple-700 dark:text-purple-300">From:</span>
                          <span className="ml-2 text-purple-900 dark:text-purple-100 capitalize">
                            {job.source_platform}
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-700 dark:text-purple-300">To:</span>
                          <span className="ml-2 text-purple-900 dark:text-purple-100 capitalize">
                            {job.target_platform}
                          </span>
                        </div>
                      </div>

                      {job.status === 'completed' && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Sync completed successfully
                        </div>
                      )}

                      {job.status === 'failed' && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          ✗ Sync failed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Sync;
