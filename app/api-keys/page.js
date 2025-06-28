// pages/api-keys.js
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Code,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Terminal,
  Globe,
  Smartphone,
  Server,
  Download,
  ExternalLink,
  FileText,
  Zap
} from 'lucide-react';

const ApiKeyManagement = () => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedExample, setSelectedExample] = useState('balance');

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
  }, []);

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

  // API helper function for web dashboard (uses JWT)
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

  // Regenerate API key
  const regenerateApiKey = async () => {
    try {
      setIsRegenerating(true);
      const data = await apiCall('/user/regenerate-api-key', {
        method: 'POST'
      });
      
      setUser({ ...user, apiKey: data.apiKey });
      setMessage({ type: 'success', text: 'API key regenerated successfully!' });
      setShowConfirmModal(false);
      setShowApiKey(true);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  // Mask API key for display
  const maskApiKey = (apiKey) => {
    if (!apiKey) return '';
    return `${apiKey.substring(0, 8)}${'*'.repeat(48)}${apiKey.substring(-8)}`;
  };

  // API usage examples
  const getApiExamples = () => {
    const baseUrl = API_BASE;
    const apiKey = user?.apiKey || 'your-api-key-here';
    
    return {
      balance: {
        title: 'Get User Balance',
        description: 'Retrieve current ISHARE balance',
        curl: `curl -X GET "${baseUrl}/user/balance" \\
  -H "X-API-Key: ${apiKey}"`,
        
        javascript: `const response = await fetch('${baseUrl}/user/balance', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`,

        response: `{
  "success": true,
  "ishareBalance": 5120,
  "balanceInGB": "5.00",
  "user": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "0123456789"
  }
}`
      },
      
      transfer: {
        title: 'Send ISHARE Transfer',
        description: 'Transfer ISHARE data to a phone number',
        curl: `curl -X POST "${baseUrl}/transfer/send" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "0123456789",
    "amountMB": 1024,
    "note": "API Transfer"
  }'`,
        
        javascript: `const response = await fetch('${baseUrl}/transfer/send', {
  method: 'POST',
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phoneNumber: '0123456789',
    amountMB: 1024,
    note: 'API Transfer'
  })
});
const data = await response.json();`,

        response: `{
  "success": true,
  "message": "ISHARE sent successfully",
  "transfer": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "recipientPhoneNumber": "0123456789",
    "amountMB": 1024,
    "status": "completed",
    "note": "API Transfer",
    "transferDate": "2023-09-07T10:30:00.000Z"
  },
  "senderNewBalance": 4096
}`
      },
      
      useData: {
        title: 'Record Data Usage',
        description: 'Record data consumption and deduct from balance',
        curl: `curl -X POST "${baseUrl}/use-data" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 512
  }'`,
        
        javascript: `const response = await fetch('${baseUrl}/use-data', {
  method: 'POST',
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 512
  })
});
const data = await response.json();`,

        response: `{
  "success": true,
  "message": "Data usage recorded successfully",
  "usage": {
    "userId": "64f8a1b2c3d4e5f6g7h8i9j0",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "usedAmount": 512,
    "remainingBalance": 4608,
    "usageDate": "2023-09-07T10:35:00.000Z"
  }
}`
      },

      transfers: {
        title: 'Get Transfer History',
        description: 'Retrieve user transfer history',
        curl: `curl -X GET "${baseUrl}/transfers?type=all" \\
  -H "X-API-Key: ${apiKey}"`,
        
        javascript: `const response = await fetch('${baseUrl}/transfers?type=all', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,

        response: `{
  "success": true,
  "transfers": [
    {
      "id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "type": "sent",
      "amountMB": 1024,
      "recipientPhoneNumber": "0123456789",
      "senderName": "John Doe",
      "recipientName": "External Recipient",
      "status": "completed",
      "createdAt": "2023-09-07T10:30:00.000Z",
      "note": "API Transfer"
    }
  ],
  "total": 1
}`
      },

      profile: {
        title: 'Get User Profile',
        description: 'Retrieve user profile information',
        curl: `curl -X GET "${baseUrl}/user/profile" \\
  -H "X-API-Key: ${apiKey}"`,
        
        javascript: `const response = await fetch('${baseUrl}/user/profile', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,

        response: `{
  "success": true,
  "user": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "email": "Samtech@example.com",
    "name": "Samtech",
    "phoneNumber": "0123456789",
    "role": "buyer",
    "ishareBalance": 5120,
    "balanceInGB": "5.00",
    "apiKey": "your-api-key-here",
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
}`
      },

      regenerateKey: {
        title: 'Regenerate API Key',
        description: 'Generate a new API key (invalidates current key)',
        curl: `curl -X POST "${baseUrl}/user/regenerate-api-key" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json"`,
        
        javascript: `const response = await fetch('${baseUrl}/user/regenerate-api-key', {
  method: 'POST',
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,

        response: `{
  "success": true,
  "message": "API key regenerated successfully",
  "apiKey": "new-64-character-api-key-here"
}`
      },

      usageHistory: {
        title: 'Get Usage History',
        description: 'Retrieve transaction history',
        curl: `curl -X GET "${baseUrl}/usage-history?type=all" \\
  -H "X-API-Key: ${apiKey}"`,
        
        javascript: `const response = await fetch('${baseUrl}/usage-history?type=all', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,

        response: `{
  "success": true,
  "history": [
    {
      "id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "type": "data_usage",
      "amount": 512,
      "method": "api",
      "description": "Used 512MB of data",
      "date": "2023-09-07T10:30:00.000Z",
      "details": null
    }
  ]
}`
      },

      stats: {
        title: 'Get User Statistics',
        description: 'Get usage statistics and analytics',
        curl: `curl -X GET "${baseUrl}/stats" \\
  -H "X-API-Key: ${apiKey}"`,
        
        javascript: `const response = await fetch('${baseUrl}/stats', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,

        response: `{
  "success": true,
  "stats": {
    "role": "buyer",
    "activity": {
      "totalDataLoaded": "10240 MB",
      "totalDataUsed": "5120 MB",
      "totalTransfersSent": 3,
      "totalDataSent": "1024 MB",
      "totalTransfersReceived": 2,
      "totalDataReceived": "512 MB",
      "currentBalance": "4608 MB"
    },
    "user": {
      "name": "John Doe",
      "email": "user@example.com",
      "phoneNumber": "0123456789"
    }
  }
}`
      }
    };
  };

  const examples = getApiExamples();

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
        <title>API Keys - AT ISHARE DATA</title>
        <meta name="description" content="Manage your API keys and view documentation" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">API Key Management</h1>
            <p className="text-gray-300">Manage your API keys and integrate with AT ISHARE DATA</p>
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
              { id: 'overview', label: 'API Key', icon: Key },
              { id: 'documentation', label: 'Documentation', icon: BookOpen },
              { id: 'examples', label: 'Code Examples', icon: Code }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* API Key Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* API Key Card */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Key className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Your API Key</h3>
                      <p className="text-gray-400">Use this key to authenticate API requests</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(user?.apiKey || '')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Copy API Key"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm break-all">
                      {showApiKey ? user?.apiKey : maskApiKey(user?.apiKey)}
                    </code>
                    {copiedToClipboard && (
                      <span className="text-green-400 text-sm ml-2">Copied!</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Keep this key secure and never share it publicly</span>
                  </div>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isRegenerating}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Key'}</span>
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-white font-medium capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ISHARE Balance</p>
                    <p className="text-white font-medium">{user?.ishareBalance?.toLocaleString() || 0} MB</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-orange-900/20 border border-orange-500/50 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="text-orange-400 font-bold mb-2">Security Best Practices</h4>
                    <ul className="text-orange-200 text-sm space-y-1">
                      <li>• Never share your API key in public repositories or client-side code</li>
                      <li>• Store your API key in environment variables or secure configuration</li>
                      <li>• Regenerate your key if you suspect it has been compromised</li>
                      <li>• Monitor your API usage regularly for unusual activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <div className="space-y-6">
              {/* Authentication */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-blue-400" />
                  Authentication
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 mb-4">
                    AT ISHARE DATA API uses API key authentication for simplicity and security:
                  </p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <h4 className="text-white font-semibold mb-2">Required Headers:</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li><code className="text-green-400">X-API-Key: YOUR_API_KEY</code></li>
                      <li><code className="text-green-400">Content-Type: application/json</code> (for POST requests)</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                      <strong>Note:</strong> Only the API key is required for authentication. 
                       - just include your API key in the <code>X-API-Key</code> header.
                    </p>
                  </div>
                </div>
              </div>

              {/* Base URL */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-400" />
                  Base URL
                </h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <code className="text-green-400 text-lg">{API_BASE}</code>
                </div>
              </div>

              {/* Available Endpoints */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Server className="w-6 h-6 mr-2 text-blue-400" />
                  Available Endpoints
                </h3>
                <div className="space-y-4">
                  {[
                    { method: 'GET', path: '/user/profile', desc: 'Get user profile information' },
                    { method: 'GET', path: '/user/balance', desc: 'Get current ISHARE balance' },
                    { method: 'POST', path: '/transfer/send', desc: 'Send ISHARE to a phone number' },
                    { method: 'GET', path: '/transfers', desc: 'Get transfer history' },
                    { method: 'POST', path: '/use-data', desc: 'Record data usage' },
                    { method: 'GET', path: '/usage-history', desc: 'Get detailed usage history' },
                    { method: 'GET', path: '/stats', desc: 'Get user statistics' },
                    { method: 'POST', path: '/user/regenerate-api-key', desc: 'Generate new API key' },
                    { method: 'GET', path: '/status', desc: 'Get API status and info' }
                  ].map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-green-600 text-white' :
                          endpoint.method === 'POST' ? 'bg-blue-600 text-white' :
                          endpoint.method === 'PUT' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-green-400">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-400 text-sm">{endpoint.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate Limits */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-blue-400" />
                  Rate Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">API Requests</h4>
                    <p className="text-gray-300">50 requests per 15 minutes</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Web Requests</h4>
                    <p className="text-gray-300">200 requests per 15 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              {/* Example Selector */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-bold text-white mb-4">Code Examples</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(examples).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedExample(key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedExample === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {examples[key].title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Example */}
              {selectedExample && examples[selectedExample] && (
                <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-white mb-2">{examples[selectedExample].title}</h4>
                    <p className="text-gray-400">{examples[selectedExample].description}</p>
                  </div>

                  {/* cURL Example */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-semibold flex items-center">
                        <Terminal className="w-4 h-4 mr-2" />
                        cURL
                      </h5>
                      <button
                        onClick={() => copyToClipboard(examples[selectedExample].curl)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm whitespace-pre-wrap">
                        {examples[selectedExample].curl}
                      </pre>
                    </div>
                  </div>

                  {/* JavaScript Example */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-semibold flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        JavaScript
                      </h5>
                      <button
                        onClick={() => copyToClipboard(examples[selectedExample].javascript)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-400 text-sm whitespace-pre-wrap">
                        {examples[selectedExample].javascript}
                      </pre>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-semibold flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Response
                      </h5>
                      <button
                        onClick={() => copyToClipboard(examples[selectedExample].response)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-yellow-400 text-sm whitespace-pre-wrap">
                        {examples[selectedExample].response}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm Regenerate Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-600/50 w-full max-w-md">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                <h3 className="text-xl font-bold text-white">Regenerate API Key</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to regenerate your API key? This action cannot be undone and will 
                invalidate your current key. You'll need to update all applications using the old key.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={regenerateApiKey}
                  disabled={isRegenerating}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiKeyManagement;