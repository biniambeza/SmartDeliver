import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Clock,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bike,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Phone,
  MapPin,
  DollarSign,
  Loader2,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../lib/api';

export default function VendorDashboardModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'metrics'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/vendors/me/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching vendor dashboard:', err);
      setError(err.response?.data?.error || 'Failed to load merchant dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboard();
    }
  }, [isOpen]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/vendors/orders/${orderId}/status`, { status });
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      setActionLoading(true);
      await api.patch(`/vendors/products/${productId}/toggle`);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle product status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const vendor = data?.vendor;
  const stats = data?.stats;
  const orders = data?.orders || [];
  const products = data?.products || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  {vendor?.name || 'Merchant Operations Portal'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  LIVE STORE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                {vendor?.address || 'Addis Ababa Central'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Incoming Orders</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'orders' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Menu & Inventory</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'inventory' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue Telemetry</span>
            </button>
          </div>

          {stats && (
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">Total Revenue:</span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                ETB {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs font-semibold">Synchronizing merchant operations terminal...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ORDERS QUEUE */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                      <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-white">No active orders yet</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        New orders placed by customers will automatically appear in this live queue.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => {
                      const isPending = order.status === 'PENDING';
                      const isPaid = order.status === 'PAID';
                      const isPreparing = order.status === 'PREPARING';
                      const isReady = order.status === 'READY_FOR_PICKUP';
                      const isDelivered = order.status === 'DELIVERED';

                      return (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white">
                                  {order.customer?.name || 'Customer'}
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                                  isDelivered
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : isReady
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : isPreparing
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : isPaid
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {order.status}
                              </span>

                              <span className="text-xs font-extrabold text-white">
                                ETB {Number(order.totalAmount).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Ordered Items */}
                          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-amber-400">{item.quantity}x</span>
                                  <span className="text-slate-200">{item.product?.name}</span>
                                </div>
                                <span className="text-slate-400">
                                  ETB {(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Delivery Destination & Notes */}
                          <div className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>Destination: {order.deliveryAddress}</span>
                          </div>

                          {/* Vendor Action Controls */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                            {isPaid && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                disabled={actionLoading}
                                className="px-4 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                              >
                                Accept & Start Preparing
                              </button>
                            )}

                            {isPreparing && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                                disabled={actionLoading}
                                className="px-4 py-1.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20"
                              >
                                Mark Ready for Courier Pickup
                              </button>
                            )}

                            {isReady && (
                              <span className="text-xs font-bold text-blue-400 flex items-center">
                                <Bike className="w-4 h-4 mr-1.5 animate-pulse" /> Awaiting Courier Pickup
                              </span>
                            )}

                            {isDelivered && (
                              <span className="text-xs font-bold text-emerald-400 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Order Completed & Paid
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: MENU & INVENTORY MANAGEMENT */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">
                      Toggle real-time item availability for customer storefront:
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {stats?.availableProducts} / {stats?.totalProducts} Items In Stock
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          prod.isAvailable
                            ? 'bg-slate-950/60 border-slate-800'
                            : 'bg-slate-950/30 border-rose-900/30 opacity-70'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">{prod.name}</h4>
                            <p className="text-[11px] font-extrabold text-amber-400">
                              ETB {Number(prod.price).toFixed(2)}
                            </p>
                            <span className="text-[10px] text-slate-500">{prod.category}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleProduct(prod.id)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            prod.isAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {prod.isAvailable ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-rose-400" />
                              <span>Sold Out</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: REVENUE TELEMETRY */}
              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Gross Revenue</span>
                      <span className="text-lg font-black text-emerald-400 mt-1 block">
                        ETB {stats?.totalRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Total Orders</span>
                      <span className="text-lg font-black text-white mt-1 block">
                        {stats?.totalOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Active Preparing</span>
                      <span className="text-lg font-black text-amber-400 mt-1 block">
                        {stats?.activeOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Delivered Orders</span>
                      <span className="text-lg font-black text-blue-400 mt-1 block">
                        {stats?.deliveredOrders}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Settlement & Escrow Policy</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All online payments via Chapa (Telebirr, CBE Birr) are automatically held in escrow protection during preparation and courier transit. Funds are immediately unlocked and credited to your merchant ledger upon courier confirmation of delivery.
                    </p>
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
