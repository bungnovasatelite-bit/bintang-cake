import React, { createContext, useContext, useState } from 'react';
import { NavTab, Product } from '../types';

interface NavigationContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  brandVariant: 'tokoku-bintang' | 'bintang' | 'tokoku';
  setBrandVariant: (variant: 'tokoku-bintang' | 'bintang' | 'tokoku') => void;
  isDeviceFrameEnabled: boolean;
  setIsDeviceFrameEnabled: (enabled: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brandVariant, setBrandVariant] = useState<'tokoku-bintang' | 'bintang' | 'tokoku'>('tokoku-bintang');
  const [isDeviceFrameEnabled, setIsDeviceFrameEnabled] = useState<boolean>(false);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedProduct,
        openProductDetail,
        closeProductDetail,
        searchQuery,
        setSearchQuery,
        brandVariant,
        setBrandVariant,
        isDeviceFrameEnabled,
        setIsDeviceFrameEnabled,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
