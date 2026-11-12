import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection, isSupabaseConfigured, SupabaseHealthCheckResult } from '../../lib/supabase';

export const SupabaseStatusCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SupabaseHealthCheckResult | null>(null);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await testSupabaseConnection();
      setStatus(res);
    } catch (err: unknown) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        message: err instanceof Error ? err.message : 'Gagal menjalankan pemeriksaan',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const configured = isSupabaseConfigured();

  return (
    <section className="p-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#4A2810] flex items-center justify-center">
            <Database className="w-4 h-4 text-[#8B5E3C]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#3D2314]">Status Integrasi Supabase</h3>
            <p className="text-[10px] text-[#8C7A6B]">Inisialisasi Client &amp; Pemeriksaan Koneksi</p>
          </div>
        </div>

        <button
          onClick={runCheck}
          disabled={loading}
          className="p-1.5 rounded-xl hover:bg-[#FAF5EE] text-[#8C7A6B] hover:text-[#4A2810] transition-colors disabled:opacity-50"
          title="Uji Ulang Koneksi"
          aria-label="Uji Ulang Koneksi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4A2810]' : ''}`} />
        </button>
      </div>

      {/* Status Box */}
      <div className="p-3 rounded-2xl bg-[#FAF5EE] border border-[#E8DACB] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#5C4534]">Status:</span>

          {loading ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFE7DA] text-[#6B5749] animate-pulse">
              Menguji koneksi...
            </span>
          ) : status?.isConnected ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3EFE3] text-[#2C6E49] border border-[#C5DEC5] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Terhubung ({status.latencyMs}ms)
            </span>
          ) : configured ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDECE8] text-[#A03D2A] border border-[#F5C7B9] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Gagal Terhubung
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0D4] text-[#A26510] border border-[#F3D79E] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Menunggu Konfigurasi .env
            </span>
          )}
        </div>

        <p className="text-[11px] text-[#7A6657] leading-relaxed">
          {status?.message || 'Memeriksa environment variables...'}
        </p>

        {status?.url && (
          <div className="text-[10px] text-[#8C7A6B] font-mono truncate bg-white/70 px-2 py-1 rounded-lg">
            URL: {status.url}
          </div>
        )}
      </div>
    </section>
  );
};
