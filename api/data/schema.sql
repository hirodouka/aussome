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
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Default'],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  customer JSONB NOT NULL,
  status TEXT DEFAULT 'Pending'
);

-- Enable RLS (Row Level Security) and allow public read
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin all operations" ON public.products FOR ALL USING (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read order" ON public.orders FOR SELECT USING (true);
