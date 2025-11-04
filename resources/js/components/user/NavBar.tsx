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
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                        url === item.uri
                            ? 'text-black bg-gray-200'
                            : 'text-gray-600 hover:text-black hover:bg-gray-200'
                    }`}
                >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.title}
                </button>
            ))}
        </div>
    );

    return (
        <>
            {/* Mobile Nav - Fixed */}
            <nav className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex-shrink-0 text-black font-bold text-xl">
                            PlaylistConverter
                        </Link>
                        <div className="-mr-2 flex">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-black hover:bg-gray-200 focus:outline-none rounded-md"
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
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-96 overflow-y-auto">
                            {items.map((item) => (
                                <button
                                    key={item.uri}
                                    onClick={() => handleNavClick(item.uri)}
                                    className={`flex items-center px-3 py-2 text-base font-medium w-full text-left rounded-md ${
                                        url === item.uri
                                            ? 'bg-gray-200 text-black'
                                            : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                                    }`}
                                >
                                    {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                                    {item.title}
                                </button>
                            ))}
                            <div className="px-3 py-2 border-t border-gray-200 mt-2">
                                <SettingsWrapper showText={true} />
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Desktop Sidebar - 35% width */}
            <nav className="hidden md:flex md:flex-col md:w-full h-screen bg-white border-r border-gray-200 p-4">
                <Link href="/" className="flex-shrink-0 text-black font-bold text-xl mb-8">
                    PlaylistConverter
                </Link>
                <NavLinks className="flex flex-col space-y-2" />
                <div className="mt-auto">
                    <SettingsWrapper showText={true} />
                </div>
            </nav>
        </>
    );
}
