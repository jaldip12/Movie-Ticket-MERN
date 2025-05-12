import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShowSeatingLayout = ({
  seatingLayoutName,
  showId,
  showTime,
  showDate,
  movieTitle,
}) => {
  const navigate = useNavigate();
  const [seatingPlan, setSeatingPlan] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchSeatingLayout = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/seating/seatingplans/name/${seatingLayoutName}`
        );

        if (response.data.statusCode === 200) {
          setSeatingPlan(response.data.data);
        } else {
          throw new Error("Failed to fetch seating layout");
        }
      } catch (error) {
        console.error("Error fetching seating layout:", error);
        setError("Could not load the seating layout. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (seatingLayoutName) {
      fetchSeatingLayout();
    }
  }, [seatingLayoutName]);

  const numberToLetter = (number) => String.fromCharCode(65 + number);

  // Add this helper function to count available seats
  const getAvailableSeatNumber = (
    sectionIndex,
    row,
    currentSeatNumber,
    section
  ) => {
    let count = 0;
    for (let col = 1; col <= section.columns; col++) {
      const isUnavailable = section.unavailableSeats?.some(
        (unavailable) =>
          unavailable.row === row && unavailable.seats.includes(col)
      );

      if (!isUnavailable) {
        count++;
      }

      if (col === currentSeatNumber) {
        return isUnavailable ? null : count;
      }
    }
    return count;
  };

  const isSeatUnavailable = (sectionIndex, row, seatNumber) => {
    const section = seatingPlan?.sections[sectionIndex];
    return (
      section?.unavailableSeats?.some(
        (unavailable) =>
          unavailable.row === row && unavailable.seats.includes(seatNumber)
      ) || false
    );
  };

  const isSeatSelected = (seatId) => {
    return selectedSeats.some((seat) => seat.id === seatId);
  };

  const handleSeatClick = (sectionIndex, row, seatNumber, price) => {
    const section = seatingPlan.sections[sectionIndex];
    const availableNumber = getAvailableSeatNumber(
      sectionIndex,
      row,
      seatNumber,
      section
    );
    const seatId = `${sectionIndex}-${row}${seatNumber}`;

    setSelectedSeats((prev) => {
      const existing = prev.find((seat) => seat.id === seatId);
      const updated = existing
        ? prev.filter((seat) => seat.id !== seatId)
        : [
            ...prev,
            {
              id: seatId,
              row,
              seatNumber,
              displayNumber: availableNumber, // Add this field
              section: seatingPlan.sections[sectionIndex].name,
              price,
            },
          ];
      setShowSummary(updated.length > 0);
      return updated;
    });
  };

  const calculateTotalAmount = () =>
    selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleBooking = () => {
    if (!selectedSeats.length) {
      alert("Please select at least one seat.");
      return;
    }
    navigate(`/booking/confirm/${showId}`, {
      state: {
        selectedSeats,
        totalAmount: calculateTotalAmount(),
        showDetails: {
          theater: seatingLayoutName,
          time: showTime,
          date: showDate,
          movieTitle,
        },
      },
    });
  };

  const SeatButton = ({ sectionIndex, row, seatNumber, price }) => {
    const section = seatingPlan.sections[sectionIndex];
    const isUnavailable = isSeatUnavailable(sectionIndex, row, seatNumber);
    const seatId = `${sectionIndex}-${row}${seatNumber}`;
    const isSelected = isSeatSelected(seatId);

    if (isUnavailable) {
      return <div className="w-10 h-10 opacity-0"></div>;
    }

    const availableNumber = getAvailableSeatNumber(
      sectionIndex,
      row,
      seatNumber,
      section
    );

    return (
      <button
        onClick={() => handleSeatClick(sectionIndex, row, seatNumber, price)}
        className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-200 transform
          ${
            isSelected
              ? "bg-green-500 text-white shadow-lg scale-105"
              : "bg-white border-2 border-blue-500 hover:bg-blue-50 hover:scale-105"
          }
        `}
        title={`Seat ${row}${availableNumber} - ₹${price}`}
      >
        <span className="text-sm font-semibold">{availableNumber}</span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
        <button
          className="block mx-auto mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!seatingPlan) {
    return (
      <div className="text-center py-12 text-gray-500">
        No seating layout available.
      </div>
    );
  }

  return (
    <div className="p-6">
      {seatingPlan.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {section.name}
              </h3>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ₹{section.price}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {[...Array(section.rows)].map((_, rowIndex) => {
              // Calculate continuous row letters across sections
              let previousRows = 0;
              for (let i = 0; i < sectionIndex; i++) {
                previousRows += seatingPlan.sections[i].rows;
              }
              const continuousRowLetter = numberToLetter(
                previousRows + rowIndex
              );

              return (
                <div key={rowIndex} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-800">
                      {continuousRowLetter}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[...Array(section.columns)].map((_, colIndex) => (
                      <SeatButton
                        key={`${sectionIndex}-${rowIndex}-${colIndex}`}
                        sectionIndex={sectionIndex}
                        row={continuousRowLetter}
                        seatNumber={colIndex + 1}
                        price={section.price}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-center gap-8 mt-8 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white border-2 border-blue-500" />
          <span className="text-sm font-medium text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-green-500" />
          <span className="text-sm font-medium text-gray-700">Selected</span>
        </div>
      </div>

      {/* Screen at the bottom */}
      <div className="w-full mt-12">
        <div className="w-3/4 mx-auto h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
        <div className="w-3/4 mx-auto h-12 bg-gradient-to-b from-gray-300 to-gray-200 rounded-b-3xl shadow-md flex items-center justify-center">
          <span className="text-gray-700 font-semibold tracking-wider">
            SCREEN
          </span>
        </div>
      </div>

      {showSummary && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20">
          <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">
                Selected Seats:{" "}
                {selectedSeats
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .map((seat) => `${seat.row}${seat.displayNumber}`) // Use displayNumber instead of seatNumber
                  .join(", ")}
              </p>
              <p className="text-lg font-bold">₹{calculateTotalAmount()}</p>
            </div>
            <button
              onClick={handleBooking}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowSeatingLayout;
