import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidePanel from "../Admin/SidePanel";
import SeatingEditor from "./SeatingEditor";

const SeatingPlans = () => {
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeatingPlans();
  }, []);

  const fetchSeatingPlans = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/seating/seatingplans");
      if (response.data.statusCode === 200) {
        setSeatingPlans(response.data.data);
      } else if (response.data.statusCode === 404) {
        setSeatingPlans([]);
      } else {
        console.error("Failed to fetch seating plans:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching seating plans:", error);
      setSeatingPlans([]);
    }
  };

  const handleViewEdit = (id) => {
    navigate(`/admin/seating/edit/${id}`);
  };

  const handleCreateNew = () => {
    setShowPopup(true);
  };

  const handleCreateAndSave = async () => {
    try {
      if (!newPlanName.trim()) {
        alert("Please enter a plan name");
        return;
      }

      const newPlan = {
        name: newPlanName.trim(),
        sections: [{
          name: "Default Section",
          rows: 10,
          columns: 10,
          price: 100,
          unavailableSeats: []
        }]
      };

      const response = await axios.post("http://localhost:8000/api/v1/seating/seatingplans", newPlan);
      
      if (response.data.statusCode === 201) {
        await fetchSeatingPlans();
        setShowPopup(false);
        setNewPlanName("");
        navigate(`/admin/seating/edit/${response.data.data.id}`);
      } else {
        console.error("Failed to create seating plan:", response.data.message);
        alert(response.data.message || "Failed to create seating plan. Please try again.");
      }
    } catch (error) {
      console.error("Error creating seating plan:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create seating plan. Please try again.");
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this seating plan?")) {
      try {
        const response = await axios.delete(`http://localhost:8000/api/v1/seating/seatingplans/${id}`);
        if (response.data.statusCode === 200) {
          await fetchSeatingPlans();
        } else {
          alert("Failed to delete seating plan");
        }
      } catch (error) {
        console.error("Error deleting seating plan:", error);
        alert("Failed to delete seating plan");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SidePanel />

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

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Create Seating Plan</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Enter seating plan name"
                  className="w-full p-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateAndSave();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowPopup(false);
                    setNewPlanName("");
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
                <tr key={plan.id} className="hover:bg-gray-700 text-gray-300">
                  <td className="p-4 border-b border-gray-600">{plan.id}</td>
                  <td className="p-4 border-b border-gray-600">{plan.name}</td>
                  <td className="p-4 border-b border-gray-600">{new Date(plan.createdAt).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-600">{new Date(plan.updatedAt).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-600">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewEdit(plan.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                      >
                        View & Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
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
