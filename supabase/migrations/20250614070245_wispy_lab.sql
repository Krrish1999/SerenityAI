/*
  # Seed data for resources and therapists

  1. Resources
    - Adds sample wellness articles and resources
  2. Users and Therapists
    - Creates sample therapist users and profiles
    - Uses auth.users for proper foreign key relationships
*/

-- Seed resources data
INSERT INTO resources (id, title, content, category, thumbnail_url, author, created_at)
VALUES
  (
    gen_random_uuid(),
    'Understanding Anxiety: Causes and Coping Strategies',
    'Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder.\n\nAnxiety disorders form a category of mental health diagnoses that lead to excessive nervousness, fear, apprehension, and worry. These disorders alter how a person processes emotions and behaves, also causing physical symptoms. Mild anxiety might be vague and unsettling, while severe anxiety may seriously affect day-to-day living.\n\nAnxiety disorders affect 40 million people in the United States. It''s the most common group of mental illnesses in the country. However, only 36.9 percent of people with an anxiety disorder receive treatment.\n\nSome common coping strategies include:\n\n- Practice deep breathing exercises\n- Maintain a healthy lifestyle with regular exercise\n- Get adequate sleep\n- Limit caffeine and alcohol\n- Use meditation and mindfulness techniques\n- Seek professional help when needed',
    ARRAY['Anxiety', 'Mental Health', 'Self-help'],
    'https://images.pexels.com/photos/897817/pexels-photo-897817.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Dr. Sarah Johnson',
    '2025-05-15T14:30:00Z'
  ),
  (
    gen_random_uuid(),
    'The Importance of Sleep for Mental Health',
    'Sleep and mental health are closely connected. Sleep deprivation affects your psychological state and mental health. And those with mental health problems are more likely to have insomnia or other sleep disorders.\n\nResearch shows that the relationship between sleep and mental health is complex. While sleep has long been known to be a consequence of many psychiatric conditions, more recent views suggest that sleep can also play a causal role in both the development and maintenance of different mental health problems.\n\nIn other words, sleep problems can lead to changes in mental health, but mental health conditions can also worsen sleep problems.\n\nHealthy sleep habits (sometimes referred to as "sleep hygiene") can make a big difference in your quality of life. Here are some tips to help you develop healthy sleep habits:\n\n- Go to bed and wake up at the same time each day\n- Make sure your bedroom is quiet, dark, and at a comfortable temperature\n- Remove electronic devices from the bedroom\n- Avoid large meals, caffeine, and alcohol before bedtime\n- Get some exercise during the day\n- Establish a relaxing bedtime routine',
    ARRAY['Sleep', 'Mental Health', 'Wellness'],
    'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Dr. Michael Chen',
    '2025-05-10T10:15:00Z'
  ),
  (
    gen_random_uuid(),
    'Mindfulness Meditation: A Beginner''s Guide',
    'Mindfulness meditation is a mental training practice that teaches you to slow down racing thoughts, let go of negativity, and calm both your mind and body.\n\nTechniques can vary, but in general, mindfulness meditation involves deep breathing and awareness of body and mind. Practicing mindfulness meditation doesn''t require props or preparation. To get started, all you need is a comfortable place to sit, 3 to 5 minutes of free time, and a judgment-free mindset.\n\nHere''s a step-by-step guide to mindfulness meditation:\n\n1. Find a quiet and comfortable place to sit.\n2. Set a time limit. If you''re just beginning, it can help to choose a short time, such as 5 or 10 minutes.\n3. Pay attention to your body and get comfortable. You can sit in a chair with your feet on the floor, you can sit cross-legged, or you can kneel—all are fine options.\n4. Feel your breath. Follow the sensation of your breath as it goes in and as it goes out.\n5. Notice when your mind has wandered. Inevitably, your attention will leave the breath and wander to other places. When you notice this, simply return your attention to the breath.\n6. Be kind to your wandering mind. Don''t judge yourself or obsess over the content of the thoughts. Just come back to your breath.\n7. When you''re ready, gently lift your gaze (if your eyes are closed, open them).',
    ARRAY['Meditation', 'Mindfulness', 'Stress Relief'],
    'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Emma Wilson, Certified Meditation Instructor',
    '2025-04-28T09:45:00Z'
  ),
  (
    gen_random_uuid(),
    'Managing Stress in the Workplace',
    'Workplace stress is a common challenge in today''s fast-paced work environments. It can significantly impact both your professional performance and personal well-being.\n\nStress itself is not always bad. In small doses, stress can help you perform under pressure and motivate you to do your best. But when you''re constantly running in emergency mode, your mind and body pay the price.\n\nIdentifying the causes of workplace stress is essential. Common sources include excessive workload, lack of control, insufficient reward, breakdown in community, absence of fairness, and conflicting values.\n\nHere are some effective strategies to manage workplace stress:\n\n- Set clear boundaries between work and personal life\n- Take short breaks throughout the day\n- Prioritize tasks and focus on what you can control\n- Practice time management techniques\n- Build positive relationships with colleagues\n- Communicate openly about challenges\n- Learn to say no to additional responsibilities when necessary\n- Take care of your physical health through regular exercise and proper nutrition\n- Consider mindfulness or relaxation techniques\n- Seek support when needed, from colleagues, friends, or professionals',
    ARRAY['Stress', 'Workplace', 'Self-care'],
    'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Dr. James Rodriguez',
    '2025-05-05T16:20:00Z'
  );

-- First, create users in the auth.users table
-- We need to use the service_role to create users in the auth schema
DO $$
DECLARE
  user_id1 UUID := 'd0c5e3e3-c1e3-4a4b-8e0d-0a8d3e3f4a5b';
  user_id2 UUID := 'e1d6f4f4-d2f4-5b5c-9f1e-1b9e4f5f5b6c';
  user_id3 UUID := 'f2e7f5f5-e3f5-6c6d-0f2f-2c0f5f6f6c7d';
BEGIN
  -- Insert users into auth.users table
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  VALUES
    (user_id1, 'dr.johnson@mindwell.com', NOW(), NOW(), NOW()),
    (user_id2, 'dr.patel@mindwell.com', NOW(), NOW(), NOW()),
    (user_id3, 'dr.garcia@mindwell.com', NOW(), NOW(), NOW());

  -- Now insert into profiles table
  INSERT INTO profiles (id, email, full_name, created_at)
  VALUES
    (user_id1, 'dr.johnson@mindwell.com', 'Dr. Emily Johnson', '2025-01-15T10:00:00Z'),
    (user_id2, 'dr.patel@mindwell.com', 'Dr. Raj Patel', '2025-01-20T11:30:00Z'),
    (user_id3, 'dr.garcia@mindwell.com', 'Dr. Sofia Garcia', '2025-01-25T09:15:00Z');

  -- Finally, insert therapist profiles
  INSERT INTO therapist_profiles (id, user_id, specialization, experience_years, description, rate_per_hour, availability, education, certifications, rating)
  VALUES
    (
      gen_random_uuid(),
      user_id1,
      ARRAY['Anxiety', 'Depression', 'Trauma'],
      12,
      'I specialize in cognitive behavioral therapy and mindfulness-based approaches to help clients overcome anxiety, depression, and trauma. My practice focuses on creating a safe and supportive environment where you can explore your challenges and develop effective coping strategies.',
      120.00,
      ARRAY['Monday', 'Wednesday', 'Friday'],
      ARRAY['Ph.D. in Clinical Psychology, University of Washington', 'M.A. in Psychology, Stanford University'],
      ARRAY['Licensed Clinical Psychologist', 'Certified in Trauma-Focused CBT', 'EMDR Certified Therapist'],
      4.9
    ),
    (
      gen_random_uuid(),
      user_id2,
      ARRAY['Relationships', 'Family', 'Stress'],
      15,
      'With 15 years of experience in relationship and family counseling, I help individuals and couples navigate complex interpersonal dynamics. My approach combines solution-focused therapy with emotional-focused techniques to foster healthy communication and stronger relationships.',
      135.00,
      ARRAY['Tuesday', 'Thursday', 'Saturday'],
      ARRAY['Psy.D. in Clinical Psychology, NYU', 'B.S. in Psychology, University of Michigan'],
      ARRAY['Licensed Marriage and Family Therapist', 'Certified Gottman Method Couples Therapist'],
      4.8
    ),
    (
      gen_random_uuid(),
      user_id3,
      ARRAY['Anxiety', 'Self-esteem', 'LGBTQ+'],
      8,
      'I provide culturally sensitive therapy with expertise in anxiety, self-esteem issues, and LGBTQ+ concerns. My therapeutic style is warm, collaborative, and focused on empowering clients to embrace their authentic selves while developing practical skills for managing life''s challenges.',
      110.00,
      ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday'],
      ARRAY['M.S. in Clinical Mental Health Counseling, Columbia University', 'B.A. in Psychology, UCLA'],
      ARRAY['Licensed Professional Counselor', 'Certified Anxiety Treatment Specialist'],
      4.7
    );
END $$;