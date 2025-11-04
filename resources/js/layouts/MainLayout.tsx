
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black">
            <div className="lg:w-[25%] lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-40">
                {auth.user ? (
                    <NavBar items={NavBarData} />
                ) : (
                    <NavBar
                        items={[
                            {
                                title: 'Register',
                                uri: '/register',
                            },
                            {
                                title: 'Login',
                                uri: '/login',
                            },
                        ]}
                    />
                )}
            </div>
            <main className="w-full lg:ml-[25%] p-6 lg:p-8 lg:pt-20 md:pt-20">{children}</main>
        </div>
    );
}
