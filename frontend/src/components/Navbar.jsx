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

export default function Navbar({ onOpenTrack, onOpenVendorPortal, onOpenAI, onOpenAdmin }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const { itemsCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Role Badge Styling (Yellow, White, Green theme)
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VENDOR':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'RIDER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 mr-1 text-rose-600" />;
      case 'VENDOR':
        return <Store className="w-3.5 h-3.5 mr-1 text-amber-600" />;
      case 'RIDER':
        return <Bike className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
      default:
        return <User className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF7EE]/90 border-b border-amber-200/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Styled like Delivero reference */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-400/30 text-slate-950 font-black">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Deliver<span className="text-amber-500">o</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-0.5"></span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-700">
                Smart Food & Grocery
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a
              href="#vendors"
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all flex items-center"
            >
              <Store className="w-4 h-4 mr-1.5 text-amber-500" />
              Explore Stores
            </a>
            <button
              onClick={onOpenVendorPortal}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all flex items-center cursor-pointer"
            >
              <Store className="w-4 h-4 mr-1.5 text-emerald-600" />
              Merchant Hub
            </button>
            <button
              onClick={onOpenTrack}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all flex items-center cursor-pointer"
            >
              <MapPin className="w-4 h-4 mr-1.5 text-amber-500" />
              Track Order
            </button>
            <button
              onClick={onOpenAI}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all flex items-center cursor-pointer"
            >
              <Bot className="w-4 h-4 mr-1.5 text-emerald-600" />
              AI Support
            </button>
          </nav>

          {/* User Authentication & Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Trigger Button */}
            <button
              onClick={openCart}
              className="relative px-3.5 py-2.5 rounded-full bg-white hover:bg-amber-50 text-slate-800 border border-amber-200/80 shadow-sm transition-all cursor-pointer flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Cart</span>
              {itemsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm">
                  {itemsCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3.5 rounded-full bg-white hover:bg-amber-50 border border-amber-200 shadow-sm transition-all text-left cursor-pointer"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user.name}
                    </span>
                    <span className={`inline-flex items-center text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-amber-100 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] text-slate-400 font-semibold">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenVendorPortal();
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Store className="w-4 h-4 mr-2.5 text-amber-500" />
                      Merchant Portal
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2.5 text-emerald-600" />
                      Admin Superpanel
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1 cursor-pointer"
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
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                {/* Styled like Delivero's iconic dark teal/green rounded pill CTA */}
                <button
                  onClick={openRegister}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#0A3E33] hover:bg-[#062F26] rounded-full shadow-md shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu and cart button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-slate-800 bg-white border border-amber-200"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px]">
                  {itemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-700 hover:bg-amber-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-200/60 bg-[#FAF7EE] px-4 pt-3 pb-6 space-y-2">
          <a
            href="#vendors"
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-amber-100/60"
          >
            Explore Stores
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenVendorPortal();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-amber-100/60 cursor-pointer"
          >
            Merchant Hub
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrack();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-amber-100/60 cursor-pointer"
          >
            Track Order
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAI();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-amber-100/60 cursor-pointer"
          >
            AI Support Assistant
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
          >
            Admin Superpanel
          </button>

          <div className="pt-4 border-t border-amber-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3.5 py-2 bg-white rounded-xl border border-amber-100">
                  <span className="text-sm font-bold text-slate-800">{user.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="w-full py-2.5 text-sm font-bold text-slate-800 bg-white border border-amber-200 rounded-full"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegister();
                  }}
                  className="w-full py-2.5 text-sm font-bold text-white bg-[#0A3E33] rounded-full shadow-md"
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
