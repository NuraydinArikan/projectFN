# Project FN — Yönetici Özeti

**Tarih:** 15 Temmuz 2026 · **Durum:** Geliştirme sürümü canlı, isim/marka kararı bekleniyor

> Bu doküman, projenin güncel durumunu tek sayfada özetler. Yeni bir sohbette bağlam olarak doğrudan kullanılabilir.

## Nedir

Project FN (geliştirme kod adı), Nuraydın, Nurullah ve İdris Arikan kardeşlerin kurduğu, Türkiye'de yayına hazırlanan yeni nesil bir dijital haber platformudur. Kurucuların 30 yıllık televizyon haberciliği (Arena, Deşifre, CNN Türk, Habertürk) ve araştırmacı gazetecilik birikimini, yapay zekâ destekli bir editoryal sistemle birleştirmeyi hedefler.

**Tez:** Haber, tek başına bir metin değil; doğrulanabilir ve ilişkilendirilebilir bir bilgi nesnesidir.

## Yapı

| Katman | Teknoloji | Durum |
|---|---|---|
| Kod deposu | GitHub (`nuraydinarikan/projectfn`) | main dalı, tek kaynak |
| Web uygulaması | Next.js (App Router, TypeScript) | `/` ana sayfa, `/haber/[slug]` detay, `/editor` editör paneli |
| Veritabanı | Supabase (PostgreSQL) | Şema + RLS + demo veri canlı |
| Yayın | Vercel | Git bağlantılı — her `main` push'u otomatik dağıtılır |
| Canlı adres | `projectfn-iota.vercel.app` | Herkese açık, koruma kapalı |

Veri modelinin çekirdeği: `haber`, `kaynak`, `belge`, `varlik` (kişi/kurum), `olay_dugumu` (kronoloji), `haber_surum` (sürüm arşivi) tabloları ve bunlardan otomatik türeyen `haber_karne` görünümü.

## Diğer haber sitelerinden farkı

Türkiye'deki mevcut haber siteleri hız ve hacim odaklıdır; okur bir haberin kaç kaynağa dayandığını, hangi belgeyle desteklendiğini veya zaman içinde nasıl değiştiğini göremez. Project FN'nin ilk sürümü dört somut farkla ayrışır:

1. **Doğrulama Karnesi** — Her haberin yanında kaç bağımsız kaynak, kaç resmî belge, taraf görüşü alınıp alınmadığı görünür. Bu karne editörün elle doldurduğu bir alan değildir; veritabanındaki kayıtlardan otomatik hesaplanan bir sorgudur (`haber_karne` görünümü) — yani editoryal disiplinin sahtesi yapılamaz.
2. **Haberin Kronolojisi** — Bir olayın tüm gelişmeleri zaman çizelgesinde birbirine bağlanır; okur "son dakika" bildirimi yerine takip ettiği dosyada gelişme olduğunda haberdar olur.
3. **"Bu haberi kim, nasıl verdi?"** — Aynı olayın farklı yayın organlarındaki sunumu karşılaştırmalı gösterilir (Ground News yaklaşımının Türkçe uyarlaması).
4. **Okuma Modları** — Aynı haber özet, detaylı anlatım veya sesli formatta sunulur; içerik bir kez üretilir, okurun tercihine göre şekil değiştirir.

## Getirdiği yenilik

- **AI, editöre yardım eder — haber yazmaz.** Editör panelinde başlık önerisi ve hukuki risk ön taraması (tekzip riski, eksik bilgi, kişilik hakları) yer alır; nihai karar ve imza her zaman gazetecinindir.
- **Yayın eşiği koda gömülüdür.** Bir haber için asgari doğrulama (2 kaynak/belge + 1 taraf görüşü) sağlanmadan "yayına gönder" düğmesi aktifleşmez.
- **TV haberciliğinin akış/hikâye mantığı dijitale taşınır.** Bir olay yalnızca tek bir haber değil; kronoloji, ilgili belgeler, taraflar ve geçmiş gelişmelerle birlikte küçük bir "haber + bilgi grafiği" bütünü olarak sunulur.
- **Türkiye'ye özgü mimari kararlar ilk günden var:** erişim engeli ihtimaline karşı hash'li sürüm arşivi, tekzip/düzeltme süreçlerinin editoryal iş akışına ve karneye işlenmesi.

## Şu ana kadar yapılanlar

- Vizyon dokümanı, veri modeli, geliştirme planı (`docs/`)
- Üç tasarım prototipi → gerçek Next.js sayfalarına dönüştürüldü
- Supabase projesi kuruldu, şema + güvenlik politikaları + demo veri yüklendi
- Vercel production'da canlı, GitHub ile otomatik dağıtım bağlantısı kuruldu
- İlk PR main dalına birleştirildi; proje artık "kod → GitHub → otomatik dağıtım" döngüsünde çalışıyor

## Bundan sonra yapılması gerekenler

**Kurucu ekibin karar vereceği konular** (teknik değil, stratejik):
- Marka adı ve alan adı (kod adı Project FN olarak kalabilir; aday isim listesi hazır, örn. "Tanık")
- Yayın çizgisi, etik sınırlar, siyasi tarafsızlık ilkeleri
- Şirket/ortaklık yapısı, ilk yatırım planı
- Genel yayın yönetmeni, ilk lansman tarihi

**Geliştirme tarafında sıradaki adımlar:**
- Muhabir paneli (sahadan ses/görüntü/konum → AI destekli taslak) prototipi
- Editoryal roller ve kimlik doğrulama (editör/muhabir/yayın yönetmeni ayrımı)
- Editör panelinin gerçek veritabanına yazması (şu an istemci tarafında temsilî)
- Claude API ile AI servislerinin gerçek entegrasyonu (başlık önerisi, özetleme, hukuki ön tarama)
- Gerçek editoryal içeriğin girilmeye başlanması (demo veri kaldırılıp ilk gerçek haberler yayımlanır)
