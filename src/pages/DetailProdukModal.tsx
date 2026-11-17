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
  Check,
  Package,
  Layers,
  Pencil,
  Upload,
  X,
  Calculator,
  Loader2,
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
  getHamperPackageOptions,
  HamperOption,
} from '../data/packageOptions';
import { compressImage } from '../utils/imageCompressor';

export const DetailProdukModal: React.FC = () => {
  const { selectedProduct, closeProductDetail } = useNavigation();
  const { addToCart } = useCart();
  const {
    products,
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
  const isHampers = liveProduct.category === 'hampers' || liveProduct.name.toLowerCase().includes('bingkisan');

  // 3 Pilihan Paket untuk Hampers / Bingkisan
  const hamperOptions: HamperOption[] = useMemo(() => {
    return isHampers
      ? getHamperPackageOptions(
          liveProduct.name,
          liveProduct.price,
          liveProduct.sizes,
          {
            hamper1: liveProduct.packagingImages?.hamper1,
            hamper2: liveProduct.packagingImages?.hamper2,
            hamper3: liveProduct.packagingImages?.hamper3,
          },
          liveProduct.image
        )
      : [];
  }, [isHampers, liveProduct.name, liveProduct.price, liveProduct.sizes, liveProduct.packagingImages, liveProduct.image]);

  const [selectedHamperIndex, setSelectedHamperIndex] = useState(0);

  // Modal State 4: Edit 3 Pilihan Paket Hampers (Admin)
  const [isEditingHamperModalOpen, setIsEditingHamperModalOpen] = useState(false);
  const [hampName1, setHampName1] = useState('');
  const [hampPortion1, setHampPortion1] = useState('');
  const [hampPrice1, setHampPrice1] = useState<number>(0);
  const [hampImage1, setHampImage1] = useState('');

  const [hampName2, setHampName2] = useState('');
  const [hampPortion2, setHampPortion2] = useState('');
  const [hampPrice2, setHampPrice2] = useState<number>(0);
  const [hampImage2, setHampImage2] = useState('');

  const [hampName3, setHampName3] = useState('');
  const [hampPortion3, setHampPortion3] = useState('');
  const [hampPrice3, setHampPrice3] = useState<number>(0);
  const [hampImage3, setHampImage3] = useState('');

  // 4 Gaya Kemasan Utama berfoto dinamis KHUSUS untuk produk ini (liveProduct)
  // Prioritas:
  // 1. liveProduct.packagingImages (foto kemasan khusus produk ini yang diupload admin)
  // 2. DEFAULT_PACKAGING_IMAGES (foto standar netral bawaan agar TIDAK tertukar dengan cookies lain)
  const effectivePackagingImages = useMemo(() => {
    return {
      minipack: liveProduct.packagingImages?.minipack || DEFAULT_PACKAGING_IMAGES.minipack,
      ekopack: liveProduct.packagingImages?.ekopack || DEFAULT_PACKAGING_IMAGES.ekopack,
      mika: liveProduct.packagingImages?.mika || DEFAULT_PACKAGING_IMAGES.mika,
      bundar: liveProduct.packagingImages?.bundar || DEFAULT_PACKAGING_IMAGES.bundar,
      persegi: liveProduct.packagingImages?.persegi || DEFAULT_PACKAGING_IMAGES.persegi,
      kaca: liveProduct.packagingImages?.kaca || DEFAULT_PACKAGING_IMAGES.kaca,
    };
  }, [liveProduct.packagingImages]);

  const packagingShowcase = useMemo(() => {
    return getPackagingStylesShowcase(effectivePackagingImages, liveProduct.image);
  }, [effectivePackagingImages, liveProduct.image]);

  // 10 Pilihan kemasan untuk cookies & lidah kucing (harga & foto dinamis khusus produk ini)
  const cookieOptions = useMemo(() => {
    return isCookieOrLidah
      ? getCookiePackageOptions(liveProduct.price, liveProduct.sizes, effectivePackagingImages, liveProduct.image)
      : [];
  }, [isCookieOrLidah, liveProduct.price, liveProduct.sizes, effectivePackagingImages, liveProduct.image]);

  // Default kemasan cookies: Toples Mika Ulir 200 gr (index 2 / 'mika-200')
  const [selectedPackageId, setSelectedPackageId] = useState<string>('mika-200');

  // Pilihan ukuran untuk Cake (jika ada)
  const defaultCakeSizes = liveProduct.sizes || [
    { name: 'Kemasan Standar', portion: '1 Porsi / Loyang', price: liveProduct.price }
  ];
  const [selectedCakeSizeIndex, setSelectedCakeSizeIndex] = useState(0);

  // Jumlah pesanan & catatan
  const [quantity, setQuantity] = useState(1);
  const [greetingCardText, setGreetingCardText] = useState('');
  const [bakerNote, setBakerNote] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Modal State 1: Upload Foto Bentuk Kemasan KHUSUS PRODUK INI
  const [isEditingPackagingModalOpen, setIsEditingPackagingModalOpen] = useState(false);
  const [applyToAllProducts, setApplyToAllProducts] = useState(false);
  const [imgMinipack, setImgMinipack] = useState(liveProduct.packagingImages?.minipack || '');
  const [imgEkopack, setImgEkopack] = useState(liveProduct.packagingImages?.ekopack || '');
  const [imgMika, setImgMika] = useState(liveProduct.packagingImages?.mika || '');
  const [imgBundar, setImgBundar] = useState(liveProduct.packagingImages?.bundar || '');
  const [imgPersegi, setImgPersegi] = useState(liveProduct.packagingImages?.persegi || '');
  const [imgKaca, setImgKaca] = useState(liveProduct.packagingImages?.kaca || '');
  const [isCompressingImg, setIsCompressingImg] = useState(false);

  // Modal State 2: Edit Harga 10 Kemasan
  const [isEditingPricesModalOpen, setIsEditingPricesModalOpen] = useState(false);
  const [priceMinipack150, setPriceMinipack150] = useState<number>(0);
  const [priceEkopack200, setPriceEkopack200] = useState<number>(0);
  const [priceMika200, setPriceMika200] = useState<number>(0);
  const [priceMika250, setPriceMika250] = useState<number>(0);
  const [priceBundar300, setPriceBundar300] = useState<number>(0);
  const [priceMika350, setPriceMika350] = useState<number>(0);
  const [priceMika500, setPriceMika500] = useState<number>(0);
  const [pricePersegi500, setPricePersegi500] = useState<number>(0);
  const [priceMika1000, setPriceMika1000] = useState<number>(0);
  const [priceKaca150, setPriceKaca150] = useState<number>(0);

  // Modal State 3: Admin Auth Prompt
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<'edit_images' | 'edit_prices' | 'edit_hamper' | null>(null);

  useEffect(() => {
    setImgMinipack(liveProduct.packagingImages?.minipack || '');
    setImgEkopack(liveProduct.packagingImages?.ekopack || '');
    setImgMika(liveProduct.packagingImages?.mika || '');
    setImgBundar(liveProduct.packagingImages?.bundar || '');
    setImgPersegi(liveProduct.packagingImages?.persegi || '');
    setImgKaca(liveProduct.packagingImages?.kaca || '');
  }, [liveProduct.id, liveProduct.packagingImages]);

  // Helper buka editor hampers
  const openHamperEditorDirect = () => {
    const currentOpts = hamperOptions;
    if (currentOpts.length >= 3) {
      setHampName1(currentOpts[0].name);
      setHampPortion1(currentOpts[0].portion);
      setHampPrice1(currentOpts[0].price);
      setHampImage1(currentOpts[0].image);

      setHampName2(currentOpts[1].name);
      setHampPortion2(currentOpts[1].portion);
      setHampPrice2(currentOpts[1].price);
      setHampImage2(currentOpts[1].image);

      setHampName3(currentOpts[2].name);
      setHampPortion3(currentOpts[2].portion);
      setHampPrice3(currentOpts[2].price);
      setHampImage3(currentOpts[2].image);
    }
    setIsEditingHamperModalOpen(true);
  };

  const openHamperEditor = () => {
    if (!isAdminLoggedIn) {
      setPendingAction('edit_hamper');
      setIsAuthPromptOpen(true);
      return;
    }
    openHamperEditorDirect();
  };

  const handleUploadHamperImage = async (
    index: 1 | 2 | 3,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingImg(true);
        const compressed = await compressImage(file, 800, 800, 0.8);
        if (index === 1) setHampImage1(compressed);
        if (index === 2) setHampImage2(compressed);
        if (index === 3) setHampImage3(compressed);
      } catch (err) {
        console.error('Gagal kompresi foto:', err);
      } finally {
        setIsCompressingImg(false);
      }
    }
  };

  const handleSaveHamperOptions = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSizes = [
      { name: hampName1 || 'Paket 1', portion: hampPortion1 || '', price: Number(hampPrice1) || 0, image: hampImage1, badge: 'Pilihan 1' },
      { name: hampName2 || 'Paket 2', portion: hampPortion2 || '', price: Number(hampPrice2) || 0, image: hampImage2, badge: 'Pilihan 2' },
      { name: hampName3 || 'Paket 3', portion: hampPortion3 || '', price: Number(hampPrice3) || 0, image: hampImage3, badge: 'Pilihan 3' },
    ];
    await updateProduct(liveProduct.id, {
      sizes: newSizes,
      price: Number(hampPrice1) || liveProduct.price,
      packagingImages: {
        ...liveProduct.packagingImages,
        hamper1: hampImage1,
        hamper2: hampImage2,
        hamper3: hampImage3,
      }
    });
    setIsEditingHamperModalOpen(false);
  };

  // Helper kalkulasi standar harga kemasan (10 Pilihan)
  const calculateStandardPackagePrices = (base: number) => {
    const round1000 = (val: number) => Math.round(val / 1000) * 1000;
    return {
      minipack150: round1000(base * 0.78),
      ekopack200: round1000(base * 0.93),
      mika200: base,
      mika250: round1000(base * 1.22),
      bundar300: round1000(base * 1.45),
      mika350: round1000(base * 1.67),
      mika500: round1000(base * 2.33),
      persegi500: round1000(base * 2.33),
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
    setPriceBundar300(std.bundar300);
    setPriceMika350(std.mika350);
    setPriceMika500(std.mika500);
    setPricePersegi500(std.persegi500);
    setPriceMika1000(std.mika1000);
    setPriceKaca150(std.kaca150);
  };

  const openPackagingImagesEditor = () => {
    setImgMinipack(liveProduct.packagingImages?.minipack || '');
    setImgEkopack(liveProduct.packagingImages?.ekopack || '');
    setImgMika(liveProduct.packagingImages?.mika || '');
    setImgBundar(liveProduct.packagingImages?.bundar || '');
    setImgPersegi(liveProduct.packagingImages?.persegi || '');
    setImgKaca(liveProduct.packagingImages?.kaca || '');
    setApplyToAllProducts(false);

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
    setPriceBundar300(findSizePrice('Toples bundar 300 gr', std.bundar300));
    setPriceMika350(findSizePrice('Toples Mika Ulir 350 gr', std.mika350));
    setPriceMika500(findSizePrice('Toples Mika Ulir 500 gr', std.mika500));
    setPricePersegi500(findSizePrice('Toples Persegi 500 gr', std.persegi500));
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
      } else if (pendingAction === 'edit_hamper') {
        openHamperEditorDirect();
      }
      setPendingAction(null);
    } else {
      setAuthError('Password salah. Silakan coba lagi (nadine13).');
    }
  };

  const handleUploadPkgImage = async (
    key: 'minipack' | 'ekopack' | 'mika' | 'bundar' | 'persegi' | 'kaca',
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
        if (key === 'bundar') setImgBundar(compressed);
        if (key === 'persegi') setImgPersegi(compressed);
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
    const pkgImgs = {
      minipack: imgMinipack.trim() || undefined,
      ekopack: imgEkopack.trim() || undefined,
      mika: imgMika.trim() || undefined,
      bundar: imgBundar.trim() || undefined,
      persegi: imgPersegi.trim() || undefined,
      kaca: imgKaca.trim() || undefined,
    };

    // 1. Simpan KHUSUS untuk produk kue ini (tidak akan mempengaruhi kue cookies lainnya)
    await updateProduct(liveProduct.id, {
      packagingImages: pkgImgs,
    });

    // 2. Jika admin secara eksplisit mencentang opsi untuk menjadikannya template default toko
    if (applyToAllProducts) {
      await updateStoreConfig({
        packagingImages: {
          minipack: imgMinipack,
          ekopack: imgEkopack,
          mika: imgMika,
          bundar: imgBundar,
          persegi: imgPersegi,
          kaca: imgKaca,
        },
      });
    }

    setIsEditingPackagingModalOpen(false);
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSizes = [
      { name: 'Minipack 150 gr', portion: '150 gr • Camilan praktis', price: Number(priceMinipack150) || 0 },
      { name: 'Ekopack 200 gr', portion: '200 gr • Standing pouch eco', price: Number(priceEkopack200) || 0 },
      { name: 'Toples Mika Ulir 200 gr', portion: '200 gr • Toples mika ulir kedap udara', price: Number(priceMika200) || 0 },
      { name: 'Toples Mika Ulir 250 gr', portion: '250 gr • Toples mika ulir sedang', price: Number(priceMika250) || 0 },
      { name: 'Toples bundar 300 gr', portion: '300 gr • Toples bundar bening cantik', price: Number(priceBundar300) || 0 },
      { name: 'Toples Mika Ulir 350 gr', portion: '350 gr • Toples mika ulir besar', price: Number(priceMika350) || 0 },
      { name: 'Toples Mika Ulir 500 gr', portion: '500 gr • Toples mika ulir setengah kilo', price: Number(priceMika500) || 0 },
      { name: 'Toples Persegi 500 gr', portion: '500 gr • Toples persegi hardtop kotak', price: Number(pricePersegi500) || 0 },
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

  // Paket yang sedang dipilih untuk hampers (3 Pilihan)
  const selectedHamperOption = hamperOptions[selectedHamperIndex] || hamperOptions[0];

  // Ukuran cake yang sedang dipilih
  const currentCakeSize = defaultCakeSizes[selectedCakeSizeIndex] || defaultCakeSizes[0];

  // Harga satuan saat ini
  const currentUnitPrice = isCookieOrLidah
    ? selectedCookiePackage.price
    : isHampers && selectedHamperOption
    ? selectedHamperOption.price
    : currentCakeSize.price;
  const totalPrice = currentUnitPrice * quantity;

  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const handleAddToCart = () => {
    const combinedNote = [
      greetingCardText.trim() ? `Kartu Ucapan: "${greetingCardText.trim()}"` : '',
      bakerNote.trim() ? `Catatan: ${bakerNote.trim()}` : '',
    ].filter(Boolean).join(' | ');

    if (isCookieOrLidah) {
      addToCart(
        selectedProduct,
        quantity,
        selectedCookiePackage.name,
        combinedNote || undefined,
        selectedCookiePackage.price
      );
    } else if (isHampers && selectedHamperOption) {
      addToCart(
        selectedProduct,
        quantity,
        selectedHamperOption.name,
        combinedNote || undefined,
        selectedHamperOption.price
      );
    } else {
      addToCart(
        selectedProduct,
        quantity,
        currentCakeSize.name,
        combinedNote || undefined,
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
            <p className="text-xs font-semibold text-[#8B5E3C] mt-0.5 flex items-center gap-1 flex-wrap">
              <span>Mulai dari</span>
              <span className="font-price font-bold text-sm text-[#3D2314]">
                {isCookieOrLidah
                  ? formatIDR(cookieOptions[0]?.price || selectedProduct.price)
                  : isHampers
                  ? formatIDR(hamperOptions[0]?.price || selectedProduct.price)
                  : formatIDR(selectedProduct.price)}
              </span>
              <span>
                {isCookieOrLidah
                  ? '• 10 Pilihan Kemasan'
                  : isHampers
                  ? '• 3 Pilihan Paket'
                  : ''}
              </span>
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
          {/* SEKSI KHUSUS COOKIES & LIDAH KUCING: GALERI KEMASAN + 10 PILIHAN UKURAN   */}
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

              {/* DAFTAR 10 PILIHAN KEMASAN DENGAN HARGA DI SAMPINGNYA */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="font-bold text-[#3D2314]">
                      Pilih Ukuran &amp; Kemasan (10 Pilihan)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={openPricesEditor}
                    className="px-2.5 py-1 rounded-xl bg-[#4A2810] text-[#FAF5EE] hover:bg-[#341A08] text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    title="Ubah harga 10 pilihan kemasan untuk produk ini"
                  >
                    <Pencil className="w-3 h-3 text-[#EAD1B6]" />
                    <span>Edit Harga 10 Kemasan</span>
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
                          <span className="font-price font-bold text-xs sm:text-sm block">
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
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKSI KHUSUS HAMPERS / BINGKISAN: 3 PILIHAN PAKET (SEPERTI PADA COOKIES)  */}
          {/* ========================================================================= */}
          {isHampers && (
            <div className="space-y-4">
              {/* Header & Tombol Edit Admin */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#8B5E3C]" />
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#3D2314]">
                    Pilihan Paket Hampers (3 Pilihan)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={openHamperEditor}
                  className="px-2.5 py-1 rounded-xl bg-[#4A2810] text-[#FAF5EE] hover:bg-[#341A08] text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Atur foto dan harga 3 pilihan paket hampers"
                >
                  <Pencil className="w-3 h-3 text-[#EAD1B6]" />
                  <span>Atur 3 Pilihan &amp; Foto</span>
                </button>
              </div>

              {/* Showcase 3 Kartu Paket Hampers */}
              <div className="grid grid-cols-3 gap-2">
                {hamperOptions.map((hOpt, idx) => {
                  const isSelected = selectedHamperIndex === idx;
                  return (
                    <div
                      key={hOpt.id}
                      onClick={() => setSelectedHamperIndex(idx)}
                      className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#4A2810] text-white border-[#4A2810] shadow-sm'
                          : 'bg-[#FFFDFB] text-[#3D2314] border-[#EFE5D9] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 bg-[#FAF5EE]">
                        <img src={hOpt.image} alt={hOpt.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold line-clamp-1">{hOpt.name}</p>
                        <p className={`text-[8.5px] line-clamp-1 mt-0.5 ${isSelected ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'}`}>
                          {hOpt.badge || `Pilihan ${idx + 1}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* List 3 Pilihan Paket & Isi */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#3D2314]">Pilih Rincian Isi Hampers</span>
                  <span className="text-[#8C7A6B]">3 Pilihan</span>
                </div>

                {hamperOptions.map((hOpt, idx) => {
                  const isSelected = selectedHamperIndex === idx;
                  return (
                    <div
                      key={hOpt.id}
                      onClick={() => setSelectedHamperIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#4A2810] text-[#FFFDF9] border-[#4A2810] shadow-sm'
                          : 'bg-[#FFFDFB] text-[#3D2314] border-[#EFE5D9] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF5EE] shrink-0 border border-[#E8DACB]">
                          <img src={hOpt.image} alt={hOpt.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-xs">{hOpt.name}</p>
                            {hOpt.badge && (
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-[#EAD1B6] text-[#4A2810]' : 'bg-[#F4E9DC] text-[#7A5844]'
                              }`}>
                                {hOpt.badge}
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#EAD1B6] shrink-0" />}
                          </div>
                          <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-[#EAD1B6]' : 'text-[#8C7A6B]'}`}>
                            {hOpt.portion}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-price font-bold text-xs sm:text-sm block">
                          {formatIDR(hOpt.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEKSI UNTUK KATEGORI LAIN (CAKE, BROWNIES, CUSTOM)                        */}
          {/* ========================================================================= */}
          {!isCookieOrLidah && !isHampers && (
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
                          <span className="font-price font-bold text-xs sm:text-sm">
                            {formatIDR(sz.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* KARTU UCAPAN (GRATIS) DENGAN KOTAK ISIAN KOSONG UNTUK SEMUA PRODUK        */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D2314]">
                <MessageSquare className="w-4 h-4 text-[#B87D48]" />
                <span>Kartu Ucapan (Gratis)</span>
              </div>
              <span className="text-[10px] text-[#8C7A6B] font-medium">
                {greetingCardText.length}/150
              </span>
            </div>
            <p className="text-[10.5px] text-[#8C7A6B]">
              Tulis pesan atau ucapan khusus yang ingin dicetak pada kartu ucapan pesanan:
            </p>
            <textarea
              value={greetingCardText}
              maxLength={150}
              onChange={(e) => setGreetingCardText(e.target.value)}
              placeholder="Tulis ucapan Anda di sini (contoh: Selamat Ulang Tahun Ibu tersayang, semoga sehat dan bahagia selalu)..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] placeholder-[#A8988B] focus:outline-none focus:border-[#4A2810] resize-none transition-all"
            />
          </div>

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
            <span className="font-price font-bold text-sm sm:text-base">{formatIDR(totalPrice)}</span>
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

        {/* ================= MODAL 2: UPLOAD FOTO BENTUK KEMASAN KHUSUS PRODUK INI ================= */}
        {isEditingPackagingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
            <div className="w-full max-w-lg max-h-[90vh] bg-[#FAF5EE] rounded-3xl border border-[#E8DACB] p-5 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#E8DACB] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2810] text-white flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-serif font-bold text-sm text-[#3D2314] truncate">
                        Upload Foto Kemasan
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EAD1B6] text-[#4A2810] truncate max-w-[150px]">
                        {liveProduct.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C7A6B]">
                      Tersimpan khusus untuk katalog kue <strong>{liveProduct.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingPackagingModalOpen(false)}
                  className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#3D2314] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackagingImages} className="flex-1 overflow-y-auto space-y-3 py-3 no-scrollbar">
                {/* Petunjuk Spesifik Produk */}
                <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/90 flex items-start gap-2.5">
                  <span className="text-base leading-none">💡</span>
                  <p className="text-[10.5px] text-[#5C3D2E] leading-relaxed">
                    Foto kemasan di bawah ini <strong>hanya tersimpan khusus untuk kue {liveProduct.name}</strong>. Anda dapat mengunggah foto berbeda untuk masing-masing jenis cookies tanpa saling tertukar atau mempengaruhi jenis cookies lainnya.
                  </p>
                </div>

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
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.minipack}
                          alt="Minipack Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('minipack', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgMinipack(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgMinipack && (
                          <button
                            type="button"
                            onClick={() => setImgMinipack('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgMinipack}
                        onChange={(e) => setImgMinipack(e.target.value)}
                        placeholder="Atau tempel URL gambar Minipack..."
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
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.ekopack}
                          alt="Ekopack Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('ekopack', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgEkopack(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgEkopack && (
                          <button
                            type="button"
                            onClick={() => setImgEkopack('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgEkopack}
                        onChange={(e) => setImgEkopack(e.target.value)}
                        placeholder="Atau tempel URL gambar Ekopack..."
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
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.mika}
                          alt="Toples Mika Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('mika', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgMika(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgMika && (
                          <button
                            type="button"
                            onClick={() => setImgMika('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgMika}
                        onChange={(e) => setImgMika(e.target.value)}
                        placeholder="Atau tempel URL gambar Toples Mika..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Toples Bundar */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">4. Toples Bundar (300 gr)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Toples Bundar
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgBundar ? (
                        <img
                          src={imgBundar}
                          alt="Toples Bundar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.bundar;
                          }}
                        />
                      ) : (
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.bundar}
                          alt="Toples Bundar Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('bundar', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgBundar(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgBundar && (
                          <button
                            type="button"
                            onClick={() => setImgBundar('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgBundar}
                        onChange={(e) => setImgBundar(e.target.value)}
                        placeholder="Atau tempel URL gambar Toples Bundar..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Toples Persegi */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">5. Toples Persegi (500 gr)</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
                      Toples Persegi
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#E8DACB] shrink-0">
                      {imgPersegi ? (
                        <img
                          src={imgPersegi}
                          alt="Toples Persegi"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_PACKAGING_IMAGES.persegi;
                          }}
                        />
                      ) : (
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.persegi}
                          alt="Toples Persegi Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('persegi', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgPersegi(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgPersegi && (
                          <button
                            type="button"
                            onClick={() => setImgPersegi('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgPersegi}
                        onChange={(e) => setImgPersegi(e.target.value)}
                        placeholder="Atau tempel URL gambar Toples Persegi..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Toples Kaca Mewah */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3D2314]">6. Toples Kaca Mewah (150 gr)</p>
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
                        <img
                          src={liveProduct.image || DEFAULT_PACKAGING_IMAGES.kaca}
                          alt="Toples Kaca Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] font-semibold text-[#4A2810] cursor-pointer hover:bg-[#F3E8DA]">
                          {isCompressingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Upload Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadPkgImage('kaca', e)}
                            className="hidden"
                            disabled={isCompressingImg}
                          />
                        </label>
                        {liveProduct.image && (
                          <button
                            type="button"
                            onClick={() => setImgKaca(liveProduct.image)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DACB] text-[10.5px] font-semibold text-[#8B5E3C] hover:bg-[#FAF5EE] cursor-pointer"
                            title="Gunakan foto produk saat ini"
                          >
                            Foto Utama
                          </button>
                        )}
                        {imgKaca && (
                          <button
                            type="button"
                            onClick={() => setImgKaca('')}
                            className="px-2 py-1 rounded-xl text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imgKaca}
                        onChange={(e) => setImgKaca(e.target.value)}
                        placeholder="Atau tempel URL gambar Toples Kaca..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Opsi Terapkan ke Seluruh Toko */}
                <label className="flex items-start gap-2.5 p-3 bg-white rounded-2xl border border-[#E8DACB] cursor-pointer hover:bg-[#FAF5EE] transition-colors">
                  <input
                    type="checkbox"
                    checked={applyToAllProducts}
                    onChange={(e) => setApplyToAllProducts(e.target.checked)}
                    className="mt-0.5 rounded text-[#4A2810] focus:ring-[#4A2810] cursor-pointer"
                  />
                  <div className="text-[10.5px] text-[#5C3D2E]">
                    <span className="font-bold block">Terapkan juga sebagai foto bawaan toko</span>
                    <span className="text-[9.5px] text-[#8C7A6B]">Centang jika Anda ingin foto kemasan ini dijadikan template bawaan bagi jenis cookies lain yang belum memiliki foto kemasan khusus.</span>
                  </div>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPackagingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8DACB] text-xs font-bold text-[#7A6657] cursor-pointer hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing || isCompressingImg}
                    className="flex-1 py-2.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-md hover:bg-[#341A08] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Foto ({liveProduct.name})</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 3: EDIT HARGA 10 KEMASAN ================= */}
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
                      Atur harga khusus untuk 10 pilihan kemasan produk ini
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

                  {/* 5. Toples bundar 300 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">5. Toples bundar 300 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples bundar bening cantik meja tamu</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={priceBundar300}
                        onChange={(e) => setPriceBundar300(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 6. Toples Mika Ulir 350 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">6. Toples Mika Ulir 350 gr</p>
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

                  {/* 7. Toples Mika Ulir 500 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">7. Toples Mika Ulir 500 gr</p>
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

                  {/* 8. Toples Persegi 500 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">8. Toples Persegi 500 gr</p>
                      <p className="text-[9.5px] text-[#8C7A6B]">Toples persegi hardtop kotak klasik</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#8C7A6B]">Rp</span>
                      <input
                        type="number"
                        value={pricePersegi500}
                        onChange={(e) => setPricePersegi500(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 9. Toples Mika Ulir 1000 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">9. Toples Mika Ulir 1000 gr</p>
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

                  {/* 10. Toples Kaca Mewah 150 gr */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8DACB] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#3D2314] leading-tight">10. Toples Kaca Mewah 150 gr</p>
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

        {/* ================= MODAL 4: EDIT 3 PILIHAN PAKET HAMPERS ================= */}
        {isEditingHamperModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#FAF5EE] rounded-3xl border border-[#E8DACB] p-4 sm:p-5 shadow-2xl space-y-4 no-scrollbar">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8DACB]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2810] text-white flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D2314]">
                      Atur 3 Pilihan Paket Hampers
                    </h3>
                    <p className="text-[10px] text-[#8C7A6B]">{liveProduct.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingHamperModalOpen(false)}
                  className="p-1 rounded-full text-[#8C7A6B] hover:text-[#3D2314] hover:bg-[#F3E8DA] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHamperOptions} className="space-y-4">
                <p className="text-[10.5px] text-[#8C7A6B] leading-relaxed">
                  Sesuaikan nama paket, isi bingkisan, foto, dan harga untuk 3 pilihan yang dapat dipilih oleh konsumen.
                </p>

                {/* PILIHAN 1 */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <span className="text-xs font-bold text-[#4A2810] block">Pilihan 1 (Misal: Paket 2 Toples)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Nama Pilihan</label>
                      <input
                        type="text"
                        value={hampName1}
                        onChange={(e) => setHampName1(e.target.value)}
                        placeholder="Contoh: Paket 2 Toples Classic"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Harga (Rp)</label>
                      <input
                        type="number"
                        value={hampPrice1}
                        onChange={(e) => setHampPrice1(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none font-price"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Rincian Isi Bingkisan</label>
                    <input
                      type="text"
                      value={hampPortion1}
                      onChange={(e) => setHampPortion1(e.target.value)}
                      placeholder="Contoh: 2 Toples Cookies Pilihan + Box Pita Cantik"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Foto Paket 1</label>
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#4A2810] flex items-center gap-1 cursor-pointer hover:bg-[#F3E8DA]">
                        <Upload className="w-3 h-3" />
                        <span>Pilih Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadHamperImage(1, e)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={hampImage1}
                        onChange={(e) => setHampImage1(e.target.value)}
                        placeholder="Atau URL foto paket 1..."
                        className="flex-1 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PILIHAN 2 */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <span className="text-xs font-bold text-[#4A2810] block">Pilihan 2 (Misal: Paket 3 Toples)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Nama Pilihan</label>
                      <input
                        type="text"
                        value={hampName2}
                        onChange={(e) => setHampName2(e.target.value)}
                        placeholder="Contoh: Paket 3 Toples Favorit"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Harga (Rp)</label>
                      <input
                        type="number"
                        value={hampPrice2}
                        onChange={(e) => setHampPrice2(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none font-price"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Rincian Isi Bingkisan</label>
                    <input
                      type="text"
                      value={hampPortion2}
                      onChange={(e) => setHampPortion2(e.target.value)}
                      placeholder="Contoh: 3 Toples Cookies Favorit + Hardbox Mewah"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Foto Paket 2</label>
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#4A2810] flex items-center gap-1 cursor-pointer hover:bg-[#F3E8DA]">
                        <Upload className="w-3 h-3" />
                        <span>Pilih Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadHamperImage(2, e)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={hampImage2}
                        onChange={(e) => setHampImage2(e.target.value)}
                        placeholder="Atau URL foto paket 2..."
                        className="flex-1 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PILIHAN 3 */}
                <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] space-y-2">
                  <span className="text-xs font-bold text-[#4A2810] block">Pilihan 3 (Misal: Paket 4 Toples Sultan)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Nama Pilihan</label>
                      <input
                        type="text"
                        value={hampName3}
                        onChange={(e) => setHampName3(e.target.value)}
                        placeholder="Contoh: Paket 4 Toples Sultan"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Harga (Rp)</label>
                      <input
                        type="number"
                        value={hampPrice3}
                        onChange={(e) => setHampPrice3(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs font-bold text-[#3D2314] focus:outline-none font-price"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Rincian Isi Bingkisan</label>
                    <input
                      type="text"
                      value={hampPortion3}
                      onChange={(e) => setHampPortion3(e.target.value)}
                      placeholder="Contoh: 4 Toples Lengkap Aneka Varian + Hadiah Khusus"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#3D2314] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] mb-0.5 font-semibold">Foto Paket 3</label>
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#4A2810] flex items-center gap-1 cursor-pointer hover:bg-[#F3E8DA]">
                        <Upload className="w-3 h-3" />
                        <span>Pilih Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadHamperImage(3, e)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={hampImage3}
                        onChange={(e) => setHampImage3(e.target.value)}
                        placeholder="Atau URL foto paket 3..."
                        className="flex-1 px-2 py-1 rounded-lg bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] text-[#3D2314] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingHamperModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8DACB] text-xs font-bold text-[#7A6657] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="flex-1 py-2.5 rounded-xl bg-[#4A2810] text-white text-xs font-bold shadow-md hover:bg-[#341A08] cursor-pointer"
                  >
                    {isSyncing ? 'Menyimpan...' : 'Simpan 3 Pilihan Hampers'}
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
