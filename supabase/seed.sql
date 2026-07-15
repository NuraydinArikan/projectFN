-- Demo veri: ana sayfa, haber detay ve editör paneli prototiplerinde kullanılan
-- temsilî ihale dosyası. Gerçek editoryal veriye geçildiğinde bu satırlar silinip
-- yerine gerçek haberler girilecek. Tüm içerik temsilîdir; gerçek kişi ve
-- kurumları konu almaz.

insert into olay (id, ad, aciklama) values
  ('a1000000-0000-0000-0000-000000000001', 'Deprem Bölgesi Konut İhaleleri', 'Kentsel dönüşüm ihalelerinde ortaklık yapısı kesişen üç şirket dosyası (temsilî).');

insert into gazeteci (id, ad, rol) values
  ('b1000000-0000-0000-0000-000000000001', 'A. Yılmaz (temsilî)', 'muhabir');

insert into haber (id, slug, kicker, baslik, spot, govde_ozet, govde_detay, durum, yazar_id, olay_id, yayin_tarihi, guncelleme_tarihi) values
  ('c1000000-0000-0000-0000-000000000001', 'deprem-bolgesi-konut-ihaleleri', 'Dosya · Kentsel Dönüşüm',
   'Deprem bölgesindeki konut ihalelerinde aynı üç şirket: Belgeler ne anlatıyor?',
   'Örnek dosya haberi — son iki yılda açılan 41 ihalenin dökümü, kamu kayıtları ve saha görüşmeleriyle birlikte incelendi.',
   'Kamu kayıtlarına göre 41 ihalenin 28''i, ortaklık yapıları kesişen üç şirkette toplandı. Sayıştay 2025''te rekabet uyarısı yapmıştı. İki bağımsız sektör kaynağı şartnamelerin önceden paylaşıldığını iddia ediyor (belgeyle henüz desteklenmedi). Şirketlerden ikisi yanıt verdi; kurum 12 gündür sessiz.',
   '[
     {"tip":"p","kaynak":"resmi","metin":"Kamu ihale platformu kayıtlarına göre, bölgede son iki yılda açılan 41 konut ihalesinin 28''i üç şirket tarafından kazanıldı. İhale sonuç ilanlarının tam listesi haberin ekindedir.","belge_ref":"e1000000-0000-0000-0000-000000000001"},
     {"tip":"p","kaynak":"resmi","metin":"Ticaret sicili kayıtları, üç şirketin ortaklık yapılarının iki isim üzerinden kesiştiğini gösteriyor. Şirketlerin kuruluş tarihleri, ilk ihale ilanlarından 4 ila 7 ay öncesine denk geliyor.","belge_ref":"e1000000-0000-0000-0000-000000000002"},
     {"tip":"h2","kaynak":"resmi","metin":"Sayıştay raporundaki uyarı"},
     {"tip":"p","kaynak":"resmi","metin":"Ağustos 2025 tarihli Sayıştay raporunda, aynı ihale paketlerine ilişkin \"yeterlik kriterlerinin rekabeti daraltacak biçimde belirlendiği\" tespitine yer verildi.","belge_ref":"e1000000-0000-0000-0000-000000000003"},
     {"tip":"h2","kaynak":"bagimsiz","metin":"Sektörden iki kaynak ne diyor?"},
     {"tip":"p","kaynak":"bagimsiz","metin":"İhale süreçlerine yakın, isimlerinin saklı tutulmasını isteyen iki sektör kaynağı, şartname taslaklarının ilandan önce belirli firmalarla paylaşıldığı iddiasını dile getirdi. Bu iddia, ikinci bir bağımsız kaynak tarafından teyit edildi; ancak yazılı belgeyle henüz desteklenmiyor."},
     {"tip":"h2","kaynak":"saha","metin":"Sahadan gözlemler"},
     {"tip":"p","kaynak":"saha","metin":"Muhabirimizin şantiye bölgesindeki gözlemleri ve konut hak sahipleriyle yaptığı görüşmeler, teslim takviminin ilan edilen tarihlerin gerisinde olduğunu gösteriyor. Saha kayıtları konum doğrulamalıdır."},
     {"tip":"h2","kaynak":"resmi","metin":"Tarafların yanıtları"},
     {"tip":"p","kaynak":"resmi","metin":"Üç şirketten ikisi yazılı açıklama gönderdi; açıklamaların tam metni haberin ekindedir. İhaleleri açan kurum, yazılı sorularımıza 12 gündür yanıt vermedi. Yanıt geldiğinde haber güncellenecek ve sürüm geçmişine işlenecektir."}
   ]'::jsonb,
   'yayinda', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   now() - interval '5 hours', now());

insert into kaynak (id, tur, ad, guven_notu) values
  ('d1000000-0000-0000-0000-000000000001', 'resmi_kurum', 'Kamu ihale platformu sonuç ilanları', '41 ilan'),
  ('d1000000-0000-0000-0000-000000000002', 'resmi_kurum', 'Ticaret sicili ortaklık kayıtları', null),
  ('d1000000-0000-0000-0000-000000000003', 'resmi_kurum', 'Sayıştay raporu (Ağustos 2025)', null),
  ('d1000000-0000-0000-0000-000000000004', 'bagimsiz_kisi', 'Birinci sektör kaynağı', 'Kimliği yayın yönetiminde saklı'),
  ('d1000000-0000-0000-0000-000000000005', 'bagimsiz_kisi', 'İkinci sektör kaynağı', 'Çapraz teyit'),
  ('d1000000-0000-0000-0000-000000000006', 'resmi_kurum', 'İhale kurumunun yanıtı', '12 gündür bekleniyor');

insert into haber_kaynak (haber_id, kaynak_id, dogrulama_durumu) values
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'dogrulandi'),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'dogrulandi'),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'dogrulandi'),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'dogrulandi'),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'dogrulandi'),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'teyit_bekliyor');

insert into belge (id, tur, baslik, sha256, icerik_ozeti) values
  ('e1000000-0000-0000-0000-000000000001', 'kayit', 'İhale sonuç ilanları dökümü (41 ilan)', 'a3f8b2…c21e', 'Toplam 41 ilan: Şirket A 12, Şirket B 10, Şirket C 6, diğer 9 firma 13.'),
  ('e1000000-0000-0000-0000-000000000002', 'resmi_yazi', 'Ticaret sicili ortaklık kayıtları', '7d02e9…9b4f', 'Şirket A/B/C ortaklık yapıları iki ortak isim üzerinden kesişiyor.'),
  ('e1000000-0000-0000-0000-000000000003', 'rapor', 'Sayıştay raporu — ilgili bölüm', 'e5614a…0a8c', 'Yeterlik kriterlerinin rekabeti daralttığı tespiti (Ağustos 2025).');

insert into haber_belge (haber_id, belge_id) values
  ('c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003');

insert into varlik (id, tur, ad) values
  ('f1000000-0000-0000-0000-000000000001', 'kurum', 'Şirket A'),
  ('f1000000-0000-0000-0000-000000000002', 'kurum', 'Şirket B'),
  ('f1000000-0000-0000-0000-000000000003', 'kurum', 'Şirket C'),
  ('f1000000-0000-0000-0000-000000000004', 'kurum', 'İhale kurumu');

insert into haber_varlik (haber_id, varlik_id, rol, gorus_alindi, gorus_notu) values
  ('c1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'taraf', true, 'yazılı açıklama ekli'),
  ('c1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'taraf', true, 'yazılı açıklama ekli'),
  ('c1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 'taraf', false, 'ulaşılamadı, süreç sürüyor'),
  ('c1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 'taraf', false, 'yanıt bekleniyor');

insert into haber_surum (haber_id, surum_no, not_metni, icerik, sha256, created_at) values
  ('c1000000-0000-0000-0000-000000000001', '1.0', 'İlk yayın', '{}', 'a3f8…c21e', now() - interval '5 hours'),
  ('c1000000-0000-0000-0000-000000000001', '1.1', 'Şirket açıklamaları eklendi', '{}', '7d02…9b4f', now() - interval '2 hours'),
  ('c1000000-0000-0000-0000-000000000001', '1.2', 'Belge seti genişletildi', '{}', 'e561…0a8c', now());

insert into olay_dugumu (olay_id, tarih, baslik, ozet, sira) values
  ('a1000000-0000-0000-0000-000000000001', '2025-03-01', 'İlk ihale paketi ilan edildi', '12 ihalelik ilk paket kamu platformunda yayımlandı.', 1),
  ('a1000000-0000-0000-0000-000000000001', '2025-05-01', 'İlk sonuçlar açıklandı', '12 ihalenin 9''unu aynı iki şirket kazandı.', 2),
  ('a1000000-0000-0000-0000-000000000001', '2025-08-01', 'Sayıştay raporunda usül uyarısı', '"Yeterlik kriterleri rekabeti daraltıyor" tespiti rapora girdi.', 3),
  ('a1000000-0000-0000-0000-000000000001', '2025-11-01', 'İkinci ihale paketi', '29 ihalelik ikinci paket açıldı; üçüncü şirket bu dönemde devreye girdi.', 4),
  ('a1000000-0000-0000-0000-000000000001', '2026-02-01', 'Muhalefet soru önergesi verdi', 'Önerge metni ve kurumun kısa yanıtı arşivde.', 5),
  ('a1000000-0000-0000-0000-000000000001', '2026-07-15', 'Belgeler yayımlandı, kurum yanıtı bekleniyor', 'Bu haberle birlikte üç belge kamuoyuna açıldı; kurumun yanıtı geldiğinde dosya güncellenecek.', 6);
