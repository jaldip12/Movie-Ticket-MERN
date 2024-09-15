import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function HeaderA() {
  return (
    <nav className="w-full flex items-center gap-2 font-semibold">
      
      <section className="sticky top-0 z-10 w-full flex h-16 items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 px-6 shadow-lg">
        <Link to="/" className="flex items-center gap-2 text-white transition-transform hover:scale-105">
          <FilmIcon className="h-7 w-7 text-red-500 animate-pulse" />
          <div className='w-100 text-xl font-bold'>Movie Tickets</div>
        </Link>
        <h1 className="text-2xl font-bold text-white text-shadow">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-white border-red-500 hover:bg-red-600 hover:text-white transition-colors duration-300">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-blue-800 rounded-md overflow-hidden">
              <DropdownMenuLabel className="text-white px-3 py-2 bg-red-600">Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-red-500" />
              <DropdownMenuItem className="text-white hover:bg-red-600 transition-colors duration-200 px-3 py-2">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-red-600 transition-colors duration-200 px-3 py-2">Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-red-600 transition-colors duration-200 px-3 py-2">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>
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
