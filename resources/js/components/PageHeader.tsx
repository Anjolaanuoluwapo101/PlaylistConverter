import React, { useState, useEffect } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '' }) => {
    const [displayedTitle, setDisplayedTitle] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [gradientIndex, setGradientIndex] = useState(0);

    // Typing animation for title
    useEffect(() => {
        if (currentIndex < title.length) {
            const timeout = setTimeout(() => {
                setDisplayedTitle(prev => prev + title[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 50); // Adjust typing speed here

            return () => clearTimeout(timeout);
        } else {
            setIsTypingComplete(true);
            // Show description after typing is complete
            setTimeout(() => setShowDescription(true), 200);
        }
    }, [currentIndex, title]);

    // Background gradient animation
    useEffect(() => {
        const gradients = [
            'from-purple-600 to-purple-400',
            'from-blue-600 to-blue-400',
            'from-green-600 to-green-400',
            'from-pink-600 to-pink-400',
            'from-indigo-600 to-indigo-400',
            'from-red-600 to-red-400',
            'from-yellow-600 to-yellow-400',
        ];

        const interval = setInterval(() => {
            setGradientIndex(prev => (prev + 1) % gradients.length);
        }, 3000); // Change gradient every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const gradientClasses = [
        'from-purple-600 to-purple-400',
        'from-blue-600 to-blue-400',
        'from-green-600 to-green-400',
        'from-pink-600 to-pink-400',
        'from-indigo-600 to-indigo-400',
        'from-red-600 to-red-400',
        'from-yellow-600 to-yellow-400',
    ];

    return (
        <div className={`text-center mb-8 relative overflow-hidden ${className}`}>
            {/* Animated background gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[gradientIndex]} opacity-10`}
                style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease infinite'
                }}
            />

            {/* Typing cursor effect */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent relative z-10">
                {displayedTitle}
                {!isTypingComplete && (
                    <span className="animate-pulse text-purple-600 dark:text-purple-400">|</span>
                )}
            </h2>

            {/* Description with fade-in animation */}
            <p
                className={`text-lg text-purple-600/80 dark:text-purple-400/80 font-medium relative z-10 transition-all duration-500 ${
                    showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                {description}
            </p>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-bounce"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${2 + i * 0.3}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PageHeader;
