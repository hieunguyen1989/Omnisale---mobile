
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import OrderList from './components/OrderList';
import CreateOrder from './components/CreateOrder';
import Inventory from './components/Inventory';
import Integrations from './components/Integrations';
import ChatSystem from './components/ChatSystem';
import RealtimeReport from './components/RealtimeReport';
import Marketing from './components/Marketing';
import Auth from './components/Auth';
import FloatingAssistant from './components/FloatingAssistant';
import NotificationToast from './components/NotificationToast';
import Membership from './components/Membership';
import TaxReport from './components/TaxReport';
import TaxService from './components/TaxService';
import Tools from './components/Tools';
import InvoiceManager from './components/InvoiceManager';
import MobileApp from './components/MobileApp';
import UserProfileSettings from './components/UserProfileSettings';
import NewsModule from './components/NewsModule';
import EcommerceProducts from './components/EcommerceProducts';
import CustomerList from './components/CustomerList';
import { GuidePage, FeedbackPage } from './components/Support'; 
import { Bell, Search, X, Box, FileText, ChevronRight, Package, Menu, Smartphone, Monitor } from 'lucide-react';
import { MOCK_CONVERSATIONS, MOCK_PRODUCTS, MOCK_ORDERS } from './services/mockData';
import { UserProfile, Product, Order } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // View Mode State: Detect Mobile by default or toggle
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Notification State
  const [notification, setNotification] = useState<{sender: string, avatar: string, message: string, platform: string} | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ products: Product[], orders: Order[] } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
        // Only auto-switch if user hasn't explicitly toggled, or force reset on drastic change
        if (window.innerWidth < 768 && !isMobileView) setIsMobileView(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView]);

  // Handle Global Search
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const term = searchQuery.toLowerCase();
      
      const foundProducts = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term)
      ).slice(0, 5); // Limit to 5

      const foundOrders = MOCK_ORDERS.filter(o => 
        o.id.toLowerCase().includes(term) || 
        o.customerName.toLowerCase().includes(term)
      ).slice(0, 5); // Limit to 5

      if (foundProducts.length > 0 || foundOrders.length > 0) {
        setSearchResults({ products: foundProducts, orders: foundOrders });
      } else {
        setSearchResults({ products: [], orders: [] });
      }
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSearchResults(null);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearchResultClick = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchResults(null);
    setIsSidebarOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Simulation of Incoming Messages
  useEffect(() => {
    if (!currentUser) return;

    // Request browser permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const randomMessages = [
      "Shop ơi mẫu này còn size M không?",
      "Tư vấn giúp mình sản phẩm này với ạ",
      "Mình chưa nhận được hàng, kiểm tra giúp mình",
      "Có mã giảm giá nào cho đơn 500k không shop?",
      "Hàng đẹp lắm, mình đánh giá 5 sao nhé!",
      "Cho mình xin ảnh thật sản phẩm qua inbox"
    ];

    const interval = setInterval(() => {
      // 30% chance to trigger a notification every check
      if (currentUser && Math.random() > 0.7) {
        const randomConv = MOCK_CONVERSATIONS[Math.floor(Math.random() * MOCK_CONVERSATIONS.length)];
        const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        
        // Show In-App Toast
        setNotification({
          sender: randomConv.customerName,
          avatar: randomConv.avatar,
          message: randomMsg,
          platform: randomConv.platform
        });

        // Show Browser Notification (if allowed)
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification(`Tin nhắn mới từ ${randomConv.customerName}`, {
            body: randomMsg,
            icon: '/vite.svg'
          });
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return <Auth onLogin={(user) => setCurrentUser(user)} />;
  }

  // --- Render Mobile App ---
  if (isMobileView) {
    return (
        <MobileApp 
            user={currentUser} 
            onLogout={() => setCurrentUser(null)} 
            onSwitchToDesktop={() => setIsMobileView(false)}
        />
    );
  }

  // --- Render Desktop App ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} />;
      case 'reports': return <RealtimeReport />;
      case 'create-order': return <CreateOrder />; 
      case 'orders': return <OrderList user={currentUser} />;
      case 'customers': return <CustomerList />;
      case 'products': return <ProductList />;
      case 'ecommerce-products': return <EcommerceProducts />;
      case 'inventory': return <Inventory />;
      case 'tools': return <Tools />;
      case 'marketing': return <Marketing />;
      case 'invoices': return <InvoiceManager />;
      case 'tax': return <TaxReport />;
      case 'tax-service': return <TaxService />;
      case 'messages': return <ChatSystem />;
      case 'news': return <NewsModule />;
      case 'integrations': return <Integrations user={currentUser} />;
      case 'membership': return <Membership />;
      case 'guide': return <GuidePage />; // New Page
      case 'feedback': return <FeedbackPage />; // New Page
      default: return <Dashboard user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setCurrentUser(null)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGuide={() => setActiveTab('guide')}
        onOpenFeedback={() => setActiveTab('feedback')}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen w-full transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm print:hidden shrink-0">
          <div className="flex items-center gap-3 md:gap-4 text-slate-400">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden text-slate-600 hover:text-indigo-600 p-1"
             >
               <Menu size={24} />
             </button>
             
             <span className="capitalize text-slate-800 font-semibold text-base md:text-lg tracking-tight truncate max-w-[150px] md:max-w-none">
               {activeTab === 'dashboard' ? 'Tổng quan' : 
                activeTab === 'reports' ? 'Báo cáo Realtime' :
                activeTab === 'create-order' ? 'Tạo Đơn ngoài sàn' :
                activeTab === 'orders' ? 'Đơn hàng TMĐT' :
                activeTab === 'customers' ? 'Khách hàng' :
                activeTab === 'products' ? 'Sản phẩm Omni' :
                activeTab === 'ecommerce-products' ? 'Sản phẩm TMĐT' :
                activeTab === 'inventory' ? 'Kho hàng' :
                activeTab === 'tools' ? 'Công cụ tiện ích' :
                activeTab === 'marketing' ? 'Marketing' :
                activeTab === 'invoices' ? 'Sổ & Hóa Đơn' :
                activeTab === 'tax' ? 'Báo cáo Thuế' :
                activeTab === 'tax-service' ? 'Dịch vụ Thuế' :
                activeTab === 'messages' ? 'Tin nhắn' :
                activeTab === 'news' ? 'Tin tức' :
                activeTab === 'guide' ? 'Hướng dẫn sử dụng' :
                activeTab === 'feedback' ? 'Góp ý tính năng' :
                activeTab === 'integrations' ? 'Cấu hình hệ thống' : 'Nâng cấp tài khoản'}
             </span>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            
            {/* View Switcher for Demo */}
            <button 
                onClick={() => setIsMobileView(true)}
                className="hidden md:flex items-center gap-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                title="Chuyển sang giao diện Mobile App"
            >
                <Smartphone size={16} /> App View
            </button>

            {/* SEARCH INPUT */}
            <div className="relative hidden md:block group z-50">
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm đơn hàng, SKU..." 
                className={`pl-9 pr-10 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-48 lg:w-72 transition-all ${searchResults ? 'ring-2 ring-indigo-500 bg-white' : ''}`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button className="relative text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-full group" title="Thông báo">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 md:pl-6 md:border-l border-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">{currentUser.name}</div>
                <div className="text-xs text-slate-500 capitalize">
                  {currentUser.role === 'owner' ? 'Chủ Shop' : currentUser.role === 'employee' ? 'Nhân Viên' : 'Cộng Tác Viên'}
                </div>
              </div>
              <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-indigo-100 object-cover shadow-sm" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative print:p-0 print:overflow-visible bg-slate-50">
          {renderContent()}
        </main>
        
        {/* GLOBAL SEARCH RESULTS MODAL */}
        {searchResults && (
          <>
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => { setSearchQuery(''); setSearchResults(null); }} />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-[80vh] flex flex-col animate-fade-in">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex justify-between">
                 <span>Kết quả tìm kiếm cho "{searchQuery}"</span>
                 <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white border rounded text-[10px]">ESC</span> để đóng</span>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2">
                {searchResults.products.length === 0 && searchResults.orders.length === 0 && (
                   <div className="p-8 text-center text-slate-500">
                     Không tìm thấy kết quả nào phù hợp.
                   </div>
                )}

                {/* PRODUCTS SECTION */}
                {searchResults.products.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Box size={14} /> Sản phẩm Omni
                    </h3>
                    {searchResults.products.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => handleSearchResultClick('products')}
                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <img src={product.image} className="w-10 h-10 rounded object-cover border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 truncate">{product.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="bg-slate-100 px-1.5 rounded">{product.sku}</span>
                            <span className="text-indigo-600 font-medium">{formatCurrency(product.price)}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* ORDERS SECTION */}
                {searchResults.orders.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} /> Đơn hàng
                    </h3>
                    {searchResults.orders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => handleSearchResultClick('orders')}
                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <Package size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 flex gap-2">
                             <span>{order.id}</span>
                             <span className="text-slate-400 font-normal">| {order.customerName}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className={`px-1.5 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.status === 'delivered' ? 'Đã giao' : order.status === 'pending' ? 'Chờ xác nhận' : 'Đang xử lý'}
                            </span>
                            <span>{order.platform}</span>
                            <span className="font-medium text-slate-700">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* User Profile Modal */}
        {isProfileModalOpen && (
           <UserProfileSettings 
             user={currentUser} 
             onClose={() => setIsProfileModalOpen(false)}
             onUpdate={(updatedUser) => {
               setCurrentUser(updatedUser);
             }}
           />
        )}

        {/* Global Floating Widget */}
        <div className="print:hidden">
           <FloatingAssistant />
        </div>

        {/* Push Notification Toast */}
        {notification && (
          <NotificationToast 
            sender={notification.sender}
            avatar={notification.avatar}
            message={notification.message}
            platform={notification.platform}
            onClose={() => setNotification(null)}
            onClick={() => {
              setNotification(null);
              setActiveTab('messages');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;