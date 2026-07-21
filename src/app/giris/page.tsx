import Link from "next/link";
import { redirect } from "next/navigation";
import { getOturumKullanici } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { GirisFormu } from "./GirisFormu";

export const metadata = {
  title: "Giriş — Project FN Editör",
};

export default async function GirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; hata?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next || "/editor";

  if (isSupabaseConfigured()) {
    const user = await getOturumKullanici();
    if (user) redirect(next);
  }

  const hataMesaji =
    sp.hata === "yapilandirma"
      ? "Supabase ortam değişkenleri tanımlı değil. .env.local dosyasını doldurun (bkz. .env.example)."
      : sp.hata === "oturum"
        ? "Oturum açılamadı. Bağlantı süresi dolmuş olabilir; yeniden deneyin."
        : null;

  return (
    <div className="ed-root">
      <div className="ed-appbar">
        <div className="wrap">
          <Link className="ed-logo" href="/">
            PROJECT FN<em>.</em>
            <small>Editör Girişi</small>
          </Link>
          <span className="proto-badge">Geliştirme sürümü</span>
        </div>
      </div>
      <main className="wrap" style={{ maxWidth: 440, paddingTop: 48 }}>
        <section className="ed-panel">
          <header>
            <h2>Editör paneline giriş</h2>
            <span className="hint">Supabase Auth · e-posta + şifre veya magic link</span>
          </header>
          <div className="pad">
            {hataMesaji && (
              <p className="karne-note" role="alert" style={{ marginBottom: 16 }}>
                {hataMesaji}
              </p>
            )}
            {!isSupabaseConfigured() ? (
              <p className="footnote">
                <strong>Yapılandırma gerekli.</strong>{" "}
                <code>NEXT_PUBLIC_SUPABASE_URL</code> ve{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> değerlerini{" "}
                <code>.env.local</code> içine yazın; ardından{" "}
                <code>0003_auth_write_path.sql</code> migration&apos;ını uygulayın.
                Public site tohum veriyle çalışmaya devam eder.
              </p>
            ) : (
              <GirisFormu next={next} />
            )}
            <p className="footnote" style={{ marginTop: 20 }}>
              <Link href="/">← Siteye dön</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
