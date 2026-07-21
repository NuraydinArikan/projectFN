-- Auth + editör yazma yolu (Aşama 4) — dosya adı 0005; veritabanındaki 0003/0004 sürümleri demo veriye aitti.
-- Yazma hâlâ service role (sunucu) ile yapılır; bu migration
-- gazeteci ↔ auth.users köprüsünü ve editörlerin taslak okumasını ekler.

alter table gazeteci
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null,
  add column if not exists email text;

create unique index if not exists gazeteci_email_unique
  on gazeteci (email)
  where email is not null;

-- Oturum açmış gazeteciler tüm haber durumlarını okuyabilir (taslak dahil).
-- Anon politika (yalnız yayındakiler) ile birlikte OR mantığında çalışır.
drop policy if exists "gazeteci tum haberleri okur" on haber;
create policy "gazeteci tum haberleri okur" on haber
  for select
  using (
    exists (
      select 1 from gazeteci g
      where g.auth_user_id = auth.uid()
    )
  );

-- İlişkili tablolar: gazeteci ise tüm satırlar (editör paneli için).
-- Mevcut "herkes okur" politikaları zaten SELECT using (true) verdiği için
-- ek policy gerekmez; taslak haberin join'leri de okunur.

comment on column gazeteci.auth_user_id is 'Supabase Auth kullanıcısı; Server Action yetkilendirmesi';
