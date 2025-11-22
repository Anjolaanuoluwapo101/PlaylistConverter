import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';

interface Props {
    showText?: boolean;
}

export default function SettingsWrapper({ showText = false }: Props) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const buttonClassName = showText
        ? "w-full flex items-center gap-3 text-left px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg"
        : "p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md";

    return (
        <div className="relative">
            <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={buttonClassName}
            >
                <SettingsIcon className="h-5 w-5" />
                {showText && <span>Settings</span>}
                {!showText && <span className="sr-only">View settings</span>}
            </button>
            <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}