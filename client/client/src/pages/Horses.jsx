import React, { useState, useEffect } from "react";

const initialState = {
  name: "",
  breed: "",
  age: "",
  notes: "",
};

const API_URL = process.env.REACT_APP_API_URL;

const calculateAge = (birthDate) => {
  if (!birthDate) return "-";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const HorseForm = ({ onSubmit, initialData = initialState, editMode = false }) => {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && initialData.birthDate && !initialData.age) {
      // If we have birthDate but no age, calculate it
      setForm({
        ...initialData,
        age: calculateAge(initialData.birthDate)
      });
    } else {
      // Otherwise use the data as is
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const token = localStorage.getItem("token");
    const isEdit = !!initialData._id;
    const url = isEdit 
      ? `${API_URL}horses/${initialData._id}` 
      : `${API_URL}horses`;
    
    // Format data for API
    const horseData = {
      ...form,
      birthDate: form.birthDate || new Date(new Date().setFullYear(new Date().getFullYear() - form.age))
    };

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(horseData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save horse');
      }

      const data = await res.json();
      console.log('Horse saved:', data);
      onSubmit(data.horse); // Tell parent component we're done
    } catch (err) {
      console.error('Error saving horse:', err);
      setError(err.message || 'Failed to save horse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-8 border border-gray-200 max-w-xl mx-auto"
    >
      <h3 className="text-xl font-semibold mb-6 text-indigo-700">
        {editMode ? "Edit Horse" : "Add New Horse"}
      </h3>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Horse name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Breed</label>
          <input
            type="text"
            name="breed"
            value={form.breed}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Breed"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Age</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Age"
            min="0"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Notes</label>
          <input
            type="text"
            name="notes"
            value={form.notes || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Notes"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition duration-200"
        disabled={loading}
      >
        {loading ? (editMode ? "Saving..." : "Adding...") : editMode ? "Save Changes" : "Add Horse"}
      </button>
    </form>
  );
};

const HorseDetailsModal = ({ horseId, onClose, waitingMode }) => {
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stallDetails, setStallDetails] = useState(null);

  useEffect(() => {
    const fetchHorse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}horses/${horseId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const { horse: fetchedHorse } = await res.json();
        setHorse(fetchedHorse);
        
        // grab whichever field your API put it in:
        const sid = fetchedHorse.stallId || fetchedHorse.stall;
        if (sid) {
          const stallRes = await fetch(`${API_URL}stalls/${sid}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          });
          const { stall } = await stallRes.json();
          setStallDetails(stall);
        }
      } catch (e) {
        console.error(e);
        setHorse(null);
      }
      setLoading(false);
    };
    fetchHorse();
  }, [horseId]);

  if (!horseId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : horse ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">{horse.name}</h2>
            <p>
              <span className="font-semibold">Owner:</span> {horse.ownerEmail || "-"}
            </p>
            <p>
              <span className="font-semibold">Breed:</span> {horse.breed}
            </p>
            <p>
              <span className="font-semibold">Age:</span> {horse.age || calculateAge(horse.birthDate)}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {horse.status || "-"}
            </p>
            {waitingMode && (
              stallDetails ? (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-indigo-600">Assigned Stall</h3>
                  <p><span className="font-semibold">Stall Name:</span> {stallDetails.name}</p>
                  <p><span className="font-semibold">Size:</span> {stallDetails.size}</p>
                  <p><span className="font-semibold">Status:</span> {stallDetails.status}</p>
                </div>
              ) : (
                <p className="mt-2 text-amber-600">
                  <span className="font-semibold">Stall:</span> No stall assigned
                </p>
              )
            )}
            <p className="mt-2">
              <span className="font-semibold">Notes:</span> {horse.notes || "-"}
            </p>
          </>
        ) : (
          <div className="text-red-600">Failed to load horse details.</div>
        )}
      </div>
    </div>
  );
};

const Horses = () => {
  const [showForm, setShowForm] = useState(false);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsHorseId, setDetailsHorseId] = useState(null);
  const [editHorse, setEditHorse] = useState(null);
  const [waitingMode, setWaitingMode] = useState(false);
  const [assigningHorse, setAssigningHorse] = useState(null);
  const [availableStalls, setAvailableStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState("");

  const fetchHorses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = waitingMode ? "horses/waiting" : "horses";
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setHorses(data.horses || []);
    } catch (err) {
      setHorses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHorses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editHorse, waitingMode]);

  const handleEdit = async (horse) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}horses/${horse._id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setEditHorse(data.horse || horse);
      setShowForm(true);
    } catch {
      setEditHorse(horse);
      setShowForm(true);
    }
  };

  const handleDetails = (horse) => {
    setDetailsHorseId(horse._id);
  };

  const handleCloseDetails = () => {
    setDetailsHorseId(null);
  };

  const handleAssignStall = async (horse) => {
    setAssigningHorse(horse);
    setAvailableStalls([]); // Reset available stalls
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_URL}stalls`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        alert("Failed to fetch stalls.");
        return;
      }
      
      const data = await res.json();
      console.log("Stalls API response:", data); // Debug the response
      
      // Extract stalls from response
      let allStalls = [];
      if (data.stalls && Array.isArray(data.stalls)) {
        allStalls = data.stalls;
      } else if (Array.isArray(data)) {
        allStalls = data;
      }
      
      console.log("Extracted stalls:", allStalls);
      
      if (allStalls.length === 0) {
        console.log("No stalls returned from API");
        alert("No stalls available in the system.");
        return;
      }
      
      // Filter stalls and log the results
      const availableStallsData = allStalls.filter(stall => stall.status === "available");
      console.log("Available stalls:", availableStallsData);
      
      if (availableStallsData.length === 0) {
        alert("No available stalls found. All stalls are currently occupied.");
      }
      
      // Set state with available stalls
      setAvailableStalls(availableStallsData);
      console.log("State updated with:", availableStallsData);
      
      // If this horse already has a stall, fetch its details
      if (horse.stallId) {
        const stallRes = await fetch(`${API_URL}stalls/${horse.stallId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (stallRes.ok) {
          const stallData = await stallRes.json();
          console.log("Current stall:", stallData.stall);
        }
      }
    } catch (err) {
      console.error("Error fetching stalls:", err);
      alert("Failed to fetch stalls: " + (err.message || "Unknown error"));
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedStall) {
      alert("Please select a stall.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}horses/${assigningHorse._id}/assign-stall`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ stallID: selectedStall }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to assign stall.");
      }
      fetchHorses();
      setAssigningHorse(null);
      setSelectedStall("");
    } catch (err) {
      alert("Failed to assign stall.");
    }
  };

  const handleCancelAssign = () => {
    setAssigningHorse(null);
    setSelectedStall("");
  };

  const handleModalUnassign = async () => {
    if (!assigningHorse) return;
    
    if (!window.confirm(`Are you sure you want to unassign the stall from ${assigningHorse.name}?`)) {
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}horses/${assigningHorse._id}/unassign-stall`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to unassign stall.");
      } else {
        alert("Stall successfully unassigned!");
        fetchHorses();
      }
      setAssigningHorse(null);
      setSelectedStall("");
    } catch (err) {
      alert("Failed to unassign stall.");
    }
  };

  const handleUnassignStall = async (horse) => {
    if (!window.confirm(`Are you sure you want to unassign the stall from ${horse.name}?`)) {
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}horses/${horse._id}/unassign-stall`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to unassign stall.");
      } else {
        alert("Stall successfully unassigned!");
        fetchHorses();
      }
    } catch (err) {
      alert("Failed to unassign stall.");
    }
  };

  const handleDeleteHorse = async (horseId) => {
    if (!window.confirm("Are you sure you want to delete this horse?")) {
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}horses/${horseId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete horse.");
      } else {
        alert("Horse deleted successfully!");
        fetchHorses();
      }
    } catch (err) {
      alert("Failed to delete horse.");
    }
  };

  const AssignStallModal = ({ horse, availableStalls, selectedStall, onChange, onConfirm, onCancel, onUnassign }) => {
    console.log("Modal rendering with stalls:", availableStalls); // Debug log
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-xl font-semibold mb-4">Assign Stall to {horse.name}</h3>
          
          {horse.stallId ? (
            <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-amber-600 font-semibold">This horse already has a stall assigned.</p>
              <p>You must unassign the current stall before assigning a new one.</p>
            </div>
          ) : (
            <p className="mb-4 text-gray-600">Select an available stall to assign to this horse.</p>
          )}
          
          <select
            value={selectedStall}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={!!horse.stallId}       // ← only disabled when stallId is truthy
          >
            <option value="">Select a stall</option>
            {availableStalls && availableStalls.length > 0 ? (
              availableStalls.map(stall => (
                <option key={stall._id} value={stall._id}>
                  {stall.name} ({stall.size})
                </option>
              ))
            ) : (
              <option value="" disabled>No available stalls found</option>
            )}
          </select>
          
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            Available stalls: {availableStalls ? availableStalls.length : 0}
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded">
              Cancel
            </button>
            {!horse.stallId && (
              <button onClick={onConfirm} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
                Confirm Assignment
              </button>
            )}
            {horse.stallId && (
              <button onClick={onUnassign} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Unassign Current Stall
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between mb-6">
        <button
          onClick={() => { setShowForm(prev => !prev); setEditHorse(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          {showForm && !editHorse ? "Close form" : "Add new Horse"}
        </button>
        <button
          onClick={() => setWaitingMode(prev => !prev)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          {waitingMode ? "Show All Horses" : "Show Waiting Horses"}
        </button>
      </div>
      {showForm && (
        <HorseForm
          onSubmit={() => { setShowForm(false); setEditHorse(null); }}
          initialData={editHorse || initialState}
          editMode={!!editHorse}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {horses.map((horse) => (
            <div key={horse._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center border border-gray-200">
              <h3 className="text-lg font-bold">{horse.name}</h3>
              <p><span className="font-semibold">Owner:</span> {horse.ownerEmail || "-"}</p>
              <p><span className="font-semibold">Breed:</span> {horse.breed}</p>
              <p><span className="font-semibold">Age:</span> {horse.age || calculateAge(horse.birthDate)}</p>
              {waitingMode && (
                horse.stallId ? (
                  <p className="text-green-600"><span className="font-semibold">Status:</span> {horse.status}</p>
                ) : (
                  <p className="text-amber-600"><span className="font-semibold">Status:</span> {horse.status}</p>
                )
              )}
              <p><span className="font-semibold">Notes:</span> {horse.notes || "-"}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold"
                  onClick={() => handleEdit(horse)}
                >
                  Edit
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  onClick={() => handleDetails(horse)}
                >
                  Details
                </button>
                {horse.stallId
                  ? (<button
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-semibold"
                      onClick={() => handleUnassignStall(horse)}
                    >
                      Unassign Stall
                    </button>)
                  : (<button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold"
                      onClick={() => handleAssignStall(horse)}
                    >
                      Assign Stall
                    </button>)
                }
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  onClick={() => handleDeleteHorse(horse._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningHorse && (
        <AssignStallModal 
          horse={assigningHorse}
          availableStalls={availableStalls}
          selectedStall={selectedStall}
          onChange={(e) => setSelectedStall(e.target.value)}
          onConfirm={handleConfirmAssign}
          onCancel={handleCancelAssign}
          onUnassign={handleModalUnassign}
        />
      )}

      {detailsHorseId && (
        <HorseDetailsModal 
          horseId={detailsHorseId} 
          onClose={handleCloseDetails}
          waitingMode={waitingMode}      // ← NEW
        />
      )}
    </div>
  );
};

export default Horses;