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
  Sparkles,
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
  // Starting at Bole Medhanialem (9.0016, 38.7839) moving towards destination
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

  // Dispatch Simulator Actions (for testing courier lifecycle live in UI)
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

  // Determine current active step index
  const currentStep = delivery
    ? delivery.status
    : order?.status === 'PAID'
    ? 'PAID'
    : 'PENDING';

  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStep);
  const activeIndex = stepIndex >= 0 ? stepIndex : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Live Courier Tracking</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Order #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs font-semibold">Connecting to GPS dispatch radar...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Status Stepper */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                          } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5 hidden sm:block">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Interactive Map Visualizer (Radar GPS View) */}
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                {/* Stylized Map Grid Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                {/* Simulated Addis Ababa Road Lines */}
                <svg className="absolute inset-0 w-full h-full text-slate-800/60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 180 Q 200 120 350 140 T 550 80" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 120 40 L 220 220" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 320 20 L 380 240" fill="none" stroke="currentColor" strokeWidth="4" />
                  {/* Courier Route Line in Emerald */}
                  <path d="M 180 140 L 380 90" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                </svg>

                {/* Merchant Location Pin */}
                <div className="absolute left-[30%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[9px] font-bold text-white mb-1 shadow-md">
                    {order.vendor?.name || 'Store'}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                </div>

                {/* Destination Location Pin */}
                <div className="absolute left-[70%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[9px] font-bold text-white mb-1 shadow-md">
                    Destination
                  </div>
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-rose-400" />
                  </div>
                </div>

                {/* Real-time Courier Moving Pin */}
                <div className="absolute left-[52%] top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700">
                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-lg shadow-emerald-500/30 flex items-center space-x-1 mb-1 animate-bounce">
                    <Bike className="w-3 h-3" />
                    <span>Courier</span>
                  </div>
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>

                {/* Map Floating HUD Overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-xs flex items-center space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-white font-semibold">GPS Active: Addis Ababa</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-xs flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-bold">ETA: ~{etaMinutes} mins</span>
                </div>
              </div>

              {/* Courier & Delivery Info Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base">
                    🏍️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {delivery?.rider?.name || 'Dawit Haile (SmartRider #402)'}
                    </h4>
                    <p className="text-xs text-slate-400">TVS Apache 160 • Plate ET-38491</p>
                    <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold mt-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified Courier
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <a
                    href="tel:+251911002233"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Courier</span>
                  </a>
                </div>
              </div>

              {/* Simulation Dispatch Controls (Demonstrating Multi-Role Lifecycle) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Interactive Courier Dispatch Simulation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {!delivery ? (
                    <button
                      onClick={handleSimulateClaim}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Assigning...' : '1. Assign Nearest Courier'}
                    </button>
                  ) : delivery.status === 'ASSIGNED' ? (
                    <button
                      onClick={() => handleSimulateStatus('PICKED_UP')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating...' : '2. Courier Picks Up at Store'}
                    </button>
                  ) : delivery.status === 'PICKED_UP' ? (
                    <button
                      onClick={() => handleSimulateStatus('DELIVERED')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading ? 'Delivering...' : '3. Mark Delivered & Release Escrow'}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Order Completed & Escrow Released
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
