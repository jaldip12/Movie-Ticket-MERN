import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";

const Proceedtopay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load booking data from location state
  useEffect(() => {
    const { selectedSeats, totalAmount, showDetails } = location.state || {};

    if (!selectedSeats || !totalAmount || !showDetails) {
      navigate("/");
      return;
    }

    setBookingDetails({ selectedSeats, totalAmount, showDetails });
  }, [location.state, navigate]);

  const handlePaymentConfirmation = async () => {
    if (isLoading || !bookingDetails) return;
    setIsLoading(true);
   console.log(showDetails);
   
    try {
      const bookingData = {
        showId: bookingDetails.showDetails.showId,
        seats: bookingDetails.selectedSeats.map(
       (seat) => `${seat.row}${seat.displayNumber}`
),

      };

      const response = await axios.post(
        `http://localhost:8000/api/v1/shows/booking`,
        bookingData
      );

      if (response.data.success) {
        toast.success("Seats booked successfully!");

        navigate("/movies/booking/conformation", {
          state: {
            selectedSeats: bookingDetails.selectedSeats,
            totalAmount: bookingDetails.totalAmount,
            movieDetails: {
              title: bookingDetails.showDetails.movieTitle,
              date: bookingDetails.showDetails.date,
              time: bookingDetails.showDetails.time,
              theater: bookingDetails.showDetails.theater,
            },
          },
        });
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message ||
        "Seat booking failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  const { showDetails, selectedSeats, totalAmount } = bookingDetails;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">
          Confirm Booking
        </h1>

        <div className="space-y-6">
          {/* Movie Details */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Movie Details</h2>
            <p className="text-gray-300">Movie: {showDetails.movieTitle}</p>
            <p className="text-gray-300">
              Date: {new Date(showDetails.date).toLocaleDateString()}
            </p>
            <p className="text-gray-300">Time: {showDetails.time}</p>
            <p className="text-gray-300">Theater: {showDetails.theater}</p>
          </div>

          {/* Selected Seats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Selected Seats</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span
                  key={`${seat.row}-${seat.displayNumber}`}
                  className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {seat.row}
                  {seat.displayNumber}
                </span>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            <div className="flex justify-between items-center">
              <span>Total Amount</span>
              <span className="text-2xl font-bold text-yellow-400">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
            >
              Back
            </Button>
            <Button
              onClick={handlePaymentConfirmation}
              disabled={isLoading}
              className={`bg-yellow-500 text-gray-900 hover:bg-yellow-600 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Proceedtopay;
