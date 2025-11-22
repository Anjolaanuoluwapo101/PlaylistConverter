import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
    };

    const NavLinks = ({ className }: { className?: string }) => (
        <div className={className}>
            {items.map((item) => (
                <button
                    key={item.uri}
                    onClick={() => handleNavClick(item.uri)}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        url === item.uri
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                >
                    {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                    {item.title}
                </button>
            ))}
        </div>
    );

    return (
        <>
            {/* Mobile Nav - Fixed */}
            <nav className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex-shrink-0 text-gray-900 dark:text-white font-bold text-xl">
                            PlaylistConverter
                        </Link>
                        <div className="-mr-2 flex">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
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

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-96 overflow-y-auto">
                            {items.map((item) => (
                                <button
                                    key={item.uri}
                                    onClick={() => handleNavClick(item.uri)}
                                    className={`flex items-center px-3 py-2.5 text-base font-medium w-full text-left rounded-md ${
                                        url === item.uri
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                                >
                                    {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                                    {item.title}
                                </button>
                            ))}
                            <div className="px-3 py-2 border-t border-gray-200 mt-2 dark:border-gray-700">
                                <SettingsWrapper showText={true} />
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Desktop Sidebar - 20% width */}
            <nav className="hidden lg:flex lg:flex-col lg:w-full h-screen bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
                <Link href="/" className="flex-shrink-0 text-gray-900 dark:text-white font-bold text-xl mb-8">
                    PlaylistConverter
                </Link>
                <NavLinks className="flex flex-col space-y-1" />
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <SettingsWrapper showText={true} />
                </div>
            </nav>
        </>
    );
}