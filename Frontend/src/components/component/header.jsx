import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 py-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-yellow-400 transition-transform hover:scale-105 duration-300"
          prefetch={false}
        >
          <span className="text-3xl font-bold tracking-wider">cinépolis</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Movies", "Experiences", "VIP", "Book", "Club Movies", "Offers"].map((item) => (
            <Link
              key={item}
              to="/"
              className="text-lg font-medium text-gray-300 hover:text-yellow-400 transition-all transform hover:scale-110 duration-300"
              prefetch={false}
            >
              {item}
            </Link>
          ))}
        </nav>
        
        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          {/* Location Dropdown */}
          <div className="text-white">
            <button className="flex items-center bg-gray-700 text-gray-300 hover:text-yellow-400 px-4 py-2 rounded-full transition-colors duration-300">
              Ahmedabad
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Search Button */}
          <button className="bg-gray-700 text-gray-300 hover:text-yellow-400 p-2 rounded-full transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4a4 4 0 100 8 4 4 0 000-8zM21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Login/Signup Button */}
          <Link to="/login">
            <Button className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold px-8 py-2">
              Login/Signup
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
