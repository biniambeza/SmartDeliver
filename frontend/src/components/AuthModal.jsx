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
      // Reset fields on success
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Tabs */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {authModalTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalTab === 'login' 
              ? 'Access your orders, dashboard, and live deliveries' 
              : 'Join SmartDeliver as a customer, merchant, or rider'}
          </p>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mt-5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthModalTab('login');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
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
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authModalTab === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Biniam Beza"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">I am joining as:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-2 text-[11px] font-medium rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                      role === 'CUSTOMER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('VENDOR')}
                    className={`py-2 px-2 text-[11px] font-medium rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                      role === 'VENDOR'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('RIDER')}
                    className={`py-2 px-2 text-[11px] font-medium rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                      role === 'RIDER'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Rider</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {authModalTab === 'register' && (
              <span className="text-[10px] text-slate-500 mt-1 block">At least 6 characters required</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : authModalTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Disclaimer */}
        <p className="text-[11px] text-center text-slate-500 mt-5">
          By continuing, you agree to SmartDeliver's terms and role-based policies.
        </p>
      </div>
    </div>
  );
}
