"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Editör paneli taslağı. İlke: karne elle doldurulmaz, kayıtlardan türetilir;
// yayın eşiği sağlanmadan "Yayına gönder" açılmaz. AI önerir, editör karar verir.

type KayitTuru = "resmi" | "belge" | "bagimsiz" | "taraf";
interface Kayit {
  tur: KayitTuru;
  ad: string;
}

const turAdlari: Record<KayitTuru, string> = {
  resmi: "Resmî kayıt",
  belge: "Resmî belge",
  bagimsiz: "Bağımsız kaynak",
  taraf: "Taraf görüşü",
};

const baslikOnerileri = [
  "Deprem bölgesindeki konut ihalelerinde aynı üç şirket: Belgeler ne anlatıyor?",
  "41 ihalenin 28'i üç şirkete gitti: Ortaklık kayıtları kesişiyor",
  "Sayıştay uyarmıştı: İhale dosyasında yeni belgeler",
];

const riskler = [
  {
    id: "r1",
    seviye: "yuksek",
    sev: "Yüksek · tekzip riski",
    baslik: "Belgeyle desteklenmeyen kesinlik ifadesi",
    metin:
      "Gövdedeki “Bu bilgi kesindir.” cümlesi, iki isimsiz kaynağa dayanan bir iddiayı kesin olgu gibi sunuyor. Öneri: “iddia ediyor; bu iddia yazılı belgeyle henüz desteklenmiyor” biçiminde verilmeli.",
  },
  {
    id: "r2",
    seviye: "orta",
    sev: "Orta · eksik bilgi",
    baslik: "Yanıt süresi bağlamı eksik",
    metin:
      "Kurumun 12 gündür yanıt vermediği belirtiliyor; soruların hangi tarihte ve hangi kanaldan iletildiği metinde yer almalı (tekzip durumunda kanıt olur).",
  },
  {
    id: "r3",
    seviye: "orta",
    sev: "Orta · kişilik hakları",
    baslik: "Şirket adları ve suçlama dengesi",
    metin:
      "Şirketler hakkında yargı kararı yoktur; başlık ve spotta suç isnadı çağrışımı yapan ifade kullanılmamalı. Mevcut metin uygun; değişiklikte yeniden taranır.",
  },
];

export default function EditorPaneli() {
  const [baslik, setBaslik] = useState(
    "Deprem bölgesindeki konut ihaleleri hakkında haber"
  );
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);
  const [yeniTur, setYeniTur] = useState<KayitTuru>("resmi");
  const [yeniAd, setYeniAd] = useState("");
  const [cozulen, setCozulen] = useState<string[]>([]);
  const [yayinda, setYayinda] = useState(false);

  const sayilar = useMemo(() => {
    const kaynak = kayitlar.filter(
      (k) => k.tur === "bagimsiz" || k.tur === "resmi"
    ).length;
    const belge = kayitlar.filter((k) => k.tur === "belge").length;
    const taraf = kayitlar.filter((k) => k.tur === "taraf").length;
    return { kaynak, belge, taraf, esik: kaynak + belge >= 2 && taraf >= 1 };
  }, [kayitlar]);

  const durum = yayinda ? "Yayında" : sayilar.esik ? "Yayına hazır" : "Taslak";

  return (
    <div className="ed-root">
      <div className="ed-appbar">
        <div className="wrap">
          <Link className="ed-logo" href="/">
            PROJECT FN<em>.</em>
            <small>Editör Paneli</small>
          </Link>
          <span className="proto-badge">Geliştirme sürümü</span>
          <div className="right">
            <span
              className={`status-pill ${sayilar.esik || yayinda ? "hazir" : "editorde"}`}
            >
              {durum}
            </span>
            <button
              className="btn primary"
              type="button"
              disabled={!sayilar.esik || yayinda}
              onClick={() => setYayinda(true)}
              title={
                sayilar.esik
                  ? undefined
                  : "Doğrulama eşiği sağlanmadan yayına gönderilemez"
              }
            >
              {yayinda ? "✓ Yayında — v1.0 arşivlendi" : "Yayına gönder"}
            </button>
          </div>
        </div>
      </div>

      <main className="wrap">
        <div className="ed-layout">
          <section className="ed-panel" aria-label="Haber editörü">
            <header>
              <h2>Haber Metni</h2>
              <span className="hint">
                Dosya: Kentsel Dönüşüm · Muhabir: A. Yılmaz (temsilî)
              </span>
            </header>
            <div className="pad">
              <div className="field">
                <label htmlFor="baslik">Başlık</label>
                <input
                  className="baslik"
                  id="baslik"
                  type="text"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                />
                <div style={{ marginTop: 8 }}>
                  <span className="ai-note">
                    <strong>✦ AI başlık önerileri</strong> — tıklayınca
                    uygulanır, imza gazetecinindir:
                  </span>
                  <div className="oneri-row">
                    {baslikOnerileri.map((o) => (
                      <button
                        key={o}
                        className="oneri"
                        type="button"
                        onClick={() => setBaslik(o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="spot">Spot</label>
                <input
                  id="spot"
                  type="text"
                  defaultValue="Son iki yılda açılan 41 ihalenin dökümü, kamu kayıtları ve saha görüşmeleriyle birlikte incelendi."
                />
              </div>

              <div className="field">
                <label htmlFor="govde">Gövde</label>
                <textarea
                  className="govde"
                  id="govde"
                  defaultValue={
                    "Kamu ihale platformu kayıtlarına göre, bölgede son iki yılda açılan 41 konut ihalesinin 28'i üç şirket tarafından kazanıldı.\n\nİhale süreçlerine yakın iki sektör kaynağı, şartname taslaklarının ilandan önce belirli firmalarla paylaşıldığını söyledi. Bu bilgi kesindir.\n\nÜç şirketten ikisi yazılı açıklama gönderdi. İhaleleri açan kurum, yazılı sorularımıza 12 gündür yanıt vermedi."
                  }
                />
              </div>

              <span className="ai-note">
                <strong>✦ AI yardımcıları:</strong> Bültenden taslak oluştur ·
                SEO düzenle · Eski haberleri ilişkilendir · Etiket öner —{" "}
                <em>AI hiçbir metni editör onayı olmadan yayımlayamaz.</em>
              </span>
            </div>
          </section>

          <div className="ed-rail">
            <section className="ed-panel karne" aria-label="Doğrulama karnesi">
              <header>
                <h2>Doğrulama Karnesi</h2>
                <span className="hint">elle doldurulamaz — kayıtlardan türetilir</span>
              </header>
              <div className="pad">
                <div className="karne-grid">
                  <div className="karne-item">
                    <div className={`num ${sayilar.kaynak ? "ok" : "zero"}`}>
                      {sayilar.kaynak}
                    </div>
                    <div className="t">Kaynak kaydı</div>
                  </div>
                  <div className="karne-item">
                    <div className={`num ${sayilar.belge ? "ok" : "zero"}`}>
                      {sayilar.belge}
                    </div>
                    <div className="t">Resmî belge</div>
                  </div>
                  <div className="karne-item">
                    <div className={`num ${sayilar.taraf ? "ok" : "zero"}`}>
                      {sayilar.taraf}
                    </div>
                    <div className="t">Taraf görüşü kaydı</div>
                  </div>
                  <div className="karne-item">
                    <div className="num ok">—</div>
                    <div className="t">Tekzip</div>
                  </div>
                </div>
                <p className={`karne-note${sayilar.esik ? " ok" : ""}`}>
                  {sayilar.esik ? (
                    <>✓ Yayın eşiği sağlandı. Karne, haber sayfasında okura otomatik gösterilecek.</>
                  ) : (
                    <>
                      Yayın eşiği: en az <strong>2 kaynak/belge</strong> ve{" "}
                      <strong>1 taraf görüşü kaydı</strong>. Eşik sağlanınca
                      &quot;Yayına gönder&quot; açılır.
                    </>
                  )}
                </p>

                <ul className="kayit-list" aria-live="polite">
                  {kayitlar.map((k, i) => (
                    <li key={`${k.ad}-${i}`}>
                      <span className={`tur-chip ${k.tur}`}>
                        {turAdlari[k.tur]}
                      </span>
                      <span>{k.ad}</span>
                      <button
                        type="button"
                        className="sil"
                        aria-label={`Kaydı sil: ${k.ad}`}
                        onClick={() =>
                          setKayitlar(kayitlar.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <form
                  className="ekle-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const ad = yeniAd.trim();
                    if (!ad) return;
                    setKayitlar([...kayitlar, { tur: yeniTur, ad }]);
                    setYeniAd("");
                  }}
                >
                  <div className="row">
                    <select
                      aria-label="Kayıt türü"
                      value={yeniTur}
                      onChange={(e) => setYeniTur(e.target.value as KayitTuru)}
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
                  <button className="btn" type="submit">
                    + Karneye kayıt ekle
                  </button>
                </form>
              </div>
            </section>

            <section className="ed-panel risk" aria-label="Hukuki risk analizi">
              <header>
                <h2>Hukuki Risk Analizi</h2>
                <span className="hint">AI ön tarama · karar editörde</span>
              </header>
              <div className="pad">
                <ul className="risk-list">
                  {riskler.map((r) => {
                    const cozuldu = cozulen.includes(r.id);
                    return (
                      <li
                        key={r.id}
                        className={`risk-item${r.seviye === "yuksek" ? " yuksek" : ""}${cozuldu ? " cozuldu" : ""}`}
                      >
                        <span className="sev">
                          {cozuldu ? "Düzeltildi · editör onayıyla" : r.sev}
                        </span>
                        <h3>{r.baslik}</h3>
                        <p>{r.metin}</p>
                        <button
                          className="coz"
                          type="button"
                          onClick={() => setCozulen([...cozulen, r.id])}
                        >
                          Düzeltildi olarak işaretle
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="footnote">
                  Bu panel bir ön taramadır; hukuki sorumluluk değerlendirmesi
                  editör ve hukuk danışmanına aittir. Uyarılar habere kaydedilir
                  ve kurumsal hafızada saklanır.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
