"use client"

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { FaSquare, FaCouch } from "react-icons/fa";

const Seat = React.memo(({ id, isSelected, onSelect, price }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`w-8 h-8 m-1 text-xs font-semibold rounded-md transition-all duration-300 transform ${
      isSelected
        ? "bg-yellow-500 text-gray-900"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    } flex items-center justify-center`}
    onClick={() => onSelect(id)}
    title={`Seat ${id.split("-")[1]} - Available ($${price})`}
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

const Section = React.memo(({ sectionId, rows, selectedSeats, onSeatSelect }) => (
  <div className="mb-8 bg-gray-800 p-4 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-2 text-center">{sectionId}</h3>
    {Object.entries(rows).map(([rowId, seats]) => (
      <Row key={rowId} rowId={rowId} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />
    ))}
  </div>
));

const Screen = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="w-full h-16 bg-gradient-to-r from-gray-300 to-gray-400 text-black text-sm rounded-b-3xl flex items-center justify-center mt-10 shadow-lg"
  >
    <span className="text-lg font-bold">Screen</span>
  </motion.div>
);

export const TicketBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatSelect = useCallback((seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  }, []);

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
    } else {
      toast.success(`Booked ${selectedSeats.length} seat(s)!`);
      setSelectedSeats([]);
    }
  };

  const sampleSeats = {
    "CLUB": {
      "A": Array.from({ length: 15 }, (_, i) => ({ id: `A-${i + 1}`, price: 20 })),
      "B": Array.from({ length: 15 }, (_, i) => ({ id: `B-${i + 1}`, price: 20 })),
      "C": Array.from({ length: 15 }, (_, i) => ({ id: `C-${i + 1}`, price: 20 })),
    },
    "EXECUTIVE": {
      "D": Array.from({ length: 15 }, (_, i) => ({ id: `D-${i + 1}`, price: 15 })),
      "E": Array.from({ length: 15 }, (_, i) => ({ id: `E-${i + 1}`, price: 15 })),
      "F": Array.from({ length: 15 }, (_, i) => ({ id: `F-${i + 1}`, price: 15 })),
    },
  };

  return (
    <div className="w-full px-2 py-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-400">Select Your Seats</h1>
      <div className="mb-8">
        <Screen />
      </div>
      <div className="flex flex-col items-center">
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
        <div className="w-full max-w-md">
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-400 text-center">Booking Summary</h3>
            <p className="mb-2 text-sm text-gray-300">
              Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
            </p>
            <p className="mb-4 text-xl font-semibold text-white text-center">
              Total: ${selectedSeats.reduce((total, seatId) => total + (seatId.startsWith('A') || seatId.startsWith('B') || seatId.startsWith('C') ? 20 : 15), 0)}
            </p>
            <Button
              onClick={handleBooking}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-full hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-md text-lg font-bold"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
