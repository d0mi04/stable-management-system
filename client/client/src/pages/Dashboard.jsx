import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const MaintenanceStalls = ({ stalls }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Stalls in Maintenance
    </h3>
    <div className="space-y-3">
      {stalls.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl">🔧</span>
          <p className="text-gray-500 mt-2">
            No stalls currently in maintenance
          </p>
          <p className="text-sm text-gray-400">All stalls are operational</p>
        </div>
      ) : (
        stalls.slice(0, 3).map((stall, index) => (
          <div
            key={stall._id || index}
            className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500"
          >
            <div className="flex-shrink-0">
              <span className="text-lg">🔧</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{stall.name}</p>
              <p className="text-sm text-gray-500">
                📍 {stall.stableId?.fullName || "Unknown Stable"} • 📏{" "}
                {stall.size}
              </p>
            </div>
            <div className="text-xs text-gray-400 text-right">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Maintenance
              </div>
            </div>
          </div>
        ))
      )}
      {stalls.length > 3 && (
        <p className="text-xs text-gray-500 text-center mt-2">
          And {stalls.length - 3} more stalls in maintenance
        </p>
      )}
    </div>
  </div>
);

const UpcomingEvents = ({ events }) => {
  // Calculate next week's date range
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Filter events for the next week
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .slice(0, 3); // Show max 3 events

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getLocationEmoji = (location) => {
    const locationEmojis = {
      Krakow: "🏔️",
      Gdansk: "🌊",
      Warszawa: "🏛️",
      Poznan: "🏭",
      Wroclaw: "🌉",
    };
    return locationEmojis[location] || "📍";
  };

  // Format duration for display
  const formatDuration = (duration) => {
    if (duration === 12) return "All day";
    if (duration === 0.5) return "30min";
    if (duration === 1) return "1h";
    if (duration === 1.5) return "1.5h";
    return `${duration}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Events
      </h3>
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl">📅</span>
          <p className="text-gray-500 mt-2">
            No upcoming events in the next week
          </p>
          <p className="text-sm text-gray-400">
            Check the schedule to add new events
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div
              key={event._id || index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500"
            >
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {getLocationEmoji(event.location)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {event.title}
                </p>
                <p className="text-sm text-gray-500">
                  🕐 {event.hour} ({formatDuration(event.duration || 1)}) • 📍{" "}
                  {event.location}
                  {event.horseId?.name && ` • 🐴 ${event.horseId.name}`}
                </p>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <div>{formatEventDate(event.date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    horses: { total: 0, waiting: 0, assigned: 0 },
    stalls: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    staff: { total: 0 },
    expenses: { total: 0, monthlyTotal: 0, unpaidTotal: 0 },
    events: { total: 0, upcoming: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [maintenanceStalls, setMaintenanceStalls] = useState([]);
  const [upcomingEventsData, setUpcomingEventsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        // Fetch all data in parallel (except events which need special handling)
        const [horsesRes, stallsRes, staffRes, expensesRes] = await Promise.all(
          [
            fetch(`${API_URL}horses`, {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }),
            fetch(`${API_URL}stalls`, {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }),
            fetch(`${API_URL}staff`, {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }),
            fetch(`${API_URL}expenses`, {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }),
          ]
        );

        // Fetch events for the next 7 days
        const eventsPromises = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toDateString();
          eventsPromises.push(
            fetch(`${API_URL}events/${dateStr}`, {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }).then((res) => (res.ok ? res.json() : []))
          );
        }
        const eventsArrays = await Promise.all(eventsPromises);
        const allEvents = eventsArrays.flat();

        // Process horses data
        const horsesData = horsesRes.ok
          ? await horsesRes.json()
          : { horses: [] };
        const horses = horsesData.horses || [];
        const waitingHorses = horses.filter(
          (h) => h.status === "waiting for stall"
        ).length;
        const assignedHorses = horses.length - waitingHorses; // Calculate as total - waiting

        // Process stalls data
        const stallsData = stallsRes.ok
          ? await stallsRes.json()
          : { stalls: [] };
        const stalls = stallsData.stalls || stallsData || [];
        const availableStalls = stalls.filter(
          (s) => s.status === "available"
        ).length;
        const occupiedStalls = stalls.filter(
          (s) => s.status === "occupied"
        ).length;
        const maintenanceStallsData = stalls.filter(
          (s) => s.status === "maintenance"
        );
        const maintenanceStalls = maintenanceStallsData.length;

        // Store maintenance stalls for the component
        setMaintenanceStalls(maintenanceStallsData);

        // Process staff data
        const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };
        const staffMembers = staffData.staff || staffData || [];

        // Process expenses data
        const expensesData = expensesRes.ok
          ? await expensesRes.json()
          : { expenses: [] };
        const expenses = expensesData.expenses || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date);
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        });
        const unpaidExpenses = expenses.filter((e) => !e.settled);

        // Process events data
        const upcomingEvents = allEvents.filter(
          (e) => new Date(e.date) >= today
        ).length;

        // Store all events for the upcoming events component
        setUpcomingEventsData(allEvents);

        setDashboardData({
          horses: {
            total: horses.length,
            waiting: waitingHorses,
            assigned: assignedHorses,
          },
          stalls: {
            total: stalls.length,
            available: availableStalls,
            occupied: occupiedStalls,
            maintenance: maintenanceStalls,
          },
          staff: {
            total: staffMembers.length,
          },
          expenses: {
            total: expenses.length,
            monthlyTotal: monthlyExpenses.reduce(
              (sum, e) => sum + (e.amount || 0),
              0
            ),
            unpaidTotal: unpaidExpenses.reduce(
              (sum, e) => sum + (e.amount || 0),
              0
            ),
          },
          events: {
            total: allEvents.length,
            upcoming: upcomingEvents,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username || "Admin"}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening at your stable today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Horses"
          value={dashboardData.horses.total}
          icon="🐴"
          color="border-blue-500"
          subtitle={`${dashboardData.horses.waiting} waiting for stall`}
        />
        <StatCard
          title="Available Stalls"
          value={dashboardData.stalls.available}
          icon="🏠"
          color="border-green-500"
          subtitle={`${dashboardData.stalls.total} total stalls`}
        />
        <StatCard
          title="Staff Members"
          value={dashboardData.staff.total}
          icon="👥"
          color="border-purple-500"
          subtitle="Active personnel"
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${dashboardData.expenses.monthlyTotal.toLocaleString()}`}
          icon="💰"
          color="border-orange-500"
          subtitle={`${dashboardData.expenses.total} total records`}
        />
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Horse Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Horse Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assigned to Stalls</span>
              <span className="font-semibold text-green-600">
                {dashboardData.horses.assigned}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Waiting for Stall</span>
              <span className="font-semibold text-orange-600">
                {dashboardData.horses.waiting}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Horses</span>
              <span className="font-semibold text-blue-600">
                {dashboardData.horses.total}
              </span>
            </div>
          </div>
        </div>

        {/* Stall Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stall Occupancy
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupied</span>
              <span className="font-semibold text-red-600">
                {dashboardData.stalls.occupied}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="font-semibold text-green-600">
                {dashboardData.stalls.available}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="font-semibold text-yellow-600">
                {dashboardData.stalls.maintenance}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Expenses</span>
              <span className="font-semibold text-orange-600">
                ${dashboardData.expenses.monthlyTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unpaid Bills</span>
              <span className="font-semibold text-red-600">
                ${dashboardData.expenses.unpaidTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Records</span>
              <span className="font-semibold text-blue-600">
                {dashboardData.expenses.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Stalls and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaintenanceStalls stalls={maintenanceStalls} />
        <UpcomingEvents events={upcomingEventsData} />
      </div>
    </div>
  );
};

export default Dashboard;
