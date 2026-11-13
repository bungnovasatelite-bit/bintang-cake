import React, { useMemo } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CartProvider } from './context/CartContext';
import { CMSProvider, useCMS } from './context/CMSContext';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { MobileContainer } from './components/layout/MobileContainer';
import { NotificationToast } from './components/feedback/NotificationToast';
import { DetailProdukModal } from './pages/DetailProdukModal';
import { CMSModal } from './components/cms/CMSModal';
import { BerandaPage } from './pages/BerandaPage';
import { ProdukPage } from './pages/ProdukPage';
import { KeranjangPage } from './pages/KeranjangPage';
import { ProfilPage } from './pages/ProfilPage';
import { BrandLogo } from './components/icons/BrandLogo';

const MainContent: React.FC = () => {
  const { activeTab } = useNavigation();
  const { storeConfig, isInitialLoading } = useCMS();

  // Dinamisasi Tipografi & Font Styles
  const fontStyles = useMemo(() => {
    let family = "'Playfair Display', Georgia, serif";
    if (storeConfig.fontFamily === 'sans') {
      family = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    } else if (storeConfig.fontFamily === 'serif') {
      family = "'Merriweather', Georgia, serif";
    } else if (storeConfig.fontFamily === 'classic') {
      family = "'Cinzel', 'Playfair Display', serif";
    }

    const weightMap: Record<string, string> = {
      normal: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    };
    const weight = weightMap[storeConfig.fontWeight || 'normal'] || '600';
    const style = storeConfig.fontStyle === 'italic' ? 'italic' : 'normal';

    const sizeMap: Record<string, string> = {
      normal: '100%',
      large: '105%',
      xlarge: '110%'
    };
    const sizeScale = sizeMap[storeConfig.fontSizeScale || 'normal'] || '100%';

    return {
      fontFamily: family,
      fontWeight: weight,
      fontStyle: style,
      fontSize: sizeScale,
    };
  }, [storeConfig.fontFamily, storeConfig.fontWeight, storeConfig.fontStyle, storeConfig.fontSizeScale]);

  return (
    <div className="flex-1 flex flex-col min-h-full relative">
      {/* Global Typography Injected Styles */}
      <style>{`
        :root {
          --app-font-family: ${fontStyles.fontFamily};
          --app-font-weight: ${fontStyles.fontWeight};
          --app-font-style: ${fontStyles.fontStyle};
          --app-font-scale: ${fontStyles.fontSize};
        }
        .font-serif {
          font-family: var(--app-font-family) !important;
          font-style: var(--app-font-style) !important;
        }
        body, #root {
          font-size: var(--app-font-scale);
        }
      `}</style>

      {/* 0. Elegant Branded Splash Loader (Mencegah kedipan data awal saat aplikasi baru dibuka) */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-50 bg-[#FAF5EE] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="flex flex-col items-center max-w-xs">
            <BrandLogo size={70} className="shadow-lg mb-3 animate-pulse" />
            <h1 className="font-serif font-bold text-xl text-[#3D2314] tracking-tight">
              {storeConfig.heroTitle || 'Bintang Cake'}
            </h1>
            <p className="text-xs text-[#8C7A6B] font-medium mt-1">
              Memuat kreasi manis &amp; data terbaru...
            </p>
            <div className="w-28 h-1 rounded-full bg-[#E8DACB] overflow-hidden mt-4">
              <div className="h-full bg-[#4A2810] rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 1. Header: Sticky, Logo & Brand Bintang Cake on left, Cart Badge on right */}
      <AppHeader />

      {/* 2. Main Content Container: Safe padding so BottomNav never obstructs content */}
      <main className="flex-1 px-3.5 pt-3.5 pb-28 transition-all duration-200 animate-fade-in">
        {activeTab === 'beranda' && <BerandaPage />}
        {activeTab === 'produk' && <ProdukPage />}
        {activeTab === 'keranjang' && <KeranjangPage />}
        {activeTab === 'profil' && <ProfilPage />}
      </main>

      {/* 3. Bottom Navigation: Fixed at bottom with safe-area and active indicators */}
      <BottomNav />

      {/* 4. Feedback & Modal Overlays */}
      <NotificationToast />
      <DetailProdukModal />
      <CMSModal />
    </div>
  );
};

export function App() {
  return (
    <CMSProvider>
      <NavigationProvider>
        <CartProvider>
          <MobileContainer>
            <MainContent />
          </MobileContainer>
        </CartProvider>
      </NavigationProvider>
    </CMSProvider>
  );
}

export default App;
