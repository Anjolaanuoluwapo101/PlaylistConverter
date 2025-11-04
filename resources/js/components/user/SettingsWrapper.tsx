import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';

interface Props {
    showText?: boolean;
}

export default function SettingsWrapper({ showText = false }: Props) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const buttonClassName = showText
        ? "w-full flex items-center gap-2 text-left px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-black"
        : "p-1 text-gray-600 hover:text-black focus:outline-none";


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