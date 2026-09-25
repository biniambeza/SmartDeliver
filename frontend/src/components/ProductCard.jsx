import React from 'react';
import { Plus, Check, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isAdded }) {
  const { name, description, price, imageUrl, category, isAvailable } = product;

  const defaultProductImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden p-4 flex flex-col justify-between transition-all duration-200 group">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
          <img
            src={imageUrl || defaultProductImg}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = defaultProductImg;
            }}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                {name}
              </h4>
              {category && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {category}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-black text-emerald-400">
              {Number(price).toLocaleString()} <span className="text-xs font-semibold text-slate-400">ETB</span>
            </span>

            <button
              onClick={() => onAddToCart && isAvailable && onAddToCart(product)}
              disabled={!isAvailable}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                !isAvailable
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-bold pr-1">Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold pr-1">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
