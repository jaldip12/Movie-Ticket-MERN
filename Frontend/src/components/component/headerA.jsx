import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { FilmIcon, UserIcon, SettingsIcon, LogOutIcon } from 'lucide-react';

export function HeaderA() {
    return (
        <header className="bg-gray-800 py-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center text-yellow-400 transition-transform hover:scale-105 duration-300"
                    prefetch={false}
                >
                    <FilmIcon className="h-8 w-8 mr-2" />
                    <span className="text-3xl font-bold tracking-wider">cinépolis</span>
                </Link>

                {/* Page Title */}
                <h1 className="text-2xl font-bold text-yellow-400">Admin Dashboard</h1>

                {/* Dropdown Menu */}
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="bg-gray-700 text-gray-300 hover:text-yellow-400 hover:bg-gray-600 transition-colors duration-300 flex items-center space-x-2 rounded-full px-4 py-2">
                                <UserIcon className="h-5 w-5" />
                                <span>Admin</span>
                                <svg
                                    className="w-4 h-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 text-white border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                            <DropdownMenuItem className="hover:bg-gray-700 hover:text-yellow-400 flex items-center px-4 py-3 transition-colors duration-200">
                                <UserIcon className="mr-3 h-5 w-5" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700 hover:text-yellow-400 flex items-center px-4 py-3 transition-colors duration-200">
                                <SettingsIcon className="mr-3 h-5 w-5" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700 hover:text-yellow-400 flex items-center px-4 py-3 transition-colors duration-200">
                                <LogOutIcon className="mr-3 h-5 w-5" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
