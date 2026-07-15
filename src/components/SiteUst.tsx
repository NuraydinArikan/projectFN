import Link from "next/link";

const bugun = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

export function SiteUst({ canli = false }: { canli?: boolean }) {
  return (
    <div className="topbar">
      <div className="wrap">
        <span className="proto-badge">Geliştirme sürümü · örnek içerik</span>
        <span className="date">{bugun.format(new Date())}</span>
        {canli && (
          <span className="live">
            <span className="live-dot" /> CANLI
          </span>
        )}
      </div>
    </div>
  );
}

export function Masthead() {
  return (
    <header className="mast">
      <div className="wrap">
        <Link className="logo" href="/">
          PROJECT FN<em>.</em>
        </Link>
        <div className="tagline">Haber, doğrulanabilir bir bilgi nesnesidir.</div>
      </div>
    </header>
  );
}

const menu = ["Gündem", "Dosyalar", "Doğrulama", "Ekonomi", "Ankara", "Video", "Veri", "Arşiv"];

export function AnaMenu({ aktif = "Gündem" }: { aktif?: string }) {
  return (
    <nav className="mainnav" aria-label="Ana menü">
      <div className="wrap">
        {menu.map((m) => (
          <Link key={m} href="/" className={m === aktif ? "active" : undefined}>
            {m}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function SiteAlt({ sag }: { sag: string }) {
  return (
    <footer className="site">
      <div className="wrap">
        <span>
          PROJECT FN. — Geliştirme sürümü. Tüm haberler temsilîdir; gerçek kişi
          ve kurumları konu almaz.
        </span>
        <span>{sag}</span>
      </div>
    </footer>
  );
}
