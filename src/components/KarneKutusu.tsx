import Link from "next/link";
import type { Haber } from "@/lib/types";
import { karneHesapla } from "@/lib/karne";

// Ana sayfadaki kompakt karne: değerler haberin kayıtlarından türetilir.
export function KarneKutusu({ haber }: { haber: Haber }) {
  const karne = karneHesapla(haber);
  return (
    <aside className="trust" aria-label="Doğrulama karnesi">
      <h2>
        <span className="tick">✓</span> Doğrulama Karnesi
      </h2>
      <ul>
        <li>
          <span>Bağımsız kaynak</span>
          <span className="val ok">{karne.bagimsizKaynak} ✓</span>
        </li>
        <li>
          <span>Resmî belge</span>
          <span className="val ok">{karne.resmiBelge} belge</span>
        </li>
        <li>
          <span>Taraf görüşü</span>
          <span className="val ok">
            {karne.tarafAlinan} / {karne.tarafToplam}
          </span>
        </li>
        <li>
          <span>Tekzip / düzeltme</span>
          <span className="val">{karne.tekzip ? "Var" : "Yok"}</span>
        </li>
        <li>
          <span>Son güncelleme</span>
          <span className="val">{karne.sonGuncelleme}</span>
        </li>
      </ul>
      <Link className="doc-link" href={`/haber/${haber.slug}#belgeler`}>
        Belgeleri ve kaynakları incele →
      </Link>
    </aside>
  );
}
