-- Create a function to handle new message notifications
CREATE OR REPLACE FUNCTION notify_on_new_message() RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
BEGIN
  -- Get sender's name
  SELECT first_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  -- Fallback if name is missing
  IF sender_name IS NULL THEN
    sender_name := 'User';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.receiver_id, 
    'new_request', -- Reusing 'new_request' type for icon, or create a new 'message' type
    'New message from ' || sender_name, 
    substring(NEW.content from 1 for 50) || '...', 
    '/inbox'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created 
AFTER INSERT ON public.messages 
FOR EACH ROW 
EXECUTE PROCEDURE notify_on_new_message();
