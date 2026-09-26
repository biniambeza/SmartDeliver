import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, MapPin, Clock, ChevronRight, Star, Heart, Settings, User, 
  CreditCard, Bell, Shield, Tag, HelpCircle, Gift, RefreshCw, FileText, 
  AlertTriangle, CheckCircle, MessageSquare, Phone, Plus, Trash2, Edit3, 
  Share2, Check, Lock, DollarSign, ExternalLink, X, ArrowRight
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // --- Profile & Account State ---
  const [profile, setProfile] = useState({
    name: user?.name || 'Customer User',
    email: user?.email || 'customer@smartdeliver.com',
    phone: user?.phone || '+251 91 234 5678',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);

  // --- Addresses State ---
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: 'Bole Medhanealem, House #402, Addis Ababa', isDefault: true, lat: 9.0084, lng: 38.7844 },
    { id: 2, label: 'Office', address: 'Kazanchis ICT Center, Floor 5, Addis Ababa', isDefault: false, lat: 9.0200, lng: 38.7650 },
  ]);
  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '' });
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  // --- Payment Methods State ---
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Card', provider: 'Visa ending in 4242', expiry: '12/26', isDefault: true },
    { id: 2, type: 'Wallet', provider: 'SmartWallet ($45.50 balance)', isDefault: false },
    { id: 3, type: 'UPI', provider: 'customer@telebirr', isDefault: false },
  ]);

  // --- Notification Preferences ---
  const [notifications, setNotifications] = useState({
    orderStatus: true,
    promoOffers: true,
    paymentAlerts: true,
    driverUpdates: true,
    smsAlerts: false,
  });

  // --- Orders State & Post-Order Actions ---
  const [activeOrders, setActiveOrders] = useState([
    { 
      id: '#ORD-1102', 
      vendor: 'Burger Joint Bole', 
      status: 'PREPARING', 
      items: [
        { name: 'Double Cheese Burger', qty: 2, price: '$16.00' },
        { name: 'Crispy Fries', qty: 1, price: '$4.50' },
        { name: 'Chocolate Shake', qty: 1, price: '$4.00' }
      ], 
      total: '$24.50', 
      subtotal: '$20.00',
      deliveryFee: '$2.50',
      tax: '$2.00',
      eta: '20-25 min',
      driver: { name: 'Abebe Bikila', phone: '+251 91 111 2222', vehicle: 'Motorbike (ET-3912)' },
      cancelWindowExpiry: Date.now() + 180000 // 3 minutes remaining
    },
  ]);

  const [pastOrders, setPastOrders] = useState([
    { 
      id: '#ORD-9821', 
      vendor: 'Burger Joint Bole', 
      date: 'Today, 2:30 PM', 
      items: [{ name: 'BBQ Bacon Burger', qty: 1 }, { name: 'Onion Rings', qty: 1 }], 
      total: '$18.40', 
      status: 'DELIVERED',
      rated: false,
      invoiceUrl: '#'
    },
    { 
      id: '#ORD-9810', 
      vendor: 'Pizza Palace Kazanchis', 
      date: 'Yesterday, 7:15 PM', 
      items: [{ name: 'Large Pepperoni Pizza', qty: 1 }], 
      total: '$14.50', 
      status: 'DELIVERED',
      rated: true,
      invoiceUrl: '#'
    },
  ]);

  // Modals state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ vendorRating: 5, driverRating: 5, comment: '' });
  const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState(null);
  const [complaintForm, setComplaintForm] = useState({ reason: 'Missing item', details: '' });
  const [activeComplaints, setActiveComplaints] = useState([]);

  // Support & Engagement
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TCK-801', topic: 'Late Delivery Inquiry', status: 'RESOLVED', date: 'Sep 22, 2026' }
  ]);
  const [newTicketTopic, setNewTicketTopic] = useState('');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(350);

  // Offers
  const offers = [
    { code: 'SMART20', desc: 'Get 20% OFF on all orders above $20', discount: '20% OFF' },
    { code: 'FREEDEL', desc: 'Free Delivery on your next 3 orders', discount: 'Free Delivery' },
  ];

  // System Notifications Feed
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, title: 'Order #ORD-1102 is being prepared', time: '10 mins ago', type: 'order' },
    { id: 2, title: 'You earned +25 SmartPoints on your last order!', time: '2 hours ago', type: 'reward' },
    { id: 3, title: 'Weekend Special: Use promo code SMART20 for 20% OFF', time: '1 day ago', type: 'promo' },
  ]);

  const statusColor = (status) => {
    switch (status) {
      case 'PREPARING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PICKED_UP': 
      case 'EN_ROUTE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) {
      setPasswordMsg({ type: 'error', text: 'Please fill out all password fields.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.address.trim()) return;
    setAddresses([
      ...addresses,
      { id: Date.now(), label: newAddr.label, address: newAddr.address, isDefault: false }
    ]);
    setNewAddr({ label: 'Home', address: '' });
    setIsAddingAddr(false);
  };

  const handleCancelActiveOrder = (orderId) => {
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
  };

  const handleReorder = (order) => {
    alert(`Reordered all items from ${order.vendor}! Items added to your cart.`);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (selectedOrderForReview) {
      setPastOrders(prev => prev.map(o => o.id === selectedOrderForReview.id ? { ...o, rated: true } : o));
      setSelectedOrderForReview(null);
      alert('Thank you for rating your vendor and delivery driver!');
    }
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    if (selectedOrderForComplaint) {
      const ticket = {
        id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
        topic: `Refund/Complaint for ${selectedOrderForComplaint.id}: ${complaintForm.reason}`,
        status: 'PENDING_REVIEW',
        date: 'Just now'
      };
      setActiveComplaints(prev => [...prev, ticket]);
      setSelectedOrderForComplaint(null);
      alert('Refund/Complaint ticket submitted! Our support team will review within 15 minutes.');
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicketTopic.trim() || !newTicketMsg.trim()) return;
    setSupportTickets([
      ...supportTickets,
      { id: `TCK-${Math.floor(100 + Math.random() * 900)}`, topic: newTicketTopic, status: 'OPEN', date: 'Just now' }
    ]);
    setNewTicketTopic('');
    setNewTicketMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Profile Summary */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-900/40">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F5B820] to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg text-3xl font-black border-2 border-amber-300">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified Customer
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium mt-1">{profile.email} • {profile.phone}</p>
              
              {/* Rewards Points Badge */}
              <div className="mt-3 flex items-center space-x-3">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{loyaltyPoints} SmartPoints Rewards</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="px-6 py-3 bg-[#1E8C45] hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-900/40 flex items-center space-x-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Restaurants</span>
            </a>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
          {[
            { key: 'orders', label: 'My Orders', icon: ShoppingBag },
            { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { key: 'profile', label: 'Account & Security', icon: User },
            { key: 'payments', label: 'Payment Methods', icon: CreditCard },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'support', label: 'Rewards & Support', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-3 px-4 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? 'bg-slate-900 text-amber-400 shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: MY ORDERS & LIVE TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Active Orders Section */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Active Deliveries ({activeOrders.filter(o => o.status !== 'CANCELLED').length})</span>
              </h2>

              {activeOrders.filter(o => o.status !== 'CANCELLED').length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-bold">No active orders right now.</p>
                  <p className="text-xs text-slate-400 mt-1">Place an order from your favorite vendor to track it live!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeOrders.filter(o => o.status !== 'CANCELLED').map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl shadow-sm border-2 border-amber-400/40 p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="font-black text-lg text-slate-900">{order.vendor}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{order.id} • ETA: <strong className="text-emerald-600">{order.eta}</strong></p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">{order.total}</p>
                          <p className="text-xs text-slate-400">Card Payment • Verified</p>
                        </div>
                      </div>

                      {/* Live Tracking Status Timeline */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Live Delivery Progress</p>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                          <div className="space-y-2 text-emerald-600">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">✓</div>
                            <span>Order Confirmed</span>
                          </div>
                          <div className="space-y-2 text-amber-600">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm animate-pulse">🍳</div>
                            <span>Preparing Food</span>
                          </div>
                          <div className="space-y-2 text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">🛵</div>
                            <span>Driver Picked Up</span>
                          </div>
                          <div className="space-y-2 text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">🏡</div>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Driver & Contact Info */}
                      {order.driver && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                              🏍️
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase text-emerald-700 tracking-wider">Assigned Driver</p>
                              <p className="font-extrabold text-slate-900 text-sm">{order.driver.name}</p>
                              <p className="text-xs text-slate-500">{order.driver.vehicle}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a 
                              href={`tel:${order.driver.phone}`} 
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Driver</span>
                            </a>
                            <button 
                              onClick={() => alert(`Starting masked support chat with ${order.driver.name}`)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center space-x-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>In-App Chat</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Items breakdown & Cancel button */}
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Ordered Items</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm font-semibold text-slate-700">
                            <span>{item.qty}x {item.name}</span>
                            <span>{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleCancelActiveOrder(order.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors"
                        >
                          Cancel Order (Free Window)
                        </button>
                        <button 
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Orders & History */}
            <div className="pt-6">
              <h2 className="text-xl font-black text-slate-900 mb-4">Past Order History</h2>
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-black">
                          🛍️
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-slate-900 text-base">{order.vendor}</h3>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-medium">{order.id} • {order.date}</p>
                          <p className="text-xs text-slate-600 mt-2 font-medium">
                            {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end justify-between space-y-3">
                        <span className="text-lg font-black text-slate-900">{order.total}</span>
                        
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleReorder(order)}
                            className="px-3.5 py-1.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                          
                          <button 
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {!order.rated ? (
                            <button 
                              onClick={() => setSelectedOrderForReview(order)}
                              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>Rate Order</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold px-2 py-1 bg-slate-50 rounded-lg">Rated ★★★★★</span>
                          )}

                          <button 
                            onClick={() => setSelectedOrderForComplaint(order)}
                            className="px-3 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors"
                          >
                            Report Issue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Saved Addresses</h2>
                <p className="text-xs text-slate-500">Manage your delivery locations for faster checkout.</p>
              </div>
              <button 
                onClick={() => setIsAddingAddr(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Form Modal / Inline */}
            {isAddingAddr && (
              <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-3xl border-2 border-emerald-500/30 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">New Address Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Label</label>
                    <select 
                      value={newAddr.label} 
                      onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Gym">Gym</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Street Address & Landmark</label>
                    <input 
                      type="text"
                      placeholder="e.g. Bole Atlas, House #104 near Edna Mall"
                      value={newAddr.address}
                      onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingAddr(false)}
                    className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="font-black text-slate-900 text-base">{addr.label}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">{addr.address}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <button 
                      onClick={() => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })))}
                      className="text-xs font-extrabold text-emerald-600 hover:underline"
                    >
                      Set as Default
                    </button>
                    <button 
                      onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                      className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT & SECURITY */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Edit Profile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500">Update your account name, email address and contact phone.</p>
                </div>
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                    <input 
                      type="text"
                      disabled={!isEditingProfile}
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                    <input 
                      type="email"
                      disabled={!isEditingProfile}
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                    <input 
                      type="text"
                      disabled={!isEditingProfile}
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-75"
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Security & Password</h2>
                <p className="text-xs text-slate-500">Ensure your account uses a strong, unique password.</p>
              </div>

              {passwordMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${passwordMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">New Password</label>
                  <input 
                    type="password"
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Account Deactivation / Danger Zone */}
            <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-rose-900 text-lg">Danger Zone</h3>
                <p className="text-xs text-rose-700 mt-1">Permanently deactivate your SmartDeliver customer account and erase saved data.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
                    logout();
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT METHODS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Saved Payment Options</h2>
                <p className="text-xs text-slate-500">Manage your cards, digital wallet balances, and saved UPI details.</p>
              </div>
              <button 
                onClick={() => alert('Modal to link new Credit Card or Mobile Wallet.')}
                className="px-4 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-400 font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    {pm.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{pm.provider}</h3>
                    <p className="text-xs text-slate-500 font-medium">{pm.type} • {pm.expiry || 'Instant Pay'}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <button 
                      onClick={() => setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === pm.id })))}
                      className="text-xs font-extrabold text-emerald-600 hover:underline"
                    >
                      Use as Default
                    </button>
                    <button 
                      onClick={() => setPaymentMethods(prev => prev.filter(p => p.id !== pm.id))}
                      className="text-xs font-bold text-slate-400 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS & PREFERENCES */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500">Configure how and when SmartDeliver notifies you.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                {[
                  { key: 'orderStatus', label: 'Order Status Alerts', desc: 'Real-time push notifications when food is cooking or picked up' },
                  { key: 'driverUpdates', label: 'Delivery Driver GPS Alerts', desc: 'Alerts when driver is approaching your doorstep' },
                  { key: 'promoOffers', label: 'Promotions & Discounts', desc: 'Exclusive weekly coupons and promo code announcements' },
                  { key: 'smsAlerts', label: 'SMS Backup Notifications', desc: 'Send order updates via SMS if offline' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* System Notification Feed */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Recent Alerts & Messages</h2>
              <div className="space-y-3">
                {systemAlerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REWARDS, PROMOS & SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* Loyalty & Rewards Banner */}
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full">SmartRewards Club</span>
                <h2 className="text-2xl font-black mt-2">You have {loyaltyPoints} Points</h2>
                <p className="text-xs font-bold text-slate-800 mt-1">Redeem 100 points for $1.00 instant checkout credit!</p>
              </div>
              <button 
                onClick={() => alert('Redeemed 100 points for $1 off your next order!')}
                className="px-6 py-3 bg-slate-900 text-amber-300 hover:bg-slate-800 font-black rounded-xl text-xs transition-colors shadow-md"
              >
                Redeem 100 Points ($1.00 Credit)
              </button>
            </div>

            {/* Active Offers & Coupons */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Active Promo Coupons</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {offers.map((offer, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-dashed border-emerald-400/60 flex items-center justify-between">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
                        {offer.code}
                      </span>
                      <p className="text-xs text-slate-600 font-medium mt-2">{offer.desc}</p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(offer.code)}
                      className="text-xs font-extrabold text-emerald-600 hover:underline"
                    >
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Help & Customer Support Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Need Help? Create Support Ticket</h2>
                <p className="text-xs text-slate-500">Submit a support request directly to our 24/7 Operations Desk.</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Issue Subject</label>
                  <input 
                    type="text"
                    placeholder="e.g. Payment deducted twice or wrong item received"
                    value={newTicketTopic}
                    onChange={e => setNewTicketTopic(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Details</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe what happened..."
                    value={newTicketMsg}
                    onChange={e => setNewTicketMsg(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  Submit Ticket
                </button>
              </form>

              {/* Tickets Listing */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm mb-3">Your Support Tickets</h3>
                <div className="space-y-2">
                  {supportTickets.map(tck => (
                    <div key={tck.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                      <div>
                        <span className="font-black text-slate-900">{tck.id}: </span>
                        <span className="font-medium text-slate-700">{tck.topic}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {tck.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- RECEIPT INVOICE MODAL --- */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Official Order Receipt</h3>
                <p className="text-xs text-slate-400">{selectedOrderForInvoice.id}</p>
              </div>
              <button onClick={() => setSelectedOrderForInvoice(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Vendor</span>
                <span className="font-bold text-slate-900">{selectedOrderForInvoice.vendor}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer</span>
                <span className="font-bold text-slate-900">{profile.name}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                {selectedOrderForInvoice.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-800 font-medium">
                    <span>{i.qty}x {i.name}</span>
                    <span>{i.price || '$10.00'}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Amount Paid</span>
                <span className="text-emerald-600">{selectedOrderForInvoice.total}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                window.print();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Print / Download Invoice PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* --- RATE & REVIEW MODAL --- */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Rate Your Experience</h3>
                <p className="text-xs text-slate-400">{selectedOrderForReview.vendor}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrderForReview(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Food / Vendor Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, vendorRating: star })}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewForm.vendorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Delivery Driver Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, driverRating: star })}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewForm.driverRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Comment</label>
                <textarea 
                  rows={3}
                  placeholder="How was the taste, packaging, and delivery speed?"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-colors"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* --- REPORT ISSUE / REFUND MODAL --- */}
      {selectedOrderForComplaint && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmitComplaint} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Report Issue / Request Refund</h3>
                <p className="text-xs text-slate-400">{selectedOrderForComplaint.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrderForComplaint(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Complaint</label>
                <select 
                  value={complaintForm.reason}
                  onChange={e => setComplaintForm({ ...complaintForm, reason: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Missing item">Missing item from order</option>
                  <option value="Damaged package">Damaged or spilled food</option>
                  <option value="Wrong items delivered">Wrong items delivered</option>
                  <option value="Severe delay">Extremely late delivery</option>
                  <option value="Other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explain the issue</label>
                <textarea 
                  rows={3}
                  placeholder="Provide any details to help our support desk process your refund quickly..."
                  value={complaintForm.details}
                  onChange={e => setComplaintForm({ ...complaintForm, details: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition-colors"
            >
              Submit Refund Request
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
