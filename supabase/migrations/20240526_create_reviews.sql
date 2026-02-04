-- Create reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  rental_id uuid references rentals(id) on delete cascade not null,
  item_id uuid references items(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one review per rental
  unique(rental_id)
);

-- RLS Policies
alter table reviews enable row level security;

-- Everyone can read reviews
create policy "Reviews are public" on reviews
  for select using (true);

-- Authenticated users can insert reviews IF:
-- 1. They are the renter of the rental
-- 2. The rental is completed
create policy "Renters can create reviews for completed trips" on reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from rentals
      where rentals.id = reviews.rental_id
      and rentals.renter_id = auth.uid()
      and rentals.status = 'completed'
    )
  );

-- Helper to update local rental status for testing if needed
-- update rentals set status = 'completed' where element_id = '...' 
