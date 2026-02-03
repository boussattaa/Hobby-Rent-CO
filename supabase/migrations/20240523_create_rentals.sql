-- Create rentals table to track bookings and condition reports
create table if not exists rentals (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) on delete cascade not null,
  renter_id uuid references auth.users(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null, -- Denormalized for easier RLS
  status text default 'pending' check (status in ('pending', 'approved', 'active', 'completed', 'cancelled')),
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  
  -- Inspection Data
  pickup_photos text[] default array[]::text[],
  pickup_notes text,
  pickup_at timestamp with time zone,
  
  dropoff_photos text[] default array[]::text[],
  dropoff_notes text,
  dropoff_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table rentals enable row level security;

-- Renters can view their own rentals
create policy "Renters can view their own rentals" on rentals
  for select using (auth.uid() = renter_id);

-- Owners can view rentals of their items
create policy "Owners can view rentals of their items" on rentals
  for select using (auth.uid() = owner_id);

-- Renters can insert (request) rentals
create policy "Renters can request rentals" on rentals
  for insert with check (auth.uid() = renter_id);

-- Owners can update status (approve/reject)
create policy "Owners can update status" on rentals
  for update using (auth.uid() = owner_id);

-- Renters can update inspection data (pickup/dropoff) if they are the renter
create policy "Renters can update inspection" on rentals
  for update using (auth.uid() = renter_id);
