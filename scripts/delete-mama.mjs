import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://rnxwhaeyznkwwifvqmyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHdoYWV5em5rd3dpZnZxbXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNTQzNSwiZXhwIjoyMTA0MjAxNDM1fQ.Lhygo9QxQcw9JezEoierUF95ss3C-rskQnEiKOlnQWk'
);

const { error } = await s.from('products').delete().eq('id', 'prod-1788716573016');
console.log('DELETE RESULT ERROR:', error);
