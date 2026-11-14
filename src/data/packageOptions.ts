export interface CookiePackageOption {
  id: string;
  name: string;
  styleId: 'minipack' | 'ekopack' | 'mika' | 'kaca';
  styleName: string;
  weight: string;
  portion: string;
  price: number;
  badge?: string;
  image: string;
}

export interface PackagingStyleShowcase {
  id: 'minipack' | 'ekopack' | 'mika' | 'kaca';
  title: string;
  subtitle: string;
  weights: string;
  badge: string;
  image: string;
  description: string;
}

export const DEFAULT_PACKAGING_IMAGES = {
  minipack: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
  ekopack: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80',
  mika: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
  kaca: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
};

// 4 Gaya Kemasan Utama untuk Galeri Kemasan
export function getPackagingStylesShowcase(
  packagingImages?: { minipack?: string; ekopack?: string; mika?: string; kaca?: string },
  productImageFallback?: string
): PackagingStyleShowcase[] {
  const fallback = productImageFallback || DEFAULT_PACKAGING_IMAGES.mika;
  const imgs = {
    minipack: packagingImages?.minipack || DEFAULT_PACKAGING_IMAGES.minipack,
    ekopack: packagingImages?.ekopack || DEFAULT_PACKAGING_IMAGES.ekopack,
    mika: packagingImages?.mika || fallback,
    kaca: packagingImages?.kaca || DEFAULT_PACKAGING_IMAGES.kaca,
  };

  return [
    {
      id: 'minipack',
      title: 'Minipack Pouch',
      subtitle: 'Pouch Mini Zipper',
      weights: '150 gr',
      badge: 'Hemat & Praktis',
      image: imgs.minipack || fallback,
      description: 'Kemasan pouch mini ziplock praktis, pas untuk camilan santai sendiri tanpa takut mlempem.'
    },
    {
      id: 'ekopack',
      title: 'Ekopack Pouch',
      subtitle: 'Standing Pouch Eco',
      weights: '200 gr',
      badge: 'Ekonomis',
      image: imgs.ekopack || fallback,
      description: 'Standing pouch ramah lingkungan dengan jendela transparan, harga lebih hemat isi tetap melimpah.'
    },
    {
      id: 'mika',
      title: 'Toples Mika Ulir',
      subtitle: 'Toples Kristal Ulir',
      weights: '200g - 1000g (5 Pilihan)',
      badge: 'Best Seller',
      image: imgs.mika || fallback,
      description: 'Toples mika ulir tebal kedap udara dengan segel emas khas Bintang Cake, menjaga kerenyahan Wijsman lebih tahan lama.'
    },
    {
      id: 'kaca',
      title: 'Toples Kaca Mewah',
      subtitle: 'Jar Kaca Kedap Udara',
      weights: '150 gr',
      badge: 'Hadiah & Hampers',
      image: imgs.kaca || fallback,
      description: 'Toples kaca bening tebal eksklusif dengan tutup kedap udara elegan. Sangat mewah untuk hadiah, bingkisan, dan hampers.'
    }
  ];
}

/**
 * Menghasilkan 8 pilihan kemasan & harga untuk kategori Cookies & Lidah Kucing.
 * Mengutamakan harga & gambar khusus produk (per-product packaging images) jika telah diatur.
 */
export function getCookiePackageOptions(
  basePrice: number,
  customSizes?: { name: string; portion?: string; price: number; image?: string }[],
  packagingImages?: { minipack?: string; ekopack?: string; mika?: string; kaca?: string },
  productImageFallback?: string
): CookiePackageOption[] {
  const round1000 = (val: number) => Math.round(val / 1000) * 1000;
  const fallback = productImageFallback || DEFAULT_PACKAGING_IMAGES.mika;
  const imgs = {
    minipack: packagingImages?.minipack || DEFAULT_PACKAGING_IMAGES.minipack,
    ekopack: packagingImages?.ekopack || DEFAULT_PACKAGING_IMAGES.ekopack,
    mika: packagingImages?.mika || fallback,
    kaca: packagingImages?.kaca || DEFAULT_PACKAGING_IMAGES.kaca,
  };

  // Helper untuk mencari harga kustom jika telah diinput oleh admin
  const getCustomPrice = (pkgName: string, calculatedFallback: number): number => {
    if (!customSizes || customSizes.length === 0) return calculatedFallback;
    const found = customSizes.find((s) => s.name.toLowerCase().trim() === pkgName.toLowerCase().trim());
    return found && found.price > 0 ? found.price : calculatedFallback;
  };

  // Helper untuk mencari gambar kustom per ukuran jika ada
  const getCustomImage = (pkgName: string, defaultImg: string): string => {
    if (!customSizes || customSizes.length === 0) return defaultImg;
    const found = customSizes.find((s) => s.name.toLowerCase().trim() === pkgName.toLowerCase().trim());
    return found && found.image ? found.image : defaultImg;
  };

  return [
    {
      id: 'minipack-150',
      name: 'Minipack 150 gr',
      styleId: 'minipack',
      styleName: 'Minipack Pouch',
      weight: '150 gr',
      portion: 'Pouch zipper mini praktis • Camilan santai',
      price: getCustomPrice('Minipack 150 gr', round1000(basePrice * 0.78)),
      badge: 'Hemat',
      image: getCustomImage('Minipack 150 gr', imgs.minipack)
    },
    {
      id: 'ekopack-200',
      name: 'Ekopack 200 gr',
      styleId: 'ekopack',
      styleName: 'Ekopack Pouch',
      weight: '200 gr',
      portion: 'Standing pouch eco ziplock • Ramah kantong',
      price: getCustomPrice('Ekopack 200 gr', round1000(basePrice * 0.93)),
      badge: 'Ekonomis',
      image: getCustomImage('Ekopack 200 gr', imgs.ekopack)
    },
    {
      id: 'mika-200',
      name: 'Toples Mika Ulir 200 gr',
      styleId: 'mika',
      styleName: 'Toples Mika Ulir',
      weight: '200 gr',
      portion: 'Toples mika ulir kedap udara • Paling favorit',
      price: getCustomPrice('Toples Mika Ulir 200 gr', basePrice),
      badge: 'Best Seller',
      image: getCustomImage('Toples Mika Ulir 200 gr', imgs.mika)
    },
    {
      id: 'mika-250',
      name: 'Toples Mika Ulir 250 gr',
      styleId: 'mika',
      styleName: 'Toples Mika Ulir',
      weight: '250 gr',
      portion: 'Toples mika ulir sedang • Santai keluarga',
      price: getCustomPrice('Toples Mika Ulir 250 gr', round1000(basePrice * 1.22)),
      badge: 'Populer',
      image: getCustomImage('Toples Mika Ulir 250 gr', imgs.mika)
    },
    {
      id: 'mika-350',
      name: 'Toples Mika Ulir 350 gr',
      styleId: 'mika',
      styleName: 'Toples Mika Ulir',
      weight: '350 gr',
      portion: 'Toples mika ulir besar • Suguhan meja tamu',
      price: getCustomPrice('Toples Mika Ulir 350 gr', round1000(basePrice * 1.67)),
      badge: 'Favorit',
      image: getCustomImage('Toples Mika Ulir 350 gr', imgs.mika)
    },
    {
      id: 'mika-500',
      name: 'Toples Mika Ulir 500 gr',
      styleId: 'mika',
      styleName: 'Toples Mika Ulir',
      weight: '500 gr',
      portion: 'Toples mika ulir setengah kilo • Puas bersama',
      price: getCustomPrice('Toples Mika Ulir 500 gr', round1000(basePrice * 2.33)),
      badge: 'Setengah Kilo',
      image: getCustomImage('Toples Mika Ulir 500 gr', imgs.mika)
    },
    {
      id: 'mika-1000',
      name: 'Toples Mika Ulir 1000 gr',
      styleId: 'mika',
      styleName: 'Toples Mika Ulir',
      weight: '1000 gr (1 Kg)',
      portion: 'Toples mika ulir jumbo 1 kg • Hemat pesta & hari raya',
      price: getCustomPrice('Toples Mika Ulir 1000 gr', round1000(basePrice * 4.33)),
      badge: 'Jumbo 1 Kg',
      image: getCustomImage('Toples Mika Ulir 1000 gr', imgs.mika)
    },
    {
      id: 'kaca-150',
      name: 'Toples Kaca 150 gr',
      styleId: 'kaca',
      styleName: 'Toples Kaca Mewah',
      weight: '150 gr',
      portion: 'Toples kaca tebal mewah • Elegan untuk bingkisan/hadiah',
      price: getCustomPrice('Toples Kaca 150 gr', round1000(basePrice * 1.05)),
      badge: 'Toples Kaca Mewah',
      image: getCustomImage('Toples Kaca 150 gr', imgs.kaca)
    }
  ];
}
