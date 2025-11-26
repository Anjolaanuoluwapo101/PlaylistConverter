import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Image, Upload } from 'lucide-react';
import AlertComponent from '@/components/user/AlertComponent';

interface PlaylistSettings {
    name: string;
    description: string;
    public?: boolean;
    collaborative?: boolean;
    privacy_status?: 'public' | 'private' | 'unlisted';
    cover_image?: string;
    thumbnail?: string;
}

interface PlatformConfig {
    hasCoverImage: boolean;
    hasPublicSetting: boolean;
    hasCollaborativeSetting: boolean;
    hasPrivacyStatus: boolean;
    coverImageRequirements?: string;
    maxFileSize?: number;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
    spotify: {
        hasCoverImage: true,
        hasPublicSetting: true,
        hasCollaborativeSetting: true,
        hasPrivacyStatus: false,
        coverImageRequirements: 'JPEG only, max 256KB',
        maxFileSize: 256 * 1024 // 256KB
    },
    youtube: {
        hasCoverImage: false,
        hasPublicSetting: false,
        hasCollaborativeSetting: false,
        hasPrivacyStatus: true
    }
};

interface PlaylistSettingsSectionProps {
    platform: string;
    playlistId: string;
    onSettingsUpdated?: () => void;
}

const PlaylistSettingsSection: React.FC<PlaylistSettingsSectionProps> = ({
    platform,
    playlistId,
    onSettingsUpdated
}) => {
    const platformConfig = PLATFORM_CONFIGS[platform] || {
        hasCoverImage: false,
        hasPublicSetting: false,
        hasCollaborativeSetting: false,
        hasPrivacyStatus: false
    };

    const [settings, setSettings] = useState<PlaylistSettings>({
        name: '',
        description: ''
    });
    const [originalSettings, setOriginalSettings] = useState<PlaylistSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    useEffect(() => {
        if (platform && playlistId) {
            fetchSettings();
        }
    }, [platform, playlistId]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/playlists/${platform}/${playlistId}/settings`);
            const data = response.data.settings;

            setSettings(data);
            setOriginalSettings(data);

            if (data.cover_image) {
                setCoverPreview(data.cover_image);
            } else if (data.thumbnail) {
                setCoverPreview(data.thumbnail);
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.response?.data?.error || 'Failed to load playlist settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file is JPEG
        if (!file.type.startsWith('image/jpeg')) {
            setError('Please upload a JPEG image');
            return;
        }

        // Check file size
        if (platformConfig.maxFileSize && file.size > platformConfig.maxFileSize) {
            setError(`Image size must be less than ${platformConfig.maxFileSize / 1024}KB`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Prepare update data (only send changed fields)
            const updateData: any = {};

            // if (settings.name !== originalSettings?.name) {
            //     updateData.name = settings.name;
            // }
            updateData.name = settings.name;

            if (settings.description !== originalSettings?.description) {
                updateData.description = settings.description;
            }

            // Platform-specific settings
            if (platformConfig.hasPublicSetting && settings.public !== originalSettings?.public) {
                updateData.public = settings.public;
            }

            if (platformConfig.hasCollaborativeSetting && settings.collaborative !== originalSettings?.collaborative) {
                updateData.collaborative = settings.collaborative;
            }

            if (platformConfig.hasPrivacyStatus && settings.privacy_status !== originalSettings?.privacy_status) {
                updateData.privacy_status = settings.privacy_status;
            }

            // Only make API calls if there are changes
            if (Object.keys(updateData).length > 0) {
                // Update settings
                await axios.post(`/playlists/${platform}/${playlistId}/settings`, updateData);
            }

            // Update cover image for platforms that support it
            if (platformConfig.hasCoverImage && coverPreview && coverPreview !== originalSettings?.cover_image) {
                // Extract base64 data
                const base64Data = coverPreview.split(',')[1];
                await axios.post(`/playlists/${platform}/${playlistId}/cover`, {
                    image: base64Data
                });
            }

            setSuccess('Playlist settings updated successfully');

            // Refresh settings after update
            await fetchSettings();

            // Notify parent component if needed
            if (onSettingsUpdated) {
                onSettingsUpdated();
            }
        } catch (err: any) {
            console.error('Error updating settings:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update playlist settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-gray-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border-2 border-gray-400 shadow-md p-6">
            {error && <AlertComponent message={error} type="error" />}
            {success && <AlertComponent message={success} type="success" />}

            <br />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left column - Cover image for platforms that support it */}
                    {platformConfig.hasCoverImage && (
                        <div className="md:col-span-1">
                            <div className="flex flex-col items-center">
                                <div className="mb-4">
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Playlist cover"
                                            className="w-48 h-48 object-cover rounded shadow"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-gray-200 rounded shadow flex items-center justify-center">
                                            <Image className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <label className="relative cursor-pointer">
                                    <div className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Change Image
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg"
                                        onChange={handleCoverChange}
                                        className="hidden"
                                    />
                                </label>
                                {platformConfig.coverImageRequirements && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {platformConfig.coverImageRequirements}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Right column - Settings form */}
                    <div className={platformConfig.hasCoverImage ? 'md:col-span-2' : 'md:col-span-3'}>
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Playlist Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={settings.name}
                                    onChange={handleInputChange}
                                    maxLength={255}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.name.length}/255 characters
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={settings.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={5000}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.description.length}/5000 characters
                                </p>
                            </div>

                            {/* Platform-specific settings */}
                            {platformConfig.hasPublicSetting && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="public"
                                        name="public"
                                        checked={settings.public || false}
                                        onChange={handleInputChange as any}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="public" className="ml-2 block text-sm text-gray-900">
                                        Public playlist
                                    </label>
                                </div>
                            )}

                            {platformConfig.hasCollaborativeSetting && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="collaborative"
                                        name="collaborative"
                                        checked={settings.collaborative || false}
                                        onChange={handleInputChange as any}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="collaborative" className="ml-2 block text-sm text-gray-900">
                                        Collaborative playlist
                                    </label>
                                </div>
                            )}

                            {platformConfig.hasPrivacyStatus && (
                                <div>
                                    <label htmlFor="privacy_status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Privacy Status
                                    </label>
                                    <select
                                        id="privacy_status"
                                        name="privacy_status"
                                        value={settings.privacy_status || 'private'}
                                        onChange={handleSelectChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="unlisted">Unlisted</option>
                                    </select>
                                </div>
                            )}

                            {/* Submit button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PlaylistSettingsSection;