-- Create super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Create billing_details table
CREATE TABLE IF NOT EXISTS billing_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  monthly_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_charge_percentage DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  service_charge_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  user_fee_per_month DECIMAL(8,2) NOT NULL DEFAULT 10.00,
  user_fees_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue')),
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pharmacy_id, billing_period_start, billing_period_end)
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_detail_id UUID REFERENCES billing_details(id) ON DELETE CASCADE,
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'check', 'cash')),
  payment_date DATE NOT NULL,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table for configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('service_charge_percentage', '2.00', 'Service charge percentage of monthly sales'),
('user_fee_per_month', '10.00', 'Monthly fee per pharmacy user'),
('invoice_due_days', '30', 'Number of days for invoice due date'),
('company_name', 'Healthlink Pharma Services', 'Company name for invoices'),
('company_address', '123 Healthcare Ave, Medical District, HC 12345', 'Company address for invoices'),
('company_email', 'billing@healthlinkpharma.com', 'Company email for billing'),
('company_phone', '+1-555-PHARMA', 'Company phone number')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_details_pharmacy_id ON billing_details(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_billing_details_period ON billing_details(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_details_status ON billing_details(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_billing_id ON payment_history(billing_detail_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON super_admins(user_id);
