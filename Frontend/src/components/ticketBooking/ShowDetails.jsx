import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaTicketAlt, FaClock, FaCalendar } from "react-icons/fa";

const ShowDetails = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  useEffect(() => {
    const fetchShowsByMovie = async () => {
      if (!movieTitle?.trim()) {
        setError("Invalid movie title");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch shows based on the movie title
        const response = await axios.get(
          `http://localhost:8000/api/v1/shows/search?title=${movieTitle}`
        );

        if (response.data?.data) {
          setShows(response.data.data);
        } else {
          setShows([]);
        }
      } catch (err) {
        console.error("Error fetching shows:", err);
        setError(err.response?.data?.message || "Failed to fetch shows");
        setShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsByMovie();
  }, [movieTitle]);

  const handleBooking = (showId) => {
    navigate(`/booking/${showId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">{movieTitle}</h2>

      <div className="grid grid-cols-1 gap-6">
        {shows.map((show) => (
          <div key={show._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <FaCalendar className="text-gray-500" />
                <span className="font-semibold">{formatDate(show.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-500" />
                <span>{show.time}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Screen: {show.seatingLayoutName}</p>
              </div>
              <Button
                onClick={() => handleBooking(show._id)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md"
              >
                <FaTicketAlt className="mr-2" />
                Book Tickets
              </Button>
            </div>
          </div>
        ))}
      </div>

      {shows.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No shows available for this movie
        </div>
      )}
    </div>
  );
};

export default ShowDetails;
