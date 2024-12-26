import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import SidePanel from "../Admin/SidePanel";

const SeatingEditor = () => {
  const [plan, setPlan] = useState({
    name: "New Seating Plan",
    width: 1000,
    height: 1000
  });
  
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSection, setNewSection] = useState({
    name: "",
    rows: 10,
    seatsPerRow: 10
  });

  // Basic error boundary
  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="w-64 bg-gray-800">
          <SidePanel />
        </div>
        <div className="flex-1 p-6">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <Button 
            onClick={() => setError(null)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handlePlanNameChange = (e) => {
    setPlan(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleNewSectionChange = (e) => {
    const { name, value } = e.target;
    setNewSection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSection = () => {
    try {
      if (!newSection.name) {
        throw new Error("Section name is required");
      }

      const newSectionData = {
        ...newSection,
        id: Date.now(), // Temporary ID for demo
        rows: parseInt(newSection.rows),
        seatsPerRow: parseInt(newSection.seatsPerRow)
      };

      setSections(prev => [...prev, newSectionData]);
      setNewSection({
        name: "",
        rows: 10,
        seatsPerRow: 10
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSection = (sectionId) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const calculateTotalSeats = () => {
    return sections.reduce((total, section) => {
      return total + (section.rows * section.seatsPerRow);
    }, 0);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-64 bg-gray-800">
        <SidePanel />
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Plan Name Section */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={plan.name}
                onChange={handlePlanNameChange}
                placeholder="Plan Name"
                className="bg-gray-700 border-gray-600 text-white mb-2"
              />
              <div className="text-gray-400 text-sm">
                Total Seats: {calculateTotalSeats()}
              </div>
            </CardContent>
          </Card>

          {/* Add Section Form */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Add New Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  value={newSection.name}
                  onChange={handleNewSectionChange}
                  placeholder="Section Name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Number of Rows
                    </label>
                    <Input
                      type="number"
                      name="rows"
                      value={newSection.rows}
                      onChange={handleNewSectionChange}
                      min="1"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Seats Per Row
                    </label>
                    <Input
                      type="number"
                      name="seatsPerRow"
                      value={newSection.seatsPerRow}
                      onChange={handleNewSectionChange}
                      min="1"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddSection}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Section
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sections Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Card 
                key={section.id} 
                className="bg-gray-800 border-gray-700"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    {section.name}
                    <Button
                      onClick={() => handleDeleteSection(section.id)}
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-gray-300">
                    <p>Rows: {section.rows}</p>
                    <p>Seats per row: {section.seatsPerRow}</p>
                    <p>Total seats: {section.rows * section.seatsPerRow}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Save className="mr-2 h-4 w-4" /> Save Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingEditor;