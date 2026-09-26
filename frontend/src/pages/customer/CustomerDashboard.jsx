import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import CartDrawer from '../../components/CartDrawer';
import OrderSuccessModal from '../../components/OrderSuccessModal';
import ChapaPaymentModal from '../../components/ChapaPaymentModal';
import OrderTrackerModal from '../../components/OrderTrackerModal';
import VendorMenuModal from '../../components/VendorMenuModal';
import { 
  ShoppingBag, MapPin, Clock, ChevronRight, Star, Heart, Settings, User, 
  CreditCard, Bell, Shield, Tag, HelpCircle, Gift, RefreshCw, FileText, 
  AlertTriangle, CheckCircle, MessageSquare, Phone, Plus, Trash2, Edit3, 
  Share2, Check, Lock, DollarSign, ExternalLink, X, ArrowRight, Search, 
  Store, Loader2, AlertCircle, Sparkles
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { itemsCount, openCart, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'orders' | 'addresses' | 'profile' | 'payments' | 'notifications' | 'support'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Real Backend Data ---
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(250);
  const [reviews, setReviews] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [offers, setOffers] = useState([]);
  const [vendors, setVendors] = useState([]);

  // --- Browsing & Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVendorForMenu, setSelectedVendorForMenu] = useState(null);

  // --- Modals State ---
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState(null);

  // --- Forms State ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '', lat: 9.0084, lng: 38.7844, isDefault: false });
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);

  const [newPayment, setNewPayment] = useState({ type: 'Card', provider: 'Visa ending in 4242', expiry: '12/28', isDefault: false });
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const [reviewForm, setReviewForm] = useState({ vendorRating: 5, driverRating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [complaintForm, setComplaintForm] = useState({ reason: 'Missing item', details: '' });
  const [complaintLoading, setComplaintLoading] = useState(false);

  const [newTicketTopic, setNewTicketTopic] = useState('');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    orderStatus: true,
    driverUpdates: true,
    promoOffers: true,
    smsAlerts: false,
  });

  // Load all initial data from APIs
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, profileRes, offersRes, vendorsRes] = await Promise.all([
        api.get('/orders/my-orders').catch(() => ({ data: { orders: [] } })),
        api.get('/customer/profile').catch(() => ({ data: { profile: {} } })),
        api.get('/customer/offers').catch(() => ({ data: { offers: [] } })),
        api.get('/vendors').catch(() => ({ data: { vendors: [] } })),
      ]);

      setOrders(ordersRes.data.orders || []);

      const p = profileRes.data.profile || {};
      setAddresses(p.addresses || []);
      setPaymentMethods(p.paymentMethods || []);
      setLoyaltyPoints(p.loyaltyPoints !== undefined ? p.loyaltyPoints : 250);
      setReviews(p.reviews || []);
      setSupportTickets(p.tickets || []);

      if (user?.name) {
        setProfileForm({ name: user.name, phone: user.phone || '' });
      }

      setOffers(offersRes.data.offers || []);
      setVendors(vendorsRes.data.vendors || []);
    } catch (err) {
      console.error('Error loading customer dashboard data:', err);
      setError('Could not load complete customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Derived Active and Past Orders
  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.status)
  );
  const pastOrders = orders.filter(
    (o) => ['DELIVERED', 'CANCELLED'].includes(o.status)
  );

  // Status badge styling helper
  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PAID': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PICKED_UP':
      case 'EN_ROUTE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // --- Handlers ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileMsg(null);
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in both current and new passwords.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      setPasswordLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you absolutely sure you want to deactivate your account? You will be logged out immediately.')) {
      try {
        await api.post('/auth/deactivate');
        logout();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to deactivate account');
      }
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.address.trim()) return;
    try {
      setAddrLoading(true);
      const res = await api.post('/customer/addresses', newAddr);
      setAddresses((prev) => [res.data.address, ...prev]);
      setNewAddr({ label: 'Home', address: '', lat: 9.0084, lng: 38.7844, isDefault: false });
      setIsAddingAddr(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save address');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/customer/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.patch(`/customer/addresses/${id}/default`);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to set default address');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customer/payments', newPayment);
      setPaymentMethods((prev) => [res.data.paymentMethod, ...prev]);
      setIsAddingPayment(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add payment method');
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await api.delete(`/customer/payments/${id}`);
      setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove payment method');
    }
  };

  const handleSetDefaultPayment = async (id) => {
    try {
      await api.patch(`/customer/payments/${id}/default`);
      setPaymentMethods((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === id }))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to set default payment method');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully.');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot cancel this order.');
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      alert('No items found to reorder.');
      return;
    }
    const vendor = order.vendor || { id: order.vendorId, name: 'Store' };
    order.items.forEach((item) => {
      const product = item.product || {
        id: item.productId,
        name: `Item #${item.productId.slice(0, 5)}`,
        price: item.price,
      };
      addToCart(product, vendor);
    });
    openCart();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    try {
      setReviewLoading(true);
      const res = await api.post('/customer/reviews', {
        orderId: selectedOrderForReview.id,
        vendorRating: reviewForm.vendorRating,
        driverRating: reviewForm.driverRating,
        comment: reviewForm.comment,
      });
      alert(res.data.message || 'Review submitted! +25 SmartPoints earned.');
      setLoyaltyPoints((prev) => prev + 25);
      setReviews((prev) => [res.data.review, ...prev]);
      setSelectedOrderForReview(null);
      setReviewForm({ vendorRating: 5, driverRating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!selectedOrderForComplaint) return;
    try {
      setComplaintLoading(true);
      const res = await api.post('/customer/tickets', {
        orderId: selectedOrderForComplaint.id,
        topic: `Refund Request for ${selectedOrderForComplaint.id}: ${complaintForm.reason}`,
        details: complaintForm.details,
      });
      alert('Refund/Complaint ticket created! Our team will process it shortly.');
      setSupportTickets((prev) => [res.data.ticket, ...prev]);
      setSelectedOrderForComplaint(null);
      setComplaintForm({ reason: 'Missing item', details: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create refund ticket');
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!newTicketTopic.trim() || !newTicketMsg.trim()) return;
    try {
      setTicketLoading(true);
      const res = await api.post('/customer/tickets', {
        topic: newTicketTopic.trim(),
        details: newTicketMsg.trim(),
      });
      alert('Support ticket opened successfully!');
      setSupportTickets((prev) => [res.data.ticket, ...prev]);
      setNewTicketTopic('');
      setNewTicketMsg('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (loyaltyPoints < 100) {
      alert('You need at least 100 SmartPoints to redeem rewards.');
      return;
    }
    try {
      const res = await api.post('/customer/rewards/redeem', { pointsToRedeem: 100 });
      alert(`${res.data.message}\nUse promo code "${res.data.promoCode}" at checkout!`);
      setLoyaltyPoints(res.data.remainingPoints);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to redeem points');
    }
  };

  // Filter vendors based on search and category
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = 
      selectedCategory === 'ALL' || 
      (v.category && v.category.toUpperCase() === selectedCategory.toUpperCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Active Modals */}
      <CartDrawer 
        onOrderSuccess={(order) => {
          setOrders((prev) => [order, ...prev]);
          setLastPlacedOrder(order);
        }} 
      />

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
            loadDashboardData();
          }}
        />
      )}

      {trackedOrderId && (
        <OrderTrackerModal
          orderId={trackedOrderId}
          onClose={() => setTrackedOrderId(null)}
        />
      )}

      {selectedVendorForMenu && (
        <VendorMenuModal
          vendor={selectedVendorForMenu}
          onClose={() => setSelectedVendorForMenu(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Profile Welcome Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-900/30">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F5B820] to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg text-3xl font-black border-2 border-amber-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Customer'}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Customer Account
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium mt-1">
                {user?.email} {user?.phone && `• ${user.phone}`}
              </p>
              
              {/* Rewards Points Badge */}
              <div className="mt-3 flex items-center space-x-3">
                <button 
                  onClick={handleRedeemPoints}
                  className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Click to redeem 100 points for $1 discount voucher"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{loyaltyPoints} SmartPoints</span>
                  <span className="text-[10px] text-amber-200 underline ml-1">Redeem Voucher</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openCart}
              className="px-5 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl transition-all shadow-md flex items-center space-x-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({itemsCount})</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {[
            { key: 'browse', label: 'Explore Stores & Food', icon: Store },
            { key: 'orders', label: `My Orders (${activeOrders.length})`, icon: ShoppingBag },
            { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { key: 'profile', label: 'Account & Security', icon: User },
            { key: 'payments', label: 'Payment Methods', icon: CreditCard },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'support', label: 'Rewards & Support', icon: HelpCircle },
          ].map((tab) => (
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

        {/* ========================================================================= */}
        {/* TAB 1: EXPLORE VENDORS & ORDER */}
        {/* ========================================================================= */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, cafes, dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0">
                {['ALL', 'RESTAURANT', 'GROCERY', 'CAFE', 'PHARMACY'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#1E8C45] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor Cards Grid */}
            {filteredVendors.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <Store className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <h3 className="font-extrabold text-slate-800 text-lg">No stores found</h3>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different name or changing the category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendorForMenu(vendor)}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner or default store image */}
                      <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                        {vendor.bannerUrl ? (
                          <img
                            src={vendor.bannerUrl}
                            alt={vendor.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-emerald-100 flex items-center justify-center text-4xl">
                            🏬
                          </div>
                        )}
                        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                          20-30 min
                        </span>
                        <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-xs font-black px-3 py-1 rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>4.8 (120+)</span>
                        </span>
                      </div>

                      {/* Store Details */}
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-black text-slate-900 text-lg group-hover:text-[#1E8C45] transition-colors">
                              {vendor.name}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                              {vendor.category || 'Restaurant'} • {vendor.address || 'Addis Ababa'}
                            </p>
                          </div>
                        </div>
                        {vendor.description && (
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                            {vendor.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-0">
                      <button className="w-full py-3 bg-slate-900 group-hover:bg-[#1E8C45] text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm">
                        <span>View Menu & Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY ORDERS & REAL-TIME TRACKING */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Active Deliveries */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Active Deliveries ({activeOrders.length})</span>
              </h2>

              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-bold">No active deliveries right now.</p>
                  <p className="text-xs text-slate-400 mt-1">Browse vendors and place an order to track it live!</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 px-6 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Browse Stores
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl shadow-sm border-2 border-amber-400/40 p-6 sm:p-8 space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="font-black text-lg text-slate-900">
                              {order.vendor?.name || 'Store'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusColor(order.status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            Order {order.id} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 font-semibold flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">{order.payment?.status === 'SUCCESS' ? 'Paid via Chapa' : 'Payment: Escrow Pending'}</p>
                        </div>
                      </div>

                      {/* Items List */}
                      {order.items && order.items.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ordered Items</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{item.quantity}x {item.product?.name || `Item #${idx + 1}`}</span>
                              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery Driver Info if assigned */}
                      {order.delivery?.rider && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                              🏍️
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase text-emerald-700 tracking-wider">Assigned Driver</p>
                              <p className="font-extrabold text-slate-900 text-sm">{order.delivery.rider.name}</p>
                              <p className="text-xs text-slate-500">{order.delivery.rider.phone || 'Phone verified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {order.delivery.rider.phone && (
                              <a
                                href={`tel:${order.delivery.rider.phone}`}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Driver</span>
                              </a>
                            )}
                            <button
                              onClick={() => setTrackedOrderId(order.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center space-x-1.5"
                            >
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>Live Map GPS</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setTrackedOrderId(order.id)}
                            className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Track Live</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </div>

                        {['PENDING', 'PAID'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Orders History */}
            <div className="pt-6">
              <h2 className="text-xl font-black text-slate-900 mb-4">Past Order History ({pastOrders.length})</h2>
              {pastOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                  <p className="text-slate-500 text-sm font-semibold">No past delivered orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-black text-xl">
                            🛍️
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-extrabold text-slate-900 text-base">
                                {order.vendor?.name || 'Store'}
                              </h3>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                              Order {order.id} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            {order.items && (
                              <p className="text-xs text-slate-600 mt-2 font-medium">
                                {order.items.map((i) => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end justify-between space-y-3">
                          <span className="text-lg font-black text-slate-900">
                            ${Number(order.totalAmount).toFixed(2)}
                          </span>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3.5 py-1.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1 shadow-xs"
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

                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => setSelectedOrderForReview(order)}
                                className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>Rate</span>
                              </button>
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
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SAVED ADDRESSES */}
        {/* ========================================================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Saved Addresses</h2>
                <p className="text-xs text-slate-500">Fast one-click checkout locations saved to your profile.</p>
              </div>
              <button
                onClick={() => setIsAddingAddr(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddr && (
              <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-3xl border-2 border-emerald-500/40 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">New Address Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Label</label>
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
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
                      onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefaultAddr"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <label htmlFor="isDefaultAddr" className="text-xs font-bold text-slate-700">
                    Set as default delivery address
                  </label>
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
                    disabled={addrLoading}
                    className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
                  >
                    {addrLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Address</span>
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No saved addresses yet.</p>
                <p className="text-xs text-slate-400 mt-1">Add your Home or Work address to speed up checkout.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4"
                  >
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
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-extrabold text-emerald-600 hover:underline"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Primary</span>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ACCOUNT & SECURITY */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Personal Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Personal Details</h2>
                  <p className="text-xs text-slate-500">Update your verified contact information.</p>
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

              {profileMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${profileMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      placeholder="+251 91 123 4567"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                <h2 className="text-xl font-black text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Ensure your account is protected with a secure password.</p>
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
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
                >
                  {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-8 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-rose-900 text-lg">Danger Zone</h3>
                <p className="text-xs text-rose-700 mt-1">
                  Deactivate your account. You will not be able to log in or access your order history.
                </p>
              </div>
              <button
                onClick={handleDeactivate}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PAYMENT METHODS */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Saved Payment Methods</h2>
                <p className="text-xs text-slate-500">Manage your cards and saved digital payment preferences.</p>
              </div>
              <button
                onClick={() => setIsAddingPayment(true)}
                className="px-4 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>

            {isAddingPayment && (
              <form onSubmit={handleAddPayment} className="bg-white p-6 rounded-3xl border-2 border-emerald-500/40 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Add Payment Option</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
                    <select
                      value={newPayment.type}
                      onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    >
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Wallet">Digital Wallet (Telebirr / CBE)</option>
                      <option value="UPI">UPI / Mobile Pay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Provider Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Visa ending in 9876 or Telebirr account"
                      value={newPayment.provider}
                      onChange={(e) => setNewPayment({ ...newPayment, provider: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="12/28 or N/A"
                      value={newPayment.expiry}
                      onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4"
                >
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
                    <p className="text-xs text-slate-500 font-medium">
                      {pm.type} • {pm.expiry || 'Instant Pay'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    {!pm.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="text-xs font-extrabold text-emerald-600 hover:underline"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Primary</span>
                    )}
                    <button
                      onClick={() => handleDeletePayment(pm.id)}
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

        {/* ========================================================================= */}
        {/* TAB 6: NOTIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Notification Alerts</h2>
                <p className="text-xs text-slate-500">Configure how SmartDeliver sends updates to your device.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                {[
                  { key: 'orderStatus', label: 'Order Status Updates', desc: 'Real-time push alerts when food is cooking or ready' },
                  { key: 'driverUpdates', label: 'Driver Proximity Alerts', desc: 'Alerts when driver is approaching with your delivery' },
                  { key: 'promoOffers', label: 'Promotions & Discounts', desc: 'Special discount codes and weekend offers' },
                  { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Send text message updates to your mobile number' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: REWARDS & SUPPORT */}
        {/* ========================================================================= */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* Loyalty Rewards Banner */}
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  SmartRewards Club
                </span>
                <h2 className="text-2xl font-black mt-2">Balance: {loyaltyPoints} SmartPoints</h2>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  Earn points automatically with every order and review. 100 points = $1.00 instant voucher!
                </p>
              </div>
              <button
                onClick={handleRedeemPoints}
                className="px-6 py-3 bg-slate-900 text-amber-300 hover:bg-slate-800 font-black rounded-xl text-xs transition-colors shadow-md"
              >
                Redeem 100 Points ($1.00 Voucher)
              </button>
            </div>

            {/* Active Promo Codes */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Active Promo Coupons</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {offers.map((offer, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-dashed border-emerald-400/60 flex items-center justify-between">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
                        {offer.code}
                      </span>
                      <p className="text-xs text-slate-600 font-medium mt-2">{offer.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        alert(`Copied "${offer.code}" to clipboard!`);
                      }}
                      className="text-xs font-extrabold text-emerald-600 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Support Desk */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Customer Support Ticket</h2>
                <p className="text-xs text-slate-500">Contact our 24/7 Operations Desk for order issues, delays, or refunds.</p>
              </div>

              <form onSubmit={handleCreateSupportTicket} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Issue Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Delivery took too long or wrong items delivered"
                    value={newTicketTopic}
                    onChange={(e) => setNewTicketTopic(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Details</label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional details..."
                    value={newTicketMsg}
                    onChange={(e) => setNewTicketMsg(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="px-5 py-2.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1"
                >
                  {ticketLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Ticket</span>
                </button>
              </form>

              {/* Submitted Tickets */}
              {supportTickets.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm mb-3">Your Support Tickets</h3>
                  <div className="space-y-2">
                    {supportTickets.map((tck) => (
                      <div
                        key={tck.id}
                        className="p-4 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100"
                      >
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
              )}
            </div>
          </div>
        )}

      </div>

      {/* --- RECEIPT INVOICE MODAL --- */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Official Order Receipt</h3>
                <p className="text-xs text-slate-400">Order {selectedOrderForInvoice.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Merchant</span>
                <span className="font-bold text-slate-900">{selectedOrderForInvoice.vendor?.name || 'Store'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer</span>
                <span className="font-bold text-slate-900">{user?.name || 'Customer'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Address</span>
                <span className="font-bold text-slate-900 text-right max-w-xs">{selectedOrderForInvoice.deliveryAddress}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date Placed</span>
                <span className="font-bold text-slate-900">{new Date(selectedOrderForInvoice.createdAt).toLocaleString()}</span>
              </div>

              {selectedOrderForInvoice.items && (
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                  {selectedOrderForInvoice.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800 font-medium">
                      <span>{i.quantity}x {i.product?.name || 'Item'}</span>
                      <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Amount Paid</span>
                <span className="text-emerald-600">${Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* --- RATE & REVIEW MODAL --- */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Rate Your Experience</h3>
                <p className="text-xs text-slate-400">{selectedOrderForReview.vendor?.name || 'Store'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReview(null)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Food / Store Quality</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, vendorRating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.vendorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Delivery Driver Service</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, driverRating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.driverRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  placeholder="How was the food, packaging, and delivery time?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              className="w-full py-3 bg-[#1E8C45] hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
            >
              {reviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Review (+25 SmartPoints)</span>
            </button>
          </form>
        </div>
      )}

      {/* --- REPORT ISSUE / REFUND MODAL --- */}
      {selectedOrderForComplaint && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form onSubmit={handleSubmitComplaint} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Report Issue / Request Refund</h3>
                <p className="text-xs text-slate-400">Order {selectedOrderForComplaint.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForComplaint(null)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Complaint</label>
                <select
                  value={complaintForm.reason}
                  onChange={(e) => setComplaintForm({ ...complaintForm, reason: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Missing item">Missing item from order</option>
                  <option value="Damaged package">Damaged or spilled package</option>
                  <option value="Wrong items delivered">Wrong items delivered</option>
                  <option value="Severe delay">Extremely late delivery</option>
                  <option value="Food quality issue">Cold / unsatisfactory food</option>
                  <option value="Other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Describe what happened</label>
                <textarea
                  rows={3}
                  placeholder="Provide any details to help our support team process your refund promptly..."
                  value={complaintForm.details}
                  onChange={(e) => setComplaintForm({ ...complaintForm, details: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={complaintLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
            >
              {complaintLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Refund Ticket</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
