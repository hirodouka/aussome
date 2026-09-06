-- Execute this SQL script in your Supabase SQL Editor to set up tables:

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  badge TEXT,
  is_featured BOOLEAN DEFAULT true,
  is_flash_sale BOOLEAN DEFAULT false,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  image TEXT NOT NULL,
  status TEXT DEFAULT 'Available',
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Default'],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists, run this to add status column:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  customer JSONB NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  payment_proof TEXT,
  status TEXT DEFAULT 'Pending Payment Verification'
);

-- If orders table already exists, run these to update columns:
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- Enable RLS (Row Level Security) and allow public read/write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin all operations" ON public.products FOR ALL USING (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read order" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin update order" ON public.orders FOR UPDATE USING (true);
