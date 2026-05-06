
import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS, MOCK_INVENTORY_LOGS, MOCK_WAREHOUSES, MOCK_SUPPLIERS } from '../services/mockData';
import { InventoryLog, Warehouse, Product, Supplier } from '../types';
import { Search, ArrowUp, ArrowDown, History, Package, AlertTriangle, Filter, Save, Building, MapPin, X, Check, ChevronLeft, ChevronRight, Truck, Users, Plus, Phone, Mail, ArrowRight, Edit, User, Settings, AlertOctagon, FileSpreadsheet, Upload, Download, Trash2, Calculator, Loader2 } from 'lucide-react';

type TransactionType = 'import' | 'export' | 'adjustment' | 'transfer';

interface TransactionItem {
    productId: string;
    product: Product;
    quantity: number;
    price: number; // Giá nhập hoặc giá xuất
}

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'suppliers'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  
  // Data State
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [logs, setLogs] = useState(MOCK_INVENTORY_LOGS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Warehouse Modal State
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [newWarehouseData, setNewWarehouseData] = useState({
    name: '',
    address: '',
    manager: ''
  });

  // Low Stock Warning State
  const [warningLevel, setWarningLevel] = useState(10);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('import');
  
  // New: Transaction State for Multi-Product
  const [transactionMeta, setTransactionMeta] = useState({
    warehouseId: warehouses[0]?.id || '',
    toWarehouseId: warehouses[1]?.id || '', // Only for transfer
    reason: '',
    supplierId: ''
  });
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Excel Import State
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState<Supplier>({
    id: '', name: '', code: '', phone: '', email: '', address: '', note: ''
  });
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Stats
  const calculateTotalStock = (p: Product) => {
    if (selectedWarehouseId === 'all') return p.stock;
    return p.warehouseStocks[selectedWarehouseId] || 0;
  };

  const currentProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStock = currentProducts.reduce((acc, p) => acc + calculateTotalStock(p), 0);
  // Value calculation: Stock * Import Price (if available) or 60% of Sale Price as fallback
  const totalValue = currentProducts.reduce((acc, p) => acc + (calculateTotalStock(p) * (p.importPrice || p.price * 0.6)), 0);
  const lowStockProducts = currentProducts.filter(p => calculateTotalStock(p) <= warningLevel);
  const lowStockCount = lowStockProducts.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getLogTypeColor = (type: InventoryLog['type']) => {
    switch (type) {
      case 'import': return 'text-green-600 bg-green-50';
      case 'export': return 'text-red-600 bg-red-50';
      case 'adjustment': return 'text-orange-600 bg-orange-50';
      case 'transfer': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedWarehouseId]);

  // Pagination Logic
  const filteredProducts = currentProducts;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredLogs = logs.filter(log => selectedWarehouseId === 'all' || log.warehouseId === selectedWarehouseId || log.toWarehouseId === selectedWarehouseId);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm));
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const currentDataCount = activeTab === 'overview' ? filteredProducts.length : activeTab === 'logs' ? filteredLogs.length : filteredSuppliers.length;
  const totalPages = Math.ceil(currentDataCount / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // -- Helpers --
  
  const calculateAveragePrice = (currentStock: number, currentAvgPrice: number, importQty: number, importPrice: number) => {
      // Avoid division by zero
      if (currentStock + importQty === 0) return 0;
      const totalValue = (currentStock * currentAvgPrice) + (importQty * importPrice);
      return Math.round(totalValue / (currentStock + importQty));
  };

  const handleExportToExcel = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (activeTab === 'overview') {
          const headers = ["Mã SKU", "Tên sản phẩm", "Giá vốn", "Giá bán", "Tồn kho", "Tổng giá trị"];
          csvContent += headers.join(",") + "\n";
          currentProducts.forEach(p => {
              const stock = calculateTotalStock(p);
              const cost = p.importPrice || 0;
              const row = [
                  p.sku,
                  `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
                  cost,
                  p.price,
                  stock,
                  stock * cost
              ];
              csvContent += row.join(",") + "\n";
          });
      } else if (activeTab === 'logs') {
          const headers = ["Thời gian", "Loại", "Kho", "Sản phẩm", "Số lượng", "Diễn giải"];
          csvContent += headers.join(",") + "\n";
          filteredLogs.forEach(l => {
              const row = [
                  l.timestamp,
                  l.type,
                  l.warehouseName,
                  `"${l.productName.replace(/"/g, '""')}"`,
                  l.quantity,
                  `"${l.reason.replace(/"/g, '""')}"`
              ];
              csvContent += row.join(",") + "\n";
          });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_export_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // -- Transaction Handlers --

  const openTransactionModal = (type: TransactionType) => {
    setModalType(type);
    setTransactionMeta({
       warehouseId: selectedWarehouseId === 'all' ? warehouses[0].id : selectedWarehouseId,
       toWarehouseId: warehouses[1]?.id || '',
       reason: '',
       supplierId: ''
    });
    setTransactionItems([]);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const addItemToTransaction = (product: Product) => {
      // Check if already added
      if (transactionItems.find(i => i.productId === product.id)) return;

      const newItem: TransactionItem = {
          productId: product.id,
          product: product,
          quantity: 1,
          // Default price: Import Price for Import, Cost Price for Export/Transfer
          price: modalType === 'import' ? 0 : (product.importPrice || 0)
      };
      setTransactionItems([...transactionItems, newItem]);
      setProductSearch('');
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: number) => {
      const newItems = [...transactionItems];
      if (field === 'quantity' || field === 'price') {
          newItems[index] = { ...newItems[index], [field]: value };
      }
      setTransactionItems(newItems);
  };

  const removeItem = (index: number) => {
      setTransactionItems(transactionItems.filter((_, i) => i !== index));
  };

  const handleTransactionSubmit = () => {
     if (transactionItems.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm.");
        return;
     }
     if (transactionItems.some(i => i.quantity <= 0)) {
         alert("Số lượng sản phẩm phải lớn hơn 0.");
         return;
     }

     if (modalType === 'transfer' && transactionMeta.warehouseId === transactionMeta.toWarehouseId) {
        alert("Kho xuất và kho nhập không được trùng nhau.");
        return;
     }

     const warehouse = warehouses.find(w => w.id === transactionMeta.warehouseId);
     const toWarehouse = warehouses.find(w => w.id === transactionMeta.toWarehouseId);
     const supplier = suppliers.find(s => s.id === transactionMeta.supplierId);

     // Check stock for export/transfer BEFORE processing
     if (modalType === 'export' || modalType === 'transfer') {
         for (const item of transactionItems) {
             const currentStock = item.product.warehouseStocks[transactionMeta.warehouseId] || 0;
             if (currentStock < item.quantity) {
                 alert(`Sản phẩm "${item.product.name}" không đủ tồn kho (Hiện có: ${currentStock}).`);
                 return;
             }
         }
     }

     const newLogs: InventoryLog[] = [];
     const timestamp = new Date().toLocaleString('vi-VN');

     // Process Updates
     let updatedProducts = [...products];

     transactionItems.forEach(item => {
         // 1. Create Log
         newLogs.push({
            id: `LOG-${Date.now()}-${item.productId}`,
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            warehouseId: transactionMeta.warehouseId,
            warehouseName: warehouse ? warehouse.name : 'Unknown',
            toWarehouseId: modalType === 'transfer' ? transactionMeta.toWarehouseId : undefined,
            toWarehouseName: modalType === 'transfer' && toWarehouse ? toWarehouse.name : undefined,
            partnerName: modalType === 'import' && supplier ? supplier.name : undefined,
            type: modalType,
            quantity: modalType === 'export' ? -item.quantity : item.quantity,
            reason: transactionMeta.reason || (modalType === 'import' ? 'Nhập hàng' : modalType === 'export' ? 'Xuất hàng' : modalType === 'transfer' ? 'Chuyển kho' : 'Kiểm kê'),
            timestamp: timestamp,
            performer: 'Admin' // Should come from user context
         });

         // 2. Update Product State
         updatedProducts = updatedProducts.map(p => {
             if (p.id === item.productId) {
                 const currentStocks = { ...p.warehouseStocks };
                 let newImportPrice = p.importPrice || 0;

                 // Calculate new weighted average price if importing
                 if (modalType === 'import') {
                     const totalCurrentStock = p.stock;
                     newImportPrice = calculateAveragePrice(totalCurrentStock, p.importPrice || 0, item.quantity, item.price);
                     currentStocks[transactionMeta.warehouseId] = (currentStocks[transactionMeta.warehouseId] || 0) + item.quantity;
                 } else if (modalType === 'export') {
                     currentStocks[transactionMeta.warehouseId] = (currentStocks[transactionMeta.warehouseId] || 0) - item.quantity;
                 } else if (modalType === 'adjustment') {
                     currentStocks[transactionMeta.warehouseId] = (currentStocks[transactionMeta.warehouseId] || 0) + item.quantity; // Adjustment can be negative, handled by quantity input if we allowed it, but here simplify to Add logic or allow user to switch modes? For simplicity, assumed adding. But wait, standard adjustment sets final stock or adds/subs. Let's assume Add for now, or allow negative input.
                 } else if (modalType === 'transfer') {
                     currentStocks[transactionMeta.warehouseId] = (currentStocks[transactionMeta.warehouseId] || 0) - item.quantity;
                     currentStocks[transactionMeta.toWarehouseId] = (currentStocks[transactionMeta.toWarehouseId] || 0) + item.quantity;
                 }

                 const newTotalStock = Object.values(currentStocks).reduce((a: number, b: number) => a + b, 0);

                 return {
                     ...p,
                     stock: newTotalStock,
                     warehouseStocks: currentStocks,
                     importPrice: newImportPrice // Update average cost
                 };
             }
             return p;
         });
     });

     setLogs([...newLogs, ...logs]);
     setProducts(updatedProducts);
     setIsModalOpen(false);
     alert("Giao dịch thành công!");
  };

  // -- Excel Import Handler --
  const handleProcessExcel = () => {
      if (!excelFile) return;
      setIsProcessingExcel(true);
      
      // Simulate processing time
      setTimeout(() => {
          setIsProcessingExcel(false);
          // Mock: create import transaction for random 5 products
          const mockItems: TransactionItem[] = products.slice(0, 5).map(p => ({
              productId: p.id,
              product: p,
              quantity: Math.floor(Math.random() * 50) + 10,
              price: p.importPrice || p.price * 0.6
          }));
          
          // Apply updates
          let updatedProducts = [...products];
          const newLogs: InventoryLog[] = [];
          const timestamp = new Date().toLocaleString('vi-VN');
          const warehouseId = warehouses[0].id; // Default to first warehouse for demo

          mockItems.forEach(item => {
              // Log
              newLogs.push({
                  id: `IMP-EXCEL-${Date.now()}-${item.productId}`,
                  productId: item.productId,
                  productName: item.product.name,
                  sku: item.product.sku,
                  warehouseId: warehouseId,
                  warehouseName: warehouses[0].name,
                  type: 'import',
                  quantity: item.quantity,
                  reason: 'Nhập hàng từ Excel',
                  timestamp: timestamp,
                  performer: 'Admin'
              });

              // Update Stock & Price
              updatedProducts = updatedProducts.map(p => {
                  if (p.id === item.productId) {
                      const currentStocks = { ...p.warehouseStocks };
                      const newPrice = calculateAveragePrice(p.stock, p.importPrice || 0, item.quantity, item.price);
                      currentStocks[warehouseId] = (currentStocks[warehouseId] || 0) + item.quantity;
                      const total = Object.values(currentStocks).reduce((a: number, b: number) => a + b, 0);
                      return { ...p, stock: total, warehouseStocks: currentStocks, importPrice: newPrice };
                  }
                  return p;
              });
          });

          setLogs([...newLogs, ...logs]);
          setProducts(updatedProducts);
          setIsImportExcelOpen(false);
          setExcelFile(null);
          alert(`Đã nhập kho thành công ${mockItems.length} sản phẩm từ file Excel!`);
      }, 1500);
  };

  // -- Supplier Handlers --
  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierFormData(supplier);
    setEditingSupplierId(supplier.id);
    setIsSupplierModalOpen(true);
  };

  const handleAddSupplier = () => {
    setSupplierFormData({ id: '', name: '', code: '', phone: '', email: '', address: '', note: '' });
    setEditingSupplierId(null);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = () => {
     if (!supplierFormData.name || !supplierFormData.phone) {
        alert("Vui lòng nhập tên và số điện thoại nhà cung cấp.");
        return;
     }

     if (editingSupplierId) {
        setSuppliers(prev => prev.map(s => s.id === editingSupplierId ? { ...supplierFormData, id: editingSupplierId } : s));
     } else {
        const newSup = { ...supplierFormData, id: `sup-${Date.now()}`, code: supplierFormData.code || `SUP${Date.now().toString().slice(-4)}` };
        setSuppliers(prev => [newSup, ...prev]);
     }
     setIsSupplierModalOpen(false);
  };

  const handleAddWarehouse = () => {
    if (!newWarehouseData.name || !newWarehouseData.address) {
        alert("Vui lòng nhập tên kho và địa chỉ.");
        return;
    }
    const newWh: Warehouse = {
        id: `wh-${Date.now()}`,
        name: newWarehouseData.name,
        address: newWarehouseData.address,
        manager: newWarehouseData.manager || 'Chưa chỉ định'
    };
    setWarehouses([...warehouses, newWh]);
    setNewWarehouseData({ name: '', address: '', manager: '' });
    setIsWarehouseModalOpen(false);
    alert("Đã tạo kho hàng mới thành công!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Quản lý Kho hàng</h2>
           <p className="text-sm text-slate-500">Theo dõi tồn kho, nhập xuất và điều chuyển giữa các kho.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-[calc(100vw-120px)] xl:max-w-md">
                <div className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${selectedWarehouseId === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setSelectedWarehouseId('all')}>
                    Tất cả kho
                </div>
                {warehouses.map(wh => (
                    <div 
                        key={wh.id} 
                        onClick={() => setSelectedWarehouseId(wh.id)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap ${selectedWarehouseId === wh.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Building size={14} /> {wh.name}
                    </div>
                ))}
            </div>

            <button 
                onClick={() => setIsWarehouseModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                title="Thêm kho mới"
            >
                <Plus size={18} /> <span className="hidden sm:inline">Thêm kho</span>
            </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
          <button onClick={() => openTransactionModal('import')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium">
             <ArrowDown size={18} /> Nhập kho
          </button>
          <button onClick={() => openTransactionModal('export')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium">
             <ArrowUp size={18} /> Xuất kho
          </button>
          <button onClick={() => openTransactionModal('transfer')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
             <ArrowRight size={18} /> Chuyển kho
          </button>
          <button onClick={() => setIsImportExcelOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
             <FileSpreadsheet size={18} /> Nhập Excel
          </button>
          <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium ml-auto">
             <Download size={18} /> Xuất dữ liệu
          </button>
      </div>

      {/* Stats Cards */}
      {selectedWarehouseId === 'all' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium">Tổng giá trị tồn kho</p>
             <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalValue)}</h3>
             <p className="text-xs text-slate-400 mt-1">Tính theo giá vốn</p>
           </div>
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
             <Package size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium">Tổng sản phẩm tồn</p>
             <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalStock.toLocaleString()}</h3>
           </div>
           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
             <Package size={24} />
           </div>
        </div>
        
        {/* Clickable Low Stock Warning Card */}
        <div 
            onClick={() => setIsWarningModalOpen(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-red-200 transition-all group"
        >
           <div>
             <p className="text-slate-500 text-sm font-medium group-hover:text-red-600 transition-colors">Cảnh báo sắp hết</p>
             <h3 className="text-2xl font-bold text-red-600 mt-1">{lowStockCount}</h3>
             <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-red-500">
                <Settings size={10} /> Mức cảnh báo: &le;{warningLevel}
             </p>
           </div>
           <div className="p-3 bg-red-50 text-red-600 rounded-lg animate-pulse group-hover:bg-red-100">
             <AlertTriangle size={24} />
           </div>
        </div>
      </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex border-b border-slate-100 shrink-0 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
           >
             <Package size={16} /> Tồn kho hiện tại
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
           >
             <History size={16} /> Lịch sử giao dịch
           </button>
           <button 
             onClick={() => setActiveTab('suppliers')}
             className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'suppliers' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
           >
             <Users size={16} /> Nhà cung cấp
           </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative w-full sm:w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder={activeTab === 'suppliers' ? "Tìm nhà cung cấp..." : "Tìm kiếm mã SKU, tên sản phẩm..."}
                   className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 {activeTab === 'suppliers' && (
                    <button onClick={handleAddSupplier} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
                       <Plus size={16} /> Thêm NCC
                    </button>
                 )}
              </div>
           </div>

           <div className="flex-1 overflow-x-auto">
           {activeTab === 'overview' && (
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3">Mã SKU</th>
                      <th className="px-4 py-3 text-right">Giá vốn (TB)</th>
                      <th className="px-4 py-3 text-center">Tồn kho</th>
                      <th className="px-4 py-3 text-right">Tổng giá trị</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map(product => {
                      const stock = calculateTotalStock(product);
                      const cost = product.importPrice || product.price * 0.6; // Fallback to estimated
                      return (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-3">
                           <img src={product.image} className="w-10 h-10 rounded border border-slate-200 object-cover shadow-sm" />
                           <span className="truncate max-w-[200px]" title={product.name}>{product.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{product.sku}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(cost)}</td>
                        <td className="px-4 py-3 text-center">
                           <span className={`px-2 py-1 rounded-full font-bold text-xs ${stock <= warningLevel ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                             {stock}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-indigo-600">{formatCurrency(stock * cost)}</td>
                      </tr>
                    )})}
                 </tbody>
               </table>
           )}

           {activeTab === 'logs' && (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <tr>
                       <th className="px-4 py-3">Thời gian</th>
                       <th className="px-4 py-3">Loại phiếu</th>
                       <th className="px-4 py-3">Kho</th>
                       <th className="px-4 py-3">Sản phẩm</th>
                       <th className="px-4 py-3 text-center">Số lượng</th>
                       <th className="px-4 py-3">Lý do</th>
                       <th className="px-4 py-3">Người thực hiện</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {paginatedLogs.map(log => (
                       <tr key={log.id} className="hover:bg-slate-50">
                         <td className="px-4 py-3 text-slate-500">{log.timestamp}</td>
                         <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getLogTypeColor(log.type)}`}>
                              {log.type === 'import' ? 'Nhập kho' : log.type === 'export' ? 'Xuất kho' : log.type === 'transfer' ? 'Chuyển kho' : 'Điều chỉnh'}
                            </span>
                         </td>
                         <td className="px-4 py-3 text-slate-600 text-xs">
                            <div className="flex items-center gap-1 font-medium"><Building size={12}/> {log.warehouseName}</div>
                            {log.type === 'transfer' && (
                               <div className="flex items-center gap-1 mt-1 text-slate-500"><ArrowRight size={12}/> {log.toWarehouseName}</div>
                            )}
                         </td>
                         <td className="px-4 py-3 font-medium text-slate-700">
                           <div>{log.productName}</div>
                           <div className="text-xs text-slate-400">{log.sku}</div>
                         </td>
                         <td className="px-4 py-3 text-center font-bold">
                           {log.quantity > 0 ? '+' : ''}{log.quantity}
                         </td>
                         <td className="px-4 py-3 text-slate-600 text-xs">
                            <div>{log.reason}</div>
                            {log.partnerName && <div className="text-indigo-600 italic">{log.partnerName}</div>}
                         </td>
                         <td className="px-4 py-3 text-slate-500">{log.performer}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
           )}

           {activeTab === 'suppliers' && (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <tr>
                       <th className="px-4 py-3">Mã NCC</th>
                       <th className="px-4 py-3">Tên Nhà Cung Cấp</th>
                       <th className="px-4 py-3">Số điện thoại</th>
                       <th className="px-4 py-3">Email</th>
                       <th className="px-4 py-3">Địa chỉ</th>
                       <th className="px-4 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {paginatedSuppliers.map(sup => (
                       <tr key={sup.id} className="hover:bg-slate-50">
                         <td className="px-4 py-3 font-mono text-slate-500">{sup.code}</td>
                         <td className="px-4 py-3 font-bold text-slate-700">{sup.name}</td>
                         <td className="px-4 py-3 text-slate-600">{sup.phone}</td>
                         <td className="px-4 py-3 text-slate-600">{sup.email}</td>
                         <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{sup.address}</td>
                         <td className="px-4 py-3 text-right">
                            <button onClick={() => handleEditSupplier(sup)} className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded">
                               <Edit size={16} />
                            </button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
           )}
           </div>
        </div>

        {/* Pagination Footer */}
        {currentDataCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
             <div className="text-sm text-slate-500">
               Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastItem, currentDataCount)}</span> trong tổng số <span className="font-medium">{currentDataCount}</span>
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 disabled={currentPage === 1}
                 className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
               <span className="text-sm font-medium text-slate-700">Trang {currentPage} / {totalPages}</span>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages}
                 className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
               >
                 <ChevronRight size={20} />
               </button>
             </div>
          </div>
        )}
      </div>

      {/* --- Batch Transaction Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                   {modalType === 'import' ? <ArrowDown className="text-green-600"/> : modalType === 'export' ? <ArrowUp className="text-red-600"/> : modalType === 'transfer' ? <ArrowRight className="text-blue-600"/> : <Save className="text-orange-600"/>}
                   {modalType === 'import' ? 'Phiếu Nhập kho (Nhiều sản phẩm)' : modalType === 'export' ? 'Phiếu Xuất kho' : modalType === 'transfer' ? 'Phiếu Chuyển kho' : 'Điều chỉnh tồn kho'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className={modalType === 'transfer' ? '' : 'col-span-2 md:col-span-1'}>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{modalType === 'transfer' ? 'Từ Kho' : 'Kho hàng'}</label>
                     <select 
                       value={transactionMeta.warehouseId}
                       onChange={(e) => setTransactionMeta({...transactionMeta, warehouseId: e.target.value})}
                       className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                     >
                       {warehouses.map(w => (
                         <option key={w.id} value={w.id}>{w.name}</option>
                       ))}
                     </select>
                  </div>
                  {modalType === 'transfer' && (
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đến Kho</label>
                        <select 
                          value={transactionMeta.toWarehouseId}
                          onChange={(e) => setTransactionMeta({...transactionMeta, toWarehouseId: e.target.value})}
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                        >
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id} disabled={w.id === transactionMeta.warehouseId}>{w.name}</option>
                          ))}
                        </select>
                     </div>
                  )}
                  {modalType === 'import' && (
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nhà cung cấp</label>
                        <select 
                          value={transactionMeta.supplierId}
                          onChange={(e) => setTransactionMeta({...transactionMeta, supplierId: e.target.value})}
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                        >
                           <option value="">-- Chọn NCC --</option>
                           {suppliers.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                           ))}
                        </select>
                     </div>
                  )}
                  <div className={modalType !== 'transfer' && modalType !== 'import' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lý do / Ghi chú</label>
                      <input 
                        type="text" 
                        value={transactionMeta.reason}
                        onChange={(e) => setTransactionMeta({...transactionMeta, reason: e.target.value})}
                        placeholder={modalType === 'import' ? 'Nhập hàng từ NCC' : 'Xuất bán / Hủy'}
                        className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                  </div>
                </div>

                {/* 2. Add Product Section */}
                <div className="space-y-2">
                   <h4 className="font-bold text-slate-800 text-sm">Thêm sản phẩm vào phiếu</h4>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Tìm tên hoặc SKU để thêm..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {productSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                            {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5).map(p => (
                                <div 
                                key={p.id} 
                                onClick={() => addItemToTransaction(p)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                                >
                                    <img src={p.image} className="w-8 h-8 rounded object-cover"/>
                                    <div>
                                        <div className="text-sm font-medium">{p.name}</div>
                                        <div className="text-xs text-slate-500">Tồn: {p.warehouseStocks[transactionMeta.warehouseId] || 0} | SKU: {p.sku}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                   </div>
                </div>

                {/* 3. Product List Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-2">Sản phẩm</th>
                                <th className="px-4 py-2 w-24 text-center">SL</th>
                                <th className="px-4 py-2 w-32 text-right">{modalType === 'import' ? 'Giá nhập' : 'Giá vốn'}</th>
                                <th className="px-4 py-2 w-32 text-right">Thành tiền</th>
                                <th className="px-4 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactionItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Chưa có sản phẩm nào được chọn</td>
                                </tr>
                            ) : (
                                transactionItems.map((item, idx) => (
                                    <tr key={item.productId} className="hover:bg-slate-50">
                                        <td className="px-4 py-2">
                                            <div className="font-medium text-slate-800 line-clamp-1" title={item.product.name}>{item.product.name}</div>
                                            <div className="text-xs text-slate-500">{item.product.sku}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                className="w-full border border-slate-300 rounded px-2 py-1 text-center font-bold text-indigo-600 focus:border-indigo-500 outline-none"
                                                min={1}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {modalType === 'import' ? (
                                                <input 
                                                    type="number" 
                                                    value={item.price}
                                                    onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                                    className="w-full border border-slate-300 rounded px-2 py-1 text-right focus:border-indigo-500 outline-none"
                                                />
                                            ) : (
                                                <div className="text-right text-slate-600">{formatCurrency(item.price)}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right font-bold text-slate-800">
                                            {formatCurrency(item.quantity * item.price)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {transactionItems.length > 0 && (
                            <tfoot className="bg-slate-50 font-bold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right text-slate-600">Tổng cộng:</td>
                                    <td className="px-4 py-2 text-right text-indigo-600 text-lg">
                                        {formatCurrency(transactionItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
             </div>

             <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                    {modalType === 'import' && <span>* Giá nhập sẽ được dùng để tính lại giá vốn trung bình.</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium">Hủy bỏ</button>
                    <button 
                    onClick={handleTransactionSubmit}
                    className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 ${modalType === 'import' ? 'bg-green-600 hover:bg-green-700' : modalType === 'export' ? 'bg-red-600 hover:bg-red-700' : modalType === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                    <Check size={16} /> Hoàn tất
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- Excel Import Modal --- */}
      {isImportExcelOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <FileSpreadsheet size={20} className="text-green-600"/> Nhập kho từ Excel
                      </h3>
                      <button onClick={() => setIsImportExcelOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-6 text-center">
                      {!isProcessingExcel ? (
                          <>
                              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer group relative">
                                  <input 
                                      type="file" 
                                      accept=".xlsx, .xls, .csv" 
                                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  />
                                  <div className="flex flex-col items-center gap-2">
                                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                                          <Upload size={24} />
                                      </div>
                                      <p className="text-sm font-medium text-slate-700">{excelFile ? excelFile.name : 'Kéo thả hoặc chọn file Excel'}</p>
                                      <p className="text-xs text-slate-400">Hỗ trợ .xlsx, .xls, .csv</p>
                                  </div>
                              </div>
                              <div className="text-left bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 border border-indigo-100">
                                  <strong>Lưu ý:</strong> File Excel cần có các cột: <code>SKU</code>, <code>Quantity</code>, <code>Price</code> (tùy chọn).
                                  <br/><a href="#" className="underline text-indigo-600 font-bold">Tải file mẫu tại đây</a>
                              </div>
                              <button 
                                  onClick={handleProcessExcel}
                                  disabled={!excelFile}
                                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                  Tiến hành nhập
                              </button>
                          </>
                      ) : (
                          <div className="py-8">
                              <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4"/>
                              <h4 className="font-bold text-slate-800 text-lg">Đang xử lý dữ liệu...</h4>
                              <p className="text-slate-500 text-sm">Vui lòng đợi trong giây lát.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Warehouse Creation Modal */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Thêm kho hàng mới</h3>
                    <button onClick={() => setIsWarehouseModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên kho <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={newWarehouseData.name} 
                            onChange={(e) => setNewWarehouseData({...newWarehouseData, name: e.target.value})}
                            placeholder="Ví dụ: Kho Quận 7"
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={newWarehouseData.address} 
                            onChange={(e) => setNewWarehouseData({...newWarehouseData, address: e.target.value})}
                            placeholder="Địa chỉ chi tiết"
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người quản lý</label>
                        <input 
                            type="text" 
                            value={newWarehouseData.manager} 
                            onChange={(e) => setNewWarehouseData({...newWarehouseData, manager: e.target.value})}
                            placeholder="Tên quản lý kho"
                            className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <button onClick={() => setIsWarehouseModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                    <button onClick={handleAddWarehouse} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Tạo kho</button>
                </div>
            </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">{editingSupplierId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}</h3>
                  <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mã NCC</label>
                        <input 
                          type="text" 
                          value={supplierFormData.code} 
                          onChange={(e) => setSupplierFormData({...supplierFormData, code: e.target.value})}
                          placeholder="Tự động"
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên Nhà cung cấp <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={supplierFormData.name} 
                          onChange={(e) => setSupplierFormData({...supplierFormData, name: e.target.value})}
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={supplierFormData.phone} 
                          onChange={(e) => setSupplierFormData({...supplierFormData, phone: e.target.value})}
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={supplierFormData.email} 
                          onChange={(e) => setSupplierFormData({...supplierFormData, email: e.target.value})}
                          className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                     <input 
                        type="text" 
                        value={supplierFormData.address} 
                        onChange={(e) => setSupplierFormData({...supplierFormData, address: e.target.value})}
                        className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                     <textarea 
                        value={supplierFormData.note} 
                        onChange={(e) => setSupplierFormData({...supplierFormData, note: e.target.value})}
                        rows={2}
                        className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
                     />
                  </div>
               </div>
               <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                  <button onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                  <button onClick={handleSaveSupplier} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Lưu thông tin</button>
               </div>
            </div>
         </div>
      )}

      {/* Low Stock Warning Modal */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-red-100 flex justify-between items-center bg-red-50">
                    <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                        <AlertOctagon size={20} className="text-red-600"/> Cảnh báo sắp hết hàng
                    </h3>
                    <button onClick={() => setIsWarningModalOpen(false)} className="text-red-400 hover:text-red-600"><X size={20}/></button>
                </div>
                
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Settings size={16} className="text-indigo-600"/>
                        <span className="font-bold">Cấu hình mức cảnh báo:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Số lượng dưới</span>
                        <input 
                            type="number" 
                            value={warningLevel} 
                            onChange={(e) => setWarningLevel(Math.max(0, Number(e.target.value)))}
                            className="w-16 border border-slate-300 rounded px-2 py-1 text-center font-bold text-red-600 focus:ring-red-500 outline-none"
                        />
                        <span className="text-xs text-slate-500">sản phẩm</span>
                        <button 
                            onClick={() => alert("Đã cập nhật mức cảnh báo toàn hệ thống!")}
                            className="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700"
                        >
                            Cập nhật nhanh
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {lowStockProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Check size={48} className="mx-auto mb-2 text-green-500 opacity-50"/>
                            <p>Tuyệt vời! Không có sản phẩm nào dưới mức cảnh báo.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-center">Tồn kho</th>
                                    <th className="px-4 py-3 text-right">Giá vốn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lowStockProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-red-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={p.image} className="w-10 h-10 rounded border border-slate-200 object-cover"/>
                                                <div>
                                                    <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                                                    <div className="text-xs text-slate-500">{p.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-xs">
                                                {calculateTotalStock(p)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            {formatCurrency(p.importPrice || p.price * 0.6)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
