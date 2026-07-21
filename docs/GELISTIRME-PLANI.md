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

1. ✅ **İskelet:** Ana sayfa + haber detay sayfası gerçek bileşenler ve tipli veri katmanıyla; editör paneli `/editor` altında istemci tarafı çalışan taslak; Supabase şeması `supabase/migrations/0001_init.sql` içinde hazır.
2. ✅ **Supabase bağlantısı:** `projectfn` Supabase projesi (eu-central-1) kuruldu; şema + RLS politikaları (`0001_init.sql`, `0002_rls_public_read.sql`) ve demo veri (`seed.sql`) uygulandı. `src/lib/veri.ts` artık Supabase bağlıysa gerçek sorgu yapar, bağlı değilse tohum veriye düşer — sayfa kodu değişmedi. Doğrulama karnesi `haber_karne` veritabanı görünümünden okunuyor; elle hesaplanmıyor.
3. **Vercel dağıtımı:** Repo Vercel'e bağlandı (önizleme dağıtımı canlı); ortam değişkenleri (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) Vercel proje ayarlarına eklenmeli ki dağıtım da gerçek veriyi göstersin. Git entegrasyonu (her PR otomatik önizleme) henüz kurulmadı.
4. ✅ **Editoryal iş akışı (temel):** Supabase Auth (`/giris`), middleware ile `/editor` koruması, Server Action + service role ile `haber` / `haber_kaynak` / `haber_belge` / `haber_varlik` yazma, yayın eşiği sunucuda (`yayinEsigiSaglandi`). Migration: `0005_auth_write_path.sql`. Rol ayrımı ve onay kuyruğu sonraki ince ayar.
4b. ✅ **Yetki ve gizlilik sıkılaştırması (`0006_yetki_ve_rls.sql`):** Erişim davet tabanlı hâle getirildi — oturum açan kullanıcı kendiliğinden editör olamaz, `gazeteci` satırı önceden e-postayla açılır ve `aktif` alanıyla yetkilendirilir. Yayına gönderme yalnız `editor` / `yayin_yonetmeni` rollerinde. RLS bağ tablolarına yayıldı: taslak haberlerin kaynakları, anonim kaynak notları, alınmamış taraf görüşleri ve yayımlanmamış belgeler artık anon anahtarla okunamıyor. `gazeteci.email` kolon yetkisiyle kapatıldı. `haber_karne` görünümü `security_invoker` ile RLS'e tabi kılındı (view'lar varsayılan olarak sahibinin haklarıyla çalışır ve politikayı baypas eder) ve `resmi_kaynak` sayımı eklendi.

    **Kurulum notu:** Supabase → Authentication → Providers → Email → "Allow new users to sign up" kapatılmalıdır; ayrıntı için `.env.example`.

5. **AI servisleri:** Başlık önerisi, özet üretimi ve hukuki ön tarama için Claude API; tümü editör onayı arkasında.

### Supabase erişim notu

Proje `projectfn` adıyla "Nuraydin" organizasyonunda, `eu-central-1` bölgesinde açıldı (ref: `etbewemhrhqrauldskuf`). Ücretsiz plan hesap başına 2 aktif proje ile sınırlı olduğu için, bu projeyi açmak amacıyla kullanılmayan `algorithmless` projesi duraklatıldı (silinmedi — Supabase panelinden istendiğinde devam ettirilebilir).

## Yerelde çalıştırma

```bash
npm install
npm run dev   # http://localhost:3000
```

Supabase olmadan da çalışır (tohum veri). `/` ana sayfa, `/haber/[slug]` detay, `/editor` editör paneli taslağı.
