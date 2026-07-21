import type { Haber } from "./types";

// Doğrulama karnesi elle doldurulmaz: her değer haberin kayıtlarından türetilir.
// Bu fonksiyon, VERI-MODELI.md'deki "karne = sorgu, alan değil" ilkesinin koddaki karşılığıdır.
export interface Karne {
  bagimsizKaynak: number;
  /** Doğrulanmış resmî kurum kaynakları (belge listesinden ayrı). */
  resmiKaynak: number;
  resmiBelge: number;
  tarafAlinan: number;
  tarafToplam: number;
  tekzip: boolean;
  sonGuncelleme: string;
}

/** Editör paneli kayıt satırı (istemci + sunucu güvenli). */
export interface KarneKayitGirdi {
  tur: "resmi" | "belge" | "bagimsiz" | "taraf";
  ad: string;
  gorusAlindi?: boolean;
  not?: string;
  id?: string;
}

export function karneHesapla(haber: Haber): Karne {
  return {
    bagimsizKaynak: haber.kaynaklar.filter(
      (k) => k.tur === "bagimsiz" && k.durum === "dogrulandi"
    ).length,
    resmiKaynak: haber.kaynaklar.filter(
      (k) => k.tur === "resmi" && k.durum === "dogrulandi"
    ).length,
    resmiBelge: haber.belgeler.length,
    tarafAlinan: haber.taraflar.filter((t) => t.durum === "alindi").length,
    tarafToplam: haber.taraflar.length,
    tekzip: haber.tekzip,
    sonGuncelleme: haber.guncelleme,
  };
}

/** Editör kayıt listesinden karne (DB insert sonrası UI). */
export function editorKayitlarindanKarne(
  kayitlar: KarneKayitGirdi[],
  guncelleme = "—"
): Karne {
  const haber: Haber = {
    slug: "",
    kicker: "",
    baslik: "",
    spot: "",
    ozet: "",
    muhabir: "",
    yayin: "",
    guncelleme,
    tekzip: false,
    bolumler: [],
    kaynaklar: kayitlar
      .filter((k) => k.tur === "bagimsiz" || k.tur === "resmi")
      .map((k) => ({
        tur: k.tur as "bagimsiz" | "resmi",
        ad: k.ad,
        durum: "dogrulandi" as const,
      })),
    belgeler: kayitlar
      .filter((k) => k.tur === "belge")
      .map((k, i) => ({
        id: k.id || String(i),
        tur: "belge",
        baslik: k.ad,
        hash: "",
        icerik: "",
      })),
    taraflar: kayitlar
      .filter((k) => k.tur === "taraf")
      .map((k) => ({
        taraf: k.ad,
        durum: (k.gorusAlindi === false ? "bekliyor" : "alindi") as
          | "alindi"
          | "bekliyor",
        not: k.not,
      })),
    kronoloji: [],
    surumler: [],
  };
  return karneHesapla(haber);
}

// Editoryal yayın eşiği: en az 2 doğrulanmış kaynak/belge ve en az 1 taraf görüşü kaydı.
export function yayinEsigiSaglandi(karne: Karne): boolean {
  const dogrulanmis =
    karne.bagimsizKaynak + karne.resmiKaynak + karne.resmiBelge;
  return dogrulanmis >= 2 && karne.tarafToplam >= 1;
}
