import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, X, Send, Sparkles, Loader2, MessageSquare, 
  HelpCircle, ShieldCheck, ChevronDown, RefreshCw
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AiSupportDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Salam! I am your SmartDeliver AI Assistant. Ask me about your orders, Addis Ababa store menus, delivery rates, or escrow payment verification.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend.trim() });
      const botReply = res.data.reply || 'I am looking into this for you!';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      const fallbackReply = err.response?.data?.error || 
        'Sorry, I could not connect to the AI engine right now. Please try asking again in a moment.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Where is my latest order?',
    'What is the delivery fee in Addis?',
    'How does Telebirr escrow protection work?',
    'Recommend traditional Ethiopian food',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#1E8C45] hover:bg-[#166B35] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center space-x-2 border-2 border-white/20"
        title="SmartDeliver AI Support"
      >
        <Sparkles className="w-5 h-5 text-[#F5B820] animate-spin-slow" />
        <span className="font-bold text-sm hidden sm:inline">AI Support</span>
        <Bot className="w-5 h-5" />
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100 animate-slide-in">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-[#1E8C45] text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#F5B820]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm flex items-center">
                  SmartDeliver Assistant
                  <span className="ml-2 w-2 h-2 rounded-full bg-[#F5B820] animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-white/80">Order-aware • Gemini AI Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full font-medium transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#1E8C45] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-gray-400 p-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E8C45]" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={user ? "Ask about your order or food..." : "Ask anything (sign in for order context)..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1E8C45] focus:bg-white outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#1E8C45] hover:bg-[#166B35] disabled:opacity-50 text-white shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
