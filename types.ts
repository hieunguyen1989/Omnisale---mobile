
export enum Platform {
  SHOPEE = 'Shopee',
  LAZADA = 'Lazada',
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook',
  WOOCOMMERCE = 'WooCommerce'
}

export type UserRole = 'owner' | 'employee' | 'collaborator';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  assignedShopIds: string[];
  email?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  successRate: number; // 0 - 100
  returnRate: number; // 0 - 100
  lastOrderDate: string;
  createdAt: string; // New field
  platforms: Platform[];
  tags: string[]; // 'VIP', 'New', 'Blacklist', 'Potential'
  notes?: string;
  status: 'active' | 'blocked';
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
}

export interface TaxSettings {
  applyTax: boolean;
  priceType: 'inclusive' | 'exclusive'; // Giá đã gồm thuế | Giá chưa gồm thuế
  inputTaxRate: number; // Thuế đầu vào
  outputTaxRate: number; // Thuế đầu ra
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string; // New field
  price: number;
  salePrice?: number;
  importPrice?: number;
  currency: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  warehouseStocks: Record<string, number>;
  totalSold: number;
  platforms: Platform[];
  image: string;
  gallery: string[];
  video?: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'out_of_stock' | 'inactive';
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  variants?: ProductVariant[];
  taxSettings?: TaxSettings;
}

export interface ExternalVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
}

export interface ExternalProduct {
  id: string;
  platform: Platform;
  shopId: string;
  shopName: string;
  externalId: string; // ID trên sàn
  name: string;
  sku: string;
  price: number;
  stock: number;
  image: string;
  syncStatus: 'synced' | 'unsynced' | 'error' | 'ignored';
  linkedProductId?: string; // ID sản phẩm trong Omni nếu đã map
  lastSyncAt?: string;
  errorMsg?: string;
  variants?: ExternalVariant[]; // New field for variants
}

export interface ProductSyncLog {
  id: string;
  shopId: string;
  shopName: string;
  platform: Platform;
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  status: 'success' | 'failed' | 'partial';
  performedBy: string;
  timestamp: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  sku: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  platform: Platform | 'Manual';
  shopId: string;
  date: string;
  shipByDate?: string;
  total: number;
  shippingFee: number;
  platformFee: number;
  tax: number;
  profit: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  subStatus?: 'unprocessed' | 'printed' | 'packed';
  items: OrderItem[];
  shippingCarrier?: string;
  shippingMethod?: string;
  isCOD: boolean;
  trackingCode?: string;
  note?: string;
  reconciled?: boolean;
  actualReceived?: number;
  calculatedAmount?: number;
  reconciliationTime?: string;
}

export interface IntegrationConfig {
  platform: Platform;
  shops: {
    id: string;
    name: string;
    logo: string;
    connectedAt: string;
    expiresAt: string;
    status: 'active' | 'expired';
  }[];
}

export interface ShippingProvider {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  type: 'domestic' | 'international';
}

export interface PlatformStat {
  platform: Platform;
  revenue: number;
  profit: number;
  productsCount: number;
  ordersCount: number;
  itemsSold: number;
  growth: number;
}

export interface ChartData {
  name: string;
  sales: number;
  orders: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'customer' | 'user';
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  avatar: string;
  platform: Platform;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
  sender: 'customer' | 'user';
}

export interface HourlySalesData {
  hour: string;
  today: number;
  yesterday: number;
}

export interface ReportDataPoint {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
  itemsSold: number;
}

export interface TopSKU {
  rank: number;
  id: string;
  name: string;
  image: string;
  orders: number;
  revenue: number;
  stock: number;
  views: number;
}

export interface FlashSaleCampaign {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  flashSalePrice: number;
  discountPercent: number;
  startTime: string;
  endTime: string;
  sold: number;
  stock: number;
  status: 'active' | 'upcoming' | 'ended';
  aiReason?: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSpend: number;
  usageLimit: number;
  used: number;
  status: 'active' | 'expired';
  platforms: Platform[];
}

export interface AutoReplyRule {
  rating: number;
  content: string;
  isEnabled: boolean;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  type: 'import' | 'export' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  timestamp: string;
  performer: string;
  partnerName?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  manager: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export interface Transaction {
  id: string;
  planName: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
  method: 'transfer' | 'visa' | 'paypal' | 'qr';
  invoiceCode: string;
}

export interface FeeBreakdown {
  name: string;
  value: number;
  isNegative: boolean;
}

export interface DashboardStats {
  ordersCreated: number;
  ordersReturned: number;
  ordersCancelled: number;
  ordersSold: number;
  revenue: number;
  extraCosts: number;
  importCost: number;
  netProfit: number;
}

export interface PlatformDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TaxPayerProfile {
  name: string;
  taxCode: string;
  address: string;
  businessType: 'individual' | 'household' | 'company';
  taxAuthority: string;
  email: string;
  phone: string;
}

export interface TaxPayment {
  id: string;
  date: string;
  amount: number;
  quarter: number;
  year: number;
  status: 'paid' | 'pending';
  note: string;
}

export interface InputInvoice {
  id: string;
  date: string;
  invoiceNumber: string;
  sellerName: string;
  sellerTaxCode: string;
  description: string;
  totalAmount: number;
}

export interface TaxMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  content: string;
  type: 'text' | 'file' | 'status_change';
  fileName?: string;
  timestamp: string;
}

export interface TaxTicket {
  id: string;
  subject: string;
  status: 'open' | 'processing' | 'pending_action' | 'closed';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  messages: TaxMessage[];
}

export interface Invoice {
  id: string;
  type: 'input' | 'output';
  invoiceNumber: string;
  date: string;
  partnerName: string;
  partnerTaxCode?: string;
  totalAmount: number;
  preTaxAmount: number;
  vatAmount: number;
  vatRate: number;
  items: string;
  status: 'paid' | 'unpaid' | 'cancelled';
  paymentMethod: 'cash' | 'transfer' | 'card';
  staffName: string;
  imageUrl?: string;
  attachments?: string[];
  folder?: string;
  createdAt?: string;
  creator?: string;
}

export interface LedgerRecord {
  id: string;
  date: string;
  type: 'receipt' | 'payment';
  amount: number;
  description: string;
  category: string;
  method: 'cash' | 'bank';
  partnerName?: string;
  relatedDocId?: string;
  attachments?: string[];
  createdAt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  date: string;
  imageUrl: string;
  category: 'policy' | 'market' | 'tips' | 'tech';
}

export interface GuideArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  videoUrl?: string;
  category: string;
  views: number;
}

export interface FeedbackItem {
  id: string;
  type: 'feature' | 'bug' | 'other';
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}