import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NowShowing() {
  const movies = [
    {
      title: "Stree2",
      times: ["7:00 PM", "9:30 PM"],
      genre: "Horror/Drama",
      poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/stree2.jpg",
    },
    {
      title: "Kalki 2898 AD",
      times: ["6:30 PM", "9:00 PM"],
      genre: "Sci-Fi/Adventure",
      poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/kalki.jpg",
    },
    {
      title: "Deadpool",
      times: ["8:00 PM"],
      genre: "Action/Comedy",
      poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/deadpool.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-100 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-5xl font-bold mb-4 text-blue-900 drop-shadow-md">
              Now Showing
            </h2>
            <p className="text-xl text-gray-700">
              Discover our latest cinematic offerings
            </p>
          </div>
          <Link
            to="/showtimes"
            className="group inline-flex items-center text-blue-700 hover:text-blue-900 text-lg font-semibold mt-6 md:mt-0 transition-colors duration-300"
          >
            View All Showtimes
            <ChevronRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie, index) => (
            <Card
              key={index}
              className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={`${movie.title} Poster`}
                  className="w-full h-auto object-cover"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <CardContent className="p-4 bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {movie.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{movie.genre}</p>
                <p className="text-gray-700 mb-4">
                  Showtimes: {movie.times.join(", ")}
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors duration-300">
                  Book Tickets
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
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
