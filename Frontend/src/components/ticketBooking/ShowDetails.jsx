import  { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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
      day: "numeric",
      month: "short",
    });
  };

  // Simplified grouping since we don't have cinemas in our model
  const groupedByDate = shows.reduce((acc, show) => {
    const date = formatDate(show.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(show);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">{movieTitle}</h2>

      {Object.entries(groupedByDate).map(([date, showsForDate]) => (
        <div key={date} className="mb-8">
          <div className="text-xl font-semibold text-gray-700 mb-4">{date}</div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex flex-wrap gap-4">
              {showsForDate.map((show) => (
                <button
                  key={show._id}
                  onClick={() => handleBooking(show._id)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  {show.time}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {shows.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No shows available for this movie
        </div>
      )}
    </div>
  );
};

export default ShowDetails;
