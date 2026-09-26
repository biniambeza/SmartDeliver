import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, User, Store, Bike, ShieldCheck, Menu, X, Globe, 
  ShoppingBag, MapPin, Headphones, Radio, Package, TrendingUp,
  FileCheck, Clock, Settings, Home
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Role-specific navigation configs
const roleNavConfig = {
  CUSTOMER: {
    brand: 'SmartDeliver',
    color: 'text-[#1E8C45]',
    links: [
      { href: '/customer', label: 'My Orders', icon: ShoppingBag },
      { href: '/', label: 'Browse Stores', icon: Store },
    ],
  },
  VENDOR: {
    brand: 'Merchant Portal',
    color: 'text-[#F5B820]',
    links: [
      { href: '/vendor', label: 'Dashboard', icon: Home },
    ],
  },
  RIDER: {
    brand: 'Rider Dispatch',
    color: 'text-[#1E8C45]',
    links: [
      { href: '/rider', label: 'Dashboard', icon: Home },
    ],
  },
  DISPATCHER: {
    brand: 'Operations Center',
    color: 'text-purple-600',
    links: [
      { href: '/dispatcher', label: 'Dashboard', icon: Home },
    ],
  },
  SUPPORT: {
    brand: 'Support Center',
    color: 'text-blue-600',
    links: [
      { href: '/support', label: 'Dashboard', icon: Home },
    ],
  },
  ADMIN: {
    brand: 'Admin Superpanel',
    color: 'text-red-600',
    links: [
      { href: '/admin', label: 'Superpanel', icon: ShieldCheck },
      { href: '/vendor', label: 'Vendor View', icon: Store },
      { href: '/rider', label: 'Rider View', icon: Bike },
      { href: '/dispatcher', label: 'Dispatch View', icon: Radio },
      { href: '/support', label: 'Support View', icon: Headphones },
    ],
  },
};

export default function RoleNavbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null; // Should not render for unauthenticated users

  const config = roleNavConfig[user.role] || roleNavConfig.CUSTOMER;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <a href={config.links[0]?.href || '/'} className="flex items-center space-x-2">
            <img src="/logo.png" alt="SmartDeliver" className="h-12 w-auto mix-blend-multiply" />
            <span className={`text-lg font-black ${config.color} hidden sm:inline`}>{config.brand}</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {config.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="px-3.5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-950 hover:bg-gray-100 transition-all flex items-center"
              >
                <link.icon className="w-4 h-4 mr-1.5 opacity-60" />
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Globe className="w-4 h-4 text-[#F5B820]" />
              <span className="text-xs font-bold">{lang === 'en' ? 'AM' : 'EN'}</span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F5B820] flex items-center justify-center text-white font-black text-xs shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {config.links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-800 hover:bg-gray-50"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
              <span className="text-sm font-bold text-gray-800">{user.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 uppercase">{user.role}</span>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
