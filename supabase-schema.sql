-- ============================================================
-- Mobile Shop POS — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enums
CREATE TYPE product_category AS ENUM ('phone', 'accessory', 'part', 'service');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'mixed');
CREATE TYPE repair_status AS ENUM ('received', 'diagnosing', 'waiting_parts', 'repairing', 'ready', 'completed', 'cancelled');
CREATE TYPE stock_adjustment_type AS ENUM ('restock', 'damage', 'return', 'correction');

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category product_category NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  cost_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  sale_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Adjustments
CREATE TABLE stock_adjustments (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type stock_adjustment_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  device_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  payment_method payment_method NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  tax DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sale Items
CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  line_total DOUBLE PRECISION NOT NULL
);

-- Repair Tickets
CREATE TABLE repair_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  device TEXT NOT NULL,
  imei TEXT NOT NULL DEFAULT '',
  issue TEXT NOT NULL,
  status repair_status NOT NULL DEFAULT 'received',
  estimate DOUBLE PRECISION NOT NULL DEFAULT 0,
  deposit DOUBLE PRECISION NOT NULL DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) — allow all for now (no auth)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- Public access policies (since no auth yet)
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on stock_adjustments" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on repair_tickets" ON repair_tickets FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- RPC: Create stock adjustment (transactional)
-- ============================================================
CREATE OR REPLACE FUNCTION create_stock_adjustment(
  p_product_id INTEGER,
  p_type stock_adjustment_type,
  p_quantity_change INTEGER,
  p_note TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_product RECORD;
  v_previous_stock INTEGER;
  v_new_stock INTEGER;
  v_adjustment RECORD;
BEGIN
  IF p_quantity_change = 0 THEN
    RAISE EXCEPTION 'Quantity change cannot be zero';
  END IF;

  SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  v_previous_stock := v_product.stock;
  v_new_stock := v_previous_stock + p_quantity_change;

  IF v_new_stock < 0 THEN
    RAISE EXCEPTION '% cannot be adjusted below zero stock', v_product.name;
  END IF;

  INSERT INTO stock_adjustments (product_id, type, quantity_change, previous_stock, new_stock, note)
  VALUES (p_product_id, p_type, p_quantity_change, v_previous_stock, v_new_stock, COALESCE(p_note, ''))
  RETURNING * INTO v_adjustment;

  UPDATE products SET stock = v_new_stock WHERE id = p_product_id;

  RETURN row_to_json(v_adjustment);
END;
$$;

-- ============================================================
-- RPC: Create sale (transactional — creates sale, items, updates stock)
-- ============================================================
CREATE OR REPLACE FUNCTION create_sale(
  p_customer_id INTEGER DEFAULT NULL,
  p_payment_method payment_method DEFAULT 'cash',
  p_discount DOUBLE PRECISION DEFAULT 0,
  p_tax DOUBLE PRECISION DEFAULT 0,
  p_notes TEXT DEFAULT '',
  p_items JSON DEFAULT '[]'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_item JSON;
  v_product RECORD;
  v_subtotal DOUBLE PRECISION := 0;
  v_total DOUBLE PRECISION;
  v_line_total DOUBLE PRECISION;
  v_sale RECORD;
  v_receipt TEXT;
BEGIN
  -- Generate receipt number
  v_receipt := 'R-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT));

  -- Validate items and calculate subtotal
  FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId')::INTEGER FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'productId';
    END IF;
    IF v_product.category != 'service' AND v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION '% only has % in stock', v_product.name, v_product.stock;
    END IF;
    v_line_total := (v_item->>'quantity')::INTEGER * (v_item->>'unitPrice')::DOUBLE PRECISION;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := GREATEST(0, v_subtotal - p_discount + p_tax);

  -- Create sale
  INSERT INTO sales (receipt_number, customer_id, payment_method, subtotal, discount, tax, total, notes)
  VALUES (v_receipt, p_customer_id, p_payment_method, v_subtotal, p_discount, p_tax, v_total, COALESCE(p_notes, ''))
  RETURNING * INTO v_sale;

  -- Create sale items and update stock
  FOR v_item IN SELECT * FROM json_array_elements(p_items) LOOP
    v_line_total := (v_item->>'quantity')::INTEGER * (v_item->>'unitPrice')::DOUBLE PRECISION;

    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
    VALUES (v_sale.id, (v_item->>'productId')::INTEGER, (v_item->>'quantity')::INTEGER, (v_item->>'unitPrice')::DOUBLE PRECISION, v_line_total);

    SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId')::INTEGER;
    IF v_product.category != 'service' THEN
      UPDATE products SET stock = stock - (v_item->>'quantity')::INTEGER WHERE id = (v_item->>'productId')::INTEGER;
    END IF;
  END LOOP;

  RETURN row_to_json(v_sale);
END;
$$;
