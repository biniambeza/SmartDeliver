import React from 'react';
import VendorDashboardModal from '../../components/VendorDashboardModal';

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Vendor Dashboard</h1>
        {/* We reuse the existing modal contents but force it open inline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <VendorDashboardModal isOpen={true} onClose={() => {}} inline={true} />
        </div>
      </div>
    </div>
  );
}
