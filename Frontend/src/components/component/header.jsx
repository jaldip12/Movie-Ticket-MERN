import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 py-8 px-6 md:px-10 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-white transition-transform hover:scale-105 duration-300"
          prefetch={false}
        >
          <FilmIcon className="h-10 w-10 mr-3 text-yellow-400" />
          <span className="text-2xl font-extrabold tracking-wider">
            Movie Tickets
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Showtimes", "Experiences", "Contact"].map((item) => (
            <Link
              key={item}
              to="/"
              className="text-sm font-medium text-white hover:text-yellow-400 transition-all transform hover:scale-110 duration-300"
              prefetch={false}
            >
              {item}
            </Link>
          ))}
        </nav>
        <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold px-6 py-2">
          Book Now
        </Button>
      </div>
    </header>
  );
}

function FilmIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}
