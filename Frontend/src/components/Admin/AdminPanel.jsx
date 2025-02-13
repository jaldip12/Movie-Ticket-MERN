// import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard } from "react-icons/md";
import SidePanel from "./SidePanel";
import AdminDetails from "./AdminDetails";

export function AdminPanel() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="fixed inset-y-0 left-0 z-30">
        <SidePanel />
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        <AnimatePresence mode="wait">
          {/* Header Section */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.4 }}
            className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg mb-4 md:mb-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <MdDashboard className="text-yellow-400 text-3xl md:text-4xl" />
                <motion.h2
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-white"
                >
                  Dashboard
                </motion.h2>
              </div>

              {/* <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="bg-gray-700/90 text-white pl-12 pr-4 py-2.5 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-yellow-400/50 
                           w-full transition-all duration-300 
                           hover:bg-gray-600/90 placeholder-gray-400"
                />
              </div> */}
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 
                     shadow-lg min-h-[calc(100vh-theme(spacing.32))]"
          >
            <AdminDetails
              className="h-full" // Add this to ensure AdminDetails takes full height
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminPanel;
