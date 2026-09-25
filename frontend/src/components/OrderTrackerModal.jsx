import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bike, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Navigation, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Sent to merchant' },
  { key: 'PAID', label: 'Payment Confirmed', desc: 'Secured in Escrow' },
  { key: 'ASSIGNED', label: 'Courier Assigned', desc: 'Rider en route to store' },
  { key: 'PICKED_UP', label: 'Picked Up', desc: 'Courier on the way to you' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Escrow released' },
];

export default function OrderTrackerModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Simulated GPS Coordinates for Addis Ababa delivery route
  const [riderCoords, setRiderCoords] = useState({ lat: 9.0016, lng: 38.7839 });
  const [etaMinutes, setEtaMinutes] = useState(22);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.order);
      setDelivery(res.data.order.delivery || null);
    } catch (err) {
      console.error('Error fetching order tracking info:', err);
      setError(err.response?.data?.error || 'Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Dispatch Simulator Actions
  const handleSimulateClaim = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/deliveries/claim/${order.id}`);
      setDelivery(res.data.delivery);
      setEtaMinutes(18);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateStatus = async (nextStatus) => {
    if (!delivery?.id) return;
    try {
      setActionLoading(true);
      const res = await api.patch(`/deliveries/${delivery.id}/status`, {
        status: nextStatus,
      });
      setDelivery(res.data.delivery);
      if (nextStatus === 'PICKED_UP') {
        setEtaMinutes(10);
        setRiderCoords({ lat: 9.0125, lng: 38.7750 });
      } else if (nextStatus === 'DELIVERED') {
        setEtaMinutes(0);
        setRiderCoords({ lat: 9.0200, lng: 38.7650 });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!orderId) return null;

  const currentStep = delivery
    ? delivery.status
    : order?.status === 'PAID'
    ? 'PAID'
    : 'PENDING';

  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStep);
  const activeIndex = stepIndex >= 0 ? stepIndex : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8E1] border border-[#F5B820]/30 flex items-center justify-center text-[#F5B820]">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">Live Courier Tracking</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E8C45] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E8C45]"></span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Order #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#F5B820] animate-spin mb-3" />
              <p className="text-xs font-semibold">Connecting to GPS dispatch radar...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Status Stepper */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-[#F5B820] text-white shadow-md shadow-[#F5B820]/25'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          } ${isCurrent ? 'ring-2 ring-[#1E8C45] ring-offset-2 ring-offset-white' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-gray-500 mt-0.5 hidden sm:block">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Interactive Map Visualizer */}
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#F5B820]/20 bg-[#FFF8E1] flex items-center justify-center shadow-inner">
                {/* Stylized Map Grid Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#F5B820_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>

                {/* Simulated Road Lines */}
                <svg className="absolute inset-0 w-full h-full text-[#F5B820]/40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 180 Q 200 120 350 140 T 550 80" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 120 40 L 220 220" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 320 20 L 380 240" fill="none" stroke="currentColor" strokeWidth="4" />
                  {/* Courier Route Line */}
                  <path d="M 180 140 L 380 90" fill="none" stroke="#1E8C45" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                </svg>

                {/* Merchant Location Pin */}
                <div className="absolute left-[30%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-white border border-[#F5B820]/30 text-[9px] font-bold text-gray-800 mb-1 shadow-sm">
                    {order.vendor?.name || 'Store'}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#F5B820]/30 border-2 border-[#F5B820] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#F5B820]"></div>
                  </div>
                </div>

                {/* Destination Location Pin */}
                <div className="absolute left-[70%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-white border border-[#1E8C45]/20 text-[9px] font-bold text-gray-800 mb-1 shadow-sm">
                    Destination
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#E8F5E9] border-2 border-[#1E8C45] flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-[#1E8C45]" />
                  </div>
                </div>

                {/* Real-time Courier Moving Pin */}
                <div className="absolute left-[52%] top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700">
                  <div className="px-2.5 py-0.5 rounded-full bg-[#F5B820] text-white text-[10px] font-black shadow-md shadow-[#F5B820]/40 flex items-center space-x-1 mb-1 animate-bounce">
                    <Bike className="w-3 h-3 text-white" />
                    <span>SmartDeliver Courier</span>
                  </div>
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E8C45] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#1E8C45] border-2 border-white"></span>
                  </span>
                </div>

                {/* Map Floating HUD Overlay */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl px-3 py-1.5 text-xs flex items-center space-x-2 shadow-xs">
                  <Navigation className="w-3.5 h-3.5 text-[#1E8C45] animate-spin" />
                  <span className="text-gray-800 font-semibold">GPS Active: Addis Ababa</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl px-3 py-1.5 text-xs flex items-center space-x-2 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-[#F5B820]" />
                  <span className="text-gray-900 font-bold">ETA: ~{etaMinutes} mins</span>
                </div>
              </div>

              {/* Courier & Delivery Info Card */}
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] border border-[#F5B820]/20 flex items-center justify-center text-[#F5B820] font-bold text-base">
                    🛵
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {delivery?.rider?.name || 'Dawit Haile (SmartRider #402)'}
                    </h4>
                    <p className="text-xs text-gray-500">TVS Apache 160 • Plate ET-38491</p>
                    <span className="inline-flex items-center text-[10px] text-[#1E8C45] font-semibold mt-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1 text-[#1E8C45]" /> Verified SmartDeliver Rider
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <a
                    href="tel:+251911002233"
                    className="px-4 py-2 rounded-xl bg-[#1E8C45] hover:bg-[#166B35] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>Call Courier</span>
                  </a>
                </div>
              </div>

              {/* Simulation Dispatch Controls */}
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
                  Interactive Courier Dispatch Simulation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {!delivery ? (
                    <button
                      onClick={handleSimulateClaim}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#F5B820] hover:bg-[#E5A910] text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? 'Assigning...' : '1. Assign Nearest Courier'}
                    </button>
                  ) : delivery.status === 'ASSIGNED' ? (
                    <button
                      onClick={() => handleSimulateStatus('PICKED_UP')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#1E8C45] hover:bg-[#166B35] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating...' : '2. Courier Picks Up at Store'}
                    </button>
                  ) : delivery.status === 'PICKED_UP' ? (
                    <button
                      onClick={() => handleSimulateStatus('DELIVERED')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#1E8C45] text-white hover:bg-[#166B35] text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#1E8C45]/20 disabled:opacity-50"
                    >
                      {actionLoading ? 'Delivering...' : '3. Mark Delivered & Release Escrow'}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#1E8C45] flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#1E8C45]" /> Order Completed & Escrow Released
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
