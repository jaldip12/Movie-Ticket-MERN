import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { FaSquare, FaWheelchair } from "react-icons/fa";

const Seat = React.memo(({ id, isSelected, isAvailable, onSelect, price, isAccessible }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`w-8 h-8 m-1 text-xs font-semibold rounded transition-all duration-300 transform shadow-md ${
      isAvailable
        ? isSelected
          ? "bg-black text-white border-2 border-black shadow-lg"
          : "bg-white text-black hover:bg-gray-200 hover:text-black border border-black"
        : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
    }`}
    onClick={() => isAvailable && onSelect(id)}
    disabled={!isAvailable}
    title={`Seat ${id.split("-")[3]} - ${isAvailable ? `Available ($${price})` : "Unavailable"}`}
  >
    {isAccessible ? <FaWheelchair /> : <FaSquare />}
  </motion.button>
));

const Row = React.memo(({ rowId, seats, selectedSeats, onSeatSelect }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center mb-2"
  >
    <span className="w-8 text-sm font-bold mr-2 text-black">{rowId}</span>
    <div className="flex">
      {seats.map((seat) => (
        <Seat
          key={seat.id}
          id={seat.id}
          isSelected={selectedSeats.includes(seat.id)}
          isAvailable={seat.isAvailable}
          onSelect={onSeatSelect}
          price={seat.price}
          isAccessible={seat.isAccessible}
        />
      ))}
    </div>
  </motion.div>
));

const Section = React.memo(({ sectionId, rows, selectedSeats, onSeatSelect, isActive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`mb-8 p-6 rounded-xl shadow-md transition-all duration-300 ${isActive ? "border-2 border-black bg-gray-50" : "border border-gray-300 hover:border-black"}`}
  >
    <h3 className="text-xl font-semibold mb-4 text-black text-center">{sectionId}</h3>
    <AnimatePresence>
      {Object.entries(rows).map(([rowId, seats]) => (
        <Row key={rowId} rowId={rowId} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />
      ))}
    </AnimatePresence>
  </motion.div>
));

const Screen = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="w-full h-16 bg-gradient-to-r from-gray-300 to-gray-400 text-black text-sm rounded-t-3xl flex items-center justify-center mb-10 shadow-lg"
  >
    <span className="text-lg font-bold">Screen</span>
  </motion.div>
);

const Legend = () => (
  <div className="flex justify-center space-x-6 mb-6">
    {[
      { className: "bg-black text-white", label: "Selected", icon: <FaSquare /> },
      { className: "bg-white text-black border-black", label: "Available", icon: <FaSquare /> },
      { className: "bg-gray-300 text-gray-500 opacity-50", label: "Unavailable", icon: <FaSquare /> },
      { className: "bg-white text-black border-black", label: "Accessible", icon: <FaWheelchair /> },
    ].map(({ className, label, icon }) => (
      <div className="flex items-center" key={label}>
        <div className={`w-8 h-8 ${className} rounded mr-2 border flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-black">{label}</span>
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
  const [isAccessible, setIsAccessible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const newTotalPrice = selectedSeats.reduce((sum, id) => {
      const [section, row] = id.split('-');
      return sum + layout[section][row].find(seat => seat.id === id).price;
    }, 0);
    setTotalPrice(newTotalPrice);
  }, [selectedSeats, layout]);

  const handleSeatSelect = useCallback((seatId) => {
    setSelectedSeats(prev => {
      const newSelection = prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId];
      
      toast.success(`Updated selection. Total: $${totalPrice.toFixed(2)}`);
      return newSelection;
    });
  }, [layout, totalPrice]);

  const addRow = useCallback(() => {
    if (!currentSection || !newRowName || !newSeatCount || !seatPrice) {
      toast.error("Please fill in all fields before adding a row.");
      return;
    }

    const seatCount = parseInt(newSeatCount, 10);
    const price = parseFloat(seatPrice);

    if (isNaN(seatCount) || seatCount <= 0 || seatCount > 50 || isNaN(price) || price <= 0) {
      toast.error("Please enter valid seat count (1-50) and price.");
      return;
    }

    setLayout(prev => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [newRowName]: Array.from({ length: seatCount }, (_, i) => ({
          id: `${currentSection}-${newRowName}-seat-${i + 1}`,
          isAvailable: true,
          price: price,
          isAccessible: isAccessible && i < Math.ceil(seatCount * 0.1), // Make 10% of seats accessible
        })),
      },
    }));

    setNewRowName("");
    setNewSeatCount("");
    setSeatPrice("");
    setIsAccessible(false);
    toast.success("Row added successfully!");
  }, [currentSection, newRowName, newSeatCount, seatPrice, isAccessible]);

  const addSection = useCallback(() => {
    if (!newSectionName.trim()) {
      toast.error("Please enter a section name.");
      return;
    }
    setLayout(prev => ({ ...prev, [newSectionName]: {} }));
    setCurrentSection(newSectionName);
    setNewSectionName("");
    toast.success("Section added successfully!");
  }, [newSectionName]);

  const generateLayout = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the layout?")) {
      setLayout({});
      setSelectedSeats([]);
      setCurrentSection("");
      toast.success("Layout cleared successfully!");
    }
  }, []);

  const layoutSections = useMemo(() => (
    Object.entries(layout).map(([sectionId, rows]) => (
      <Section
        key={sectionId}
        sectionId={sectionId}
        rows={rows}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelect}
        isActive={currentSection === sectionId}
      />
    ))
  ), [layout, selectedSeats, handleSeatSelect, currentSection]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center text-black"
      >
        Cinema Seating Arrangement
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-black">Add New Section</h2>
          <input
            type="text"
            placeholder="Section Name (e.g., VIP)"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
          />
          <Button onClick={addSection} className="mt-4 w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
            Add Section
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-black">Add New Row</h2>
          <select
            value={currentSection}
            onChange={(e) => setCurrentSection(e.target.value)}
            className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-black transition-colors duration-300 mb-4"
          >
            <option value="">Select Section</option>
            {Object.keys(layout).map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Row Name"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
            />
            <input
              type="number"
              placeholder="Seats"
              value={newSeatCount}
              onChange={(e) => setNewSeatCount(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
            />
            <input
              type="number"
              placeholder="Price"
              value={seatPrice}
              onChange={(e) => setSeatPrice(e.target.value)}
              className="p-3 border-2 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
            />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isAccessible"
              checked={isAccessible}
              onChange={(e) => setIsAccessible(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isAccessible">Include Accessible Seats</label>
          </div>
          <Button onClick={addRow} className="mt-4 w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
            Add Row
          </Button>
        </motion.div>
      </div>

      <Button onClick={generateLayout} className="mb-8 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
        Clear Layout
      </Button>

      <Legend />

      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
        <Screen />
        <div className="overflow-x-auto">{layoutSections}</div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 bg-gray-50 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-black">Selected Seats:</h2>
        <p className="text-lg text-black">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</p>
        <p className="text-xl font-bold mt-4 text-black">Total Price: ${totalPrice.toFixed(2)}</p>
      </motion.div>
    </div>
  );
}
