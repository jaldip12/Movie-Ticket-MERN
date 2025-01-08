"use client"

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Film, Heart, Play, Calendar, Clock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MovieDetailsPage = ({ movieData }) => {
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  const [isLiked, setIsLiked] = React.useState(false);
  const [showTrailer, setShowTrailer] = React.useState(false);

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
    posterUrl: "/api/placeholder/300/450",
    trailerUrl: ""
  };

  // Merge provided data with defaults
  const movie = { ...defaultData, ...movieData };

  const handleBookTickets = () => {
    navigate(`/Movies/${movieTitle}`);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Movie Poster with Enhanced Interactions */}
            <div className="w-full md:w-1/3">
              <div className="relative group cursor-pointer">
                <motion.img
                  src={movie.posterUrl}
                  alt={`${movie.title} Poster`}
                  className="w-full rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-yellow-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
                <Button 
                  className="absolute top-4 left-4 bg-black/70 text-white hover:bg-red-500/90 transition-all duration-300"
                  onClick={() => setShowTrailer(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Trailer
                </Button>
              </div>
              <div className="mt-6 text-center md:text-left">
                <Badge className="bg-emerald-500/20 text-emerald-400 px-4 py-2 text-lg font-semibold hover:bg-emerald-500/30 transition-colors">
                  Now Showing
                </Badge>
              </div>
            </div>

            {/* Enhanced Movie Details Section */}
            <div className="w-full md:w-2/3 text-white">
              <div className="flex justify-between items-start mb-8">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  {movie.title}
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-yellow-500 transition-all duration-300"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-yellow-500 animate-pulse' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isLiked ? "Remove from favorites" : "Add to favorites"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Enhanced Rating Section */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-3 bg-gray-800/50 px-6 py-3 rounded-xl hover:bg-gray-800/70 transition-colors">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <div>
                    <span className="text-2xl font-bold">{movie.rating}/10</span>
                    <p className="text-sm text-gray-400">{movie.votes.toLocaleString()} Votes</p>
                  </div>
                </div>
                <Button className="px-8 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-yellow-500 hover:text-gray-900 transition-all duration-300">
                  Rate Movie
                </Button>
              </div>

              {/* Enhanced Movie Information Tags */}
              <div className="flex flex-wrap gap-4 mb-8">
                {movie.language && (
                  <Badge variant="secondary" className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
                    <Globe className="w-4 h-4" />
                    {movie.language}
                  </Badge>
                )}
                {movie.duration && (
                  <Badge variant="secondary" className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
                    <Clock className="w-4 h-4" />
                    {movie.duration}
                  </Badge>
                )}
                {movie.genres.map((genre, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600 transition-colors"
                  >
                    {genre}
                  </Badge>
                ))}
                {movie.certificate && (
                  <Badge className="bg-red-500/20 text-red-400 px-4 py-2 hover:bg-red-500/30 transition-colors">
                    {movie.certificate}
                  </Badge>
                )}
                {movie.releaseDate && (
                  <Badge variant="secondary" className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
                    <Calendar className="w-4 h-4" />
                    {movie.releaseDate}
                  </Badge>
                )}
              </div>

              {/* Enhanced Book Tickets Button */}
              <Button 
                onClick={handleBookTickets}
                className="w-full md:w-auto px-12 py-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
              >
                <Film className="w-5 h-5 mr-2" />
                Book Tickets Now
              </Button>

              {/* Enhanced About Section */}
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  About the Movie
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg hover:text-white transition-colors">
                  {movie.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <Button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
            onClick={() => setShowTrailer(false)}
          >
            Close
          </Button>
          <div className="w-full max-w-4xl aspect-video">
            {/* Add your video player component here */}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MovieDetailsPage;