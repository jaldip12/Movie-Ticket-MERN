"use client"

import { useState } from "react"
import { Star, Film, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const movies = [
  {
    id: 1,
    title: "Kalki 2898 AD",
    poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/kalki.jpg",
    rating: 9.2,
    votes: "24.6K",
    certification: "UA",
    language: "Hindi",
    genre: "Action",
    releaseDate: "2024-03-15",
    duration: "3h 04min",
  },
  {
    id: 2,
    title: "Deadpool",
    poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/deadpool.jpg",
    rating: 9.0,
    votes: "95.7K",
    certification: "UA",
    language: "English",
    genre: "Drama",
    releaseDate: "2024-02-28",
    duration: "2h 15min",
  },
  {
    id: 3,
    title: "35 (2024)",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 9.1,
    votes: "9.3K",
    certification: "U",
    language: "Telugu, Tamil, Malayalam",
    genre: "Comedy",
    releaseDate: "2024-01-10",
    duration: "2h 5min",
  },
  {
    id: 4,
    title: "Stree 2: Sarkate Ka Aatank",
    poster: "https://res.cloudinary.com/drikj5qcc/image/upload/v1726403508/stree2.jpg",
    rating: 8.9,
    votes: "368.1K",
    certification: "UA",
    language: "Hindi",
    genre: "Horror",
    releaseDate: "2024-04-05",
    duration: "2h 20min",
  },
]

export function NowShowing() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-yellow-400">
          Now Showing
        </h1>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function MovieCard({ movie, index }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:shadow-2xl bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:scale-105">
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-xl"
          />
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
              onClick={() => setIsLiked(!isLiked)}
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
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md">
            <Film className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
