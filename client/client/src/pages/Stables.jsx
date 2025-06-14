import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Stables = () => {
  const [stables, setStables] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
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

  const handleSaveStable = async (updated) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}stables/${updated._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStables((prev) =>
        prev.map((s) => (s._id === data.stable._id ? data.stable : s))
      );
      setShowForm(false);
      setEditStable(null);
    } catch {
      alert("Failed to save stable.");
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

  const StableForm = ({ initialData, onSave, onCancel }) => {
    const [form, setForm] = useState(
      initialData || {
        fullName: "",
        location: "",
        capacity: "",
        description: "",
      }
    );
    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(form);
    };
    return (
      <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Edit Stable</h3>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          placeholder="Capacity"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  // hinzugefügt: mapowanie statusów na klasy Tailwind
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
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Stables Section */}
      <div>
        <h3 className="text-xl font-semibold mb-2">All Stables</h3>
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
                    onClick={() => handleOpenEditStable(stable)}
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
        <h3 className="text-xl font-semibold mb-2">All Stalls</h3>
        {stalls.length === 0 ? (
          <p>No stalls found.</p>
        ) : (
          <ul className="space-y-2">
            {stalls.map((stall) => (
              // zmieniono: dynamiczne kolory wg statusu
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