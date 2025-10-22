
import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, // Represents speed and efficiency
    Repeat, // Represents syncing and conversion
    Sparkles, // Represents AI and smart features
    ShieldCheck, // Represents reliability and security
    Share2, // Represents social sharing
    Palette, // Represents customization
} from 'lucide-react';

// --- Feature Data ---
// This array holds the data for each feature card. 
// To add, remove, or modify a feature, you can simply edit this array.
const featureData = [
    {
        icon: Zap,
        title: 'Seamless Conversion',
        description: 'Effortlessly transfer your playlists between Spotify and YouTube Music with just a few clicks. Our engine handles the heavy lifting.',
    },
    {
        icon: Repeat,
        title: 'Cross-Platform Sync',
        description: 'Keep your playlists synchronized across platforms. Add a song on Spotify, and it appears on YouTube Music automatically.',
    },
    {
        icon: Sparkles,
        title: 'AI-Powered Suggestions',
        description: "Discover new tracks with our smart recommendation engine. We analyze your taste to suggest music you'll love.",
    },
    {
        icon: ShieldCheck,
        title: 'Reliable & Secure',
        description: 'Your data is protected. We use official APIs and secure authentication to ensure your privacy and account safety.',
    },
    {
        icon: Share2,
        title: 'Share with Friends',
        description: 'Easily share your converted playlists with friends, regardless of the music service they use.',
    },
    {
        icon: Palette,
        title: 'Customizable Experience',
        description: 'Tailor the app to your liking with light and dark modes and other personalization options.',
    },
];

// --- Sub-Components ---

/**
 * FeatureCard Component
 * Renders a single feature card with an icon, title, and description.
 * It manages its own animation state using framer-motion's `whileInView`.
 * @param {React.ComponentType} icon - The icon component from lucide-react.
 * @param {string} title - The title of the feature.
 * @param {string} description - The description of the feature.
 * @param {number} index - The index of the card for staggered animation.
 */
const FeatureCard = ({ icon: Icon, title, description, index }: {
    icon: React.ComponentType<{ className?: string }>, 
    title: string, 
    description: string, 
    index: number 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: 'easeOut',
                },
            }}
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white dark:bg-neutral-800/60 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-neutral-200/50 dark:border-neutral-700/50"
        >
            <div 
                style={{ background: 'linear-gradient(to bottom right, #ffffff, #7c3aed)' }}
                className="flex items-center justify-center h-16 w-16 mb-6 rounded-full text-white shadow-inner"
            >
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">{title}</h3>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{description}</p>
        </motion.div>
    );
};

/**
 * FeatureShowcase Component
 * The main component that lays out the feature cards in a responsive grid.
 */
export default function FeatureShowcase() {
    return (
        <div className="py-20 md:py-28 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- Header Section --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate = {{ opacity : 1, y : [0,-20,0] }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 3, ease: "easeOut" , repeat:Infinity}}
                    className="text-center mb-16"
                > 
                    <div
                         style={{
                            background: 'linear-gradient(to right, #ffffff,  #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                        className="bg-gradient-to-r from-white via purple-300 to-purple-900">
                    <h2 
                        className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-transparent"
                    >
                        Powerful Features, Simplified
                    </h2>
                    </div>
                    <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                        Our platform is packed with features designed to make your music life easier. 
                        Explore what makes PlaylistConverter the ultimate tool for music lovers.
                    </p>
                </motion.div>

                {/* --- Grid of Features --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {featureData.map((feature, index) => (
                        <FeatureCard key={index} index={index} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    );
}