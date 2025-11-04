import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white p-4 text-center">
            <div className="max-w-7xl mx-auto">
                <p>&copy; {new Date().getFullYear()} PlaylistConverter. All rights reserved.</p>
            </div>
        </footer>
    );
}
