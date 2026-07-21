-- Project FN — 0007: gazeteci politikasını SECURITY DEFINER fonksiyona taşı
--
-- Sorun: 0005'teki "gazeteci tum haberleri okur" politikası `haber` üzerinde
-- doğrudan `select 1 from gazeteci` yapıyordu. 0006 ile gazeteci tablosunun
-- tablo düzeyi SELECT yetkisi anon'dan alınınca (e-postayı gizlemek için),
-- anon `haber` tablosunu HİÇ okuyamaz oldu: politika değerlendirilirken
-- gazeteci'ye erişim gerekiyor ve yetki reddediliyordu → public site kırılıyordu.
--
-- Çözüm: kontrolü SECURITY DEFINER bir fonksiyonun içine al. Fonksiyon
-- sahibinin (postgres) haklarıyla çalışır, dolayısıyla çağıranın gazeteci
-- tablosunda yetkisi olması gerekmez. Fonksiyon yalnız boolean döner —
-- tablo içeriği dışarı sızmaz.

create or replace function public.aktif_gazeteci_mi()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from gazeteci g
    where g.auth_user_id = auth.uid()
      and g.aktif
  );
$$;

comment on function public.aktif_gazeteci_mi() is
  'RLS yardımcı fonksiyonu: oturum sahibi aktif bir gazeteci mi? Yalnız boolean döner.';

revoke execute on function public.aktif_gazeteci_mi() from public;
grant execute on function public.aktif_gazeteci_mi() to anon, authenticated;

-- Politika artık tabloya değil fonksiyona bakar.
-- Ek fayda: pasif (aktif = false) gazeteci taslakları göremez.
drop policy if exists "gazeteci tum haberleri okur" on haber;
create policy "gazeteci tum haberleri okur" on haber
  for select using (public.aktif_gazeteci_mi());
