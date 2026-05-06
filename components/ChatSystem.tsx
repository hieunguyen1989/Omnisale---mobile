
import React, { useState, useMemo } from 'react';
import { MOCK_CONVERSATIONS, MOCK_ORDERS } from '../services/mockData';
import { Conversation, Platform, Order } from '../types';
import { 
  Search, Send, Phone, Video, Info, Filter, 
  CheckCircle2, ShoppingBag, Star, 
  Tag, AlertCircle, ClipboardList, Plus, ChevronLeft
} from 'lucide-react';

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const QUICK_REPLIES = [
  "Chào bạn, shop có thể giúp gì cho bạn ạ?",
  "Dạ sản phẩm này còn hàng bạn nhé!",
  "Dạ shop đã nhận được đơn và sẽ gửi đi sớm nhất ạ.",
  "Bạn vui lòng kiểm tra inbox để nhận mã giảm giá nhé!",
  "Shop xin lỗi vì sự bất tiện này ạ."
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const PlatformBadge: React.FC<{ platform: Platform }> = ({ platform }) => {
  const logoUrl = LOGOS[platform];
  if (logoUrl) {
    return <img src={logoUrl} alt={platform} className="h-4 w-auto object-contain" title={platform} />;
  }
  return <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-gray-100 text-gray-600">{platform}</span>;
};

const ChatSystem: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null); // Nullable for mobile initial state
  const [inputText, setInputText] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false); // Default hidden on mobile

  // Derived Data
  const activeConversation = conversations.find(c => c.id === selectedId);

  // Mock Customer CRM Data based on active conversation
  const customerOrders = useMemo(() => {
    if (!activeConversation) return [];
    // In a real app, filter by customer ID. Here we mock some random orders for demo.
    return MOCK_ORDERS.slice(0, 3).map(o => ({
      ...o,
      status: Math.random() > 0.5 ? 'delivered' : 'processing'
    })) as Order[];
  }, [selectedId]);

  const customerStats = {
    totalSpent: customerOrders.reduce((sum, o) => sum + o.total, 0),
    totalOrders: 12,
    rating: 4.8,
    tags: ['Khách quen', 'Thích freeship']
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || c.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'unread' ? c.unreadCount > 0 : c.unreadCount === 0;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim() || !activeConversation) return;

    const newMessage = {
      id: `new_${Date.now()}`,
      text: text,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: text,
          timestamp: 'Vừa xong',
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex animate-fade-in relative">
      
      {/* LEFT SIDEBAR: LIST */}
      <div className={`w-full lg:w-80 border-r border-slate-100 flex-col shrink-0 transition-all duration-300 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 space-y-3">
           <div className="flex justify-between items-center">
             <h2 className="font-bold text-slate-800 text-lg">Tin nhắn</h2>
             <div className="flex gap-1">
                <button title="Lọc tin nhắn" className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                   <Filter size={18} />
                </button>
             </div>
           </div>
           
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Tìm tên, số điện thoại..." 
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
           </div>

           {/* Quick Filters */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${filterStatus === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setFilterStatus('unread')}
                className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${filterStatus === 'unread' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Chưa đọc
              </button>
              <select 
                 value={filterPlatform}
                 onChange={(e) => setFilterPlatform(e.target.value as any)}
                 className="px-2 py-1 text-xs font-medium rounded-full border border-slate-200 text-slate-600 bg-white focus:outline-none focus:border-indigo-300"
              >
                 <option value="all">Tất cả sàn</option>
                 {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
             <div className="text-center p-8 text-slate-400 text-sm">Không tìm thấy hội thoại nào.</div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 group ${selectedId === conv.id ? 'bg-indigo-50/60 border-indigo-100' : ''}`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} alt={conv.customerName} className="w-10 h-10 rounded-full object-cover" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                      {conv.unreadCount}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                     <PlatformBadge platform={conv.platform} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 group-hover:text-indigo-500">{conv.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[140px] ${conv.unreadCount > 0 ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                      {conv.sender === 'user' ? 'Bạn: ' : ''}{conv.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER: CHAT WINDOW */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50/30 ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  className="lg:hidden p-1 -ml-1 text-slate-500 hover:bg-slate-100 rounded-full"
                  onClick={() => setSelectedId(null)}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="relative">
                   <img src={activeConversation.avatar} alt={activeConversation.customerName} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="truncate max-w-[120px] md:max-w-none">{activeConversation.customerName}</span>
                    <span className="hidden md:inline-block text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                       Khách mới
                    </span>
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <PlatformBadge platform={activeConversation.platform} /> 
                    <span className="hidden md:inline">• Online 5 phút trước</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <button className="p-2 hover:bg-slate-50 rounded-full text-indigo-600 bg-indigo-50" title="Gọi điện"><Phone size={18} /></button>
                <button className="hidden md:block p-2 hover:bg-slate-50 rounded-full" title="Video call"><Video size={18} /></button>
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
                <button 
                   onClick={() => setShowRightPanel(!showRightPanel)}
                   className={`p-2 hover:bg-slate-50 rounded-full ${showRightPanel ? 'text-indigo-600 bg-indigo-50' : ''}`}
                   title="Thông tin khách hàng"
                >
                   <Info size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
              <div className="flex justify-center">
                 <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Hôm nay, {new Date().toLocaleDateString()}</span>
              </div>
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                     <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                       msg.sender === 'user' 
                       ? 'bg-indigo-600 text-white rounded-tr-none' 
                       : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                     }`}>
                       {msg.text}
                     </div>
                     <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                       {msg.sender === 'user' && <CheckCircle2 size={10} className="text-indigo-600" />}
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t border-slate-100">
              {/* Quick Replies */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                 {QUICK_REPLIES.map((reply, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendMessage(reply)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </button>
                 ))}
              </div>

              <div className="flex gap-2 items-end">
                <button className="text-slate-400 hover:text-indigo-600 p-2.5 hover:bg-slate-50 rounded-full transition-colors hidden md:block"><Plus size={20} /></button>
                <div className="flex-1 relative">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..." 
                    className="w-full pl-3 md:pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none text-sm"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
               <Send size={32} className="opacity-50 text-indigo-400" />
             </div>
             <p className="font-medium text-slate-600">Chào mừng trở lại!</p>
             <p className="text-sm">Chọn một hội thoại để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: CUSTOMER INFO - Overlay on Mobile, Sidebar on Desktop */}
      {activeConversation && showRightPanel && (
         <div className={`
            absolute inset-0 z-20 bg-white md:static md:w-80 border-l border-slate-100 flex flex-col overflow-y-auto shrink-0 animate-fade-in
         `}>
            {/* Header for mobile only */}
            <div className="md:hidden p-4 border-b border-slate-100 flex items-center gap-2">
               <button onClick={() => setShowRightPanel(false)}><ChevronLeft size={24}/></button>
               <h3 className="font-bold">Thông tin khách hàng</h3>
            </div>

            {/* Customer Profile */}
            <div className="p-6 text-center border-b border-slate-100">
               <div className="relative inline-block">
                  <img src={activeConversation.avatar} className="w-20 h-20 rounded-full mx-auto border-4 border-slate-50 shadow-sm object-cover" />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                     <PlatformBadge platform={activeConversation.platform} />
                  </div>
               </div>
               <h3 className="mt-3 font-bold text-slate-800 text-lg">{activeConversation.customerName}</h3>
               <div className="text-slate-500 text-xs mt-1">Khách hàng từ {activeConversation.platform}</div>
               
               <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                     <div className="flex items-center gap-1 justify-center text-orange-500 font-bold">
                        <Star size={14} fill="currentColor" /> {customerStats.rating}
                     </div>
                     <div className="text-[10px] text-slate-400">Đánh giá</div>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="text-center">
                     <div className="flex items-center gap-1 justify-center text-slate-700 font-bold">
                        {customerStats.totalOrders}
                     </div>
                     <div className="text-[10px] text-slate-400">Đơn hàng</div>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="text-center">
                     <div className="flex items-center gap-1 justify-center text-green-600 font-bold text-xs">
                        {new Intl.NumberFormat('en', { notation: "compact" }).format(customerStats.totalSpent)}
                     </div>
                     <div className="text-[10px] text-slate-400">Đã chi</div>
                  </div>
               </div>

               <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {customerStats.tags.map(tag => (
                     <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1">
                        <Tag size={10} /> {tag}
                     </span>
                  ))}
               </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 p-4 border-b border-slate-100">
               <button className="flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                  <ClipboardList size={14} /> Tạo đơn
               </button>
               <button className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                  <AlertCircle size={14} /> Báo xấu
               </button>
            </div>

            {/* Recent Orders */}
            <div className="p-4 border-b border-slate-100">
               <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-indigo-600" /> Đơn hàng gần đây
               </h4>
               <div className="space-y-3">
                  {customerOrders.length > 0 ? customerOrders.map((order, idx) => (
                     <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-indigo-700 font-mono group-hover:underline">{order.id}</span>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.status === 'delivered' ? 'Hoàn thành' : 'Đang xử lý'}
                           </span>
                        </div>
                        <div className="flex gap-2 items-center mb-2">
                           <img src={order.items[0]?.image} className="w-8 h-8 rounded object-cover border border-slate-200 bg-white" />
                           <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 truncate">{order.items[0]?.name}</p>
                              <p className="text-[10px] text-slate-400">{order.items.length} sản phẩm</p>
                           </div>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2 mt-1">
                           <span className="text-slate-500">{order.date.split(' ')[1]}</span>
                           <span className="font-bold text-slate-800">{formatCurrency(order.total)}</span>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-4 text-slate-400 text-xs italic">
                        Chưa có đơn hàng nào
                     </div>
                  )}
                  <button className="w-full py-2 text-xs text-indigo-600 font-medium hover:underline">
                     Xem tất cả lịch sử đơn hàng
                  </button>
               </div>
            </div>

            {/* Internal Notes */}
            <div className="p-4 flex-1 bg-yellow-50/30">
               <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <ClipboardList size={14} className="text-orange-500" /> Ghi chú nội bộ
               </h4>
               <textarea 
                  className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-slate-700 focus:ring-yellow-400 focus:border-yellow-400 resize-none min-h-[100px]"
                  placeholder="Nhập ghi chú về khách hàng này (chỉ nội bộ thấy)..."
                  defaultValue="Khách hàng thích được tặng quà nhỏ. Hơi khó tính về đóng gói."
               />
            </div>
         </div>
      )}
    </div>
  );
};

export default ChatSystem;
