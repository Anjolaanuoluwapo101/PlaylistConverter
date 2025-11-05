import React from 'react';
import PlaylistCard from './PlaylistCard';
import { Playlist as PlaylistType } from '@/types/index';

interface PlaylistGridProps {
  playlists: PlaylistType[];
  platform: string;
  selectedPlaylists: string[];
  onSelectPlaylist: (playlistId: string) => void;
  onViewPlaylist: (playlistId: string) => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, platform, selectedPlaylists, onSelectPlaylist, onViewPlaylist }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
    {playlists.map((playlist, index) => (
      <PlaylistCard
        key={`${playlist.id}-${index}`}
        playlist={playlist}
        platform={platform}
        isSelected={selectedPlaylists.includes(playlist.id)}
        onSelect={onSelectPlaylist}
        onView={onViewPlaylist}
      />
    ))}
  </div>
);

export default PlaylistGrid;