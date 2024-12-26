import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutGridIcon, FilmIcon, CalendarIcon, SofaIcon, TicketIcon, SettingsIcon, LogOutIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function SidePanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 shadow-lg relative transition-all duration-300`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-gray-700 rounded-full p-1.5 text-gray-300 hover:text-yellow-400 z-10"
      >
        {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
      </button>

      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        {!isCollapsed && <h1 className="text-2xl font-bold text-yellow-400">cinépolis</h1>}
      </div>

      <nav className="p-4">
        {[
          { icon: LayoutGridIcon, label: "Dashboard", path: "/admin" },
          { icon: FilmIcon, label: "Movies", path: "/admin/movies" },
          { icon: CalendarIcon, label: "Bookings", path: "/admin/bookings" },
          { icon: SofaIcon, label: "Seating", path: "/admin/seating" },
          { icon: TicketIcon, label: "Shows", path: "/admin/shows" },
          { icon: SettingsIcon, label: "Settings", path: "/admin/settings" },
        ].map(({ icon: Icon, label, path }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-3 p-3 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all duration-300"
            title={isCollapsed ? label : ""}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`absolute bottom-0 ${isCollapsed ? 'w-16' : 'w-64'} p-4`}>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-300 hover:text-yellow-400 hover:bg-gray-600 transition-colors duration-300"
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOutIcon className="h-4 w-4" />
          {!isCollapsed && <span>Log out</span>}
        </Button>
      </div>
    </aside>
  );
}

export default SidePanel;
