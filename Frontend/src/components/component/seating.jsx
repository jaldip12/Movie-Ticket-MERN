import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Seat Component
const Seat = React.memo(({ id, isSelected, isAvailable, onSelect }) => {
  const seatLabel = id.split("-")[3]; // Extract seat label for display

  return (
    <button
      className={`w-8 h-8 m-1 text-[12px] font-semibold rounded-full transition-all duration-300 ${
        isAvailable
          ? isSelected
            ? "bg-blue-500 text-white border-2 border-blue-600 transform scale-110"
            : "bg-gray-200 hover:bg-gray-300 hover:scale-105"
          : "bg-red-300 cursor-not-allowed opacity-60"
      }`}
      onClick={() => isAvailable && onSelect(id)}
      disabled={!isAvailable}
      title={`Seat ${seatLabel} - ${isAvailable ? "Available" : "Unavailable"}`}
    >
      {seatLabel}
    </button>
  );
});

// Row Component
const Row = React.memo(({ sectionId, rowId, seats, selectedSeats, onSeatSelect }) => {
  return (
    <div className="flex items-center mb-3">
      <span className="w-8 text-sm font-bold mr-3 text-gray-700">{rowId}</span>
      <div className="flex-1">
        <div className="flex justify-start">
          {seats.map((seat) => (
            <Seat
              key={seat.id}
              id={seat.id}
              isSelected={selectedSeats.includes(seat.id)}
              isAvailable={seat.isAvailable}
              onSelect={onSeatSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Section Component
const Section = React.memo(({ sectionId, rows, selectedSeats, onSeatSelect, isActive }) => {
  return (
    <div
      className={`mb-8 p-6 border-2 rounded-xl shadow-md transition-all duration-300 ${
        isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{sectionId}</h3>
      {Object.entries(rows).map(([rowId, seats]) => (
        <Row
          key={rowId}
          sectionId={sectionId}
          rowId={rowId}
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </div>
  );
});

// Screen Component
const Screen = () => (
  <div className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm rounded-t-2xl flex items-center justify-center mb-10 shadow-lg">
    Screen
  </div>
);

// Legend Component
const Legend = () => (
  <div className="flex justify-center space-x-6 mb-6">
    {[
      { className: "bg-blue-500 border-blue-600", label: "Selected" },
      { className: "bg-gray-200 border-gray-300", label: "Available" },
      { className: "bg-red-300 border-red-400 opacity-60", label: "Unavailable" },
    ].map((legendItem) => (
      <div className="flex items-center" key={legendItem.label}>
        <div className={`w-8 h-8 ${legendItem.className} rounded-full mr-2`}></div>
        <span className="text-gray-700">{legendItem.label}</span>
      </div>
    ))}
  </div>
);

export function Seating() {
  const [layout, setLayout] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [newRowName, setNewRowName] = useState("");
  const [newSeatCount, setNewSeatCount] = useState("");
  const [seatPrice, setSeatPrice] = useState("");

  const handleSeatSelect = useCallback((seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  }, []);

  const addRow = () => {
    if (!currentSection || !newRowName || !newSeatCount || !seatPrice) {
      alert("Please fill in all fields before adding a row.");
      return;
    }

    const seatCount = parseInt(newSeatCount, 10);
    const price = parseFloat(seatPrice);

    if (isNaN(seatCount) || seatCount <= 0 || seatCount > 50) {
      alert("Please enter a valid number of seats (1-50)");
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setLayout((prev) => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [newRowName]: Array.from({ length: seatCount }, (_, i) => ({
          id: `${currentSection}-${newRowName}-seat-${i + 1}`,
          isAvailable: true,
          price: price,
        })),
      },
    }));

    setNewRowName("");
    setNewSeatCount("");
    setSeatPrice("");
  };

  const addSection = () => {
    if (!newSectionName.trim()) {
      alert("Please enter a section name.");
      return;
    }

    setLayout((prev) => ({
      ...prev,
      [newSectionName]: {},
    }));
    setCurrentSection(newSectionName);
    setNewSectionName("");
  };

  const generateLayout = () => {
    if (window.confirm("Are you sure you want to clear the layout?")) {
      setLayout({});
      setSelectedSeats([]);
      setCurrentSection("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Cinema Seating Arrangement</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        {/* Section Adding */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Section</h2>
          <input
            type="text"
            placeholder="Section Name (e.g., VIP)"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
          <Button
            onClick={addSection}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Add Section
          </Button>
        </div>

        {/* Row Adding */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Row</h2>
          <select
            value={currentSection}
            onChange={(e) => setCurrentSection(e.target.value)}
            className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 mb-4"
          >
            <option value="">Select Section</option>
            {Object.keys(layout).map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Row Name"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
            />
            <input
              type="number"
              placeholder="Seats"
              value={newSeatCount}
              onChange={(e) => setNewSeatCount(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
            />
            <input
              type="number"
              placeholder="Price"
              value={seatPrice}
              onChange={(e) => setSeatPrice(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
            />
          </div>
          <Button
            onClick={addRow}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Add Row
          </Button>
        </div>
      </div>

      <Button
        onClick={generateLayout}
        className="mb-8 w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
      >
        Clear Layout
      </Button>

      {/* Legend */}
      <Legend />

      {/* Layout Display */}
      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
        <Screen />
        <div className="overflow-x-auto">
          {Object.entries(layout).map(([sectionId, rows]) => (
            <Section
              key={sectionId}
              sectionId={sectionId}
              rows={rows}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              isActive={currentSection === sectionId}
            />
          ))}
        </div>
      </div>

      {/* Selected Seats */}
      <div className="mt-8 bg-blue-50 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Selected Seats:</h2>
        <p className="text-lg text-gray-700">
          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
        </p>
      </div>
    </div>
  );
}
