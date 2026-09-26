import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, MapPin, Users, AlertTriangle, Package, ChevronRight, RefreshCw, MessageSquare, Bike } from 'lucide-react';

export default function DispatcherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('live');

  const liveOrders = [
    { id: '#ORD-1105', customer: 'Abebe T.', vendor: 'Burger Joint', rider: 'Unassigned', status: 'PENDING', time: '2 min ago' },
    { id: '#ORD-1103', customer: 'Sara M.', vendor: 'Pizza Palace', rider: 'Dawit K.', status: 'EN_ROUTE', time: '12 min ago' },
    { id: '#ORD-1100', customer: 'Dawit K.', vendor: 'Burger Joint', rider: 'Teshome G.', status: 'PICKED_UP', time: '18 min ago' },
  ];

  const availableRiders = [
    { name: 'Dawit K.', status: 'Online', location: 'Bole, Addis Ababa', activeOrders: 1 },
    { name: 'Teshome G.', status: 'Online', location: 'Megenagna', activeOrders: 1 },
    { name: 'Biniam A.', status: 'Offline', location: 'Last seen: Piazza', activeOrders: 0 },
  ];

  const exceptions = [
    { id: '#ORD-1098', issue: 'Rider delayed 15+ min at pickup', rider: 'Dawit K.', time: '5 min ago' },
    { id: '#ORD-1090', issue: 'Customer reports missing item', rider: 'Teshome G.', time: '30 min ago' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PREPARING': return 'bg-blue-100 text-blue-700';
      case 'EN_ROUTE': return 'bg-purple-100 text-purple-700';
      case 'PICKED_UP': return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED': return 'bg-green-100 text-[#1E8C45]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Operations Center</h1>
              <p className="text-gray-500 font-medium">Live dispatch control • {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm font-bold text-[#1E8C45]">
              2 Riders Online
            </div>
            <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-bold text-yellow-700">
              3 Active Orders
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'live', label: 'Live Orders' },
            { key: 'riders', label: 'Rider Status' },
            { key: 'exceptions', label: 'Exceptions' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-[#F5B820] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Orders */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {liveOrders.map((order, idx) => (
              <div key={idx} className={`bg-white rounded-2xl shadow-sm border p-6 ${order.rider === 'Unassigned' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.customer} → {order.vendor} • {order.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bike className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-bold ${order.rider === 'Unassigned' ? 'text-red-600' : 'text-gray-700'}`}>
                      {order.rider}
                    </span>
                  </div>
                  {order.rider === 'Unassigned' && (
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors">
                      Assign Rider
                    </button>
                  )}
                  {order.rider !== 'Unassigned' && (
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rider Status */}
        {activeTab === 'riders' && (
          <div className="space-y-4">
            {availableRiders.map((rider, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rider.status === 'Online' ? 'bg-green-50 text-[#1E8C45]' : 'bg-gray-100 text-gray-400'}`}>
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{rider.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />{rider.location} • {rider.activeOrders} active orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rider.status === 'Online' ? 'bg-green-50 text-[#1E8C45]' : 'bg-gray-100 text-gray-500'}`}>
                    {rider.status}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exceptions */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            {exceptions.map((ex, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border-2 border-red-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 mt-1">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{ex.id} — {ex.issue}</h4>
                    <p className="text-xs text-gray-500 mt-1">Rider: {ex.rider} • {ex.time}</p>
                    <div className="flex space-x-3 mt-4">
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                        Contact Rider
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                        Contact Customer
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
