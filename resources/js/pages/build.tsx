import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/user/PageHeader';
import axios from 'axios';
import { Loader2, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    artist: string;
    platform: 'spotify' | 'youtube';
    track_id: string;
}

interface BuildJob {
    id: number;
    status: string;
    playlist_name: string;
    selected_platforms: string[];
    results: Record<string, unknown>;
    error_message: string;
    created_at: string;
    updated_at: string;
}

export default function Build() {
    const [artistQuery, setArtistQuery] = useState('');
    const [titleQuery, setTitleQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [buildJobs, setBuildJobs] = useState<BuildJob[]>([]);
    const [loading, setLoading] = useState(true);

    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadBuildJobs();
    }, []);

    const loadBuildJobs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/builder/jobs');
            setBuildJobs(response.data.jobs.data);
        } catch (error) {
            console.error('Failed to load build jobs:', error);
        } finally {
            setLoading(false);
        }
    };


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
                console.log('response', response);
                if (response.data.tracks && Array.isArray(response.data.tracks)) {
                    tracks = response.data.tracks.map((track: Record<string, unknown>) => {
                        if (platform === 'spotify') {
                            return {
                                id: `spotify-${track.id}`,
                                name: track.title,
                                artist: track.artist,
                                platform: 'spotify' as const,
                                track_id: track.id,
                            };
                        } else if (platform === 'youtube') {
                            return {
                                id: `youtube-${track.id}`,
                                name: track.title,
                                artist: track.artist,
                                platform: 'youtube' as const,
                                track_id: track.id,
                            };
                        }
                        return null;
                    }).filter((track: Track | null) => track !== null) as Track[];
                }

                allTracks.push(...tracks);
            }
            console.log(allTracks);
            setSearchResults(allTracks);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const addTrack = (track: Track) => {
        if (selectedTracks.length >= 5) {
            alert('Maximum 5 tracks allowed');
            return;
        }
        if (!selectedTracks.find(t => t.id === track.id)) {
            setSelectedTracks([...selectedTracks, track]);
        }
    };

    const removeTrack = (trackId: string) => {
        setSelectedTracks(selectedTracks.filter(t => t.id !== trackId));
    };

    const handlePlatformChange = (platform: string, checked: boolean) => {
        const isChecked = checked === true;
        const newPlatforms = isChecked
            ? [...selectedPlatforms, platform]
            : selectedPlatforms.filter(p => p !== platform);
        setSelectedPlatforms(newPlatforms);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setFormErrors({});

        // Validation
        const errors: Record<string, string> = {};
        if (!playlistName.trim()) {
            errors.playlist_name = 'Playlist name is required';
        }
        if (selectedTracks.length === 0) {
            errors.tracks = 'Please select at least one track';
        }
        if (selectedPlatforms.length === 0) {
            errors.platforms = 'Please select at least one platform';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = {
                playlist_name: playlistName,
                playlist_description: playlistDescription,
                selected_platforms: selectedPlatforms,
                selected_tracks: selectedTracks.map(track => ({
                    track_id: track.track_id,
                    platform: track.platform,
                })),
            };

            await axios.post('/builder', formData);

            // Reset form
            setPlaylistName('');
            setPlaylistDescription('');
            setSelectedTracks([]);
            setSelectedPlatforms([]);
            loadBuildJobs();
        } catch (error) {
            console.error('Build failed:', error);
            setFormErrors({ submit: 'Failed to build playlist. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'pending':
                return { color: 'text-yellow-600', icon: Loader2, text: 'Pending' };
            case 'processing':
                return { color: 'text-blue-600', icon: Loader2, text: 'Processing' };
            case 'completed':
                return { color: 'text-green-600', icon: CheckCircle, text: 'Completed' };
            case 'failed':
                return { color: 'text-red-600', icon: AlertCircle, text: 'Failed' };
            default:
                return { color: 'text-gray-600', icon: AlertCircle, text: status };
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin h-12 w-12 border-b-2 border-gray-800"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head title="Build Playlist" />

            {/* <div className="w-full max-w-4xl mx-auto p-4 md:p-6"> */}
            <PageHeader
                title="Build Custom Playlist"
                description="Create playlists across multiple platforms by selecting your favorite tracks"
            />



            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Playlist Details */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Playlist Name *
                            </label>
                            <input
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                placeholder="My Awesome Playlist"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 2"
                                required
                            />
                            {formErrors.playlist_name && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.playlist_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Description
                            </label>
                            <textarea
                                value={playlistDescription}
                                onChange={(e) => setPlaylistDescription(e.target.value)}
                                placeholder="Optional description..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 "
                            />
                            {formErrors.submit && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.submit}</p>
                            )}
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Select Platforms *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['spotify', 'youtube'].map((platform) => (
                                <label key={platform} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedPlatforms.includes(platform)}
                                        onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                                        className="border-gray-300 text-gray-600 focus:ring-gray-500"
                                    />
                                    <span className="capitalize font-medium text-gray-900 dark:text-gray-100">{platform}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Track Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Search & Select Tracks (Max 5)
                        </label>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={artistQuery}
                                    onChange={(e) => setArtistQuery(e.target.value)}
                                    placeholder="Artist name..."
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    onKeyUp={(e: React.KeyboardEvent) => e.key === 'Enter' && searchTracks()}
                                />
                                <input
                                    type="text"
                                    value={titleQuery}
                                    onChange={(e) => setTitleQuery(e.target.value)}
                                    placeholder="Song title..."
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={searchTracks}
                                    disabled={isSearching}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                            <div className="mt-4 max-h-60 overflow-y-auto border p-4 bg-gray-50 dark:bg-gray-800">
                                <h4 className="font-medium mb-2">Search Results:</h4>
                                <div className="space-y-2">
                                    {searchResults.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-700"
                                        >
                                            <div>
                                                <p className="font-medium">{track.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {track.artist} • {track.platform}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addTrack(track)}
                                                disabled={selectedTracks.length >= 5 || selectedTracks.some(t => t.id === track.id)}
                                                className="p-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                                <h4 className="font-medium mb-2">Selected Tracks ({selectedTracks.length}/5):</h4>
                                <div className="space-y-2">
                                    {selectedTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20"
                                        >
                                            <div>
                                                <p className="font-medium">{track.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {track.artist} • {track.platform}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTrack(track.id)}
                                                className="p-2 text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || selectedTracks.length === 0 || selectedPlatforms.length === 0}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Building...
                            </>
                        ) : (
                            'Build Playlist'
                        )}
                    </button>
                </form>

                {/* Build Jobs History */}
                {buildJobs.length > 0 && (
                    <div className="mt-8 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Build History
                        </h3>

                        <div className="space-y-4">
                            {buildJobs.map((job) => (
                                <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-neutral-700 hover:shadow-xl hover:scale-105">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {React.createElement(getStatusDisplay(job.status).icon, {
                                                className: `w-4 h-4 ${getStatusDisplay(job.status).color} ${job.status === 'processing' ? 'animate-spin' : ''}`
                                            })}
                                            <span className={`font-semibold ${getStatusDisplay(job.status).color}`}>
                                                {getStatusDisplay(job.status).text}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Playlist:</span>
                                            <span className="ml-2 text-gray-800 dark:text-white">
                                                {job.playlist_name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Platforms:</span>
                                            <span className="ml-2 text-gray-800 dark:text-white capitalize">
                                                {job.selected_platforms.join(', ')}
                                            </span>
                                        </div>
                                    </div>

                                    {job.status === 'completed' && (
                                        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                            ✓ Build completed successfully
                                        </div>
                                    )}

                                    {job.status === 'failed' && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            ✗ Build failed
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* </div> */}
        </MainLayout>
    );
}
