import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MovieDetailsPage = ({ movieData }) => {
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  // Default values in case API data is loading or undefined
  const defaultData = {
    title: "Loading...",
    rating: 0,
    votes: 0,
    duration: "",
    genres: [],
    releaseDate: "",
    description: "",
    language: "",
    certificate: "",
    posterUrl: "/api/placeholder/300/450"
  };

  // Merge provided data with defaults
  const movie = { ...defaultData, ...movieData };

  const handleBookTickets = () => {
    navigate(`/Movies/${movieTitle}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        
        {/* Main Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Movie Poster */}
            <div className="w-full md:w-1/3">
              <div className="relative group">
                <img
                  src={movie.posterUrl}
                  alt={`${movie.title} Poster`}
                  className="w-full rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105"
                />
                <button className="absolute top-4 left-4 bg-black/70 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-black transition-colors">
                  <span className="text-red-500">▶</span>
                  <span>Watch Trailer</span>
                </button>
              </div>
              <div className="mt-6 text-center md:text-left">
                <span className="text-emerald-400 font-semibold text-lg">Now Showing</span>
              </div>
            </div>

            {/* Movie Details */}
            <div className="w-full md:w-2/3 text-white">
              <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {movie.title}
              </h1>

              {/* Rating Section */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-3 bg-gray-800/50 px-6 py-3 rounded-xl">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <div>
                    <span className="text-2xl font-bold">{movie.rating}/10</span>
                    <p className="text-sm text-gray-400">{movie.votes} Votes</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-gray-700 transition-colors">
                  Rate Movie
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-4 mb-8">
                {movie.language && (
                  <span className="px-6 py-2 bg-gray-800/50 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                    {movie.language}
                  </span>
                )}
                <span className="px-6 py-2 bg-gray-800/50 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">2D</span>
                {movie.duration && (
                  <span className="px-6 py-2 bg-gray-800/50 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                    {movie.duration}
                  </span>
                )}
                {movie.genres.map((genre, index) => (
                  <span key={index} className="px-6 py-2 bg-gray-800/50 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                    {genre}
                  </span>
                ))}
                {movie.certificate && (
                  <span className="px-6 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                    {movie.certificate}
                  </span>
                )}
                {movie.releaseDate && (
                  <span className="px-6 py-2 bg-gray-800/50 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                    {movie.releaseDate}
                  </span>
                )}
              </div>

              {/* Book Tickets Button */}
              <button 
                onClick={handleBookTickets}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20">
                Book Tickets Now
              </button>

              {/* About Section */}
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6">About the Movie</h2>
                <p className="text-gray-300 leading-relaxed text-lg">{movie.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;