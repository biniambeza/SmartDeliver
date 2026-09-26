import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, PackageCheck, Bike } from 'lucide-react';

export default function RiderDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-[#1E8C45] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Rider Dispatch</h1>
            <p className="text-gray-500 font-medium">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No Active Deliveries</h2>
          <p className="text-gray-500 mt-2">You are online. Waiting for nearby orders...</p>
        </div>
      </div>
    </div>
  );
}
