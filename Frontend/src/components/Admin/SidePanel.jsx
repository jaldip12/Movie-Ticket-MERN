import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { PiList } from "react-icons/pi";
import {
  LayoutGrid,
  Film,
  Calendar,
  Sofa,
  Ticket,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    icon: <LayoutGrid className="h-5 w-5" />,
    fillIcon: <LayoutGrid className="h-5 w-5 text-yellow-400" />,
    label: "Dashboard",
    path: "/admin",
  },
  {
    icon: <Film className="h-5 w-5" />,
    fillIcon: <Film className="h-5 w-5 text-yellow-400" />,
    label: "Movies",
    path: "/admin/movies",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    fillIcon: <Calendar className="h-5 w-5 text-yellow-400" />,
    label: "Bookings",
    path: "/admin/bookings",
  },
  {
    icon: <Sofa className="h-5 w-5" />,
    fillIcon: <Sofa className="h-5 w-5 text-yellow-400" />,
    label: "Seating",
    path: "/admin/seating",
  },
  {
    icon: <Ticket className="h-5 w-5" />,
    fillIcon: <Ticket className="h-5 w-5 text-yellow-400" />,
    label: "Shows",
    path: "/admin/shows",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    fillIcon: <Settings className="h-5 w-5 text-yellow-400" />,
    label: "Settings",
    path: "/admin/settings",
  },
];

const SidePanel = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState(window.location.pathname);

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing localStorage, cookies, etc.)
     // Adjust based on your auth implementation
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: "-100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 0.2, type: "tween" }}
      className={`bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl h-screen flex flex-col transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4">
        <button
          className="inline-block rounded-xl hover:bg-gray-700/50 transition p-3"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <PiList className="text-[1.6rem] text-gray-300 hover:text-yellow-400" />
        </button>
      </div>

      <nav className="p-4 flex-grow">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-md transition-all duration-300 ${
              selected === item.path
                ? "text-yellow-400 bg-gray-700/50"
                : "text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50"
            }`}
            onClick={() => setSelected(item.path)}
          >
            {selected === item.path ? item.fillIcon : item.icon}
            <span
              className={`transition-opacity ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className={`
            w-full flex items-center justify-center gap-3 
            bg-gray-700 text-gray-300 
            hover:text-yellow-400 hover:bg-gray-600 
            active:bg-gray-800
            transition-all duration-300 
            rounded-md py-2.5
            relative
            ${expanded ? "px-4" : "px-2"}
          `}
          aria-label="Log out"
        >
          
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default SidePanel;
