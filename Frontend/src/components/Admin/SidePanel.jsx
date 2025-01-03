import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Film,
  Calendar,
  Sofa,
  Ticket,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/admin' },
  { icon: Film, label: 'Movies', path: '/admin/movies' },
  { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
  { icon: Sofa, label: 'Seating', path: '/admin/seating' },
  { icon: Ticket, label: 'Shows', path: '/admin/shows' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const SidePanel = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl h-screen flex flex-col">
      <nav className="p-4 flex-grow">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-3 p-3 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300"
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full flex items-center justify-center gap-3 bg-gray-700 text-gray-300 hover:text-yellow-400 hover:bg-gray-600 transition-all duration-300 rounded-md py-2"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default SidePanel;
