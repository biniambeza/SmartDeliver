import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, ShoppingBag, Clock, TrendingUp, Plus, Settings, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data
  const incomingOrders = [
    { id: '#ORD-1105', customer: 'Abebe T.', items: ['2x Burger', '1x Fries'], total: '$18.50', time: '2 min ago', status: 'PENDING' },
    { id: '#ORD-1103', customer: 'Sara M.', items: ['1x Pizza Margherita'], total: '$12.00', time: '5 min ago', status: 'PENDING' },
  ];

  const activeOrders = [
    { id: '#ORD-1100', customer: 'Dawit K.', items: ['3x Shawarma'], total: '$21.00', status: 'PREPARING' },
  ];

  const completedOrders = [
    { id: '#ORD-9821', customer: 'Helen G.', total: '$24.50', date: 'Today, 2:30 PM', status: 'DELIVERED' },
    { id: '#ORD-9810', customer: 'Yonas B.', total: '$15.80', date: 'Today, 1:15 PM', status: 'DELIVERED' },
    { id: '#ORD-9755', customer: 'Meron A.', total: '$32.00', date: 'Yesterday, 6:45 PM', status: 'DELIVERED' },
  ];

  const menuItems = [
    { name: 'Classic Burger', price: '$8.50', category: 'Burgers', available: true },
    { name: 'Cheese Pizza', price: '$12.00', category: 'Pizza', available: true },
    { name: 'Chicken Shawarma', price: '$7.00', category: 'Wraps', available: false },
    { name: 'Caesar Salad', price: '$6.50', category: 'Salads', available: true },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PREPARING': return 'bg-blue-100 text-blue-700';
      case 'READY_FOR_PICKUP': return 'bg-purple-100 text-purple-700';
      case 'DELIVERED': return 'bg-green-100 text-[#1E8C45]';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#F5B820] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Merchant Portal</h1>
              <p className="text-gray-500 font-medium">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Today's Revenue</p>
              <p className="text-2xl font-black text-[#1E8C45]">$72.30</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'New Orders', value: '2', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { label: 'In Progress', value: '1', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Completed', value: '3', color: 'bg-green-50 text-[#1E8C45] border-green-200' },
            { label: 'Menu Items', value: '4', color: 'bg-gray-50 text-gray-700 border-gray-200' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${stat.color} text-center`}>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'orders', label: 'Incoming Orders' },
            { key: 'active', label: 'In Progress' },
            { key: 'history', label: 'Order History' },
            { key: 'menu', label: 'Menu Management' },
            { key: 'settings', label: 'Store Settings' },
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

        {/* Incoming Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">No New Orders</h2>
                <p className="text-gray-500 mt-2">New customer orders will appear here.</p>
              </div>
            ) : (
              incomingOrders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border-2 border-[#F5B820]/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#F5B820] animate-pulse"></div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.customer} • {order.time}</p>
                    </div>
                    <p className="text-xl font-black text-gray-900">{order.total}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm font-medium text-gray-700">{item}</p>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button className="flex-1 py-3 bg-[#1E8C45] text-white font-black rounded-xl hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Prepare</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active / In Progress */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">No Active Orders</h2>
                <p className="text-gray-500 mt-2">Accepted orders being prepared will show here.</p>
              </div>
            ) : (
              activeOrders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm font-medium text-gray-700">{item}</p>
                    ))}
                  </div>
                  <button className="w-full py-3 bg-[#F5B820] text-gray-900 font-black rounded-xl hover:bg-yellow-400 transition-colors shadow-sm">
                    Mark as Ready for Pickup
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Order History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {completedOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1E8C45]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{order.customer}</h4>
                    <p className="text-xs text-gray-500 mt-1">{order.date} • {order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg">{order.total}</p>
                  <p className="text-[10px] font-bold text-[#1E8C45] uppercase tracking-wider">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <button className="w-full py-4 border-2 border-dashed border-[#1E8C45] rounded-xl text-[#1E8C45] font-bold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
            {menuItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.available ? 'bg-green-50 text-[#1E8C45]' : 'bg-red-50 text-red-500'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.category} • {item.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.available ? 'bg-green-50 text-[#1E8C45]' : 'bg-red-50 text-red-500'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Store Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
            <div className="space-y-4">
              {[
                { icon: Store, label: 'Store Profile', desc: 'Update name, logo, and description' },
                { icon: Clock, label: 'Operating Hours', desc: 'Set your open and close times' },
                { icon: TrendingUp, label: 'Pricing & Fees', desc: 'Manage delivery fees and commissions' },
                { icon: Settings, label: 'Notifications', desc: 'Configure order alert preferences' },
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
