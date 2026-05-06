
import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send, User, Loader2, Minimize2, Maximize2, Sparkles, ChevronLeft } from 'lucide-react';
import { generateBusinessInsight } from '../services/geminiService';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CONVERSATIONS } from '../services/mockData';
import { Platform } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  const logoUrl = LOGOS[platform];
  if (logoUrl) {
    return <img src={logoUrl} alt={platform} className="h-4 w-auto object-contain" />;
  }
  return null;
};

const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'chat'>('ai');
  const [isExpanded, setIsExpanded] = useState(false);

  // AI State
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Chào bạn! Tôi là trợ lý AI OmniSales. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'ai') {
      aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, activeTab, isOpen]);

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const responseText = await generateBusinessInsight(userMsg.text, MOCK_PRODUCTS, MOCK_ORDERS);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setAiMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Xin lỗi, tôi đang gặp sự cố kết nối.",
        timestamp: new Date()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  };

  const renderContent = () => {
    if (activeTab === 'ai') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center ${msg.sender === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                    {msg.sender === 'user' ? <User size={14} className="text-slate-600" /> : <Bot size={14} className="text-indigo-600" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2 text-slate-500 text-sm ml-8">
                  <Loader2 size={14} className="animate-spin" /> AI đang soạn tin...
                </div>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={handleAiKeyPress}
                placeholder="Hỏi về đơn hàng, tồn kho..."
                className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleAiSend}
                disabled={!aiInput.trim() || isAiLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'chat') {
      if (selectedChatId) {
        const conversation = MOCK_CONVERSATIONS.find(c => c.id === selectedChatId);
        if (!conversation) return null;

        return (
           <div className="flex flex-col h-full">
              <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                 <button onClick={() => setSelectedChatId(null)} className="p-1 hover:bg-white rounded-full"><ChevronLeft size={18} /></button>
                 <img src={conversation.avatar} className="w-8 h-8 rounded-full" />
                 <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{conversation.customerName}</div>
                    <PlatformIcon platform={conversation.platform} />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
                 {conversation.messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`p-2 rounded-lg text-sm max-w-[80%] ${
                          m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                       }`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 <div className="text-center text-xs text-slate-400 mt-2">Đang xem bản xem trước</div>
              </div>
              <div className="p-3 border-t border-slate-100">
                 <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    Mở trang tin nhắn đầy đủ
                 </button>
              </div>
           </div>
        );
      }

      return (
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          {MOCK_CONVERSATIONS.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => setSelectedChatId(conv.id)}
              className="p-3 flex gap-3 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
            >
              <div className="relative">
                <img src={conv.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-[10px] text-white font-bold">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                    {conv.customerName}
                  </span>
                  <span className="text-[10px] text-slate-400">{conv.timestamp}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">{conv.lastMessage}</p>
                  <PlatformIcon platform={conv.platform} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-transform hover:scale-110 z-50 group"
      >
        <Bot size={28} className="absolute transition-opacity opacity-100 group-hover:opacity-0" />
        <MessageCircle size={28} className="absolute transition-opacity opacity-0 group-hover:opacity-100" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">3</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300 overflow-hidden ${isExpanded ? 'w-[450px] h-[600px]' : 'w-[350px] h-[500px]'}`}>
      {/* Header */}
      <div className="p-3 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
             {activeTab === 'ai' ? <Sparkles size={16} /> : <MessageCircle size={16} />}
           </div>
           <span className="font-bold text-sm">
             {activeTab === 'ai' ? 'Trợ lý AI Gemini' : 'Tin nhắn nhanh'}
           </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors text-indigo-100 hover:text-white"
            title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors text-indigo-100 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 shrink-0">
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
            activeTab === 'ai' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Sparkles size={14} /> Trợ lý AI
          {activeTab === 'ai' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
            activeTab === 'chat' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MessageCircle size={14} /> Tin nhắn
          <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">3</span>
          {activeTab === 'chat' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default FloatingAssistant;
