import type { AkisKaydi, Haber, KisaHaber } from "./types";
import { getSupabase } from "./supabase";

// Tohum veri: tüm içerik temsilîdir; gerçek kişi ve kurumları konu almaz.
// Supabase bağlandığında bu modül aynı imzalarla veritabanı sorgularına geçirilecek.

const ihaleDosyasi: Haber = {
  slug: "deprem-bolgesi-konut-ihaleleri",
  kicker: "Dosya · Kentsel Dönüşüm",
  baslik:
    "Deprem bölgesindeki konut ihalelerinde aynı üç şirket: Belgeler ne anlatıyor?",
  spot: "Örnek dosya haberi — son iki yılda açılan 41 ihalenin dökümü, kamu kayıtları ve saha görüşmeleriyle birlikte incelendi.",
  ozet: "Kamu kayıtlarına göre 41 ihalenin 28'i, ortaklık yapıları kesişen üç şirkette toplandı. Sayıştay 2025'te rekabet uyarısı yapmıştı. İki bağımsız sektör kaynağı şartnamelerin önceden paylaşıldığını iddia ediyor (belgeyle henüz desteklenmedi). Şirketlerden ikisi yanıt verdi; kurum 12 gündür sessiz.",
  muhabir: "A. Yılmaz (temsilî)",
  yayin: "09:40",
  guncelleme: "14:32",
  tekzip: false,
  bolumler: [
    {
      tip: "p",
      kaynak: "resmi",
      metin:
        "Kamu ihale platformu kayıtlarına göre, bölgede son iki yılda açılan 41 konut ihalesinin 28'i üç şirket tarafından kazanıldı. İhale sonuç ilanlarının tam listesi haberin ekindedir.",
      belgeRef: "d1",
    },
    {
      tip: "p",
      kaynak: "resmi",
      metin:
        "Ticaret sicili kayıtları, üç şirketin ortaklık yapılarının iki isim üzerinden kesiştiğini gösteriyor. Şirketlerin kuruluş tarihleri, ilk ihale ilanlarından 4 ila 7 ay öncesine denk geliyor.",
      belgeRef: "d2",
    },
    { tip: "h2", kaynak: "resmi", metin: "Sayıştay raporundaki uyarı" },
    {
      tip: "p",
      kaynak: "resmi",
      metin:
        "Ağustos 2025 tarihli Sayıştay raporunda, aynı ihale paketlerine ilişkin \"yeterlik kriterlerinin rekabeti daraltacak biçimde belirlendiği\" tespitine yer verildi.",
      belgeRef: "d3",
    },
    { tip: "h2", kaynak: "bagimsiz", metin: "Sektörden iki kaynak ne diyor?" },
    {
      tip: "p",
      kaynak: "bagimsiz",
      metin:
        "İhale süreçlerine yakın, isimlerinin saklı tutulmasını isteyen iki sektör kaynağı, şartname taslaklarının ilandan önce belirli firmalarla paylaşıldığı iddiasını dile getirdi. Bu iddia, ikinci bir bağımsız kaynak tarafından teyit edildi; ancak yazılı belgeyle henüz desteklenmiyor.",
    },
    { tip: "h2", kaynak: "saha", metin: "Sahadan gözlemler" },
    {
      tip: "p",
      kaynak: "saha",
      metin:
        "Muhabirimizin şantiye bölgesindeki gözlemleri ve konut hak sahipleriyle yaptığı görüşmeler, teslim takviminin ilan edilen tarihlerin gerisinde olduğunu gösteriyor. Saha kayıtları konum doğrulamalıdır.",
    },
    { tip: "h2", kaynak: "resmi", metin: "Tarafların yanıtları" },
    {
      tip: "p",
      kaynak: "resmi",
      metin:
        "Üç şirketten ikisi yazılı açıklama gönderdi; açıklamaların tam metni haberin ekindedir. İhaleleri açan kurum, yazılı sorularımıza 12 gündür yanıt vermedi. Yanıt geldiğinde haber güncellenecek ve sürüm geçmişine işlenecektir.",
    },
  ],
  kaynaklar: [
    { tur: "resmi", ad: "Kamu ihale platformu sonuç ilanları", not: "41 ilan · Belge 1", durum: "dogrulandi" },
    { tur: "resmi", ad: "Ticaret sicili ortaklık kayıtları", not: "Belge 2", durum: "dogrulandi" },
    { tur: "resmi", ad: "Sayıştay raporu (Ağustos 2025)", not: "Belge 3", durum: "dogrulandi" },
    { tur: "bagimsiz", ad: "Birinci sektör kaynağı", not: "Kimliği yayın yönetiminde saklı", durum: "dogrulandi" },
    { tur: "bagimsiz", ad: "İkinci sektör kaynağı", not: "Çapraz teyit", durum: "dogrulandi" },
    { tur: "resmi", ad: "İhale kurumunun yanıtı", not: "12 gündür bekleniyor", durum: "bekliyor" },
  ],
  belgeler: [
    {
      id: "d1",
      tur: "Resmî kayıt",
      baslik: "İhale sonuç ilanları dökümü (41 ilan)",
      hash: "a3f8b2…c21e",
      icerik:
        "İHALE SONUÇ DÖKÜMÜ (TEMSİLÎ)\n─────────────────────────────\nToplam ilan ....................... 41\nŞirket A .......................... 12\nŞirket B .......................... 10\nŞirket C ...........................  6\nDiğer (9 firma) ................... 13\n\nDönem: Mart 2025 – Haziran 2026",
    },
    {
      id: "d2",
      tur: "Resmî kayıt",
      baslik: "Ticaret sicili ortaklık kayıtları",
      hash: "7d02e9…9b4f",
      icerik:
        "ORTAKLIK KAYDI ÖZETİ (TEMSİLÎ)\n─────────────────────────────\nŞirket A — kuruluş: 11/2024\n  Ortak 1 (%60), Ortak 2 (%40)\nŞirket B — kuruluş: 01/2025\n  Ortak 2 (%55), Ortak 3 (%45)\nŞirket C — kuruluş: 08/2025\n  Ortak 1 (%50), Ortak 3 (%50)",
    },
    {
      id: "d3",
      tur: "Resmî belge",
      baslik: "Sayıştay raporu — ilgili bölüm",
      hash: "e5614a…0a8c",
      icerik:
        "SAYIŞTAY RAPORU, BÖLÜM 4.2 (TEMSİLÎ)\n─────────────────────────────\n\"...yeterlik kriterlerinin, benzer iş deneyim tutarları yönünden rekabeti daraltacak biçimde belirlendiği tespit edilmiştir...\"\n\nRapor tarihi: Ağustos 2025",
    },
  ],
  taraflar: [
    { taraf: "Şirket A", durum: "alindi", not: "yazılı açıklama ekli" },
    { taraf: "Şirket B", durum: "alindi", not: "yazılı açıklama ekli" },
    { taraf: "Şirket C", durum: "bekliyor", not: "ulaşılamadı, süreç sürüyor" },
    { taraf: "İhale kurumu", durum: "bekliyor", not: "yanıt bekleniyor" },
  ],
  kronoloji: [
    { tarih: "Mart 2025", baslik: "İlk ihale paketi ilan edildi", ozet: "12 ihalelik ilk paket kamu platformunda yayımlandı.", baglantiMetni: "Belge 1" },
    { tarih: "Mayıs 2025", baslik: "İlk sonuçlar açıklandı", ozet: "12 ihalenin 9'unu aynı iki şirket kazandı.", baglantiMetni: "İlgili haberi oku" },
    { tarih: "Ağustos 2025", baslik: "Sayıştay raporunda usül uyarısı", ozet: "\"Yeterlik kriterleri rekabeti daraltıyor\" tespiti rapora girdi.", baglantiMetni: "Belge 3" },
    { tarih: "Kasım 2025", baslik: "İkinci ihale paketi", ozet: "29 ihalelik ikinci paket açıldı; üçüncü şirket bu dönemde devreye girdi.", baglantiMetni: "İlgili haberi oku" },
    { tarih: "Şubat 2026", baslik: "Muhalefet soru önergesi verdi", ozet: "Önerge metni ve kurumun kısa yanıtı arşivde.", baglantiMetni: "Önerge metni" },
    { tarih: "13 Temmuz 2026 — Bugün", baslik: "Belgeler yayımlandı, kurum yanıtı bekleniyor", ozet: "Bu haberle birlikte üç belge kamuoyuna açıldı.", simdi: true, baglantiMetni: "Dosyayı takibe al" },
  ],
  surumler: [
    { no: "1.0", not: "İlk yayın", saat: "09:40", hash: "a3f8…c21e" },
    { no: "1.1", not: "Şirket açıklamaları eklendi", saat: "12:15", hash: "7d02…9b4f" },
    { no: "1.2", not: "Belge seti genişletildi", saat: "14:32", hash: "e561…0a8c" },
  ],
};

const digerHaberler: KisaHaber[] = [
  {
    slug: "#",
    kicker: "Ekonomi",
    baslik: "Merkez Bankası faiz kararını açıkladı: Piyasalar nasıl karşıladı?",
    ozet: "Karar metninin satır arası analizi ve üç ekonomistin değerlendirmesiyle.",
    rozetler: [
      { metin: "✓ 2 bağımsız kaynak", ton: "ok" },
      { metin: "Resmî metin ekli", ton: "notr" },
    ],
  },
  {
    slug: "#",
    kicker: "Ankara",
    baslik: "Yeni yargı paketi taslağı komisyonda: Madde madde ne değişiyor?",
    ozet: "Taslak metin ile mevcut kanunun karşılaştırmalı tablosu haberin içinde.",
    rozetler: [
      { metin: "✓ Belge doğrulandı", ton: "ok" },
      { metin: "Kanun maddesi görüntülenebilir", ton: "notr" },
    ],
  },
  {
    slug: "#",
    kicker: "Saha",
    baslik: "Muhabir bildiriyor: Hatay'da konteyner kentlerde son durum",
    ozet: "Konum doğrulamalı saha kaydı; ses, fotoğraf ve kısa video ekli.",
    rozetler: [
      { metin: "✓ Muhabir sahada", ton: "ok" },
      { metin: "Konum doğrulandı", ton: "notr" },
    ],
  },
  {
    slug: "#",
    kicker: "Doğrulama",
    baslik: "Sosyal medyada dolaşan \"zam listesi\" gerçek mi?",
    ozet: "Listenin kaynağı bulunamadı; kurumun yalanlama metni haberde.",
    rozetler: [{ metin: "⚠ Tek kaynak — teyit sürüyor", ton: "warn" }],
  },
];

const gundemAkisi: AkisKaydi[] = [
  { saat: "14:32", metin: "İhale dosyası güncellendi: kurum yanıtı bekleniyor" },
  { saat: "13:10", metin: "Faiz kararı açıklandı" },
  { saat: "11:45", metin: "Yargı paketi komisyon görüşmesi başladı" },
  { saat: "09:20", metin: "Hatay saha kaydı yayında" },
];

function saatFormatla(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function ayFormatla(tarih: string): string {
  return new Date(tarih).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

// haber_karne + ilişkili tablolardan Haber tipini kurar.
// Karne rakamları burada elle hesaplanmaz — haber_karne görünümünden okunur (bkz. VERI-MODELI.md).
async function haberSatirindanKur(row: {
  id: string;
  slug: string;
  kicker: string | null;
  baslik: string;
  spot: string | null;
  govde_ozet: string | null;
  govde_detay: { tip: "p" | "h2"; kaynak: "resmi" | "bagimsiz" | "saha"; metin: string; belge_ref?: string }[] | null;
  yayin_tarihi: string | null;
  guncelleme_tarihi: string | null;
  olay_id: string | null;
  gazeteci: { ad: string } | { ad: string }[] | null;
}): Promise<Haber> {
  const supabase = getSupabase()!;
  const gazeteciAdi = Array.isArray(row.gazeteci) ? row.gazeteci[0]?.ad : row.gazeteci?.ad;

  const [{ data: kaynakSatirlari }, { data: belgeSatirlari }, { data: varlikSatirlari }, { data: surumSatirlari }, { data: dugumSatirlari }, { data: karneSatirlari }] =
    await Promise.all([
      supabase.from("haber_kaynak").select("dogrulama_durumu, not_metni, kaynak:kaynak_id(tur, ad)").eq("haber_id", row.id),
      supabase.from("haber_belge").select("belge:belge_id(id, tur, baslik, sha256, icerik_ozeti)").eq("haber_id", row.id),
      supabase.from("haber_varlik").select("rol, gorus_alindi, gorus_notu, varlik:varlik_id(ad)").eq("haber_id", row.id),
      supabase.from("haber_surum").select("surum_no, not_metni, sha256, created_at").eq("haber_id", row.id).order("created_at"),
      row.olay_id
        ? supabase.from("olay_dugumu").select("tarih, baslik, ozet, sira").eq("olay_id", row.olay_id).order("sira")
        : Promise.resolve({ data: [] as { tarih: string; baslik: string; ozet: string | null; sira: number }[] }),
      supabase.from("haber_karne").select("*").eq("haber_id", row.id).single(),
    ]);

  const belgeler = (belgeSatirlari ?? []).map((b) => {
    const belge = Array.isArray(b.belge) ? b.belge[0] : b.belge;
    return {
      id: belge!.id as string,
      tur: belge!.tur === "kayit" ? "Resmî kayıt" : belge!.tur === "rapor" ? "Resmî belge" : (belge!.tur as string),
      baslik: belge!.baslik as string,
      hash: belge!.sha256 as string,
      icerik: (belge!.icerik_ozeti as string) ?? "",
    };
  });

  const enSonDugum = dugumSatirlari?.at(-1);

  return {
    slug: row.slug,
    kicker: row.kicker ?? "",
    baslik: row.baslik,
    spot: row.spot ?? "",
    ozet: row.govde_ozet ?? "",
    muhabir: gazeteciAdi ?? "—",
    yayin: saatFormatla(row.yayin_tarihi),
    guncelleme: saatFormatla(row.guncelleme_tarihi),
    tekzip: karneSatirlari?.tekzip ?? false,
    bolumler: (row.govde_detay ?? []).map((b) => ({
      tip: b.tip,
      kaynak: b.kaynak,
      metin: b.metin,
      belgeRef: b.belge_ref,
    })),
    kaynaklar: (kaynakSatirlari ?? []).map((k) => {
      const kaynak = Array.isArray(k.kaynak) ? k.kaynak[0] : k.kaynak;
      return {
        tur: kaynak!.tur === "bagimsiz_kisi" ? "bagimsiz" : "resmi",
        ad: kaynak!.ad as string,
        not: k.not_metni ?? undefined,
        durum: k.dogrulama_durumu === "dogrulandi" ? "dogrulandi" : "bekliyor",
      };
    }),
    belgeler,
    taraflar: (varlikSatirlari ?? []).map((v) => {
      const varlik = Array.isArray(v.varlik) ? v.varlik[0] : v.varlik;
      return {
        taraf: varlik!.ad as string,
        durum: v.gorus_alindi ? "alindi" : "bekliyor",
        not: v.gorus_notu ?? undefined,
      };
    }),
    kronoloji: (dugumSatirlari ?? []).map((d) => ({
      tarih: ayFormatla(d.tarih),
      baslik: d.baslik,
      ozet: d.ozet ?? "",
      simdi: d === enSonDugum,
    })),
    surumler: (surumSatirlari ?? []).map((s) => ({
      no: s.surum_no,
      not: s.not_metni ?? "",
      saat: saatFormatla(s.created_at),
      hash: s.sha256,
    })),
  };
}

const HABER_SECIMI =
  "id, slug, kicker, baslik, spot, govde_ozet, govde_detay, yayin_tarihi, guncelleme_tarihi, olay_id, gazeteci:yazar_id(ad)";

export async function getMansetHaber(): Promise<Haber> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("haber")
      .select(HABER_SECIMI)
      .order("yayin_tarihi", { ascending: false })
      .limit(1)
      .single();
    if (data) return haberSatirindanKur(data);
  }
  return ihaleDosyasi;
}

export async function getHaber(slug: string): Promise<Haber | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from("haber").select(HABER_SECIMI).eq("slug", slug).single();
    if (data) return haberSatirindanKur(data);
    return null;
  }
  return slug === ihaleDosyasi.slug ? ihaleDosyasi : null;
}

export async function getTumSluglar(): Promise<string[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from("haber").select("slug");
    if (data && data.length > 0) return data.map((h) => h.slug);
  }
  return [ihaleDosyasi.slug];
}

export async function getDigerHaberler(): Promise<KisaHaber[]> {
  return digerHaberler;
}

export async function getGundemAkisi(): Promise<AkisKaydi[]> {
  return gundemAkisi;
}
