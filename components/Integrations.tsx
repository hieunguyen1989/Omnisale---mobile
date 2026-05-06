
import React, { useState, useMemo } from 'react';
import { INITIAL_INTEGRATIONS, MOCK_SHIPPING_PROVIDERS, MOCK_WAREHOUSES, MOCK_USERS } from '../services/mockData';
import { Plus, Trash2, RefreshCw, Calendar, AlertTriangle, Lock, Truck, ShoppingBag, ToggleLeft, ToggleRight, Settings, ArrowLeft, Info, HelpCircle, Save, Users, Shield, Key, Store, Check, UserPlus, Edit3, X, AlertOctagon, Link2, ExternalLink, CheckCircle2, ChevronRight, LogOut } from 'lucide-react';
import { Platform, UserProfile, UserRole } from '../types';

interface IntegrationsProps {
  user: UserProfile;
}

const LOGOS: Record<string, string> = {
  [Platform.SHOPEE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
  [Platform.LAZADA]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_%282019%29.svg/1200px-Lazada_%282019%29.svg.png',
  [Platform.TIKTOK]: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png',
  [Platform.FACEBOOK]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  [Platform.WOOCOMMERCE]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png',
};

// Extended mock data for shipping carriers with updated stable logos
// All set to 'direct' as per request to remove OmniSales Express integration
const DETAILED_CARRIERS = [
  { 
    id: 'ghn', 
    name: 'Giao Hàng Nhanh', 
    logo: 'https://img.mservice.io/momo_app_v2/new_version/img/Parteners/GHN.png', 
    description: 'Giải pháp giao hàng, thu hộ chuyên nghiệp trải dài mọi miền đất nước.',
    type: 'direct',
    connected: true
  },
  { 
    id: 'ghtk', 
    name: 'Giao Hàng Tiết Kiệm', 
    logo: 'https://img.mservice.io/momo_app_v2/new_version/img/Parteners/GHTK.png', 
    description: 'Dịch vụ giao hàng thu tiền tận nơi, tốc độ nhanh, phủ sóng toàn quốc.',
    type: 'direct',
    connected: false
  },
  { 
    id: 'ahamove', 
    name: 'Ahamove', 
    logo: 'https://img.mservice.io/momo_app_v2/new_version/img/Parteners/AHAMOVE.png', 
    description: 'Dịch vụ giao hàng nội thành siêu tốc, ứng dụng công nghệ hiện đại.',
    type: 'direct',
    connected: false
  },
  { 
    id: 'viettel', 
    name: 'Viettel Post', 
    logo: 'https://img.mservice.io/momo_app_v2/new_version/img/Parteners/VTP.png', 
    description: 'Dịch vụ vận chuyển phát nhanh và vận tải trải dài khắp 63 tỉnh thành phố.',
    type: 'direct',
    connected: true
  },
  { 
    id: 'grab', 
    name: 'GrabExpress', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Grab_Logo_2019.svg/1200px-Grab_Logo_2019.svg.png', 
    description: 'Dịch vụ giao hàng nội thành siêu tốc. Lưu ý: Chỉ hỗ trợ khu vực Hà Nội & TP.HCM.',
    type: 'direct',
    connected: false
  },
  { 
    id: 'ninjavan', 
    name: 'Ninja Van', 
    logo: 'https://img.mservice.io/momo_app_v2/new_version/img/Parteners/NINJAVAN.png', 
    description: 'Cung cấp dịch vụ giao hàng vượt trội dành cho các doanh nghiệp.',
    type: 'direct',
    connected: false
  }
];

// Helper Component for Logos with Error Handling
const CarrierLogo = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold p-1 text-center rounded ${className}`}>
        {alt}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
    />
  );
};

const Integrations: React.FC<IntegrationsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'shipping' | 'staff'>('ecommerce');
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [carriers, setCarriers] = useState(DETAILED_CARRIERS);
  
  // Staff Management State
  const [staffList, setStaffList] = useState<UserProfile[]>(MOCK_USERS.filter(u => u.role !== 'owner')); 
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    username: '', 
    password: '',
    role: 'employee' as UserRole,
    assignedShopIds: [] as string[]
  });

  // Shop Configuration & Delete State
  const [configShop, setConfigShop] = useState<{id: string, name: string, platform: Platform} | null>(null);
  
  // Carrier Config State
  const [configuringCarrier, setConfiguringCarrier] = useState<typeof DETAILED_CARRIERS[0] | null>(null);
  const [carrierFormData, setCarrierFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customerId: '',
    address: '',
    refEmail: '',
    agreed: false
  });

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, platform: Platform | null, shopId: string | null, shopName: string | null }>({
    isOpen: false,
    platform: null,
    shopId: null,
    shopName: null
  });

  // Mock Config State
  const [shopConfig, setShopConfig] = useState({
    shortName: 'Shop Phụ Kiện Quà Tặng',
    useMarketplaceOrderId: true,
    pricePolicy: 'retail',
    autoConfirmReturn: true,
    branchId: 'wh1',
    staffId: 'u2',
    syncPrice: false,
    syncStock: true,
    syncStockBranch: 'wh1'
  });

  const getPlatformStyle = (platform: Platform) => {
    switch (platform) {
      case Platform.SHOPEE: return 'bg-orange-50 border-orange-100';
      case Platform.LAZADA: return 'bg-blue-50 border-blue-100';
      case Platform.TIKTOK: return 'bg-gray-100 border-gray-200';
      case Platform.FACEBOOK: return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  // Step 1: Open Delete Modal
  const requestDeleteShop = (platform: Platform, shopId: string, shopName: string) => {
    if (user.role !== 'owner') return; 
    setDeleteConfirm({
      isOpen: true,
      platform,
      shopId,
      shopName
    });
  };

  // Step 2: Confirm Delete Action
  const confirmDeleteShop = () => {
    if (!deleteConfirm.platform || !deleteConfirm.shopId) return;

    setIntegrations(prev => prev.map(p => {
      if (p.platform === deleteConfirm.platform) {
        return { ...p, shops: p.shops.filter(s => s.id !== deleteConfirm.shopId) };
      }
      return p;
    }));

    // Close Modal
    setDeleteConfirm({ isOpen: false, platform: null, shopId: null, shopName: null });
  };

  const handleAddShop = (platform: Platform) => {
    if (user.role !== 'owner') return; 
    alert(`Chức năng này sẽ mở cửa sổ đăng nhập ${platform} (OAuth) để cấp quyền truy cập.`);
  };

  // Improved Handler for Carrier Actions
  const handleCarrierAction = (carrier: typeof DETAILED_CARRIERS[0]) => {
    // For demo purposes, we allow viewing details even if not owner, but editing is restricted in submit
    setConfiguringCarrier(carrier);
    
    // Pre-fill if connected (Simulated)
    if (carrier.connected) {
        setCarrierFormData({
            name: user.name,
            phone: user.phone || '0901234567',
            email: user.email || 'shop@example.com',
            customerId: `CUST-${carrier.id.toUpperCase()}-001`,
            address: '123 Đường ABC, Quận 1, TP.HCM',
            refEmail: '',
            agreed: true
        });
    } else {
        // Reset form
        setCarrierFormData({
            name: '',
            phone: '',
            email: '',
            customerId: '',
            address: '',
            refEmail: '',
            agreed: false
        });
    }
  };

  const handleDisconnectCarrier = () => {
      if (!configuringCarrier) return;
      if (confirm(`Bạn có chắc chắn muốn ngắt kết nối với ${configuringCarrier.name}?`)) {
          setCarriers(prev => prev.map(c => c.id === configuringCarrier.id ? { ...c, connected: false } : c));
          setConfiguringCarrier(null);
      }
  };

  const confirmCarrierConnection = () => {
      if (!carrierFormData.name || !carrierFormData.phone || !carrierFormData.agreed) {
          alert("Vui lòng điền đầy đủ thông tin và đồng ý điều khoản.");
          return;
      }
      setCarriers(prev => prev.map(c => c.id === configuringCarrier?.id ? { ...c, connected: true } : c));
      setConfiguringCarrier(null);
      alert(configuringCarrier?.connected ? `Cập nhật thông tin ${configuringCarrier?.name} thành công!` : `Kết nối thành công với ${configuringCarrier?.name}!`);
  };

  const handleOpenConfig = (shop: {id: string, name: string}, platform: Platform) => {
    setConfigShop({ id: shop.id, name: shop.name, platform });
    setShopConfig(prev => ({ ...prev, shortName: shop.name }));
  };

  // --- Staff Management Logic ---
  
  const allAvailableShops = useMemo(() => {
    return integrations.flatMap(i => i.shops.map(s => ({ ...s, platform: i.platform })));
  }, [integrations]);

  const handleOpenStaffModal = (staff?: UserProfile) => {
    if (staff) {
        setEditingStaff(staff);
        setStaffFormData({
            name: staff.name,
            username: `user_${staff.id}`,
            password: '',
            role: staff.role,
            assignedShopIds: staff.assignedShopIds || []
        });
    } else {
        setEditingStaff(null);
        setStaffFormData({
            name: '',
            username: '',
            password: '',
            role: 'employee',
            assignedShopIds: []
        });
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = () => {
      if (!staffFormData.name || !staffFormData.username) {
          alert("Vui lòng nhập tên và tên đăng nhập.");
          return;
      }
      if (!editingStaff && !staffFormData.password) {
          alert("Vui lòng nhập mật khẩu cho nhân viên mới.");
          return;
      }
      if (staffFormData.role === 'collaborator' && staffFormData.assignedShopIds.length === 0) {
          alert("Vui lòng phân bổ ít nhất 1 shop cho Cộng tác viên.");
          return;
      }

      if (editingStaff) {
          setStaffList(prev => prev.map(s => s.id === editingStaff.id ? {
              ...s,
              name: staffFormData.name,
              role: staffFormData.role,
              assignedShopIds: staffFormData.role === 'employee' ? [] : staffFormData.assignedShopIds 
          } : s));
          if (staffFormData.password) {
              alert(`Đã đổi mật khẩu cho ${staffFormData.name}`);
          }
      } else {
          const newStaff: UserProfile = {
              id: `u_${Date.now()}`,
              name: staffFormData.name,
              role: staffFormData.role,
              avatar: `https://ui-avatars.com/api/?name=${staffFormData.name}&background=random`,
              assignedShopIds: staffFormData.role === 'employee' ? [] : staffFormData.assignedShopIds
          };
          setStaffList(prev => [...prev, newStaff]);
      }
      setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
      if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
          setStaffList(prev => prev.filter(s => s.id !== id));
      }
  };

  const toggleAssignedShop = (shopId: string) => {
      setStaffFormData(prev => {
          const exists = prev.assignedShopIds.includes(shopId);
          return {
              ...prev,
              assignedShopIds: exists 
                  ? prev.assignedShopIds.filter(id => id !== shopId) 
                  : [...prev.assignedShopIds, shopId]
          };
      });
  };

  const getVisibleShops = (platformShops: any[]) => {
    if (user.role === 'collaborator') {
      return platformShops.filter(s => user.assignedShopIds.includes(s.id));
    }
    return platformShops; 
  };

  const canManageShops = user.role === 'owner';

  const ChevronDownIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
  );

  const renderShopConfig = () => {
    if (!configShop) return null;

    return (
      <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-fade-in">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm shrink-0">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => setConfigShop(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                 <ArrowLeft size={20} />
              </button>
              <div>
                 <h2 className="text-lg font-bold text-slate-800">Thiết lập cấu hình đồng bộ</h2>
                 <p className="text-xs text-slate-500 flex items-center gap-1">
                    {configShop.platform} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {configShop.name}
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                 {LOGOS[configShop.platform] && <img src={LOGOS[configShop.platform]} className="w-5 h-5 object-contain" />}
                 <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">{configShop.name}</span>
                 <ChevronDownIcon size={14} className="text-slate-400" />
              </div>
              <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                 Cấp quyền lại
              </button>
              <button onClick={() => { alert('Đã lưu cấu hình!'); setConfigShop(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                 <Save size={16} /> Lưu cấu hình
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-8">
             {/* ... Config Content ... */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                   <h3 className="font-bold text-slate-800 text-base">Thiết lập chung</h3>
                   <p className="text-sm text-slate-500 mt-1">Các thông tin cơ bản về gian hàng.</p>
                </div>
                <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tên rút gọn <span className="text-red-500">*</span>
                   </label>
                   <p className="text-xs text-slate-500 mb-2">Tên viết tắt gian hàng trên OmniSales giúp nhận biết và phân biệt các gian hàng với nhau.</p>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={shopConfig.shortName}
                        onChange={(e) => setShopConfig({...shopConfig, shortName: e.target.value})}
                        className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                         {shopConfig.shortName.length}/50
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCarrierConfigModal = () => {
      if (!configuringCarrier) return null;

      return (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-xl text-slate-800">
                          {configuringCarrier.connected ? 'Cấu hình kết nối' : 'Kết nối đối tác'}
                      </h3>
                      <button onClick={() => setConfiguringCarrier(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                      {/* Connection Diagram */}
                      <div className="flex items-center justify-center gap-6 mb-8 py-4">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center p-2">
                              <CarrierLogo src={configuringCarrier.logo} alt={configuringCarrier.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                              {configuringCarrier.connected ? (
                                  <div className="flex items-center text-green-500 font-bold gap-1 text-xs bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={12}/> Đã kết nối</div>
                              ) : (
                                  <>
                                    <RefreshCw size={24} className="text-indigo-500 animate-spin-slow" />
                                    <Link2 size={16} />
                                  </>
                              )}
                          </div>
                          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-black text-2xl">
                              O
                          </div>
                      </div>

                      <div className="mb-6">
                          <h4 className="font-bold text-slate-800 mb-1">OmniSales kết nối 2 chiều với đối tác {configuringCarrier.name}:</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                              <li>Tự động đẩy thông tin đơn hàng, tiền thu hộ,... sang đối tác.</li>
                              <li>Shipper sẽ qua cửa hàng gom đơn mà không cần liên hệ.</li>
                              <li>Cập nhật nhanh chóng phí và chi tiết lịch trình đơn.</li>
                          </ul>
                      </div>

                      <div className="space-y-4">
                          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                              {configuringCarrier.connected ? 'Thông tin kết nối hiện tại' : `Đăng ký thông tin sử dụng dịch vụ ${configuringCarrier.name}`}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                  <input 
                                      type="text" 
                                      value={carrierFormData.name} 
                                      onChange={(e) => setCarrierFormData({...carrierFormData, name: e.target.value})}
                                      className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                  <input 
                                      type="text" 
                                      value={carrierFormData.phone} 
                                      onChange={(e) => setCarrierFormData({...carrierFormData, phone: e.target.value})}
                                      className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border"
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email <span className="text-red-500">*</span></label>
                                  <input 
                                      type="email" 
                                      value={carrierFormData.email} 
                                      onChange={(e) => setCarrierFormData({...carrierFormData, email: e.target.value})}
                                      className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên định danh khách hàng</label>
                                  <input 
                                      type="text" 
                                      value={carrierFormData.customerId} 
                                      onChange={(e) => setCarrierFormData({...carrierFormData, customerId: e.target.value})}
                                      className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border"
                                      placeholder="Tùy chọn"
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                              <input 
                                  type="text" 
                                  value={carrierFormData.address} 
                                  onChange={(e) => setCarrierFormData({...carrierFormData, address: e.target.value})}
                                  className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border"
                              />
                          </div>

                          <div>
                              <h4 className="font-bold text-slate-800 text-sm mb-2 mt-2">Email nhân viên giới thiệu</h4>
                              <input 
                                  type="email" 
                                  value={carrierFormData.refEmail} 
                                  onChange={(e) => setCarrierFormData({...carrierFormData, refEmail: e.target.value})}
                                  className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none border max-w-xs"
                              />
                          </div>

                          <div className="flex items-start gap-2 pt-2">
                              <input 
                                  type="checkbox" 
                                  id="agree" 
                                  checked={carrierFormData.agreed} 
                                  onChange={(e) => setCarrierFormData({...carrierFormData, agreed: e.target.checked})}
                                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor="agree" className="text-sm text-slate-600">
                                  Tôi đã đọc, hiểu và đồng ý với <a href="#" className="text-indigo-600 hover:underline">Chính sách bảo vệ dữ liệu cá nhân</a>
                              </label>
                          </div>

                          <div className="pt-2 text-xs">
                              <a href="#" className="text-indigo-600 hover:underline block mb-1">Hướng dẫn kết nối {configuringCarrier.name}</a>
                              <a href="#" className="text-indigo-600 hover:underline block">Tìm hiểu thêm về {configuringCarrier.name}</a>
                          </div>
                      </div>
                  </div>

                  <div className="p-5 border-t border-slate-100 flex justify-between gap-3 bg-slate-50">
                      {configuringCarrier.connected && (
                          <button 
                              onClick={handleDisconnectCarrier}
                              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-100"
                          >
                              <LogOut size={16} /> Ngắt kết nối
                          </button>
                      )}
                      <div className="flex gap-3 ml-auto">
                          <button 
                              onClick={() => setConfiguringCarrier(null)} 
                              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                          >
                              Thoát
                          </button>
                          <button 
                              onClick={confirmCarrierConnection} 
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-colors"
                          >
                              {configuringCarrier.connected ? 'Cập nhật' : 'Kết nối'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderStaffManagement = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20} /> Danh sách nhân viên
                </h3>
                <p className="text-sm text-slate-500">Quản lý và phân quyền truy cập cho nhân viên và cộng tác viên.</p>
            </div>
            {canManageShops && (
                <button 
                    onClick={() => handleOpenStaffModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <UserPlus size={18} /> Thêm nhân viên
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((staff) => (
                <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full border border-slate-100" />
                            <div>
                                <h4 className="font-bold text-slate-800">{staff.name}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${staff.role === 'employee' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {staff.role === 'employee' ? 'Nhân viên' : 'Cộng tác viên'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {canManageShops && (
                            <div className="flex gap-1">
                                <button onClick={() => handleOpenStaffModal(staff)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    {/* ... Staff Details ... */}
                </div>
            ))}
        </div>
        {/* ... Staff Modal ... */}
        {isStaffModalOpen && (
            <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                {/* ... Staff Modal Content ... */}
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{editingStaff ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h3>
                        <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>
                    {/* Form fields... reduced for brevity */}
                    <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                        <button onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Hủy</button>
                        <button onClick={handleSaveStaff} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">Lưu lại</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  if (configShop) {
    return renderShopConfig();
  }

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cấu hình hệ thống</h2>
          <p className="text-sm text-slate-500 mt-1">Kết nối gian hàng TMĐT và Đơn vị vận chuyển.</p>
        </div>
        {!canManageShops && (
          <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm border border-yellow-100 flex items-center gap-2">
            <Lock size={14} />
            <span>Chế độ chỉ xem ({user.role === 'employee' ? 'Nhân viên' : 'CTV'})</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab('ecommerce')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ecommerce' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ShoppingBag size={16} /> Sàn TMĐT
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'shipping' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Truck size={16} /> Đơn vị vận chuyển
        </button>
        {canManageShops && (
            <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'staff' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
            <Users size={16} /> Nhân viên & Phân quyền
            </button>
        )}
      </div>

      {activeTab === 'ecommerce' && (
        <div className="space-y-8 animate-fade-in">
          {integrations.map((integration) => {
            const visibleShops = getVisibleShops(integration.shops);
            if (user.role === 'collaborator' && visibleShops.length === 0) return null;
            const logoUrl = LOGOS[integration.platform];

            return (
              <div key={integration.platform} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className={`px-4 py-2 rounded-lg border flex items-center bg-white ${getPlatformStyle(integration.platform)}`}>
                        {logoUrl ? (
                          <img src={logoUrl} alt={integration.platform} className="h-6 w-auto object-contain" />
                        ) : (
                          <span className="font-bold text-sm">{integration.platform}</span>
                        )}
                     </div>
                     <span className="text-slate-500 text-sm">
                       Đang kết nối: <strong className="text-slate-800">{visibleShops.length}</strong> gian hàng
                     </span>
                  </div>
                  {canManageShops && (
                    <button 
                      onClick={() => handleAddShop(integration.platform)}
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                    >
                      <Plus size={16} /> Thêm gian hàng
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {visibleShops.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Chưa có gian hàng nào được kết nối.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {visibleShops.map((shop) => (
                        <div key={shop.id} className="border border-slate-200 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow relative group">
                          <div className="w-16 h-16 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate mb-1" title={shop.name}>{shop.name}</h4>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                 <span className={`w-2 h-2 rounded-full ${shop.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                 {shop.status === 'active' ? 'Hoạt động' : 'Hết hạn Token'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400" title="Ngày hết hạn Token">
                                 <Calendar size={12} /> Hết hạn: {shop.expiresAt}
                              </div>
                              <div className="text-[10px] text-slate-400">ID: {shop.id}</div>
                            </div>
                          </div>

                          {canManageShops && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                               <button 
                                 onClick={() => handleOpenConfig(shop, integration.platform)}
                                 className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded" 
                                 title="Cấu hình gian hàng"
                               >
                                 <Settings size={14} />
                               </button>
                               <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded" title="Làm mới Token">
                                 <RefreshCw size={14} />
                               </button>
                               <button 
                                 onClick={() => requestDeleteShop(integration.platform, shop.id, shop.name)}
                                 className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Ngắt kết nối"
                                >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          )}

                          {shop.status === 'expired' && canManageShops && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                               <button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1 hover:bg-red-100">
                                 <AlertTriangle size={12} /> Kết nối lại ngay
                               </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )} 
      
      {activeTab === 'shipping' && (
        <div className="space-y-8 animate-fade-in">
            {/* Direct Carriers - Now containing all */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Kết nối trực tiếp với đơn vị vận chuyển</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Kết nối tài khoản của bạn tại các đơn vị vận chuyển để tự động đồng bộ trạng thái đơn hàng và phí vận chuyển.
                </p>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {carriers.map(carrier => (
                        <div key={carrier.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 rounded-xl border border-slate-100 p-2 flex items-center justify-center bg-slate-50 shrink-0">
                                <CarrierLogo src={carrier.logo} alt={carrier.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{carrier.name}</h4>
                                    {carrier.connected ? (
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Đã kết nối</span>
                                    ) : (
                                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-100">Chưa kết nối</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{carrier.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <button onClick={() => handleCarrierAction(carrier)} className="text-indigo-600 text-xs font-bold hover:underline">Xem chi tiết</button>
                                    
                                    <div className="flex items-center gap-2">
                                        {carrier.id === 'grab' && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"><Info size={10}/> Xuất hóa đơn VAT</span>}
                                        {carrier.connected ? (
                                            <button onClick={() => handleCarrierAction(carrier)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><Settings size={18}/></button>
                                        ) : (
                                            <button 
                                                onClick={() => handleCarrierAction(carrier)}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm"
                                            >
                                                Kết nối
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'staff' && canManageShops && renderStaffManagement()}

      {/* Delete Shop Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertOctagon size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Ngắt kết nối gian hàng?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Bạn có chắc chắn muốn xóa gian hàng <br/> 
                <span className="font-bold text-slate-800">"{deleteConfirm.shopName}"</span> khỏi hệ thống?
                <br/><span className="text-xs text-red-500 mt-2 block">Cảnh báo: Dữ liệu đơn hàng và sản phẩm sẽ ngừng đồng bộ ngay lập tức.</span>
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: false, platform: null, shopId: null, shopName: null })}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmDeleteShop}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Carrier Config Modal */}
      {renderCarrierConfigModal()}
    </div>
  );
};

export default Integrations;
