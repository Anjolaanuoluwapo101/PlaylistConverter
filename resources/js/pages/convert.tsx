import React, { useState, useEffect } from 'react';
import { NavBarData } from '@/utils/global';
import PageHeader from '@/components/user/PageHeader';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import  useApiCache  from '@/hooks/useApiCache';
import axios, { AxiosError } from 'axios';
import { Music, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NavBar from '@/components/user/NavBar';
import Footer from '@/components/user/Footer';
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

  // State management
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

  // Load connected platforms and conversion history on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [platformsResult, historyResult] = await Promise.all([
          checkConnectedPlatforms(),
          getConversionHistory()
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

  // Fetch playlists when source platform changes
  useEffect(() => {
    if (sourcePlatform) {
      fetchPlaylists(sourcePlatform);
    }
  }, [sourcePlatform]);

  // Fetch playlists for the selected platform
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

  // Handle conversion
  const handleConvert = async () => {
    if (!sourcePlatform || !targetPlatform || !sourcePlaylistId.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (sourcePlatform === targetPlatform) {
      setError('Source and target platforms cannot be the same');
      return;
    }

    setConverting(true);
    setError(null);
    setConversionJob(null); // Clear previous conversion status until new updates are pulled

    try {
      const response = await axios.post('/convert', {
        source_playlist_id: sourcePlaylistId.trim(),
        source_platform: sourcePlatform,
        target_platform: targetPlatform,
        target_playlist_name: targetPlaylistName.trim() || undefined,
        target_playlist_description: targetPlaylistDescription.trim() || undefined,
      }); //since backend is not currently utilizing queued conversion, we call the normal convert endpoint
      
      setConversionJob(response.data.job);
      
      // Start polling for status updates without setting the job initially
      pollConversionStatus(response.data.job.id);

      // Invalidate conversion history cache after starting a new conversion
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

  // Poll for conversion status updates
  const pollConversionStatus = async (jobId: number) => {
    console.log("Starting to poll conversion status for job ID:", jobId);
    const poll = async () => {
      try {
        const response = await axios.get(`/convert/${jobId}`);
        const job = response.data.job;
        setConversionJob(job);

        // Continue polling if not completed or failed
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, 10000); // Poll every 2 seconds
        }
      } catch (err: unknown) {
        console.error('Error polling conversion status:', err);
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
  console.log("Connected platforms----- ", JSON.stringify(connectedPlatforms));
  const connectedPlatformKeys = Object.keys(connectedPlatforms).filter(key => connectedPlatforms[key]);
  console.log("Connected platforms:", connectedPlatformKeys);
  return (
    <>
      <NavBar items={NavBarData} />
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <PageHeader
          title="Convert Playlists"
          description="Convert your playlists between Spotify and YouTube Music"
        />

        {connectedPlatformKeys.length === 0 ? (
          <NoPlatformsConnect />
        ) : (
          <>
            {error && !converting && (
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
                      setPlaylists([]);
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
                    onSelectPlatform={setTargetPlatform}
                  />
                </div>
              </div>

              {/* Playlist Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Playlist
                </label>
                {fetchingPlaylists ? (
                  <LoadingState />
                ) : (
                  <div className="space-y-3">
                    <PlaylistDropdown
                      playlists={playlists}
                      selectedPlaylistId={sourcePlaylistId.startsWith('http') ? '' : sourcePlaylistId}
                      onSelectPlaylist={setSourcePlaylistId}
                      placeholder="Select a playlist"
                    />

                    <div className="text-center">
                      <span className="text-purple-600/70 dark:text-purple-400/70 text-sm">or</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Paste playlist URL (e.g., https://open.spotify.com/playlist/...)"
                      value={sourcePlaylistId.startsWith('http') ? sourcePlaylistId : ''}
                      onChange={(e) => setSourcePlaylistId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all "
                    />
                  </div>
                )}
              </div>

              {/* Target Playlist Details */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Target Playlist Details (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Custom playlist name (leave empty for default)"
                    value={targetPlaylistName}
                    onChange={(e) => setTargetPlaylistName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <textarea
                    placeholder="Custom playlist description (leave empty for default)"
                    value={targetPlaylistDescription}
                    onChange={(e) => setTargetPlaylistDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* Convert Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  disabled={converting || !sourcePlatform || !targetPlatform || !sourcePlaylistId.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  {converting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting Conversion...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5" />
                      Convert Playlist
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Conversion Status */}
            {conversionJob && (
              <div className="mt-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                  Conversion Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Status:</span>
                    <div className="flex items-center gap-2">
                      {React.createElement(getStatusDisplay(conversionJob.status).icon, {
                        className: `w-5 h-5 ${getStatusDisplay(conversionJob.status).color} ${conversionJob.status === 'processing' ? 'animate-spin' : ''}`
                      })}
                      <span className={`font-semibold ${getStatusDisplay(conversionJob.status).color}`}>
                        {getStatusDisplay(conversionJob.status).text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Source:</span>
                    <span className="text-purple-900 dark:text-purple-100">
                      {conversionJob.source_playlist.name} ({conversionJob.source_playlist.platform})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Target:</span>
                    <span className="text-purple-900 dark:text-purple-100 capitalize">
                      {conversionJob.target_platform}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Progress:</span>
                    <span className="text-purple-900 dark:text-purple-100">
                      {conversionJob.matched_tracks} / {conversionJob.total_tracks} tracks
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${conversionJob.progress_percentage}%` }}
                    ></div>
                  </div>

                  <div className="text-center text-sm text-purple-600/70 dark:text-purple-400/70">
                    {conversionJob.progress_percentage}% complete
                  </div>

                  {conversionJob.status === 'completed' && conversionJob.target_playlist_id && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Conversion completed successfully!</span>
                      </div>
                      <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                        Your playlist has been created on {conversionJob.target_platform}.
                      </p>
                    </div>
                  )}

                  {conversionJob.status === 'failed' && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Conversion failed</span>
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
              <div className="mt-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                  Conversion History
                </h3>

                <div className="space-y-4">
                  {conversionHistory.map((job) => (
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-purple-700 dark:text-purple-300">From:</span>
                          <span className="ml-2 text-purple-900 dark:text-purple-100">
                            {job.source_playlist.name} ({job.source_playlist.platform})
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-700 dark:text-purple-300">To:</span>
                          <span className="ml-2 text-purple-900 dark:text-purple-100 capitalize">
                            {job.target_platform}
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-700 dark:text-purple-300">Tracks:</span>
                          <span className="ml-2 text-purple-900 dark:text-purple-100">
                            {job.matched_tracks}/{job.total_tracks}
                          </span>
                        </div>
                      </div>

                      {job.status === 'completed' && (
                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Conversion completed successfully
                        </div>
                      )}

                      {job.status === 'failed' && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          ✗ Conversion failed
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
      <Footer />
    </>
  );
};

export default Convert;
