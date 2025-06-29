/*
  # Update video resource URLs to use youtube-nocookie.com

  1. Changes
    - Replace youtube.com with youtube-nocookie.com in source_url for better privacy and embedding
    - This helps prevent "refused to connect" errors when embedding videos
  
  2. Security
    - No security changes needed
*/

-- Update all existing YouTube URLs to use youtube-nocookie.com
UPDATE resources
SET source_url = REPLACE(source_url, 'youtube.com', 'youtube-nocookie.com')
WHERE source_url LIKE '%youtube.com%'
  AND type = 'video';