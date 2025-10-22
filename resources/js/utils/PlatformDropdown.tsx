import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: () => <img src="/logos/SpotifyLogo.png" alt="Spotify" className="w-8 h-8 object-contain" />,
    gradient: 'from-green-500 to-green-600',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: () => <img src="/logos/YoutubeLogo.png" alt="YouTube" className="w-8 h-8 object-contain" />,
    gradient: 'from-red-500 to-red-600',
  },
];

const getPlatformConfig = (platformKey: string) => {
  return PLATFORM_CONFIG.find(config => config.key === platformKey);
};

interface PlatformDropdownProps {
  connectedPlatformKeys: string[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

const PlatformDropdown: React.FC<PlatformDropdownProps> = ({ connectedPlatformKeys, selectedPlatform, onSelectPlatform }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedConfig = getPlatformConfig(selectedPlatform);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        {selectedConfig && (
          <selectedConfig.icon />
        )}
        <span className="font-semibold text-purple-900 dark:text-purple-100">
          {selectedConfig?.label || 'Select Platform'}
        </span>
        <ChevronDown className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {connectedPlatformKeys.map(platformKey => {
            const config = getPlatformConfig(platformKey);
            if (!config) return null;

            return (
              <button
                key={platformKey}
                onClick={() => {
                  onSelectPlatform(platformKey);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 transition-colors"
              >
                <config.icon />
                <span className="font-medium text-purple-900 dark:text-purple-100">{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlatformDropdown;
