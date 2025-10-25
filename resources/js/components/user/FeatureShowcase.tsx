
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Zap, // Represents speed and efficiency
    Repeat, // Represents syncing and conversion
    Sparkles, // Represents AI and smart features
    ShieldCheck, // Represents reliability and security
    Share2, // Represents social sharing
    Palette, // Represents customization
    Globe,
    TrendingUp,
    Star,
    ChevronLeft,
    ChevronRight,
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
 * Renders a single feature card with enhanced animations: parallax, rotate entrance, interactive hovers.
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
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <motion.div
            initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            whileInView={{
                opacity: 1,
                rotateY: 0,
                scale: 1,
                transition: {
                    delay: index * 0.15,
                    duration: 0.8,
                    ease: 'easeOut',
                    type: 'spring',
                    stiffness: 100,
                },
            }}
            whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            viewport={{ once: true, amount: 0.3 }}
            style={{ y }}
            className="bg-white dark:bg-neutral-800/60 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:-translate-y-3 border border-neutral-200/50 dark:border-neutral-700/50 relative overflow-hidden"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
                style={{ background: 'linear-gradient(to bottom right, #ffffff, #7c3aed)' }}
                className="flex items-center justify-center h-16 w-16 mb-6 rounded-full text-white shadow-inner"
                whileHover={{ scale: 1.1, rotate: 10 }}
            >
                <Icon className="w-8 h-8" />
            </motion.div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">{title}</h3>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{description}</p>
        </motion.div>
    );
};

/**
 * CustomerReviews Component
 * Horizontal carousel of testimonials with fade/slide animations.
 */
const CustomerReviews = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const reviews = [
        { name: 'Alex M.', text: 'PlaylistConverter made switching from Spotify to YouTube Music seamless. Highly recommend!', rating: 5 },
        { name: 'Jordan K.', text: 'The sync feature is a game-changer. My playlists stay updated everywhere!', rating: 5 },
        { name: 'Taylor R.', text: 'Secure and fast. Converted 50+ playlists without issues.', rating: 5 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-16 bg-white dark:bg-neutral-800/50 rounded-3xl shadow-xl mx-4"
        >
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">What Our Users Say</h3>
                <p className="text-neutral-600 dark:text-neutral-300">Real feedback from music lovers like you</p>
            </div>
            <div className="relative overflow-hidden">
                <motion.div
                    className="flex"
                    animate={{ x: -currentIndex * 100 + '%' }}
                    transition={{ duration: 0.5 }}
                >
                    {reviews.map((review, index) => (
                        <div key={index} className="w-full flex-shrink-0 px-8 text-center">
                            <div className="flex justify-center mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-lg text-neutral-700 dark:text-neutral-200 mb-4 italic">"{review.text}"</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-100">- {review.name}</p>
                        </div>
                    ))}
                </motion.div>
                <div className="flex justify-center mt-6 space-x-2">
                    {reviews.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-purple-500' : 'bg-neutral-300'}`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * AnimatedProgress Component
 * Progress bar that animates to show total conversions.
 */
const AnimatedProgress = () => {
    const [progress, setProgress] = useState(0);
    const target = 10000; // Mock conversions

    useEffect(() => {
        const timer = setTimeout(() => setProgress(target), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="py-16 bg-gradient-to-r from-purple-50 to-white dark:from-neutral-800 dark:to-neutral-900 rounded-3xl shadow-xl mx-4"
        >
            <div className="text-center">
                <TrendingUp className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Conversions So Far</h3>
                <div className="w-full max-w-md mx-auto bg-neutral-200 dark:bg-neutral-700 rounded-full h-4 mb-4">
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-purple-700 h-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / target) * 100}%` }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                    />
                </div>
                <motion.p
                    className="text-4xl font-extrabold text-purple-600 dark:text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    {progress.toLocaleString()}+
                </motion.p>
                <p className="text-neutral-600 dark:text-neutral-300">Playlists converted worldwide</p>
            </div>
        </motion.div>
    );
};

/**
 * PlaylistsAroundWorld Component
 * Section with world map icon and animated counters for synced playlists.
 */
const PlaylistsAroundWorld = () => {
    const [count, setCount] = useState(0);
    const target = 50000; // Mock synced playlists

    useEffect(() => {
        const timer = setTimeout(() => setCount(target), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-16 bg-neutral-50 dark:bg-neutral-900 rounded-3xl shadow-xl mx-4"
        >
            <div className="text-center">
                <Globe className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">Playlists Around the World</h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">Powered by our Sync feature</p>
                <motion.p
                    className="text-5xl font-extrabold text-purple-600 dark:text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    {count.toLocaleString()}+
                </motion.p>
                <p className="text-neutral-600 dark:text-neutral-300">Playlists synced globally</p>
            </div>
        </motion.div>
    );
};

/**
 * FeatureShowcase Component
 * The main component with modernized features, reviews, progress, and global stats.
 */
export default function FeatureShowcase() {
    return (
        <div className="py-20 md:py-28 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- Header Section --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [0, -20, 0] }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 3, ease: "easeOut", repeat: Infinity }}
                    className="text-center mb-16"
                >
                    <div
                        style={{
                            background: 'linear-gradient(to right, #ffffff, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                        className="bg-gradient-to-r from-white via purple-300 to-purple-900"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-transparent">
                            Powerful Features, Simplified
                        </h2>
                    </div>
                    <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                        Our platform is packed with features designed to make your music life easier.
                        Explore what makes PlaylistConverter the ultimate tool for music lovers.
                    </p>
                </motion.div>

                {/* --- Grid of Features --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
                    {featureData.map((feature, index) => (
                        <FeatureCard key={index} index={index} {...feature} />
                    ))}
                </div>

                {/* --- New Sections --- */}
                <div className="space-y-16">
                    <CustomerReviews />
                    <AnimatedProgress />
                    <PlaylistsAroundWorld />
                </div>
            </div>
        </div>
    );
}
