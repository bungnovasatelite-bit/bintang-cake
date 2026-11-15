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

export interface HamperOption {
  id: string;
  name: string;
  portion: string;
  price: number;
  badge?: string;
  image: string;
}

export const DEFAULT_HAMPERS_IMAGES = {
  hamper1: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  hamper2: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  hamper3: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
};

export function getHamperPackageOptions(
  productName: string,
  basePrice: number,
  customSizes?: { name: string; portion: string; price: number; image?: string; badge?: string }[],
  packagingImages?: { hamper1?: string; hamper2?: string; hamper3?: string },
  fallbackImage?: string
): HamperOption[] {
  const isBingkisanA = productName.toLowerCase().includes('bingkisan a') || productName.toLowerCase().includes('spesial a');
  const isBingkisanB = productName.toLowerCase().includes('bingkisan b') || productName.toLowerCase().includes('spesial b');

  const fallback = fallbackImage || DEFAULT_HAMPERS_IMAGES.hamper2;
  const imgs = {
    hamper1: packagingImages?.hamper1 || DEFAULT_HAMPERS_IMAGES.hamper1,
    hamper2: packagingImages?.hamper2 || DEFAULT_HAMPERS_IMAGES.hamper2,
    hamper3: packagingImages?.hamper3 || DEFAULT_HAMPERS_IMAGES.hamper3,
  };

  if (customSizes && customSizes.length >= 3) {
    return [
      {
        id: 'hamper-1',
        name: customSizes[0].name,
        portion: customSizes[0].portion,
        price: customSizes[0].price,
        badge: customSizes[0].badge || 'Pilihan 1',
        image: customSizes[0].image || imgs.hamper1 || fallback,
      },
      {
        id: 'hamper-2',
        name: customSizes[1].name,
        portion: customSizes[1].portion,
        price: customSizes[1].price,
        badge: customSizes[1].badge || 'Pilihan 2',
        image: customSizes[1].image || imgs.hamper2 || fallback,
      },
      {
        id: 'hamper-3',
        name: customSizes[2].name,
        portion: customSizes[2].portion,
        price: customSizes[2].price,
        badge: customSizes[2].badge || 'Pilihan 3',
        image: customSizes[2].image || imgs.hamper3 || fallback,
      },
    ];
  }

  if (isBingkisanA) {
    return [
      {
        id: 'hamp-a-1',
        name: 'Paket 2 Toples Classic',
        portion: '2 Toples Cookies (Nastar Wijsman & Kastengel) + Box Cantik Pita Satin',
        price: 195000,
        badge: 'Favorit',
        image: imgs.hamper1,
      },
      {
        id: 'hamp-a-2',
        name: 'Paket 3 Toples Favorit',
        portion: '3 Toples Cookies (Nastar, Kastengel, Putri Salju) + Hardbox Mewah',
        price: 280000,
        badge: 'Best Seller',
        image: imgs.hamper2,
      },
      {
        id: 'hamp-a-3',
        name: 'Paket 4 Toples Sultan',
        portion: '4 Toples Lengkap (Nastar, Kastengel, Lidah Kucing, Sagu Keju) + Hardbox Gold',
        price: 370000,
        badge: 'Premium Exclusive',
        image: imgs.hamper3,
      },
    ];
  }

  if (isBingkisanB) {
    return [
      {
        id: 'hamp-b-1',
        name: 'Paket Manis 2 Toples',
        portion: '2 Toples Cookies (Palm Cookies & Choco Chip Butter) + Box Pita Hias',
        price: 185000,
        badge: 'Ekonomis',
        image: imgs.hamper1,
      },
      {
        id: 'hamp-b-2',
        name: 'Paket Komplit 3 Toples',
        portion: '3 Toples Cookies (Choco Chip, Peanut Cookies, Lidah Kucing) + Hardbox Elegan',
        price: 275000,
        badge: 'Best Seller',
        image: imgs.hamper2,
      },
      {
        id: 'hamp-b-3',
        name: 'Paket Mewah 4 Toples',
        portion: '4 Toples Aneka Cookies Pilihan + Greeting Card Gold Foil & Hardbox Mewah',
        price: 365000,
        badge: 'Eksklusif',
        image: imgs.hamper3,
      },
    ];
  }

  return [
    {
      id: 'hamp-gen-1',
      name: 'Paket Silver (2 Toples)',
      portion: '2 Toples Cookies Pilihan + Box Pita Eksklusif',
      price: Math.round(basePrice * 0.75 / 1000) * 1000 || 185000,
      badge: 'Pilihan 1',
      image: imgs.hamper1,
    },
    {
      id: 'hamp-gen-2',
      name: 'Paket Gold (3 Toples)',
      portion: '3 Toples Cookies Favorit + Hardbox Premium & Pita Satin',
      price: basePrice || 280000,
      badge: 'Best Seller',
      image: imgs.hamper2,
    },
    {
      id: 'hamp-gen-3',
      name: 'Paket Platinum (4 Toples)',
      portion: '4 Toples Lengkap Aneka Varian + Hadiah Khusus & Hardbox Mewah',
      price: Math.round(basePrice * 1.35 / 1000) * 1000 || 365000,
      badge: 'Eksklusif',
      image: imgs.hamper3,
    },
  ];
}
