import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://rnxwhaeyznkwwifvqmyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHdoYWV5em5rd3dpZnZxbXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNTQzNSwiZXhwIjoyMTA0MjAxNDM1fQ.Lhygo9QxQcw9JezEoierUF95ss3C-rskQnEiKOlnQWk'
);

const { data } = await s.from('products').select('id, name, created_at').order('created_at', { ascending: false });
console.log(data);
