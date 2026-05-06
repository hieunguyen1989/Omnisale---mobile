
import React, { useState, useMemo } from 'react';
import { 
  BookText, Upload, Filter, Search, Plus, FileText, Download, 
  Trash2, Eye, Edit3, X, Check, Calendar, User, DollarSign, 
  Loader2, ScanLine, Image as ImageIcon, PieChart, ArrowUpRight, ArrowDownRight, Wallet, Receipt, AlignLeft, CreditCard, Paperclip, File as FileIcon, Clock, Printer, Save, ChevronRight
} from 'lucide-react';
import { MOCK_INVOICES, MOCK_LEDGER_RECORDS } from '../services/mockData';
import { Invoice, LedgerRecord } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

type ModuleType = 'ledger' | 'invoices-out' | 'invoices-in';
type DatePreset = 'today' | 'yesterday' | 'last7days' | 'thisweek' | 'lastweek' | 'thismonth' | 'lastmonth' | 'thisquarter' | 'thisyear' | 'all';

const InvoiceManager: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('invoices-out');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>(MOCK_LEDGER_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [datePreset, setDatePreset] = useState<DatePreset>('thismonth');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Upload & OCR State
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isUploadMode, setIsUploadMode] = useState(false);

  // Detail/Edit Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);

  // Ledger Transaction Modal
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'receipt' | 'payment'>('receipt');
  const [transactionForm, setTransactionForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    partnerName: '',
    method: 'cash' as 'cash' | 'bank'
  });
  const [transactionFiles, setTransactionFiles] = useState<File[]>([]);

  // File Preview Modal
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Date Logic Helper
  const checkDateRange = (dateStr: string) => {
    if (datePreset === 'all') return true;
    const recordDate = new Date(dateStr);
    const today = new Date();
    
    switch (datePreset) {
      case 'today':
        return recordDate.toDateString() === new Date().toDateString();
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return recordDate.toDateString() === yesterday.toDateString();
      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        return recordDate >= last7 && recordDate <= new Date();
      case 'thisweek':
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        return recordDate >= firstDayOfWeek;
      case 'lastweek':
        const firstDayLastWeek = new Date(today.setDate(today.getDate() - today.getDay() - 6));
        const lastDayLastWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return recordDate >= firstDayLastWeek && recordDate <= lastDayLastWeek;
      case 'thismonth':
        const startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        return recordDate >= startMonth;
      case 'lastmonth':
        const startLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
        return recordDate >= startLastMonth && recordDate <= endLastMonth;
      case 'thisquarter':
        const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
        const startQuarter = new Date(new Date().getFullYear(), (currentQuarter - 1) * 3, 1);
        return recordDate >= startQuarter;
      case 'thisyear':
        const startYear = new Date(new Date().getFullYear(), 0, 1);
        return recordDate >= startYear;
      default:
        return true;
    }
  };

  // Ledger Logic
  const filteredLedgerRecords = useMemo(() => {
    return ledgerRecords.filter(r => checkDateRange(r.date));
  }, [ledgerRecords, datePreset]);

  const ledgerStats = useMemo(() => {
    const totalReceipt = filteredLedgerRecords.filter(r => r.type === 'receipt').reduce((acc, r) => acc + r.amount, 0);
    const totalPayment = filteredLedgerRecords.filter(r => r.type === 'payment').reduce((acc, r) => acc + r.amount, 0);
    const balance = totalReceipt - totalPayment;
    return { totalReceipt, totalPayment, balance };
  }, [filteredLedgerRecords]);

  // Derived Data for Invoices
  const currentInvoices = useMemo(() => {
    const type = activeModule === 'invoices-in' ? 'input' : 'output';
    return invoices.filter(inv => inv.type === type);
  }, [invoices, activeModule]);

  const filteredInvoices = useMemo(() => {
    return currentInvoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.staffName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchesDate = checkDateRange(inv.date);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [currentInvoices, searchTerm, filterStatus, datePreset]);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      setUploadQueue(files);
      simulateOCR(files);
    }
  };

  const simulateOCR = (files: File[]) => {
    setIsProcessing(true);
    setOcrProgress(0);
    
    const interval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Create mock invoices from files
          const type: 'input' | 'output' = activeModule === 'invoices-in' ? 'input' : 'output';
          const newInvoices: Invoice[] = files.map((file, idx) => ({
             id: `INV-${Date.now()}-${idx}`,
             type: type,
             invoiceNumber: `OCR-${Math.floor(Math.random() * 10000)}`,
             date: new Date().toISOString().split('T')[0],
             partnerName: type === 'input' ? 'NCC Tự động' : 'Khách hàng OCR',
             totalAmount: Math.floor(Math.random() * 5000000) + 100000,
             preTaxAmount: 0, 
             vatAmount: 0,
             vatRate: 10,
             items: 'Sản phẩm được quét tự động...',
             status: 'unpaid' as const,
             paymentMethod: 'transfer' as const,
             staffName: 'Admin',
             folder: 'Tháng 5/2025',
             imageUrl: URL.createObjectURL(file),
             attachments: [URL.createObjectURL(file)],
             createdAt: new Date().toLocaleString('vi-VN'),
             creator: 'Nguyễn Văn Chủ'
          })).map(inv => ({
             ...inv,
             preTaxAmount: Math.round(inv.totalAmount / 1.1),
             vatAmount: Math.round(inv.totalAmount - (inv.totalAmount / 1.1))
          }));

          setInvoices(prev => [...newInvoices, ...prev]);
          setUploadQueue([]);
          alert(`Đã xử lý xong ${files.length} hóa đơn!`);
          setIsUploadMode(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    }
  };

  const handleSaveEdit = () => {
    if (editedInvoice) {
      setInvoices(prev => prev.map(i => i.id === editedInvoice.id ? editedInvoice : i));
      setSelectedInvoice(editedInvoice);
      setIsEditMode(false);
    }
  };

  // Transaction Handlers
  const openTransactionModal = (type: 'receipt' | 'payment') => {
    setTransactionType(type);
    setTransactionForm({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: type === 'receipt' ? 'Doanh thu bán hàng' : 'Chi phí vận hành',
      description: '',
      partnerName: '',
      method: 'cash'
    });
    setTransactionFiles([]);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (transactionForm.amount <= 0) {
      alert("Số tiền phải lớn hơn 0");
      return;
    }
    if (!transactionForm.description) {
      alert("Vui lòng nhập diễn giải");
      return;
    }

    const attachmentUrls = transactionFiles.map(file => URL.createObjectURL(file));

    const newRecord: LedgerRecord = {
      id: `LEG-${Date.now()}`,
      type: transactionType,
      ...transactionForm,
      attachments: attachmentUrls,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setLedgerRecords([newRecord, ...ledgerRecords]);
    setIsTransactionModalOpen(false);
  };

  // Export to Excel (CSV Simulation)
  const handleExportExcel = () => {
    let headers = [];
    let rows = [];
    const bom = "\uFEFF"; // UTF-8 BOM

    if (activeModule === 'ledger') {
      headers = ['Mã phiếu', 'Ngày tạo', 'Ngày giao dịch', 'Loại', 'Diễn giải', 'Số tiền', 'Đối tượng', 'File đính kèm'];
      rows = filteredLedgerRecords.map(r => [
        r.id, 
        r.createdAt, 
        r.date, 
        r.type === 'receipt' ? 'Thu' : 'Chi', 
        r.description, 
        r.amount, 
        r.partnerName || '', 
        r.attachments?.length || 0
      ]);
    } else {
      headers = ['Số Hóa đơn', 'Ngày tạo', 'Ngày chứng từ', 'Đối tác', 'Tổng tiền', 'VAT', 'Trạng thái', 'Người tạo'];
      rows = filteredInvoices.map(i => [
        i.invoiceNumber, 
        i.createdAt, 
        i.date, 
        i.partnerName, 
        i.totalAmount, 
        i.vatAmount, 
        i.status,
        i.creator || ''
      ]);
    }

    const csvContent = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeModule}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFilePreview = (files: string[] | undefined) => {
    if (files && files.length > 0) {
      setPreviewFiles(files);
      setIsPreviewOpen(true);
    }
  };

  const renderSideMenu = () => (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
       <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
             <BookText className="text-indigo-600" /> Sổ & Hóa Đơn
          </h2>
       </div>
       <nav className="p-2 space-y-1">
          <button 
            onClick={() => { setActiveModule('invoices-out'); setIsUploadMode(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeModule === 'invoices-out' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <FileText size={18} /> Hóa đơn Bán ra
          </button>
          <button 
            onClick={() => { setActiveModule('invoices-in'); setIsUploadMode(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeModule === 'invoices-in' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <Download size={18} /> Hóa đơn Mua vào
          </button>
          <div className="my-2 border-t border-slate-100"></div>
          <button 
            onClick={() => setActiveModule('ledger')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeModule === 'ledger' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <Wallet size={18} /> Sổ Quỹ (Thu/Chi)
          </button>
       </nav>
    </div>
  );

  const renderLedger = () => (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 p-6 animate-fade-in overflow-hidden">
       {/* Dashboard Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ArrowDownRight size={20}/></div>
                <span className="text-sm text-slate-500 font-medium">Tổng Thu</span>
             </div>
             <div className="text-2xl font-bold text-slate-800">{formatCurrency(ledgerStats.totalReceipt)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowUpRight size={20}/></div>
                <span className="text-sm text-slate-500 font-medium">Tổng Chi</span>
             </div>
             <div className="text-2xl font-bold text-slate-800">{formatCurrency(ledgerStats.totalPayment)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Wallet size={20}/></div>
                <span className="text-sm text-slate-500 font-medium">Tồn Quỹ</span>
             </div>
             <div className={`text-2xl font-bold ${ledgerStats.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatCurrency(ledgerStats.balance)}</div>
          </div>
       </div>

       {/* Actions & List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white flex-wrap gap-2">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={18} className="text-slate-400" /> Sổ Chi Tiết
             </h3>
             <div className="flex items-center gap-2">
                <div className="relative">
                   <select 
                     value={datePreset} 
                     onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                     className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                   >
                      <option value="today">Hôm nay</option>
                      <option value="yesterday">Hôm qua</option>
                      <option value="last7days">7 ngày qua</option>
                      <option value="thisweek">Tuần này</option>
                      <option value="lastweek">Tuần trước</option>
                      <option value="thismonth">Tháng này</option>
                      <option value="lastmonth">Tháng trước</option>
                      <option value="thisquarter">Quý này</option>
                      <option value="thisyear">Năm nay</option>
                      <option value="all">Tất cả</option>
                   </select>
                   <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
                </div>
                <button onClick={handleExportExcel} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-1">
                   <Download size={14} /> Xuất Excel
                </button>
                <button 
                  onClick={() => openTransactionModal('receipt')}
                  className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-green-100"
                >
                   <Plus size={14} /> Thu
                </button>
                <button 
                  onClick={() => openTransactionModal('payment')}
                  className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-red-100"
                >
                   <Plus size={14} /> Chi
                </button>
             </div>
          </div>
          <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                   <tr>
                      <th className="px-6 py-3">Ngày GD</th>
                      <th className="px-6 py-3">Ngày tạo</th>
                      <th className="px-6 py-3">Loại</th>
                      <th className="px-6 py-3">Diễn giải</th>
                      <th className="px-6 py-3">Đối tượng</th>
                      <th className="px-6 py-3 text-right">Số tiền</th>
                      <th className="px-6 py-3 text-center">File</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredLedgerRecords.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-slate-400">Không có dữ liệu trong khoảng thời gian này</td></tr>
                   ) : (
                      filteredLedgerRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                         <td className="px-6 py-3 text-slate-500">{record.date}</td>
                         <td className="px-6 py-3 text-slate-400 text-xs">{record.createdAt || '-'}</td>
                         <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.type === 'receipt' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {record.type === 'receipt' ? 'Thu' : 'Chi'}
                            </span>
                         </td>
                         <td className="px-6 py-3">
                            <div className="font-medium text-slate-700">{record.description}</div>
                            <div className="text-xs text-slate-400">{record.category}</div>
                         </td>
                         <td className="px-6 py-3 text-slate-600">{record.partnerName || '-'}</td>
                         <td className={`px-6 py-3 text-right font-bold ${record.type === 'receipt' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.type === 'receipt' ? '+' : '-'}{formatCurrency(record.amount)}
                         </td>
                         <td className="px-6 py-3 text-center">
                            {record.attachments && record.attachments.length > 0 ? (
                               <button onClick={() => openFilePreview(record.attachments)} className="flex items-center justify-center gap-1 mx-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded transition-colors">
                                  <Paperclip size={14} />
                                  <span className="text-xs font-medium">{record.attachments.length}</span>
                               </button>
                            ) : (
                               <span className="text-slate-300">-</span>
                            )}
                         </td>
                      </tr>
                   )))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderInvoiceList = () => (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 p-6 animate-fade-in overflow-hidden">
       {/* Header & Actions */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">
                {activeModule === 'invoices-out' ? 'Hóa đơn Bán ra' : 'Hóa đơn Mua vào'}
             </h2>
             <p className="text-sm text-slate-500">Quản lý chứng từ {activeModule === 'invoices-out' ? 'doanh thu bán hàng' : 'chi phí nhập hàng'}.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleExportExcel} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                <Download size={16} /> Xuất Excel
             </button>
             <button 
                onClick={() => setIsUploadMode(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
             >
                <Upload size={16} /> Tải hóa đơn (OCR)
             </button>
             <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus size={16} /> Tạo mới
             </button>
          </div>
       </div>

       {/* Filters */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center mb-4">
          <div className="relative flex-1 min-w-[200px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder={`Tìm theo số HĐ, ${activeModule === 'invoices-out' ? 'khách hàng' : 'nhà cung cấp'}...`}
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
          </div>
          <div className="relative min-w-[150px]">
             <select 
               value={datePreset} 
               onChange={(e) => setDatePreset(e.target.value as DatePreset)}
               className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
             >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="last7days">7 ngày qua</option>
                <option value="thisweek">Tuần này</option>
                <option value="lastweek">Tuần trước</option>
                <option value="thismonth">Tháng này</option>
                <option value="lastmonth">Tháng trước</option>
                <option value="thisquarter">Quý này</option>
                <option value="thisyear">Năm nay</option>
                <option value="all">Tất cả thời gian</option>
             </select>
             <Calendar size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
             <option value="all">Tất cả trạng thái</option>
             <option value="paid">Đã thanh toán</option>
             <option value="unpaid">Chưa thanh toán</option>
             <option value="cancelled">Đã hủy</option>
          </select>
       </div>

       {/* Table */}
       {isUploadMode ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center p-10 animate-fade-in relative">
             <button onClick={() => setIsUploadMode(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
             <div className="w-full max-w-xl text-center space-y-6">
                <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-12 hover:border-indigo-500 transition-colors cursor-pointer relative group">
                   <input 
                     type="file" 
                     multiple 
                     accept="image/*,application/pdf"
                     onChange={handleFileUpload}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                         <ScanLine size={32} />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-slate-800">Quét hóa đơn tự động</h3>
                         <p className="text-slate-500 mt-1">Hệ thống sẽ tự động trích xuất thông tin từ ảnh/PDF</p>
                      </div>
                   </div>
                </div>
                {isProcessing && (
                   <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-indigo-600 text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Đang xử lý OCR...</span>
                         <span className="text-xs text-slate-500">{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                         <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
                      </div>
                   </div>
                )}
             </div>
          </div>
       ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
             <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                         <th className="px-6 py-4">Số Hóa Đơn</th>
                         <th className="px-6 py-4">Ngày CT / Tạo</th>
                         <th className="px-6 py-4">{activeModule === 'invoices-out' ? 'Khách hàng' : 'Nhà cung cấp'}</th>
                         <th className="px-6 py-4 text-right">Tổng tiền</th>
                         <th className="px-6 py-4 text-center">Trạng thái</th>
                         <th className="px-6 py-4 text-center">File</th>
                         <th className="px-6 py-4">Người tạo</th>
                         <th className="px-6 py-4 text-right">Hành động</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.length === 0 ? (
                         <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không tìm thấy hóa đơn nào trong khoảng thời gian này</td></tr>
                      ) : (
                         filteredInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50 group">
                               <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                                  {inv.invoiceNumber}
                               </td>
                               <td className="px-6 py-4">
                                  <div className="text-slate-700">{inv.date}</div>
                                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock size={10}/> {inv.createdAt || '-'}</div>
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-700">
                                  {inv.partnerName}
                                  <div className="text-xs text-slate-400 font-normal truncate max-w-[150px]">{inv.items}</div>
                               </td>
                               <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</td>
                               <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                     inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                     inv.status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                     {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'unpaid' ? 'Chưa thanh toán' : 'Đã hủy'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-center">
                                  {(inv.attachments && inv.attachments.length > 0) || inv.imageUrl ? (
                                     <button 
                                       onClick={() => openFilePreview(inv.attachments || (inv.imageUrl ? [inv.imageUrl] : []))} 
                                       className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors mx-auto block"
                                     >
                                        <Paperclip size={14} />
                                     </button>
                                  ) : (
                                     <span className="text-slate-300">-</span>
                                  )}
                               </td>
                               <td className="px-6 py-4 text-slate-500 text-xs">
                                  {inv.creator || 'Admin'}
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => { setSelectedInvoice(inv); setIsEditMode(false); setEditedInvoice(inv); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Eye size={18} /></button>
                                     <button onClick={() => { setSelectedInvoice(inv); setIsEditMode(true); setEditedInvoice(inv); }} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"><Edit3 size={18} /></button>
                                     <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                  </div>
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
       {/* 1. Side Menu */}
       {renderSideMenu()}

       {/* 2. Main Content */}
       <div className="flex-1 overflow-hidden">
          {activeModule === 'ledger' ? renderLedger() : renderInvoiceList()}
       </div>

       {/* 3. Global Modals (Popups) */}
       
       {/* Transaction Modal (Thu/Chi) */}
       {isTransactionModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className={`p-4 border-b flex justify-between items-center ${transactionType === 'receipt' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                   <h3 className={`font-bold text-lg flex items-center gap-2 ${transactionType === 'receipt' ? 'text-green-700' : 'text-red-700'}`}>
                      {transactionType === 'receipt' ? <ArrowDownRight size={20}/> : <ArrowUpRight size={20}/>}
                      {transactionType === 'receipt' ? 'Tạo Phiếu Thu' : 'Tạo Phiếu Chi'}
                   </h3>
                   <button onClick={() => setIsTransactionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền <span className="text-red-500">*</span></label>
                      <div className="relative">
                         <input 
                           type="number" 
                           value={transactionForm.amount}
                           onChange={(e) => setTransactionForm({...transactionForm, amount: Number(e.target.value)})}
                           className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                         />
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VND</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Ngày chứng từ</label>
                         <input 
                           type="date" 
                           value={transactionForm.date}
                           onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức</label>
                         <select 
                           value={transactionForm.method}
                           onChange={(e) => setTransactionForm({...transactionForm, method: e.target.value as any})}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                         >
                            <option value="cash">Tiền mặt</option>
                            <option value="bank">Chuyển khoản</option>
                         </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hạng mục</label>
                      <input 
                        type="text" 
                        value={transactionForm.category}
                        onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                        placeholder="VD: Doanh thu, Điện nước, Lương..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Đối tượng (Người nộp/nhận)</label>
                      <input 
                        type="text" 
                        value={transactionForm.partnerName}
                        onChange={(e) => setTransactionForm({...transactionForm, partnerName: e.target.value})}
                        placeholder="Tên khách hàng hoặc NCC"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Diễn giải <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={2}
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        placeholder="Nhập nội dung chi tiết..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                   </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                   <button onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                   <button 
                     onClick={handleSaveTransaction}
                     className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow-sm ${transactionType === 'receipt' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                   >
                      Lưu phiếu
                   </button>
                </div>
             </div>
          </div>
       )}

       {/* Invoice Detail Modal */}
       {selectedInvoice && editedInvoice && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${editedInvoice.type === 'output' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                         {editedInvoice.type === 'output' ? <FileText size={20}/> : <Download size={20}/>}
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg">
                            {isEditMode ? 'Chỉnh sửa hóa đơn' : 'Chi tiết hóa đơn'} <span className="font-mono text-slate-500">#{editedInvoice.invoiceNumber}</span>
                         </h3>
                         <p className="text-xs text-slate-500">{editedInvoice.type === 'output' ? 'Bán ra' : 'Mua vào'} • {editedInvoice.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      {!isEditMode && (
                         <button onClick={() => setIsEditMode(true)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600" title="Chỉnh sửa"><Edit3 size={18}/></button>
                      )}
                      <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg text-slate-400"><X size={20}/></button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h4 className="font-bold text-slate-700 border-b pb-2 mb-4">Thông tin chung</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số hóa đơn</label>
                               <input 
                                 type="text" 
                                 disabled={!isEditMode}
                                 value={editedInvoice.invoiceNumber}
                                 onChange={(e) => setEditedInvoice({...editedInvoice, invoiceNumber: e.target.value})}
                                 className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm font-mono focus:ring-indigo-500 disabled:text-slate-500"
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày chứng từ</label>
                               <input 
                                 type="date" 
                                 disabled={!isEditMode}
                                 value={editedInvoice.date}
                                 onChange={(e) => setEditedInvoice({...editedInvoice, date: e.target.value})}
                                 className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đối tác (Khách/NCC)</label>
                            <input 
                              type="text" 
                              disabled={!isEditMode}
                              value={editedInvoice.partnerName}
                              onChange={(e) => setEditedInvoice({...editedInvoice, partnerName: e.target.value})}
                              className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã số thuế</label>
                            <input 
                              type="text" 
                              disabled={!isEditMode}
                              value={editedInvoice.partnerTaxCode || ''}
                              onChange={(e) => setEditedInvoice({...editedInvoice, partnerTaxCode: e.target.value})}
                              className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung / Mặt hàng</label>
                            <textarea 
                              disabled={!isEditMode}
                              rows={3}
                              value={editedInvoice.items}
                              onChange={(e) => setEditedInvoice({...editedInvoice, items: e.target.value})}
                              className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500 resize-none"
                            />
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="font-bold text-slate-700 border-b pb-2 mb-4">Giá trị & Thanh toán</h4>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tổng tiền thanh toán</label>
                            <div className="relative">
                               <input 
                                 type="number" 
                                 disabled={!isEditMode}
                                 value={editedInvoice.totalAmount}
                                 onChange={(e) => {
                                    const total = Number(e.target.value);
                                    const preTax = Math.round(total / (1 + editedInvoice.vatRate/100));
                                    const vat = total - preTax;
                                    setEditedInvoice({...editedInvoice, totalAmount: total, preTaxAmount: preTax, vatAmount: vat});
                                 }}
                                 className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-lg font-bold text-slate-800 focus:ring-indigo-500 disabled:text-slate-500"
                               />
                               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">VND</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiền trước thuế</label>
                               <input 
                                 type="text" 
                                 disabled 
                                 value={formatCurrency(editedInvoice.preTaxAmount)}
                                 className="w-full border-slate-200 rounded bg-slate-100 px-2 py-1.5 text-sm text-slate-500 cursor-not-allowed"
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiền thuế ({editedInvoice.vatRate}%)</label>
                               <input 
                                 type="text" 
                                 disabled 
                                 value={formatCurrency(editedInvoice.vatAmount)}
                                 className="w-full border-slate-200 rounded bg-slate-100 px-2 py-1.5 text-sm text-slate-500 cursor-not-allowed"
                               />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
                               <select 
                                 disabled={!isEditMode}
                                 value={editedInvoice.status}
                                 onChange={(e) => setEditedInvoice({...editedInvoice, status: e.target.value as any})}
                                 className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500"
                               >
                                  <option value="paid">Đã thanh toán</option>
                                  <option value="unpaid">Chưa thanh toán</option>
                                  <option value="cancelled">Đã hủy</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hình thức TT</label>
                               <select 
                                 disabled={!isEditMode}
                                 value={editedInvoice.paymentMethod}
                                 onChange={(e) => setEditedInvoice({...editedInvoice, paymentMethod: e.target.value as any})}
                                 className="w-full border-slate-200 rounded bg-slate-50 px-2 py-1.5 text-sm focus:ring-indigo-500 disabled:text-slate-500"
                               >
                                  <option value="transfer">Chuyển khoản</option>
                                  <option value="cash">Tiền mặt</option>
                                  <option value="card">Thẻ</option>
                               </select>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Attachment Preview */}
                   <div className="mt-6 border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                         <Paperclip size={16}/> File đính kèm
                      </h4>
                      {editedInvoice.imageUrl ? (
                         <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative group">
                            <img src={editedInvoice.imageUrl} className="h-full object-contain" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button onClick={() => openFilePreview([editedInvoice.imageUrl!])} className="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-100">
                                  Xem toàn màn hình
                               </button>
                            </div>
                         </div>
                      ) : (
                         <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            Không có hình ảnh đính kèm
                         </div>
                      )}
                   </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                   {isEditMode ? (
                      <>
                         <button onClick={() => { setIsEditMode(false); setEditedInvoice(selectedInvoice); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Hủy bỏ</button>
                         <button onClick={handleSaveEdit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2">
                            <Save size={16} /> Lưu thay đổi
                         </button>
                      </>
                   ) : (
                      <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Đóng</button>
                   )}
                </div>
             </div>
          </div>
       )}

       {/* File Preview Modal */}
       {isPreviewOpen && (
          <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={18} /> Xem trước file ({previewFiles.length} file)
                   </h3>
                   <div className="flex items-center gap-2">
                      <button onClick={() => alert("Đang in...")} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600" title="In"><Printer size={18}/></button>
                      <button onClick={() => alert("Đang tải xuống...")} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600" title="Tải xuống"><Download size={18}/></button>
                      <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg text-slate-600"><X size={18}/></button>
                   </div>
                </div>
                <div className="flex-1 bg-slate-100 p-4 overflow-auto flex flex-col gap-4 items-center">
                   {previewFiles.map((file, idx) => (
                      <div key={idx} className="bg-white p-2 rounded shadow-sm border border-slate-200 w-full max-w-2xl">
                         {file.endsWith('.pdf') ? (
                            <div className="h-96 flex items-center justify-center bg-slate-50 text-slate-400 border border-dashed border-slate-300 rounded">
                               Preview PDF không khả dụng. <a href={file} target="_blank" rel="noreferrer" className="text-indigo-600 ml-1 underline">Mở tab mới</a>
                            </div>
                         ) : (
                            <img src={file} alt={`Attachment ${idx}`} className="w-full h-auto rounded" />
                         )}
                         <div className="mt-2 text-xs text-center text-slate-500">File {idx + 1}</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default InvoiceManager;
