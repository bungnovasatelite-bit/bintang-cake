-- =============================================================================
-- Bintang Cake & Cookies - Supabase Complete Database Schema & Initial Seed
-- Jalankan skrip ini di: https://supabase.com/dashboard/project/rkgdccccfkemerwdgsvz/sql/new
-- =============================================================================

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Produk
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    package_type TEXT,
    price NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    review_count TEXT DEFAULT '0',
    badge TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    sizes JSONB,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabel Pengaturan Toko (Sinkronisasi Logo, Hero, QRIS, & Rekening Bank Antar-Perangkat)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'bintang_store',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_mode TEXT NOT NULL, -- 'pickup' atau 'courier'
    schedule_time TEXT,
    delivery_address TEXT,
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    coupon_code TEXT,
    payment_method TEXT DEFAULT 'qris',
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabel Detail Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selected_size TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================================================
-- Row Level Security (RLS) & Hak Akses Penuh untuk Aplikasi
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Kategori
DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
CREATE POLICY "Public can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan Akses Produk (Lihat, Tambah, Edit, Hapus dari CMS)
DROP POLICY IF EXISTS "Public can manage products" ON public.products;
CREATE POLICY "Public can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan Akses Pengaturan Toko (Sinkronisasi Logo, QRIS, Bank ke Semua Device)
DROP POLICY IF EXISTS "Public can manage store_settings" ON public.store_settings;
CREATE POLICY "Public can manage store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan Akses Pesanan
DROP POLICY IF EXISTS "Public can manage orders" ON public.orders;
CREATE POLICY "Public can manage orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage order items" ON public.order_items;
CREATE POLICY "Public can manage order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- Seed Data Awal (Kategori & Produk Bintang Cake & Cookies)
-- =============================================================================

INSERT INTO public.categories (id, name, description, icon) VALUES
('cake', 'Cake', 'Aneka kue bolu dan kue tart lembut artisan', 'Cake'),
('cookies', 'Cookies', 'Kue kering mentega Wijsman renyah dan gurih', 'Cookie'),
('brownies', 'Brownies', 'Fudgy brownies dengan aneka topping premium', 'Coffee'),
('hampers', 'Hampers', 'Paket bingkisan mewah untuk hari raya dan momen spesial', 'Gift'),
('custom', 'Custom', 'Kue kustom pesanan khusus hari ulang tahun dan perayaan', 'Palette')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Data Produk Bawaan
INSERT INTO public.products (id, name, category_id, package_type, price, rating, review_count, badge, image_url, description) VALUES
('prod-1', 'Palm Cookies', 'cookies', 'TOPLES MIKA ULIR 200 GR', 45000, 4.9, '128', 'BEST SELLER', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', 'Kue kering renyah dengan balutan palm sugar premium yang harum karamel alami dan gurih mentega Wijsman.'),
('prod-2', 'Kaastengels', 'cookies', 'TOPLES MIKA ULIR 200 GR', 55000, 4.8, '94', 'NEW ARRIVAL', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', 'Kastengel gurih klasik menggunakan keju Edam tua dan taburan keju Cheddar melimpah yang dipanggang renyah keemasan.'),
('prod-3', 'Chocho Almond', 'cookies', 'KUE KERING', 50000, 5.0, '210', 'BEST SELLER', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Perpaduan dark chocolate Belgia pekat dengan taburan roasted almond slice yang renyah dan tidak terlalu manis.'),
('prod-4', 'Brownies Mix Med', 'brownies', 'BROWNIES', 60000, 4.8, '88', 'BEST SELLER', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 'Fudgy brownies dengan aneka topping: almond, keju parut, choco chips, dan lotus biscoff dalam satu loyang.'),
('prod-5', 'Bread Pudding', 'cake', 'CAKE', 65000, 5.0, '65', 'NEW ARRIVAL', 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80', 'Puding roti panggang lembut beraroma kayu manis, kismis, dan keju dengan custard vanilla lembut.'),
('prod-6', 'Choco Chip Cookies', 'cookies', 'COOKIES', 95000, 4.9, '112', 'BEST SELLER', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', 'Cookies mentega berbutir choco chip leleh melimpah, renyah di tepi dan lembut gurih di bagian tengah.'),
('prod-7', 'Bingkisan Spesial B', 'hampers', 'HAMPERS', 280000, 5.0, '48', 'SPECIAL GIFT', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', 'Paket hampers eksklusif berisi 3 toples kue kering pilihan, kartu ucapan gold foil, dan kotak pita satin mewah.'),
('prod-8', 'Vanilla Cheese Cake', 'cake', 'KUE ULTAH / CAKE', 150000, 4.9, '128', 'BEST SELLER', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80', 'Vanilla Cheese Cake merupakan kue dengan perpaduan cita rasa keju yang creamy dan aroma vanilla yang harum.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    package_type = EXCLUDED.package_type,
    price = EXCLUDED.price,
    rating = EXCLUDED.rating,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description;
