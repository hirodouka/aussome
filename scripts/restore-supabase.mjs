// Script to restore all products from local products.json back into Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://rnxwhaeyznkwwifvqmyn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHdoYWV5em5rd3dpZnZxbXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNTQzNSwiZXhwIjoyMTA0MjAxNDM1fQ.Lhygo9QxQcw9JezEoierUF95ss3C-rskQnEiKOlnQWk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../backend/src/data/products.json'), 'utf-8'));
const products = data.products || [];

console.log(`Found ${products.length} products to restore...`);

const rows = products.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price),
  original_price: Number(p.originalPrice || p.price),
  badge: p.badge || 'New',
  image: p.image || '',
  is_featured: Boolean(p.isFeatured),
  is_flash_sale: Boolean(p.isFlashSale),
  rating: Number(p.rating || 5.0),
  description: p.description || '',
}));

// Insert in batches of 10 to avoid payload limits
const BATCH_SIZE = 10;
let restored = 0;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
  if (error) {
    console.error(`Error inserting batch ${i}–${i + BATCH_SIZE}:`, error.message);
  } else {
    restored += batch.length;
    console.log(`Restored ${restored}/${rows.length} products...`);
  }
}

console.log(`\n✅ Done! ${restored} products restored to Supabase.`);
