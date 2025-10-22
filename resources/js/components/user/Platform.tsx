

import React, { useEffect, useState } from 'react';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import { Music, Play, CheckCircle, Plus } from 'lucide-react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    accessToken: 'spotify_access_token',
    expiresAt: 'spotify_token_expires_at',
    icon: Music,
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    accessToken: 'youtube_access_token',
    expiresAt: 'youtube_token_expires_at',
    icon: Play,
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500',
  },
  // Add more platforms here as needed
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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="platforms-component w-full max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Connect Your Platforms
        </h2>
        <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
          Link your music accounts to start syncing playlists seamlessly
        </p>
      </div>

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
                group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                ${connected
                  ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-300 dark:border-purple-600 shadow-xl'
                  : 'bg-gradient-to-br from-white/80 to-purple-50/60 dark:from-neutral-900/80 dark:to-purple-950/40 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 shadow-lg hover:shadow-2xl hover:scale-[1.02]'
                }
                backdrop-blur-xl
              `}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 transform rotate-12 scale-150"></div>
              </div>

              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${connected ? 'bg-purple-100 dark:bg-purple-900/50' : `bg-gradient-to-br ${platform.gradient}`}`}>
                    <IconComponent className={`w-8 h-8 ${connected ? 'text-purple-600 dark:text-purple-400' : 'text-white'}`} />
                  </div>
                  {connected && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">Connected</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {platform.label}
                  </h3>
                  <p className="text-purple-700/80 dark:text-purple-300/80 leading-relaxed">
                    {connected
                      ? `Your ${platform.label} account is connected and ready to sync.`
                      : `Connect your ${platform.label} account to start syncing playlists.`
                    }
                  </p>
                </div>

                {!connected && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Connect Account</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {connected && (
                  <div className="mt-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Ready to sync</span>
                  </div>
                )}
              </div>

              {/* Hover effect overlay */}
              {!connected && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-purple-500/70 dark:text-purple-500/70">
          More platforms coming soon • Secure OAuth connections
        </p>
      </div>
    </div>
  );
};

export default Platform;
