export type NavTab = 'beranda' | 'produk' | 'keranjang' | 'profil';

export type ProductCategory = 'cake' | 'cookies' | 'brownies' | 'hampers' | 'lidah-kucing' | 'custom';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  packageType?: string;
  price: number;
  rating: number;
  reviewCount: number | string;
  badge?: 'BEST SELLER' | 'NEW ARRIVAL' | 'SPECIAL GIFT' | 'CUSTOM' | 'PROMO';
  image: string;
  description?: string;
  sizes?: { name: string; portion: string; price: number; image?: string; badge?: string }[];
  packagingImages?: {
    minipack?: string;
    ekopack?: string;
    mika?: string;
    kaca?: string;
    bundar?: string;
    persegi?: string;
    hamper1?: string;
    hamper2?: string;
    hamper3?: string;
  };
  hampersOptions?: {
    id: string;
    name: string;
    portion: string;
    price: number;
    image?: string;
    badge?: string;
  }[];
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

export interface HeroSlide {
  id: string;
  image: string;
  tag?: string;
  title?: string;
  subtitle?: string;
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
