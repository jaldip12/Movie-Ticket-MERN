import { useContext, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AdminContext } from "@/context/AdminContext";
import axios from "axios";

export default function AdminLogin() {
  const { setAdmininfo } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/admin/login",
        {
          email: e.target.email.value,
          password: e.target.password.value,
        }
      );

      if (response.data.statusCode === 200) {
        localStorage.setItem("adminToken", response.data.data.token);
        setAdmininfo(response.data.data);
        navigate("/admin");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-yellow-500">
            Welcome Back
          </h1>

          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold py-3"
          >
            Login
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
