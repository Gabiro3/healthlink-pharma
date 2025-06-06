-- Super admin policies
CREATE POLICY "Super admins can view all data" ON super_admins
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage super admins" ON super_admins
  FOR ALL USING (
    user_id IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- Billing details policies
CREATE POLICY "Pharmacy admins can view their billing" ON billing_details
  FOR SELECT USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
    )
  );

CREATE POLICY "Super admins can manage all billing" ON billing_details
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- Payment history policies
CREATE POLICY "Pharmacy admins can view their payments" ON payment_history
  FOR SELECT USING (
    billing_detail_id IN (
      SELECT bd.id FROM billing_details bd
      JOIN pharmacy_users pu ON bd.pharmacy_id = pu.pharmacy_id
      WHERE pu.user_id = auth.uid() AND pu.role IN ('admin', 'manager') AND pu.is_active = true
    )
  );

CREATE POLICY "Super admins can manage all payments" ON payment_history
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

-- System settings policies
CREATE POLICY "Super admins can manage system settings" ON system_settings
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true)
  );

CREATE POLICY "Users can view system settings" ON system_settings
  FOR SELECT USING (true);

-- Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
