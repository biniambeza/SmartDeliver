import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, MapPin, Clock, ChevronRight, Star, Heart, Settings, User, CreditCard, Bell } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data
  const activeOrders = [
    { id: '#ORD-1102', vendor: 'Burger Joint', status: 'PREPARING', items: 3, total: '$24.50', eta: '25 min' },
  ];

  const pastOrders = [
    { id: '#ORD-9821', vendor: 'Burger Joint', date: 'Today, 2:30 PM', items: 2, total: '$18.40', status: 'Delivered' },
    { id: '#ORD-9810', vendor: 'Pizza Palace', date: 'Yesterday, 7:15 PM', items: 1, total: '$12.00', status: 'Delivered' },
    { id: '#ORD-9755', vendor: 'Sushi Express', date: 'Sep 24, 6:45 PM', items: 4, total: '$42.80', status: 'Delivered' },
  ];

  const savedAddresses = [
    { label: 'Home', address: '123 Main Street, Addis Ababa' },
    { label: 'Office', address: '456 Bole Road, Addis Ababa' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'PREPARING': return 'bg-yellow-100 text-yellow-700';
      case 'EN_ROUTE': return 'bg-blue-100 text-blue-700';
      case 'DELIVERED': return 'bg-green-100 text-[#1E8C45]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#F5B820] rounded-2xl flex items-center justify-center text-white shadow-lg text-2xl font-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">My Account</h1>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>
          </div>
          <a
            href="/"
            className="px-6 py-3 bg-[#1E8C45] text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-sm text-center"
          >
            Browse Restaurants
          </a>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'orders', label: 'My Orders' },
            { key: 'tracking', label: 'Live Tracking' },
            { key: 'addresses', label: 'Addresses' },
            { key: 'settings', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <>
                <h3 className="font-black text-gray-900 text-lg">Active Orders</h3>
                {activeOrders.map((order, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border-2 border-[#F5B820]/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{order.vendor}</h4>
                        <p className="text-sm text-gray-500">{order.id} • {order.items} items</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#1E8C45]">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold text-sm">ETA: {order.eta}</span>
                      </div>
                      <p className="font-black text-lg">{order.total}</p>
                    </div>
                    <button className="w-full mt-4 py-3 bg-[#F5B820] text-gray-900 font-black rounded-xl hover:bg-yellow-400 transition-colors">
                      Track Order
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Past Orders */}
            <h3 className="font-black text-gray-900 text-lg mt-8">Order History</h3>
            <div className="space-y-3">
              {pastOrders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1E8C45]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{order.vendor}</h4>
                      <p className="text-xs text-gray-500 mt-1">{order.date} • {order.items} items</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-black text-gray-900">{order.total}</p>
                      <p className="text-[10px] font-bold text-[#1E8C45] uppercase tracking-wider">{order.status}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Tracking */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No Active Deliveries</h2>
            <p className="text-gray-500 mt-2">When a rider picks up your order, you will see live GPS tracking here.</p>
          </div>
        )}

        {/* Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {savedAddresses.map((addr, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-[#F5B820]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{addr.label}</h4>
                    <p className="text-sm text-gray-500">{addr.address}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Edit</button>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-[#1E8C45] hover:text-[#1E8C45] transition-colors">
              + Add New Address
            </button>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            <div className="space-y-4">
              {[
                { icon: User, label: 'Edit Profile', desc: 'Update your name and phone number' },
                { icon: CreditCard, label: 'Payment Methods', desc: 'Manage your saved payment options' },
                { icon: Bell, label: 'Notifications', desc: 'Choose what alerts you receive' },
                { icon: Settings, label: 'Preferences', desc: 'Language, theme, and other settings' },
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
