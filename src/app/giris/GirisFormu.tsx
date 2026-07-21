"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function GirisFormu({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [magicGonderildi, setMagicGonderildi] = useState(false);

  async function sifreIleGiris(e: React.FormEvent) {
    e.preventDefault();
    setMesaj(null);
    setYukleniyor(true);
    try {
      const supabase = createBrowserSupabase();
      if (!supabase) {
        setMesaj("Supabase yapılandırılmamış.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: sifre,
      });
      if (error) {
        setMesaj(error.message);
        return;
      }
      router.replace(next);
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  async function magicLinkGonder() {
    setMesaj(null);
    setYukleniyor(true);
    try {
      const supabase = createBrowserSupabase();
      if (!supabase) {
        setMesaj("Supabase yapılandırılmamış.");
        return;
      }
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setMesaj(error.message);
        return;
      }
      setMagicGonderildi(true);
      setMesaj("Giriş bağlantısı e-postanıza gönderildi (magic link).");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <form className="ekle-form" onSubmit={sifreIleGiris}>
      <div className="field">
        <label htmlFor="email">E-posta</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="editor@ornek.com"
        />
      </div>
      <div className="field">
        <label htmlFor="sifre">Şifre</label>
        <input
          id="sifre"
          type="password"
          autoComplete="current-password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="E-posta + şifre ile giriş"
        />
      </div>
      {mesaj && (
        <p
          className={`karne-note${magicGonderildi ? " ok" : ""}`}
          role="status"
          style={{ marginBottom: 12 }}
        >
          {mesaj}
        </p>
      )}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className="btn primary" type="submit" disabled={yukleniyor || !sifre}>
          {yukleniyor ? "Giriş…" : "Şifre ile giriş"}
        </button>
        <button
          className="btn"
          type="button"
          disabled={yukleniyor || !email.trim()}
          onClick={magicLinkGonder}
        >
          Magic link gönder
        </button>
      </div>
      <p className="footnote" style={{ marginTop: 14 }}>
        Hesaplar Supabase Authentication panelinden oluşturulur. İlk girişte
        gazeteci kaydı otomatik açılır.
      </p>
    </form>
  );
}
