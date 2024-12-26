import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import SidePanel from "../Admin/SidePanel";
import { useParams } from "react-router-dom";


const SeatingEditor = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState({
    name: "",
    price: 0,
    totalRows: 0,
    seatsPerRow: 0
  });
  
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSection, setNewSection] = useState({
    name: "",
    rows: 10,
    columns: 10,
    price: 0
  });
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidePanelOpen(false);
      } else {
        setIsSidePanelOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      if (id) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/seating/seatingplans/${id}`);
          if (response.data.statusCode === 200) {
            const planData = response.data.data;
            setPlan({
              name: planData.name,
              price: planData.sections[0]?.price || 0,
              totalRows: planData.totalRows,
              seatsPerRow: planData.seatsPerRow
            });
            setSections(planData.sections || []);
          }
        } catch (error) {
          console.error("Error fetching plan:", error);
          setError("Failed to fetch seating plan");
        }
      }
    };
    fetchPlan();
  }, [id]);

  const handlePlanNameChange = (e) => {
    setPlan(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handlePlanPriceChange = (e) => {
    setPlan(prev => ({
      ...prev,
      price: parseFloat(e.target.value)
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
        id: Date.now(),
        rows: parseInt(newSection.rows),
        columns: parseInt(newSection.columns),
        price: parseFloat(newSection.price),
        seats: Array.from({ length: newSection.rows * newSection.columns }, (_, index) => ({
          row: String.fromCharCode(65 + Math.floor(index / newSection.columns)),
          seatNumber: (index % newSection.columns) + 1,
          isAvailable: true,
          isBooked: false,
          isVisible: true
        }))
      };

      setSections(prev => [...prev, newSectionData]);
      setNewSection({
        name: "",
        rows: 10,
        columns: 10,
        price: 0
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
      return total + (section.rows * section.columns);
    }, 0);
  };

  const handleSavePlan = async () => {
    try {
      const totalRows = sections.reduce((max, section) => Math.max(max, section.rows), 0);
      const seatsPerRow = sections.reduce((max, section) => Math.max(max, section.columns), 0);

      const planData = {
        name: plan.name,
        sections: sections.map(section => ({
          name: section.name,
          rows: section.rows,
          columns: section.columns,
          price: plan.price,
          seats: section.seats
        })),
        totalRows,
        seatsPerRow
      };

      let response;
      if (id) {
        response = await axios.put(`http://localhost:8000/api/v1/seating/seatingplans/${id}`, planData);
      } else {
        response = await axios.post("http://localhost:8000/api/v1/seating/seatingplans", planData);
      }

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        alert("Seating plan saved successfully");
      } else {
        console.error("Failed to save seating plan:", response.data.message);
        alert("Failed to save seating plan. Please try again.");
      }
    } catch (error) {
      console.error("Error saving seating plan:", error);
      alert("Failed to save seating plan. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="text-red-400 p-4">
        Error: {error}
        <Button 
          onClick={() => setError(null)}
          className="ml-4 bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar with toggle */}
      <div className={`${isSidePanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 fixed h-full md:relative z-30`}>
        {isSidePanelOpen && <SidePanel />}
      </div>

      {/* Toggle button for mobile */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-gray-700 p-2 rounded-md text-white"
        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
      >
        ☰
      </button>

      <div className={`flex-1 p-4 sm:p-6 overflow-y-auto transition-all duration-300 ${isSidePanelOpen ? 'md:ml-0' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Plan Name Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                value={plan.name}
                onChange={handlePlanNameChange}
                placeholder="Plan Name"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                type="number"
                value={plan.price}
                onChange={handlePlanPriceChange}
                placeholder="Plan Price"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <div className="text-gray-400 text-sm">
                Total Seats: {calculateTotalSeats()}
              </div>
            </CardContent>
          </Card>

          {/* Add Section Form */}
          <Card className="bg-gray-800 border-gray-700">
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
                  className="bg-gray-700 border-gray-600 text-white w-full"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      Columns Per Row
                    </label>
                    <Input
                      type="number"
                      name="columns"
                      value={newSection.columns}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Card 
                key={section.id} 
                className="bg-gray-800 border-gray-700"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 flex justify-between items-center text-base sm:text-lg">
                    <span className="truncate mr-2">{section.name}</span>
                    <Button
                      onClick={() => handleDeleteSection(section.id)}
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-gray-300 text-sm sm:text-base">
                    <p>Rows: {section.rows}</p>
                    <p>Columns per row: {section.columns}</p>
                    <p>Total seats: {section.rows * section.columns}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 flex justify-end mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
            <Button onClick={handleSavePlan} className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingEditor;