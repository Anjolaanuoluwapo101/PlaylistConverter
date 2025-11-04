import React from 'react';
import { ListMusic, CheckSquare, Square } from 'lucide-react';
import { Playlist as PlaylistType } from '@/types/index';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: () => <span>🎵</span>, // Placeholder, you can import actual icons
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: () => <span>▶</span>, // Placeholder, you can import actual icons
  },
];

const getPlatformConfig = (platformKey: string) => {
  return PLATFORM_CONFIG.find(config => config.key === platformKey);
};

interface PlaylistCardProps {
  playlist: PlaylistType;
  platform: string;
  isSelected: boolean;
  onSelect: (playlistId: string) => void;
  onView: (playlistId: string) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, platform, isSelected, onSelect, onView }) => {
  const selectedConfig = getPlatformConfig(platform);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.select-checkbox')) {
      // If clicking on checkbox area, toggle selection
      onSelect(playlist.id);
    } else {
      // Otherwise, view the playlist
      onView(playlist.id);
    }
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      }`}
      onClick={handleClick}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 right-2 z-10 select-checkbox">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(playlist.id);
          }}
          className={`w-5 h-5 border flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        >
          {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3 text-gray-600" />}
        </button>
      </div>

      <div className="relative p-4 flex-grow flex flex-col">
        <div className="mb-4">
          {playlist.image_url ? (
            <img
              src={playlist.image_url}
              alt={playlist.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
              <ListMusic className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-2 flex-grow">
          <h3 className={`text-lg font-semibold line-clamp-2 transition-colors ${
            isSelected
              ? 'text-blue-900'
              : 'text-gray-900'
          }`}>
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedConfig && (
                <div>
                  <selectedConfig.icon />
                </div>
              )}
              <span className="text-gray-600">
                {playlist.track_count ? `${playlist.track_count} tracks` : 'Playlist'}
              </span>
            </div>
            {playlist.owner && (
              <span className="text-gray-500 truncate">
                by {playlist.owner}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;