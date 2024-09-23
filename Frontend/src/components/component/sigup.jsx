import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export function Sigup() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-yellow-500">Sign Up</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        <form className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Enter your name" 
              required 
              className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              required 
              className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              required 
              className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold py-3 mt-4"
          >
            Sign Up
          </Button>
        </form>
        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="font-medium text-yellow-500 hover:text-yellow-400 underline transition-colors"
            prefetch={false}
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
