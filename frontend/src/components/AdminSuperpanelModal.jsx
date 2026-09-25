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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'audit'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#FDFBF7] border border-amber-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[700px] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Platform Superpanel</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-Vendor Oversight & Compliance Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#FAF7EE] border-b border-amber-100 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            Mission Control
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-xs font-semibold">Aggregating platform metrics and audit logs...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MISSION CONTROL */}
              {activeTab === 'overview' && metrics && (
                <div className="space-y-6">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Gross Platform Sales</span>
                      <span className="text-xl font-black text-emerald-700 mt-1 block">
                        ETB {metrics.totalGrossRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Escrow In Transit</span>
                      <span className="text-xl font-black text-amber-600 mt-1 block">
                        ETB {metrics.totalEscrowHeld.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Total Orders</span>
                      <span className="text-xl font-black text-slate-900 mt-1 block">
                        {metrics.totalOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Active Couriers</span>
                      <span className="text-xl font-black text-[#0A3E33] mt-1 block">
                        {metrics.activeDeliveriesCount}
                      </span>
                    </div>
                  </div>

                  {/* Role Distribution Grid */}
                  <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      User Ecosystem Distribution
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#FAF7EE] border border-amber-100/80 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">Customers</p>
                          <p className="text-lg font-bold text-slate-900">{metrics.roleBreakdown.CUSTOMER}</p>
                        </div>
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF7EE] border border-amber-100/80 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">Merchants</p>
                          <p className="text-lg font-bold text-slate-900">{metrics.roleBreakdown.VENDOR}</p>
                        </div>
                        <Store className="w-5 h-5 text-emerald-700" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF7EE] border border-amber-100/80 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">Couriers</p>
                          <p className="text-lg font-bold text-slate-900">{metrics.roleBreakdown.RIDER}</p>
                        </div>
                        <Bike className="w-5 h-5 text-amber-600" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF7EE] border border-amber-100/80 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-500">Admins</p>
                          <p className="text-lg font-bold text-slate-900">{metrics.roleBreakdown.ADMIN}</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
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
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      />
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs">
                      {['ALL', 'CUSTOMER', 'VENDOR', 'RIDER', 'ADMIN'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            roleFilter === r
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-950'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="rounded-2xl border border-amber-100 bg-white shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7EE] border-b border-amber-100 text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5 font-bold">User</th>
                          <th className="p-3.5 font-bold">Role</th>
                          <th className="p-3.5 font-bold">Status</th>
                          <th className="p-3.5 font-bold">Activity</th>
                          <th className="p-3.5 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.role === 'ADMIN'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : u.role === 'VENDOR'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : u.role === 'RIDER'
                                    ? 'bg-[#0A3E33]/10 text-[#0A3E33] border-[#0A3E33]/30'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {u.isActive ? (
                                <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] text-rose-600 font-bold">
                                  <XCircle className="w-3 h-3 mr-1 text-rose-500" /> Suspended
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-600">
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
                                    ? 'bg-rose-50 hover:bg-rose-500 text-rose-700 hover:text-white border border-rose-200'
                                    : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200'
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
                  <span className="text-xs text-slate-500 block mb-2">
                    Immutable security and administrative transaction log:
                  </span>
                  <div className="space-y-2.5">
                    {auditLogs.authLogs.concat(auditLogs.adminLogs).slice(0, 15).map((log, i) => (
                      <div
                        key={log.id || i}
                        className="p-3.5 rounded-xl bg-white border border-amber-100 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7EE] border border-amber-200/80 flex items-center justify-center text-amber-700">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {log.event || log.action}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Target: {log.email || log.targetResource || 'System'} • {log.reason || 'User action'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
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
