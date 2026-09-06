import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

async function syncToSupabase() {
  if (!supabase) {
    console.error("❌ Supabase client is not available.");
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const { products } = JSON.parse(raw);

  console.log(`📌 Found ${products.length} products in local products.json:`);
  products.forEach(p => console.log(`   - ${p.id}: ${p.name}`));

  // 1. Delete items in Supabase that are not Zara or Penguin
  const validIds = products.map(p => p.id);
  const { data: existing, error: selectErr } = await supabase.from('products').select('id');
  if (selectErr) {
    console.error("❌ Error querying Supabase products:", selectErr.message);
  } else {
    const idsToDelete = existing.map(e => e.id).filter(id => !validIds.includes(id));
    if (idsToDelete.length > 0) {
      console.log(`🧹 Removing ${idsToDelete.length} stale items from Supabase:`, idsToDelete);
      const { error: delErr } = await supabase.from('products').delete().in('id', idsToDelete);
      if (delErr) console.error("❌ Error deleting stale items:", delErr.message);
      else console.log("✅ Stale items deleted from Supabase.");
    }
  }

  // 2. Upsert Zara and Penguin into Supabase
  const dbPayload = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice || p.price,
    badge: p.badge || 'New',
    is_featured: p.isFeatured !== undefined ? p.isFeatured : true,
    is_flash_sale: p.isFlashSale !== undefined ? p.isFlashSale : false,
    rating: p.rating || 5.0,
    image: p.image,
    description: p.description || '',
    sizes: p.sizes || ["S", "M", "L"],
    colors: p.colors || ["Default"]
  }));

  console.log("🚀 Upserting current products to Supabase...");
  const { error: upsertErr } = await supabase.from('products').upsert(dbPayload, { onConflict: 'id' });
  if (upsertErr) {
    console.error("❌ Error upserting to Supabase:", upsertErr.message);
  } else {
    console.log("🎉 Successfully synced products to Supabase!");
  }
}

syncToSupabase();
