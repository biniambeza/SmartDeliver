import React, { useState, useEffect } from 'react';
import { Search, Store, RefreshCw, Sparkles } from 'lucide-react';
import CategoryTabs from './CategoryTabs';
import VendorCard from './VendorCard';
import VendorMenuModal from './VendorMenuModal';
import api from '../lib/api';

export default function Storefront() {
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get('/vendors', { params });
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      setError(err.response?.data?.error || 'Unable to connect to vendor service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF8E1] border border-[#F5B820]/20 text-[#E5A910] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F5B820]" />
            <span>Addis Ababa Verified Stores</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Explore Stores & Menus
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Order authentic meals, fresh supermarket groceries, and pharmacy health goods delivered fast.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores or cuisines..."
            className="w-full pl-10 pr-12 py-3 rounded-full bg-white border border-gray-200 focus:border-[#F5B820] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B820]/20 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8">
        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-white border border-gray-100 shadow-sm animate-pulse overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-gray-100 w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                </div>
                <div className="h-4 bg-gray-100 rounded-md w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center max-w-md mx-auto shadow-sm">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">Catalog Connection</h3>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchVendors}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-[#F5B820] hover:bg-[#E5A910] text-white text-xs font-bold shadow-md shadow-[#F5B820]/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : vendors.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-gray-100 text-center max-w-md mx-auto shadow-sm">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No vendors found</h3>
          <p className="text-xs text-gray-500 mb-4">
            We couldn't find any stores matching your current search or category filter.
          </p>
          {(selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-full bg-[#F5B820] text-white font-bold text-xs hover:bg-[#E5A910] transition-all shadow-md shadow-[#F5B820]/20 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onSelectVendor={(v) => setSelectedVendor(v)}
            />
          ))}
        </div>
      )}

      {/* Vendor Menu Details Modal */}
      {selectedVendor && (
        <VendorMenuModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
