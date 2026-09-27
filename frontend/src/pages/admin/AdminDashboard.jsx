import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, Users, Store, Bike, ShoppingBag, TrendingUp, 
  AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, 
  Lock, Unlock, Activity, History, DollarSign, Loader2
} from 'lucide-react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ authLogs: [], adminLogs: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, usersRes, auditRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);

      setMetrics(overviewRes.data.metrics);
      setRecentOrders(overviewRes.data.recentOrders || []);
      setUsers(usersRes.data.users || []);
      setAuditLogs({
        authLogs: auditRes.data.authLogs || [],
        adminLogs: auditRes.data.adminLogs || [],
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/users/${userId}/toggle-status`);
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 text-red-700 border-red-200';
      case 'VENDOR': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'RIDER': return 'bg-green-50 text-[#1E8C45] border-green-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const statusBadge = (isActive) => {
    return isActive
      ? 'bg-green-50 text-[#1E8C45] border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200';
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const vendorsList = users.filter((u) => u.role === 'VENDOR');
  const ridersList = users.filter((u) => u.role === 'RIDER');

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
              <p className="text-gray-500 font-medium">Real-time platform telemetry • {user?.email}</p>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: `Users (${users.length})` },
            { key: 'vendors', label: `Vendors (${vendorsList.length})` },
            { key: 'riders', label: `Riders (${ridersList.length})` },
            { key: 'audit', label: 'Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#F5B820] text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-10 h-10 animate-spin text-[#1E8C45] mb-3" />
            <p className="text-sm font-bold text-gray-500">Loading system metrics...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <Users className="w-6 h-6 mb-2 text-blue-600 opacity-80" />
                    <p className="text-2xl font-black text-gray-900">{metrics?.totalUsers || 0}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Total Users</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <ShoppingBag className="w-6 h-6 mb-2 text-purple-600 opacity-80" />
                    <p className="text-2xl font-black text-gray-900">{metrics?.totalOrders || 0}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Total Orders</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <TrendingUp className="w-6 h-6 mb-2 text-[#1E8C45] opacity-80" />
                    <p className="text-2xl font-black text-[#1E8C45]">
                      ETB {(metrics?.totalGrossRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Gross GMV</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <DollarSign className="w-6 h-6 mb-2 text-[#F5B820] opacity-80" />
                    <p className="text-2xl font-black text-gray-900">
                      ETB {(metrics?.totalEscrowHeld || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">In Escrow</p>
                  </div>
                </div>

                {/* Role Breakdown Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-4">User Roles Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase">Customers</p>
                      <p className="text-2xl font-black text-blue-900 mt-1">{metrics?.roleBreakdown?.CUSTOMER || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                      <p className="text-xs font-bold text-yellow-700 uppercase">Vendors</p>
                      <p className="text-2xl font-black text-yellow-900 mt-1">{metrics?.roleBreakdown?.VENDOR || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-xs font-bold text-[#1E8C45] uppercase">Riders</p>
                      <p className="text-2xl font-black text-green-900 mt-1">{metrics?.roleBreakdown?.RIDER || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-xs font-bold text-red-600 uppercase">Admins</p>
                      <p className="text-2xl font-black text-red-900 mt-1">{metrics?.roleBreakdown?.ADMIN || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Telemetry */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-4">Latest Platform Orders</h3>
                  {recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders placed yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{o.id}</p>
                            <p className="text-xs text-gray-500">
                              {o.customer?.name} → {o.vendor?.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-black text-sm text-gray-900">ETB {Number(o.totalAmount).toLocaleString()}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white border border-gray-200 text-gray-700">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E8C45]"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['ALL', 'CUSTOMER', 'VENDOR', 'RIDER', 'ADMIN'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          roleFilter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
                          <th className="p-4">User</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Joined</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleBadge(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge(u.isActive)}`}>
                                {u.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                disabled={actionLoading || u.id === user?.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ml-auto ${
                                  u.isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-[#1E8C45] hover:bg-green-100'
                                }`}
                              >
                                {u.isActive ? <Lock className="w-3.5 h-3.5 mr-1" /> : <Unlock className="w-3.5 h-3.5 mr-1" />}
                                <span>{u.isActive ? 'Suspend' : 'Activate'}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div className="space-y-4">
                {vendorsList.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-[#F5B820]">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{v.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{v.email} • {v.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(v.isActive)}`}>
                      {v.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Riders Tab */}
            {activeTab === 'riders' && (
              <div className="space-y-4">
                {ridersList.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#1E8C45]">
                        <Bike className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{r.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{r.email} • {r.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(r.isActive)}`}>
                      {r.isActive ? 'Active Courier' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center">
                    <History className="w-5 h-5 mr-2 text-gray-600" />
                    Security & Authentication Audit Trail
                  </h3>
                  <div className="space-y-3">
                    {auditLogs.authLogs.length === 0 ? (
                      <p className="text-sm text-gray-500">No authentication events recorded yet.</p>
                    ) : (
                      auditLogs.authLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                          <div>
                            <span className="font-bold text-gray-900 mr-2">{log.event}</span>
                            <span className="text-gray-500">{log.email}</span>
                          </div>
                          <span className="text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
