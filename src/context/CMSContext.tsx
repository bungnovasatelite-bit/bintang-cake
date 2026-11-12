import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StoreConfig {
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
}

const DEFAULT_STORE_CONFIG: StoreConfig = {
  heroTag: 'PARTNER TO ENJOY YOUR DAY',
  heroTitle: 'Bintang Cake & Cookies',
  heroSubtitle: 'Rayakan setiap kebersamaan berharga dengan kreasi kue lembut dan kue kering mentega Wijsman premium.',
  heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  promoTag: '⚡ FLASH SALE • Berakhir 2 hari lagi',
  promoTitle: 'Dapatkan Souvenir Cantik',
  promoSubtitle: 'Dapatkan Souvenir Cantik setiap Pembelian sejumlah Rp 750.000',
  promoDiscount: 'Rp 5.000',
  boutiqueAddress: 'Jl. Cikini Raya No. 42, Menteng, Jakarta Pusat',
  boutiqueHours: '09:00 - 20:00 WIB',
  whatsappNumber: '0812-3456-7890',
};

interface CMSContextType {
  isAdminLoggedIn: boolean;
  isCMSOpen: boolean;
  openCMS: () => void;
  closeCMS: () => void;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  products: Product[];
  storeConfig: StoreConfig;
  updateStoreConfig: (config: Partial<StoreConfig>) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefault: () => void;
  isSyncing: boolean;
  syncNotice: string | null;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bintang_cms_admin') === 'true';
  });

  const [isCMSOpen, setIsCMSOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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

  // Coba sinkronisasi data produk dari Supabase saat awal load
  useEffect(() => {
    async function loadFromSupabase() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Product[] = data.map((item) => ({
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
          localStorage.setItem('bintang_products', JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Gagal memuat produk dari Supabase:', err);
      }
    }

    loadFromSupabase();
  }, []);

  const openCMS = () => setIsCMSOpen(true);
  const closeCMS = () => setIsCMSOpen(false);

  const loginAdmin = (user: string, pass: string): boolean => {
    // Kredensial yang diminta: user: bintang, password: nadine13
    if (user.trim() === 'bintang' && pass === 'nadine13') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('bintang_cms_admin', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('bintang_cms_admin');
  };

  const updateStoreConfig = (config: Partial<StoreConfig>) => {
    setStoreConfig((prev) => {
      const next = { ...prev, ...config };
      localStorage.setItem('bintang_store_config', JSON.stringify(next));
      return next;
    });
    setSyncNotice('Perubahan banner & informasi toko berhasil disimpan!');
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
    localStorage.setItem('bintang_products', JSON.stringify(nextProducts));

    // Sinkronisasi otomatis ke Supabase jika tabel siap
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
    localStorage.setItem('bintang_products', JSON.stringify(nextProducts));

    // Sinkronisasi otomatis ke Supabase
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
    setSyncNotice('Perubahan produk berhasil diperbarui!');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const deleteProduct = async (id: string) => {
    setIsSyncing(true);
    const nextProducts = products.filter((p) => p.id !== id);
    setProducts(nextProducts);
    localStorage.setItem('bintang_products', JSON.stringify(nextProducts));

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

  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setStoreConfig(DEFAULT_STORE_CONFIG);
    localStorage.removeItem('bintang_products');
    localStorage.removeItem('bintang_store_config');
    setSyncNotice('Seluruh data berhasil dikembalikan ke standar awal.');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  return (
    <CMSContext.Provider
      value={{
        isAdminLoggedIn,
        isCMSOpen,
        openCMS,
        closeCMS,
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
