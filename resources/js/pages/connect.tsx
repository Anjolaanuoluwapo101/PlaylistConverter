import Platform from '@/components/user/Platform';
import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import { Replace, RefreshCw, Wrench } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <MainLayout>
            <Head title="Dashboard" />
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center py-12 md:py-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Welcome to <span className="text-blue-600">PlaylistConverter</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                        Seamlessly convert, sync, and build playlists across Spotify and YouTube Music
                    </p>
                    
                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
                        <div 
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.visit('/convert')}
                        >
                            <div className="flex justify-center mb-4">
                                <Replace className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Convert Playlists</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Transfer your favorite playlists between platforms with perfect track matching
                            </p>
                        </div>
                        
                        <div 
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.visit('/sync')}
                        >
                            <div className="flex justify-center mb-4">
                                <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sync Playlists</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Keep your playlists in sync across platforms with automatic updates
                            </p>
                        </div>
                        
                        <div 
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.visit('/builder')}
                        >
                            <div className="flex justify-center mb-4">
                                <Wrench className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Build Playlists</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create custom playlists by combining tracks from both platforms
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Platform Connection Section */}
                <div className="py-8">
                    <Platform />
                </div>
            </div>
        </MainLayout>
    );
}