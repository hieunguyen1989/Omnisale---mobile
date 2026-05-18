
import { Product, Order, Platform, IntegrationConfig, ChartData, PlatformStat, Conversation, OrderItem, HourlySalesData, TopSKU, ReportDataPoint, FlashSaleCampaign, Voucher, AutoReplyRule, UserProfile, ShippingProvider, InventoryLog, Transaction, FeeBreakdown, DashboardStats, PlatformDistribution, Warehouse, TaxPayerProfile, TaxPayment, InputInvoice, ChatMessage, TaxTicket, Supplier, Invoice, LedgerRecord, NewsArticle, GuideArticle, FeedbackItem, ExternalProduct, ProductSyncLog, ExternalVariant, Customer } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn Chủ',
    role: 'owner',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Chu&background=random',
    assignedShopIds: [],
    email: 'chu@example.com',
    phone: '0901234567',
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 'u2',
    name: 'Trần Thị Nhân Viên',
    role: 'employee',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Nhan+Vien&background=random',
    assignedShopIds: [],
    email: 'nv@example.com',
    phone: '0901234568',
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 'u3',
    name: 'Lê Văn CTV',
    role: 'collaborator',
    avatar: 'https://ui-avatars.com/api/?name=Le+Van+CTV&background=random',
    assignedShopIds: ['sh1'],
    email: 'ctv@example.com',
    phone: '0901234569',
    emailVerified: false,
    phoneVerified: true
  }
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh1', name: 'Kho Tổng TP.HCM', address: 'Quận 7, TP.HCM', manager: 'Nguyễn Văn A' },
  { id: 'wh2', name: 'Kho Hà Nội', address: 'Cầu Giấy, Hà Nội', manager: 'Trần Thị B' }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Công ty May Mặc Việt', code: 'SUP001', phone: '0283999888', email: 'contact@maymac.vn', address: 'Tân Bình, TP.HCM', note: 'Chuyên áo thun' },
  { id: 'sup2', name: 'Nhập khẩu Quảng Châu', code: 'SUP002', phone: '0909111222', email: 'import@qc.cn', address: 'Lạng Sơn', note: 'Hàng trend' }
];

export const MOCK_FORBIDDEN_KEYWORDS = [
  { id: 'kw1', text: 'Facebook', category: 'Thương hiệu/MXH' },
  { id: 'kw2', text: 'Zalo', category: 'Thương hiệu/MXH' },
  { id: 'kw3', text: 'Cam kết hiệu quả 100%', category: 'Khẳng định chưa kiểm chứng' },
  { id: 'kw4', text: 'Trị dứt điểm', category: 'Lừa dối người tiêu dùng' }
];

export const MOCK_CATEGORIES = ['Thời trang', 'Mỹ phẩm', 'Điện tử', 'Gia dụng', 'Mẹ & Bé', 'Thực phẩm'];

const generateMockProducts = (): Product[] => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `P${i + 1}`,
    name: `Sản phẩm mẫu ${i + 1} - Thời trang cao cấp`,
    sku: `SKU-${i + 1}`,
    barcode: `893${Math.floor(Math.random() * 1000000000)}`,
    price: 150000 + (i * 10000),
    salePrice: 150000 + (i * 10000), 
    importPrice: 80000 + (i * 5000),
    currency: 'VND',
    stock: Math.floor(Math.random() * 100),
    warehouseStocks: { 'wh1': Math.floor(Math.random() * 50), 'wh2': Math.floor(Math.random() * 50) },
    totalSold: Math.floor(Math.random() * 500),
    platforms: [Platform.SHOPEE, Platform.LAZADA],
    image: `https://loremflickr.com/200/200/fashion?random=${i}`,
    gallery: [],
    description: 'Mô tả sản phẩm mẫu...',
    category: MOCK_CATEGORIES[i % MOCK_CATEGORIES.length],
    status: i % 5 === 0 ? 'out_of_stock' : 'active',
    variants: i % 3 === 0 ? [] : [
      { id: `v1-${i}`, name: 'Màu Đỏ, Size M', sku: `SKU-${i + 1}-RED-M`, price: 150000 + (i * 10000), stock: Math.floor(Math.random() * 50), image: `https://loremflickr.com/100/100/fashion?random=${i}1` },
      { id: `v2-${i}`, name: 'Màu Xanh, Size L', sku: `SKU-${i + 1}-BLU-L`, price: 150000 + (i * 10000) + 20000, stock: Math.floor(Math.random() * 50), image: `https://loremflickr.com/100/100/fashion?random=${i}2` }
    ],
    weight: 200,
    length: 10,
    width: 10,
    height: 5,
    variants: [],
    taxSettings: {
      applyTax: true,
      priceType: 'inclusive',
      inputTaxRate: 10,
      outputTaxRate: 10
    }
  }));
};

export const MOCK_PRODUCTS: Product[] = generateMockProducts();

const generateMockOrders = (): Order[] => {
  // Generate 100 orders
  return Array.from({ length: 100 }).map((_, i) => {
    const product = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
    
    // Logic random shipping method with weighting
    const rand = Math.random();
    let shippingMethod = 'Nhanh';
    let carrier = i % 2 === 0 ? 'Giao Hàng Nhanh' : 'J&T Express';
    
    // 25% Hỏa tốc, 15% Trong ngày, 60% Nhanh
    if (rand > 0.75) {
        shippingMethod = 'Hỏa tốc';
        carrier = 'GrabExpress';
    } else if (rand > 0.60) {
        shippingMethod = 'Trong ngày';
        carrier = 'Ahamove';
    }

    // Logic deadline
    const now = new Date();
    // Hỏa tốc deadline is usually very tight
    const deadlineHours = shippingMethod === 'Hỏa tốc' ? 2 : (shippingMethod === 'Trong ngày' ? 12 : 72);
    // Randomize if it's late for demo purposes
    const timeShift = shippingMethod === 'Hỏa tốc' ? (Math.random() * 4 - 1) : (Math.random() * 48 + 12); 
    const deadlineDate = new Date(now.getTime() + timeShift * 60 * 60 * 1000);

    // Distribute statuses evenly: 6 statuses -> ~16 items per status
    const statuses: Order['status'][] = ['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'];
    const status = statuses[i % statuses.length];

    let subStatus: Order['subStatus'] = undefined;
    if (status === 'processing') {
        subStatus = i % 3 === 0 ? 'unprocessed' : i % 3 === 1 ? 'printed' : 'packed';
    }

      const generatedItems = Array.from({ length: i % 4 === 0 ? Math.floor(Math.random() * 2) + 2 : (i % 3 === 0 ? 2 : 1) }).map((_, idx) => {
        const p = MOCK_PRODUCTS[(i + idx) % MOCK_PRODUCTS.length];
        return {
          productId: p.id,
          name: p.name,
          image: p.image,
          sku: p.sku,
          variant: idx === 0 ? 'Mặc định' : 'Màu Đỏ, Size M',
          quantity: Math.floor(Math.random() * 3) + 1,
          price: p.price
        };
      });

      const totalItemsValue = generatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = totalItemsValue + (shippingMethod === 'Hỏa tốc' ? 50000 : 30000);
      const platformFee = 15000 + (totalItemsValue * 0.05); // 5% fee + base
      const tax = total * 0.08; // 8% vat
      const profit = totalItemsValue * 0.3 - platformFee - tax; // 30% margin minus fees

      const isReconciled = ['delivered', 'cancelled', 'returned'].includes(status) && Math.random() > 0.3;
      const actualReceived = isReconciled ? total - platformFee - tax : undefined;
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDate = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear().toString().slice(-2)}`;
      
      const reconciliationTime = isReconciled ? formatDate(new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000)) : undefined;

      // Spread orders over the last 30 days (approx 7 hours apart for 100 orders)
      const orderDate = new Date(Date.now() - i * 7 * 3600000);

      return {
        id: `ORD-${Date.now()}-${i}`,
        customerName: `Khách hàng ${i + 1}`,
        customerPhone: `090${Math.floor(Math.random() * 10000000)}`,
        address: `123 Đường ABC, Quận ${i % 10 + 1}, TP.HCM`,
        platform: i % 3 === 0 ? Platform.SHOPEE : i % 3 === 1 ? Platform.LAZADA : Platform.TIKTOK,
        shopId: i % 2 === 0 ? 'sh1' : 'sh2',
        date: formatDate(orderDate),
        shipByDate: formatDate(deadlineDate),
        total: total,
        shippingFee: shippingMethod === 'Hỏa tốc' ? 50000 : 30000,
        platformFee: platformFee,
        tax: tax,
        profit: profit,
        status: status,
        subStatus: subStatus,
        items: generatedItems,
      shippingCarrier: carrier,
      shippingMethod: shippingMethod,
      isCOD: i % 2 === 0,
      trackingCode: status !== 'pending' ? `TRACK${i}` : undefined,
      note: shippingMethod === 'Hỏa tốc' ? 'Giao gấp trước 5h chiều' : '',
      reconciled: isReconciled,
      actualReceived: actualReceived,
      calculatedAmount: total,
      reconciliationTime: reconciliationTime
    };
  });
};

export const MOCK_ORDERS: Order[] = generateMockOrders();

const generateCustomers = (): Customer[] => {
  const customerMap = new Map<string, Customer>();
  
  const sampleNotes = [
    "Khách khó tính, cần gói kỹ.",
    "Chỉ nhận hàng giờ hành chính.",
    "Hay hỏi nhiều nhưng mua ít.",
    "Thích được tặng quà kèm.",
    "Đã từng bom hàng 1 lần, cần chú ý.",
    "Khách sỉ tiềm năng.",
    "Chỉ thích giao Viettel Post.",
    "", "", "", "", "" 
  ];

  MOCK_ORDERS.forEach((order, index) => {
    const phone = order.customerPhone || `09${index}123456`; 
    
    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        id: `CUS-${phone}`,
        name: order.customerName,
        phone: phone,
        avatar: `https://ui-avatars.com/api/?name=${order.customerName}&background=random`,
        address: order.address || 'Chưa cập nhật địa chỉ',
        city: 'Hồ Chí Minh', 
        totalOrders: 0,
        totalSpent: 0,
        successRate: 100,
        returnRate: 0,
        lastOrderDate: order.date,
        createdAt: `01/01/2025`, 
        platforms: [],
        tags: [],
        status: 'active',
        notes: sampleNotes[index % sampleNotes.length]
      });
    }

    const customer = customerMap.get(phone)!;
    customer.totalOrders += 1;
    customer.totalSpent += order.total;
    if (!customer.platforms.includes(order.platform as Platform)) {
        if(order.platform !== 'Manual') customer.platforms.push(order.platform as Platform);
    }
    
    customer.lastOrderDate = order.date;
  });

  return Array.from(customerMap.values()).map(c => {
    const randomSuccess = Math.random();
    c.successRate = randomSuccess > 0.1 ? 100 : Math.floor(Math.random() * 80);
    c.returnRate = 100 - c.successRate;
    
    if (c.totalSpent > 5000000) c.tags.push('VIP');
    if (c.totalOrders === 1) c.tags.push('New');
    if (c.returnRate > 30) {
        c.tags.push('Blacklist');
        c.status = 'blocked';
        c.notes = "Cảnh báo: Tỷ lệ hoàn cao > 30%"; 
    } else if (c.totalOrders > 5) {
        c.tags.push('Loyal');
    }
    if (Math.random() > 0.8 && !c.tags.includes('Blacklist')) c.tags.push('Potential');

    return c;
  });
};

export const MOCK_CUSTOMERS: Customer[] = generateCustomers();

export const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  { 
    platform: Platform.SHOPEE, 
    shops: [
      { id: 'sh1', name: 'Shop Mẹ & Bé Official', logo: 'https://ui-avatars.com/api/?name=MB&background=f53d2d&color=fff', connectedAt: '2025-01-10', expiresAt: '2025-04-10', status: 'active' },
      { id: 'sh2', name: 'Thời Trang Nam MenStyle', logo: 'https://ui-avatars.com/api/?name=MS&background=f53d2d&color=fff', connectedAt: '2025-02-15', expiresAt: '2025-05-15', status: 'active' }
    ] 
  },
  {
    platform: Platform.LAZADA,
    shops: [
      { id: 'lz1', name: 'Lazada Tech Mall', logo: 'https://ui-avatars.com/api/?name=TM&background=0f146d&color=fff', connectedAt: '2025-01-05', expiresAt: '2025-04-05', status: 'active' }
    ]
  },
  {
    platform: Platform.TIKTOK,
    shops: [
      { id: 'tk1', name: 'TikTok Fashion Store', logo: 'https://ui-avatars.com/api/?name=TF&background=000&color=fff', connectedAt: '2025-01-20', expiresAt: '2025-04-20', status: 'active' }
    ]
  }
];

const generateExternalProducts = (): ExternalProduct[] => {
  const products: ExternalProduct[] = [];
  const platforms = [Platform.SHOPEE, Platform.LAZADA, Platform.TIKTOK];
  
  const shopMap = {
    'sh1': { name: 'Shop Mẹ & Bé Official', platform: Platform.SHOPEE },
    'sh2': { name: 'Thời Trang Nam MenStyle', platform: Platform.SHOPEE },
    'lz1': { name: 'Lazada Tech Mall', platform: Platform.LAZADA },
    'tk1': { name: 'TikTok Fashion Store', platform: Platform.TIKTOK }
  };
  const shopIds = Object.keys(shopMap);

  const adjectives = ['Cao cấp', 'Chính hãng', 'Giá rẻ', 'Mới nhất 2025', 'Siêu bền', 'Mini', 'Thông minh', 'Đa năng'];
  const nouns = ['Áo thun', 'Váy đầm', 'Tai nghe Bluetooth', 'Sạc dự phòng', 'Bình giữ nhiệt', 'Túi xách', 'Giày Sneaker', 'Đồng hồ', 'Nồi chiên không dầu', 'Kem dưỡng da'];

  for (let i = 0; i < 100; i++) {
    const shopId = shopIds[i % shopIds.length];
    const shopInfo = shopMap[shopId as keyof typeof shopMap];
    const hasVariants = Math.random() > 0.7; 
    const statusRand = Math.random();
    
    let syncStatus: ExternalProduct['syncStatus'] = 'synced';
    let errorMsg: string | undefined = undefined;

    if (statusRand > 0.8) syncStatus = 'unsynced';
    else if (statusRand > 0.95) {
        syncStatus = 'error';
        errorMsg = Math.random() > 0.5 ? 'Sai mã SKU với hệ thống' : 'Thiếu thông tin cân nặng';
    }

    const baseName = `${adjectives[i % adjectives.length]} ${nouns[i % nouns.length]}`;
    const basePrice = 50000 + (Math.floor(Math.random() * 50) * 10000);
    const baseStock = Math.floor(Math.random() * 500);

    let variants: ExternalVariant[] | undefined = undefined;
    
    if (hasVariants) {
        variants = [
            { id: `v${i}-1`, name: 'Màu Đen - Size L', sku: `EXT-${i}-BL-L`, price: basePrice, stock: Math.floor(baseStock / 3), image: `https://loremflickr.com/100/100/product?random=${i}1` },
            { id: `v${i}-2`, name: 'Màu Trắng - Size M', sku: `EXT-${i}-WH-M`, price: basePrice, stock: Math.floor(baseStock / 3), image: `https://loremflickr.com/100/100/product?random=${i}2` },
            { id: `v${i}-3`, name: 'Màu Xanh - Size XL', sku: `EXT-${i}-BLU-XL`, price: basePrice + 10000, stock: Math.floor(baseStock / 3), image: `https://loremflickr.com/100/100/product?random=${i}3` },
        ];
    }

    products.push({
        id: `EXT-${i}`,
        platform: shopInfo.platform,
        shopId: shopId,
        shopName: shopInfo.name,
        externalId: `${Math.floor(Math.random() * 100000000)}`,
        name: hasVariants ? `${baseName} (Nhiều phân loại)` : baseName,
        sku: `EXT-SKU-${i}`,
        price: basePrice,
        stock: baseStock,
        image: `https://loremflickr.com/200/200/product?random=${i}`,
        syncStatus: syncStatus,
        lastSyncAt: syncStatus === 'synced' ? '10 phút trước' : undefined,
        errorMsg: errorMsg,
        variants: variants
    });
  }
  return products;
};

export const MOCK_EXTERNAL_PRODUCTS: ExternalProduct[] = generateExternalProducts();

export const MOCK_PRODUCT_SYNC_HISTORY: ProductSyncLog[] = [];
export const MOCK_SHIPPING_PROVIDERS: ShippingProvider[] = [
  { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', logo: 'https://picsum.photos/50/50?random=ghtk', connected: true, type: 'domestic' }
];

export const SALES_DATA_LAST_7_DAYS: ChartData[] = [
  { name: 'T2', sales: 15450000, orders: 45 },
  { name: 'T3', sales: 18200000, orders: 52 },
  { name: 'T4', sales: 14800000, orders: 41 },
  { name: 'T5', sales: 21000000, orders: 60 },
  { name: 'T6', sales: 19500000, orders: 55 },
  { name: 'T7', sales: 25800000, orders: 75 },
  { name: 'CN', sales: 28400000, orders: 82 },
];
export const SALES_DATA_LAST_30_DAYS: ChartData[] = Array.from({ length: 30 }).map((_, i) => ({
  name: `Ngày ${i + 1}`,
  sales: 10000000 + Math.random() * 20000000,
  orders: 30 + Math.floor(Math.random() * 50)
}));
export const SALES_DATA_CURRENT_MONTH: ChartData[] = Array.from({ length: 28 }).map((_, i) => ({
  name: `${i + 1}/4`,
  sales: 12000000 + Math.random() * 18000000,
  orders: 35 + Math.floor(Math.random() * 45)
}));
export const SALES_DATA_LAST_MONTH: ChartData[] = Array.from({ length: 31 }).map((_, i) => ({
  name: `${i + 1}/3`,
  sales: 11000000 + Math.random() * 15000000,
  orders: 30 + Math.floor(Math.random() * 40)
}));

export const MOCK_NEWS: NewsArticle[] = [
  { id: 'n1', title: 'Shopee thay đổi chính sách phí', summary: 'Tóm tắt.', content: 'Nội dung.', source: 'Ecommerce Insight', date: '15/05/2026', imageUrl: 'https://picsum.photos/800/400?random=1', category: 'policy' }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  { 
    id: 'c1', 
    customerName: 'Nguyễn Thị Hương', 
    avatar: 'https://i.pravatar.cc/150?u=c1', 
    platform: Platform.SHOPEE, 
    lastMessage: 'Còn hàng không?', 
    timestamp: '5 phút', 
    unreadCount: 2, 
    messages: [
       { id: 'm1', text: 'Shop ơi?', sender: 'customer', timestamp: '10:00' },
       { id: 'm2', text: 'Mẫu áo số 3 còn size M không bạn?', sender: 'customer', timestamp: '10:01' },
       { id: 'm3', text: 'Chào bạn, hiện tại mẫu áo đó bên mình vẫn còn size M ạ.', sender: 'user', timestamp: '10:15' },
       { id: 'm4', text: 'Tuyệt quá, để mình đặt hàng nhé.', sender: 'customer', timestamp: '10:18' },
       { id: 'm5', text: 'Cảm ơn bạn. Bạn đặt sớm nha vì số lượng không còn nhiều ạ.', sender: 'user', timestamp: '10:20' },
       { id: 'm6', text: 'Cho mình hỏi thêm xíu.', sender: 'customer', timestamp: '11:00' },
       { id: 'm7', text: 'Còn hàng không?', sender: 'customer', timestamp: '11:02' }
    ], 
    sender: 'customer' 
  },
  { 
    id: 'c2', 
    customerName: 'Trần Văn Kiên', 
    avatar: 'https://i.pravatar.cc/150?u=c2', 
    platform: Platform.LAZADA, 
    lastMessage: 'Cảm ơn shop nhé, hàng đẹp.', 
    timestamp: '1 giờ', 
    unreadCount: 0, 
    messages: [
       { id: 'm1', text: 'Giao nhanh giúp mình nhé', sender: 'customer', timestamp: '14:00' },
       { id: 'm2', text: 'Dạ vâng ạ, shop sẽ đóng gói và gửi ngay chiều nay ạ.', sender: 'user', timestamp: '14:20' },
       { id: 'm3', text: 'Cảm ơn shop nhé, hàng đẹp.', sender: 'customer', timestamp: 'Hôm qua' }
    ], 
    sender: 'customer' 
  },
  { 
    id: 'c3', 
    customerName: 'Lê Minh Phượng', 
    avatar: 'https://i.pravatar.cc/150?u=c3', 
    platform: Platform.TIKTOK, 
    lastMessage: 'Vừa đặt xong mã 2901 nha em.', 
    timestamp: '3 giờ', 
    unreadCount: 1, 
    messages: [
       { id: 'm1', text: 'Trên live báo giá 199k sao vô giỏ hàng 250k vậy bé?', sender: 'customer', timestamp: '09:00' },
       { id: 'm2', text: 'Dạ chị nhớ áp mã voucher giảm 50k vào nha chị ơi.', sender: 'user', timestamp: '09:02' },
       { id: 'm3', text: 'Oke em, chị thấy rồi.', sender: 'customer', timestamp: '09:05' },
       { id: 'm4', text: 'Vừa đặt xong mã 2901 nha em.', sender: 'customer', timestamp: '09:10' }
    ], 
    sender: 'customer' 
  },
  { 
    id: 'c4', 
    customerName: 'Hoàng Quốc Việt', 
    avatar: 'https://i.pravatar.cc/150?u=c4', 
    platform: Platform.FACEBOOK, 
    lastMessage: 'Cho mình xin địa chỉ store.', 
    timestamp: 'Hôm qua', 
    unreadCount: 0, 
    messages: [
       { id: 'm1', text: 'Shop ở đâu vậy ạ?', sender: 'customer', timestamp: '08:00' },
       { id: 'm2', text: 'Cho mình xin địa chỉ store.', sender: 'customer', timestamp: '08:01' }
    ], 
    sender: 'customer' 
  }
];

export const MOCK_FLASH_SALES: FlashSaleCampaign[] = [
    {
        id: 'fs1',
        productId: 'P1',
        productName: 'Sản phẩm mẫu 1 - Thời trang cao cấp',
        productImage: 'https://loremflickr.com/200/200/fashion?random=0',
        originalPrice: 150000,
        flashSalePrice: 120000,
        discountPercent: 20,
        startTime: '09:00',
        endTime: '12:00',
        sold: 15,
        stock: 50,
        status: 'active',
        aiReason: 'Sản phẩm bán chạy vào buổi sáng'
    },
    {
        id: 'fs2',
        productId: 'P4',
        productName: 'Sản phẩm mẫu 4 - Thời trang cao cấp',
        productImage: 'https://loremflickr.com/200/200/fashion?random=3',
        originalPrice: 180000,
        flashSalePrice: 153000,
        discountPercent: 15,
        startTime: '12:00',
        endTime: '15:00',
        sold: 5,
        stock: 30,
        status: 'upcoming',
        aiReason: 'Tồn kho cao, cần đẩy hàng'
    }
];

export const MOCK_VOUCHERS: Voucher[] = [
    { id: 'v1', code: 'OMNI10', type: 'percent', value: 10, minSpend: 200000, usageLimit: 100, used: 45, status: 'active', platforms: [Platform.SHOPEE] },
    { id: 'v2', code: 'FREESHIP', type: 'fixed', value: 30000, minSpend: 500000, usageLimit: 50, used: 50, status: 'expired', platforms: [] }
];

export const MOCK_INVENTORY_LOGS: InventoryLog[] = [
    { id: 'log1', productId: 'P1', productName: 'Sản phẩm mẫu 1', sku: 'SKU-1', warehouseId: 'wh1', warehouseName: 'Kho Tổng TP.HCM', type: 'import', quantity: 100, reason: 'Nhập hàng từ NCC', timestamp: '10/05/2025 08:30', performer: 'Admin' },
    { id: 'log2', productId: 'P2', productName: 'Sản phẩm mẫu 2', sku: 'SKU-2', warehouseId: 'wh1', warehouseName: 'Kho Tổng TP.HCM', type: 'export', quantity: 5, reason: 'Bán hàng', timestamp: '12/05/2025 10:15', performer: 'Sales' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_TAXPAYER_INFO: TaxPayerProfile = {
  name: 'Nguyễn Văn Chủ',
  taxCode: '8765432109',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  businessType: 'household',
  taxAuthority: 'Chi cục thuế Quận 1',
  email: 'chu.shop@example.com',
  phone: '0901234567'
};

export const MOCK_TAX_PAYMENTS: TaxPayment[] = [
    { id: 'tp1', date: '30/04/2025', amount: 5000000, quarter: 1, year: 2025, status: 'paid', note: 'Thuế khoán Q1/2025' }
];

export const MOCK_INPUT_INVOICES: InputInvoice[] = [
    { id: 'inv1', date: '05/05/2025', invoiceNumber: '0012345', sellerName: 'Công ty May Mặc Việt', sellerTaxCode: '0301234567', description: 'Nhập lô áo thun hè', totalAmount: 15000000 }
];

export const MOCK_TAX_TICKETS: TaxTicket[] = [
    { 
        id: 'ticket1', 
        subject: 'Hỏi về mức thuế khoán năm 2025', 
        status: 'processing', 
        priority: 'medium', 
        tags: ['Thuế khoán'], 
        createdAt: '10/05/2025', 
        updatedAt: '12/05/2025', 
        messages: [
            { id: 'm1', sender: 'user', content: 'Cho mình hỏi mức thuế khoán năm nay có thay đổi gì không?', type: 'text', timestamp: '10/05/2025 09:00' },
            { id: 'm2', sender: 'admin', content: 'Chào bạn, mức thuế vẫn giữ nguyên như năm ngoái nhé.', type: 'text', timestamp: '10/05/2025 10:00' }
        ] 
    }
];

export const MOCK_INVOICES: Invoice[] = [
    { 
        id: 'inv-out-1', type: 'output', invoiceNumber: 'HD001', date: '15/05/2025', partnerName: 'Nguyễn Văn A', 
        totalAmount: 500000, preTaxAmount: 454545, vatAmount: 45455, vatRate: 10, items: 'Áo thun x2', 
        status: 'paid', paymentMethod: 'transfer', staffName: 'Admin', createdAt: '15/05/2025 10:00' 
    }
];

export const MOCK_LEDGER_RECORDS: LedgerRecord[] = [
    { id: 'leg1', date: '15/05/2025', type: 'receipt', amount: 500000, description: 'Thu tiền đơn hàng #ORD-123', category: 'Bán hàng', method: 'bank', partnerName: 'Nguyễn Văn A', createdAt: '15/05/2025 10:05' }
];

export const MOCK_GUIDES: GuideArticle[] = [
    { id: 'g1', title: 'Hướng dẫn đăng ký Shop trên Shopee', summary: 'Các bước chi tiết để mở gian hàng.', content: 'Chi tiết...', category: 'Bắt đầu', views: 150, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
];

export const MOCK_FEEDBACK_HISTORY: FeedbackItem[] = [];

export const MOCK_PRICE_HISTORY = [
    { id: 'ph1', action: 'Tăng giá 10%', count: 5, time: '14/05/2025 15:30', user: 'Admin', details: [] }
];