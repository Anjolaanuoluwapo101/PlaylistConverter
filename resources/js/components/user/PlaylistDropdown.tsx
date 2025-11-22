import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  track_count?: number;
  image_url?: string;
}

interface PlaylistDropdownProps {
  playlists: Playlist[];
  selectedPlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  placeholder?: string;
}

const PlaylistDropdown: React.FC<PlaylistDropdownProps> = ({
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  placeholder = 'Select a playlist'
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedPlaylist?.image_url && (
            <img
              src={selectedPlaylist.image_url}
              alt={selectedPlaylist.name}
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <div className="text-left min-w-0 flex-1">
            <span className="block truncate">
              {selectedPlaylist?.name || placeholder}
            </span>
            {selectedPlaylist?.track_count && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlaylist.track_count} tracks
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
              No playlists available
            </div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  onSelectPlaylist(playlist.id);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {playlist.image_url && (
                  <img
                    src={playlist.image_url}
                    alt={playlist.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-gray-900 dark:text-white">
                    {playlist.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {playlist.track_count || 0} tracks
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistDropdown;