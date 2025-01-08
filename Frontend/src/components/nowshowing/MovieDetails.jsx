"use client";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Film, Heart, Play, Calendar, Clock, Globe, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fetchMovieDetails = async (title) => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/movies/getmoviebytitle/${title}`);
    const data = await response.json();
    if (data.statusCode === 200) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

const MoviePoster = ({ posterUrl, onTrailerClick }) => (
  <div className="relative group cursor-pointer">
    <motion.img
      src={posterUrl}
      alt="Movie Poster"
      className="w-full rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-yellow-500/20"
    />
    <Button
      className="absolute top-4 left-4 bg-black/70 text-white hover:bg-red-500/90 transition-all duration-300"
      onClick={onTrailerClick}
    >
      <Play className="w-4 h-4 mr-2" /> Watch Trailer
    </Button>
  </div>
);

const MovieDetails = ({ movie, isLiked, onLikeToggle, onBookTickets }) => (
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
              onClick={onLikeToggle}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? "fill-current text-yellow-500 animate-pulse" : ""}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isLiked ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

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

    <div className="flex flex-wrap gap-4 mb-8">
      {movie.language && (
        <Badge className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
          <Globe className="w-4 h-4" /> {movie.language}
        </Badge>
      )}
      {movie.duration && (
        <Badge className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
          <Clock className="w-4 h-4" /> {movie.duration}
        </Badge>
      )}
      {movie.genres.map((genre, index) => (
        <Badge
          key={index}
          className="bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600 transition-colors"
        >
          {genre}
        </Badge>
      ))}
      {movie.certification && (
        <Badge className="bg-red-500/20 text-red-400 px-4 py-2 hover:bg-red-500/30 transition-colors">
          {movie.certification}
        </Badge>
      )}
      {movie.releaseDate && (
        <Badge className="flex items-center gap-2 bg-gray-700 text-yellow-500 px-4 py-2 hover:bg-gray-600">
          <Calendar className="w-4 h-4" /> {movie.releaseDate}
        </Badge>
      )}
    </div>

    <Button
      onClick={onBookTickets}
      className="w-full md:w-auto px-12 py-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
    >
      <Film className="w-5 h-5 mr-2" /> Book Tickets Now
    </Button>
  </div>
);

const MovieDetailspage = () => {
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  const [movie, setMovie] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetMovie = async () => {
      try {
        const decodedTitle = decodeURIComponent(movieTitle);
        const movieData = await fetchMovieDetails(decodedTitle);
        setMovie(movieData);
      } catch (error) {
        console.error("Failed to load movie data.");
      } finally {
        setLoading(false);
      }
    };

    if (movieTitle) {
      fetchAndSetMovie();
    }
  }, [movieTitle]);

  const handleBookTickets = () => {
    navigate(`/Movies/${encodeURIComponent(movieTitle)}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-white">Movie not found.</div>;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <MoviePoster
            posterUrl={movie.poster}
            onTrailerClick={() => setShowTrailer(true)}
          />
          <MovieDetails
            movie={movie}
            isLiked={isLiked}
            onLikeToggle={() => setIsLiked(!isLiked)}
            onBookTickets={handleBookTickets}
          />
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            About the Movie
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg hover:text-white transition-colors">
            {movie.description}
          </p>
        </div>
      </div>

      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <Button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
            onClick={() => setShowTrailer(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="w-full max-w-4xl aspect-video">
            {/* Add your video player component here */}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MovieDetailspage;
