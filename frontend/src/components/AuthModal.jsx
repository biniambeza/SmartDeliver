import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Store, Bike, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    closeAuthModal, 
    login, 
    register 
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role, phone });
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      let errorMsg = 'An unexpected error occurred. Please try again.';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.request) {
        errorMsg = 'Network Error: Cannot connect to server. Is the backend running?';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Tabs */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {authModalTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {authModalTab === 'login' 
              ? 'Access your orders, dashboard, and live deliveries' 
              : 'Join SmartDeliver as a customer, merchant, or rider'}
          </p>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mt-5 bg-gray-50 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthModalTab('login');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-[#F5B820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthModalTab('register');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authModalTab === 'register'
                  ? 'bg-[#F5B820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Biniam Beza"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F5B820] focus:ring-2 focus:ring-[#F5B820]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">I am joining as:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      role === 'CUSTOMER'
                        ? 'bg-[#FFF8E1] border-[#F5B820] text-[#E5A910] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#F5B820]/40'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('VENDOR')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      role === 'VENDOR'
                        ? 'bg-[#E8F5E9] border-[#1E8C45] text-[#1E8C45] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#1E8C45]/30'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('RIDER')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      role === 'RIDER'
                        ? 'bg-[#1E8C45] border-[#1E8C45] text-white shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Rider</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F5B820] focus:ring-2 focus:ring-[#F5B820]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F5B820] focus:ring-2 focus:ring-[#F5B820]/20"
              />
            </div>
            {authModalTab === 'register' && (
              <span className="text-[10px] text-gray-500 mt-1 block">At least 6 characters required</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#F5B820] hover:bg-[#E5A910] text-white font-bold text-sm shadow-md shadow-[#F5B820]/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : authModalTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-gray-500 mt-5">
          By continuing, you agree to SmartDeliver's terms and role-based policies.
        </p>
      </div>
    </div>
  );
}
