
import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import SettingsWrapper from './SettingsWrapper';

type NavItem = {
    title: string;
    uri: string;
    icon?: React.ComponentType<{ className?: string }>;
};

type Props = {
    items: NavItem[];
};

export default function NavBar({ items }: Props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url } = usePage();

    const handleNavClick = (uri: string) => {
        router.visit(uri);
    };

    const NavLinks = ({ className }: { className?: string }) => (
        <div className={className}>
            {items.map((item) => (
                <button
                    key={item.uri}
                    onClick={() => handleNavClick(item.uri)}
                    className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                        url === item.uri
                            ? 'text-white'
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.title}
                    {url === item.uri && (
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                            layoutId="underline"
                            initial={false}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 text-white font-bold text-xl">
                            PlaylistConverter
                        </Link>
                        <div className="hidden md:block">
                            <NavLinks className="ml-10 flex items-baseline space-x-4" />
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <SettingsWrapper />
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* <AnimatePresence> */}
                {isMobileMenuOpen && (
                    // <motion.div
                    //     initial={{ height: 0, opacity: 0 }}
                    //     animate={{ height: 'auto', opacity: 1 }}
                    //     exit={{ height: 0, opacity: 0 }}
                    //     transition={{ duration: 0.3, ease: 'easeInOut' }}
                    //     className="md:hidden"
                    // >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {items.map((item) => (
                                <button
                                    key={item.uri}
                                    onClick={() => {
                                        handleNavClick(item.uri);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                                        url === item.uri
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                                    {item.title}
                                </button>
                            ))}
                            <div className="px-3 py-2">
                                 <SettingsWrapper showText={true} />
                            </div>
                        </div>
                    // </motion.div>
                )}
            {/* </AnimatePresence> */}
        </nav>
    );
}