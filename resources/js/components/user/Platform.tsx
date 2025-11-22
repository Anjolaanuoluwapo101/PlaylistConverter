import React, { useEffect, useState } from 'react';
import PageHeader from './PageHeader';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import { Music, Play, CheckCircle, Plus } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto">
      <PageHeader 
        title="Connect Your Platforms" 
        description="Link your music accounts to start syncing playlists seamlessly" 
      />

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
                p-6 border rounded-lg transition-all duration-200 cursor-pointer
                ${connected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <IconComponent className={`w-6 h-6 ${connected ? 'text-green-600 dark:text-green-400' : 'text-gray-600'}`} />
                </div>
                {connected && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Connected</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {platform.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {connected
                    ? `Your ${platform.label} account is connected and ready to sync.`
                    : `Connect your ${platform.label} account to start syncing playlists.`
                  }
                </p>
              </div>

              {!connected && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Connect Account</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          More platforms coming soon • Secure OAuth connections
        </p>
      </div>
    </div>
  );
};

export default Platform;