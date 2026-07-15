import Link from "next/link";
import { notFound } from "next/navigation";
import { AnaMenu, Masthead, SiteAlt, SiteUst } from "@/components/SiteUst";
import { HaberGovde } from "@/components/HaberGovde";
import { getHaber, getTumSluglar } from "@/lib/veri";

export async function generateStaticParams() {
  const sluglar = await getTumSluglar();
  return sluglar.map((slug) => ({ slug }));
}

export default async function HaberSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const haber = await getHaber(slug);
  if (!haber) notFound();

  return (
    <>
      <SiteUst />
      <Masthead />
      <AnaMenu aktif="Dosyalar" />

      <section className="art-head">
        <div className="wrap">
          <Link className="kicker" href="/">
            {haber.kicker}
          </Link>
          <h1>{haber.baslik}</h1>
          <p className="spot">{haber.spot}</p>
          <div className="byline">
            <span>
              Muhabir: <strong>{haber.muhabir}</strong>
            </span>
            <span>
              Yayın: <strong>{haber.yayin}</strong>
            </span>
            <span>
              Son güncelleme: <strong>{haber.guncelleme}</strong>
            </span>
            <span className="ver">
              Sürüm <strong>{haber.surumler.at(-1)?.no}</strong>
            </span>
          </div>
        </div>
      </section>

      <HaberGovde haber={haber} />

      <section className="chrono">
        <div className="wrap">
          <h2>Dosyanın Tam Kronolojisi</h2>
          <p className="sub">
            Bu dosyayı takibe alırsanız, yeni düğüm eklendiğinde bildirim
            alırsınız.
          </p>
          <ol className="ch-list">
            {haber.kronoloji.map((d) => (
              <li className={`ch-item${d.simdi ? " now" : ""}`} key={d.tarih}>
                <time>{d.tarih}</time>
                <h3>{d.baslik}</h3>
                <p>{d.ozet}</p>
                {d.baglantiMetni && (
                  <a className="link-chip" href="#belgeler">
                    {d.baglantiMetni}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SiteAlt sag="Açık karne · Belge arşivi · Tam kronoloji · Kaynak filtresi" />
    </>
  );
}
