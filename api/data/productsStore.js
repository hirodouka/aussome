import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'products.json');

const INITIAL_PRODUCTS = [];

const INITIAL_JOURNAL = [
  {
    id: "j-1",
    title: "10 Essential Pieces for a Timeless Capsule Wardrobe",
    date: "Aug 28, 2026",
    readTime: "5 min read",
    author: "Jane Vance",
    category: "Fashion Tips",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "j-2",
    title: "The Denim Revival: Styling Denim for Modern Casual Looks",
    date: "Aug 20, 2026",
    readTime: "4 min read",
    author: "Marcella Thorne",
    category: "Trends",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "j-3",
    title: "Eco-Friendly Fabrics: Why Sustainable Cotton Matters",
    date: "Aug 12, 2026",
    readTime: "6 min read",
    author: "Oliver Bennett",
    category: "Sustainability",
    image: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=800&auto=format&fit=crop"
  }
];

const INITIAL_QUOTES = [
  {
    id: "q-1",
    quote: "It's true. I don't like the whole cutoff-shorts-and-T-shirt look, but I think you can look fantastic in casual clothes.",
    author: "Catherine Zeta-Jones"
  }
];

function ensureFileExists() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      products: INITIAL_PRODUCTS,
      journal: INITIAL_JOURNAL,
      quotes: INITIAL_QUOTES,
      orders: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getData() {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { products: INITIAL_PRODUCTS, journal: INITIAL_JOURNAL, quotes: INITIAL_QUOTES, orders: [] };
  }
}

export function saveData(data) {
  try {
    ensureFileExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Serverless environment file write skipped:', err.message);
  }
}

// Supabase Async Operations with Local JSON Sync
export async function fetchSupabaseProducts() {
  const localData = getData();
  const localProds = localData.products || [];

  if (!supabase) return localProds;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.error("Supabase fetch error:", error.message);
      return localProds;
    }
    if (!data || data.length === 0) {
      return [];
    }
    const remoteList = data.map(p => {
      const mainImage = p.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop";
      const imageArray = (Array.isArray(p.images) && p.images.length > 0)
        ? p.images
        : [mainImage];

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        originalPrice: Number(p.original_price || p.price),
        badge: p.badge,
        isFeatured: p.is_featured,
        isFlashSale: p.is_flash_sale,
        rating: Number(p.rating || 5.0),
        image: mainImage,
        images: imageArray,
        status: p.status || 'Available',
        sizes: p.sizes || ["S", "M", "L"],
        colors: p.colors || ["Default"],
        description: p.description || ""
      };
    });

    return remoteList;
  } catch (err) {
    return localProds;
  }
}

export async function addProduct(product) {
  const data = getData();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: product.name || "Untitled Product",
    category: product.category || "Clothing",
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    badge: product.badge || "New",
    isFeatured: product.isFeatured !== undefined ? Boolean(product.isFeatured) : true,
    isFlashSale: product.isFlashSale !== undefined ? Boolean(product.isFlashSale) : false,
    rating: Number(product.rating) || 5.0,
    image: product.image || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"],
    status: product.status || "Available",
    sizes: Array.isArray(product.sizes) ? product.sizes : ["S", "M", "L", "XL"],
    colors: Array.isArray(product.colors) ? product.colors : ["Default"],
    description: product.description || "High quality product."
  };
  data.products.unshift(newProduct);
  saveData(data);

  if (supabase) {
    try {
      const { error } = await supabase.from('products').insert([{
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        badge: newProduct.badge,
        is_featured: newProduct.isFeatured,
        is_flash_sale: newProduct.isFlashSale,
        rating: newProduct.rating,
        image: newProduct.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        description: newProduct.description
      }]);
      if (error) {
        console.error("Supabase Sync (Add Error):", error.message);
        throw new Error(`Supabase insert failed: ${error.message}`);
      }
    } catch (err) {
      console.error("Supabase Exception (Add):", err.message);
      throw err;
    }
  }

  return newProduct;
}

export async function updateProduct(id, updatedFields) {
  const data = getData();
  const index = data.products.findIndex(p => p.id === id);
  if (index === -1) return null;

  data.products[index] = {
    ...data.products[index],
    ...updatedFields,
    price: updatedFields.price !== undefined ? Number(updatedFields.price) : data.products[index].price,
    originalPrice: updatedFields.originalPrice !== undefined ? Number(updatedFields.originalPrice) : data.products[index].originalPrice,
    images: Array.isArray(updatedFields.images) && updatedFields.images.length > 0
      ? updatedFields.images
      : (updatedFields.image ? [updatedFields.image] : data.products[index].images || [])
  };
  saveData(data);

  if (supabase) {
    const p = data.products[index];
    try {
      const { error } = await supabase.from('products').update({
        name: p.name,
        category: p.category,
        price: p.price,
        original_price: p.originalPrice,
        badge: p.badge,
        is_featured: p.isFeatured,
        is_flash_sale: p.isFlashSale,
        image: p.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
        sizes: p.sizes,
        colors: p.colors,
        description: p.description
      }).eq('id', id);
      if (error) {
        console.error("Supabase Sync (Update Error):", error.message);
        throw new Error(`Supabase update failed: ${error.message}`);
      }
    } catch (err) {
      console.error("Supabase Exception (Update):", err.message);
      throw err;
    }
  }

  return data.products[index];
}

export async function deleteProduct(id) {
  const data = getData();
  const initialLength = data.products.length;
  data.products = data.products.filter(p => p.id !== id);
  
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.warn("Supabase Sync (Delete):", error.message);
    } catch (err) {
      console.warn("Supabase Exception (Delete):", err.message);
    }
  }

  saveData(data);
  return true;
}

export function getOrders() {
  const data = getData();
  return data.orders || [];
}

export function addOrder(orderData) {
  const data = getData();
  if (!data.orders) data.orders = [];
  
  const newOrder = {
    id: orderData.id || `ORD-${Date.now().toString().slice(-6)}`,
    createdAt: orderData.createdAt || new Date().toISOString(),
    fullName: orderData.customer?.name || orderData.fullName || 'Customer',
    contactNumber: orderData.customer?.phone || orderData.contactNumber || '',
    messageToSeller: orderData.customer?.messageToSeller || orderData.messageToSeller || '',
    items: orderData.items || [],
    totalAmount: Number(
      orderData.totalAmount || 
      orderData.total || 
      (orderData.items || []).reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0)
    ),
    paymentMethod: orderData.paymentMethod || 'Cash',
    paymentProof: orderData.proofOfPayment || orderData.paymentProof || null,
    status: orderData.status || (orderData.paymentMethod === 'Bank' ? 'Pending Payment Verification' : 'Order Placed (Cash)'),
    paymentConfirmed: Boolean(orderData.paymentConfirmed)
  };
  
  data.orders.unshift(newOrder);
  saveData(data);

  if (supabase) {
    supabase.from('orders').insert([{
      id: newOrder.id,
      items: newOrder.items,
      total: newOrder.totalAmount,
      customer: { name: newOrder.fullName, phone: newOrder.contactNumber, message: newOrder.messageToSeller },
      payment_method: newOrder.paymentMethod,
      payment_proof: newOrder.paymentProof,
      status: newOrder.status
    }]).then(({ error }) => {
      if (error) console.warn("Supabase Sync (Order):", error.message);
    });
  }

  return newOrder;
}

export function updateOrderInStore(orderId, updateFields) {
  const data = getData();
  if (!data.orders) data.orders = [];
  const index = data.orders.findIndex(o => o.id === orderId);
  if (index > -1) {
    data.orders[index] = { ...data.orders[index], ...updateFields };
    saveData(data);
    return data.orders[index];
  }
  return null;
}
