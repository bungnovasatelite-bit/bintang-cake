import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Product } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { testSupabaseConnection, SupabaseHealthCheckResult } from '../../lib/supabase';

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
  } = useCMS();

  // Login form state
  const [username, setUsername] = useState('bintang');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // CMS Tabs: products | orders | banners | config
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'banners' | 'config'>('products');

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

  // Banner editor state
  const [heroTag, setHeroTag] = useState(storeConfig.heroTag);
  const [heroTitle, setHeroTitle] = useState(storeConfig.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(storeConfig.heroSubtitle);
  const [heroImage, setHeroImage] = useState(storeConfig.heroImage);

  // Supabase config state
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [testResult, setTestResult] = useState<SupabaseHealthCheckResult | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  if (!isCMSOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = loginAdmin(username, password);
    if (!success) {
      setLoginError('Username atau password salah! Gunakan user: bintang dan password: nadine13');
    }
  };

  const openNewProductForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory('cookies');
    setFormPackage('TOPLES MIKA ULIR 200 GR');
    setFormPrice(50000);
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

  // Upload gambar dengan kompresi otomatis agar ukuran kecil dan tidak pernah reset
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleHeroImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 900, 600, 0.75);
        setHeroImage(compressed);
      } catch (err) {
        console.error(err);
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

  const handleSaveBanners = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreConfig({
      heroTag,
      heroTitle,
      heroSubtitle,
      heroImage,
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
        {/* ===================== VIEW 1: LOGIN ADMIN ===================== */}
        {!isAdminLoggedIn ? (
          <div className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4A2810] text-[#FFFDF9] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#3D2314]">
                    Masuk Admin CMS
                  </h2>
                  <p className="text-xs text-[#8C7A6B]">
                    Panel Kelola Konten &amp; Pesanan Bintang Cake
                  </p>
                </div>
              </div>

              <button
                onClick={closeCMS}
                className="p-1.5 rounded-full hover:bg-[#F3E8DA] text-[#8C7A6B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2810] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="bintang"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#4A2810]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2810] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#4A2810]"
                  required
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-[#FDECE8] border border-[#F5C7B9] text-[11px] font-semibold text-[#A03D2A]">
                  {loginError}
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#E8DACB] text-[10.5px] text-[#8C7A6B]">
                🔑 <strong>User:</strong> <code className="font-bold text-[#4A2810]">bintang</code> | <strong>Password:</strong> <code className="font-bold text-[#4A2810]">nadine13</code>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Masuk ke Panel CMS
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
                    User: <strong>bintang</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={logoutAdmin}
                  className="p-1.5 rounded-xl bg-white border border-[#E8DACB] text-[#A03D2A] hover:bg-[#FDECE8] text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <button
                  onClick={closeCMS}
                  className="p-1.5 rounded-xl hover:bg-[#F3E8DA] text-[#8C7A6B]"
                  aria-label="Tutup CMS"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sync Notification Banner */}
            {syncNotice && (
              <div className="px-4 py-2 bg-[#E3EFE3] text-[#2C6E49] text-xs font-bold flex items-center gap-1.5 border-b border-[#C5DEC5] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>{syncNotice}</span>
              </div>
            )}

            {/* CMS Navigation Tabs */}
            <div className="flex items-center px-3 pt-2 border-b border-[#E8DACB] gap-1 shrink-0 bg-[#FFFDF9]/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'products'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Produk ({products.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsEditingProduct(false);
                  refreshOrders();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'banners'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Banner &amp; Teks
              </button>

              <button
                onClick={() => {
                  setActiveTab('config');
                  setIsEditingProduct(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'config'
                    ? 'border-[#4A2810] text-[#4A2810]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#3D2314]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Konfigurasi Supabase
              </button>
            </div>

            {/* CMS Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* ===================== TAB 1: PRODUCTS ===================== */}
              {activeTab === 'products' && (
                <div>
                  {isEditingProduct ? (
                    /* PRODUCT FORM (ADD/EDIT) */
                    <form onSubmit={handleSaveProduct} className="space-y-3 bg-white p-4 rounded-3xl border border-[#E8DACB] shadow-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F5EFE6]">
                        <h4 className="font-serif font-bold text-sm text-[#3D2314]">
                          {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="text-xs text-[#8C7A6B] hover:text-[#3D2314]"
                        >
                          Batal
                        </button>
                      </div>

                      {/* Image Preview & Upload with Compression */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                          Foto Produk (Tersimpan Permanen)
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
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Pilih File Foto HP/PC</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              placeholder="Atau tempel URL gambar..."
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] text-[#3D2314] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name & Package */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Nama Produk
                          </label>
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Contoh: Kaastengels Wisman"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Kemasan / Subjudul
                          </label>
                          <input
                            type="text"
                            value={formPackage}
                            onChange={(e) => setFormPackage(e.target.value)}
                            placeholder="Toples Mika Ulir 200 gr"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Category & Badge */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Kategori
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                          >
                            <option value="cake">Cake</option>
                            <option value="cookies">Cookies</option>
                            <option value="brownies">Brownies</option>
                            <option value="hampers">Hampers</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                            Badge
                          </label>
                          <select
                            value={formBadge}
                            onChange={(e) => setFormBadge(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none"
                          >
                            <option value="NONE">Tanpa Badge</option>
                            <option value="BEST SELLER">BEST SELLER</option>
                            <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                            <option value="SPECIAL GIFT">SPECIAL GIFT</option>
                            <option value="CUSTOM">CUSTOM</option>
                            <option value="PROMO">PROMO</option>
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
                          placeholder="Jelaskan cita rasa kue..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="flex-1 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#7A6657]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSyncing}
                          className="flex-1 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-sm hover:bg-[#341A08]"
                        >
                          {isSyncing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* PRODUCT LIST */
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#4A2810]">
                          Katalog ({products.length} Item)
                        </span>
                        <button
                          onClick={openNewProductForm}
                          className="px-3 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#341A08]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Produk
                        </button>
                      </div>

                      <div className="space-y-2">
                        {products.map((p) => (
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
                                className="p-1.5 rounded-lg bg-[#FAF5EE] hover:bg-[#F3E8DA] text-[#4A2810]"
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
                                className="p-1.5 rounded-lg bg-[#FAF5EE] hover:bg-[#FDECE8] text-[#A03D2A]"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================== TAB 2: DAFTAR PESANAN PELANGGAN (KHUSUS ADMIN) ===================== */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#3D2314]">
                        Daftar Pesanan Pelanggan
                      </h4>
                      <p className="text-[10px] text-[#8C7A6B]">
                        Hanya bisa dibuka oleh admin yang terotentikasi
                      </p>
                    </div>

                    <button
                      onClick={refreshOrders}
                      className="p-1.5 rounded-xl bg-white border border-[#E8DACB] text-[#4A2810] hover:bg-[#FAF5EE] text-xs font-semibold flex items-center gap-1"
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
                        className={`px-3 py-1 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all ${
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
                                  className="p-1 rounded text-[#8C7A6B] hover:text-[#A03D2A]"
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
                                <span className="text-[10px] text-[#8C7A6B]">Ubah:</span>
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                                  className="px-2 py-1 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#3D2314] focus:outline-none"
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

              {/* ===================== TAB 3: BANNERS & TEKS ===================== */}
              {activeTab === 'banners' && (
                <form onSubmit={handleSaveBanners} className="space-y-4">
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-2.5">
                    <h4 className="font-serif font-bold text-xs text-[#3D2314] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      Hero Banner Beranda
                    </h4>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Tag Badge Hero
                      </label>
                      <input
                        type="text"
                        value={heroTag}
                        onChange={(e) => setHeroTag(e.target.value)}
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
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-medium text-[#3D2314] focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#4A2810] mb-1">
                        Foto Hero
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA] shrink-0">
                          <Upload className="w-3 h-3 inline mr-1" />
                          Upload Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageFileUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          value={heroImage}
                          onChange={(e) => setHeroImage(e.target.value)}
                          placeholder="URL Foto..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] text-[#3D2314] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#4A2810] text-white font-bold text-xs shadow-md hover:bg-[#341A08]"
                  >
                    Simpan Perubahan Banner
                  </button>
                </form>
              )}

              {/* ===================== TAB 4: KONFIGURASI SUPABASE ===================== */}
              {activeTab === 'config' && (
                <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                  <div className="p-4 bg-white rounded-3xl border border-[#E8DACB] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center">
                        <Database className="w-4 h-4 text-[#8B5E3C]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#3D2314]">
                          Kredensial Supabase
                        </h4>
                        <p className="text-[10px] text-[#8C7A6B]">
                          Atur koneksi database langsung dari panel ini
                        </p>
                      </div>
                    </div>

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
                        {testResult.isConnected ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>{testResult.message} {testResult.latencyMs ? `(${testResult.latencyMs}ms)` : ''}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isTestingSupabase}
                    className="w-full py-3 rounded-2xl bg-[#4A2810] text-white font-bold text-xs shadow-md hover:bg-[#341A08] flex items-center justify-center gap-1.5"
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
                        if (confirm('Kembalikan semua data ke pengaturan awal?')) {
                          resetToDefault();
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[#A03D2A] text-xs font-bold hover:bg-[#FDECE8] flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Seluruh Data ke Bawaan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
