# VIS-001 — Project FN Vizyon Dokümanı

**Sürüm:** 0.1 (taslak) · **Tarih:** 13 Temmuz 2026 · **Durum:** Kurucu ekip onayı bekliyor

## 1. Tez

Türkiye'de haber siteleri hızlı ama doğrulaması zayıf; okur, bir haberin kaç kaynağa dayandığını, hangi belgeye yaslandığını ve zaman içinde nasıl geliştiğini göremiyor. Project FN'nin tezi şudur:

> **Haber, tek başına bir metin değil; doğrulanabilir ve ilişkilendirilebilir bir bilgi nesnesidir.**

Kurucu ekibin 30 yıllık televizyon ve araştırmacı gazetecilik birikimi (Arena, Deşifre, CNN Türk, Habertürk), bu tezi Türkiye'de ilk uygulayan platform olmak için gereken editoryal güvenilirliği sağlar.

## 2. Okur neden bizi açsın? (İlk sürümün 4 farklılaştırıcısı)

1. **Doğrulama Karnesi** — Her haberin yanında: kaç bağımsız kaynak, kaç resmî belge, taraf görüşleri alındı mı, tekzip/düzeltme var mı. Karne editoryal iş akışının çıktısıdır; süs değil.
2. **Haberin Kronolojisi** — Olay bazlı zaman çizelgesi. Okur bir dosyayı takibe alır; gelişme olduğunda "son dakika spam'i" değil, "takip ettiğiniz dosyada gelişme" bildirimi alır.
3. **"Bu haberi kim, nasıl verdi?"** — Aynı olayın farklı yayın organlarındaki sunumunun karşılaştırması (Ground News yaklaşımının Türkçe uyarlaması).
4. **Okuma Modları** — Aynı haber: 2 dakikalık özet / detaylı anlatım / sesli dinleme. İçerik bir kez üretilir, çok formatta sunulur.

İlk sürüm bu dördüne odaklanır. Diğer her şey (muhabir paneli, bilgi grafiği arayüzü, API ürünleri) mimaride öngörülür ama sonraya bırakılır.

## 3. Yapay zekânın yeri

AI haber **yazmaz**; imza her zaman gazetecinindir. AI'nın üç görevi:

- **Editöre yardım:** bülten → taslak, başlık/SEO önerisi, benzer ve eski haberleri ilişkilendirme, eksik bilgi uyarısı, hukuki risk ön taraması (hakaret/tekzip riski işaretleme — nihai karar editörde).
- **Doğrulamayı hızlandırma:** belge özeti, çelişki tespiti, kaynak geçmişi.
- **Okur deneyimi:** özetleme, seslendirme, kişisel akış ("bana Ankara + ekonomi göster").

## 4. Türkiye'ye özgü tasarım zorunlulukları

- **Erişim engeline dayanıklılık:** Haberin sürüm geçmişi ve hash'li kayıt arşivi ilk günden mimaride.
- **Tekzip süreç yönetimi:** Tekzip/düzeltme, editör panelinde takip edilen resmî bir iş akışıdır ve karneye işlenir.
- **Dağıtım:** WhatsApp/Telegram kanalları ve push bildirimi, web trafiğinden önce gelir. Bildirim stratejisi ürünün kendisidir.

## 5. Gelir modeli (öncelik sırasıyla)

1. Premium üyelik (reklamsız + dosya takibi + arşiv)
2. Reklam (programatik değil, doğrudan satış ağırlıklı; güvenilirlik markası zedelenmez)
3. B2B: medya takibi ve doğrulanmış haber akışı API'si (ölçek sonrası)

## 6. Teknoloji kararları (öneri)

- **Web:** Next.js + Vercel
- **Veritabanı/Auth:** Supabase (PostgreSQL) — içerik modeli baştan ilişkisel "bilgi nesnesi" olarak kurulur (bkz. `VERI-MODELI.md`)
- **Mobil:** Önce PWA; yerli uygulama, okur alışkanlığı veriyle kanıtlandıktan sonra
- **AI:** Claude API (editör asistanı, özetleme, risk taraması)

## 7. Yol haritası (kaba)

| Aşama | Süre | Çıktı |
|---|---|---|
| 0 — Tasarım | 2-4 hafta | Ana sayfa + haber detay + editör paneli prototipleri; isim ve marka kararı |
| 1 — MVP | 8-12 hafta | 4 farklılaştırıcıyla yayında; 5-10 dosya haberiyle lansman |
| 2 — Büyüme | 6 ay | Muhabir paneli, üyelik, bildirim sistemi |
| 3 — Platform | 12 ay+ | Bilgi grafiği arayüzü, B2B API, veri gazeteciliği araçları |

## 8. Kurucu ekibin karar vereceği açık konular

- Marka adı ve alan adı (Project FN geliştirme kod adıdır)
- Yayın çizgisi ve etik ilkeler metni
- Şirket/ortaklık yapısı ve ilk yatırım planı
- Genel yayın yönetmeni ve lansman tarihi

## 9. Vazgeçilen fikirler (gerekçesiyle)

- **1.300 sayfalık "Project FN Kitabı":** Üç kişilik ekip için bakım yükü ürün geliştirmeyi geciktirir. Yerine: bu kısa vizyon dokümanı + özellik başına 2-3 sayfalık PRD'ler.
- **İlk günden çok ajanlı AI editör ürünü:** Önce kendi mutfağımızda çalışan tek asistan; ürünleştirme ölçek sonrası değerlendirilir.
- **50 platform analizi:** 8-10 platformun derin analizi yeterli (Semafor, Axios, Ground News, Tortoise, NYT, T24, Oksijen, Bundle).
