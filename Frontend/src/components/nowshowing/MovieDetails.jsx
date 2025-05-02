import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Booking from "./Booking.jsx";

export default function MovieDetailsPage() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieResponse = await axios.get(
          `http://localhost:8000/api/v1/movies/getmoviebyid/${movieId}`
        );
  
        if (movieResponse.data?.statusCode === 200 && movieResponse.data?.data) {
          const movieData = {
            id: movieResponse.data.data?._id || movieId,
            title: movieResponse.data.data?.title || 'Unknown Title',
            poster: movieResponse.data.data?.poster || '',
            duration: movieResponse.data.data?.duration || 'N/A',
            certification: movieResponse.data.data?.certification || 'N/A',
            genre: movieResponse.data.data?.genre || 'N/A',
            releaseDate: movieResponse.data.data?.releaseDate || new Date().toISOString(),
            languages: movieResponse.data.data?.languages || [],
            description: movieResponse.data.data?.description || 'No description available',
            trailerUrl: movieResponse.data.data?.trailerUrl || ''
          };
          setMovie(movieData);
          document.title = `${movieData.title} - Cinema Booking`;
        } else {
          throw new Error("Movie not found");
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setError(error.response?.data?.message || "Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
  
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse">Loading movie details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="text-xl">{error}</div>
        <Button variant="outline" className="text-white border-white" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="text-xl">Movie not found</div>
        <Button variant="outline" className="text-white border-white" onClick={() => navigate('/movies')}>
          <ArrowLeft className="mr-2" /> Browse Movies
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-4 flex items-center">
        <Button variant="ghost" className="text-white" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2" /> Back
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <img
              src={movie.poster || '/placeholder-poster.jpg'}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
            />
            {movie.trailerUrl && (
              <Button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowTrailer(true)}
              >
                <Play className="w-5 h-5 mr-2" /> WATCH TRAILER
              </Button>
            )}
          </div>

          <div className="w-full md:w-2/3 text-white">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">{movie.duration}</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">{movie.certification}</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">{movie.genre}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Release Date:</span>
                <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Languages:</span>
                <span>{Array.isArray(movie.languages) ? movie.languages.join(", ") : 'N/A'}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-8">{movie.description}</p>

            {/* Add Book Now Button */}
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg text-lg font-semibold"
              onClick={() => {
                const bookingSection = document.querySelector('#booking-section');
                bookingSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Show Timings Component */}
        <div id="booking-section" className="mt-16 mb-8">
          <Booking movieTitle={movie.title} />
        </div>

        {/* Trailer Modal */}
        {showTrailer && movie.trailerUrl && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <Button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setShowTrailer(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="w-full max-w-4xl aspect-video bg-gray-800">
              <iframe
                src={movie.trailerUrl}
                className="w-full h-full"
                title={`${movie.title} Trailer`}
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}