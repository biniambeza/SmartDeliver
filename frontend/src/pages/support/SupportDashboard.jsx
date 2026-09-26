import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Headphones, Search, MessageSquare, Eye, ArrowUpRight, ChevronRight, Clock, User, ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchQuery, setSearchQuery] = useState('');

  const openTickets = [
    { id: 'TKT-401', customer: 'Abebe T.', subject: 'Missing item in order #ORD-1098', priority: 'High', time: '5 min ago', status: 'Open' },
    { id: 'TKT-399', customer: 'Helen G.', subject: 'Refund request for cancelled order', priority: 'Medium', time: '20 min ago', status: 'Open' },
    { id: 'TKT-395', customer: 'Meron A.', subject: 'Driver was rude', priority: 'Low', time: '1 hour ago', status: 'In Progress' },
  ];

  const recentLookups = [
    { type: 'Order', id: '#ORD-1105', customer: 'Abebe T.', vendor: 'Burger Joint', total: '$18.50', status: 'PREPARING' },
    { type: 'Order', id: '#ORD-1098', customer: 'Sara M.', vendor: 'Pizza Palace', total: '$12.00', status: 'DELIVERED' },
  ];

  const priorityColor = (p) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-700';
      case 'Medium': return 'bg-yellow-50 text-yellow-700';
      case 'Low': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Support Center</h1>
              <p className="text-gray-500 font-medium">Customer service • {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-full text-sm font-bold text-red-700">
              {openTickets.filter(t => t.status === 'Open').length} Open Tickets
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, users, or tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { key: 'tickets', label: 'Open Tickets' },
            { key: 'lookup', label: 'Order Lookup' },
            { key: 'refunds', label: 'Refunds' },
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

        {/* Open Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {openTickets.map((ticket, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mt-1">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{ticket.subject}</h4>
                      <p className="text-xs text-gray-500 mt-1">{ticket.id} • {ticket.customer} • {ticket.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Order</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Lookup */}
        {activeTab === 'lookup' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">View-only access to order and user details for troubleshooting.</p>
            {recentLookups.map((order, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{order.id} — {order.vendor}</h4>
                    <p className="text-xs text-gray-500 mt-1">Customer: {order.customer} • {order.total}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                    {order.status}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refunds */}
        {activeTab === 'refunds' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No Pending Refunds</h2>
            <p className="text-gray-500 mt-2">Refund requests from customers will appear here for processing within policy limits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
