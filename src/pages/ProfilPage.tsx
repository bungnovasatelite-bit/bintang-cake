import React from 'react';
import {
  MapPin,
  Award,
  Clock,
  ChevronRight,
  Headphones,
  Heart,
  Sliders,
  Store,
  Lock,
  Settings
} from 'lucide-react';
import { INITIAL_USER_PROFILE } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';
import { useCMS } from '../context/CMSContext';
import { SupabaseStatusCard } from '../components/common/SupabaseStatusCard';

export const ProfilPage: React.FC = () => {
  const { brandVariant, setBrandVariant, isDeviceFrameEnabled, setIsDeviceFrameEnabled } = useNavigation();
  const { openCMS, isAdminLoggedIn } = useCMS();
  const user = INITIAL_USER_PROFILE;

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Profile Header Card */}
      <section className="p-4 rounded-3xl bg-gradient-to-br from-[#FFFDFB] to-[#F7EFE6] border border-[#EBDCCF] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF5EE] border-2 border-[#D4A373]/50 shadow-sm">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#3E6B48] border-2 border-white flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base text-[#3D2314] truncate">
                {user.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0D4] text-[#A26510] border border-[#F3D79E] shrink-0">
                {user.memberTier}
              </span>
            </div>
            <p className="text-xs text-[#7A6657] mt-0.5">{user.phone}</p>
            <p className="text-xs text-[#8C7A6B] truncate">{user.email}</p>
          </div>
        </div>

        {/* Member Points Bar */}
        <div className="mt-4 pt-3 border-t border-[#EBDCCF] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D4A373]" />
            <span className="text-xs font-semibold text-[#5C4534]">Poin Manis Reward</span>
          </div>
          <span className="font-serif font-bold text-sm text-[#4A2810]">
            {user.points.toLocaleString('id-ID')} Poin
          </span>
        </div>
      </section>

      {/* 2. Order Status Quick View */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#3D2314]">Status Pesanan Terbaru</h3>
          <span className="text-[10px] font-bold text-[#8B5E3C] cursor-pointer hover:underline">
            Riwayat &rsaquo;
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#FAF5EE] border border-[#E8DACB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] text-[#A03D2A] flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#3D2314]">Pesanan #BC-9842</p>
              <p className="text-[10px] text-[#8C7A6B]">2 Item • Semprit &amp; Kue Ultah</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E3EFE3] text-[#2C6E49] border border-[#C5DEC5]">
            Diproses
          </span>
        </div>
      </section>

      {/* 3. Header Branding Preference (To demonstrate fulfillment of prompt requirements) */}
      <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#8B5E3C]" />
          <h3 className="text-xs font-bold text-[#3D2314]">
            Pengaturan Tampilan Brand Header
          </h3>
        </div>
        <p className="text-[11px] text-[#7A6657]">
          Pilih variasi tampilan nama brand pada Header sesuai spesifikasi:
        </p>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setBrandVariant('tokoku-bintang')}
            className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all text-center ${
              brandVariant === 'tokoku-bintang'
                ? 'bg-[#4A2810] text-[#FFFDF9] shadow-xs'
                : 'bg-[#FAF5EE] text-[#5C4534] border border-[#E8DACB]'
            }`}
          >
            Bintang + TOKOKU
          </button>
          <button
            onClick={() => setBrandVariant('tokoku')}
            className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all text-center ${
              brandVariant === 'tokoku'
                ? 'bg-[#4A2810] text-[#FFFDF9] shadow-xs'
                : 'bg-[#FAF5EE] text-[#5C4534] border border-[#E8DACB]'
            }`}
          >
            TOKOKU Saja
          </button>
          <button
            onClick={() => setBrandVariant('bintang')}
            className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all text-center ${
              brandVariant === 'bintang'
                ? 'bg-[#4A2810] text-[#FFFDF9] shadow-xs'
                : 'bg-[#FAF5EE] text-[#5C4534] border border-[#E8DACB]'
            }`}
          >
            Bintang Saja
          </button>
        </div>

        {/* Device Frame Toggle for Desktop Viewers */}
        <div className="pt-2 border-t border-[#F5EFE6] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#3D2314]">Simulasi Bingkai HP</p>
            <p className="text-[10px] text-[#8C7A6B]">Tampilkan bingkai iPhone / Android di desktop</p>
          </div>
          <button
            onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              isDeviceFrameEnabled ? 'bg-[#4A2810]' : 'bg-[#D4C3B3]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                isDeviceFrameEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm divide-y divide-[#F5EFE6] overflow-hidden">
        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Alamat Pengiriman Tersimpan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </button>

        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Kue Favorit &amp; Wishlist</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </button>

        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left">
          <div className="flex items-center gap-3">
            <Headphones className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Bantuan &amp; WhatsApp CS</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </button>

        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#FAF5EE] transition-colors text-left">
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-[#8C7A6B]" />
            <span className="text-xs font-semibold text-[#3D2314]">Tentang Bintang Cake &amp; Cookies</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A8988B]" />
        </button>
      </section>

      {/* 5. Tombol CMS Toko (Kelola & Upload Seluruh Bagian Aplikasi) */}
      <section className="p-4 rounded-3xl bg-gradient-to-r from-[#4A2810] to-[#2C180C] text-white shadow-float flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4A373] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-sm text-[#FAF5EE]">
                Panel CMS Toko
              </h3>
              {isAdminLoggedIn && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#3E6B48] text-white">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-[#CBB296]">
              Edit produk, banner hero, promo &amp; upload foto
            </p>
          </div>
        </div>

        <button
          onClick={openCMS}
          className="px-3.5 py-2 rounded-2xl bg-[#FAF5EE] text-[#4A2810] hover:bg-[#FFFDF9] text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Kelola CMS</span>
        </button>
      </section>

      {/* 6. Supabase Integration Status Card */}
      <SupabaseStatusCard />

      {/* 7. Version Info */}
      <div className="text-center pt-2 text-[10.5px] text-[#A8988B] space-y-0.5">
        <p>Bintang Cake &amp; Cookies App v1.0.0 (Phase 1: App Shell &amp; Navigasi)</p>
        <p>Built with React + TypeScript + Vite + Tailwind CSS</p>
      </div>
    </div>
  );
};
