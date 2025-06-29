-- First, ensure the ai-responses bucket exists
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'ai-responses'
    ) THEN
        -- Create the bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('ai-responses', 'ai-responses', false);
    END IF;
END $$;

-- Drop existing policies for this bucket if they exist
DROP POLICY IF EXISTS "Users can upload audio files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can download audio files from their own folder" ON storage.objects;

-- Create the RLS policies for the storage bucket

-- For upload permissions (INSERT)
CREATE POLICY "Users can upload audio files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-responses' AND 
  name LIKE 'audio/' || auth.uid()::text || '/%'
);

-- For download permissions (SELECT)
CREATE POLICY "Users can download audio files from their own folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ai-responses' AND 
  name LIKE 'audio/' || auth.uid()::text || '/%'
);