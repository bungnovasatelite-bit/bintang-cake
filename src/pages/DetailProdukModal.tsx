import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  Check,
  Package,
  Layers,
  Pencil,
  Upload,
  X,
  Calculator,
  Loader2,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useCMS } from '../context/CMSContext';
import { BrandLogo } from '../components/icons/BrandLogo';
import {
  getPackagingStylesShowcase,
  getCookiePackageOptions,
  DEFAULT_PACKAGING_IMAGES,
} from '../data/packageOptions';
import { compressImage } from '../utils/imageCompressor';

export const DetailProdukModal: React.FC = () => {
  const { selectedProduct, closeProductDetail } = useNavigation();
  const { addToCart } = useCart();
  const {
    products,
    storeConfig,
    updateStoreConfig,
    updateProduct,
    isAdminLoggedIn,
    loginAdmin,
    isSyncing,
  } = useCMS();

  if (!selectedProduct) return null;

  // Dapatkan data produk terbaru dari state products
  const liveProduct = products.find((p) => p.id === selectedProduct.id) || selectedProduct;

  // Cek apakah produk masuk kategori cookies atau lidah-kucing
  const isCookieOrLidah = liveProduct.category === 'cookies' || liveProduct.category === 'lidah-kucing';

  // 4 Gaya Kemasan Utama berfoto dinamis dari storeConfig
  const packagingShowcase = useMemo(() => {
    return getPackagingStylesShowcase(storeConfig.packagingImages);
  }, [storeConfig.packagingImages]);

  // 8 Pilihan kemasan untuk cookies & lidah kucing (harga & foto dinamis)
  const cookieOptions = useMemo(() => {
    return isCookieOrLidah
      ? getCookiePackageOptions(liveProduct.price, liveProduct.sizes, storeConfig.packagingImages)
      : [];
  }, [isCookieOrLidah, liveProduct.price, liveProduct.sizes, storeConfig.packagingImages]);

  // Default kemasan cookies: Toples Mika Ulir 200 gr (index 2 / 'mika-200')
  const [selectedPackageId, setSelectedPackageId] = useState<string>('mika-200');

  // Pilihan ukuran untuk Cake (jika ada)
  const defaultCakeSizes = liveProduct.sizes || [
    { name: 'Kemasan Standar', portion: '1 Porsi / Loyang', price: liveProduct.price }
  ];
  const [selectedCakeSizeIndex, setSelectedCakeSizeIndex] = useState(0);

  // Jumlah pesanan & catatan
  const [quantity, setQuantity] = useState(1);
  const [candleChoice, setCandleChoice] = useState('Lilin Ulir Klasik (Free 2 Pcs)');
  const [cookieGreetingOption, setCookieGreetingOption] = useState('Pita Hias & Segel Emas (Free)');
  const [greetingCardText, setGreetingCardText] = useState('');
  const [bakerNote, setBakerNote] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Modal State 1: Upload Foto Bentuk Kemasan
  const [isEditingPackagingModalOpen, setIsEditingPackagingModalOpen] = useState(false);
  const [imgMinipack, setImgMinipack] = useState(storeConfig.packagingImages?.minipack || '');
  const [imgEkopack, setImgEkopack] = useState(storeConfig.packagingImages?.ekopack || '');
  const [imgMika, setImgMika] = useState(storeConfig.packagingImages?.mika || '');
  const [imgKaca, setImgKaca] = useState(storeConfig.packagingImages?.kaca || '');
  const [isCompressingImg, setIsCompressingImg] = useState(false);

  // Modal State 2: Edit Harga 8 Kemasan
  const [isEditingPricesModalOpen, setIsEditingPricesModalOpen] = useState(false);
  const [priceMinipack150, setPriceMinipack150] = useState<number>(0);
  const [priceEkopack200, setPriceEkopack200] = useState<number>(0);
  const [priceMika200, setPriceMika200] = useState<number>(0);
  const [priceMika250, setPriceMika250] = useState<number>(0);
  const [priceMika350, setPriceMika350] = useState<number>(0);
  const [priceMika500, setPriceMika500] = useState<number>(0);
  const [priceMika1000, setPriceMika1000] = useState<number>(0);
  const [priceKaca150, setPriceKaca150] = useState<number>(0);

  // Modal State 3: Admin Auth Prompt
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<'edit_images' | 'edit_prices' | null>(null);

  useEffect(() => {
    setImgMinipack(storeConfig.packagingImages?.minipack || '');
    setImgEkopack(storeConfig.packagingImages?.ekopack || '');
    setImgMika(storeConfig.packagingImages?.mika || '');
    setImgKaca(storeConfig.packagingImages?.kaca || '');
  }, [storeConfig.packagingImages]);

  // Helper kalkulasi standar harga kemasan
  const calculateStandardPackagePrices = (base: number) => {
    const round1000 = (val: number) => Math.round(val / 1000) * 1000;
    return {
      minipack150: round1000(base * 0.78),
      ekopack200: round1000(base * 0.93),
      mika200: base,
      mika250: round1000(base * 1.22),
      mika350: round1000(base * 1.67),
      mika500: round1000(base * 2.33),
      mika1000: round1000(base * 4.33),
      kaca150: round1000(base * 1.05),
    };
  };

  const applyAutoPackagePrices = (base: number) => {
    const std = calculateStandardPackagePrices(base);
    setPriceMinipack150(std.minipack150);
    setPriceEkopack200(std.ekopack200);
    setPriceMika200(std.mika200);
    setPriceMika250(std.mika250);
    setPriceMika350(std.mika350);
    setPriceMika500(std.mika500);
    setPriceMika1000(std.mika1000);
    setPriceKaca150(std.kaca150);
  };

  const openPackagingImagesEditor = () => {
    setImgMinipack(storeConfig.packagingImages?.minipack || '');
    setImgEkopack(storeConfig.packagingImages?.ekopack || '');
    setImgMika(storeConfig.packagingImages?.mika || '');
    setImgKaca(storeConfig.packagingImages?.kaca || '');

    if (!isAdminLoggedIn) {
      setPendingAction('edit_images');
      setIsAuthPromptOpen(true);
      return;
    }
    setIsEditingPackagingModalOpen(true);
  };

  const openPricesEditorDirect = () => {
    const std = calculateStandardPackagePrices(liveProduct.price);
    const findSizePrice = (name: string, fallback: number) => {
      if (!liveProduct.sizes || liveProduct.sizes.length === 0) return fallback;
      const found = liveProduct.sizes.find(
        (s) => s.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      return found && found.price > 0 ? found.price : fallback;
    };
    setPriceMinipack150(findSizePrice('Minipack 150 gr', std.minipack150));
    setPriceEkopack200(findSizePrice('Ekopack 200 gr', std.ekopack200));
    setPriceMika200(findSizePrice('Toples Mika Ulir 200 gr', std.mika200));
    setPriceMika250(findSizePrice('Toples Mika Ulir 250 gr', std.mika250));
    setPriceMika350(findSizePrice('Toples Mika Ulir 350 gr', std.mika350));
    setPriceMika500(findSizePrice('Toples Mika Ulir 500 gr', std.mika500));
    setPriceMika1000(findSizePrice('Toples Mika Ulir 1000 gr', std.mika1000));
    setPriceKaca150(findSizePrice('Toples Kaca 150 gr', std.kaca150));
    setIsEditingPricesModalOpen(true);
  };

  const openPricesEditor = () => {
    if (!isAdminLoggedIn) {
      setPendingAction('edit_prices');
      setIsAuthPromptOpen(true);
      return;
    }
    openPricesEditorDirect();
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = loginAdmin('bintang', authPassword);
    if (ok) {
      setIsAuthPromptOpen(false);
      setAuthPassword('');
      if (pendingAction === 'edit_images') {
        setIsEditingPackagingModalOpen(true);
      } else if (pendingAction === 'edit_prices') {
        openPricesEditorDirect();
      }
      setPendingAction(null);
    } else {
      setAuthError('Password salah. Silakan coba lagi (nadine13).');
    }
  };

  const handleUploadPkgImage = async (
    key: 'minipack' | 'ekopack' | 'mika' | 'kaca',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 600, 600, 0.8);
        if (key === 'minipack') setImgMinipack(compressed);
        if (key === 'ekopack') setImgEkopack(compressed);
        if (key === 'mika') setImgMika(compressed);
        if (key === 'kaca') setImgKaca(compressed);
      } catch (err) {
        console.error('Gagal kompresi foto:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  const handleSavePackagingImages = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreConfig({
      packagingImages: {
        minipack: imgMinipack,
        ekopack: imgEkopack,
        mika: imgMika,
        kaca: imgKaca,
      },
    });
    setIsEditingPackagingModalOpen(false);
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSizes = [
      { name: 'Minipack 150 gr', portion: '150 gr • Camilan praktis', price: Number(priceMinipack150) || 0 },
      { name: 'Ekopack 200 gr', portion: '200 gr • Standing pouch eco', price: Number(priceEkopack200) || 0 },
      { name: 'Toples Mika Ulir 200 gr', portion: '200 gr • Toples mika ulir kedap udara', price: Number(priceMika200) || 0 },
      { name: 'Toples Mika Ulir 250 gr', portion: '250 gr • Toples mika ulir sedang', price: Number(priceMika250) || 0 },
      { name: 'Toples Mika Ulir 350 gr', portion: '350 gr • Toples mika ulir besar', price: Number(priceMika350) || 0 },
      { name: 'Toples Mika Ulir 500 gr', portion: '500 gr • Toples mika ulir setengah kilo', price: Number(priceMika500) || 0 },
      { name: 'Toples Mika Ulir 1000 gr', portion: '1000 gr • Toples mika ulir jumbo 1 kg', price: Number(priceMika1000) || 0 },
      { name: 'Toples Kaca 150 gr', portion: '150 gr • Jar toples kaca mewah', price: Number(priceKaca150) || 0 },
    ];
    await updateProduct(liveProduct.id, { sizes: newSizes });
    setIsEditingPricesModalOpen(false);
  };

  // Kemasan yang sedang dipilih untuk cookies
  const selectedCookiePackage = useMemo(() => {
    return cookieOptions.find((o) => o.id === selectedPackageId) || cookieOptions[2] || cookieOptions[0];
  }, [cookieOptions, selectedPackageId]);

  // Ukuran cake yang sedang dipilih
  const currentCakeSize = defaultCakeSizes[selectedCakeSizeIndex] || defaultCakeSizes[0];

  // Harga satuan saat ini
  const currentUnitPrice = isCookieOrLidah ? selectedCookiePackage.price : currentCakeSize.price;
  const totalPrice = currentUnitPrice * quantity;

  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const handleAddToCart = () => {
    if (isCookieOrLidah) {
      addToCart(
        selectedProduct,
        quantity,
        selectedCookiePackage.name,
        bakerNote ? `Catatan: ${bakerNote}` : undefined,
        selectedCookiePackage.price
      );
    } else {
      addToCart(
        selectedProduct,
        quantity,
        currentCakeSize.name,
        bakerNote ? `Catatan: ${bakerNote}` : undefined,
        currentCakeSize.price
      );
    }
    closeProductDetail();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={closeProductDetail}
    >
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#FAF5EE] rounded-t-[2.5rem] sm:rounded-3xl shadow-float flex flex-col no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-20 bg-[#FAF5EE]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8DACB]">
          <button
            onClick={closeProductDetail}
            className="p-2 -ml-1 rounded-full text-[#3D2314] hover:bg-[#F3E8DA] transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2">
            <BrandLogo size={24} />
            <h2 className="font-serif font-bold text-sm text-[#3D2314]">
              Detail Produk
            </h2>
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLiked ? 'text-[#B85D43]' : 'text-[#8C7A6B] hover:text-[#3D2314]'
            }`}
            aria-label="Sukai produk"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          {/* 1. Main Hero Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#F5EFE6] shadow-sm">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            {selectedProduct.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FAF5EE]/90 backdrop-blur-md text-[#4A2810] text-[10px] font-bold tracking-wide uppercase shadow-xs">
                {selectedProduct.badge}
              </span>
            )}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
              <span>{selectedProduct.rating.toFixed(1)}</span>
              <span className="text-white/70">({selectedProduct.reviewCount})</span>
            </div>
          </div>

          {/* 2. Title & Description */}
          <div>
            <h1 className="font-serif font-bold text-xl text-[#3D2314]">
              {selectedProduct.name}
            </h1>
            <p className="text-xs font-semibold text-[#8B5E3C] mt-0.5">
              {isCookieOrLidah
                ? `Mulai dari ${formatIDR(cookieOptions[0]?.price || selectedProduct.price)} • 8 Pilihan Kemasan`
                : `Mulai dari ${formatIDR(selectedProduct.price)}`}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-[#7A6657] mt-2">
              <Clock className="w-3.5 h-3.5 text-[#B87D48]" />
              <span>Freshly baked daily • Mentega Wijsman murni</span>
            </div>

            <p className="text-xs text-[#6B5749] leading-relaxed mt-2.5 bg-[#FFFDFB] p-3 rounded-2xl border border-[#EFE5D9]">
              {selectedProduct.description ||
                'Kue istimewa dibuat dengan bahan-bahan pilihan berkualitas tinggi, mentega murni Wijsman, dan sentuhan kehangatan resep keluarga.'}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* SEKSI KHUSUS COOKIES & LIDAH KUCING: GALERI KEMASAN + 8 PILIHAN UKURAN    */}
          {/* ========================================================================= */}
          {isCookieOrLidah && (
            <div className="space-y-4">
              {/* GALERI JENIS KEMASAN (Tepat Setelah Foto & Deskripsi Utama) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#8B5E3C]" />
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-[#3D2314]">
                      Pilihan Bentuk Kemasan
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={openPackagingImagesEditor}
                    className="px-2.5 py-1 rounded-xl bg-[#4A2810] text-[#FAF5EE] hover:bg-[#341A08] text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    title="Upload dan ganti foto pilihan bentuk kemasan"
                  >
                    <Pencil className="w-3 h-3 text-[#EAD1B6]" />
                    <span>Upload / Ganti Foto</span>
                  </button>
                </div>

                {/* Horizontal Scroll Kartu Gaya Kemasan */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                  {packagingShowcase.map((style) => {
                    const isStyleActive = selectedCookiePackage.styleId === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => {
                          // Pilih opsi pertama dari gaya kemasan ini
                          const firstMatching = cookieOptions.find((o) => o.styleId === style.id);
                          if (firstMatching) {
                            setSelectedPackageId(firstMatching.id);
                          }
                        }}
                        className={`min-w-[135px] max-w-[145px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shrink-0 ${
                          isStyleActive
                            ? 'bg-[#4A2810] text-[#FAF5EE] border-[#4A2810] shadow-md scale-[1.02]'
                            : 'bg-white text-[#3D2314] border-[#E8DACB] hover:border-[#8B5E3C]'
                        }`}
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-[#FAF5EE]">
                          <img
                            src={style.image}
                            alt={style.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                DEFAULT_PACKAGING_IMAGES[style.id] ||
                                'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <span
                            className={`absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                              isStyleActive
                                ? 'bg-[#EAD1B6] text-[#4A2810]'
                                : 'bg-black/60 text-white'
                            }`}
                          >
                            {style.badge}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-[11px] leading-tight line-clamp-1">
                            {style.title}
                          </p>
                          <p
                            className={`text-[9.5px] mt-0.5 ${
                              isStyleActive ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'
                            }`}
                          >
                            {style.weights}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DAFTAR 8 PILIHAN KEMASAN DENGAN HARGA DI SAMPINGNYA */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="font-bold text-[#3D2314]">
                      Pilih Ukuran &amp; Kemasan (8 Pilihan)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={openPricesEditor}
                    className="px-2.5 py-1 rounded-xl bg-[#4A2810] text-[#FAF5EE] hover:bg-[#341A08] text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    title="Ubah harga 8 pilihan kemasan untuk produk ini"
                  >
                    <Pencil className="w-3 h-3 text-[#EAD1B6]" />
                    <span>Edit Harga 8 Kemasan</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cookieOptions.map((opt) => {
                    const isSelected = selectedPackageId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedPackageId(opt.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#4A2810] text-[#FFFDF9] border-[#4A2810] shadow-sm'
                            : 'bg-[#FFFDFB] text-[#3D2314] border-[#EFE5D9] hover:bg-[#FAF5EE] hover:border-[#D4A373]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Mini Thumbnail Kemasan */}
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FAF5EE] shrink-0 border border-[#E8DACB]">
                            <img
                              src={opt.image}
                              alt={opt.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-xs leading-none">{opt.name}</p>
                              {opt.badge && (
                                <span
                                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isSelected
                                      ? 'bg-[#EAD1B6] text-[#4A2810]'
                                      : 'bg-[#F4E9DC] text-[#7A5844]'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#EAD1B6] shrink-0" />
                              )}
                            </div>
                            <p
                              className={`text-[10px] mt-1 line-clamp-1 ${
                                isSelected ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'
                              }`}
                            >
                              {opt.portion}
                            </p>
                          </div>
                        </div>

                        {/* Harga di samping kanan */}
                        <div className="text-right shrink-0">
                          <span className="font-serif font-bold text-xs sm:text-sm block">
                            {formatIDR(opt.price)}
                          </span>
                          <span
                            className={`text-[9px] block ${
                              isSelected ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'
                            }`}
                          >
                            {opt.weight}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pelengkap Khusus Cookies & Lidah Kucing (Pita Hias & Kartu Ucapan) */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D2314]">
                  <Sparkles className="w-4 h-4 text-[#B87D48]" />
                  <span>Pelengkap Kemasan &amp; Hadiah (Gratis)</span>
                </div>

                <div>
                  <label className="block text-[10.5px] text-[#8C7A6B] mb-1">
                    Pilihan Dekorasi &amp; Segel
                  </label>
                  <select
                    value={cookieGreetingOption}
                    onChange={(e) => setCookieGreetingOption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none cursor-pointer"
                  >
                    <option>Pita Hias &amp; Segel Emas (Free)</option>
                    <option>Sertakan Kartu Ucapan Khusus (Free)</option>
                    <option>Kemasan Standar Polos</option>
                  </select>
                </div>

                {cookieGreetingOption.includes('Kartu Ucapan') && (
                  <div>
                    <div className="flex justify-between text-[10.5px] text-[#8C7A6B] mb-1">
                      <span>Pesan Kartu Ucapan Singkat</span>
                      <span>{greetingCardText.length}/100</span>
                    </div>
                    <textarea
                      value={greetingCardText}
                      maxLength={100}
                      onChange={(e) => setGreetingCardText(e.target.value)}
                      placeholder="Contoh: Selamat menikmati kue nastar dan lidah kucing spesial..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] placeholder-[#A8988B] focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKSI UNTUK KATEGORI LAIN (CAKE, BROWNIES, HAMPERS, CUSTOM) - TIDAK DIRUBAH*/}
          {/* ========================================================================= */}
          {!isCookieOrLidah && (
            <div className="space-y-4">
              {/* Size / Variant Options Cake */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#3D2314]">Pilih Ukuran Cake</span>
                    <span className="text-[#8C7A6B]">Porsi</span>
                  </div>

                  <div className="space-y-2">
                    {selectedProduct.sizes.map((sz, idx) => {
                      const isSelected = selectedCakeSizeIndex === idx;
                      return (
                        <div
                          key={sz.name}
                          onClick={() => setSelectedCakeSizeIndex(idx)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#4A2810] text-[#FFFDF9] border-[#4A2810] shadow-sm'
                              : 'bg-[#FFFDFB] text-[#3D2314] border-[#EFE5D9] hover:bg-[#FAF5EE]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs">{sz.name}</p>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#EAD1B6]" />}
                            </div>
                            <p className={`text-[10.5px] mt-0.5 ${isSelected ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'}`}>
                              {sz.portion}
                            </p>
                          </div>
                          <span className="font-serif font-bold text-xs sm:text-sm">
                            {formatIDR(sz.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Perlengkapan Pesta Cake */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D2314]">
                  <Sparkles className="w-4 h-4 text-[#B87D48]" />
                  <span>Gratis Perlengkapan Pesta</span>
                </div>

                <div>
                  <label className="block text-[10.5px] text-[#8C7A6B] mb-1">
                    Pilihan Lilin (Free)
                  </label>
                  <select
                    value={candleChoice}
                    onChange={(e) => setCandleChoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none"
                  >
                    <option>Lilin Ulir Klasik (Free 2 Pcs)</option>
                    <option>Lilin Angka Emas (Free 1 Pcs)</option>
                    <option>Tanpa Lilin</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-[#8C7A6B] mb-1">
                    <span>Kartu Ucapan Gold Foil (Free)</span>
                    <span>{greetingCardText.length}/100</span>
                  </div>
                  <textarea
                    value={greetingCardText}
                    maxLength={100}
                    onChange={(e) => setGreetingCardText(e.target.value)}
                    placeholder="Tuliskan ucapan singkat (contoh: Happy Birthday Sarah tersayang!)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] placeholder-[#A8988B] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#3D2314]">Jumlah Pesanan</p>
              <p className="text-[10px] text-[#8C7A6B]">
                {isCookieOrLidah ? selectedCookiePackage.name : 'Dibuat khusus untuk Anda'}
              </p>
            </div>

            <div className="flex items-center bg-[#F5EFE6] rounded-xl px-2 py-1 gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kurangi pesanan"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-sm font-bold text-[#3D2314] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tambah pesanan"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Baker Note */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">
              Catatan Khusus untuk Baker
            </label>
            <input
              type="text"
              value={bakerNote}
              onChange={(e) => setBakerNote(e.target.value)}
              placeholder="Misal: Kemas dengan pita merah, jangan terlalu manis"
              className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#E8DACB] text-xs text-[#3D2314] placeholder-[#A8988B] focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="sticky bottom-0 bg-[#FAF5EE]/95 backdrop-blur-md px-4 py-3 border-t border-[#E8DACB] flex items-center gap-2">
          <a
            href={`https://wa.me/6282158739760?text=${encodeURIComponent(
              `Halo Bintang Cake, saya ingin tanya seputar produk ${selectedProduct.name} (${
                isCookieOrLidah ? selectedCookiePackage.name : currentCakeSize.name
              }).`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#E8DACB] text-[#4A2810] hover:bg-[#F3E8DA] transition-colors cursor-pointer"
            aria-label="Chat konsultasi"
          >
            <MessageSquare className="w-5 h-5" />
          </a>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] text-[#FFFDF9] font-bold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
              Tambah ke Keranjang
            </span>
            <span className="font-serif">{formatIDR(totalPrice)}</span>
          </button>
        </div>

        {/* ================= MODAL 1: AUTH PENGELOLA TOKO ================= */}
        {isAuthPromptOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#FAF5EE] rounded-3xl border border-[#E8DACB] p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2810] text-white flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D2314]">
                      Verifikasi Pengelola
                    </h3>
                    <p className="text-[10px] text-[#8C7A6B]">
                      Akses edit foto &amp; harga kemasan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthPromptOpen(false)}
                  className="p-1 rounded-full text-[#8C7A6B] hover:text-[#3D2314] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A2810] mb-1">
                    Password Pengelola
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DACB] text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#4A2810]"
                    required
                  />
                </div>

                {authError && (
                  <p className="text-[11px] text-[#A03D2A] font-semibold">
                    {authError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAuthPromptOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-white border border-[#E8DACB] text-xs font-bold text-[#8C7A6B] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-bold hover:bg-[#341A08] cursor-pointer shadow-xs"
                  >
                    Lanjutkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: UPLOAD FOTO BENTUK KEMASAN ================= */}
        {isEditingPackagingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
            <div className="w-full max-w-lg max-h-[90vh] bg-[#FAF5EE] rounded-3xl border border-[#E8DACB] p-5 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#E8DACB] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2810] text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D2314]">
                      Upload Foto Bentuk Kemasan
                    </h3>
                    <p className="text-[10px] text-[#8C7A6B]">
                      Ganti gambar 4 model wadah kue cookies &amp; lidah kucing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingPackagingModalOpen(false)}
                  className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#3D2314] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackagingImages} className="flex-1 overflow-y-auto space-y-3 py-3 no-scrollbar">
                {/* 1. Minipack Pouch */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">1. Minipack Pouch (150 gr)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Pouch Zipper
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgMinipack ? (
                        <img
                          src={imgMinipack}
                          alt="Minipack"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.minipack;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                        {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadPkgImage('minipack', e)}
                          className="hidden"
                          disabled={isCompressingImg}
                        />
                      </label>
                      <input
                        type="text"
                        value={imgMinipack}
                        onChange={(e) => setImgMinipack(e.target.value)}
                        placeholder="Atau tempel URL gambar..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ekopack Pouch */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">2. Ekopack Pouch (200 gr)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Standing Pouch
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgEkopack ? (
                        <img
                          src={imgEkopack}
                          alt="Ekopack"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.ekopack;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                        {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadPkgImage('ekopack', e)}
                          className="hidden"
                          disabled={isCompressingImg}
                        />
                      </label>
                      <input
                        type="text"
                        value={imgEkopack}
                        onChange={(e) => setImgEkopack(e.target.value)}
                        placeholder="Atau tempel URL gambar..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Toples Mika Ulir */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">3. Toples Mika Ulir (200g - 1000g)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Toples Mika
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgMika ? (
                        <img
                          src={imgMika}
                          alt="Toples Mika"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.mika;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                        {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadPkgImage('mika', e)}
                          className="hidden"
                          disabled={isCompressingImg}
                        />
                      </label>
                      <input
                        type="text"
                        value={imgMika}
                        onChange={(e) => setImgMika(e.target.value)}
                        placeholder="Atau tempel URL gambar..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Toples Kaca Mewah */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">4. Toples Kaca Mewah (150 gr)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Toples Kaca
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgKaca ? (
                        <img
                          src={imgKaca}
                          alt="Toples Kaca"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.kaca;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                        {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadPkgImage('kaca', e)}
                          className="hidden"
                          disabled={isCompressingImg}
                        />
                      </label>
                      <input
                        type="text"
                        value={imgKaca}
                        onChange={(e) => setImgKaca(e.target.value)}
                        placeholder="Atau tempel URL gambar..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPackagingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8DACB] text-xs font-bold text-[#7A6657] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="flex-1 py-2.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-md hover:bg-[#341A08] cursor-pointer"
                  >
                    {isSyncing ? 'Menyimpan...' : 'Simpan Foto Kemasan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 3: EDIT HARGA 8 KEMASAN ================= */}
        {isEditingPricesModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
            <div className="w-full max-w-lg max-h-[90vh] bg-[#FAF5EE] rounded-3xl border border-[#E8DACB] p-5 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#E8DACB] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2810] text-white flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D2314] truncate max-w-[240px]">
                      Edit Harga: {liveProduct.name}
                    </h3>
                    <p className="text-[10px] text-[#8C7A6B]">
                      Atur harga khusus untuk 8 pilihan kemasan produk ini
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingPricesModalOpen(false)}
                  className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#3D2314] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePrices} className="flex-1 overflow-y-auto space-y-3 py-3 no-scrollbar">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-[#E8DACB]">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">Harga Satuan Acuan</span>
                    <span className="font-serif font-bold text-xs text-[#4A2810]">
                      {formatIDR(liveProduct.price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAutoPackagePrices(liveProduct.price)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] hover:bg-[#F3E8DA] text-[10.5px] font-bold text-[#4A2810] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#8B5E3C]" />
                    <span>Hitung Otomatis</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {/* 1. Minipack 150 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">1. Minipack 150 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Pouch zipper mini camilan santai</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMinipack150}
                        onChange={(e) => setPriceMinipack150(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 2. Ekopack 200 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">2. Ekopack 200 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Standing pouch eco ziplock</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceEkopack200}
                        onChange={(e) => setPriceEkopack200(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. Toples Mika Ulir 200 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">3. Toples Mika Ulir 200 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples kristal mika ulir (Standar favorit)</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMika200}
                        onChange={(e) => setPriceMika200(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Toples Mika Ulir 250 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">4. Toples Mika Ulir 250 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples mika ulir sedang santai</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMika250}
                        onChange={(e) => setPriceMika250(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 5. Toples Mika Ulir 350 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">5. Toples Mika Ulir 350 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples mika ulir besar meja tamu</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMika350}
                        onChange={(e) => setPriceMika350(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 6. Toples Mika Ulir 500 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">6. Toples Mika Ulir 500 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples mika ulir setengah kilo</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMika500}
                        onChange={(e) => setPriceMika500(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 7. Toples Mika Ulir 1000 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">7. Toples Mika Ulir 1000 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples mika ulir jumbo 1 kg</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceMika1000}
                        onChange={(e) => setPriceMika1000(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 8. Toples Kaca Mewah 150 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">8. Toples Kaca Mewah 150 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Jar kaca eksklusif kedap udara kado/hampers</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceKaca150}
                        onChange={(e) => setPriceKaca150(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPricesModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8DACB] text-xs font-bold text-[#7A6657] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="flex-1 py-2.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-md hover:bg-[#341A08] cursor-pointer"
                  >
                    {isSyncing ? 'Menyimpan...' : 'Simpan Harga Kemasan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
