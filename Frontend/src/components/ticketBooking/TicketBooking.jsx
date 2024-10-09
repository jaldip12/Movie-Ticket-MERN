import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { FaCouch, FaTicketAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const getSeatPrice = (seatId) => {
  if (
    seatId.startsWith("A") ||
    seatId.startsWith("B") ||
    seatId.startsWith("C")
  ) {
    return { section: "Club", price: 200 };
  }
  return { section: "Executive", price: 150 };
};

const Seat = React.memo(({ id, isSelected, onSelect, price }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`w-10 h-10 m-1 text-xs font-semibold rounded-md transition-all duration-300 transform ${
      isSelected
        ? "bg-yellow-500 text-gray-900"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    } flex items-center justify-center`}
    onClick={() => onSelect(id)}
    aria-label={`Seat ${id.split("-")[1]} - ${
      isSelected ? "Selected" : "Available"
    } ($${price})`}
    title={`Seat ${id.split("-")[1]} - ${
      isSelected ? "Selected" : "Available"
    } ($${price})`}
  >
    <FaCouch className="text-base" />
  </motion.button>
));

const Row = React.memo(({ rowId, seats, selectedSeats, onSeatSelect }) => (
  <div className="flex items-center mb-2 justify-center">
    <span className="w-6 text-xs font-bold mr-2 text-gray-300">{rowId}</span>
    <div className="flex flex-wrap">
      {seats.map((seat) => (
        <Seat
          key={seat.id}
          id={seat.id}
          isSelected={selectedSeats.includes(seat.id)}
          onSelect={onSeatSelect}
          price={seat.price}
        />
      ))}
    </div>
  </div>
));

const Section = React.memo(
  ({ sectionId, rows, selectedSeats, onSeatSelect }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-gray-800 p-4 rounded-xl shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-2 text-center">
        {sectionId} - ₹{rows[Object.keys(rows)[0]][0].price}
      </h3>
      {Object.entries(rows).map(([rowId, seats]) => (
        <Row
          key={rowId}
          rowId={rowId}
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </motion.div>
  )
);

const Screen = React.memo(({ width }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="h-12 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-lg rounded-b-3xl flex items-center justify-center mb-8 shadow-lg"
    style={{ width: `${width}px` }}
  >
    <span className="text-xl font-bold">Screen</span>
  </motion.div>
));

const Legend = () => (
  <div className="flex justify-center space-x-4 mb-4">
    <div className="flex items-center">
      <div className="w-4 h-4 bg-gray-700 rounded-sm mr-2"></div>
      <span className="text-sm text-gray-300">Available</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 bg-yellow-500 rounded-sm mr-2"></div>
      <span className="text-sm text-gray-300">Selected</span>
    </div>
  </div>
);

const sampleSeats = {
  CLUB: {
    A: Array.from({ length: 15 }, (_, i) => ({ id: `A-${i + 1}`, price: 200 })),
    B: Array.from({ length: 15 }, (_, i) => ({ id: `B-${i + 1}`, price: 200 })),
    C: Array.from({ length: 15 }, (_, i) => ({ id: `C-${i + 1}`, price: 200 })),
  },
  EXECUTIVE: {
    D: Array.from({ length: 15 }, (_, i) => ({ id: `D-${i + 1}`, price: 150 })),
    E: Array.from({ length: 15 }, (_, i) => ({ id: `E-${i + 1}`, price: 150 })),
    F: Array.from({ length: 15 }, (_, i) => ({ id: `F-${i + 1}`, price: 150 })),
    G: Array.from({ length: 15 }, (_, i) => ({ id: `G-${i + 1}`, price: 150 })),
    H: Array.from({ length: 15 }, (_, i) => ({ id: `H-${i + 1}`, price: 150 })),
  },
};

export const TicketBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();
  const { movieTitle } = useParams();

  const handleSeatSelect = useCallback((seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  }, []);

  const handleBooking = useCallback(() => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
    } else {
      toast.success(`Booked ${selectedSeats.length} seat(s)!`);
      setSelectedSeats([]);
    }
  }, [selectedSeats]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((summary, seatId) => {
      const { section, price } = getSeatPrice(seatId);
      if (!summary[section]) {
        summary[section] = 0;
      }
      summary[section] += price;
      return summary;
    }, {});
  }, [selectedSeats]);

  const screenWidth = useMemo(() => {
    const maxSeatsPerRow = Math.max(
      ...Object.values(sampleSeats).flatMap((section) =>
        Object.values(section).map((row) => row.length)
      )
    );
    return maxSeatsPerRow * 44 + 24;
  }, []);

  return (
    <div className="w-full px-2 py-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-400"
      >
        Select Your Seats
      </motion.h1>
      <div className="flex flex-col items-center">
        <Legend />
        <div className="w-full max-w-4xl mb-8">
          {Object.entries(sampleSeats).map(([sectionId, rows]) => (
            <Section
              key={sectionId}
              sectionId={sectionId}
              rows={rows}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
          ))}
        </div>
        <Screen width={screenWidth} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-400 text-center">
              Booking Summary
            </h3>
            <p className="mb-2 text-sm text-gray-300">
              Selected Seats:{" "}
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
            </p>
            <p className="mb-4 text-xl font-semibold text-white text-center">
              {Object.entries(totalAmount).map(([section, amount]) => (
                <span key={section}>
                  {`${section}: $${amount}`}
                  <br />
                </span>
              ))}
            </p>
            <Button
              onClick={() => {
                if (selectedSeats.length > 0) {
                  navigate(`/Movies/${movieTitle}/billing`, {
                    state: { selectedSeats, totalAmount },
                  });
                }
              }}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-full hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-md text-lg font-bold flex items-center justify-center"
              disabled={selectedSeats.length === 0}
            >
              <FaTicketAlt className="mr-2" />
              {selectedSeats.length === 0
                ? "Select Seats"
                : "Proceed to Checkout"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketBooking;
