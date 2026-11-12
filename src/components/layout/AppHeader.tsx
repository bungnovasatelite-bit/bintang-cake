import React from 'react';
import { ShoppingBag, Search, User, ShieldCheck } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useCMS } from '../../context/CMSContext';
import { BrandLogo } from '../icons/BrandLogo';

export const AppHeader: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();
  const { totalItems } = useCart();
  const { openCMS, isAdminLoggedIn } = useCMS();

  // Tab subtext in uppercase matching screenshot
  const tabSubtitleMap: Record<string, string> = {
    beranda: 'BERANDA',
    produk: 'KATALOG',
    keranjang: 'KERANJANG',
    profil: 'PROFIL'
  };

  const currentSubtitle = tabSubtitleMap[activeTab] || 'BERANDA';

  // Tampilan brand header hanya "Bintang Cake" sesuai permintaan
  const renderBrandText = () => {
    return (
      <div className="flex flex-col">
        <h1 className="font-serif font-bold text-base sm:text-lg text-[#3D2314] tracking-tight leading-none whitespace-nowrap">
          Bintang Cake
        </h1>
        <p className="text-[10px] tracking-widest font-bold text-[#8B6244] uppercase mt-1">
          {currentSubtitle}
        </p>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF5EE]/95 backdrop-blur-md border-b border-[#EAD1B6]/40 transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand Logo & Name */}
        <button
          onClick={() => setActiveTab('beranda')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6244]/40 rounded-xl transition-transform active:scale-[0.98]"
          aria-label="Kembali ke Beranda"
        >
          <BrandLogo size={36} className="shadow-sm group-hover:scale-105 transition-transform" />
          {renderBrandText()}
        </button>

        {/* Right: Actions (CMS, Search, Cart with Live Badge, Profile) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick CMS Trigger Button */}
          <button
            onClick={openCMS}
            className={`p-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              isAdminLoggedIn
                ? 'bg-[#4A2810] text-[#FAF5EE] shadow-xs'
                : 'text-[#8C7A6B] hover:text-[#4A2810] hover:bg-[#F3E8DA]'
            }`}
            aria-label="Panel CMS Admin"
            title="Panel CMS Admin (user: bintang)"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            <span className="hidden sm:inline text-[10px]">CMS</span>
          </button>

          {/* Search Button -> navigates to Produk / Search */}
          <button
            onClick={() => setActiveTab('produk')}
            className={`p-2 rounded-full text-[#4A2810] hover:bg-[#F3E8DA]/80 transition-colors ${
              activeTab === 'produk' ? 'bg-[#F3E8DA] text-[#3D2314]' : ''
            }`}
            aria-label="Cari Produk"
            title="Cari Produk"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Cart Icon with Live Item Badge */}
          <button
            onClick={() => setActiveTab('keranjang')}
            className={`relative p-2 rounded-full text-[#4A2810] hover:bg-[#F3E8DA]/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6244]/40 ${
              activeTab === 'keranjang' ? 'bg-[#F3E8DA] text-[#3D2314]' : ''
            }`}
            aria-label={`Keranjang belanja, ${totalItems} item`}
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B85D43] text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse-subtle">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User Profile Avatar shortcut */}
          <button
            onClick={() => setActiveTab('profil')}
            className={`p-1 rounded-full border transition-all ${
              activeTab === 'profil'
                ? 'border-[#4A2810] ring-2 ring-[#4A2810]/20'
                : 'border-transparent hover:border-[#D4A373]'
            }`}
            aria-label="Profil Pengguna"
            title="Profil Pengguna"
          >
            <div className="w-7 h-7 rounded-full bg-[#4A2810] text-[#FAF5EE] flex items-center justify-center font-bold text-xs shadow-inner">
              <User className="w-4 h-4 text-[#FAF5EE]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
