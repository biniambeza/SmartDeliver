import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, PackageCheck, Bike, Clock, CheckCircle2, ChevronRight, Navigation, Power } from 'lucide-react';

export default function RiderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // orders, earnings
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  
  // Mock available order
  const availableOrder = {
    id: '#ORD-1102',
    restaurant: 'Burger Joint',
    pickup: '123 Main St (2.1 km)',
    dropoff: '456 Oak Ave (4.5 km)',
    payout: '$8.50',
  };

  // Mock earnings history
  const historyDeliveries = [
    { id: '#ORD-9821', date: 'Today, 2:30 PM', restaurant: 'Burger Joint', earnings: '$5.40', status: 'Delivered' },
    { id: '#ORD-9810', date: 'Today, 1:15 PM', restaurant: 'Pizza Palace', earnings: '$7.20', status: 'Delivered' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Status Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${isOnline ? 'bg-[#1E8C45]' : 'bg-gray-400'}`}>
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Rider Dispatch</h1>
              <p className="text-gray-500 font-medium">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-sm border border-gray-100 pr-6">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`p-3 rounded-full text-white shadow-md transition-colors ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1E8C45] hover:bg-green-600'}`}
            >
              <Power className="w-5 h-5" />
            </button>
            <span className={`font-bold ${isOnline ? 'text-[#1E8C45]' : 'text-gray-400'}`}>
              {isOnline ? 'You are Online' : 'You are Offline'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Current Orders
          </button>
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'earnings' ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Earnings & History
          </button>
        </div>

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {!isOnline ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                <Power className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">You are Offline</h2>
                <p className="text-gray-500 mt-2">Toggle your status to online to start receiving orders.</p>
              </div>
            ) : !activeOrder ? (
              <div className="bg-white rounded-3xl shadow-sm border border-[#1E8C45] border-opacity-50 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#1E8C45] animate-pulse"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-[#1E8C45] animate-ping mr-3"></span>
                  New Delivery Request
                </h2>
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg">{availableOrder.restaurant}</p>
                      <p className="text-gray-500 text-sm">Order {availableOrder.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#1E8C45]">{availableOrder.payout}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Payout</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1"><MapPin className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
                        <p className="font-medium text-gray-800">{availableOrder.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-1"><Navigation className="w-5 h-5 text-[#1E8C45]" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Drop-off</p>
                        <p className="font-medium text-gray-800">{availableOrder.dropoff}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Reject
                  </button>
                  <button 
                    onClick={() => setActiveOrder('PICKUP')}
                    className="flex-1 py-4 bg-[#F5B820] text-gray-900 font-black rounded-xl hover:bg-yellow-400 transition-colors shadow-sm"
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Active Delivery</h2>
                  <span className="bg-[#1E8C45] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {activeOrder === 'PICKUP' ? 'En Route to Pickup' : activeOrder === 'TRANSIT' ? 'In Transit' : 'Delivered'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
                  <Navigation className="w-12 h-12 text-[#1E8C45] mx-auto mb-2" />
                  <p className="font-bold text-gray-900 text-lg">GPS Navigation Active</p>
                  <p className="text-gray-500 text-sm">Follow the route on your map application.</p>
                </div>
                <div className="space-y-4">
                  {activeOrder === 'PICKUP' && (
                    <button 
                      onClick={() => setActiveOrder('TRANSIT')}
                      className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Confirm Order Picked Up
                    </button>
                  )}
                  {activeOrder === 'TRANSIT' && (
                    <button 
                      onClick={() => setActiveOrder(null)} // finish delivery
                      className="w-full py-4 bg-[#1E8C45] text-white font-black rounded-xl shadow-sm hover:bg-green-600 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Earnings */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Today's Earnings</p>
                <p className="text-4xl font-black text-[#1E8C45] mt-1">$12.60</p>
              </div>
              <button className="px-6 py-3 bg-gray-100 font-bold text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Cash Out
              </button>
            </div>
            
            <h3 className="font-black text-gray-900 text-lg mt-8 mb-4">Payout History</h3>
            <div className="space-y-3">
              {historyDeliveries.map((delivery, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1E8C45]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{delivery.restaurant}</h3>
                      <p className="text-xs text-gray-500 mt-1">{delivery.date} • {delivery.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg">{delivery.earnings}</p>
                    <p className="text-[10px] font-bold text-[#1E8C45] uppercase tracking-wider">{delivery.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
