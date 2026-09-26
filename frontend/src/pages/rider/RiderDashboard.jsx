import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, PackageCheck, Bike, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RiderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // active, available, history
  
  // Mock history data for now
  const historyDeliveries = [
    { id: '#ORD-9821', date: 'Today, 2:30 PM', restaurant: 'Burger Joint', earnings: '$5.40', status: 'Delivered' },
    { id: '#ORD-9810', date: 'Today, 1:15 PM', restaurant: 'Pizza Palace', earnings: '$7.20', status: 'Delivered' },
    { id: '#ORD-9755', date: 'Yesterday, 6:45 PM', restaurant: 'Sushi Express', earnings: '$8.50', status: 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#1E8C45] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Rider Dispatch</h1>
              <p className="text-gray-500 font-medium">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Today's Earnings</p>
            <p className="text-2xl font-black text-[#1E8C45]">$12.60</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-colors ${activeTab === 'active' ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-colors ${activeTab === 'available' ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Available Orders
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-colors ${activeTab === 'history' ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No Active Deliveries</h2>
            <p className="text-gray-500 mt-2">You don't have any ongoing orders.</p>
          </div>
        )}

        {activeTab === 'available' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <PackageCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Looking for Orders...</h2>
            <p className="text-gray-500 mt-2">You are online. Waiting for nearby orders.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyDeliveries.map((delivery, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#1E8C45]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{delivery.restaurant}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{delivery.date}</span>
                      <span>•</span>
                      <span>{delivery.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{delivery.earnings}</p>
                    <p className="text-xs font-bold text-[#1E8C45] uppercase tracking-wider">{delivery.status}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
