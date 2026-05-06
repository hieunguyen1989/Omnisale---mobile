
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ORDERS, MOCK_TAXPAYER_INFO, MOCK_TAX_PAYMENTS, MOCK_INPUT_INVOICES } from '../services/mockData';
import { FileSpreadsheet, Calendar, Download, AlertCircle, DollarSign, Filter, Settings, FileText, History, RefreshCw, Save, Plus } from 'lucide-react';
import { Platform, TaxPayerProfile, InputInvoice } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// VN Tax Regulations for E-commerce Individuals: 1.5% Total (1% VAT + 0.5% TNCN)
const TAX_RATE_VAT = 0.01;
const TAX_RATE_PIT = 0.005;

type Tab = 'declaration' | 'input' | 'history' | 'settings';

const TaxReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('declaration');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleString());

  // Settings State
  const [taxPayer, setTaxPayer] = useState<TaxPayerProfile>(MOCK_TAXPAYER_INFO);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Filters State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor((new Date().getMonth() + 3) / 3));
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | Platform>('all');

  // Input Invoice State
  const [inputInvoices, setInputInvoices] = useState<InputInvoice[]>(MOCK_INPUT_INVOICES);

  const quarters = [1, 2, 3, 4];
  const years = [2024, 2025];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleString());
      alert("Đã đồng bộ dữ liệu doanh thu mới nhất từ các sàn!");
    }, 2000);
  };

  // Logic to parse date string "HH:mm DD/MM/YY" from mock data
  const parseMockDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(' ');
      if (parts.length < 2) return new Date();
      const dateParts = parts[1].split('/');
      // Assuming 20xx for year
      return new Date(Number(`20${dateParts[2]}`), Number(dateParts[1]) - 1, Number(dateParts[0]));
    } catch (e) {
      return new Date();
    }
  };

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter(order => {
      // 1. Only count 'delivered' orders as recognized revenue for tax
      if (order.status !== 'delivered') return false;

      // 2. Filter by Platform
      if (selectedPlatform !== 'all' && order.platform !== selectedPlatform) return false;

      // 3. Filter by Time (Quarter/Year)
      const orderDate = parseMockDate(order.date);
      const orderYear = orderDate.getFullYear();
      const orderQuarter = Math.floor((orderDate.getMonth() + 3) / 3);

      return orderYear === selectedYear && orderQuarter === selectedQuarter;
    });
  }, [selectedYear, selectedQuarter, selectedPlatform]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const vatAmount = totalRevenue * TAX_RATE_VAT;
    const pitAmount = totalRevenue * TAX_RATE_PIT;
    const totalTax = vatAmount + pitAmount;
    
    return {
      count: filteredOrders.length,
      totalRevenue,
      vatAmount,
      pitAmount,
      totalTax
    };
  }, [filteredOrders]);

  const renderDeclarationTab = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Filters */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
         <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
            <Filter size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Kỳ tính thuế:</span>
         </div>
         
         <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Năm:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
               {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
         </div>

         <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Quý:</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
               {quarters.map(q => (
                 <button
                   key={q}
                   onClick={() => setSelectedQuarter(q)}
                   className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${selectedQuarter === q ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Quý {q}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-slate-600">Sàn:</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
            >
               <option value="all">Tất cả sàn</option>
               {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
         </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-slate-500 text-sm font-medium mb-2">Tổng doanh thu chịu thuế</div>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-slate-400 mt-1">Đã giao thành công: {stats.count} đơn</div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-slate-500 text-sm font-medium mb-2">Thuế GTGT (1%)</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.vatAmount)}</div>
            <div className="text-xs text-slate-400 mt-1">Nghĩa vụ thuế VAT</div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-slate-500 text-sm font-medium mb-2">Thuế TNCN (0.5%)</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pitAmount)}</div>
            <div className="text-xs text-slate-400 mt-1">Thu nhập cá nhân</div>
         </div>

         <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="text-indigo-700 text-sm font-bold mb-2 flex items-center gap-2">
               <DollarSign size={16} /> TỔNG THUẾ PHẢI NỘP
            </div>
            <div className="text-3xl font-bold text-indigo-700">{formatCurrency(stats.totalTax)}</div>
            <div className="text-xs text-indigo-500 mt-1">Tạm tính (1.5% doanh thu)</div>
         </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
         <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
         <div className="text-sm text-blue-800">
            <strong>Lưu ý quan trọng:</strong> Theo quy định hiện hành, các sàn TMĐT đã thực hiện việc cung cấp thông tin doanh thu của người bán cho cơ quan thuế. Vui lòng đối soát kỹ số liệu "Đã giao thành công" bên dưới với dữ liệu trên sàn để kê khai chính xác.
         </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Bảng kê chi tiết đơn hàng (Quý {selectedQuarter}/{selectedYear})</h3>
            <button 
                onClick={() => alert("Đã xuất file XML theo mẫu 01/CNKD!")}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm transition-colors"
            >
                <Download size={14} /> Xuất XML (01/CNKD)
            </button>
         </div>
         <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-sm text-left">
               <thead className="bg-white text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                     <th className="px-6 py-3">Ngày chứng từ</th>
                     <th className="px-6 py-3">Mã đơn hàng</th>
                     <th className="px-6 py-3">Sàn TMĐT</th>
                     <th className="px-6 py-3">Khách hàng</th>
                     <th className="px-6 py-3 text-right">Doanh thu (VNĐ)</th>
                     <th className="px-6 py-3 text-right">Thuế GTGT (1%)</th>
                     <th className="px-6 py-3 text-right">Thuế TNCN (0.5%)</th>
                     <th className="px-6 py-3 text-right">Tổng thuế</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                     <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                           Không có đơn hàng nào đã giao thành công trong kỳ này.
                        </td>
                     </tr>
                  ) : (
                     filteredOrders.map(order => {
                        const vat = order.total * TAX_RATE_VAT;
                        const pit = order.total * TAX_RATE_PIT;
                        return (
                           <tr key={order.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 text-slate-600">{order.date.split(' ')[1]}</td>
                              <td className="px-6 py-3 font-medium text-slate-800">{order.id}</td>
                              <td className="px-6 py-3">
                                 <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                    {order.platform}
                                 </span>
                              </td>
                              <td className="px-6 py-3 text-slate-600">{order.customerName}</td>
                              <td className="px-6 py-3 text-right font-bold text-slate-700">{formatCurrency(order.total)}</td>
                              <td className="px-6 py-3 text-right text-slate-500">{formatCurrency(vat)}</td>
                              <td className="px-6 py-3 text-right text-slate-500">{formatCurrency(pit)}</td>
                              <td className="px-6 py-3 text-right font-medium text-orange-600">{formatCurrency(vat + pit)}</td>
                           </tr>
                        );
                     })
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderInputTab = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-slate-800 text-lg">Bảng kê Mua vào</h3>
                 <p className="text-sm text-slate-500">Quản lý hóa đơn đầu vào để chứng minh nguồn gốc xuất xứ hàng hóa.</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 transition-colors">
                 <Plus size={18} /> Thêm hóa đơn
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3">Ngày HĐ</th>
                       <th className="px-4 py-3">Số Hóa Đơn</th>
                       <th className="px-4 py-3">Người bán</th>
                       <th className="px-4 py-3">MST Người bán</th>
                       <th className="px-4 py-3">Diễn giải</th>
                       <th className="px-4 py-3 text-right">Giá trị hàng</th>
                       <th className="px-4 py-3 text-center">Hành động</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {inputInvoices.map(inv => (
                       <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{inv.date}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3">{inv.sellerName}</td>
                          <td className="px-4 py-3 text-slate-500">{inv.sellerTaxCode}</td>
                          <td className="px-4 py-3 max-w-xs truncate">{inv.description}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatCurrency(inv.totalAmount)}</td>
                          <td className="px-4 py-3 text-center">
                             <button className="text-indigo-600 hover:underline text-xs">Xem ảnh</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
     </div>
  );

  const renderHistoryTab = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Lịch sử nộp thuế</h3>
              <p className="text-sm text-slate-500">Theo dõi các khoản thuế đã nộp vào ngân sách nhà nước.</p>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3">Ngày nộp</th>
                       <th className="px-4 py-3">Kỳ thuế</th>
                       <th className="px-4 py-3">Nội dung</th>
                       <th className="px-4 py-3 text-right">Số tiền</th>
                       <th className="px-4 py-3 text-center">Trạng thái</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {MOCK_TAX_PAYMENTS.map(pay => (
                       <tr key={pay.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{pay.date}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">Quý {pay.quarter}/{pay.year}</td>
                          <td className="px-4 py-3">{pay.note}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(pay.amount)}</td>
                          <td className="px-4 py-3 text-center">
                             <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                Đã nộp
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
     </div>
  );

  const renderSettingsTab = () => (
     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fade-in max-w-3xl">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="font-bold text-slate-800 text-lg">Thông tin người nộp thuế</h3>
             <p className="text-sm text-slate-500">Cấu hình thông tin để xuất báo cáo chính xác.</p>
           </div>
           <button 
             onClick={() => setIsEditingSettings(!isEditingSettings)}
             className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
           >
             {isEditingSettings ? <Save size={16} /> : <Settings size={16} />}
             {isEditingSettings ? 'Lưu thông tin' : 'Chỉnh sửa'}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên người nộp thuế</label>
              <input 
                 type="text" 
                 disabled={!isEditingSettings}
                 value={taxPayer.name}
                 onChange={(e) => setTaxPayer({...taxPayer, name: e.target.value})}
                 className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 disabled:bg-slate-50"
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế (MST)</label>
              <input 
                 type="text" 
                 disabled={!isEditingSettings}
                 value={taxPayer.taxCode}
                 onChange={(e) => setTaxPayer({...taxPayer, taxCode: e.target.value})}
                 className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 disabled:bg-slate-50"
              />
           </div>
           <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ kinh doanh</label>
              <input 
                 type="text" 
                 disabled={!isEditingSettings}
                 value={taxPayer.address}
                 onChange={(e) => setTaxPayer({...taxPayer, address: e.target.value})}
                 className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 disabled:bg-slate-50"
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cơ quan thuế quản lý</label>
              <input 
                 type="text" 
                 disabled={!isEditingSettings}
                 value={taxPayer.taxAuthority}
                 onChange={(e) => setTaxPayer({...taxPayer, taxAuthority: e.target.value})}
                 className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 disabled:bg-slate-50"
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức kinh doanh</label>
              <select 
                 disabled={!isEditingSettings}
                 value={taxPayer.businessType}
                 onChange={(e) => setTaxPayer({...taxPayer, businessType: e.target.value as any})}
                 className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 disabled:bg-slate-50"
              >
                 <option value="individual">Cá nhân kinh doanh</option>
                 <option value="household">Hộ kinh doanh</option>
                 <option value="company">Doanh nghiệp</option>
              </select>
           </div>
        </div>
     </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-600" /> Báo cáo Thuế (VN)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hỗ trợ kê khai thuế cho Hộ kinh doanh TMĐT theo Nghị định 91/2022/NĐ-CP.
          </p>
        </div>
        
        <div className="flex gap-2">
            <button 
               onClick={handleSync}
               disabled={isSyncing}
               className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
            >
               <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} /> 
               {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
            </button>
        </div>
      </div>

      <div className="text-xs text-slate-400 flex justify-end">
         Cập nhật lần cuối: {lastSyncTime}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl">
         <button 
           onClick={() => setActiveTab('declaration')}
           className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'declaration' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
         >
           <FileText size={16} /> Tờ khai (Doanh thu)
         </button>
         <button 
           onClick={() => setActiveTab('input')}
           className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'input' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
         >
           <Download size={16} /> Bảng kê Mua vào
         </button>
         <button 
           onClick={() => setActiveTab('history')}
           className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
         >
           <History size={16} /> Lịch sử nộp thuế
         </button>
         <button 
           onClick={() => setActiveTab('settings')}
           className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
         >
           <Settings size={16} /> Cấu hình Thuế
         </button>
      </div>

      {/* Dynamic Content */}
      <div className="min-h-[500px]">
         {activeTab === 'declaration' && renderDeclarationTab()}
         {activeTab === 'input' && renderInputTab()}
         {activeTab === 'history' && renderHistoryTab()}
         {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default TaxReport;
