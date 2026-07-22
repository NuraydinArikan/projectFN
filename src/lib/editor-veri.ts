import { createAdminSupabase } from "@/lib/supabase/admin";
import type { EditorHaberDetay, EditorHaberOzeti, EditorKayit } from "@/lib/editor-types";

/** Editör listesi — taslak dahil (service role). */
export async function listEditorHaberler(): Promise<EditorHaberOzeti[]> {
  const admin = createAdminSupabase();
  if (!admin) return [];

  const { data } = await admin
    .from("haber")
    .select("id, slug, baslik, durum, guncelleme_tarihi")
    .order("guncelleme_tarihi", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []) as EditorHaberOzeti[];
}

/** Editör detayı + karne kayıtları. */
export async function getEditorHaber(
  haberId: string
): Promise<EditorHaberDetay | null> {
  const admin = createAdminSupabase();
  if (!admin) return null;

  const { data: row } = await admin
    .from("haber")
    .select("id, slug, kicker, baslik, spot, govde_ozet, govde_detay, durum")
    .eq("id", haberId)
    .maybeSingle();

  if (!row) return null;

  const [{ data: kaynaklar }, { data: belgeler }, { data: varliklar }] =
    await Promise.all([
      admin
        .from("haber_kaynak")
        .select("kaynak_id, dogrulama_durumu, not_metni, kaynak:kaynak_id(tur, ad)")
        .eq("haber_id", haberId),
      admin
        .from("haber_belge")
        .select("belge_id, belge:belge_id(id, baslik)")
        .eq("haber_id", haberId),
      admin
        .from("haber_varlik")
        .select(
          "varlik_id, rol, gorus_alindi, gorus_notu, varlik:varlik_id(ad)"
        )
        .eq("haber_id", haberId),
    ]);

  const kayitlar: EditorKayit[] = [];

  for (const k of kaynaklar ?? []) {
    const kaynak = Array.isArray(k.kaynak) ? k.kaynak[0] : k.kaynak;
    if (!kaynak) continue;
    const tur =
      kaynak.tur === "bagimsiz_kisi"
        ? "bagimsiz"
        : kaynak.tur === "belge"
          ? "belge"
          : "resmi";
    kayitlar.push({
      id: k.kaynak_id as string,
      tur: tur as EditorKayit["tur"],
      ad: kaynak.ad as string,
      durum: k.dogrulama_durumu === "dogrulandi" ? "dogrulandi" : "bekliyor",
      not: k.not_metni ?? undefined,
    });
  }

  for (const b of belgeler ?? []) {
    const belge = Array.isArray(b.belge) ? b.belge[0] : b.belge;
    if (!belge) continue;
    kayitlar.push({
      id: belge.id as string,
      tur: "belge",
      ad: belge.baslik as string,
    });
  }

  for (const v of varliklar ?? []) {
    if (v.rol !== "taraf") continue;
    const varlik = Array.isArray(v.varlik) ? v.varlik[0] : v.varlik;
    if (!varlik) continue;
    kayitlar.push({
      id: v.varlik_id as string,
      tur: "taraf",
      ad: varlik.ad as string,
      gorusAlindi: Boolean(v.gorus_alindi),
      not: v.gorus_notu ?? undefined,
    });
  }

  const govdeMetin = govdeMetnine(row.govde_detay, row.govde_ozet);

  return {
    id: row.id,
    slug: row.slug,
    kicker: row.kicker ?? "",
    baslik: row.baslik,
    spot: row.spot ?? "",
    govde: govdeMetin,
    durum: row.durum,
    kayitlar,
  };
}

function govdeMetnine(
  detay: unknown,
  ozet: string | null
): string {
  if (Array.isArray(detay) && detay.length > 0) {
    return detay
      .map((b: { tip?: string; metin?: string }) => {
        if (b.tip === "h2") return b.metin ?? "";
        return b.metin ?? "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return ozet ?? "";
}

