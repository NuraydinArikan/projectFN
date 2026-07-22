"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { AuthError, requireGazeteci, YAYIN_ROLLERI } from "@/lib/auth";
import type { ActionSonuc, EditorKayit, KayitTuru } from "@/lib/editor-types";
import { getEditorHaber } from "@/lib/editor-veri";
import { editorKayitlarindanKarne, yayinEsigiSaglandi } from "@/lib/karne";
import { slugify } from "@/lib/slug";
import { createAdminSupabase } from "@/lib/supabase/admin";

function hataSonuc(e: unknown): ActionSonuc<never> {
  if (e instanceof AuthError) {
    return { ok: false, hata: e.message, kod: e.status };
  }
  return {
    ok: false,
    hata: e instanceof Error ? e.message : "Bilinmeyen hata",
  };
}

function adminZorunlu() {
  const admin = createAdminSupabase();
  if (!admin) {
    throw new AuthError(
      503,
      "Yazma yolu yapılandırılmamış. SUPABASE_SERVICE_ROLE_KEY ekleyin."
    );
  }
  return admin;
}

async function benzersizSlug(admin: ReturnType<typeof adminZorunlu>, baslik: string) {
  const taban = slugify(baslik);
  let slug = taban;
  let n = 0;
  for (;;) {
    const { data } = await admin.from("haber").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${taban}-${n}`;
  }
}

export async function haberOlustur(girdi: {
  baslik: string;
  spot?: string;
  govde?: string;
  kicker?: string;
}): Promise<ActionSonuc<{ id: string; slug: string }>> {
  try {
    const gazeteci = await requireGazeteci();
    const admin = adminZorunlu();
    const baslik = girdi.baslik.trim();
    if (!baslik) return { ok: false, hata: "Başlık zorunlu." };

    const slug = await benzersizSlug(admin, baslik);
    const govde = (girdi.govde ?? "").trim();
    const govde_detay = govde
      ? [{ tip: "p" as const, kaynak: "resmi" as const, metin: govde }]
      : [];

    const { data, error } = await admin
      .from("haber")
      .insert({
        slug,
        baslik,
        kicker: girdi.kicker?.trim() || "Dosya",
        spot: girdi.spot?.trim() || null,
        govde_ozet: govde.slice(0, 500) || null,
        govde_detay,
        durum: "taslak",
        yazar_id: gazeteci.id,
        guncelleme_tarihi: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (error || !data) {
      return { ok: false, hata: error?.message || "Haber oluşturulamadı." };
    }

    revalidatePath("/editor");
    return { ok: true, data: { id: data.id, slug: data.slug } };
  } catch (e) {
    return hataSonuc(e);
  }
}

export async function haberMetinKaydet(girdi: {
  haberId: string;
  baslik: string;
  spot: string;
  govde: string;
  kicker?: string;
}): Promise<ActionSonuc<{ slug: string }>> {
  try {
    await requireGazeteci();
    const admin = adminZorunlu();
    const baslik = girdi.baslik.trim();
    if (!baslik) return { ok: false, hata: "Başlık zorunlu." };

    const { data: mevcut } = await admin
      .from("haber")
      .select("id, durum, slug")
      .eq("id", girdi.haberId)
      .maybeSingle();

    if (!mevcut) return { ok: false, hata: "Haber bulunamadı." };
    if (mevcut.durum === "yayinda" || mevcut.durum === "guncellendi") {
      // Metin güncellemesi yayında da serbest; durum guncellendi olur
    }

    const govde = girdi.govde.trim();
    const govde_detay = govde
      ? [{ tip: "p" as const, kaynak: "resmi" as const, metin: govde }]
      : [];

    const patch: Record<string, unknown> = {
      baslik,
      spot: girdi.spot.trim() || null,
      kicker: girdi.kicker?.trim() || null,
      govde_ozet: govde.slice(0, 500) || null,
      govde_detay,
      guncelleme_tarihi: new Date().toISOString(),
    };

    if (mevcut.durum === "yayinda" || mevcut.durum === "guncellendi") {
      patch.durum = "guncellendi";
    } else if (mevcut.durum === "taslak") {
      patch.durum = "editorde";
    }

    const { error } = await admin.from("haber").update(patch).eq("id", girdi.haberId);
    if (error) return { ok: false, hata: error.message };

    revalidatePath("/editor");
    revalidatePath(`/editor/${girdi.haberId}`);
    revalidatePath(`/haber/${mevcut.slug}`);
    revalidatePath("/");
    return { ok: true, data: { slug: mevcut.slug } };
  } catch (e) {
    return hataSonuc(e);
  }
}

export async function kayitEkle(girdi: {
  haberId: string;
  tur: KayitTuru;
  ad: string;
  gorusAlindi?: boolean;
  not?: string;
}): Promise<ActionSonuc<EditorKayit>> {
  try {
    await requireGazeteci();
    const admin = adminZorunlu();
    const ad = girdi.ad.trim();
    if (!ad) return { ok: false, hata: "Kayıt adı zorunlu." };

    const { data: haber } = await admin
      .from("haber")
      .select("id")
      .eq("id", girdi.haberId)
      .maybeSingle();
    if (!haber) return { ok: false, hata: "Haber bulunamadı." };

    if (girdi.tur === "bagimsiz" || girdi.tur === "resmi") {
      const dbTur = girdi.tur === "bagimsiz" ? "bagimsiz_kisi" : "resmi_kurum";
      const { data: kaynak, error: kErr } = await admin
        .from("kaynak")
        .insert({ tur: dbTur, ad, guven_notu: girdi.not ?? null })
        .select("id")
        .single();
      if (kErr || !kaynak) return { ok: false, hata: kErr?.message || "Kaynak eklenemedi." };

      // Yeni kaynak "teyit bekliyor" başlar — editör doğrulayana kadar karneye
      // sayılmaz. Bu, "karne editoryal disiplinin çıktısıdır" ilkesinin gereği.
      const { error: hkErr } = await admin.from("haber_kaynak").insert({
        haber_id: girdi.haberId,
        kaynak_id: kaynak.id,
        dogrulama_durumu: "teyit_bekliyor",
        not_metni: girdi.not ?? null,
      });
      if (hkErr) return { ok: false, hata: hkErr.message };

      await dokunHaber(admin, girdi.haberId);
      revalidateEditor(girdi.haberId);
      return {
        ok: true,
        data: { id: kaynak.id, tur: girdi.tur, ad, durum: "bekliyor", not: girdi.not },
      };
    }

    if (girdi.tur === "belge") {
      const sha256 = createHash("sha256").update(ad).digest("hex").slice(0, 16);
      const { data: belge, error: bErr } = await admin
        .from("belge")
        .insert({
          tur: "kayit",
          baslik: ad,
          sha256,
          icerik_ozeti: girdi.not ?? null,
        })
        .select("id")
        .single();
      if (bErr || !belge) return { ok: false, hata: bErr?.message || "Belge eklenemedi." };

      const { error: hbErr } = await admin.from("haber_belge").insert({
        haber_id: girdi.haberId,
        belge_id: belge.id,
      });
      if (hbErr) return { ok: false, hata: hbErr.message };

      await dokunHaber(admin, girdi.haberId);
      revalidateEditor(girdi.haberId);
      return { ok: true, data: { id: belge.id, tur: "belge", ad } };
    }

    // taraf
    const { data: varlik, error: vErr } = await admin
      .from("varlik")
      .insert({ tur: "kurum", ad })
      .select("id")
      .single();
    if (vErr || !varlik) return { ok: false, hata: vErr?.message || "Taraf eklenemedi." };

    const gorus = girdi.gorusAlindi !== false;
    const { error: hvErr } = await admin.from("haber_varlik").insert({
      haber_id: girdi.haberId,
      varlik_id: varlik.id,
      rol: "taraf",
      gorus_alindi: gorus,
      gorus_notu: girdi.not ?? null,
    });
    if (hvErr) return { ok: false, hata: hvErr.message };

    await dokunHaber(admin, girdi.haberId);
    revalidateEditor(girdi.haberId);
    return {
      ok: true,
      data: {
        id: varlik.id,
        tur: "taraf",
        ad,
        gorusAlindi: gorus,
        not: girdi.not,
      },
    };
  } catch (e) {
    return hataSonuc(e);
  }
}

export async function kayitSil(girdi: {
  haberId: string;
  tur: KayitTuru;
  id: string;
}): Promise<ActionSonuc> {
  try {
    await requireGazeteci();
    const admin = adminZorunlu();

    // Silme daima haber ↔ kayıt bağı üzerinden yapılır. Bağ yoksa istek reddedilir:
    // aksi hâlde bir haberin editörü, başka bir habere ait kaydı silebilirdi.
    const plan = {
      bagimsiz: { baglanti: "haber_kaynak", kolon: "kaynak_id", varlik: "kaynak" },
      resmi: { baglanti: "haber_kaynak", kolon: "kaynak_id", varlik: "kaynak" },
      belge: { baglanti: "haber_belge", kolon: "belge_id", varlik: "belge" },
      taraf: { baglanti: "haber_varlik", kolon: "varlik_id", varlik: "varlik" },
    }[girdi.tur];

    const { data: silinen, error: bagErr } = await admin
      .from(plan.baglanti)
      .delete()
      .eq("haber_id", girdi.haberId)
      .eq(plan.kolon, girdi.id)
      .select(plan.kolon);

    if (bagErr) return { ok: false, hata: bagErr.message };
    if (!silinen || silinen.length === 0) {
      return { ok: false, hata: "Kayıt bu habere ait değil.", kod: 404 };
    }

    // Kaynak/belge/varlık başka haberlerde de kullanılabilir; yalnız öksüz
    // kalmışsa silinir. Aksi hâlde diğer haberlerin karnesi bozulurdu.
    const { count } = await admin
      .from(plan.baglanti)
      .select(plan.kolon, { count: "exact", head: true })
      .eq(plan.kolon, girdi.id);

    if ((count ?? 0) === 0) {
      await admin.from(plan.varlik).delete().eq("id", girdi.id);
    }

    await dokunHaber(admin, girdi.haberId);
    revalidateEditor(girdi.haberId);
    return { ok: true, data: undefined };
  } catch (e) {
    return hataSonuc(e);
  }
}

/**
 * Bir kaynağın doğrulama durumunu değiştirir (teyit_bekliyor ↔ dogrulandi).
 * Yalnız editör / yayın yönetmeni doğrulayabilir: kaynağı ekleyen muhabir
 * değil, ondan bağımsız biri onaylamalı — editoryal kontrol buradadır.
 */
export async function kaynakDurumDegistir(girdi: {
  haberId: string;
  kaynakId: string;
  dogrula: boolean;
}): Promise<ActionSonuc<{ durum: "dogrulandi" | "bekliyor" }>> {
  try {
    await requireGazeteci(YAYIN_ROLLERI);
    const admin = adminZorunlu();

    const yeni = girdi.dogrula ? "dogrulandi" : "teyit_bekliyor";
    const { data, error } = await admin
      .from("haber_kaynak")
      .update({ dogrulama_durumu: yeni })
      .eq("haber_id", girdi.haberId)
      .eq("kaynak_id", girdi.kaynakId)
      .select("kaynak_id");

    if (error) return { ok: false, hata: error.message };
    if (!data || data.length === 0) {
      return { ok: false, hata: "Kaynak bu habere ait değil.", kod: 404 };
    }

    await dokunHaber(admin, girdi.haberId);
    revalidateEditor(girdi.haberId);
    return { ok: true, data: { durum: girdi.dogrula ? "dogrulandi" : "bekliyor" } };
  } catch (e) {
    return hataSonuc(e);
  }
}

export async function yayinaGonder(girdi: {
  haberId: string;
}): Promise<ActionSonuc<{ slug: string }>> {
  try {
    // Yayına gönderme yalnız editör / yayın yönetmeni yetkisindedir.
    await requireGazeteci(YAYIN_ROLLERI);
    const admin = adminZorunlu();

    const detay = await getEditorHaber(girdi.haberId);
    if (!detay) return { ok: false, hata: "Haber bulunamadı." };

    if (detay.durum === "yayinda" || detay.durum === "guncellendi") {
      return { ok: false, hata: "Haber zaten yayında." };
    }

    const karne = editorKayitlarindanKarne(detay.kayitlar);
    if (!yayinEsigiSaglandi(karne)) {
      return {
        ok: false,
        hata: "Yayın eşiği sağlanmadı: en az 2 doğrulanmış kaynak/belge ve 1 taraf kaydı gerekli.",
        kod: 422,
      };
    }

    const now = new Date().toISOString();
    const { data: surumler } = await admin
      .from("haber_surum")
      .select("surum_no")
      .eq("haber_id", girdi.haberId)
      .order("created_at", { ascending: false })
      .limit(1);

    const onceki = surumler?.[0]?.surum_no;
    const surumNo = onceki ? sonrakiSurum(onceki) : "1.0";
    const icerik = {
      baslik: detay.baslik,
      spot: detay.spot,
      govde: detay.govde,
      kayitlar: detay.kayitlar,
    };
    const sha256 = createHash("sha256")
      .update(JSON.stringify(icerik))
      .digest("hex")
      .slice(0, 16);

    const { error: uErr } = await admin
      .from("haber")
      .update({
        durum: "yayinda",
        yayin_tarihi: now,
        guncelleme_tarihi: now,
      })
      .eq("id", girdi.haberId);

    if (uErr) return { ok: false, hata: uErr.message };

    const { error: sErr } = await admin.from("haber_surum").insert({
      haber_id: girdi.haberId,
      surum_no: surumNo,
      not_metni: "İlk yayın (editör paneli)",
      icerik,
      sha256,
    });

    if (sErr) {
      // durum güncellendi; sürüm hatasını bildir ama yayın durmasın
      console.error("haber_surum insert:", sErr.message);
    }

    revalidatePath("/");
    revalidatePath(`/haber/${detay.slug}`);
    revalidateEditor(girdi.haberId);
    return { ok: true, data: { slug: detay.slug } };
  } catch (e) {
    return hataSonuc(e);
  }
}

export async function cikisYap(): Promise<void> {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
}

async function dokunHaber(
  admin: NonNullable<ReturnType<typeof createAdminSupabase>>,
  haberId: string
) {
  await admin
    .from("haber")
    .update({ guncelleme_tarihi: new Date().toISOString() })
    .eq("id", haberId);
}

function revalidateEditor(haberId: string) {
  revalidatePath("/editor");
  revalidatePath(`/editor/${haberId}`);
}

function sonrakiSurum(onceki: string): string {
  const m = onceki.match(/^(\d+)\.(\d+)/);
  if (!m) return "1.0";
  return `${m[1]}.${Number(m[2]) + 1}`;
}
