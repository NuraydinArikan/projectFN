import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type GazeteciRol = "muhabir" | "editor" | "yayin_yonetmeni";

export interface Gazeteci {
  id: string;
  ad: string;
  rol: GazeteciRol;
  aktif: boolean;
  auth_user_id: string | null;
  email: string | null;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

const GAZETECI_ALANLARI = "id, ad, rol, aktif, auth_user_id, email";

/** Yayına gönderme yetkisi olan roller — tek yerde tanımlı. */
export const YAYIN_ROLLERI: GazeteciRol[] = ["editor", "yayin_yonetmeni"];

/** Oturum açmış kullanıcı; yoksa null. */
export async function getOturumKullanici() {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function migrationEksik(message: string | undefined): boolean {
  if (!message) return false;
  return (
    message.includes("aktif") ||
    message.includes("auth_user_id") ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  );
}

function migrationHatasi(): AuthError {
  return new AuthError(
    503,
    "Yetkilendirme şeması eksik. supabase/migrations/0006_yetki_ve_rls.sql dosyasını uygulayın."
  );
}

function yetkiDogrula(gazeteci: Gazeteci, izinliRoller?: GazeteciRol[]): Gazeteci {
  if (!gazeteci.aktif) {
    throw new AuthError(
      403,
      "Hesabınız henüz etkinleştirilmedi. Yayın yönetmeniyle görüşün."
    );
  }
  if (izinliRoller && !izinliRoller.includes(gazeteci.rol)) {
    throw new AuthError(403, "Bu işlem için yetkiniz yok.");
  }
  return gazeteci;
}

/**
 * Oturum + yetkili gazeteci kaydı zorunlu.
 *
 * Kayıt DAVET TABANLIDIR: gazeteci satırı önceden (e-posta ile) açılmış olmalıdır.
 * Oturum açan kullanıcı kendiliğinden editör olamaz — yalnızca kendisi için
 * hazırlanmış satıra bağlanır. Böylece Supabase Auth'ta kayıt açık kalsa bile
 * dışarıdan gelen biri yayın yetkisi kazanamaz.
 */
export async function requireGazeteci(
  izinliRoller?: GazeteciRol[]
): Promise<Gazeteci> {
  const user = await getOturumKullanici();
  if (!user) {
    throw new AuthError(401, "Giriş yapmanız gerekiyor.");
  }

  const admin = createAdminSupabase();
  if (!admin) {
    throw new AuthError(
      503,
      "Yazma yolu yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY eksik)."
    );
  }

  // 1) Auth kullanıcısına bağlı kayıt
  const { data: mevcut, error: selErr } = await admin
    .from("gazeteci")
    .select(GAZETECI_ALANLARI)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (selErr && migrationEksik(selErr.message)) throw migrationHatasi();
  if (selErr) throw new AuthError(500, selErr.message);
  if (mevcut) return yetkiDogrula(mevcut as unknown as Gazeteci, izinliRoller);

  // 2) Davet satırı: aynı e-posta ile önceden açılmış, henüz bağlanmamış kayıt
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    throw new AuthError(403, "Bu hesap editör paneline yetkili değil.");
  }

  const { data: davet, error: davetErr } = await admin
    .from("gazeteci")
    .select(GAZETECI_ALANLARI)
    .eq("email", email)
    .is("auth_user_id", null)
    .maybeSingle();

  if (davetErr && migrationEksik(davetErr.message)) throw migrationHatasi();
  if (davetErr) throw new AuthError(500, davetErr.message);

  if (!davet) {
    throw new AuthError(
      403,
      "Bu hesap editör paneline yetkili değil. Yayın yönetmeninden davet isteyin."
    );
  }

  // Yarış durumuna karşı: yalnızca hâlâ bağlanmamışsa bağla.
  const { data: baglanan, error: bagErr } = await admin
    .from("gazeteci")
    .update({ auth_user_id: user.id })
    .eq("id", (davet as unknown as Gazeteci).id)
    .is("auth_user_id", null)
    .select(GAZETECI_ALANLARI)
    .single();

  if (bagErr || !baglanan) {
    throw new AuthError(500, bagErr?.message || "Gazeteci kaydı bağlanamadı.");
  }

  return yetkiDogrula(baglanan as unknown as Gazeteci, izinliRoller);
}
