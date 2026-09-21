import { ref, computed, watch } from 'vue';
import { Product, CartItem, SaleRecord, StoreSettings, NavigationTab } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_SETTINGS } from '../data/initialData';

// Persistent fallback storage keys
const STORAGE_KEY_PRODUCTS = 'yum_pos_products_v1';
const STORAGE_KEY_SALES = 'yum_pos_sales_v1';
const STORAGE_KEY_SETTINGS = 'yum_pos_settings_v1';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function initializeSettings(): StoreSettings {
  const stored = loadStored<StoreSettings>(STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
  if (stored) {
    if (!stored.storeName || stored.storeName.includes('Aura')) {
      stored.storeName = 'Yum POS';
    }
    if (!stored.receiptFooter || stored.receiptFooter.includes('Aura')) {
      stored.receiptFooter = 'Thank you for choosing Yum POS! Visit us again soon.';
    }
    if (!stored.currency || stored.currency === '$' || stored.currency === 'USD') {
      stored.currency = 'ETB';
      stored.currencyPosition = 'prefix';
    }
    if (stored.taxRate === 8.5 || stored.taxRate === undefined || stored.taxRate === null) {
      stored.taxRate = 15;
    }
    if (stored.enableTax === undefined) {
      stored.enableTax = true;
    }
    if (!stored.storeAddress || stored.storeAddress.includes('Market Street') || stored.storeAddress.includes('San Francisco')) {
      stored.storeAddress = 'Bole Sub-City, Addis Ababa, Ethiopia';
      stored.storePhone = '+251 91 123 4567';
      stored.vatNumber = 'TIN-008921447';
    }
    return { ...INITIAL_SETTINGS, ...stored };
  }
  return { ...INITIAL_SETTINGS };
}

function initializeProducts(): Product[] {
  const loaded = loadStored<Product[]>(STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
  return loaded.map((p) => {
    let price =
      p.price !== null && p.price !== undefined && !isNaN(Number(p.price))
        ? Number(p.price)
        : 100.0;
    if (price > 0 && price <= 30) {
      if (p.id === 'prod-1') price = 180;
      else if (p.id === 'prod-2') price = 95;
      else if (p.id === 'prod-3') price = 450;
      else if (p.id === 'prod-4') price = 120;
      else if (p.id === 'prod-5') price = 650;
      else if (p.id === 'prod-6') price = 750;
      else if (p.id === 'prod-7') price = 1400;
      else if (p.id === 'prod-8') price = 135;
      else price = Math.round(price * 30);
    }
    return {
      ...p,
      price,
      isPriceOptional: false,
      color: p.color || '#6366f1',
      sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  });
}

// Reactive POS Application State
const products = ref<Product[]>(initializeProducts());
const sales = ref<SaleRecord[]>(loadStored(STORAGE_KEY_SALES, INITIAL_SALES));
const settings = ref<StoreSettings>(initializeSettings());
const cart = ref<CartItem[]>([]);
const activeTab = ref<NavigationTab>('pos');
const isDrawerOpen = ref<boolean>(false);
const isDrawerCollapsed = ref<boolean>(false);

// Modal & Prompt states
const isAddProductModalOpen = ref<boolean>(false);
const editingProduct = ref<Product | null>(null);
const isCheckoutModalOpen = ref<boolean>(false);
const isCustomPriceModalOpen = ref<boolean>(false);
const pendingProductForCustomPrice = ref<Product | null>(null);
const selectedSaleForReceipt = ref<SaleRecord | null>(null);

// Settings sync to LocalStorage
watch(
  settings,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newVal));
    } catch (e) {
      console.error('Failed to persist settings locally', e);
    }
  },
  { deep: true }
);

// Auto-sync Products changes to LocalStorage fallback
watch(
  products,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newVal));
    } catch (e) {
      console.error('Failed to persist products locally', e);
    }
  },
  { deep: true }
);

// Auto-sync Sales changes to LocalStorage fallback
watch(
  sales,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(newVal));
    } catch (e) {
      console.error('Failed to persist sales locally', e);
    }
  },
  { deep: true }
);

export function usePosStore() {
  // Navigation & Drawer Helpers
  const openDrawer = () => {
    isDrawerOpen.value = true;
  };
  const closeDrawer = () => {
    isDrawerOpen.value = false;
  };
  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value;
  };
  const toggleDrawerCollapse = () => {
    isDrawerCollapsed.value = !isDrawerCollapsed.value;
  };
  const navigateTo = (tab: NavigationTab) => {
    activeTab.value = tab;
    if (window.innerWidth < 1024) {
      isDrawerOpen.value = false;
    }
  };

  // Currency Formatter
  const formatCurrency = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) {
      return '0.00 ETB';
    }
    const curr = settings.value.currency || 'ETB';
    const formatted = Number(val).toFixed(2);
    const needsSpace = curr.length > 1 || /[\u1200-\u137F]/.test(curr);
    return settings.value.currencyPosition === 'suffix'
      ? `${formatted} ${curr}`
      : needsSpace
        ? `${curr} ${formatted}`
        : `${curr}${formatted}`;
  };

  // Cart Calculations
  const cartSubtotal = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  });

  const cartTaxAmount = computed(() => {
    if (!settings.value.enableTax) return 0;
    return (cartSubtotal.value * (settings.value.taxRate / 100));
  });

  const cartTotalCount = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return cartSubtotal.value + cartTaxAmount.value;
  });

  // Cart Management
  const addToCart = (product: Product, customPriceOverride?: number) => {
    const effectivePrice =
      customPriceOverride !== undefined
        ? Number(customPriceOverride)
        : Number(product.price ?? 0);

    const isCustom = customPriceOverride !== undefined;

    const existingIndex = cart.value.findIndex(
      (item) => item.productId === product.id && item.unitPrice === effectivePrice
    );

    if (existingIndex > -1) {
      cart.value[existingIndex].quantity += 1;
    } else {
      cart.value.push({
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        unitPrice: Math.max(0, effectivePrice),
        isCustomPrice: isCustom,
        quantity: 1,
        sku: product.sku,
        category: product.category,
      });
    }

    if (settings.value.soundEnabled) {
      playBeep();
    }
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    const item = cart.value.find((i) => i.id === cartItemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(cartItemId);
    } else {
      item.quantity = newQty;
    }
  };

  const setCartQuantity = (cartItemId: string, qty: number) => {
    const item = cart.value.find((i) => i.id === cartItemId);
    if (!item) return;
    if (qty <= 0) {
      removeFromCart(cartItemId);
    } else {
      item.quantity = Math.floor(qty);
    }
  };

  const updateCartItemPrice = (cartItemId: string, newPrice: number) => {
    const item = cart.value.find((i) => i.id === cartItemId);
    if (!item) return;
    item.unitPrice = Math.max(0, newPrice);
    item.isCustomPrice = true;
  };

  const removeFromCart = (cartItemId: string) => {
    cart.value = cart.value.filter((i) => i.id !== cartItemId);
  };

  const clearCart = () => {
    cart.value = [];
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio context may be restricted by browser
    }
  };

  // Product Actions
  const addProduct = (payload: {
    name: string;
    price?: number | null;
    isPriceOptional?: boolean;
    category?: string;
    sku?: string;
    stock?: number;
    barcode?: string;
    description?: string;
    color?: string;
  }) => {
    const parsedPrice =
      payload.price !== null && payload.price !== undefined && !isNaN(Number(payload.price))
        ? Number(payload.price)
        : 0;

    const newProdId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newProdId,
      name: payload.name.trim(),
      price: parsedPrice,
      isPriceOptional: false,
      category: payload.category || 'general',
      sku: payload.sku?.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: payload.stock !== undefined ? Number(payload.stock) : 999,
      barcode: payload.barcode?.trim() || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      description: payload.description?.trim() || '',
      color: payload.color || '#6366f1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add to local store
    products.value = [newProd, ...products.value.filter((p) => p.id !== newProdId)];

    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const index = products.value.findIndex((p) => p.id === id);
    if (index > -1) {
      products.value[index] = {
        ...products.value[index],
        ...updates,
        updatedAt: Date.now(),
      };
    }
  };

  const deleteProduct = (id: string) => {
    products.value = products.value.filter((p) => p.id !== id);
  };

  // Sale Completion
  const completeSale = (payload: {
    paymentMethod: 'cash' | 'card' | 'qr' | 'split';
    amountTendered?: number;
    discount?: number;
    customerName?: string;
    cashierName?: string;
    notes?: string;
  }): SaleRecord => {
    const subtotal = cartSubtotal.value;
    const discount = payload.discount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = settings.value.enableTax
      ? discountedSubtotal * (settings.value.taxRate / 100)
      : 0;
    const total = discountedSubtotal + taxAmount;
    const tendered = payload.amountTendered ?? total;
    const changeDue = Math.max(0, tendered - total);

    const saleId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const saleRecord: SaleRecord = {
      id: saleId,
      timestamp: Date.now(),
      items: [...cart.value],
      subtotal,
      discount,
      taxRate: settings.value.enableTax ? settings.value.taxRate : 0,
      taxAmount,
      total,
      paymentMethod: payload.paymentMethod,
      amountTendered: payload.paymentMethod === 'cash' ? tendered : undefined,
      changeDue: payload.paymentMethod === 'cash' ? changeDue : undefined,
      customerName: payload.customerName?.trim() || 'Walk-in Customer',
      cashierName: payload.cashierName || 'Cashier',
      status: 'completed',
      notes: payload.notes,
    };

    // Deduct stock locally
    cart.value.forEach((cItem) => {
      const p = products.value.find((prod) => prod.id === cItem.productId);
      if (p && p.stock !== undefined) {
        p.stock = Math.max(0, p.stock - cItem.quantity);
        p.updatedAt = Date.now();
      }
    });

    // Local state update
    sales.value = [saleRecord, ...sales.value];
    cart.value = [];
    selectedSaleForReceipt.value = saleRecord;

    return saleRecord;
  };

  // Backup & Restore
  const resetToDemoData = async () => {
    products.value = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    sales.value = JSON.parse(JSON.stringify(INITIAL_SALES));
    settings.value = JSON.parse(JSON.stringify(INITIAL_SETTINGS));
    cart.value = [];
  };

  const exportBackup = () => {
    const payload = {
      app: 'Yum POS',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products: products.value,
      sales: sales.value,
      settings: settings.value,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yum-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products)) products.value = data.products;
      if (Array.isArray(data.sales)) sales.value = data.sales;
      if (data.settings && typeof data.settings === 'object') settings.value = data.settings;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid JSON backup' };
    }
  };

  // Dashboard Metrics
  const todayRevenue = computed(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const timestampToday = startOfDay.getTime();

    return sales.value
      .filter((s) => s.timestamp >= timestampToday && s.status === 'completed')
      .reduce((acc, s) => acc + s.total, 0);
  });

  const todayOrdersCount = computed(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const timestampToday = startOfDay.getTime();

    return sales.value.filter((s) => s.timestamp >= timestampToday && s.status === 'completed').length;
  });

  const lowStockCount = computed(() => {
    const threshold = settings.value.lowStockThreshold || 10;
    return products.value.filter((p) => p.stock !== undefined && p.stock <= threshold).length;
  });

  const totalProductsCount = computed(() => products.value.length);

  return {
    // State
    products,
    sales,
    settings,
    cart,
    activeTab,
    isDrawerOpen,
    isDrawerCollapsed,
    isAddProductModalOpen,
    editingProduct,
    isCheckoutModalOpen,
    isCustomPriceModalOpen,
    pendingProductForCustomPrice,
    selectedSaleForReceipt,

    // Navigation & Drawer
    openDrawer,
    closeDrawer,
    toggleDrawer,
    toggleDrawerCollapse,
    navigateTo,

    // Currency
    formatCurrency,

    // Cart
    cartSubtotal,
    cartTaxAmount,
    cartTotal,
    cartTotalCount,
    addToCart,
    updateCartQuantity,
    setCartQuantity,
    updateCartItemPrice,
    removeFromCart,
    clearCart,

    // Products
    addProduct,
    updateProduct,
    deleteProduct,

    // Sales
    completeSale,

    // Metrics
    todayRevenue,
    todayOrdersCount,
    lowStockCount,
    totalProductsCount,

    // Backup
    resetToDemoData,
    exportBackup,
    importBackup,
  };
}
