import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  ClipboardList,
  Database,
  Phone,
  RefreshCw,
  Loader2,
  Clock,
  RotateCcw,
  QrCode,
  Building2,
  CreditCard,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Product } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { testSupabaseConnection, SupabaseHealthCheckResult } from '../../lib/supabase';
import { BrandLogo } from '../icons/BrandLogo';

export const CMSModal: React.FC = () => {
  const {
    isCMSOpen,
    closeCMS,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    products,
    storeConfig,
    updateStoreConfig,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    syncNotice,
    isSyncing,
    orders,
    refreshOrders,
    updateOrderStatus,
    deleteOrder,
    supabaseUrl,
    supabaseAnonKey,
    updateSupabaseCredentials,
    editingProductTarget,
    setEditingProductTarget,
    targetAddCategory,
    setTargetAddCategory,
  } = useCMS();

  // Login form state (PETUNJUK CREDENTIALS DIHILANGKAN DARI TAMPILAN)
  const [username, setUsername] = useState('bintang');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // CMS Tabs: products | orders | banners | payments | config
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'banners' | 'payments' | 'config'>('products');

  // Filter Kategori di CMS (Cake, Cookies, Brownies, Hampers, Custom)
  const [cmsCategoryFilter, setCmsCategoryFilter] = useState<string>('all');

  // Product Editor Modal state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCompressingImg, setIsCompressingImg] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'cake' | 'cookies' | 'brownies' | 'hampers' | 'custom'>('cookies');
  const [formPackage, setFormPackage] = useState('TOPLES MIKA ULIR 200 GR');
  const [formPrice, setFormPrice] = useState<number>(50000);
  const [formRating, setFormRating] = useState<number>(5.0);
  const [formReviews, setFormReviews] = useState<string>('100+');
  const [formBadge, setFormBadge] = useState<string>('BEST SELLER');
  const [formImage, setFormImage] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');

  // Orders filter state
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  // Banner & Branding state
  const [logoImage, setLogoImage] = useState(storeConfig.logoImage || '');
  const [heroTag, setHeroTag] = useState(storeConfig.heroTag);
  const [heroTitle, setHeroTitle] = useState(storeConfig.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(storeConfig.heroSubtitle);
  const [heroImage, setHeroImage] = useState(storeConfig.heroImage);

  // Payment settings state (QRIS & Bank)
  const [qrisImage, setQrisImage] = useState(storeConfig.qrisImage || '');
  const [qrisCode, setQrisCode] = useState(storeConfig.qrisCode || '');
  const [bankName, setBankName] = useState(storeConfig.bankName || '');
  const [bankAccount, setBankAccount] = useState(storeConfig.bankAccount || '');

  // Supabase config state
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [testResult, setTestResult] = useState<SupabaseHealthCheckResult | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // SQL Script untuk dieksekusi di Supabase
  const fullSqlScript = `-- =============================================================================
-- Bintang Cake & Cookies - Database Schema & Multi-Device Cloud Sync
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard/project/rkgdccccfkemerwdgsvz/sql/new
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    package_type TEXT,
    price NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    review_count TEXT DEFAULT '0',
    badge TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    sizes JSONB,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'bintang_store',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_mode TEXT NOT NULL,
    schedule_time TEXT,
    delivery_address TEXT,
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    coupon_code TEXT,
    payment_method TEXT DEFAULT 'qris',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selected_size TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
CREATE POLICY "Public can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage products" ON public.products;
CREATE POLICY "Public can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage store_settings" ON public.store_settings;
CREATE POLICY "Public can manage store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage orders" ON public.orders;
CREATE POLICY "Public can manage orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage order items" ON public.order_items;
CREATE POLICY "Public can manage order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.categories (id, name, description, icon) VALUES
('cake', 'Cake', 'Aneka kue bolu dan kue tart lembut artisan', 'Cake'),
('cookies', 'Cookies', 'Kue kering mentega Wijsman renyah dan gurih', 'Cookie'),
('brownies', 'Brownies', 'Fudgy brownies dengan aneka topping premium', 'Coffee'),
('hampers', 'Hampers', 'Paket bingkisan mewah untuk hari raya dan momen spesial', 'Gift'),
('custom', 'Custom', 'Kue kustom pesanan khusus hari ulang tahun dan perayaan', 'Palette')
ON CONFLICT (id) DO NOTHING;
`;

  const copySqlScript = () => {
    navigator.clipboard.writeText(fullSqlScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  // Sync state whenever modal opens or storeConfig changes
  useEffect(() => {
    if (isCMSOpen) {
      setLogoImage(storeConfig.logoImage || '');
      setHeroTag(storeConfig.heroTag);
      setHeroTitle(storeConfig.heroTitle);
      setHeroSubtitle(storeConfig.heroSubtitle);
      setHeroImage(storeConfig.heroImage);
      setQrisImage(storeConfig.qrisImage || '');
      setQrisCode(storeConfig.qrisCode || '');
      setBankName(storeConfig.bankName || '');
      setBankAccount(storeConfig.bankAccount || '');
      setInputUrl(supabaseUrl);
      setInputKey(supabaseAnonKey);

      // Tangani pemicu langsung Edit Produk dari halaman Katalog
      if (editingProductTarget) {
        setActiveTab('products');
        openEditProductForm(editingProductTarget);
        setEditingProductTarget(null);
      } else if (targetAddCategory) {
        // Tangani pemicu Tambah Produk dari halaman Katalog
        setActiveTab('products');
        openNewProductForm(targetAddCategory as any);
        setTargetAddCategory(null);
      }
    }
  }, [isCMSOpen, storeConfig, supabaseUrl, supabaseAnonKey, editingProductTarget, targetAddCategory]);

  if (!isCMSOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = loginAdmin(username, password);
    if (!success) {
      // Pesan error umum tanpa membocorkan kredensial di layar
      setLoginError('Username atau password yang Anda masukkan salah. Silakan coba kembali.');
    }
  };

  const openNewProductForm = (preselectedCategory?: 'cake' | 'cookies' | 'brownies' | 'hampers' | 'custom') => {
    const cat = preselectedCategory || (cmsCategoryFilter !== 'all' ? (cmsCategoryFilter as any) : 'cookies');
    setEditingProductId(null);
    setFormName('');
    setFormCategory(cat);
    setFormPackage(cat === 'cookies' ? 'TOPLES MIKA ULIR 200 GR' : cat === 'cake' ? 'CAKE / KUE ULTAH' : cat.toUpperCase());
    setFormPrice(cat === 'cake' ? 150000 : cat === 'hampers' ? 250000 : 50000);
    setFormRating(5.0);
    setFormReviews('50+');
    setFormBadge('NEW ARRIVAL');
    setFormImage('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80');
    setFormDesc('Kue lezat buatan tangan dengan bahan mentega Wijsman kualitas terbaik.');
    setIsEditingProduct(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProductId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPackage(p.packageType || '');
    setFormPrice(p.price);
    setFormRating(p.rating);
    setFormReviews(String(p.reviewCount));
    setFormBadge(p.badge || 'NONE');
    setFormImage(p.image);
    setFormDesc(p.description || '');
    setIsEditingProduct(true);
  };

  // Upload gambar produk
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 700, 700, 0.75);
        setFormImage(compressed);
      } catch (err) {
        console.error('Gagal kompresi:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  // Upload Logo Toko dengan kompresi
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 400, 400, 0.85);
        setLogoImage(compressed);
        await updateStoreConfig({ logoImage: compressed });
      } catch (err) {
        console.error('Gagal upload logo:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  // Upload Foto Hero dengan kompresi
  const handleHeroImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 1200, 800, 0.80);
        setHeroImage(compressed);
        await updateStoreConfig({ heroImage: compressed });
      } catch (err) {
        console.error('Gagal upload foto hero:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  // Upload Barcode QRIS
  const handleQrisImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 600, 600, 0.80);
        setQrisImage(compressed);
        await updateStoreConfig({ qrisImage: compressed });
      } catch (err) {
        console.error('Gagal upload QRIS:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const badgeVal = formBadge === 'NONE' ? undefined : (formBadge as any);

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: formName,
        category: formCategory,
        packageType: formPackage,
        price: Number(formPrice),
        rating: Number(formRating),
        reviewCount: formReviews,
        badge: badgeVal,
        image: formImage,
        description: formDesc,
      });
    } else {
      await addProduct({
        name: formName,
        category: formCategory,
        packageType: formPackage,
        price: Number(formPrice),
        rating: Number(formRating),
        reviewCount: formReviews,
        badge: badgeVal,
        image: formImage,
        description: formDesc,
      });
    }
    setIsEditingProduct(false);
  };

  const handleSaveBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreConfig({
      logoImage,
      heroTag,
      heroTitle,
      heroSubtitle,
      heroImage,
    });
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreConfig({
      qrisImage,
      qrisCode,
      bankName,
      bankAccount,
    });
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(inputUrl, inputKey);
    setIsTestingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Filter produk berdasarkan tab kategori di CMS
  const filteredCmsProducts = products.filter((p) => {
    if (cmsCategoryFilter === 'all') return true;
    return p.category === cmsCategoryFilter;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={closeCMS}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] bg-[#FAF5EE] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-[#D4A373]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== VIEW 1: LOGIN ADMIN (PETUNJUK CREDENTIALS DIHILANGKAN) ===================== */}
        {!isAdminLoggedIn ? (
          <div className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4A2810] text-[#FFFDF9] flex items-center justify-center shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#3D2314]">
                    Masuk Panel Pengelola
                  </h2>
                  <p className="text-xs text-[#8C7A6B]">
                    CMS Bintang Cake &amp; Cookies
                  </p>
                </div>
              </div>

              <button
                onClick={closeCMS}
                className="p-1.5 rounded-full hover:bg-[#F3E8DA] text-[#8C7A6B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2810] mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#4A2810]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2810] mb-1">
                  Kata Sandi (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#4A2810]"
                  required
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-[#FDECE8] border border-[#F5C7B9] text-[11px] font-semibold text-[#A03D2A] animate-shake">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Masuk ke Panel Pengelola
              </button>
            </form>
          </div>
        ) : (
          /* ===================== VIEW 2: CMS DASHBOARD ===================== */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Top Bar */}
            <div className="p-4 bg-[#FAF5EE] border-b border-[#E8DACB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] animate-pulse" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D2314] leading-none">
                    Panel CMS Bintang Cake
                  </h3>
                  <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                    Mode Pengelola Aktif
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={logoutAdmin}
                  className="p-1.5 rounded-xl bg-white border border-[#E8DACB] text-[#A03D2A] hover:bg-[#FDECE8] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <button
                  onClick={closeCMS}
                  className="p-1.5 rounded-xl hover:bg-[#F3E8DA] text-[#8C7A6B] cursor-pointer"
                  aria-label="Tutup CMS"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sync Notification Banner */}
            {syncNotice && (
              <div className="px-4 py-2 bg-[#E3EFE3] text-[#2C6E49] text-xs font-bold flex items-center gap-1.5 border-b border-[#C5DEC5] shrink-0">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncNotice}</span>
              </div>
            )}

            {/* CMS Navigation Tabs (5 Tabs) */}
            <div className="flex items-center px-3 pt-2 border-b border-[#E8DACB] gap-1 shrink-0 bg-[#FFFDF9]/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Katalog ({products.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsEditingProduct(false);
                  refreshOrders();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Pesanan ({orders.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('banners');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'banners'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Logo &amp; Hero
              </button>

              <button
                onClick={() => {
                  setActiveTab('payments');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                QRIS &amp; Bank
              </button>

              <button
                onClick={() => {
                  setActiveTab('config');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'config'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Supabase
              </button>
            </div>

            {/* CMS Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* ===================== TAB 1: PRODUCTS (LENGKAP SEMUA KATEGORI) ===================== */}
              {activeTab === 'products' && (
                <div>
                  {isEditingProduct ? (
                    /* PRODUCT FORM (ADD/EDIT UNTUK SEMUA KATEGORI: CAKE, COOKIES, BROWNIES, HAMPERS, CUSTOM) */
                    <form onSubmit={handleSaveProduct} className="space-y-3 bg-white p-4 rounded-3xl border border-[#E8DACB] shadow-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F5EFE6]">
                        <h4 className="font-serif font-bold text-sm text-[#3D2314]">
                          {editingProductId ? 'Edit Produk' : `Tambah Produk (${formCategory.toUpperCase()})`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="text-xs text-[#8C7A6B] hover:text-[#3D2314] cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>

                      {/* Image Preview & Upload with Compression */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                          Foto Produk
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                            {formImage ? (
                              <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                              {isCompressingImg ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Mengompres Foto...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Pilih Foto dari Perangkat</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductImageUpload}
                                className="hidden"
                                disabled={isCompressingImg}
                              />
                            </label>
                            <input
                              type="text"
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              placeholder="Atau tempel URL gambar..."
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name & Category Selector (Cake, Cookies, Brownies, Hampers, Custom) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Nama Produk
                          </label>
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Contoh: Choco Fudge Cake"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Pilih Kategori
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none cursor-pointer"
                          >
                            <option value="cake">🎂 Cake / Bolu</option>
                            <option value="cookies">🍪 Cookies (Kue Kering)</option>
                            <option value="brownies">🍫 Brownies</option>
                            <option value="hampers">🎁 Hampers / Bingkisan</option>
                            <option value="custom">✨ Custom Cake</option>
                          </select>
                        </div>
                      </div>

                      {/* Package & Badge */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Ukuran / Kemasan
                          </label>
                          <input
                            type="text"
                            value={formPackage}
                            onChange={(e) => setFormPackage(e.target.value)}
                            placeholder="Contoh: Diameter 20 cm / Toples Mika"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Label Badge
                          </label>
                          <select
                            value={formBadge}
                            onChange={(e) => setFormBadge(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none cursor-pointer"
                          >
                            <option value="NONE">Tanpa Badge</option>
                            <option value="BEST SELLER">BEST SELLER</option>
                            <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                            <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                            <option value="SPECIAL GIFT">SPECIAL GIFT</option>
                          </select>
                        </div>
                      </div>

                      {/* Price & Rating */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Harga (Rp)
                          </label>
                          <input
                            type="number"
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            placeholder="50000"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Rating &amp; Ulasan
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            <input
                              type="number"
                              step="0.1"
                              max="5"
                              value={formRating}
                              onChange={(e) => setFormRating(Number(e.target.value))}
                              className="px-2 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={formReviews}
                              onChange={(e) => setFormReviews(e.target.value)}
                              placeholder="128"
                              className="px-2 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                          Deskripsi Produk
                        </label>
                        <textarea
                          rows={2}
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          placeholder="Jelaskan tekstur, aroma, dan cita rasa kue..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="flex-1 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#7A6657] cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSyncing}
                          className="flex-1 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-sm hover:bg-[#341A08] cursor-pointer"
                        >
                          {isSyncing ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* PRODUCT LIST WITH CATEGORY TABS */
                    <div className="space-y-3">
                      {/* Filter Kategori Tabs di CMS */}
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                        {[
                          { id: 'all', label: 'Semua', count: products.length },
                          { id: 'cake', label: 'Cake', count: products.filter(p => p.category === 'cake').length },
                          { id: 'cookies', label: 'Cookies', count: products.filter(p => p.category === 'cookies').length },
                          { id: 'brownies', label: 'Brownies', count: products.filter(p => p.category === 'brownies').length },
                          { id: 'hampers', label: 'Hampers', count: products.filter(p => p.category === 'hampers').length },
                          { id: 'custom', label: 'Custom', count: products.filter(p => p.category === 'custom').length },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setCmsCategoryFilter(cat.id)}
                            className={`px-3 py-1 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                              cmsCategoryFilter === cat.id
                                ? 'bg-[#4A2810] text-white shadow-xs'
                                : 'bg-white text-[#5C4534] border border-[#E8DACB] hover:bg-[#FAF5EE]'
                            }`}
                          >
                            {cat.label} ({cat.count})
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#4A2810]">
                          Katalog ({filteredCmsProducts.length} Item)
                        </span>
                        <button
                          onClick={() => openNewProductForm(cmsCategoryFilter !== 'all' ? (cmsCategoryFilter as any) : 'cake')}
                          className="px-3 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#341A08] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah {cmsCategoryFilter !== 'all' ? cmsCategoryFilter.toUpperCase() : 'Produk'}</span>
                        </button>
                      </div>

                      {filteredCmsProducts.length > 0 ? (
                        <div className="space-y-2">
                          {filteredCmsProducts.map((p) => (
                            <div
                              key={p.id}
                              className="p-3 rounded-2xl bg-white border border-[#E8DACB] shadow-xs flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#FAF5EE]"
                                />
                                <div className="min-w-0">
                                  <h5 className="font-serif font-bold text-xs text-[#3D2314] truncate">
                                    {p.name}
                                  </h5>
                                  <p className="text-[10px] text-[#8C7A6B]">
                                    Rp {p.price.toLocaleString('id-ID')} • {p.category.toUpperCase()}
                                  </p>
                                  {p.badge && (
                                    <span className="inline-block text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF5EE] text-[#A03D2A] border border-[#F5C7B9]">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditProductForm(p)}
                                  className="p-1.5 rounded-lg bg-[#FAF5EE] hover:bg-[#F3E8DA] text-[#4A2810] cursor-pointer"
                                  title="Edit Produk"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus produk "${p.name}"?`)) {
                                      deleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-[#FAF5EE] hover:bg-[#FDECE8] text-[#A03D2A] cursor-pointer"
                                  title="Hapus Produk"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-xs text-[#8C7A6B] bg-white rounded-2xl border border-[#E8DACB]">
                          Belum ada produk di kategori &ldquo;{cmsCategoryFilter.toUpperCase()}&rdquo;.
                          <div className="mt-2">
                            <button
                              onClick={() => openNewProductForm(cmsCategoryFilter as any)}
                              className="px-3 py-1 rounded-xl bg-[#4A2810] text-white text-xs font-bold"
                            >
                              + Tambah {cmsCategoryFilter.toUpperCase()} Baru
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===================== TAB 2: DAFTAR PESANAN PELANGGAN ===================== */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#3D2314]">
                        Daftar Pesanan Pelanggan
                      </h4>
                      <p className="text-[10px] text-[#8C7A6B]">
                        Tersimpan otomatis di database &amp; cache lokal
                      </p>
                    </div>

                    <button
                      onClick={refreshOrders}
                      className="p-1.5 rounded-xl bg-white border border-[#E8DACB] text-[#4A2810] hover:bg-[#FAF5EE] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Muat Ulang Pesanan"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Refresh</span>
                    </button>
                  </div>

                  {/* Filter Status Buttons */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'processing', label: 'Diproses' },
                      { id: 'completed', label: 'Selesai' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setOrderStatusFilter(f.id as any)}
                        className={`px-3 py-1 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          orderStatusFilter === f.id
                            ? 'bg-[#4A2810] text-white shadow-xs'
                            : 'bg-white text-[#5C4534] border border-[#E8DACB]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Order Cards */}
                  {filteredOrders.length > 0 ? (
                    <div className="space-y-2.5">
                      {filteredOrders.map((ord) => {
                        const statusColors = {
                          pending: 'bg-[#FFF0D4] text-[#A26510] border-[#F3D79E]',
                          processing: 'bg-[#E3EFE3] text-[#2C6E49] border-[#C5DEC5]',
                          completed: 'bg-[#EDE4F7] text-[#5E3589] border-[#D5C2EA]',
                          cancelled: 'bg-[#FDECE8] text-[#A03D2A] border-[#F5C7B9]',
                        };

                        return (
                          <div
                            key={ord.id}
                            className="p-3.5 rounded-2xl bg-white border border-[#E8DACB] shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-2">
                              <div>
                                <span className="font-bold text-xs text-[#3D2314]">
                                  #{ord.id}
                                </span>
                                <span className="text-[10px] text-[#8C7A6B] block">
                                  {ord.scheduleTime || 'Pengiriman Standar'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                                    statusColors[ord.status] || statusColors.pending
                                  }`}
                                >
                                  {ord.status.toUpperCase()}
                                </span>

                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus pesanan #${ord.id}?`)) {
                                      deleteOrder(ord.id);
                                    }
                                  }}
                                  className="p-1 rounded text-[#8C7A6B] hover:text-[#A03D2A] cursor-pointer"
                                  title="Hapus Pesanan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Customer info */}
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-[#3D2314]">{ord.customerName}</p>
                                <p className="text-[10.5px] text-[#7A6657]">{ord.customerPhone}</p>
                              </div>

                              <a
                                href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-xl bg-[#E3EFE3] text-[#2C6E49] text-[10.5px] font-bold flex items-center gap-1 hover:bg-[#d2e7d2]"
                              >
                                <Phone className="w-3 h-3" />
                                Chat WA
                              </a>
                            </div>

                            {/* Items list */}
                            <div className="p-2 rounded-xl bg-[#FAF5EE] space-y-1 text-[11px] text-[#5C4534]">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{it.quantity}x {it.productName} {it.selectedSize ? `(${it.selectedSize})` : ''}</span>
                                  <span className="font-semibold">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                                </div>
                              ))}
                            </div>

                            {/* Total & Status Selector */}
                            <div className="flex items-center justify-between pt-1 border-t border-[#F5EFE6]">
                              <div>
                                <span className="text-[10px] text-[#8C7A6B] block">Total Pesanan</span>
                                <span className="font-serif font-bold text-xs sm:text-sm text-[#4A2810]">
                                  Rp {ord.totalAmount.toLocaleString('id-ID')}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-[#8C7A6B]">Status:</span>
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                                  className="px-2 py-1 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#3D2314] focus:outline-none cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Diproses</option>
                                  <option value="completed">Selesai</option>
                                  <option value="cancelled">Batal</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-[#8C7A6B] bg-white rounded-2xl border border-[#E8DACB]">
                      <Clock className="w-6 h-6 mx-auto mb-1 text-[#CBB296]" />
                      Belum ada pesanan dengan status &ldquo;{orderStatusFilter}&rdquo;.
                    </div>
                  )}
                </div>
              )}

              {/* ===================== TAB 3: LOGO & HERO BANNER ===================== */}
              {activeTab === 'banners' && (
                <form onSubmit={handleSaveBanners} className="space-y-4">
                  {/* SEKSI 1: LOGO TOKO */}
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                    <h4 className="font-serif font-bold text-xs text-[#3D2314] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      Logo Brand Header
                    </h4>

                    <div className="flex items-center gap-3">
                      {/* Logo Preview */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#FAF5EE] border-2 border-[#D4A373]/60 flex items-center justify-center shrink-0 shadow-sm">
                        {logoImage ? (
                          <img src={logoImage} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <BrandLogo size={42} />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-semibold cursor-pointer hover:bg-[#341A08] transition-colors">
                            {isCompressingImg ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}
                            <span>Upload Logo Baru</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                              disabled={isCompressingImg}
                            />
                          </label>

                          {logoImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoImage('');
                                updateStoreConfig({ logoImage: '' });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#A03D2A] hover:bg-[#FDECE8] transition-colors cursor-pointer"
                            >
                              Gunakan Logo Standar
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={logoImage}
                          onChange={(e) => setLogoImage(e.target.value)}
                          placeholder="Atau tempel URL gambar logo..."
                          className="w-full px-2.5 py-1 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEKSI 2: HERO BANNER BERANDA */}
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                    <h4 className="font-serif font-bold text-xs text-[#3D2314] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      Hero Banner Beranda
                    </h4>

                    {/* Pratinjau Tampilan Hero Langsung */}
                    <div className="relative rounded-2xl overflow-hidden h-32 bg-[#3D2314] text-white p-3 flex flex-col justify-end shadow-xs border border-[#E8DACB]">
                      {heroImage && (
                        <img
                          src={heroImage}
                          alt="Hero Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201107] via-[#201107]/60 to-black/25" />
                      <div className="relative z-10">
                        <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[#FAF5EE]">
                          {heroTag || 'TAG HERO'}
                        </span>
                        <h5 className="font-serif font-bold text-sm leading-tight mt-1 text-[#FAF5EE]">
                          {heroTitle || 'Judul Hero'}
                        </h5>
                        <p className="text-[9.5px] text-[#E6D3BE] line-clamp-1 mt-0.5">
                          {heroSubtitle || 'Deskripsi singkat hero banner...'}
                        </p>
                      </div>
                    </div>

                    {/* Tombol Upload & Input URL Hero */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Foto Hero Banner
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-semibold cursor-pointer hover:bg-[#341A08] shrink-0 flex items-center gap-1 transition-colors">
                          {isCompressingImg ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>Ganti Foto Hero</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageFileUpload}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        <input
                          type="text"
                          value={heroImage}
                          onChange={(e) => setHeroImage(e.target.value)}
                          placeholder="Atau tempel URL gambar foto hero..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] text-[#3D2314] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Tag Badge Hero
                      </label>
                      <input
                        type="text"
                        value={heroTag}
                        onChange={(e) => setHeroTag(e.target.value)}
                        placeholder="Contoh: PARTNER TO ENJOY YOUR DAY"
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-medium text-[#3D2314] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Judul Headline Hero
                      </label>
                      <input
                        type="text"
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        placeholder="Contoh: Bintang Cake"
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-medium text-[#3D2314] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Deskripsi Hero
                      </label>
                      <textarea
                        rows={2}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        placeholder="Deskripsi cita rasa kue..."
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-medium text-[#3D2314] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#4A2810] text-white font-bold text-xs shadow-md hover:bg-[#341A08] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan Logo &amp; Hero Banner</span>
                  </button>
                </form>
              )}

              {/* ===================== TAB 4: QRIS & REKENING BANK ===================== */}
              {activeTab === 'payments' && (
                <form onSubmit={handleSavePayments} className="space-y-4">
                  {/* SEKSI 1: QRIS INSTANT */}
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center">
                        <QrCode className="w-4 h-4 text-[#8B5E3C]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#3D2314]">
                          Pengaturan QRIS Instant
                        </h4>
                        <p className="text-[10px] text-[#8C7A6B]">
                          QRIS akan tampil saat pembeli memilih opsi QRIS di Keranjang
                        </p>
                      </div>
                    </div>

                    {/* Preview Barcode QRIS */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-24 rounded-2xl bg-[#FAF5EE] border border-[#E8DACB] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        {qrisImage ? (
                          <img src={qrisImage} alt="QRIS Preview" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-10 h-10 text-[#CBB296]" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-semibold cursor-pointer hover:bg-[#341A08] transition-colors">
                          {isCompressingImg ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          <span>Upload Barcode QRIS</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrisImageFileUpload}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>

                        <input
                          type="text"
                          value={qrisImage}
                          onChange={(e) => setQrisImage(e.target.value)}
                          placeholder="Atau masukkan URL gambar QRIS..."
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Kode QRIS / NMID
                      </label>
                      <input
                        type="text"
                        value={qrisCode}
                        onChange={(e) => setQrisCode(e.target.value)}
                        placeholder="Contoh: NMID: ID1020304050607 - Bintang Cake"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-mono font-medium text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SEKSI 2: REKENING BANK TRANSFER */}
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#8B5E3C]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#3D2314]">
                          Rekening Transfer Bank
                        </h4>
                        <p className="text-[10px] text-[#8C7A6B]">
                          Ditampilkan di keranjang dengan tombol salin otomatis
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Contoh: BCA (Bank Central Asia)"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Nomor Rekening &amp; Atas Nama
                      </label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Contoh: 8210-9876-5432 a/n Bintang Cake"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-mono font-semibold text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#4A2810] text-white font-bold text-xs shadow-md hover:bg-[#341A08] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Pengaturan QRIS &amp; Rekening</span>
                  </button>
                </form>
              )}

              {/* ===================== TAB 5: KONFIGURASI SUPABASE & SINKRONISASI MULTI-DEVICE ===================== */}
              {activeTab === 'config' && (
                <div className="space-y-4">
                  {/* Panduan Sinkronisasi Multi-Device */}
                  <div className="p-4 bg-gradient-to-br from-[#FFFDF9] to-[#F7EFE6] rounded-3xl border border-[#D4A373]/60 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#4A2810] text-[#FFFDF9] flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-xs text-[#3D2314]">
                        Sinkronisasi Database Cloud (Multi-Perangkat)
                      </h4>
                    </div>

                    <p className="text-[11px] text-[#6B5749] leading-relaxed">
                      Agar perubahan yang Anda buat (produk baru, ganti foto, logo, QRIS) <strong>langsung terlihat di semua HP dan laptop pelanggan</strong> tanpa kembali ke setelan awal, jalankan skrip tabel di Supabase SQL Editor.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={copySqlScript}
                        className="px-3.5 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-bold hover:bg-[#341A08] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {sqlCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#EAD1B6]" />
                            <span>Skrip SQL Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>1-Klik Salin Skrip SQL</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://supabase.com/dashboard/project/rkgdccccfkemerwdgsvz/sql/new"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DACB] text-[#4A2810] text-xs font-bold hover:bg-[#FAF5EE] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Buka SQL Editor Supabase</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                    <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                      <div>
                        <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                          Supabase Project URL
                        </label>
                        <input
                          type="text"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://xyz.supabase.co"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-mono text-[#3D2314] focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                          Supabase Anon / Public Key
                        </label>
                        <textarea
                          rows={3}
                          value={inputKey}
                          onChange={(e) => setInputKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-mono text-[#3D2314] focus:outline-none resize-none"
                          required
                        />
                      </div>

                      {testResult && (
                        <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                          testResult.isConnected
                            ? 'bg-[#E3EFE3] text-[#2C6E49] border border-[#C5DEC5]'
                            : 'bg-[#FDECE8] text-[#A03D2A] border border-[#F5C7B9]'
                        }`}>
                          {testResult.isConnected ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                          <span>{testResult.message} {testResult.latencyMs ? `(${testResult.latencyMs}ms)` : ''}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isTestingSupabase}
                      className="w-full py-3 rounded-2xl bg-[#4A2810] text-white font-bold text-xs shadow-md hover:bg-[#341A08] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isTestingSupabase ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menguji &amp; Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Simpan &amp; Uji Koneksi Supabase</span>
                        </>
                      )}
                    </button>

                    <div className="pt-2 border-t border-[#E8DACB]">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Kembalikan semua data ke pengaturan awal bawaan?')) {
                            resetToDefault();
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[#A03D2A] text-xs font-bold hover:bg-[#FDECE8] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Seluruh Data ke Bawaan
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
