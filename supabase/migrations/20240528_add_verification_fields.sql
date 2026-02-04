-- Add verification fields to profiles table
alter table profiles 
add column if not exists id_verified boolean default false,
add column if not exists id_photo_url text, -- Private URL or path
add column if not exists phone_number text;

-- Create storage bucket for private ID documents if not exists
insert into storage.buckets (id, name, public)
values ('private_documents', 'private_documents', false)
on conflict (id) do nothing;

-- RLS for storage: Users can upload their own ID
create policy "Users can upload their own ID"
on storage.objects for insert
with check ( bucket_id = 'private_documents' and auth.uid() = (storage.foldername(name))[1]::uuid );

-- RLS for storage: Users can view their own ID
create policy "Users can view their own ID"
on storage.objects for select
using ( bucket_id = 'private_documents' and auth.uid() = (storage.foldername(name))[1]::uuid );

-- RLS for storage: Admins can view all IDs (Service Role bypasses RLS usually, but good to have)
-- Note: Subase storage policies are complex, usually Admin uses service role key.
