import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  MapPin, 
  Bot, 
  User, 
  LogOut, 
  Store, 
  Bike, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenTrack }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const { itemsCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Role Badge Styling
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'VENDOR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RIDER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
      case 'VENDOR':
        return <Store className="w-3.5 h-3.5 mr-1" />;
      case 'RIDER':
        return <Bike className="w-3.5 h-3.5 mr-1" />;
      default:
        return <User className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Smart<span className="text-emerald-400">Deliver</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Multi-Vendor Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a
              href="#vendors"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center"
            >
              <Store className="w-4 h-4 mr-2 text-slate-400" />
              Explore Stores
            </a>
            <button
              onClick={onOpenTrack}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center cursor-pointer"
            >
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              Track Order
            </button>
            <a
              href="#support"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center"
            >
              <Bot className="w-4 h-4 mr-2 text-emerald-400" />
              AI Support
            </a>
          </nav>

          {/* User Authentication & Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Trigger Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Cart</span>
              {itemsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] animate-pulse">
                  {itemsCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-white leading-none">
                      {user.name}
                    </span>
                    <span className={`inline-flex items-center text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-semibold text-xs border border-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                    
                    {user.role === 'VENDOR' && (
                      <a
                        href="#vendor-dashboard"
                        className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Store className="w-4 h-4 mr-2.5 text-purple-400" />
                        Vendor Dashboard
                      </a>
                    )}

                    {user.role === 'RIDER' && (
                      <a
                        href="#rider-dashboard"
                        className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Bike className="w-4 h-4 mr-2.5 text-amber-400" />
                        Rider Deliveries
                      </a>
                    )}

                    {user.role === 'ADMIN' && (
                      <a
                        href="#admin-dashboard"
                        className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2.5 text-rose-400" />
                        Admin Operations
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu and cart button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                  {itemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-5 space-y-2">
          <a
            href="#vendors"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            Explore Stores
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrack();
            }}
            className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            Track Order
          </button>
          <a
            href="#support"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            AI Support
          </a>

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-slate-300 bg-slate-800 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegister();
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-slate-950 bg-emerald-400 rounded-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
