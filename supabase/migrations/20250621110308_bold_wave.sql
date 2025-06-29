/*
  # Add comprehensive sample data for therapist features

  1. Additional Users
    - Creates 2 more therapist users with specialized expertise
    - Creates 5 patient users with diverse mental health conditions

  2. Sample Data
    - Realistic therapist profiles with specializations
    - Patient profiles with authentic backgrounds
    - Appointment schedules (upcoming and past)
    - Mood tracking patterns reflecting each patient's journey
    - Journal entries with emotional depth
    - Crisis events with different severity levels
    - Therapeutic message conversations
    - AI chat history examples

  3. Data Safety
    - All inserts use conditional logic to prevent duplicates
    - Migration can be run multiple times safely
    - Maintains referential integrity
*/

-- First, let's add some sample patient users
DO $$
DECLARE
  -- Patient user IDs (valid hexadecimal UUIDs)
  patient_id1 UUID := 'a1b2c3d4-e5f6-1234-5678-567890abcdef';
  patient_id2 UUID := 'b2c3d4e5-f6a7-2345-6789-678901bcdefb';
  patient_id3 UUID := 'c3d4e5f6-a7b8-3456-789a-789012cdefac';
  patient_id4 UUID := 'd4e5f6a7-b8c9-4567-89ab-890123defabc';
  patient_id5 UUID := 'e5f6a7b8-c9d0-5678-9abc-901234efabcd';
  
  -- Therapist user IDs (from existing data)
  therapist_id1 UUID := 'd0c5e3e3-c1e3-4a4b-8e0d-0a8d3e3f4a5b';
  therapist_id2 UUID := 'e1d6f4f4-d2f4-5b5c-9f1e-1b9e4f5f5b6c';
  therapist_id3 UUID := 'f2e7f5f5-e3f5-6c6d-0f2f-2c0f5f6f6c7d';
  
  -- Additional therapist IDs (valid hexadecimal UUIDs)
  therapist_id4 UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  therapist_id5 UUID := 'b2c3d4e5-f6a7-8901-bcde-fa2345678901';
BEGIN

  -- Insert additional therapist users if they don't exist
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT therapist_id4, 'dr.anderson@mindwell.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = therapist_id4);
  
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT therapist_id5, 'dr.thompson@mindwell.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = therapist_id5);

  -- Insert additional therapist profiles if they don't exist
  INSERT INTO profiles (id, email, full_name, role, created_at)
  SELECT therapist_id4, 'dr.anderson@mindwell.com', 'Dr. Michael Anderson', 'therapist', '2025-02-01T14:00:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = therapist_id4);
  
  INSERT INTO profiles (id, email, full_name, role, created_at)
  SELECT therapist_id5, 'dr.thompson@mindwell.com', 'Dr. Sarah Thompson', 'therapist', '2025-02-05T10:30:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = therapist_id5);

  -- Insert additional therapist profile details if they don't exist
  INSERT INTO therapist_profiles (id, user_id, specialization, experience_years, description, rate_per_hour, availability, education, certifications, rating)
  SELECT 
    gen_random_uuid(),
    therapist_id4,
    ARRAY['Depression', 'Bipolar Disorder', 'Addiction'],
    20,
    'Specializing in mood disorders and addiction recovery, I use evidence-based approaches including DBT and motivational interviewing. My practice emphasizes building resilience and developing healthy coping mechanisms for long-term recovery.',
    150.00,
    ARRAY['Monday', 'Wednesday', 'Friday'],
    ARRAY['M.D. in Psychiatry, Johns Hopkins', 'Residency in Psychiatry, Mayo Clinic'],
    ARRAY['Board Certified Psychiatrist', 'Certified Addiction Medicine Specialist', 'DBT Certified Therapist'],
    4.8
  WHERE NOT EXISTS (SELECT 1 FROM therapist_profiles WHERE user_id = therapist_id4);
  
  INSERT INTO therapist_profiles (id, user_id, specialization, experience_years, description, rate_per_hour, availability, education, certifications, rating)
  SELECT 
    gen_random_uuid(),
    therapist_id5,
    ARRAY['Trauma', 'PTSD', 'Grief'],
    18,
    'I work with individuals who have experienced trauma, loss, and life transitions. Using trauma-informed care and EMDR, I help clients process difficult experiences and develop post-traumatic growth.',
    140.00,
    ARRAY['Tuesday', 'Thursday', 'Saturday'],
    ARRAY['Ph.D. in Clinical Psychology, UCLA', 'M.A. in Trauma Psychology, UC San Diego'],
    ARRAY['Licensed Clinical Psychologist', 'EMDR Certified Therapist', 'Trauma-Informed Care Specialist'],
    4.9
  WHERE NOT EXISTS (SELECT 1 FROM therapist_profiles WHERE user_id = therapist_id5);

  -- Insert sample patient users if they don't exist
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT patient_id1, 'alice.johnson@email.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_id1);
  
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT patient_id2, 'bob.smith@email.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_id2);
  
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT patient_id3, 'carol.davis@email.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_id3);
  
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT patient_id4, 'david.wilson@email.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_id4);
  
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
  SELECT patient_id5, 'emma.brown@email.com', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_id5);

  -- Insert sample patient profiles if they don't exist
  INSERT INTO profiles (id, email, full_name, role, bio, phone_number, consent_given, created_at)
  SELECT 
    patient_id1, 
    'alice.johnson@email.com', 
    'Alice Johnson', 
    'patient',
    'Working through anxiety and stress management. Recently started therapy to help with work-life balance.',
    '+1 (555) 123-4567',
    true,
    '2024-11-15T09:30:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = patient_id1);
  
  INSERT INTO profiles (id, email, full_name, role, bio, phone_number, consent_given, created_at)
  SELECT 
    patient_id2, 
    'bob.smith@email.com', 
    'Bob Smith', 
    'patient',
    'Dealing with depression following a major life change. Seeking support for mood regulation and motivation.',
    '+1 (555) 234-5678',
    false,
    '2024-12-20T14:15:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = patient_id2);
  
  INSERT INTO profiles (id, email, full_name, role, bio, phone_number, consent_given, created_at)
  SELECT 
    patient_id3, 
    'carol.davis@email.com', 
    'Carol Davis', 
    'patient',
    'Trauma survivor working on PTSD recovery. Making good progress with EMDR therapy.',
    '+1 (555) 345-6789',
    true,
    '2024-10-08T11:00:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = patient_id3);
  
  INSERT INTO profiles (id, email, full_name, role, bio, phone_number, consent_given, created_at)
  SELECT 
    patient_id4, 
    'david.wilson@email.com', 
    'David Wilson', 
    'patient',
    'Struggling with addiction recovery and maintaining sobriety. In need of ongoing support.',
    '+1 (555) 456-7890',
    true,
    '2024-09-12T16:45:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = patient_id4);
  
  INSERT INTO profiles (id, email, full_name, role, bio, phone_number, consent_given, created_at)
  SELECT 
    patient_id5, 
    'emma.brown@email.com', 
    'Emma Brown', 
    'patient',
    'Recently lost a loved one and working through grief. Finding it difficult to cope with daily activities.',
    null,
    false,
    '2025-01-10T08:20:00Z'
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = patient_id5);

  -- Insert sample appointments if they don't exist
  INSERT INTO appointments (therapist_id, client_id, date_time, status, notes, created_at)
  SELECT 
    tp.id as therapist_id,
    p.id as client_id,
    appointment_data.appointment_time,
    appointment_data.status,
    appointment_data.notes,
    appointment_data.created_at
  FROM (
    VALUES
      (therapist_id1, patient_id1, '2025-06-25T10:00:00Z'::timestamptz, 'scheduled', 'Follow-up session on anxiety management techniques', NOW()),
      (therapist_id1, patient_id2, '2025-06-26T14:00:00Z'::timestamptz, 'scheduled', 'Depression assessment and treatment planning', NOW()),
      (therapist_id2, patient_id3, '2025-06-24T11:00:00Z'::timestamptz, 'scheduled', 'EMDR session for trauma processing', NOW()),
      (therapist_id4, patient_id4, '2025-06-27T16:00:00Z'::timestamptz, 'scheduled', 'Addiction recovery check-in', NOW()),
      (therapist_id5, patient_id5, '2025-06-28T09:00:00Z'::timestamptz, 'scheduled', 'Grief counseling session', NOW()),
      -- Past appointments
      (therapist_id1, patient_id1, '2025-06-18T10:00:00Z'::timestamptz, 'completed', 'Initial assessment completed', NOW()),
      (therapist_id2, patient_id3, '2025-06-17T11:00:00Z'::timestamptz, 'completed', 'Good progress with EMDR', NOW()),
      (therapist_id4, patient_id4, '2025-06-20T16:00:00Z'::timestamptz, 'completed', 'Discussed relapse prevention strategies', NOW())
  ) AS appointment_data(therapist_user_id, patient_id, appointment_time, status, notes, created_at)
  JOIN therapist_profiles tp ON tp.user_id = appointment_data.therapist_user_id
  JOIN profiles p ON p.id = appointment_data.patient_id
  WHERE NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.therapist_id = tp.id 
    AND a.client_id = p.id 
    AND a.date_time = appointment_data.appointment_time
  );

  -- Insert sample mood entries with realistic patterns if they don't exist
  INSERT INTO mood_entries (user_id, mood, note, created_at)
  SELECT user_id, mood, note, created_at
  FROM (
    VALUES
      -- Alice (patient_id1) - Anxiety patterns, generally improving
      (patient_id1, 3, 'Feeling okay today, work stress is manageable', '2025-06-21T08:00:00Z'::timestamptz),
      (patient_id1, 2, 'High anxiety before big presentation', '2025-06-20T07:30:00Z'::timestamptz),
      (patient_id1, 4, 'Good day! Presentation went well', '2025-06-20T18:00:00Z'::timestamptz),
      (patient_id1, 3, 'Weekend was relaxing', '2025-06-19T10:00:00Z'::timestamptz),
      (patient_id1, 2, 'Monday blues, feeling overwhelmed', '2025-06-18T09:00:00Z'::timestamptz),
      (patient_id1, 3, 'Better after therapy session', '2025-06-18T15:00:00Z'::timestamptz),
      
      -- Bob (patient_id2) - Depression patterns, struggling
      (patient_id2, 2, 'Hard to get out of bed this morning', '2025-06-21T11:00:00Z'::timestamptz),
      (patient_id2, 1, 'Really low day, everything feels pointless', '2025-06-20T14:00:00Z'::timestamptz),
      (patient_id2, 2, 'Slight improvement after medication adjustment', '2025-06-19T16:00:00Z'::timestamptz),
      (patient_id2, 1, 'Struggling with motivation', '2025-06-18T12:00:00Z'::timestamptz),
      (patient_id2, 2, 'Family support helping a bit', '2025-06-17T19:00:00Z'::timestamptz),
      
      -- Carol (patient_id3) - PTSD recovery, good progress
      (patient_id3, 4, 'Feeling stronger after EMDR session', '2025-06-21T16:00:00Z'::timestamptz),
      (patient_id3, 3, 'Some nightmares but manageable', '2025-06-20T08:00:00Z'::timestamptz),
      (patient_id3, 4, 'Good week overall, sleeping better', '2025-06-19T20:00:00Z'::timestamptz),
      (patient_id3, 3, 'Triggered by news but used coping skills', '2025-06-18T13:00:00Z'::timestamptz),
      (patient_id3, 4, 'Feeling empowered and in control', '2025-06-17T17:00:00Z'::timestamptz),
      
      -- David (patient_id4) - Addiction recovery, ups and downs
      (patient_id4, 3, 'Another day sober, feeling proud', '2025-06-21T19:00:00Z'::timestamptz),
      (patient_id4, 2, 'Cravings were strong today but I resisted', '2025-06-20T21:00:00Z'::timestamptz),
      (patient_id4, 4, 'Great support group meeting', '2025-06-19T18:00:00Z'::timestamptz),
      (patient_id4, 2, 'Stress at work making things difficult', '2025-06-18T17:00:00Z'::timestamptz),
      (patient_id4, 3, 'One month sober today!', '2025-06-17T20:00:00Z'::timestamptz),
      
      -- Emma (patient_id5) - Grief, early stages
      (patient_id5, 1, 'Missing mom so much today', '2025-06-21T13:00:00Z'::timestamptz),
      (patient_id5, 2, 'Went through some of her things, very emotional', '2025-06-20T15:00:00Z'::timestamptz),
      (patient_id5, 1, 'Cant stop crying, everything reminds me of her', '2025-06-19T11:00:00Z'::timestamptz),
      (patient_id5, 2, 'Friends visited, helped a little', '2025-06-18T14:00:00Z'::timestamptz),
      (patient_id5, 1, 'First week without her, so hard', '2025-06-17T09:00:00Z'::timestamptz)
  ) AS mood_data(user_id, mood, note, created_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM mood_entries me 
    WHERE me.user_id = mood_data.user_id 
    AND me.created_at = mood_data.created_at
  );

  -- Insert sample journal entries if they don't exist
  INSERT INTO journal_entries (user_id, title, content, mood, tags, created_at)
  SELECT user_id, title, content, mood, tags, created_at
  FROM (
    VALUES
      (
        patient_id1,
        'Conquering Work Anxiety',
        'Today was a big day - I had to present to the entire executive team. I was so nervous this morning that I almost called in sick. But I remembered what Dr. Johnson taught me about breathing exercises and positive self-talk. I spent 10 minutes doing deep breathing and reminding myself that I am prepared and capable. The presentation went really well! I even got compliments from the CEO. I''m learning that my anxiety often makes things seem worse than they actually are.',
        4,
        ARRAY['anxiety', 'work', 'success', 'breathing exercises'],
        '2025-06-20T19:00:00Z'::timestamptz
      ),
      (
        patient_id2,
        'The Weight of Sadness',
        'Another difficult day. I keep trying to explain to people how depression feels, but they don''t understand. It''s not just being sad - it''s like there''s a heavy blanket over everything. Simple tasks feel impossible. Making breakfast feels like climbing a mountain. I know Dr. Patel says this will get better with time and medication, but right now it''s hard to believe. I''m trying to hold onto hope.',
        1,
        ARRAY['depression', 'medication', 'struggle', 'hope'],
        '2025-06-20T22:00:00Z'::timestamptz
      ),
      (
        patient_id3,
        'Healing Through EMDR',
        'Had another EMDR session with Dr. Garcia today. It''s amazing how this therapy works. We processed the memory of the accident, and while it was intense, I felt a shift afterward. The memory doesn''t have the same emotional charge it used to have. I can think about it without my heart racing or feeling like I''m back there. It''s giving me hope that I can reclaim my life from this trauma. Sleep has been better too.',
        4,
        ARRAY['EMDR', 'trauma', 'healing', 'progress'],
        '2025-06-17T20:00:00Z'::timestamptz
      ),
      (
        patient_id4,
        'One Month Sober',
        'Today marks one month without alcohol. I can''t believe I''ve made it this far. There were so many moments when I wanted to give up, especially during the first week. Dr. Anderson helped me understand that recovery isn''t just about stopping drinking - it''s about building a new life. I''ve started going to AA meetings, and hearing other people''s stories helps me feel less alone. I''m taking it one day at a time.',
        3,
        ARRAY['sobriety', 'AA', 'recovery', 'milestone'],
        '2025-06-17T21:00:00Z'::timestamptz
      ),
      (
        patient_id5,
        'Missing Mom',
        'It''s been two weeks since Mom passed away. Everyone keeps telling me that grief is normal, that it takes time, but I feel like I''m drowning. Everything reminds me of her - her favorite coffee mug, the songs she used to hum, even the way the morning light comes through the kitchen window. I started seeing Dr. Thompson, and she says this pain is the price of love. I guess that makes sense, but it doesn''t make it hurt any less.',
        1,
        ARRAY['grief', 'loss', 'mom', 'pain'],
        '2025-06-18T16:00:00Z'::timestamptz
      )
  ) AS journal_data(user_id, title, content, mood, tags, created_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM journal_entries je 
    WHERE je.user_id = journal_data.user_id 
    AND je.title = journal_data.title
  );

  -- Insert sample crisis events if they don't exist
  INSERT INTO crisis_events (user_id, detected_at, trigger_keywords, severity_level, user_response, message_context_hash, created_at)
  SELECT user_id, detected_at, trigger_keywords, severity_level, user_response, message_context_hash, created_at
  FROM (
    VALUES
      (
        patient_id2,
        '2025-06-20T02:30:00Z'::timestamptz,
        ARRAY['want to die', 'pointless', 'give up'],
        'high',
        'dismissed',
        'a1b2c3d4e5f6789012345678901234567890abcdef',
        '2025-06-20T02:30:00Z'::timestamptz
      ),
      (
        patient_id4,
        '2025-06-19T23:45:00Z'::timestamptz,
        ARRAY['hurt myself', 'relapse', 'cannot cope'],
        'medium',
        'contacted_help',
        'b2c3d4e5f6789012345678901234567890abcdef1',
        '2025-06-19T23:45:00Z'::timestamptz
      ),
      (
        patient_id5,
        '2025-06-18T14:20:00Z'::timestamptz,
        ARRAY['unbearable', 'escape the pain', 'hopeless'],
        'medium',
        'saved_resources',
        'c3d4e5f6789012345678901234567890abcdef12',
        '2025-06-18T14:20:00Z'::timestamptz
      )
  ) AS crisis_data(user_id, detected_at, trigger_keywords, severity_level, user_response, message_context_hash, created_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM crisis_events ce 
    WHERE ce.user_id = crisis_data.user_id 
    AND ce.message_context_hash = crisis_data.message_context_hash
  );

  -- Insert sample messages between therapists and patients if they don't exist
  INSERT INTO messages (sender_id, recipient_id, content, read, created_at)
  SELECT sender_id, recipient_id, content, read, created_at
  FROM (
    VALUES
      -- Conversation between Dr. Johnson (therapist_id1) and Alice (patient_id1)
      (therapist_id1, patient_id1, 'Hi Alice, I wanted to check in on how you''re feeling after yesterday''s session. How did the presentation go?', true, '2025-06-21T09:00:00Z'::timestamptz),
      (patient_id1, therapist_id1, 'Hi Dr. Johnson! The presentation went amazingly well. I used the breathing techniques we practiced and it really helped calm my nerves.', true, '2025-06-21T09:15:00Z'::timestamptz),
      (therapist_id1, patient_id1, 'That''s wonderful to hear! I''m so proud of how you''ve been applying the coping strategies. Keep up the great work.', true, '2025-06-21T09:20:00Z'::timestamptz),
      
      -- Conversation between Dr. Anderson (therapist_id4) and David (patient_id4)
      (patient_id4, therapist_id4, 'Dr. Anderson, I''m struggling today. Had some strong cravings after a stressful meeting at work.', false, '2025-06-21T15:30:00Z'::timestamptz),
      (therapist_id4, patient_id4, 'Thank you for reaching out instead of acting on those cravings. That shows real strength. Can you tell me what specific triggers you noticed?', false, '2025-06-21T15:35:00Z'::timestamptz),
      (patient_id4, therapist_id4, 'It was the combination of criticism from my boss and feeling like I failed. Those are the same feelings that used to drive me to drink.', false, '2025-06-21T15:40:00Z'::timestamptz),
      (therapist_id4, patient_id4, 'I hear you. Those are powerful triggers. Remember the HALT technique we discussed - are you Hungry, Angry, Lonely, or Tired right now?', false, '2025-06-21T15:42:00Z'::timestamptz),
      
      -- Conversation between Dr. Thompson (therapist_id5) and Emma (patient_id5)
      (therapist_id5, patient_id5, 'Emma, I noticed you missed our session yesterday. I wanted to check in and see how you''re doing.', false, '2025-06-21T11:00:00Z'::timestamptz),
      (patient_id5, therapist_id5, 'I''m sorry Dr. Thompson. I couldn''t bring myself to leave the house. Everything feels so overwhelming.', false, '2025-06-21T11:30:00Z'::timestamptz),
      (therapist_id5, patient_id5, 'Please don''t apologize. Grief can make even simple tasks feel impossible. Would you like to schedule a phone session instead?', false, '2025-06-21T11:35:00Z'::timestamptz)
  ) AS message_data(sender_id, recipient_id, content, read, created_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.sender_id = message_data.sender_id 
    AND m.recipient_id = message_data.recipient_id 
    AND m.content = message_data.content
  );

  -- Insert sample chat history (AI conversations) if they don't exist
  INSERT INTO chat_history (user_id, message_text, ai_reply_text, created_at)
  SELECT user_id, message_text, ai_reply_text, created_at
  FROM (
    VALUES
      (
        patient_id1,
        'I''m feeling really anxious about tomorrow''s meeting. I keep thinking about all the ways it could go wrong.',
        'I understand that anxiety about upcoming events can feel overwhelming. It sounds like your mind is focusing on worst-case scenarios. Let''s try a grounding exercise - can you tell me 5 things you can see around you right now?',
        '2025-06-20T20:00:00Z'::timestamptz
      ),
      (
        patient_id2,
        'I feel like nothing I do matters. What''s the point of even getting up in the morning?',
        'I hear the deep pain in your words, and I want you to know that what you''re feeling is valid. Depression can make everything feel meaningless, but that doesn''t mean you don''t matter. You matter deeply. Have you been able to connect with your therapist or support system recently?',
        '2025-06-20T14:30:00Z'::timestamptz
      ),
      (
        patient_id3,
        'Had a nightmare about the accident again last night. I thought EMDR was supposed to help with this.',
        'I''m sorry you had another difficult night. Healing from trauma isn''t always linear, and setbacks are a normal part of the process. EMDR can be very effective, but it often takes time. Have you been able to use any of the grounding techniques when you wake up from nightmares?',
        '2025-06-19T08:00:00Z'::timestamptz
      ),
      (
        patient_id4,
        'Walked past my old bar today and really wanted to go in. I managed to keep walking but it was so hard.',
        'Thank you for sharing that with me, and congratulations on making the choice to keep walking. That took incredible strength. Cravings are a normal part of recovery, and the fact that you didn''t act on it shows your commitment to your sobriety. How are you feeling now?',
        '2025-06-19T18:30:00Z'::timestamptz
      ),
      (
        patient_id5,
        'Found one of my mom''s old letters today. I can''t stop crying. Will this pain ever get easier?',
        'Finding reminders of someone we''ve lost can bring up such intense emotions. Your tears are a testament to the love you shared with your mom. Grief is love with nowhere to go, and it''s natural for it to feel overwhelming. While the pain may never completely disappear, many people find that it does become more manageable with time.',
        '2025-06-18T19:00:00Z'::timestamptz
      )
  ) AS chat_data(user_id, message_text, ai_reply_text, created_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM chat_history ch 
    WHERE ch.user_id = chat_data.user_id 
    AND ch.message_text = chat_data.message_text
  );

END $$;