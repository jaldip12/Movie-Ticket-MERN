import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sliders } from "./sliders";

export function Landingpage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-900 to-blue-500 py-6 px-4 md:px-8 shadow-md rounded-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-white"
            prefetch={false}
          >
            <FilmIcon className="h-8 w-8 mr-3" />
            <span className="text-xl font-bold tracking-wide">Cinescape</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-white hover:text-black transition-transform transform hover:scale-105 duration-300"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-white hover:text-black transition-transform transform hover:scale-105 duration-300"
              prefetch={false}
            >
              Showtimes
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-white hover:text-black transition-transform transform hover:scale-105 duration-300"
              prefetch={false}
            >
              Experiences
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-white hover:text-black transition-transform transform hover:scale-105 duration-300"
              prefetch={false}
            >
              Contact
            </Link>
          </nav>
          <Button className="bg-blue-50 text-black hover:bg-blue-800 transition-transform transform hover:scale-105 duration-300 shadow-lg rounded-full">
            Book Tickets
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {/* Centering Slider */}
        <div className="flex justify-center items-center py-12">
          <Sliders />
        </div>

        <div className="py-12 md:py-24 bg-muted">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:border hover:border-primary hover:scale-105 transition duration-300">
                <PopcornIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Gourmet Concessions
                </h3>
                <p className="text-muted-foreground">
                  Indulge in our selection of premium snacks and beverages to
                  elevate your movie-going experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:border hover:border-primary hover:scale-105 transition duration-300">
                <TvIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">High-End A/V</h3>
                <p className="text-muted-foreground">
                  Enjoy breathtaking visuals and immersive sound in our
                  state-of-the-art private screening rooms.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:border hover:border-primary hover:scale-105 transition duration-300">
                <SofaIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Luxury Seating</h3>
                <p className="text-muted-foreground">
                  Sink into our plush, comfortable seating and enjoy the
                  ultimate in movie-watching bliss.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-12 md:py-24 bg-white">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Upcoming Showtimes
                </h2>
                <p className="text-muted-foreground">
                  Check out our latest movie offerings and book your tickets
                  today.
                </p>
              </div>
              <Link
                to="#"
                className="inline-flex items-center text-primary hover:underline"
                prefetch={false}
              >
                View All Showtimes
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover w-full"
                  style={{ aspectRatio: "400/600" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Raayan</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 7:00 PM, 9:30 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover w-full"
                  style={{ aspectRatio: "400/600" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Kalki 2898 AD</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 6:30 PM, 9:00 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover w-full"
                  style={{ aspectRatio: "400/600" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Deadpool</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 8:00 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <FilmIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Cinescape</span>
          </div>
          <nav className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ChevronRightIcon(props) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
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

function PopcornIcon(props) {
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
      <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" />
      <path d="M10 22 9 8" />
      <path d="m14 22 1-14" />
      <path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z" />
    </svg>
  );
}

function SofaIcon(props) {
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
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 4v9" />
    </svg>
  );
}

function TvIcon(props) {
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
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}
