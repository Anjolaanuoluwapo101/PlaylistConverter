import { ConnectedPlatforms, Playlist as PlaylistType } from '@/types/index';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PlaylistTracks from './tracks';

import EmptyPlaylistState from '@/components/user/EmptyPlaylistState';
import NoPlatformsConnect from '@/components/user/NoPlatformsConnect';
import PlatformDropdown from '@/components/user/PlatformDropdown';
import ConfirmationModal from '@/components/user/ConfirmationModal';
import PlaylistGrid from '@/components/user/PlaylistGrid';
import FilterControls from '@/components/user/FilterControls';
import AlertComponent from '@/components/user/AlertComponent';
import PageHeader from '@/components/user/PageHeader';
import MainLayout from '@/layouts/MainLayout';

// --- Main Component ---

const Playlist: React.FC = () => {
  // --- State Management ---
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPlaylists, setShowPlaylists] = useState(true);
  const [playlistId, setPlaylistId] = useState<string | null>(null);

  // Selection and deletion state
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [applyingFilters, setApplyingFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    offset: 0,
    pageToken: null as string | null,
    prevPageToken: null as string | null,
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
      prevPageToken: null,
      hasMore: false,
      hasPrevious: false,
      total: 0
    });
  };

  // --- Data Fetching ---
  const fetchPlaylists = async (platform: string, offset?: number, pageToken?: string | null, sortByParam?: string, orderParam?: string) => {
    setFetchingPlaylists(true);
    setError(null);
    try {
      let url = `/playlists/${platform}?limit=20`;
      if (platform === 'spotify' && offset !== undefined) {
        url += `&offset=${offset}`;
      } else if (platform === 'youtube' && pageToken) {
        url += `&page_token=${pageToken}`;
      }

      // Add sorting parameters
      if (sortByParam) {
        url += `&sort_by=${sortByParam}`;
      }
      if (orderParam) {
        url += `&order=${orderParam}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      // Update playlists
      setPlaylists(data.data || []);

      // Update pagination state
      setPagination({
        offset: data.offset || 0,
        pageToken: data.next_page_token || null,
        prevPageToken: data.prev_page_token || null,
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
      //So that Error set by catch block is visible for few seconds
      setTimeout( () => { 
        setError(null);
      }, 2500 )
    }
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    setApplyingFilters(true);
    fetchPlaylists(selectedPlatform, undefined, undefined, sortBy, order).finally(() => {
      setApplyingFilters(false);
    });
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
    } else if (selectedPlatform === 'youtube' && pagination.prevPageToken) {
      fetchPlaylists(selectedPlatform, undefined, pagination.prevPageToken);
    }
  };

  // Playlist handlers
  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleViewPlaylist = (playlistId: string) => {
    setPlaylistId(playlistId);
    setShowPlaylists(false);
  };

  // --- Render Logic ---

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-gray-500"></div>
        </div>
      </MainLayout>
    );
  }

  const connectedPlatformKeys = Object.keys(connectedPlatforms).filter(key => connectedPlatforms[key]);

  // No connected platforms
  if (connectedPlatformKeys.length === 0) {
    return (
      <MainLayout>
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
          <NoPlatformsConnect />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* <div className="w-full max-w-6xl mx-auto p-4 md:p-6"> */}
        {/* Header Section */}
        <PageHeader
          title="Your Playlists"
          description="View and manage your playlists across connected platforms"
        />

        {/* Platform Selection */}
        <div className="mb-8 flex justify-center">
          <PlatformDropdown
            connectedPlatformKeys={connectedPlatformKeys}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={handlePlatformSelect}
          />
        </div>

        {/* Status Messages  for success delete or error*/}
        {deleteSuccess && (
          <AlertComponent message={deleteSuccess} type="success" />
        )}

        <AlertComponent message="Playlists created by another person cannot be modified." type="info" />

        {error && !fetchingPlaylists && <AlertComponent message={error} type='error' />}


        {/* Main Content */}

        {/* Playlists View */}
        {selectedPlatform && showPlaylists && (
          <>

            {/* Filter Controls */}
            <div className="mb-6">
              <FilterControls
                sortBy={sortBy}
                order={order}
                onSortByChange={setSortBy}
                onOrderChange={setOrder}
                onApplyFilters={handleApplyFilters}
                sortOptions={[
                  { value: 'name', label: 'Name' },
                  { value: 'tracks', label: 'Track Count' },
                  { value: 'date', label: 'Created Date' }
                ]}
                isLoading={applyingFilters}
              />
            </div>

            {/* Selection Controls */}
            {selectedPlaylists.length > 0 && !fetchingPlaylists && (
              <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-800 font-medium">
                    {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedPlaylists([])}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Clear selection
                  </button>
                </div>
                <button
                  onClick={() => {
                    setDeleteSuccess(null);
                    setError(null);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Loading Skeleton or Playlist Grid */}
            {fetchingPlaylists ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="border border-gray-200 p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 w-3/4"></div>
                      <div className="h-4 bg-gray-100 w-1/2"></div>
                      <div className="h-4 bg-gray-100 w-2/3"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="w-6 h-6 bg-gray-200"></div>
                      <div className="w-20 h-8 bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !error && playlists.length > 0 ? (
              <>
                <PlaylistGrid
                  playlists={playlists}
                  platform={selectedPlatform}
                  selectedPlaylists={selectedPlaylists}
                  onSelectPlaylist={handleSelectPlaylist}
                  onViewPlaylist={handleViewPlaylist}
                />

                {/* Pagination Controls */}
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={loadPreviousPage}
                    disabled={!pagination.hasPrevious}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-800">
                    Page {Math.floor(pagination.offset / 20) + 1}
                  </span>
                  <button
                    onClick={loadNextPage}
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : null}

            {selectedPlatform && !fetchingPlaylists && !error && playlists.length === 0 && (
              <EmptyPlaylistState platform={selectedPlatform} />
            )}
          </>
        )}

        {/* Tracks View */}
        {playlistId && !showPlaylists && (
          <PlaylistTracks
            playlistId={playlistId}
            platformId={selectedPlatform}
            onHide={() => setShowPlaylists(true)}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Playlists"
          message={`Are you sure you want to delete ${selectedPlaylists.length} playlist${selectedPlaylists.length !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            setError(null);
            setDeleteSuccess(null);
            try {
              await axios.delete(`/playlists/${selectedPlatform}`, {
                data: { playlist_ids: selectedPlaylists }
              });
              // Refresh playlists after deletion
              await fetchPlaylists(selectedPlatform);
              setSelectedPlaylists([]);
              // setShowDeleteModal(false);
              setDeleteSuccess(`Successfully deleted ${selectedPlaylists.length} playlist${selectedPlaylists.length !== 1 ? 's' : ''}`);
              // Clear success message after 3 seconds
              setTimeout(() => setDeleteSuccess(null), 3000);
            } catch (err) {
              console.error('Error deleting playlists:', err);
              setError('Failed to delete playlists');
              throw err; // Re-throw to trigger error state in modal
            }
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteSuccess(null);
            setError(null);
          }}
          showSuccess={!!deleteSuccess}
          successMessage={deleteSuccess || "Operation completed successfully!"}
          showError={error === 'Failed to delete playlists'}
          errorMessage={error === 'Failed to delete playlists' ? error : "An error occurred. Please try again."}
        />
      {/* </div> */}
    </MainLayout>
  );
};

export default Playlist;
