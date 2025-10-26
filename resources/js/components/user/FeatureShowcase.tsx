
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
} from 'lucide-react';

// --- Feature Data ---
// This array holds the data for each feature card.
// To add, remove, or modify a feature, you can simply edit this array.
const featureData = [
    {
        icon: Zap,
        title: 'Playlist Conversion',
        description: 'Convert playlists seamlessly between Spotify and YouTube Music. Our advanced engine matches tracks accurately and handles large playlists effortlessly.',
    },
    {
        icon: Repeat,
        title: 'Real-Time Sync',
        description: 'Sync your playlists across platforms in real-time. Changes on one platform automatically update the other, keeping your music in harmony.',
    },
    {
        icon: Sparkles,
        title: 'Build Custom Playlists',
        description: 'Create new playlists from scratch or by searching and adding tracks. Use our builder to curate the perfect collection.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure Authentication',
        description: 'Connect your accounts securely using official APIs. Your data is encrypted and never stored, ensuring complete privacy.',
    },
    {
        icon: Share2,
        title: 'Share & Collaborate',
        description: 'Share converted playlists with friends or collaborate on builds. Works across Spotify and YouTube Music seamlessly.',
    },
    {
        icon: Palette,
        title: 'Personalized Settings',
        description: 'Customize your experience with themes, notifications, and platform preferences. Tailor the app to fit your style.',
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
                    delay: index * 0.2,
                    duration: 1.0,
                    ease: 'easeInOut',
                    type: 'spring',
                    stiffness: 120,
                    damping: 20,
                },
            }}
            whileHover={{
                scale: 1.08,
                rotateY: 8,
                boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(124, 58, 237, 0.1)',
            }}
            viewport={{ once: true, amount: 0.3 }}
            style={{ y }}
            className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-in-out transform hover:-translate-y-4 border border-neutral-200/60 dark:border-neutral-700/60 relative overflow-hidden"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-blue-500/15 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"
            />
            <motion.div
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                className="flex items-center justify-center h-18 w-18 mb-8 rounded-full text-white shadow-lg"
                whileHover={{ scale: 1.15, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Icon className="w-9 h-9" />
            </motion.div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{title}</h3>
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
        { name: 'Adebayo O.', text: 'Naija to the world! Converted my Afrobeat playlists from Spotify to YouTube without missing a beat. Amazing!', rating: 5 },
        { name: 'Chinwe N.', text: 'The sync feature keeps my music flowing across platforms. Perfect for my daily commute in Lagos.', rating: 5 },
        { name: 'Emeka T.', text: 'Built custom playlists for my wedding with ease. Secure and fast – jollof rice for the soul!', rating: 5 },
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
 * Interactive progress visualization with floating particles and dynamic animations.
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
            className="py-20 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/10 dark:to-blue-500/20 rounded-3xl shadow-2xl mx-4 relative overflow-hidden"
        >
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        scale: 0,
                    }}
                    animate={{
                        y: [null, '-20px'],
                        scale: [0, 1, 0],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            <div className="text-center relative z-10">
                <motion.div
                    className="relative inline-block mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <TrendingUp className="w-20 h-20 text-purple-500 drop-shadow-lg" />
                    <motion.div
                        className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>

                <motion.h3
                    className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Conversions So Far
                </motion.h3>

                <div className="relative w-full max-w-lg mx-auto mb-8">
                    <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-6 shadow-inner">
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-6 rounded-full shadow-lg relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress / target) * 100}%` }}
                            transition={{ duration: 3, ease: 'easeOut' }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                    </div>
                    <motion.div
                        className="absolute top-0 left-0 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / target) * 100}%` }}
                        transition={{ duration: 3, ease: 'easeOut', delay: 0.5 }}
                    />
                </div>

                <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                >
                    <motion.p
                        className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {progress.toLocaleString()}+
                    </motion.p>
                    <motion.p
                        className="text-lg text-neutral-600 dark:text-neutral-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        Playlists converted worldwide
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    );
};

/**
 * PlaylistsAroundWorld Component
 * Interactive globe visualization with rotating elements and dynamic stats.
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
            className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl shadow-2xl mx-4 relative overflow-hidden"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: Math.random() * 100 + '%',
                            scale: 0,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            <div className="text-center relative z-10">
                <motion.div
                    className="relative inline-block mb-6"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="relative"
                    >
                        <Globe className="w-20 h-20 text-purple-500 drop-shadow-lg" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </motion.div>
                </motion.div>

                <motion.h3
                    className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Playlists Around the World
                </motion.h3>

                <motion.p
                    className="text-lg text-neutral-600 dark:text-neutral-300 mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Powered by our Sync feature
                </motion.p>

                <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                >
                    <motion.p
                        className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {count.toLocaleString()}+
                    </motion.p>
                    <motion.p
                        className="text-lg text-neutral-600 dark:text-neutral-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        Playlists synced globally
                    </motion.p>
                </motion.div>

                {/* Interactive dots representing locations */}
                <div className="absolute inset-0 pointer-events-none">
                    {[
                        { x: '20%', y: '30%' }, // Africa
                        { x: '60%', y: '25%' }, // Europe
                        { x: '80%', y: '40%' }, // Asia
                        { x: '15%', y: '60%' }, // South America
                        { x: '70%', y: '70%' }, // Australia
                    ].map((pos, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-lg"
                            style={{ left: pos.x, top: pos.y }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>
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
