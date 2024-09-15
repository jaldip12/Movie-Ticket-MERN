import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sliders } from "./sliders";

export function Landingpage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <header className="bg-gradient-to-r from-indigo-900 to-purple-700 py-8 px-6 md:px-10 shadow-xl">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-white transition-transform hover:scale-105 duration-300"
            prefetch={false}
          >
            <FilmIcon className="h-10 w-10 mr-3 text-yellow-400" />
            <span className="text-2xl font-extrabold tracking-wider">Cinescape</span>
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
          <Button className="bg-yellow-400 text-indigo-900 hover:bg-yellow-500 transition-all transform hover:scale-105 duration-300 shadow-lg rounded-full font-bold px-6 py-2">
            Book Now
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-16">
          <Sliders />
        </div>

        <div className="py-16 md:py-24 bg-white">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-indigo-900">Experience the Magic</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: PopcornIcon, title: "Gourmet Concessions", description: "Indulge in premium snacks and beverages." },
                { icon: TvIcon, title: "Cutting-Edge A/V", description: "Immerse yourself in state-of-the-art visuals and sound." },
                { icon: SofaIcon, title: "Luxurious Comfort", description: "Relax in our plush, ergonomic seating." },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300">
                  <feature.icon className="h-16 w-16 mb-6 text-purple-600" />
                  <h3 className="text-2xl font-semibold mb-4 text-indigo-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="py-16 md:py-24 bg-gradient-to-r from-indigo-100 to-purple-100">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-900">
                  Now Showing
                </h2>
                <p className="text-xl text-gray-600">
                  Discover our latest cinematic offerings
                </p>
              </div>
              <Link
                to="#"
                className="inline-flex items-center text-purple-600 hover:text-purple-800 text-lg font-semibold mt-6 md:mt-0"
                prefetch={false}
              >
                View All Showtimes
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { title: "Raayan", times: "7:00 PM, 9:30 PM" },
                { title: "Kalki 2898 AD", times: "6:30 PM, 9:00 PM" },
                { title: "Deadpool", times: "8:00 PM" },
              ].map((movie, index) => (
                <Card key={index} className="overflow-hidden transition-all hover:shadow-2xl hover:scale-105 duration-300">
                  <img
                    src={`https://source.unsplash.com/random/400x600?movie,${index}`}
                    width={400}
                    height={600}
                    alt={`${movie.title} Poster`}
                    className="w-full object-cover"
                    style={{ aspectRatio: "2/3" }}
                  />
                  <CardContent className="p-6 bg-gradient-to-b from-gray-50 to-gray-100">
                    <h3 className="text-2xl font-bold mb-3 text-indigo-900">{movie.title}</h3>
                    <p className="text-gray-600 mb-4">
                      Showtimes: {movie.times}
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300">Book Tickets</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-indigo-900 text-white py-10 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <FilmIcon className="h-8 w-8 mr-3 text-yellow-400" />
            <span className="text-2xl font-bold">Cinescape</span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
              <Link
                key={item}
                to="/"
                className="text-sm font-medium hover:text-yellow-400 transition-colors duration-300"
                prefetch={false}
              >
                {item}
              </Link>
            ))}
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
