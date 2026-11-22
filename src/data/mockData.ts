import { Product, UserProfile } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Palm Cookies',
    category: 'cookies',
    packageType: 'TOPLES MIKA ULIR 200 GR',
    price: 45000,
    rating: 4.9,
    reviewCount: 128,
    badge: 'BEST SELLER',
    image: '',
    description: 'Kue kering renyah dengan balutan palm sugar premium yang harum karamel alami dan gurih mentega Wijsman.'
  },
  {
    id: 'prod-2',
    name: 'Kaastengels',
    category: 'cookies',
    packageType: 'TOPLES MIKA ULIR 200 GR',
    price: 55000,
    rating: 4.8,
    reviewCount: 94,
    badge: 'NEW ARRIVAL',
    image: '',
    description: 'Kastengel gurih klasik menggunakan keju Edam tua dan taburan keju Cheddar melimpah yang dipanggang renyah keemasan.'
  },
  {
    id: 'prod-3',
    name: 'Chocho Almond',
    category: 'cookies',
    packageType: 'KUE KERING',
    price: 50000,
    rating: 5.0,
    reviewCount: 210,
    badge: 'BEST SELLER',
    image: '',
    description: 'Perpaduan dark chocolate Belgia pekat dengan taburan roasted almond slice yang renyah dan tidak terlalu manis.'
  },
  {
    id: 'prod-4',
    name: 'Brownies Mix Med',
    category: 'brownies',
    packageType: 'BROWNIES',
    price: 60000,
    rating: 4.8,
    reviewCount: 88,
    image: '',
    description: 'Fudgy brownies dengan aneka topping: almond, keju parut, choco chips, dan lotus biscoff dalam satu loyang.'
  },
  {
    id: 'prod-5',
    name: 'Bread Pudding',
    category: 'cake',
    packageType: 'CAKE',
    price: 65000,
    rating: 5.0,
    reviewCount: 65,
    image: '',
    description: 'Puding roti panggang lembut beraroma kayu manis, kismis, dan keju dengan custard vanilla lembut.'
  },
  {
    id: 'prod-6',
    name: 'Choco Chip Cookies',
    category: 'cookies',
    packageType: 'COOKIES',
    price: 95000,
    rating: 4.9,
    reviewCount: 112,
    image: '',
    description: 'Cookies mentega berbutir choco chip leleh melimpah, renyah di tepi dan lembut gurih di bagian tengah.'
  },
  {
    id: 'prod-hampers-a',
    name: 'Bingkisan Spesial A',
    category: 'hampers',
    packageType: 'HAMPERS EXCLUSIVE',
    price: 195000,
    rating: 5.0,
    reviewCount: 64,
    badge: 'SPECIAL GIFT',
    image: '',
    description: 'Hampers eksklusif Bingkisan A dengan box elegan dan pita satin, berisi aneka toples cookies pilihan mentega Wijsman serta kartu ucapan istimewa.',
    sizes: [
      { name: 'Paket 2 Toples Classic', portion: '2 Toples Cookies (Nastar Wijsman & Kastengel) + Box Cantik Pita Satin', price: 195000, badge: 'Favorit' },
      { name: 'Paket 3 Toples Favorit', portion: '3 Toples Cookies (Nastar, Kastengel, Putri Salju) + Hardbox Mewah', price: 280000, badge: 'Best Seller' },
      { name: 'Paket 4 Toples Sultan', portion: '4 Toples Lengkap (Nastar, Kastengel, Lidah Kucing, Sagu Keju) + Hardbox Gold', price: 370000, badge: 'Premium Exclusive' },
    ]
  },
  {
    id: 'prod-7',
    name: 'Bingkisan Spesial B',
    category: 'hampers',
    packageType: 'HAMPERS EXCLUSIVE',
    price: 185000,
    rating: 5.0,
    reviewCount: 48,
    badge: 'SPECIAL GIFT',
    image: '',
    description: 'Paket hampers eksklusif Bingkisan B berisi kombinasi toples kue kering lezat, kartu ucapan eksklusif, dan kotak kado berpita satin mewah.',
    sizes: [
      { name: 'Paket Manis 2 Toples', portion: '2 Toples Cookies (Palm Cookies & Choco Chip Butter) + Box Pita Hias', price: 185000, badge: 'Ekonomis' },
      { name: 'Paket Komplit 3 Toples', portion: '3 Toples Cookies (Choco Chip, Peanut Cookies, Lidah Kucing) + Hardbox Elegan', price: 275000, badge: 'Best Seller' },
      { name: 'Paket Mewah 4 Toples', portion: '4 Toples Aneka Cookies Pilihan + Greeting Card Gold Foil & Hardbox Mewah', price: 365000, badge: 'Eksklusif' },
    ]
  },
  {
    id: 'prod-8',
    name: 'Vanilla Cheese Cake',
    category: 'cake',
    packageType: 'KUE ULTAH / CAKE',
    price: 150000,
    rating: 4.9,
    reviewCount: 128,
    badge: 'BEST SELLER',
    image: '',
    description: 'Vanilla Cheese Cake merupakan kue dengan perpaduan cita rasa keju yang creamy dan aroma vanilla yang harum. Memiliki tekstur lembut, halus, dan gurih pas di setiap gigitan.',
    sizes: [
      { name: 'Diameter 16 cm', portion: 'Ideal untuk pesta intim (4–6 porsi)', price: 150000 },
      { name: 'Diameter 20 cm', portion: 'Keluarga & teman (8–12 porsi)', price: 250000 },
      { name: 'Diameter 24 cm', portion: 'Pesta akbar (16–20 porsi)', price: 350000 },
    ]
  },
  {
    id: 'prod-9',
    name: 'Custom Birthday Cake',
    category: 'custom',
    packageType: 'CAKE',
    price: 400000,
    rating: 4.9,
    reviewCount: 176,
    badge: 'CUSTOM',
    image: '',
    description: 'Kue ulang tahun kustom artisan dengan desain elegan, hiasan cokelat leleh, macaron, dan topper khusus sesuai permintaan.'
  },
  {
    id: 'prod-10',
    name: 'Nastar Klasik Wisman',
    category: 'cookies',
    packageType: 'TOPLES MIKA ULIR 200 GR',
    price: 50000,
    rating: 5.0,
    reviewCount: '240+',
    badge: 'BEST SELLER',
    image: '',
    description: 'Nastar lumer di lidah dengan selai nanas madu asli yang dimasak perlahan hingga legit beraroma rempah wangi.'
  },
  {
    id: 'prod-11',
    name: 'Sagu Keju Lumer',
    category: 'cookies',
    packageType: 'TOPLES MIKA ULIR 200 GR',
    price: 40000,
    rating: 5.0,
    reviewCount: '680+',
    badge: 'BEST SELLER',
    image: '',
    description: 'Kue sagu keju renyah seketika meleleh di mulut dengan semerbak aroma santan sangrai dan keju panggang gurih.'
  },
  {
    id: 'prod-lk-1',
    name: 'Lidah Kucing Keju Wijsman',
    category: 'lidah-kucing',
    packageType: 'TOPLES MIKA ULIR 200 GR',
    price: 55000,
    rating: 5.0,
    reviewCount: '190+',
    badge: 'BEST SELLER',
    image: '',
    description: 'Kue lidah kucing tipis renyah dan garing dengan taburan keju Edam Belanda dan mentega Wijsman murni.'
  },
  {
    id: 'prod-12',
    name: 'Lapis Legit Premium',
    category: 'cake',
    packageType: 'UKURAN 18X18 CM',
    price: 375000,
    rating: 4.8,
    reviewCount: 95,
    image: '',
    description: 'Lapis legit warisan resep otentik dengan puluhan lapis tipis kuning telur dan mentega Wijsman murni.'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Pelanggan Setia Bintang Cake',
  phone: '0821-5873-9760',
  email: 'info@bintangcake.com',
  address: 'Jl. Cikini Raya No. 42, Menteng, Jakarta Pusat',
  avatarUrl: '',
  memberTier: 'Pelanggan Setia',
  points: 0,
};
