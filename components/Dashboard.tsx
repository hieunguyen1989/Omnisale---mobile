
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, AlertTriangle, 
  TrendingUp, RefreshCw, Zap, Store, Newspaper, ExternalLink, X, Package, Clock,
  Search, Filter, Calendar, ChevronLeft, ChevronRight, Heart, Share2, Copy, Check
} from 'lucide-react';
import { 
  SALES_DATA_LAST_7_DAYS, SALES_DATA_LAST_30_DAYS, SALES_DATA_CURRENT_MONTH, SALES_DATA_LAST_MONTH,
  MOCK_ORDERS, MOCK_PRODUCTS, MOCK_NEWS, INITIAL_INTEGRATIONS
} from '../services/mockData';
import { UserProfile, Platform, NewsArticle } from '../types';

interface DashboardProps {
  user: UserProfile;
}

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

const StatCard: React.FC<{ title: string; value: string; trend: string; isPositive: boolean; icon: React.ReactNode, bgColor?: string }> = ({ 
  title, value, trend, isPositive, icon, bgColor = 'bg-white' 
}) => (
  <div 
    className={`${bgColor} p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-default flex flex-col justify-between`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 md:p-4 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
        {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
        {trend}
      </span>
    </div>
    <div>
      <h3 className="text-slate-500 text-base md:text-lg font-medium mb-2">{title}</h3>
      <p className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [timeRange, setTimeRange] = useState<'last_7_days' | 'last_30_days' | 'current_month' | 'last_month'>('last_7_days');
  const [selectedTopProductShop, setSelectedTopProductShop] = useState<string>('all');
  
  // Promotional Update Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  // News State
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategory, setNewsCategory] = useState<string>('all');
  const [newsMonthFilter, setNewsMonthFilter] = useState('');
  const [newsPage, setNewsPage] = useState(1);
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);
  
  const newsItemsPerPage = 5;

  const chartData = {
    last_7_days: SALES_DATA_LAST_7_DAYS,
    last_30_days: SALES_DATA_LAST_30_DAYS,
    current_month: SALES_DATA_CURRENT_MONTH,
    last_month: SALES_DATA_LAST_MONTH
  };

  const accessibleOrders = useMemo(() => {
    if (user.role === 'collaborator') {
      return MOCK_ORDERS.filter(o => user.assignedShopIds.includes(o.shopId));
    }
    return MOCK_ORDERS;
  }, [user]);

  // --- Today's Logic ---
  const todayStats = useMemo(() => {
    const revenue = 15450000;
    const profit = 3850000; 
    
    return {
      revenue,
      profit,
      orders: 45,
      aov: 343333,
      waiting: 12
    }
  }, [accessibleOrders]);

  // Calculate Express Orders needing processing (Hỏa tốc & (Pending or Processing))
  const expressProcessingCount = useMemo(() => {
    return accessibleOrders.filter(o => 
      o.shippingMethod === 'Hỏa tốc' && 
      (o.status === 'processing' || o.status === 'pending')
    ).length;
  }, [accessibleOrders]);

  const totalRevenue = accessibleOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = accessibleOrders.length;
  
  const lowStockProducts = MOCK_PRODUCTS.filter(p => p.stock <= 5);
  
  // --- Shop Performance Logic ---
  const shopPerformance = useMemo(() => {
    const shops: Record<string, {name: string, revenue: number, orders: number, platform: Platform}> = {};
    
    // Initialize from integrations
    INITIAL_INTEGRATIONS.forEach(integration => {
      integration.shops.forEach(shop => {
        if (user.role !== 'collaborator' || user.assignedShopIds.includes(shop.id)) {
           shops[shop.id] = { name: shop.name, revenue: 0, orders: 0, platform: integration.platform };
        }
      });
    });

    // Aggregate
    accessibleOrders.forEach(order => {
      if (shops[order.shopId]) {
        shops[order.shopId].revenue += order.total;
        shops[order.shopId].orders += 1;
      }
    });

    return Object.values(shops).sort((a,b) => b.revenue - a.revenue);
  }, [accessibleOrders, user]);

  const maxShopRevenue = Math.max(...shopPerformance.map(s => s.revenue), 1);

  // --- Top Products by Shop Logic ---
  const topSellingProducts = useMemo(() => {
    if (selectedTopProductShop !== 'all') {
       return [...MOCK_PRODUCTS].sort(() => 0.5 - Math.random()).slice(0, 10);
    }
    return [...MOCK_PRODUCTS].sort((a, b) => b.totalSold - a.totalSold).slice(0, 10);
  }, [selectedTopProductShop]);

  const allShopsList = useMemo(() => {
     const list: {id: string, name: string}[] = [];
     INITIAL_INTEGRATIONS.forEach(i => i.shops.forEach(s => {
       if (user.role !== 'collaborator' || user.assignedShopIds.includes(s.id)) {
         list.push({id: s.id, name: s.name});
       }
     }));
     return list;
  }, [user]);

  // --- Sync Status Mock ---
  const syncStatus = {
    products: { total: MOCK_PRODUCTS.length, synced: MOCK_PRODUCTS.length - 5, error: 5 },
    orders: { total: totalOrders, synced: totalOrders, error: 0 }
  };

  // --- News Logic ---
  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(newsSearch.toLowerCase()) || news.summary.toLowerCase().includes(newsSearch.toLowerCase());
      const matchesCategory = newsCategory === 'all' || news.category === newsCategory;
      
      let matchesDate = true;
      if (newsMonthFilter) {
        // Mock date format DD/MM/YYYY
        const [day, month, year] = news.date.split('/');
        const newsDateStr = `${year}-${month}`; // YYYY-MM
        matchesDate = newsDateStr === newsMonthFilter;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [newsSearch, newsCategory, newsMonthFilter]);

  const totalNewsPages = Math.ceil(filteredNews.length / newsItemsPerPage);
  const currentNews = filteredNews.slice((newsPage - 1) * newsItemsPerPage, newsPage * newsItemsPerPage);

  const toggleLikeNews = (id: string) => {
    setLikedNews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShareNews = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tổng quan kinh doanh</h2>
          <p className="text-slate-500 text-sm mt-1">
            Chào mừng trở lại, {user.name}
          </p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           {([
             ['last_7_days', '7 ngày gần nhất'], 
             ['last_30_days', '30 ngày gần nhất'], 
             ['current_month', 'Tháng hiện tại'], 
             ['last_month', 'Tháng trước']
           ] as const).map(([key, label]) => (
             <button
               key={key}
               onClick={() => setTimeRange(key)}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                 timeRange === key 
                 ? 'bg-indigo-600 text-white shadow-sm' 
                 : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
               }`}
             >
               {label}
             </button>
           ))}
        </div>
      </div>

      {/* --- QUICK REPORT TODAY --- */}
      <div className="bg-sky-50 rounded-xl p-6 shadow-sm border border-sky-100 relative overflow-hidden">
         {/* Decorative background element */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
         
         <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-white/60 border border-sky-200 rounded-lg shadow-sm">
               <Zap className="text-yellow-500 fill-yellow-500" size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Báo cáo nhanh hôm nay</h3>
            <span className="bg-white/60 text-red-600 border border-red-100 px-2 py-0.5 rounded text-xs font-bold animate-pulse flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Real-time
            </span>
         </div>

         {/* Grid adjusted to 6 columns for large screens */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Doanh thu</div>
               <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(todayStats.revenue)}</div>
            </div>
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Lợi nhuận (Ước tính)</div>
               <div className={`text-3xl font-extrabold tracking-tight ${todayStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {todayStats.profit > 0 ? '+' : ''}{formatCurrency(todayStats.profit)}
               </div>
            </div>
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Đơn hàng mới</div>
               <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{todayStats.orders}</div>
            </div>
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Giá trị TB đơn</div>
               <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(todayStats.aov)}</div>
            </div>
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Chờ xử lý</div>
               <div className="text-3xl font-extrabold text-orange-500 tracking-tight flex items-center gap-2">
                  {todayStats.waiting} <Clock size={20} className="text-orange-400"/>
               </div>
            </div>
            {/* Added Express Orders Field */}
            <div>
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  Đơn hỏa tốc <Zap size={14} className="text-red-500 fill-red-500"/>
               </div>
               <div className="text-3xl font-extrabold text-red-600 tracking-tight animate-pulse">
                  {expressProcessingCount}
               </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Tổng doanh thu" value={formatCurrency(totalRevenue)} trend="12.5%" isPositive={true} icon={<DollarSign size={28} />} />
        <StatCard title="Đơn hàng mới" value={totalOrders.toString()} trend="5.2%" isPositive={true} icon={<ShoppingCart size={28} />} />
        <StatCard title="Cảnh báo tồn kho" value={lowStockProducts.length.toString()} trend="Cần nhập" isPositive={false} icon={<AlertTriangle size={28} />} />
        <StatCard title="Khách hàng mới" value="1,203" trend="8.1%" isPositive={true} icon={<Users size={28} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600"/> Biểu đồ doanh số đa chiều
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData[timeRange]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#f97316', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                   contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                   formatter={(value: number, name: string) => name === 'orders' ? value : formatCurrency(value)}
                   labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                />
                <Legend iconType="circle" />
                
                {/* Sales is BAR chart */}
                <Bar yAxisId="left" dataKey="sales" name="Doanh số" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                
                {/* Profit is AREA chart */}
                <Area yAxisId="left" type="monotone" dataKey="profit" name="Lợi nhuận" fill="url(#colorProfit)" stroke="#10b981" strokeWidth={2} />
                
                {/* Orders is LINE chart */}
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Số đơn hàng" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Performance (List View) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[480px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Store size={24} className="text-indigo-600"/> Hiệu quả Cửa hàng
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
             {shopPerformance.map((shop, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                   <div className="relative shrink-0">
                      <img src={LOGOS[shop.platform]} alt={shop.platform} className="w-14 h-14 object-contain rounded-xl border border-slate-100 bg-white p-2 shadow-sm" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                         {idx + 1}
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                         <span className="text-base font-bold text-slate-800 truncate mr-2" title={shop.name}>{shop.name}</span>
                         <span className="text-base font-bold text-indigo-600">{formatCurrency(shop.revenue)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
                         <div 
                           className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                           style={{ width: `${(shop.revenue / maxShopRevenue) * 100}%` }}
                         ></div>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                         <span>{shop.orders} đơn hàng</span>
                         <span>{((shop.revenue / maxShopRevenue) * 100).toFixed(0)}% dẫn đầu</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products by Shop - Expanded */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Package size={20} className="text-indigo-600" /> Top 10 Sản phẩm bán chạy
            </h3>
            <select 
               className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
               value={selectedTopProductShop}
               onChange={(e) => setSelectedTopProductShop(e.target.value)}
            >
               <option value="all">Tất cả cửa hàng</option>
               {allShopsList.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
               ))}
            </select>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3 w-12">#</th>
                  <th className="px-6 py-3">Sản phẩm</th>
                  <th className="px-6 py-3 text-center">Tồn kho</th>
                  <th className="px-6 py-3 text-right">Đã bán</th>
                  <th className="px-6 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <img src={product.image} alt="" className="w-20 h-20 rounded-lg border border-slate-200 object-cover bg-slate-50 shrink-0" />
                          <div className="font-semibold text-slate-800 whitespace-normal break-words leading-relaxed">{product.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                        <div className="flex flex-col items-center">
                           <span className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-slate-600'}`}>{product.stock}</span>
                           <div className="w-16 h-1 bg-slate-200 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${product.stock <= 5 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                              ></div>
                           </div>
                        </div>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-slate-700">{product.totalSold}</td>
                    <td className="px-6 py-3 text-right text-indigo-600 font-bold">{formatCurrency(product.totalSold * (product.salePrice || product.price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-rows-[auto_1fr] gap-6">
           {/* Sync Status */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <RefreshCw size={20} className="text-green-600" /> Tình trạng liên kết
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-sm text-slate-500 font-medium mb-1">Sản phẩm đồng bộ</div>
                    <div className="flex justify-between items-end">
                       <div className="text-2xl font-bold text-slate-800">{syncStatus.products.synced}/{syncStatus.products.total}</div>
                       <div className="text-xs text-red-500 font-medium">{syncStatus.products.error} Lỗi</div>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                       <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${(syncStatus.products.synced/syncStatus.products.total)*100}%`}}></div>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-sm text-slate-500 font-medium mb-1">Đơn hàng đồng bộ</div>
                    <div className="flex justify-between items-end">
                       <div className="text-2xl font-bold text-slate-800">{syncStatus.orders.synced}/{syncStatus.orders.total}</div>
                       <div className="text-xs text-green-500 font-medium">Hoạt động tốt</div>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                       <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* E-commerce News (Enhanced) */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[520px]">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Newspaper size={20} className="text-purple-600" /> Điểm tin TMĐT
                 </h3>
                 <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Mới cập nhật</span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                 <div className="col-span-2 sm:col-span-3 relative">
                    <input 
                      type="text" 
                      placeholder="Tìm bài viết..." 
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={newsSearch}
                      onChange={(e) => { setNewsSearch(e.target.value); setNewsPage(1); }}
                    />
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                 </div>
                 <div className="relative">
                    <select 
                      className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      value={newsCategory}
                      onChange={(e) => { setNewsCategory(e.target.value); setNewsPage(1); }}
                    >
                       <option value="all">Tất cả</option>
                       <option value="policy">Chính sách</option>
                       <option value="market">Thị trường</option>
                       <option value="tips">Tips/Mẹo</option>
                       <option value="tech">Công nghệ</option>
                    </select>
                    <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="relative">
                    <input 
                      type="month" 
                      className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={newsMonthFilter}
                      onChange={(e) => { setNewsMonthFilter(e.target.value); setNewsPage(1); }}
                    />
                    <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {currentNews.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy bài viết nào.</div>
                 ) : (
                    currentNews.map(news => (
                      <div 
                        key={news.id} 
                        onClick={() => setSelectedNews(news)}
                        className="flex gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-slate-100"
                      >
                        <div className="relative w-16 h-16 shrink-0">
                           <img src={news.imageUrl} alt={news.title} className="w-full h-full rounded-lg object-cover" />
                           {likedNews.has(news.id) && <div className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm"><Heart size={8} className="fill-red-500 text-red-500"/></div>}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 group-hover:text-purple-600 line-clamp-2 leading-snug">{news.title}</h4>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{news.summary}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] text-slate-400">{news.date}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${news.category === 'policy' ? 'bg-red-50 text-red-600' : news.category === 'market' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                  {news.category}
                              </span>
                            </div>
                        </div>
                      </div>
                    ))
                 )}
              </div>

              {/* Pagination */}
              {totalNewsPages > 1 && (
                 <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Trang {newsPage} / {totalNewsPages}</span>
                    <div className="flex gap-1">
                       <button 
                         onClick={() => setNewsPage(p => Math.max(1, p - 1))}
                         disabled={newsPage === 1}
                         className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                       >
                          <ChevronLeft size={16} />
                       </button>
                       <button 
                         onClick={() => setNewsPage(p => Math.min(totalNewsPages, p + 1))}
                         disabled={newsPage === totalNewsPages}
                         className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                       >
                          <ChevronRight size={16} />
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* News Modal Detail */}
      {selectedNews && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative">
               
               {/* Hero Image & Header */}
               <div className="relative h-56 shrink-0 group">
                  <img src={selectedNews.imageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                     <span className={`self-start text-[10px] px-2 py-1 rounded text-white uppercase font-bold tracking-wider mb-2 ${selectedNews.category === 'policy' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {selectedNews.category.toUpperCase()}
                     </span>
                     <h2 className="text-white font-bold text-xl md:text-2xl leading-snug">{selectedNews.title}</h2>
                  </div>
                  <button 
                     onClick={() => setSelectedNews(null)} 
                     className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Action Bar */}
               <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                     <span className="font-semibold text-slate-700">{selectedNews.source}</span>
                     <span>•</span>
                     <span>{selectedNews.date}</span>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => toggleLikeNews(selectedNews.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${likedNews.has(selectedNews.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                        <Heart size={14} className={likedNews.has(selectedNews.id) ? "fill-current" : ""} />
                        {likedNews.has(selectedNews.id) ? 'Đã thích' : 'Thích'}
                     </button>
                     <button 
                        onClick={handleShareNews}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200 rounded-full text-xs font-bold hover:bg-indigo-50 transition-all"
                     >
                        {isCopied ? <Check size={14}/> : <Share2 size={14} />}
                        {isCopied ? 'Đã sao chép' : 'Chia sẻ'}
                     </button>
                  </div>
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto">
                  <p className="font-medium text-slate-800 mb-6 text-lg leading-relaxed border-l-4 border-indigo-500 pl-4 bg-slate-50 py-2 rounded-r-lg">
                     {selectedNews.summary}
                  </p>
                  
                  <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed space-y-4">
                     <p>{selectedNews.content}</p>
                     <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                     </p>
                     <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                     </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                     <a href="#" className="inline-flex items-center gap-2 text-white bg-slate-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        Đọc bài viết gốc <ExternalLink size={16} />
                     </a>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Promotional Update Modal */}
      {showUpdateModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative mx-4">
            
            {/* Header Content with absolute close button */}
            <button 
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full p-1 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
               <h2 className="text-2xl font-bold border-b-2 border-indigo-600 inline-block pb-1 text-slate-900">
                 Cập nhật phiên bản lớn tháng 4/2026 🚀
               </h2>
               <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
                 Chúng tôi vừa ra mắt một loạt tính năng mới hỗ trợ bạn chốt đơn nhanh hơn và tăng hiệu suất vận hành kho hàng. Hãy xem video dưới đây để biết chi tiết!
               </p>
            </div>

            {/* Video Container */}
            <div className="p-6 bg-slate-50">
               <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner bg-slate-200 border border-slate-200">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&showinfo=0" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
               </div>
            </div>

            {/* Footer Action Area */}
            <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Không hiển thị lại</span>
               </label>

               <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
               >
                 Vào trang Tổng quan
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Dashboard;
