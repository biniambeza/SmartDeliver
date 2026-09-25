import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
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
  MapPin,
  Loader2
} from 'lucide-react';
import api from '../lib/api';

export default function VendorDashboardModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border border-[#F5B820]/30 flex items-center justify-center text-[#F5B820]">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-900">
                  {vendor?.name || 'Merchant Operations Portal'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1E8C45] border border-[#1E8C45]/20 text-[10px] font-bold">
                  LIVE STORE
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                {vendor?.address || 'Addis Ababa Central'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-50 hover:bg-[#FFF8E1] text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
              title="Refresh Dashboard"
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
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#F5B820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Incoming Orders</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'orders' ? 'bg-white/30 text-white' : 'bg-[#FFF8E1] text-[#E5A910]'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#F5B820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Menu & Inventory</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'inventory' ? 'bg-white/30 text-white' : 'bg-[#FFF8E1] text-[#E5A910]'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-[#F5B820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue Telemetry</span>
            </button>
          </div>

          {stats && (
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-gray-500">Total Revenue:</span>
              <span className="font-extrabold text-[#1E8C45] bg-[#E8F5E9] px-2.5 py-0.5 rounded-lg border border-[#1E8C45]/20">
                ETB {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#F5B820] animate-spin mb-3" />
              <p className="text-xs font-semibold">Synchronizing merchant operations terminal...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ORDERS QUEUE */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 shadow-xs">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-gray-900">No active orders yet</h4>
                      <p className="text-xs text-gray-500 mt-1">
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
                          className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-[#F5B820]/30 transition-all space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-xs font-extrabold text-gray-900 bg-[#FFF8E1] px-2.5 py-1 rounded-lg border border-[#F5B820]/20">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">
                                  {order.customer?.name || 'Customer'}
                                </h4>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                                  isDelivered
                                    ? 'bg-[#E8F5E9] text-[#1E8C45] border-[#1E8C45]/20'
                                    : isReady
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : isPreparing
                                    ? 'bg-[#FFF8E1] text-[#E5A910] border-[#F5B820]/30'
                                    : isPaid
                                    ? 'bg-[#F5B820]/20 text-[#E5A910] border-[#F5B820]/40'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                {order.status}
                              </span>

                              <span className="text-xs font-extrabold text-[#1E8C45]">
                                ETB {Number(order.totalAmount).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Ordered Items */}
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-[#F5B820]">{item.quantity}x</span>
                                  <span className="text-gray-800 font-medium">{item.product?.name}</span>
                                </div>
                                <span className="text-gray-500 font-semibold">
                                  ETB {(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Delivery Destination & Notes */}
                          <div className="text-[11px] text-gray-500 flex items-start space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>Destination: {order.deliveryAddress}</span>
                          </div>

                          {/* Vendor Action Controls */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-end space-x-2">
                            {isPaid && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                disabled={actionLoading}
                                className="px-4 py-1.5 rounded-xl bg-[#F5B820] hover:bg-[#E5A910] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Accept & Start Preparing
                              </button>
                            )}

                            {isPreparing && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                                disabled={actionLoading}
                                className="px-4 py-1.5 rounded-xl bg-[#1E8C45] text-white hover:bg-[#166B35] text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Mark Ready for Courier Pickup
                              </button>
                            )}

                            {isReady && (
                              <span className="text-xs font-bold text-[#1E8C45] flex items-center">
                                <Bike className="w-4 h-4 mr-1.5 text-[#1E8C45] animate-pulse" /> Awaiting Courier Pickup
                              </span>
                            )}

                            {isDelivered && (
                              <span className="text-xs font-bold text-[#1E8C45] flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#1E8C45]" /> Order Completed & Paid
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
                    <span className="text-xs text-gray-500">
                      Toggle real-time item availability for customer storefront:
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {stats?.availableProducts} / {stats?.totalProducts} Items In Stock
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                          prod.isAvailable
                            ? 'bg-white border-gray-100'
                            : 'bg-white/60 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{prod.name}</h4>
                            <p className="text-[11px] font-extrabold text-[#1E8C45]">
                              ETB {Number(prod.price).toFixed(2)}
                            </p>
                            <span className="text-[10px] text-gray-400 font-medium">{prod.category}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleProduct(prod.id)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            prod.isAvailable
                              ? 'bg-[#E8F5E9] text-[#1E8C45] border border-[#1E8C45]/20 hover:bg-[#1E8C45]/10'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {prod.isAvailable ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-[#1E8C45]" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-gray-500" />
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
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Gross Revenue</span>
                      <span className="text-lg font-black text-[#1E8C45] mt-1 block">
                        ETB {stats?.totalRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Total Orders</span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        {stats?.totalOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Active Preparing</span>
                      <span className="text-lg font-black text-[#F5B820] mt-1 block">
                        {stats?.activeOrders}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                      <span className="text-[11px] text-gray-500 font-semibold block">Delivered Orders</span>
                      <span className="text-lg font-black text-[#1E8C45] mt-1 block">
                        {stats?.deliveredOrders}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#E8F5E9] border border-[#1E8C45]/15 space-y-3">
                    <div className="flex items-center space-x-2 text-[#1E8C45] font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-[#1E8C45]" />
                      <span>Settlement & Escrow Policy</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
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
