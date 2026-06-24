import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Eterna] Supabase env vars are not set. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend .env file.'
  );
} else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.warn(
    `[Eterna] Invalid VITE_SUPABASE_URL: "${supabaseUrl}". It must start with http:// or https://.`
  );
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('[Eterna] Failed to initialize Supabase client:', error);
  }
}

export const supabase = supabaseInstance;

