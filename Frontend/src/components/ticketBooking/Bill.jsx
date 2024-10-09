import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaCreditCard, FaTicketAlt, FaCouch, FaMoneyBillWave, FaMobileAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Bill() {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats, totalAmount, movieDetails } = location.state || {};

  useEffect(() => {
    if (!selectedSeats || !totalAmount) {
      navigate('/');
      toast.error('No booking information available.');
    }
  }, [selectedSeats, totalAmount, navigate]);

  const handlePayment = async () => {
    setIsLoading(true);
    toast.loading('Processing payment...', { id: 'payment' });
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment successful!', { id: 'payment' });
      navigate('/confirmation', { state: { selectedSeats, totalAmount, movieDetails } });
    } catch (error) {
      toast.error('Payment failed. Please try again.', { id: 'payment' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedSeats || !totalAmount) {
    return null; // Early return, useEffect will handle navigation
  }

  const paymentMethods = [
    { id: 'credit', icon: FaCreditCard, label: 'Credit Card' },
    { id: 'debit', icon: FaMoneyBillWave, label: 'Debit Card' },
    { id: 'upi', icon: FaMobileAlt, label: 'UPI' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-8 bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl text-white"
      >
        <h2 className="text-5xl font-extrabold mb-10 text-yellow-400 text-center tracking-wider">Billing Information</h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Selected Seats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-700 bg-opacity-50 p-6 rounded-3xl shadow-lg"
          >
            <h3 className="text-3xl font-bold mb-4 flex items-center text-yellow-300">
              <FaCouch className="mr-4 text-4xl" /> Selected Seats
            </h3>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {selectedSeats.map((seat) => (
                  <motion.span
                    key={seat}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full font-semibold shadow-md text-lg"
                  >
                    {seat}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-700 bg-opacity-50 p-6 rounded-3xl shadow-lg"
          >
            <h3 className="text-3xl font-bold mb-4 flex items-center text-yellow-300">
              <FaTicketAlt className="mr-4 text-4xl" /> Booking Summary
            </h3>
            <p className="text-xl">Number of Seats: <span className="font-semibold">{selectedSeats.length}</span></p>
            <p className="text-3xl font-extrabold mt-4">Total Amount: ₹{Object.values(totalAmount).reduce((a, b) => a + b, 0)}</p>
            {movieDetails && (
              <div className="mt-4 text-gray-300">
                <p className="text-lg">Movie: {movieDetails.title}</p>
                <p>Date: {movieDetails.date}</p>
                <p>Time: {movieDetails.time}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Payment Method */}
        <div className="mt-10">
          <h3 className="text-3xl font-bold mb-6 flex items-center text-yellow-300">
            <FaCreditCard className="mr-4 text-4xl" /> Payment Method
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map(({ id, icon: Icon, label }) => (
              <motion.div
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setPaymentMethod(id)}
                  className={`${
                    paymentMethod === id ? 'bg-yellow-500 text-gray-900 shadow-lg' : 'bg-gray-700'
                  } hover:bg-yellow-400 transition-all duration-300 px-8 py-4 rounded-full font-semibold text-lg capitalize flex items-center`}
                >
                  <Icon className="mr-2" />
                  {label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-10"
        >
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className={`w-full ${
              isLoading ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'
            } text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 text-xl flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <FaUser className="animate-spin" />
                </motion.div>
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Bill;
