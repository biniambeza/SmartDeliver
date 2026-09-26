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
  ShoppingBag, MapPin, Clock, Star, User, CreditCard, Tag, 
  RefreshCw, Phone, Plus, Trash2, Edit3, X, ArrowRight, 
  Search, Store, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { itemsCount, openCart, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'orders' | 'addresses' | 'account'
  const [loading, setLoading] = useState(true);

  // Real backend data
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [offers, setOffers] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Store browsing & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVendorForMenu, setSelectedVendorForMenu] = useState(null);

  // Modals
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  // Forms
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '', isDefault: false });
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  const [newPayment, setNewPayment] = useState({ type: 'Card', provider: '', expiry: '' });
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const [reviewForm, setReviewForm] = useState({ vendorRating: 5, driverRating: 5, comment: '' });

  // Load real user and catalog data
  const loadData = async () => {
    try {
      setLoading(true);
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
      setLoyaltyPoints(p.loyaltyPoints ?? 0);
      setOffers(offersRes.data.offers || []);
      setVendors(vendorsRes.data.vendors || []);

      if (user?.name) {
        setProfileForm({ name: user.name, phone: user.phone || '' });
      }
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Orders splitting
  const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const pastOrders = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status));

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileMsg(null);
      await api.put('/auth/profile', profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      await api.post('/auth/change-password', passwords);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This will log you out.')) {
      try {
        await api.post('/auth/deactivate');
        logout();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to deactivate');
      }
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.address.trim()) return;
    try {
      const res = await api.post('/customer/addresses', newAddr);
      setAddresses((prev) => [res.data.address, ...prev]);
      setNewAddr({ label: 'Home', address: '', isDefault: false });
      setIsAddingAddr(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/customer/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.patch(`/customer/addresses/${id}/default`);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      alert('Failed to update default address');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newPayment.provider.trim()) return;
    try {
      const res = await api.post('/customer/payments', newPayment);
      setPaymentMethods((prev) => [res.data.paymentMethod, ...prev]);
      setNewPayment({ type: 'Card', provider: '', expiry: '' });
      setIsAddingPayment(false);
    } catch (err) {
      alert('Failed to save payment method');
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await api.delete(`/customer/payments/${id}`);
      setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to remove payment method');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel order');
    }
  };

  const handleReorder = (order) => {
    if (!order.items?.length) return;
    const vendor = order.vendor || { id: order.vendorId, name: 'Store' };
    order.items.forEach((item) => {
      addToCart(item.product || { id: item.productId, name: 'Item', price: item.price }, vendor);
    });
    openCart();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    try {
      await api.post('/customer/reviews', {
        orderId: selectedOrderForReview.id,
        ...reviewForm,
      });
      alert('Review submitted! +25 SmartPoints added.');
      setLoyaltyPoints((prev) => prev + 25);
      setSelectedOrderForReview(null);
      setReviewForm({ vendorRating: 5, driverRating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleRedeemPoints = async () => {
    if (loyaltyPoints < 100) {
      alert('You need at least 100 SmartPoints to redeem.');
      return;
    }
    try {
      const res = await api.post('/customer/rewards/redeem', { pointsToRedeem: 100 });
      alert(`${res.data.message}\nPromo code: ${res.data.promoCode}`);
      setLoyaltyPoints(res.data.remainingPoints);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to redeem points');
    }
  };

  // Filter vendors
  const filteredVendors = vendors.filter((v) => {
    const matchQuery = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'ALL' || (v.category && v.category.toUpperCase() === selectedCategory);
    return matchQuery && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 font-sans">
      
      {/* Modals & Drawers */}
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
            loadData();
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

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Bar */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#F5B820] rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{user?.name || 'Customer'}</h1>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase">
                  Customer
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">{user?.email}</p>
              
              <button 
                onClick={handleRedeemPoints}
                className="mt-2 text-xs text-amber-300 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{loyaltyPoints} SmartPoints (Redeem)</span>
              </button>
            </div>
          </div>

          <button
            onClick={openCart}
            className="px-5 py-3 bg-[#F5B820] hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart ({itemsCount})</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto">
          {[
            { key: 'browse', label: 'Explore Stores', icon: Store },
            { key: 'orders', label: `My Orders (${activeOrders.length})`, icon: ShoppingBag },
            { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { key: 'account', label: 'Account & Rewards', icon: User },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                activeTab === tab.key 
                  ? 'bg-slate-900 text-amber-400 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* TAB 1: EXPLORE STORES */}
        {/* ========================================= */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores or food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'RESTAURANT', 'GROCERY', 'CAFE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#1E8C45] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium">Loading stores...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-700 font-bold text-sm">No stores found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search term or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendorForMenu(vendor)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 w-full bg-slate-100 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                        {vendor.bannerUrl ? (
                          <img src={vendor.bannerUrl} alt={vendor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🏬</span>
                        )}
                        <span className="absolute top-2 right-2 bg-white/90 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                          20-30 min
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{vendor.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{vendor.category || 'Restaurant'} • {vendor.address || 'Local'}</p>
                    </div>

                    <button className="mt-4 w-full py-2 bg-slate-900 hover:bg-[#1E8C45] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1">
                      <span>View Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: MY ORDERS */}
        {/* ========================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Active Deliveries */}
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Active Deliveries ({activeOrders.length})</span>
              </h2>

              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No active orders</p>
                  <p className="text-xs text-slate-400 mt-1">Browse stores and place an order to track it live.</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-3 px-4 py-2 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Browse Stores
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border-2 border-amber-400/40 p-5 space-y-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900">{order.vendor?.name || 'Store'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Order {order.id}</p>
                          <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                        </div>
                      </div>

                      {order.items && (
                        <div className="text-xs text-slate-600 space-y-1">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{i.quantity}x {i.product?.name || 'Item'}</span>
                              <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setTrackedOrderId(order.id)}
                            className="px-4 py-2 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Track Live</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>

                        {['PENDING', 'PAID'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Orders */}
            <div className="pt-4">
              <h2 className="text-lg font-black text-slate-900 mb-3">Order History ({pastOrders.length})</h2>
              {pastOrders.length === 0 ? (
                <p className="text-xs text-slate-400">No past completed orders.</p>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900">{order.vendor?.name || 'Store'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm mr-2">${Number(order.totalAmount).toFixed(2)}</span>
                        
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3 py-1.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                        >
                          Receipt
                        </button>

                        {order.status === 'DELIVERED' && (
                          <button
                            onClick={() => setSelectedOrderForReview(order)}
                            className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg"
                          >
                            Rate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: SAVED ADDRESSES */}
        {/* ========================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Saved Addresses</h2>
              <button
                onClick={() => setIsAddingAddr(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {isAddingAddr && (
              <form onSubmit={handleAddAddress} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Label</label>
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Medhanealem, House #204"
                      value={newAddr.address}
                      onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddr(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-slate-600 text-xs font-bold">No saved addresses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-slate-900 text-sm">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs">{addr.address}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-3">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Make Default
                        </button>
                      ) : <span />}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600"
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

        {/* ========================================= */}
        {/* TAB 4: ACCOUNT & REWARDS */}
        {/* ========================================= */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Rewards Banner */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-5 text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <p className="font-black text-xs uppercase tracking-wider text-slate-800">SmartRewards Points</p>
                <h3 className="font-black text-xl">{loyaltyPoints} SmartPoints</h3>
                <p className="text-xs font-medium text-slate-800">Earn points with every completed order. 100 points = $1 voucher.</p>
              </div>
              <button
                onClick={handleRedeemPoints}
                className="px-4 py-2 bg-slate-950 text-amber-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Redeem 100 Points
              </button>
            </div>

            {/* Active Promo Coupons */}
            {offers.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Available Coupons</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offers.map((offer, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-dashed border-emerald-400 flex items-center justify-between">
                      <div>
                        <span className="font-black text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded">{offer.code}</span>
                        <p className="text-xs text-slate-600 mt-1">{offer.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(offer.code);
                          alert(`Copied code "${offer.code}" to clipboard!`);
                        }}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">Personal Details</h3>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {profileMsg && (
                <p className={`text-xs font-bold ${profileMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profileMsg.text}
                </p>
              )}

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-75"
                  />
                </div>
                {isEditingProfile && (
                  <div className="sm:col-span-2 flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">Change Password</h3>
              {passwordMsg && (
                <p className={`text-xs font-bold ${passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {passwordMsg.text}
                </p>
              )}
              <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">Payment Methods</h3>
                <button
                  onClick={() => setIsAddingPayment(true)}
                  className="px-3 py-1 bg-[#1E8C45] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg"
                >
                  + Add
                </button>
              </div>

              {isAddingPayment && (
                <form onSubmit={handleAddPayment} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Description (e.g. Telebirr, Visa 1234)"
                    value={newPayment.provider}
                    onChange={(e) => setNewPayment({ ...newPayment, provider: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsAddingPayment(false)} className="text-xs text-slate-500">Cancel</button>
                    <button type="submit" className="text-xs font-bold text-emerald-600">Save</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{pm.provider}</p>
                      <p className="text-[10px] text-slate-400">{pm.type}</p>
                    </div>
                    <button onClick={() => handleDeletePayment(pm.id)} className="text-rose-600 font-bold hover:underline">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-900 text-sm">Deactivate Account</p>
                <p className="text-xs text-rose-700">Disable your account and stop receiving deliveries.</p>
              </div>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}

      </div>

      {/* --- RECEIPT MODAL --- */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-slate-900 text-base">Receipt</h3>
              <button onClick={() => setSelectedOrderForInvoice(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>Order:</strong> {selectedOrderForInvoice.id}</p>
              <p><strong>Store:</strong> {selectedOrderForInvoice.vendor?.name}</p>
              <p><strong>Total:</strong> ${Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(selectedOrderForInvoice.createdAt).toLocaleString()}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* --- RATING MODAL --- */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-slate-900 text-base">Rate Order</h3>
              <button type="button" onClick={() => setSelectedOrderForReview(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Rating</label>
              <select
                value={reviewForm.vendorRating}
                onChange={(e) => setReviewForm({ ...reviewForm, vendorRating: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Poor</option>
                <option value={1}>1 Star - Terrible</option>
              </select>
            </div>
            <textarea
              placeholder="Leave feedback..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
              rows={2}
            />
            <button type="submit" className="w-full py-2 bg-[#1E8C45] text-white font-bold text-xs rounded-xl">
              Submit Review (+25 Points)
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
