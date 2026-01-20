-- Profiles table linked to Auth users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  google_review_url TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  refund_url TEXT,
  paddle_sub_status TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback requests table
CREATE TABLE IF NOT EXISTS feedback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, clicked, rated, expired
  rating INTEGER,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own feedback requests') THEN
        CREATE POLICY "Users can view own feedback requests" ON feedback_requests FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own feedback requests') THEN
        CREATE POLICY "Users can insert own feedback requests" ON feedback_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view specific request') THEN
        CREATE POLICY "Public can view specific request" ON feedback_requests FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update specific request') THEN
        CREATE POLICY "Public can update specific request" ON feedback_requests FOR UPDATE USING (true);
    END IF;
END $$;