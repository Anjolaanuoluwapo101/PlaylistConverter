import React from 'react';
import { ListMusic, Music } from 'lucide-react';

const NoPlatformsConnect: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="text-center py-12">
      <div className="mb-6">
        <ListMusic className="w-16 h-16 text-gray-400 mx-auto" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-black">
        No Connected Platforms
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Connect your music platforms to view your playlists
      </p>
      <div
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        <Music className="w-5 h-5" />
        Connect Platforms
      </div>
    </div>
  </div>
);

export default NoPlatformsConnect;