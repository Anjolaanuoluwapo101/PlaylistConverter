import React from 'react';
import { ListMusic } from 'lucide-react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: ListMusic,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: ListMusic,
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
      <ListMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2 text-black">
        No Playlists Found
      </h3>
      <p className="text-gray-600">
        You don't have any playlists on {config?.label} yet
      </p>
    </div>
  );
};

export default EmptyPlaylistState;