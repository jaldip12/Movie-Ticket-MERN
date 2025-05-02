import React from "react";

const ShowSeatingLayout = ({ seatingPlan, unavailableSeats = [], selectedSeats = [], onSeatClick }) => {
  return (
    <div className="bg-white border rounded-lg shadow-lg p-8">
      <div className="relative">
        {seatingPlan.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-16">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{section.name}</h3>
                <p className="text-sm text-gray-600">Price: ₹{section.price}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: section.rows }).map((_, rowIndex) => {
                const rowLetter = String.fromCharCode(65 + rowIndex);
                return (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <span className="w-8 text-right text-gray-600 mr-4">
                      {rowLetter}
                    </span>
                    {Array.from({ length: section.columns }).map((_, seatIndex) => {
                      const seatNumber = seatIndex + 1;
                      const seatId = `${rowLetter}-${seatNumber}`;
                      const isUnavailable = unavailableSeats.some(
                        seat => seat.row === rowLetter && seat.seats.includes(seatNumber)
                      );
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <div
                          key={seatIndex}
                          className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                            isUnavailable 
                              ? 'bg-gray-300 cursor-not-allowed'
                              : isSelected
                                ? 'bg-blue-500 text-white border-blue-600'
                                : 'border-green-500 hover:bg-green-200'
                          }`}
                          onClick={() => !isUnavailable && onSeatClick(seatId, section.price)}
                          title={`${rowLetter}${seatNumber} - ₹${section.price} ${
                            isUnavailable ? '(Not Available)' : '(Available)'
                          }`}
                        >
                          {seatNumber}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full h-16 bg-gray-800 rounded-b-lg flex items-center justify-center text-white text-xl font-bold mt-12">
        SCREEN
      </div>
    </div>
  );
};

export default ShowSeatingLayout;