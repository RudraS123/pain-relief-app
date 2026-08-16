import { createClient } from "@supabase/supabase-js";

// Pull the values from your .env file (loaded automatically by Expo
// at build time, because of the EXPO_PUBLIC_ prefix)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// createClient sets up a single reusable connection object.
// You'll import "supabase" from this file anywhere you need to
// talk to your database or auth system — never recreate it elsewhere.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
