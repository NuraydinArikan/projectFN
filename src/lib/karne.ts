import type { Haber } from "./types";

// Doğrulama karnesi elle doldurulmaz: her değer haberin kayıtlarından türetilir.
// Bu fonksiyon, VERI-MODELI.md'deki "karne = sorgu, alan değil" ilkesinin koddaki karşılığıdır.
export interface Karne {
  bagimsizKaynak: number;
  resmiBelge: number;
  tarafAlinan: number;
  tarafToplam: number;
  tekzip: boolean;
  sonGuncelleme: string;
}

export function karneHesapla(haber: Haber): Karne {
  return {
    bagimsizKaynak: haber.kaynaklar.filter(
      (k) => k.tur === "bagimsiz" && k.durum === "dogrulandi"
    ).length,
    resmiBelge: haber.belgeler.length,
    tarafAlinan: haber.taraflar.filter((t) => t.durum === "alindi").length,
    tarafToplam: haber.taraflar.length,
    tekzip: haber.tekzip,
    sonGuncelleme: haber.guncelleme,
  };
}

// Editoryal yayın eşiği: en az 2 doğrulanmış kaynak/belge ve en az 1 taraf görüşü kaydı.
export function yayinEsigiSaglandi(karne: Karne): boolean {
  return karne.bagimsizKaynak + karne.resmiBelge >= 2 && karne.tarafToplam >= 1;
}
