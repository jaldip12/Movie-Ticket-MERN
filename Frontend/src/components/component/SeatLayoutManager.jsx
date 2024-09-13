import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

function SeatLayoutManager({ seatLayout, setSeatLayout }) {
  const [newSection, setNewSection] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newRows, setNewRows] = useState([{ rowName: '', seatCount: '' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState('');

  const handleAddOrUpdateSection = () => {
    if (!newSection || !newPrice || newRows.length === 0) {
      alert("Please fill out all fields.");
      return;
    }

    const rows = newRows.reduce((acc, row) => {
      if (row.rowName && row.seatCount) {
        acc[row.rowName] = parseInt(row.seatCount, 10);
      }
      return acc;
    }, {});

    setSeatLayout((prevLayout) => ({
      ...prevLayout,
      [newSection]: { price: parseInt(newPrice, 10), rows },
    }));

    setNewSection('');
    setNewPrice('');
    setNewRows([{ rowName: '', seatCount: '' }]);
    setIsEditing(false);
  };

  const handleEditSection = (sectionName) => {
    const section = seatLayout[sectionName];
    setNewSection(sectionName);
    setNewPrice(section.price.toString());
    setNewRows(Object.entries(section.rows).map(([rowName, seatCount]) => ({
      rowName,
      seatCount: seatCount.toString()
    })));
    setIsEditing(true);
    setEditingSection(sectionName);
  };

  const handleRowChange = (index, field, value) => {
    if (field === "seatCount" && value > 33) {
      alert("Each row can have a maximum of 33 seats.");
      value = 33;
    }

    const updatedRows = [...newRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setNewRows(updatedRows);
  };

  const addRowInput = () => {
    setNewRows([...newRows, { rowName: '', seatCount: '' }]);
  };

  const deleteSection = (sectionName) => {
    const updatedLayout = { ...seatLayout };
    delete updatedLayout[sectionName];
    setSeatLayout(updatedLayout);
    if (isEditing && sectionName === editingSection) {
      setIsEditing(false);
      setNewSection('');
      setNewPrice('');
      setNewRows([{ rowName: '', seatCount: '' }]);
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        {isEditing ? `Edit Section: ${editingSection}` : "Add Custom Section"}
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Section Name"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          disabled={isEditing}
        />
        <input
          type="number"
          placeholder="Price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        {newRows.map((row, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Row Name"
              value={row.rowName}
              onChange={(e) => handleRowChange(index, "rowName", e.target.value)}
              className="w-full sm:w-auto flex-1 p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Seat Count"
              value={row.seatCount}
              onChange={(e) => handleRowChange(index, "seatCount", e.target.value)}
              className="w-full sm:w-auto flex-1 p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <Button onClick={addRowInput} className="px-4 py-2 w-full sm:w-auto">Add Row</Button>
        <Button onClick={handleAddOrUpdateSection} className="px-4 py-2 w-full sm:w-auto">
          {isEditing ? "Update Section" : "Add Section"}
        </Button>
      </div>
    </div>
  );
}
export default SeatLayoutManager;