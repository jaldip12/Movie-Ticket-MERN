import { useState, useEffect, useCallback } from "react"
import { Star, Film, Heart, Calendar, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// Constants
const API_BASE_URL = "http://localhost:8000/api/v1"
const FALLBACK_IMAGE = "/fallback.jpg"

// Animation variants
const pageAnimations = {
  title: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 }
  },
  grid: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }
}

const MovieCard = ({ movie, index }) => {
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()

  // Use movie ID for routing instead of slugified title
  const handleBookNow = useCallback(() => {
    navigate(`/movies/${movie._id}`)
  }, [movie._id, navigate])

  const toggleFavorite = useCallback((e) => {
    e.stopPropagation()
    setIsLiked(prev => !prev)
    // Here you could also implement API calls to save favorite status
  }, [])

  return (
    <motion.div
      {...pageAnimations.card}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:shadow-2xl bg-gray-800 rounded-xl shadow-lg border border-gray-700"
        onClick={handleBookNow}
      >
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            onError={(e) => { e.target.src = FALLBACK_IMAGE }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-xl"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold line-clamp-1 text-white group-hover:text-yellow-500 transition-colors">
              {movie.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              className="text-gray-400 hover:text-yellow-500 transition-all"
              onClick={toggleFavorite}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current text-yellow-500" : ""}`} />
            </Button>
          </div>
          <MovieDetails movie={movie} />
          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={handleBookNow}
            aria-label="Book movie ticket"
          >
            <Film className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const MovieDetails = ( movie ) => {
  const { rating = 'N/A', votes = 0, certification = 'NA', language = 'Unknown', duration, releaseDate } = movie

  return (
    <>
      <div className="flex items-center mb-3">
        <Star className="w-5 h-5 text-yellow-500 mr-1" />
        <span className="font-bold text-white">{rating}/10</span>
        <span className="text-sm text-gray-400 ml-2">({votes} votes)</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="bg-gray-700 text-yellow-500 px-2 py-1 rounded-full text-xs">
          {certification}
        </Badge>
        <Badge variant="outline" className="border-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs">
          {language}
        </Badge>
        {duration && (
          <Badge variant="outline" className="border-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {duration} min
          </Badge>
        )}
        {releaseDate && (
          <Badge variant="outline" className="border-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(releaseDate).getFullYear()}
          </Badge>
        )}
      </div>
    </>
  )
}

// Custom hook for API calls
const useMoviesData = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/movies/getmovies`)
        if (response.data.statusCode === 200) {
          setMovies(response.data.data)
        } else {
          throw new Error(response.data.message || 'Unknown error')
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        setError(`Error loading movies: ${errorMessage}`)
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return { movies, loading, error }
}

export function NowShowing() {
  const { movies, loading, error } = useMoviesData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg border border-red-500">
          <p className="text-red-400 text-xl">{error}</p>
          <Button 
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <motion.h1 
          {...pageAnimations.title}
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-yellow-400"
        >
          Now Showing
        </motion.h1>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          {...pageAnimations.grid}
        >
          <AnimatePresence>
            {movies.map((movie, index) => (
              <MovieCard key={movie._id || index} movie={movie} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}