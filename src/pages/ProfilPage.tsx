import React from 'react';
import {
  MapPin,
  Clock,
  ChevronRight,
  Headphones,
  Heart,
  Store,
  Lock,
  Settings,
  Smartphone,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCMS } from '../context/CMSContext';
import { BrandLogo } from '../components/icons/BrandLogo';

export const ProfilPage: React.FC = () => {
  const { isDeviceFrameEnabled, setIsDeviceFrameEnabled } = useNavigation();
  const { openCMS, isAdminLoggedIn, storeConfig } = useCMS();

  const officialWaNumber = '6282158739760';

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Header Butik Bintang Cake (Bersih tanpa profil palsu) */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-[#FFFDFB] via-[#FAF5EE] to-[#F5EFE6] border border-[#EBDCCF] shadow-sm text-center space-y-3">
        <div className="flex flex-col items-center justify-center">
          <BrandLogo size={60} className="shadow-md mb-2" />
          <h2 className="font-serif font-bold text-lg text-[#3D2314]">
            Bintang Cake &amp; Cookies
          </h2>
          <p className="text-xs text-[#8B6244] font-medium tracking-wide">
            Artisan Cake, Brownies &amp; Wijsman Butter Cookies
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EFE3] text-[#2C6E49] border border-[#C5DEC5] text-[10.5px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#2C6E49] animate-pulse" />
          <span>Butik Buka • Melayani Pesanan</span>
        </div>
      </section>

      {/* 2. Customer Service & Kontak Resmi WhatsApp */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#8B5E3C]" />
            <h3 className="text-xs font-bold text-[#3D2314]">Layanan Pelanggan Resmi</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#4A2810]">
            Fast Response
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E8DACB] flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#3D2314]">WhatsApp Bintang Cake</p>
            <p className="text-[11px] font-mono text-[#4A2810] font-semibold mt-0.5">
              0821-5873-9760
            </p>
            <p className="text-[10px] text-[#8C7A6B] mt-0.5">
              Konsultasi kue ulang tahun, hampers &amp; konfirmasi transfer
            </p>
          </div>

          <a
            href={`https://wa.me/${officialWaNumber}?text=Halo%20Bintang%20Cake,%20saya%20ingin%20bertanya%20seputar%20produk%20dan%20pemesanan.`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat CS</span>
          </a>
        </div>
      </section>

      {/* 3. Jam Operasional & Pengambilan */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#3D2314]">
          <Clock className="w-4 h-4 text-[#8B5E3C]" />
          <span>Jam Operasional &amp; Pengambilan</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#FAF5EE] border border-[#E8DACB] text-xs text-[#5C4534] space-y-1">
          <div className="flex justify-between">
            <span>Senin - Sabtu</span>
            <span className="font-bold text-[#3D2314]">{storeConfig.boutiqueHours || '09:00 - 20:00 WITA'}</span>
          </div>
          <div className="flex justify-between">
            <span>Minggu / Hari Libur</span>
            <span className="font-bold text-[#3D2314]">10:00 - 18:00 WITA</span>
          </div>
        </div>
      </section>

      {/* 4. Menu Informasi & Bantuan */}
      <section className="rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm divide-y divide-[#F5EFE6] overflow-hidden">
        <a
          href={`https://wa.me/${officialWaNumber}?text=Halo%20Bintang%20Cake,%20saya%20ingin%20tanya%20alamat%20lokasi%20pengambilan.`}
          target="_blank"
          rel="noreferrer"
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Alamat &amp; Panduan Rute Butik</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </a>

        <a
          href={`https://wa.me/${officialWaNumber}?text=Halo%20Bintang%20Cake,%20saya%20ingin%20konsultasi%20kue%20custom%20atau%20hampers.`}
          target="_blank"
          rel="noreferrer"
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Pesanan Kustom &amp; Bingkisan Hari Raya</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </a>

        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-[#8C7A6B]" />
            <div>
              <span className="text-xs font-semibold text-[#3D2314] block">Jaminan Kualitas Wijsman</span>
              <span className="text-[10px] text-[#8C7A6B]">100% bahan premium tanpa bahan pengawet buatan</span>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
        </div>
      </section>

      {/* 5. Tampilan Responsif HP/Desktop */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-[#8B5E3C]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#3D2314]">Simulasi Bingkai HP</p>
            <p className="text-[10px] text-[#8C7A6B]">Tampilkan bingkai iPhone di layar komputer</p>
          </div>
        </div>
        <button
          onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
            isDeviceFrameEnabled ? 'bg-[#4A2810]' : 'bg-[#D4C3B3]'
          }`}
          aria-label="Toggle device frame"
        >
          <span
            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              isDeviceFrameEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      {/* 6. Panel CMS Toko (Khusus Pengelola Toko) */}
      <section className="p-4 rounded-3xl bg-gradient-to-r from-[#4A2810] to-[#2C180C] text-white shadow-float flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4A373] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-sm text-[#FAF5EE]">
                Panel CMS Pengelola
              </h3>
              {isAdminLoggedIn && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#3E6B48] text-white">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-[#CBB296]">
              Kelola produk, banner hero, pesanan &amp; QRIS
            </p>
          </div>
        </div>

        <button
          onClick={openCMS}
          className="px-3.5 py-2 rounded-2xl bg-[#FAF5EE] text-[#4A2810] hover:bg-[#FFFDF9] text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Kelola CMS</span>
        </button>
      </section>

      {/* 7. Footer Version */}
      <div className="text-center pt-2 text-[10.5px] text-[#A8988B] space-y-0.5">
        <p>Bintang Cake &amp; Cookies • Mobile Artisan Bakery</p>
      </div>
    </div>
  );
};
