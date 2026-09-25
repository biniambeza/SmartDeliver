import React from 'react';
import { Star, Clock, MapPin, ArrowUpRight } from 'lucide-react';

export default function VendorCard({ vendor, onSelectVendor }) {
  const {
    name,
    category,
    description,
    logoUrl,
    bannerUrl,
    address,
    productsCount,
  } = vendor;

  const defaultBanner =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
  const defaultLogo =
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=120&q=80';

  return (
    <div
      onClick={() => onSelectVendor(vendor)}
      className="group relative bg-white border border-amber-100 hover:border-amber-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1.5"
    >
      {/* Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={bannerUrl || defaultBanner}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Category Pill in Sunny Yellow */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30">
            {category}
          </span>
        </div>

        {/* Delivery Time Badge */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>20-35m</span>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Name Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0 shadow-inner">
                <img
                  src={logoUrl || defaultLogo}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultLogo;
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {name}
                </h3>
                {address && (
                  <p className="flex items-center text-xs text-slate-500 mt-0.5 line-clamp-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    <span>{address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-amber-100 group-hover:bg-[#0A3E33] group-hover:text-white text-slate-800 flex items-center justify-center transition-all shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer info: items count & status */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">
            {productsCount !== undefined ? `${productsCount} catalog items` : 'Browse menu'}
          </span>
          <span className="flex items-center text-emerald-700 font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
            Open Now
          </span>
        </div>
      </div>
    </div>
  );
}
