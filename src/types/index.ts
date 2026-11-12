export type NavTab = 'beranda' | 'produk' | 'keranjang' | 'profil';

export interface Product {
  id: string;
  name: string;
  category: 'cake' | 'cookies' | 'brownies' | 'hampers' | 'custom';
  packageType?: string;
  price: number;
  rating: number;
  reviewCount: number | string;
  badge?: 'BEST SELLER' | 'NEW ARRIVAL' | 'SPECIAL GIFT' | 'CUSTOM' | 'PROMO';
  image: string;
  description?: string;
  sizes?: { name: string; portion: string; price: number }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  packageType?: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  note?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl: string;
  memberTier: string;
  points: number;
}
