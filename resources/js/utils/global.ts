import { LayoutDashboard, Music, Replace, RefreshCw } from "lucide-react";

const NavBarData = [
    {
        title: "Home",
        uri: "/dashboard",
        icon: LayoutDashboard

    },
    {
        title: "Playlists",
        uri: "/playlists/show",
        icon: Music
    },
    {
        title: "Convert",
        uri: "/convert",
        icon: Replace
    },
    {
        title: "Sync",
        uri: "/sync",
        icon: RefreshCw
    }
]

const description = `PlaylistSync is a web platform that lets users seamlessly connect and synchronize playlists across Spotify and YouTube Music. It's built with Laravel(backend), React, Inertia.js(frontend) for a fast, app-like experience.`


export { NavBarData, description }