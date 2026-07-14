insert into storage.buckets (id, name, public)
values ('wine-images', 'wine-images', true)
on conflict (id) do nothing;

create policy "Users can upload their own wine images"
on storage.objects for insert
with check (bucket_id = 'wine-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own wine images"
on storage.objects for update
using (bucket_id = 'wine-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view wine images"
on storage.objects for select
using (bucket_id = 'wine-images');
