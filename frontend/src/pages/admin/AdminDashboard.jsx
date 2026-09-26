import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Users, Store, Bike, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Eye, Ban, ChevronRight, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock platform data
  const platformStats = {
    totalUsers: 156,
    totalVendors: 12,
    totalRiders: 8,
    totalOrders: 342,
    todayRevenue: '$1,245.80',
    pendingVerifications: 3,
  };

  const allUsers = [
    { id: 1, name: 'Abebe Tadesse', email: 'abebe@mail.com', role: 'CUSTOMER', status: 'Active', joined: 'Sep 20, 2026' },
    { id: 2, name: 'Sara Mengistu', email: 'sara@vendor.com', role: 'VENDOR', status: 'Active', joined: 'Sep 18, 2026' },
    { id: 3, name: 'Dawit Kebede', email: 'dawit@rider.com', role: 'RIDER', status: 'Pending', joined: 'Sep 25, 2026' },
    { id: 4, name: 'Helen Getachew', email: 'helen@mail.com', role: 'CUSTOMER', status: 'Active', joined: 'Sep 22, 2026' },
  ];

  const allVendors = [
    { name: 'Burger Joint', owner: 'Sara M.', category: 'Restaurant', products: 12, orders: 85, status: 'Active' },
    { name: 'Pizza Palace', owner: 'Yonas B.', category: 'Restaurant', products: 8, orders: 62, status: 'Active' },
    { name: 'MedExpress Pharmacy', owner: 'Meron A.', category: 'Pharmacy', products: 45, orders: 23, status: 'Pending' },
  ];

  const allRiders = [
    { name: 'Dawit K.', deliveries: 34, rating: 4.8, status: 'Online', verified: true },
    { name: 'Teshome G.', deliveries: 21, rating: 4.5, status: 'Offline', verified: true },
    { name: 'Biniam A.', deliveries: 0, rating: 0, status: 'Offline', verified: false },
  ];

  const recentOrders = [
    { id: '#ORD-1105', customer: 'Abebe T.', vendor: 'Burger Joint', total: '$18.50', status: 'PREPARING' },
    { id: '#ORD-1103', customer: 'Sara M.', vendor: 'Pizza Palace', total: '$12.00', status: 'PENDING' },
    { id: '#ORD-1100', customer: 'Dawit K.', vendor: 'Burger Joint', total: '$21.00', status: 'EN_ROUTE' },
    { id: '#ORD-9821', customer: 'Helen G.', vendor: 'Burger Joint', total: '$24.50', status: 'DELIVERED' },
  ];

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 text-red-700';
      case 'VENDOR': return 'bg-yellow-50 text-yellow-700';
      case 'RIDER': return 'bg-green-50 text-[#1E8C45]';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Active': case 'Online': return 'bg-green-50 text-[#1E8C45]';
      case 'Pending': return 'bg-yellow-50 text-yellow-700';
      case 'Offline': case 'Suspended': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const orderStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PREPARING': return 'bg-blue-100 text-blue-700';
      case 'EN_ROUTE': return 'bg-purple-100 text-purple-700';
      case 'DELIVERED': return 'bg-green-100 text-[#1E8C45]';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Admin Superpanel</h1>
              <p className="text-gray-500 font-medium">Full system control • {user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: 'All Users' },
            { key: 'vendors', label: 'Vendors' },
            { key: 'riders', label: 'Riders' },
            { key: 'orders', label: 'All Orders' },
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

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Total Users', value: platformStats.totalUsers, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { icon: Store, label: 'Vendors', value: platformStats.totalVendors, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { icon: Bike, label: 'Riders', value: platformStats.totalRiders, color: 'bg-green-50 text-[#1E8C45] border-green-200' },
                { icon: ShoppingBag, label: 'Total Orders', value: platformStats.totalOrders, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { icon: TrendingUp, label: "Today's Revenue", value: platformStats.todayRevenue, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { icon: AlertTriangle, label: 'Pending Verify', value: platformStats.pendingVerifications, color: 'bg-red-50 text-red-700 border-red-200' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border ${stat.color}`}>
                  <stat.icon className="w-6 h-6 mb-2 opacity-70" />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 text-lg mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { text: 'New rider Biniam A. registered, awaiting verification', time: '5 min ago', type: 'warning' },
                  { text: 'Order #ORD-1105 placed by Abebe T. at Burger Joint', time: '10 min ago', type: 'info' },
                  { text: 'Vendor MedExpress Pharmacy applied for activation', time: '1 hour ago', type: 'warning' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${activity.type === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{u.joined}</td>
                      <td className="p-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors ml-1">
                          <Ban className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {allVendors.map((v, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-[#F5B820]">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{v.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Owner: {v.owner} • {v.category} • {v.products} products • {v.orders} orders</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(v.status)}`}>
                    {v.status}
                  </span>
                  {v.status === 'Pending' && (
                    <button className="px-3 py-1.5 bg-[#1E8C45] text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Riders */}
        {activeTab === 'riders' && (
          <div className="space-y-4">
            {allRiders.map((r, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${r.status === 'Online' ? 'bg-green-50 text-[#1E8C45]' : 'bg-gray-100 text-gray-400'}`}>
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{r.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.deliveries} deliveries • {r.rating > 0 ? `★ ${r.rating}` : 'No ratings yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(r.status)}`}>
                    {r.status}
                  </span>
                  {!r.verified && (
                    <button className="px-3 py-1.5 bg-[#F5B820] text-gray-900 text-xs font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                      Verify
                    </button>
                  )}
                  <span className={`text-xs font-bold ${r.verified ? 'text-[#1E8C45]' : 'text-red-500'}`}>
                    {r.verified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{o.id}</td>
                      <td className="p-4 text-sm text-gray-700">{o.customer}</td>
                      <td className="p-4 text-sm text-gray-700">{o.vendor}</td>
                      <td className="p-4 font-bold text-gray-900">{o.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${orderStatusColor(o.status)}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
