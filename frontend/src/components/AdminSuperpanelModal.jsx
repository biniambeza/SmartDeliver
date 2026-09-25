import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  DollarSign,
  Package,
  Bike,
  Store,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Lock,
  Loader2
} from 'lucide-react';
import api from '../lib/api';

export default function AdminSuperpanelModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ authLogs: [], adminLogs: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
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
      setUsers(usersRes.data.users);
      setAuditLogs({
        authLogs: auditRes.data.authLogs,
        adminLogs: auditRes.data.adminLogs,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[700px] max-h-[92vh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1E8C45] flex items-center justify-center text-white shadow-md shadow-[#1E8C45]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-900">Platform Superpanel</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#E5A910] border border-[#F5B820]/30 text-[10px] font-black">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-Vendor Oversight & Compliance Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-50 hover:bg-[#FFF8E1] text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#F5B820] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-white'
            }`}
          >
            Mission Control
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#F5B820] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-white'
            }`}
          >
            User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#F5B820] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950 hover:bg-white'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#F5B820] animate-spin mb-3" />
              <p className="text-xs font-semibold">Aggregating platform metrics and audit logs...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MISSION CONTROL */}
              {activeTab === 'overview' && metrics && (
                <div className="space-y-6">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Gross Platform Sales</span>
                      <span className="text-xl font-black text-[#1E8C45] mt-1 block">
                        ETB {metrics.totalGrossRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Escrow In Transit</span>
                      <span className="text-xl font-black text-[#F5B820] mt-1 block">
                        ETB {metrics.totalEscrowHeld.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Total Orders</span>
                      <span className="text-xl font-black text-gray-900 mt-1 block">
                        {metrics.totalOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Active Couriers</span>
                      <span className="text-xl font-black text-[#1E8C45] mt-1 block">
                        {metrics.activeDeliveriesCount}
                      </span>
                    </div>
                  </div>

                  {/* Role Distribution Grid */}
                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User Ecosystem Distribution
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-500">Customers</p>
                          <p className="text-lg font-bold text-gray-900">{metrics.roleBreakdown.CUSTOMER}</p>
                        </div>
                        <Users className="w-5 h-5 text-[#F5B820]" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-500">Merchants</p>
                          <p className="text-lg font-bold text-gray-900">{metrics.roleBreakdown.VENDOR}</p>
                        </div>
                        <Store className="w-5 h-5 text-[#1E8C45]" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-500">Couriers</p>
                          <p className="text-lg font-bold text-gray-900">{metrics.roleBreakdown.RIDER}</p>
                        </div>
                        <Bike className="w-5 h-5 text-[#F5B820]" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-500">Admins</p>
                          <p className="text-lg font-bold text-gray-900">{metrics.roleBreakdown.ADMIN}</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-[#1E8C45]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USERS MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F5B820] focus:ring-2 focus:ring-[#F5B820]/20"
                      />
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs">
                      {['ALL', 'CUSTOMER', 'VENDOR', 'RIDER', 'ADMIN'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            roleFilter === r
                              ? 'bg-[#F5B820] text-white shadow-xs'
                              : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-950'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5 font-bold">User</th>
                          <th className="p-3.5 font-bold">Role</th>
                          <th className="p-3.5 font-bold">Status</th>
                          <th className="p-3.5 font-bold">Activity</th>
                          <th className="p-3.5 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#FFF8E1]/30 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-[11px] text-gray-400">{u.email}</p>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.role === 'ADMIN'
                                    ? 'bg-[#FFF8E1] text-[#E5A910] border-[#F5B820]/30'
                                    : u.role === 'VENDOR'
                                    ? 'bg-[#E8F5E9] text-[#1E8C45] border-[#1E8C45]/20'
                                    : u.role === 'RIDER'
                                    ? 'bg-[#1E8C45]/10 text-[#1E8C45] border-[#1E8C45]/30'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {u.isActive ? (
                                <span className="inline-flex items-center text-[10px] text-[#1E8C45] font-bold">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-[#1E8C45]" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] text-red-600 font-bold">
                                  <XCircle className="w-3 h-3 mr-1 text-red-500" /> Suspended
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-gray-600">
                              {u.role === 'CUSTOMER' && `${u._count.customerOrders} orders`}
                              {u.role === 'VENDOR' && (u.vendor?.name || 'Store Owner')}
                              {u.role === 'RIDER' && `${u._count.assignedDeliveries} deliveries`}
                              {u.role === 'ADMIN' && 'Platform Admin'}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                disabled={actionLoading}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  u.isActive
                                    ? 'bg-red-50 hover:bg-red-500 text-red-700 hover:text-white border border-red-200'
                                    : 'bg-[#E8F5E9] hover:bg-[#1E8C45] text-[#1E8C45] hover:text-white border border-[#1E8C45]/20'
                                }`}
                              >
                                {u.isActive ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <span className="text-xs text-gray-500 block mb-2">
                    Immutable security and administrative transaction log:
                  </span>
                  <div className="space-y-2.5">
                    {auditLogs.authLogs.concat(auditLogs.adminLogs).slice(0, 15).map((log, i) => (
                      <div
                        key={log.id || i}
                        className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] border border-[#F5B820]/20 flex items-center justify-center text-[#F5B820]">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {log.event || log.action}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Target: {log.email || log.targetResource || 'System'} • {log.reason || 'User action'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
