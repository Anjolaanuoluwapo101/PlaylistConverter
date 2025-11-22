import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { UserPlus, LogIn } from 'lucide-react';
import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="lg:w-64 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-40 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
                {auth.user ? (
                    <NavBar items={NavBarData} />
                ) : (
                    <NavBar
                        items={[
                            {
                                title: 'Register',
                                uri: '/register',
                                icon: UserPlus,
                            },
                            {
                                title: 'Login',
                                uri: '/login',
                                icon: LogIn,
                            },
                        ]}
                    />
                )}
            </div>
            <main className="w-full lg:ml-64 flex flex-col min-h-screen">
                <div className="flex-grow p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
                <footer className="bg-gray-900 text-white p-4 text-center mt-auto">
                    <div className="max-w-7xl mx-auto">
                        <p>&copy; {new Date().getFullYear()} PlaylistConverter. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}