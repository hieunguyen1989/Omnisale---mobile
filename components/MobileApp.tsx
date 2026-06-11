
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Box, BookText, FileText, Zap, User, ScanLine, 
  LogOut, Bell, DollarSign, Wallet, Search, ArrowDownRight, ArrowUpRight, Filter, Plus, 
  History, ArrowDown, ArrowUp, Check, X, AlertCircle, MessageCircle, Edit3, Trash2, Camera, 
  ChevronRight, Truck, Menu, QrCode, Calendar, Save, CreditCard, Clock, ChevronLeft, Send, Star, Phone,
  PieChart, TrendingUp, BarChart3, Image as ImageIcon, Paperclip, ChevronDown, ChevronUp, CheckCircle, PackageX
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_INVOICES, MOCK_LEDGER_RECORDS, MOCK_CONVERSATIONS, MOCK_WAREHOUSES } from '../services/mockData';
import { UserProfile, Product, Platform, Invoice, LedgerRecord } from '../types';

interface MobileAppProps {
  user: UserProfile;
  onLogout: () => void;
  onSwitchToDesktop: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const MobileApp: React.FC<MobileAppProps> = ({ user, onLogout, onSwitchToDesktop }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'products' | 'chat' | 'menu' | 'inventory' | 'invoices' | 'reports'>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Shared state for Orders View filter
  const [orderFilter, setOrderFilter] = useState('processing');

  // Chat State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Product Management State
  const [editingProduct, setEditingProduct] = useState<Product | 'new' | null>(null);

  // Inventory Management State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [inventoryAction, setInventoryAction] = useState<{ type: 'import' | 'export', product: Product } | null>(null);

  // Calculate Real-time Stats for "Today"
  const todayStats = useMemo(() => {
    const revenue = MOCK_ORDERS.reduce((acc, o) => acc + o.total, 0);
    const profit = MOCK_ORDERS.reduce((acc, o) => acc + o.profit, 0);
    const costs = revenue - profit;
    const soldCount = MOCK_ORDERS.filter(o => o.status === 'delivered').length;
    const expressCount = MOCK_ORDERS.filter(o => o.shippingMethod === 'Hỏa tốc').length;
    const cancelCount = MOCK_ORDERS.filter(o => o.status === 'cancelled' || o.status === 'returned').length;

    return { revenue, profit, costs, soldCount, expressCount, cancelCount };
  }, []);

  const pendingOrders = useMemo(() => {
      return MOCK_ORDERS.filter(o => o.status === 'pending' || o.status === 'processing').slice(0, 5);
  }, []);

  const handleNavigateToOrders = (filter: string) => {
      setOrderFilter(filter);
      setActiveTab('orders');
  };

  // --- Views ---

  const ReportsView = () => {
      const [timeRange, setTimeRange] = useState<'day' | 'month' | 'quarter' | 'year'>('day');
      const [showCalendar, setShowCalendar] = useState(false);
      const [selectedDate, setSelectedDate] = useState(new Date());

      // Mock Data Generator based on Time Range
      const reportData = useMemo(() => {
          let multiplier = 1;
          if (timeRange === 'month') multiplier = 30;
          if (timeRange === 'quarter') multiplier = 90;
          if (timeRange === 'year') multiplier = 365;

          const baseRevenue = 15000000; // Daily base
          const revenue = baseRevenue * multiplier * (0.8 + Math.random() * 0.4);
          const profit = revenue * 0.35; // 35% margin
          const orders = Math.floor(revenue / 350000); // Avg order value ~350k

          const platforms = [
              { name: Platform.SHOPEE, percent: 45, color: 'bg-orange-500' },
              { name: Platform.TIKTOK, percent: 25, color: 'bg-black' },
              { name: Platform.LAZADA, percent: 15, color: 'bg-blue-600' },
              { name: Platform.FACEBOOK, percent: 10, color: 'bg-blue-500' },
              { name: Platform.WOOCOMMERCE, percent: 5, color: 'bg-purple-600' },
          ];

          // Chart Data Generation
          const chartData = Array.from({ length: 7 }).map((_, i) => ({
              name: timeRange === 'day' ? `${i*4}h` : timeRange === 'month' ? `W${i+1}` : `T${i+2}`,
              value: Math.floor(Math.random() * 10000000) + 5000000
          }));

          return { revenue, profit, orders, platforms, chartData };
      }, [timeRange]);

      // Calendar Logic
      const renderCalendar = () => {
          const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
          const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay(); // 0 is Sunday
          const days = [];
          
          // Empty slots for previous month
          for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
              days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
          }

          // Days
          for (let i = 1; i <= daysInMonth; i++) {
              const isSelected = i === selectedDate.getDate();
              days.push(
                  <button 
                      key={i} 
                      onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(i);
                          setSelectedDate(newDate);
                          setTimeRange('day');
                      }}
                      className={`h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'}`}
                  >
                      {i}
                  </button>
              );
          }

          return (
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 animate-fade-in shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800">Tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}</h3>
                      <div className="flex gap-2">
                          <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={20}/></button>
                          <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={20}/></button>
                      </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                          <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
                      ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                      {days}
                  </div>
                  <button 
                    onClick={() => setShowCalendar(false)}
                    className="w-full mt-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg"
                  >
                    Đóng lịch
                  </button>
              </div>
          );
      };

      return (
          <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
              {/* Header */}
              <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-slate-100 shadow-sm shrink-0">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setActiveTab('menu')} className="p-1 -ml-1 text-slate-600"><ChevronLeft size={24}/></button>
                          <h2 className="text-xl font-bold text-slate-800">Báo cáo kinh doanh</h2>
                      </div>
                      <button 
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`p-2 rounded-full transition-colors ${showCalendar ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}
                      >
                          <Calendar size={20}/>
                      </button>
                  </div>

                  {/* Time Filters */}
                  {!showCalendar && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'day', label: 'Hôm nay' },
                            { id: 'month', label: 'Tháng này' },
                            { id: 'quarter', label: 'Quý này' },
                            { id: 'year', label: 'Năm nay' },
                        ].map((t) => (
                            <button 
                                key={t.id}
                                onClick={() => setTimeRange(t.id as any)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${timeRange === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                  )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                  {/* Calendar Widget */}
                  {showCalendar && renderCalendar()}

                  {/* Hero Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                      <div className="relative z-10">
                          <div className="text-indigo-100 text-sm font-medium mb-1">Tổng doanh thu</div>
                          <div className="text-3xl font-bold mb-4">{formatCurrency(reportData.revenue)}</div>
                          
                          <div className="flex gap-4">
                              <div className="bg-white/20 rounded-lg p-2 flex-1 backdrop-blur-sm">
                                  <div className="text-indigo-100 text-xs mb-1">Lợi nhuận</div>
                                  <div className="font-bold text-emerald-300">{formatCurrency(reportData.profit)}</div>
                              </div>
                              <div className="bg-white/20 rounded-lg p-2 flex-1 backdrop-blur-sm">
                                  <div className="text-indigo-100 text-xs mb-1">Đơn hàng</div>
                                  <div className="font-bold">{reportData.orders} đơn</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-800">Biểu đồ tăng trưởng</h3>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <TrendingUp size={12}/> +12.5%
                          </span>
                      </div>
                      <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={reportData.chartData}>
                                  <defs>
                                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                  <YAxis hide />
                                  <Tooltip 
                                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                      formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                                  />
                                  <Area 
                                      type="monotone" 
                                      dataKey="value" 
                                      stroke="#6366f1" 
                                      strokeWidth={3}
                                      fillOpacity={1} 
                                      fill="url(#colorValue)" 
                                  />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4">Doanh thu theo sàn</h3>
                      <div className="space-y-4">
                          {reportData.platforms.map((p, idx) => (
                              <div key={idx}>
                                  <div className="flex justify-between items-center mb-1">
                                      <div className="flex items-center gap-2">
                                          {LOGOS[p.name] && <img src={LOGOS[p.name]} className="w-4 h-4 object-contain"/>}
                                          <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                      </div>
                                      <span className="text-sm font-bold text-slate-800">{formatCurrency(reportData.revenue * p.percent / 100)}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2">
                                      <div 
                                          className={`h-2 rounded-full ${p.color}`} 
                                          style={{ width: `${p.percent}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const InvoiceView = () => {
      const [invoiceTab, setInvoiceTab] = useState<'ledger' | 'out' | 'in'>('ledger');
      const [searchTerm, setSearchTerm] = useState('');
      
      // Data State
      const [localLedger, setLocalLedger] = useState<LedgerRecord[]>(MOCK_LEDGER_RECORDS);
      const [localInvoices, setLocalInvoices] = useState<Invoice[]>(MOCK_INVOICES);

      // UI State
      const [showFilter, setShowFilter] = useState(false);
      const [editingItem, setEditingItem] = useState<any>(null); // Holds data for edit form
      const [activeForm, setActiveForm] = useState<'ledger' | 'invoice' | null>(null); // Controls which form is open

      // Filter State
      const [filters, setFilters] = useState({
          period: 'this_month',
          status: 'all'
      });

      // Ledger Stats
      const ledgerStats = useMemo(() => {
        const totalReceipt = localLedger.filter(r => r.type === 'receipt').reduce((acc, r) => acc + r.amount, 0);
        const totalPayment = localLedger.filter(r => r.type === 'payment').reduce((acc, r) => acc + r.amount, 0);
        return { totalReceipt, totalPayment, balance: totalReceipt - totalPayment };
      }, [localLedger]);

      const handleSaveLedger = (record: any) => {
          if (editingItem && editingItem.id) {
              setLocalLedger(prev => prev.map(item => item.id === record.id ? record : item));
          } else {
              setLocalLedger(prev => [{...record, id: `L${Date.now()}`}, ...prev]);
          }
          setActiveForm(null);
          setEditingItem(null);
      };

      const handleSaveInvoice = (invoice: any) => {
          if (editingItem && editingItem.id) {
              setLocalInvoices(prev => prev.map(item => item.id === invoice.id ? invoice : item));
          } else {
              setLocalInvoices(prev => [{...invoice, id: `INV${Date.now()}`}, ...prev]);
          }
          setActiveForm(null);
          setEditingItem(null);
      };

      const handleDeleteItem = () => {
          if (!editingItem) return;
          if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
              if (activeForm === 'ledger') {
                  setLocalLedger(prev => prev.filter(i => i.id !== editingItem.id));
              } else {
                  setLocalInvoices(prev => prev.filter(i => i.id !== editingItem.id));
              }
              setActiveForm(null);
              setEditingItem(null);
          }
      };

      const openAddModal = () => {
          setEditingItem(null);
          if (invoiceTab === 'ledger') {
              setActiveForm('ledger');
          } else {
              setActiveForm('invoice');
          }
      };

      const openEditModal = (item: any) => {
          setEditingItem(item);
          if (invoiceTab === 'ledger') {
              setActiveForm('ledger');
          } else {
              setActiveForm('invoice');
          }
      };

      // --- Sub-components for Modals ---

      const FilterModal = () => (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowFilter(false)}>
              <div className="bg-white w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl p-6 space-y-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">Bộ lọc</h3>
                      <button onClick={() => setShowFilter(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian</label>
                      <div className="grid grid-cols-2 gap-2">
                          {['today', 'yesterday', 'this_week', 'this_month'].map(p => (
                              <button 
                                key={p}
                                onClick={() => setFilters({...filters, period: p})}
                                className={`py-2 px-3 rounded-lg text-xs font-medium border ${filters.period === p ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
                              >
                                  {p === 'today' ? 'Hôm nay' : p === 'yesterday' ? 'Hôm qua' : p === 'this_week' ? 'Tuần này' : 'Tháng này'}
                              </button>
                          ))}
                      </div>
                  </div>

                  {invoiceTab !== 'ledger' && (
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                          <div className="flex flex-wrap gap-2">
                              {['all', 'paid', 'unpaid', 'cancelled'].map(s => (
                                  <button 
                                    key={s}
                                    onClick={() => setFilters({...filters, status: s})}
                                    className={`py-2 px-3 rounded-lg text-xs font-medium border ${filters.status === s ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
                                  >
                                      {s === 'all' ? 'Tất cả' : s === 'paid' ? 'Đã TT' : s === 'unpaid' ? 'Chưa TT' : 'Đã hủy'}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <button 
                    onClick={() => setShowFilter(false)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold"
                  >
                      Áp dụng
                  </button>
              </div>
          </div>
      );

      const LedgerFormModal = () => {
          const [form, setForm] = useState(editingItem || {
              type: 'receipt',
              amount: 0,
              description: '',
              category: 'Bán hàng',
              date: new Date().toISOString().split('T')[0]
          });

          return (
              <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fade-in">
                  <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0 mt-safe">
                      <button onClick={() => setActiveForm(null)} className="text-slate-500 font-medium">Hủy</button>
                      <h3 className="font-bold text-lg text-slate-800">{editingItem ? 'Sửa giao dịch' : 'Thêm giao dịch'}</h3>
                      <button onClick={() => handleSaveLedger(form)} className="text-indigo-600 font-bold">Lưu</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setForm({...form, type: 'receipt'})}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.type === 'receipt' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                          >
                              Phiếu Thu
                          </button>
                          <button 
                            onClick={() => setForm({...form, type: 'payment'})}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.type === 'payment' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                          >
                              Phiếu Chi
                          </button>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số tiền</label>
                          <input 
                              type="number" 
                              value={form.amount}
                              onChange={(e) => setForm({...form, amount: Number(e.target.value)})}
                              className={`w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-bold text-2xl ${form.type === 'receipt' ? 'text-green-600' : 'text-red-600'}`}
                              placeholder="0"
                              autoFocus
                          />
                      </div>

                      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày giao dịch</label>
                              <input 
                                  type="date"
                                  value={form.date}
                                  onChange={(e) => setForm({...form, date: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hạng mục</label>
                              <select 
                                  value={form.category}
                                  onChange={(e) => setForm({...form, category: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800 bg-white"
                              >
                                  <option>Bán hàng</option>
                                  <option>Nhập hàng</option>
                                  <option>Chi phí vận hành</option>
                                  <option>Lương nhân viên</option>
                                  <option>Khác</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả / Ghi chú</label>
                              <textarea 
                                  rows={3}
                                  value={form.description}
                                  onChange={(e) => setForm({...form, description: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800 resize-none"
                                  placeholder="Nhập nội dung chi tiết..."
                              />
                          </div>
                      </div>

                      {editingItem && (
                          <button onClick={handleDeleteItem} className="w-full py-3 text-red-600 font-bold bg-red-50 rounded-xl flex items-center justify-center gap-2">
                              <Trash2 size={18} /> Xóa giao dịch
                          </button>
                      )}
                  </div>
              </div>
          );
      };

      const InvoiceFormModal = () => {
          const type = invoiceTab === 'out' ? 'output' : 'input';
          const [form, setForm] = useState(editingItem || {
              type,
              invoiceNumber: '',
              partnerName: '',
              date: new Date().toISOString().split('T')[0],
              totalAmount: 0,
              status: 'unpaid',
              items: '',
              attachments: [] as string[]
          });
          
          const fileInputRef = useRef<HTMLInputElement>(null);

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files.length > 0) {
                  // Mock uploading by creating object URL
                  const newFiles = Array.from(e.target.files).map((file: any) => URL.createObjectURL(file));
                  setForm(prev => ({
                      ...prev,
                      attachments: [...(prev.attachments || []), ...newFiles]
                  }));
              }
          };

          const removeAttachment = (index: number) => {
              setForm(prev => ({
                  ...prev,
                  attachments: prev.attachments.filter((_, i) => i !== index)
              }));
          };

          return (
              <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fade-in">
                  <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0 mt-safe">
                      <button onClick={() => setActiveForm(null)} className="text-slate-500 font-medium">Hủy</button>
                      <h3 className="font-bold text-lg text-slate-800">{editingItem ? 'Sửa hóa đơn' : `Thêm hóa đơn ${type === 'output' ? 'Bán' : 'Mua'}`}</h3>
                      <button onClick={() => handleSaveInvoice(form)} className="text-indigo-600 font-bold">Lưu</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tổng tiền</label>
                          <input 
                              type="number" 
                              value={form.totalAmount}
                              onChange={(e) => setForm({...form, totalAmount: Number(e.target.value)})}
                              className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-bold text-2xl text-slate-800"
                              placeholder="0"
                              autoFocus
                          />
                      </div>

                      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số hóa đơn</label>
                                  <input 
                                      type="text"
                                      value={form.invoiceNumber}
                                      onChange={(e) => setForm({...form, invoiceNumber: e.target.value})}
                                      className="w-full border-b border-slate-200 py-2 outline-none text-slate-800 font-mono"
                                      placeholder="Auto"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày tạo</label>
                                  <input 
                                      type="date"
                                      value={form.date}
                                      onChange={(e) => setForm({...form, date: e.target.value})}
                                      className="w-full border-b border-slate-200 py-2 outline-none text-slate-800"
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{type === 'output' ? 'Khách hàng' : 'Nhà cung cấp'}</label>
                              <input 
                                  type="text"
                                  value={form.partnerName}
                                  onChange={(e) => setForm({...form, partnerName: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800"
                                  placeholder="Nhập tên..."
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
                              <select 
                                  value={form.status}
                                  onChange={(e) => setForm({...form, status: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800 bg-white"
                              >
                                  <option value="paid">Đã thanh toán</option>
                                  <option value="unpaid">Chưa thanh toán</option>
                                  <option value="cancelled">Đã hủy</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung / Mặt hàng</label>
                              <textarea 
                                  rows={3}
                                  value={form.items}
                                  onChange={(e) => setForm({...form, items: e.target.value})}
                                  className="w-full border-b border-slate-200 py-2 outline-none text-slate-800 resize-none"
                                  placeholder="Chi tiết sản phẩm..."
                              />
                          </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                              <label className="block text-xs font-bold text-slate-500 uppercase">Chứng từ đính kèm</label>
                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                  >
                                      <ImageIcon size={18}/>
                                  </button>
                                  <button 
                                    onClick={() => fileInputRef.current?.click()} // On mobile this triggers camera option usually
                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                  >
                                      <Camera size={18}/>
                                  </button>
                              </div>
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/*" 
                                  multiple 
                                  capture="environment"
                                  onChange={handleFileChange}
                              />
                          </div>
                          
                          {form.attachments && form.attachments.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                  {form.attachments.map((img, idx) => (
                                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                          <img src={img} className="w-full h-full object-cover" />
                                          <button 
                                              onClick={() => removeAttachment(idx)}
                                              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                                          >
                                              <X size={12}/>
                                          </button>
                                      </div>
                                  ))}
                                  <button 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50"
                                  >
                                      <Plus size={20} />
                                      <span className="text-[10px] mt-1">Thêm</span>
                                  </button>
                              </div>
                          ) : (
                              <div 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer"
                              >
                                  <Camera size={24} className="mb-1 opacity-50" />
                                  <span className="text-xs">Chụp ảnh hoặc tải lên</span>
                              </div>
                          )}
                      </div>

                      {editingItem && (
                          <button onClick={handleDeleteItem} className="w-full py-3 text-red-600 font-bold bg-red-50 rounded-xl flex items-center justify-center gap-2">
                              <Trash2 size={18} /> Xóa hóa đơn
                          </button>
                      )}
                  </div>
              </div>
          );
      };

      const renderContent = () => {
          if (invoiceTab === 'ledger') {
              return (
                  <div className="space-y-4">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase mb-1">
                                  <ArrowDownRight size={14} /> Tổng Thu
                              </div>
                              <div className="text-lg font-bold text-slate-800">{formatCurrency(ledgerStats.totalReceipt)}</div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase mb-1">
                                  <ArrowUpRight size={14} /> Tổng Chi
                              </div>
                              <div className="text-lg font-bold text-slate-800">{formatCurrency(ledgerStats.totalPayment)}</div>
                          </div>
                          <div className="col-span-2 bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
                              <div>
                                  <div className="text-indigo-200 text-xs font-medium uppercase">Tồn quỹ hiện tại</div>
                                  <div className="text-2xl font-bold">{formatCurrency(ledgerStats.balance)}</div>
                              </div>
                              <div className="p-2 bg-white/20 rounded-lg">
                                  <Wallet size={24} />
                              </div>
                          </div>
                      </div>

                      {/* Transaction List */}
                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-800">Giao dịch gần đây</h3>
                          {localLedger.map(record => (
                              <div 
                                key={record.id} 
                                onClick={() => openEditModal(record)}
                                className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.type === 'receipt' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                          {record.type === 'receipt' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold text-slate-800 line-clamp-1">{record.description}</div>
                                          <div className="text-xs text-slate-500">{record.date} • {record.category}</div>
                                      </div>
                                  </div>
                                  <div className={`font-bold text-sm ${record.type === 'receipt' ? 'text-green-600' : 'text-red-600'}`}>
                                      {record.type === 'receipt' ? '+' : '-'}{formatCurrency(record.amount)}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          }

          // Invoices List (In/Out)
          const filteredInvoices = localInvoices.filter(inv => {
              const matchesType = (invoiceTab === 'out' ? inv.type === 'output' : inv.type === 'input');
              const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || inv.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStatus = filters.status === 'all' || inv.status === filters.status;
              return matchesType && matchesSearch && matchesStatus;
          });

          return (
              <div className="space-y-3">
                  <div className="relative">
                      <input 
                          type="text" 
                          placeholder={`Tìm hóa đơn ${invoiceTab === 'out' ? 'bán ra' : 'mua vào'}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  {filteredInvoices.map(inv => (
                      <div 
                        key={inv.id} 
                        onClick={() => openEditModal(inv)}
                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
                      >
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-indigo-600 font-mono text-xs bg-indigo-50 px-1.5 py-0.5 rounded">{inv.invoiceNumber}</span>
                                      <span className="text-xs text-slate-400">{inv.date}</span>
                                  </div>
                                  <div className="font-bold text-sm text-slate-800 mt-1">{inv.partnerName}</div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                  inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                  inv.status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>
                                  {inv.status === 'paid' ? 'Đã TT' : inv.status === 'unpaid' ? 'Chưa TT' : 'Hủy'}
                              </span>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                              <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[150px]">
                                  {inv.attachments && inv.attachments.length > 0 && <Paperclip size={12} />}
                                  <span className="truncate">{inv.items}</span>
                              </div>
                              <div className="font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</div>
                          </div>
                      </div>
                  ))}
                  {filteredInvoices.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy dữ liệu.</div>
                  )}
              </div>
          );
      };

      return (
          <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
              <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10 border-b border-slate-100 shadow-sm shrink-0">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-slate-800">Sổ & Hóa đơn</h2>
                      <div className="flex gap-2">
                          <button onClick={() => setShowFilter(true)} className={`p-2 rounded-full transition-colors ${showFilter ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                              <Filter size={18}/>
                          </button>
                          <button onClick={openAddModal} className="p-2 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700">
                              <Plus size={18}/>
                          </button>
                      </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                          onClick={() => setInvoiceTab('ledger')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${invoiceTab === 'ledger' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                      >
                          Sổ quỹ
                      </button>
                      <button 
                          onClick={() => setInvoiceTab('out')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${invoiceTab === 'out' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                      >
                          Hóa đơn Bán
                      </button>
                      <button 
                          onClick={() => setInvoiceTab('in')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${invoiceTab === 'in' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                      >
                          Hóa đơn Mua
                      </button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24">
                  {renderContent()}
              </div>

              {/* Modals */}
              {showFilter && <FilterModal />}
              {activeForm === 'ledger' && <LedgerFormModal />}
              {activeForm === 'invoice' && <InvoiceFormModal />}
          </div>
      );
  };

  const ProductForm = () => {
    // Mock form state initialization
    const initialData = editingProduct === 'new' ? {
        id: '', name: '', sku: '', price: 0, stock: 0, importPrice: 0, image: '', variants: []
    } : { ...editingProduct as Product, variants: (editingProduct as Product).variants?.length ? (editingProduct as Product).variants : [
        { id: 'v1', name: 'Màu Đỏ, Size M', sku: `${(editingProduct as Product).sku}-RED-M`, price: (editingProduct as Product).price, stock: 10, image: 'https://loremflickr.com/100/100/fashion?random=11' },
        { id: 'v2', name: 'Màu Xanh, Size L', sku: `${(editingProduct as Product).sku}-BLU-L`, price: (editingProduct as Product).price + 20000, stock: 5, image: 'https://loremflickr.com/100/100/fashion?random=12' }
    ] };

    const [formData, setFormData] = useState(initialData);

    const handleVariantStockOut = (variantId: string) => {
        const newVariants = formData.variants?.map(v => v.id === variantId ? { ...v, stock: 0 } : v);
        const totalStock = newVariants?.reduce((acc, v) => acc + v.stock, 0) || 0;
        setFormData({ ...formData, variants: newVariants, stock: totalStock });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fade-in">
            <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0 mt-safe">
                <button onClick={() => setEditingProduct(null)} className="text-slate-500 font-medium">Hủy</button>
                <h3 className="font-bold text-lg text-slate-800">{editingProduct === 'new' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h3>
                <button 
                    onClick={() => { alert('Đã lưu thành công!'); setEditingProduct(null); }}
                    className="text-indigo-600 font-bold"
                >
                    Lưu
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                {/* Image Upload Mock */}
                <div className="flex justify-center">
                    <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                        {formData.image ? (
                            <img src={formData.image} className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Camera size={24} />
                                <span className="text-xs mt-1">Thêm ảnh</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên sản phẩm</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-medium text-slate-800"
                            placeholder="Nhập tên sản phẩm..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã SKU</label>
                        <input 
                            type="text" 
                            value={formData.sku}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-mono text-slate-600"
                            placeholder="Mã sản phẩm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá bán</label>
                        <input 
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-bold text-indigo-600"
                        />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá vốn</label>
                        <input 
                            type="number" 
                            value={formData.importPrice || 0}
                            onChange={(e) => setFormData({...formData, importPrice: Number(e.target.value)})}
                            className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-medium text-slate-600"
                        />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Tồn kho tổng</label>
                        <span className="text-xs text-indigo-600 font-medium">Chi tiết kho</span>
                    </div>
                    <input 
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full border-b border-slate-200 py-2 focus:border-indigo-500 outline-none font-bold text-slate-800 text-lg"
                        readOnly={formData.variants && formData.variants.length > 0}
                    />
                    {formData.variants && formData.variants.length > 0 && <p className="text-xs text-slate-400 mt-1">Tổng tồn kho tự động tính từ các biến thể</p>}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Biến thể sản phẩm</label>
                        <button className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                            <Plus size={14} /> Thêm biến thể
                        </button>
                    </div>

                    {!formData.variants || formData.variants.length === 0 ? (
                        <div className="text-center py-4 text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            Sản phẩm này chưa có biến thể nào
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.variants.map((variant, index) => (
                                <div key={variant.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <div className="w-10 h-10 rounded overflow-hidden bg-white shrink-0 border border-slate-200">
                                                {variant.image ? (
                                                    <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-800">{variant.name}</span>
                                                <span className="text-xs text-slate-500 font-mono mt-0.5">{variant.sku}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleVariantStockOut(variant.id);
                                                }}
                                                className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-red-200 active:scale-95 transition-all"
                                                title="Sản phẩm hết hàng"
                                            >
                                                <PackageX size={12} /> Hết hàng
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-200/60">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Giá bán</label>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="number"
                                                    className="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none"
                                                    value={variant.price}
                                                    onChange={(e) => {
                                                        const newVariants = formData.variants?.map(v => v.id === variant.id ? { ...v, price: Number(e.target.value) } : v);
                                                        setFormData({ ...formData, variants: newVariants });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Tồn kho</label>
                                            <div className="text-sm font-bold text-slate-800 focus-within:text-indigo-600 flex items-center gap-1">
                                                <input 
                                                    type="number"
                                                    className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none"
                                                    value={variant.stock}
                                                    onChange={(e) => {
                                                        const newStock = Number(e.target.value);
                                                        const newVariants = formData.variants?.map(v => v.id === variant.id ? { ...v, stock: newStock } : v);
                                                        const totalStock = newVariants?.reduce((acc, v) => acc + v.stock, 0) || 0;
                                                        setFormData({ ...formData, variants: newVariants, stock: totalStock });
                                                    }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1 flex flex-col gap-0.5">
                                               <span>Kho Q1: {Math.floor(variant.stock * 0.7)}</span>
                                               <span>Kho Q3: {variant.stock - Math.floor(variant.stock * 0.7)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editingProduct !== 'new' && (
                    <button 
                        onClick={() => { alert('Đã cập nhật sản phẩm!'); setEditingProduct(null); }}
                        className="w-full py-3 text-white font-bold bg-indigo-600 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
                    >
                        <Save size={18} /> Cập nhật sản phẩm
                    </button>
                )}
            </div>
        </div>
    );
  };

  const InventoryView = () => {
      const [searchTerm, setSearchTerm] = useState('');
      
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
            {/* Header */}
            <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-slate-100 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Kho hàng</h2>
                    <div className="flex gap-2">
                        <button className="p-2 bg-slate-100 rounded-full text-slate-600"><History size={20}/></button>
                    </div>
                </div>
                
                {/* Warehouse Filter */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-3">
                    <button 
                        onClick={() => setSelectedWarehouseId('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${selectedWarehouseId === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        Tất cả kho
                    </button>
                    {MOCK_WAREHOUSES.map(wh => (
                        <button 
                            key={wh.id}
                            onClick={() => setSelectedWarehouseId(wh.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${selectedWarehouseId === wh.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                            {wh.name}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm sản phẩm kiểm kho..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {filteredProducts.map(product => {
                    const currentStock = selectedWarehouseId === 'all' ? product.stock : (product.warehouseStocks[selectedWarehouseId] || 0);
                    
                    return (
                    <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 items-center">
                        <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-800 truncate">{product.name}</div>
                            <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                        </div>
                        <div className="text-center min-w-[60px]">
                            <div className={`font-bold text-lg ${currentStock < 10 ? 'text-red-500' : 'text-slate-800'}`}>{currentStock}</div>
                            <div className="text-[10px] text-slate-400">Tồn</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => setInventoryAction({type: 'import', product})}
                                className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"
                            >
                                <ArrowDown size={16} />
                            </button>
                            <button 
                                onClick={() => setInventoryAction({type: 'export', product})}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                            >
                                <ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                )})}
            </div>

            {/* Quick Action Modal */}
            {inventoryAction && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h3 className="font-bold text-lg text-slate-800 mb-1">
                            {inventoryAction.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 truncate">{inventoryAction.product.name}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số lượng</label>
                                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-lg font-bold text-center focus:border-indigo-500 outline-none" autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lý do</label>
                                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                                    {inventoryAction.type === 'import' ? (
                                        <>
                                            <option>Nhập hàng từ NCC</option>
                                            <option>Khách hoàn trả</option>
                                            <option>Kiểm kê thừa</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Bán hàng</option>
                                            <option>Xuất hủy / Hỏng</option>
                                            <option>Kiểm kê thiếu</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setInventoryAction(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Hủy</button>
                                <button 
                                    onClick={() => { alert('Đã cập nhật kho!'); setInventoryAction(null); }}
                                    className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm ${inventoryAction.type === 'import' ? 'bg-green-600' : 'bg-red-600'}`}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  const HomeView = () => (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      <div className="space-y-4 animate-fade-in relative">
      
      {/* Notification Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
            <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl p-4 flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-lg text-slate-800">Thông báo</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex gap-2">
                            <div className="mt-1"><Package size={16} className="text-blue-600"/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Đơn hàng mới #ORD123</p>
                                <p className="text-xs text-slate-600">Khách hàng Nguyễn Văn A vừa đặt hàng.</p>
                                <span className="text-[10px] text-slate-400">2 phút trước</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex gap-2">
                            <div className="mt-1"><AlertCircle size={16} className="text-orange-600"/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Cảnh báo tồn kho</p>
                                <p className="text-xs text-slate-600">Sản phẩm "Áo Thun" sắp hết hàng.</p>
                                <span className="text-[10px] text-slate-400">1 giờ trước</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex gap-2">
                            <div className="mt-1"><MessageCircle size={16} className="text-indigo-600"/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Tin nhắn mới</p>
                                <p className="text-xs text-slate-600">Shopee: Khách hỏi về size áo...</p>
                                <span className="text-[10px] text-slate-400">3 giờ trước</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowNotifications(false)}
                    className="w-full py-2 mt-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold"
                >
                    Đóng
                </button>
            </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="bg-indigo-600 p-4 pb-8 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-indigo-100 text-sm">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</p>
            <h2 className="text-xl font-bold">{user.name}</h2>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm relative transition-all active:scale-95"
             >
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
          </div>
        </div>

        {/* Expanded Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           {/* Row 1 */}
           <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1 mb-1 text-indigo-100 text-[10px] font-medium uppercase tracking-wider">
                 <DollarSign size={12}/> Doanh thu
              </div>
              <div className="text-lg font-bold">{formatCurrency(todayStats.revenue)}</div>
           </div>
           <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1 mb-1 text-emerald-300 text-[10px] font-medium uppercase tracking-wider">
                 <Wallet size={12}/> Lợi nhuận
              </div>
              <div className="text-lg font-bold text-emerald-300">{formatCurrency(todayStats.profit)}</div>
           </div>
           
           {/* Row 2 - More Details */}
           <div className="col-span-2 grid grid-cols-4 gap-2 mt-1">
               <div className="bg-white/5 p-2 rounded-lg text-center">
                   <div className="text-[10px] text-indigo-200 mb-1">Chi phí</div>
                   <div className="text-xs font-bold">{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(todayStats.costs)}</div>
               </div>
               <div className="bg-white/5 p-2 rounded-lg text-center">
                   <div className="text-[10px] text-indigo-200 mb-1">Đơn bán</div>
                   <div className="text-xs font-bold">{todayStats.soldCount}</div>
               </div>
               <div className="bg-white/5 p-2 rounded-lg text-center">
                   <div className="text-[10px] text-red-200 mb-1 flex justify-center gap-1"><Zap size={10}/> Hỏa tốc</div>
                   <div className="text-xs font-bold text-red-100">{todayStats.expressCount}</div>
               </div>
               <div className="bg-white/5 p-2 rounded-lg text-center">
                   <div className="text-[10px] text-slate-300 mb-1">Đơn hủy</div>
                   <div className="text-xs font-bold text-slate-200">{todayStats.cancelCount}</div>
               </div>
           </div>
        </div>
      </div>

      {/* Quick Actions - Floating Over Header */}
      <div className="-mt-4 px-4 grid grid-cols-4 gap-3">
         <button className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-indigo-600 group-active:scale-95 transition-transform border border-slate-100">
               <Plus size={24} />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Tạo đơn</span>
         </button>
         <button onClick={() => setActiveTab('products')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-slate-700 group-active:scale-95 transition-transform border border-slate-100">
               <ShoppingBag size={24} />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Sản phẩm</span>
         </button>
         <button className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-orange-500 group-active:scale-95 transition-transform border border-slate-100">
               <Truck size={24} />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Vận chuyển</span>
         </button>
         <button className="flex flex-col items-center gap-2 group" onClick={() => setActiveTab('invoices')}>
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-green-600 group-active:scale-95 transition-transform border border-slate-100">
               <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Sổ quỹ</span>
         </button>
      </div>

      {/* To-Do List (Clickable) */}
      <div className="px-4 mt-2">
         <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800">Việc cần làm</h3>
            <button className="text-xs text-indigo-600 font-medium">Xem tất cả</button>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div 
                onClick={() => handleNavigateToOrders('pending')}
                className="flex justify-between items-center p-4 border-b border-slate-50 active:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                     <Package size={16}/>
                  </div>
                  <div>
                     <div className="font-bold text-sm text-slate-800">5 Đơn chờ xác nhận</div>
                     <div className="text-xs text-slate-500">Sàn Shopee, Lazada</div>
                  </div>
               </div>
               <ChevronRight size={16} className="text-slate-300"/>
            </div>
            <div 
                onClick={() => handleNavigateToOrders('processing')}
                className="flex justify-between items-center p-4 border-b border-slate-50 active:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                     <Truck size={16}/>
                  </div>
                  <div>
                     <div className="font-bold text-sm text-slate-800">12 Đơn cần đóng gói</div>
                     <div className="text-xs text-slate-500">Giao hàng tiết kiệm</div>
                  </div>
               </div>
               <ChevronRight size={16} className="text-slate-300"/>
            </div>
            <div 
                onClick={() => setActiveTab('products')}
                className="flex justify-between items-center p-4 active:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                     <Zap size={16}/>
                  </div>
                  <div>
                     <div className="font-bold text-sm text-slate-800">3 Sản phẩm sắp hết hàng</div>
                     <div className="text-xs text-slate-500">Cần nhập kho ngay</div>
                  </div>
               </div>
               <ChevronRight size={16} className="text-slate-300"/>
            </div>
         </div>
      </div>

      {/* Recent Pending/New Orders */}
      <div className="px-4">
         <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800">Đơn hàng vừa đặt</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Chưa xử lý</span>
         </div>
         <div className="space-y-3">
            {pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">Không có đơn hàng mới nào.</div>
            ) : (
                pendingOrders.map(order => (
                <div key={order.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-3 active:scale-[0.99] transition-transform">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden border border-slate-200 relative">
                        <img src={order.items[0]?.image} className="w-full h-full object-cover" />
                        {order.shippingMethod === 'Hỏa tốc' && <div className="absolute bottom-0 left-0 right-0 bg-red-500 h-1"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-slate-800 truncate">{order.customerName}</span>
                            <span className="text-xs font-bold text-indigo-600">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{order.items[0]?.name}</div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex gap-1">
                                {LOGOS[order.platform] && <img src={LOGOS[order.platform]} className="h-4 w-auto"/>}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.status === 'pending' ? 'Chờ xác nhận' : 'Chờ lấy'}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{order.date.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>
                ))
            )}
         </div>
      </div>
      </div>
    </div>
  );

  const OrdersView = () => {
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [updateTrigger, forceUpdate] = useReducer(x => x + 1, 0);
    const [statusFilter, setStatusFilter] = useState(orderFilter);
    const [shippingFilter, setShippingFilter] = useState('all');
    const [carrierFilter, setCarrierFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [shopFilter, setShopFilter] = useState('all');
    const [isCompact, setIsCompact] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [orderSearch, setOrderSearch] = useState('');
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    
    // Sync shared state when it changes (from Home navigation)
    useEffect(() => {
        setStatusFilter(orderFilter);
    }, [orderFilter]);

    const filteredOrders = useMemo(() => {
        return MOCK_ORDERS.filter(o => {
            // Status and Shipping filter
            const matchStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchShipping = shippingFilter === 'all' || o.shippingMethod === shippingFilter;
            const matchCarrier = carrierFilter === 'all' || o.shippingCarrier === carrierFilter;
            const matchPlatform = platformFilter === 'all' || o.platform === platformFilter;
            const matchShop = shopFilter === 'all' || o.shopId === shopFilter;
            
            // Search filter
            let matchSearch = true;
            if (orderSearch.length >= 3) {
                const term = orderSearch.toLowerCase();
                matchSearch = o.id.toLowerCase().includes(term) || 
                                (o.trackingCode && o.trackingCode.toLowerCase().includes(term)) ||
                                false;
            }
            
            return matchStatus && matchShipping && matchCarrier && matchSearch && matchPlatform && matchShop;
        });
    }, [statusFilter, shippingFilter, carrierFilter, platformFilter, shopFilter, orderSearch, updateTrigger]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrders(filteredOrders.map(o => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const toggleOrderSelection = (id: string) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
        );
    };

    const handleBatchAction = (action: 'printed' | 'packed' | 'cancelled') => {
        MOCK_ORDERS.forEach(o => {
            if (selectedOrders.includes(o.id)) {
                if (action === 'cancelled') {
                    o.status = 'cancelled';
                } else if (action === 'packed') {
                    o.subStatus = 'packed';
                    o.status = 'shipping'; // Once packed, typically marked as shipping/packed
                } else if (action === 'printed') {
                    o.subStatus = 'printed';
                }
            }
        });
        setSelectedOrders([]);
        setShowBatchModal(false);
        forceUpdate();
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
         {/* Fixed Header */}
         <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10 border-b border-slate-100 shadow-sm shrink-0 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Quản lý đơn hàng</h2>
               <div className="flex gap-2">
                 <button onClick={() => setShowCreateOrder(true)} className="p-2 bg-indigo-50 rounded-full hover:bg-indigo-100 text-indigo-600"><Plus size={18} /></button>
                 <button onClick={() => setIsCompact(!isCompact)} className={`p-2 rounded-full transition-colors ${isCompact ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}><Menu size={18} /></button>
                 <button onClick={() => setShowFilterModal(true)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><Filter size={18} className="text-slate-600"/></button>
               </div>
            </div>
            
            {/* Search Bar & Select All */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Mã đơn, MVĐ..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-9 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                        />
                        {orderSearch && (
                             <button
                                 onClick={() => setOrderSearch('')}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none bg-slate-200 hover:bg-slate-300 rounded-full"
                             >
                                 <X size={12} />
                             </button>
                        )}
                    </div>
                    <button 
                        onClick={() => setShippingFilter(shippingFilter === 'Hỏa tốc' ? 'all' : 'Hỏa tốc')}
                        className={`shrink-0 p-2.5 rounded-xl border transition-colors ${shippingFilter === 'Hỏa tốc' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                        <Zap size={18} className={shippingFilter === 'Hỏa tốc' ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                </div>
                {/* Batch Action Bar */}
                <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 -mx-1">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="selectAll"
                            checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="selectAll" className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                            {selectedOrders.length > 0 ? `Đã chọn: ${selectedOrders.length}` : 'Chọn tất cả'}
                        </label>
                    </div>
                    {selectedOrders.length > 0 && (
                        <button 
                            onClick={() => setShowBatchModal(true)}
                            className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 active:scale-95 transition-transform flex items-center gap-2"
                        >
                            <Package size={16} />
                            Xử lý hàng loạt ({selectedOrders.length})
                        </button>
                    )}
                </div>
            </div>
         </div>

         {/* Order List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
            {filteredOrders.map(order => (
               <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 active:scale-[0.99] transition-transform overflow-hidden">
                  {/* Card Header */}
                  <div className={`p-3 border-b border-slate-100 ${isCompact ? 'pb-3' : ''}`}>
                     <div className="flex items-center justify-between mb-3 gap-2">
                         <div className="flex items-center gap-2 min-w-0">
                             <input 
                                 type="checkbox" 
                                 checked={selectedOrders.includes(order.id)}
                                 onChange={() => toggleOrderSelection(order.id)}
                                 className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                             />
                             <div className="flex items-center gap-1 min-w-0">
                                 <span className="font-bold text-sm text-slate-800 truncate">
                                     {order.shopId === 'sh1' ? 'OmniSales Premium' : order.shopId === 'sh2' ? 'OmniSales Official' : 'OmniSales'}
                                 </span>
                                 <ChevronRight size={14} className="text-slate-400 shrink-0" />
                             </div>
                             {order.shippingMethod === 'Hỏa tốc' && (
                                 <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">
                                     Hỏa tốc
                                 </span>
                             )}
                             {(order.status === 'cancelled') ? (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Đã hủy</span>
                             ) : (order.subStatus === 'packed') ? (
                                <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Đã đóng gói</span>
                             ) : (order.subStatus === 'printed') ? (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Đã in</span>
                             ) : (order.status === 'pending') ? (
                                <span className="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Chờ xác nhận</span>
                             ) : (order.status === 'processing') ? (
                                <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Chờ lấy hàng</span>
                             ) : (order.status === 'shipping') ? (
                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Đang giao</span>
                             ) : (order.status === 'delivered') ? (
                                <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 whitespace-nowrap">Hoàn thành</span>
                             ) : null}
                         </div>
                         <div className="text-xs text-slate-500 truncate shrink-0 ml-2 font-medium">#{order.id.slice(0, 15)}</div>
                     </div>
                     
                     {/* Order Info Row */}
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-slate-50/70 p-2 rounded-lg mb-3 border border-slate-100">
                         <div className="flex items-center gap-1 text-[11px] text-slate-600">
                             <FileText size={12} className="text-slate-400"/>
                             Mã ĐH: <span className="font-semibold text-slate-800">{order.id.split('-').pop()}</span>
                         </div>
                         {order.trackingCode && (
                             <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                 <QrCode size={12} className="text-slate-400"/>
                                 MVĐ: <span className="font-semibold text-slate-800 truncate max-w-[80px]">{order.trackingCode}</span>
                             </div>
                         )}
                         <div className="flex items-center gap-1 text-[11px] text-slate-600">
                             <Truck size={12} className="text-slate-400"/>
                             ĐVVC: <span className="font-semibold text-slate-800">{order.shippingCarrier || 'N/A'}</span>
                         </div>
                         <div className="flex items-center gap-1 text-[11px] text-slate-600">
                             <Clock size={12} className="text-slate-400"/>
                             Giao: <span className="font-semibold text-slate-800">{order.shipByDate || 'Trong ngày'}</span>
                         </div>
                     </div>

                     {/* Products list within order */}
                     {!isCompact && (
                        <div className="flex flex-col gap-3">
                           {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3">
                                 <div className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0 relative overflow-hidden">
                                     <img src={item.image} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{item.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{item.variant}</div>
                                    <div className="flex justify-between items-center mt-2">
                                       <span className="text-sm font-bold text-indigo-600">{formatCurrency(item.price)}</span>
                                       <span className="text-xs text-slate-500">x{item.quantity}</span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                  
                  {/* Summary / Total Section */}
                  {!isCompact && (
                    <div className="p-3 bg-slate-50/50 flex justify-between items-end border-b border-slate-100">
                        <div>
                            <div className="text-xs text-slate-500 mb-0.5">Người mua</div>
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-slate-800">
                                    {order.customerName.charAt(0)}******{order.customerName.charAt(order.customerName.length - 1)}
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const mockConvId = order.id.endsWith('0') || order.id.endsWith('2') ? 'c1' : 'c2';
                                        setSelectedChatId(mockConvId);
                                        setActiveTab('chat');
                                    }}
                                    className="relative p-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-50 active:scale-95 transition-all"
                                >
                                    <MessageCircle size={14} className={order.id.endsWith('0') ? "fill-indigo-100" : ""} />
                                    {order.id.endsWith('0') && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                                    {order.id.endsWith('1') && <span className="absolute -bottom-1 -right-1 text-[7px] font-bold bg-slate-200 text-slate-600 px-0.5 rounded-sm">XEM</span>}
                                    {order.id.endsWith('2') && <span className="absolute -bottom-1 -right-1 text-[7px] font-bold bg-indigo-100 text-indigo-600 px-0.5 rounded-sm">ĐÃ TL</span>}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 mb-0.5">Tổng thanh toán</div>
                            <div className="text-base font-bold text-red-600">{formatCurrency(order.total)}</div>
                        </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-3 flex gap-2 items-center">
                     <div className="flex-1">
                         {order.profit >= 0 ? (
                            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1.5 rounded-md inline-block">
                               Lãi: {formatCurrency(order.profit)} ({((order.profit / order.total) * 100).toFixed(1)}%)
                            </span>
                         ) : (
                            <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1.5 rounded-md inline-block">
                               Lỗ: {formatCurrency(Math.abs(order.profit))} ({((Math.abs(order.profit) / order.total) * 100).toFixed(1)}%)
                            </span>
                         )}
                     </div>
                     <button className="flex-1 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 active:scale-95 transition-all">
                        <CheckCircle size={18} />
                        Xác nhận
                     </button>
                  </div>
               </div>
            ))}
            {filteredOrders.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    Không tìm thấy đơn hàng nào.
                </div>
            )}
         </div>

         {/* Filter Modal */}
         {showFilterModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowFilterModal(false)}>
               <div className="bg-white rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <h3 className="font-bold text-lg text-slate-800">Lọc đơn hàng</h3>
                     <button onClick={() => setShowFilterModal(false)} className="text-slate-400 p-1 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pb-4 px-1">
                     <div>
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Trạng thái đơn hàng</h4>
                        <div className="flex flex-wrap gap-2">
                           {['all', 'pending', 'processing', 'shipping', 'delivered', 'cancelled'].map((status) => {
                              const count = status === 'all' ? MOCK_ORDERS.length : MOCK_ORDERS.filter(o => o.status === status).length;
                              return (
                              <button 
                                 key={status}
                                 onClick={() => { setStatusFilter(status); setOrderFilter(status); }}
                                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center justify-center ${
                                    statusFilter === status 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ xác nhận' : status === 'processing' ? 'Chờ lấy' : status === 'shipping' ? 'Đang giao' : status === 'delivered' ? 'Hoàn thành' : 'Đã hủy'}
                                 <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                              </button>
                           )})}
                        </div>
                     </div>

                     <div>
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Hình thức vận chuyển</h4>
                        <div className="flex flex-wrap gap-2">
                           {['all', 'Nhanh', 'Hỏa tốc', 'Trong ngày'].map((method) => (
                              <button 
                                 key={method}
                                 onClick={() => setShippingFilter(method)}
                                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                    shippingFilter === method 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {method === 'all' ? 'Tất cả' : method}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Đơn vị vận chuyển</h4>
                        <div className="flex flex-wrap gap-2">
                           {['all', 'Giao Hàng Nhanh', 'J&T Express', 'GrabExpress', 'Ahamove'].map((carrier) => (
                              <button 
                                 key={carrier}
                                 onClick={() => setCarrierFilter(carrier)}
                                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                    carrierFilter === carrier 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {carrier === 'all' ? 'Tất cả' : carrier}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Sàn thương mại</h4>
                        <div className="flex flex-wrap gap-2">
                           {['all', 'Shopee', 'Lazada', 'Tiktok'].map((platform) => (
                              <button 
                                 key={platform}
                                 onClick={() => setPlatformFilter(platform)}
                                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                    platformFilter === platform 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {platform === 'all' ? 'Tất cả' : platform}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Cửa hàng</h4>
                        <div className="flex flex-wrap gap-2">
                           {['all', 'sh1', 'sh2'].map((shop) => (
                              <button 
                                 key={shop}
                                 onClick={() => setShopFilter(shop)}
                                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                    shopFilter === shop 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {shop === 'all' ? 'Tất cả' : shop === 'sh1' ? 'OmniSales Premium' : 'OmniSales Official'}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={() => setShowFilterModal(false)}
                     className="w-full py-3 mt-8 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200"
                  >
                     Áp dụng bộ lọc
                  </button>
               </div>
            </div>
         )}

         {/* Create Off-Platform Order Modal */}
         {showCreateOrder && (
            <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white px-4 pt-4 pb-2 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <button onClick={() => setShowCreateOrder(false)} className="p-2 -ml-2 text-slate-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-bold text-slate-800">Tạo đơn ngoài sàn</h2>
                    <div className="w-8"></div> {/* Spacer */}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                    {/* Customer Info */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                        <h3 className="font-bold text-slate-800">Thông tin khách hàng</h3>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Số điện thoại</label>
                            <input type="tel" placeholder="09xxxxxxx" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tên khách hàng</label>
                            <input type="text" placeholder="Nhập tên khách hàng" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Địa chỉ giao hàng</label>
                            <textarea placeholder="Nhập địa chỉ chi tiết" rows={2} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"></textarea>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Sản phẩm</h3>
                            <button className="text-sm font-bold text-indigo-600 flex items-center gap-1"><Plus size={16}/> Thêm SP</button>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-3">
                            <div className="w-16 h-16 bg-slate-200 rounded-md border border-slate-100 flex items-center justify-center text-slate-400">
                                <ImageIcon size={24}/>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-slate-700">Chưa chọn sản phẩm</div>
                                <div className="text-xs text-slate-500 mt-1">Bấm thêm SP để chọn</div>
                            </div>
                        </div>
                    </div>

                    {/* Financial details */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                        <h3 className="font-bold text-slate-800">Thanh toán</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Tổng tiền hàng:</span>
                            <span className="font-medium">0 đ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Phí vận chuyển:</span>
                            <input type="number" placeholder="0" className="w-24 border border-slate-200 rounded p-1 text-right text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Giảm giá:</span>
                            <input type="number" placeholder="0" className="w-24 border border-slate-200 rounded p-1 text-right text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-800">Khách cần trả:</span>
                            <span className="font-bold text-indigo-600 text-lg">0 đ</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="cod" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked/>
                            <label htmlFor="cod" className="text-sm text-slate-700">Thu hộ COD</label>
                        </div>
                    </div>
                    
                    {/* Note */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                         <h3 className="font-bold text-slate-800">Ghi chú</h3>
                         <textarea placeholder="Ghi chú đơn hàng" rows={2} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"></textarea>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-white border-t border-slate-200 p-4 shrink-0 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button onClick={() => setShowCreateOrder(false)} className="w-full bg-indigo-600 text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform">
                        Tạo đơn ngay
                    </button>
                </div>
            </div>
         )}

         {/* Batch Modal */}
         {showBatchModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={() => setShowBatchModal(false)}>
               <div className="bg-white rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <h3 className="font-bold text-lg text-slate-800">Xử lý {selectedOrders.length} đơn hàng</h3>
                     <button onClick={() => setShowBatchModal(false)} className="text-slate-400 p-1 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
                  </div>
                  <div className="space-y-3">
                     <button 
                        onClick={() => handleBatchAction('printed')}
                        className="w-full py-3.5 bg-blue-50 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-100 active:scale-95 transition-transform"
                     >
                        <FileText size={20} /> Đánh dấu Đã in
                     </button>
                     <button 
                        onClick={() => handleBatchAction('packed')}
                        className="w-full py-3.5 bg-purple-50 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-purple-100 active:scale-95 transition-transform"
                     >
                        <Package size={20} /> Đánh dấu Đã đóng gói
                     </button>
                     <button 
                        onClick={() => handleBatchAction('cancelled')}
                        className="w-full py-3.5 bg-red-50 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-transform"
                     >
                        <PackageX size={20} /> Hủy đơn hàng
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

  const ProductsView = () => (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
       <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-slate-100 shadow-sm shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800">Sản phẩm</h2>
             <button onClick={() => setEditingProduct('new')} className="p-2 bg-indigo-50 text-indigo-600 rounded-full"><Plus size={20}/></button>
          </div>
          <div className="relative">
             <input 
               type="text" 
               placeholder="Tìm tên, mã SKU..." 
               className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="grid grid-cols-2 gap-4">
             {MOCK_PRODUCTS.map(product => (
                <div 
                    key={product.id} 
                    onClick={() => setEditingProduct(product)}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col active:scale-[0.98] transition-transform relative group"
                >
                   {/* Quick Edit Overlay Indicator */}
                   <div className="absolute top-2 right-2 z-10 opacity-60">
                       <div className="bg-white/80 p-1 rounded-full"><Edit3 size={14} className="text-slate-600"/></div>
                   </div>

                   <div className="relative aspect-square">
                      <img src={product.image} className="w-full h-full object-cover" />
                      {product.stock <= 5 && (
                         <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                            Sắp hết
                         </div>
                      )}
                   </div>
                   <div className="p-3 flex-1 flex flex-col">
                      <div className="text-sm font-medium text-slate-800 line-clamp-2 mb-1">{product.name}</div>
                      <div className="flex justify-between items-center mb-2">
                         <div className="text-xs text-slate-400">SKU: {product.sku.split('-')[1]}</div>
                         {product.variants && product.variants.length > 0 && (
                            <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                               {product.variants.length} biến thể
                            </div>
                         )}
                      </div>
                      <div className="mt-auto flex justify-between items-end">
                         <span className="font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(product.price)}</span>
                         <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Kho: {product.stock}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  const ChatView = () => {
    const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedChatId);

      // Mock Customer Stats for the selected chat
      const customerStats = useMemo(() => {
          if (!selectedConversation) return { orders: 0, spent: 0, rating: 0 };
          if (selectedConversation.id === 'c1') return { orders: 12, spent: 5400000, rating: 4.8 };
          if (selectedConversation.id === 'c2') return { orders: 1, spent: 153000, rating: 5.0 };
          if (selectedConversation.id === 'c3') return { orders: 0, spent: 0, rating: 0 };
          return { orders: 5, spent: 1000000, rating: 4.5 };
      }, [selectedConversation]);

      const customerLabel = useMemo(() => {
          if (customerStats.orders === 0) return { text: "Chưa mua", classes: "bg-slate-100 text-slate-600" };
          if (customerStats.orders === 1) return { text: "Khách mới", classes: "bg-blue-100 text-blue-700 border border-blue-200" };
          if (customerStats.orders > 5) return { text: "Khách VIP", classes: "bg-amber-100 text-amber-700 font-bold border border-amber-200" };
          return { text: "Khách mua lại", classes: "bg-emerald-100 text-emerald-700 border border-emerald-200" };
      }, [customerStats]);

      const linkedOrder = useMemo(() => {
         if (!selectedConversation) return null;
         if (selectedConversation.id === 'c1' || selectedConversation.id === 'c2') {
             const order = MOCK_ORDERS.find(o => o.status === 'shipping' || o.status === 'processing');
             return order;
         }
         return null;
      }, [selectedConversation]);
  
      // Detail View (Full Screen on Mobile)
      if (selectedChatId && selectedConversation) {
          return (
              <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fade-in">
                  {/* Header */}
                  <div className="bg-white px-4 pt-safe pb-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedChatId(null)} className="p-1 -ml-1 text-slate-600">
                              <ChevronLeft size={26} />
                          </button>
                          <div className="relative">
                              <img src={selectedConversation.avatar} className="w-10 h-10 rounded-full object-cover" />
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                  {LOGOS[selectedConversation.platform] && <img src={LOGOS[selectedConversation.platform]} className="w-3.5 h-3.5"/>}
                              </div>
                          </div>
                          <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-slate-800 text-base">{selectedConversation.customerName}</h3>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${customerLabel.classes}`}>{customerLabel.text}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-3 text-indigo-600">
                          <button><Phone size={20} /></button>
                      </div>
                  </div>
  
                  {/* CRM Stats Strip */}
                  <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center text-xs font-medium border-b border-indigo-100">
                      <div className="flex items-center gap-1 text-slate-700">
                          <ShoppingBag size={12} className="text-indigo-600"/> 
                          <span className="font-bold">{customerStats.orders}</span> Đơn
                      </div>
                      <div className="w-px h-3 bg-indigo-200"></div>
                      <div className="flex items-center gap-1 text-slate-700">
                          <DollarSign size={12} className="text-indigo-600"/> 
                          <span className="font-bold">{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(customerStats.spent)}</span>
                      </div>
                      <div className="w-px h-3 bg-indigo-200"></div>
                      <div className="flex items-center gap-1 text-slate-700">
                          <Star size={12} className="text-orange-500 fill-orange-500"/> 
                          <span className="font-bold">{customerStats.rating}</span>
                      </div>
                  </div>
  
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                      {linkedOrder && (
                          <div className="bg-white border text-left border-indigo-100 rounded-xl p-3 shadow-sm mb-4">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                                      <Package size={14}/> Đơn hàng {linkedOrder.status === 'shipping' ? 'đang giao' : 'chờ xử lý'}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{linkedOrder.id}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                  <img src={linkedOrder.items[0]?.image} className="w-10 h-10 rounded border border-slate-100 object-cover shrink-0" />
                                  <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-slate-800 truncate">{linkedOrder.items[0]?.name}</div>
                                      <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(linkedOrder.total)} • {linkedOrder.items.length} SP</div>
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="flex justify-center">
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Hôm nay, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {selectedConversation.messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100 pb-safe">
                    <div className="flex gap-2 items-center">
                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><Plus size={24}/></button>
                        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 flex items-center">
                            <input 
                                type="text" 
                                placeholder="Nhập tin nhắn..." 
                                className="bg-transparent w-full text-sm outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <button className="p-2 bg-indigo-600 text-white rounded-full shadow-sm">
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
       <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-slate-100 shadow-sm flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Tin nhắn</h2>
          <div className="flex gap-2">
             <button className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">Chưa đọc</button>
             <button className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">Sàn</button>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto pb-24">
          {MOCK_CONVERSATIONS.map(conv => {
              const ordersCount = conv.id === 'c1' ? 12 : conv.id === 'c2' ? 1 : conv.id === 'c3' ? 0 : 5;
              const label = ordersCount === 0 ? null : ordersCount === 1 ? { text: "Khách mới", classes: "bg-blue-100 text-blue-700" } : ordersCount > 5 ? { text: "Khách VIP", classes: "bg-amber-100 text-amber-700" } : { text: "Khách mua lại", classes: "bg-emerald-100 text-emerald-700" };

              return (
              <div 
                 key={conv.id} 
                 onClick={() => setSelectedChatId(conv.id)}
                 className="bg-white p-4 border-b border-slate-50 flex gap-3 active:bg-slate-50 transition-colors cursor-pointer"
              >
                 <div className="relative">
                    <img src={conv.avatar} className="w-12 h-12 rounded-full object-cover" />
                    {conv.unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">{conv.unreadCount}</span>}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-100 shadow-sm">
                       {LOGOS[conv.platform] && <img src={LOGOS[conv.platform]} className="w-3.5 h-3.5 object-contain"/>}
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                       <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{conv.customerName}</span>
                       <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.timestamp}</span>
                    </div>
                    {label && <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded mb-1 font-medium ${label.classes}`}>{label.text}</span>}
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                       {conv.sender === 'user' ? 'Bạn: ' : ''}{conv.lastMessage}
                    </p>
                 </div>
              </div>
          )})}
       </div>
    </div>
  )};

  const MenuView = () => {
     const menuItems = [
        { icon: LayoutDashboard, label: 'Tổng quan', color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => setActiveTab('home') },
        { icon: Package, label: 'Đơn hàng', color: 'text-blue-600', bg: 'bg-blue-50', action: () => setActiveTab('orders') },
        { icon: ShoppingBag, label: 'Sản phẩm', color: 'text-green-600', bg: 'bg-green-50', action: () => setActiveTab('products') },
        { icon: Box, label: 'Kho hàng', color: 'text-orange-600', bg: 'bg-orange-50', action: () => setActiveTab('inventory') },
        { icon: BookText, label: 'Sổ & Hóa đơn', color: 'text-indigo-700', bg: 'bg-indigo-50', action: () => setActiveTab('invoices') },
        { icon: PieChart, label: 'Báo cáo', color: 'text-purple-600', bg: 'bg-purple-50', action: () => setActiveTab('reports') },
     ];

     return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
           <div className="bg-white px-4 pt-4 pb-4 z-10 border-b border-slate-100 shadow-sm shrink-0">
              <div className="flex items-center gap-4 mb-4">
                 <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-indigo-100" />
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-sm text-slate-500 capitalize">{user.role === 'owner' ? 'Chủ cửa hàng' : user.role}</p>
                 </div>
              </div>
              <button 
                onClick={onSwitchToDesktop}
                className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100"
              >
                 Chuyển sang giao diện Desktop
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 pb-24">
              <div className="grid grid-cols-3 gap-4">
                {menuItems.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={item.action}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 text-center">{item.label}</span>
                    </div>
                ))}
                <div 
                    onClick={onLogout}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform col-span-3 mt-4"
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600">
                        <LogOut size={20} />
                    </div>
                    <span className="text-xs font-medium text-red-600">Đăng xuất</span>
                </div>
              </div>
           </div>
        </div>
     );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 font-sans text-slate-900 select-none overflow-hidden">
      
      {/* Dynamic Content */}
      <div className="h-full w-full">
         {activeTab === 'home' && <HomeView />}
         {activeTab === 'orders' && <OrdersView />}
         {activeTab === 'products' && <ProductsView />}
         {activeTab === 'chat' && <ChatView />}
         {activeTab === 'menu' && <MenuView />}
         {activeTab === 'inventory' && <InventoryView />}
         {activeTab === 'invoices' && <InvoiceView />}
         {activeTab === 'reports' && <ReportsView />}
      </div>
      
      {/* Product Form Modal */}
      {editingProduct && <ProductForm />}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-between items-end z-50 rounded-t-2xl h-[64px]">
         {/* Home */}
         <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 w-12 transition-all duration-300 ${activeTab === 'home' ? '-translate-y-3 text-indigo-600' : 'text-slate-400 py-1'}`}
         >
            <div className={`p-2 rounded-full transition-all ${activeTab === 'home' ? 'bg-indigo-50 shadow-sm' : ''}`}>
               <LayoutDashboard size={24} className={activeTab === 'home' ? "fill-current" : ""} />
            </div>
            {activeTab === 'home' && <span className="text-[10px] font-bold animate-fade-in">Home</span>}
         </button>
         
         {/* Orders */}
         <button 
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 w-12 transition-all duration-300 ${activeTab === 'orders' ? '-translate-y-3 text-indigo-600' : 'text-slate-400 py-1'}`}
         >
            <div className={`p-2 rounded-full transition-all ${activeTab === 'orders' ? 'bg-indigo-50 shadow-sm' : ''}`}>
               <Package size={24} className={activeTab === 'orders' ? "fill-current" : ""} />
            </div>
            {activeTab === 'orders' && <span className="text-[10px] font-bold animate-fade-in">Đơn</span>}
         </button>

         {/* FAB Center - Scanner */}
         <div className="relative -top-3 flex flex-col items-center">
             <button 
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-300 border-4 border-slate-50 active:scale-95 transition-transform"
                onClick={() => setShowScanner(true)}
             >
                <QrCode size={24} />
             </button>
             <span className="text-[10px] font-bold text-slate-500 mt-1 whitespace-nowrap">Quét mã</span>
         </div>

         {/* Chat */}
         <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 w-12 transition-all duration-300 ${activeTab === 'chat' ? '-translate-y-3 text-indigo-600' : 'text-slate-400 py-1'}`}
         >
            <div className={`p-2 rounded-full transition-all ${activeTab === 'chat' ? 'bg-indigo-50 shadow-sm' : ''} relative`}>
               <MessageCircle size={24} className={activeTab === 'chat' ? "fill-current" : ""} />
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            {activeTab === 'chat' && <span className="text-[10px] font-bold animate-fade-in">Chat</span>}
         </button>

         {/* Menu */}
         <button 
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center gap-1 w-12 transition-all duration-300 ${activeTab === 'menu' ? '-translate-y-3 text-indigo-600' : 'text-slate-400 py-1'}`}
         >
            <div className={`p-2 rounded-full transition-all ${activeTab === 'menu' ? 'bg-indigo-50 shadow-sm' : ''}`}>
               <Menu size={24} />
            </div>
            {activeTab === 'menu' && <span className="text-[10px] font-bold animate-fade-in">Menu</span>}
         </button>
      </div>

      {/* Scanner Overlay Mock */}
      {showScanner && (
         <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in">
            <div className="p-4 pt-4 flex justify-between items-center text-white">
               <button onClick={() => setShowScanner(false)}><X size={24}/></button>
               <span className="font-bold">Quét mã vạch / QR</span>
               <button><Zap size={24}/></button>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="w-64 h-64 border-2 border-white/50 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-xl"></div>
                  <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
               </div>
               <p className="absolute bottom-20 text-white/70 text-sm">Di chuyển camera đến vùng mã vạch</p>
            </div>
            <div className="p-8 bg-white rounded-t-3xl">
               <div className="text-center">
                  <p className="font-bold text-slate-800">Đang tìm kiếm...</p>
                  <p className="text-xs text-slate-500 mt-1">Tự động nhận diện sản phẩm hoặc đơn hàng</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MobileApp;
