
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, Calendar, Eye, Heart, Newspaper, TrendingUp, Clock, ChevronRight, Share2, MoreHorizontal, ExternalLink, Bookmark, Sparkles, Megaphone, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { MOCK_NEWS } from '../services/mockData';
import { NewsArticle } from '../types';

const NewsModule: React.FC = () => {
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'policy', label: 'Chính sách' },
    { id: 'market', label: 'Thị trường' },
    { id: 'tips', label: 'Mẹo bán hàng' },
    { id: 'tech', label: 'Công nghệ' },
  ];

  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           news.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || news.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNewsItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNews, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedNews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderListView = () => (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Search & Filter Header Row */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm bài viết..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Row: Equal Heights at 540px */}
      {activeCategory === 'all' && !searchTerm && currentPage === 1 && MOCK_NEWS.length >= 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            
            {/* 1. Slide Featured - 60% (3/5 columns) - Height Fixed at 540px */}
            <div 
                className="lg:col-span-3 group relative h-[540px] rounded-[2rem] overflow-hidden shadow-xl cursor-pointer transition-all duration-500"
                onClick={() => setSelectedNews(MOCK_NEWS[0])}
            >
                <img src={MOCK_NEWS[0].imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-[3s]" alt="Main" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-lg">TIN NỔI BẬT</span>
                        <span className="text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm bg-white/10 px-2 py-1 rounded-lg">
                           <Clock size={14} className="text-red-400"/> 5 phút đọc
                        </span>
                    </div>
                    <h3 className="text-white text-3xl md:text-5xl font-black leading-tight group-hover:text-indigo-200 transition-colors line-clamp-2 max-w-3xl drop-shadow-2xl tracking-tighter">
                        {MOCK_NEWS[0].title}
                    </h3>
                    <div className="flex items-center gap-6 text-slate-300 text-xs mt-8 pt-6 border-t border-white/10">
                        <span className="flex items-center gap-2 font-bold"><Calendar size={14} /> {MOCK_NEWS[0].date}</span>
                        <span className="flex items-center gap-2 font-bold"><Eye size={14} /> 2.4k lượt xem</span>
                    </div>
                </div>
            </div>

            {/* 2. Market Trends - 20% (1/5 columns) - Displaying 5 Items - Height Fixed at 540px */}
            <div className="lg:col-span-1 flex flex-col h-[540px]">
                <div className="flex items-center gap-2 px-1 mb-4 shrink-0">
                    <TrendingUp size={20} className="text-indigo-600" />
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">XU HƯỚNG THỊ TRƯỜNG</h4>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    {MOCK_NEWS.slice(1, 6).map((news, idx) => (
                        <div 
                            key={news.id} 
                            onClick={() => setSelectedNews(news)}
                            className="flex-1 bg-white rounded-2xl border border-slate-100 p-2 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-center min-h-0"
                        >
                            <div className="flex gap-3 h-full">
                                <div className="w-20 h-full max-h-16 rounded-xl overflow-hidden shrink-0 border border-slate-50 relative">
                                    <img src={news.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Trend" />
                                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-lg shadow-sm">
                                        {idx + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase w-fit mb-0.5 tracking-tighter bg-indigo-50 text-indigo-600">
                                        {news.category}
                                    </span>
                                    <h4 className="font-bold text-[11px] text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {news.title}
                                    </h4>
                                    <div className="text-[8px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                                        {news.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Advertising - 20% (1/5 columns) - Height Fixed at 540px */}
            <div className="lg:col-span-1 flex flex-col h-[540px]">
                <div className="flex items-center gap-2 px-1 mb-4 shrink-0">
                    <Megaphone size={20} className="text-indigo-600" />
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">QUẢNG CÁO</h4>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                   <div className="flex-1 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center group hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                      <ImageIcon size={32} className="mb-2 opacity-30 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">KHÔNG GIAN QUẢNG CÁO 1</span>
                   </div>
                   <div className="flex-1 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center group hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                      <ImageIcon size={32} className="mb-2 opacity-30 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">KHÔNG GIAN QUẢNG CÁO 2</span>
                   </div>
                </div>
            </div>
        </div>
      )}

      {/* Grid News Row - 5 Columns */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-1">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">ĐIỂM TIN MỚI NHẤT</h3>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {currentNewsItems.map(news => (
            <div 
                key={news.id} 
                onClick={() => setSelectedNews(news)}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
                <div className="relative aspect-video">
                    <img src={news.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="News" />
                    <div className="absolute top-4 left-4">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase shadow-xl backdrop-blur-md bg-indigo-600/90 text-white`}>
                            {news.category}
                        </span>
                    </div>
                    <button 
                        onClick={(e) => toggleLike(news.id, e)}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                            likedNews.has(news.id) ? 'bg-red-500 text-white shadow-red-200' : 'bg-white/70 text-slate-700 hover:bg-white shadow-sm'
                        }`}
                    >
                        <Heart size={16} fill={likedNews.has(news.id) ? "currentColor" : "none"} />
                    </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-800 text-sm md:text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3 h-12 overflow-hidden tracking-tight">
                        {news.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] md:text-xs line-clamp-3 mb-6 leading-relaxed font-medium flex-1">
                        {news.summary}
                    </p>
                    <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                        <span className="text-slate-700 flex items-center gap-1.5 truncate pr-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{news.source[0]}</div>
                            <span className="truncate opacity-80">{news.source}</span>
                        </span>
                        <span className="text-slate-400 whitespace-nowrap">{news.date}</span>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
            <Newspaper size={64} className="text-slate-200 mx-auto mb-6" />
            <h3 className="font-black text-slate-800 text-2xl tracking-tight">Không tìm thấy tin nào</h3>
            <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Hãy thử một từ khóa hoặc danh mục khác.</p>
        </div>
      )}

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isSelected = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all duration-300 ${
                    isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const renderDetailView = (article: NewsArticle) => (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-24">
        <div className="flex justify-between items-center">
            <button 
                onClick={() => setSelectedNews(null)}
                className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-black transition-all group"
            >
                <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <ChevronLeft size={20} />
                </div>
                Quay lại danh sách
            </button>
            <div className="flex gap-3">
                <button className="p-3.5 bg-white text-slate-500 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"><Share2 size={20}/></button>
                <button className="p-3.5 bg-white text-slate-500 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"><MoreHorizontal size={20}/></button>
            </div>
        </div>

        <article className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden relative">
            <div className="aspect-[21/9] w-full relative">
                <img src={article.imageUrl} className="w-full h-full object-cover" alt="Article Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12">
                    <span className={`text-[11px] font-black px-4 py-2 rounded-xl uppercase mb-6 inline-block tracking-[0.15em] shadow-2xl bg-indigo-600 text-white`}>
                        {article.category}
                    </span>
                    <h1 className="text-white text-3xl md:text-6xl font-black leading-tight drop-shadow-2xl tracking-tight">{article.title}</h1>
                </div>
            </div>

            <div className="p-12 md:p-20 space-y-12">
                <div className="flex flex-wrap items-center justify-between gap-8 border-b border-slate-100 pb-12">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">
                                {article.source[0]}
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Nguồn bài viết</div>
                                <div className="text-lg font-black text-slate-800 tracking-tight">{article.source}</div>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-slate-100 hidden sm:block"></div>
                        <div className="hidden sm:block">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Thời gian đăng</div>
                            <div className="text-lg font-bold text-slate-700 tracking-tight">{article.date}</div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => toggleLike(article.id, e)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black transition-all border ${likedNews.has(article.id) ? 'bg-red-50 border-red-200 text-red-600 shadow-red-100 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
                    >
                        <Heart size={20} fill={likedNews.has(article.id) ? "currentColor" : "none"}/>
                        {likedNews.has(article.id) ? 'ĐÃ THÍCH' : 'YÊU THÍCH'}
                    </button>
                </div>

                <div className="max-w-4xl mx-auto">
                    <p className="text-2xl md:text-4xl font-bold text-slate-800 leading-relaxed border-l-[10px] border-indigo-600 pl-12 bg-slate-50/50 py-12 rounded-r-[3rem] italic shadow-inner tracking-tight">
                        {article.summary}
                    </p>
                    
                    <div className="text-slate-600 text-lg md:text-2xl leading-[1.8] space-y-12 mt-16 font-medium tracking-tight">
                        <p className="first-letter:text-8xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-5 first-letter:float-left first-letter:leading-none">
                            {article.content}
                        </p>
                        <p>Cùng với sự bùng nổ của các nền tảng thương mại điện tử thế hệ mới, OmniSales không ngừng cập nhật để mang lại lợi thế cạnh tranh cao nhất cho bạn. Dữ liệu thực tế cho thấy các shop cập nhật tin tức chính sách hàng ngày có tỷ lệ vận hành đơn hàng lỗi thấp hơn 30%.</p>
                        
                        <div className="my-20 group relative">
                            <div className="absolute -inset-4 bg-indigo-50 rounded-[4rem] -z-0 opacity-50 blur-2xl group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative overflow-hidden rounded-[3.5rem] shadow-2xl z-10 border-8 border-white">
                                <img src={`https://picsum.photos/1200/600?random=${article.id}`} className="w-full hover:scale-105 transition-transform duration-[4s]" alt="Detail" />
                                <div className="absolute bottom-8 left-8 right-8 bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] text-white text-sm font-bold text-center flex items-center justify-center gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    Phân tích dữ liệu thực tế tại thị trường Việt Nam 2026
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-10 mt-20 tracking-tighter">Tầm quan trọng của việc cập nhật xu hướng</h2>
                        <p>Chúng ta đang bước vào kỷ nguyên của thương mại hội thoại (Conversational Commerce), nơi tin nhắn và sự tương tác trực tiếp quyết định 80% tỷ lệ chốt đơn. Việc tích hợp hệ thống quản lý tin nhắn thông minh vào OmniSales chính là bước đi đón đầu xu hướng này.</p>
                    </div>
                </div>

                <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-10 max-w-5xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="px-5 py-2.5 bg-slate-100 text-slate-500 text-xs font-black rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">#OmniSales</span>
                        <span className="px-5 py-2.5 bg-slate-100 text-slate-500 text-xs font-black rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">#Ecommerce_2026</span>
                    </div>
                    <a href="#" className="flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95 group">
                        ĐẾN BÀI VIẾT GỐC <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" />
                    </a>
                </div>
            </div>
        </article>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Page Header Area */}
      {!selectedNews && (
        <div className="mb-10 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                <div className="p-4 bg-indigo-600 text-white rounded-[1.8rem] shadow-2xl shadow-indigo-100 hidden sm:flex">
                    <Newspaper size={36} strokeWidth={2.5}/>
                </div>
                Trung tâm Tin tức
              </h2>
              <p className="text-slate-400 font-bold text-sm md:text-lg uppercase tracking-[0.2em] pt-1">
                  OmniSales Intelligence & Market Trends
              </p>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm self-start">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             HỆ THỐNG CẬP NHẬT 2 PHÚT TRƯỚC
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {selectedNews ? renderDetailView(selectedNews) : renderListView()}
      </div>
    </div>
  );
};

export default NewsModule;
