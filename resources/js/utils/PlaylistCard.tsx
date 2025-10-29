import React from 'react';
import { ListMusic, CheckSquare, Square } from 'lucide-react';
import { Playlist as PlaylistType } from '@/types/index';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: () => <span>🎵</span>, // Placeholder, you can import actual icons
    gradient: 'from-green-500 to-green-600',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: () => <span>▶</span>, // Placeholder, you can import actual icons
    gradient: 'from-red-500 to-red-600',
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
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-xl ${
        isSelected
          ? 'bg-gradient-to-br from-purple-100/80 to-purple-200/60 dark:from-purple-900/80 dark:to-purple-800/40 border-purple-400 dark:border-purple-500 shadow-xl'
          : 'bg-gradient-to-br from-white/80 to-purple-50/60 dark:from-neutral-900/80 dark:to-purple-950/40 border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-2xl'
      }`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 transform rotate-12 scale-150"></div>
      </div>

      {/* Selection checkbox */}
      <div className="absolute top-3 right-3 z-10 select-checkbox">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(playlist.id);
          }}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-purple-600 border-purple-600 text-white'
              : 'bg-white/80 dark:bg-neutral-800/80 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
          }`}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        </button>
      </div>

      <div className="relative p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
        <div className="mb-3 sm:mb-4">
          {playlist.image_url ? (
            <img
              src={playlist.image_url}
              alt={playlist.name}
              className="w-full aspect-square object-cover rounded-lg sm:rounded-xl shadow-md"
            />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-900 rounded-lg sm:rounded-xl flex items-center justify-center">
              <ListMusic className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-600 dark:text-purple-400" />
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2 flex-grow">
          <h3 className={`text-base sm:text-lg font-bold line-clamp-2 transition-colors ${
            isSelected
              ? 'text-purple-800 dark:text-purple-200'
              : 'text-purple-900 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-300'
          }`}>
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80 line-clamp-2">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200/50 dark:border-purple-800/50 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {selectedConfig && (
                <div className={`p-0.5 sm:p-1 rounded-md bg-gradient-to-br ${selectedConfig.gradient}`}>
                  <selectedConfig.icon />
                </div>
              )}
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {playlist.track_count ? `${playlist.track_count} tracks` : 'Playlist'}
              </span>
            </div>
            {playlist.owner && (
              <span className="text-purple-500/70 dark:text-purple-500/70 truncate text-xs">
                by {playlist.owner}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

export default PlaylistCard;
