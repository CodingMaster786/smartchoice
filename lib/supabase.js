import { createClient } from '@supabase/supabase-js'
// Only the public anon key is used here. Security comes from Row Level Security (see supabase/schema.sql).
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
