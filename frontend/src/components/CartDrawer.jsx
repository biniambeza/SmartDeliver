import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MapPin, 
  FileText, 
  ArrowRight, 
  Loader2, 
  Store,
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function CartDrawer({ onOrderSuccess }) {
  const { 
    items, 
    cartVendor, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    deliveryFee, 
    total 
  } = useCart();

  const { user, openLogin } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState('Bole Medhanialem Road, Addis Ababa');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Please provide a delivery address.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        vendorId: cartVendor?.id || items[0].vendorId,
        deliveryAddress: deliveryAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/orders', payload);

      if (res.data.success && res.data.order) {
        clearCart();
        closeCart();
        if (onOrderSuccess) {
          onOrderSuccess(res.data.order);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.error || 'Failed to place order. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] border border-[#F5B820]/30 flex items-center justify-center text-[#F5B820]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Your Order Cart
                </h3>
                {cartVendor && (
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <Store className="w-3 h-3 mr-1 text-[#1E8C45]" />
                    <span className="font-medium text-gray-700">{cartVendor.name}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8E1] border border-[#F5B820]/20 flex items-center justify-center mx-auto mb-3 text-[#F5B820]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Your cart is empty</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Browse our local vendors and add your favorite meals or essentials!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {item.imageUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FFF8E1] border border-[#F5B820]/10 shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#1E8C45] font-bold mt-0.5">
                        {Number(item.price).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-[#F5B820] hover:border-[#F5B820] hover:text-white text-gray-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-[#F5B820] hover:border-[#F5B820] hover:text-white text-gray-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center mb-1">
                    <MapPin className="w-3 h-3 mr-1 text-[#1E8C45]" />
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter street, building, or area in Addis"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#F5B820] focus:bg-white text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B820]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center mb-1">
                    <FileText className="w-3 h-3 mr-1 text-gray-400" />
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Extra napkins, call upon arrival"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#F5B820] focus:bg-white text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B820]/20 transition-all"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-[#1E8C45] font-semibold">{deliveryFee.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#1E8C45] font-black">
                    {total.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F5B820] hover:bg-[#E5A910] text-white font-bold text-sm shadow-lg shadow-[#F5B820]/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Placing Order...</span>
                  </>
                ) : user ? (
                  <>
                    <span>Place Order ({total.toLocaleString()} ETB)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Sign In to Place Order</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
