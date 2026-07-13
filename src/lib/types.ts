// Haber, doğrulanabilir bir bilgi nesnesidir — bkz. docs/VERI-MODELI.md

export type KaynakTuru = "resmi" | "belge" | "bagimsiz";
export type BolumKaynagi = "resmi" | "bagimsiz" | "saha";

export interface Kaynak {
  tur: KaynakTuru;
  ad: string;
  not?: string;
  durum: "dogrulandi" | "bekliyor";
}

export interface Belge {
  id: string;
  tur: string;
  baslik: string;
  hash: string;
  icerik: string;
}

export interface TarafGorusu {
  taraf: string;
  durum: "alindi" | "bekliyor";
  not?: string;
}

export interface KronolojiDugumu {
  tarih: string;
  baslik: string;
  ozet: string;
  simdi?: boolean;
  baglantiMetni?: string;
}

export interface Surum {
  no: string;
  not: string;
  saat: string;
  hash: string;
}

export interface Bolum {
  tip: "p" | "h2";
  kaynak: BolumKaynagi;
  metin: string;
  belgeRef?: string;
}

export interface Haber {
  slug: string;
  kicker: string;
  baslik: string;
  spot: string;
  ozet: string;
  muhabir: string;
  yayin: string;
  guncelleme: string;
  bolumler: Bolum[];
  kaynaklar: Kaynak[];
  belgeler: Belge[];
  taraflar: TarafGorusu[];
  kronoloji: KronolojiDugumu[];
  surumler: Surum[];
  tekzip: boolean;
}

export interface KisaHaber {
  slug: string;
  kicker: string;
  baslik: string;
  ozet: string;
  rozetler: { metin: string; ton: "ok" | "warn" | "notr" }[];
}

export interface AkisKaydi {
  saat: string;
  metin: string;
}
