import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';

export const NotificationToast: React.FC = () => {
  const { lastAddedItemName, clearToast } = useCart();
  const { setActiveTab } = useNavigation();

  useEffect(() => {
    if (lastAddedItemName) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItemName, clearToast]);

  if (!lastAddedItemName) return null;

  return (
    <aside
      aria-label="Pemberitahuan Keranjang"
      className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-bounce-subtle"
    >
      <div className="bg-[#4A2810] text-[#FFFDF9] px-4 py-3 rounded-2xl shadow-float flex items-center justify-between border border-[#D4A373]/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFFDF9]/10 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-[#FAF5EE] line-clamp-1">
              {lastAddedItemName}
            </p>
            <p className="text-[#CBB296] text-[11px]">
              Ditambahkan ke keranjang
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            clearToast();
            setActiveTab('keranjang');
          }}
          className="flex items-center gap-1 text-xs font-bold text-[#EAD1B6] hover:text-white px-2.5 py-1.5 rounded-xl bg-[#FFFDF9]/10 hover:bg-[#FFFDF9]/20 transition-all shrink-0"
        >
          Lihat
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
