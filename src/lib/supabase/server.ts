import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "@/lib/env";

/** Sunucu bileşenleri / Server Actions — cookie oturumu (anon anahtar). */
export async function createServerSupabase() {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) return null;

  const cookieStore = await cookies();

  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component'ten set edilemez; middleware oturumu yeniler.
        }
      },
    },
  });
}
