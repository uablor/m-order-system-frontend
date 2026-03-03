-- Fix for missing image_id column issue
-- This script adds the image_id column to the relevant tables

-- First, let's identify which table needs the image_id column
-- Based on the error, it seems to be related to customer orders or payments

-- Option 1: Add image_id to customer_orders table (if this is where payment proof images are stored)
ALTER TABLE customer_orders 
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255) NULL COMMENT 'Payment proof image ID';

-- Option 2: Add image_id to payments table (if this is where payment proof images are stored)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255) NULL COMMENT 'Payment proof image ID';

-- Option 3: Add image_id to customer_order_items table (if this is where product images are stored)
ALTER TABLE customer_order_items 
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255) NULL COMMENT 'Product image ID';

-- Option 4: Create a separate payment_proofs table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_order_id INT NOT NULL,
    image_id VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_order_id) REFERENCES customer_orders(id),
    INDEX idx_customer_order_id (customer_order_id)
) COMMENT 'Payment proof images for customer orders';

-- Check if the columns were added successfully
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND COLUMN_NAME = 'image_id'
AND TABLE_NAME IN ('customer_orders', 'payments', 'customer_order_items', 'payment_proofs');
