import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  FaChair, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaSave
} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Constants
const MAX_SEATS_PER_ROW = 40;
const MAX_SECTIONS = 10;
const MAX_ROWS_PER_SECTION = 20;

// Seat Component
const Seat = React.memo(({ 
  id, 
  price, 
  isDisabled,
  seatNumber 
}) => {
  const getStatusColor = () => {
    if (isDisabled) return "bg-gray-300 text-gray-500";
    return "bg-white text-gray-800";
  };

  return (
    <div
      className={`w-10 h-10 m-1 rounded-lg
                  flex items-center justify-center relative
                  border-2 ${getStatusColor()}`}
      title={`Seat ${seatNumber} - Price: $${price.toFixed(2)}`}
    >
      <FaChair className="w-6 h-6" />
      <span className="absolute -bottom-1 text-xs">{seatNumber}</span>
    </div>
  );
});

// Row Component
const Row = React.memo(({ 
  rowId, 
  seats, 
  sectionPrice
}) => {
  const subRows = [];
  for (let i = 0; i < seats.length; i += MAX_SEATS_PER_ROW) {
    subRows.push(seats.slice(i, i + MAX_SEATS_PER_ROW));
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4 bg-gray-50 p-2 rounded-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold mr-4 text-gray-700">Row {rowId}</span>
        <span className="text-sm text-gray-500">
          {seats.length} seats | {seats.filter(s => !s.isDisabled).length} available
        </span>
      </div>
      {subRows.map((subRow, index) => (
        <div key={index} className="flex items-center justify-center mb-1">
          {subRow.map((seat) => (
            <Seat
              key={seat.id}
              {...seat}
              price={sectionPrice}
              seatNumber={seat.id.split('-').pop()}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
});

const Seating = () => {
  // State Management
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem('seatLayout');
    return savedLayout ? JSON.parse(savedLayout) : {};
  });
  const [editMode, setEditMode] = useState(false);
  const [modalState, setModalState] = useState({
    section: null,
    type: null
  });

  // Save layout to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('seatLayout', JSON.stringify(layout));
  }, [layout]);

  // Add Section Handler
  const addSection = useCallback((name, price) => {
    if (Object.keys(layout).length >= MAX_SECTIONS) {
      toast.error(`Maximum ${MAX_SECTIONS} sections allowed`);
      return;
    }

    if (layout[name]) {
      toast.error('Section name already exists');
      return;
    }

    setLayout(prev => ({
      ...prev,
      [name]: { price: parseFloat(price), rows: {} }
    }));
    setModalState({ section: null, type: null });
    toast.success("Section added successfully!");
  }, [layout]);

  // Add Row Handler
  const addRow = useCallback((section, rowName, seatCount) => {
    if (!section) {
      toast.error("Select a section first");
      return;
    }

    const rowCount = Object.keys(layout[section].rows).length;
    if (rowCount >= MAX_ROWS_PER_SECTION) {
      toast.error(`Maximum ${MAX_ROWS_PER_SECTION} rows per section allowed`);
      return;
    }

    if (layout[section].rows[rowName]) {
      toast.error('Row name already exists in this section');
      return;
    }

    const numSeats = parseInt(seatCount);
    if (numSeats > MAX_SEATS_PER_ROW) {
      toast.error(`Maximum ${MAX_SEATS_PER_ROW} seats per row allowed`);
      return;
    }

    setLayout(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        rows: {
          ...prev[section].rows,
          [rowName]: Array.from({ length: numSeats }, (_, i) => ({
            id: `${section}-${rowName}-${i + 1}`,
            isDisabled: false
          }))
        }
      }
    }));
    setModalState({ section: null, type: null });
    toast.success("Row added successfully!");
  }, [layout]);

  // Delete Section Handler
  const deleteSection = useCallback((sectionName) => {
    if (window.confirm(`Are you sure you want to delete section ${sectionName}?`)) {
      setLayout(prev => {
        const newLayout = { ...prev };
        delete newLayout[sectionName];
        return newLayout;
      });
      toast.success(`Section ${sectionName} deleted`);
    }
  }, []);

  // Render Sections
  const renderSections = useMemo(() => {
    return Object.entries(layout).map(([sectionName, sectionData]) => (
      <motion.div 
        key={sectionName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {sectionName} (${sectionData.price.toFixed(2)})
          </h3>
          {editMode && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setModalState({ section: sectionName, type: 'add-row' })}
                title="Add Row"
              >
                <FaPlus />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => deleteSection(sectionName)}
                title="Delete Section"
              >
                <FaTrash />
              </Button>
            </div>
          )}
        </div>
        {Object.entries(sectionData.rows).map(([rowName, seats]) => (
          <Row
            key={rowName}
            rowId={rowName}
            seats={seats}
            sectionPrice={sectionData.price}
          />
        ))}
      </motion.div>
    ));
  }, [layout, editMode, deleteSection]);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-10 text-gray-800"
      >
        Cinema Seat Layout Viewer
      </motion.h1>

      <div className="flex justify-between mb-6">
        <Button 
          onClick={() => setModalState({ section: null, type: 'add-section' })}
          className="flex items-center gap-2"
          disabled={Object.keys(layout).length >= MAX_SECTIONS}
        >
          <FaPlus /> Add Section
        </Button>
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "destructive" : "outline"}
        >
          {editMode ? 'Exit Edit Mode' : 'Edit Layout'}
        </Button>
      </div>

      <AnimatePresence>
        <div className="grid gap-6">
          {renderSections}
        </div>
      </AnimatePresence>

      {/* Modal for Adding Sections and Rows */}
      <Dialog 
        open={!!modalState.type} 
        onOpenChange={() => setModalState({ section: null, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalState.type === 'add-section' 
                ? 'Add New Section' 
                : `Add Row to ${modalState.section}`}
            </DialogTitle>
          </DialogHeader>
          {modalState.type === 'add-section' ? (
            <SectionForm onSubmit={addSection} />
          ) : (
            <RowForm 
              section={modalState.section} 
              onSubmit={addRow} 
              maxSeats={MAX_SEATS_PER_ROW}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-components for Forms
const SectionForm = ({ onSubmit }) => {
  const [sectionName, setSectionName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      toast.error('Please enter a section name');
      return;
    }
    if (!price || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    onSubmit(sectionName.trim(), price);
    setSectionName('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text" 
        placeholder="Section Name (e.g., VIP)" 
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        maxLength={20}
        required
      />
      <input 
        type="number" 
        placeholder="Seat Price" 
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        min="0.01"
        step="0.01"
        required
      />
      <Button type="submit" className="w-full">
        <FaSave className="mr-2" /> Save Section
      </Button>
    </form>
  );
};

const RowForm = ({ section, onSubmit, maxSeats }) => {
  const [rowName, setRowName] = useState('');
  const [seatCount, setSeatCount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rowName.trim()) {
      toast.error('Please enter a row name');
      return;
    }
    if (!seatCount || seatCount < 1) {
      toast.error('Please enter a valid number of seats');
      return;
    }
    onSubmit(section, rowName.trim(), seatCount);
    setRowName('');
    setSeatCount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text" 
        placeholder="Row Name (e.g., A)" 
        value={rowName}
        onChange={(e) => setRowName(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        maxLength={3}
        required
      />
      <input 
        type="number" 
        placeholder={`Number of Seats (max ${maxSeats})`} 
        value={seatCount}
        onChange={(e) => setSeatCount(e.target.value)}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        min="1"
        max={maxSeats}
        required
      />
      <Button type="submit" className="w-full">
        <FaSave className="mr-2" /> Add Row
      </Button>
    </form>
  );
};

export default Seating;