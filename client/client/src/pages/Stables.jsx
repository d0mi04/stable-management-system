import React, { useState, useEffect } from "react";

// Use the environment variable like other components
const API_URL = process.env.REACT_APP_API_URL;

const Stables = () => {
  const [stables, setStables] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStallForm, setShowStallForm] = useState(false);
  const [editStable, setEditStable] = useState(null);
  const [editStallData, setEditStallData] = useState(null);

  // Filter states
  const [stableFilter, setStableFilter] = useState("");
  const [stallStableFilter, setStallStableFilter] = useState("");
  const [stallStatusFilter, setStallStatusFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all stables
        const stableRes = await fetch(`${API_URL}stables`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const stableData = await stableRes.json();
        setStables(stableData.stables || []);

        // Fetch all stalls
        const stallsRes = await fetch(`${API_URL}stalls`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const stallsData = await stallsRes.json();
        setStalls(stallsData.stalls || []);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteStable = async (stableID) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this stable?")) return;
    try {
      const res = await fetch(`${API_URL}stables/${stableID}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setStables((prev) => prev.filter((stable) => stable._id !== stableID));
    } catch (err) {
      alert("Failed to delete stable.");
    }
  };

  const handleOpenEditStable = (stable) => {
    setEditStable(stable);
    setShowForm(true);
  };

  const handleSaveStable = async (stableData) => {
    const token = localStorage.getItem("token");
    if (editStable) {
      // This is an update
      try {
        const res = await fetch(`${API_URL}stables/${editStable._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(stableData),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setStables((prev) =>
          prev.map((s) => (s._id === data.stable._id ? data.stable : s))
        );
        setShowForm(false);
        setEditStable(null);
      } catch (error) {
        console.error("Failed to update stable:", error);
        alert(`Failed to update stable: ${error.message}`);
      }
    } else {
      // This is a create
      try {
        const res = await fetch(`${API_URL}stables`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(stableData),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setStables((prev) => [...prev, data.stable]);
        setShowForm(false);
      } catch (error) {
        console.error("Failed to create stable:", error);
        alert(`Failed to create stable: ${error.message}`);
      }
    }
  };

  const handleDeleteStall = async (stallID) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Delete this stall?")) return;
    try {
      const res = await fetch(`${API_URL}stalls/${stallID}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error();
      setStalls((prev) => prev.filter((s) => s._id !== stallID));
    } catch {
      alert("Failed to delete stall.");
    }
  };

  const handleOpenEditStallForm = (stall) => {
    setEditStallData(stall);
    setShowStallForm(true);
  };

  const handleSaveStall = async (stallFormData, stallID) => {
    const token = localStorage.getItem("token");
    const method = stallID ? "PUT" : "POST";
    const url = stallID ? `${API_URL}stalls/${stallID}` : `${API_URL}stalls`;

    const apiPayload = {
      ...stallFormData,
      stable: stallFormData.stableId,
    };
    delete apiPayload.stableId;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      if (stallID) {
        setStalls((prev) =>
          prev.map((s) => (s._id === stallID ? data.stall : s))
        );
      } else {
        setStalls((prev) => [...prev, data.stall]);
      }
      setShowStallForm(false);
      setEditStallData(null);
    } catch (error) {
      console.error(`Error ${stallID ? "updating" : "creating"} stall:`, error);
      alert(`Failed to ${stallID ? "update" : "create"} stall: ${error.message}`);
    }
  };

  // StableForm component - Fix the form field mapping
  const StableForm = ({ initialData, onSave, onCancel }) => {
    const [form, setForm] = useState(
      initialData || {
        fullName: "", // Change from 'name' to 'fullName'
        location: "",
        capacity: "",
        description: "",
        stallSize: "medium",
      }
    );

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.fullName || form.fullName.trim() === "") { // Change validation to check fullName
        alert("Stable name is required and cannot be empty.");
        return;
      }
      onSave(form);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center text-indigo-700">
              {initialData ? "Edit Stable" : "Create New Stable"}
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input
                name="fullName" // Change input name to 'fullName'
                value={form.fullName || ""} // Change value to use fullName
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
              <input
                name="location"
                value={form.location || ""}
                onChange={handleChange}
                placeholder="Location"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Capacity</label>
              <input
                name="capacity"
                type="number"
                value={form.capacity || ""}
                onChange={handleChange}
                placeholder="Capacity"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Stall Size</label>
              <select
                name="stallSize"
                value={form.stallSize || "medium"}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <input
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-150"
              >
                {initialData ? "Save Changes" : "Create Stable"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Also fix the StallForm to use fullName for stable display and generation
  const StallForm = ({ initialData, onSave, onCancel, stables: stablesFromProps }) => {
    const [form, setForm] = useState(() => {
      if (initialData) {
        return {
          stableId: initialData.stable?._id || "",
          name: initialData.name || "",
          size: initialData.size || "medium",
          status: initialData.status || "available",
        };
      } else {
        return {
          stableId: "",
          name: "",
          number: "",
          size: "medium",
          status: "available",
        };
      }
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm(prevForm => ({ ...prevForm, [name]: value }));

      if (!initialData && (name === "stableId" || name === "number")) {
        setForm((currentForm) => {
          const selectedStable = stablesFromProps.find((s) => s._id === currentForm.stableId);
          if (selectedStable && currentForm.number) {
            // Use fullName instead of name for stall name generation
            const generatedName = `${currentForm.number}-${selectedStable.fullName}`;
            return { ...currentForm, name: generatedName };
          } else {
            return { ...currentForm, name: "" };
          }
        });
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.stableId || !form.name || !form.size || !form.status) {
        alert("Please fill in all required fields for the stall.");
        return;
      }
      const validStatuses = ["available", "occupied", "maintenance"];
      if (!validStatuses.includes(form.status)) {
        alert("Invalid status value for the stall.");
        return;
      }
      const { number, ...submitData } = form;
      onSave(submitData, initialData ? initialData._id : null);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center text-indigo-700">
              {initialData ? "Edit Stall" : "Create New Stall"}
            </h3>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Stable</label>
              <select
                name="stableId"
                value={form.stableId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select a stable</option>
                {stablesFromProps.map((stable) => (
                  <option key={stable._id} value={stable._id}>
                    {stable.fullName} {/* Use fullName for display */}
                  </option>
                ))}
              </select>
            </div>

            {!initialData && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Stall Number</label>
                <input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder="Enter stall number (e.g. 1, 2, 3)"
                  required={!initialData}
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Full Name {initialData ? "" : "(auto-generated)"}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={initialData ? "Stall name" : "Stall name will be generated"}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {!initialData && (
                <small className="text-gray-500">
                  Format: Number-StableName (e.g. 1-SunnyStables)
                </small>
              )}
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Size</label>
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-150"
              >
                {initialData ? "Save Changes" : "Create Stall"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "available":
        return "border-green-500 bg-green-50";
      case "occupied":
        return "border-red-500 bg-red-50";
      case "maintenance":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  // Filter stables
  const filteredStables = React.useMemo(() => {
    return stables.filter(stable => {
      const matchesName = stable.fullName?.toLowerCase().includes(stableFilter.toLowerCase());
      const matchesLocation = stable.location?.toLowerCase().includes(stableFilter.toLowerCase());
      return matchesName || matchesLocation;
    });
  }, [stables, stableFilter]);

  // Filter stalls
  const filteredStalls = React.useMemo(() => {
    return stalls.filter(stall => {
      const matchesStable = !stallStableFilter || stall.stableId?._id === stallStableFilter;
      const matchesStatus = !stallStatusFilter || stall.status === stallStatusFilter;
      return matchesStable && matchesStatus;
    });
  }, [stalls, stallStableFilter, stallStatusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm && (
        <StableForm
          initialData={editStable}
          onSave={handleSaveStable}
          onCancel={() => {
            setShowForm(false);
            setEditStable(null);
          }}
        />
      )}

      {showStallForm && (
        <StallForm
          initialData={editStallData}
          onSave={handleSaveStall}
          onCancel={() => {
            setShowStallForm(false);
            setEditStallData(null);
          }}
          stables={stables}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stable Management</h1>
          <p className="text-gray-600">Manage your stables and stalls efficiently</p>
        </div>

        {/* Stables Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Stables</h2>
            <button
              onClick={() => {
                setEditStable(null);
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Stable
            </button>
          </div>

          {/* Stable Filter */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Stables
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={stableFilter}
                    onChange={(e) => setStableFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {stableFilter && (
                <div className="flex items-end">
                  <button
                    onClick={() => setStableFilter("")}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            {stableFilter && (
              <p className="mt-2 text-sm text-gray-500">
                Showing {filteredStables.length} of {stables.length} stables
              </p>
            )}
          </div>

          {filteredStables.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {stableFilter ? "No stables match your search" : "No stables found"}
              </p>
              <p className="text-gray-400">
                {stableFilter ? "Try adjusting your search terms" : "Create your first stable to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStables.map((stable) => (
                <div key={stable._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-150">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{stable.fullName}</h3> {/* Use fullName for display */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditStable(stable)}
                        className="text-indigo-600 hover:text-indigo-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteStable(stable._id)}
                        className="text-red-600 hover:text-red-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Location:</span> {stable.location || "Not specified"}</p>
                    <p><span className="font-medium">Capacity:</span> {stable.capacity || "Not specified"}</p>
                    <p><span className="font-medium">Stall Size:</span> {stable.stallSize || "Not specified"}</p>
                    {stable.description && (
                      <p><span className="font-medium">Description:</span> {stable.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stalls Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Stalls</h2>
            <button
              onClick={() => {
                setEditStallData(null);
                setShowStallForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Stall
            </button>
          </div>

          {/* Stall Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Stable
                </label>
                <select
                  value={stallStableFilter}
                  onChange={(e) => setStallStableFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Stables</option>
                  {stables.map((stable) => (
                    <option key={stable._id} value={stable._id}>
                      {stable.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={stallStatusFilter}
                  onChange={(e) => setStallStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {(stallStableFilter || stallStatusFilter) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStallStableFilter("");
                      setStallStatusFilter("");
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            {(stallStableFilter || stallStatusFilter) && (
              <p className="text-sm text-gray-500">
                Showing {filteredStalls.length} of {stalls.length} stalls
                {stallStableFilter && ` in ${stables.find(s => s._id === stallStableFilter)?.fullName || 'selected stable'}`}
                {stallStatusFilter && ` with status "${stallStatusFilter}"`}
              </p>
            )}
          </div>

          {filteredStalls.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {(stallStableFilter || stallStatusFilter) ? "No stalls match your filters" : "No stalls found"}
              </p>
              <p className="text-gray-400">
                {(stallStableFilter || stallStatusFilter) ? "Try adjusting your filter settings" : "Create your first stall to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStalls.map((stall) => (
                <div key={stall._id} className={`border-l-4 rounded-lg p-4 hover:shadow-md transition duration-150 ${getStatusClasses(stall.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{stall.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditStallForm(stall)}
                        className="text-indigo-600 hover:text-indigo-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteStall(stall._id)}
                        className="text-red-600 hover:text-red-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Stable:</span> {stall.stable?.fullName || "Unknown"}</p> {/* Use fullName here too */}
                    <p><span className="font-medium">Size:</span> {stall.size}</p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        stall.status === 'available' ? 'bg-green-100 text-green-800' :
                        stall.status === 'occupied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {stall.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stables;