# Project FN

**Project FN**, 13 Temmuz 2026 tarihinde Nuraydın Arikan, Nurullah Arikan ve İdris Arikan tarafından, gazeteciliğin dijital çağdaki üretim, doğrulama, ilişkilendirme ve sunum biçimini yeniden tasarlamak amacıyla başlatılmış bir medya teknolojileri girişimidir.

> Haber, doğrulanabilir bir bilgi nesnesidir.

## Depo yapısı

| Klasör | İçerik |
|---|---|
| `docs/` | Vizyon dokümanı, veri modeli, geliştirme planı ve ürün kararları |
| `tasarim/` | HTML tasarım prototipleri (tarayıcıda doğrudan açılabilir) |
| `src/` | Next.js uygulaması (ana sayfa, haber detay, editör paneli) |
| `supabase/` | Veritabanı şeması ve migration dosyaları |

## Uygulamayı çalıştırma

```bash
npm install
npm run dev   # http://localhost:3000
```

Sayfalar: `/` ana sayfa · `/haber/[slug]` haber detay · `/giris` editör girişi · `/editor` editör paneli (oturum zorunlu).

Public site Supabase olmadan tohum veriyle çalışır. Editör yazma yolu için `.env.local` (`NEXT_PUBLIC_*` + `SUPABASE_SERVICE_ROLE_KEY`), migration `supabase/migrations/0003_auth_write_path.sql` ve Supabase Auth kullanıcısı gerekir — bkz. `.env.example` ve `docs/GELISTIRME-PLANI.md`.

## Başlangıç noktaları

- [Vizyon Dokümanı](docs/VIZYON.md) — projenin omurgası, farklılaştırıcı özellikler ve yol haritası
- [Veri Modeli](docs/VERI-MODELI.md) — "haber = bilgi nesnesi" yaklaşımının ilk şeması
- [Ana Sayfa Prototipi](tasarim/anasayfa.html) — doğrulama karnesi, kronoloji, okuma modları ve kaynak karşılaştırma modülleri
- [Haber Detay Prototipi](tasarim/haberdetay.html) — açılmış doğrulama karnesi, belge görüntüleyici, tam kronoloji ve resmî kaynak filtresi
- [Editör Paneli Prototipi](tasarim/editorpaneli.html) — canlı doğrulama karnesi, yayın eşiği, hukuki risk ön taraması ve AI başlık önerileri
- [Geliştirme Planı](docs/GELISTIRME-PLANI.md) — prototiplerden canlı koda geçiş aşamaları (Next.js + Supabase)
- [Yönetici Özeti](docs/YONETICI-OZETI.md) — projenin tek sayfalık güncel durumu; yeni bir sohbette bağlam olarak kullanılabilir

## Çalışma ilkesi

Bu depo projenin **kurumsal hafızasıdır**: alınan kararlar, gerekçeleri ve vazgeçilen fikirler `docs/` altında sürümlenerek tutulur. Uzun tek bir "kitap" yerine, kısa ve yaşayan dokümanlarla ilerlenir.
