import Link from "next/link";
import { AnaMenu, Masthead, SiteAlt, SiteUst } from "@/components/SiteUst";
import { KarneKutusu } from "@/components/KarneKutusu";
import {
  getDigerHaberler,
  getGundemAkisi,
  getMansetHaber,
} from "@/lib/veri";

export default async function AnaSayfa() {
  const [manset, digerler, akis] = await Promise.all([
    getMansetHaber(),
    getDigerHaberler(),
    getGundemAkisi(),
  ]);

  return (
    <>
      <SiteUst canli />
      <Masthead />
      <AnaMenu />

      <section className="hero">
        <div className="wrap">
          <div>
            <Link className="kicker" href={`/haber/${manset.slug}`}>
              {manset.kicker}
            </Link>
            <h1 className="headline">
              <Link href={`/haber/${manset.slug}`}>{manset.baslik}</Link>
            </h1>
            <p className="spot">{manset.spot}</p>
            <div className="hero-ozet">
              <p>
                <strong>Özet:</strong> {manset.ozet}
              </p>
              <Link className="devam" href={`/haber/${manset.slug}`}>
                Dosyanın tamamı: kronoloji, belgeler ve taraf görüşleri →
              </Link>
            </div>
          </div>
          <KarneKutusu haber={manset} />
        </div>
      </section>

      <section className="timeline">
        <div className="wrap">
          <span className="label">Haberin Kronolojisi</span>
          <div className="tl-track">
            {manset.kronoloji.slice(-4).map((d) => (
              <div className={`tl-item${d.simdi ? " now" : ""}`} key={d.tarih}>
                <time>{d.tarih}</time>
                <p>{d.baslik}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stories">
        <div className="wrap">
          <div className="story-list">
            {digerler.map((h) => (
              <article className="story" key={h.baslik}>
                <span className="kicker">{h.kicker}</span>
                <h3>
                  <Link href={h.slug === "#" ? "/" : `/haber/${h.slug}`}>
                    {h.baslik}
                  </Link>
                </h3>
                <p className="sum">{h.ozet}</p>
                <div className="kunye">
                  {h.rozetler.map((r) => (
                    <span
                      key={r.metin}
                      className={`chip${r.ton === "notr" ? "" : ` ${r.ton}`}`}
                    >
                      {r.metin}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="akis" aria-label="Gündem akışı">
            <h2>Gündem Akışı</h2>
            {akis.map((a) => (
              <div className="akis-item" key={a.saat}>
                <time>{a.saat}</time>
                <p>{a.metin}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <SiteAlt sag="Doğrulama karnesi · Kronoloji · Okuma modları · Kaynak karşılaştırma" />
    </>
  );
}
