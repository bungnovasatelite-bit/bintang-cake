import { supabase, isSupabaseConfigured } from './supabase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

export interface OrderItemRecord {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  note?: string;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryMode: 'pickup' | 'courier';
  scheduleTime?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  items: OrderItemRecord[];
}

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
  items: OrderItemRecord[];
}

// Daftar pesanan awal kosong (hanya pesanan asli dari calon pembeli yang akan dicatat)
const INITIAL_SAMPLE_ORDERS: OrderRecord[] = [];

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
    console.warn('Gagal fetch produk dari Supabase:', err);
    return { products: INITIAL_PRODUCTS, fromSupabase: false };
  }
}

/**
 * Mengambil daftar pesanan pelanggan (Khusus Admin CMS)
 */
export async function fetchOrders(): Promise<OrderRecord[]> {
  const localOrdersStr = localStorage.getItem('bintang_orders');
  let localOrders: OrderRecord[] = [];
  if (localOrdersStr) {
    try {
      const parsed: OrderRecord[] = JSON.parse(localOrdersStr);
      // Hapus pesanan dummy lama Siti Rahmawati agar tidak pernah muncul lagi
      localOrders = parsed.filter(o =>
        !o.customerName?.toLowerCase().includes('siti rahmawati') &&
        o.id !== 'BC-9842'
      );
      localStorage.setItem('bintang_orders', JSON.stringify(localOrders));
    } catch (e) {
      console.warn(e);
    }
  }

  if (!isSupabaseConfigured()) {
    return localOrders;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        delivery_mode,
        schedule_time,
        delivery_address,
        subtotal,
        discount,
        total_amount,
        payment_method,
        status,
        notes,
        created_at,
        order_items (
          product_id,
          product_name,
          price,
          quantity,
          selected_size,
          note
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: OrderRecord[] = data.map((o: any) => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryMode: o.delivery_mode,
        scheduleTime: o.schedule_time,
        deliveryAddress: o.delivery_address,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount || 0),
        totalAmount: Number(o.total_amount),
        paymentMethod: o.payment_method,
        status: o.status,
        notes: o.notes,
        createdAt: o.created_at,
        items: (o.order_items || []).map((it: any) => ({
          productId: it.product_id,
          productName: it.product_name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          selectedSize: it.selected_size,
          note: it.note,
        })),
      }));

      return mapped;
    }
  } catch (err) {
    console.warn('Gagal fetch orders dari Supabase:', err);
  }

  return localOrders;
}

/**
 * Menyimpan pesanan baru (Checkout) secara otomatis ke Supabase dan localStorage.
 */
export async function pushOrderToSupabase(payload: CreateOrderPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const generatedId = `BC-${Math.floor(1000 + Math.random() * 9000)}`;

  // Simpan selalu ke localStorage sebagai cache pesanan
  const newOrder: OrderRecord = {
    id: generatedId,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    deliveryMode: payload.deliveryMode,
    scheduleTime: payload.scheduleTime,
    deliveryAddress: payload.deliveryAddress,
    subtotal: payload.subtotal,
    discount: payload.discount,
    totalAmount: payload.totalAmount,
    paymentMethod: payload.paymentMethod,
    status: 'pending',
    notes: payload.notes,
    createdAt: new Date().toISOString(),
    items: payload.items,
  };

  try {
    const existingStr = localStorage.getItem('bintang_orders');
    const existingList: OrderRecord[] = existingStr ? JSON.parse(existingStr) : INITIAL_SAMPLE_ORDERS;
    localStorage.setItem('bintang_orders', JSON.stringify([newOrder, ...existingList]));
  } catch (e) {
    console.warn('Gagal cache pesanan ke localStorage:', e);
  }

  if (!isSupabaseConfigured()) {
    return { success: true, orderId: generatedId };
  }

  try {
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
      return { success: true, orderId: generatedId };
    }

    const orderId = orderData.id;

    const orderItemsRows = payload.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      quantity: item.quantity,
      selected_size: item.selectedSize,
      note: item.note,
    }));

    await supabase.from('order_items').insert(orderItemsRows);

    return { success: true, orderId };
  } catch (err: unknown) {
    return { success: true, orderId: generatedId };
  }
}

/**
 * Update status pesanan (Khusus Admin CMS)
 */
export async function updateOrderStatusInDb(orderId: string, status: OrderRecord['status']): Promise<void> {
  try {
    const existingStr = localStorage.getItem('bintang_orders');
    if (existingStr) {
      const list: OrderRecord[] = JSON.parse(existingStr);
      const updated = list.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('bintang_orders', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn(e);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (e) {
      console.warn('Gagal update status di Supabase:', e);
    }
  }
}

/**
 * Hapus pesanan (Khusus Admin CMS)
 */
export async function deleteOrderFromDb(orderId: string): Promise<void> {
  try {
    const existingStr = localStorage.getItem('bintang_orders');
    if (existingStr) {
      const list: OrderRecord[] = JSON.parse(existingStr);
      const filtered = list.filter(o => o.id !== orderId);
      localStorage.setItem('bintang_orders', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn(e);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (e) {
      console.warn('Gagal delete order di Supabase:', e);
    }
  }
}
