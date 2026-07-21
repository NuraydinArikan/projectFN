"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cikisYap, haberOlustur } from "./actions";
import type { EditorHaberOzeti } from "@/lib/editor-types";

export function EditorListe({
  haberler,
  gazeteciAd,
  yazmaHazir,
}: {
  haberler: EditorHaberOzeti[];
  gazeteciAd: string;
  yazmaHazir: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [baslik, setBaslik] = useState("");
  const [hata, setHata] = useState<string | null>(null);

  function yeniHaber(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) return;
    setHata(null);
    startTransition(async () => {
      const r = await haberOlustur({ baslik: baslik.trim() });
      if (!r.ok) {
        setHata(r.hata);
        return;
      }
      router.push(`/editor/${r.data.id}`);
      router.refresh();
    });
  }

  function cikis() {
    startTransition(async () => {
      await cikisYap();
      router.replace("/giris");
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
            <span className="hint">{gazeteciAd}</span>
            <button className="btn" type="button" onClick={cikis} disabled={pending}>
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <main className="wrap" style={{ paddingTop: 28, paddingBottom: 48 }}>
        {!yazmaHazir && (
          <p className="karne-note" role="alert">
            <strong>SUPABASE_SERVICE_ROLE_KEY</strong> tanımlı değil. Giriş
            yapılmış olsa da veritabanına yazılamaz.{" "}
            <code>.env.local</code> ve migration{" "}
            <code>0003_auth_write_path.sql</code> gerekli.
          </p>
        )}

        <section className="ed-panel" style={{ marginBottom: 24 }}>
          <header>
            <h2>Yeni haber</h2>
            <span className="hint">haber tablosuna gerçek insert</span>
          </header>
          <div className="pad">
            <form className="ekle-form" onSubmit={yeniHaber}>
              <div className="field">
                <label htmlFor="yeni-baslik">Başlık</label>
                <input
                  id="yeni-baslik"
                  className="baslik"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  placeholder="Haber başlığı"
                  disabled={!yazmaHazir || pending}
                />
              </div>
              {hata && (
                <p className="karne-note" role="alert">
                  {hata}
                </p>
              )}
              <button
                className="btn primary"
                type="submit"
                disabled={!yazmaHazir || pending || !baslik.trim()}
              >
                {pending ? "Oluşturuluyor…" : "Taslak oluştur"}
              </button>
            </form>
          </div>
        </section>

        <section className="ed-panel">
          <header>
            <h2>Haberler</h2>
            <span className="hint">{haberler.length} kayıt</span>
          </header>
          <div className="pad">
            {haberler.length === 0 ? (
              <p className="footnote">
                Henüz haber yok veya yazma yolu bağlı değil. Yeni taslak
                oluşturun.
              </p>
            ) : (
              <ul className="kayit-list">
                {haberler.map((h) => (
                  <li key={h.id}>
                    <span className={`tur-chip ${h.durum === "yayinda" ? "resmi" : "bagimsiz"}`}>
                      {h.durum}
                    </span>
                    <Link href={`/editor/${h.id}`}>{h.baslik}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
