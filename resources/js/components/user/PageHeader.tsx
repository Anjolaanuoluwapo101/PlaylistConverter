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
            // Show description after typing completes
            setTimeout(() => {
                setShowDescription(true);
            }, 200);
        }
    }, [currentIndex, title]);

    return (
        <div className={`text-center mb-8 ${className}`}>
            {/* Title with typing animation */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                {displayedTitle}
                {!isTypingComplete && (
                    <span className="animate-pulse text-purple-600 dark:text-purple-400">|</span>
                )}
            </h2>

            {/* Description with fade-in animation */}
            <p
                className={`text-lg text-purple-600/80 dark:text-purple-400/80 font-medium transition-all duration-500 ${
                    showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                {description}
            </p>
        </div>
    );
};

export default PageHeader;
