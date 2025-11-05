import React from 'react';
import { ListMusic, Music } from 'lucide-react';
import { router } from '@inertiajs/react';

const NoPlatformsConnect: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="text-center py-12">
      <div className="mb-6">
        <ListMusic className="w-8 h-8 text-gray-400 mx-auto" />
      </div>
      <h2 className="text-sm font-bold mb-4 text-black">
        No Connected Platforms
      </h2>
      <p className="text-sm text-gray-600 mb-8">
        Connect your music platforms to view your playlists
      </p>
      <div
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700"
        onClick={() => {
          router.visit('/connect')
        }
        }
      >
        <Music className="w-5 h-5" />
        Connect Platforms
      </div>
    </div>
  </div>
);

export default NoPlatformsConnect;