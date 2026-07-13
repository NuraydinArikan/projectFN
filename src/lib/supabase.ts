import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Aşama 2'de devreye girer (bkz. docs/GELISTIRME-PLANI.md).
// Ortam değişkenleri tanımlı değilse uygulama tohum veriyle çalışır.
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
