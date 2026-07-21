-- Project FN — 0006: Yetki sıkılaştırma ve RLS kapatma
--
-- 0002 içerik tablolarına "herkes okur" (using true) verdi; RLS filtresi yalnız
-- `haber` tablosundaydı. Sonuç: anon anahtarla TASLAK haberlerin kaynakları,
-- anonim kaynak notları, alınmamış taraf görüşleri ve yayımlanmamış belgeler
-- okunabiliyordu. Bir araştırmacı gazetecilik ürününde bu kabul edilemez.
--
-- Bu migration üç şey yapar:
--   1) gazeteci.aktif — davet tabanlı erişim (kendi kendine editör olunamaz)
--   2) İçerik tablolarını "yalnız yayındaki habere bağlıysa görünür" kuralına bağlar
--   3) haber_karne görünümünü RLS'e tabi kılar (security_invoker)

-- ── 1. Gazeteci: davet tabanlı erişim ────────────────────────────────────────

alter table gazeteci
  add column if not exists aktif boolean not null default false;

comment on column gazeteci.aktif is
  'Editör paneline giriş izni. Yeni kayıtlar pasif başlar; yayın yönetmeni açar.';

-- E-posta eşleşmesi büyük/küçük harf duyarsız olmalı (davet akışı buna dayanır).
update gazeteci set email = lower(trim(email)) where email is not null;

-- Migration öncesi oluşmuş ve bir auth kullanıcısına bağlı kayıtlar kilitlenmesin.
update gazeteci set aktif = true where auth_user_id is not null;

-- Gazeteci satırları imza (byline) için herkese açık kalır; ancak e-posta ve
-- auth kimliği kolon düzeyinde kapatılır. PostgREST kolon yetkilerine uyar.
revoke select on gazeteci from anon, authenticated;
grant select (id, ad, rol, created_at) on gazeteci to anon, authenticated;

-- ── 2. İçerik tabloları: yalnız yayındaki haberin kayıtları görünür ──────────
-- Not: aşağıdaki alt sorgular `haber` tablosuna bakar ve `haber` üzerindeki
-- "yayindaki haberler herkese acik" politikası orada da uygulanır. Yani taslak
-- bir haber alt sorguda da görünmez — koşul çift taraflı garanti altındadır.

drop policy if exists "herkes okur" on haber_kaynak;
create policy "yayindaki haberin kaynak baglari" on haber_kaynak
  for select using (
    exists (
      select 1 from haber h
      where h.id = haber_kaynak.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

drop policy if exists "herkes okur" on haber_belge;
create policy "yayindaki haberin belge baglari" on haber_belge
  for select using (
    exists (
      select 1 from haber h
      where h.id = haber_belge.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

drop policy if exists "herkes okur" on haber_varlik;
create policy "yayindaki haberin varlik baglari" on haber_varlik
  for select using (
    exists (
      select 1 from haber h
      where h.id = haber_varlik.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

drop policy if exists "herkes okur" on haber_surum;
create policy "yayindaki haberin surumleri" on haber_surum
  for select using (
    exists (
      select 1 from haber h
      where h.id = haber_surum.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

-- Kaynak / belge / varlık: haber_id taşımazlar; en az bir yayındaki habere
-- bağlıysa görünür. Bağsız (yeni eklenmiş, henüz yayımlanmamış) kayıtlar gizli.

drop policy if exists "herkes okur" on kaynak;
create policy "yayindaki habere bagli kaynaklar" on kaynak
  for select using (
    exists (
      select 1 from haber_kaynak hk
      join haber h on h.id = hk.haber_id
      where hk.kaynak_id = kaynak.id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

drop policy if exists "herkes okur" on belge;
create policy "yayindaki habere bagli belgeler" on belge
  for select using (
    exists (
      select 1 from haber_belge hb
      join haber h on h.id = hb.haber_id
      where hb.belge_id = belge.id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

drop policy if exists "herkes okur" on varlik;
create policy "yayindaki habere bagli varliklar" on varlik
  for select using (
    exists (
      select 1 from haber_varlik hv
      join haber h on h.id = hv.haber_id
      where hv.varlik_id = varlik.id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

-- Kronoloji düğümü: habere bağlıysa haberin yayında olması gerekir; bağsız
-- düğümler (olayın kendi kilometre taşları) açık kalır.
drop policy if exists "herkes okur" on olay_dugumu;
create policy "yayindaki habere bagli kronoloji" on olay_dugumu
  for select using (
    olay_dugumu.haber_id is null
    or exists (
      select 1 from haber h
      where h.id = olay_dugumu.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );

-- Alt sorgular satır başına çalıştığı için bağ tablolarında indeks şart.
create index if not exists haber_kaynak_kaynak_idx on haber_kaynak (kaynak_id);
create index if not exists haber_belge_belge_idx on haber_belge (belge_id);
create index if not exists haber_varlik_varlik_idx on haber_varlik (varlik_id);
create index if not exists olay_dugumu_haber_idx on olay_dugumu (haber_id);

-- ── 3. Karne görünümü RLS'e tabi olsun ───────────────────────────────────────
-- PostgreSQL'de view'lar varsayılan olarak SAHİBİNİN haklarıyla çalışır; yani
-- haber_karne, `haber` üzerindeki politikayı baypas ediyor ve taslak haberlerin
-- slug'ını + karnesini anon'a açıyordu. security_invoker bunu kapatır.
--
-- Ayrıca karne artık resmî kurum kaynaklarını da sayar (karne.ts ile tutarlılık).
-- Karnenin tek doğruluk kaynağı bu görünümdür.
-- Kolon sırası değiştiği için CREATE OR REPLACE yetmez; görünüm yeniden kurulur.
drop view if exists haber_karne;

create view haber_karne
with (security_invoker = on) as
select
  h.id as haber_id,
  h.slug,
  (select count(*) from haber_kaynak hk
     join kaynak k on k.id = hk.kaynak_id
    where hk.haber_id = h.id
      and k.tur = 'bagimsiz_kisi'
      and hk.dogrulama_durumu = 'dogrulandi') as bagimsiz_kaynak,
  (select count(*) from haber_kaynak hk
     join kaynak k on k.id = hk.kaynak_id
    where hk.haber_id = h.id
      and k.tur = 'resmi_kurum'
      and hk.dogrulama_durumu = 'dogrulandi') as resmi_kaynak,
  (select count(*) from haber_belge hb where hb.haber_id = h.id) as resmi_belge,
  (select count(*) from haber_varlik hv
    where hv.haber_id = h.id and hv.rol = 'taraf' and hv.gorus_alindi) as taraf_alinan,
  (select count(*) from haber_varlik hv
    where hv.haber_id = h.id and hv.rol = 'taraf') as taraf_toplam,
  exists (select 1 from tekzip_duzeltme td
    where td.haber_id = h.id and td.tur = 'tekzip') as tekzip,
  h.guncelleme_tarihi
from haber h;

-- Görünüm yeniden kurulduğu için yetkiler açıkça verilir.
grant select on haber_karne to anon, authenticated;
