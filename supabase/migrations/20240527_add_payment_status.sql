-- Add 'awaiting_payment' to rentals status check constraint
alter table rentals drop constraint rentals_status_check;

alter table rentals add constraint rentals_status_check 
check (status in ('pending', 'awaiting_payment', 'approved', 'active', 'completed', 'cancelled'));
