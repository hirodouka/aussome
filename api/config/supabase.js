import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SUPABASE_URL = "https://rnxwhaeyznkwwifvqmyn.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHdoYWV5em5rd3dpZnZxbXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNTQzNSwiZXhwIjoyMTA0MjAxNDM1fQ.Lhygo9QxQcw9JezEoierUF95ss3C-rskQnEiKOlnQWk";

const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials missing from .env file. Falling back to local database mode.");
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
