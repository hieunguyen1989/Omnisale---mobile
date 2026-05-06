
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS, MOCK_ORDERS } from '../services/mockData';
import { Product, Order } from '../types';
import { 
  User, Phone, MapPin, Search, Trash2, Truck, 
  CreditCard, Package, CheckCircle, ChevronRight, UserPlus, PlusCircle,
  Box, Scale, History, DollarSign, Percent, ArrowLeft, Tag, Clock, Zap,
  FileSpreadsheet, Filter, Download, Calendar, MoreHorizontal, Printer, X,
  Edit3, Save, TrendingUp, AlertCircle, Wallet, Eye, CheckSquare, PenTool, ChevronDown, ChevronUp, ShoppingBag
} from 'lucide-react';

const CARRIERS = [
  { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', logo: 'https://picsum.photos/50/50?random=ghtk', fee: 35000, time: 3, timeStr: '2-3 ngày' },
  { id: 'ghn', name: 'Giao Hàng Nhanh', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Logo_GHN_Slogan_En.png/320px-Logo_GHN_Slogan_En.png', fee: 32000, time: 3, timeStr: '2-3 ngày' },
  { id: 'viettel', name: 'Viettel Post', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Viettel_Post_logo.png', fee: 28000, time: 4, timeStr: '3-4 ngày' },
];

const CreateOrder: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Create/Edit Order State
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: '', district: '', note: '' });
  const [selectedProducts, setSelectedProducts] = useState<{product: Product, quantity: number, price: number}[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [packageInfo, setPackageInfo] = useState({ weight: 500, length: 10, width: 10, height: 5 });
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [shippingFee, setShippingFee] = useState(0);
  const [isCodEnabled, setIsCodEnabled] = useState(true);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

  // List / Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Used for Tabs now
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Expanded Order Items State
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Export State
  const [exportType, setExportType] = useState<'date' | 'month' | 'year'>('month');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  // Print State
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Initialize with manual orders from mock + any local additions
    const manualOrders = MOCK_ORDERS.filter(o => o.platform === 'Manual');
    setOrders(manualOrders);
  }, []);

  const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalImportCost = selectedProducts.reduce((sum, item) => sum + ((item.product.importPrice || item.product.price * 0.6) * item.quantity), 0);
  const discountAmount = discountType === 'fixed' ? discountValue : (subtotal * discountValue) / 100;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
  
  const estimatedProfit = subtotal - totalImportCost - discountAmount; 

  // --- Handlers ---

  const handleAddProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1, price: product.price }];
    });
    setProductSearch('');
    setIsProductDropdownOpen(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedProducts(prev => prev.map(item => item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(item => item.product.id !== id));
  };

  const parseDate = (dateStr: string) => {
    try {
      if (dateStr.includes('T')) return new Date(dateStr); // ISO format
      const [time, date] = dateStr.split(' ');
      const [day, month, year] = date.split('/');
      return new Date(Number(`20${year}`), Number(month) - 1, Number(day));
    } catch (e) {
      return new Date();
    }
  };

  const resetForm = () => {
    setCustomer({ name: '', phone: '', address: '', city: '', district: '', note: '' });
    setSelectedProducts([]);
    setDiscountValue(0);
    setShippingFee(0);
    setSelectedCarrierId('');
    setEditingId(null);
  };

  const handleCreateOrder = () => {
    if (!customer.name || !customer.phone || selectedProducts.length === 0) return alert("Vui lòng điền thông tin khách hàng và chọn sản phẩm.");
    
    const newOrder: any = {
      id: editingId || `MAN-${Date.now().toString().slice(-6)}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      address: customer.address,
      date: editingId ? (orders.find(o => o.id === editingId)?.date || new Date().toLocaleString('vi-VN')) : new Date().toLocaleString('vi-VN'),
      total: totalAmount,
      status: 'pending',
      items: selectedProducts.map(p => ({...p.product, quantity: p.quantity})),
      platform: 'Manual',
      shippingFee: shippingFee,
      isCOD: isCodEnabled,
      note: customer.note,
      shippingCarrier: selectedCarrierId
    };

    if (editingId) {
      setOrders(prev => prev.map(o => o.id === editingId ? newOrder : o));
      alert("Cập nhật đơn hàng thành công!");
    } else {
      setOrders([newOrder, ...orders]);
      alert("Tạo đơn hàng thành công!");
    }

    resetForm();
    setViewMode('list');
  };

  const handleEditOrder = (order: Order) => {
    setEditingId(order.id);
    setCustomer({
      name: order.customerName,
      phone: order.customerPhone || '',
      address: order.address || '',
      city: '', 
      district: '',
      note: order.note || ''
    });
    
    // Map order items back to selection
    const mappedItems = order.items.map(item => {
      // Find full product details from MOCK_PRODUCTS if possible, otherwise construct minimal
      const fullProduct = MOCK_PRODUCTS.find(p => p.id === item.productId) || {
        id: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        image: item.image,
        importPrice: item.price * 0.6, // Fallback mock
        // ... defaults
      } as Product;

      return {
        product: fullProduct,
        quantity: item.quantity,
        price: item.price
      };
    });
    setSelectedProducts(mappedItems);
    
    setShippingFee(order.shippingFee);
    // Find carrier based on logic or default
    const carrier = CARRIERS.find(c => c.name === order.shippingCarrier) || CARRIERS[0];
    setSelectedCarrierId(carrier.id);
    setIsCodEnabled(order.isCOD);
    
    setViewMode('edit');
  };

  const handleExport = () => {
    let filename = '';
    if (exportType === 'date') filename = `Bao_cao_don_ngay_${exportDate}`;
    if (exportType === 'month') filename = `Bao_cao_don_thang_${exportMonth}`;
    if (exportType === 'year') filename = `Bao_cao_don_nam_${exportYear}`;
    
    alert(`Đang tải xuống báo cáo: ${filename}.xlsx`);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);
        return next;
    });
  };

  // --- List View Components ---

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerPhone?.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      
      let matchDate = true;
      if (dateRange.start || dateRange.end) {
        const orderDate = parseDate(o.date);
        orderDate.setHours(0,0,0,0);
        
        if (dateRange.start) {
          const start = new Date(dateRange.start);
          start.setHours(0,0,0,0);
          if (orderDate < start) matchDate = false;
        }
        if (dateRange.end) {
          const end = new Date(dateRange.end);
          end.setHours(23,59,59,999);
          if (orderDate > end) matchDate = false;
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      revenue: orders.reduce((acc, o) => acc + o.total, 0),
      pending: orders.filter(o => o.status === 'pending').length,
      shipping: orders.filter(o => o.status === 'shipping').length
    }
  }, [orders]);

  const tabs = [
      { id: 'all', label: 'Tất cả' },
      { id: 'pending', label: 'Chờ xử lý', count: stats.pending },
      { id: 'processing', label: 'Đang đóng gói' },
      { id: 'shipping', label: 'Đang giao', count: stats.shipping },
      { id: 'delivered', label: 'Hoàn thành' },
      { id: 'cancelled', label: 'Đã hủy' },
  ];

  // --- Render Print Modal ---
  const renderPrintModal = () => {
    if (!printOrder) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Printer size={18} /> In hóa đơn
            </h3>
            <button onClick={() => setPrintOrder(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
            {/* Receipt Preview */}
            <div className="bg-white p-6 shadow-sm mx-auto text-sm font-mono leading-relaxed" style={{ maxWidth: '300px' }}>
              <div className="text-center mb-4 border-b border-dashed border-slate-300 pb-4">
                <h2 className="font-bold text-lg text-slate-900">OMNISALES STORE</h2>
                <p className="text-slate-500 text-xs">123 Đường ABC, Quận 1, TP.HCM</p>
                <p className="text-slate-500 text-xs">Hotline: 1900 1234</p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between"><span>Mã đơn:</span> <span className="font-bold">{printOrder.id}</span></div>
                <div className="flex justify-between"><span>Ngày:</span> <span>{printOrder.date.split(' ')[1]}</span></div>
                <div className="flex justify-between"><span>Khách:</span> <span>{printOrder.customerName}</span></div>
                <div className="flex justify-between"><span>SĐT:</span> <span>{printOrder.customerPhone}</span></div>
              </div>

              <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
                <div className="flex font-bold mb-1">
                  <span className="flex-1">Mặt hàng</span>
                  <span className="w-8 text-center">SL</span>
                  <span className="w-16 text-right">Thành tiền</span>
                </div>
                {printOrder.items.map((item, idx) => (
                  <div key={idx} className="flex mb-1">
                    <span className="flex-1 truncate pr-1">{item.name}</span>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <span className="w-16 text-right">{formatCurrency(item.price * item.quantity).replace(' ₫', '')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 mb-4 border-b border-dashed border-slate-300 pb-4">
                <div className="flex justify-between"><span>Tạm tính:</span> <span>{formatCurrency(printOrder.total - printOrder.shippingFee).replace(' ₫', '')}</span></div>
                <div className="flex justify-between"><span>Phí ship:</span> <span>{formatCurrency(printOrder.shippingFee).replace(' ₫', '')}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2"><span>Tổng cộng:</span> <span>{formatCurrency(printOrder.total).replace(' ₫', '')}</span></div>
              </div>

              <div className="text-center text-xs text-slate-500">
                <p>Cảm ơn quý khách đã mua hàng!</p>
                <p>Hẹn gặp lại!</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <button 
              onClick={() => setPrintOrder(null)} 
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50"
            >
              Đóng
            </button>
            <button 
              onClick={() => { alert('Đang gửi lệnh in...'); setPrintOrder(null); }}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
            >
              <Printer size={18} /> In ngay
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="min-h-screen pb-10 animate-fade-in font-sans space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng TMĐT</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý và xử lý đơn hàng từ các kênh bán hàng.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* Date Filter Moved Here */}
             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
               <Calendar size={16} className="text-slate-400" />
               <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                  className="text-sm border-none outline-none text-slate-600 w-28 bg-transparent cursor-pointer font-medium"
                  title="Từ ngày"
               />
               <span className="text-slate-400">-</span>
               <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                  className="text-sm border-none outline-none text-slate-600 w-28 bg-transparent cursor-pointer font-medium"
                  title="Đến ngày"
               />
             </div>

             <button 
                onClick={() => { resetForm(); setViewMode('create'); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap"
             >
                <PlusCircle size={18} /> Tạo đơn mới
             </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Tổng đơn hàng</div>
                 <div className="text-xl font-bold text-slate-800">{stats.total}</div>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20}/></div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Doanh thu</div>
                 <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</div>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={20}/></div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Chờ xử lý</div>
                 <div className="text-xl font-bold text-slate-800">{stats.pending}</div>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Truck size={20}/></div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Đang giao</div>
                 <div className="text-xl font-bold text-slate-800">{stats.shipping}</div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Status Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                          statusFilter === tab.id 
                          ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                      {tab.label}
                      {tab.count !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {tab.count}
                          </span>
                      )}
                  </button>
              ))}
          </div>

          {/* Filters Toolbar - Removed Date Picker from here */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
             <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
                <div className="relative flex-1 sm:flex-none">
                   <input 
                     type="text" 
                     placeholder="Tìm mã đơn, tên khách, SĐT..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
                   />
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
             </div>

             <div className="flex gap-2 ml-auto">
                <button 
                  onClick={handleExport}
                  className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                   <Download size={16} /> Xuất Excel
                </button>
             </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 w-[12%]">Mã đơn</th>
                  <th className="px-6 py-3 w-[15%]">Khách hàng</th>
                  <th className="px-6 py-3 w-[35%]">Sản phẩm</th>
                  <th className="px-6 py-3 w-[13%]">Vận chuyển</th>
                  <th className="px-6 py-3 w-[10%] text-right">Tài chính</th>
                  <th className="px-6 py-3 w-[10%] text-center">Trạng thái</th>
                  <th className="px-6 py-3 w-[5%] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-12 text-slate-400 italic">Không tìm thấy đơn hàng nào</td></tr>
                ) : (
                   filteredOrders.map(order => {
                    const isExpanded = expandedOrders.has(order.id);
                    // Hiển thị sản phẩm: Nếu mở rộng thì hiện hết, nếu không thì chỉ hiện 1
                    const itemsToShow = isExpanded ? order.items : order.items.slice(0, 1);
                    const hiddenCount = order.items.length - 1;
                    
                    return (
                    <tr key={order.id} className="hover:bg-slate-50 group transition-colors align-top">
                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-600 font-mono text-xs mb-1">{order.id}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10}/> {order.date.split(' ')[1] || order.date}</div>
                        <div className="mt-1">
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center w-fit gap-1">
                                <PenTool size={10}/> Thủ công
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{order.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10}/> {order.customerPhone}</div>
                        {order.address && (
                            <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]" title={order.address}>
                                <MapPin size={10} className="inline mr-0.5"/> {order.address}
                            </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-3">
                            {itemsToShow.map((item, idx) => (
                                <div key={idx} className="flex gap-3 relative">
                                    <img src={item.image} alt="" className="w-12 h-12 rounded border border-slate-200 object-cover bg-white shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-slate-800 font-medium text-sm leading-tight">{item.name}</div>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {item.sku && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">SKU: {item.sku}</span>}
                                            {item.variant && <span className="text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 border border-indigo-100">{item.variant}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">x{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Logic hiển thị nút Xem thêm/Thu gọn */}
                            {order.items.length > 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                    className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 w-full pt-1"
                                >
                                    {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                    {isExpanded ? 'Thu gọn' : `Xem thêm ${hiddenCount} sản phẩm khác`}
                                </button>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         {order.shippingCarrier ? (
                             <>
                                <div className="text-xs font-bold text-slate-700">{order.shippingCarrier}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Phí: {formatCurrency(order.shippingFee)}</div>
                             </>
                         ) : <span className="text-xs text-slate-400 italic">Chưa chọn</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="font-bold text-slate-800">{formatCurrency(order.total)}</div>
                         <div className={`text-[10px] font-bold mt-1 ${order.isCOD ? 'text-orange-600' : 'text-green-600'}`}>
                             {order.isCOD ? 'COD' : 'Đã TT'}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                           order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                           order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                           order.status === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                           'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                           {order.status === 'pending' ? 'Mới tạo' : order.status === 'processing' ? 'Đang xử lý' : order.status === 'shipping' ? 'Đang giao' : order.status === 'delivered' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setPrintOrder(order)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="In đơn"><Printer size={16}/></button>
                            <button onClick={() => handleEditOrder(order)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="Chỉnh sửa"><Edit3 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
             <span>Hiển thị {filteredOrders.length} đơn hàng</span>
             <div className="flex gap-1">
                <button className="px-2 py-1 bg-white border rounded hover:bg-slate-100 disabled:opacity-50" disabled>Trước</button>
                <button className="px-2 py-1 bg-white border rounded hover:bg-slate-100 disabled:opacity-50" disabled>Sau</button>
             </div>
          </div>
        </div>
        
        {/* Render Print Modal */}
        {renderPrintModal()}
      </div>
    );
  }

  // --- Create/Edit Order Single Screen View ---
  return (
    <div className="pb-10 animate-fade-in font-sans h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
             <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{viewMode === 'edit' ? 'Cập Nhật Đơn Hàng' : 'Tạo Đơn Hàng Mới'}</h2>
            <p className="text-xs text-slate-500">{viewMode === 'edit' ? `Mã: ${editingId}` : 'Tạo đơn tại quầy / qua tin nhắn'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* MAIN COLUMN (LEFT) - Customer & Products */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Customer Section - Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold border-b border-slate-50 pb-2">
                    <User size={18} className="text-indigo-600"/> Thông tin khách hàng
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="text" placeholder="Tìm nhanh (SĐT/Tên)..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={customer.name} 
                            onChange={(e) => setCustomer({...customer, name: e.target.value})} 
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                            placeholder="Tên khách hàng" 
                        />
                        <input 
                            type="text" 
                            value={customer.phone} 
                            onChange={(e) => setCustomer({...customer, phone: e.target.value})} 
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                            placeholder="Số điện thoại" 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <input 
                            type="text" 
                            value={customer.address} 
                            onChange={(e) => setCustomer({...customer, address: e.target.value})} 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                            placeholder="Địa chỉ giao hàng" 
                        />
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Package size={18} className="text-indigo-600"/> Danh sách sản phẩm
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{selectedProducts.length} sản phẩm</span>
                    </div>
                    <div className="relative z-20">
                        <input 
                            type="text" 
                            value={productSearch}
                            onChange={(e) => { setProductSearch(e.target.value); setIsProductDropdownOpen(true); }}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                            placeholder="Tìm sản phẩm thêm vào đơn (Tên, SKU)..."
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        
                        {isProductDropdownOpen && productSearch && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-30">
                                {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                <div key={p.id} className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0" onClick={() => handleAddProduct(p)}>
                                    <img src={p.image} className="w-10 h-10 rounded object-cover border border-slate-100" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{p.name}</div>
                                        <div className="text-xs text-slate-500">Kho: {p.stock} | Giá nhập: {formatCurrency(p.importPrice || p.price * 0.6)}</div>
                                    </div>
                                    <div className="text-sm font-bold text-indigo-600">{formatCurrency(p.price)}</div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 w-12">#</th>
                                <th className="px-4 py-3">Sản phẩm</th>
                                <th className="px-4 py-3 text-center w-32">Số lượng</th>
                                <th className="px-4 py-3 text-right w-32">Đơn giá</th>
                                <th className="px-4 py-3 text-right w-32">Thành tiền</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {selectedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                                        Chưa có sản phẩm nào được chọn
                                    </td>
                                </tr>
                            ) : (
                                selectedProducts.map((item, idx) => (
                                    <tr key={item.product.id} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={item.product.image} className="w-10 h-10 rounded object-cover border border-slate-200 bg-white" />
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-800 line-clamp-1">{item.product.name}</div>
                                                    <div className="text-xs text-slate-500">{item.product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center border border-slate-200 rounded-lg bg-white w-fit mx-auto">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold">-</button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        if(val > 0) updateQuantity(item.product.id, val - item.quantity);
                                                    }}
                                                    className="w-10 text-center text-sm font-medium outline-none border-x border-slate-100"
                                                />
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold">+</button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => removeProduct(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* SIDE COLUMN (RIGHT) - Summary & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* Shipping & Extras */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
              <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Truck size={16} className="text-indigo-600"/> Vận chuyển & Thanh toán
                  </h4>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Đơn vị vận chuyển</label>
                          <select 
                              value={selectedCarrierId} 
                              onChange={(e) => {
                                  setSelectedCarrierId(e.target.value);
                                  const carrier = CARRIERS.find(c => c.id === e.target.value);
                                  if(carrier) setShippingFee(carrier.fee);
                              }}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                              <option value="">-- Chọn ĐVVC --</option>
                              {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.name} - {formatCurrency(c.fee)}</option>)}
                          </select>
                      </div>
                      <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-600">Phí vận chuyển</label>
                          <input 
                              type="number" 
                              value={shippingFee}
                              onChange={(e) => setShippingFee(Number(e.target.value))}
                              className="w-24 text-right border border-slate-200 rounded px-2 py-1 text-sm font-medium outline-none focus:border-indigo-500"
                          />
                      </div>
                      <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-600">Thu hộ (COD)</label>
                          <div className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={isCodEnabled} onChange={(e) => setIsCodEnabled(e.target.checked)} className="sr-only peer" />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-slate-700">Chiết khấu / Giảm giá</label>
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                          <button onClick={() => setDiscountType('fixed')} className={`px-2 py-0.5 text-xs rounded ${discountType === 'fixed' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500'}`}>VNĐ</button>
                          <button onClick={() => setDiscountType('percent')} className={`px-2 py-0.5 text-xs rounded ${discountType === 'percent' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500'}`}>%</button>
                      </div>
                  </div>
                  <input 
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-right font-bold text-red-500 outline-none focus:border-red-300"
                      placeholder="0"
                  />
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú đơn hàng</label>
                  <textarea 
                      value={customer.note}
                      onChange={(e) => setCustomer({...customer, note: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                      rows={2}
                      placeholder="VD: Giao giờ hành chính..."
                  />
              </div>
           </div>

           {/* Financial Summary & Action */}
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 sticky top-4">
              <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Wallet size={20} className="text-green-600"/> Tổng quan tài chính
              </h4>
              
              <div className="space-y-2 text-sm mb-4">
                 <div className="flex justify-between text-slate-600">
                    <span>Tổng tiền hàng</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(shippingFee)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>Giảm giá</span>
                    <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                    <span className="font-bold text-slate-800 text-base">Khách phải trả</span>
                    <span className="font-extrabold text-indigo-600 text-xl">{formatCurrency(totalAmount)}</span>
                 </div>
              </div>

              {/* Profit Analysis Widget */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-6">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <TrendingUp size={12}/> Phân tích lợi nhuận
                  </div>
                  <div className="flex justify-between items-end text-xs mb-1">
                      <span className="text-slate-500">Giá vốn (Ước tính)</span>
                      <span className="font-medium text-slate-700">{formatCurrency(totalImportCost)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-bold">Lợi nhuận ròng</span>
                      <span className={`font-bold text-sm ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {estimatedProfit >= 0 ? '+' : ''}{formatCurrency(estimatedProfit)}
                      </span>
                  </div>
              </div>

              <button 
                onClick={handleCreateOrder} 
                disabled={!selectedCarrierId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
              >
                 {viewMode === 'edit' ? <Save size={20} /> : <CreditCard size={20} />} 
                 {viewMode === 'edit' ? 'Cập nhật đơn' : 'Tạo đơn ngay'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CreateOrder;
