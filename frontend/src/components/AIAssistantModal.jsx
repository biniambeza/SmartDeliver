import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import api from '../lib/api';

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Welcome to SmartDeliver AI! I can help you discover vendors, track orders, recommend Ethiopian dishes, or answer any delivery questions. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E8C45] flex items-center justify-center text-white shadow-md shadow-[#1E8C45]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-gray-900">AI Support</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1E8C45] border border-[#1E8C45]/20 text-[10px] font-bold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E8C45] mr-1 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-[#F5B820]" />
                SmartDeliver Intelligent Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-[#F5B820] text-white'
                    : 'bg-[#1E8C45] text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#F5B820] text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-xs'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#1E8C45] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#F5B820] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#F5B820] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-[#F5B820] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex items-center space-x-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about orders, vendors..."
            className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:border-[#F5B820] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B820]/20 transition-all"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#F5B820] hover:bg-[#E5A910] text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#F5B820]/20 disabled:opacity-40"
          >
            {isThinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
