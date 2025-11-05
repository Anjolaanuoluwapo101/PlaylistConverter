
import React, { useEffect, useState } from 'react';
import PageHeader from './PageHeader';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import { Music, Play, CheckCircle, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: Music,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: Play,
  },
];

const Platform: React.FC = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await checkConnectedPlatforms();
      if (result && result.connected_platforms) {
        setConnectedPlatforms(result.connected_platforms);
      }
      setLoading(false);
    })();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageHeader title={"Connect Your Platforms"} description={" Link your music accounts to start syncing playlists seamlessly"} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORM_CONFIG.map((platform) => {
          const connected = Boolean(connectedPlatforms[platform.key]);
          const IconComponent = platform.icon;

          return (
            <div
              key={platform.key}
              onClick={() => {
                if (!connected) {
                  window.location.href = `/platforms/${platform.key}/connect`;
                }
              }}
              className={`
                p-8 border-2 transition-all duration-300 cursor-pointer
                ${connected
                  ? 'border-gray-300 dark:border-gray-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4`}>
                  <IconComponent className={`w-8 h-8 ${connected ? 'text-gray-800 dark:text-white' : 'text-gray-500'}`} />
                </div>
                {connected && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">Connected</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {platform.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {connected
                    ? `Your ${platform.label} account is connected and ready to sync.`
                    : `Connect your ${platform.label} account to start syncing playlists.`
                  }
                </p>
              </div>

              {!connected && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Connect Account</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          More platforms coming soon • Secure OAuth connections
        </p>
      </div>
    </div>
  );
};

export default Platform;
