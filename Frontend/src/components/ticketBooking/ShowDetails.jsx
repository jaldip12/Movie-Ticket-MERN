import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaTicketAlt } from "react-icons/fa";

const ShowDetails = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  console.log(movieTitle);
  useEffect(() => {
    const fetchShowsByMovie = async (movieTitle) => {
      setLoading(true);
      setError(null);

      try {
        const decodedTitle = decodeURIComponent(movieTitle); // Ensure title is properly decoded for the request
        const response = await axios.get(
          `http://localhost:8000/api/v1/shows/${decodedTitle}`
        );

        if (response.status === 200) {
          setShows(response.data.data);
        } else {
          throw new Error(`Failed to fetch shows. Status code: ${response.status}`);
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching shows.");
      } finally {
        setLoading(false);
      }
    };

    if (movieTitle) {
      fetchShowsByMovie(movieTitle);
    } else {
      setError("Invalid movie title.");
      setLoading(false);
    }
  }, [movieTitle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-bold">Loading shows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Shows for "{movieTitle}"</h1>
      {shows.length > 0 ? (
        <div className="space-y-4">
          {shows.map((show) => (
            <div
              key={show.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{show.movieTitle}</h2>
                <p className="text-gray-600">Cinema: {show.cinemaName}</p>
                <p className="text-gray-600">Time: {show.showTime}</p>
              </div>
              <Button
                onClick={() => navigate(`/shows/${show.id}/book`)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition flex items-center"
              >
                <FaTicketAlt className="mr-2" />
                Book Now
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <p className="text-gray-600 text-lg font-medium">No shows available for this movie.</p>
        </div>
      )}
    </div>
  );
};

export default ShowDetails;
