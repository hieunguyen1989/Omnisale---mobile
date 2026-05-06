
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_TAX_TICKETS } from '../services/mockData';
import { 
  Send, Paperclip, FileText, Plus, Search, Clock, CheckCircle2, 
  MoreVertical, Headphones, X, Filter, Tag, ChevronLeft, AlertCircle, 
  Download, Info, User, ShieldCheck, HelpCircle,
  MessageSquare, History, Image as ImageIcon, ChevronRight, LayoutGrid,
  // Added Sparkles import to fix "Cannot find name 'Sparkles'" error on line 339
  Sparkles
} from 'lucide-react';
import { TaxTicket, TaxMessage } from '../types';

const TaxService: React.FC = () => {
  const [tickets, setTickets] = useState<TaxTicket[]>(MOCK_TAX_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(MOCK_TAX_TICKETS[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Hiển thị 7 mục mỗi trang cho cân đối
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeTicketId) return;
    const newMessage: TaxMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: inputText,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    };
    setTickets(prev => prev.map(t => t.id === activeTicketId ? { ...t, updatedAt: 'Vừa xong', messages: [...t.messages, newMessage] } : t));
    setInputText('');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'processing': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'closed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  // Pagination Logic
  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in space-y-4">
      {/* Header Section - Blue Glossy with low rounding */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-indigo-50 shadow-lg shadow-indigo-50/40">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-lg shadow-md shadow-indigo-100 ring-4 ring-indigo-50">
            <Headphones size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Trung tâm Hỗ trợ Thuế</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Premium Tax Assistance</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="hidden sm:flex items-center gap-4 px-6 py-1 border-r border-slate-100">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Đang xử lý</p>
                <p className="text-lg font-black text-indigo-600">{tickets.filter(t => t.status !== 'closed').length}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Hoàn tất</p>
                <p className="text-lg font-black text-emerald-600">{tickets.filter(t => t.status === 'closed').length}</p>
             </div>
          </div>
          <button 
            onClick={() => setIsNewTicketModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Tạo yêu cầu
          </button>
        </div>
      </div>

      {/* 3 Columns Grid */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* COL 1: Ticket List - Low Curvature (rounded-xl) */}
        <div className="w-80 flex flex-col space-y-3 shrink-0 h-full">
          <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm yêu cầu..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {currentTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group overflow-hidden ${
                  activeTicketId === ticket.id 
                  ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-100/50' 
                  : 'bg-white border-slate-100 hover:border-indigo-100'
                }`}
              >
                {activeTicketId === ticket.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>}
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">{ticket.updatedAt}</span>
                </div>
                <h4 className={`text-xs font-black leading-tight mb-2 ${activeTicketId === ticket.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {ticket.subject}
                </h4>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">#</div>
                      <span className="text-[10px] font-mono text-slate-400">{ticket.id}</span>
                   </div>
                   <div className="flex gap-1">
                      {ticket.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="text-[8px] text-indigo-400 font-bold uppercase">{tag}</span>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - Simple Style */}
          {totalPages > 1 && (
            <div className="bg-white p-2 rounded-xl border border-indigo-50 flex items-center justify-between shadow-sm">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-indigo-50 text-indigo-600 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trang {currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-indigo-50 text-indigo-600 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
          )}
        </div>

        {/* COL 2: Interaction Window - Modern Minimal rounded-xl */}
        <div className="flex-1 bg-white rounded-xl border border-indigo-50 shadow-xl shadow-indigo-50/30 flex flex-col overflow-hidden relative">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-indigo-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-none">{activeTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chuyên gia đang hỗ trợ</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                {activeTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isSystem = msg.sender === 'system';
                  if (isSystem) return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="bg-slate-200/50 backdrop-blur-sm text-[9px] font-black uppercase text-slate-500 px-3 py-1 rounded-full border border-slate-200 tracking-tighter">
                        {msg.content}
                      </span>
                    </div>
                  );
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm border transition-all ${
                          isUser 
                          ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                        }`}>
                          {msg.type === 'file' ? (
                            <div className="flex items-center gap-4 py-1 pr-2">
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUser ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                  <FileText size={20}/>
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="font-bold text-xs truncate">{msg.fileName}</p>
                                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-tight">Tài liệu</p>
                               </div>
                               <button className={`p-2 rounded-lg ${isUser ? 'hover:bg-white/10' : 'hover:bg-indigo-100 text-indigo-600'}`}><Download size={16}/></button>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                          )}
                        </div>
                        <span className="text-[8px] font-black text-slate-300 mt-1.5 uppercase px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-indigo-50">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 bg-slate-50 rounded-xl p-1.5 flex items-end border border-slate-200 focus-within:border-indigo-400 focus-within:bg-white transition-all">
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600"><Paperclip size={20}/></button>
                    <textarea 
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Nhập câu hỏi tại đây..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none text-slate-700 font-medium max-h-32"
                    />
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600"><ImageIcon size={20}/></button>
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 transition-all shrink-0"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                <MessageSquare size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Chưa chọn yêu cầu</h3>
              <p className="max-w-xs text-xs font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Vui lòng chọn một phiên hỗ trợ từ cột bên trái để bắt đầu trao đổi.</p>
            </div>
          )}
        </div>

        {/* COL 3: Detailed Side Panel - Low Curvature rounded-xl */}
        <div className="w-72 flex flex-col space-y-4 shrink-0 overflow-hidden">
          <div className="bg-white p-5 rounded-xl border border-indigo-50 shadow-md space-y-5">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin hồ sơ</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100"><User size={18}/></div>
                 <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Đối tượng</p>
                    <p className="text-xs font-bold text-slate-800 truncate">Nguyễn Văn Chủ</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100"><ShieldCheck size={18}/></div>
                 <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Mã số thuế</p>
                    <p className="text-xs font-mono font-bold text-slate-800">8765432109</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white p-5 rounded-xl border border-indigo-50 shadow-md flex flex-col space-y-6 overflow-hidden">
             <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Danh sách tệp tin</h4>
                <div className="space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
                   {activeTicket?.messages.filter(m => m.type === 'file').map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                        <FileText size={14} className="text-indigo-400 group-hover:text-indigo-600"/>
                        <span className="text-[10px] font-bold text-slate-600 truncate">{file.fileName}</span>
                      </div>
                   ))}
                   {activeTicket?.messages.filter(m => m.type === 'file').length === 0 && (
                      <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-lg">
                         <p className="text-[9px] text-slate-400 font-bold uppercase">Trống</p>
                      </div>
                   )}
                </div>
             </div>

             <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tiến trình nộp thuế</h4>
                <div className="space-y-2.5">
                   {[
                      { label: 'Tờ khai Quý 1', date: 'Xong', done: true },
                      { label: 'Nộp thuế Quý 1', date: '30/04', done: false },
                      { label: 'Tờ khai Quý 2', date: '31/07', done: false }
                   ].map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${item.done ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                         <div>
                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">{item.label}</p>
                            <p className="text-[8px] text-indigo-500 font-bold">{item.date}</p>
                         </div>
                         {item.done ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Clock size={14} className="text-slate-300"/>}
                      </div>
                   ))}
                </div>
             </div>

             <div className="mt-auto bg-slate-900 p-4 rounded-xl text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                <div className="flex items-center gap-2 mb-1">
                   <Sparkles size={12} className="text-indigo-400"/>
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Trợ lý AI</p>
                </div>
                <p className="text-[10px] font-bold leading-snug">Kiểm tra rủi ro hồ sơ thuế của bạn</p>
                <div className="mt-2 flex justify-end">
                   <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal - rounded-xl */}
      {isNewTicketModalOpen && (
         <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-indigo-50">
               <div className="p-6 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Yêu cầu tư vấn mới</h3>
                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-0.5">Kết nối chuyên gia sau 30s</p>
                  </div>
                  <button onClick={() => setIsNewTicketModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-all"><X size={20}/></button>
               </div>
               <div className="p-6 space-y-5">
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Chủ đề hỗ trợ</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" placeholder="VD: Sai doanh thu Shopee, Đối soát thuế..."/>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nội dung chi tiết</label>
                     <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none" placeholder="Vấn đề bạn đang gặp phải là gì?"/>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                     <button onClick={() => setIsNewTicketModalOpen(false)} className="px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Hủy bỏ</button>
                     <button onClick={() => setIsNewTicketModalOpen(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Gửi yêu cầu</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TaxService;
