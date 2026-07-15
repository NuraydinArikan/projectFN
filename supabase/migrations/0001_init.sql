-- Project FN — İlk şema (DAT-001 / docs/VERI-MODELI.md)
-- İlke: Haber bir bilgi nesnesidir; doğrulama karnesi elle doldurulmaz,
-- kayıtlardan türetilir (bkz. karne görünümü en altta).

create table olay (
  id uuid primary key default gen_random_uuid(),
  ad text not null,
  aciklama text,
  created_at timestamptz not null default now()
);

create table gazeteci (
  id uuid primary key default gen_random_uuid(),
  ad text not null,
  rol text not null check (rol in ('muhabir', 'editor', 'yayin_yonetmeni')),
  created_at timestamptz not null default now()
);

create table haber (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kicker text,
  baslik text not null,
  spot text,
  govde_ozet text,
  govde_detay jsonb, -- bolumler: [{tip, kaynak, metin, belge_ref}]
  durum text not null default 'taslak'
    check (durum in ('taslak', 'editorde', 'yayinda', 'guncellendi', 'tekzip')),
  yazar_id uuid references gazeteci(id),
  olay_id uuid references olay(id),
  yayin_tarihi timestamptz,
  guncelleme_tarihi timestamptz,
  created_at timestamptz not null default now()
);

create table olay_dugumu (
  id uuid primary key default gen_random_uuid(),
  olay_id uuid not null references olay(id) on delete cascade,
  tarih date not null,
  baslik text not null,
  ozet text,
  haber_id uuid references haber(id),
  sira int not null default 0
);

create table kaynak (
  id uuid primary key default gen_random_uuid(),
  tur text not null check (tur in ('bagimsiz_kisi', 'resmi_kurum', 'belge', 'ajans', 'sosyal_medya')),
  ad text not null,
  guven_notu text,
  created_at timestamptz not null default now()
);

create table haber_kaynak (
  haber_id uuid not null references haber(id) on delete cascade,
  kaynak_id uuid not null references kaynak(id),
  dogrulama_durumu text not null default 'teyit_bekliyor'
    check (dogrulama_durumu in ('dogrulandi', 'teyit_bekliyor', 'yalanlandi')),
  not_metni text,
  primary key (haber_id, kaynak_id)
);

create table belge (
  id uuid primary key default gen_random_uuid(),
  tur text not null check (tur in ('mahkeme', 'resmi_yazi', 'rapor', 'kanun_maddesi', 'kayit')),
  baslik text not null,
  dosya_url text,
  icerik_ozeti text,
  -- Erişim engeli arşivi: belgenin değişmezlik kaydı
  sha256 text not null,
  created_at timestamptz not null default now()
);

create table haber_belge (
  haber_id uuid not null references haber(id) on delete cascade,
  belge_id uuid not null references belge(id),
  primary key (haber_id, belge_id)
);

create table varlik (
  id uuid primary key default gen_random_uuid(),
  tur text not null check (tur in ('kisi', 'kurum')),
  ad text not null
);

create table haber_varlik (
  haber_id uuid not null references haber(id) on delete cascade,
  varlik_id uuid not null references varlik(id),
  rol text not null check (rol in ('taraf', 'tanik', 'yetkili', 'konu')),
  gorus_alindi boolean not null default false,
  gorus_notu text,
  primary key (haber_id, varlik_id)
);

create table tekzip_duzeltme (
  id uuid primary key default gen_random_uuid(),
  haber_id uuid not null references haber(id) on delete cascade,
  tur text not null check (tur in ('tekzip', 'duzeltme', 'guncelleme')),
  metin text not null,
  tarih timestamptz not null default now(),
  karneye_islendi boolean not null default true
);

-- Her yayın değişikliğinin tam kopyası + değişmezlik kaydı
create table haber_surum (
  id uuid primary key default gen_random_uuid(),
  haber_id uuid not null references haber(id) on delete cascade,
  surum_no text not null,
  not_metni text,
  icerik jsonb not null,
  sha256 text not null,
  created_at timestamptz not null default now(),
  unique (haber_id, surum_no)
);

-- ── Doğrulama karnesi: alan değil, sorgu ──
create view haber_karne as
select
  h.id as haber_id,
  h.slug,
  (select count(*) from haber_kaynak hk
     join kaynak k on k.id = hk.kaynak_id
    where hk.haber_id = h.id
      and k.tur = 'bagimsiz_kisi'
      and hk.dogrulama_durumu = 'dogrulandi') as bagimsiz_kaynak,
  (select count(*) from haber_belge hb where hb.haber_id = h.id) as resmi_belge,
  (select count(*) from haber_varlik hv
    where hv.haber_id = h.id and hv.rol = 'taraf' and hv.gorus_alindi) as taraf_alinan,
  (select count(*) from haber_varlik hv
    where hv.haber_id = h.id and hv.rol = 'taraf') as taraf_toplam,
  exists (select 1 from tekzip_duzeltme td
    where td.haber_id = h.id and td.tur = 'tekzip') as tekzip,
  h.guncelleme_tarihi
from haber h;

-- RLS: okuyucular yalnızca yayındaki haberleri görür (auth Aşama 4'te ayrıntılanacak)
alter table haber enable row level security;
create policy "yayindaki haberler herkese acik" on haber
  for select using (durum in ('yayinda', 'guncellendi', 'tekzip'));
