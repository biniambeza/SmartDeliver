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
      className="group relative bg-white border border-gray-100 hover:border-[#F5B820]/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1.5"
    >
      {/* Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={bannerUrl || defaultBanner}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F5B820] text-white shadow-md shadow-[#F5B820]/30">
            {category}
          </span>
        </div>

        {/* Delivery Time Badge */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-gray-800 shadow-sm border border-gray-100">
          <Clock className="w-3.5 h-3.5 text-[#1E8C45]" />
          <span>20-35m</span>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#FFF8E1] border border-[#F5B820]/20 shrink-0 shadow-inner">
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
                <h3 className="text-base font-black text-gray-900 group-hover:text-[#1E8C45] transition-colors line-clamp-1">
                  {name}
                </h3>
                {address && (
                  <p className="flex items-center text-xs text-gray-500 mt-0.5 line-clamp-1">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                    <span>{address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#FFF8E1] group-hover:bg-[#1E8C45] group-hover:text-white text-gray-800 flex items-center justify-center transition-all shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {description && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-semibold">
            {productsCount !== undefined ? `${productsCount} catalog items` : 'Browse menu'}
          </span>
          <span className="flex items-center text-[#1E8C45] font-extrabold">
            <span className="w-2 h-2 rounded-full bg-[#1E8C45] inline-block mr-1.5 animate-pulse"></span>
            Open Now
          </span>
        </div>
      </div>
    </div>
  );
}
