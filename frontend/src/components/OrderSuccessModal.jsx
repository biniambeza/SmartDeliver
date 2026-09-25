import React from 'react';
import { 
  CheckCircle2, 
  X, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Store
} from 'lucide-react';

export default function OrderSuccessModal({ order, onClose, onOpenPayment }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#FDFBF7] border border-amber-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 shadow-md shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-300">
            Order Confirmed • Pending Delivery
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your order has been transmitted directly to the merchant.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-amber-100 rounded-2xl p-4 sm:p-5 mb-6 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500 flex items-center">
              <Store className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Store
            </span>
            <span className="font-bold text-slate-900">
              {order.vendor?.name || 'Local Merchant'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Estimated Time
            </span>
            <span className="font-bold text-emerald-700">
              25 - 35 mins
            </span>
          </div>

          <div className="flex items-start justify-between text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500 flex items-center shrink-0">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Destination
            </span>
            <span className="font-medium text-slate-700 text-right line-clamp-2 max-w-[65%]">
              {order.deliveryAddress}
            </span>
          </div>

          {/* Items breakdown */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Items Ordered ({order.items?.length || 0}):
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium">
                    {item.quantity}x {item.product?.name || item.name}
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {Number(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Total Amount</span>
            <span className="text-lg font-black text-emerald-700">
              {Number(order.totalAmount).toLocaleString()} <span className="text-xs font-normal text-slate-500">ETB</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              if (onOpenPayment) {
                onOpenPayment(order);
              }
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay with Chapa (Escrow)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer shadow-xs"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
