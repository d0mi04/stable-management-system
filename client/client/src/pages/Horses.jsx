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

const HorseForm = ({ onSubmit, initialData = initialState, editMode = false, onCancel }) => {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && initialData.birthDate && !initialData.age) {
      setForm({
        ...initialData,
        age: calculateAge(initialData.birthDate)
      });
    } else {
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
      onSubmit(data.horse);
    } catch (err) {
      setError(err.message || 'Failed to save horse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-center text-indigo-700">
            {editMode ? "Edit Horse" : "Create New Horse"}
          </h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
          </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Horse Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter horse name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Breed</label>
            <input
              type="text"
              name="breed"
              value={form.breed}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter breed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Age in years"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
            <input
              type="text"
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Additional notes"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-150 disabled:opacity-50"
            >
              {loading ? (editMode ? "Saving..." : "Adding...") : editMode ? "Save Changes" : "Create Horse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HorseDetailsModal = ({ horseId, onClose }) => {
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-indigo-700">
            Horse Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-indigo-600">Loading...</span>
          </div>
        ) : horse ? (
          <div className="space-y-4">            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {horse.name}</p>
                <p><span className="font-medium">Owner:</span> {horse.ownerEmail || "Not assigned"}</p>
                <p><span className="font-medium">Breed:</span> {horse.breed}</p>
                <p><span className="font-medium">Age:</span> {horse.age || calculateAge(horse.birthDate)} years</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    horse.status === 'stall granted' ? 'bg-green-100 text-green-800' :
                    horse.status === 'waiting for stall' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {horse.status === 'stall granted' ? 'stall assigned' : 
                     horse.status === 'waiting for stall' ? 'waiting for stall' : 
                     'Unknown'}
                  </span>
                </p>
              </div>
            </div>

            {horse.notes && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{horse.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-600 text-center py-8">Failed to load horse details.</div>
        )}
      </div>
    </div>
  );
};

const AssignStallModal = ({ horse, availableStalls, selectedStall, onChange, onConfirm, onCancel, onUnassign }) => {
  const [selectedStable, setSelectedStable] = useState("");
  
  // Group stalls by stable
  const stallsByStable = React.useMemo(() => {
    if (!availableStalls || availableStalls.length === 0) return {};
    
    // Filter out stalls with invalid stable references first
    const validStalls = availableStalls.filter(stall => {
      if (!stall.stableId || !stall.stableId._id || !stall.stableId.fullName) {
        console.warn(`Filtering out stall ${stall.name} due to invalid stable reference:`, stall.stableId);
        return false;
      }
      return true;
    });
    
    return validStalls.reduce((acc, stall) => {
      const stableName = stall.stableId.fullName;
      const stableId = stall.stableId._id;
      
      if (!acc[stableId]) {
        acc[stableId] = {
          name: stableName,
          location: stall.stableId?.location,
          stalls: []
        };
      }
      acc[stableId].stalls.push(stall);
      return acc;
    }, {});
  }, [availableStalls]);

  const filteredStalls = React.useMemo(() => {
    if (!selectedStable || selectedStable === "") {
      // Return only valid stalls (those with proper stable references)
      return availableStalls?.filter(stall => 
        stall.stableId && stall.stableId._id && stall.stableId.fullName
      ) || [];
    }
    return stallsByStable[selectedStable]?.stalls || [];
  }, [selectedStable, stallsByStable, availableStalls]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-indigo-700 mb-6">
          Assign Stall to {horse.name}
        </h3>
        
        {horse.stallId ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-semibold mb-2">Already Assigned</p>
            <p className="text-yellow-700 text-sm">This horse already has a stall assigned. You must unassign the current stall before assigning a new one.</p>
          </div>
        ) : (
          <p className="mb-6 text-gray-600">Select an available stall to assign to this horse.</p>
        )}
        
        {/* Stable Filter */}
        {Object.keys(stallsByStable).length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Stable</label>
            <select
              value={selectedStable}
              onChange={(e) => {
                setSelectedStable(e.target.value);
                onChange({ target: { value: "" } }); // Reset stall selection when stable changes
              }}
              disabled={!!horse.stallId}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            >
              <option value="">All Stables</option>
              {Object.entries(stallsByStable).map(([stableId, stable]) => (
                <option key={stableId} value={stableId}>
                  {stable.name} ({stable.stalls.length} available)
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Stalls</label>
          <select
            value={selectedStall}
            onChange={onChange}
            disabled={!!horse.stallId}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
          >
            <option value="">Select a stall</option>
            {filteredStalls && filteredStalls.length > 0 ? (
              filteredStalls.map(stall => (
                <option key={stall._id} value={stall._id}>
                  {stall.name} ({stall.size}) - {stall.stableId?.fullName || 'Unknown Stable'}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {selectedStable ? "No available stalls in selected stable" : "No available stalls found"}
              </option>
            )}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            {selectedStable 
              ? `Available in ${stallsByStable[selectedStable]?.name}: ${filteredStalls.length}`
              : `Total available stalls: ${availableStalls ? availableStalls.length : 0}`
            }
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition duration-150"
          >
            Cancel
          </button>
          {!horse.stallId && (
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-150"
            >
              Confirm Assignment
            </button>
          )}
          {horse.stallId && (
            <button 
              onClick={onUnassign} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition duration-150"
            >
              Unassign Current Stall
            </button>
          )}
        </div>
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

  const [assigningHorse, setAssigningHorse] = useState(null);
  const [availableStalls, setAvailableStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState("");

  const fetchHorses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}horses`, {
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
  }, [showForm, editHorse]);

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
    setAvailableStalls([]);
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
      let allStalls = [];
      if (data.stalls && Array.isArray(data.stalls)) {
        allStalls = data.stalls;
      } else if (Array.isArray(data)) {
        allStalls = data;
      }
      
      if (allStalls.length === 0) {
        alert("No stalls available in the system.");
        return;
      }
      
      const availableStallsData = allStalls.filter(stall => stall.status === "available");
      
      if (availableStallsData.length === 0) {
        alert("No available stalls found. All stalls are currently occupied.");
      }
      
      setAvailableStalls(availableStallsData);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Horse Management</h1>
          <p className="text-gray-600">Manage your horses and stall assignments efficiently</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Horses</h2>
            <button
              onClick={() => { setShowForm(true); setEditHorse(null); }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Horse
            </button>
          </div>

        {/* Horse Form Modal */}
        {showForm && (
          <HorseForm
            onSubmit={() => { setShowForm(false); setEditHorse(null); }}
            onCancel={() => { setShowForm(false); setEditHorse(null); }}
            initialData={editHorse || initialState}
            editMode={!!editHorse}
          />
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : horses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No horses found</p>
            <p className="text-gray-400">Create your first horse to get started</p>
          </div>
        ) : (
          /* Horse Cards Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {horses.map((horse) => (
              <div key={horse._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-150 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{horse.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    horse.status === 'stall granted' ? 'bg-green-100 text-green-800' :
                    horse.status === 'waiting for stall' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {horse.status === 'stall granted' ? 'stall assigned' : 
                     horse.status === 'waiting for stall' ? 'waiting for stall' : 
                     'Unknown'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 flex-grow">
                  <p><span className="font-medium">Owner:</span> {horse.ownerEmail || "Not assigned"}</p>
                  <p><span className="font-medium">Breed:</span> {horse.breed}</p>
                  <p><span className="font-medium">Age:</span> {horse.age || calculateAge(horse.birthDate)} years</p>
                  {horse.notes && (
                    <p><span className="font-medium">Notes:</span> {horse.notes}</p>
                  )}
                </div>
                <div className="flex justify-center items-center mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleDetails(horse)}
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition duration-150 p-2 rounded"
                    title="View Details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  <button
                    onClick={() => handleEdit(horse)}
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition duration-150 p-2 rounded"
                    title="Edit Horse"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  {horse.stallId ? (
                    <button
                      onClick={() => handleUnassignStall(horse)}
                      className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 transition duration-150 p-2 rounded"
                      title="Unassign Stall"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssignStall(horse)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 transition duration-150 p-2 rounded"
                      title="Assign Stall"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </button>
                  )}
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  <button
                    onClick={() => handleDeleteHorse(horse._id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 transition duration-150 p-2 rounded"
                    title="Delete Horse"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Modals */}
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
          />
        )}
      </div>
    </div>
  );
};

export default Horses;