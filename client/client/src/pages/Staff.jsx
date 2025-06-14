import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStaffMember, setEditStaffMember] = useState(null);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");

  // Helper function to get role classes
  const getRoleClasses = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return 'bg-purple-50 border-purple-400';
      case 'trainer':
        return 'bg-blue-50 border-blue-400';
      case 'groomer':
        return 'bg-green-50 border-green-400';
      case 'veterinarian':
        return 'bg-red-50 border-red-400';
      case 'caretaker':
        return 'bg-yellow-50 border-yellow-400';
      default:
        return 'bg-gray-50 border-gray-400';
    }
  };

  // Filter staff based on selected filters
  const filteredStaff = React.useMemo(() => {
    return staff.filter(member => {
      const matchesRole = !roleFilter || member.role?.toLowerCase() === roleFilter.toLowerCase();
      const matchesSpeciality = !specialityFilter || 
        (member.specialities && member.specialities.some(spec => 
          spec.toLowerCase().includes(specialityFilter.toLowerCase())
        ));
      return matchesRole && matchesSpeciality;
    });
  }, [staff, roleFilter, specialityFilter]);

  // Get unique roles for filter dropdown
  const uniqueRoles = React.useMemo(() => {
    const roles = [...new Set(staff.map(member => member.role).filter(Boolean))];
    return roles.sort();
  }, [staff]);

  // Get unique specialities for filter dropdown
  const uniqueSpecialities = React.useMemo(() => {
    const specialities = [...new Set(staff.flatMap(member => member.specialities || []).filter(Boolean))];
    return specialities.sort();
  }, [staff]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}staff`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      setError("Failed to fetch staff data.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const res = await fetch(`${API_URL}staff/${staffId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setStaff((prev) => prev.filter((member) => member._id !== staffId));
    } catch (err) {
      alert("Failed to delete staff member.");
    }
  };

  const handleOpenEditStaff = (staffMember) => {
    setEditStaffMember(staffMember);
    setShowForm(true);
  };

  const handleSaveStaff = async (staffData) => {
    const token = localStorage.getItem("token");
    if (editStaffMember) {
      // This is an update
      try {
        const res = await fetch(`${API_URL}staff/${editStaffMember._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(staffData),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setStaff((prev) =>
          prev.map((s) => (s._id === data.staff._id ? data.staff : s))
        );
        setShowForm(false);
        setEditStaffMember(null);
      } catch (error) {
        console.error("Failed to update staff member:", error);
        alert(`Failed to update staff member: ${error.message}`);
      }
    } else {
      // This is a create
      try {
        const res = await fetch(`${API_URL}staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(staffData),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setStaff((prev) => [...prev, data.staff]);
        setShowForm(false);
      } catch (error) {
        console.error("Failed to create staff member:", error);
        alert(`Failed to create staff member: ${error.message}`);
      }
    }
  };

  // StaffForm component
  const StaffForm = ({ initialData, onSave, onCancel }) => {
    const [form, setForm] = useState(
      initialData || {
        name: "",
        phone: "",
        email: "",
        role: "",
        specialities: [],
        schedule: [],
      }
    );

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };

    const handleSpecialitiesChange = (e) => {
      const value = e.target.value;
      const specialitiesArray = value.split(',').map(s => s.trim()).filter(s => s);
      setForm({ ...form, specialities: specialitiesArray });
    };

    const handleScheduleChange = (e) => {
      const value = e.target.value;
      const scheduleArray = value.split(',').map(s => s.trim()).filter(s => s);
      setForm({ ...form, schedule: scheduleArray });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.name || !form.email || !form.role) {
        alert("Name, email, and role are required.");
        return;
      }
      
      // Convert phone to number
      const staffData = {
        ...form,
        phone: parseInt(form.phone) || 0
      };
      
      onSave(staffData);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center text-indigo-700">
              {initialData ? "Edit Staff Member" : "Add New Staff Member"}
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input
                name="phone"
                type="tel"
                value={form.phone || ""}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Email address"
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
              <select
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select a role</option>
                <option value="Manager">Manager</option>
                <option value="Trainer">Trainer</option>
                <option value="Groomer">Groomer</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Caretaker">Caretaker</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Specialities</label>
              <input
                name="specialities"
                value={form.specialities?.join(', ') || ""}
                onChange={handleSpecialitiesChange}
                placeholder="Horse care, Training, Grooming (comma-separated)"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Schedule</label>
              <input
                name="schedule"
                value={form.schedule?.join(', ') || ""}
                onChange={handleScheduleChange}
                placeholder="Monday 9-17, Tuesday 9-17 (comma-separated)"
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
                {initialData ? "Save Changes" : "Add Staff Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage your stable staff and their roles efficiently</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Staff Members</h2>
            <button
              onClick={() => {
                setEditStaffMember(null);
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Staff Member
            </button>
          </div>

          {/* Staff Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Speciality
                </label>
                <select
                  value={specialityFilter}
                  onChange={(e) => setSpecialityFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Specialities</option>
                  {uniqueSpecialities.map((speciality) => (
                    <option key={speciality} value={speciality}>
                      {speciality}
                    </option>
                  ))}
                </select>
              </div>
              {(roleFilter || specialityFilter) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setRoleFilter("");
                      setSpecialityFilter("");
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            {(roleFilter || specialityFilter) && (
              <p className="text-sm text-gray-500">
                Showing {filteredStaff.length} of {staff.length} staff members
                {roleFilter && ` with role "${roleFilter}"`}
                {specialityFilter && ` with speciality "${specialityFilter}"`}
              </p>
            )}
          </div>

          {/* Staff Form Modal */}
          {showForm && (
            <StaffForm
              initialData={editStaffMember}
              onSave={handleSaveStaff}
              onCancel={() => {
                setShowForm(false);
                setEditStaffMember(null);
              }}
            />
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {(roleFilter || specialityFilter) ? "No staff members match your filters" : "No staff members found"}
              </p>
              <p className="text-gray-400">
                {(roleFilter || specialityFilter) ? "Try adjusting your filter settings" : "Add your first staff member to get started"}
              </p>
            </div>
          ) : (
            /* Staff Cards Grid */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((member) => (
                <div key={member._id} className={`border-l-4 rounded-lg p-4 hover:shadow-md transition duration-150 ${getRoleClasses(member.role)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditStaff(member)}
                        className="text-indigo-600 hover:text-indigo-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member._id)}
                        className="text-red-600 hover:text-red-800 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Email:</span> {member.email}</p>
                    <p><span className="font-medium">Phone:</span> {member.phone || "Not provided"}</p>
                    <p>
                      <span className="font-medium">Role:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        member.role?.toLowerCase() === 'manager' ? 'bg-purple-100 text-purple-800' :
                        member.role?.toLowerCase() === 'trainer' ? 'bg-blue-100 text-blue-800' :
                        member.role?.toLowerCase() === 'groomer' ? 'bg-green-100 text-green-800' :
                        member.role?.toLowerCase() === 'veterinarian' ? 'bg-red-100 text-red-800' :
                        member.role?.toLowerCase() === 'caretaker' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role || 'Unknown'}
                      </span>
                    </p>
                    {member.specialities && member.specialities.length > 0 && (
                      <p><span className="font-medium">Specialities:</span> {member.specialities.join(', ')}</p>
                    )}
                    {member.schedule && member.schedule.length > 0 && (
                      <p><span className="font-medium">Schedule:</span> {member.schedule.join(', ')}</p>
                    )}
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

export default Staff;
