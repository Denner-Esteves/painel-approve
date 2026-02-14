-- Enable storage extension if not enabled (usually enabled by default in Supabase)
-- create extension if not exists "storage";

-- Create bucket 'task-assets'
insert into storage.buckets (id, name, public)
values ('task-assets', 'task-assets', true)
on conflict (id) do nothing;

-- Policy: Allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'task-assets' );

-- Policy: Allow authenticated/anon uploads (Depending on your auth setup, adjust 'true' to auth.uid() check)
-- For this demo/tool, we allow anyone to upload to this bucket if they have the anon key.
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'task-assets' );
