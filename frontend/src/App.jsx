import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
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
  Clock,
  Truck
} from 'lucide-react';

function Dashboard() {
  const { user, openLogin, openRegister } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans selection:bg-[#F5B820] selection:text-gray-950">
      {/* Navbar */}
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

      {/* Floating AI Support Bubble */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-[#F5B820] hover:bg-[#E5A910] text-gray-950 font-black text-xs shadow-xl shadow-[#F5B820]/30 flex items-center space-x-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#E5A910] animate-glow"
      >
        <div className="w-6 h-6 rounded-full bg-[#1E8C45] flex items-center justify-center text-white">
          <Bot className="w-3.5 h-3.5" />
        </div>
        <span className="font-extrabold tracking-wide">Ask AI Support</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E8C45] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1E8C45]"></span>
        </span>
      </button>

      {/* HERO SECTION */}
      <div className="w-full bg-white pt-6 sm:pt-10 pb-16 lg:pb-24 border-b border-gray-100 relative overflow-hidden">
        {/* Soft Background Glow */}
        <div className="absolute top-12 left-[15%] w-64 h-32 bg-[#FFF8E1]/80 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-24 right-[10%] w-96 h-48 bg-[#E8F5E9]/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTA */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#1E8C45]/20 shadow-sm text-xs font-bold text-[#1E8C45] animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-[#F5B820] animate-pulse"></span>
                <span>Fast On-Demand Multi-Vendor Network</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight leading-[1.08] animate-fade-in-up stagger-1">
                {t('hero.title')} <span className="text-[#F5B820]">.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg animate-fade-in-up stagger-2">
                {t('hero.subtitle')}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 animate-fade-in-up stagger-3">
                <a
                  href="#vendors"
                  className="px-8 py-4 rounded-full bg-[#1E8C45] hover:bg-[#166B35] text-white font-black text-sm shadow-xl shadow-[#1E8C45]/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>{t('btn.order')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>

                <button
                  onClick={() => setAiModalOpen(true)}
                  className="px-6 py-4 rounded-full bg-white hover:bg-[#FFF8E1] border border-[#F5B820]/40 text-gray-800 font-bold text-sm shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#1E8C45]" />
                  <span>Ask Assistant</span>
                </button>
              </div>
            </div>

            {/* Right Column: Delivery Truck SVG matching logo */}
            <div className="lg:col-span-6 relative flex items-center justify-center animate-fade-in-up stagger-2">
              
              {/* Floating GPS Location Pin 1 */}
              <div className="absolute top-4 left-10 z-20 animate-float flex flex-col items-center">
                <div className="w-12 h-14 bg-[#1E8C45] rounded-full rounded-br-none -rotate-45 flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="rotate-45 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating GPS Location Pin 2 */}
              <div className="absolute top-20 right-4 z-20 animate-pulse flex flex-col items-center">
                <div className="w-10 h-12 bg-[#F5B820] rounded-full rounded-br-none -rotate-45 flex items-center justify-center shadow-md border-2 border-white">
                  <div className="rotate-45 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Delivery Truck SVG - Matching Logo Style */}
              <div className="relative w-full max-w-lg select-none">
                <svg
                  viewBox="0 0 600 450"
                  className="w-full h-auto drop-shadow-xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="headlightGlow" cx="0%" cy="50%" r="80%">
                      <stop offset="0%" stopColor="#F5B820" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FBD968" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="truckBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5B820" />
                      <stop offset="100%" stopColor="#E5A910" />
                    </linearGradient>
                  </defs>

                  {/* Soft Road Shadow */}
                  <ellipse cx="340" cy="380" rx="220" ry="18" fill="#FBD968" opacity="0.5" />

                  {/* Headlight Yellow Cone Beam */}
                  <polygon points="260,215 80,180 80,265" fill="url(#headlightGlow)" />

                  {/* Delivery Parcel Boxes on Rack */}
                  <rect x="420" y="200" width="70" height="50" rx="4" fill="#FBD968" />
                  <rect x="440" y="170" width="55" height="35" rx="3" fill="#FFF8E1" />
                  <line x1="455" y1="200" x2="455" y2="250" stroke="#E5A910" strokeWidth="2" strokeDasharray="3 2" />

                  {/* Cargo Delivery Trunk (Green with Yellow Buckles) */}
                  <rect x="400" y="245" width="105" height="65" rx="8" fill="#1E8C45" />
                  <rect x="420" y="245" width="8" height="65" fill="#F5B820" />
                  <rect x="475" y="245" width="8" height="65" fill="#F5B820" />
                  <rect x="418" y="270" width="12" height="12" rx="2" fill="#E5A910" />
                  <rect x="473" y="270" width="12" height="12" rx="2" fill="#E5A910" />

                  {/* Scooter Rear Body */}
                  <path d="M 330 310 C 370 280, 440 280, 460 330 L 370 330 Z" fill="#166B35" />

                  {/* Wheels - Green Hubs */}
                  <circle cx="240" cy="335" r="46" fill="#1E293B" />
                  <circle cx="240" cy="335" r="30" fill="#FFFFFF" />
                  <circle cx="240" cy="335" r="16" fill="#1E8C45" />

                  <circle cx="445" cy="335" r="46" fill="#1E293B" />
                  <circle cx="445" cy="335" r="30" fill="#FFFFFF" />
                  <circle cx="445" cy="335" r="16" fill="#1E8C45" />

                  {/* Chrome Exhaust */}
                  <rect x="360" y="338" width="95" height="16" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                  <rect x="430" y="335" width="14" height="22" rx="3" fill="#94A3B8" />

                  {/* Front Chassis */}
                  <path d="M 230 290 C 230 250, 270 230, 290 285 L 255 315 Z" fill="#1E8C45" />
                  <path d="M 270 230 L 290 195 L 315 250 Z" fill="#166B35" />

                  {/* Headlight */}
                  <circle cx="260" cy="215" r="16" fill="#166B35" />
                  <circle cx="258" cy="215" r="11" fill="#F5B820" />
                  <circle cx="256" cy="215" r="6" fill="#FBD968" />

                  {/* Handlebars */}
                  <line x1="285" y1="210" x2="310" y2="215" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

                  {/* Courier Legs */}
                  <path d="M 360 250 L 375 295 L 340 335 L 365 340 L 395 295 L 380 250 Z" fill="#334155" />
                  <ellipse cx="355" cy="345" rx="18" ry="8" fill="#1E8C45" />

                  {/* Courier Torso */}
                  <path d="M 350 170 Q 380 180 395 250 L 350 250 Z" fill="#E8F5E9" />
                  <circle cx="370" cy="205" r="12" fill="#1E8C45" opacity="0.3" />

                  {/* Courier Arms */}
                  <path d="M 370 195 Q 330 210 310 215" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 380 190 Q 360 195 345 200" stroke="#E8F5E9" strokeWidth="14" strokeLinecap="round" />

                  {/* Head & Face */}
                  <circle cx="375" cy="155" r="18" fill="#FED7AA" />
                  <circle cx="370" cy="155" r="2.5" fill="#1E293B" />
                  <path d="M 368 162 Q 373 167 378 163" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />

                  {/* Yellow Helmet */}
                  <path d="M 355 145 C 355 125, 400 125, 400 155 C 390 165, 375 168, 355 158 Z" fill="#F5B820" />
                  <path d="M 350 148 L 368 152" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="388" cy="154" r="8" fill="#E5A910" />

                  {/* Speed Lines (Green, matching logo) */}
                  <line x1="100" y1="200" x2="160" y2="200" stroke="#1E8C45" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
                  <line x1="80" y1="220" x2="150" y2="220" stroke="#1E8C45" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                  <line x1="100" y1="240" x2="150" y2="240" stroke="#1E8C45" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
                </svg>
              </div>

            </div>

          </div>

          {/* WHY SMARTDELIVER? Feature Bar */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 text-left animate-fade-in-up">
              Why SmartDeliver ?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-[#1E8C45]/20 transition-all hover:-translate-y-1 duration-300 animate-fade-in-up stagger-1">
                <div className="w-14 h-14 rounded-full bg-[#1E8C45] flex items-center justify-center text-white mb-3 shadow-md">
                  <Headphones className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-gray-900">Logistic Support</h4>
                <p className="text-xs text-gray-500 mt-1">24/7 routing & courier tracking</p>
              </div>

              {/* Feature 2 - Highlighted */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white border-2 border-[#F5B820] shadow-md shadow-[#F5B820]/10 transition-all transform hover:-translate-y-1 duration-300 animate-fade-in-up stagger-2">
                <div className="w-14 h-14 rounded-full bg-[#F5B820] flex items-center justify-center text-gray-950 mb-3 shadow-md shadow-[#F5B820]/30">
                  <Award className="w-6 h-6 text-gray-950" />
                </div>
                <h4 className="text-sm font-black text-gray-900">Quality Control</h4>
                <p className="text-xs text-[#1E8C45] font-semibold mt-1">Verified Addis merchants</p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-[#F5B820]/30 transition-all hover:-translate-y-1 duration-300 animate-fade-in-up stagger-3">
                <div className="w-14 h-14 rounded-full bg-[#1E8C45] flex items-center justify-center text-white mb-3 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-gray-900">Escrow Secure</h4>
                <p className="text-xs text-gray-500 mt-1">Chapa Telebirr protection</p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-[#1E8C45]/20 transition-all hover:-translate-y-1 duration-300 animate-fade-in-up stagger-4">
                <div className="w-14 h-14 rounded-full bg-[#F5B820] flex items-center justify-center text-gray-950 mb-3 shadow-md shadow-[#F5B820]/30">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-gray-900">Safe Delivery</h4>
                <p className="text-xs text-gray-500 mt-1">Flat 50 ETB doorstep rate</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        
        {/* Live System Telemetry Bar */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E8C45] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1E8C45]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Live Network Telemetry:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FFF8E1] border border-[#F5B820]/30 text-gray-900">
              <Server className="w-3.5 h-3.5 text-[#F5B820]" />
              <span>Express API:</span>
              <span className="text-[#1E8C45] font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 ml-1" /> UP
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#1E8C45]/20 text-gray-900">
              <Database className="w-3.5 h-3.5 text-[#1E8C45]" />
              <span>Supabase DB:</span>
              <span className="text-[#1E8C45] font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 ml-1" /> CONNECTED
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>Addis Dispatch: Active</span>
            </div>
          </div>
        </div>

        {/* Storefront Marketplace */}
        <section id="vendors" className="space-y-6">
          <Storefront />
        </section>

        {/* Platform Value Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border border-[#F5B820]/30 flex items-center justify-center text-[#F5B820] mb-4 font-black">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">Verified Merchant Network</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Browse authentic Ethiopian dishes, fresh grocery staples, and healthcare essentials from registered Addis Ababa merchants.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#1E8C45]/20 flex items-center justify-center text-[#1E8C45] mb-4 font-black">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">GPS Courier Dispatch</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Real-time motorbike dispatch radar with live step tracking from store preparation to your doorstep.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#F5B820] flex items-center justify-center text-gray-950 mb-4 font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">Escrow Protection Guarantee</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Telebirr & CBE Birr payments are held securely in escrow and only disbursed when you receive your order in hand.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-[#1E8C45] py-10 text-center text-xs text-white space-y-2">
        <div className="flex items-center justify-center space-x-2 font-bold">
          <span className="text-base font-black"><span className="text-[#F5B820]">Smart</span>Deliver</span>
          <span>•</span>
          <span className="text-white/80">Multi-Vendor Delivery Platform</span>
        </div>
        <p className="text-[11px] text-white/60">
          Bole, Kazanchis, Piazza, Mexico Square • Addis Ababa, Ethiopia
        </p>
      </footer>
    </div>
  );
}

import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Dashboard />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
