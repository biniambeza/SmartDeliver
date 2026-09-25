import React from 'react';
import { CheckCircle2, MapPin, Receipt, ArrowRight, X, CreditCard, Clock } from 'lucide-react';

export default function OrderSuccessModal({ order, onClose, onOpenPayment }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-[#1E8C45]/20 flex items-center justify-center mx-auto mb-4 animate-fade-in-up">
            <CheckCircle2 className="w-8 h-8 text-[#1E8C45]" />
          </div>

          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-xs text-gray-500 mt-1.5">
            Your order has been successfully placed and is now in the queue
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">Order Ref</span>
              <span className="font-mono text-xs font-black text-gray-900 bg-[#FFF8E1] px-2.5 py-0.5 rounded-lg border border-[#F5B820]/20">
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">Amount</span>
              <span className="text-sm font-black text-[#1E8C45]">
                ETB {Number(order.totalAmount).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF8E1] text-[#E5A910] border border-[#F5B820]/30 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {order.status}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-[#1E8C45] shrink-0" />
            <span className="text-gray-700 font-medium">{order.deliveryAddress}</span>
          </div>

          {/* Order Items List */}
          <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#F5B820]/20 space-y-2.5">
            <div className="flex items-center space-x-2 text-gray-800 text-xs font-bold mb-1">
              <Receipt className="w-3.5 h-3.5 text-[#F5B820]" />
              <span>Ordered Items</span>
            </div>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-gray-700">
                  <span className="font-bold text-gray-900">{item.quantity}x</span> {item.product?.name || 'Item'}
                </span>
                <span className="text-gray-800 font-bold">
                  {(Number(item.price) * item.quantity).toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => onOpenPayment(order)}
            className="w-full py-3.5 rounded-xl bg-[#F5B820] hover:bg-[#E5A910] text-white font-bold text-sm shadow-lg shadow-[#F5B820]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Pay with Chapa Telebirr</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Pay Later / Close
          </button>
        </div>
      </div>
    </div>
  );
}
