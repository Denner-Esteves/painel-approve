-- Create task_images table
create table public.task_images (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.task_images enable row level security;

-- Policies for task_images
create policy "Enable read access for all users"
on "public"."task_images"
as permissive
for select
to public
using (true);

create policy "Enable insert for all users"
on "public"."task_images"
as permissive
for insert
to public
with check (true);

create policy "Enable update for all users"
on "public"."task_images"
as permissive
for update
to public
using (true);

create policy "Enable delete for all users"
on "public"."task_images"
as permissive
for delete
to public
using (true);

-- Migrate existing data (optional, best effort)
insert into public.task_images (task_id, url)
select id, media_url from public.tasks where media_url is not null;

-- Remove old column (optional, can keep for backup for now)
-- alter table public.tasks drop column media_url;
