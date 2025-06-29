/*
  # Enhance Resources Table for Mental Health Content

  1. New Columns
    - `type` (text): Stores the content type ('article', 'video', etc.)
    - `source_url` (text): Stores URL to external content (YouTube links, PubMed articles)
    - `duration` (integer): Stores length of content in seconds (for videos/audio)

  2. Changes
    - Add CHECK constraint to ensure `type` values are valid
    - Create index on `type` column for faster filtering
*/

-- Add new columns to resources table
DO $$
BEGIN
  -- Add type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'type'
  ) THEN
    ALTER TABLE resources ADD COLUMN type TEXT DEFAULT 'article' CHECK (type IN ('article', 'video', 'audio', 'exercise', 'tool'));
  END IF;

  -- Add source_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE resources ADD COLUMN source_url TEXT;
  END IF;

  -- Add duration column (in seconds)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'duration'
  ) THEN
    ALTER TABLE resources ADD COLUMN duration INTEGER;
  END IF;
END $$;

-- Create index for type column
CREATE INDEX IF NOT EXISTS resources_type_idx ON resources(type);

-- Add sample video resources
INSERT INTO resources (title, content, category, thumbnail_url, author, type, source_url, duration, created_at)
VALUES
  (
    'Mindfulness Meditation for Anxiety Relief',
    'This 10-minute guided meditation helps reduce anxiety through mindfulness practices. The video guides you through breathing techniques and gentle awareness exercises that can help calm your nervous system and bring you back to the present moment.',
    ARRAY['Meditation', 'Anxiety', 'Mindfulness'],
    'https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Dr. Amanda Williams',
    'video',
    'https://www.youtube.com/embed/O-6f5wQXSu8',
    600,
    '2025-06-20T10:15:00Z'
  ),
  (
    'Understanding Depression: Signs, Symptoms, and Treatment',
    'This educational video explores the clinical understanding of depression, explaining common symptoms, risk factors, and evidence-based treatment options. Learn how to recognize depression in yourself or loved ones and when to seek professional help.',
    ARRAY['Depression', 'Mental Health', 'Education'],
    'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'National Mental Health Institute',
    'video',
    'https://www.youtube.com/embed/z-IR48Mb3W0',
    1260,
    '2025-06-15T14:30:00Z'
  ),
  (
    '5-Minute Stress Relief Exercise',
    'A quick guided exercise you can do anywhere to reduce stress and regain focus. This technique combines deep breathing, progressive muscle relaxation, and positive visualization for an immediate calming effect.',
    ARRAY['Stress Relief', 'Exercise', 'Self-Care'],
    'https://images.pexels.com/photos/3759660/pexels-photo-3759660.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Dr. Michael Chen',
    'exercise',
    null,
    300,
    '2025-06-18T09:45:00Z'
  )
ON CONFLICT DO NOTHING;

-- Update existing resources to have the 'article' type
UPDATE resources 
SET type = 'article' 
WHERE type IS NULL;