import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiMagnifyingGlassDuotone } from "react-icons/pi";
import SidePanel from "./SidePanel";

export function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SidePanel />

      <main className="flex-1 p-8 md:ml-64 overflow-y-auto">
        <AnimatePresence>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-yellow-400 mb-4 md:mb-0"
            >
              Dashboard
            </motion.h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full md:w-64"
              />
              <PiMagnifyingGlassDuotone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminPanel;
