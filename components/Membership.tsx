import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, Landmark, QrCode, ArrowLeft, Download, Printer, History, Zap, Crown, ShieldCheck, Rocket, HelpCircle, Star, Diamond, Sparkles, Timer } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import { Transaction } from '../types';

interface Plan {
  id: string;
  name: string;
  basePrice: number;
  color: string;
  badge?: string;
  description: string;
  highlight?: boolean;
}

interface Duration {
  id: string;
  label: string;
  months: number;
  discount: number;
}

const DURATIONS: Duration[] = [
  { id: '1m', label: 'Theo Tháng', months: 1, discount: 0 },
  { id: '3m', label: '3 Tháng', months: 3, discount: 0.05 },
  { id: '6m', label: '6 Tháng', months: 6, discount: 0.10 },
  { id: '1y', label: '1 Năm', months: 12, discount: 0.15 },
  { id: '2y', label: '2 Năm', months: 24, discount: 0.20 },
];

const PLANS: Plan[] = [
  { 
    id: 'free', 
    name: 'Miễn phí', 
    basePrice: 0, 
    color: 'bg-slate-500',
    description: 'Cá nhân khởi nghiệp.'
  },
  { 
    id: 'basic', 
    name: 'Cơ bản', 
    basePrice: 99000, 
    color: 'bg-blue-500',
    description: 'Shop nhỏ đang phát triển.'
  },
  { 
    id: 'pro', 
    name: 'Chuyên nghiệp', 
    basePrice: 249000, 
    color: 'bg-indigo-600',
    badge: 'Phổ biến',
    highlight: true,
    description: 'Tăng trưởng doanh số đa sàn.'
  },
  { 
    id: 'biz', 
    name: 'Doanh nghiệp', 
    basePrice: 499000, 
    color: 'bg-purple-600',
    description: 'Quy mô vừa & lớn.'
  },
  { 
    id: 'biz_plus', 
    name: 'Doanh nghiệp +', 
    basePrice: 999000, 
    color: 'bg-slate-900',
    badge: 'VIP',
    description: 'Tập đoàn & Chuỗi cửa hàng.',
    highlight: true
  },
];

// Feature Comparison Data Structure
const FEATURES = [
  {
    category: 'Tổng quan & Giới hạn',
    items: [
      { name: 'Số lượng đơn hàng / tháng', free: '300', basic: '1.000', pro: '5.000', biz: '10.000', biz_plus: 'K.Giới hạn' },
      { name: 'Số gian hàng kết nối', free: '2', basic: '5', pro: '20', biz: '50', biz_plus: 'K.Giới hạn' },
      { name: 'Fanpage Facebook', free: '1', basic: '3', pro: '10', biz: '50', biz_plus: 'K.Giới hạn' },
      { name: 'Tài khoản nhân viên', free: '1', basic: '3', pro: '10', biz: '30', biz_plus: 'K.Giới hạn' },
    ]
  },
  {
    category: 'Quản lý Sản phẩm & Tồn kho',
    items: [
      { name: 'Đăng bán đa sàn (Listing)', free: true, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Sao chép sản phẩm (Clone)', free: false, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Đồng bộ tồn kho tự động', free: '60p', basic: '30p', pro: 'Realtime', biz: 'Realtime', biz_plus: 'Priority Realtime' },
      { name: 'Cảnh báo tồn kho thấp', free: true, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Quản lý kho hàng', free: '1', basic: '2', pro: '5', biz: '10', biz_plus: 'K.Giới hạn' },
    ]
  },
  {
    category: 'Xử lý Đơn hàng & Vận chuyển',
    items: [
      { name: 'In đơn hàng loạt', free: false, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Tự động đẩy đơn', free: true, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Tùy chỉnh mẫu in', free: false, basic: false, pro: true, biz: true, biz_plus: true },
      { name: 'Đối soát COD tự động', free: false, basic: false, pro: true, biz: true, biz_plus: true },
    ]
  },
  {
    category: 'Marketing & CRM',
    items: [
      { name: 'Gửi tin nhắn tự động', free: false, basic: '100/ngày', pro: '1000/ngày', biz: '5000/ngày', biz_plus: 'K.Giới hạn' },
      { name: 'Công cụ Đẩy sản phẩm', free: false, basic: false, pro: '5 slot', biz: '20 slot', biz_plus: '50 slot' },
      { name: 'Flash Sale AI', free: false, basic: false, pro: true, biz: true, biz_plus: true },
      { name: 'Auto đánh giá khách', free: false, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Zalo ZNS / SMS Brandname', free: false, basic: false, pro: false, biz: true, biz_plus: true },
    ]
  },
  {
    category: 'Báo cáo & Tài chính',
    items: [
      { name: 'Báo cáo doanh thu', free: true, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Phân tích hiệu quả sàn', free: false, basic: true, pro: true, biz: true, biz_plus: true },
      { name: 'Báo cáo Lãi/Lỗ (P&L)', free: false, basic: false, pro: true, biz: true, biz_plus: true },
      { name: 'Xuất XML báo cáo thuế', free: false, basic: false, pro: true, biz: true, biz_plus: true },
    ]
  },
  {
    category: 'Dịch vụ & Hỗ trợ',
    items: [
      { name: 'Kênh hỗ trợ', free: 'Tài liệu', basic: 'Chat', pro: 'Chat+Hotline', biz: '1:1 Priority', biz_plus: 'Dedicated Manager' },
      { name: 'Thời gian phản hồi', free: '48h', basic: '24h', pro: '4h', biz: '1h', biz_plus: 'Ngay lập tức (24/7)' },
      { name: 'Setup & Đào tạo tận nơi', free: false, basic: false, pro: false, biz: true, biz_plus: true },
      { name: 'API Access', free: false, basic: false, pro: false, biz: false, biz_plus: true },
    ]
  }
];

const Membership: React.FC = () => {
  const [view, setView] = useState<'plans' | 'payment' | 'success' | 'failure' | 'history' | 'invoice'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(DURATIONS[3]); // Default 1 Year
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'visa' | 'paypal' | 'qr'>('qr');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 59, seconds: 59 });
  const [voucherCode, setVoucherCode] = useState('');
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTotal = (plan: Plan, duration: Duration) => {
    const total = plan.basePrice * duration.months;
    return total - (total * duration.discount);
  };

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase().trim() === 'NEWBIE30') {
        setIsVoucherApplied(true);
        setVoucherError('');
    } else {
        setIsVoucherApplied(false);
        setVoucherError('Mã giảm giá không hợp lệ');
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setView('payment');
  };

  const handlePayment = () => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1;
      const baseTotal = selectedPlan ? calculateTotal(selectedPlan, selectedDuration) : 0;
      const totalAmount = isVoucherApplied ? baseTotal * 0.7 : baseTotal;
      
      const newTransaction: Transaction = {
        id: `TRX-${Date.now()}`,
        planName: `${selectedPlan!.name} (${selectedDuration.label})`,
        amount: totalAmount,
        date: new Date().toLocaleString('vi-VN'),
        status: isSuccess ? 'success' : 'failed',
        method: paymentMethod,
        invoiceCode: `INV-${Date.now()}`
      };
      setCurrentTransaction(newTransaction);
      setView(isSuccess ? 'success' : 'failure');
      if (isSuccess) MOCK_TRANSACTIONS.unshift(newTransaction);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const renderFeatureValue = (val: string | boolean) => {
    if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (val === false) return <div className="w-4 h-0.5 bg-slate-300 mx-auto rounded-full"></div>;
    return <span className="text-[13px] font-semibold text-slate-700">{val}</span>;
  };

  const renderPricingUI = () => (
    <div className="animate-fade-in pb-10 bg-slate-50">
      {/* Banner Khuyến mãi FIRST TIME */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-3 shadow-md border-b-[3px] border-yellow-400 relative z-20">
         <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-full animate-bounce">
                  <Zap className="fill-yellow-300 text-yellow-300" size={24} />
               </div>
               <div>
                  <div className="font-extrabold text-lg flex flex-wrap items-center justify-center md:justify-start gap-2">
                     ƯU ĐÃI ĐỘC QUYỀN LẦN ĐẦU NẠP!
                     <span className="bg-yellow-400 text-red-700 px-2.5 py-0.5 rounded text-[11px] font-black uppercase shadow-sm whitespace-nowrap">Giảm 30%</span>
                  </div>
                  <div className="text-white/90 text-sm font-medium mt-0.5">Nhập mã <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded font-bold text-yellow-200 tracking-wider inline-block">NEWBIE30</span> khi thanh toán</div>
               </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-3 bg-black/25 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
               <div className="text-xs font-bold text-white/80 uppercase tracking-widest text-right leading-tight hidden sm:block">Ưu đãi kết<br/>thúc sau</div>
               <div className="flex gap-1.5 items-center">
                  <div className="bg-white/10 rounded-lg w-10 h-10 flex flex-col items-center justify-center border border-white/20 shadow-sm relative overflow-hidden">
                     <span className="font-mono font-black text-lg leading-none z-10 text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                     <span className="text-[8px] uppercase tracking-wider text-white/60 z-10 mt-0.5">Giờ</span>
                     <div className="absolute inset-x-0 top-1/2 h-px bg-black/40"></div>
                     <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5"></div>
                  </div>
                  <div className="text-xl font-bold text-white/50 animate-pulse pb-1">:</div>
                  <div className="bg-white/10 rounded-lg w-10 h-10 flex flex-col items-center justify-center border border-white/20 shadow-sm relative overflow-hidden">
                     <span className="font-mono font-black text-lg leading-none z-10 text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                     <span className="text-[8px] uppercase tracking-wider text-white/60 z-10 mt-0.5">Phút</span>
                     <div className="absolute inset-x-0 top-1/2 h-px bg-black/40"></div>
                     <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5"></div>
                  </div>
                  <div className="text-xl font-bold text-white/50 animate-pulse pb-1">:</div>
                  <div className="bg-black/20 rounded-lg w-10 h-10 flex flex-col items-center justify-center border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)] relative overflow-hidden">
                     <span className="font-mono font-black text-lg leading-none text-yellow-300 z-10">{String(timeLeft.seconds).padStart(2, '0')}</span>
                     <span className="text-[8px] uppercase tracking-wider text-yellow-300/70 z-10 mt-0.5">Giây</span>
                     <div className="absolute inset-x-0 top-1/2 h-px bg-black/50"></div>
                     <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Header */}
      <div className="text-center py-10 px-4 bg-white text-slate-800 shadow-sm border-b border-slate-100 relative overflow-hidden mb-8">
        <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-slate-900">Chọn gói giải pháp phù hợp</h2>
            <p className="text-slate-500 text-lg mb-8">Nâng cấp để mở khóa toàn bộ sức mạnh của OmniSales AI.</p>
            
            <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                {DURATIONS.map(dur => (
                <button
                    key={dur.id}
                    onClick={() => setSelectedDuration(dur)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                        selectedDuration.id === dur.id 
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    {dur.label}
                    {dur.discount > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded shadow-sm font-extrabold">-{dur.discount * 100}%</span>}
                </button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-end mb-4">
            <button onClick={() => setView('history')} className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
               <History size={16}/> Lịch sử thanh toán
            </button>
         </div>

         {/* Plan Cards - 5 Columns */}
         <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
            {PLANS.map((plan) => {
                const totalPrice = calculateTotal(plan, selectedDuration);
                const monthlyPrice = Math.round(totalPrice / selectedDuration.months);
                const isBizPlus = plan.id === 'biz_plus';

                return (
                <div 
                    key={plan.id} 
                    onClick={() => handlePlanSelect(plan)}
                    className={`flex flex-col rounded-3xl transition-all duration-300 ease-out relative border-2 cursor-pointer group overflow-hidden ${
                        plan.highlight 
                        ? 'bg-white border-indigo-500 shadow-xl scale-105 z-10 ring-4 ring-indigo-500/10 hover:shadow-2xl hover:-translate-y-3 hover:shadow-indigo-500/30 active:bg-indigo-50' 
                        : isBizPlus 
                            ? 'bg-slate-900 border-slate-700 shadow-xl text-white hover:shadow-2xl hover:shadow-slate-500/40 hover:-translate-y-2 hover:border-slate-500 active:bg-black' 
                            : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:-translate-y-2 hover:bg-indigo-50/10 active:bg-slate-50'
                    } active:scale-95`}
                >
                    {plan.badge && (
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 z-20 ${isBizPlus ? 'bg-yellow-400 text-slate-900 border border-yellow-500' : 'bg-indigo-600 text-white'}`}>
                            {isBizPlus ? <Diamond size={10} fill="currentColor"/> : <Crown size={10} fill="currentColor"/>} {plan.badge}
                        </div>
                    )}
                    
                    <div className={`p-6 text-center border-b transition-colors ${isBizPlus ? 'bg-slate-900 text-white rounded-t-2xl border-slate-700' : 'border-slate-50'}`}>
                        <h3 className={`text-lg font-black mb-1 ${isBizPlus ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                        <p className={`text-[11px] min-h-[32px] mb-3 line-clamp-2 ${isBizPlus ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                        
                        <div className="flex items-baseline justify-center gap-0.5">
                            <span className={`text-2xl font-extrabold ${isBizPlus ? 'text-yellow-400' : 'text-slate-900'}`}>{plan.basePrice > 0 ? formatPrice(monthlyPrice) : '0'}</span>
                            <span className={`text-xs font-medium ${isBizPlus ? 'text-slate-400' : 'text-slate-500'}`}>đ/tháng</span>
                        </div>
                        {plan.basePrice > 0 && selectedDuration.months > 1 && (
                            <div className={`text-[10px] font-bold mt-2 inline-block px-2 py-0.5 rounded ${isBizPlus ? 'bg-slate-800 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                Tiết kiệm {formatPrice((plan.basePrice * selectedDuration.months) - totalPrice)}đ
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-end">
                        <button 
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                                plan.basePrice === 0 
                                ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200' 
                                : isBizPlus
                                    ? 'bg-slate-800 text-yellow-400 border border-slate-600 group-hover:bg-yellow-400 group-hover:text-slate-900'
                                    : plan.highlight
                                        ? 'bg-indigo-600 text-white group-hover:bg-indigo-700 group-hover:shadow-indigo-300'
                                        : 'bg-white border-2 border-slate-200 text-slate-700 group-hover:border-indigo-600 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                            }`}
                        >
                            {plan.basePrice === 0 ? 'Hiện tại' : 'Chọn gói này'} {isBizPlus && <Sparkles size={14}/>}
                        </button>
                    </div>
                </div>
                );
            })}
         </div>

         {/* Detailed Comparison Table */}
         <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
            <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
                <h3 className="text-xl font-black text-slate-800">So sánh chi tiết tính năng</h3>
                <p className="text-sm text-slate-500 mt-1">Tìm hiểu chính xác những gì bạn nhận được</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 w-[25%] bg-white border-b border-slate-100"></th>
                            {PLANS.map(plan => (
                                <th key={plan.id} className={`p-4 text-center w-[15%] align-top border-b border-slate-100 ${plan.id === 'biz_plus' ? 'bg-slate-50' : 'bg-white'}`}>
                                    <div className={`font-bold text-base ${plan.id === 'biz_plus' ? 'text-slate-900' : 'text-slate-800'}`}>{plan.name}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {FEATURES.map((section, sIdx) => (
                            <React.Fragment key={sIdx}>
                                <tr className="bg-slate-100/80">
                                    <td colSpan={6} className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-600 border-y border-slate-200">
                                        {section.category}
                                    </td>
                                </tr>
                                {section.items.map((item: any, iIdx) => (
                                    <tr key={iIdx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 group">
                                        <td className="px-6 py-3.5 text-slate-700 font-medium flex items-center gap-2">
                                            {item.name}
                                            <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-indigo-500 transition-colors" />
                                        </td>
                                        <td className="px-2 py-3.5 text-center group-hover:bg-white transition-colors border-l border-slate-50">{renderFeatureValue(item.free)}</td>
                                        <td className="px-2 py-3.5 text-center group-hover:bg-white transition-colors border-l border-slate-50 bg-blue-50/5">{renderFeatureValue(item.basic)}</td>
                                        <td className="px-2 py-3.5 text-center group-hover:bg-white transition-colors border-l border-slate-50 bg-indigo-50/10 font-medium">{renderFeatureValue(item.pro)}</td>
                                        <td className="px-2 py-3.5 text-center group-hover:bg-white transition-colors border-l border-slate-50 bg-purple-50/5">{renderFeatureValue(item.biz)}</td>
                                        <td className="px-2 py-3.5 text-center group-hover:bg-white transition-colors border-l border-slate-100 bg-slate-100/30 font-bold">{renderFeatureValue(item.biz_plus)}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                        <tr>
                            <td className="p-4"></td>
                            {PLANS.map(plan => (
                                <td key={plan.id} className="p-4 text-center">
                                    <button 
                                        onClick={() => handlePlanSelect(plan)}
                                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                                            plan.basePrice === 0 
                                            ? 'bg-slate-200 text-slate-500 cursor-default' 
                                            : plan.id === 'biz_plus'
                                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                        disabled={plan.basePrice === 0}
                                    >
                                        {plan.basePrice === 0 ? 'Hiện tại' : 'Chọn'}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
         </div>
      </div>
    </div>
  );

  const renderPaymentGateway = () => (
    <div className="max-w-4xl mx-auto pt-6 animate-fade-in px-4 pb-12">
       <button onClick={() => setView('plans')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 text-sm font-medium">
         <ArrowLeft size={16} /> Quay lại bảng giá
       </button>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
               <CreditCard className="text-indigo-600" size={20} /> Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
               {['qr', 'transfer'].map((m) => (
                  <button 
                     key={m}
                     onClick={() => setPaymentMethod(m as any)}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                     {m === 'qr' ? <QrCode size={24}/> : <Landmark size={24}/>}
                     <span className="text-sm font-bold">{m === 'qr' ? 'VietQR / Momo' : 'Chuyển khoản'}</span>
                  </button>
               ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
               {paymentMethod === 'qr' ? (
                  <>
                     <div className="w-48 h-48 bg-white p-2 mx-auto mb-4 border border-slate-200 rounded-lg shadow-sm">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=OmniSales_${selectedPlan?.basePrice}`} alt="QR" className="w-full h-full" />
                     </div>
                     <p className="text-sm text-slate-600">Quét mã để thanh toán ngay</p>
                  </>
               ) : (
                  <div className="text-left space-y-4">
                     <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Ngân hàng</span>
                        <span className="font-bold text-slate-800">Techcombank</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Số tài khoản</span>
                        <span className="font-bold text-indigo-600 text-lg tracking-wider">1903 8888 6666</span>
                     </div>
                     <div className="bg-white p-3 rounded border border-slate-200 text-center font-mono font-bold text-slate-700">
                        OMNI {selectedPlan?.id.toUpperCase()} U123
                     </div>
                  </div>
               )}
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Đơn hàng</h3>
            <div className="space-y-3 border-b border-slate-100 pb-4 mb-4 text-sm">
               <div className="flex justify-between">
                  <span className="text-slate-500">Gói dịch vụ</span>
                  <span className="font-medium text-slate-800">{selectedPlan?.name}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-slate-500">Thời hạn</span>
                  <span className="font-medium text-slate-800">{selectedDuration.label}</span>
               </div>
               <div className="flex justify-between text-green-600">
                  <span>Tiết kiệm</span>
                  <span>-{formatCurrency(selectedPlan ? (selectedPlan.basePrice * selectedDuration.months) * selectedDuration.discount : 0)}</span>
               </div>
               {isVoucherApplied && (
                 <div className="flex justify-between text-green-600 font-medium pt-2 border-t border-slate-100/50 mt-2">
                    <span>Mã giảm giá (NEWBIE30)</span>
                    <span>-30% ({formatCurrency((selectedPlan ? calculateTotal(selectedPlan, selectedDuration) : 0) * 0.3)})</span>
                 </div>
               )}
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="flex gap-2">
                    <input 
                       type="text"
                       value={voucherCode}
                       onChange={(e) => setVoucherCode(e.target.value)}
                       placeholder="Nhập mã giảm giá..."
                       className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 uppercase bg-white"
                    />
                    <button 
                       onClick={handleApplyVoucher}
                       className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-900 transition-colors whitespace-nowrap"
                    >
                       Áp dụng
                    </button>
                 </div>
                 {voucherError && <p className="text-red-500 text-[11px] mt-1.5 font-medium">{voucherError}</p>}
                 {isVoucherApplied && <p className="text-green-600 text-[11px] mt-1.5 font-medium flex items-center gap-1"><Check size={12}/> Đã áp dụng mã giảm giá thành công!</p>}
            </div>

            <div className="flex justify-between items-end mb-6">
               <span className="font-bold text-slate-800">Tổng thanh toán</span>
               <div className="text-right">
                   {isVoucherApplied && (
                       <div className="text-sm text-slate-400 line-through mb-0.5">
                           {formatCurrency(selectedPlan ? calculateTotal(selectedPlan, selectedDuration) : 0)}
                       </div>
                   )}
                   <span className="text-2xl font-bold text-indigo-600">
                       {formatCurrency(
                            (selectedPlan ? calculateTotal(selectedPlan, selectedDuration) : 0) * (isVoucherApplied ? 0.7 : 1)
                       )}
                   </span>
               </div>
            </div>
            <button 
               onClick={handlePayment}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all"
            >
               Xác nhận đã chuyển khoản
            </button>
         </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen">
       {view === 'plans' && renderPricingUI()}
       {view === 'payment' && renderPaymentGateway()}
       {(view === 'success' || view === 'failure') && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200 max-w-lg mx-auto mt-10">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${view === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {view === 'success' ? <Check size={32}/> : <X size={32}/>}
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">{view === 'success' ? 'Thanh toán thành công!' : 'Giao dịch thất bại'}</h2>
             <p className="text-slate-500 mb-8 text-center px-6">
                {view === 'success' ? `Gói ${currentTransaction?.planName} đã được kích hoạt.` : 'Vui lòng kiểm tra lại thông tin hoặc thử phương thức khác.'}
             </p>
             <button onClick={() => setView('plans')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Trở về trang chủ</button>
          </div>
       )}
       {view === 'history' && (
          <div className="max-w-5xl mx-auto pt-6 px-4">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('plans')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={20}/></button>
                <h2 className="text-xl font-bold text-slate-800">Lịch sử giao dịch</h2>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                         <th className="px-6 py-4">Mã HĐ</th>
                         <th className="px-6 py-4">Dịch vụ</th>
                         <th className="px-6 py-4 text-right">Số tiền</th>
                         <th className="px-6 py-4 text-center">Trạng thái</th>
                         <th className="px-6 py-4">Ngày</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {MOCK_TRANSACTIONS.map(trx => (
                         <tr key={trx.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-slate-600">{trx.invoiceCode}</td>
                            <td className="px-6 py-4 font-medium text-slate-800">{trx.planName}</td>
                            <td className="px-6 py-4 text-right font-bold">{formatCurrency(trx.amount)}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${trx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {trx.status === 'success' ? 'Thành công' : 'Thất bại'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </div>
  );
};

export default Membership;