-- Function to get pharmacy dashboard stats
CREATE OR REPLACE FUNCTION get_pharmacy_admin_stats(p_pharmacy_id UUID)
RETURNS TABLE (
  total_users INTEGER,
  total_products INTEGER,
  total_sales_this_month DECIMAL,
  total_sales_all_time DECIMAL,
  active_orders INTEGER,
  low_stock_products INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM pharmacy_users WHERE pharmacy_id = p_pharmacy_id AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM products WHERE pharmacy_id = p_pharmacy_id AND is_active = true),
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales 
     WHERE pharmacy_id = p_pharmacy_id 
     AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
     AND status = 'completed'),
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales 
     WHERE pharmacy_id = p_pharmacy_id AND status = 'completed'),
    (SELECT COUNT(*)::INTEGER FROM purchase_orders 
     WHERE pharmacy_id = p_pharmacy_id AND status IN ('pending', 'approved', 'ordered')),
    (SELECT COUNT(*)::INTEGER FROM products 
     WHERE pharmacy_id = p_pharmacy_id AND stock_quantity <= reorder_level AND is_active = true);
END;
$$ LANGUAGE plpgsql;

-- Function to get super admin dashboard stats
CREATE OR REPLACE FUNCTION get_super_admin_stats()
RETURNS TABLE (
  total_pharmacies INTEGER,
  total_users INTEGER,
  total_products INTEGER,
  total_sales_this_month DECIMAL,
  total_sales_all_time DECIMAL,
  active_pharmacies INTEGER,
  pending_invoices INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM pharmacies WHERE is_active = true),
    (SELECT COUNT(*)::INTEGER FROM pharmacy_users WHERE is_active = true),
    (SELECT COUNT(*)::INTEGER FROM products WHERE is_active = true),
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales 
     WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
     AND status = 'completed'),
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE status = 'completed'),
    (SELECT COUNT(*)::INTEGER FROM pharmacies WHERE is_active = true),
    (SELECT COUNT(*)::INTEGER FROM billing_details WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monthly billing for a pharmacy
CREATE OR REPLACE FUNCTION calculate_monthly_billing(
  p_pharmacy_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
  v_billing_id UUID;
  v_monthly_sales DECIMAL;
  v_user_count INTEGER;
  v_service_charge_percentage DECIMAL;
  v_user_fee_per_month DECIMAL;
  v_service_charge_amount DECIMAL;
  v_user_fees_total DECIMAL;
  v_total_amount DECIMAL;
  v_invoice_number TEXT;
BEGIN
  -- Get system settings
  SELECT setting_value::DECIMAL INTO v_service_charge_percentage 
  FROM system_settings WHERE setting_key = 'service_charge_percentage';
  
  SELECT setting_value::DECIMAL INTO v_user_fee_per_month 
  FROM system_settings WHERE setting_key = 'user_fee_per_month';

  -- Calculate monthly sales
  SELECT COALESCE(SUM(total_amount), 0) INTO v_monthly_sales
  FROM sales 
  WHERE pharmacy_id = p_pharmacy_id 
  AND DATE(created_at) BETWEEN p_period_start AND p_period_end
  AND status = 'completed';

  -- Get user count
  SELECT COUNT(*) INTO v_user_count
  FROM pharmacy_users 
  WHERE pharmacy_id = p_pharmacy_id AND is_active = true;

  -- Calculate charges
  v_service_charge_amount := v_monthly_sales * (v_service_charge_percentage / 100);
  v_user_fees_total := v_user_count * v_user_fee_per_month;
  v_total_amount := v_service_charge_amount + v_user_fees_total;

  -- Generate invoice number
  v_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || 
                      LPAD(EXTRACT(DAY FROM CURRENT_DATE)::TEXT, 2, '0') || '-' ||
                      SUBSTRING(p_pharmacy_id::TEXT, 1, 8);

  -- Insert or update billing details
  INSERT INTO billing_details (
    pharmacy_id,
    billing_period_start,
    billing_period_end,
    monthly_sales,
    service_charge_percentage,
    service_charge_amount,
    user_count,
    user_fee_per_month,
    user_fees_total,
    total_amount,
    invoice_number,
    invoice_date,
    due_date
  ) VALUES (
    p_pharmacy_id,
    p_period_start,
    p_period_end,
    v_monthly_sales,
    v_service_charge_percentage,
    v_service_charge_amount,
    v_user_count,
    v_user_fee_per_month,
    v_user_fees_total,
    v_total_amount,
    v_invoice_number,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
  )
  ON CONFLICT (pharmacy_id, billing_period_start, billing_period_end)
  DO UPDATE SET
    monthly_sales = EXCLUDED.monthly_sales,
    service_charge_amount = EXCLUDED.service_charge_amount,
    user_count = EXCLUDED.user_count,
    user_fees_total = EXCLUDED.user_fees_total,
    total_amount = EXCLUDED.total_amount,
    updated_at = NOW()
  RETURNING id INTO v_billing_id;

  RETURN v_billing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get product sales report
CREATE OR REPLACE FUNCTION get_product_sales_report(
  p_pharmacy_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  category TEXT,
  total_quantity_sold INTEGER,
  total_revenue DECIMAL,
  average_price DECIMAL,
  sale_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    COALESCE(SUM(si.quantity), 0)::INTEGER as total_quantity_sold,
    COALESCE(SUM(si.total_price), 0) as total_revenue,
    COALESCE(AVG(si.unit_price), 0) as average_price,
    COUNT(DISTINCT s.id)::INTEGER as sale_count
  FROM products p
  LEFT JOIN sale_items si ON p.id = si.product_id
  LEFT JOIN sales s ON si.sale_id = s.id
  WHERE p.pharmacy_id = p_pharmacy_id
    AND p.is_active = true
    AND (p_start_date IS NULL OR DATE(s.created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(s.created_at) <= p_end_date)
    AND (s.status IS NULL OR s.status = 'completed')
  GROUP BY p.id, p.name, p.category
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate all users in a pharmacy
CREATE OR REPLACE FUNCTION deactivate_pharmacy_users(p_pharmacy_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_affected_count INTEGER;
BEGIN
  UPDATE pharmacy_users 
  SET is_active = false, updated_at = NOW()
  WHERE pharmacy_id = p_pharmacy_id AND is_active = true;
  
  GET DIAGNOSTICS v_affected_count = ROW_COUNT;
  
  RETURN v_affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice for pharmacy
CREATE OR REPLACE FUNCTION generate_pharmacy_invoice(p_billing_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_billing billing_details%ROWTYPE;
  v_pharmacy pharmacies%ROWTYPE;
  v_company_info JSONB;
  v_invoice JSONB;
BEGIN
  -- Get billing details
  SELECT * INTO v_billing FROM billing_details WHERE id = p_billing_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Billing record not found';
  END IF;

  -- Get pharmacy details
  SELECT * INTO v_pharmacy FROM pharmacies WHERE id = v_billing.pharmacy_id;

  -- Get company information
  SELECT jsonb_object_agg(setting_key, setting_value) INTO v_company_info
  FROM system_settings 
  WHERE setting_key IN ('company_name', 'company_address', 'company_email', 'company_phone');

  -- Build invoice JSON
  v_invoice := jsonb_build_object(
    'invoice_number', v_billing.invoice_number,
    'invoice_date', v_billing.invoice_date,
    'due_date', v_billing.due_date,
    'billing_period', jsonb_build_object(
      'start', v_billing.billing_period_start,
      'end', v_billing.billing_period_end
    ),
    'company', v_company_info,
    'pharmacy', jsonb_build_object(
      'name', v_pharmacy.name,
      'code', v_pharmacy.code,
      'address', v_pharmacy.address,
      'contact_number', v_pharmacy.contact_number,
      'email', v_pharmacy.email
    ),
    'charges', jsonb_build_object(
      'monthly_sales', v_billing.monthly_sales,
      'service_charge_percentage', v_billing.service_charge_percentage,
      'service_charge_amount', v_billing.service_charge_amount,
      'user_count', v_billing.user_count,
      'user_fee_per_month', v_billing.user_fee_per_month,
      'user_fees_total', v_billing.user_fees_total,
      'total_amount', v_billing.total_amount
    ),
    'status', v_billing.status
  );

  -- Update billing status to 'sent'
  UPDATE billing_details 
  SET status = 'sent', updated_at = NOW()
  WHERE id = p_billing_id;

  RETURN v_invoice;
END;
$$ LANGUAGE plpgsql;
