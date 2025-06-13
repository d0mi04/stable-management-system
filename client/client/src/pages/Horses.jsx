import React, { useState, useEffect } from "react";

const initialState = {
  name: "",
  breed: "",
  age: "",
  notes: "",
};

const API_URL = process.env.REACT_APP_API_URL;

const HorseForm = ({ onSubmit, initialData = initialState, editMode = false }) => {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.breed || !form.age) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = editMode
        ? `${API_URL}horses/${form._id}`
        : `${API_URL}horses`;
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to save horse.");
        setLoading(false);
        return;
      }

      setForm(initialState);
      setLoading(false);
      if (onSubmit) onSubmit();
    } catch (err) {
      setError("Failed to save horse.");
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
        <div>
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

const HorseDetailsModal = ({ horseId, onClose }) => {
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}horses/${horseId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        setHorse(data.horse || null);
      } catch (err) {
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
            <p><span className="font-semibold">Owner:</span> {horse.ownerEmail || "-"}</p>
            <p><span className="font-semibold">Breed:</span> {horse.breed}</p>
            <p><span className="font-semibold">Age:</span> {horse.age || "-"}</p>
            <p><span className="font-semibold">Notes:</span> {horse.notes || "-"}</p>
            <p><span className="font-semibold">Status:</span> {horse.status || "-"}</p>
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

  useEffect(() => {
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
    fetchHorses();
  }, [showForm, editHorse]);

  const handleEdit = async (horse) => {
    // Fetch latest details for editing
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

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Horses (Admin only)</h2>
      <button
        onClick={() => { setShowForm((prev) => !prev); setEditHorse(null); }}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
      >
        {showForm && !editHorse ? "Close form" : "Add new Horse"}
      </button>
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
              <p><span className="font-semibold">Age:</span> {horse.age}</p>
              <p><span className="font-semibold">Notes:</span> {horse.notes || "-"}</p>
              <div className="flex gap-3 mt-4">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded text-sm font-semibold"
                  onClick={() => handleEdit(horse)}
                >
                  Edit
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold"
                  onClick={() => handleDetails(horse)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailsHorseId && (
        <HorseDetailsModal horseId={detailsHorseId} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default Horses;