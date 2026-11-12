import React from 'react';
import { Home, CakeSlice, ShoppingBag, User } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { NavTab } from '../../types';

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();
  const { totalItems } = useCart();

  const navItems: NavItemConfig[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'produk',
      label: 'Produk',
      icon: CakeSlice,
    },
    {
      id: 'keranjang',
      label: 'Keranjang',
      icon: ShoppingBag,
      showBadge: true,
    },
    {
      id: 'profil',
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-lg border-t border-[#EBDCCF] shadow-nav transition-all"
      aria-label="Navigasi Utama"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      <div className="max-w-md mx-auto px-3 pt-2 pb-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Scroll to top when changing tab
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6244]/40 ${
                isActive
                  ? 'text-[#4A2810]'
                  : 'text-[#8C7A6B] hover:text-[#5A3820]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active pill background effect */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-[#4A2810] transition-all" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center p-1">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 stroke-[2.4] text-[#4A2810]'
                      : 'stroke-[1.8] group-hover:scale-105'
                  }`}
                />

                {/* Live Badge for Keranjang */}
                {item.showBadge && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#B85D43] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-all ${
                  isActive
                    ? 'font-bold text-[#4A2810]'
                    : 'text-[#7D6B5D]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
