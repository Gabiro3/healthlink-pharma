-- Enable Row Level Security on all tables
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Pharmacy policies
CREATE POLICY "Users can view their own pharmacy" ON pharmacies
  FOR SELECT USING (
    id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Pharmacy users policies
CREATE POLICY "Users can view pharmacy users in their pharmacy" ON pharmacy_users
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage pharmacy users" ON pharmacy_users
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
    )
  );

-- Products policies
CREATE POLICY "Users can view products in their pharmacy" ON products
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage products in their pharmacy" ON products
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Vendors policies
CREATE POLICY "Users can view vendors in their pharmacy" ON vendors
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage vendors in their pharmacy" ON vendors
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Sales policies
CREATE POLICY "Users can view sales in their pharmacy" ON sales
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create sales in their pharmacy" ON sales
  FOR INSERT WITH CHECK (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Sale items policies
CREATE POLICY "Users can view sale items in their pharmacy" ON sale_items
  FOR SELECT USING (
    sale_id IN (
      SELECT id FROM sales 
      WHERE pharmacy_id IN (
        SELECT pharmacy_id FROM pharmacy_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create sale items in their pharmacy" ON sale_items
  FOR INSERT WITH CHECK (
    sale_id IN (
      SELECT id FROM sales 
      WHERE pharmacy_id IN (
        SELECT pharmacy_id FROM pharmacy_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Purchase orders policies
CREATE POLICY "Users can view purchase orders in their pharmacy" ON purchase_orders
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage purchase orders in their pharmacy" ON purchase_orders
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Purchase order items policies
CREATE POLICY "Users can view purchase order items in their pharmacy" ON purchase_order_items
  FOR SELECT USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders 
      WHERE pharmacy_id IN (
        SELECT pharmacy_id FROM pharmacy_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can manage purchase order items in their pharmacy" ON purchase_order_items
  FOR ALL USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders 
      WHERE pharmacy_id IN (
        SELECT pharmacy_id FROM pharmacy_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Invoices policies
CREATE POLICY "Users can view invoices in their pharmacy" ON invoices
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage invoices in their pharmacy" ON invoices
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view activity logs in their pharmacy" ON activity_logs
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Budgets policies
CREATE POLICY "Users can view budgets in their pharmacy" ON budgets
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Managers can manage budgets in their pharmacy" ON budgets
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
    )
  );
