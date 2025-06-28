// pages/admin.js
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
  Users,
  Database,
  Activity,
  Plus,
  Minus,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add loading states for different tabs
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('at_ishare_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchUserProfile(token);
  }, []);

  // Fetch user profile and check admin role
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User profile:', userData); // Debug log
        if (userData.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(userData);
        fetchDashboardStats();
      } else {
        console.error('Profile fetch failed:', response.status, response.statusText);
        router.push('/auth');
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API helper function with better error handling
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('at_ishare_token');
    
    console.log('Making API call to:', `${API_BASE}${endpoint}`); // Debug log
    console.log('With options:', options); // Debug log
    console.log('Token:', token ? 'Present' : 'Missing'); // Debug log
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', Object.fromEntries(response.headers.entries())); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText); // Debug log
        
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || 'Request failed';
        } catch {
          errorMessage = errorText || 'Request failed';
        }
        
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('API Response data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...'); // Debug log
      const data = await apiCall('/admin/dashboard');
      setDashboardStats(data.dashboard);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      setMessage({ type: 'error', text: `Failed to load dashboard stats: ${error.message}` });
    }
  };

  // Enhanced fetch users with better error handling
  const fetchUsers = async (page = 1) => {
    setIsLoadingUsers(true);
    try {
      console.log(`Fetching users for page ${page}...`); // Debug log
      const data = await apiCall(`/admin/users?page=${page}&limit=20`);
      
      console.log('Raw API response:', JSON.stringify(data, null, 2)); // Debug log
      console.log('Data type:', typeof data); // Debug log
      console.log('Data keys:', Object.keys(data || {})); // Debug log
      
      // Handle different possible response formats
      let usersArray = [];
      let totalPagesCount = 1;
      
      if (Array.isArray(data)) {
        // If the response is directly an array of users
        console.log('Response is direct array format');
        usersArray = data;
        totalPagesCount = 1;
      } else if (data && data.users && Array.isArray(data.users)) {
        // Standard expected format: { users: [...], pagination: {...} }
        console.log('Response is standard object format with users array');
        usersArray = data.users;
        totalPagesCount = data.pagination?.totalPages || 1;
      } else if (data && data.data && Array.isArray(data.data)) {
        // Alternative format: { data: [...], pagination: {...} }
        console.log('Response uses "data" property instead of "users"');
        usersArray = data.data;
        totalPagesCount = data.pagination?.totalPages || data.totalPages || 1;
      } else if (data && data.result && Array.isArray(data.result)) {
        // Another alternative format: { result: [...] }
        console.log('Response uses "result" property');
        usersArray = data.result;
        totalPagesCount = data.pagination?.totalPages || data.totalPages || 1;
      } else {
        // Log the actual structure to help debug
        console.error('Unknown response structure. Expected formats:');
        console.error('1. Direct array: [user1, user2, ...]');
        console.error('2. Object with users: { users: [...], pagination: {...} }');
        console.error('3. Object with data: { data: [...], pagination: {...} }');
        console.error('4. Object with result: { result: [...] }');
        console.error('Actual response:', data);
        
        setUsers([]);
        setMessage({ 
          type: 'error', 
          text: `Invalid response format. Check console for details. Got: ${JSON.stringify(Object.keys(data || {}))}`
        });
        return;
      }
      
      // Validate that users array contains valid user objects
      if (usersArray.length > 0) {
        const sampleUser = usersArray[0];
        console.log('Sample user object:', sampleUser);
        console.log('Sample user keys:', Object.keys(sampleUser || {}));
        
        // Check if users have expected properties
        const hasRequiredFields = sampleUser && (sampleUser._id || sampleUser.id) && sampleUser.email;
        if (!hasRequiredFields) {
          console.warn('Users missing required fields. Sample user:', sampleUser);
        }
      }
      
      setUsers(usersArray);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
      setMessage({ 
        type: 'success', 
        text: `Loaded ${usersArray.length} users from page ${page}`
      });
      
    } catch (error) {
      console.error('Fetch users error:', error);
      setMessage({ type: 'error', text: `Failed to load users: ${error.message}` });
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Enhanced fetch transactions with better error handling
  const fetchTransactions = async (page = 1, type = 'all') => {
    setIsLoadingTransactions(true);
    try {
      console.log(`Fetching transactions for page ${page}, type ${type}...`); // Debug log
      const typeParam = type !== 'all' ? `&type=${type}` : '';
      const data = await apiCall(`/admin/transactions?page=${page}&limit=20${typeParam}`);
      
      console.log('Transactions data received:', data); // Debug log
      
      if (data && data.transactions) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(page);
        setMessage({ type: 'success', text: `Loaded ${data.transactions.length} transactions` });
      } else {
        console.warn('Invalid transactions data structure:', data);
        setTransactions([]);
        setMessage({ type: 'error', text: 'Invalid response format for transactions data' });
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      setMessage({ type: 'error', text: `Failed to load transactions: ${error.message}` });
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Credit ISHARE to user
  const creditIshare = async (formData) => {
    try {
      setIsProcessing(true);
      await apiCall('/admin/credit-ishare', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'ISHARE credited successfully!' });
      fetchDashboardStats();
      if (activeTab === 'users') fetchUsers(currentPage);
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Debit ISHARE from user
  const debitIshare = async (formData) => {
    try {
      setIsProcessing(true);
      await apiCall('/admin/debit-ishare', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'ISHARE debited successfully!' });
      fetchDashboardStats();
      if (activeTab === 'users') fetchUsers(currentPage);
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk credit ISHARE
  const bulkCreditIshare = async (credits) => {
    try {
      setIsProcessing(true);
      const data = await apiCall('/admin/bulk-credit-ishare', {
        method: 'POST',
        body: JSON.stringify({ credits })
      });
      setMessage({ 
        type: 'success', 
        text: `Bulk credit completed! ${data.results.length} successful, ${data.errors.length} failed` 
      });
      fetchDashboardStats();
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update user
  const updateUser = async (userId, formData) => {
    try {
      setIsProcessing(true);
      await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'User updated successfully!' });
      fetchUsers(currentPage);
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Deactivate user
  const deactivateUser = async (userId) => {
    try {
      setIsProcessing(true);
      await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      setMessage({ type: 'success', text: 'User deactivated successfully!' });
      fetchUsers(currentPage);
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export data
  const exportData = async (type) => {
    try {
      const response = await fetch(`${API_BASE}/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('at_ishare_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: 'success', text: `${type} data exported successfully!` });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  // Modal handlers
  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
  };

  // Enhanced tab change handler
  const handleTabChange = (tab) => {
    console.log(`Switching to tab: ${tab}`); // Debug log
    setActiveTab(tab);
    setCurrentPage(1);
    setMessage({ type: '', text: '' });
    
    if (tab === 'users') {
      fetchUsers(1);
    } else if (tab === 'transactions') {
      fetchTransactions(1, filterType);
    } else if (tab === 'dashboard') {
      fetchDashboardStats();
    }
  };

  // Form handlers
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    switch (modalType) {
      case 'credit':
        creditIshare(formData);
        break;
      case 'debit':
        debitIshare(formData);
        break;
      case 'editUser':
        updateUser(formData.id, formData);
        break;
      case 'bulkCredit':
        const credits = formData.bulkData?.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [userEmail, amountMB, reason = 'Bulk credit'] = line.split(',').map(s => s.trim());
            return { userEmail, amountMB: parseInt(amountMB), reason };
          });
        bulkCreditIshare(credits);
        break;
      default:
        break;
    }
  };

  // Manual test function - you can call this from browser console
  window.testUsersFetch = async () => {
    console.log('Manual test: Fetching users...');
    await fetchUsers(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - AT ISHARE DATA</title>
        <meta name="description" content="Admin management dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 lg:pl-80">
        <div className="p-6">
          {/* Debug Info - Remove in production */}
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300">
            <strong>Debug Info:</strong> API Base: {API_BASE}, Active Tab: {activeTab}, 
            Users Count: {users.length}, Token: {localStorage.getItem('at_ishare_token') ? 'Present' : 'Missing'}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Manage users, transactions, and ISHARE credits</p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/50 border-green-500/50 text-green-200' 
                : 'bg-red-900/50 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {message.text}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'transactions', label: 'Transactions', icon: Activity },
              { id: 'actions', label: 'Quick Actions', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {dashboardStats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Users</p>
                          <p className="text-3xl font-bold text-white">{dashboardStats?.users?.total || 0}</p>
                          <p className="text-green-400 text-sm">{dashboardStats?.users?.active || 0} active</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>

                    <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Data Loaded</p>
                          <p className="text-3xl font-bold text-white">
                            {((dashboardStats?.ishare?.totalDataLoaded || 0) / 1024).toFixed(1)}GB
                          </p>
                          <p className="text-blue-400 text-sm">{dashboardStats?.ishare?.totalLoads || 0} loads</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                    </div>

                    <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Data Used</p>
                          <p className="text-3xl font-bold text-white">
                            {((dashboardStats?.ishare?.totalDataUsed || 0) / 1024).toFixed(1)}GB
                          </p>
                          <p className="text-red-400 text-sm">Used from loaded</p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      </div>
                    </div>

                    <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Remaining Data</p>
                          <p className="text-3xl font-bold text-white">
                            {((dashboardStats?.ishare?.remainingData || 0) / 1024).toFixed(1)}GB
                          </p>
                          <p className="text-purple-400 text-sm">Available</p>
                        </div>
                        <Database className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {(dashboardStats?.recentActivity || []).map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.type === 'admin_load' ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            <div>
                              <p className="text-white font-medium">
                                {transaction.user?.name || 'Unknown User'}
                              </p>
                              <p className="text-gray-400 text-sm">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.type === 'admin_load' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'admin_load' ? '+' : '-'}{transaction.amount}MB
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard data...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Users Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => fetchUsers(1)}
                    disabled={isLoadingUsers}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportData('users')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-gray-800/80 rounded-2xl border border-gray-600/50 overflow-hidden">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading users...</p>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No users found</p>
                      <button
                        onClick={() => fetchUsers(1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Balance</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600/50">
                          {users.filter(user => 
                            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                          ).map((user) => (
                            <tr key={user._id} className="hover:bg-gray-700/30">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white font-medium">{user.name}</p>
                                  <p className="text-gray-400 text-sm">{user.email}</p>
                                  {user.phoneNumber && (
                                    <p className="text-gray-500 text-xs">{user.phoneNumber}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-900/50 text-red-300' :
                                  user.role === 'developer' ? 'bg-blue-900/50 text-blue-300' :
                                  'bg-green-900/50 text-green-300'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white">{user.ishareBalance?.toLocaleString() || 0} MB</p>
                                  <p className="text-gray-400 text-sm">
                                    {((user.ishareBalance || 0) / 1024).toFixed(2)} GB
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center space-x-1 ${
                                  user.isActive ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {user.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                  <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => openModal('credit', { userEmail: user.email })}
                                    className="p-1 text-green-400 hover:bg-green-900/50 rounded"
                                    title="Credit ISHARE"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openModal('debit', { userEmail: user.email })}
                                    className="p-1 text-red-400 hover:bg-red-900/50 rounded"
                                    title="Debit ISHARE"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openModal('editUser', user)}
                                    className="p-1 text-blue-400 hover:bg-blue-900/50 rounded"
                                    title="Edit User"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openModal('viewUser', user)}
                                    className="p-1 text-purple-400 hover:bg-purple-900/50 rounded"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-600/50 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">
                          Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchUsers(currentPage - 1)}
                            disabled={currentPage === 1 || isLoadingUsers}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => fetchUsers(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoadingUsers}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Rest of the component remains the same... */}
          {/* I'll continue with the remaining tabs and modal content */}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      fetchTransactions(1, e.target.value);
                    }}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Transactions</option>
                    <option value="admin_load">Admin Loads</option>
                    <option value="data_usage">Data Usage</option>
                    <option value="transfer_sent">Transfers Sent</option>
                    <option value="transfer_received">Transfers Received</option>
                  </select>
                  <button
                    onClick={() => fetchTransactions(1, filterType)}
                    disabled={isLoadingTransactions}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => exportData('transactions')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="bg-gray-800/80 rounded-2xl border border-gray-600/50 overflow-hidden">
                {isLoadingTransactions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading transactions...</p>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No transactions found</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Description</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600/50">
                          {transactions.map((transaction) => (
                            <tr key={transaction._id} className="hover:bg-gray-700/30">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white font-medium">{transaction.user?.name || 'Unknown'}</p>
                                  <p className="text-gray-400 text-sm">{transaction.user?.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === 'admin_load' ? 'bg-green-900/50 text-green-300' :
                                  transaction.type === 'data_usage' ? 'bg-red-900/50 text-red-300' :
                                  transaction.type === 'transfer_sent' ? 'bg-blue-900/50 text-blue-300' :
                                  'bg-purple-900/50 text-purple-300'
                                }`}>
                                  {transaction.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-medium ${
                                  transaction.type === 'admin_load' || transaction.type === 'transfer_received' 
                                    ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {transaction.type === 'admin_load' || transaction.type === 'transfer_received' ? '+' : '-'}
                                  {Math.abs(transaction.amount)} MB
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-300 text-sm">{transaction.description}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-400 text-sm">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(transaction.createdAt).toLocaleTimeString()}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-600/50 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">
                          Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchTransactions(currentPage - 1, filterType)}
                            disabled={currentPage === 1 || isLoadingTransactions}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => fetchTransactions(currentPage + 1, filterType)}
                            disabled={currentPage === totalPages || isLoadingTransactions}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions Tab */}
          {activeTab === 'actions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Credit ISHARE */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Plus className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Credit ISHARE</h3>
                </div>
                <p className="text-gray-400 mb-4">Add ISHARE balance to a user account</p>
                <button
                  onClick={() => openModal('credit')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Credit ISHARE
                </button>
              </div>

              {/* Debit ISHARE */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Minus className="w-8 h-8 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Debit ISHARE</h3>
                </div>
                <p className="text-gray-400 mb-4">Remove ISHARE balance from a user account</p>
                <button
                  onClick={() => openModal('debit')}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Debit ISHARE
                </button>
              </div>

              {/* Bulk Credit */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Bulk Credit</h3>
                </div>
                <p className="text-gray-400 mb-4">Credit ISHARE to multiple users at once</p>
                <button
                  onClick={() => openModal('bulkCredit')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bulk Credit
                </button>
              </div>

              {/* Export Users */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="w-8 h-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Export Users</h3>
                </div>
                <p className="text-gray-400 mb-4">Download user data as JSON file</p>
                <button
                  onClick={() => exportData('users')}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Export Users
                </button>
              </div>

              {/* Export Transactions */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="w-8 h-8 text-orange-400" />
                  <h3 className="text-xl font-bold text-white">Export Transactions</h3>
                </div>
                <p className="text-gray-400 mb-4">Download transaction data as JSON file</p>
                <button
                  onClick={() => exportData('transactions')}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Export Transactions
                </button>
              </div>

              {/* Refresh Dashboard */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <RefreshCw className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">Refresh Data</h3>
                </div>
                <p className="text-gray-400 mb-4">Reload dashboard statistics and data</p>
                <button
                  onClick={() => {
                    fetchDashboardStats();
                    setMessage({ type: 'success', text: 'Dashboard refreshed!' });
                  }}
                  className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-600/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {modalType === 'credit' && 'Credit ISHARE'}
                  {modalType === 'debit' && 'Debit ISHARE'}
                  {modalType === 'editUser' && 'Edit User'}
                  {modalType === 'bulkCredit' && 'Bulk Credit ISHARE'}
                  {modalType === 'viewUser' && 'User Details'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              {(modalType === 'credit' || modalType === 'debit') && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Email
                    </label>
                    <input
                      type="email"
                      value={formData.userEmail || ''}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.amountMB || ''}
                      onChange={(e) => setFormData({ ...formData, amountMB: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1024"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Reason for credit/debit..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      modalType === 'credit'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? 'Processing...' : (modalType === 'credit' ? 'Credit ISHARE' : 'Debit ISHARE')}
                  </button>
                </form>
              )}

              {modalType === 'bulkCredit' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bulk Credit Data
                    </label>
                    <p className="text-gray-400 text-sm mb-2">
                      Format: email,amount,reason (one per line)
                    </p>
                    <textarea
                      value={formData.bulkData || ''}
                      onChange={(e) => setFormData({ ...formData, bulkData: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="8"
                      placeholder="user1@example.com,1024,Welcome bonus&#10;user2@example.com,512,Promotion"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Bulk Credit ISHARE'}
                  </button>
                </form>
              )}

              {modalType === 'editUser' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="developer">Developer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-300">
                      Active User
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Updating...' : 'Update User'}
                  </button>
                </form>
              )}

              {modalType === 'viewUser' && formData && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Name:</span> <span className="text-white">{formData.name || formData.fullName || 'N/A'}</span></p>
                      <p><span className="text-gray-400">Email:</span> <span className="text-white">{formData.email || 'N/A'}</span></p>
                      <p><span className="text-gray-400">Phone:</span> <span className="text-white">{formData.phoneNumber || 'N/A'}</span></p>
                      <p><span className="text-gray-400">Role:</span> <span className="text-white capitalize">{formData.role || 'user'}</span></p>
                      <p><span className="text-gray-400">Status:</span> 
                        <span className={`ml-1 ${(formData.isActive !== false && formData.status !== 'inactive') ? 'text-green-400' : 'text-red-400'}`}>
                          {(formData.isActive !== false && formData.status !== 'inactive') ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Balance:</span> 
                        <span className="text-white ml-1">{(formData.ishareBalance || formData.balance || 0).toLocaleString()} MB</span>
                      </p>
                      <p><span className="text-gray-400">Joined:</span> 
                        <span className="text-white ml-1">{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('credit', { userEmail: formData.email });
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Credit
                    </button>
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('debit', { userEmail: formData.email });
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Debit
                    </button>
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('editUser', formData);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;