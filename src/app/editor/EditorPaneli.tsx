"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  haberMetinKaydet,
  kayitEkle,
  kaynakDurumDegistir,
  kayitSil,
  yayinaGonder,
} from "./actions";
import type { EditorHaberDetay, EditorKayit, KayitTuru } from "@/lib/editor-types";
import { editorKayitlarindanKarne, yayinEsigiSaglandi } from "@/lib/karne";

const turAdlari: Record<KayitTuru, string> = {
  resmi: "Resmî kayıt",
  belge: "Resmî belge",
  bagimsiz: "Bağımsız kaynak",
  taraf: "Taraf görüşü",
};

export function EditorPaneli({
  haber,
  gazeteciAd,
}: {
  haber: EditorHaberDetay;
  gazeteciAd: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [baslik, setBaslik] = useState(haber.baslik);
  const [spot, setSpot] = useState(haber.spot);
  const [govde, setGovde] = useState(haber.govde);
  const [kicker, setKicker] = useState(haber.kicker);
  const [kayitlar, setKayitlar] = useState<EditorKayit[]>(haber.kayitlar);
  const [yeniTur, setYeniTur] = useState<KayitTuru>("resmi");
  const [yeniAd, setYeniAd] = useState("");
  const [durum, setDurum] = useState(haber.durum);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  // router.refresh() sonrası sunucu props ile client state'i hizala
  useEffect(() => {
    setBaslik(haber.baslik);
    setSpot(haber.spot);
    setGovde(haber.govde);
    setKicker(haber.kicker);
    setKayitlar(haber.kayitlar);
    setDurum(haber.durum);
  }, [haber]);

  const karne = useMemo(
    () => editorKayitlarindanKarne(kayitlar),
    [kayitlar]
  );
  const esik = yayinEsigiSaglandi(karne);
  const yayinda = durum === "yayinda" || durum === "guncellendi";

  const durumEtiket = yayinda
    ? "Yayında"
    : esik
      ? "Yayına hazır"
      : durum === "editorde"
        ? "Editörde"
        : "Taslak";

  function calistir(
    is: () => Promise<void>
  ) {
    setHata(null);
    setMesaj(null);
    startTransition(async () => {
      try {
        await is();
      } catch (e) {
        setHata(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  function kaydet() {
    calistir(async () => {
      const r = await haberMetinKaydet({
        haberId: haber.id,
        baslik,
        spot,
        govde,
        kicker,
      });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      if (durum === "taslak") setDurum("editorde");
      setMesaj("Metin kaydedildi.");
      router.refresh();
    });
  }

  function kayitEkleForm(e: React.FormEvent) {
    e.preventDefault();
    const ad = yeniAd.trim();
    if (!ad) return;
    calistir(async () => {
      const r = await kayitEkle({
        haberId: haber.id,
        tur: yeniTur,
        ad,
        gorusAlindi: true,
      });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      setKayitlar((prev) => [...prev, r.data]);
      setYeniAd("");
      const kaynakTuru = yeniTur === "bagimsiz" || yeniTur === "resmi";
      setMesaj(
        kaynakTuru
          ? "Kaynak eklendi — teyit bekliyor. Editör doğrulayınca karneye sayılır."
          : "Kayıt eklendi (veritabanı)."
      );
      router.refresh();
    });
  }

  function kaynakDogrulaClick(k: EditorKayit) {
    const dogrula = k.durum !== "dogrulandi";
    calistir(async () => {
      const r = await kaynakDurumDegistir({
        haberId: haber.id,
        kaynakId: k.id,
        dogrula,
      });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      setKayitlar((prev) =>
        prev.map((x) =>
          x.id === k.id && x.tur === k.tur ? { ...x, durum: r.data.durum } : x
        )
      );
      setMesaj(dogrula ? "Kaynak doğrulandı." : "Doğrulama geri alındı.");
      router.refresh();
    });
  }

  function kayitSilClick(k: EditorKayit) {
    calistir(async () => {
      const r = await kayitSil({
        haberId: haber.id,
        tur: k.tur,
        id: k.id,
      });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      setKayitlar((prev) => prev.filter((x) => !(x.id === k.id && x.tur === k.tur)));
      setMesaj("Kayıt silindi.");
      router.refresh();
    });
  }

  function yayinla() {
    if (!esik || yayinda) return;
    calistir(async () => {
      // Önce metni kaydet
      const kayit = await haberMetinKaydet({
        haberId: haber.id,
        baslik,
        spot,
        govde,
        kicker,
      });
      if (!kayit.ok) {
        setHata(kayit.hata);
        return;
      }
      const r = await yayinaGonder({ haberId: haber.id });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      setDurum("yayinda");
      setMesaj(`Yayında — /haber/${r.data.slug}`);
      router.refresh();
    });
  }

  return (
    <div className="ed-root">
      <div className="ed-appbar">
        <div className="wrap">
          <Link className="ed-logo" href="/">
            PROJECT FN<em>.</em>
            <small>Editör Paneli</small>
          </Link>
          <span className="proto-badge">Canlı yazma</span>
          <div className="right">
            <span className="hint" style={{ marginRight: 8 }}>
              {gazeteciAd}
            </span>
            <span
              className={`status-pill ${esik || yayinda ? "hazir" : "editorde"}`}
            >
              {durumEtiket}
            </span>
            <button
              className="btn"
              type="button"
              disabled={pending}
              onClick={kaydet}
            >
              Kaydet
            </button>
            <button
              className="btn primary"
              type="button"
              disabled={!esik || yayinda || pending}
              onClick={yayinla}
              title={
                yayinda
                  ? "Zaten yayında"
                  : esik
                    ? "Yayın eşiği sağlandı"
                    : "Doğrulama eşiği sağlanmadan yayına gönderilemez"
              }
            >
              {yayinda ? "✓ Yayında" : "Yayına gönder"}
            </button>
            <Link className="btn" href="/editor">
              Liste
            </Link>
          </div>
        </div>
      </div>

      <main className="wrap">
        {(hata || mesaj) && (
          <p
            className={`karne-note${mesaj && !hata ? " ok" : ""}`}
            role="status"
            style={{ marginTop: 16 }}
          >
            {hata || mesaj}
          </p>
        )}
        <div className="ed-layout">
          <section className="ed-panel" aria-label="Haber editörü">
            <header>
              <h2>Haber Metni</h2>
              <span className="hint">
                slug: {haber.slug} · durum: {durum}
              </span>
            </header>
            <div className="pad">
              <div className="field">
                <label htmlFor="kicker">Kicker</label>
                <input
                  id="kicker"
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="baslik">Başlık</label>
                <input
                  className="baslik"
                  id="baslik"
                  type="text"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="spot">Spot</label>
                <input
                  id="spot"
                  type="text"
                  value={spot}
                  onChange={(e) => setSpot(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="govde">Gövde</label>
                <textarea
                  className="govde"
                  id="govde"
                  value={govde}
                  onChange={(e) => setGovde(e.target.value)}
                />
              </div>
              {yayinda && (
                <p className="footnote">
                  Public sayfa:{" "}
                  <Link href={`/haber/${haber.slug}`}>/haber/{haber.slug}</Link>
                </p>
              )}
            </div>
          </section>

          <div className="ed-rail">
            <section className="ed-panel karne" aria-label="Doğrulama karnesi">
              <header>
                <h2>Doğrulama Karnesi</h2>
                <span className="hint">elle doldurulamaz — DB kayıtlarından</span>
              </header>
              <div className="pad">
                <div className="karne-grid">
                  <div className="karne-item">
                    <div
                      className={`num ${
                        karne.bagimsizKaynak + karne.resmiKaynak ? "ok" : "zero"
                      }`}
                    >
                      {karne.bagimsizKaynak + karne.resmiKaynak}
                    </div>
                    <div className="t">Kaynak (doğrulandı)</div>
                  </div>
                  <div className="karne-item">
                    <div className={`num ${karne.resmiBelge ? "ok" : "zero"}`}>
                      {karne.resmiBelge}
                    </div>
                    <div className="t">Resmî belge</div>
                  </div>
                  <div className="karne-item">
                    <div className={`num ${karne.tarafToplam ? "ok" : "zero"}`}>
                      {karne.tarafToplam}
                    </div>
                    <div className="t">Taraf kaydı</div>
                  </div>
                  <div className="karne-item">
                    <div className={`num ${esik ? "ok" : "zero"}`}>
                      {esik ? "✓" : "—"}
                    </div>
                    <div className="t">Eşik</div>
                  </div>
                </div>
                <p className={`karne-note${esik ? " ok" : ""}`}>
                  {esik ? (
                    <>
                      ✓ Yayın eşiği sağlandı (
                      {karne.bagimsizKaynak +
                        karne.resmiKaynak +
                        karne.resmiBelge}{" "}
                      kaynak/belge, {karne.tarafToplam} taraf).
                    </>
                  ) : (
                    <>
                      Yayın eşiği: en az <strong>2 kaynak/belge</strong> ve{" "}
                      <strong>1 taraf</strong>. Eşik sunucuda da doğrulanır.
                    </>
                  )}
                </p>

                <ul className="kayit-list" aria-live="polite">
                  {kayitlar.map((k) => {
                    const kaynakTuru = k.tur === "bagimsiz" || k.tur === "resmi";
                    const dogrulandi = k.durum === "dogrulandi";
                    return (
                      <li key={`${k.tur}-${k.id}`}>
                        <span className={`tur-chip ${k.tur}`}>
                          {turAdlari[k.tur]}
                        </span>
                        <span className="kayit-ad">{k.ad}</span>
                        {kaynakTuru && (
                          <button
                            type="button"
                            className={`dogrula-btn ${dogrulandi ? "ok" : "bekliyor"}`}
                            disabled={pending}
                            title={
                              dogrulandi
                                ? "Doğrulamayı geri al"
                                : "Kaynağı doğrulanmış olarak işaretle"
                            }
                            onClick={() => kaynakDogrulaClick(k)}
                          >
                            {dogrulandi ? "✓ Doğrulandı" : "Teyit bekliyor"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="sil"
                          disabled={pending}
                          aria-label={`Kaydı sil: ${k.ad}`}
                          onClick={() => kayitSilClick(k)}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <form className="ekle-form" onSubmit={kayitEkleForm}>
                  <div className="row">
                    <select
                      aria-label="Kayıt türü"
                      value={yeniTur}
                      onChange={(e) =>
                        setYeniTur(e.target.value as KayitTuru)
                      }
                    >
                      {Object.entries(turAdlari).map(([v, ad]) => (
                        <option key={v} value={v}>
                          {ad}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Örn: Sayıştay raporu, Bölüm 4.2"
                      aria-label="Kayıt açıklaması"
                      value={yeniAd}
                      onChange={(e) => setYeniAd(e.target.value)}
                    />
                  </div>
                  <button className="btn" type="submit" disabled={pending}>
                    + Karneye kayıt ekle (DB)
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
