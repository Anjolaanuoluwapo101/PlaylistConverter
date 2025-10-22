import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Playlist {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    track_count?: number;
    owner?: string;
    public?: boolean;
    collaborative?: boolean;
    platform: 'spotify' | 'youtube';
    url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Track {
    id: string;
    name: string;
    artist: string;
    album?: string;
    duration_ms?: number;
    image?: string;
    url?: string;
    platform: 'spotify' | 'youtube';
}

export interface ConnectedPlatforms {
    connected_platforms: Record<string, boolean>;
}
