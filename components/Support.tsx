
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, PlayCircle, BookOpen, MessageSquarePlus, Lightbulb, Bug, CheckCircle2, Clock, XCircle, Send, FileText, Video } from 'lucide-react';
import { MOCK_GUIDES, MOCK_FEEDBACK_HISTORY } from '../services/mockData';
import { GuideArticle, FeedbackItem } from '../types';

// --- GUIDE PAGE ---
export const GuidePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [activeArticle, setActiveArticle] = useState<GuideArticle | null>(null);

  const categories = ['Tất cả', ...Array.from(new Set(MOCK_GUIDES.map(g => g.category)))];

  const filteredGuides = MOCK_GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || guide.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> Hướng dẫn sử dụng
        </h2>
        <p className="text-sm text-slate-500 mt-1">Tài liệu, video hướng dẫn và câu hỏi thường gặp.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Sidebar / List */}
        <div className={`flex flex-col gap-4 w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${activeArticle ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm hướng dẫn..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredGuides.map(guide => (
              <div 
                key={guide.id} 
                onClick={() => setActiveArticle(guide)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${activeArticle?.id === guide.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-indigo-100 shadow-sm">{guide.category}</span>
                  <div className="flex items-center text-[10px] text-slate-400 gap-1">
                    <PlayCircle size={12}/> Video
                  </div>
                </div>
                <h3 className={`font-bold text-sm mb-1 ${activeArticle?.id === guide.id ? 'text-indigo-900' : 'text-slate-800'}`}>{guide.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{guide.summary}</p>
              </div>
            ))}
            {filteredGuides.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">Không tìm thấy bài viết nào.</div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className={`flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden ${activeArticle ? 'flex' : 'hidden lg:flex'}`}>
          {activeArticle ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 lg:hidden">
                <button onClick={() => setActiveArticle(null)} className="p-1 hover:bg-slate-100 rounded">
                  <ChevronDown className="rotate-90" size={24}/>
                </button>
                <span className="font-bold text-slate-700">Quay lại danh sách</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl mx-auto">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-4">{activeArticle.category}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{activeArticle.title}</h1>
                  
                  {activeArticle.videoUrl && (
                    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-8 shadow-lg relative group">
                      {/* Placeholder for video iframe */}
                      <iframe 
                        className="w-full h-full"
                        src={activeArticle.videoUrl} 
                        title={activeArticle.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none">
                    <p className="lead text-lg text-slate-600 mb-6">{activeArticle.summary}</p>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                        {activeArticle.content}
                    </div>
                    {/* Mock long content */}
                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Các bước thực hiện</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                        <li>Đăng nhập vào hệ thống OmniSales.</li>
                        <li>Truy cập vào menu tương ứng trên thanh bên trái.</li>
                        <li>Nhấn vào nút hành động (Ví dụ: Thêm mới, Đồng bộ).</li>
                        <li>Điền đầy đủ thông tin theo yêu cầu.</li>
                        <li>Nhấn "Lưu" hoặc "Xác nhận" để hoàn tất.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <BookOpen size={32} className="text-indigo-300" />
              </div>
              <p className="font-medium text-slate-600">Chọn một bài hướng dẫn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- FEEDBACK PAGE ---
export const FeedbackPage: React.FC = () => {
  const [formData, setFormData] = useState({
    type: 'feature' as 'feature' | 'bug' | 'other',
    title: '',
    content: '',
    email: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<FeedbackItem[]>(MOCK_FEEDBACK_HISTORY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Vui lòng điền tiêu đề và nội dung.");

    setIsSending(true);
    // Simulate API
    setTimeout(() => {
      const newItem: FeedbackItem = {
        id: `f-${Date.now()}`,
        type: formData.type,
        title: formData.title,
        content: formData.content,
        status: 'pending',
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      setHistory([newItem, ...history]);
      setIsSending(false);
      setFormData({ type: 'feature', title: '', content: '', email: '' });
      alert("Đã gửi góp ý thành công!");
    }, 1000);
  };

  const getStatusBadge = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Đã xử lý</span>;
      case 'processing': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12}/> Đang xử lý</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Từ chối</span>;
      default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12}/> Chờ tiếp nhận</span>;
    }
  };

  const getTypeIcon = (type: FeedbackItem['type']) => {
      switch(type) {
          case 'feature': return <Lightbulb size={16} className="text-orange-500" />;
          case 'bug': return <Bug size={16} className="text-red-500" />;
          default: return <MessageSquarePlus size={16} className="text-blue-500" />;
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in pb-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquarePlus className="text-indigo-600" /> Góp ý tính năng & Báo lỗi
          </h2>
          <p className="text-sm text-slate-500 mt-1">Ý kiến của bạn giúp OmniSales ngày càng hoàn thiện hơn.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: FORM */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
                <Send size={16} className="text-indigo-600"/> Gửi góp ý mới
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'feature', label: 'Tính năng', icon: Lightbulb, color: 'border-orange-200 bg-orange-50 text-orange-700' },
                            { id: 'bug', label: 'Báo lỗi', icon: Bug, color: 'border-red-200 bg-red-50 text-red-700' },
                            { id: 'other', label: 'Khác', icon: MessageSquarePlus, color: 'border-blue-200 bg-blue-50 text-blue-700' },
                        ].map(item => (
                            <div 
                                key={item.id}
                                onClick={() => setFormData({...formData, type: item.id as any})}
                                className={`cursor-pointer rounded-lg p-3 border transition-all flex flex-col items-center text-center gap-1 ${
                                    formData.type === item.id ? item.color + ' border-transparent' : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <item.icon size={20} />
                                <div className="font-bold text-xs">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder={formData.type === 'feature' ? 'Ví dụ: Thêm tính năng in hàng loạt...' : 'Ví dụ: Lỗi không đồng bộ đơn hàng...'}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                            <textarea 
                                rows={6}
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                placeholder="Mô tả chi tiết vấn đề hoặc ý tưởng của bạn..."
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email liên hệ (Tùy chọn)</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="Để chúng tôi phản hồi lại bạn"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="pt-2">
                            <button 
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {isSending ? 'Đang gửi...' : <><Send size={18}/> Gửi phản hồi</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
               <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-600"/> Lịch sử phản hồi</span>
               <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="opacity-50"/>
                        </div>
                        <p>Bạn chưa gửi góp ý nào.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {history.map(item => (
                            <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                                            <div className="text-xs text-slate-500">{item.createdAt}</div>
                                        </div>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>
                                
                                <div className="pl-11">
                                    <p className="text-slate-600 text-sm mb-3">
                                        {item.content}
                                    </p>
                                    
                                    {item.adminResponse && (
                                        <div className="flex gap-2 mt-3 animate-fade-in bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                                                OS
                                            </div>
                                            <div>
                                                <span className="font-bold block text-xs mb-0.5 text-indigo-700">Admin phản hồi:</span>
                                                <p className="text-slate-700 text-sm">{item.adminResponse}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
