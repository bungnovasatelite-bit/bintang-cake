import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Store,
  Truck,
  Calendar,
  MapPin,
  QrCode,
  Building2,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { pushOrderToSupabase } from '../lib/database';

export const KeranjangPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { setActiveTab } = useNavigation();

  // Delivery mode state
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'courier'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris');
  const [customerName, setCustomerName] = useState('Siti Rahmawati');
  const [customerPhone, setCustomerPhone] = useState('0812-3456-7890');
  const [scheduleTime, setScheduleTime] = useState('15 Nov 2026, 14:00 WITA');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const grandTotal = subtotal;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const res = await pushOrderToSupabase({
        customerName,
        customerPhone,
        deliveryMode,
        scheduleTime,
        deliveryAddress: deliveryMode === 'pickup' ? 'Ambil di Butik Menteng' : 'Alamat Pelanggan',
        subtotal,
        discount: 0,
        totalAmount: grandTotal,
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          note: item.note,
        })),
      });

      if (res.success) {
        setOrderSuccessMsg(`Pesanan berhasil disimpan ke Supabase! ID Pesanan: ${res.orderId?.slice(0, 8)}...`);
      } else {
        alert(`Koneksi Supabase Aktif!\nInfo: ${res.error}\n\nTips: Jalankan file 'supabase/schema.sql' di SQL Editor Supabase untuk membuat tabel 'orders'.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-[#F5EFE6] text-[#8C7A6B] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#3D2314]">
          Keranjang Belanja Kosong
        </h3>
        <p className="text-xs text-[#8C7A6B] max-w-xs mx-auto mt-1 mb-6">
          Belum ada kue lezat atau cookies favorit Anda di sini. Jelajahi katalog dan temukan kreasi manis terbaik.
        </p>
        <button
          onClick={() => setActiveTab('produk')}
          className="px-6 py-3 rounded-2xl bg-[#4A2810] text-[#FFFDF9] font-bold text-sm shadow-md hover:bg-[#341A08] transition-all"
        >
          Lihat Katalog Produk
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header Banner */}
      <section className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#FBF3E8] border border-[#EBDCCF] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#4A2810] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-bold text-base text-[#3D2314]">
              Keranjang Pesanan
            </h2>
          </div>
          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#FCEEE9] text-[#A03D2A] border border-[#F5C7B9]">
            {totalItems} ITEM PILIHAN
          </span>
        </div>
        <p className="text-[11px] text-[#7A6657] mt-2 leading-relaxed">
          Pastikan rincian kue artisan dan bingkisan manis Anda sudah sesuai sebelum melanjutkan pesanan.
        </p>
      </section>

      {/* 2. Items List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif font-bold text-base text-[#3D2314]">
            Item Pilihan Anda
          </h3>
          <span className="text-[11px] text-[#8C7A6B] font-medium">
            Simulasi Keranjang
          </span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm flex items-center gap-3"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F5EFE6] shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#3D2314] truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-[#8C7A6B] line-clamp-1 mt-0.5">
                    {item.selectedSize ? `${item.selectedSize} • ` : ''}{item.packageType}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#A8988B] hover:text-[#A03D2A] p-1 transition-colors"
                  aria-label={`Hapus ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price & Stepper */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F8F1E8]">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#4A2810]">
                  {formatIDR(item.price)}
                </span>

                <div className="flex items-center bg-[#F5EFE6] rounded-xl px-1.5 py-0.5 gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white/70 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-bold text-[#3D2314] min-w-[16px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white/70 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Ringkasan Pembayaran */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-2.5">
        <h4 className="text-xs font-bold text-[#3D2314]">
          Ringkasan Pembayaran
        </h4>

        <div className="space-y-1.5 text-xs text-[#6B5749]">
          <div className="flex justify-between">
            <span>Subtotal ({totalItems} Jenis Kue)</span>
            <span className="font-semibold text-[#3D2314]">{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimasi Ongkos Kirim</span>
            <span className="italic text-[#8C7A6B]">Dihitung saat pengiriman</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#F5EFE6] flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-[#3D2314]">Total Sementara</span>
            <span className="text-[10px] text-[#8C7A6B]">Termasuk PPN &amp; Dus Kemasan</span>
          </div>
          <span className="font-serif font-bold text-lg text-[#3D2314]">
            {formatIDR(grandTotal)}
          </span>
        </div>
      </section>

      {/* 5. Informasi Pemesanan */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#8B5E3C]" />
            <h4 className="text-xs font-bold text-[#3D2314]">Informasi Pemesanan</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEE9] text-[#A03D2A]">
            Langkah Cepat
          </span>
        </div>

        {/* Pickup vs Courier switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F5EFE6] gap-1">
          <button
            onClick={() => setDeliveryMode('pickup')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              deliveryMode === 'pickup'
                ? 'bg-white text-[#3D2314] shadow-sm'
                : 'text-[#8C7A6B] hover:text-[#3D2314]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Diambil ke Toko
          </button>
          <button
            onClick={() => setDeliveryMode('courier')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              deliveryMode === 'courier'
                ? 'bg-white text-[#3D2314] shadow-sm'
                : 'text-[#8C7A6B] hover:text-[#3D2314]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Kurir Pengiriman
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">Nama Pembeli</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] font-medium text-[#3D2314] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] font-medium text-[#3D2314] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">Jadwal Pengambilan / Pengiriman</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] text-[#3D2314]">
              <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-transparent font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5EFE6]/70 border border-[#E8DACB] flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px] text-[#3D2314]">Lokasi Butik Utama</p>
              <p className="text-[10.5px] text-[#7A6657] leading-tight mt-0.5">
                Jl. Cikini Raya No. 42, Menteng, Jakarta Pusat (09:00 - 20:00 WIB)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Metode Pembayaran (Visual Preview - Simulation Only) */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-2.5">
        <h4 className="text-xs font-bold text-[#3D2314]">
          Metode Pembayaran (Pratinjau)
        </h4>

        <div className="space-y-2">
          {/* QRIS */}
          <div
            onClick={() => setPaymentMethod('qris')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              paymentMethod === 'qris'
                ? 'border-[#4A2810] bg-[#FAF5EE]'
                : 'border-[#EFE5D9] hover:bg-[#FAF5EE]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                checked={paymentMethod === 'qris'}
                onChange={() => setPaymentMethod('qris')}
                className="accent-[#4A2810]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#3D2314]">QRIS Instant</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FCEEE9] text-[#A03D2A]">
                    Otomatis
                  </span>
                </div>
                <p className="text-[10px] text-[#8C7A6B]">BCA, Mandiri, GoPay, OVO, ShopeePay</p>
              </div>
            </div>
            <QrCode className="w-5 h-5 text-[#4A2810]" />
          </div>

          {/* Transfer Bank */}
          <div
            onClick={() => setPaymentMethod('transfer')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              paymentMethod === 'transfer'
                ? 'border-[#4A2810] bg-[#FAF5EE]'
                : 'border-[#EFE5D9] hover:bg-[#FAF5EE]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
                className="accent-[#4A2810]"
              />
              <div>
                <span className="text-xs font-bold text-[#3D2314]">Transfer Bank Manual</span>
                <p className="text-[10px] text-[#8C7A6B]">Rekening BCA / Mandiri Bintang Cake</p>
              </div>
            </div>
            <Building2 className="w-5 h-5 text-[#8C7A6B]" />
          </div>
        </div>
      </section>

      {/* 7. Action Button */}
      <div className="space-y-2">
        {orderSuccessMsg && (
          <div className="p-3 rounded-2xl bg-[#E3EFE3] border border-[#C5DEC5] text-[#2C6E49] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] disabled:bg-[#8C7A6B] text-[#FFFDF9] font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#EAD1B6]" />
              <span>Menyimpan ke Supabase...</span>
            </>
          ) : (
            <>
              <span>Lanjutkan Pemesanan (Push ke Supabase)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-start gap-1.5 px-2 text-[10.5px] text-[#8C7A6B] leading-tight">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#B87D48]" />
          <span>Terhubung langsung ke Supabase Project: <code className="font-mono text-[#3D2314]">rkgdccccfkemerwdgsvz</code></span>
        </div>
      </div>
    </div>
  );
};
