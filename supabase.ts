import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
const supabaseUrl = 'https://vzgiwyijxgbvembejbsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2l3eWlqeGdidmVtYmVqYnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTc0NDQsImV4cCI6MjA4MzkzMzQ0NH0.hpDNRjS9yADDXXKxAMr9PGJnUy2kvKx-joVA_pG1HOA';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);