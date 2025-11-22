import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Music, Play } from 'lucide-react';

const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: () => <Music className='h-5 w-5 text-green-500' />,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: () => <Play className='h-5 w-5 text-red-500' />,
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
        className="flex items-center justify-between gap-3 w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedConfig && (
            <selectedConfig.icon />
          )}
          <span>
            {selectedConfig?.label || 'Select Platform'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
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
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                <config.icon />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlatformDropdown;