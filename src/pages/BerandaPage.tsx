import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Flame,
  Truck,
  Sparkles,
  MessageCircle,
  Cake,
  Cookie,
  Coffee,
  Gift,
  Palette
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCMS } from '../context/CMSContext';
import { ProductCard } from '../components/common/ProductCard';

export const BerandaPage: React.FC = () => {
  const { setActiveTab } = useNavigation();
  const { products, storeConfig } = useCMS();

  const bestSellers = products.filter((p) => p.badge === 'BEST SELLER').slice(0, 4);

  const categories = [
    { id: 'cake', label: 'Cake', icon: Cake },
    { id: 'cookies', label: 'Cookies', icon: Cookie },
    { id: 'brownies', label: 'Brownies', icon: Coffee },
    { id: 'hampers', label: 'Hampers', icon: Gift },
    { id: 'custom', label: 'Custom', icon: Palette },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#3D2314] text-[#FAF5EE] shadow-float mx-1">
        {/* Background Image with Crisp Lighting & Elegant Warm Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={storeConfig.heroImage}
            alt={storeConfig.heroTitle}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#201107] via-[#201107]/65 to-black/30" />
        </div>

        <div className="relative z-10 p-6 flex flex-col justify-end min-h-[300px]">
          {/* Sub badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE]/15 backdrop-blur-md border border-[#FAF5EE]/20 text-[#FAF5EE] text-[11px] font-semibold w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#EAD1B6]" />
            <span>{storeConfig.heroTag}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF5EE] leading-snug">
            {storeConfig.heroTitle}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#E6D3BE] font-normal leading-relaxed max-w-sm">
            {storeConfig.heroSubtitle}
          </p>

          <div className="mt-5 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('produk')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] text-[#3D2314] font-bold text-xs hover:bg-[#FAF5EE] active:scale-95 transition-all shadow-md"
            >
              Belanja Sekarang
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('profil')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF9]/15 backdrop-blur-md border border-[#FAF5EE]/30 text-[#FAF5EE] font-semibold text-xs hover:bg-[#FFFDF9]/25 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami
            </button>
          </div>
        </div>
      </section>

      {/* 2. Kategori Pilihan */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#3D2314]">
              Kategori Pilihan
            </h3>
            <p className="text-[11px] text-[#8C7A6B]">Pilih suguhan manis favorit Anda</p>
          </div>
          <button
            onClick={() => setActiveTab('produk')}
            className="text-xs font-semibold text-[#8B5E3C] hover:text-[#5C381E] flex items-center gap-0.5 transition-colors"
          >
            Lihat Semua &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab('produk')}
                className="flex flex-col items-center p-2.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm hover:shadow-md hover:border-[#D4A373] active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center group-hover:bg-[#4A2810] group-hover:text-[#FFFDFB] transition-colors">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-semibold text-[#5A4535] mt-1.5">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Flash Sale Promo Banner */}
      <section className="px-1">
        <div className="rounded-3xl p-4 bg-gradient-to-r from-[#FDECE8] via-[#FAF0EB] to-[#FCEEE9] border border-[#F5C7B9] flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A2442C] bg-[#FCD7CD] px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-wide">
              <span>{storeConfig.promoTag}</span>
            </div>
            <h4 className="font-serif font-bold text-base text-[#3D2314]">
              {storeConfig.promoTitle}
            </h4>
            <p className="text-xs text-[#7A5844] mt-1 leading-snug">
              {storeConfig.promoSubtitle}
            </p>
          </div>

          <div className="mt-3 relative z-10 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('produk')}
              className="px-3.5 py-1.5 rounded-xl bg-[#4A2810] text-white text-xs font-semibold hover:bg-[#341A08] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              Klaim Promo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium text-[#8C7A6B]">
              *S&K berlaku
            </span>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-[#F5C7B9]/30 pointer-events-none" />
        </div>
      </section>

      {/* 4. Produk Best Seller */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#3D2314]">
              Produk Best Seller
            </h3>
            <p className="text-[11px] text-[#8C7A6B]">Favorit pelanggan Bintang Cake</p>
          </div>
          <button
            onClick={() => setActiveTab('produk')}
            className="text-xs font-semibold text-[#8B5E3C] hover:text-[#5C381E] flex items-center gap-0.5"
          >
            Semua &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Mengapa Memilih Kami? */}
      <section className="px-1 py-4">
        <div className="text-center mb-4">
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#3D2314]">
            Mengapa Memilih Kami?
          </h3>
          <p className="text-[11px] text-[#8C7A6B]">
            Komitmen kualitas rasa dan kesegaran terbaik
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F4E9DC] text-[#4A2810] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#3D2314]">
                100% Bahan Premium & Halal
              </h4>
              <p className="text-[11px] text-[#7A6657] mt-0.5 leading-snug">
                Menggunakan mentega murni Wisman, cokelat couverture Belgia, dan sertifikasi Halal resmi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F4E9DC] text-[#4A2810] flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-[#A2442C]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#3D2314]">
                Freshly Baked Daily
              </h4>
              <p className="text-[11px] text-[#7A6657] mt-0.5 leading-snug">
                Semua pesanan dipanggang segar setiap subuh tanpa bahan pengawet buatan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F4E9DC] text-[#4A2810] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#3E6B48]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#3D2314]">
                Pengiriman Aman & Cepat
              </h4>
              <p className="text-[11px] text-[#7A6657] mt-0.5 leading-snug">
                Kemasan rigid box kokoh dengan pendingin aman untuk pengiriman instan se-Jabodetabek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonial Snippet */}
      <section className="px-1">
        <div className="p-4 rounded-3xl bg-[#F7EFE6] border border-[#E8DACB]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm text-[#3D2314]">
              Cerita Pelanggan
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAD1B6] text-[#4A2810]">
              Demo
            </span>
          </div>
          <p className="text-xs text-[#5C4534] italic leading-relaxed">
            &ldquo;Nastar Wismannya bener-bener lumer di lidah! Selai nanasnya asam manis pas, wangi butternya mewah banget.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-[#4A2810] text-white text-[10px] font-bold flex items-center justify-center">
              AR
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#3D2314] leading-none">Anisa Rahma</p>
              <p className="text-[9.5px] text-[#8C7A6B]">Jakarta Selatan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Consultation Call to Action */}
      <section className="px-1">
        <div className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A2810] text-[#FAF5EE] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#3D2314]">
                Butuh Konsultasi Kue?
              </h4>
              <p className="text-[10.5px] text-[#7A6657] leading-snug">
                Admin siap membantu pesanan kustom &amp; hampers
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profil')}
            className="px-3 py-2 rounded-xl bg-[#4A2810] text-[#FAF5EE] text-xs font-bold hover:bg-[#341A08] active:scale-95 transition-all shrink-0 flex items-center gap-1"
          >
            Chat
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
