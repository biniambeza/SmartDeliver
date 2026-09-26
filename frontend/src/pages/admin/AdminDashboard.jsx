import React from 'react';
import AdminSuperpanelModal from '../../components/AdminSuperpanelModal';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Admin Superpanel</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <AdminSuperpanelModal isOpen={true} onClose={() => {}} inline={true} />
        </div>
      </div>
    </div>
  );
}
