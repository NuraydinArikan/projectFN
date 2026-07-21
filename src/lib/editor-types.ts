/** Editör paneli ve Server Action paylaşımlı tipler. */

export type KayitTuru = "resmi" | "belge" | "bagimsiz" | "taraf";

export interface EditorKayit {
  /** UI anahtarı; kaynak/belge/varlik id'si */
  id: string;
  tur: KayitTuru;
  ad: string;
  /** taraf için görüş alındı mı */
  gorusAlindi?: boolean;
  not?: string;
}

export interface EditorHaberOzeti {
  id: string;
  slug: string;
  baslik: string;
  durum: string;
  guncelleme_tarihi: string | null;
}

export interface EditorHaberDetay {
  id: string;
  slug: string;
  kicker: string;
  baslik: string;
  spot: string;
  govde: string;
  durum: string;
  kayitlar: EditorKayit[];
}

export type ActionSonuc<T = void> =
  | { ok: true; data: T }
  | { ok: false; hata: string; kod?: number };
