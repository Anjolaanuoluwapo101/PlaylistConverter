
import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';

interface Props {
    showText?: boolean;
}

export default function SettingsWrapper({ showText = false }: Props) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const buttonClassName = showText
        ? "w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        : "p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white";


    return (
        <div className="relative">
            <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={buttonClassName}
            >
                <SettingsIcon className="h-6 w-6" />
                {showText && <span>Settings</span>}
                {!showText && <span className="sr-only">View settings</span>}
            </button>
            <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}