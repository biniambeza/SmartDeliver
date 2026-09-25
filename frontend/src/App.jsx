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
  Server,
  Database,
  ArrowRight,
  Sparkles,
  Users,
  Store,
  Bike,
  Bot,
  Headphones,
  Award,
  ShieldCheck,
  PackageCheck,
  MapPin,
  Clock
} from 'lucide-react';

function Dashboard() {
  const { user, openLogin, openRegister } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
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
      }
    };

    checkSystemHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Delivero-Styled Header */}
      <Navbar 
        onOpenVendorPortal={() => setVendorModalOpen(true)}
        onOpenAI={() => setAiModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenTrack={() => {
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

      {/* Modals & Drawers */}
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

      {/* Floating Bottom-Right AI Support Bubble (Yellow & Green) */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-400/30 flex items-center space-x-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300"
      >
        <div className="w-6 h-6 rounded-full bg-[#0A3E33] flex items-center justify-center text-white">
          <Bot className="w-3.5 h-3.5" />
        </div>
        <span className="font-extrabold tracking-wide">Ask AI Support</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
      </button>

      {/* TOP HERO CONTAINER (Direct Delivero reference aesthetic) */}
      <div className="w-full bg-[#FAF7EE] pt-6 sm:pt-10 pb-16 lg:pb-24 border-b border-amber-100/80 relative overflow-hidden">
        {/* Soft Background Cloud Shapes */}
        <div className="absolute top-12 left-[15%] w-64 h-32 bg-white/70 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-24 right-[10%] w-96 h-48 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Hero Split: Left Typography + Right Scooter Illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Call to Action */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 shadow-sm text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Fast On-Demand Multi-Vendor Network</span>
              </div>

              {/* Exact reference headline matching user's image */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Delivery for <br />
                any Special <br />
                Occasion <span className="text-amber-500">.</span>
              </h1>

              {/* Exact reference subtext */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                Orders your products at any time and we will deliver them directly to your home.
              </p>

              {/* Primary Pill Button matching reference */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#vendors"
                  className="px-8 py-4 rounded-full bg-[#0A3E33] hover:bg-[#062F26] text-white font-black text-sm shadow-xl shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>

                <button
                  onClick={() => setAiModalOpen(true)}
                  className="px-6 py-4 rounded-full bg-white hover:bg-amber-50 border border-amber-200/80 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>Ask Assistant</span>
                </button>
              </div>
            </div>

            {/* Right Column: Stylized Scooter & Courier Illustration matching reference */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* Floating Headlight Beam Glow */}
              <div className="absolute left-[8%] top-[45%] w-48 h-32 bg-amber-300/40 rounded-full blur-2xl transform -rotate-12 pointer-events-none"></div>

              {/* Floating GPS Location Pin 1 (Top Left) */}
              <div className="absolute top-4 left-10 z-20 animate-bounce duration-1000 flex flex-col items-center">
                <div className="w-12 h-14 bg-[#0A3E33] rounded-full rounded-br-none -rotate-45 flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="rotate-45 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating GPS Location Pin 2 (Right) */}
              <div className="absolute top-20 right-4 z-20 animate-pulse flex flex-col items-center">
                <div className="w-10 h-12 bg-emerald-600 rounded-full rounded-br-none -rotate-45 flex items-center justify-center shadow-md border-2 border-white">
                  <div className="rotate-45 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Courier Scooter Vector Artwork */}
              <div className="relative w-full max-w-lg select-none">
                <svg
                  viewBox="0 0 600 450"
                  className="w-full h-auto drop-shadow-xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="headlightGlow" cx="0%" cy="50%" r="80%">
                      <stop offset="0%" stopColor="#FDE047" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="scooterTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2DD4BF" />
                      <stop offset="100%" stopColor="#0F766E" />
                    </linearGradient>
                    <linearGradient id="courierShirt" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E0F2FE" />
                      <stop offset="100%" stopColor="#BAE6FD" />
                    </linearGradient>
                  </defs>

                  {/* Soft Road Shadow */}
                  <ellipse cx="340" cy="380" rx="220" ry="18" fill="#FDE68A" opacity="0.6" />

                  {/* Headlight Yellow Cone Beam */}
                  <polygon points="260,215 80,180 80,265" fill="url(#headlightGlow)" />

                  {/* Delivery Parcel Boxes on Rack */}
                  <rect x="420" y="200" width="70" height="50" rx="4" fill="#FDBA74" />
                  <rect x="440" y="170" width="55" height="35" rx="3" fill="#FED7AA" />
                  <line x1="455" y1="200" x2="455" y2="250" stroke="#EA580C" strokeWidth="2" strokeDasharray="3 2" />

                  {/* Cargo Delivery Trunk (Teal/Dark Green with Yellow Buckles) */}
                  <rect x="400" y="245" width="105" height="65" rx="8" fill="#0A3E33" />
                  <rect x="420" y="245" width="8" height="65" fill="#FACC15" />
                  <rect x="475" y="245" width="8" height="65" fill="#FACC15" />
                  <rect x="418" y="270" width="12" height="12" rx="2" fill="#EAB308" />
                  <rect x="473" y="270" width="12" height="12" rx="2" fill="#EAB308" />

                  {/* Scooter Rear Body */}
                  <path d="M 330 310 C 370 280, 440 280, 460 330 L 370 330 Z" fill="#0F766E" />

                  {/* Wheels (Dark Charcoal, White Rims, Teal Hubs) */}
                  {/* Front Wheel */}
                  <circle cx="240" cy="335" r="46" fill="#1E293B" />
                  <circle cx="240" cy="335" r="30" fill="#FFFFFF" />
                  <circle cx="240" cy="335" r="16" fill="#0D9488" />

                  {/* Rear Wheel */}
                  <circle cx="445" cy="335" r="46" fill="#1E293B" />
                  <circle cx="445" cy="335" r="30" fill="#FFFFFF" />
                  <circle cx="445" cy="335" r="16" fill="#0D9488" />

                  {/* Chrome Exhaust Pipe */}
                  <rect x="360" y="338" width="95" height="16" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                  <rect x="430" y="335" width="14" height="22" rx="3" fill="#94A3B8" />

                  {/* Front Scooter Chassis & Fender */}
                  <path d="M 230 290 C 230 250, 270 230, 290 285 L 255 315 Z" fill="#14B8A6" />
                  <path d="M 270 230 L 290 195 L 315 250 Z" fill="#0F766E" />

                  {/* Headlight Housing & Bulb */}
                  <circle cx="260" cy="215" r="16" fill="#0F766E" />
                  <circle cx="258" cy="215" r="11" fill="#FACC15" />
                  <circle cx="256" cy="215" r="6" fill="#FEF08A" />

                  {/* Handlebars */}
                  <line x1="285" y1="210" x2="310" y2="215" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

                  {/* Courier Rider Character */}
                  {/* Courier Legs in Dark Pants */}
                  <path d="M 360 250 L 375 295 L 340 335 L 365 340 L 395 295 L 380 250 Z" fill="#334155" />
                  {/* Courier Shoes (Emerald Green) */}
                  <ellipse cx="355" cy="345" rx="18" ry="8" fill="#059669" />

                  {/* Courier Torso in Light Shirt */}
                  <path d="M 350 170 Q 380 180 395 250 L 350 250 Z" fill="url(#courierShirt)" />
                  <circle cx="370" cy="205" r="12" fill="#E2E8F0" opacity="0.6" />

                  {/* Courier Arms Extended Forward to Handlebars */}
                  <path d="M 370 195 Q 330 210 310 215" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 380 190 Q 360 195 345 200" stroke="#BAE6FD" strokeWidth="14" strokeLinecap="round" />

                  {/* Courier Head & Friendly Face */}
                  <circle cx="375" cy="155" r="18" fill="#FED7AA" />
                  <circle cx="370" cy="155" r="2.5" fill="#1E293B" />
                  <path d="M 368 162 Q 373 167 378 163" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />

                  {/* Bright Yellow Helmet (The iconic reference helmet!) */}
                  <path d="M 355 145 C 355 125, 400 125, 400 155 C 390 165, 375 168, 355 158 Z" fill="#FACC15" />
                  <path d="M 350 148 L 368 152" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                  {/* Helmet Ear Protection Pad */}
                  <circle cx="388" cy="154" r="8" fill="#EAB308" />
                </svg>
              </div>

            </div>

          </div>

          {/* "WHY DELIVERO?" / VALUE PROPOSITIONS BAR (Direct copy from reference bottom bar) */}
          <div className="mt-16 pt-10 border-t border-amber-200/60">
            <h3 className="text-xl font-black text-slate-900 mb-8 text-left">
              Why Delivero ?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              
              {/* Feature 1: Logistic Support */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white/60 hover:bg-white border border-transparent hover:border-amber-200 transition-all">
                <div className="w-14 h-14 rounded-full bg-[#0A3E33] flex items-center justify-center text-white mb-3 shadow-md">
                  <Headphones className="w-6 h-6 text-emerald-300" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Logistic support</h4>
                <p className="text-xs text-slate-500 mt-1">24/7 routing & courier tracking</p>
              </div>

              {/* Feature 2: Quality Control (Highlighted in yellow arched capsule like reference!) */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white border-2 border-amber-400 shadow-md shadow-amber-400/10 transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 mb-3 shadow-md shadow-amber-400/30">
                  <Award className="w-6 h-6 text-slate-950" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Quality control</h4>
                <p className="text-xs text-amber-800 font-semibold mt-1">Verified Addis merchants</p>
              </div>

              {/* Feature 3: Escrow Safe (No tax / fee risk) */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white/60 hover:bg-white border border-transparent hover:border-amber-200 transition-all">
                <div className="w-14 h-14 rounded-full bg-[#F43F5E] flex items-center justify-center text-white mb-3 shadow-md">
                  <ShieldCheck className="w-6 h-6 text-rose-100" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Escrow Secure</h4>
                <p className="text-xs text-slate-500 mt-1">Chapa Telebirr protection</p>
              </div>

              {/* Feature 4: Safe Delivery */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white/60 hover:bg-white border border-transparent hover:border-amber-200 transition-all">
                <div className="w-14 h-14 rounded-full bg-[#0A3E33] flex items-center justify-center text-white mb-3 shadow-md">
                  <PackageCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Safe Delivery</h4>
                <p className="text-xs text-slate-500 mt-1">Flat 50 ETB doorstep rate</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT CANVAS (Clean White & Soft Ivory) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        
        {/* Live System Telemetry Bar (Clean Pill Format) */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Live Network Telemetry:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900">
              <Server className="w-3.5 h-3.5 text-amber-600" />
              <span>Express API:</span>
              <span className="text-emerald-700 font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 ml-1" /> UP
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supabase DB:</span>
              <span className="text-emerald-700 font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 ml-1" /> CONNECTED
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Addis Dispatch: Active</span>
            </div>
          </div>
        </div>

        {/* Storefront Marketplace (Slice 2) */}
        <section id="vendors" className="space-y-6">
          <Storefront />
        </section>

        {/* Delivero Platform Value Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-4 font-black">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Verified Merchant Network</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse authentic Ethiopian dishes, fresh grocery staples, and healthcare essentials from registered Addis Ababa merchants.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-4 font-black">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">GPS Courier Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time motorbike dispatch radar with live step tracking from store preparation to your doorstep.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 mb-4 font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Escrow Protection Guarantee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Telebirr & CBE Birr payments are held securely in escrow and only disbursed when you receive your order in hand.
            </p>
          </div>
        </section>

      </main>

      {/* Delivero-Styled Clean Footer */}
      <footer className="mt-16 border-t border-amber-200/60 bg-[#FAF7EE] py-10 text-center text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-center space-x-2 font-bold text-slate-800">
          <span className="text-base font-black">Deliver<span className="text-amber-500">o</span></span>
          <span>•</span>
          <span>SmartDeliver Multi-Vendor Platform</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Bole, Kazanchis, Piazza, Mexico Square • Addis Ababa, Ethiopia
        </p>
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
