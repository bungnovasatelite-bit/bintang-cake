import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  reinitSupabaseClient
} from '../lib/supabase';
import {
  OrderRecord,
  fetchOrders,
  updateOrderStatusInDb,
  deleteOrderFromDb
} from '../lib/database';

export interface StoreConfig {
  logoImage?: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  promoTag: string;
  promoTitle: string;
  promoSubtitle: string;
  promoDiscount: string;
  boutiqueAddress: string;
  boutiqueHours: string;
  whatsappNumber: string;
  // Pengaturan Pembayaran (QRIS & Transfer Bank)
  qrisImage?: string;
  qrisCode?: string;
  bankName: string;
  bankAccount: string;
}

const DEFAULT_STORE_CONFIG: StoreConfig = {
  logoImage: '',
  heroTag: 'PARTNER TO ENJOY YOUR DAY',
  heroTitle: 'Bintang Cake',
  heroSubtitle: 'Rayakan setiap kebersamaan berharga dengan kreasi kue lembut dan kue kering mentega Wijsman premium.',
  heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  promoTag: '⚡ FLASH SALE • Berakhir 2 hari lagi',
  promoTitle: 'Dapatkan Souvenir Cantik',
  promoSubtitle: 'Dapatkan Souvenir Cantik setiap Pembelian sejumlah Rp 750.000',
  promoDiscount: 'Rp 5.000',
  boutiqueAddress: 'Jl. Cikini Raya No. 42, Menteng, Jakarta Pusat',
  boutiqueHours: '09:00 - 20:00 WITA',
  whatsappNumber: '0821-5873-9760',
  qrisImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
  qrisCode: 'NMID: ID1020304050607 - Bintang Cake',
  bankName: 'BCA (Bank Central Asia)',
  bankAccount: '8210-9876-5432 a/n Bintang Cake',
};

interface CMSContextType {
  isAdminLoggedIn: boolean;
  isCMSOpen: boolean;
  openCMS: () => void;
  closeCMS: () => void;
  openCMSToEditProduct: (p: Product) => void;
  openCMSToAddProduct: (category?: string) => void;
  editingProductTarget: Product | null;
  setEditingProductTarget: (p: Product | null) => void;
  targetAddCategory: string | null;
  setTargetAddCategory: (cat: string | null) => void;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  products: Product[];
  storeConfig: StoreConfig;
  updateStoreConfig: (config: Partial<StoreConfig>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefault: () => void;
  isSyncing: boolean;
  syncNotice: string | null;
  // Pesanan Pelanggan (Khusus Admin)
  orders: OrderRecord[];
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  // Konfigurasi Kredensial Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  updateSupabaseCredentials: (url: string, key: string) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bintang_cms_admin') === 'true';
  });

  const [isCMSOpen, setIsCMSOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Target edit & add produk langsung dari Katalog
  const [editingProductTarget, setEditingProductTarget] = useState<Product | null>(null);
  const [targetAddCategory, setTargetAddCategory] = useState<string | null>(null);

  // Kredensial Supabase di Konfigurasi CMS
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);

  // Pesanan Pelanggan
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('bintang_store_config');
    if (saved) {
      try {
        return { ...DEFAULT_STORE_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STORE_CONFIG;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bintang_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Muat pesanan saat CMS dibuka atau saat login
  const refreshOrders = async () => {
    const loaded = await fetchOrders();
    setOrders(loaded);
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      refreshOrders();
    }
  }, [isAdminLoggedIn]);

  // Sinkronisasi data Toko (Store Settings) & Produk dari Supabase ke SEMUA PERANGKAT
  useEffect(() => {
    async function loadCloudData() {
      if (!isSupabaseConfigured()) return;

      try {
        // 1. Muat pengaturan toko bersama dari Supabase
        const { data: storeData } = await supabase
          .from('store_settings')
          .select('config')
          .eq('id', 'bintang_store')
          .single();

        if (storeData && storeData.config) {
          setStoreConfig((prev) => ({ ...prev, ...storeData.config }));
          try {
            localStorage.setItem('bintang_store_config', JSON.stringify(storeData.config));
          } catch (e) {
            console.warn(e);
          }
        }

        // 2. Muat produk dari Supabase jika tabel sudah dibuat
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!prodErr && prodData && prodData.length > 0) {
          const mapped: Product[] = prodData.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category_id as any,
            packageType: item.package_type,
            price: Number(item.price),
            rating: Number(item.rating || 5.0),
            reviewCount: item.review_count || '0',
            badge: item.badge,
            image: item.image_url,
            description: item.description,
            sizes: item.sizes,
          }));
          setProducts(mapped);
          try {
            localStorage.setItem('bintang_products', JSON.stringify(mapped));
          } catch (e) {
            console.warn(e);
          }
        }
      } catch (err) {
        console.warn('Supabase cloud fetch info:', err);
      }
    }

    loadCloudData();
  }, []);

  const openCMS = () => {
    setIsCMSOpen(true);
    refreshOrders();
  };

  const openCMSToEditProduct = (p: Product) => {
    setEditingProductTarget(p);
    setIsCMSOpen(true);
  };

  const openCMSToAddProduct = (category?: string) => {
    setTargetAddCategory(category || 'cookies');
    setEditingProductTarget(null);
    setIsCMSOpen(true);
  };
  
  const closeCMS = () => {
    setIsCMSOpen(false);
    setEditingProductTarget(null);
    setTargetAddCategory(null);
  };

  const loginAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === 'bintang' && pass === 'nadine13') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('bintang_cms_admin', 'true');
      refreshOrders();
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('bintang_cms_admin');
  };

  // Simpan Store Config lokal DAN ke Supabase (Sinkron ke semua HP/Laptop)
  const updateStoreConfig = async (config: Partial<StoreConfig>) => {
    const next = { ...storeConfig, ...config };
    setStoreConfig(next);
    
    try {
      localStorage.setItem('bintang_store_config', JSON.stringify(next));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('store_settings').upsert({
          id: 'bintang_store',
          config: next,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Gagal simpan store_settings ke Supabase:', e);
      }
    }

    setSyncNotice('Pengaturan toko & banner tersimpan permanen!');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSyncing(true);
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };

    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    
    localStorage.setItem('bintang_has_custom_edits', 'true');
    try {
      localStorage.setItem('bintang_products', JSON.stringify(nextProducts));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').insert({
          id: newId,
          name: newProduct.name,
          category_id: newProduct.category,
          package_type: newProduct.packageType,
          price: newProduct.price,
          rating: newProduct.rating,
          review_count: String(newProduct.reviewCount),
          badge: newProduct.badge,
          image_url: newProduct.image,
          description: newProduct.description,
          sizes: newProduct.sizes,
        });
      } catch (e) {
        console.warn('Gagal insert ke Supabase:', e);
      }
    }

    setIsSyncing(false);
    setSyncNotice(`Produk "${newProduct.name}" berhasil ditambahkan!`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    setIsSyncing(true);
    const nextProducts = products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setProducts(nextProducts);
    
    localStorage.setItem('bintang_has_custom_edits', 'true');
    try {
      localStorage.setItem('bintang_products', JSON.stringify(nextProducts));
    } catch (e) {
      console.warn('LocalStorage quota handling:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        const updatePayload: Record<string, any> = {};
        if (updatedFields.name !== undefined) updatePayload.name = updatedFields.name;
        if (updatedFields.category !== undefined) updatePayload.category_id = updatedFields.category;
        if (updatedFields.packageType !== undefined) updatePayload.package_type = updatedFields.packageType;
        if (updatedFields.price !== undefined) updatePayload.price = updatedFields.price;
        if (updatedFields.rating !== undefined) updatePayload.rating = updatedFields.rating;
        if (updatedFields.reviewCount !== undefined) updatePayload.review_count = String(updatedFields.reviewCount);
        if (updatedFields.badge !== undefined) updatePayload.badge = updatedFields.badge;
        if (updatedFields.image !== undefined) updatePayload.image_url = updatedFields.image;
        if (updatedFields.description !== undefined) updatePayload.description = updatedFields.description;
        if (updatedFields.sizes !== undefined) updatePayload.sizes = updatedFields.sizes;

        await supabase.from('products').update(updatePayload).eq('id', id);
      } catch (e) {
        console.warn('Gagal update ke Supabase:', e);
      }
    }

    setIsSyncing(false);
    setSyncNotice('Perubahan produk berhasil disimpan!');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const deleteProduct = async (id: string) => {
    setIsSyncing(true);
    const nextProducts = products.filter((p) => p.id !== id);
    setProducts(nextProducts);
    localStorage.setItem('bintang_has_custom_edits', 'true');
    try {
      localStorage.setItem('bintang_products', JSON.stringify(nextProducts));
    } catch (e) {
      console.warn(e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Gagal delete dari Supabase:', e);
      }
    }

    setIsSyncing(false);
    setSyncNotice('Produk berhasil dihapus!');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Pesanan Pelanggan (Orders)
  const updateOrderStatus = async (orderId: string, status: OrderRecord['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await updateOrderStatusInDb(orderId, status);
    setSyncNotice(`Status pesanan #${orderId} diubah menjadi "${status.toUpperCase()}".`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await deleteOrderFromDb(orderId);
    setSyncNotice(`Pesanan #${orderId} berhasil dihapus.`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const resetToDefault = () => {
    localStorage.removeItem('bintang_products');
    localStorage.removeItem('bintang_store_config');
    localStorage.removeItem('bintang_has_custom_edits');
    localStorage.removeItem('bintang_orders');
    setProducts(INITIAL_PRODUCTS);
    setStoreConfig(DEFAULT_STORE_CONFIG);
    setOrders([]);
    setSyncNotice('Data berhasil di-reset ke setelan awal pabrik.');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const updateSupabaseCredentials = (url: string, key: string) => {
    saveSupabaseCredentials(url, key);
    reinitSupabaseClient();
    setSupabaseUrl(url);
    setSupabaseAnonKey(key);
    setSyncNotice('Koneksi Supabase berhasil diperbarui!');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  return (
    <CMSContext.Provider
      value={{
        isAdminLoggedIn,
        isCMSOpen,
        openCMS,
        closeCMS,
        openCMSToEditProduct,
        openCMSToAddProduct,
        editingProductTarget,
        setEditingProductTarget,
        targetAddCategory,
        setTargetAddCategory,
        loginAdmin,
        logoutAdmin,
        products,
        storeConfig,
        updateStoreConfig,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefault,
        isSyncing,
        syncNotice,
        orders,
        refreshOrders,
        updateOrderStatus,
        deleteOrder,
        supabaseUrl,
        supabaseAnonKey,
        updateSupabaseCredentials,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
