import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {  Music, Play} from 'lucide-react';


const PLATFORM_CONFIG = [
  {
    key: 'spotify',
    label: 'Spotify',
    icon: () => <Music className='h-6 w-6 text-green-500' />,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: () =>  <Play className='h-6 w-6 text-red-500' />,
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
        className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 hover:shadow-xl transition-all duration-200 group"
      >
        {selectedConfig && (
          <selectedConfig.icon />
        )}
        <span className="font-semibold text-black">
          {selectedConfig?.label || 'Select Platform'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-50">
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
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100"
              >
                <config.icon />
                <span className="font-medium text-black">{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlatformDropdown;
