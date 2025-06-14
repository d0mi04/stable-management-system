import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [horses, setHorses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stables, setStables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState(""); // expense, income, all
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [settledFilter, setSettledFilter] = useState(""); // settled, unsettled, all
  const [relatedFilter, setRelatedFilter] = useState("");
  
  // Statistics
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: '',
    relatedTo: '',
    relatedModel: '',
    amount: '',
    settled: false,
    description: ''
  });

  const token = localStorage.getItem("token");

  // Categories for different expense types
  const expenseCategories = [
    'Feed & Nutrition', 'Veterinary Care', 'Farrier Services', 'Equipment', 
    'Maintenance', 'Rent', 'Insurance', 'Transportation', 'Training', 
    'Competition Fees', 'Utilities', 'Staff Salaries', 'Other'
  ];

  const incomeCategories = [
    'Training Fees', 'Boarding Fees', 'Competition Winnings', 'Horse Sales',
    'Lessons', 'Breeding Fees', 'Equipment Sales', 'Other'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [expensesRes, horsesRes, staffRes, stablesRes] = await Promise.all([
        fetch(`${API_URL}expenses`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        fetch(`${API_URL}horses`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        fetch(`${API_URL}staff`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        fetch(`${API_URL}stables`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
      ]);

      const expensesData = expensesRes.ok ? await expensesRes.json() : { expenses: [] };
      const horsesData = horsesRes.ok ? await horsesRes.json() : { horses: [] };
      const staffData = staffRes.ok ? await staffRes.json() : { staff: [] };
      const stablesData = stablesRes.ok ? await stablesRes.json() : { stables: [] };

      setExpenses(expensesData.expenses || []);
      setHorses(horsesData.horses || []);
      setStaff(staffData.staff || []);
      setStables(stablesData.stables || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const method = editExpense ? "PUT" : "POST";
      const url = editExpense 
        ? `${API_URL}expenses/${editExpense._id}` 
        : `${API_URL}expenses`;

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        relatedTo: formData.relatedTo || null,
        relatedModel: formData.relatedTo ? formData.relatedModel : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save expense");
      }

      await fetchAllData();
      resetForm();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const res = await fetch(`${API_URL}expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) throw new Error("Failed to delete expense");
      
      await fetchAllData();
    } catch (error) {
      alert("Error deleting expense: " + error.message);
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setFormData({
      date: expense.date.split('T')[0],
      type: expense.type,
      category: expense.category,
      relatedTo: expense.relatedTo || '',
      relatedModel: expense.relatedModel || '',
      amount: expense.amount.toString(),
      settled: expense.settled,
      description: expense.description || ''
    });
    setShowForm(true);
  };

  const toggleSettled = async (expense) => {
    try {
      const res = await fetch(`${API_URL}expenses/${expense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ...expense, settled: !expense.settled }),
      });

      if (!res.ok) throw new Error("Failed to update expense");
      
      await fetchAllData();
    } catch (error) {
      alert("Error updating expense: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: '',
      relatedTo: '',
      relatedModel: '',
      amount: '',
      settled: false,
      description: ''
    });
    setEditExpense(null);
    setShowForm(false);
  };

  // Calculate statistics
  const calculateStats = () => {
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = currentMonthExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const unsettledAmount = expenses
      .filter(e => !e.settled)
      .reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : -e.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      unsettledAmount,
      totalTransactions: currentMonthExpenses.length
    };
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesType = !typeFilter || expense.type === typeFilter;
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    const matchesSettled = !settledFilter || 
      (settledFilter === 'settled' ? expense.settled : !expense.settled);
    const matchesDate = !dateFilter || expense.date.startsWith(dateFilter);
    const matchesRelated = !relatedFilter || expense.relatedTo === relatedFilter;

    return matchesType && matchesCategory && matchesSettled && matchesDate && matchesRelated;
  });

  const getRelatedName = (expense) => {
    if (!expense.relatedTo || !expense.relatedModel) return "N/A";
    
    let items = [];
    switch (expense.relatedModel) {
      case 'Horse':
        items = horses;
        break;
      case 'Staff':
        items = staff;
        break;
      case 'Stable':
        items = stables;
        break;
      default:
        return "N/A";
    }
    
    const item = items.find(i => i._id === expense.relatedTo);
    return item ? (item.name || item.fullName || item.firstName + ' ' + item.lastName) : "Unknown";
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h1>
          <p className="text-gray-600">Track income, expenses, and financial health of your stable</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">💵</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">💸</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${stats.balance >= 0 ? 'border-indigo-500' : 'border-orange-500'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stats.balance >= 0 ? 'bg-indigo-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                  <span className={`${stats.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'} font-bold`}>
                    {stats.balance >= 0 ? '📈' : '📉'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Net Balance</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                  ${Math.abs(stats.balance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unsettled</p>
                <p className="text-2xl font-bold text-yellow-600">${Math.abs(stats.unsettledAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-gray-600">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Financial Transactions</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </button>
          </div>

          {/* Month/Year and Filters */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Month/Year Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                      {new Date().getFullYear() - 2 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="expense">Expenses</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {[...new Set([...expenseCategories, ...incomeCategories])].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={settledFilter}
                  onChange={(e) => setSettledFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="settled">Settled</option>
                  <option value="unsettled">Unsettled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                {(typeFilter || categoryFilter || settledFilter || dateFilter || relatedFilter) && (
                  <button
                    onClick={() => {
                      setTypeFilter("");
                      setCategoryFilter("");
                      setSettledFilter("");
                      setDateFilter("");
                      setRelatedFilter("");
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status */}
            {(typeFilter || categoryFilter || settledFilter || dateFilter || relatedFilter) && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredExpenses.length} of {expenses.length} transactions
                  {typeFilter && ` • Type: ${typeFilter}`}
                  {categoryFilter && ` • Category: ${categoryFilter}`}
                  {settledFilter && ` • Status: ${settledFilter}`}
                </p>
              </div>
            )}
          </div>

          {/* Transactions Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {typeFilter || categoryFilter || settledFilter || dateFilter
                  ? "No transactions match your filters"
                  : "No transactions found"}
              </p>
              <p className="text-gray-400">
                {typeFilter || categoryFilter || settledFilter || dateFilter
                  ? "Try adjusting your filter settings"
                  : "Create your first transaction to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExpenses.map((expense) => (
                <div key={expense._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-150 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{expense.category}</h3>
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {expense.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                      <span className={`text-lg font-bold mt-1 ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'income' ? '+' : '-'}${expense.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-grow">
                    {expense.description && (
                      <p><span className="font-medium">Description:</span> {expense.description}</p>
                    )}
                    <p><span className="font-medium">Related to:</span> {getRelatedName(expense)}</p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        expense.settled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.settled ? 'Settled' : 'Pending'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center items-center mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => toggleSettled(expense)}
                      className={`hover:bg-opacity-20 transition duration-150 p-2 rounded ${
                        expense.settled ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={expense.settled ? "Mark as Pending" : "Mark as Settled"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expense.settled ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M5 13l4 4L19 7"} />
                      </svg>
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition duration-150 p-2 rounded"
                      title="Edit Transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 transition duration-150 p-2 rounded"
                      title="Delete Transaction"
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

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <h3 className="text-xl font-semibold mb-6 text-indigo-700">
                {editExpense ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      required
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Model
                    </label>
                    <select
                      value={formData.relatedModel}
                      onChange={(e) => setFormData({...formData, relatedModel: e.target.value, relatedTo: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    >
                      <option value="">Not Related</option>
                      <option value="Horse">Horse</option>
                      <option value="Staff">Staff</option>
                      <option value="Stable">Stable</option>
                    </select>
                  </div>

                  {formData.relatedModel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Related To
                      </label>
                      <select
                        value={formData.relatedTo}
                        onChange={(e) => setFormData({...formData, relatedTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      >
                        <option value="">Select {formData.relatedModel}</option>
                        {(formData.relatedModel === 'Horse' ? horses :
                          formData.relatedModel === 'Staff' ? staff : stables
                        ).map(item => (
                          <option key={item._id} value={item._id}>
                            {item.name || item.fullName || `${item.firstName} ${item.lastName}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    rows="3"
                    placeholder="Additional details about this transaction..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="settled"
                    checked={formData.settled}
                    onChange={(e) => setFormData({...formData, settled: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="settled" className="ml-2 block text-sm text-gray-900">
                    Mark as settled
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-150"
                  >
                    {editExpense ? 'Save Changes' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
