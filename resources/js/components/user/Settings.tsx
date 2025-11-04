import React from 'react';
import { User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function Settings({ isOpen, onClose }: Props) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-gray-200 shadow-lg z-50">
            <div className="p-1">
                <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Settings</span>
                    </div>
                </div>
                <div className="p-1 space-y-1">
                    <Link
                        href="/settings/profile"
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={onClose}
                    >
                        <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200">
                            <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium">View Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
