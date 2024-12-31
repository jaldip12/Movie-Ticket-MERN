import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

const SeatingEditor = () => {
  const [canvas, setCanvas] = useState({
    name: "",
  });
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({
    name: "Platinum",
    rows: 10,
    columns: 10,
    price: 0,
    unavailableSeats: []
  });
  const [totalRows, setTotalRows] = useState(0);
  const [layoutId, setLayoutId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCanvas((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({
      ...prev,
      [name]: name === "name" ? value : parseInt(value) || 0,
    }));
  };

  const handleAddSection = () => {
    // Validate section data
    if (!newSection.name || !newSection.rows || !newSection.columns || !newSection.price) {
      alert('Missing required section fields');
      return;
    }
    if (newSection.rows < 1 || newSection.columns < 1 || newSection.price < 0) {
      alert('Invalid section values');
      return;
    }

    const newSectionData = {
      name: newSection.name.trim(),
      rows: newSection.rows,
      columns: newSection.columns,
      price: newSection.price,
      startingRow: totalRows,
      unavailableSeats: [],
      seats: Array.from(
        { length: newSection.rows * newSection.columns },
        (_, index) => ({
          row: String.fromCharCode(65 + totalRows + Math.floor(index / newSection.columns)),
          seatNumber: (index % newSection.columns) + 1,
          isAvailable: true,
          isVisible: true,
          isBooked: false,
          price: newSection.price,
        })
      )
    };

    setSections([...sections, newSectionData]);
    setTotalRows(totalRows + newSection.rows);
    setNewSection((prev) => ({
      ...prev,
      name: `Block ${String.fromCharCode(65 + sections.length + 1)}`,
    }));
  };

  const handleDeleteSection = (sectionIndex) => {
    setSections(sections.filter((_, index) => index !== sectionIndex));
    
    let newTotalRows = 0;
    const updatedSections = sections.filter((_, index) => index !== sectionIndex).map(section => {
      const updatedSection = {
        ...section,
        startingRow: newTotalRows,
        seats: section.seats.map((seat, idx) => ({
          ...seat,
          row: String.fromCharCode(65 + newTotalRows + Math.floor(idx / section.columns))
        }))
      };
      newTotalRows += section.rows;
      return updatedSection;
    });
    
    setSections(updatedSections);
    setTotalRows(newTotalRows);
  };

  const toggleSeatAvailability = (sectionIndex, rowIndex, seatIndex) => {
    setSections(sections.map((section, idx) => {
      if (idx === sectionIndex) {
        const seatArrayIndex = rowIndex * section.columns + seatIndex;
        const updatedSeats = [...section.seats];
        const rowLetter = String.fromCharCode(65 + section.startingRow + rowIndex);
        const seatNumber = seatIndex + 1;
        
        // Toggle availability
        updatedSeats[seatArrayIndex] = {
          ...updatedSeats[seatArrayIndex],
          isAvailable: !updatedSeats[seatArrayIndex].isAvailable
        };

        // Update unavailable seats array
        let unavailableSeats = section.unavailableSeats ? [...section.unavailableSeats] : [];
        const rowEntry = unavailableSeats.find(r => r.row === rowLetter);

        if (!updatedSeats[seatArrayIndex].isAvailable) {
          if (rowEntry) {
            if (!rowEntry.seats.includes(seatNumber)) {
              rowEntry.seats.push(seatNumber);
              rowEntry.seats.sort((a, b) => a - b);
            }
          } else {
            unavailableSeats.push({ row: rowLetter, seats: [seatNumber] });
            unavailableSeats.sort((a, b) => a.row.localeCompare(b.row));
          }
        } else {
          if (rowEntry) {
            rowEntry.seats = rowEntry.seats.filter(s => s !== seatNumber);
            if (rowEntry.seats.length === 0) {
              unavailableSeats = unavailableSeats.filter(r => r.row !== rowLetter);
            }
          }
        }

        return { 
          ...section, 
          seats: updatedSeats,
          unavailableSeats: unavailableSeats
        };
      }
      return section;
    }));
  };

  const handleSavePlan = async () => {
    try {
      // Validate input data
      if (!canvas.name) {
        alert('Please enter a name for the seating plan');
        return;
      }

      // Transform data to match backend schema
      const seatingPlanData = {
        name: canvas.name.trim(),
        sections: sections.map(section => ({
          name: section.name.trim(),
          rows: section.rows,
          columns: section.columns,
          price: section.price,
          unavailableSeats: section.unavailableSeats || []
        }))
      };

      if (layoutId) {
        const response = await axios.put(`http://localhost:8000/api/v1/seating/seatingplans/${layoutId}`, seatingPlanData);
        if (response.data.statusCode === 200) {
          alert(response.data.message);
        }
      } else {
        const response = await axios.post('http://localhost:8000/api/v1/seating/seatingplans', seatingPlanData);
        if (response.data.statusCode === 201) {
          setLayoutId(response.data.data.id);
          alert(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error saving seating plan:', error);
      alert(error.response?.data?.message || 'Failed to save seating plan. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-[320px_1fr] gap-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Seating Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Name:</label>
                <Input
                  type="text"
                  name="name"
                  value={canvas.name}
                  onChange={handleInputChange}
                  placeholder="Enter seating plan name"
                />
              </div>
              {layoutId && (
                <div>
                  <label className="text-sm font-medium">Plan ID: {layoutId}</label>
                </div>
              )}
              <Button 
                className="w-full mt-4" 
                onClick={handleSavePlan}
                disabled={!canvas.name.trim()}
              >
                {layoutId ? 'Update Seat Plan' : 'Save New Seat Plan'}
              </Button>
            </CardContent>
          </Card>

          {layoutId && (
            <Card>
              <CardHeader>
                <CardTitle>Add Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="text"
                  name="name"
                  value={newSection.name}
                  onChange={handleSectionInputChange}
                  placeholder="Section Name"
                />
                <div>
                  <label className="text-sm font-medium">Price per Seat:</label>
                  <Input
                    type="number"
                    name="price"
                    value={newSection.price}
                    onChange={handleSectionInputChange}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Number of Rows (A-Z):</label>
                  <Input
                    type="number"
                    name="rows"
                    value={newSection.rows}
                    onChange={handleSectionInputChange}
                    placeholder="Rows"
                    min="1"
                    max={26 - totalRows}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Seats in Each Row (1-50):</label>
                  <Input
                    type="number"
                    name="columns"
                    value={newSection.columns}
                    onChange={handleSectionInputChange}
                    placeholder="Seats Per Row"
                    min="1"
                    max="50"
                  />
                </div>
                <Button
                  onClick={handleAddSection}
                  className="w-full"
                  disabled={!newSection.name || newSection.rows < 1 || newSection.columns < 1 || newSection.price <= 0 || (totalRows + newSection.rows) > 26}
                >
                  Add Section
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="bg-white border rounded-lg shadow-lg p-8">
          <div className="relative">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-16">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <p className="text-sm text-gray-600">Price: ₹{section.price}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(sectionIndex)}
                  >
                    Delete Section
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: section.rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                      <span className="w-8 text-right text-gray-600 mr-4">
                        {String.fromCharCode(65 + section.startingRow + rowIndex)}
                      </span>
                      {Array.from({ length: section.columns }).map((_, seatIndex) => {
                        const seatArrayIndex = rowIndex * section.columns + seatIndex;
                        const isAvailable = section.seats[seatArrayIndex].isAvailable;
                        return (
                          <div
                            key={seatIndex}
                            className={`w-8 h-8 border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                              isAvailable 
                                ? 'border-green-500 hover:bg-green-200' 
                                : 'border-red-500 bg-red-100 hover:bg-red-200'
                            }`}
                            onClick={() => toggleSeatAvailability(sectionIndex, rowIndex, seatIndex)}
                            title={`${String.fromCharCode(65 + section.startingRow + rowIndex)}${seatIndex + 1} - $${section.price} ${isAvailable ? '(Available)' : '(Unavailable)'}`}
                          >
                            {seatIndex + 1}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full h-16 bg-gray-800 rounded-b-lg flex items-center justify-center text-white text-xl font-bold mt-12">
            SCREEN
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingEditor;
