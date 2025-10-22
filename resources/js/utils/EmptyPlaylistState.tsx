import React from 'react';
import { ListMusic } from 'lucide-react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: ListMusic,
    gradient: 'from-green-500 to-green-600',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: ListMusic,
    gradient: 'from-red-500 to-red-600',
  },
];

const getPlatformConfig = (platformKey: string) => {
  return PLATFORM_CONFIG.find(config => config.key === platformKey);
};

interface EmptyPlaylistStateProps {
  platform: string;
}

const EmptyPlaylistState: React.FC<EmptyPlaylistStateProps> = ({ platform }) => {
  const config = getPlatformConfig(platform);
  return (
    <div className="text-center py-12">
      <ListMusic className="w-16 h-16 text-purple-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-100">
        No Playlists Found
      </h3>
      <p className="text-purple-600/80 dark:text-purple-400/80">
        You don't have any playlists on {config?.label} yet
      </p>
    </div>
  );
};

export default EmptyPlaylistState;
