-- Create a private profile table that syncs with auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- ITEMS Table (The Gear)
create table public.items (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) not null,
  category text not null check (category in ('dirt', 'water', 'housing')),
  name text not null,
  description text,
  price numeric not null,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Items
alter table public.items enable row level security;
create policy "Items are viewable by everyone" on public.items for select using (true);
create policy "Authenticated users can create items" on public.items for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own items" on public.items for update using (auth.uid() = owner_id);
create policy "Users can delete their own items" on public.items for delete using (auth.uid() = owner_id);

-- BOOKINGS Table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id) not null,
  renter_id uuid references public.profiles(id) not null,
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Bookings
alter table public.bookings enable row level security;
-- Renters can view their own bookings
create policy "Users can view their own bookings" on public.bookings for select using (auth.uid() = renter_id);
-- Owners can view bookings for their items
create policy "Owners can view bookings for their items" on public.bookings for select using (
  exists ( select 1 from public.items where items.id = bookings.item_id and items.owner_id = auth.uid() )
);
-- Authenticated users can create bookings
create policy "Authenticated users can create bookings" on public.bookings for insert with check (auth.role() = 'authenticated');

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
