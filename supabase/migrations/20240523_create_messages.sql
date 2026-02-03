-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  rental_id uuid references rentals(id) on delete set null, -- Optional context
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table messages enable row level security;

-- Policies

-- 1. View messages: Users can see messages they sent OR received
create policy "Users can view their own messages" on messages
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

-- 2. Send messages: Users can insert messages where they are the sender
create policy "Users can send messages" on messages
  for insert with check (
    auth.uid() = sender_id
  );

-- 3. Mark read: Users can update messages they received
create policy "Users can mark received messages as read" on messages
  for update using (
    auth.uid() = receiver_id
  );

-- Indexes for performance
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_receiver on messages(receiver_id);
create index if not exists idx_messages_rental on messages(rental_id);
