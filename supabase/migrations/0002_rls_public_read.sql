-- İçerik tabloları: herkes okuyabilir, yazma yalnızca service role (sunucu tarafı) ile yapılır.
-- Anon anahtarla hiçbir yazma işlemi mümkün değildir; editoryal yazmalar sunucu tarafında yapılacaktır.

alter table olay enable row level security;
create policy "herkes okur" on olay for select using (true);

alter table gazeteci enable row level security;
create policy "herkes okur" on gazeteci for select using (true);

alter table olay_dugumu enable row level security;
create policy "herkes okur" on olay_dugumu for select using (true);

alter table kaynak enable row level security;
create policy "herkes okur" on kaynak for select using (true);

alter table haber_kaynak enable row level security;
create policy "herkes okur" on haber_kaynak for select using (true);

alter table belge enable row level security;
create policy "herkes okur" on belge for select using (true);

alter table haber_belge enable row level security;
create policy "herkes okur" on haber_belge for select using (true);

alter table varlik enable row level security;
create policy "herkes okur" on varlik for select using (true);

alter table haber_varlik enable row level security;
create policy "herkes okur" on haber_varlik for select using (true);

alter table haber_surum enable row level security;
create policy "herkes okur" on haber_surum for select using (true);

-- Tekzip kayıtları hassas olabilir; yalnızca ilgili haber yayındaysa görünür.
alter table tekzip_duzeltme enable row level security;
create policy "yayindaki habere ait tekzipler herkese acik" on tekzip_duzeltme
  for select using (
    exists (
      select 1 from haber h
      where h.id = tekzip_duzeltme.haber_id
        and h.durum in ('yayinda', 'guncellendi', 'tekzip')
    )
  );
