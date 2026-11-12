import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validasi keamanan: Pastikan service_role key tidak digunakan di frontend.
 */
function isServiceRoleKey(key?: string): boolean {
  if (!key) return false;
  // Memeriksa jika ada indikasi nama atau payload service_role
  if (key.toLowerCase().includes('service_role')) return true;
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.role === 'service_role') return true;
    }
  } catch {
    // Abaikan error parsing jika bukan format JWT
  }
  return false;
}

if (isServiceRoleKey(supabaseAnonKey)) {
  console.error(
    '🚨 [SECURITY WARNING] Terdeteksi service_role key di VITE_SUPABASE_ANON_KEY! ' +
    'Service role key memiliki akses penuh melewati Row Level Security (RLS) dan TIDAK BOLEH ' +
    'ditaruh di aplikasi frontend client. Harap segera ganti dengan anon/public key di file .env.'
  );
}

/**
 * Memeriksa apakah kredensial Supabase sudah dikonfigurasi dengan benar di environment variables.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('...')
  );
};

/**
 * Inisialisasi Supabase Client.
 * Menggunakan fallback yang aman jika env belum diatur agar aplikasi tidak crash saat pertama kali dibuka.
 */
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface SupabaseHealthCheckResult {
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
  url?: string;
  latencyMs?: number;
}

/**
 * Menguji koneksi ke Supabase tanpa membuat tabel atau query ke database tabel.
 * Menggunakan pemeriksaan session auth bawaan Supabase client untuk menguji konektivitas endpoint.
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Kredensial Supabase belum diisi pada file .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).',
      url: supabaseUrl || undefined,
    };
  }

  if (isServiceRoleKey(supabaseAnonKey)) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Keamanan ditolak: service_role key terdeteksi. Gunakan anon public key.',
      url: supabaseUrl,
    };
  }

  const startTime = performance.now();

  try {
    // Uji koneksi ringan ke endpoint Supabase Auth (tidak memerlukan tabel database)
    const { error } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        message: `Gagal terhubung ke Supabase: ${error.message}`,
        url: supabaseUrl,
        latencyMs,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      message: 'Berhasil terhubung ke Supabase!',
      url: supabaseUrl,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan tidak diketahui';
    return {
      isConfigured: true,
      isConnected: false,
      message: `Error koneksi: ${errorMsg}`,
      url: supabaseUrl,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }
}
