import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const Proceedtopay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have the required data in location state
    if (!location.state?.selectedSeats || !location.state?.totalAmount || !location.state?.showDetails) {
      navigate('/');
      return;
    }
    
    setBookingDetails({
      selectedSeats: location.state.selectedSeats,
      totalAmount: location.state.totalAmount,
      showDetails: location.state.showDetails
    });
  }, [location.state, navigate]);

  const handlePaymentConfirmation = async () => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to your backend
      // to confirm the booking and process payment
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to billing page with booking details
      navigate('/movies/booking/conformation', {
        state: {
          selectedSeats: bookingDetails.selectedSeats,
          totalAmount: bookingDetails.totalAmount,
          movieDetails: {
            title: bookingDetails.showDetails.movieTitle,
            date: bookingDetails.showDetails.date,
            time: bookingDetails.showDetails.time,
            theater: bookingDetails.showDetails.theater
          }
        }
      });
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">Confirm Booking</h1>

        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Movie Details</h2>
            <p className="text-gray-300">Movie: {bookingDetails.showDetails.movieTitle}</p>
            <p className="text-gray-300">Date: {new Date(bookingDetails.showDetails.date).toLocaleDateString()}</p>
            <p className="text-gray-300">Time: {bookingDetails.showDetails.time}</p>
            <p className="text-gray-300">Theater: {bookingDetails.showDetails.theater}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Selected Seats</h2>
            <div className="flex flex-wrap gap-2">
              {bookingDetails.selectedSeats.map((seat) => (
                <span 
                  key={seat.id}
                  className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {seat.row}{seat.displayNumber}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            <div className="flex justify-between items-center">
              <span>Total Amount</span>
              <span className="text-2xl font-bold text-yellow-400">₹{bookingDetails.totalAmount}</span>
            </div>
          </div>

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
              className="bg-yellow-500 text-gray-900 hover:bg-yellow-600"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Confirm & Pay'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Proceedtopay;