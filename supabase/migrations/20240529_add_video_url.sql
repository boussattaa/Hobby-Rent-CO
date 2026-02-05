-- Add video_url column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN items.video_url IS 'URL to walkaround video for the item';
