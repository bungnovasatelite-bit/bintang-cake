import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const savedUrl = localStorage.getItem('bintang_supabase_url');
  const savedKey = localStorage.getItem('bintang_supabase_anon_key');
  
  const url = savedUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = savedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem('bintang_supabase_url', url.trim());
  localStorage.setItem('bintang_supabase_anon_key', anonKey.trim());
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.trim() !== '' &&
    anonKey.trim() !== '' &&
    !url.includes('your-project-id') &&
    !anonKey.includes('...')
  );
}

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

const { url: currentUrl, anonKey: currentKey } = getSupabaseCredentials();

export let supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? currentUrl : fallbackUrl,
  isSupabaseConfigured() ? currentKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function reinitSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  supabase = createClient(
    isSupabaseConfigured() ? url : fallbackUrl,
    isSupabaseConfigured() ? anonKey : fallbackKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
  return supabase;
}

export interface SupabaseHealthCheckResult {
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
  url?: string;
  latencyMs?: number;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const { url } = getSupabaseCredentials();
  
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Kredensial Supabase belum diisi (URL & Anon Key).',
      url: url || undefined,
    };
  }

  const startTime = performance.now();

  try {
    const client = reinitSupabaseClient();
    const { error } = await client.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        message: `Gagal terhubung: ${error.message}`,
        url,
        latencyMs,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      message: 'Berhasil terhubung ke Supabase!',
      url,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan tidak diketahui';
    return {
      isConfigured: true,
      isConnected: false,
      message: `Error koneksi: ${errorMsg}`,
      url,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }
}
