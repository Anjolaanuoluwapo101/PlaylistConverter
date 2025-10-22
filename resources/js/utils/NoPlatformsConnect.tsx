import React from 'react';
import { ListMusic, Music } from 'lucide-react';
import Platform from '@/components/user/Platform';

const NoPlatformsConnect: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="text-center py-12">
      <div className="mb-6">
        <ListMusic className="w-16 h-16 text-purple-400 mx-auto" />
      </div>
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
        No Connected Platforms
      </h2>
      <p className="text-lg text-purple-600/80 dark:text-purple-400/80 mb-8">
        Connect your music platforms to view your playlists
      </p>
      <div
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Music className="w-5 h-5" />
        Connect Platforms
      </div>
    </div>
  </div>
);

export default NoPlatformsConnect;
