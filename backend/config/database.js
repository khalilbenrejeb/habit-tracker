import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error('Supabase connection error:', error);
    else console.log('✓ Supabase connected successfully');
  } catch (err) {
    console.error('Failed to connect to Supabase:', err.message);
  }
};

export default supabase;
