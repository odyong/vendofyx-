import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
const supabaseUrl = 'https://vzgiwyijxgbvembejbsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2l3eWlqeGdidmVtYmVqYnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTc0NDQsImV4cCI6MjA4MzkzMzQ0NH0.hpDNRjS9yADDXXKxAMr9PGJnUy2kvKx-joVA_pG1HOA';

const isPlaceholder = (url: string, key: string) => 
  !url || url.includes('placeholder') || url.includes('your-project') || 
  !key || key.includes('placeholder') || key === 'your-anon-key';

// If keys are missing or still contain placeholder text, we enter "Sandbox Mode"
export const isSandboxMode = isPlaceholder(supabaseUrl, supabaseAnonKey);

// Exporting configuration status for conditional UI logic
export const isSupabaseConfigured = !isSandboxMode;

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);