import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, PackageCheck, Bike, Clock, CheckCircle2, 
  ChevronRight, Navigation, Power, RefreshCw, Loader2, 
  DollarSign, Store, User, Phone, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

export default function RiderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'active' | 'history'
  const [isOnline, setIsOnline] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [historyDeliveries, setHistoryDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      const [availRes, activeRes, histRes] = await Promise.all([
        api.get('/deliveries/available').catch(() => ({ data: { orders: [] } })),
        api.get('/deliveries/active').catch(() => ({ data: { delivery: null } })),
        api.get('/deliveries/history').catch(() => ({ data: { deliveries: [] } })),
      ]);

      setAvailableOrders(availRes.data.orders || []);
      setActiveDelivery(activeRes.data.delivery || null);
      setHistoryDeliveries(histRes.data.deliveries || []);

      if (activeRes.data.delivery) {
        setActiveTab('active');
      }
    } catch (err) {
      console.error('Failed to load rider dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
  }, []);

  const handleClaimOrder = async (orderId) => {
    try {
      setActionLoading(true);
      await api.post(`/deliveries/claim/${orderId}`);
      alert('Order claimed successfully! Follow instructions to pick up.');
      await fetchRiderData();
      setActiveTab('active');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/deliveries/${deliveryId}/status`, { status });
      if (status === 'DELIVERED') {
        alert('🎉 Delivery completed! Escrow funds released.');
      }
      await fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastGPS = async () => {
    if (!activeDelivery) return;
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.post(`/deliveries/${activeDelivery.id}/location`, {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            alert('📡 GPS location broadcasted to customer radar!');
          } catch (err) {
            console.error('GPS broadcast error:', err);
          } finally {
            setLocating(false);
          }
        },
        (error) => {
          console.warn('Geolocation error, using Addis Bole fallback:', error.message);
          // Fallback to slight simulated movement in Addis Ababa
          api.post(`/deliveries/${activeDelivery.id}/location`, {
            lat: 9.0025 + (Math.random() - 0.5) * 0.005,
            lng: 38.7845 + (Math.random() - 0.5) * 0.005,
          }).then(() => {
            alert('📡 Addis Ababa GPS coordinates sent!');
          }).finally(() => setLocating(false));
        }
      );
    } catch (err) {
      setLocating(false);
    }
  };

  const totalEarnings = historyDeliveries.length * 50; // Standard 50 ETB delivery fee per dropoff

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Status Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${
              isOnline ? 'bg-[#1E8C45]' : 'bg-gray-400'
            }`}>
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Rider Dispatch</h1>
              <p className="text-gray-500 font-medium">Addis Ababa Courier Network • {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-sm border border-gray-100 pr-6">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`p-3 rounded-full text-white shadow-md transition-colors cursor-pointer ${
                isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1E8C45] hover:bg-green-600'
              }`}
            >
              <Power className="w-5 h-5" />
            </button>
            <span className={`font-bold text-sm ${isOnline ? 'text-[#1E8C45]' : 'text-gray-400'}`}>
              {isOnline ? 'Online (Ready to Deliver)' : 'Offline (Paused)'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <PackageCheck className="w-6 h-6 mb-2 text-[#1E8C45] opacity-80" />
            <p className="text-2xl font-black text-gray-900">{availableOrders.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Available for Pickup</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Navigation className="w-6 h-6 mb-2 text-blue-600 opacity-80" />
            <p className="text-2xl font-black text-gray-900">{activeDelivery ? 1 : 0}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Active Run</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <DollarSign className="w-6 h-6 mb-2 text-[#F5B820] opacity-80" />
            <p className="text-2xl font-black text-[#1E8C45]">ETB {totalEarnings.toLocaleString()}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Total Earned ({historyDeliveries.length} drops)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'orders', label: `Available Deliveries (${availableOrders.length})` },
            { key: 'active', label: activeDelivery ? 'Active Run (1)' : 'Active Run (None)' },
            { key: 'history', label: `Completed Drops (${historyDeliveries.length})` },
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
            <p className="text-sm font-bold text-gray-500">Checking delivery radar...</p>
          </div>
        ) : (
          <>
            {/* Available Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {!isOnline ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Power className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-700">You are currently Offline</p>
                    <p className="text-xs text-gray-500 mt-1">Toggle the power button at the top to go Online and receive delivery calls.</p>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-700">No ready deliveries in your area right now</p>
                    <p className="text-xs text-gray-500 mt-1">Orders from restaurants and stores will appear here as soon as they are prepared.</p>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="font-black text-gray-900 text-base">{order.id}</span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Store className="w-4 h-4 text-[#F5B820]" />
                            <span className="font-bold text-gray-800">{order.vendor?.name}</span>
                            <span>•</span>
                            <span>{order.vendor?.address || 'Addis Ababa'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Rider Payout</p>
                          <p className="text-lg font-black text-[#1E8C45]">ETB 50.00</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                        <p className="text-gray-500">
                          <span className="font-bold text-gray-700">Dropoff Destination:</span> {order.deliveryAddress}
                        </p>
                        {order.deliveryNotes && (
                          <p className="text-amber-700">
                            <span className="font-bold">Notes:</span> {order.deliveryNotes}
                          </p>
                        )}
                        <p className="text-gray-500">
                          <span className="font-bold text-gray-700">Items:</span> {order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ')}
                        </p>
                      </div>

                      <button
                        onClick={() => handleClaimOrder(order.id)}
                        disabled={actionLoading}
                        className="w-full py-3 bg-[#1E8C45] hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Accept Delivery Request</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Active Delivery Tab */}
            {activeTab === 'active' && (
              <div className="space-y-6">
                {!activeDelivery ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-700">No active delivery in progress</p>
                    <p className="text-xs text-gray-500 mt-1">Accept an order from the Available tab to start a run.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border-2 border-[#1E8C45]/30 p-6 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-[#1E8C45] border border-green-200">
                          {activeDelivery.status}
                        </span>
                        <h3 className="font-black text-xl text-gray-900 mt-1">
                          Order {activeDelivery.order?.id}
                        </h3>
                      </div>
                      <button
                        onClick={handleBroadcastGPS}
                        disabled={locating}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                        <span>{locating ? 'Sending GPS...' : 'Ping Live GPS'}</span>
                      </button>
                    </div>

                    {/* Step Routing */}
                    <div className="space-y-4">
                      {/* Step 1: Pickup */}
                      <div className="flex items-start space-x-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
                        <Store className="w-5 h-5 text-[#F5B820] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">1. Pickup from Store</p>
                          <p className="font-extrabold text-sm text-gray-900">{activeDelivery.order?.vendor?.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{activeDelivery.order?.vendor?.address || 'Addis Ababa'}</p>
                        </div>
                      </div>

                      {/* Step 2: Delivery */}
                      <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
                        <MapPin className="w-5 h-5 text-[#1E8C45] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">2. Deliver to Customer</p>
                          <p className="font-extrabold text-sm text-gray-900">{activeDelivery.order?.customer?.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{activeDelivery.order?.deliveryAddress}</p>
                          {activeDelivery.order?.customer?.phone && (
                            <p className="text-xs font-bold text-[#1E8C45] mt-1 flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-1" />
                              {activeDelivery.order?.customer?.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action progression */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                      {activeDelivery.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(activeDelivery.id, 'PICKED_UP')}
                          disabled={actionLoading}
                          className="flex-1 py-3 bg-[#F5B820] hover:bg-yellow-400 text-gray-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer text-center"
                        >
                          Confirm Order Picked Up from Store
                        </button>
                      )}

                      {activeDelivery.status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleUpdateStatus(activeDelivery.id, 'DELIVERED')}
                          disabled={actionLoading}
                          className="flex-1 py-3 bg-[#1E8C45] hover:bg-green-700 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer text-center"
                        >
                          Confirm Handed to Customer & Release Escrow
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {historyDeliveries.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-700">No completed deliveries yet</p>
                  </div>
                ) : (
                  historyDeliveries.map((d) => (
                    <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-900">Order {d.orderId}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {d.order?.vendor?.name} → {d.order?.customer?.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Completed on {new Date(d.deliveredAt || d.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-[#1E8C45] border border-green-200">
                          Paid 50 ETB
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
