-- Add video_url to items table
alter table items 
add column if not exists video_url text; -- Stores the public URL of the uploaded video
