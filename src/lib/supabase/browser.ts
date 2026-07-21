import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/env";

/** İstemci tarafı Supabase (oturum UI, signIn/signOut). Env yoksa null. */
export function createBrowserSupabase() {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) return null;
  return createBrowserClient(cfg.url, cfg.anonKey);
}
