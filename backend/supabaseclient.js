import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfunpfqsonkbswauuqyd.supabase.co';
const supabaseKey = 'sb_secret_ZNlLHtc0MFeooQJKAupEKg_B0xnoQhx'; // from Supabase Dashboard → Settings → API
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;