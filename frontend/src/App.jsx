import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Storefront from './components/Storefront';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';
import ChapaPaymentModal from './components/ChapaPaymentModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import VendorDashboardModal from './components/VendorDashboardModal';
import AIAssistantModal from './components/AIAssistantModal';
import AdminSuperpanelModal from './components/AdminSuperpanelModal';
import api from './lib/api';
import {
  CheckCircle2,
  XCircle,
  Server,
  Database,
  ShieldAlert,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Users,
  Store,
  Bike,
  Bot
} from 'lucide-react';

function Dashboard() {
  const { user, openLogin, openRegister, logout } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const [serverRes, dbRes] = await Promise.all([
          api.get('/health'),
          api.get('/health/db'),
        ]);
        setBackendHealth(serverRes.data);
        setDbHealth(dbRes.data);
      } catch (err) {
        console.error('System health check error:', err);
      } finally {
        setLoadingHealth(false);
      }
    };

    checkSystemHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar 
        onOpenVendorPortal={() => setVendorModalOpen(true)}
        onOpenAI={() => setAiModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenTrack={() => {
          // Track the last order or ask
          if (lastPlacedOrder?.id) {
            setTrackedOrderId(lastPlacedOrder.id);
          } else {
            api.get('/orders/my-orders').then(res => {
              if (res.data.orders?.length > 0) {
                setTrackedOrderId(res.data.orders[0].id);
              } else {
                alert('No active orders found. Place an order from any store to start tracking live!');
              }
            }).catch(() => {
              alert('Please sign in to track your deliveries.');
              openLogin();
            });
          }
        }} 
      />
      <AuthModal />
      <CartDrawer onOrderSuccess={(order) => setLastPlacedOrder(order)} />
      {lastPlacedOrder && (
        <OrderSuccessModal
          order={lastPlacedOrder}
          onClose={() => setLastPlacedOrder(null)}
          onOpenPayment={(order) => {
            setLastPlacedOrder(null);
            setActivePaymentOrder(order);
          }}
        />
      )}
      {activePaymentOrder && (
        <ChapaPaymentModal
          order={activePaymentOrder}
          onClose={() => setActivePaymentOrder(null)}
          onPaymentSuccess={() => {
            const paidId = activePaymentOrder.id;
            setActivePaymentOrder(null);
            setTrackedOrderId(paidId);
          }}
        />
      )}
      {trackedOrderId && (
        <OrderTrackerModal
          orderId={trackedOrderId}
          onClose={() => setTrackedOrderId(null)}
        />
      )}
      <VendorDashboardModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
      />
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
      <AdminSuperpanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Floating Bottom-Right AI Support Bubble */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/25 flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-300/30"
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">Ask AI Support</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
        </span>
      </button>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* System Health Status Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live System Telemetry:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Express API:</span>
              {backendHealth?.status === 'healthy' ? (
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 ml-1" /> UP
                </span>
              ) : (
                <span className="text-amber-400">CONNECTING...</span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase DB:</span>
              {dbHealth?.status === 'healthy' ? (
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 ml-1" /> CONNECTED
                </span>
              ) : (
                <span className="text-amber-400">CHECKING...</span>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Slice 1 Active: Authentication & User Profiles</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-6">
              Fast, reliable delivery <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                for multi-vendor commerce.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              SmartDeliver powers local restaurants, pharmacies, and grocery merchants with real-time dispatch, Chapa payment processing, and verified courier tracking.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl">
                  <span className="text-sm font-semibold text-emerald-300">
                    Signed in as {user.name} ({user.role})
                  </span>
                </div>
              ) : (
                <>
                  <button
                    onClick={openRegister}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={openLogin}
                    className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Storefront & Vendor Marketplace (Slice 2) */}
        <section className="mb-16">
          <Storefront />
        </section>

        {/* Slice Architecture Capabilities */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Role-Based Access */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vendors & Storefronts</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Vendors get an automatically created merchant storefront on registration to manage product catalogs and incoming orders.
            </p>
            <span className="text-xs font-semibold text-purple-400">Auto-Storefront Generation Active</span>
          </div>

          {/* Card 2: Courier Logistics */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rider Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Courier accounts claim deliveries with atomic row-level locks and broadcast real-time GPS coordinates via WebSockets.
            </p>
            <span className="text-xs font-semibold text-amber-400">Socket.io Rooms Ready</span>
          </div>

          {/* Card 3: Security & Auditability */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dual Audit Logs</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Every login, registration, and failed password attempt is securely recorded into an immutable audit table in PostgreSQL.
            </p>
            <span className="text-xs font-semibold text-emerald-400">Bcrypt + Supabase Ledger</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        SmartDeliver • Built as a production-style modular monolith on Supabase, Upstash, and Express.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Dashboard />
      </CartProvider>
    </AuthProvider>
  );
}
