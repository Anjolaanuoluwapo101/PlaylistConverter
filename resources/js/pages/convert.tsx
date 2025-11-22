import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/user/PageHeader';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import useApiCache from '@/hooks/useApiCache';
import axios, { AxiosError } from 'axios';
import { Music, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NoPlatformsConnect from '@/components/user/NoPlatformsConnect';
import PlatformDropdown from '@/components/user/PlatformDropdown';
import PlaylistDropdown from '@/components/user/PlaylistDropdown';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  track_count?: number;
  image_url?: string;
}

interface ConversionJob {
  id: number;
  status: string;
  source_playlist: {
    id: string;
    name: string;
    platform: string;
  };
  target_platform: string;
  total_tracks: number;
  matched_tracks: number;
  failed_tracks: number;
  progress_percentage: number;
  target_playlist_id?: string;
  created_at: string;
}

const Convert: React.FC = () => {
  const { conversions: { getConversionHistory, invalidateConversionHistory } } = useApiCache();

  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [sourcePlatform, setSourcePlatform] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>('');
  const [sourcePlaylistId, setSourcePlaylistId] = useState<string>('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [converting, setConverting] = useState(false);
  const [conversionJob, setConversionJob] = useState<ConversionJob | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [targetPlaylistName, setTargetPlaylistName] = useState<string>('');
  const [targetPlaylistDescription, setTargetPlaylistDescription] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [platformsResult, historyResult] = await Promise.all([
          checkConnectedPlatforms(),
          getConversionHistory()
        ]);

        if (platformsResult && platformsResult.connected_platforms) {
          setConnectedPlatforms(platformsResult.connected_platforms);
          //set a default source platform
          setSourcePlatform(Object.values(platformsResult.connected_platforms)[0] as string)
          const connectedKeys = Object.keys(platformsResult.connected_platforms).filter(key => platformsResult.connected_platforms[key]);
          if (connectedKeys.length > 0) {
            setSourcePlatform(connectedKeys[0]);
            const otherPlatform = connectedKeys.find(key => key !== connectedKeys[0]);
            if (otherPlatform) {
              setTargetPlatform(otherPlatform);
            }
          }
        }

        if (historyResult.conversions) {
          setConversionHistory(historyResult.conversions);
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

  useEffect(() => {
    if (sourcePlatform) {
      fetchPlaylists(sourcePlatform);
    }
  }, [sourcePlatform]);

  const fetchPlaylists = async (platform: string) => {
    setFetchingPlaylists(true);
    setError(null);
    try {
      const response = await axios.get(`/playlists/${platform}?limit=50`);
      setPlaylists(response.data.data || []);
    } catch (err) {
      console.error(`Error fetching ${platform} playlists:`, err);
      setError(`Failed to fetch ${platform} playlists`);
      setPlaylists([]);
    } finally {
      setFetchingPlaylists(false);
    }
  };

  const handleConvert = async () => {
    if (!sourcePlatform || !targetPlatform || !sourcePlaylistId.trim()) {
      console.log('Please fill in all required fields')
      setError('Please fill in all required fields');
      return;
    }

    if (sourcePlatform === targetPlatform) {
      setError('Source and target platforms cannot be the same');
      return;
    }

    setConverting(true);
    setError(null);
    setConversionJob(null);

    try {
      const response = await axios.post('/convert', {
        source_playlist_id: sourcePlaylistId.trim(),
        source_platform: sourcePlatform,
        target_platform: targetPlatform,
        target_playlist_name: targetPlaylistName.trim() || undefined,
        target_playlist_description: targetPlaylistDescription.trim() || undefined,
      });

      setConversionJob(response.data.job);

      pollConversionStatus(response.data.job.id);

      invalidateConversionHistory();
    } catch (err) {
      console.error('Conversion error:', err);
      const errorData = (err as AxiosError)?.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : (errorData as { message?: string })?.message || 'Failed to start conversion';
      setError(errorMessage);
      setConverting(false);
    } finally {
      setConverting(false);
    }
  };

  const pollConversionStatus = async (jobId: number) => {
    const poll = async () => {
      try {
        const response = await axios.get(`/convert/${jobId}`);
        const job = response.data.job;
        setConversionJob(job);

        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, 10000);
        }
      } catch (err: unknown) {
        console.error('Error polling conversion status:', err);
      }
    };

    poll();
  };

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

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </MainLayout>
    );
  }

  const connectedPlatformKeys = Object.keys(connectedPlatforms).filter(key => connectedPlatforms[key]);

  return (
    <MainLayout>
      <Head title="Convert Playlists" />
      <PageHeader
        title="Convert Playlists"
        description="Convert your playlists between Spotify and YouTube Music"
      />

      {connectedPlatformKeys.length === 0 ? (
        <NoPlatformsConnect />
      ) : (
        <>
          {error && !converting && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            {/* Platform Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Platform
                </label>
                <PlatformDropdown
                  connectedPlatformKeys={connectedPlatformKeys}
                  selectedPlatform={sourcePlatform}
                  onSelectPlatform={(platform) => {
                    setSourcePlatform(platform);
                    setSourcePlaylistId('');
                    setPlaylists([]);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Platform
                </label>
                <PlatformDropdown
                  connectedPlatformKeys={connectedPlatformKeys}
                  selectedPlatform={targetPlatform}
                  onSelectPlatform={setTargetPlatform}
                />
              </div>
            </div>

            {/* Playlist Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playlist from {sourcePlatform}
              </label>
              {fetchingPlaylists ? (
                <div className="flex items-center justify-start">
                  <div className="animate-spin h-4 w-4 border-b-2 border-gray-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <PlaylistDropdown
                    playlists={playlists}
                    selectedPlaylistId={sourcePlaylistId.startsWith('http') ? '' : sourcePlaylistId}
                    onSelectPlaylist={setSourcePlaylistId}
                    placeholder="Select a playlist"
                  />

                  <div className="text-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste playlist URL (e.g., https://open.spotify.com/playlist/...)"
                    // value={sourcePlaylistId.startsWith('http') ? sourcePlaylistId : ''}
                    onChange={(e) => setSourcePlaylistId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Target Playlist Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Playlist Details (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Custom playlist name (leave empty for default)"
                  value={targetPlaylistName}
                  onChange={(e) => setTargetPlaylistName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Custom playlist description (leave empty for default)"
                  value={targetPlaylistDescription}
                  onChange={(e) => setTargetPlaylistDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Convert Button */}
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={converting || !sourcePlatform || !targetPlatform || !sourcePlaylistId.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting Conversion...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    Convert Playlist
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Conversion Status */}
          {conversionJob && (
            <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Conversion Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusDisplay(conversionJob.status).icon, {
                      className: `w-4 h-4 ${getStatusDisplay(conversionJob.status).color} ${conversionJob.status === 'processing' ? 'animate-spin' : ''}`
                    })}
                    <span className={`font-medium ${getStatusDisplay(conversionJob.status).color}`}>
                      {getStatusDisplay(conversionJob.status).text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Source:</span>
                  <span className="text-gray-900 dark:text-white">
                    {conversionJob.source_playlist.name} ({conversionJob.source_playlist.platform})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target:</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {conversionJob.target_platform}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                  <span className="text-gray-900 dark:text-white">
                    {conversionJob.matched_tracks} / {conversionJob.total_tracks} tracks
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${conversionJob.progress_percentage}%` }}
                  ></div>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {conversionJob.progress_percentage}% complete
                </div>

                {conversionJob.status === 'completed' && conversionJob.target_playlist_id && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Conversion completed successfully!</span>
                    </div>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                      Your playlist has been created on {conversionJob.target_platform}.
                    </p>
                  </div>
                )}

                {conversionJob.status === 'failed' && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Conversion failed</span>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      There was an error during conversion. Please try again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conversion History */}
          {conversionHistory.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Conversion History
              </h3>

              <div className="space-y-4">
                {conversionHistory.map((job) => (
                  <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {React.createElement(getStatusDisplay(job.status).icon, {
                          className: `w-4 h-4 ${getStatusDisplay(job.status).color} ${job.status === 'processing' ? 'animate-spin' : ''}`
                        })}
                        <span className={`font-medium ${getStatusDisplay(job.status).color}`}>
                          {getStatusDisplay(job.status).text}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">From:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {job.source_playlist.name} ({job.source_playlist.platform})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">To:</span>
                        <span className="ml-2 text-gray-900 dark:text-white capitalize">
                          {job.target_platform}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tracks:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {job.matched_tracks}/{job.total_tracks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Convert;