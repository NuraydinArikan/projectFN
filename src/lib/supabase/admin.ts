import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig, getServiceRoleKey } from "@/lib/env";

/**
 * Service role istemcisi — yalnız Server Action / route handler içinde.
 * RLS'yi aşar; her çağrıdan önce requireGazeteci ile yetki doğrulanmalıdır.
 */
export function createAdminSupabase(): SupabaseClient | null {
  const cfg = getPublicSupabaseConfig();
  const serviceKey = getServiceRoleKey();
  if (!cfg || !serviceKey) return null;

  return createClient(cfg.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
