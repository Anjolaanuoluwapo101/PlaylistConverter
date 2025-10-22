import React from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { Sun, Moon, User, Palette } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function Settings({ isOpen, onClose }: Props) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                    <div className="p-1">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Settings</span>
                            </div>
                        </div>
                        <div className="p-1 space-y-1">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 group"
                            >
                                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/70 transition-colors">
                                    {appearance === 'dark' ? (
                                        <Sun className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                        <Moon className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                                <span className="font-medium">{appearance === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            <Link
                                href="/profile"
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 group"
                                onClick={onClose}
                            >
                                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/70 transition-colors">
                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="font-medium">View Profile</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}