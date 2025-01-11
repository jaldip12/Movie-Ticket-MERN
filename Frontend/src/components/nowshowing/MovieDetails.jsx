import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Heart, Play, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const MovieDetailsPage = () => {
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  const [movie, setMovie] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatingLayout, setSeatingLayout] = useState(null);

  useEffect(() => {
    const fetchAndSetMovie = async () => {
      try {
        const decodedTitle = decodeURIComponent(movieTitle);
        console.log(decodedTitle);
        
        const movieResponse = await axios.get(
          `http://localhost:8000/api/v1/movies/getmoviebytitle/${decodedTitle}`
        );
        const showResponse = await axios.get(
          `http://localhost:8000/api/v1/shows/search?title=${decodedTitle}`
        );

         
         
        if (movieResponse.data?.statusCode === 200) {
          const movieData = {
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
        }

        const showData = showResponse.data?.data || [];
        setShows(showData);

        if (showData.length > 0) {
          const firstShow = showData[0];
          setSelectedDate(new Date(firstShow.date).toLocaleDateString());
          setSelectedLanguage(firstShow.language);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (movieTitle) {
      fetchAndSetMovie();
    }
  }, [movieTitle]);

  const fetchSeatingLayout = async (layoutName) => {
    try {
      // Use the getSeatingPlanByName endpoint instead
      const response = await axios.get(`http://localhost:8000/api/v1/seating/seatingplans/name/${layoutName}`);
      if (response.data.statusCode === 200) {
        setSeatingLayout(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seating layout:', error);
      setError("Failed to load seating layout. Please try again later.");
    }
  };

  const handleBooking = async (showId) => {
    const show = shows.find(s => s._id === showId);
    if (show) {
      setSelectedShow(show);
      await fetchSeatingLayout(show.seatingLayoutName);
    }
  };

  const getDatesFromShows = () => {
    if (!shows || shows.length === 0) return [];
    
    const uniqueDates = [...new Set(shows.map(show => 
      new Date(show.date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    ))];
    return uniqueDates.slice(0, 7);
  };

  const getShowsForDate = (date) => {
    if (!shows || shows.length === 0) return [];
    
    return shows.filter(show => 
      new Date(show.date).toLocaleDateString() === new Date(date).toLocaleDateString()
    );
  };

  const SeatingLayout = ({ sections }) => {
    const getTotalPreviousRows = (sectionIndex) => {
      let totalRows = 0;
      for (let i = 0; i < sectionIndex; i++) {
        totalRows += sections[i].rows;
      }
      return totalRows;
    };

    return (
      <Card className="bg-gray-800">
        <CardContent className="p-8">
          {sections.map((section, sectionIndex) => {
            const startingRow = getTotalPreviousRows(sectionIndex);
            
            return (
              <div key={sectionIndex} className="mb-16">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.name}</h3>
                    <p className="text-sm text-gray-400">Price: ₹{section.price}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: section.rows }).map((_, rowIndex) => {
                    const currentRow = String.fromCharCode(65 + startingRow + rowIndex);
                    
                    return (
                      <div key={rowIndex} className="flex items-center gap-2">
                        <span className="w-8 text-right text-gray-400 mr-4">
                          {currentRow}
                        </span>
                        {Array.from({ length: section.columns }).map((_, seatIndex) => {
                          const seatNumber = seatIndex + 1;
                          const isUnavailable = section.unavailableSeats?.some(
                            seat => seat.row === currentRow && seat.seats.includes(seatNumber)
                          );
                          
                          return (
                            <div
                              key={seatIndex}
                              className={`w-8 h-8 border flex items-center justify-center text-xs
                                ${isUnavailable 
                                  ? 'border-red-500 bg-red-100 text-red-800' 
                                  : 'border-green-500 text-green-800 hover:bg-green-100'
                                }`}
                              title={`${currentRow}${seatNumber} - ₹${section.price}`}
                            >
                              {seatNumber}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="w-full h-16 bg-gray-900 rounded-b-lg flex items-center justify-center text-white text-xl font-bold mt-12">
            SCREEN
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        {error}
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Movie not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2" /> Back
        </Button>
      </div>

      {/* Movie Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <img
              src={movie.poster || '/placeholder-poster.jpg'}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
            />
            <Button
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowTrailer(true)}
            >
              <Play className="w-5 h-5 mr-2" /> WATCH TRAILER
            </Button>
          </div>

          {/* Details */}
          <div className="w-full md:w-2/3 text-white">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">
                {movie.duration}
              </span>
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">
                {movie.certification}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Genre:</span>
                <span>{movie.genre}</span>
              </div>
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
          </div>
        </div>

        {/* Show Times */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">SELECT DATE</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {getDatesFromShows().map((date) => (
              <Button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-6 py-3 rounded-lg whitespace-nowrap ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                {date}
              </Button>
            ))}
          </div>

          {/* Show Listings */}
          <div className="mt-8">
            {selectedDate && getShowsForDate(selectedDate).map((show) => (
              <div
                key={show._id}
                className="bg-gray-800 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold mb-2">
                      {show.cinemaName || 'Unknown Cinema'}
                    </h3>
                    <p className="text-gray-400">{show.time || 'Time not available'}</p>
                  </div>
                  <Button
                    onClick={() => handleBooking(show._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seating Layout */}
        {selectedShow && seatingLayout && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Seating Layout</h2>
            <SeatingLayout sections={seatingLayout.sections} />
          </div>
        )}

        {/* Trailer Modal */}
        {showTrailer && movie.trailerUrl && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <Button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
              onClick={() => setShowTrailer(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="w-full max-w-4xl aspect-video bg-gray-800">
              <iframe
                src={movie.trailerUrl}
                className="w-full h-full"
                title="Movie Trailer"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;