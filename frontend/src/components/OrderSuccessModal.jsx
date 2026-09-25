import React from 'react';
import { 
  CheckCircle2, 
  X, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  ExternalLink,
  Store
} from 'lucide-react';

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
            Order Confirmed • Pending Delivery
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your order has been transmitted directly to the merchant.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-400 flex items-center">
              <Store className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Store
            </span>
            <span className="font-bold text-white">
              {order.vendor?.name || 'Local Merchant'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Estimated Time
            </span>
            <span className="font-semibold text-emerald-400">
              25 - 35 mins
            </span>
          </div>

          <div className="flex items-start justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-400 flex items-center shrink-0">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Destination
            </span>
            <span className="font-medium text-slate-300 text-right line-clamp-2 max-w-[65%]">
              {order.deliveryAddress}
            </span>
          </div>

          {/* Items breakdown */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Items Ordered ({order.items?.length || 0}):
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">
                    {item.quantity}x {item.product?.name || item.name}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {Number(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Total Amount</span>
            <span className="text-lg font-black text-emerald-400">
              {Number(order.totalAmount).toLocaleString()} <span className="text-xs font-normal text-slate-400">ETB</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              alert(`Connecting to Chapa Escrow Gateway for Order #${order.id.slice(0, 8)}...\nAmount: ${order.totalAmount} ETB\n(Slice 4: Chapa Payment Processing)`);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay with Chapa (Escrow)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
