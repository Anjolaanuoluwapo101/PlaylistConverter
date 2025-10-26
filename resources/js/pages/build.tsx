import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, Plus, X } from 'lucide-react';
import axios from 'axios';

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
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        playlist_name: '',
        playlist_description: '',
        selected_platforms: [] as string[],
        selected_tracks: [] as Track[],
    });

    useEffect(() => {
        loadBuildJobs();
    }, []);

    const loadBuildJobs = async () => {
        setIsLoadingJobs(true);
        try {
            const response = await axios.get('/builder/jobs');
            setBuildJobs(response.data.jobs.data);
        } catch (error) {
        console.error('Failed to load build jobs:', error);
        } finally {
            setIsLoadingJobs(false);
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
                if (response.data.found && response.data.track) {
                    const track = response.data.track;
                    if (platform === 'spotify') {
                        tracks = [{
                            id: `spotify-${track.id}`,
                            name: track.title,
                            artist: track.artist,
                            platform: 'spotify' as const,
                            track_id: track.id,
                        }];
                    } else if (platform === 'youtube') {
                        tracks = [{
                            id: `youtube-${track.id}`,
                            name: track.title,
                            artist: track.artist,
                            platform: 'youtube' as const,
                            track_id: track.id,
                        }];
                    }
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

    const handlePlatformChange = (platform: string, checked: boolean | "indeterminate" | undefined) => {
        const isChecked = checked === true;
        const newPlatforms = isChecked
            ? [...selectedPlatforms, platform]
            : selectedPlatforms.filter(p => p !== platform);
        setSelectedPlatforms(newPlatforms);
        setData('selected_platforms', newPlatforms);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTracks.length === 0) {
            alert('Please select at least one track');
            return;
        }

        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform');
            return;
        }

        const formData = {
            playlist_name: data.playlist_name,
            playlist_description: data.playlist_description,
            selected_platforms: selectedPlatforms,
            selected_tracks: selectedTracks.map(track => ({
                track_id: track.track_id,
                platform: track.platform,
            })),
        };

        axios.post('/builder', formData).then(() => {
            reset();
            setSelectedTracks([]);
            setSelectedPlatforms([]);
            loadBuildJobs();
        }).catch((error) => {
            console.error('Build failed:', error);
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <>
            <Head title="Build Playlist" />
            <NavBar items={NavBarData} />

            <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                <PageHeader
                    title="Build Custom Playlist"
                    description="Create playlists across multiple platforms by selecting your favorite tracks"
                />

                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Playlist Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                        Playlist Name *
                                    </label>
                                    <Input
                                        value={data.playlist_name}
                                        onChange={(e) => setData('playlist_name', e.target.value)}
                                        placeholder="My Awesome Playlist"
                                        className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    {errors.playlist_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.playlist_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.playlist_description}
                                        onChange={(e) => setData('playlist_description', e.target.value)}
                                        placeholder="Optional description..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Platform Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">
                                    Select Platforms *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['spotify', 'youtube'].map((platform) => (
                                        <label key={platform} className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer">
                                            <Checkbox
                                                checked={selectedPlatforms.includes(platform)}
                                                onCheckedChange={(checked) =>
                                                    handlePlatformChange(platform, checked === true)
                                                }
                                            />
                                            <span className="capitalize font-medium text-purple-900 dark:text-purple-100">{platform}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Track Search */}
                            <div>
                                <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                    Search & Select Tracks (Max 5)
                                </label>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Input
                                            value={artistQuery}
                                            onChange={(e) => setArtistQuery(e.target.value)}
                                            placeholder="Artist name..."
                                            className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            onKeyUp={(e: React.KeyboardEvent) => e.key === 'Enter' && searchTracks()}
                                        />
                                        <Input
                                            value={titleQuery}
                                            onChange={(e) => setTitleQuery(e.target.value)}
                                            placeholder="Song title..."
                                            className="w-full px-4 py-3 bg-white/60 dark:bg-neutral-800/60 border border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            onKeyUp={(e: React.KeyboardEvent) => e.key === 'Enter' && searchTracks()}
                                        />
                                        <Button
                                            type="button"
                                            onClick={searchTracks}
                                            disabled={isSearching}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            {isSearching ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Searching...
                                                </>
                                            ) : (
                                                'Search'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
                                        <h4 className="font-medium mb-2">Search Results:</h4>
                                        <div className="space-y-2">
                                            {searchResults.map((track) => (
                                                <div
                                                    key={track.id}
                                                    className="flex items-center justify-between p-2 bg-white dark:bg-neutral-700 rounded"
                                                >
                                                    <div>
                                                        <p className="font-medium">{track.name}</p>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                            {track.artist} • {track.platform}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => addTrack(track)}
                                                        disabled={selectedTracks.length >= 5 || selectedTracks.some(t => t.id === track.id)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
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
                                                    className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded"
                                                >
                                                    <div>
                                                        <p className="font-medium">{track.name}</p>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                            {track.artist} • {track.platform}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeTrack(track.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing || selectedTracks.length === 0 || selectedPlatforms.length === 0}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Building...
                                    </>
                                ) : (
                                    'Build Playlist'
                                )}
                            </Button>
                        </form>

                        {/* Build Jobs History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Build History</CardTitle>
                                <CardDescription>
                                    Track the status of your playlist builds
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingJobs ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : buildJobs.length === 0 ? (
                                    <div className="text-center py-4 text-neutral-500">
                                        No builds yet. Create your first playlist above!
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {buildJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(job.status)}
                                                    <div>
                                                        <p className="font-medium">{job.playlist_name}</p>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                            Platforms: {job.selected_platforms.join(', ')}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {new Date(job.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(job.status)}>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
