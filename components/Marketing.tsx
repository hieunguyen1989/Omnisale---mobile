
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Ticket, Rocket, MessageSquareQuote, Zap, Plus, Clock, Save, 
  MessageSquare, Calendar, Filter, Trash2, Shuffle, Pin, AlertCircle, Info, ChevronDown, Check,
  PlusCircle, X, Settings, List, Search, Edit3, CheckSquare, Square, AlertTriangle, TrendingUp, RefreshCw, Loader2, DollarSign, Percent, Store
} from 'lucide-react';
import { MOCK_FLASH_SALES, MOCK_VOUCHERS, MOCK_PRODUCTS, INITIAL_INTEGRATIONS } from '../services/mockData';
import { Platform } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
};

// Mock Shopee Time Slots
const SHOPEE_SLOTS = ["00:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flashsale' | 'vouchers' | 'push' | 'autoreply' | 'automessage'>('flashsale');
  
  // --- Shop Selectors ---
  const shopeeShops = useMemo(() => {
    return INITIAL_INTEGRATIONS.find(i => i.platform === Platform.SHOPEE)?.shops || [];
  }, []);

  const [selectedFlashSaleShop, setSelectedFlashSaleShop] = useState(shopeeShops[0]?.id || '');
  const [selectedPushShop, setSelectedPushShop] = useState(shopeeShops[0]?.id || '');

  // --- Flash Sale AI State ---
  const [selectedSlot, setSelectedSlot] = useState(SHOPEE_SLOTS[1]);
  const [flashSales, setFlashSales] = useState(MOCK_FLASH_SALES);
  
  // New State for Modals
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // AI Config State
  const [aiConfig, setAiConfig] = useState({
    minDiscount: 5,
    maxDiscount: 50,
    minStock: 10,
    maxQuantityPerUser: 2,
    priorityCategory: 'all',
    autoApprove: false
  });

  // Bulk Create State
  const [bulkCreateSearch, setBulkCreateSearch] = useState('');
  const [selectedProductsForBulk, setSelectedProductsForBulk] = useState<string[]>([]);
  
  // New: Per-product config for Bulk Create
  const [bulkProductConfigs, setBulkProductConfigs] = useState<Record<string, { type: 'percent' | 'amount', value: number }>>({});
  const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'amount'>('percent');
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(10);

  // New: Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTasks, setSubmissionTasks] = useState<{id: string, label: string, status: 'pending' | 'loading' | 'success' | 'error'}[]>([]);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  // New: Multiple Dates & Slots for Bulk Create
  const [bulkSelectedDates, setBulkSelectedDates] = useState<string[]>([]);
  const [bulkSelectedSlots, setBulkSelectedSlots] = useState<string[]>([]);

  // Bulk Edit State
  const [bulkEditGlobalDiscount, setBulkEditGlobalDiscount] = useState<number | ''>('');
  const [bulkEditGlobalStock, setBulkEditGlobalStock] = useState<number | ''>('');

  // --- Vouchers State ---
  const [vouchers, setVouchers] = useState(MOCK_VOUCHERS);
  const [voucherFilterStatus, setVoucherFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [voucherDateRange, setVoucherDateRange] = useState({ start: '', end: '' });

  // --- Push Product State ---
  const [pushSlots, setPushSlots] = useState<(string | null)[]>([MOCK_PRODUCTS[0].id, MOCK_PRODUCTS[3].id, null, null, null]); // 5 Slots
  const [pushCountdown, setPushCountdown] = useState(14400); // 4 hours in seconds

  // --- Auto Message State ---
  const [selectedMsgShop, setSelectedMsgShop] = useState(shopeeShops[0]?.id || '');
  // Structure: ShopID -> EventType -> Config
  const [msgConfigs, setMsgConfigs] = useState<Record<string, any>>({
    'sh1': {
      'new_order': {
        enabled: true,
        mode: 'random', // 'random' or 'fixed'
        templates: [
          "Cảm ơn bạn đã đặt hàng tại Shop! Đơn hàng sẽ sớm được đóng gói ạ ❤️",
          "Shop đã nhận được đơn của bạn. Bạn để ý điện thoại nhận hàng nhé!",
          "Hi hi, cảm ơn bạn đã ủng hộ. Cần hỗ trợ gì cứ nhắn shop nha!"
        ]
      },
      'shipping': { 
          enabled: true, 
          mode: 'fixed', 
          templates: ["Đơn hàng đã giao cho ĐVVC. Vui lòng chờ 2-3 ngày ạ."] 
      }
    }
  });
  const [activeMsgEvent, setActiveMsgEvent] = useState('new_order');

  // --- Auto Reply State ---
  const [activeStarTab, setActiveStarTab] = useState(5);
  // Fixed: Added missing '2' key to prevent crash
  const [replyConfigs, setReplyConfigs] = useState<Record<number, { enabled: boolean, mode: 'random' | 'fixed', templates: string[] }>>({
    5: { enabled: true, mode: 'random', templates: ["Cảm ơn bạn đã đánh giá 5 sao! ❤️", "Shop rất vui vì bạn hài lòng ạ!", "Tuyệt vời! Mong bạn quay lại ủng hộ shop nhé."] },
    4: { enabled: true, mode: 'fixed', templates: ["Cảm ơn bạn. Shop sẽ cố gắng hơn nữa!"] },
    3: { enabled: false, mode: 'fixed', templates: ["Shop xin lỗi vì trải nghiệm chưa tốt. Inbox shop hỗ trợ nhé."] },
    2: { enabled: true, mode: 'fixed', templates: ["Rất tiếc vì sản phẩm chưa làm bạn hài lòng. Shop sẽ liên hệ xử lý ngay."] },
    1: { enabled: true, mode: 'fixed', templates: ["Thành thật xin lỗi bạn. Shop đã inbox để giải quyết ạ."] },
  });

  // --- Helpers & Effects ---

  useEffect(() => {
    const timer = setInterval(() => {
        setPushCountdown(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Bulk Create Defaults when modal opens
  useEffect(() => {
    if (isBulkCreateOpen) {
      // Default next 3 days
      const dates = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toLocaleDateString('en-GB')); // DD/MM/YYYY format for ID
      }
      setBulkSelectedDates(dates);
      setBulkSelectedSlots([selectedSlot]); // Default to current selected slot
      setSelectedProductsForBulk([]);
      setBulkProductConfigs({});
      setIsSubmitting(false);
      setSubmissionTasks([]);
      setSubmissionComplete(false);
    }
  }, [isBulkCreateOpen, selectedSlot]);

  // Handle Submission Process
  useEffect(() => {
    if (isSubmitting && !submissionComplete) {
      const processNext = async () => {
        const pendingTaskIndex = submissionTasks.findIndex(t => t.status === 'pending');
        if (pendingTaskIndex === -1) {
          setSubmissionComplete(true);
          return;
        }

        // Set current task to loading
        setSubmissionTasks(prev => {
          const next = [...prev];
          next[pendingTaskIndex].status = 'loading';
          return next;
        });

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800)); // 0.8s per task

        // Random success/error (mostly success)
        const isError = Math.random() > 0.9;

        setSubmissionTasks(prev => {
          const next = [...prev];
          next[pendingTaskIndex].status = isError ? 'error' : 'success';
          return next;
        });
      };

      processNext();
    }
  }, [isSubmitting, submissionTasks, submissionComplete]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMsgConfig = () => {
      // Default structure if not exists
      if (!msgConfigs[selectedMsgShop]) return {};
      if (!msgConfigs[selectedMsgShop][activeMsgEvent]) return { enabled: false, mode: 'random', templates: [] };
      return msgConfigs[selectedMsgShop][activeMsgEvent];
  };

  const updateMsgConfig = (key: string, value: any) => {
      setMsgConfigs(prev => ({
          ...prev,
          [selectedMsgShop]: {
              ...prev[selectedMsgShop],
              [activeMsgEvent]: {
                  ...(prev[selectedMsgShop]?.[activeMsgEvent] || { enabled: false, mode: 'random', templates: [] }),
                  [key]: value
              }
          }
      }));
  };

  const addMsgTemplate = () => {
      const currentTemplates = getMsgConfig().templates || [];
      updateMsgConfig('templates', [...currentTemplates, ""]);
  };

  const updateMsgTemplateText = (idx: number, text: string) => {
      const currentTemplates = [...(getMsgConfig().templates || [])];
      currentTemplates[idx] = text;
      updateMsgConfig('templates', currentTemplates);
  };

  const removeMsgTemplate = (idx: number) => {
      const currentTemplates = [...(getMsgConfig().templates || [])];
      currentTemplates.splice(idx, 1);
      updateMsgConfig('templates', currentTemplates);
  };

  const handleBulkEditApply = (type: 'discount' | 'stock') => {
    if (type === 'discount' && bulkEditGlobalDiscount !== '') {
        setFlashSales(prev => prev.map(sale => ({
            ...sale,
            discountPercent: Number(bulkEditGlobalDiscount),
            flashSalePrice: sale.originalPrice * (1 - Number(bulkEditGlobalDiscount) / 100)
        })));
    } else if (type === 'stock' && bulkEditGlobalStock !== '') {
        setFlashSales(prev => prev.map(sale => ({
            ...sale,
            stock: Number(bulkEditGlobalStock)
        })));
    }
  };

  const applyGlobalDiscount = () => {
    const newConfigs = { ...bulkProductConfigs };
    selectedProductsForBulk.forEach(pid => {
        newConfigs[pid] = {
            type: globalDiscountType,
            value: globalDiscountValue
        };
    });
    setBulkProductConfigs(newConfigs);
  };

  // --- Render Functions ---

  const renderAiConfigModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600"/> Cấu hình AI Agent
          </h3>
          <button onClick={() => setIsAiConfigOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Biên độ giảm giá cho phép</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={aiConfig.minDiscount}
                onChange={(e) => setAiConfig({...aiConfig, minDiscount: Number(e.target.value)})}
                className="w-20 border border-slate-200 rounded-lg p-2 text-center text-sm"
              />
              <span className="text-slate-400">%</span>
              <span className="text-slate-400 font-bold">-</span>
              <input 
                type="number" 
                value={aiConfig.maxDiscount}
                onChange={(e) => setAiConfig({...aiConfig, maxDiscount: Number(e.target.value)})}
                className="w-20 border border-slate-200 rounded-lg p-2 text-center text-sm"
              />
              <span className="text-slate-400">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">AI sẽ chỉ đề xuất giá nằm trong khoảng này.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tồn kho tối thiểu</label>
              <input 
                type="number" 
                value={aiConfig.minStock}
                onChange={(e) => setAiConfig({...aiConfig, minStock: Number(e.target.value)})}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giới hạn mua/người</label>
              <input 
                type="number" 
                value={aiConfig.maxQuantityPerUser}
                onChange={(e) => setAiConfig({...aiConfig, maxQuantityPerUser: Number(e.target.value)})}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục ưu tiên</label>
            <select 
              value={aiConfig.priorityCategory}
              onChange={(e) => setAiConfig({...aiConfig, priorityCategory: e.target.value})}
              className="w-full border-slate-200 rounded-lg p-2 text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="fashion">Thời trang</option>
              <option value="tech">Điện tử</option>
              <option value="home">Nhà cửa</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input 
              type="checkbox" 
              checked={aiConfig.autoApprove}
              onChange={(e) => setAiConfig({...aiConfig, autoApprove: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-bold text-slate-800">Tự động duyệt</div>
              <div className="text-xs text-slate-500">AI tự động tạo Flash Sale mà không cần xác nhận thủ công.</div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button onClick={() => setIsAiConfigOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg">Hủy</button>
          <button onClick={() => setIsAiConfigOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">Lưu cấu hình</button>
        </div>
      </div>
    </div>
  );

  const renderSubmissionScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-indigo-50">
                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Rocket className="animate-bounce" size={24} /> 
                    {submissionComplete ? 'Đã hoàn tất đăng ký' : 'Đang đồng bộ lên Shopee...'}
                </h3>
                <p className="text-sm text-indigo-700 mt-1">Hệ thống đang tự động đăng ký Flash Sale cho các khung giờ đã chọn.</p>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-slate-100">
                    {submissionTasks.map((task, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                    task.status === 'pending' ? 'border-slate-200 bg-white text-slate-300' :
                                    task.status === 'loading' ? 'border-indigo-200 bg-indigo-50 text-indigo-600' :
                                    task.status === 'success' ? 'border-green-200 bg-green-50 text-green-600' :
                                    'border-red-200 bg-red-50 text-red-600'
                                }`}>
                                    {task.status === 'pending' && <span className="text-xs font-bold">{idx + 1}</span>}
                                    {task.status === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                    {task.status === 'success' && <Check size={16} />}
                                    {task.status === 'error' && <X size={16} />}
                                </div>
                                <span className={`text-sm font-medium ${task.status === 'pending' ? 'text-slate-500' : 'text-slate-800'}`}>
                                    {task.label}
                                </span>
                            </div>
                            <div>
                                {task.status === 'success' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Thành công</span>}
                                {task.status === 'error' && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Lỗi - Thử lại</span>}
                                {task.status === 'loading' && <span className="text-xs font-bold text-indigo-600">Đang xử lý...</span>}
                                {task.status === 'pending' && <span className="text-xs text-slate-400">Đang chờ</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {submissionComplete && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button 
                        onClick={() => setIsBulkCreateOpen(false)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        <Check size={18} /> Đóng cửa sổ
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  const renderBulkCreateModal = () => {
    // Helper to toggle selection
    const toggleDate = (date: string) => {
      setBulkSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
    };
    const toggleSlot = (slot: string) => {
      setBulkSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
    };

    // Generate tasks for submission
    const handleStartCreate = () => {
        if (selectedProductsForBulk.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm");
        if (bulkSelectedDates.length === 0 || bulkSelectedSlots.length === 0) return alert("Vui lòng chọn ít nhất 1 ngày và 1 khung giờ");

        const tasks: {id: string, label: string, status: 'pending' | 'loading' | 'success' | 'error'}[] = [];
        bulkSelectedDates.forEach(date => {
            bulkSelectedSlots.forEach(slot => {
                tasks.push({
                    id: `${date}-${slot}`,
                    label: `Đăng ký Flash Sale ngày ${date} lúc ${slot}`,
                    status: 'pending'
                });
            });
        });

        setSubmissionTasks(tasks);
        setIsSubmitting(true);
    };

    // Helper to generate next few days
    const nextDays = [];
    for(let i=0; i<5; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        nextDays.push(d);
    }

    const totalCampaigns = selectedProductsForBulk.length * bulkSelectedDates.length * bulkSelectedSlots.length;

    // Filter and Sort Products: Bestsellers first
    const sortedProducts = MOCK_PRODUCTS
        .filter(p => p.name.toLowerCase().includes(bulkCreateSearch.toLowerCase()) || p.sku.toLowerCase().includes(bulkCreateSearch.toLowerCase()))
        .sort((a, b) => b.totalSold - a.totalSold);

    return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden h-[90vh] flex flex-col">
        {!isSubmitting && (
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-orange-50">
            <h3 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                <Zap size={20} className="text-orange-600"/> Tạo Flash Sale hàng loạt
            </h3>
            <button onClick={() => setIsBulkCreateOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
        )}
        
        {isSubmitting ? renderSubmissionScreen() : (
        <>
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {/* Configuration Section */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Chọn ngày chạy</label>
                <div className="flex gap-2 flex-wrap">
                   {nextDays.map((d, i) => {
                      const dateStr = d.toLocaleDateString('en-GB');
                      const isSelected = bulkSelectedDates.includes(dateStr);
                      return (
                         <button 
                           key={i}
                           onClick={() => toggleDate(dateStr)}
                           className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}
                         >
                            {dateStr} {i===0 ? '(Hôm nay)' : ''}
                         </button>
                      )
                   })}
                </div>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Chọn khung giờ</label>
                <div className="flex gap-2 flex-wrap">
                   {SHOPEE_SLOTS.map((slot) => {
                      const isSelected = bulkSelectedSlots.includes(slot);
                      return (
                         <button 
                           key={slot}
                           onClick={() => toggleSlot(slot)}
                           className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}
                         >
                            {slot}
                         </button>
                      )
                   })}
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Tìm sản phẩm theo tên, SKU..." 
                value={bulkCreateSearch}
                onChange={(e) => setBulkCreateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            
            {/* Global Settings */}
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
               <span className="text-sm font-medium text-indigo-900 whitespace-nowrap">Thiết lập chung:</span>
               <div className="flex items-center border border-indigo-200 rounded-md bg-white overflow-hidden">
                   <input 
                     type="number" 
                     value={globalDiscountValue}
                     onChange={(e) => setGlobalDiscountValue(Number(e.target.value))}
                     className="w-20 p-1 text-center text-sm outline-none font-bold text-indigo-700"
                   />
                   <select 
                     value={globalDiscountType}
                     onChange={(e) => setGlobalDiscountType(e.target.value as any)}
                     className="bg-indigo-50 text-indigo-700 text-xs font-bold p-1 outline-none border-l border-indigo-200 h-full"
                   >
                       <option value="percent">%</option>
                       <option value="amount">đ</option>
                   </select>
               </div>
               <button 
                 onClick={applyGlobalDiscount}
                 className="text-xs bg-indigo-600 text-white px-2 py-1.5 rounded hover:bg-indigo-700 font-medium"
               >
                 Áp dụng
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <CheckSquare size={16} className="mx-auto text-slate-400" />
                  </th>
                  <th className="px-4 py-3 w-[40%]">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Giá gốc</th>
                  <th className="px-4 py-3 text-center">Giảm giá</th>
                  <th className="px-4 py-3 text-right">Giá sau giảm</th>
                  <th className="px-4 py-3 text-center">Lượt bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map((p, index) => {
                  const isChecked = selectedProductsForBulk.includes(p.id);
                  const isDisabled = !isChecked && selectedProductsForBulk.length >= 10;
                  const isTopSelling = index < 5; // Top 5 best sellers
                  
                  // Product specific config or global default if checked but no config yet
                  const config = bulkProductConfigs[p.id] || { type: globalDiscountType, value: globalDiscountValue };
                  
                  const discountAmount = config.type === 'percent' 
                    ? (p.price * config.value / 100) 
                    : config.value;
                  const finalPrice = Math.max(0, p.price - discountAmount);

                  return (
                  <tr 
                    key={p.id} 
                    className={`transition-colors ${
                        isChecked 
                        ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                        : isDisabled 
                            ? 'opacity-50 grayscale bg-slate-50' 
                            : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedProductsForBulk.length >= 10) {
                                alert("Chỉ được chọn tối đa 10 sản phẩm cho Flash Sale hàng loạt.");
                                return;
                            }
                            setSelectedProductsForBulk([...selectedProductsForBulk, p.id]);
                            // Set default config when checking
                            setBulkProductConfigs(prev => ({...prev, [p.id]: { type: globalDiscountType, value: globalDiscountValue } }));
                          } else {
                            setSelectedProductsForBulk(selectedProductsForBulk.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer disabled:cursor-not-allowed w-4 h-4" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <img src={p.image} className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0 bg-white" />
                        <div className="min-w-0 flex flex-col gap-1 w-full">
                          <div className="font-medium text-slate-800 truncate" title={p.name}>{p.name}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-500 bg-white px-1.5 rounded border border-slate-200">SKU: {p.sku}</span>
                              {isTopSelling && (
                                  <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold shrink-0">
                                      <TrendingUp size={10} /> Hot
                                  </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 line-through">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-center">
                        {isChecked ? (
                            <div className="flex items-center justify-center border border-orange-300 rounded-md bg-white overflow-hidden w-32 mx-auto shadow-sm">
                                <input 
                                    type="number" 
                                    value={config.value}
                                    onChange={(e) => setBulkProductConfigs(prev => ({...prev, [p.id]: { ...config, value: Number(e.target.value) }}))}
                                    className="w-16 p-1 text-center text-sm outline-none font-bold text-orange-700"
                                />
                                <select 
                                    value={config.type}
                                    onChange={(e) => setBulkProductConfigs(prev => ({...prev, [p.id]: { ...config, type: e.target.value as any }}))}
                                    className="bg-orange-50 text-orange-800 text-xs font-bold p-1 outline-none border-l border-orange-200 h-full cursor-pointer"
                                >
                                    <option value="percent">%</option>
                                    <option value="amount">đ</option>
                                </select>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-sm">-</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isChecked ? 'text-orange-600 text-base' : 'text-slate-400'}`}>
                            {formatCurrency(finalPrice)}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isTopSelling ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {p.totalSold} đã bán
                        </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="text-sm text-slate-600">
               Đã chọn <span className={`font-bold ${selectedProductsForBulk.length === 10 ? 'text-red-600' : 'text-orange-600'}`}>{selectedProductsForBulk.length}</span> / 10 sản phẩm
             </div>
             {selectedProductsForBulk.length === 10 && (
                <div className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                   <AlertTriangle size={12} /> Đã đạt giới hạn tối đa
                </div>
             )}
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setIsBulkCreateOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Hủy</button>
            <button 
              onClick={handleStartCreate}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm flex items-center gap-2"
            >
              <Rocket size={16} /> Xác nhận tạo ({totalCampaigns} Slot)
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )};

  const renderBulkEditModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden h-[85vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Edit3 size={20} className="text-indigo-600"/> Chỉnh sửa Flash Sale hàng loạt
          </h3>
          <button onClick={() => setIsBulkEditOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        {/* Quick Toolbar */}
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex flex-wrap items-center gap-4">
            <div className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <Settings size={16} /> Thiết lập nhanh:
            </div>
            
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-indigo-200">
                <span className="text-xs text-slate-500">Giảm giá (%):</span>
                <input 
                    type="number" 
                    value={bulkEditGlobalDiscount}
                    onChange={(e) => setBulkEditGlobalDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 text-sm border-none focus:ring-0 text-center font-bold text-indigo-600"
                    placeholder="VD: 20"
                />
                <button 
                    onClick={() => handleBulkEditApply('discount')}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                >
                    Áp dụng
                </button>
            </div>

            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-indigo-200">
                <span className="text-xs text-slate-500">Tồn kho KM:</span>
                <input 
                    type="number" 
                    value={bulkEditGlobalStock}
                    onChange={(e) => setBulkEditGlobalStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 text-sm border-none focus:ring-0 text-center font-bold text-indigo-600"
                    placeholder="VD: 50"
                />
                <button 
                    onClick={() => handleBulkEditApply('stock')}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                >
                    Áp dụng
                </button>
            </div>
            <div className="text-xs text-indigo-400 ml-auto flex items-center gap-1">
                <Info size={12} /> Áp dụng cho tất cả {flashSales.length} sản phẩm bên dưới
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Sản phẩm</th>
                <th className="px-4 py-4 border-b border-slate-200 w-32 text-right">Giá gốc</th>
                <th className="px-4 py-4 border-b border-slate-200 w-40 text-center">Giảm giá (%)</th>
                <th className="px-4 py-4 border-b border-slate-200 w-40 text-right">Giá sau giảm</th>
                <th className="px-4 py-4 border-b border-slate-200 w-32 text-center">SL Khuyến mãi</th>
                <th className="px-4 py-4 border-b border-slate-200 w-16 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flashSales.map((sale, idx) => (
                <tr key={sale.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                          <img src={sale.productImage} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                          <div className="absolute -top-1 -left-1 bg-slate-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                              {idx + 1}
                          </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate max-w-[250px]" title={sale.productName}>{sale.productName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {sale.startTime}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-medium">{formatCurrency(sale.originalPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative w-24 mx-auto">
                        <input 
                        type="number" 
                        value={sale.discountPercent}
                        onChange={(e) => {
                            const newDiscount = Number(e.target.value);
                            setFlashSales(prev => prev.map(s => s.id === sale.id ? { 
                                ...s, 
                                discountPercent: newDiscount,
                                flashSalePrice: s.originalPrice * (1 - newDiscount/100)
                            } : s));
                        }}
                        className="w-full border border-slate-300 rounded-md py-1.5 px-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold text-indigo-600"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                      <div className="font-bold text-orange-600 text-base">{formatCurrency(sale.flashSalePrice)}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      value={sale.stock}
                      onChange={(e) => {
                          const newStock = Number(e.target.value);
                          setFlashSales(prev => prev.map(s => s.id === sale.id ? { ...s, stock: newStock } : s));
                      }}
                      className="w-20 border border-slate-300 rounded-md py-1.5 px-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                        onClick={() => setFlashSales(prev => prev.filter(s => s.id !== sale.id))}
                        className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
             Đang chỉnh sửa <strong className="text-slate-800">{flashSales.length}</strong> sản phẩm
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsBulkEditOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Hủy</button>
            <button 
                onClick={() => {
                alert("Đã cập nhật thay đổi thành công!");
                setIsBulkEditOpen(false);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2"
            >
                <Save size={16} /> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFlashSale = () => (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-300 fill-yellow-300" /> Shopee Flash Sale AI
            </h3>
            <p className="text-orange-100 text-sm mt-1 max-w-lg">
              Hệ thống tự động phân tích hành vi người dùng và tồn kho để đề xuất sản phẩm vào khung giờ vàng của Shopee.
            </p>
          </div>
          <button 
            onClick={() => setIsAiConfigOpen(true)}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
             <Settings size={16} /> Cập nhật cấu hình AI
          </button>
        </div>
      </div>

      {/* Shop Selector */}
      <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
            <Store className="text-orange-500" size={20} />
            <span className="font-bold text-slate-700 text-sm">Chọn Gian hàng Shopee:</span>
        </div>
        <select
            value={selectedFlashSaleShop}
            onChange={(e) => setSelectedFlashSaleShop(e.target.value)}
            className="flex-1 bg-orange-50 border border-orange-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        >
            {shopeeShops.length > 0 ? (
                shopeeShops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))
            ) : (
                <option value="">Không có gian hàng Shopee nào được kết nối</option>
            )}
        </select>
        {shopeeShops.length === 0 && (
            <span className="text-xs text-red-500">Vui lòng kết nối gian hàng Shopee để sử dụng tính năng này.</span>
        )}
      </div>

      {/* Time Slots & Bulk Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
           {SHOPEE_SLOTS.map(slot => (
               <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex flex-col items-center min-w-[100px] p-3 rounded-lg border-2 transition-all ${
                      selectedSlot === slot 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-slate-100 bg-white hover:border-orange-200'
                  }`}
               >
                  <span className={`text-lg font-bold ${selectedSlot === slot ? 'text-orange-600' : 'text-slate-600'}`}>{slot}</span>
                  <span className="text-xs text-slate-400">{slot === '00:00' ? 'Đang diễn ra' : 'Sắp tới'}</span>
               </button>
           ))}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={() => setIsBulkCreateOpen(true)}
             disabled={!selectedFlashSaleShop}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Plus size={16} /> Tạo hàng loạt
           </button>
           <button 
             onClick={() => setIsBulkEditOpen(true)}
             disabled={!selectedFlashSaleShop}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Edit3 size={16} /> Sửa hàng loạt
           </button>
        </div>
      </div>

      {/* Suggested Products */}
      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Đề xuất tối ưu ({flashSales.length} sản phẩm)</h4>
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info size={12}/> Tiêu chí: Tồn kho &gt; {aiConfig.minStock}, {aiConfig.priorityCategory === 'all' ? 'Tất cả danh mục' : `Ưu tiên ${aiConfig.priorityCategory}`}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSales.map(sale => (
            <div key={sale.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-40">
                <img src={sale.productImage} alt={sale.productName} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    -{sale.discountPercent}%
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                    <div className="text-white text-xs font-medium flex items-center gap-1">
                        <Clock size={12} /> Kết thúc: {sale.endTime.split(' ')[1]}
                    </div>
                </div>
                </div>
                <div className="p-4 space-y-3">
                <h4 className="font-semibold text-slate-800 line-clamp-1" title={sale.productName}>{sale.productName}</h4>
                <div className="flex justify-between items-end">
                    <div>
                    <div className="text-xs text-slate-500 line-through">{formatCurrency(sale.originalPrice)}</div>
                    <div className="text-lg font-bold text-orange-600">{formatCurrency(sale.flashSalePrice)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Đã bán</div>
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{width: `${(sale.sold / sale.stock) * 100}%`}}></div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sale.sold}/{sale.stock}</div>
                    </div>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-xs text-indigo-700 flex gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                    {sale.aiReason}
                </div>
                
                <button className="w-full mt-2 border border-orange-200 text-orange-600 hover:bg-orange-50 font-medium py-1.5 rounded-lg text-sm transition-colors">
                    Chỉnh sửa
                </button>
                </div>
            </div>
            ))}
            <div 
              onClick={() => setIsBulkCreateOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-orange-300 hover:text-orange-500 cursor-pointer transition-colors min-h-[300px]"
            >
                <Plus size={32} />
                <span className="font-medium mt-2">Thêm sản phẩm thủ công</span>
            </div>
         </div>
      </div>

      {/* Render Modals */}
      {isAiConfigOpen && renderAiConfigModal()}
      {isBulkCreateOpen && renderBulkCreateModal()}
      {isBulkEditOpen && renderBulkEditModal()}
    </div>
  );

  const renderVouchers = () => {
    // Filter logic
    const filteredVouchers = vouchers.filter(v => {
        if (voucherFilterStatus !== 'all' && v.status !== voucherFilterStatus) return false;
        // Mock date filtering logic if inputs are filled
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-bold text-blue-800 text-sm">Quản lý Voucher Đơn ngoài sàn</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        Các mã giảm giá này được áp dụng khi tạo đơn thủ công (tại quầy hoặc qua tin nhắn). Không áp dụng trực tiếp trên sàn TMĐT.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Filter Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Bộ lọc:</span>
                    </div>
                    <select 
                        value={voucherFilterStatus}
                        onChange={(e) => setVoucherFilterStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="expired">Đã hết hạn</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Từ:</span>
                        <input type="date" className="bg-white border border-slate-200 text-sm rounded-lg px-2 py-1.5" />
                        <span className="text-sm text-slate-500">Đến:</span>
                        <input type="date" className="bg-white border border-slate-200 text-sm rounded-lg px-2 py-1.5" />
                    </div>
                    <button className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Plus size={16} /> Tạo Voucher mới
                    </button>
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                        <th className="px-6 py-4">Mã Voucher</th>
                        <th className="px-6 py-4">Loại & Giá trị</th>
                        <th className="px-6 py-4">Điều kiện</th>
                        <th className="px-6 py-4">Lượt dùng</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4 text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredVouchers.map(voucher => (
                        <tr key={voucher.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit border border-indigo-100 font-mono">
                                    {voucher.code}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-800">
                                    {voucher.type === 'percent' ? `Giảm ${voucher.value}%` : `Giảm ${formatCurrency(voucher.value)}`}
                                </div>
                                <div className="text-xs text-slate-500">{voucher.type === 'percent' ? 'Theo phần trăm' : 'Theo số tiền'}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                Đơn tối thiểu {formatCurrency(voucher.minSpend)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${(voucher.used / voucher.usageLimit) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-500">{voucher.used}/{voucher.usageLimit}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                                01/05/2025 - 31/05/2025
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${voucher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {voucher.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                                </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderPush = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-full h-fit border border-orange-200 shadow-sm">
                <Rocket className="text-orange-600" size={24} />
            </div>
            <div>
                <h4 className="font-bold text-orange-800 text-lg">Đẩy sản phẩm (Shopee Bump)</h4>
                <p className="text-sm text-orange-700 mt-1 max-w-xl">
                    Shopee cho phép đẩy tối đa 5 sản phẩm mỗi 4 tiếng để hiển thị lên đầu mục "Mới nhất". 
                    Hệ thống sẽ tự động quay vòng sản phẩm cho bạn.
                </p>
            </div>
          </div>
          <div className="text-center bg-white px-6 py-3 rounded-lg border border-orange-200 shadow-sm">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Lần đẩy tiếp theo</div>
             <div className="text-2xl font-mono font-bold text-orange-600">{formatTime(pushCountdown)}</div>
          </div>
       </div>

       {/* Shop Selector */}
       <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
                <Store className="text-orange-500" size={20} />
                <span className="font-bold text-slate-700 text-sm">Chọn Gian hàng Shopee:</span>
            </div>
            <select
                value={selectedPushShop}
                onChange={(e) => setSelectedPushShop(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
                {shopeeShops.length > 0 ? (
                    shopeeShops.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))
                ) : (
                    <option value="">Không có gian hàng Shopee nào được kết nối</option>
                )}
            </select>
            {shopeeShops.length === 0 && (
                <span className="text-xs text-red-500">Vui lòng kết nối gian hàng Shopee.</span>
            )}
       </div>

       <div>
          <h3 className="font-bold text-slate-800 mb-4">Danh sách 5 Slot đang đẩy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
             {pushSlots.map((slotProductId, idx) => {
                 const product = MOCK_PRODUCTS.find(p => p.id === slotProductId);
                 return (
                    <div key={idx} className={`relative rounded-xl border-2 transition-all h-64 flex flex-col ${product ? 'border-orange-200 bg-white shadow-sm' : 'border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer'}`}>
                        {product ? (
                            <>
                                <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                                    Slot {idx + 1}
                                </div>
                                <button 
                                    onClick={() => {
                                        const newSlots = [...pushSlots];
                                        newSlots[idx] = null;
                                        setPushSlots(newSlots);
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full z-10 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                                <img src={product.image} className="w-full h-32 object-cover rounded-t-xl" />
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                    <h4 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{product.name}</h4>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-orange-600 font-bold text-sm">{formatCurrency(product.price)}</span>
                                        <div className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                            <Zap size={10} className="mr-0.5"/> Đang đẩy
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <PlusCircle size={32} />
                                <span className="text-sm font-medium">Thêm sản phẩm</span>
                            </div>
                        )}
                    </div>
                 )
             })}
          </div>
       </div>
    </div>
  );

  const renderAutoMessage = () => {
      const config = getMsgConfig();
      const templates = config.templates || [];

      return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Chọn Shop áp dụng</label>
                        <select 
                            value={selectedMsgShop} 
                            onChange={(e) => setSelectedMsgShop(e.target.value)}
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {shopeeShops.length > 0 ? shopeeShops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            )) : <option value="">Không có shop Shopee</option>}
                        </select>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">2. Sự kiện kích hoạt</label>
                        <div className="space-y-1">
                            {[
                                {id: 'new_order', label: 'Đơn hàng mới', desc: 'Gửi khi khách vừa đặt'},
                                {id: 'shipping', label: 'Đang giao hàng', desc: 'Khi ĐVVC đã lấy hàng'},
                                {id: 'delivered', label: 'Giao thành công', desc: 'Nhắc đánh giá 5 sao'},
                                {id: 'cancelled', label: 'Đơn hủy', desc: 'Hỏi lý do/Mời mua lại'}
                            ].map(evt => (
                                <button
                                    key={evt.id}
                                    onClick={() => setActiveMsgEvent(evt.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${activeMsgEvent === evt.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <div className={`font-bold text-sm ${activeMsgEvent === evt.id ? 'text-indigo-700' : 'text-slate-700'}`}>{evt.label}</div>
                                    <div className="text-xs text-slate-500">{evt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Templates Panel */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg">Cấu hình tin nhắn tự động</h3>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-slate-700">Trạng thái:</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.enabled} 
                                        onChange={(e) => updateMsgConfig('enabled', e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className={`space-y-6 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-slate-700">Chế độ gửi:</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        checked={config.mode === 'random'}
                                        onChange={() => updateMsgConfig('mode', 'random')}
                                        className="text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <span className="text-sm text-slate-600 flex items-center gap-1"><Shuffle size={14}/> Ngẫu nhiên</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        checked={config.mode === 'fixed'}
                                        onChange={() => updateMsgConfig('mode', 'fixed')}
                                        className="text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <span className="text-sm text-slate-600 flex items-center gap-1"><Pin size={14}/> Cố định (Theo thứ tự)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-slate-700">Danh sách mẫu tin nhắn ({templates.length})</label>
                                <button onClick={addMsgTemplate} className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
                                    <Plus size={14}/> Thêm mẫu
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {templates.map((tpl: string, idx: number) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-sm font-bold text-slate-400 py-2 w-6 text-center">{idx + 1}.</span>
                                        <textarea 
                                            value={tpl}
                                            onChange={(e) => updateMsgTemplateText(idx, e.target.value)}
                                            className="flex-1 border border-slate-200 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                                            placeholder="Nhập nội dung tin nhắn..."
                                        />
                                        <button 
                                            onClick={() => removeMsgTemplate(idx)}
                                            className="text-slate-400 hover:text-red-500 p-2 h-fit"
                                            title="Xóa mẫu"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {templates.length === 0 && (
                                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                                        Chưa có mẫu tin nhắn nào. Hãy thêm mới.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-xs text-yellow-800 flex gap-2">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <div>
                                <strong>Mẹo:</strong> Sử dụng <code>[TenKhach]</code>, <code>[MaDon]</code> để cá nhân hóa tin nhắn. 
                                Nên có ít nhất 3 mẫu khác nhau nếu chọn chế độ "Ngẫu nhiên" để tránh bị Shopee đánh dấu spam.
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                            <Save size={18} /> Lưu cấu hình
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const renderAutoReply = () => {
      const config = replyConfigs[activeStarTab];
      const updateConfig = (key: string, value: any) => {
          setReplyConfigs(prev => ({
              ...prev,
              [activeStarTab]: { ...prev[activeStarTab], [key]: value }
          }));
      };

      const updateTemplate = (idx: number, val: string) => {
          const newTpls = [...config.templates];
          newTpls[idx] = val;
          updateConfig('templates', newTpls);
      };

      const addTemplate = () => updateConfig('templates', [...config.templates, ""]);
      const removeTemplate = (idx: number) => {
          const newTpls = [...config.templates];
          newTpls.splice(idx, 1);
          updateConfig('templates', newTpls);
      };

      return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 h-full items-start min-h-[500px]">
                {/* Star Rating Tabs */}
                <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-100 h-fit overflow-hidden shrink-0">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800">Chọn số sao đánh giá</h4>
                    </div>
                    <div>
                        {[5, 4, 3, 2, 1].map(star => (
                            <button
                                key={star}
                                onClick={() => setActiveStarTab(star)}
                                className={`w-full text-left p-4 border-b border-slate-100 flex items-center justify-between transition-colors ${activeStarTab === star ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex items-center gap-2 font-bold text-slate-700">
                                    <span className="text-yellow-400 text-lg">{'★'.repeat(star)}</span>
                                    <span className="text-slate-400 text-xs">{'★'.repeat(5-star)}</span>
                                </div>
                                {replyConfigs[star]?.enabled && <Check size={16} className="text-green-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Config Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
                    {config ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    Cấu hình trả lời cho {activeStarTab} Sao <span className="text-yellow-400">★</span>
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">Tự động trả lời:</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={config.enabled} 
                                            onChange={(e) => updateConfig('enabled', e.target.checked)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </div>
                                </label>
                            </div>

                            <div className={`space-y-6 transition-opacity ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-slate-700">Chọn mẫu:</span>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={config.mode === 'random'} onChange={() => updateConfig('mode', 'random')} className="text-indigo-600" />
                                            <span className="text-sm text-slate-600">Ngẫu nhiên</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={config.mode === 'fixed'} onChange={() => updateConfig('mode', 'fixed')} className="text-indigo-600" />
                                            <span className="text-sm text-slate-600">Cố định</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {config.templates.map((tpl, idx) => (
                                        <div key={idx} className="relative">
                                            <textarea 
                                                value={tpl}
                                                onChange={(e) => updateTemplate(idx, e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                                                rows={2}
                                                placeholder={`Nhập mẫu trả lời số ${idx + 1}...`}
                                            />
                                            <button 
                                                onClick={() => removeTemplate(idx)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addTemplate} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> Thêm mẫu trả lời khác
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 py-10">
                            Không tìm thấy cấu hình cho lựa chọn này.
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Trung tâm Marketing</h2>
        <p className="text-sm text-slate-500">Tối ưu doanh số và chăm sóc khách hàng với các công cụ tự động chuyên sâu.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
        {[
            { id: 'flashsale', label: 'Flash Sale AI', icon: Zap },
            { id: 'vouchers', label: 'Mã giảm giá', icon: Ticket },
            { id: 'push', label: 'Shopee Bump', icon: Rocket },
            { id: 'automessage', label: 'Auto Nhắn tin', icon: MessageSquare },
            { id: 'autoreply', label: 'Auto Đánh giá', icon: MessageSquareQuote },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'flashsale' && renderFlashSale()}
        {activeTab === 'vouchers' && renderVouchers()}
        {activeTab === 'push' && renderPush()}
        {activeTab === 'automessage' && renderAutoMessage()}
        {activeTab === 'autoreply' && renderAutoReply()}
      </div>
    </div>
  );
};

export default Marketing;
