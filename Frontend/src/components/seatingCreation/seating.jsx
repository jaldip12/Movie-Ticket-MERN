import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidePanel from "../Admin/SidePanel";
import SeatingEditor from "./SeatingEditor"; // Import the SeatingEditor component

const SeatingPlans = () => {
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [rows, setRows] = useState(10); // Default values
  const [columns, setColumns] = useState(10); // Default values
  const [selectedPlan, setSelectedPlan] = useState(null); // State to hold the selected plan
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchSeatingPlans();
  }, []);

  const fetchSeatingPlans = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/seating/seatingplans");
      if (response.data.statusCode === 200) {
        setSeatingPlans(response.data.data);
      } else {
        console.error("Failed to fetch seating plans:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching seating plans:", error);
    }
  };

  const handleViewEdit = (id) => {
    navigate(`edit/${id}`); // Navigate to the SeatingEditor page with the plan ID
  };

  const handleCreateNew = () => {
    setShowPopup(true);
  };

  const handleCreateAndSave = async () => {
    try {
      if (!newPlanName.trim()) {
        alert("Please enter a name for the seating plan");
        return;
      }

      const newPlan = {
        name: newPlanName,
        sections: [{ // Assuming a single section for simplicity
          name: "Default Section",
          rows: rows,
          columns: columns,
          price: 0, // Default price
          seats: [] // Initialize seats array
        }]
      };

      const response = await axios.post("http://localhost:8000/api/v1/seating/seatingplans", newPlan);
      
      if (response.data.statusCode === 201) {
        await fetchSeatingPlans(); // Refresh the list
        setShowPopup(false);
        setNewPlanName("");
        setRows(10);
        setColumns(10);
      } else {
        console.error("Failed to create seating plan:", response.data.message);
        alert("Failed to create seating plan. Please try again.");
      }
    } catch (error) {
      console.error("Error creating seating plan:", error);
      alert("Failed to create seating plan. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SidePanel />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">Seating Plans</h1>

        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">Total Plans: {seatingPlans.length}</p>
          <Button 
            onClick={handleCreateNew} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Create New Plan
          </Button>
        </div>

        {/* Create Plan Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Create Seating Plan</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Enter seating plan name"
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">Your internal name for the seat plan</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                <input
                  type="number"
                  value={columns}
                  onChange={(e) => setColumns(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowPopup(false);
                    setNewPlanName("");
                    setRows(10);
                    setColumns(10);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Close
                </Button>
                <Button
                  onClick={handleCreateAndSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create & Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Seating Editor */}
        {selectedPlan && (
          <SeatingEditor 
            planId={selectedPlan} 
            onClose={() => setSelectedPlan(null)} // Close the editor when the plan is deselected
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="p-4 border-b border-gray-600">ID</th>
                <th className="p-4 border-b border-gray-600">Name</th>
                <th className="p-4 border-b border-gray-600">Created At</th>
                <th className="p-4 border-b border-gray-600">Updated At</th>
                <th className="p-4 border-b border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {seatingPlans.map((plan) => (
                <tr key={plan._id} className="hover:bg-gray-700 text-gray-300">
                  <td className="p-4 border-b border-gray-600">{plan._id}</td>
                  <td className="p-4 border-b border-gray-600">{plan.name}</td>
                  <td className="p-4 border-b border-gray-600">{new Date(plan.createdAt).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-600">{new Date(plan.updatedAt).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-600">
                    <Button
                      onClick={() => handleViewEdit(plan._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                    >
                      View & Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeatingPlans;
