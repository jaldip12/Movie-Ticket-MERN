import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-gray-900 py-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-white transition-transform hover:scale-105 duration-300"
          prefetch={false}
        >
          <span className="text-3xl font-bold tracking-wider">cinépolis</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Movies", "Experiences", "Cinépolis VIP", "Book An Event", "Club Cinépolis", "Offers"].map((item) => (
            <Link
              key={item}
              to="/"
              className="text-lg font-medium text-white hover:text-yellow-300 transition-all transform hover:scale-110 duration-300"
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
            <button className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-full">
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
          <button className="bg-gray-700 text-white p-2 rounded-full">
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
          <Button className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold px-8 py-2">
            Login/Signup
          </Button>
        </div>
      </div>
    </header>
  );
}
