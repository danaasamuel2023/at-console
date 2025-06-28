'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer' // Default to buyer (account), no UI selection
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const baseURL = 'http://localhost:3000/api/v1';
      const endpoint = isLogin ? `${baseURL}/auth/login` : `${baseURL}/auth/register`;
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      console.log('Making API call to:', endpoint);
      console.log('Payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('at_ishare_token', data.token);
        localStorage.setItem('at_ishare_user', JSON.stringify(data.user));
      }
      
      setMessage({ 
        type: 'success', 
        text: isLogin ? 'Login successful! Redirecting...' : 'Account created successfully! Redirecting...'
      });

      // Redirect to dashboard after successful login/registration
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

      // Reset form after successful registration
      if (!isLogin) {
        setFormData({ name: '', email: '', password: '', role: 'buyer' });
      }

    } catch (error) {
      console.error('API Error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to connect to server. Please check if backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '', role: 'buyer' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AT ISHARE DATA
                </h2>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-300">
                {isLogin 
                  ? 'Sign in to access your AT ISHARE DATA account' 
                  : 'Join AT ISHARE DATA and manage your data efficiently'
                }
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name Field (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${
                message.type === 'success' 
                  ? 'bg-green-900/50 text-green-300 border-green-500/50' 
                  : 'bg-red-900/50 text-red-300 border-red-500/50'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-gray-300">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-gray-300 font-medium">Secure & Fast</p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xs text-gray-300 font-medium">AT ISHARE Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;