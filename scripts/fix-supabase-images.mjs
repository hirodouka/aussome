import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const s = createClient(
  'https://rnxwhaeyznkwwifvqmyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHdoYWV5em5rd3dpZnZxbXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNTQzNSwiZXhwIjoyMTA0MjAxNDM1fQ.Lhygo9QxQcw9JezEoierUF95ss3C-rskQnEiKOlnQWk'
);

const rawData = fs.readFileSync('api/data/products.json', 'utf-8');
const { products } = JSON.parse(rawData);

for (const p of products) {
  const { error } = await s.from('products').update({
    image: p.image
  }).eq('id', p.id);
  console.log('Update', p.name, '->', error ? error.message : 'SUCCESS');
}
