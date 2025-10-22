import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      <span className="text-purple-600 dark:text-purple-400 font-medium">Loading playlists...</span>
    </div>
  </div>
);

export default LoadingState;
