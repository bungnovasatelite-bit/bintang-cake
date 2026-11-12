import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { BrandLogo } from '../components/icons/BrandLogo';

export const DetailProdukModal: React.FC = () => {
  const { selectedProduct, closeProductDetail } = useNavigation();
  const { addToCart } = useCart();

  if (!selectedProduct) return null;

  const defaultSizes = selectedProduct.sizes || [
    { name: 'Kemasan Standar', portion: '1 Toples / Porsi', price: selectedProduct.price }
  ];

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [candleChoice, setCandleChoice] = useState('Lilin Ulir Klasik (Free 2 Pcs)');
  const [greetingCardText, setGreetingCardText] = useState('');
  const [bakerNote, setBakerNote] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const currentSize = defaultSizes[selectedSizeIndex] || defaultSizes[0];
  const currentUnitPrice = currentSize.price;
  const totalPrice = currentUnitPrice * quantity;

  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const handleAddToCart = () => {
    addToCart(
      selectedProduct,
      quantity,
      currentSize.name,
      bakerNote ? `Catatan: ${bakerNote}` : undefined
    );
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
            className="p-2 -ml-1 rounded-full text-[#3D2314] hover:bg-[#F3E8DA] transition-colors"
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
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'text-[#B85D43]' : 'text-[#8C7A6B] hover:text-[#3D2314]'
            }`}
            aria-label="Sukai produk"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          {/* Main Hero Image */}
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

          {/* Title & Description */}
          <div>
            <h1 className="font-serif font-bold text-xl text-[#3D2314]">
              {selectedProduct.name}
            </h1>
            <p className="text-xs font-semibold text-[#8B5E3C] mt-0.5">
              Mulai dari {formatIDR(selectedProduct.price)}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-[#7A6657] mt-2">
              <Clock className="w-3.5 h-3.5 text-[#B87D48]" />
              <span>Freshly made to order • Pre-order 1 hari</span>
            </div>

            <p className="text-xs text-[#6B5749] leading-relaxed mt-2.5 bg-[#FFFDFB] p-3 rounded-2xl border border-[#EFE5D9]">
              {selectedProduct.description ||
                'Kue istimewa dibuat dengan bahan-bahan pilihan berkualitas tinggi, mentega murni Wijsman, dan sentuhan kehangatan resep keluarga.'}
            </p>
          </div>

          {/* Size / Variant Options */}
          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#3D2314]">Pilih Ukuran Cake</span>
                <span className="text-[#8C7A6B]">Porsi</span>
              </div>

              <div className="space-y-2">
                {selectedProduct.sizes.map((sz, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  return (
                    <div
                      key={sz.name}
                      onClick={() => setSelectedSizeIndex(idx)}
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

          {/* Complementary Freebies */}
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

          {/* Quantity Stepper */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#3D2314]">Jumlah Pesanan</p>
              <p className="text-[10px] text-[#8C7A6B]">Dibuat khusus untuk Anda</p>
            </div>

            <div className="flex items-center bg-[#F5EFE6] rounded-xl px-2 py-1 gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors"
                aria-label="Kurangi pesanan"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-sm font-bold text-[#3D2314] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors"
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
              placeholder="Misal: Kurangi tingkat kemanisan, sertakan pisau kue"
              className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#E8DACB] text-xs text-[#3D2314] placeholder-[#A8988B] focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="sticky bottom-0 bg-[#FAF5EE]/95 backdrop-blur-md px-4 py-3 border-t border-[#E8DACB] flex items-center gap-2">
          <button
            onClick={() => alert('Fitur chat konsultasi produk!')}
            className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#E8DACB] text-[#4A2810] hover:bg-[#F3E8DA] transition-colors"
            aria-label="Chat konsultasi"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] text-[#FFFDF9] font-bold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-[0.99] transition-all"
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
