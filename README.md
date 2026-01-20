# 🌟 Vendofyx - Smart Feedback & Review Filter

Vendofyx is a professional SaaS platform designed to help businesses master their online reputation. It provides an ethical "feedback gate" that filters customer experiences: happy customers are funneled directly to Google Reviews, while dissatisfied customers are directed to a private inbox where businesses can resolve issues before they go public.

## 🚀 Key Features

- **Smart Funneling Logic**: 
  - 4-5 Stars: Encourages a "shoutout" and redirects to the business's Google Review page.
  - 1-3 Stars: Captures private feedback with categorized issue tags (Service, Speed, Quality, etc.).
- **Native Device Sharing**: Zero messaging costs. Generates links optimized for native SMS (`sms:`) and WhatsApp (`wa.me`) sharing directly from the business owner's device.
- **Dynamic Testimonials**: A "Wall of Love" on the landing page that pulls real 5-star shoutouts directly from the database.
- **Security & Privacy**: 
  - Automatic link expiration after 7 days to ensure feedback freshness.
  - Private feedback is encrypted and only visible to the business owner.
- **High-End UI/UX**:
  - Lightning "Thunder" strike and star burst animations on primary CTAs.
  - Interactive "Demo Tour" in the authentication flow.
  - Fully responsive, accessible, and mobile-first design.
- **Demo Mode**: Full application preview functionality even without a configured database backend.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS.
- **Icons**: Lucide React.
- **Backend/Auth**: Supabase (PostgreSQL + GoTrue).
- **Routing**: React Router 7 (HashRouter for easy deployment).
- **Animations**: Custom CSS Keyframes & Tailwind transitions.

## 📋 Database Schema (Supabase)

To run this project with a live backend, execute the following SQL in your Supabase editor:

```sql
-- Profiles table linked to Auth users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  google_review_url TEXT,
  paddle_sub_status TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback requests table
CREATE TABLE feedback_requests (
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
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own feedback requests" ON feedback_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback requests" ON feedback_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Public access for the Rate page
CREATE POLICY "Public can view specific request" ON feedback_requests FOR SELECT USING (true);
CREATE POLICY "Public can update specific request" ON feedback_requests FOR UPDATE USING (true);
```

## ⚙️ Configuration

The app detects your Supabase configuration automatically. If `_SUPABASE_URL` and `_SUPABASE_ANON_KEY` are not provided via window globals (or environment variables in a standard Vite build), the app will gracefully fall back to **Demo Mode**.

## 📖 How It Works

1. **Dashboard**: Business owner enters a customer name and clicks "Generate".
2. **Sharing**: A unique link is created. The owner clicks "Text SMS" or "WhatsApp" which opens their native app with a pre-filled message.
3. **The Gate**: 
   - Customer opens the link.
   - If they select **5 Stars**, they are asked for a quick quote (stored as a testimonial) then sent to Google.
   - If they select **1-3 Stars**, they are shown a private form to vent their frustrations.
4. **Closing the Loop**: The business owner sees the feedback in their "Private Inbox" on the dashboard and can reach out to the customer to fix the relationship.

## ⚖️ Legal
This project includes standard templates for:
- Terms of Service (User responsibility for SMS sending).
- Privacy Policy (Data handling).
- Refund Policy (7-Day Money-Back Guarantee).

---
*Built with ❤️ by the Vendofyx Team.*
