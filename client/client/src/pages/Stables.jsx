import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Stables = () => {
  const [stables, setStables] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStallForm, setShowStallForm] = useState(false);
  const [editStable, setEditStable] = useState(null);

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

  // Add this new handler for creating a stable
  const handleCreateStable = async (newStable) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}stables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(newStable),
      });
      if (!res.ok) {
        // Try to get more specific error information from the server
        const errorData = await res.json().catch(() => ({})); // Add a catch for res.json() in case it's not valid JSON
        console.error("Server error response (creating stable):", errorData);
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setStables((prev) => [...prev, data.stable]);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating stable:", error);
      alert(`Failed to create stable: ${error.message}`);
    }
  };

  const handleSaveStable = async (stableData) => {
    if (editStable) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}stables/${editStable._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(stableData),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStables((prev) =>
          prev.map((s) => (s._id === data.stable._id ? data.stable : s))
        );
        setShowForm(false);
        setEditStable(null);
      } catch {
        alert("Failed to update stable.");
      }
    } else {
      // This is a create
      handleCreateStable(stableData);
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

  const handleEditStall = async (stall) => {
    const token = localStorage.getItem("token");
    const name = window.prompt("New stall name:", stall.name);
    const size = window.prompt("New size:", stall.size);
    const status = window.prompt("New status:", stall.status);
    if (!name || !size || !status) return;
    try {
      const res = await fetch(`${API_URL}stalls/${stall._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name, size, status }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStalls((prev) =>
        prev.map((s) => (s._id === stall._id ? data.stall : s))
      );
    } catch {
      alert("Failed to edit stall.");
    }
  };

  const handleCreateStall = async (newStall) => {
    const token = localStorage.getItem("token");
    try {
      console.log("Creating stall with data:", newStall); // Debug data

      const res = await fetch(`${API_URL}stalls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(newStall),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(errorData.error || "Unknown error");
      }

      const data = await res.json();
      setStalls((prev) => [...prev, data.stall]);
      setShowStallForm(false);
    } catch (error) {
      console.error("Error creating stall:", error);
      alert(`Failed to create stall: ${error.message}`);
    }
  };

  // Updated StallForm component
  const StallForm = ({ onSave, onCancel }) => {
    const [stableOptions, setStableOptions] = useState([]);
    const [form, setForm] = useState({
      stableId: "",
      name: "",
      number: "",
      size: "medium",
      status: "available",
    });

    // Load stables for the dropdown
    useEffect(() => {
      setStableOptions(stables);
    }, []);

    const handleChange = (e) => {
      const { name, value } = e.target;
      // Update the specific field that changed
      setForm(prevForm => ({ ...prevForm, [name]: value }));

      // Auto-generate stall name when stableId or number changes
      if (name === "stableId" || name === "number") {
        setForm((prevForm) => {
          const selectedStable = stables.find((s) => s._id === prevForm.stableId);

          if (selectedStable && prevForm.number) {
            const generatedName = `${prevForm.number}-${selectedStable.fullName}`;
            return { ...prevForm, name: generatedName };
          } else {
            return { ...prevForm, name: "" };
          }
        });
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      // Make sure we have all required fields properly formatted
      if (!form.stableId || !form.name || !form.size || !form.status) {
        alert("Please fill in all required fields");
        return;
      }

      // Make sure status matches one of the allowed enum values
      const validStatuses = ["available", "occupied", "maintenance"];
      if (!validStatuses.includes(form.status)) {
        alert("Invalid status value");
        return;
      }

      const { number, ...submitData } = form;

      // Final validation before submission
      console.log("Submitting stall data:", submitData);
      onSave(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Create New Stall</h3>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Stable</label>
          <select
            name="stableId"
            value={form.stableId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a stable</option>
            {stableOptions.map((stable) => (
              <option key={stable._id} value={stable._id}>
                {stable.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Stall Number</label>
          <input
            name="number"
            value={form.number}
            onChange={handleChange}
            placeholder="Enter stall number (e.g. 1, 2, 3)"
            required
            type="number"
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Full Name (auto-generated)
          </label>
          <input
            name="name"
            value={form.name}
            onChange={(e) => {
              // Allow manual editing if needed
              setForm((prev) => ({ ...prev, name: e.target.value }));
            }}
            placeholder="Stall name will be generated"
            required
            className="w-full p-2 border rounded"
          />
          <small className="text-gray-500">
            Format: Number-StableName (e.g. 1-SunnyStables)
          </small>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Size</label>
          <select
            name="size"
            value={form.size}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            Create
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  // Update your StableForm component to handle both edit and create modes
  const StableForm = ({ initialData, onSave, onCancel }) => {
    const [form, setForm] = useState(
      initialData || {
        name: "", // Changed from fullName to name
        location: "",
        capacity: "",
        description: "",
        stallSize: "medium", // Added stallSize field
      }
    );
    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
      e.preventDefault();
      // Add validation for the name field
      if (!form.name || form.name.trim() === "") {
        alert("Stable name is required and cannot be empty.");
        return; // Prevent form submission if name is empty
      }
      onSave(form);
    };
    return (
      <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {initialData ? "Edit Stable" : "Create New Stable"}
        </h3>
        <input
          name="name"
          value={form.name || ""} // Handle null/undefined values
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="location"
          value={form.location || ""}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="capacity"
          type="number"
          value={form.capacity || ""}
          onChange={handleChange}
          placeholder="Capacity"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Stall Size</label>
          <select
            name="stallSize"
            value={form.stallSize || "medium"}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <input
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            {initialData ? "Save" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  // mapowanie statusów na klasy Tailwind
  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "occupied":
        return "bg-red-100 border-red-500";
      case "available":
        return "bg-green-100 border-green-500";
      case "maintenance":
        return "bg-orange-100 border-orange-500";
      case "competition":
        return "bg-blue-100 border-blue-500";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className="p-4">
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
          onSave={handleCreateStall}
          onCancel={() => setShowStallForm(false)}
        />
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Stables Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">All Stables</h3>
          <button
            onClick={() => {
              setEditStable(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
          >
            Create New Stable
          </button>
        </div>

        {stables.length === 0 ? (
          <p>No stables found.</p>
        ) : (
          <ul className="space-y-2">
            {stables.map((stable) => (
              <li key={stable._id} className="border p-2 rounded">
                <p>
                  <strong>Name:</strong> {stable.fullName}
                </p>
                <p>
                  <strong>Location:</strong> {stable.location}
                </p>
                <p>
                  <strong>Capacity:</strong> {stable.capacity}
                </p>
                <p>
                  <strong>Description:</strong> {stable.description}
                </p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() =>
                      handleOpenEditStable({
                        ...stable,
                        name: stable.fullName
                      })
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStable(stable._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stalls Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">All Stalls</h3>
          <button
            onClick={() => setShowStallForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
          >
            Create New Stall
          </button>
        </div>

        {stalls.length === 0 ? (
          <p>No stalls found.</p>
        ) : (
          <ul className="space-y-2">
            {stalls.map((stall) => (
              <li
                key={stall._id}
                className={`border-l-4 p-2 rounded ${getStatusClasses(
                  stall.status
                )}`}
              >
                <p>
                  <strong>Name:</strong> {stall.name}
                </p>
                <p>
                  <strong>Size:</strong> {stall.size}
                </p>
                <p>
                  <strong>Status:</strong> {stall.status}
                </p>
                <p>
                  <strong>Stall ID:</strong> {stall._id}
                </p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEditStall(stall)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStall(stall._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Stables;