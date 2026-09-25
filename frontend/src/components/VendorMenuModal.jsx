import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Store, 
  Search, 
  ShoppingBag, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import ProductCard from './ProductCard';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

export default function VendorMenuModal({ vendor, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addToCart, openCart } = useCart();

  useEffect(() => {
    if (!vendor) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/vendors/${vendor.id}/products`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load vendor products:', err);
        setError(err.response?.data?.error || 'Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [vendor]);

  if (!vendor) return null;

  const handleAddToCart = (product) => {
    addToCart(product, vendor);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const vendorItemsCount = items
    .filter((i) => i.vendorId === vendor.id)
    .reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden bg-gray-100">
          <img
            src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-gray-200 shadow-md backdrop-blur-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="flex items-center space-x-3.5 sm:space-x-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white border-2 border-[#F5B820] shadow-lg shrink-0">
                <img
                  src={vendor.logoUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=160&q=80'}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F5B820] text-white shadow-sm">
                    {vendor.category}
                  </span>
                  <span className="text-xs text-white flex items-center font-bold">
                    <Clock className="w-3.5 h-3.5 mr-1 text-[#FBD968]" />
                    20-35 min delivery
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-sm">
                  {vendor.name}
                </h2>
                {vendor.address && (
                  <p className="flex items-center text-xs text-gray-200 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#FBD968] shrink-0" />
                    {vendor.address}
                  </p>
                )}
              </div>
            </div>

            {vendorItemsCount > 0 && (
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-[#F5B820] text-white font-black text-xs shadow-lg shadow-[#F5B820]/30">
                <ShoppingBag className="w-4 h-4" />
                <span>{vendorItemsCount} in cart</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items in this menu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:border-[#F5B820] text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B820]/20 transition-all"
            />
          </div>

          <div className="text-xs text-gray-500 font-bold">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 text-[#F5B820] animate-spin mb-3" />
              <p className="text-sm font-bold text-gray-700">Loading menu catalog...</p>
            </div>
          ) : error ? (
            <div className="py-12 px-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Store className="w-10 h-10 mx-auto mb-3 opacity-40 text-gray-400" />
              <p className="text-sm font-bold text-gray-700">No items found</p>
              <p className="text-xs text-gray-500 mt-1">Try another search keyword or clear your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAdded={Boolean(items.find((i) => i.id === product.id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
          >
            Back to All Stores
          </button>

          {vendorItemsCount > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-600 font-bold">
                {vendorItemsCount} item(s) selected
              </span>
              <button
                onClick={() => {
                  onClose();
                  openCart();
                }}
                className="px-6 py-2.5 rounded-full bg-[#F5B820] hover:bg-[#E5A910] text-white font-black text-xs shadow-lg shadow-[#F5B820]/20 transition-all cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
