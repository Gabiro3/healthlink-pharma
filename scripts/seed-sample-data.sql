-- Insert sample pharmacy
INSERT INTO pharmacies (name, code, address, contact_number, email) VALUES
('MediCare Pharmacy', 'PH-12345', '123 Main Street, Downtown', '+1234567890', 'info@medicare.com');

-- Get the pharmacy ID for reference
DO $$
DECLARE
    pharmacy_uuid UUID;
BEGIN
    SELECT id INTO pharmacy_uuid FROM pharmacies WHERE code = 'PH-12345';
    
    -- Insert sample products
    INSERT INTO products (name, description, sku, category, unit_price, stock_quantity, reorder_level, pharmacy_id) VALUES
    ('Paracetamol 500mg', 'Pain relief and fever reducer', 'PAR500', 'Pain Relief', 2.50, 100, 20, pharmacy_uuid),
    ('Ibuprofen 400mg', 'Anti-inflammatory pain relief', 'IBU400', 'Pain Relief', 3.75, 75, 15, pharmacy_uuid),
    ('Amoxicillin 250mg', 'Antibiotic capsules', 'AMX250', 'Antibiotics', 8.50, 50, 10, pharmacy_uuid),
    ('Vitamin C 1000mg', 'Immune system support', 'VITC1000', 'Vitamins', 12.00, 200, 30, pharmacy_uuid),
    ('Cough Syrup', 'Relief for dry and wet cough', 'COUGH001', 'Cough & Cold', 6.25, 80, 15, pharmacy_uuid);
    
    -- Insert sample vendors
    INSERT INTO vendors (name, contact_person, email, phone, address, pharmacy_id) VALUES
    ('PharmaCorp Ltd', 'John Smith', 'john@pharmacorp.com', '+1234567891', '456 Industrial Ave', pharmacy_uuid),
    ('MedSupply Inc', 'Sarah Johnson', 'sarah@medsupply.com', '+1234567892', '789 Business Park', pharmacy_uuid),
    ('HealthDistributors', 'Mike Wilson', 'mike@healthdist.com', '+1234567893', '321 Commerce St', pharmacy_uuid);
    
    -- Insert sample budget categories
    INSERT INTO budgets (year, month, category, allocated_amount, spent_amount, pharmacy_id) VALUES
    (2024, 1, 'Inventory Purchase', 10000.00, 7500.00, pharmacy_uuid),
    (2024, 1, 'Operating Expenses', 3000.00, 2100.00, pharmacy_uuid),
    (2024, 1, 'Marketing', 1500.00, 800.00, pharmacy_uuid),
    (2024, 2, 'Inventory Purchase', 12000.00, 5000.00, pharmacy_uuid),
    (2024, 2, 'Operating Expenses', 3200.00, 1800.00, pharmacy_uuid);
END $$;
