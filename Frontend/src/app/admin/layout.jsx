"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SidePanel } from "@/components/side-panel"

export default function AdminLayout({
  children
}) {
  return (
    (<div className="flex h-screen bg-gray-900 text-gray-100">
      <SidePanel />
      <AnimatePresence mode="wait">
        <motion.main
          key={children?.toString()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6">
          {children}
        </motion.main>
      </AnimatePresence>
    </div>)
  );
}

