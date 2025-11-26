import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    artist: string;
    platform: 'spotify' | 'youtube';
    track_id: string;
}

interface TrackSearchSectionProps {
    selectedPlatforms: string[];
    selectedTracks: Track[];
    onAddTrack: (track: Track) => void;
    onRemoveTrack: (trackId: string) => void;
    maxTracks?: number;
}

const TrackSearchSection: React.FC<TrackSearchSectionProps> = ({
    selectedPlatforms,
    selectedTracks,
    onAddTrack,
    onRemoveTrack,
    maxTracks = 5
}) => {
    const [artistQuery, setArtistQuery] = useState('');
    const [titleQuery, setTitleQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchTracks = async () => {
        if (titleQuery.trim() === '' || artistQuery.trim() === '' || selectedPlatforms.length === 0) return;

        setIsSearching(true);
        setSearchResults([]);
        try {
            const allTracks: Track[] = [];

            for (const platform of selectedPlatforms) {
                const response = await axios.post(`/${platform}/search`, {
                    title: titleQuery,
                    artist: artistQuery
                });

                let tracks: Track[] = [];
                if (response.data.tracks && Array.isArray(response.data.tracks)) {
                    tracks = response.data.tracks.map((track: Record<string, unknown>) => {
                        // if (platform === 'spotify') {
                        //     return {
                        //         id: `spotify-${track.id}`,
                        //         name: track.title,
                        //         artist: track.artist,
                        //         platform: 'spotify' as const,
                        //         track_id: track.id,
                        //     };
                        // } else if (platform === 'youtube') {
                        //     return {
                        //         id: `youtube-${track.id}`,
                        //         name: track.title,
                        //         artist: track.artist,
                        //         platform: 'youtube' as const,
                        //         track_id: track.id,
                        //     };
                        // }
                        return {
                            id: `${platform}-${track.id}`,
                            name: track.title,
                            artist: track.artist,
                            platform: `${platform}` as const,
                            track_id: track.id,
                        };
                        // return null;
                    }).filter((track: Track | null) => track !== null) as Track[];
                } else {
                    tracks = [];
                }

                allTracks.push(...tracks);
            }

            setSearchResults(allTracks);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTrack = (track: Track) => {
        if (selectedTracks.length >= maxTracks) {
            alert(`Maximum ${maxTracks} tracks allowed`);
            return;
        }
        if (!selectedTracks.find(t => t.id === track.id)) {
            onAddTrack(track);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search & Select Tracks (Max {maxTracks})
            </label>
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={artistQuery}
                        onChange={(e) => setArtistQuery(e.target.value)}
                        placeholder="Artist name..."
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                        onKeyUp={(e: React.KeyboardEvent) => e.key === 'Enter' && searchTracks()}
                    />
                    <input
                        type="text"
                        value={titleQuery}
                        onChange={(e) => setTitleQuery(e.target.value)}
                        placeholder="Song title..."
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={searchTracks}
                        disabled={isSearching}
                        className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Searching...
                            </>
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Search Results:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((track) => (
                            <div
                                key={track.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{track.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {track.artist} • {track.platform}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleAddTrack(track)}
                                    disabled={selectedTracks.length >= maxTracks || selectedTracks.some(t => t.id === track.id)}
                                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Tracks */}
            {selectedTracks.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Tracks ({selectedTracks.length}/{maxTracks}):</h4>
                    <div className="space-y-2">
                        {selectedTracks.map((track) => (
                            <div
                                key={track.id}
                                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{track.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {track.artist} • {track.platform}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveTrack(track.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 rounded-md"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackSearchSection;