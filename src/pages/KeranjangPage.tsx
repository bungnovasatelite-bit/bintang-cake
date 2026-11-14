import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Store,
  Truck,
  Calendar,
  Clock,
  QrCode,
  Building2,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
  CalendarDays
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useCMS } from '../context/CMSContext';
import { pushOrderToSupabase } from '../lib/database';

export const KeranjangPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems, clearCart } = useCart();
  const { setActiveTab } = useNavigation();
  const { storeConfig } = useCMS();

  // Delivery mode state
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'courier'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris');

  // Calon pembeli selalu mulai dari kosong sehingga mengisi data masing-masing
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Jadwal interaktif dengan tanggal & slot waktu otomatis
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickedDate, setPickedDate] = useState('');
  const [pickedTimeSlot, setPickedTimeSlot] = useState('10:00 - 13:00 (Pagi)');
  const [scheduleTime, setScheduleTime] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<{ id: string; msg: string } | null>(null);
  const [lastOrderedItems, setLastOrderedItems] = useState<typeof items>([]);
  const [isCopied, setIsCopied] = useState(false);

  const grandTotal = subtotal;

  // Helper format tanggal Indonesia
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Set tanggal cepat (Hari Ini, Besok, Lusa)
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const iso = d.toISOString().split('T')[0];
    setPickedDate(iso);
  };

  // Sinkronkan scheduleTime saat pickedDate atau pickedTimeSlot berubah
  useEffect(() => {
    if (pickedDate) {
      const formatted = `${formatDateIndo(pickedDate)} • ${pickedTimeSlot}`;
      setScheduleTime(formatted);
    }
  }, [pickedDate, pickedTimeSlot]);

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCheckout = async () => {
    // Validasi input pembeli
    if (!customerName.trim()) {
      setValidationError('Silakan masukkan Nama Lengkap Anda.');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Silakan masukkan Nomor WhatsApp Anda yang aktif.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const finalSchedule = scheduleTime.trim() || (deliveryMode === 'pickup' ? 'Ambil di Toko' : 'Pengiriman Standar');

    try {
      const res = await pushOrderToSupabase({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryMode,
        scheduleTime: finalSchedule,
        deliveryAddress: deliveryMode === 'pickup' ? 'Ambil di Toko Bintang Cake' : 'Alamat Pengiriman Pelanggan',
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

      setLastOrderedItems([...items]);

      if (res.success) {
        setOrderSuccessMsg({
          id: res.orderId || 'BC-000',
          msg: `Pesanan berhasil diproses! Nomor Pesanan Anda: #${res.orderId}. Terima kasih telah memesan di Bintang Cake.`
        });
        clearCart();
      } else {
        setOrderSuccessMsg({
          id: res.orderId || 'BC-000',
          msg: `Pesanan berhasil dicatat! Nomor Pesanan Anda: #${res.orderId}.`
        });
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setValidationError('Terjadi kesalahan saat memproses pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  // Nomor WhatsApp tujuan konfirmasi resmi: 0821-5873-9760
  const officialWaNumber = '6282158739760';

  // Jika pesanan telah berhasil
  if (orderSuccessMsg) {
    const itemsList = lastOrderedItems.length > 0
      ? lastOrderedItems.map(it => `• ${it.quantity}x ${it.name} [${it.selectedSize || it.packageType}] - ${formatIDR(it.price * it.quantity)}`).join('\n')
      : 'Pesanan Aneka Kue Bintang Cake';

    const waText = encodeURIComponent(
      `Halo Bintang Cake, saya sudah membuat pesanan dengan No Pesanan *#${orderSuccessMsg.id}*.\n\n` +
      `*Nama Pemesan:* ${customerName}\n` +
      `*No. WhatsApp:* ${customerPhone}\n` +
      `*Jadwal:* ${scheduleTime || 'Pengiriman Standar'}\n` +
      `*Metode:* ${paymentMethod === 'qris' ? 'QRIS Instant' : 'Transfer Bank'}\n\n` +
      `*Rincian Kemasan & Produk:*\n${itemsList}\n\n` +
      `*Total Tagihan:* ${formatIDR(grandTotal)}\n\n` +
      `Mohon segera diproses dan dikonfirmasi, terima kasih!`
    );

    return (
      <div className="py-12 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#E3EFE3] text-[#2C6E49] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#3D2314]">
            Pesanan Berhasil Diterima!
          </h3>
          <p className="text-xs text-[#6B5749] max-w-sm mx-auto leading-relaxed">
            {orderSuccessMsg.msg}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#EBDCCF] max-w-sm mx-auto text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#F5EFE6] pb-2">
            <span className="text-[#8C7A6B]">No. Pesanan:</span>
            <span className="font-bold text-[#4A2810]">#{orderSuccessMsg.id}</span>
          </div>
          <div className="flex justify-between border-b border-[#F5EFE6] pb-2">
            <span className="text-[#8C7A6B]">Nama Pemesan:</span>
            <span className="font-semibold text-[#3D2314]">{customerName}</span>
          </div>
          <div className="flex justify-between border-b border-[#F5EFE6] pb-2">
            <span className="text-[#8C7A6B]">WhatsApp:</span>
            <span className="font-semibold text-[#3D2314]">{customerPhone}</span>
          </div>
          <div className="flex justify-between border-b border-[#F5EFE6] pb-2">
            <span className="text-[#8C7A6B]">Jadwal:</span>
            <span className="font-semibold text-[#3D2314]">{scheduleTime || 'Pengiriman Standar'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7A6B]">Metode:</span>
            <span className="font-semibold text-[#3D2314] uppercase">{paymentMethod === 'qris' ? 'QRIS Instant' : 'Transfer Bank'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 max-w-sm mx-auto pt-2">
          <a
            href={`https://wa.me/${officialWaNumber}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Konfirmasi ke WhatsApp (0821-5873-9760)
          </a>

          <button
            onClick={() => {
              setOrderSuccessMsg(null);
              setCustomerName('');
              setCustomerPhone('');
              setPickedDate('');
              setScheduleTime('');
              setActiveTab('produk');
            }}
            className="w-full py-3 rounded-2xl bg-[#F5EFE6] hover:bg-[#EFE5D9] text-[#4A2810] font-bold text-xs transition-colors cursor-pointer"
          >
            Pesan Kue Lainnya
          </button>
        </div>
      </div>
    );
  }

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
          className="px-6 py-3 rounded-2xl bg-[#4A2810] text-[#FFFDF9] font-bold text-sm shadow-md hover:bg-[#341A08] transition-all cursor-pointer"
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
            Rincian Pesanan
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
                  <p className="text-[10px] text-[#8C7A6B] line-clamp-1 mt-0.5 font-medium">
                    {item.selectedSize || item.packageType || 'Kemasan Standar'}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#A8988B] hover:text-[#A03D2A] p-1 transition-colors cursor-pointer"
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
                    className="w-6 h-6 rounded-lg bg-white/70 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-bold text-[#3D2314] min-w-[16px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white/70 hover:bg-white text-[#4A2810] flex items-center justify-center transition-colors cursor-pointer"
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
            <span>Subtotal ({totalItems} Item Kue)</span>
            <span className="font-semibold text-[#3D2314]">{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimasi Ongkos Kirim</span>
            <span className="italic text-[#8C7A6B]">
              {deliveryMode === 'pickup' ? 'Gratis (Ambil Sendiri)' : 'Dihitung saat pengiriman'}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#F5EFE6] flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-[#3D2314]">Total Pembayaran</span>
            <span className="text-[10px] text-[#8C7A6B]">Termasuk Dus Kemasan Eksklusif</span>
          </div>
          <span className="font-serif font-bold text-lg text-[#3D2314]">
            {formatIDR(grandTotal)}
          </span>
        </div>
      </section>

      {/* 4. Informasi Pemesanan (Data Pembeli Selalu Kosong pada Awal Buka) */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#8B5E3C]" />
            <h4 className="text-xs font-bold text-[#3D2314]">Informasi Pemesan</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEE9] text-[#A03D2A]">
            Wajib Diisi
          </span>
        </div>

        {/* Pickup vs Courier switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F5EFE6] gap-1">
          <button
            onClick={() => setDeliveryMode('pickup')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              deliveryMode === 'courier'
                ? 'bg-white text-[#3D2314] shadow-sm'
                : 'text-[#8C7A6B] hover:text-[#3D2314]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Kurir Pengiriman
          </button>
        </div>

        {/* Inputs Pembeli */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">
              Nama Pembeli <span className="text-[#A03D2A]">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Masukkan nama lengkap Anda..."
              className="w-full px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] font-medium text-[#3D2314] placeholder-[#A8988B] focus:outline-none focus:border-[#4A2810]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B5749] mb-1">
              Nomor WhatsApp <span className="text-[#A03D2A]">*</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] font-medium text-[#3D2314] placeholder-[#A8988B] focus:outline-none focus:border-[#4A2810]"
            />
          </div>

          {/* JADWAL OTOMATIS: KALENDER & PILIHAN WAKTU */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-[#6B5749]">
                Jadwal Pengambilan / Pengantaran
              </label>
              <span className="text-[10px] text-[#8C7A6B]">Pilih Tanggal &amp; Waktu</span>
            </div>

            {/* Tombol Pintas Tanggal Cepat */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="py-1.5 px-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F3E8DA] border border-[#E8DACB] text-[10.5px] font-semibold text-[#4A2810] transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="py-1.5 px-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F3E8DA] border border-[#E8DACB] text-[10.5px] font-semibold text-[#4A2810] transition-colors cursor-pointer"
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(2)}
                className="py-1.5 px-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F3E8DA] border border-[#E8DACB] text-[10.5px] font-semibold text-[#4A2810] transition-colors cursor-pointer"
              >
                Lusa
              </button>
            </div>

            {/* Input Kalender Tanggal Otomatis & Pilihan Jam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] text-[#3D2314]">
                <CalendarDays className="w-4 h-4 text-[#8C7A6B] shrink-0" />
                <input
                  type="date"
                  min={todayStr}
                  value={pickedDate}
                  onChange={(e) => setPickedDate(e.target.value)}
                  className="w-full bg-transparent font-medium text-xs text-[#3D2314] focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F3EC] border border-[#E8DACB] text-[#3D2314]">
                <Clock className="w-4 h-4 text-[#8C7A6B] shrink-0" />
                <select
                  value={pickedTimeSlot}
                  onChange={(e) => setPickedTimeSlot(e.target.value)}
                  className="w-full bg-transparent font-medium text-xs text-[#3D2314] focus:outline-none cursor-pointer"
                >
                  <option value="10:00 - 13:00 (Pagi)">10:00 - 13:00 (Pagi)</option>
                  <option value="13:00 - 16:00 (Siang)">13:00 - 16:00 (Siang)</option>
                  <option value="16:00 - 19:00 (Sore)">16:00 - 19:00 (Sore)</option>
                  <option value="19:00 - 20:30 (Malam)">19:00 - 20:30 (Malam)</option>
                </select>
              </div>
            </div>

            {/* Preview Jadwal Terpilih */}
            {scheduleTime ? (
              <div className="p-2 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[11px] text-[#4A2810] font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
                <span>Jadwal Terpilih: <strong>{scheduleTime}</strong></span>
              </div>
            ) : (
              <p className="text-[10px] text-[#8C7A6B] italic">
                *Klik tombol cepat di atas atau pilih tanggal pada kalender.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. Metode Pembayaran dengan QRIS & Rekening Admin Terintegrasi */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#3D2314]">
          Metode Pembayaran (Pratinjau)
        </h4>

        <div className="space-y-2.5">
          {/* Pilihan 1: QRIS Instant */}
          <div
            onClick={() => setPaymentMethod('qris')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'qris'
                ? 'border-[#4A2810] bg-[#FAF5EE] shadow-xs'
                : 'border-[#EFE5D9] hover:bg-[#FAF5EE]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
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
                  <p className="text-[10px] text-[#8C7A6B]">BCA, Mandiri, GoPay, OVO, ShopeePay, DANA</p>
                </div>
              </div>
              <QrCode className="w-5 h-5 text-[#4A2810]" />
            </div>

            {/* Tampilan Detail QRIS dari Admin */}
            {paymentMethod === 'qris' && (
              <div className="mt-3 pt-3 border-t border-[#E8DACB] space-y-2 text-center animate-fade-in">
                {storeConfig.qrisImage ? (
                  <div className="inline-block p-2 bg-white rounded-2xl border border-[#E8DACB] shadow-xs">
                    <img
                      src={storeConfig.qrisImage}
                      alt="QRIS Bintang Cake"
                      className="w-40 h-40 object-contain mx-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-2xl border border-[#E8DACB] text-center">
                    <QrCode className="w-12 h-12 text-[#4A2810] mx-auto mb-1 opacity-75" />
                    <span className="text-[11px] font-bold text-[#3D2314]">QRIS Resmi Bintang Cake</span>
                  </div>
                )}

                {storeConfig.qrisCode && (
                  <p className="text-[11px] font-mono text-[#5C4534] bg-white px-2 py-1 rounded-lg border border-[#E8DACB] inline-block max-w-full truncate">
                    {storeConfig.qrisCode}
                  </p>
                )}

                <p className="text-[10px] text-[#8C7A6B]">
                  Pindai QRIS di atas untuk melakukan pembayaran langsung.
                </p>
              </div>
            )}
          </div>

          {/* Pilihan 2: Transfer Bank Manual */}
          <div
            onClick={() => setPaymentMethod('transfer')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'transfer'
                ? 'border-[#4A2810] bg-[#FAF5EE] shadow-xs'
                : 'border-[#EFE5D9] hover:bg-[#FAF5EE]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="accent-[#4A2810]"
                />
                <div>
                  <span className="text-xs font-bold text-[#3D2314]">Transfer Bank Manual</span>
                  <p className="text-[10px] text-[#8C7A6B]">{storeConfig.bankName || 'BCA / Mandiri'}</p>
                </div>
              </div>
              <Building2 className="w-5 h-5 text-[#8C7A6B]" />
            </div>

            {/* Tampilan Detail Rekening Bank dari Admin */}
            {paymentMethod === 'transfer' && (
              <div className="mt-3 pt-3 border-t border-[#E8DACB] space-y-2 animate-fade-in text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E8DACB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">Bank Tujuan:</span>
                    <span className="font-bold text-[#3D2314]">{storeConfig.bankName}</span>
                    <span className="block font-mono text-xs text-[#4A2810] font-semibold mt-0.5">
                      {storeConfig.bankAccount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAccount(storeConfig.bankAccount);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E8DACB] text-[10.5px] font-bold text-[#4A2810] hover:bg-[#F3E8DA] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-[#2C6E49]" />
                        <span className="text-[#2C6E49]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-[#8C7A6B] text-center">
                  Silakan transfer tepat sesuai total tagihan ({formatIDR(grandTotal)}).
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Action Button & Validasi */}
      <div className="space-y-2.5">
        {validationError && (
          <div className="p-3 rounded-2xl bg-[#FDECE8] border border-[#F5C7B9] text-[#A03D2A] text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-[#4A2810] hover:bg-[#341A08] disabled:bg-[#8C7A6B] text-[#FFFDF9] font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#EAD1B6]" />
              <span>Memproses Pesanan...</span>
            </>
          ) : (
            <>
              <span>Lanjutkan Pemesanan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
