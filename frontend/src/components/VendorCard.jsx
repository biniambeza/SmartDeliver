import React from 'react';
import { Star, Clock, MapPin, ArrowUpRight, Store } from 'lucide-react';

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

  // Fallback banner placeholder with stylish dark gradient
  const defaultBanner =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
  const defaultLogo =
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=120&q=80';

  return (
    <div
      onClick={() => onSelectVendor(vendor)}
      className="group relative bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={bannerUrl || defaultBanner}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {category}
          </span>
        </div>

        {/* Rating & Delivery Time Pill */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>20-35m</span>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Name Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
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
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {name}
                </h3>
                {address && (
                  <p className="flex items-center text-xs text-slate-400 mt-0.5 line-clamp-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
                    <span>{address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400 transition-all shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer info: items count & status */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            {productsCount !== undefined ? `${productsCount} items` : 'Browse menu'}
          </span>
          <span className="flex items-center text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
            Open Now
          </span>
        </div>
      </div>
    </div>
  );
}
