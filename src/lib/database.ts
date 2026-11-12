import { supabase, isSupabaseConfigured } from './supabase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryMode: 'pickup' | 'courier';
  scheduleTime?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    note?: string;
  }[];
}

/**
 * Mengambil daftar produk dari database Supabase.
 * Menggunakan fallback otomatis ke data lokal jika tabel belum dibuat atau belum ada data.
 */
export async function fetchProducts(): Promise<{ products: Product[]; fromSupabase: boolean }> {
  if (!isSupabaseConfigured()) {
    return { products: INITIAL_PRODUCTS, fromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Menggunakan fallback data lokal. Info Supabase:', error?.message);
      return { products: INITIAL_PRODUCTS, fromSupabase: false };
    }

    const mappedProducts: Product[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category_id as any,
      packageType: item.package_type,
      price: Number(item.price),
      rating: Number(item.rating || 5.0),
      reviewCount: item.review_count || '0',
      badge: item.badge,
      image: item.image_url,
      description: item.description,
      sizes: item.sizes,
    }));

    return { products: mappedProducts, fromSupabase: true };
  } catch (err) {
    console.warn('Gagal fetch dari Supabase:', err);
    return { products: INITIAL_PRODUCTS, fromSupabase: false };
  }
}

/**
 * Menyimpan pesanan baru (Checkout) secara otomatis ke Supabase (tabel orders & order_items).
 */
export async function pushOrderToSupabase(payload: CreateOrderPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Kredensial Supabase belum dikonfigurasi.' };
  }

  try {
    // 1. Simpan data header pesanan ke tabel orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        delivery_mode: payload.deliveryMode,
        schedule_time: payload.scheduleTime,
        delivery_address: payload.deliveryAddress,
        subtotal: payload.subtotal,
        discount: payload.discount,
        total_amount: payload.totalAmount,
        coupon_code: payload.couponCode,
        payment_method: payload.paymentMethod,
        notes: payload.notes,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || 'Gagal menyimpan pesanan');
    }

    const orderId = orderData.id;

    // 2. Simpan rincian item ke tabel order_items
    const orderItemsRows = payload.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      quantity: item.quantity,
      selected_size: item.selectedSize,
      note: item.note,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsRows);

    if (itemsError) {
      console.warn('Pesanan tersimpan tapi item gagal:', itemsError.message);
    }

    return { success: true, orderId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan pesanan';
    return { success: false, error: message };
  }
}
