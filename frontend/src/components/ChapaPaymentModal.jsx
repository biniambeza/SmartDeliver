import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  ExternalLink,
  Smartphone,
  Lock,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

export default function ChapaPaymentModal({ order, onClose, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const handleInitializePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post(`/payments/initialize/${order.id}`);
      setPaymentData(res.data);
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.response?.data?.error || 'Failed to initialize Chapa payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!paymentData?.txRef) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.post(`/payments/verify/${paymentData.txRef}`, {
        status: 'SUCCESS',
      });

      if (res.data.success) {
        setIsSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.payment);
        }
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

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

        {isSuccess ? (
          /* Payment Success View */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30 inline-block">
              Payment Secured in Escrow
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
              Your payment of <strong className="text-emerald-400">{Number(order.totalAmount).toLocaleString()} ETB</strong> has been verified and deposited into the SmartDeliver escrow vault.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-white font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[200px]">
                  {paymentData?.txRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-emerald-400 font-bold">PAID (ESCROW HELD)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Done & Return to Orders
            </button>
          </div>
        ) : (
          /* Payment Initialization & Checkout View */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>Chapa Escrow Checkout</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Complete Your Payment
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Order #{order.id.slice(0, 8).toUpperCase()} • {order.vendor?.name || 'SmartDeliver Order'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Total Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Payable
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {Number(order.totalAmount).toLocaleString()} <span className="text-sm font-bold text-emerald-400">ETB</span>
                </div>
              </div>
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
                  Telebirr
                </span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold">
                  CBE Birr
                </span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold">
                  Cards
                </span>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-400">100% Escrow Protection:</strong> Funds remain securely held by SmartDeliver until the courier delivers your items and you confirm receipt.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {!paymentData ? (
                <button
                  onClick={handleInitializePayment}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Chapa Transaction...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Initialize Chapa Escrow</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2.5">
                  {/* Hosted Chapa Checkout Link */}
                  {paymentData.checkoutUrl && (
                    <a
                      href={paymentData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Live Chapa Portal</span>
                    </a>
                  )}

                  {/* Sandbox Simulated Payment for Instant Verification */}
                  <button
                    onClick={handleSimulatePayment}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Sandbox Payment...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simulate Instant Telebirr Success (Test Mode)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white font-medium text-xs transition-colors"
              >
                Pay Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
