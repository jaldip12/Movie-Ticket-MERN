import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const TheaterSeating = ({ seatingPlan, onSeatSelect }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const validateSeatingPlan = (plan) => {
    if (!plan || !Array.isArray(plan.sections)) return false;
    return plan.sections.every(section => 
      section && 
      section.name &&
      typeof section.rows === 'number' &&
      typeof section.columns === 'number' &&
      typeof section.price === 'number'
    );
  };

  const handleSeatClick = (section, row, seatNumber) => {
    const seatId = `${row}${seatNumber}`;
    
    setSelectedSeats((prev) => {
      const newSelection = prev.some(seat => seat.id === seatId)
        ? prev.filter(seat => seat.id !== seatId)
        : [...prev, { id: seatId, price: section.price, row, seatNumber }];

      const newTotalPrice = newSelection.reduce((sum, seat) => sum + seat.price, 0);
      setTotalPrice(newTotalPrice);
      onSeatSelect?.(newSelection);
      return newSelection;
    });
  };

  const isSeatUnavailable = (section, row, seatNumber) => {
    return section.unavailableSeats?.some(unavailable => 
      unavailable.row === row && unavailable.seats.includes(seatNumber)
    ) || section.bookedSeats?.some(booked => 
      booked.row === row && booked.seats.includes(seatNumber)
    );
  };

  const renderSeat = (section, row, seatNumber) => {
    const seatId = `${row}${seatNumber}`;
    const isUnavailable = isSeatUnavailable(section, row, seatNumber);
    const isSelected = selectedSeats.some(seat => seat.id === seatId);

    return (
      <button
        key={seatId}
        onClick={() => !isUnavailable && handleSeatClick(section, row, seatNumber)}
        disabled={isUnavailable}
        className={`
          w-8 h-8 m-1 text-sm font-medium border rounded transition-colors
          ${
            isUnavailable
              ? "bg-gray-500 text-gray-400 cursor-not-allowed border-gray-600"
              : isSelected
              ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
              : "bg-gray-700 border-green-500 text-green-500 hover:bg-gray-600"
          }
        `}
        title={`Seat ${seatId} - Rs. ${section.price}`}
      >
        {seatNumber}
      </button>
    );
  };

  const renderRow = (section, rowIndex) => {
    const rowId = String.fromCharCode(65 + rowIndex); // Convert 0 to 'A', 1 to 'B', etc.
    
    return (
      <div key={rowId} className="flex items-center mb-2">
        <span className="w-8 text-right mr-4 text-gray-400">{rowId}</span>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: section.columns }, (_, index) =>
            renderSeat(section, rowId, index + 1)
          )}
        </div>
      </div>
    );
  };

  if (!validateSeatingPlan(seatingPlan)) {
    console.error('Invalid seating plan data:', seatingPlan);
    return (
      <div className="text-center text-gray-400 p-8">
        Invalid seating plan configuration
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {seatingPlan.sections.map((section) => (
        <div key={section.name} className="mb-8">
          <h3 className="text-gray-300 mb-4 font-semibold">
            {section.name.toUpperCase()} - Rs. {section.price}
          </h3>
          <div className="space-y-2">
            {Array.from({ length: section.rows }, (_, index) =>
              renderRow(section, index)
            )}
          </div>
        </div>
      ))}

      {/* Screen indicator */}
      <div className="mt-12 relative">
        <div className="w-2/3 h-2 bg-gray-400 mx-auto rounded-t-lg transform -skew-y-1" />
        <p className="text-center text-sm text-gray-400 mt-2">SCREEN</p>
      </div>

      {/* Selected seats summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-white">
            Selected Seats: {selectedSeats.map(seat => seat.id).join(", ")}
          </p>
          <p className="text-white">
            Total Amount: Rs. {totalPrice}
          </p>
        </div>
      )}
    </div>
  );
};

export default function MovieBookingPage(){
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatingLayout, setSeatingLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchAndSetMovie = async () => {
      try {
        const decodedTitle = decodeURIComponent(movieTitle);

        const movieResponse = await axios.get(
          `http://localhost:8000/api/v1/movies/getmoviebytitle/${decodedTitle}`
        );
        const showResponse = await axios.get(
          `http://localhost:8000/api/v1/shows/search?title=${decodedTitle}`
        );

        if (movieResponse.data?.statusCode === 200) {
          const movieData = {
            title: movieResponse.data.data?.title || "Unknown Title",
            poster: movieResponse.data.data?.poster || "",
            duration: movieResponse.data.data?.duration || "N/A",
            certification: movieResponse.data.data?.certification || "N/A",
            genre: movieResponse.data.data?.genre || "N/A",
            releaseDate:
              movieResponse.data.data?.releaseDate || new Date().toISOString(),
            languages: movieResponse.data.data?.languages || [],
            description:
              movieResponse.data.data?.description ||
              "No description available",
            trailerUrl: movieResponse.data.data?.trailerUrl || "",
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

  const fetchSeatingLayout = async (seatingLayoutName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/seating/seatingplans/name/${seatingLayoutName}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.statusCode === 200) {
        setSeatingLayout(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching seating layout:", error.message);
      setError("Failed to load seating layout. Please try again later.");
    }
  };
  

  const handleBooking = async (showId) => {
    const show = shows.find((s) => s._id === showId);
    if (show) {
      setSelectedShow(show);
      await fetchSeatingLayout(show.seatingLayoutName);
    }
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
  };

  const getDatesFromShows = () => {
    if (!shows || shows.length === 0) return [];

    const uniqueDates = [
      ...new Set(
        shows.map((show) =>
          new Date(show.date).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
        )
      ),
    ];
    return uniqueDates.slice(0, 7);
  };

  const getShowsForDate = (date) => {
    if (!shows || shows.length === 0) return [];

    return shows.filter(
      (show) =>
        new Date(show.date).toLocaleDateString() ===
        new Date(date).toLocaleDateString()
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
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold text-white">{movie.title}</h1>
        <div className="w-8"></div> {/* Empty div for flex spacing */}
      </div>

      {/* Show Times */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h2 className="text-xl font-bold text-white mb-4">SELECT SHOWTIME</h2>
            {selectedDate &&
            getShowsForDate(selectedDate).map((show) => (
                <div key={show._id} className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className="text-white font-bold mb-2">
                    {show.seatingLayoutName || "Unknown Cinema"}
                    </h3>
                    <p className="text-gray-400">
                    {show.time || "Time not available"}
                    </p>
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

        {/* Seating Layout */}
        {selectedShow && seatingLayout && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">SELECT SEATS</h2>
            <TheaterSeating
              seatingPlan={seatingLayout}
              onSeatSelect={handleSeatSelect}
            />

            {selectedSeats.length > 0 && (
              <div className="mt-8 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={() => {
                    // Implement checkout logic here
                    alert(
                      `Processing booking for ${selectedSeats.length} seats`
                    );
                  }}
                >
                  Continue ({selectedSeats.length} Seats)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
    
     
};

