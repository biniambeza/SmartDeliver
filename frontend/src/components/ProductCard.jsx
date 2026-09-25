import React from 'react';
import { Plus, Check } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isAdded }) {
  const { name, description, price, imageUrl, category, isAvailable } = product;

  const defaultProductImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="bg-white border border-gray-100 hover:border-[#F5B820]/40 rounded-3xl overflow-hidden p-4 flex flex-col justify-between transition-all duration-200 group shadow-sm hover:shadow-md">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FFF8E1] shrink-0 relative border border-[#F5B820]/10">
          <img
            src={imageUrl || defaultProductImg}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = defaultProductImg;
            }}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#1E8C45] transition-colors line-clamp-1">
                {name}
              </h4>
              {category && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#E5A910] border border-[#F5B820]/20">
                  {category}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-black text-gray-900">
              {Number(price).toLocaleString()} <span className="text-xs font-bold text-[#1E8C45]">ETB</span>
            </span>

            <button
              onClick={() => onAddToCart && isAvailable && onAddToCart(product)}
              disabled={!isAvailable}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                !isAvailable
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-[#1E8C45] text-white font-bold shadow-sm'
                  : 'bg-[#F5B820] hover:bg-[#E5A910] text-white font-bold shadow-md shadow-[#F5B820]/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
