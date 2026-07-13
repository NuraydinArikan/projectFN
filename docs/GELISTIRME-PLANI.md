# ARC-001 — Gerçek Geliştirmeye Geçiş Planı

**Sürüm:** 0.1 · **Durum:** Uygulanıyor

## Yaklaşım

`tasarim/` altındaki HTML prototipler tasarım referansı olarak kalır; ürün, repo kökündeki **Next.js** uygulamasında geliştirilir. İçerik ilk aşamada `src/lib/veri.ts` içindeki temsilî tohum veriden gelir; Supabase bağlandığında aynı tipler üzerinden veritabanına geçilir — sayfa kodu değişmez.

## Mimari kararlar

| Karar | Seçim | Gerekçe |
|---|---|---|
| Çatı | Next.js (App Router, TypeScript) | Vercel'e doğrudan dağıtım; sunucu bileşenleriyle hızlı ilk yükleme (haber sitesi için kritik) |
| Veritabanı | Supabase (PostgreSQL) | `docs/VERI-MODELI.md` ilişkisel modeline birebir uygun; auth ve depolama hazır |
| Stil | Saf CSS (design token'lar `globals.css`) | Prototiplerdeki token sistemi aynen taşındı; ek bağımlılık yok |
| Karne | `src/lib/karne.ts` — kayıtlardan türetilir | "Karne elle doldurulmaz" ilkesi kodda tek fonksiyonda somutlaşır |

## Aşamalar

1. **İskelet (bu PR):** Ana sayfa + haber detay sayfası gerçek bileşenler ve tipli veri katmanıyla; editör paneli `/editor` altında istemci tarafı çalışan taslak; Supabase şeması `supabase/migrations/0001_init.sql` içinde hazır.
2. **Supabase bağlantısı:** Kurucu ekip bir Supabase projesi açar; `.env.local` dosyasına `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` girilir; migration uygulanır; `veri.ts` tohum veriden Supabase sorgularına geçirilir.
3. **Vercel dağıtımı:** Repo Vercel'e bağlanır; her PR otomatik önizleme alır.
4. **Editoryal iş akışı:** Auth (editör/muhabir rolleri), taslak→onay→yayın akışı, sürüm arşivi (hash).
5. **AI servisleri:** Başlık önerisi, özet üretimi ve hukuki ön tarama için Claude API; tümü editör onayı arkasında.

## Yerelde çalıştırma

```bash
npm install
npm run dev   # http://localhost:3000
```

Supabase olmadan da çalışır (tohum veri). `/` ana sayfa, `/haber/[slug]` detay, `/editor` editör paneli taslağı.
