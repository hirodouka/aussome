import express from 'express';
import { 
  getData, 
  fetchSupabaseProducts,
  addProduct, 
  updateProduct, 
  deleteProduct, 
  addOrder,
  getOrders,
  updateOrderInStore
} from '../data/productsStore.js';

const router = express.Router();

// Healthcheck & Supabase status indicator
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    service: 'Ultras Backend API',
    supabaseConnected: Boolean(process.env.SUPABASE_URL)
  });
});

// Categories list
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'sale', name: 'Sale' }
  ];
  res.json(categories);
});

// Products: List with filter & search (Connected to Supabase)
router.get('/products', async (req, res) => {
  const { category, search, featured, flash_sale } = req.query;
  let list = await fetchSupabaseProducts();

  if (category && category.toLowerCase() !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    list = list.filter(p => p.isFeatured);
  }

  if (flash_sale === 'true') {
    list = list.filter(p => p.isFlashSale);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  res.json({ count: list.length, products: list });
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  const list = await fetchSupabaseProducts();
  const product = list.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Admin: Add Product (Syncs to Supabase + Local DB)
router.post('/products', async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

// Admin: Edit Product (Syncs to Supabase + Local DB)
router.put('/products/:id', async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
});

// Admin: Delete Product (Syncs to Supabase + Local DB)
router.delete('/products/:id', (req, res) => {
  const success = deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product deleted successfully', id: req.params.id });
});

// Journal / Blog articles
router.get('/journal', (req, res) => {
  const data = getData();
  res.json(data.journal || []);
});

// Quotes of the Day
router.get('/quotes', (req, res) => {
  const data = getData();
  res.json(data.quotes || []);
});

// Orders List & Details
router.get('/orders', (req, res) => {
  const orders = getOrders();
  res.json({ count: orders.length, orders });
});

// Submit Order (Checkout)
router.post('/orders', (req, res) => {
  try {
    const order = addOrder(req.body);
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to place order' });
  }
});

// Update Order Status (Admin Confirm)
router.put('/orders/:id', (req, res) => {
  try {
    const updated = updateOrderInStore(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update order' });
  }
});

export default router;
