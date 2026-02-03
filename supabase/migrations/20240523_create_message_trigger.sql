-- Trigger: Notify Receiver on New Message
create or replace function notify_on_new_message()
returns trigger as $$
begin
  insert into notifications (user_id, type, title, message, link)
  values (
    NEW.receiver_id,
    'new_request', -- Re-using existing type or add 'message' if needed, but 'new_request' works for bell icon
    'New Message',
    substring(NEW.content from 1 for 50) || '...', -- Preview
    '/inbox'
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_message
  after insert on messages
  for each row execute procedure notify_on_new_message();
