import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useCMS } from '../context/CMSContext';
import { BrandLogo } from '../components/icons/BrandLogo';
import {
  getPackagingStylesShowcase,
  getCookiePackageOptions
} from '../data/packageOptions';

export const DetailProdukModal: React.FC = () => {
  const { selectedProduct, closeProductDetail } = useNavigation();
  const { addToCart } = useCart();
  const { storeConfig } = useCMS();

  if (!selectedProduct) return null;

  // Cek apakah produk masuk kategori cookies atau lidah-kucing
  const isCookieOrLidah = selectedProduct.category === 'cookies' || selectedProduct.category === 'lidah-kucing';

  // 4 Gaya Kemasan Utama berfoto dinamis dari storeConfig
  const packagingShowcase = useMemo(() => {
    return getPackagingStylesShowcase(storeConfig.packagingImages);
  }, [storeConfig.packagingImages]);

  // 8 Pilihan kemasan untuk cookies & lidah kucing (harga & foto dinamis)
  const cookieOptions = useMemo(() => {
    return isCookieOrLidah
      ? getCookiePackageOptions(selectedProduct.price, selectedProduct.sizes, storeConfig.packagingImages)
      : [];
  }, [isCookieOrLidah, selectedProduct.price, selectedProduct.sizes, storeConfig.packagingImages]);

  // Default kemasan cookies: Toples Mika Ulir 200 gr (index 2 / 'mika-200')
  const [selectedPackageId, setSelectedPackageId] = useState<string>('mika-200');

  // Pilihan ukuran untuk Cake (jika ada)
  const defaultCakeSizes = selectedProduct.sizes || [
    { name: 'Kemasan Standar', portion: '1 Porsi / Loyang', price: selectedProduct.price }
  ];
  const [selectedCakeSizeIndex, setSelectedCakeSizeIndex] = useState(0);

  // Jumlah pesanan & catatan
  const [quantity, setQuantity] = useState(1);
  const [candleChoice, setCandleChoice] = useState('Lilin Ulir Klasik (Free 2 Pcs)');
  const [cookieGreetingOption, setCookieGreetingOption] = useState('Pita Hias & Segel Emas (Free)');
  const [greetingCardText, setGreetingCardText] = useState('');
  const [bakerNote, setBakerNote] = useState('');
  const [isLiked, setIsLiked] = useState(false);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#8B5E3C]" />
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-[#3D2314]">
                      Pilihan Bentuk Kemasan
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#8C7A6B]">
                    4 Tipe Wadah Higienis
                  </span>
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
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="font-bold text-[#3D2314]">
                      Pilih Ukuran &amp; Kemasan (8 Pilihan)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8C7A6B]">Harga per Kemasan</span>
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
      </div>
    </div>
  );
};
