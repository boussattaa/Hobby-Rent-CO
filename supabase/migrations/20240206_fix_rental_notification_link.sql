-- Fix notification link for new rental requests
CREATE OR REPLACE FUNCTION notify_on_new_rental()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.owner_id, 
    'new_request', 
    'New Rental Request', 
    'You have a new booking request waiting for approval.', 
    '/dashboard' -- Fixed from /my-listings to /dashboard
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
