import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Full Sleeve Cover Shirt",
    category: "Clothing",
    price: 40.00,
    original_price: 50.00,
    badge: "New",
    is_featured: true,
    is_flash_sale: true,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Beige", "White"],
    description: "Soft breathable linen blend full-sleeve cover shirt designed for effortless summer styling and layering."
  },
  {
    id: "prod-2",
    name: "Volunteer Half Blue",
    category: "Clothing",
    price: 35.00,
    original_price: 42.00,
    badge: "Sale",
    is_featured: true,
    is_flash_sale: true,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Teal Blue", "Sky Blue"],
    description: "Vibrant casual oversized cotton shirt with minimal embroidery and relaxed drop shoulder design."
  },
  {
    id: "prod-3",
    name: "Double Yellow Shirt",
    category: "Clothing",
    price: 36.00,
    original_price: 45.00,
    badge: "Hot",
    is_featured: true,
    is_flash_sale: true,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
    sizes: ["M", "L", "XL"],
    colors: ["Mustard Yellow", "Warm Ochre"],
    description: "Modern relaxed fit yellow shirt crafted with sustainable organic cotton fabric."
  },
  {
    id: "prod-4",
    name: "Long Belly Grey Pant",
    category: "Clothing",
    price: 32.00,
    original_price: 40.00,
    badge: "Sale",
    is_featured: true,
    is_flash_sale: true,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L"],
    colors: ["Light Grey", "Charcoal"],
    description: "High-waisted tailored straight-leg trousers with soft stretch waistband for maximum daily comfort."
  },
  {
    id: "prod-5",
    name: "Street Wear Casual Hoodie",
    category: "Clothing",
    price: 58.00,
    original_price: 75.00,
    badge: "Trending",
    is_featured: false,
    is_flash_sale: false,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop",
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Grey"],
    description: "Heavyweight fleece hoodie tailored for streetwear enthusiasts."
  },
  {
    id: "prod-6",
    name: "Basic Leather Shoes",
    category: "Shoes",
    price: 68.00,
    original_price: 85.00,
    badge: "Popular",
    is_featured: false,
    is_flash_sale: false,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    sizes: ["39", "40", "41", "42"],
    colors: ["White"],
    description: "Clean minimalist low-top sneakers."
  }
];

async function seed() {
  if (!supabase) {
    console.error("Supabase client not initialized.");
    return;
  }
  console.log("Re-seeding Supabase products with new categories...");
  const { data, error } = await supabase.from('products').upsert(INITIAL_PRODUCTS, { onConflict: 'id' });
  if (error) {
    console.error("Error seeding Supabase:", error.message);
  } else {
    console.log("✅ Successfully updated products in your Supabase database!");
  }
}

seed();
