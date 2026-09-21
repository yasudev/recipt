export type NavigationTab = 'pos' | 'sales' | 'products' | 'print-settings';

export interface Product {
  id: string;
  name: string; // Required
  price?: number | null; // Optional: can be blank/null/undefined for custom pricing or free
  category: string;
  sku: string;
  stock: number;
  barcode?: string;
  description?: string;
  color?: string;
  isPriceOptional: boolean; // Flag to designate optional/custom price item
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  id: string; // Unique entry in cart
  productId: string;
  name: string;
  unitPrice: number; // Applied unit price (user-entered if optional, or fixed)
  isCustomPrice: boolean;
  quantity: number;
  sku: string;
  category: string;
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'split';

export interface SaleRecord {
  id: string; // e.g. ORD-98421
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  changeDue?: number;
  customerName?: string;
  cashierName: string;
  status: 'completed' | 'refunded';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencyPosition: 'prefix' | 'suffix';
  taxRate: number; // e.g. 8.25 for 8.25%
  enableTax: boolean;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  soundEnabled: boolean;
  autoPrintReceipt: boolean;
  lowStockThreshold: number;
  // Print & Receipt Settings
  paperWidth?: '80mm' | '58mm' | 'a4';
  printCopies?: number;
  showBarcode?: boolean;
  showTaxBreakdown?: boolean;
  showCashier?: boolean;
  showCustomer?: boolean;
  showSku?: boolean;
  vatNumber?: string;
  paperCut?: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  color: string;
}
