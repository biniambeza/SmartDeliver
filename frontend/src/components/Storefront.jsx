import React, { useState, useEffect } from 'react';
import { Search, Store, SlidersHorizontal, Loader2, Sparkles, RefreshCw } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Vendor Marketplace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Stores & Menus
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Order directly from top-rated Addis restaurants, supermarkets, and local suppliers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores or cuisines..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
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

      {/* Vendors Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-slate-800/50 w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded-md w-1/2" />
                </div>
                <div className="h-4 bg-slate-800/40 rounded-md w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-md mx-auto">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Catalog Connection</h3>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchVendors}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : vendors.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center max-w-md mx-auto">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No vendors found</h3>
          <p className="text-xs text-slate-400 mb-4">
            We couldn't find any stores matching your current search or category filter.
          </p>
          {(selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold transition-all"
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
