
import React, { useState, useMemo } from 'react';
import { ExternalProduct, ProductSyncLog, Platform, Product } from '../types';
import { MOCK_EXTERNAL_PRODUCTS, MOCK_PRODUCT_SYNC_HISTORY, INITIAL_INTEGRATIONS, MOCK_PRODUCTS } from '../services/mockData';
import { 
  RefreshCw, Filter, Search, Link as LinkIcon, History, 
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, X, Loader2, Store, ChevronDown, Wrench, Settings, Globe, Plus, ArrowLeft, Save, Copy, Rocket, CheckSquare, Square, ChevronUp, Package, Clock, Edit
} from 'lucide-react';

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const EcommerceProducts: React.FC = () => {
  const [products, setProducts] = useState<ExternalProduct[]>(MOCK_EXTERNAL_PRODUCTS);
  const [syncHistory, setSyncHistory] = useState<ProductSyncLog[]>(MOCK_PRODUCT_SYNC_HISTORY);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null); // 'all' or product ID
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  
  // Multi-select Shop State
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  
  // Sync Progress Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [syncedCount, setSyncedCount] = useState(0);

  // Error Fix Modal State
  const [fixProduct, setFixProduct] = useState<ExternalProduct | null>(null);
  const [fixStep, setFixStep] = useState<'menu' | 'link' | 'create'>('menu');
  const [isFixing, setIsFixing] = useState(false);
  
  // Link Manual State
  const [linkSearchTerm, setLinkSearchTerm] = useState('');
  
  // Create New State
  const [createFormData, setCreateFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    stock: 0
  });

  // Get all available shop IDs for "Select All" logic
  const allShopIds = useMemo(() => {
      return INITIAL_INTEGRATIONS.flatMap(i => i.shops.map(s => s.id));
  }, []);

  const isAllSelected = selectedShopIds.length === allShopIds.length && allShopIds.length > 0;

  const toggleShopSelection = (shopId: string) => {
      setSelectedShopIds(prev => 
          prev.includes(shopId) 
              ? prev.filter(id => id !== shopId) 
              : [...prev, shopId]
      );
  };

  const toggleSelectAllShops = () => {
      if (isAllSelected) {
          setSelectedShopIds([]);
      } else {
          setSelectedShopIds(allShopIds);
      }
  };

  const toggleExpandRow = (id: string) => {
      setExpandedRowIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
    const matchShop = filterShop === 'all' || p.shopId === filterShop;
    const matchStatus = filterStatus === 'all' || p.syncStatus === filterStatus;
    return matchSearch && matchPlatform && matchShop && matchStatus;
  });

  const stats = {
    total: products.length,
    synced: products.filter(p => p.syncStatus === 'synced').length,
    unsynced: products.filter(p => p.syncStatus === 'unsynced').length,
    error: products.filter(p => p.syncStatus === 'error').length
  };

  const handleOpenFixModal = (product: ExternalProduct) => {
      setFixProduct(product);
      setFixStep('menu');
      setLinkSearchTerm('');
      setCreateFormData({
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock
      });
  };

  const handleSync = (productId: string) => {
    setIsSyncing(productId);
    setTimeout(() => {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            syncStatus: 'synced',
            lastSyncAt: new Date().toLocaleString('vi-VN'),
            errorMsg: undefined
          };
        }
        return p;
      }));
      setIsSyncing(null);
    }, 1500);
  };

  const handleBulkSync = () => {
    if (selectedShopIds.length === 0) return alert("Vui lòng chọn ít nhất 1 gian hàng để đồng bộ.");
    
    // Setup Modal
    setShowSyncModal(true);
    setSyncStatus('processing');
    setSyncProgress(0);
    setSyncedCount(0);
    setIsShopDropdownOpen(false); // Close dropdown if open
    
    const isFullSync = selectedShopIds.length === allShopIds.length;
    const shopName = isFullSync 
        ? 'Tất cả gian hàng' 
        : `${selectedShopIds.length} gian hàng đã chọn`;

    // Simulate bulk sync with interval for progress bar
    const totalTime = 2500; // 2.5 seconds
    const intervalTime = 50;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setSyncProgress(progress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setSyncStatus('success');
        
        // Mock Item Count based on selection
        const itemsCount = isFullSync ? 350 : selectedShopIds.length * 45;
        setSyncedCount(itemsCount);

        // Mock log entry
        const newLog: ProductSyncLog = {
          id: `log-${Date.now()}`,
          shopId: isFullSync ? 'all' : 'multi',
          shopName: shopName,
          platform: isFullSync ? Platform.SHOPEE : Platform.SHOPEE, // Just a placeholder for multi-platform
          totalItems: itemsCount,
          syncedItems: Math.floor(itemsCount * 0.95),
          failedItems: Math.ceil(itemsCount * 0.05),
          status: 'partial',
          performedBy: 'Admin',
          timestamp: new Date().toLocaleString('vi-VN')
        };
        
        setSyncHistory(prev => [newLog, ...prev]);
        
        // Mock update product list timestamps
        if (!isFullSync) {
            setProducts(prev => prev.map(p => selectedShopIds.includes(p.shopId) ? {...p, lastSyncAt: 'Vừa xong'} : p));
        } else {
            setProducts(prev => prev.map(p => ({...p, lastSyncAt: 'Vừa xong'})));
        }
      }
    }, intervalTime);
  };

  const executeFixAction = (action: 'link' | 'create' | 'ignore', targetId?: string) => {
    if (!fixProduct) return;
    setIsFixing(true);
    
    setTimeout(() => {
        setIsFixing(false);
        setProducts(prev => prev.map(p => {
            if (p.id === fixProduct.id) {
                if (action === 'link' || action === 'create') {
                    return {
                        ...p,
                        syncStatus: 'synced',
                        errorMsg: undefined,
                        lastSyncAt: 'Vừa xong',
                        linkedProductId: targetId // Store the ID of the linked product
                    };
                }
            }
            return p;
        }));
        setFixProduct(null);
    }, 800);
  };

  const renderSyncProgressModal = () => {
      if (!showSyncModal) return null;
      return (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 text-center relative">
                  {/* Decorative background circle */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${syncStatus === 'processing' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                      <div 
                        className={`h-full transition-all duration-300 ease-out ${syncStatus === 'processing' ? 'bg-indigo-600' : 'bg-green-500'}`} 
                        style={{ width: `${syncProgress}%` }}
                      ></div>
                  </div>

                  {syncStatus === 'processing' ? (
                      <>
                          <div className="relative w-20 h-20 mb-6 mt-4">
                              <svg className="animate-spin w-full h-full text-indigo-100" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600">
                                  {syncProgress}%
                              </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">Đang đồng bộ dữ liệu...</h3>
                          <p className="text-slate-500 text-sm mb-2">
                              Hệ thống đang tải dữ liệu mới nhất từ sàn.
                          </p>
                          <p className="text-xs text-indigo-500 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                              Vui lòng không tắt trình duyệt
                          </p>
                      </>
                  ) : (
                      <>
                          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mt-4 animate-bounce">
                              <CheckCircle2 size={40} strokeWidth={3} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">Đồng bộ hoàn tất!</h3>
                          <p className="text-slate-500 text-sm mb-6">
                              Đã cập nhật thông tin cho <strong>{syncedCount}</strong> sản phẩm.
                          </p>
                          <button 
                              onClick={() => setShowSyncModal(false)}
                              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
                          >
                              Đóng cửa sổ
                          </button>
                      </>
                  )}
              </div>
          </div>
      );
  };

  const renderFixModalContent = () => {
      if (!fixProduct) return null;
      if (fixStep === 'menu') {
          return (
            <div className="p-6 space-y-6">
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <img src={fixProduct.image} className="w-12 h-12 rounded object-cover border border-slate-200" />
                    <div>
                        <div className="font-bold text-sm text-slate-800 line-clamp-1">{fixProduct.name}</div>
                        <div className="text-xs text-slate-500 font-mono">SKU: {fixProduct.sku}</div>
                    </div>
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Nguyên nhân lỗi:</div>
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                        {fixProduct.errorMsg}
                    </div>
                </div>
                <div className="space-y-3">
                    <button onClick={() => setFixStep('link')} className="w-full p-3 border border-slate-200 rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><LinkIcon size={18} /></div>
                            <div><div className="font-bold text-slate-800 group-hover:text-indigo-700 text-sm">Liên kết thủ công</div><div className="text-xs text-slate-500">Chọn sản phẩm có sẵn trong kho để ghép đôi</div></div>
                        </div>
                        <ChevronDown className="-rotate-90 text-slate-300 group-hover:text-indigo-400" size={16}/>
                    </button>
                    <button onClick={() => setFixStep('create')} className="w-full p-3 border border-slate-200 rounded-xl text-left hover:bg-green-50 hover:border-green-200 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><Plus size={18} /></div>
                            <div><div className="font-bold text-slate-800 group-hover:text-green-700 text-sm">Tạo mới trên hệ thống</div><div className="text-xs text-slate-500">Tạo sản phẩm mới dùng thông tin từ sàn</div></div>
                        </div>
                        <ChevronDown className="-rotate-90 text-slate-300 group-hover:text-green-400" size={16}/>
                    </button>
                    <button onClick={() => setFixProduct(null)} className="w-full p-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><X size={18} /></div>
                            <div><div className="font-bold text-slate-800 text-sm">Bỏ qua lỗi này</div><div className="text-xs text-slate-500">Không hiển thị cảnh báo nữa</div></div>
                        </div>
                    </button>
                </div>
            </div>
          );
      }
      if (fixStep === 'link') {
          const linkCandidates = MOCK_PRODUCTS.filter(p => linkSearchTerm ? (p.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || p.sku.toLowerCase().includes(linkSearchTerm.toLowerCase())) : true).slice(0, 5);
          return (
              <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <button onClick={() => setFixStep('menu')} className="p-1 hover:bg-white rounded-full"><ArrowLeft size={18}/></button>
                      <h4 className="font-bold text-slate-800">Chọn sản phẩm để liên kết</h4>
                  </div>
                  <div className="p-4 border-b border-slate-100">
                      <div className="relative">
                          <input type="text" placeholder="Tìm tên hoặc SKU..." value={linkSearchTerm} onChange={(e) => setLinkSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                      {linkCandidates.length > 0 ? linkCandidates.map(p => (
                          <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer group border-b border-slate-50 last:border-0">
                              <img src={p.image} className="w-10 h-10 rounded border border-slate-200 object-cover bg-white"/>
                              <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-slate-800 truncate">{p.name}</div>
                                  <div className="text-xs text-slate-500">SKU: {p.sku} • Kho: {p.stock}</div>
                              </div>
                              <button onClick={() => executeFixAction('link', p.id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Chọn</button>
                          </div>
                      )) : <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy sản phẩm nào.</div>}
                  </div>
              </div>
          );
      }
      if (fixStep === 'create') {
          return (
              <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <button onClick={() => setFixStep('menu')} className="p-1 hover:bg-white rounded-full"><ArrowLeft size={18}/></button>
                      <h4 className="font-bold text-slate-800">Tạo sản phẩm mới</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div className="flex justify-center mb-4"><img src={fixProduct.image} className="w-24 h-24 rounded-lg border border-slate-200 object-cover shadow-sm"/></div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên sản phẩm</label>
                          <input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none font-medium" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã SKU</label>
                          <input type="text" value={createFormData.sku} onChange={(e) => setCreateFormData({...createFormData, sku: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none font-mono" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá bán</label><input type="number" value={createFormData.price} onChange={(e) => setCreateFormData({...createFormData, price: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none font-bold text-indigo-700" /></div>
                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tồn kho</label><input type="number" value={createFormData.stock} onChange={(e) => setCreateFormData({...createFormData, stock: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" /></div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                      <button onClick={() => executeFixAction('create')} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"><Save size={18}/> Xác nhận tạo</button>
                  </div>
              </div>
          );
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
      {/* Header with Enhanced Sync Action */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Sản phẩm TMĐT 
            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                <Globe size={12} /> Quản lý tập trung
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Đồng bộ và quản lý trạng thái sản phẩm từ tất cả các gian hàng Shopee, Lazada, TikTok Shop... tại một nơi duy nhất.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center relative z-10">
          <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200/50 flex items-center gap-2 pl-2 pr-1.5 flex-1 sm:flex-none transition-all hover:shadow-indigo-300 hover:scale-[1.01] relative">
             <div className="relative flex-1 sm:flex-none sm:w-64">
               {isShopDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsShopDropdownOpen(false)} />}
               <button 
                 onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                 className="w-full bg-white/10 text-white text-sm font-bold border-none focus:ring-0 cursor-pointer py-2.5 pl-10 pr-8 rounded-lg outline-none flex items-center justify-between hover:bg-white/20 transition-colors"
               >
                 <span className="truncate">
                    {selectedShopIds.length === 0 
                        ? 'Chọn gian hàng...' 
                        : isAllSelected 
                            ? 'Tất cả gian hàng'
                            : `${selectedShopIds.length} gian hàng`
                    }
                 </span>
                 <ChevronDown className={`text-indigo-200 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`} size={16} />
               </button>
               <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-100 pointer-events-none" size={18} />
               
               {isShopDropdownOpen && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto animate-fade-in custom-scrollbar">
                    {/* Select All Option */}
                    <button
                        onClick={toggleSelectAllShops}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-3 group border-b border-slate-50 font-bold ${isAllSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAllSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'}`}>
                            {isAllSelected && <CheckSquare size={14} className="text-white" />}
                        </div>
                        <span>Chọn tất cả gian hàng</span>
                    </button>

                    {INITIAL_INTEGRATIONS.map(integration => {
                        if (integration.shops.length === 0) return null;
                        return (
                            <div key={integration.platform}>
                                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 flex items-center gap-2 sticky top-0 z-10">
                                    <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full p-0.5 border border-slate-200">
                                        {LOGOS[integration.platform] && <img src={LOGOS[integration.platform]} className="w-full h-full object-contain" alt={integration.platform}/>}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{integration.platform}</span>
                                </div>
                                {integration.shops.map(shop => {
                                    const isSelected = selectedShopIds.includes(shop.id);
                                    return (
                                        <button
                                            key={shop.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleShopSelection(shop.id);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-3 group border-b border-slate-50 last:border-0 ${isSelected ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <CheckSquare size={14} className="text-white" />}
                                            </div>
                                            <span className={`flex-1 truncate ${isSelected ? 'font-bold text-indigo-900' : 'text-slate-700 font-medium'}`}>{shop.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                 </div>
               )}
             </div>
             <button 
               onClick={handleBulkSync}
               disabled={isSyncing === 'all' || selectedShopIds.length === 0}
               className="whitespace-nowrap px-6 py-2.5 bg-white text-indigo-700 rounded-lg text-sm font-extrabold hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
             >
               {isSyncing === 'all' ? <Loader2 size={18} className="animate-spin text-indigo-600"/> : <RefreshCw size={18} strokeWidth={2.5} />}
               Đồng bộ ngay
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Sidebar: Platforms */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Store size={18} className="text-indigo-600" /> Sàn TMĐT
            </h3>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              <button 
                onClick={() => { setFilterPlatform('all'); setFilterShop('all'); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${filterPlatform === 'all' && filterShop === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>Tất cả sàn</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${filterPlatform === 'all' && filterShop === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{products.length}</span>
              </button>
              {Object.values(Platform).map(p => {
                const platformProducts = products.filter(prod => prod.platform === p);
                const count = platformProducts.length;
                if (count === 0) return null;
                
                const integration = INITIAL_INTEGRATIONS.find(i => i.platform === p);
                const shops = integration?.shops || [];

                return (
                  <div key={p} className="space-y-1">
                    <button 
                      onClick={() => { setFilterPlatform(p); setFilterShop('all'); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${filterPlatform === p && filterShop === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded overflow-hidden bg-white border border-slate-200 p-0.5 flex items-center justify-center">
                          {LOGOS[p] && <img src={LOGOS[p]} className="w-full h-full object-contain" />}
                        </div>
                        <span>{p}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${filterPlatform === p && filterShop === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                    </button>
                    
                    {/* Shops under platform */}
                    {shops.length > 0 && (
                      <div className="pl-6 space-y-1 mt-1">
                        {shops.map(shop => {
                          const shopCount = platformProducts.filter(prod => prod.shopId === shop.id).length;
                          if (shopCount === 0) return null;
                          return (
                            <button
                              key={shop.id}
                              onClick={() => { setFilterPlatform(p); setFilterShop(shop.id); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${filterShop === shop.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <img src={shop.logo} className="w-4 h-4 rounded-full object-cover shrink-0" />
                                <span className="truncate">{shop.name}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] shrink-0 ${filterShop === shop.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>{shopCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              >
                <History size={18} /> 
                <span>Lịch sử đồng bộ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Products */}
        <div className="flex-1 flex flex-col min-w-0 gap-6 overflow-hidden">
          {/* Interactive Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
         <div 
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
               filterStatus === 'all' 
               ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20' 
               : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-md'
            }`}
         >
            <div className={`p-2.5 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
               <Filter size={20}/>
            </div>
            <div>
               <div className={`text-sm font-medium ${filterStatus === 'all' ? 'text-indigo-700' : 'text-slate-500'}`}>Tổng sản phẩm</div>
               <div className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.total}</div>
            </div>
         </div>

         <div 
            onClick={() => setFilterStatus('synced')}
            className={`p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
               filterStatus === 'synced' 
               ? 'bg-green-50 border-green-500 ring-2 ring-green-500/20' 
               : 'bg-white border-slate-100 hover:border-green-300 hover:shadow-md'
            }`}
         >
            <div className={`p-2.5 rounded-lg transition-colors ${filterStatus === 'synced' ? 'bg-green-200 text-green-700' : 'bg-green-50 text-green-600'}`}>
               <CheckCircle2 size={20}/>
            </div>
            <div>
               <div className={`text-sm font-medium ${filterStatus === 'synced' ? 'text-green-700' : 'text-slate-500'}`}>Đã liên kết</div>
               <div className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.synced}</div>
            </div>
         </div>

         <div 
            onClick={() => setFilterStatus('unsynced')}
            className={`p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
               filterStatus === 'unsynced' 
               ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' 
               : 'bg-white border-slate-100 hover:border-orange-300 hover:shadow-md'
            }`}
         >
            <div className={`p-2.5 rounded-lg transition-colors ${filterStatus === 'unsynced' ? 'bg-orange-200 text-orange-700' : 'bg-orange-50 text-orange-600'}`}>
               <LinkIcon size={20}/>
            </div>
            <div>
               <div className={`text-sm font-medium ${filterStatus === 'unsynced' ? 'text-orange-700' : 'text-slate-500'}`}>Chưa liên kết</div>
               <div className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.unsynced}</div>
            </div>
         </div>

         <div 
            onClick={() => setFilterStatus('error')}
            className={`p-4 rounded-xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
               filterStatus === 'error' 
               ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20' 
               : 'bg-white border-slate-100 hover:border-red-300 hover:shadow-md'
            }`}
         >
            <div className={`p-2.5 rounded-lg transition-colors ${filterStatus === 'error' ? 'bg-red-200 text-red-700' : 'bg-red-50 text-red-600'}`}>
               <AlertTriangle size={20}/>
            </div>
            <div>
               <div className={`text-sm font-medium ${filterStatus === 'error' ? 'text-red-700' : 'text-slate-500'}`}>Lỗi đồng bộ</div>
               <div className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.error}</div>
            </div>
         </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/50">
            <div className="relative flex-1 min-w-[200px]">
               <input 
                 type="text" 
                 placeholder="Tìm theo tên sản phẩm, SKU sàn..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
               <option value="all">Tất cả trạng thái</option>
               <option value="synced">Đã đồng bộ</option>
               <option value="unsynced">Chưa liên kết</option>
               <option value="error">Lỗi</option>
            </select>
         </div>

         <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                     <th className="px-6 py-4 w-12 text-center">#</th>
                     <th className="px-6 py-4">Sản phẩm (Trên sàn)</th>
                     <th className="px-6 py-4 text-center">Gian hàng</th>
                     <th className="px-6 py-4 text-right">Giá bán</th>
                     <th className="px-6 py-4 text-center">Tồn kho</th>
                     <th className="px-6 py-4 text-center">Trạng thái</th>
                     <th className="px-6 py-4 text-center">Lần cuối</th>
                     <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                     <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không tìm thấy sản phẩm phù hợp</td></tr>
                  ) : (
                     filteredProducts.map((p, idx) => {
                        const hasVariants = p.variants && p.variants.length > 0;
                        const isExpanded = expandedRowIds.has(p.id);

                        return (
                        <React.Fragment key={p.id}>
                        <tr className={`hover:bg-slate-50 group ${isExpanded ? 'bg-slate-50' : ''}`}>
                           <td className="px-6 py-4 text-center text-slate-400">
                                {hasVariants ? (
                                    <button 
                                        onClick={() => toggleExpandRow(p.id)}
                                        className="p-1 rounded hover:bg-slate-200 transition-colors"
                                    >
                                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                ) : (
                                    idx + 1
                                )}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <img src={p.image} className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0" />
                                 <div className="min-w-0 max-w-xs">
                                    <div className="flex items-start gap-2">
                                       <div className="font-normal text-slate-800 lowercase" title={p.name}>{p.name}</div>
                                       <button className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0 mt-0.5" title="Xem sản phẩm gốc">
                                          <Package size={14} />
                                       </button>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                       <span>SKU: {p.sku}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex justify-center" title={p.shopName}>
                                 <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center p-1 bg-white shadow-sm">
                                    {LOGOS[p.platform] && <img src={LOGOS[p.platform]} className="w-full h-full object-contain"/>}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right font-medium text-slate-700">{formatCurrency(p.price)}</td>
                           <td className="px-6 py-4 text-center">{p.stock}</td>
                           <td className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                 {p.syncStatus === 'synced' && <span title="Đã liên kết" className="text-green-500"><CheckCircle2 size={18}/></span>}
                                 {p.syncStatus === 'unsynced' && <span title="Chưa liên kết" className="text-orange-500"><LinkIcon size={18}/></span>}
                                 {p.syncStatus === 'error' && <span title={`Lỗi: ${p.errorMsg}`} className="text-red-500"><XCircle size={18}/></span>}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className="flex justify-center text-slate-400 hover:text-slate-600 transition-colors" title={p.lastSyncAt}>
                                 <Clock size={16} />
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              {p.syncStatus === 'error' || p.syncStatus === 'unsynced' ? (
                                <button 
                                    onClick={() => handleOpenFixModal(p)}
                                    className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors ml-auto flex items-center justify-center"
                                    title="Liên kết sản phẩm"
                                >
                                    <LinkIcon size={16} />
                                </button>
                              ) : (
                                <button 
                                    onClick={() => handleOpenFixModal(p)}
                                    className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors ml-auto flex items-center justify-center"
                                    title="Chỉnh sửa liên kết"
                                >
                                    <Edit size={16} />
                                </button>
                              )}
                           </td>
                        </tr>
                        {isExpanded && hasVariants && (
                            <tr className="bg-slate-50/50">
                                <td colSpan={8} className="px-0 py-0 border-b border-slate-100">
                                    <div className="pl-16 pr-6 py-4 bg-slate-50 border-t border-slate-200 shadow-inner">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                            <Settings size={12} /> Danh sách phân loại hàng ({p.variants?.length})
                                        </div>
                                        <table className="w-full text-xs text-left bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <thead className="bg-slate-100 text-slate-600">
                                                <tr>
                                                    <th className="px-4 py-2 border-r border-slate-200">Tên phân loại</th>
                                                    <th className="px-4 py-2 border-r border-slate-200">Mã SKU phân loại</th>
                                                    <th className="px-4 py-2 text-right border-r border-slate-200">Giá bán</th>
                                                    <th className="px-4 py-2 text-center">Tồn kho</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {p.variants?.map((v, vIdx) => (
                                                    <tr key={v.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2 font-medium text-slate-700 flex items-center gap-2 border-r border-slate-100">
                                                            {v.image && <img src={v.image} className="w-6 h-6 rounded object-cover border border-slate-200"/>}
                                                            {v.name}
                                                        </td>
                                                        <td className="px-4 py-2 font-mono text-slate-500 border-r border-slate-100">{v.sku}</td>
                                                        <td className="px-4 py-2 text-right font-medium border-r border-slate-100">{formatCurrency(v.price)}</td>
                                                        <td className="px-4 py-2 text-center">{v.stock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                     )})
                  )}
               </tbody>
            </table>
         </div>
      </div>
        </div>
      </div>

      {/* Sync History Modal */}
      {showHistoryModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <History size={20} className="text-indigo-600"/> Lịch sử đồng bộ sản phẩm
                  </h3>
                  <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-auto p-0">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                        <tr>
                           <th className="px-6 py-3">Thời gian</th>
                           <th className="px-6 py-3">Gian hàng</th>
                           <th className="px-6 py-3 text-center">Tổng SP</th>
                           <th className="px-6 py-3 text-center">Thành công</th>
                           <th className="px-6 py-3 text-center">Thất bại</th>
                           <th className="px-6 py-3 text-center">Trạng thái</th>
                           <th className="px-6 py-3">Người thực hiện</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {syncHistory.map(log => (
                           <tr key={log.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 text-slate-600">{log.timestamp}</td>
                              <td className="px-6 py-3">
                                 <div className="font-medium text-slate-800">{log.shopName}</div>
                                 <div className="text-xs text-slate-500">{log.platform}</div>
                              </td>
                              <td className="px-6 py-3 text-center">{log.totalItems}</td>
                              <td className="px-6 py-3 text-center text-green-600 font-bold">{log.syncedItems}</td>
                              <td className="px-6 py-3 text-center text-red-600 font-bold">{log.failedItems}</td>
                              <td className="px-6 py-3 text-center">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    log.status === 'success' ? 'bg-green-100 text-green-700' : 
                                    log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                 }`}>
                                    {log.status}
                                 </span>
                              </td>
                              <td className="px-6 py-3 text-slate-500 text-xs">{log.performedBy}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Đóng</button>
               </div>
            </div>
         </div>
      )}

      {/* Sync Progress Modal */}
      {renderSyncProgressModal()}

      {/* Fix Error Modal */}
      {fixProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden ${fixStep !== 'menu' ? 'h-[500px]' : ''} flex flex-col`}>
                <div className="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-600"/> Xử lý lỗi đồng bộ
                    </h3>
                    <button onClick={() => setFixProduct(null)} className="text-red-400 hover:text-red-600"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                    {renderFixModalContent()}
                </div>

                {isFixing && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center flex-col gap-2 z-20">
                        <Loader2 size={32} className="animate-spin text-indigo-600"/>
                        <span className="text-sm font-bold text-indigo-900">Đang xử lý...</span>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceProducts;
