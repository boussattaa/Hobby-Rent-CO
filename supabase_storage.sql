-- Create a public storage bucket for Item Photos
insert into storage.buckets (id, name, public) 
values ('items', 'items', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'items' );

-- Allow authenticated users to upload images
create policy "Authenticated Upload" 
on storage.objects for insert 
with check ( bucket_id = 'items' and auth.role() = 'authenticated' );
