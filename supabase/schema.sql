-- =============================================================================
-- Bintang Cake & Cookies - Supabase Database Schema & Initial Seed
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

-- 3. Tabel Pesanan (Orders)
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

-- 4. Tabel Detail Item Pesanan (Order Items)
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
-- Row Level Security (RLS) - Keamanan Data Publik & Pelanggan
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Siapa saja boleh melihat kategori & produk
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

-- Kebijakan Akses: Siapa saja boleh membuat pesanan (Checkout Frontend)
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
CREATE POLICY "Public can read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

-- =============================================================================
-- Seed Data Awal (Kategori & Produk Bintang Cake & Cookies)
-- =============================================================================

INSERT INTO public.categories (id, name, description, icon) VALUES
('cake', 'Cake', 'Aneka kue bolu dan kue tart lembut artisan', 'Cake'),
('cookies', 'Cookies', 'Kue kering mentega Wijsman renyah dan gurih', 'Cookie'),
('brownies', 'Brownies', 'Fudgy brownies dengan aneka topping premium', 'Coffee'),
('hampers', 'Hampers', 'Paket bingkisan mewah untuk hari raya dan momen spesial', 'Gift'),
('custom', 'Custom', 'Kue kustom pesanan khusus hari ulang tahun dan perayaan', 'Palette')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.products (id, name, category_id, package_type, price, rating, review_count, badge, image_url, description, sizes) VALUES
('prod-1', 'Palm Cookies', 'cookies', 'TOPLES MIKA ULIR 200 GR', 45000, 4.9, '128', 'BEST SELLER', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', 'Kue kering renyah dengan balutan palm sugar premium yang harum karamel alami dan gurih mentega Wijsman.', null),
('prod-2', 'Kaastengels', 'cookies', 'TOPLES MIKA ULIR 200 GR', 55000, 4.8, '94', 'NEW ARRIVAL', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', 'Kastengel gurih klasik menggunakan keju Edam tua dan taburan keju Cheddar melimpah yang dipanggang renyah keemasan.', null),
('prod-3', 'Chocho Almond', 'cookies', 'KUE KERING', 50000, 5.0, '210', 'BEST SELLER', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Perpaduan dark chocolate Belgia pekat dengan taburan roasted almond slice yang renyah dan tidak terlalu manis.', null),
('prod-4', 'Brownies Mix Med', 'brownies', 'BROWNIES', 60000, 4.8, '88', null, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 'Fudgy brownies dengan aneka topping: almond, keju parut, choco chips, dan lotus biscoff dalam satu loyang.', null),
('prod-5', 'Bread Pudding', 'cake', 'CAKE', 65000, 5.0, '65', null, 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80', 'Puding roti panggang lembut beraroma kayu manis, kismis, dan keju dengan custard vanilla lembut.', null),
('prod-6', 'Choco Chip Cookies', 'cookies', 'COOKIES', 95000, 4.9, '112', null, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', 'Cookies mentega berbutir choco chip leleh melimpah, renyah di tepi dan lembut gurih di bagian tengah.', null),
('prod-7', 'Bingkisan Spesial B', 'hampers', 'HAMPERS', 280000, 5.0, '48', 'SPECIAL GIFT', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', 'Paket hampers eksklusif berisi 3 toples kue kering pilihan, kartu ucapan gold foil, dan kotak pita satin mewah.', null),
('prod-8', 'Vanilla Cheese Cake', 'cake', 'KUE ULTAH / CAKE', 150000, 4.9, '128', 'BEST SELLER', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80', 'Vanilla Cheese Cake merupakan kue dengan perpaduan cita rasa keju yang creamy dan aroma vanilla yang harum.', '[{"name":"Diameter 16 cm","portion":"Ideal untuk pesta intim (4–6 porsi)","price":150000},{"name":"Diameter 20 cm","portion":"Keluarga & teman (8–12 porsi)","price":250000},{"name":"Diameter 24 cm","portion":"Pesta akbar (16–20 porsi)","price":350000}]'::jsonb),
('prod-9', 'Custom Birthday Cake', 'custom', 'CAKE', 400000, 4.9, '176', 'CUSTOM', 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=600&q=80', 'Kue ulang tahun kustom artisan dengan desain elegan, hiasan cokelat leleh, macaron, dan topper khusus sesuai permintaan.', null),
('prod-10', 'Nastar Klasik Wisman', 'cookies', 'TOPLES MIKA ULIR 200 GR', 50000, 5.0, '240+', 'BEST SELLER', 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80', 'Nastar lumer di lidah dengan selai nanas madu asli yang dimasak perlahan hingga legit beraroma rempah wangi.', null),
('prod-11', 'Sagu Keju Lumer', 'cookies', 'TOPLES MIKA ULIR 200 GR', 40000, 5.0, '680+', 'BEST SELLER', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80', 'Kue sagu keju renyah seketika meleleh di mulut dengan semerbak aroma santan sangrai dan keju panggang gurih.', null),
('prod-12', 'Lapis Legit Premium', 'cake', 'UKURAN 18X18 CM', 375000, 4.8, '95', null, 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80', 'Lapis legit warisan resep otentik dengan puluhan lapis tipis kuning telur dan mentega Wijsman murni.', null)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    package_type = EXCLUDED.package_type,
    price = EXCLUDED.price,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    badge = EXCLUDED.badge,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    sizes = EXCLUDED.sizes;
