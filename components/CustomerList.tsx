
import React, { useState, useMemo } from 'react';
import { Customer, Platform, Order } from '../types';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../services/mockData';
import { 
  Search, Filter, Download, Star, MapPin, Phone, Mail, ShoppingBag, 
  DollarSign, TrendingUp, AlertTriangle, ChevronRight, CheckCircle2, 
  XCircle, User, Clock, MessageCircle, Ban, Edit3, Save, X, Plus, Trash2, Calendar, StickyNote
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

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});
  const [newTagInput, setNewTagInput] = useState('');

  // Stats
  const stats = useMemo(() => {
    return {
      total: customers.length,
      newThisMonth: customers.filter(c => {
        const d = new Date();
        // Assuming lastOrderDate implies "active recently", simpler for mock
        return c.lastOrderDate.includes(`${d.getMonth() + 1}/${d.getFullYear()}`);
      }).length,
      vip: customers.filter(c => c.tags.includes('VIP')).length,
      blacklist: customers.filter(c => c.tags.includes('Blacklist')).length
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTag = filterTag === 'all' || c.tags.includes(filterTag);
      const matchPlatform = filterPlatform === 'all' || c.platforms.includes(filterPlatform as Platform);
      
      return matchSearch && matchTag && matchPlatform;
    });
  }, [customers, searchTerm, filterTag, filterPlatform]);

  const getReliabilityColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTagStyle = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blacklist': return 'bg-red-100 text-red-800 border-red-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'loyal': return 'bg-green-100 text-green-800 border-green-200';
      case 'potential': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleExport = () => {
    alert(`Đang xuất danh sách ${filteredCustomers.length} khách hàng ra file Excel...`);
  };

  // Mock Orders for Detail View
  const customerOrders = useMemo(() => {
    if(!selectedCustomer) return [];
    // Just grab 5 random orders for demo linked to this customer
    return MOCK_ORDERS.slice(0, 5).map((o, i) => ({
        ...o, 
        id: `${o.id}-HIS-${i}`,
        status: i === 0 ? 'processing' : 'delivered',
        customerName: selectedCustomer.name
    })) as Order[];
  }, [selectedCustomer]);

  // Action Handlers
  const handleOpenDetail = (customer: Customer) => {
      setSelectedCustomer(customer);
      setIsEditing(false);
      setEditFormData({});
  };

  const handleToggleBlock = () => {
      if (!selectedCustomer) return;
      const isBlocked = selectedCustomer.status === 'blocked';
      const action = isBlocked ? 'Mở khóa' : 'Chặn';
      
      if (confirm(`Bạn có chắc chắn muốn ${action} khách hàng ${selectedCustomer.name}?`)) {
          const newStatus = isBlocked ? 'active' : 'blocked';
          const updatedCustomer = { ...selectedCustomer, status: newStatus };
          
          setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
          setSelectedCustomer(updatedCustomer);
          
          alert(`Đã ${action} khách hàng thành công!`);
      }
  };

  const handleStartEdit = () => {
      if (selectedCustomer) {
          setEditFormData({ ...selectedCustomer });
          setIsEditing(true);
      }
  };

  const handleSaveEdit = () => {
      if (!selectedCustomer || !editFormData.name || !editFormData.phone) {
          alert("Vui lòng điền đầy đủ tên và số điện thoại.");
          return;
      }

      const updatedCustomer = { ...selectedCustomer, ...editFormData } as Customer;
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
      
      alert("Cập nhật thông tin khách hàng thành công!");
  };

  const handleAddTag = () => {
      if (!newTagInput.trim()) return;
      if (editFormData.tags?.includes(newTagInput.trim())) return;
      
      setEditFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTagInput.trim()]
      }));
      setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
      setEditFormData(prev => ({
          ...prev,
          tags: prev.tags?.filter(t => t !== tag)
      }));
  };

  return (
    <div className="flex h-full flex-col animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h2>
          <p className="text-sm text-slate-500 mt-1">Thông tin chi tiết và lịch sử mua hàng của khách hàng đa kênh.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
              <Download size={18} /> Xuất Excel
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20}/></div>
            <div>
               <div className="text-xs text-slate-500 font-bold uppercase">Tổng khách hàng</div>
               <div className="text-xl font-bold text-slate-800">{stats.total}</div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Star size={20}/></div>
            <div>
               <div className="text-xs text-slate-500 font-bold uppercase">Khách hàng VIP</div>
               <div className="text-xl font-bold text-slate-800">{stats.vip}</div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20}/></div>
            <div>
               <div className="text-xs text-slate-500 font-bold uppercase">Khách mới (Tháng)</div>
               <div className="text-xl font-bold text-slate-800">{stats.newThisMonth}</div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20}/></div>
            <div>
               <div className="text-xs text-slate-500 font-bold uppercase">Cảnh báo Bom hàng</div>
               <div className="text-xl font-bold text-slate-800">{stats.blacklist}</div>
            </div>
         </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
         {/* Filters */}
         <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/50">
            <div className="relative flex-1 min-w-[250px]">
               <input 
                 type="text" 
                 placeholder="Tìm theo tên, SĐT, Email..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            
            <select 
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
               <option value="all">Tất cả nguồn</option>
               {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select 
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
               <option value="all">Tất cả phân loại</option>
               <option value="VIP">Khách VIP</option>
               <option value="New">Khách mới</option>
               <option value="Blacklist">Blacklist (Bom hàng)</option>
               <option value="Loyal">Khách quen</option>
            </select>
         </div>

         <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                     <th className="px-6 py-4">Khách hàng</th>
                     <th className="px-6 py-4 text-center">Uy tín</th>
                     <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                     <th className="px-6 py-4 text-center">Đơn hàng</th>
                     <th className="px-6 py-4">Ngày tạo / Mua gần nhất</th>
                     <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                     <tr><td colSpan={6} className="text-center py-12 text-slate-400">Không tìm thấy khách hàng nào</td></tr>
                  ) : (
                     filteredCustomers.map((cus) => (
                        <tr key={cus.id} className="hover:bg-slate-50 group cursor-pointer transition-colors" onClick={() => handleOpenDetail(cus)}>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <img src={cus.avatar} alt={cus.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                                 <div className="min-w-0">
                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                        {cus.name}
                                        {cus.status === 'blocked' && <Ban size={12} className="text-red-500" />}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                        <span>{cus.phone}</span>
                                        {cus.tags.map(t => (
                                            <span key={t} className={`px-1.5 rounded text-[9px] font-bold border ${getTagStyle(t)}`}>{t}</span>
                                        ))}
                                    </div>
                                    {cus.notes && (
                                        <div className="mt-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-md flex items-start gap-1 max-w-[200px]">
                                            <StickyNote size={10} className="shrink-0 mt-0.5" />
                                            <span className="truncate">{cus.notes}</span>
                                        </div>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getReliabilityColor(cus.successRate)}`}>
                                 {cus.successRate >= 90 ? <CheckCircle2 size={12}/> : cus.successRate <= 50 ? <XCircle size={12}/> : <Clock size={12}/>}
                                 {cus.successRate}%
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">Tỷ lệ nhận hàng</div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="font-bold text-slate-800">{formatCurrency(cus.totalSpent)}</div>
                              <div className="text-xs text-slate-400">TB: {formatCurrency(cus.totalSpent / (cus.totalOrders || 1))}</div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <span className="font-bold text-slate-700">{cus.totalOrders}</span>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-600">
                              <div className="flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> Tạo: {cus.createdAt}</div>
                              <div className="flex items-center gap-1 mt-1 font-medium text-indigo-600"><Clock size={12}/> Mua: {cus.lastOrderDate.split(' ')[1] || cus.lastOrderDate}</div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                 <ChevronRight size={18} />
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Customer Detail Modal (Popup) */}
      {selectedCustomer && (
         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCustomer(null)}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
               {/* Modal Header */}
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <img src={selectedCustomer.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-sm object-cover" />
                        {selectedCustomer.status === 'blocked' && (
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white">
                                <Ban size={14} />
                            </div>
                        )}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           {selectedCustomer.name}
                           {isEditing && <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Đang chỉnh sửa</span>}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                           <span className="flex items-center gap-1"><Phone size={14}/> {selectedCustomer.phone}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                           <span>ID: {selectedCustomer.id}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     {!isEditing ? (
                         <>
                            <button onClick={handleStartEdit} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 shadow-sm flex items-center gap-2 text-sm font-medium transition-colors">
                                <Edit3 size={16}/> Sửa thông tin
                            </button>
                            <button 
                                onClick={handleToggleBlock}
                                className={`px-4 py-2 border rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium transition-colors ${selectedCustomer.status === 'blocked' ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
                            >
                                {selectedCustomer.status === 'blocked' ? <CheckCircle2 size={16}/> : <Ban size={16}/>}
                                {selectedCustomer.status === 'blocked' ? 'Mở khóa' : 'Chặn khách'}
                            </button>
                         </>
                     ) : (
                         <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold hover:bg-indigo-700 transition-colors">
                             <Save size={16}/> Lưu thay đổi
                         </button>
                     )}
                     <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                        <X size={24}/>
                     </button>
                  </div>
               </div>

               {/* Modal Content - 2 Columns */}
               <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {/* Left Column: Profile & Contact */}
                  <div className="w-full md:w-1/3 border-r border-slate-100 bg-white p-6 overflow-y-auto">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <User size={16} className="text-indigo-600"/> Thông tin cá nhân
                      </h3>
                      
                      <div className="space-y-4 text-sm">
                          <div>
                              <label className="block text-slate-500 text-xs font-bold mb-1">Họ và tên</label>
                              {isEditing ? (
                                  <input 
                                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={editFormData.name || ''}
                                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                  />
                              ) : (
                                  <div className="font-medium text-slate-800">{selectedCustomer.name}</div>
                              )}
                          </div>
                          <div>
                              <label className="block text-slate-500 text-xs font-bold mb-1">Số điện thoại</label>
                              {isEditing ? (
                                  <input 
                                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={editFormData.phone || ''}
                                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                                  />
                              ) : (
                                  <div className="font-medium text-slate-800">{selectedCustomer.phone}</div>
                              )}
                          </div>
                          <div>
                              <label className="block text-slate-500 text-xs font-bold mb-1">Email</label>
                              {isEditing ? (
                                  <input 
                                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={editFormData.email || ''}
                                    onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                                  />
                              ) : (
                                  <div className="font-medium text-slate-800">{selectedCustomer.email || 'Chưa cập nhật'}</div>
                              )}
                          </div>
                          
                          <div className="pt-4 border-t border-slate-100">
                              <label className="block text-slate-500 text-xs font-bold mb-1 flex items-center gap-1">
                                  <MapPin size={12}/> Địa chỉ nhận hàng
                              </label>
                              {isEditing ? (
                                  <>
                                    <textarea 
                                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-2"
                                        value={editFormData.address || ''}
                                        onChange={e => setEditFormData({...editFormData, address: e.target.value})}
                                        rows={2}
                                        placeholder="Số nhà, đường..."
                                    />
                                    <input 
                                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={editFormData.city || ''}
                                        onChange={e => setEditFormData({...editFormData, city: e.target.value})}
                                        placeholder="Tỉnh / Thành phố"
                                    />
                                  </>
                              ) : (
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                                      {selectedCustomer.address}
                                      <br/>
                                      <span className="font-bold text-indigo-600">{selectedCustomer.city}</span>
                                  </div>
                              )}
                          </div>

                          <div className="pt-4 border-t border-slate-100">
                              <label className="block text-slate-500 text-xs font-bold mb-2">Phân loại (Tags)</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                  {(isEditing ? editFormData.tags : selectedCustomer.tags)?.map(tag => (
                                      <span key={tag} className={`px-2 py-1 rounded text-xs border flex items-center gap-1 ${getTagStyle(tag)}`}>
                                          {tag}
                                          {isEditing && (
                                              <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={12}/></button>
                                          )}
                                      </span>
                                  ))}
                              </div>
                              {isEditing && (
                                  <div className="flex gap-2">
                                      <input 
                                          className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                          placeholder="Nhập tag mới..."
                                          value={newTagInput}
                                          onChange={e => setNewTagInput(e.target.value)}
                                          onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                      />
                                      <button onClick={handleAddTag} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-slate-600"><Plus size={14}/></button>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Stats & History */}
                  <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">
                      {/* Key Stats Row */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Tổng chi tiêu</div>
                            <div className="text-lg font-black text-indigo-600">{formatCurrency(selectedCustomer.totalSpent)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Đơn hàng</div>
                            <div className="text-lg font-black text-slate-800">{selectedCustomer.totalOrders}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Uy tín</div>
                            <div className={`text-lg font-black ${selectedCustomer.successRate > 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedCustomer.successRate}%
                            </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-6">
                          <h4 className="font-bold text-slate-800 text-sm mb-2">Ghi chú nội bộ</h4>
                          {isEditing ? (
                              <textarea 
                                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white"
                                rows={3}
                                value={editFormData.notes || ''}
                                onChange={e => setEditFormData({...editFormData, notes: e.target.value})}
                                placeholder="Ghi chú về khách hàng này..."
                              />
                          ) : (
                              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 italic">
                                  "{selectedCustomer.notes || 'Chưa có ghi chú đặc biệt.'}"
                              </div>
                          )}
                      </div>

                      {/* Order History */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Clock size={16} className="text-indigo-600"/> Lịch sử mua hàng
                            </h3>
                            <span className="text-xs text-slate-500">5 đơn gần nhất</span>
                        </div>
                        <div className="space-y-3">
                            {customerOrders.length > 0 ? customerOrders.map((order, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all cursor-pointer shadow-sm group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm ${order.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                        {order.status === 'delivered' ? <CheckCircle2 size={18}/> : <Clock size={18}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{order.id}</div>
                                        <div className="text-xs text-slate-500">{order.date} • {order.items.length} SP</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-indigo-600 text-sm">{formatCurrency(order.total)}</div>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5">
                                            {LOGOS[order.platform] && <img src={LOGOS[order.platform]} className="w-full h-full object-contain"/>}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{order.platform}</span>
                                    </div>
                                </div>
                            </div>
                            )) : (
                                <div className="text-center py-8 text-slate-400 text-sm italic">Chưa có lịch sử đơn hàng.</div>
                            )}
                        </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CustomerList;
