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
  ChevronDown,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar({ onOpenTrack, onOpenVendorPortal, onOpenAI, onOpenAdmin }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const { itemsCount, openCart } = useCart();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'VENDOR':
        return 'bg-[#FFF8E1] text-[#E5A910] border-[#F5B820]/40 font-bold';
      case 'RIDER':
        return 'bg-[#E8F5E9] text-[#1E8C45] border-[#1E8C45]/30 font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#1E8C45] border-[#1E8C45]/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 mr-1 text-red-600" />;
      case 'VENDOR':
        return <Store className="w-3.5 h-3.5 mr-1 text-[#F5B820]" />;
      case 'RIDER':
        return <Bike className="w-3.5 h-3.5 mr-1 text-[#1E8C45]" />;
      default:
        return <User className="w-3.5 h-3.5 mr-1 text-[#1E8C45]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Brand Logo - SmartDeliver */}
          <div className="flex items-center cursor-pointer">
            <img src="/logo.png" alt="SmartDeliver Logo" className="h-24 w-auto mix-blend-multiply" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a
              href="#vendors"
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#FFF8E1] transition-all flex items-center"
            >
              <Store className="w-4 h-4 mr-1.5 text-[#F5B820]" />
              Explore Stores
            </a>
            <button
              onClick={onOpenVendorPortal}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#E8F5E9] transition-all flex items-center cursor-pointer"
            >
              <Store className="w-4 h-4 mr-1.5 text-[#1E8C45]" />
              Merchant Hub
            </button>
            <button
              onClick={onOpenTrack}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#FFF8E1] transition-all flex items-center cursor-pointer"
            >
              <MapPin className="w-4 h-4 mr-1.5 text-[#F5B820]" />
              Track Order
            </button>
            <button
              onClick={onOpenAI}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#E8F5E9] transition-all flex items-center cursor-pointer"
            >
              <Bot className="w-4 h-4 mr-1.5 text-[#1E8C45]" />
              AI Support
            </button>
          </nav>

          {/* User Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="relative px-3.5 py-2.5 rounded-full bg-white hover:bg-[#FFF8E1] text-gray-800 border border-gray-200 hover:border-[#F5B820]/40 shadow-sm transition-all cursor-pointer flex items-center space-x-2"
            >
              <Globe className="w-4 h-4 text-[#F5B820]" />
              <span className="text-xs font-bold text-gray-900">{lang === 'en' ? 'AM' : 'EN'}</span>
            </button>
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative px-3.5 py-2.5 rounded-full bg-white hover:bg-[#FFF8E1] text-gray-800 border border-gray-200 hover:border-[#F5B820]/40 shadow-sm transition-all cursor-pointer flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#1E8C45]" />
              <span className="text-xs font-bold text-gray-900">{t('nav.cart')}</span>
              {itemsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#F5B820] text-white font-black text-[11px] shadow-sm">
                  {itemsCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all text-left cursor-pointer"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900 leading-none">
                      {user.name}
                    </span>
                    <span className={`inline-flex items-center text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F5B820] flex items-center justify-center text-white font-black text-xs shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-2xl p-2 z-50 animate-fade-in-up">
                    <div className="px-3.5 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[11px] text-gray-400 font-semibold">Signed in as</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenVendorPortal();
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#FFF8E1] rounded-xl transition-colors cursor-pointer"
                    >
                      <Store className="w-4 h-4 mr-2.5 text-[#F5B820]" />
                      Merchant Portal
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-[#E8F5E9] rounded-xl transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2.5 text-[#1E8C45]" />
                      Admin Superpanel
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 cursor-pointer"
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
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-gray-950 transition-all cursor-pointer"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={openRegister}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#1E8C45] hover:bg-[#166B35] rounded-full shadow-md shadow-[#1E8C45]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu and cart */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-gray-800 bg-white border border-gray-200"
            >
              <ShoppingBag className="w-5 h-5 text-[#1E8C45]" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#F5B820] text-white font-black text-[9px]">
                  {itemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-[#FFF8E1]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in-up">
          <a
            href="#vendors"
            className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-800 hover:bg-[#FFF8E1]"
          >
            Explore Stores
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenVendorPortal();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-gray-800 hover:bg-[#FFF8E1] cursor-pointer"
          >
            Merchant Hub
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrack();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-gray-800 hover:bg-[#FFF8E1] cursor-pointer"
          >
            Track Order
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAI();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-gray-800 hover:bg-[#E8F5E9] cursor-pointer"
          >
            AI Support Assistant
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-[#1E8C45] hover:bg-[#E8F5E9] cursor-pointer"
          >
            Admin Superpanel
          </button>

          <div className="pt-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-800">{user.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl"
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
                  className="w-full py-2.5 text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-full"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegister();
                  }}
                  className="w-full py-2.5 text-sm font-bold text-white bg-[#1E8C45] rounded-full shadow-md"
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
