import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

// Helper to check if a seat is available
const isSeatAvailable = (unavailableSeats, rowName, seatNumber) => {
  return !unavailableSeats[rowName]?.includes(seatNumber);
};

const Seat = ({ seatNumber, isSelected, isAvailable, toggleSeatSelection }) => (
  <button
    className={`w-10 h-10 m-1 rounded ${
      isAvailable
        ? isSelected
          ? "bg-blue-500 text-white"
          : "bg-gray-300 hover:bg-gray-400"
        : "bg-gray-200 text-gray-500 cursor-not-allowed"
    }`}
    onClick={isAvailable ? () => toggleSeatSelection(seatNumber) : null}
    disabled={!isAvailable}
  >
    {seatNumber}
  </button>
);

const SeatRow = React.memo(({ rowName, seatCount, selectedSeats, toggleSeatSelection, unavailableSeats }) => (
  <div className="flex items-center mb-2">
    <div className="mr-2 font-bold">{rowName}</div>
    <div className="flex overflow-x-auto max-w-full">
      {Array.from({ length: seatCount }, (_, seatIndex) => {
        const seatNumber = `${seatIndex + 1}`;
        const isAvailable = isSeatAvailable(unavailableSeats, rowName, seatIndex + 1);
        return (
          <Seat
            key={seatNumber}
            seatNumber={seatNumber}
            isSelected={selectedSeats.includes(`${rowName}-${seatNumber}`)}
            isAvailable={isAvailable}
            toggleSeatSelection={() => toggleSeatSelection(`${rowName}-${seatNumber}`)}
          />
        );
      })}
    </div>
  </div>
));

function SeatSelector({ seatLayout, unavailableSeats, selectedSeats, setSelectedSeats, totalCost, setTotalCost, handleEditSection, deleteSection }) {
  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prevSelectedSeats) => {
      const isSelected = prevSelectedSeats.includes(seatId);
      const updatedSelectedSeats = isSelected
        ? prevSelectedSeats.filter((seat) => seat !== seatId)
        : [...prevSelectedSeats, seatId];

      // Extract rowName and seatNumber from seatId
      const [rowName, seatNumber] = seatId.split("-");

      // Find the section that contains the rowName
      const section = Object.entries(seatLayout).find(([_, data]) =>
        Object.keys(data.rows).includes(rowName)
      );

      if (!section) return prevSelectedSeats; // no section found

      const [, sectionData] = section;
      const seatPrice = sectionData.price;

      setTotalCost((prevTotalCost) => {
        // If the seat is selected, add its price; otherwise, subtract it
        return isSelected ? prevTotalCost + seatPrice : prevTotalCost - seatPrice;
      });

      return updatedSelectedSeats;
    });
  };

  const handleEditClick = (sectionName) => {
    console.log("Edit button clicked for section:", sectionName);
    if (handleEditSection) {
      handleEditSection(sectionName);
    } else {
      console.error("handleEditSection function is not defined");
    }
  };

  const handleDeleteClick = (sectionName) => {
    console.log("Delete button clicked for section:", sectionName);
    if (deleteSection) {
      deleteSection(sectionName);
    } else {
      console.error("deleteSection function is not defined");
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 relative">
      <div className="relative">
        {Object.entries(seatLayout).length === 0 ? (
          <p className="text-center text-gray-500">No seating arrangement available. Please add a new section.</p>
        ) : (
          Object.entries(seatLayout).map(([sectionName, sectionData]) => (
            <div key={sectionName} className="mb-4 sm:mb-6">
              <div className="flex flex-col">
                {/* Section name and buttons now inside the second div */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base sm:text-lg font-semibold">
                    {sectionName} : ₹{sectionData.price}
                  </h2>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditClick(sectionName)} className="px-4 py-2">Edit</Button>
                    <Button onClick={() => handleDeleteClick(sectionName)} className="px-4 py-2 bg-red-600">Delete</Button>
                  </div>
                </div>
                {Object.entries(sectionData.rows).map(([rowName, seatCount]) => (
                  <SeatRow
                    key={rowName}
                    rowName={rowName}
                    seatCount={seatCount}
                    selectedSeats={selectedSeats}
                    toggleSeatSelection={toggleSeatSelection}
                    unavailableSeats={unavailableSeats}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Selected Seats</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {selectedSeats.length === 0 ? (
            <p>No seats selected.</p>
          ) : (
            selectedSeats.map((seat) => (
              <div key={seat} className="p-2 bg-gray-100 rounded">
                {seat}
              </div>
            ))
          )}
        </div>
        <h2 className="text-base sm:text-lg font-semibold">Total Cost: ₹{totalCost}</h2>
      </div>
    </div>
  );
}

export default SeatSelector;