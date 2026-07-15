# DAT-001 — Veri Modeli: Haber Bir Bilgi Nesnesidir

**Sürüm:** 0.1 (taslak) · **Hedef:** Supabase / PostgreSQL

Amaç: Haberi metin olarak değil, doğrulanabilir ve ilişkilendirilebilir bir nesne olarak saklamak. Arayüz sade başlar; bu model sayesinde kronoloji, doğrulama karnesi ve bilgi grafiği sonradan *veri değişmeden* açılabilir.

## Çekirdek varlıklar

```
haber (story)
├── id, baslik, spot, govde_ozet, govde_detay
├── durum: taslak | editörde | yayında | güncellendi | tekzip
├── yazar_id → gazeteci
├── olay_id → olay (bir olayın birden çok haberi olur)
└── yayin_tarihi, guncelleme_tarihi

olay (event)            ← kronolojinin omurgası
├── id, ad, aciklama
└── kronoloji: olay_dugumu[] (tarih + başlık + haber_id?)

kaynak (source)
├── tur: bağımsız kişi | resmî kurum | belge | ajans | sosyal medya
├── guven_notu, dogrulama_durumu: doğrulandı | teyit bekliyor | yalanlandı
└── haber_kaynak (n-n): hangi haber hangi kaynağa dayanıyor

belge (document)
├── dosya_url, tur: mahkeme | resmî yazı | rapor | kanun maddesi
├── hash (erişim engeli arşivi için değişmezlik kaydı)
└── haber_belge (n-n)

kisi / kurum (entity)
└── haber_varlik (n-n, rol: taraf | tanık | yetkili | konu, gorus_alindi: boolean)
    → gorus_alindi alanı doğrulama karnesini besler

tekzip_duzeltme
├── haber_id, tur: tekzip | düzeltme | güncelleme
└── metin, tarih, karneye_islendi

haber_surum              ← her yayın değişikliğinin tam kopyası + hash
```

## Doğrulama karnesi = sorgu, alan değil

Karne ayrı bir tablo değildir; şu sayımlardan türetilir:

- bağımsız kaynak sayısı → `haber_kaynak` (tur = bağımsız, durum = doğrulandı)
- belge sayısı → `haber_belge`
- taraf görüşü → `haber_varlik` (rol = taraf, gorus_alindi)
- tekzip → `tekzip_duzeltme`

Böylece karne asla elle doldurulmaz; editoryal iş akışı veriyi girdiğinde karne kendiliğinden oluşur. **Karnenin dürüstlüğü, ürünün güvenilirlik iddiasının teknik garantisidir.**

## Okuma modları

`govde_ozet` ve `govde_detay` ayrı alanlardır; özet AI tarafından önerilir, **editör onaylamadan yayımlanmaz**. Sesli sürüm, onaylı özetten üretilir.

## Sonraki adım

Bu şema Supabase migration'ı olarak yazılmadan önce kurucu ekiple bir tur gözden geçirilecek (özellikle `kaynak.tur` sınıflandırması ve tekzip akışı).
