import { LayoutDashboard, Music, Replace, RefreshCw, Wrench } from "lucide-react";

const NavBarData = [
    {
        title: "Connect Platforms",
        uri: "/connect",
        icon: LayoutDashboard

    },
    {
        title: "Playlists",
        uri: "/playlists",
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
    },
    {
        title: "Build",
        uri: "/builder",
        icon: Wrench
    }
]

const description = `PlaylistSync is a web platform that lets users seamlessly connect and synchronize playlists across Spotify and YouTube Music. It's built with Laravel(backend), React, Inertia.js(frontend) for a fast, app-like experience.`


export { NavBarData, description }