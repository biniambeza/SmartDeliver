import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, Package, ShoppingBag, Clock, TrendingUp, Plus, 
  ChevronRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  ToggleLeft, ToggleRight, Loader2, DollarSign, ChefHat, Bike
} from 'lucide-react';
import api from '../../lib/api';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'add-product'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Dish',
    imageUrl: '',
  });
  const [productSuccess, setProductSuccess] = useState(null);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/vendors/me/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load merchant data:', err);
      setError(err.response?.data?.error || 'Failed to load merchant dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/vendors/orders/${orderId}/status`, { status });
      await fetchVendorData();
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
      await fetchVendorData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update item availability');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Product name and price are required.');
      return;
    }

    try {
      setActionLoading(true);
      setProductSuccess(null);
      await api.post('/vendors/products', {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        imageUrl: newProduct.imageUrl.trim() || undefined,
      });

      setProductSuccess('Product added successfully to your menu!');
      setNewProduct({ name: '', description: '', price: '', category: 'Main Dish', imageUrl: '' });
      await fetchVendorData();
      setActiveTab('menu');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add product');
    } finally {
      setActionLoading(false);
    }
  };

  const vendor = data?.vendor;
  const stats = data?.stats;
  const orders = data?.orders || [];
  const products = data?.products || [];

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'READY_FOR_PICKUP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EN_ROUTE': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-[#1E8C45] border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#F5B820] rounded-2xl flex items-center justify-center text-gray-950 shadow-lg">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{vendor?.name || 'Merchant Portal'}</h1>
              <p className="text-gray-500 font-medium">
                {vendor?.category || 'Storefront'} • {vendor?.address || 'Addis Ababa'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Gross Revenue</p>
              <p className="text-2xl font-black text-[#1E8C45]">
                ETB {(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={fetchVendorData}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm text-gray-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Clock className="w-6 h-6 mb-2 text-yellow-600 opacity-80" />
            <p className="text-2xl font-black text-gray-900">{stats?.pendingCount || 0}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Pending Orders</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <ChefHat className="w-6 h-6 mb-2 text-blue-600 opacity-80" />
            <p className="text-2xl font-black text-gray-900">{stats?.preparingCount || 0}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">In Kitchen</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-6 h-6 mb-2 text-[#1E8C45] opacity-80" />
            <p className="text-2xl font-black text-gray-900">{stats?.deliveredCount || 0}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Delivered</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Package className="w-6 h-6 mb-2 text-purple-600 opacity-80" />
            <p className="text-2xl font-black text-gray-900">{products.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Catalog Items</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'orders', label: `Orders (${orders.length})` },
            { key: 'menu', label: `Menu & Catalog (${products.length})` },
            { key: 'add-product', label: '+ Add New Item' },
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
            <p className="text-sm font-bold text-gray-500">Loading store dashboard...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-700">No incoming orders yet.</p>
                    <p className="text-xs text-gray-500 mt-1">When customers place orders, they appear here live.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-gray-900">{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Customer: <span className="font-semibold text-gray-700">{order.customer?.name}</span> • {order.customer?.phone || 'No phone'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Deliver to: <span className="font-semibold text-gray-700">{order.deliveryAddress}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total Order</p>
                          <p className="text-lg font-black text-gray-900">ETB {Number(order.totalAmount).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                            <span>{item.quantity}x {item.product?.name}</span>
                            <span className="font-bold">ETB {Number(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Progression */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 justify-end">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-[#1E8C45] hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            Accept & Start Preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-[#F5B820] hover:bg-yellow-400 text-gray-950 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            Mark Ready for Rider Pickup
                          </button>
                        )}
                        {['PENDING', 'PREPARING'].includes(order.status) && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                            disabled={actionLoading}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Menu Catalog Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900">Your Menu Offerings</h3>
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="px-3.5 py-1.5 bg-[#1E8C45] text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80'}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{p.name}</p>
                          <p className="text-xs text-[#1E8C45] font-black mt-0.5">ETB {Number(p.price).toLocaleString()}</p>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleProduct(p.id)}
                        disabled={actionLoading}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          p.isAvailable
                            ? 'bg-green-50 text-[#1E8C45] hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        <span>{p.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Product Tab */}
            {activeTab === 'add-product' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl mx-auto">
                <h3 className="font-black text-gray-900 text-lg mb-4">Add Menu / Catalog Item</h3>

                {productSuccess && (
                  <div className="p-3 mb-4 rounded-xl bg-green-50 text-[#1E8C45] text-xs font-bold">
                    {productSuccess}
                  </div>
                )}

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Doro Wat"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E8C45] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (ETB)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="250.00"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E8C45] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E8C45] outline-none bg-white"
                      >
                        <option value="Main Dish">Main Dish</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Healthcare">Healthcare</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Fresh ingredients, traditional preparation..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E8C45] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E8C45] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-[#1E8C45] hover:bg-green-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    {actionLoading ? 'Publishing...' : 'Save & Publish Product'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
