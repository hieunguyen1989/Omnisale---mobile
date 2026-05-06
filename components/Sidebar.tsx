
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, MessageSquareText, PieChart, Megaphone, Archive, FileSpreadsheet, Headphones, Wrench, Crown, Sparkles, X, PlusCircle, BookText, BookOpen, MessageSquarePlus, Newspaper, Globe, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onOpenFeedback: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'reports', label: 'Báo cáo', icon: PieChart },
    { id: 'create-order', label: 'Đơn ngoài sàn', icon: PlusCircle },
    { id: 'orders', label: 'Đơn hàng TMĐT', icon: Package, color: 'orange' },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'products', label: 'Sản phẩm Omni', icon: ShoppingBag },
    { id: 'ecommerce-products', label: 'Sản phẩm TMĐT', icon: Globe },
    { id: 'inventory', label: 'Kho hàng', icon: Archive },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquareText, color: 'yellow' },
    { id: 'invoices', label: 'Sổ & Hóa Đơn', icon: BookText },
    { id: 'tax', label: 'Báo cáo Thuế', icon: FileSpreadsheet }, 
    { id: 'tax-service', label: 'Dịch vụ Thuế', icon: Headphones, color: 'green' },
    { id: 'tools', label: 'Công cụ', icon: Wrench },
    { id: 'integrations', label: 'Cấu hình', icon: Settings },
  ];

  const supportMenuItems = [
    { id: 'news', label: 'Tin tức', icon: Newspaper, featured: true },
    { id: 'guide', label: 'Hướng dẫn sử dụng', icon: BookOpen },
    { id: 'feedback', label: 'Góp ý tính năng', icon: MessageSquarePlus },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onClose(); 
  };

  const getCustomStyles = (id: string, isActive: boolean) => {
    if (isActive) return 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100 font-bold';
    
    switch (id) {
      case 'orders': 
        return 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium transition-colors';
      case 'messages': 
        return 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium transition-colors';
      case 'tax-service': 
        return 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium transition-colors';
      default: 
        return 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-medium transition-colors';
    }
  };

  const getIconColor = (id: string, isActive: boolean) => {
    if (isActive) return 'text-indigo-600';
    switch (id) {
      case 'orders': return 'text-orange-600 group-hover:text-orange-700';
      case 'messages': return 'text-amber-600 group-hover:text-amber-700';
      case 'tax-service': return 'text-emerald-600 group-hover:text-emerald-700';
      default: return 'text-slate-400 group-hover:text-indigo-600';
    }
  };

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    
    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => handleItemClick(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${getCustomStyles(item.id, isActive)}`}
        >
          <Icon size={18} className={`transition-colors ${getIconColor(item.id, isActive)}`} />
          <span className={isActive ? '' : ''}>{item.label}</span>
          {item.featured && !isActive && <Sparkles size={12} className="ml-auto text-indigo-400 animate-pulse" />}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        flex flex-col h-screen shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              <span className="text-lg">O</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">OmniSales</h1>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col overflow-hidden py-4 px-3">
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
            {mainMenuItems.map(renderMenuItem)}
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5 shrink-0">
            {supportMenuItems.map(renderMenuItem)}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-4 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1" onClick={() => handleItemClick('membership')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
                  <Crown size={16} className="text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Nâng cấp Pro</h4>
                  <p className="text-[10px] text-indigo-100 opacity-90">Mở khóa tính năng</p>
                </div>
              </div>
              
              <div className="w-full py-2 bg-white text-indigo-700 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 relative z-10 hover:bg-indigo-50 transition-colors">
                Nâng cấp ngay
              </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors group justify-center"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;