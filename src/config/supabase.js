import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)?.replace(/^"|"$/g, '');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/^"|"$/g, '');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided in the environment variables.');
}

// Service role client bypassing RLS, for admin actions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
