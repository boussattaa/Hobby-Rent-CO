-- Create a table to track item availability
create table if not exists item_availability (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) on delete cascade not null,
  date date not null,
  status text default 'blocked' check (status in ('blocked', 'booked')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, date)
);

-- RLS: Enable security
alter table item_availability enable row level security;

-- RLS: Everyone can view availability (to see if it's open)
create policy "Availability is public"
  on item_availability for select
  using (true);

-- RLS: Only the owner of the item can insert/delete blocks
-- We need to join with items table to check ownership. 
-- For simplicity in RLS, we often use a function or a simple check if possible.
-- But standard RLS with join:
create policy "Owners can manage availability"
  on item_availability for all
  using (
    auth.uid() in (
      select owner_id from items where id = item_availability.item_id
    )
  )
  with check (
    auth.uid() in (
      select owner_id from items where id = item_availability.item_id
    )
  );
