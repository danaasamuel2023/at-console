// pages/send-ishare.js
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const SendISHARE = () => {
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountMB, setAmountMB] = useState('');
  const [note, setNote] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // API base URL - matching your auth page configuration
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // Authenticate user on component mount
  useEffect(() => {
    const token = localStorage.getItem('at_ishare_token');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/auth'); // Updated to match your auth page route
      return;
    }

    console.log('Token found:', token.substring(0, 20) + '...');
    fetchUserProfile(token);
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile with token...');
      const response = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
      } else {
        const errorData = await response.json();
        console.log('Profile fetch failed:', errorData);
        localStorage.removeItem('at_ishare_token');
        localStorage.removeItem('at_ishare_user');
        router.push('/auth');
      }
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('at_ishare_token');
      localStorage.removeItem('at_ishare_user');
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError('');
    }
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setAmountMB(value);
    setError('');
  };

  // Send ISHARE transfer
  const handleSendISHARE = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!amountMB) {
      setError('Please enter an amount');
      return;
    }

    if (parseInt(amountMB) < 1) {
      setError('Minimum transfer amount is 1MB');
      return;
    }

    if (parseInt(amountMB) > user.ishareBalance) {
      setError('Insufficient balance');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('at_ishare_token');
      console.log('Sending transfer with token:', token?.substring(0, 20) + '...');
      console.log('Transfer data:', { phoneNumber, amountMB: parseInt(amountMB), note: note.trim() });
      
      const response = await fetch(`${API_BASE}/transfer/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          amountMB: parseInt(amountMB),
          note: note.trim()
        })
      });

      const data = await response.json();
      console.log('Transfer response:', data);

      if (response.ok) {
        setSuccess(`Successfully sent ${amountMB}MB to ${formatPhoneNumber(phoneNumber)}!`);
        setUser(prev => ({ ...prev, ishareBalance: data.senderNewBalance }));
        // Reset form
        setPhoneNumber('');
        setAmountMB('');
        setNote('');
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Send ISHARE - Transfer Data</title>
        <meta name="description" content="Send ISHARE data to any phone number" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Send ISHARE</h1>
            <p className="text-gray-200">Transfer data to any phone number</p>
          </div>

          {/* User Balance Card */}
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-6 border border-gray-600/50 shadow-xl">
            <div className="text-center">
              <h2 className="text-white text-lg font-semibold mb-2">Hello, {user?.name}</h2>
              <div className="text-3xl font-bold text-white mb-1">
                {user?.ishareBalance?.toLocaleString()} MB
              </div>
              <div className="text-gray-200 text-sm">
                {((user?.ishareBalance || 0) / 1024).toFixed(2)} GB Available
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600/50">
            <form onSubmit={handleSendISHARE} className="space-y-6">
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Recipient Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="1234567890"
                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-500 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all"
                    maxLength="10"
                    required
                  />
                </div>
                {phoneNumber && phoneNumber.length === 10 && (
                  <div className="mt-2 text-sm text-gray-300">
                    Sending to: {formatPhoneNumber(phoneNumber)}
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Amount (MB)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amountMB}
                    onChange={handleAmountChange}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-500 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all"
                    required
                  />
                  <div className="absolute right-3 top-3 text-gray-300 text-sm">MB</div>
                </div>
                {amountMB && (
                  <div className="mt-2 text-sm text-gray-300">
                    Equivalent: {(parseInt(amountMB || 0) / 1024).toFixed(3)} GB
                  </div>
                )}
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a message..."
                  className="w-full px-4 py-3 bg-gray-700/80 border border-gray-500 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all resize-none"
                  rows="3"
                  maxLength="200"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {note.length}/200
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-green-200 text-sm">{success}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending || !phoneNumber || phoneNumber.length !== 10 || !amountMB || parseInt(amountMB) < 1}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-purple-600 disabled:hover:to-blue-600"
              >
                {sending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-white">Sending...</span>
                  </div>
                ) : (
                  <span className="text-white">{`Send ${amountMB || '0'} MB`}</span>
                )}
              </button>
            </form>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-600">
              <div className="text-sm text-gray-300 mb-3">Quick amounts:</div>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1024].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAmountMB(amount.toString())}
                    className="px-3 py-2 bg-gray-700/70 hover:bg-gray-600/70 text-gray-200 hover:text-white rounded-lg text-sm font-medium transition-colors border border-gray-500/50 hover:border-gray-400/50"
                    type="button"
                  >
                    {amount}MB
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-200 hover:text-white transition-colors font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendISHARE;