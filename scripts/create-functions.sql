-- Function to update stock after sale
CREATE OR REPLACE FUNCTION update_stock_after_sale(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sales report
CREATE OR REPLACE FUNCTION generate_sales_report(
  p_pharmacy_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_group_by TEXT DEFAULT 'day'
)
RETURNS TABLE (
  period TEXT,
  total_sales DECIMAL,
  total_transactions INTEGER,
  average_transaction DECIMAL
) AS $$
BEGIN
  IF p_group_by = 'day' THEN
    RETURN QUERY
    SELECT 
      DATE(s.created_at)::TEXT as period,
      SUM(s.total_amount) as total_sales,
      COUNT(*)::INTEGER as total_transactions,
      AVG(s.total_amount) as average_transaction
    FROM sales s
    WHERE s.pharmacy_id = p_pharmacy_id
      AND DATE(s.created_at) BETWEEN p_start_date AND p_end_date
      AND s.status = 'completed'
    GROUP BY DATE(s.created_at)
    ORDER BY DATE(s.created_at);
  ELSIF p_group_by = 'week' THEN
    RETURN QUERY
    SELECT 
      CONCAT('Week ', EXTRACT(WEEK FROM s.created_at), ' - ', EXTRACT(YEAR FROM s.created_at))::TEXT as period,
      SUM(s.total_amount) as total_sales,
      COUNT(*)::INTEGER as total_transactions,
      AVG(s.total_amount) as average_transaction
    FROM sales s
    WHERE s.pharmacy_id = p_pharmacy_id
      AND DATE(s.created_at) BETWEEN p_start_date AND p_end_date
      AND s.status = 'completed'
    GROUP BY EXTRACT(WEEK FROM s.created_at), EXTRACT(YEAR FROM s.created_at)
    ORDER BY EXTRACT(YEAR FROM s.created_at), EXTRACT(WEEK FROM s.created_at);
  ELSIF p_group_by = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(s.created_at, 'YYYY-MM')::TEXT as period,
      SUM(s.total_amount) as total_sales,
      COUNT(*)::INTEGER as total_transactions,
      AVG(s.total_amount) as average_transaction
    FROM sales s
    WHERE s.pharmacy_id = p_pharmacy_id
      AND DATE(s.created_at) BETWEEN p_start_date AND p_end_date
      AND s.status = 'completed'
    GROUP BY TO_CHAR(s.created_at, 'YYYY-MM')
    ORDER BY TO_CHAR(s.created_at, 'YYYY-MM');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales statistics
CREATE OR REPLACE FUNCTION get_sales_stats(p_pharmacy_id UUID)
RETURNS TABLE (
  today_sales DECIMAL,
  this_month_sales DECIMAL,
  total_sales DECIMAL,
  total_transactions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN DATE(s.created_at) = CURRENT_DATE THEN s.total_amount ELSE 0 END), 0) as today_sales,
    COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM s.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
                      AND EXTRACT(YEAR FROM s.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) 
                      THEN s.total_amount ELSE 0 END), 0) as this_month_sales,
    COALESCE(SUM(s.total_amount), 0) as total_sales,
    COUNT(*)::INTEGER as total_transactions
  FROM sales s
  WHERE s.pharmacy_id = p_pharmacy_id
    AND s.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory statistics
CREATE OR REPLACE FUNCTION get_inventory_stats(p_pharmacy_id UUID)
RETURNS TABLE (
  total_products INTEGER,
  low_stock_products INTEGER,
  out_of_stock_products INTEGER,
  total_inventory_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_products,
    COUNT(CASE WHEN p.stock_quantity <= p.reorder_level AND p.stock_quantity > 0 THEN 1 END)::INTEGER as low_stock_products,
    COUNT(CASE WHEN p.stock_quantity = 0 THEN 1 END)::INTEGER as out_of_stock_products,
    COALESCE(SUM(p.stock_quantity * p.unit_price), 0) as total_inventory_value
  FROM products p
  WHERE p.pharmacy_id = p_pharmacy_id
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;
