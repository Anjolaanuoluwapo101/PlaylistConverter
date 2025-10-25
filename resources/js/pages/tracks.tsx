import React, { useState, useEffect } from 'react';
import { Music, Trash2, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import ErrorState from '@/utils/ErrorState';
import FilterControls from '@/utils/FilterControls';
import ConfirmationModal from '@/utils/ConfirmationModal';
import WarningComponent from '@/utils/WarningComponent';

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

export interface Playlist {
  id: string;
  name: string;
  // Add other playlist properties as needed
}

interface PlaylistTracksProps {
  playlistId: string;
  platformId: string;
  onHide: () => void;
}

const PlaylistTracks: React.FC<PlaylistTracksProps> = ({ playlistId, platformId, onHide }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection and deletion state
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<string>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [applyingFilters, setApplyingFilters] = useState(false);


  // Pagination state
  const [pagination, setPagination] = useState({
    offset: 0,
    pageToken: null as string | null,
    hasMore: false,
    hasPrevious: false,
    total: 0
  });

  const fetchTracks = async (offset?: number, pageToken?: string | null, sortByParam?: string, orderParam?: string) => {
    try {
      setIsLoading(true);
      let url = `/playlists/${platformId}/${playlistId}/tracks?limit=20`;
      if (platformId === 'spotify' && offset !== undefined) {
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
        hasMore: data.tracks.has_more || false,
        hasPrevious: data.tracks.has_previous || false,
        total: data.tracks.total || 0
      });

      setIsLoading(false);
    } catch {
      setError('Failed to load tracks');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [playlistId, platformId]);

  // Handle applying filters
  const handleApplyFilters = () => {
    setApplyingFilters(true);
    fetchTracks(undefined, undefined, sortBy, order).finally(() => {
      setApplyingFilters(false);
    });
  };

  // Pagination handlers
  const loadNextPage = () => {
    if (platformId === 'spotify' && pagination.offset !== null) {
      fetchTracks(pagination.offset + 20);
    } else if (platformId === 'youtube' && pagination.pageToken) {
      fetchTracks(undefined, pagination.pageToken);
    }
  };

  const loadPreviousPage = () => {
    if (platformId === 'spotify' && pagination.offset !== null && pagination.offset > 0) {
      fetchTracks(Math.max(0, pagination.offset - 20));
    } else if (platformId === 'youtube' && pagination.pageToken) {
      // For YouTube, we need to use prev_page_token from the response
      // This would require storing the previous token, but for simplicity we'll refetch from start
      fetchTracks();
    }
  };

  if (isLoading) return (
    <div className="playlist-tracks w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-purple-600 dark:text-purple-400 font-medium">Loading tracks...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <ErrorState error={error} onDismiss={() => setError(null)} />
  );
  

  return (
    <div className="playlist-tracks w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Playlist Tracks
        </h2>
        <button
          onClick={onHide}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Hide
        </button>
      </div>

      {/* Warning for playlists created by others */}
      <WarningComponent message="Playlists created by another person cannot be modified." />

      {/* Filter Controls */}
      <FilterControls
        sortBy={sortBy}
        order={order}
        onSortByChange={setSortBy}
        onOrderChange={setOrder}
        onApplyFilters={handleApplyFilters}
        sortOptions={[
          { value: 'name', label: 'Title' },
          { value: 'artist', label: 'Artist' },
          { value: 'date', label: 'Date added' },
          { value: 'duration', label: 'Duration' }
        ]}
        isLoading={applyingFilters}
      />

      {/* Selection controls, at the top of the tracks*/}
      {selectedTracks.length > 0 && (
        <div className="mb-6 flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-purple-900 dark:text-purple-100 font-medium">
              {selectedTracks.length} track{selectedTracks.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedTracks([])}
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

      <div className="tracks-list space-y-6">
        {tracks.map(track => (
          <div key={track.id} className="track-item relative flex items-center gap-4 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Selection checkbox */}
            <div className="absolute top-3 right-3 z-10 select-checkbox">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTracks(prev =>
                    prev.includes(track.id)
                      ? prev.filter(id => id !== track.id)
                      : [...prev, track.id]
                  );
                }}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedTracks.includes(track.id)
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white/80 dark:bg-neutral-800/80 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
                }`}
              >
                {selectedTracks.includes(track.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              </button>
            </div>

            <div className="w-16 h-16 flex-shrink-0">
              {track.image ? (
                <img src={track.image} alt={track.title} className="w-full h-full object-cover rounded-xl shadow-md" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-900 rounded-xl flex items-center justify-center">
                  <Music className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              )}
            </div>
            <div className="track-info flex-grow">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 line-clamp-1">{track.title}</h3>
              <p className="text-purple-700 dark:text-purple-300 line-clamp-1">{track.artist}</p>
              <p className="text-purple-600/80 dark:text-purple-400/80 text-sm line-clamp-1">{track.album}</p>
              <p className="text-purple-500/70 dark:text-purple-500/70 text-sm">
                {track.duration_ms ? Math.floor(track.duration_ms / 60000)  + ':' : "Duration not availabale"}{ track.duration_ms ? ((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0') : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {tracks.length > 0 && (
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Tracks"
        message={`Are you sure you want to delete ${selectedTracks.length} track${selectedTracks.length !== 1 ? 's' : ''} from this playlist? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          setError(null);
          setDeleteSuccess(null);
          try {
            await axios.delete(`/playlists/${platformId}/${playlistId}/tracks`, {
              data: { track_ids: selectedTracks }
            });
            // Refresh tracks after deletion
            fetchTracks();
            setSelectedTracks([]);
            setShowDeleteModal(false);
            setDeleteSuccess(`Successfully deleted ${selectedTracks.length} track${selectedTracks.length !== 1 ? 's' : ''}`);
            // Clear success message after 3 seconds
            setTimeout(() => setDeleteSuccess(null), 3000);
          } catch (err) {
            console.error('Error deleting tracks:', err);
            setError('Failed to delete tracks');
            throw err; // Re-throw to trigger error state in modal
          }
        }}
        onCancel={() => setShowDeleteModal(false)}
        showSuccess={!!deleteSuccess}
        successMessage={deleteSuccess || "Operation completed successfully!"}
        showError={!!error && error === 'Failed to delete tracks'}
        errorMessage={error === 'Failed to delete tracks' ? error : "An error occurred. Please try again."}
      />
    </div>
  );
};

export default PlaylistTracks;