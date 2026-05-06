
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ORDERS, INITIAL_INTEGRATIONS } from '../services/mockData';
import { 
  RefreshCw, Search, Printer, Package, Truck, Zap, ChevronLeft, ChevronRight, 
  ShoppingBag, FileOutput, CheckSquare, Clock, XCircle, AlertTriangle, 
  MessageSquareQuote, PenTool, Loader2, CheckCircle2, FileSpreadsheet, X, Settings,
  Eye, User, MapPin, DollarSign, Receipt, ArrowRight, Store, Flame, ChevronDown, ChevronUp,
  Building, Calendar, FileText, Box
} from 'lucide-react';
import { Platform, UserProfile, Order, OrderItem } from '../types';

interface OrderListProps {
  user: UserProfile;
}

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const CARRIER_LOGOS: Record<string, string> = {
  'SPX Express': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/320px-Shopee.svg.png',
  'J&T Express': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/J%26T_Express_logo.svg/320px-J%26T_Express_logo.svg.png',
  'Giao Hàng Nhanh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Logo_GHN_Slogan_En.png/320px-Logo_GHN_Slogan_En.png', 
  'Viettel Post': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Viettel_Post_logo.png',
  'Ninja Van': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Ninja_Van_logo.svg/320px-Ninja_Van_logo.svg.png',
  'Giao hàng thủ công': '',
  'GrabExpress': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Grab_Logo_2019.svg/1200px-Grab_Logo_2019.svg.png',
  'Ahamove': 'https://upload.wikimedia.org/wikipedia/commons/7/73/Ahamove_Logo.png'
};

const getCarrierLogo = (name: string) => {
  if (CARRIER_LOGOS[name]) return CARRIER_LOGOS[name];
  if (name.includes('J&T')) return CARRIER_LOGOS['J&T Express'];
  if (name.includes('Viettel')) return CARRIER_LOGOS['Viettel Post'];
  if (name.includes('Nhanh') || name.includes('GHN')) return CARRIER_LOGOS['Giao Hàng Nhanh'];
  if (name.includes('Grab')) return CARRIER_LOGOS['GrabExpress'];
  if (name.includes('Ahamove')) return CARRIER_LOGOS['Ahamove'];
  return null;
};

const PlatformIcon = ({ platform }: { platform: Platform | 'Manual' }) => {
  if (platform === 'Manual') {
    return (
      <span className="text-indigo-600 font-bold text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
        <PenTool size={10} /> Thủ công
      </span>
    );
  }
  
  const logoUrl = LOGOS[platform];
  if (logoUrl) {
    return <img src={logoUrl} alt={platform} className="h-5 w-auto object-contain" />;
  }
  
  return <span className="text-slate-500 font-bold text-[10px]">{platform}</span>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const parseDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return null;
  
  const timeParts = parts[0].split(':');
  const dateParts = parts[1].split('/');
  
  if (timeParts.length !== 2 || dateParts.length !== 3) return null;
  
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const year = parseInt('20' + dateParts[2]);
  
  return new Date(year, month, day, hour, minute);
};

// Modified Tab IDs to support split view
type TabId = 'all' | 'pending' | 'processing_unprocessed' | 'processing_processed' | 'shipping' | 'cancelled' | 'returned';
type ProcessingSubStatus = 'all' | 'unprocessed' | 'printed' | 'packed';
type SortOption = 'newest' | 'oldest' | 'deadline_asc' | 'deadline_desc';

const OrderList: React.FC<OrderListProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabId>('processing_unprocessed');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all' | 'Manual'>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all');
  const [showExpressOnly, setShowExpressOnly] = useState(false);
  
  const [sortOption, setSortOption] = useState<SortOption>('deadline_asc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Interaction States ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [processingOrderIds, setProcessingOrderIds] = useState<Set<string>>(new Set());
  
  // Modals
  const [bulkAction, setBulkAction] = useState<'process' | 'print' | 'export' | null>(null);
  const [bulkProgress, setBulkProgress] = useState(0); // 0-100 for progress bar
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null); // New state for detail modal

  // New States for requested features
  const [singleSyncingId, setSingleSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ status: 'success' | 'failure', msg: string } | null>(null);
  
  const [confirmModalData, setConfirmModalData] = useState<{ isOpen: boolean, orderIds: string[] }>({ isOpen: false, orderIds: [] });
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupTimeMode, setPickupTimeMode] = useState<'asap' | 'scheduled'>('asap');
  const [pickupScheduledTime, setPickupScheduledTime] = useState('');
  const [pickupDate, setPickupDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Processing Modal State
  const [processModalData, setProcessModalData] = useState<{ isOpen: boolean, order: Order | null }>({ isOpen: false, order: null });

  // --- Dynamic Pickup Slots ---
  const pickupSlots = useMemo(() => {
    // Generate Shopee-like slots: 08:00-12:00, 12:00-14:00, etc.
    return [
      "08:00 - 12:00",
      "12:00 - 14:00",
      "14:00 - 16:00",
      "16:00 - 18:00",
      "18:00 - 20:00"
    ];
  }, []);

  useEffect(() => {
    if (pickupSlots.length > 0) {
        setPickupScheduledTime(pickupSlots[0]);
    }
  }, [pickupSlots]);

  // Calculate dynamic counts for tabs
  const tabCounts = useMemo(() => {
    const counts: Record<TabId, number> = {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      // Split counts for processing
      processing_unprocessed: orders.filter(o => o.status === 'processing' && o.subStatus === 'unprocessed').length,
      processing_processed: orders.filter(o => o.status === 'processing' && o.subStatus !== 'unprocessed').length,
      
      shipping: orders.filter(o => o.status === 'shipping').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      returned: orders.filter(o => o.status === 'returned').length,
    };
    return counts;
  }, [orders]);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'all', label: 'Tất cả', count: tabCounts.all },
    { id: 'pending', label: 'Chờ xác nhận', count: tabCounts.pending },
    // Split tabs for Processing
    { id: 'processing_unprocessed', label: 'Chờ lấy (Chưa xử lý)', count: tabCounts.processing_unprocessed },
    { id: 'processing_processed', label: 'Chờ lấy (Đã xử lý)', count: tabCounts.processing_processed },
    { id: 'shipping', label: 'Đang giao', count: tabCounts.shipping },
    // Removed 'delivered' tab
    { id: 'cancelled', label: 'Đã hủy', count: tabCounts.cancelled },
    { id: 'returned', label: 'Trả Hàng / Hoàn Tiền', count: tabCounts.returned }
  ];

  const availableCarriers = useMemo(() => {
    const carriers = new Set<string>();
    orders.forEach(o => {
      if (o.shippingCarrier) carriers.add(o.shippingCarrier);
    });
    return Array.from(carriers);
  }, [orders]);

  const availableShops = useMemo(() => {
    const shops: {id: string, name: string}[] = [];
    INITIAL_INTEGRATIONS.forEach(integration => {
        integration.shops.forEach(shop => {
            if (user.role !== 'collaborator' || user.assignedShopIds.includes(shop.id)) {
                shops.push({ id: shop.id, name: shop.name });
            }
        });
    });
    return shops;
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrderIds(new Set());
    // Auto sort by deadline for processing tabs
    if (activeTab.startsWith('processing') || activeTab === 'pending') setSortOption('deadline_asc');
    else setSortOption('newest');
  }, [activeTab, searchTerm, selectedPlatform, selectedShop, showExpressOnly, selectedCarrier]);

  // --- Handlers ---

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleSyncOrders = () => {
    setIsSyncing(true);
    // Simulate network delay
    setTimeout(() => {
        setIsSyncing(false);
        
        // Randomly generate 1 to 5 new orders
        const newCount = Math.floor(Math.random() * 5) + 1;
        
        const newOrders: Order[] = Array.from({ length: newCount }).map((_, i) => ({
            ...MOCK_ORDERS[0],
            id: `SYNC-${Date.now()}-${i}`,
            status: 'pending',
            date: new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' }),
            customerName: `Khách Mới ${i + 1}`,
            total: 250000 + (i * 50000),
            platform: Platform.SHOPEE,
            items: [MOCK_ORDERS[0].items[0]],
            shippingMethod: Math.random() > 0.7 ? 'Hỏa tốc' : 'Nhanh'
        }));

        setOrders(prev => [...newOrders, ...prev]);
        
        // Detailed Alert
        alert(`Đồng bộ thành công!\nCó ${newCount} đơn hàng mới.`);
    }, 2000);
  };

  // Single Order Sync
  const handleSingleSync = (orderId: string) => {
    setSingleSyncingId(orderId);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      setSingleSyncingId(null);
      if (isSuccess) {
        setSyncResult({ status: 'success', msg: 'Đồng bộ đơn hàng thành công. Dữ liệu đã được cập nhật mới nhất.' });
      } else {
        setSyncResult({ status: 'failure', msg: 'Đồng bộ thất bại. Lý do: Lỗi kết nối API sàn hoặc đơn hàng không tồn tại.' });
      }
    }, 1500);
  };

  // Trigger Confirmation Modal
  const handleOpenConfirmModal = (orderId: string) => {
    setConfirmModalData({ isOpen: true, orderIds: [orderId] });
    setPickupMethod('pickup'); // Reset default
    setPickupTimeMode('asap'); // Reset default
  };

  // Trigger Process Modal
  const handleOpenProcessModal = (order: Order) => {
    setProcessModalData({ isOpen: true, order });
  };

  // Execute Confirmation after modal selection
  const executeConfirmOrder = () => {
    const orderIds = confirmModalData.orderIds;
    setConfirmModalData({ isOpen: false, orderIds: [] }); // Close modal

    // Add to processing set for visual feedback
    orderIds.forEach(id => setProcessingOrderIds(prev => new Set(prev).add(id)));

    setTimeout(() => {
        // Change status to processing, and subStatus to 'unprocessed' initially
        setOrders(prev => prev.map(o => orderIds.includes(o.id) ? { ...o, status: 'processing', subStatus: 'unprocessed', shipByDate: '10:00 25/05/25' } : o));
        
        setProcessingOrderIds(prev => {
            const next = new Set(prev);
            orderIds.forEach(id => next.delete(id));
            return next;
        });
        
        // Clear selection if bulk
        if (orderIds.length > 1) setSelectedOrderIds(new Set());

    }, 1000);
  };

  const executeBulkProcess = () => {
      // Logic for bulk processing -> Open Confirm Modal instead of direct action
      if (selectedOrderIds.size > 0) {
        setConfirmModalData({ isOpen: true, orderIds: Array.from(selectedOrderIds) });
        setPickupMethod('pickup');
        setPickupTimeMode('asap');
        setBulkAction(null); // Close bulk action modal
      }
  };

  const executeBulkPrint = () => {
      // Simulate printing delay
      setBulkAction(null); // Close modal immediately typically, or show progress
      alert("Đang gửi lệnh in... Vui lòng kiểm tra máy in.");
  };

  const executeExport = (format: 'excel' | 'csv') => {
      setBulkAction(null);
      alert(`Đang tải xuống file .${format}...`);
  };

  // --- Filtering Logic ---
  const accessibleOrders = useMemo(() => {
    if (user.role === 'collaborator') {
      return orders.filter(o => user.assignedShopIds.includes(o.shopId));
    }
    return orders;
  }, [user, orders]);

  const filteredOrders = accessibleOrders.filter(order => {
    // Tab Logic
    if (activeTab === 'processing_unprocessed') {
        if (order.status !== 'processing' || order.subStatus !== 'unprocessed') return false;
    } else if (activeTab === 'processing_processed') {
        // 'printed' or 'packed' means processed but still 'processing' main status
        if (order.status !== 'processing' || order.subStatus === 'unprocessed') return false;
    } else if (activeTab !== 'all') {
        if (order.status !== activeTab) return false;
    }

    if (selectedPlatform !== 'all' && order.platform !== selectedPlatform) return false;
    if (selectedShop !== 'all' && order.shopId !== selectedShop) return false;
    if (selectedCarrier !== 'all' && order.shippingCarrier !== selectedCarrier) return false;
    if (showExpressOnly && order.shippingMethod !== 'Hỏa tốc') return false;
    if (searchTerm) {
       const term = searchTerm.toLowerCase();
       return (
         order.id.toLowerCase().includes(term) || 
         order.customerName.toLowerCase().includes(term) ||
         order.items.some(item => item.name.toLowerCase().includes(term))
       );
    }
    return true;
  }).sort((a, b) => {
    // 1. Sort by Priority: Hỏa tốc (3) > Trong ngày (2) > Normal (1)
    const getPriority = (method?: string) => {
      if (method === 'Hỏa tốc') return 3;
      if (method === 'Trong ngày') return 2;
      return 1;
    };

    const priorityA = getPriority(a.shippingMethod);
    const priorityB = getPriority(b.shippingMethod);

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Descending order
    }

    // 2. Sort by secondary options
    if (sortOption === 'newest' || sortOption === 'oldest') {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    } else {
      const dateA = parseDate(a.shipByDate)?.getTime() || Number.MAX_VALUE;
      const dateB = parseDate(b.shipByDate)?.getTime() || Number.MAX_VALUE;
      return sortOption === 'deadline_asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const toggleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedOrderIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedOrderIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === currentItems.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(currentItems.map(o => o.id)));
    }
  };

  const CarrierLogo = ({ name }: { name: string }) => {
    const [error, setError] = useState(false);
    const logoUrl = getCarrierLogo(name);

    if (!logoUrl || error) {
      return (
        <div className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 text-center whitespace-nowrap min-w-[70px]">
          {name}
        </div>
      );
    }

    return (
      <img 
        src={logoUrl} 
        alt={name} 
        className="h-5 w-auto object-contain mb-0.5 mx-auto" 
        title={name} 
        onError={() => setError(true)}
      />
    );
  };

  const renderShippingStatus = (order: Order) => {
    const isProcessing = processingOrderIds.has(order.id);

    if (order.status === 'pending') {
      const deadlineDate = parseDate(order.shipByDate);
      const now = new Date();
      const isLate = deadlineDate && deadlineDate < now;

      return (
        <div className="flex flex-col items-center justify-center space-y-2">
           <span className={`text-xs italic ${isLate ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
             {isLate ? 'Đã trễ xác nhận' : 'Chờ xác nhận đơn'}
           </span>
           <button 
             onClick={() => handleOpenConfirmModal(order.id)}
             disabled={isProcessing}
             className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm w-full font-bold flex items-center justify-center gap-2 disabled:bg-indigo-400"
           >
             {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
             {isProcessing ? 'Đang xử lý...' : 'Xác nhận ngay'}
           </button>
        </div>
      );
    }

    if (order.status === 'processing') {
      const deadlineDate = parseDate(order.shipByDate);
      const now = new Date();
      const isLate = deadlineDate && deadlineDate < now;
      const isNearDeadline = deadlineDate && deadlineDate < new Date(now.getTime() + 24 * 60 * 60 * 1000) && !isLate;
      
      const isProcessed = order.subStatus === 'printed' || order.subStatus === 'packed';

      return (
        <div className="flex flex-col items-center justify-center space-y-2 w-full">
           <div className="flex flex-col items-center">
              <CarrierLogo name={order.shippingCarrier || ''} />
              {order.trackingCode && <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded mt-0.5">{order.trackingCode}</div>}
           </div>
           
           <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border whitespace-nowrap uppercase ${isProcessed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
             <Clock size={10} /> {isProcessed ? 'Đã đóng gói / Chờ lấy' : 'Chờ xử lý / In đơn'}
           </div>
           
           {order.shipByDate && (
             <div className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 w-full justify-center ${isLate ? 'bg-red-50 text-red-600 border-red-100 font-bold animate-pulse' : isNearDeadline ? 'bg-orange-50 text-orange-600 border-orange-100 font-medium' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {isLate && <AlertTriangle size={10} />}
                <span>Hạn: {order.shipByDate}</span>
             </div>
           )}

           <div className="flex gap-2 w-full mt-1">
              <button 
                onClick={() => handleOpenProcessModal(order)}
                className="w-full bg-indigo-600 text-white text-[10px] py-2 rounded hover:bg-indigo-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Package size={14} /> {isProcessed ? 'In lại / Xem' : 'Xử lý đơn hàng'}
              </button>
           </div>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
           {order.shippingCarrier && <div className="grayscale opacity-60"><CarrierLogo name={order.shippingCarrier} /></div>}
           <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border whitespace-nowrap uppercase ${
             order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
             order.status === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-200' :
             order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
             'bg-slate-100 text-slate-700 border-slate-200'
           }`}>
             {order.status === 'delivered' ? <CheckSquare size={12}/> : order.status === 'cancelled' ? <XCircle size={12}/> : <Truck size={12}/>}
             {order.status === 'delivered' ? 'Giao thành công' : order.status === 'shipping' ? 'Đang giao' : order.status === 'cancelled' ? 'Đã hủy' : order.status === 'returned' ? 'Trả hàng' : order.status}
           </div>
        </div>
    );
  };

  // ... (Keep existing modal renderers: renderSyncResultModal, renderProcessOrderModal, renderConfirmOrderModal, renderOrderDetailModal, renderBulkProcessModal, renderBulkPrintModal, renderExportModal) ...
  // [Due to XML length limit, assume all other modal rendering functions are preserved identically from previous version but accessing the new tab logic]

  const renderSyncResultModal = () => {
    if (!syncResult) return null;
    return (
      <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
           <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${syncResult.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {syncResult.status === 'success' ? <CheckCircle2 size={32}/> : <AlertTriangle size={32}/>}
           </div>
           <h3 className="font-bold text-lg text-slate-800 mb-2">{syncResult.status === 'success' ? 'Đồng bộ thành công' : 'Đồng bộ thất bại'}</h3>
           <p className="text-sm text-slate-500 mb-6">{syncResult.msg}</p>
           <button 
             onClick={() => setSyncResult(null)}
             className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
           >
             Đóng
           </button>
        </div>
      </div>
    );
  };

  const renderProcessOrderModal = () => {
    if (!processModalData.isOpen || !processModalData.order) return null;
    const { order } = processModalData;

    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl text-slate-800">Xử lý đơn hàng</h3>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-sm">{order.id}</span>
             </div>
             <button onClick={() => setProcessModalData({ isOpen: false, order: null })} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
             {/* Left: Summary */}
             <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-200 overflow-y-auto">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Package size={18}/> Sản phẩm</h4>
                <div className="space-y-3 mb-6">
                   {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-slate-200">
                         <img src={item.image} className="w-12 h-12 rounded object-cover border border-slate-100"/>
                         <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-800 line-clamp-2">{item.name}</div>
                            <div className="text-xs text-slate-500 mt-1">x{item.quantity} | {item.variant}</div>
                         </div>
                      </div>
                   ))}
                </div>
                
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Truck size={18}/> Vận chuyển</h4>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Đơn vị:</span>
                      <span className="font-medium text-slate-800">{order.shippingCarrier}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Mã vận đơn:</span>
                      <span className="font-mono font-bold text-indigo-600">{order.trackingCode || 'Đang tạo...'}</span>
                   </div>
                   <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                      <span className="text-slate-500">Thu hộ (COD):</span>
                      <span className="font-bold text-slate-800">{order.isCOD ? formatCurrency(order.total) : '0 ₫'}</span>
                   </div>
                </div>
             </div>

             {/* Right: Actions */}
             <div className="flex-1 p-6 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <button onClick={() => alert("Đang in phiếu giao hàng A6...")} className="flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all group">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         <Printer size={24}/>
                      </div>
                      <span className="font-bold text-slate-700">In Phiếu Giao (A6)</span>
                   </button>
                   <button onClick={() => alert("Đang in phiếu xuất kho A4...")} className="flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all group">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         <FileText size={24}/>
                      </div>
                      <span className="font-bold text-slate-700">In Phiếu Xuất (A4)</span>
                   </button>
                   <button onClick={() => alert("Đang in hóa đơn bán lẻ...")} className="flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all group">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         <Receipt size={24}/>
                      </div>
                      <span className="font-bold text-slate-700">In Hóa Đơn</span>
                   </button>
                   <button onClick={() => alert("Đã gửi thông báo cho khách!")} className="flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all group">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         <User size={24}/>
                      </div>
                      <span className="font-bold text-slate-700">Nhắn tin cho Khách</span>
                   </button>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                   <button 
                      onClick={() => {
                         // Update subStatus to 'packed' on confirm
                         setOrders(prev => prev.map(o => o.id === order.id ? {...o, subStatus: 'packed'} : o));
                         alert("Đã cập nhật trạng thái: Đã đóng gói & Sẵn sàng giao");
                         setProcessModalData({ isOpen: false, order: null });
                      }}
                      className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-3"
                   >
                      <Box size={24}/> Hoàn tất đóng gói
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmOrderModal = () => {
    if (!confirmModalData.isOpen) return null;
    const count = confirmModalData.orderIds.length;
    // Calculate 2 days later for default dropoff deadline example
    const dropoffDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
             <h3 className="font-bold text-xl text-slate-800">Xác nhận đơn hàng</h3>
             <button onClick={() => setConfirmModalData({isOpen: false, orderIds: []})} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>

          <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
             <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><Truck size={16}/> Phương thức giao hàng</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                        onClick={() => setPickupMethod('pickup')}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                            pickupMethod === 'pickup' 
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                            : 'border-slate-200 bg-white hover:border-indigo-200'
                        }`}
                        >
                        <div className={`p-2 rounded-lg ${pickupMethod === 'pickup' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Truck size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Lấy hàng tại nhà</div>
                            <div className="text-xs text-slate-500 mt-1">ĐVVC đến địa chỉ kho lấy hàng</div>
                        </div>
                        </div>

                        <div 
                        onClick={() => setPickupMethod('dropoff')}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                            pickupMethod === 'dropoff' 
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                            : 'border-slate-200 bg-white hover:border-indigo-200'
                        }`}
                        >
                        <div className={`p-2 rounded-lg ${pickupMethod === 'dropoff' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Building size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Gửi hàng tại bưu cục</div>
                            <div className="text-xs text-slate-500 mt-1">Mang hàng ra bưu cục gần nhất</div>
                        </div>
                        </div>
                    </div>
                </div>

                <div>
                    {pickupMethod === 'pickup' ? (
                        <>
                            <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><Calendar size={16}/> Thời gian lấy hàng</h4>
                            <div className="space-y-3">
                                <div 
                                    onClick={() => setPickupTimeMode('asap')}
                                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                                        pickupTimeMode === 'asap' 
                                        ? 'border-indigo-500 bg-white ring-1 ring-indigo-500' 
                                        : 'border-slate-200 bg-white hover:border-indigo-200'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        checked={pickupTimeMode === 'asap'} 
                                        readOnly
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Lấy hàng sớm nhất có thể</span>
                                </div>

                                <div 
                                    onClick={() => setPickupTimeMode('scheduled')}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        pickupTimeMode === 'scheduled' 
                                        ? 'border-indigo-500 bg-white ring-1 ring-indigo-500' 
                                        : 'border-slate-200 bg-white hover:border-indigo-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <input 
                                            type="radio" 
                                            checked={pickupTimeMode === 'scheduled'} 
                                            readOnly
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Hẹn giờ lấy hàng</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pl-7">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Ngày lấy hàng</label>
                                            <input 
                                                type="date"
                                                disabled={pickupTimeMode !== 'scheduled'}
                                                value={pickupDate}
                                                onChange={(e) => setPickupDate(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Khung giờ</label>
                                            <select
                                                disabled={pickupTimeMode !== 'scheduled'}
                                                value={pickupScheduledTime}
                                                onChange={(e) => setPickupScheduledTime(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                                            >
                                                {pickupSlots.map((slot, index) => (
                                                    <option key={index} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 text-sm animate-fade-in">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Lưu ý hạn chót gửi hàng</h4>
                            <p>Vui lòng mang hàng ra bưu cục trước <strong>{dropoffDeadline}</strong> để tránh bị phạt quá hạn.</p>
                        </div>
                    )}
                </div>
             </div>

             <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-700 flex justify-between items-center">
                   <span>Danh sách đơn hàng ({count})</span>
                </div>
                <div className="max-h-[150px] overflow-y-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 border-b border-slate-100 sticky top-0">
                         <tr>
                            <th className="px-4 py-2 font-medium">Gian hàng</th>
                            <th className="px-4 py-2 font-medium">Mã đơn hàng</th>
                            <th className="px-4 py-2 font-medium">Đơn vị vận chuyển</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {confirmModalData.orderIds.map(id => {
                            const order = orders.find(o => o.id === id);
                            if (!order) return null;
                            const shopName = INITIAL_INTEGRATIONS.flatMap(i => i.shops).find(s => s.id === order.shopId)?.name || 'Shop chưa xác định';
                            return (
                               <tr key={id}>
                                  <td className="px-4 py-3">{shopName}</td>
                                  <td className="px-4 py-3 font-medium text-blue-600">{id}</td>
                                  <td className="px-4 py-3">{order.shippingCarrier || 'Chưa chọn'}</td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
             <button onClick={() => setConfirmModalData({isOpen: false, orderIds: []})} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50">
                Thoát
             </button>
             <button onClick={executeConfirmOrder} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm">
                Xác nhận
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetailModal = () => {
    if (!selectedOrderDetail) return null;
    const order = selectedOrderDetail;

    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div>
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                   Chi tiết đơn hàng <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">#{order.id}</span>
                </h3>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                   <span>Ngày đặt: {order.date}</span>
                   <span>•</span>
                   <span className="font-medium text-slate-700">{order.platform}</span>
                </div>
             </div>
             <button onClick={() => setSelectedOrderDetail(null)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100">
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Customer & Shipping */}
                <div className="space-y-6">
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <User size={18} className="text-indigo-600"/> Thông tin khách hàng
                      </h4>
                      <div className="space-y-3 text-sm">
                         <div>
                            <div className="text-slate-500 text-xs uppercase font-bold mb-0.5">Họ tên</div>
                            <div className="font-bold text-slate-800">{order.customerName}</div>
                         </div>
                         <div>
                            <div className="text-slate-500 text-xs uppercase font-bold mb-0.5">Số điện thoại</div>
                            <div className="font-medium text-slate-700">{order.customerPhone || '09xx xxx xxx'} <span className="text-green-600 text-[10px] bg-green-50 px-1 rounded ml-1">Đã xác minh</span></div>
                         </div>
                         <div>
                            <div className="text-slate-500 text-xs uppercase font-bold mb-0.5 flex items-center gap-1"><MapPin size={12}/> Địa chỉ nhận hàng</div>
                            <div className="text-slate-600 leading-relaxed">{order.address || '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh'}</div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Truck size={18} className="text-indigo-600"/> Vận chuyển
                      </h4>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Đơn vị:</span>
                            <div className="flex items-center gap-2">
                               {order.shippingCarrier && <CarrierLogo name={order.shippingCarrier}/>}
                            </div>
                         </div>
                         <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Mã vận đơn:</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{order.trackingCode || 'Chưa có'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Phương thức:</span>
                            <span className={`font-bold ${order.shippingMethod === 'Hỏa tốc' ? 'text-red-600' : order.shippingMethod === 'Trong ngày' ? 'text-indigo-600' : 'text-slate-700'}`}>
                               {order.shippingMethod || 'Tiêu chuẩn'}
                            </span>
                         </div>
                         {order.shipByDate && (
                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-1">
                               <Clock size={12}/> Hạn giao hàng: <strong>{order.shipByDate}</strong>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Right Column: Products & Payment */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Package size={18} className="text-indigo-600"/> Danh sách sản phẩm
                      </h4>
                      <div className="space-y-4">
                         {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                               <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                </div>
                               <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-slate-800 text-sm line-clamp-2">{item.name}</h5>
                                  <div className="text-xs text-slate-500 mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                                     Phân loại: {item.variant || 'Mặc định'} | SKU: {item.sku}
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="font-bold text-slate-800 text-sm">{formatCurrency(item.price)}</div>
                                  <div className="text-xs text-slate-500">x{item.quantity}</div>
                                  <div className="font-bold text-indigo-600 text-sm mt-1">{formatCurrency(item.price * item.quantity)}</div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Receipt size={18} className="text-indigo-600"/> Chi tiết thanh toán & Lợi nhuận
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Revenue Side */}
                         <div className="space-y-2 text-sm border-r border-slate-100 pr-4">
                            <div className="flex justify-between text-slate-600">
                               <span>Tổng tiền hàng</span>
                               <span className="font-medium">{formatCurrency(order.total - order.shippingFee)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                               <span>Phí vận chuyển (Khách trả)</span>
                               <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                               <span>Giảm giá/Voucher</span>
                               <span className="text-red-500 font-medium">-0 ₫</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                               <span className="font-bold text-slate-800 text-base">Khách phải trả</span>
                               <span className="font-extrabold text-indigo-600 text-lg">{formatCurrency(order.total)}</span>
                            </div>
                            <div className="text-xs text-slate-400 text-right mt-1">
                               {order.isCOD ? 'Thanh toán khi nhận hàng (COD)' : 'Đã thanh toán Online'}
                            </div>
                         </div>

                         {/* Cost & Profit Side */}
                         <div className="space-y-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between text-slate-500 text-xs">
                               <span>Phí cố định sàn (5%)</span>
                               <span className="text-red-500">-{formatCurrency(order.platformFee)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-xs">
                               <span>Phí dịch vụ (Extra)</span>
                               <span className="text-red-500">-0 ₫</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-xs border-b border-slate-200 pb-2">
                               <span>Thuế (1.5%)</span>
                               <span className="text-red-500">-{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                               <span className="font-bold text-green-700 flex items-center gap-1"><DollarSign size={14}/> Lợi nhuận ròng</span>
                               <span className="font-bold text-green-600 text-base">+{formatCurrency(order.profit)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
             <button onClick={() => alert("Đang in phiếu giao hàng...")} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2">
                <Printer size={16}/> In phiếu giao
             </button>
             <button onClick={() => alert("Đang in hóa đơn...")} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2">
                <FileSpreadsheet size={16}/> In hóa đơn
             </button>
             {order.status === 'pending' && (
                <button 
                   onClick={() => {
                      handleOpenConfirmModal(order.id);
                      setSelectedOrderDetail(null);
                   }}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                >
                   <CheckCircle2 size={16}/> Xác nhận đơn
                </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderBulkProcessModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                    <Package size={20} className="text-indigo-600"/> Xử lý hàng loạt
                </h3>
                <button onClick={() => setBulkAction(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6">
                {bulkProgress > 0 ? (
                    <div className="text-center py-8">
                        <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4"/>
                        <h4 className="font-bold text-slate-800 text-lg mb-2">Đang xử lý...</h4>
                        <p className="text-slate-500 text-sm mb-4">Vui lòng không tắt trình duyệt</p>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all duration-300" style={{width: `${bulkProgress}%`}}></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm font-bold text-lg">
                                {selectedOrderIds.size}
                            </div>
                            <div className="text-sm text-indigo-900">
                                Đơn hàng sẽ được chuyển sang trạng thái <br/> <strong>Chờ lấy hàng / Đã đóng gói</strong>
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input type="radio" name="action" defaultChecked className="w-4 h-4 text-indigo-600"/>
                                <span className="text-sm font-medium">Chuẩn bị hàng (Có in phiếu)</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 mt-2">
                                <input type="radio" name="action" className="w-4 h-4 text-indigo-600"/>
                                <span className="text-sm font-medium">Chuẩn bị hàng (Không in)</span>
                            </label>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setBulkAction(null)} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Hủy</button>
                            <button onClick={executeBulkProcess} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Xác nhận</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderBulkPrintModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Printer size={20} className="text-slate-600"/> In phiếu hàng loạt
                </h3>
                <button onClick={() => setBulkAction(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer relative">
                        <div className="absolute top-2 right-2 text-indigo-600"><CheckCircle2 size={16}/></div>
                        <div className="font-bold text-indigo-900 mb-1">Phiếu Gửi (A6)</div>
                        <div className="text-xs text-indigo-700">Khổ chuẩn Shopee/Lazada (100x150mm)</div>
                    </div>
                    <div className="p-4 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer bg-white">
                        <div className="font-bold text-slate-700 mb-1">Phiếu Gửi (A5)</div>
                        <div className="text-xs text-slate-500">In 2 đơn trên 1 tờ A4</div>
                    </div>
                    <div className="p-4 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer bg-white">
                        <div className="font-bold text-slate-700 mb-1">Phiếu Xuất Kho</div>
                        <div className="text-xs text-slate-500">Danh sách sản phẩm cần nhặt (A4)</div>
                    </div>
                    <div className="p-4 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer bg-white">
                        <div className="font-bold text-slate-700 mb-1">Tem Dán (Nhỏ)</div>
                        <div className="text-xs text-slate-500">Chỉ mã vận đơn (50x50mm)</div>
                    </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800">Lưu ý:</strong> Hệ thống sẽ tự động ghép các đơn cùng đơn vị vận chuyển để tối ưu trang in.
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setBulkAction(null)} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Hủy</button>
                    <button onClick={executeBulkPrint} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg">In ngay ({selectedOrderIds.size} đơn)</button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderExportModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-green-50">
                <h3 className="font-bold text-green-800 text-lg flex items-center gap-2">
                    <FileOutput size={20} className="text-green-600"/> Xuất dữ liệu
                </h3>
                <button onClick={() => setBulkAction(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6 space-y-4">
                <button onClick={() => executeExport('excel')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><FileSpreadsheet size={20}/></div>
                        <div className="text-left">
                            <div className="font-bold text-slate-800 group-hover:text-green-800">Excel (.xlsx)</div>
                            <div className="text-xs text-slate-500">Đầy đủ định dạng, dễ chỉnh sửa</div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-green-600"/>
                </button>

                <button onClick={() => executeExport('csv')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Settings size={20}/></div>
                        <div className="text-left">
                            <div className="font-bold text-slate-800">CSV (Comma separated)</div>
                            <div className="text-xs text-slate-500">Dữ liệu thô, dung lượng nhẹ</div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300"/>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 font-sans text-slate-800 flex flex-col h-full animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 shrink-0">
         <div className="flex items-center gap-3">
           <h2 className="text-xl md:text-2xl font-bold">Quản lý Đơn hàng TMĐT</h2>
           <span className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">{tabCounts.all} đơn</span>
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={handleSyncOrders}
                disabled={isSyncing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:bg-indigo-400"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> 
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ đơn sàn'}
            </button>
         </div>
      </div>

      {/* Main Tabs with Counts */}
      <div className="bg-white rounded-xl border border-slate-200 sticky top-0 z-10 shadow-sm shrink-0 overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-4 text-sm font-bold border-b-4 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4 shrink-0">
         <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            {/* Action Buttons Group */}
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => {
                        if(selectedOrderIds.size === 0) return alert("Vui lòng chọn ít nhất 1 đơn hàng.");
                        setBulkAction('process');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
                >
                    <Package size={16} /> Xử lý hàng loạt
                </button>
                <button 
                    onClick={() => {
                        if(selectedOrderIds.size === 0) return alert("Vui lòng chọn ít nhất 1 đơn hàng.");
                        setBulkAction('print');
                    }}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
                >
                    <Printer size={16} /> In phiếu hàng loạt
                </button>
                <button 
                    onClick={() => setBulkAction('export')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
                >
                    <FileOutput size={16} /> Xuất dữ liệu
                </button>
            </div>
            
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto ml-auto flex-wrap justify-end">
               <button 
                 onClick={() => setSelectedPlatform(selectedPlatform === 'Manual' ? 'all' : 'Manual')}
                 className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                   selectedPlatform === 'Manual' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-600'
                 }`}
               >
                 <PenTool size={14} /> Đơn thủ công
               </button>

               <button 
                 onClick={() => setShowExpressOnly(!showExpressOnly)}
                 className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                   showExpressOnly ? 'bg-red-600 border-red-600 text-white shadow-md animate-pulse' : 'bg-white border-slate-300 text-slate-600'
                 }`}
               >
                 <Zap size={14} fill={showExpressOnly ? "currentColor" : "none"} /> Hỏa Tốc
               </button>

               <div className="flex gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="flex-1 sm:w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Tất cả ĐVVC</option>
                    {availableCarriers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="flex-1 sm:w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Tất cả Shop</option>
                    {availableShops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                    value={selectedPlatform === 'Manual' ? 'all' : selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value as any)}
                    className="flex-1 sm:w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Tất cả sàn</option>
                    {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
               </div>

               <div className="relative w-full sm:w-48">
                 <input 
                    type="text" 
                    placeholder="Tìm đơn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all focus:bg-white"
                 />
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               </div>
            </div>
         </div>
      </div>

      {/* Orders Container */}
      <div className="flex-1">
         {currentItems.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <ShoppingBag size={64} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Không có đơn hàng nào khớp với bộ lọc</p>
              <button onClick={() => { setActiveTab('all'); setSearchTerm(''); setSelectedPlatform('all'); }} className="mt-4 text-indigo-600 font-bold hover:underline text-sm">Xóa tất cả bộ lọc</button>
           </div>
         ) : (
           <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
             <table className="w-full text-sm text-left min-w-[1200px]">
               <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs">
                 <tr>
                   <th className="px-4 py-3 w-10">
                     <input 
                       type="checkbox" 
                       checked={selectedOrderIds.size === currentItems.length && currentItems.length > 0} 
                       onChange={toggleSelectAll} 
                       className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                     />
                   </th>
                   <th className="px-4 py-3 font-medium">Thông tin sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Ghi chú</th>
                   <th className="px-4 py-3 font-medium">Giá trị đơn hàng<br/>& Thanh toán</th>
                   <th className="px-4 py-3 font-medium">Đơn hàng &<br/>Người mua</th>
                   <th className="px-4 py-3 font-medium">Thời gian</th>
                   <th className="px-4 py-3 font-medium">Cài đặt vận chuyển<br/>& Mã vận đơn</th>
                 </tr>
               </thead>
               {currentItems.map(order => {
                 const shopName = INITIAL_INTEGRATIONS.flatMap(i => i.shops).find(s => s.id === order.shopId)?.name || 'Shop';
                 const maskedName = order.customerName.length > 2 
                   ? order.customerName.substring(0, 1) + '******' + order.customerName.substring(order.customerName.length - 1)
                   : order.customerName;
                 const city = order.address?.split(',').pop()?.trim() || 'TP. Hồ Chí Minh';
                 const buyerUsername = order.customerName.split(' ')[0].toLowerCase() + '123';
                 
                 const isExpanded = expandedOrderIds.has(order.id);
                 const visibleItems = isExpanded ? order.items : order.items.slice(0, 1);
                 const hiddenCount = order.items.length - 1;
                 const isExpress = order.shippingMethod === 'Hỏa tốc';
                 const isSameDay = order.shippingMethod === 'Trong ngày';
                  const hoverBgClass = isExpress ? 'hover:bg-red-50/60' : isSameDay ? 'hover:bg-blue-50/60' : 'hover:bg-slate-100/60';
                 
                 return (
                   <tbody key={order.id} className={`group ${hoverBgClass} transition-colors ${isExpress ? 'border-l-4 border-l-red-500' : isSameDay ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
                     {/* Sub-header row */}
                     <tr className="bg-slate-50/40 group-hover:bg-transparent transition-colors border-t border-slate-100">
                         <td className="px-4 py-2 border-b border-slate-100">
                           <input 
                             type="checkbox" 
                             checked={selectedOrderIds.has(order.id)} 
                             onChange={() => toggleSelectOrder(order.id)}
                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                           />
                         </td>
                         <td colSpan={6} className="px-4 py-2 border-b border-slate-100 font-medium text-slate-700 text-xs">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center">
                               <div className="flex items-center gap-1.5 mr-6 text-slate-600">
                                 <PlatformIcon platform={order.platform} />
                                 <span className="font-semibold">{shopName}</span>
                               </div>
                               {(activeTab === 'processing_unprocessed' || activeTab === 'processing_processed') && (
                                 <button className={`mr-6 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.subStatus === 'unprocessed' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}>
                                   {order.subStatus === 'unprocessed' ? 'Đơn chưa in' : 'Đơn đã in'}
                                 </button>
                               )}
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded border border-transparent hover:border-indigo-200 transition-colors" title="In phiếu"><Printer size={16} /></button>
                                 <button onClick={() => setSelectedOrderDetail(order)} className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded border border-transparent hover:border-indigo-200 transition-colors" title="Xem chi tiết"><FileText size={16} /></button>
                                 <button onClick={() => handleOpenProcessModal(order)} className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded border border-transparent hover:border-indigo-200 transition-colors" title="Xử lý"><Package size={16} /></button>
                                 <button className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded border border-transparent hover:border-indigo-200 transition-colors" title="Hủy"><XCircle size={16} /></button>
                                 <button onClick={() => handleSingleSync(order.id)} className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded border border-transparent hover:border-indigo-200 transition-colors" title="Đồng bộ">
                                   <RefreshCw size={16} className={singleSyncingId === order.id ? "animate-spin" : ""} />
                                 </button>
                               </div>
                             </div>
                             <div className="text-right flex items-center gap-2">
                               {isExpress && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Hỏa tốc</span>}
                               {isSameDay && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Trong ngày</span>}
                             </div>
                           </div>
                         </td>
                       </tr>
                       {/* Content row */}
                       <tr>
                         <td className="px-4 py-4"></td>
                         <td className="px-4 py-4 align-top">
                           <div className="space-y-3">
                             {visibleItems.map((item, idx) => (
                               <div key={idx} className="flex gap-4">
                                 <img src={item.image} className="w-16 h-16 rounded border border-slate-200 object-cover shrink-0" alt={item.name} />
                                 <div className="min-w-0">
                                   <div className="text-indigo-600 hover:underline cursor-pointer line-clamp-2 text-sm font-medium leading-tight">{item.name}</div>
                                   <div className="text-slate-500 text-xs mt-1">{item.variant}</div>
                                   <div className="text-slate-700 text-sm mt-1">
                                     {formatCurrency(item.price)} <span className="text-slate-400 mx-1">x</span> <span className="text-orange-500 font-bold text-base">{item.quantity}</span>
                                   </div>
                                 </div>
                               </div>
                             ))}
                             {order.items.length > 1 && (
                               <button 
                                   onClick={() => toggleOrderExpand(order.id)}
                                   className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 pt-1 transition-colors"
                               >
                                   {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                   {isExpanded ? 'Thu gọn' : `Xem thêm ${hiddenCount} sản phẩm khác`}
                               </button>
                             )}
                           </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                           <div className="text-xs text-slate-600 max-w-[150px] line-clamp-3" title={order.notes}>
                             {order.notes || '-'}
                           </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                           <div className="text-xs space-y-1 min-w-[140px]">
                             <div className="flex justify-between gap-2">
                               <span className="text-slate-500">Giá bán:</span>
                               <span className="text-slate-700 font-medium">{formatCurrency(order.total)}</span>
                             </div>
                             <div className="flex justify-between gap-2">
                               <span className="text-slate-500">Giá nhập:</span>
                               <span className="text-slate-700">{formatCurrency(order.total - order.profit)}</span>
                             </div>
                             <div className="flex justify-between gap-2 border-t border-slate-100 pt-1 mt-1">
                               <span className="text-slate-500">Lợi nhuận:</span>
                               <span className="text-green-600 font-medium">{formatCurrency(order.profit)}</span>
                             </div>
                             <div className="flex justify-between gap-2">
                               <span className="text-slate-500">Biên LN:</span>
                               <span className="text-green-500 font-medium">{((order.profit / order.total) * 100).toFixed(2)}%</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                           <div className="text-xs space-y-1.5">
                             <div className="text-indigo-600 hover:underline cursor-pointer font-bold text-sm">{order.id.replace('ORD-', '')}</div>
                             <div className="flex items-center gap-1.5">
                               <div className="text-slate-800 font-medium">{buyerUsername}</div>
                               <MessageSquareQuote size={16} className="text-indigo-500 cursor-pointer hover:text-indigo-700" title="Nhắn tin" />
                             </div>
                             <div className="text-slate-500">{maskedName}</div>
                             <div className="text-slate-500">{city}</div>
                           </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                           <div className="text-xs text-slate-500">
                             <div>Created</div>
                             <div className="text-slate-700 mb-2">{order.date}</div>
                             <div>Expire<span className="text-slate-400 cursor-help" title="Hạn chót xử lý">?</span></div>
                             <div className="text-slate-700">{order.shipByDate || 'Không có'}</div>
                             {order.shipByDate && (
                               <div className="text-orange-500 mt-0.5 font-medium">Hết hạn trong 20 Tiếng</div>
                             )}
                           </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                           <div className="text-xs">
                             <div className="text-indigo-600 font-medium mb-1.5 text-sm">{order.trackingCode || '1773063584700-1'}</div>
                             <div className="text-slate-700">{order.platform}-VN-{order.shippingCarrier?.replace(' ', '') || 'SPX'}</div>
                             <div className="text-indigo-600 mt-1 flex items-center gap-1 cursor-pointer hover:underline font-medium">
                               [ Ship đến lấy ] <PenTool size={12} />
                             </div>
                             <div className="text-indigo-600 mt-1 cursor-pointer hover:underline">Thêm thông tin lấy hàng</div>
                           </div>
                         </td>
                       </tr>
                     </tbody>
                   );
                 })}
               </table>
           </div>
         )}
      </div>

      {/* Pagination Footer */}
      {filteredOrders.length > 0 && (
          <div className="px-6 py-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shrink-0">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
               Hiển thị <span className="text-indigo-600">{indexOfFirstItem + 1}</span> - <span className="text-indigo-600">{Math.min(indexOfLastItem, filteredOrders.length)}</span> trên <span className="text-slate-800">{filteredOrders.length}</span> kết quả
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 disabled={currentPage === 1}
                 className="p-2.5 rounded-xl border-2 border-slate-100 bg-white text-slate-600 disabled:opacity-30 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
               >
                 <ChevronLeft size={20} />
               </button>
               <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-600">
                 Trang {currentPage} / {totalPages}
               </div>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages}
                 className="p-2.5 rounded-xl border-2 border-slate-100 bg-white text-slate-600 disabled:opacity-30 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
               >
                 <ChevronRight size={20} />
               </button>
             </div>
          </div>
        )}

      {/* --- Global Modals --- */}
      
      {bulkAction === 'process' && renderBulkProcessModal()}
      {bulkAction === 'print' && renderBulkPrintModal()}
      {bulkAction === 'export' && renderExportModal()}
      
      {/* Order Detail Modal */}
      {renderOrderDetailModal()}

      {/* Sync Result Popup */}
      {renderSyncResultModal()}

      {/* Confirm Order Modal with Pickup Method */}
      {renderConfirmOrderModal()}

      {/* Process Order Modal */}
      {renderProcessOrderModal()}

    </div>
  );
};

export default OrderList;
