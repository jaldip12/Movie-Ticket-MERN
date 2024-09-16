import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-10 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-6 md:mb-0">
          <FilmIcon className="h-8 w-8 mr-3 text-yellow-400" />
          <span className="text-2xl font-bold">Movie Tickets</span>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
          {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
            <Link
              key={item}
              to="/"
              className="text-sm font-medium hover:text-yellow-400 transition-colors duration-300"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
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