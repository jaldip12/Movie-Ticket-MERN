"use client"

import { useState, useEffect } from "react"
import { Star, Film, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export function NowShowing() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8000/api/v1/movies/getmovies")
        if (response.data.statusCode === 200) {
          setMovies(response.data.data)
        } else {
          setError("Failed to fetch movies")
        }
      } catch (error) {
        setError("Error loading movies")
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

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
        <p className="text-red-400 text-xl">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-yellow-400"
        >
          Now Showing
        </motion.h1>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {movies.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function MovieCard({ movie, index }) {
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()

  const handleBookNow = () => {
    navigate(`/Movies/${encodeURIComponent(movie.title)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:shadow-2xl bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-xl"
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
              className="text-gray-400 hover:text-yellow-500 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              title={isLiked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center mb-3">
            <Star className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="font-bold text-white">{movie.rating}/10</span>
            <span className="text-sm text-gray-400 ml-2">({movie.votes} votes)</span>
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="secondary" className="bg-gray-700 text-yellow-500 px-2 py-1 rounded-full text-xs">
              {movie.certification}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs">
              {movie.language}
            </Badge>
          </div>
          <Button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={handleBookNow}
          >
            <Film className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
