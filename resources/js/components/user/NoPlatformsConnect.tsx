import React from 'react';
import { ListMusic, Music } from 'lucide-react';
import { router } from '@inertiajs/react';

const NoPlatformsConnect: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="text-center py-12">
      <div className="mb-6">
        <ListMusic className="w-12 h-12 text-gray-400 mx-auto" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        No Connected Platforms
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Connect your music platforms to view your playlists
      </p>
      <button
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => {
          router.visit('/connect')
        }}
      >
        <Music className="w-5 h-5" />
        Connect Platforms
      </button>
    </div>
  </div>
);

export default NoPlatformsConnect;