-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('new_request', 'status_change', 'inspection_reminder', 'payout')) not null,
  title text not null,
  message text not null,
  link text, -- URL to redirect to (e.g. /rentals/123)
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table notifications enable row level security;

create policy "Users can view their own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update (mark read) their own notifications" on notifications
  for update using (auth.uid() = user_id);

-- FUNCTION: Trigger to notify Owner on New Request
create or replace function notify_on_new_rental()
returns trigger as $$
begin
  insert into notifications (user_id, type, title, message, link)
  values (
    NEW.owner_id, 
    'new_request', 
    'New Rental Request', 
    'You have a new booking request waiting for approval.', 
    '/my-listings' -- Ideally deep link to rental management
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- TRIGGER: Run on Insert to rentals
create trigger on_new_rental_created
  after insert on rentals
  for each row execute procedure notify_on_new_rental();


-- FUNCTION: Trigger to notify Renter on Status Change
create or replace function notify_on_rental_status_change()
returns trigger as $$
begin
  if NEW.status <> OLD.status then
    insert into notifications (user_id, type, title, message, link)
    values (
      NEW.renter_id, 
      'status_change', 
      'Rental Update', 
      'Your rental status has changed to: ' || NEW.status, 
      '/rentals'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- TRIGGER: Run on Update to rentals
create trigger on_rental_updated
  after update on rentals
  for each row execute procedure notify_on_rental_status_change();
