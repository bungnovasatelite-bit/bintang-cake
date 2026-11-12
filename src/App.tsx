import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CartProvider } from './context/CartContext';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { MobileContainer } from './components/layout/MobileContainer';
import { NotificationToast } from './components/feedback/NotificationToast';
import { DetailProdukModal } from './pages/DetailProdukModal';
import { BerandaPage } from './pages/BerandaPage';
import { ProdukPage } from './pages/ProdukPage';
import { KeranjangPage } from './pages/KeranjangPage';
import { ProfilPage } from './pages/ProfilPage';

const MainContent: React.FC = () => {
  const { activeTab } = useNavigation();

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* 1. Header: Sticky, Logo & TOKOKU/Bintang on left, Cart Badge on right */}
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
    </div>
  );
};

export function App() {
  return (
    <NavigationProvider>
      <CartProvider>
        <MobileContainer>
          <MainContent />
        </MobileContainer>
      </CartProvider>
    </NavigationProvider>
  );
}

export default App;
