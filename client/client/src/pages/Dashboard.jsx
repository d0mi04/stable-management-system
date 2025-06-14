import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <span className="text-lg">{activity.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
          </div>
          <div className="text-xs text-gray-400">{activity.time}</div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
        <span>🐴</span>
        <span>Add Horse</span>
      </button>
      <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
        <span>🏠</span>
        <span>Add Stall</span>
      </button>
      <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
        <span>👥</span>
        <span>Add Staff</span>
      </button>
      <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
        <span>💰</span>
        <span>Add Expense</span>
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    horses: { total: 0, waiting: 0, assigned: 0 },
    stalls: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    staff: { total: 0 },
    expenses: { total: 0, monthlyTotal: 0, unpaidTotal: 0 },
    events: { total: 0, upcoming: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      try {
        // Fetch all data in parallel
        const [horsesRes, stallsRes, staffRes, expensesRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}horses`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          }),
          fetch(`${API_URL}stalls`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          }),
          fetch(`${API_URL}staff`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          }),
          fetch(`${API_URL}expenses`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          }),
          fetch(`${API_URL}events`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
          })
        ]);

        // Process horses data
        const horsesData = horsesRes.ok ? await horsesRes.json() : { horses: [] };
        const horses = horsesData.horses || [];
        const waitingHorses = horses.filter(h => h.status === 'waiting for stall').length;
        const assignedHorses = horses.filter(h => h.stallId).length;

        // Process stalls data
        const stallsData = stallsRes.ok ? await stallsRes.json() : { stalls: [] };
        const stalls = stallsData.stalls || stallsData || [];
        const availableStalls = stalls.filter(s => s.status === 'available').length;
        const occupiedStalls = stalls.filter(s => s.status === 'occupied').length;
        const maintenanceStalls = stalls.filter(s => s.status === 'maintenance').length;

        // Process staff data
        const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };
        const staffMembers = staffData.staff || staffData || [];

        // Process expenses data
        const expensesData = expensesRes.ok ? await expensesRes.json() : { expenses: [] };
        const expenses = expensesData.expenses || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        const unpaidExpenses = expenses.filter(e => !e.settled);

        // Process events data
        const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };
        const events = eventsData.events || [];
        const today = new Date();
        const upcomingEvents = events.filter(e => new Date(e.date) >= today).length;

        setDashboardData({
          horses: {
            total: horses.length,
            waiting: waitingHorses,
            assigned: assignedHorses
          },
          stalls: {
            total: stalls.length,
            available: availableStalls,
            occupied: occupiedStalls,
            maintenance: maintenanceStalls
          },
          staff: {
            total: staffMembers.length
          },
          expenses: {
            total: expenses.length,
            monthlyTotal: monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
            unpaidTotal: unpaidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
          },
          events: {
            total: events.length,
            upcoming: upcomingEvents
          }
        });

        // Generate recent activities
        const activities = [];
        
        // Add recent horses
        horses.slice(-3).forEach(horse => {
          activities.push({
            icon: "🐴",
            title: `New horse added: ${horse.name}`,
            description: `Breed: ${horse.breed || 'Unknown'}`,
            time: "Today"
          });
        });

        // Add stall activities
        if (waitingHorses > 0) {
          activities.push({
            icon: "⏳",
            title: `${waitingHorses} horses waiting for stall`,
            description: "Assign stalls to improve efficiency",
            time: "Ongoing"
          });
        }

        // Add expense alerts
        if (unpaidExpenses.length > 0) {
          activities.push({
            icon: "💰",
            title: `${unpaidExpenses.length} unpaid expenses`,
            description: `Total: $${unpaidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)}`,
            time: "Pending"
          });
        }

        setRecentActivities(activities.slice(0, 5));

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
          Welcome back, {user?.username || 'Admin'}! 👋
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horse Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assigned to Stalls</span>
              <span className="font-semibold text-green-600">{dashboardData.horses.assigned}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Waiting for Stall</span>
              <span className="font-semibold text-orange-600">{dashboardData.horses.waiting}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Horses</span>
              <span className="font-semibold text-blue-600">{dashboardData.horses.total}</span>
            </div>
          </div>
        </div>

        {/* Stall Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stall Occupancy</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupied</span>
              <span className="font-semibold text-red-600">{dashboardData.stalls.occupied}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="font-semibold text-green-600">{dashboardData.stalls.available}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="font-semibold text-yellow-600">{dashboardData.stalls.maintenance}</span>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
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
              <span className="font-semibold text-blue-600">{dashboardData.expenses.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <QuickActions />
      </div>

      {/* Action Items */}
      {(dashboardData.horses.waiting > 0 || dashboardData.expenses.unpaidTotal > 0) && (
        <div className="mt-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {dashboardData.horses.waiting > 0 && (
                      <li>
                        {dashboardData.horses.waiting} horses are waiting for stall assignment
                      </li>
                    )}
                    {dashboardData.expenses.unpaidTotal > 0 && (
                      <li>
                        ${dashboardData.expenses.unpaidTotal.toLocaleString()} in unpaid expenses need attention
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
