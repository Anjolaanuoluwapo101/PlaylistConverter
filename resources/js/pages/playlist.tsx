import { ConnectedPlatforms, Playlist as PlaylistType } from '@/types/index';
import { NavBarData } from '@/utils/global';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NavBar from '@/components/user/NavBar';
import PlaylistTracks from './tracks';
import ErrorState from '@/utils/ErrorState';
import LoadingState from '@/utils/LoadingState';
import EmptyPlaylistState from '@/utils/EmptyPlaylistState';
import NoPlatformsConnect from '@/utils/NoPlatformsConnect';
import PlatformDropdown from '@/utils/PlatformDropdown';
import ConfirmationModal from '@/utils/ConfirmationModal';
import PlaylistGrid from '@/utils/PlaylistGrid';



// --- Main Component ---

const Playlist: React.FC = () => {
  // --- State Management ---
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPlaylists, setShowPlaylists] = useState(true); //controls the visibility toggle between the playlists grid and track of a selected playlist
  const [playlistId, setPlaylistId] = useState<string | null>(null);

  // Selection and deletion state
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlaylists, setDeletingPlaylists] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    offset: 0,
    pageToken: null as string | null,
    hasMore: false,
    hasPrevious: false,
    total: 0
  });
  // --- Effects ---

  // Load connected platforms on initial render
  useEffect(() => {
    const loadConnectedPlatforms = async () => {
      try {
        const result: ConnectedPlatforms | null = await checkConnectedPlatforms();
        if (result && result.connected_platforms) {
          setConnectedPlatforms(result.connected_platforms);
          const connectedKeys = Object.keys(result.connected_platforms).filter(key => result.connected_platforms[key]);
          if (connectedKeys.length > 0) {
            setSelectedPlatform(connectedKeys[0]);
          }
        }
      } catch (err) {
        console.error('Error loading connected platforms:', err);
        setError('Failed to load connected platforms');
      } finally {
        setLoading(false);
      }
    };

    loadConnectedPlatforms();
  }, []);

  // Fetch playlists when a platform is selected
  useEffect(() => {
    if (selectedPlatform) {
      fetchPlaylists(selectedPlatform);
    }
  }, [selectedPlatform]);

  // Handle platform selection - reset view to show playlists
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setShowPlaylists(true);
    setPlaylistId(null);
    // Reset pagination when switching platforms
    setPagination({
      offset: 0,
      pageToken: null,
      hasMore: false,
      hasPrevious: false,
      total: 0
    });
  };

  // --- Data Fetching ---
  const fetchPlaylists = async (platform: string, offset?: number, pageToken?: string | null) => {
    setFetchingPlaylists(true);
    setError(null);
    try {
      let url = `/playlists/${platform}?limit=20`;
      if (platform === 'spotify' && offset !== undefined) {
        url += `&offset=${offset}`;
      } else if (platform === 'youtube' && pageToken) {
        url += `&page_token=${pageToken}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      // Update playlists
      setPlaylists(data.data || []);

      // Update pagination state
      setPagination({
        offset: data.offset || 0,
        pageToken: data.next_page_token || null,
        hasMore: data.has_more || false,
        hasPrevious: data.has_previous || false,
        total: data.total || 0
      });
    } catch (err) {
      console.error(`Error fetching ${platform} playlists:`, err);
      setError(`Failed to fetch ${platform} playlists`);
      setPlaylists([]);
    } finally {
      setFetchingPlaylists(false);
    }
  };

  // Pagination handlers
  const loadNextPage = () => {
    if (selectedPlatform === 'spotify' && pagination.offset !== null) {
      fetchPlaylists(selectedPlatform, pagination.offset + 20);
    } else if (selectedPlatform === 'youtube' && pagination.pageToken) {
      fetchPlaylists(selectedPlatform, undefined, pagination.pageToken);
    }
  };

  const loadPreviousPage = () => {
    if (selectedPlatform === 'spotify' && pagination.offset !== null && pagination.offset > 0) {
      fetchPlaylists(selectedPlatform, Math.max(0, pagination.offset - 20));
    } else if (selectedPlatform === 'youtube' && pagination.pageToken) {
      // For YouTube, we need to use prev_page_token from the response
      // This would require storing the previous token, but for simplicity we'll refetch from start
      fetchPlaylists(selectedPlatform);
    }
  };

  // --- Render Logic ---
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
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Your Playlists
          </h2>
          <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
            View and manage your playlists across connected platforms
          </p>
        </div>

        {connectedPlatformKeys.length === 0 ? (
          <NoPlatformsConnect />
        ) : (
          <>
            <div className="mb-8 flex justify-center">
              <PlatformDropdown
                connectedPlatformKeys={connectedPlatformKeys}
                selectedPlatform={selectedPlatform}
                onSelectPlatform={handlePlatformSelect}
              />
            </div>

            {fetchingPlaylists && <LoadingState />}
            {error && !fetchingPlaylists && <ErrorState error={error} onDismiss={() => setError(null)} />}
            {deleteSuccess && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-800 dark:text-green-200 font-medium">{deleteSuccess}</span>
                </div>
              </div>
            )}

            {!fetchingPlaylists && !error && playlists.length === 0 && selectedPlatform && (
              <EmptyPlaylistState platform={selectedPlatform} />
            )}

            {
              !fetchingPlaylists && !error && playlists.length > 0 && showPlaylists ? (
                <>
                  {/* Selection controls */}
                  {selectedPlaylists.length > 0 && (
                    <div className="mb-6 flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-900 dark:text-purple-100 font-medium">
                          {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          onClick={() => setSelectedPlaylists([])}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-sm underline"
                        >
                          Clear selection
                        </button>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </button>
                    </div>
                  )}

                  <PlaylistGrid
                    playlists={playlists}
                    platform={selectedPlatform}
                    selectedPlaylists={selectedPlaylists}
                    onSelectPlaylist={(playlistId) => {
                      setSelectedPlaylists(prev =>
                        prev.includes(playlistId)
                          ? prev.filter(id => id !== playlistId)
                          : [...prev, playlistId]
                      );
                    }}
                    onViewPlaylist={(playlistId) => {
                      setPlaylistId(playlistId);
                      setShowPlaylists(false);
                    }}
                  />

                  {/* Pagination Controls */}
                  {playlists.length > 0 && (
                    <div className="mt-8 flex justify-center items-center gap-4">
                      <button
                        onClick={loadPreviousPage}
                        disabled={!pagination.hasPrevious}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-purple-900 dark:text-purple-100">
                        Page {Math.floor(pagination.offset / 20) + 1}
                      </span>
                      <button
                        onClick={loadNextPage}
                        disabled={!pagination.hasMore}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) :
                (playlistId && !showPlaylists) && (
                  <div>
                    <PlaylistTracks playlistId={playlistId} platformId={selectedPlatform} onHide={() => setShowPlaylists(true)} />
                  </div>
                )
            }

            {/* Confirmation Modal */}
            <ConfirmationModal
              isOpen={showDeleteModal}
              title="Delete Playlists"
              message={`Are you sure you want to delete ${selectedPlaylists.length} playlist${selectedPlaylists.length !== 1 ? 's' : ''}? This action cannot be undone.`}
              confirmText={deletingPlaylists ? "Deleting..." : "Delete"}
              cancelText="Cancel"
              onConfirm={async () => {
                setDeletingPlaylists(true);
                setError(null);
                setDeleteSuccess(null);
                try {
                  await axios.delete(`/playlists/${selectedPlatform}`, {
                    data: { playlist_ids: selectedPlaylists }
                  });
                  // Refresh playlists after deletion
                  await fetchPlaylists(selectedPlatform);
                  setSelectedPlaylists([]);
                  setShowDeleteModal(false);
                  setDeleteSuccess(`Successfully deleted ${selectedPlaylists.length} playlist${selectedPlaylists.length !== 1 ? 's' : ''}`);
                  // Clear success message after 3 seconds
                  setTimeout(() => setDeleteSuccess(null), 3000);
                } catch (err) {
                  console.error('Error deleting playlists:', err);
                  setError('Failed to delete playlists');
                } finally {
                  setDeletingPlaylists(false);
                }
              }}
              onCancel={() => setShowDeleteModal(false)}
              disabled={deletingPlaylists}
            />
          </>
        )
        }
      </div>
    </>

  );
};

export default Playlist;