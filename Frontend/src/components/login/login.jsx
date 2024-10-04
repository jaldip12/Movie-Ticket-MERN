import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-yellow-500">Welcome Back</h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input 
                id="password" 
                type="password"
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold py-3"
          >
            Login
          </Button>
          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-medium text-yellow-500 hover:text-yellow-400 underline transition-colors"
              prefetch={false}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


