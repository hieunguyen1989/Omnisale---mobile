
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { MOCK_ORDERS, INITIAL_INTEGRATIONS } from '../services/mockData';
import { 
  Box, RotateCcw, Ban, CheckCircle2, DollarSign, PlusCircle, ArrowDownCircle, Wallet, Calendar, Store,
  PieChart as PieIcon, BarChart3, Receipt, ShoppingBag, Filter, ChevronDown, ChevronUp, TrendingUp, ListFilter
} from 'lucide-react';
import { Platform } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const StatCard = ({ title, value, icon, subInfo, colorClass }: { title: string, value: string | number, icon: any, subInfo?: string, colorClass: string }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-3 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
       <div className="text-slate-500 text-sm font-medium">{title}</div>
       <div className="text-xl font-bold text-slate-800 mt-1">{value}</div>
       {subInfo && <div className="text-xs text-slate-400 mt-1">{subInfo}</div>}
    </div>
  </div>
);

type ReportTab = 'general' | 'platforms' | 'finance' | 'operations' | 'reconciliation';
type TimeFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year';

const RealtimeReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('general');
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_month');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('Shopee');
  
  // State for Operations Tab Filter
  const [operationsFilter, setOperationsFilter] = useState<string>('pending');

  // Helper to parse "HH:mm DD/MM/YY"
  const parseOrderDate = (dateStr: string): Date => {
    try {
        const [time, datePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        return new Date(2000 + year, month - 1, day, ...time.split(':').map(Number));
    } catch (e) {
        return new Date();
    }
  };

  // Helper to check date range
  const isDateInFilter = (date: Date, filter: TimeFilter): boolean => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (filter) {
        case 'today':
            return orderDate.getTime() === startOfDay.getTime();
        case 'yesterday':
            const yesterday = new Date(startOfDay);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate.getTime() === yesterday.getTime();
        case 'this_week':
            const firstDayOfWeek = new Date(startOfDay);
            const day = startOfDay.getDay() || 7; // Get current day number, converting Sun. to 7
            if (day !== 1) firstDayOfWeek.setHours(-24 * (day - 1));
            return orderDate >= firstDayOfWeek;
        case 'this_month':
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        case 'this_quarter':
            const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
            const orderQuarter = Math.floor((orderDate.getMonth() + 3) / 3);
            return currentQuarter === orderQuarter && orderDate.getFullYear() === now.getFullYear();
        case 'this_year':
            return orderDate.getFullYear() === now.getFullYear();
        default:
            return true;
    }
  };

  // Dynamic Calculation Logic
  const processedData = useMemo(() => {
    let filteredOrders = MOCK_ORDERS.filter(o => isDateInFilter(parseOrderDate(o.date), timeFilter));

    if (platformFilter !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.platform === platformFilter);
    }

    const totalOrders = filteredOrders.length;
    const ordersCreated = filteredOrders.filter(o => o.status === 'pending').length;
    const ordersSold = filteredOrders.filter(o => o.status === 'delivered').length;
    const ordersReturned = filteredOrders.filter(o => o.status === 'returned').length;
    const ordersCancelled = filteredOrders.filter(o => o.status === 'cancelled').length;
    const ordersShipping = filteredOrders.filter(o => o.status === 'shipping').length;
    const ordersProcessing = filteredOrders.filter(o => o.status === 'processing').length;

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalShippingFee = filteredOrders.reduce((sum, o) => sum + o.shippingFee, 0);
    
    // Estimating Costs for Demo
    const estimatedImportCost = totalRevenue * 0.45; // 45% COGS
    const fees = {
      payment: totalRevenue * 0.025, // 2.5% payment fee
      platform: totalRevenue * 0.05, // 5% platform commision
      service: totalRevenue * 0.01,  // 1% service fee
      voucher: totalRevenue * 0.03,  // 3% vouchers
      tax: totalRevenue * 0.015,     // 1.5% VAT/Tax
      shipping: totalShippingFee
    };
    const totalFees = Object.values(fees).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - estimatedImportCost - totalFees;

    // Platform & Shop Distribution
    const platformDist: Record<string, any> = {};
    const shopsByPlatform: Record<string, any[]> = {};

    filteredOrders.forEach(order => {
      // Platform Stats
      if (!platformDist[order.platform]) {
        platformDist[order.platform] = { name: order.platform, value: 0, revenue: 0, color: '' };
      }
      platformDist[order.platform].value += 1;
      platformDist[order.platform].revenue += order.total;

      // Shop Stats
      if (!shopsByPlatform[order.platform]) {
          shopsByPlatform[order.platform] = [];
      }
      
      let shopEntry = shopsByPlatform[order.platform].find((s: any) => s.id === order.shopId);
      if (!shopEntry) {
          // Find Shop Name
          const integration = INITIAL_INTEGRATIONS.find(i => i.platform === order.platform);
          const shopInfo = integration?.shops.find(s => s.id === order.shopId);
          const shopName = shopInfo ? shopInfo.name : order.shopId;
          const logo = shopInfo ? shopInfo.logo : '';

          shopEntry = { id: order.shopId, name: shopName, logo, revenue: 0, orders: 0 };
          shopsByPlatform[order.platform].push(shopEntry);
      }
      shopEntry.revenue += order.total;
      shopEntry.orders += 1;
    });

    const platformColors: Record<string, string> = {
      [Platform.SHOPEE]: '#f97316',
      [Platform.LAZADA]: '#3b82f6',
      [Platform.TIKTOK]: '#000000',
      [Platform.FACEBOOK]: '#1d4ed8',
      [Platform.WOOCOMMERCE]: '#9333ea',
      'Manual': '#64748b'
    };

    const platformChartData = Object.values(platformDist).map((p: any) => ({
      ...p,
      color: platformColors[p.name] || '#cbd5e1'
    }));

    return {
      stats: {
        totalOrders, ordersCreated, ordersSold, ordersReturned, ordersCancelled, ordersShipping, ordersProcessing,
        totalRevenue, totalFees, estimatedImportCost, netProfit, fees
      },
      charts: {
        platformDist: platformChartData
      },
      shopsByPlatform,
      orders: filteredOrders
    };
  }, [platformFilter, timeFilter]);

  const { stats, charts, shopsByPlatform, orders } = processedData;

  const renderGeneralTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
           title="Đơn phát sinh" 
           value={stats.totalOrders}
           subInfo={`${stats.totalOrders > 0 ? ((stats.ordersCreated / stats.totalOrders) * 100).toFixed(1) : 0}% mới tạo`}
           icon={<Box size={20} className="text-pink-600" />} 
           colorClass="bg-pink-50"
        />
        <StatCard 
           title="Đơn hoàn/huỷ" 
           value={stats.ordersReturned + stats.ordersCancelled} 
           subInfo={`Tỷ lệ: ${stats.totalOrders > 0 ? ((stats.ordersReturned + stats.ordersCancelled) / stats.totalOrders * 100).toFixed(1) : 0}%`}
           icon={<RotateCcw size={20} className="text-orange-600" />} 
           colorClass="bg-orange-50"
        />
        <StatCard 
           title="Đang xử lý" 
           value={stats.ordersProcessing + stats.ordersShipping} 
           subInfo="Cần đóng gói/giao"
           icon={<CheckCircle2 size={20} className="text-blue-600" />} 
           colorClass="bg-blue-50"
        />
        <StatCard 
           title="Đã giao thành công" 
           value={stats.ordersSold} 
           subInfo="Hoàn tất"
           icon={<CheckCircle2 size={20} className="text-green-600" />} 
           colorClass="bg-green-50"
        />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
           title="Doanh thu" 
           value={formatCurrency(stats.totalRevenue)}
           icon={<DollarSign size={20} className="text-green-600" />} 
           colorClass="bg-green-50"
        />
        <StatCard 
           title="Tổng chi phí sàn" 
           value={formatCurrency(stats.totalFees)}
           subInfo="Phí sàn + Vận chuyển"
           icon={<PlusCircle size={20} className="text-red-600" />} 
           colorClass="bg-red-50"
        />
        <StatCard 
           title="Giá vốn hàng bán" 
           value={formatCurrency(stats.estimatedImportCost)}
           subInfo="Ước tính 45%"
           icon={<ArrowDownCircle size={20} className="text-yellow-600" />} 
           colorClass="bg-yellow-50"
        />
        <StatCard 
           title="Lợi nhuận ròng" 
           value={formatCurrency(stats.netProfit)}
           subInfo={`Biên lãi: ${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%`}
           icon={<Wallet size={20} className="text-indigo-600" />} 
           colorClass="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Orders Distribution */}
         <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-4 w-full">Tỷ trọng Đơn hàng theo Sàn</h3>
            <div className="w-full h-64 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={charts.platformDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.platformDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [value, 'Đơn hàng']} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-bold text-slate-800">{stats.totalOrders}</div>
                  <div className="text-xs text-slate-500">Tổng đơn</div>
               </div>
            </div>
         </div>

         {/* Revenue Distribution */}
         <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-4 w-full">Tỷ trọng Doanh thu theo Sàn</h3>
            <div className="w-full h-64 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={charts.platformDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                    >
                      {charts.platformDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-lg font-bold text-slate-800">{new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(stats.totalRevenue)}</div>
                  <div className="text-xs text-slate-500">Doanh thu</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderPlatformsTab = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Comparison Chart */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <h3 className="font-bold text-slate-800 mb-6">So sánh hiệu quả các sàn</h3>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.platformDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <RechartsTooltip formatter={(value: number, name: string) => name === 'revenue' ? formatCurrency(value) : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="value" name="Số đơn hàng" fill="#8884d8" barSize={30} />
                <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" fill="#82ca9d" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
         </div>
       </div>

       {/* Detailed Breakdown by Shop */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Chi tiết theo Gian hàng</h3>
          
          <div className="space-y-4">
             {Object.keys(shopsByPlatform).length === 0 && <div className="text-center text-slate-500 py-8">Không có dữ liệu trong khoảng thời gian này.</div>}
             
             {Object.entries(shopsByPlatform).map(([platform, shops]: [string, any[]]) => (
                <div key={platform} className="border border-slate-200 rounded-xl overflow-hidden">
                   <div 
                     className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                     onClick={() => setExpandedPlatform(expandedPlatform === platform ? null : platform)}
                   >
                      <div className="flex items-center gap-3">
                         {LOGOS[platform] ? <img src={LOGOS[platform]} alt={platform} className="h-6 w-auto object-contain"/> : <span className="font-bold text-slate-700">{platform}</span>}
                         <span className="text-sm font-medium text-slate-600">({shops.length} cửa hàng)</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                            <div className="font-bold text-slate-800 text-sm">
                                {formatCurrency(shops.reduce((acc: number, s: any) => acc + s.revenue, 0))}
                            </div>
                            <div className="text-xs text-slate-500">
                                Tổng doanh thu
                            </div>
                         </div>
                         {expandedPlatform === platform ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                      </div>
                   </div>
                   
                   {expandedPlatform === platform && (
                      <div className="border-t border-slate-200">
                         <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 border-b border-slate-100">
                               <tr>
                                  <th className="px-6 py-3 font-medium">Tên Gian Hàng</th>
                                  <th className="px-6 py-3 font-medium text-right">Số đơn hàng</th>
                                  <th className="px-6 py-3 font-medium text-right">Doanh thu</th>
                                  <th className="px-6 py-3 font-medium text-right">Giá trị TB (AOV)</th>
                                  <th className="px-6 py-3 font-medium text-center">Hiệu quả</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {shops.sort((a:any, b:any) => b.revenue - a.revenue).map((shop: any) => (
                                  <tr key={shop.id} className="hover:bg-slate-50">
                                     <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-white">
                                           <img src={shop.logo || `https://ui-avatars.com/api/?name=${shop.name}`} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-slate-700">{shop.name}</span>
                                     </td>
                                     <td className="px-6 py-4 text-right">{shop.orders}</td>
                                     <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(shop.revenue)}</td>
                                     <td className="px-6 py-4 text-right text-indigo-600 font-medium">
                                        {shop.orders > 0 ? formatCurrency(shop.revenue / shop.orders) : 0}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center justify-center w-fit mx-auto gap-1">
                                           <TrendingUp size={10} /> Tốt
                                        </span>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderFinanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
      {/* Fee Structure */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
         <div className="bg-slate-50 p-4 border-b border-slate-200">
           <h3 className="font-bold text-slate-800">Cấu trúc chi phí</h3>
           <p className="text-xs text-slate-500">Phân tích dựa trên {stats.totalOrders} đơn hàng</p>
         </div>
         
         <div className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
               <span className="font-medium text-slate-700">Doanh thu tổng (GMV)</span>
               <span className="font-bold text-green-600 text-lg">{formatCurrency(stats.totalRevenue)}</span>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Giá vốn hàng bán (COGS)</span>
                 <span className="text-red-500">-{formatCurrency(stats.estimatedImportCost)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Phí thanh toán (2.5%)</span>
                 <span className="text-red-500">-{formatCurrency(stats.fees.payment)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Phí cố định sàn (5%)</span>
                 <span className="text-red-500">-{formatCurrency(stats.fees.platform)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Phí dịch vụ (1%)</span>
                 <span className="text-red-500">-{formatCurrency(stats.fees.service)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Voucher & KM (3%)</span>
                 <span className="text-red-500">-{formatCurrency(stats.fees.voucher)}</span>
               </div>
               <div className="flex justify-between text-sm font-medium bg-red-50 p-1 rounded">
                 <span className="text-slate-700">Thuế (VAT/TNCN - 1.5%)</span>
                 <span className="text-red-600">-{formatCurrency(stats.fees.tax)}</span>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
               <span className="font-bold text-slate-800">Lợi nhuận ròng</span>
               <div className="text-right">
                 <div className="font-bold text-indigo-600 text-xl">{formatCurrency(stats.netProfit)}</div>
                 <div className="text-xs text-slate-500">~{stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}% doanh thu</div>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Transactions List */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Danh sách đơn hàng (Top 200)</h3>
            <button className="text-xs text-indigo-600 font-medium hover:underline">Xuất Excel</button>
         </div>
         
         <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center w-12 bg-slate-50">#</th>
                  <th className="px-4 py-3 bg-slate-50">Sản Phẩm</th>
                  <th className="px-4 py-3 bg-slate-50 text-right">Doanh Thu</th>
                  <th className="px-4 py-3 bg-slate-50 text-right">Phí sàn</th>
                  <th className="px-4 py-3 bg-slate-50 text-right">Thuế (1.5%)</th>
                  <th className="px-4 py-3 bg-slate-50 text-right">Thực nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {orders.slice(0, 200).map((order, idx) => {
                   const fees = order.total * 0.115; // Rough estimate of platform fees
                   const tax = order.total * 0.015;  // 1.5% Tax
                   const net = order.total - fees - tax;
                   
                   return (
                     <tr key={order.id} className="hover:bg-slate-50 group">
                       <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                       <td className="px-4 py-3">
                         <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden shrink-0">
                               <img src={order.items[0]?.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                               <div className="text-slate-800 font-medium truncate max-w-xs group-hover:text-indigo-600 transition-colors">{order.items[0]?.name || 'Sản phẩm'}</div>
                               <div className="text-xs text-slate-500 mt-0.5">{order.id} • {order.platform}</div>
                            </div>
                         </div>
                       </td>
                       <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                       <td className="px-4 py-3 text-right text-red-500 text-xs">-{formatCurrency(fees)}</td>
                       <td className="px-4 py-3 text-right text-red-500 text-xs">-{formatCurrency(tax)}</td>
                       <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(net)}</td>
                     </tr>
                   );
                 })}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderOperationsTab = () => {
    // Filter logic for operations table
    const opOrders = orders.filter(o => {
        if (operationsFilter === 'cancelled') return o.status === 'cancelled' || o.status === 'returned';
        return o.status === operationsFilter;
    });

    const steps = [
        { id: 'pending', label: 'Đơn mới', count: stats.ordersCreated, color: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' },
        { id: 'processing', label: 'Chờ xử lý', count: stats.ordersProcessing, color: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100' },
        { id: 'shipping', label: 'Đang giao', count: stats.ordersShipping, color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
        { id: 'delivered', label: 'Hoàn thành', count: stats.ordersSold, color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
        { id: 'cancelled', label: 'Hủy/Hoàn', count: stats.ordersCancelled + stats.ordersReturned, color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' },
    ];

    return (
    <div className="space-y-6 animate-fade-in">
       {/* Status Cards with Selection */}
       <div className="grid grid-cols-5 gap-4">
          {steps.map((step) => (
             <div 
               key={step.id} 
               onClick={() => setOperationsFilter(step.id)}
               className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-200 ${step.color} ${operationsFilter === step.id ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md transform scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
             >
                <div className="text-2xl font-bold mb-1">{step.count}</div>
                <div className="text-xs font-bold uppercase tracking-wider">{step.label}</div>
             </div>
          ))}
       </div>

       {/* Detailed Order List for Selected Status */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ListFilter size={20} className="text-indigo-600"/> 
                Danh sách: <span className="text-indigo-600">{steps.find(s => s.id === operationsFilter)?.label}</span>
                <span className="text-slate-400 font-normal text-sm">({opOrders.length} đơn)</span>
             </h3>
          </div>
          
          <div className="flex-1 overflow-auto">
             {opOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <ShoppingBag size={24} className="opacity-50"/>
                    </div>
                    <p>Không có đơn hàng nào trong trạng thái này.</p>
                </div>
             ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 w-32">Mã đơn</th>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3 w-40">Sàn</th>
                        <th className="px-4 py-3 w-32 text-center">Trạng thái</th>
                        <th className="px-4 py-3 w-32">Ngày đặt</th>
                        <th className="px-4 py-3 w-32 text-right">Giá trị</th>
                        <th className="px-4 py-3 w-24 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {opOrders.map(o => (
                        <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 font-medium text-indigo-600 font-mono">{o.id}</td>
                            <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{o.customerName}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{o.items[0]?.name} {o.items.length > 1 ? `+${o.items.length-1}` : ''}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="flex items-center gap-1.5">
                                    {LOGOS[o.platform] && <img src={LOGOS[o.platform]} className="w-4 h-4 object-contain"/>}
                                    {o.platform}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                    o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                    o.status === 'cancelled' || o.status === 'returned' ? 'bg-red-50 text-red-700 border-red-200' :
                                    o.status === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    {o.status === 'pending' ? 'Chờ xác nhận' : o.status === 'processing' ? 'Đang xử lý' : o.status === 'delivered' ? 'Hoàn thành' : o.status === 'cancelled' ? 'Đã hủy' : o.status === 'returned' ? 'Hoàn trả' : 'Đang giao'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{o.date}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(o.total)}</td>
                            <td className="px-4 py-3 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs font-medium">Chi tiết</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
             )}
          </div>
       </div>
    </div>
  )};

  const handleExportExcel = () => {
    const exportData = orders.map(o => ({
      'Mã đơn': o.id,
      'Khách hàng': o.customerName,
      'Sàn': o.platform,
      'Trạng thái đối soát': o.reconciled ? 'Đã đối soát' : 'Chưa đối soát',
      'Số tiền tạm tính': o.calculatedAmount || o.total,
      'Số tiền thực thu': o.actualReceived || 0,
      'Phí': o.platformFee || 0,
      'Thuế': o.tax || 0,
      'Lợi nhuận': o.profit || 0,
      'Thời gian đối soát': o.reconciliationTime || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DoiSoatDonHang");
    XLSX.writeFile(wb, "Doi_Soat_Don_Hang.xlsx");
  };

  const renderReconciliationTab = () => {
    const reconciledOrders = orders.filter(o => o.reconciled).length;
    const unreconciledOrders = orders.length - reconciledOrders;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard 
             title="Đã đối soát" 
             value={reconciledOrders}
             icon={<CheckCircle2 size={20} className="text-green-600" />} 
             colorClass="bg-green-50"
          />
          <StatCard 
             title="Chưa đối soát" 
             value={unreconciledOrders}
             icon={<RotateCcw size={20} className="text-orange-600" />} 
             colorClass="bg-orange-50"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt size={20} className="text-indigo-600"/> 
              Danh sách đối soát
            </h3>
            <button onClick={handleExportExcel} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Xuất Excel
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Sàn</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tạm tính</th>
                  <th className="px-4 py-3 text-right">Phí</th>
                  <th className="px-4 py-3 text-right">Thuế</th>
                  <th className="px-4 py-3 text-right">Thực thu</th>
                  <th className="px-4 py-3 text-right">Lợi nhuận</th>
                  <th className="px-4 py-3">TG Đối soát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-indigo-600 font-mono">{o.id}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {LOGOS[o.platform] && <img src={LOGOS[o.platform]} className="w-4 h-4 object-contain"/>}
                        {o.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        o.reconciled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {o.reconciled ? 'Đã đối soát' : 'Chưa đối soát'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(o.calculatedAmount || o.total)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{formatCurrency(o.platformFee || 0)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{formatCurrency(o.tax || 0)}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{o.actualReceived ? formatCurrency(o.actualReceived) : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-600">{formatCurrency(o.profit || 0)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{o.reconciliationTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-10 animate-fade-in">
      {/* Top Bar: Filters & Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PieIcon className="text-indigo-600" /> Báo cáo Hiệu quả Kinh doanh
            </h2>
            
            <div className="flex gap-2 w-full md:w-auto">
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors flex-1 md:flex-none">
                  <Calendar size={16} className="text-slate-500" />
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="today">Hôm nay</option>
                    <option value="yesterday">Hôm qua</option>
                    <option value="this_week">Tuần này</option>
                    <option value="this_month">Tháng này</option>
                    <option value="this_quarter">Quý này</option>
                    <option value="this_year">Năm nay</option>
                  </select>
               </div>
               <div className="relative group flex-1 md:flex-none">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                     <Filter size={16} className="text-slate-500" />
                     <span className="text-sm font-medium text-slate-700">
                       {platformFilter === 'all' ? 'Tất cả sàn' : platformFilter}
                     </span>
                  </div>
                  {/* Simple Dropdown for Demo */}
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20 min-w-[150px]">
                     <div className="p-1">
                        {['all', ...Object.values(Platform)].map((p) => (
                           <button 
                             key={p} 
                             onClick={() => setPlatformFilter(p as any)}
                             className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
                           >
                             {p === 'all' ? 'Tất cả sàn' : p}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <PieIcon size={16} /> Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'platforms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={16} /> Phân tích Sàn
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'finance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Receipt size={16} /> Tài chính & Phí
            </button>
            <button 
              onClick={() => setActiveTab('operations')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'operations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <ShoppingBag size={16} /> Hiệu quả vận hành
            </button>
            <button 
              onClick={() => setActiveTab('reconciliation')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reconciliation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 size={16} /> Đối soát đơn hàng
            </button>
         </div>
      </div>

      {/* Dynamic Content */}
      <div className="min-h-[500px]">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'platforms' && renderPlatformsTab()}
        {activeTab === 'finance' && renderFinanceTab()}
        {activeTab === 'operations' && renderOperationsTab()}
        {activeTab === 'reconciliation' && renderReconciliationTab()}
      </div>
      
      <div className="text-center text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">
        Dữ liệu được cập nhật theo thời gian thực. Lần cuối: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default RealtimeReport;
