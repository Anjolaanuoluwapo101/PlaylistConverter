import React from 'react';
import {
    Zap, // Represents speed and efficiency
    Repeat, // Represents syncing and conversion
    Sparkles, // Represents AI and smart features
    ShieldCheck, // Represents reliability and security
    Share2, // Represents social sharing
    Palette, // Represents customization
} from 'lucide-react';

const featureData = [
    {
        icon: Zap,
        title: 'Playlist Conversion',
        description: 'Convert playlists seamlessly between Spotify and YouTube Music.',
    },
    {
        icon: Repeat,
        title: 'Sync',
        description: 'Sync your playlists across platforms with a button click.',
    },
    {
        icon: Sparkles,
        title: 'Build Custom Playlists',
        description: 'Create new playlists from scratch or by searching and adding tracks.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure Authentication',
        description: 'Connect your accounts securely using official APIs.',
    },
    {
        icon: Share2,
        title: 'Share & Collaborate',
        description: 'Share converted playlists with friends or collaborate on builds.',
    },
    {
        icon: Palette,
        title: 'Personalized Settings',
        description: 'Customize your experience with themes, notifications, and platform preferences.',
    },
];

const FeatureCard = ({ icon: Icon, title, description }: {
    icon: React.ComponentType<{ className?: string }>,
    title: string,
    description: string,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
                <Icon className="w-8 h-8 mr-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
};

export default function FeatureShowcase() {
    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Features</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        Everything you need to manage your playlists.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featureData.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    );
}