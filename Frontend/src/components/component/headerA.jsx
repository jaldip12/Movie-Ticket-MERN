import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function HeaderA() {
    return (
        <nav className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg sticky top-0 z-50">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 text-white hover:scale-105 transition-transform duration-200">
                <FilmIcon className="h-8 w-8 text-red-500 animate-pulse" />
                <span className="text-2xl font-extrabold tracking-wide">Movie Tickets</span>
            </Link>

            {/* Page Title */}
            <h1 className="text-xl md:text-2xl font-bold text-white">Admin Dashboard</h1>

            {/* Dropdown Menu */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-800 transition-colors">
                            Menu
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-blue-800 border border-blue-700 rounded-md shadow-md">
                        <DropdownMenuLabel className="text-white bg-red-600 px-3 py-2">Options</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-red-500" />
                        <DropdownMenuItem className="text-white hover:bg-red-600 px-4 py-2 cursor-pointer transition-colors">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-red-600 px-4 py-2 cursor-pointer transition-colors">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-red-600 px-4 py-2 cursor-pointer transition-colors">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}

function FilmIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 3v18" />
            <path d="M3 7.5h4" />
            <path d="M3 12h18" />
            <path d="M3 16.5h4" />
            <path d="M17 3v18" />
            <path d="M17 7.5h4" />
            <path d="M17 16.5h4" />
        </svg>
    );
}
