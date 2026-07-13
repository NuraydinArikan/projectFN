"use client";

import { useEffect, useState } from "react";
import type { Belge, Haber } from "@/lib/types";

type Mod = "tam" | "ozet" | "dinle";

export function HaberGovde({ haber }: { haber: Haber }) {
  const [mod, setMod] = useState<Mod>("tam");
  const [resmiFiltre, setResmiFiltre] = useState(false);
  const [acikBelge, setAcikBelge] = useState<Belge | null>(null);

  useEffect(() => {
    if (!acikBelge) return;
    const kapat = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcikBelge(null);
    };
    document.addEventListener("keydown", kapat);
    return () => document.removeEventListener("keydown", kapat);
  }, [acikBelge]);

  const belgeBul = (id?: string) =>
    haber.belgeler.find((b) => b.id === id) ?? null;

  return (
    <>
      <div className="wrap">
        <div className="controls">
          {(
            [
              ["tam", "Tam metin"],
              ["ozet", "2 dakikada oku"],
              ["dinle", "Sesli dinle"],
            ] as [Mod, string][]
          ).map(([m, ad]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mod === m}
              onClick={() => setMod(m)}
            >
              {ad}
            </button>
          ))}
          <button
            type="button"
            className="filter"
            aria-pressed={resmiFiltre}
            onClick={() => setResmiFiltre(!resmiFiltre)}
          >
            Yalnızca resmî kaynaklı bölümler
          </button>
        </div>
      </div>

      <section className="art-main">
        <div className="wrap">
          <article className="art-body">
            {resmiFiltre && mod === "tam" && (
              <p className="filter-note">
                Resmî kaynak filtresi açık: yalnızca resmî belge ve kayıtlara
                dayanan bölümler gösteriliyor; diğerleri soluklaştırıldı.
              </p>
            )}

            {mod === "tam" &&
              haber.bolumler.map((b, i) => {
                const sonuk =
                  resmiFiltre && b.kaynak !== "resmi" ? " dimmed" : "";
                const etiket =
                  b.kaynak === "resmi"
                    ? "Resmî kayıt"
                    : b.kaynak === "bagimsiz"
                      ? "Bağımsız kaynak"
                      : "Saha kaydı";
                const belge = belgeBul(b.belgeRef);
                if (b.tip === "h2")
                  return (
                    <h2 key={i} className={sonuk || undefined}>
                      {b.metin}
                    </h2>
                  );
                return (
                  <p key={i} className={sonuk || undefined}>
                    {b.metin}{" "}
                    {belge && (
                      <button
                        type="button"
                        className="belge-ref"
                        onClick={() => setAcikBelge(belge)}
                      >
                        [{belge.baslik}]
                      </button>
                    )}
                    <span className={`src-tag ${b.kaynak}`}>{etiket}</span>
                  </p>
                );
              })}

            {mod === "ozet" && (
              <>
                <p>
                  <strong>Özet:</strong> {haber.ozet}
                </p>
                <p>
                  <em>Bu özet, onaylı tam metinden üretilmiştir.</em>
                </p>
              </>
            )}

            {mod === "dinle" && (
              <p>
                🔊 <strong>Sesli mod:</strong> Bu haber sesli dinlenebilir.
                Seslendirme, editör onaylı tam metinden üretilir; kaldığınız
                cümleden devam eder. <em>(Geliştirme sürümünde ses çalınmaz.)</em>
              </p>
            )}
          </article>

          <aside className="rail">
            <div className="panel trustp" aria-label="Doğrulama karnesi — açık görünüm">
              <h2>
                <span className="tick">✓</span> Doğrulama Karnesi
              </h2>
              <ul className="src-list">
                {haber.kaynaklar.map((k) => (
                  <li key={k.ad}>
                    <span className={`st ${k.durum === "dogrulandi" ? "ok" : "wait"}`}>
                      {k.durum === "dogrulandi" ? "✓" : "…"}
                    </span>
                    <span className="desc">
                      {k.ad}
                      {k.not && <small>{k.not}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel" aria-label="Taraf görüşleri">
              <h2>Taraf Görüşleri</h2>
              <ul className="src-list">
                {haber.taraflar.map((t) => (
                  <li key={t.taraf}>
                    <span className={`st ${t.durum === "alindi" ? "ok" : "wait"}`}>
                      {t.durum === "alindi" ? "✓" : "…"}
                    </span>
                    <span className="desc">
                      {t.taraf} — {t.not}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel" id="surum" aria-label="Sürüm geçmişi">
              <h2>Sürüm Geçmişi</h2>
              <ul className="ver-list">
                {haber.surumler.map((s) => (
                  <li key={s.no}>
                    <span className="v">{s.no}</span>
                    <span>
                      {s.not} · {s.saat}
                    </span>
                    <span className="h">{s.hash}</span>
                  </li>
                ))}
              </ul>
              <p className="footnote">
                Her sürüm, değişmezlik kaydı (hash) ile arşivlenir. Tekzip ve
                düzeltmeler bu listede ayrıca işaretlenir.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="docs" id="belgeler">
        <div className="wrap">
          <h2>Haberin Belgeleri</h2>
          <p className="sub">
            Habere dayanak olan belgeler; her biri değişmezlik kaydıyla
            arşivlenmiştir (temsilî içerik).
          </p>
          <div className="doc-grid">
            {haber.belgeler.map((b) => (
              <div className="doc-card" key={b.id}>
                <span className="tur">{b.tur}</span>
                <h3>{b.baslik}</h3>
                <span className="hash">SHA-256: {b.hash}</span>
                <button type="button" onClick={() => setAcikBelge(b)}>
                  Belgeyi görüntüle
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {acikBelge && (
        <div
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={acikBelge.baslik}
          onClick={(e) => {
            if (e.target === e.currentTarget) setAcikBelge(null);
          }}
        >
          <div className="viewer-box">
            <header>
              <h3>{acikBelge.baslik}</h3>
              <button type="button" onClick={() => setAcikBelge(null)} autoFocus>
                Kapat ✕
              </button>
            </header>
            <div className="viewer-doc">{acikBelge.icerik}</div>
            <p className="viewer-meta">
              Değişmezlik kaydı: <code>SHA-256: {acikBelge.hash}</code> · Bu
              görüntü temsilîdir; gerçek üründe belgenin aslı ve OCR metni
              birlikte sunulur.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
