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
        className="flex items-center justify-between w-full px-6 py-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group"
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
            <span className="font-semibold text-purple-900 dark:text-purple-100 block truncate">
              {selectedPlaylist?.name || placeholder}
            </span>
            {selectedPlaylist?.track_count && (
              <span className="text-sm text-purple-600/70 dark:text-purple-400/70">
                {selectedPlaylist.track_count} tracks
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="px-4 py-3 text-purple-600/70 dark:text-purple-400/70 text-center">
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
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 transition-colors"
              >
                {playlist.image_url && (
                  <img
                    src={playlist.image_url}
                    alt={playlist.name}
                    className="w-6 h-6 object-cover rounded"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-purple-900 dark:text-purple-100 block truncate">
                    {playlist.name}
                  </span>
                  <span className="text-sm text-purple-600/70 dark:text-purple-400/70">
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
