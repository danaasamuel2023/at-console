// pages/transfers.js
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  History,
  Search,
  Filter,
  Calendar,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Plus,
  Minus,
  ArrowLeftRight,
  Download,
  AlertCircle,
  CreditCard,
  Smartphone
} from 'lucide-react';

const UserTransfers = () => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'sent', 'received'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [sendFormData, setSendFormData] = useState({
    phoneNumber: '',
    amountMB: '',
    note: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('at_ishare_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchUserProfile(token);
    fetchTransfers();
  }, []);

  // Filter transfers when filters change
  useEffect(() => {
    filterTransfers();
  }, [transfers, activeFilter, searchTerm, dateFilter]);

  // Fetch user profile
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
        setUser(userData);
      } else {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('at_ishare_token');
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || 'Request failed';
        } catch {
          errorMessage = errorText || 'Request failed';
        }
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  // Fetch transfers
  const fetchTransfers = async (type = 'all') => {
    setIsLoadingTransfers(true);
    try {
      const data = await apiCall(`/transfers?type=${type}`);
      
      if (data && data.transfers) {
        setTransfers(data.transfers);
        setMessage({ type: 'success', text: `Loaded ${data.transfers.length} transfers` });
      } else {
        setTransfers([]);
        setMessage({ type: 'info', text: 'No transfers found' });
      }
    } catch (error) {
      console.error('Fetch transfers error:', error);
      setMessage({ type: 'error', text: `Failed to load transfers: ${error.message}` });
      setTransfers([]);
    } finally {
      setIsLoadingTransfers(false);
    }
  };

  // Filter transfers based on current filters
  const filterTransfers = () => {
    let filtered = [...transfers];

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.type === activeFilter);
    }

    // Filter by search term (phone number, name, or note)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transfer => 
        transfer.recipientPhoneNumber?.includes(searchTerm) ||
        transfer.senderName?.toLowerCase().includes(searchLower) ||
        transfer.recipientName?.toLowerCase().includes(searchLower) ||
        transfer.note?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(transfer => {
        const transferDate = new Date(transfer.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return transferDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transferDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transferDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredTransfers(filtered);
  };

  // Send transfer
  const sendTransfer = async (formData) => {
    try {
      setIsProcessing(true);
      const data = await apiCall('/transfer/send', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setMessage({ type: 'success', text: 'Transfer sent successfully!' });
      setSendFormData({ phoneNumber: '', amountMB: '', note: '' });
      setShowSendModal(false);
      
      // Refresh transfers and user balance
      fetchTransfers();
      fetchUserProfile(localStorage.getItem('at_ishare_token'));
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle send form submit
  const handleSendSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!sendFormData.phoneNumber || !sendFormData.amountMB) {
      setMessage({ type: 'error', text: 'Phone number and amount are required' });
      return;
    }

    if (!/^\d{10}$/.test(sendFormData.phoneNumber)) {
      setMessage({ type: 'error', text: 'Phone number must be exactly 10 digits' });
      return;
    }

    if (parseInt(sendFormData.amountMB) < 1) {
      setMessage({ type: 'error', text: 'Amount must be at least 1MB' });
      return;
    }

    if (user && parseInt(sendFormData.amountMB) > user.ishareBalance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    sendTransfer({
      phoneNumber: sendFormData.phoneNumber,
      amountMB: parseInt(sendFormData.amountMB),
      note: sendFormData.note
    });
  };

  // Get transfer statistics
  const getTransferStats = () => {
    const sentTransfers = transfers.filter(t => t.type === 'sent');
    const receivedTransfers = transfers.filter(t => t.type === 'received');
    
    const totalSent = sentTransfers.reduce((sum, t) => sum + t.amountMB, 0);
    const totalReceived = receivedTransfers.reduce((sum, t) => sum + t.amountMB, 0);
    
    return {
      totalTransfers: transfers.length,
      sentCount: sentTransfers.length,
      receivedCount: receivedTransfers.length,
      totalSent,
      totalReceived
    };
  };

  const stats = getTransferStats();

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
        <title>Transfer History - AT ISHARE DATA</title>
        <meta name="description" content="View and manage your ISHARE transfers" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Transfer History</h1>
                <p className="text-gray-300">Manage your ISHARE transfers and view transaction history</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm">Current Balance</p>
                <p className="text-3xl font-bold text-white">{user?.ishareBalance?.toLocaleString() || 0} MB</p>
                <p className="text-blue-400 text-sm">{((user?.ishareBalance || 0) / 1024).toFixed(2)} GB</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/50 border-green-500/50 text-green-200' 
                : message.type === 'info'
                ? 'bg-blue-900/50 border-blue-500/50 text-blue-200'
                : 'bg-red-900/50 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : message.type === 'info' ? (
                  <AlertCircle className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                {message.text}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Transfers</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTransfers}</p>
                </div>
                <ArrowLeftRight className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sent</p>
                  <p className="text-3xl font-bold text-white">{stats.sentCount}</p>
                  <p className="text-red-400 text-sm">{stats.totalSent.toLocaleString()} MB</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Received</p>
                  <p className="text-3xl font-bold text-white">{stats.receivedCount}</p>
                  <p className="text-green-400 text-sm">{stats.totalReceived.toLocaleString()} MB</p>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Net Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalReceived - stats.totalSent > 0 ? '+' : ''}
                    {(stats.totalReceived - stats.totalSent).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">MB</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>Send ISHARE</span>
              </button>
              
              <button
                onClick={() => fetchTransfers()}
                disabled={isLoadingTransfers}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingTransfers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
                {[
                  { id: 'all', label: 'All Transfers', icon: ArrowLeftRight },
                  { id: 'sent', label: 'Sent', icon: ArrowUpRight },
                  { id: 'received', label: 'Received', icon: ArrowDownLeft }
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeFilter === filter.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search and Date Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transfers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transfers List */}
          <div className="bg-gray-800/80 rounded-2xl border border-gray-600/50 overflow-hidden">
            {isLoadingTransfers ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading transfers...</p>
                </div>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No transfers found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or make your first transfer</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600/50">
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-700/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {transfer.type === 'sent' ? (
                              <div className="flex items-center space-x-2 text-red-400">
                                <ArrowUpRight className="w-5 h-5" />
                                <span className="font-medium">Sent</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-green-400">
                                <ArrowDownLeft className="w-5 h-5" />
                                <span className="font-medium">Received</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <p className="text-white font-medium">{transfer.recipientPhoneNumber}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-400 text-sm">
                                {transfer.type === 'sent' ? transfer.recipientName : transfer.senderName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`text-lg font-bold ${
                              transfer.type === 'sent' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transfer.type === 'sent' ? '-' : '+'}{transfer.amountMB} MB
                            </p>
                            <p className="text-gray-400 text-sm">
                              {((transfer.amountMB) / 1024).toFixed(2)} GB
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                            transfer.status === 'completed' 
                              ? 'bg-green-900/50 text-green-300' 
                              : transfer.status === 'failed'
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {transfer.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {transfer.status === 'failed' && <XCircle className="w-3 h-3" />}
                            {transfer.status === 'pending' && <Clock className="w-3 h-3" />}
                            <span className="capitalize">{transfer.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white text-sm">
                              {new Date(transfer.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(transfer.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setShowTransferDetails(true);
                            }}
                            className="p-1 text-blue-400 hover:bg-blue-900/50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Send Transfer Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-600/50 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Send ISHARE</h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSendSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Phone Number
                  </label>
                  <input
                    type="tel"
                    value={sendFormData.phoneNumber}
                    onChange={(e) => setSendFormData({ ...sendFormData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
                    maxLength="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (MB)
                  </label>
                  <input
                    type="number"
                    value={sendFormData.amountMB}
                    onChange={(e) => setSendFormData({ ...sendFormData, amountMB: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1024"
                    min="1"
                    max={user?.ishareBalance || 0}
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Available balance: {user?.ishareBalance?.toLocaleString() || 0} MB
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={sendFormData.note}
                    onChange={(e) => setSendFormData({ ...sendFormData, note: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Add a note for this transfer..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Sending...' : 'Send ISHARE'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Details Modal */}
        {showTransferDetails && selectedTransfer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-600/50 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Transfer Details</h3>
                <button
                  onClick={() => setShowTransferDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-4">
                    {selectedTransfer.type === 'sent' ? (
                      <div className="flex items-center space-x-2 text-red-400">
                        <ArrowUpRight className="w-8 h-8" />
                        <span className="text-xl font-bold">Transfer Sent</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-400">
                        <ArrowDownLeft className="w-8 h-8" />
                        <span className="text-xl font-bold">Transfer Received</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <p className={`text-3xl font-bold ${
                      selectedTransfer.type === 'sent' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {selectedTransfer.type === 'sent' ? '-' : '+'}{selectedTransfer.amountMB} MB
                    </p>
                    <p className="text-gray-400">
                      {(selectedTransfer.amountMB / 1024).toFixed(2)} GB
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone Number:</span>
                      <span className="text-white">{selectedTransfer.recipientPhoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {selectedTransfer.type === 'sent' ? 'Recipient:' : 'Sender:'}
                      </span>
                      <span className="text-white">
                        {selectedTransfer.type === 'sent' ? selectedTransfer.recipientName : selectedTransfer.senderName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`capitalize ${
                        selectedTransfer.status === 'completed' ? 'text-green-400' : 
                        selectedTransfer.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {selectedTransfer.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">
                        {new Date(selectedTransfer.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedTransfer.note && (
                      <div>
                        <span className="text-gray-400">Note:</span>
                        <p className="text-white mt-1">{selectedTransfer.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserTransfers;