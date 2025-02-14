import { motion, AnimatePresence } from "framer-motion";
import SidePanel from "./SidePanel";
import AdminDetails from "./AdminDetails";
import AdminHeader from "./AdminHeader"; // Import the Header component

export default function AdminPanel() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Side Panel */}
      <div className="fixed inset-y-0 left-0 z-30">
        <SidePanel />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-800/90 backdrop-blur-sm shadow-md">
        <AdminHeader /> {/* Use the imported Header component here */}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64 mt-[64px] transition-all duration-300 ease-in-out">
        <AnimatePresence mode="wait">
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

