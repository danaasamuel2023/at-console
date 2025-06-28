'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  Send, 
  History, 
  CreditCard, 
  Code, 
  Menu, 
  X, 
  LogOut, 
  Smartphone,
  ChevronRight,
  Database,
  Activity,
  ChevronLeft,
  Home
} from 'lucide-react';

const NavigationMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('at_ishare_token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          balance: userData.ishareBalance?.toLocaleString() || '0',
          balanceInGB: ((userData.ishareBalance || 0) / 1024).toFixed(2),
          role: userData.role.charAt(0).toUpperCase() + userData.role.slice(1),
          apiKey: userData.apiKey
        });
        setIsLoggedIn(true);
      } else {
        // Token is invalid
        localStorage.removeItem('at_ishare_token');
        localStorage.removeItem('at_ishare_user');
        setIsLoggedIn(false);
        setError('Session expired');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load user data');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Refresh user data periodically (every 30 seconds)
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        fetchUserProfile();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and statistics',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      href: '/'
    },
    {
      id: 'profile',
      label: 'User Profile',
      icon: User,
      description: 'View and edit your profile',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      href: '/profile'
    },
    {
      id: 'send-bundle',
      label: 'Send ISHARE',
      icon: Send,
      description: 'Send data to phone numbers',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      href: '/send_ishare'
    },
    {
      id: 'transfers',
      label: 'Transfer History',
      icon: History,
      description: 'View sent and received transfers',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      href: '/transfers'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      description: 'View all transaction history',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      href: '/transactions'
    },
    {
      id: 'api',
      label: 'API Keys',
      icon: Code,
      description: 'Manage API keys and docs',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      href: '/api-keys'
    }
  ];

  // Get active item based on current pathname
  const getActiveItem = () => {
    const currentItem = menuItems.find(item => {
      if (pathname === '/' && item.href === '/') return true;
      if (pathname !== '/' && item.href !== '/' && pathname.startsWith(item.href)) return true;
      return false;
    });
    return currentItem ? currentItem.id : 'dashboard';
  };

  const activeItem = getActiveItem();

  const handleItemClick = (item) => {
    setIsOpen(false);
    // Navigate to the respective page using Next.js router
    router.push(item.href);
  };

  const handleLogout = () => {
    localStorage.removeItem('at_ishare_token');
    localStorage.removeItem('at_ishare_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Redirect to login page
    router.push('/auth');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-gray-800/90 backdrop-blur-xl p-3 rounded-2xl border border-gray-700/50">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Don't render if user is not logged in
  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-80';

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800/90 backdrop-blur-xl p-3 rounded-2xl border border-gray-700/50 text-white hover:bg-gray-700/90 transition-all duration-200 shadow-xl"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Collapse Button */}
      <div className="hidden lg:block fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-gray-800/90 backdrop-blur-xl p-3 rounded-2xl border border-gray-700/50 text-white hover:bg-gray-700/90 transition-all duration-200 shadow-xl"
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 ${sidebarWidth} bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 shadow-2xl`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          {!isCollapsed && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AT ISHARE DATA
                  </h1>
                  <p className="text-xs text-gray-400">Data Management Portal</p>
                </div>
              </div>
              
              {/* User Info Card */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{currentUser.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{currentUser.email}</p>
                    {currentUser.phoneNumber && (
                      <p className="text-gray-500 text-xs truncate">{currentUser.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium text-sm">{currentUser.balance} MB</span>
                    </div>
                    <span className="text-gray-500 text-xs ml-6">{currentUser.balanceInGB} GB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Collapsed Header */}
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className="text-green-400 font-medium text-xs">{currentUser.balanceInGB}GB</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center transition-all duration-200 group ${
                  isCollapsed 
                    ? 'justify-center p-3 rounded-xl' 
                    : 'space-x-4 p-4 rounded-xl'
                } ${
                  isActive 
                    ? `${item.bgColor} border border-gray-600/50 shadow-lg` 
                    : 'hover:bg-gray-700/50 border border-transparent'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg flex items-center justify-center ${
                  isActive ? item.bgColor : 'bg-gray-700/50'
                } transition-all duration-200`}>
                  <Icon className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'} ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-300'}`} />
                </div>
                
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className={`font-medium text-sm truncate ${
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${
                      isActive ? item.color : 'text-gray-600 group-hover:text-gray-400'
                    } transition-all duration-200 flex-shrink-0`} />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700/50">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center transition-all duration-200 group ${
              isCollapsed 
                ? 'justify-center p-3 rounded-xl' 
                : 'space-x-3 p-3 rounded-xl'
            } text-gray-400 hover:text-red-400 hover:bg-red-500/10`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Error Display */}
        {error && !isCollapsed && (
          <div className="p-4 border-t border-gray-700/50">
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NavigationMenu;