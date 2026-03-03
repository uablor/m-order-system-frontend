# Backend Fix for Customer Orders Image ID Issue

## Problem
The backend is trying to access an `image_id` column that doesn't exist in the database when fetching customer orders by token.

## Error Message
```
"Unknown column '87c8d2a273f44d924613ce195ecb7e1724abe086.image_id' in 'field list'"
```

## Solution Options

### Option 1: Database Schema Fix (Recommended)
Run the SQL migration script to add the missing column:

```sql
-- Add image_id to customer_orders table
ALTER TABLE customer_orders 
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255) NULL COMMENT 'Payment proof image ID';

-- Or add to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255) NULL COMMENT 'Payment proof image ID';
```

### Option 2: Backend Code Fix
Modify the SQL query in the customer orders endpoint to handle the missing column:

```typescript
// Before (causing error):
SELECT 
    co.*,
    coi.product_name,
    coi.quantity,
    coi.selling_price,
    p.image_id  -- This column doesn't exist
FROM customer_orders co
LEFT JOIN customer_order_items coi ON co.id = coi.customer_order_id
LEFT JOIN products p ON coi.product_id = p.id
WHERE co.customer_token = :token;

// After (safe version):
SELECT 
    co.*,
    coi.product_name,
    coi.quantity,
    coi.selling_price,
    COALESCE(p.image_id, NULL) as image_id  -- Safe fallback
FROM customer_orders co
LEFT JOIN customer_order_items coi ON co.id = coi.customer_order_id
LEFT JOIN products p ON coi.product_id = p.id
WHERE co.customer_token = :token;
```

### Option 3: Conditional Column Selection
Create a dynamic query that only includes existing columns:

```typescript
// Check if column exists before including it
const hasImageIdColumn = await checkColumnExists('products', 'image_id');

const query = hasImageIdColumn 
    ? `SELECT co.*, coi.*, p.image_id FROM ...`
    : `SELECT co.*, coi.* FROM ...`; // Exclude image_id
```

### Option 4: API Endpoint Fallback
Add a fallback parameter to skip image_id:

```typescript
// GET /customer-orders/by-token/{token}?fallback=true
// This endpoint should use a simplified query without image_id

app.get('/customer-orders/by-token/:token', async (req, res) => {
    const { token } = req.params;
    const { fallback = false } = req.query;
    
    try {
        if (fallback === 'true') {
            // Use simplified query without image_id
            const orders = await getCustomerOrdersWithoutImages(token);
            return res.json(orders);
        } else {
            // Use full query (may fail if image_id doesn't exist)
            const orders = await getCustomerOrdersWithImages(token);
            return res.json(orders);
        }
    } catch (error) {
        if (error.message.includes('Unknown column') && fallback !== 'true') {
            // Automatically retry with fallback
            const orders = await getCustomerOrdersWithoutImages(token);
            return res.json(orders);
        }
        throw error;
    }
});
```

## Immediate Action Required

1. **Run the database migration** to add the missing `image_id` column
2. **Update the backend query** to handle the column gracefully
3. **Test the customer portal** to ensure orders load correctly

## Files to Check

- Backend customer orders controller/service
- Database migration files
- SQL query builders for customer orders
- Entity/model definitions for customer orders

## Testing

After applying the fix, test:
1. Customer portal loads orders successfully
2. Payment proof uploads work correctly
3. Order details display properly
4. No more 500 errors in the logs
