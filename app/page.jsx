'use client'
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  History, 
  Smartphone,
  Loader2,
  RefreshCw,
  ArrowRight,
  User,
  ChevronRight
} from 'lucide-react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem('at_ishare_token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('at_ishare_token');
      const baseURL = 'http://localhost:3000/api/v1';
      
      // Load user profile
      const profileResponse = await fetch(`${baseURL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
      }

      // Load balance
      const balanceResponse = await fetch(`${baseURL}/user/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData);
      }

      // Get transaction count (you can add this endpoint or use dummy data)
      // For now, using dummy count
      setTransactionCount(15);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const logout = () => {
    localStorage.removeItem('at_ishare_token');
    localStorage.removeItem('at_ishare_user');
    window.location.href = '/auth';
  };

  const navigateToTransactions = () => {
    // Navigate to transactions page
    window.location.href = '/transactions';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AT ISHARE DATA
              </h1>
              <p className="text-sm text-gray-300">Welcome back, {user?.name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 p-3 rounded-xl transition-all duration-200"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-3">Current AT ISHARE Balance</h2>
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-4">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {user?.ishareBalance || balance?.ishareBalance || 0} MB
              </div>
              <div className="text-sm text-green-300">
                {balance?.balanceInGB || (((user?.ishareBalance || 0) / 1024).toFixed(2))} GB
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Account Type</div>
                <div className="text-blue-400 font-medium text-sm capitalize">{user?.role || 'User'}</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Status</div>
                <div className="text-green-400 font-medium text-sm">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Profile Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">User Profile</h3>
                  <p className="text-gray-400 text-xs">View and manage your profile</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>
          </div>

          {/* Transactions Card */}
          <button
            onClick={navigateToTransactions}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 hover:bg-gray-800/60 transition-all duration-200 group text-left w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Transaction History</h3>
                  <p className="text-gray-400 text-xs">
                    {transactionCount} total transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                  {transactionCount}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </div>
            </div>
          </button>
        </div>

        {/* Account Info */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <div className="bg-gray-700/30 rounded-lg p-2 text-white text-sm">
                {user?.name || 'Loading...'}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email Address</label>
              <div className="bg-gray-700/30 rounded-lg p-2 text-white text-sm">
                {user?.email || 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;