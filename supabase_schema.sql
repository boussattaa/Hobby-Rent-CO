
-- 1. Create a table to store public user profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  is_verified boolean default false,
  updated_at timestamp with time zone
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create Policy: Users can see everyone's profile (needed to see if someone is verified)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- 4. Create Policy: Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- 5. Create Policy: Users can update own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 6. Trigger: Automatically create a profile when a new user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Grant access to generic authenticated users
grant all on public.profiles to postgres, anon, authenticated, service_role;
