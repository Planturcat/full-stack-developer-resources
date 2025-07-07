# Database Design and Normalization

Database design is the process of creating a detailed data model that defines the structure, relationships, and constraints of a database. This guide covers normalization, entity-relationship modeling, and best practices for designing efficient and maintainable database schemas.

## Entity-Relationship Modeling

### Basic ER Concepts

```sql
-- Example: E-commerce Database Design

-- Entities and their attributes
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES categories(category_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) CHECK (cost >= 0),
    sku VARCHAR(50) UNIQUE NOT NULL,
    weight DECIMAL(8,3),
    dimensions VARCHAR(50),
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    supplier_id INTEGER REFERENCES suppliers(supplier_id),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationship tables
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address_id INTEGER REFERENCES addresses(address_id),
    billing_address_id INTEGER REFERENCES addresses(address_id),
    payment_method VARCHAR(50),
    notes TEXT
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    UNIQUE(order_id, product_id)
);

-- Supporting entities
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    address_type VARCHAR(20) DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
    street_address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationships
CREATE TABLE product_tags (
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Advanced Relationships

```sql
-- Self-referencing relationship (Category hierarchy)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER REFERENCES categories(category_id),
    level INTEGER DEFAULT 0,
    path VARCHAR(500), -- Materialized path for efficient queries
    is_leaf BOOLEAN DEFAULT TRUE
);

-- Recursive query to get category hierarchy
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
        category_id,
        category_name,
        parent_category_id,
        0 as level,
        category_name::TEXT as path
    FROM categories 
    WHERE parent_category_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
        c.category_id,
        c.category_name,
        c.parent_category_id,
        ct.level + 1,
        ct.path || ' > ' || c.category_name
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_category_id = ct.category_id
)
SELECT * FROM category_tree ORDER BY path;

-- Polymorphic relationships (Comments on different entities)
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    commentable_type VARCHAR(50) NOT NULL, -- 'product', 'order', etc.
    commentable_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_polymorphic (commentable_type, commentable_id)
);

-- Better approach: Separate tables for each relationship
CREATE TABLE product_reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, customer_id) -- One review per customer per product
);
```

## Normalization

### First Normal Form (1NF)

```sql
-- Violation of 1NF: Multiple values in a single column
CREATE TABLE customers_bad (
    customer_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    phone_numbers VARCHAR(200) -- "123-456-7890, 098-765-4321"
);

-- 1NF Compliant: Atomic values only
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE customer_phones (
    phone_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    phone_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(20) DEFAULT 'mobile' CHECK (phone_type IN ('mobile', 'home', 'work')),
    is_primary BOOLEAN DEFAULT FALSE
);
```

### Second Normal Form (2NF)

```sql
-- Violation of 2NF: Partial dependency on composite key
CREATE TABLE order_items_bad (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    product_name VARCHAR(200), -- Depends only on product_id, not the full key
    product_category VARCHAR(100), -- Depends only on product_id
    PRIMARY KEY (order_id, product_id)
);

-- 2NF Compliant: Remove partial dependencies
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    UNIQUE(order_id, product_id)
);

-- Product information stays in products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    price DECIMAL(10,2) NOT NULL
);
```

### Third Normal Form (3NF)

```sql
-- Violation of 3NF: Transitive dependency
CREATE TABLE employees_bad (
    employee_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER,
    department_name VARCHAR(100), -- Depends on department_id, not employee_id
    department_budget DECIMAL(12,2) -- Depends on department_id, not employee_id
);

-- 3NF Compliant: Remove transitive dependencies
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    budget DECIMAL(12,2),
    manager_id INTEGER,
    location VARCHAR(100)
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(department_id),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2)
);
```

### Boyce-Codd Normal Form (BCNF)

```sql
-- Violation of BCNF: Multiple candidate keys with overlapping attributes
CREATE TABLE course_instructors_bad (
    course_id INTEGER,
    instructor_id INTEGER,
    instructor_name VARCHAR(100), -- instructor_name determines instructor_id
    semester VARCHAR(20),
    PRIMARY KEY (course_id, instructor_id, semester)
);

-- BCNF Compliant: Separate the conflicting dependencies
CREATE TABLE instructors (
    instructor_id SERIAL PRIMARY KEY,
    instructor_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100),
    department_id INTEGER REFERENCES departments(department_id)
);

CREATE TABLE course_assignments (
    assignment_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(course_id),
    instructor_id INTEGER NOT NULL REFERENCES instructors(instructor_id),
    semester VARCHAR(20) NOT NULL,
    academic_year INTEGER NOT NULL,
    UNIQUE(course_id, instructor_id, semester, academic_year)
);
```

## Denormalization Strategies

### When to Denormalize

```sql
-- Normalized structure (good for data integrity)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Denormalized for performance (reporting/analytics)
CREATE TABLE order_summary (
    order_id INTEGER PRIMARY KEY REFERENCES orders(order_id),
    customer_id INTEGER NOT NULL,
    customer_name VARCHAR(100), -- Denormalized from customers table
    order_date DATE NOT NULL,
    total_items INTEGER NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    -- Maintained via triggers or application logic
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to maintain denormalized data
CREATE OR REPLACE FUNCTION update_order_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_summary (
        order_id, customer_id, customer_name, order_date, 
        total_items, total_amount, status
    )
    SELECT 
        o.order_id,
        o.customer_id,
        c.first_name || ' ' || c.last_name,
        o.order_date::DATE,
        COUNT(oi.order_item_id),
        SUM(oi.quantity * oi.unit_price),
        o.status
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = NEW.order_id
    GROUP BY o.order_id, o.customer_id, c.first_name, c.last_name, o.order_date, o.status
    ON CONFLICT (order_id) DO UPDATE SET
        customer_name = EXCLUDED.customer_name,
        total_items = EXCLUDED.total_items,
        total_amount = EXCLUDED.total_amount,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_summary
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_summary();
```

## Data Types and Constraints

### Choosing Appropriate Data Types

```sql
-- Efficient data type choices
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    
    -- Text fields with appropriate lengths
    sku VARCHAR(50) NOT NULL UNIQUE, -- Fixed reasonable length
    name VARCHAR(200) NOT NULL, -- Reasonable product name length
    description TEXT, -- Variable length for long descriptions
    
    -- Numeric fields with precision
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- Exact decimal for money
    weight DECIMAL(8,3), -- Weight with 3 decimal places
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    
    -- Boolean for flags
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Dates and timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discontinued_date DATE, -- Date only, no time needed
    
    -- Enums for limited choices
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'discontinued')),
    
    -- JSON for flexible attributes (PostgreSQL)
    attributes JSONB,
    
    -- Arrays for multiple values (PostgreSQL)
    tags TEXT[],
    
    -- UUID for distributed systems
    external_id UUID DEFAULT gen_random_uuid()
);

-- Custom domain types for reusability
CREATE DOMAIN email_address AS VARCHAR(254)
    CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN phone_number AS VARCHAR(20)
    CHECK (VALUE ~* '^\+?[1-9]\d{1,14}$');

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email email_address NOT NULL UNIQUE,
    phone phone_number,
    -- ... other fields
);
```

### Advanced Constraints

```sql
-- Check constraints for business rules
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2) NOT NULL,
    manager_id INTEGER REFERENCES employees(employee_id),
    
    -- Age constraint
    CONSTRAINT chk_age CHECK (
        EXTRACT(YEAR FROM AGE(birth_date)) >= 18
    ),
    
    -- Hire date constraint
    CONSTRAINT chk_hire_date CHECK (
        hire_date >= birth_date + INTERVAL '18 years'
    ),
    
    -- Salary constraint
    CONSTRAINT chk_salary CHECK (salary > 0),
    
    -- Self-reference constraint (employee cannot be their own manager)
    CONSTRAINT chk_not_self_manager CHECK (employee_id != manager_id)
);

-- Unique constraints with conditions (partial unique indexes)
CREATE UNIQUE INDEX idx_active_email 
ON customers (email) 
WHERE is_active = TRUE;

-- Exclusion constraints (PostgreSQL)
CREATE TABLE room_bookings (
    booking_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    customer_id INTEGER NOT NULL,
    
    -- Ensure no overlapping bookings for the same room
    EXCLUDE USING gist (
        room_id WITH =,
        tsrange(start_time, end_time) WITH &&
    ),
    
    CONSTRAINT chk_booking_times CHECK (end_time > start_time)
);
```

## Schema Evolution and Migrations

### Migration Best Practices

```sql
-- Migration: Add new column with default value
ALTER TABLE products 
ADD COLUMN brand_id INTEGER REFERENCES brands(brand_id);

-- Migration: Add non-null column safely
ALTER TABLE products 
ADD COLUMN category_path VARCHAR(500);

-- Update existing data
UPDATE products 
SET category_path = (
    SELECT string_agg(c.category_name, ' > ' ORDER BY level)
    FROM category_hierarchy c
    WHERE c.leaf_category_id = products.category_id
);

-- Make column non-null after data is populated
ALTER TABLE products 
ALTER COLUMN category_path SET NOT NULL;

-- Migration: Rename column
ALTER TABLE customers 
RENAME COLUMN phone TO primary_phone;

-- Migration: Change column type safely
-- Step 1: Add new column
ALTER TABLE products 
ADD COLUMN price_new DECIMAL(12,2);

-- Step 2: Copy data
UPDATE products 
SET price_new = price::DECIMAL(12,2);

-- Step 3: Drop old column and rename new one
ALTER TABLE products 
DROP COLUMN price;

ALTER TABLE products 
RENAME COLUMN price_new TO price;

-- Migration: Split table (vertical partitioning)
-- Create new table for less frequently accessed data
CREATE TABLE product_details (
    product_id INTEGER PRIMARY KEY REFERENCES products(product_id),
    detailed_description TEXT,
    specifications JSONB,
    warranty_info TEXT,
    manual_url VARCHAR(500)
);

-- Move data
INSERT INTO product_details (product_id, detailed_description)
SELECT product_id, detailed_description 
FROM products 
WHERE detailed_description IS NOT NULL;

-- Remove column from original table
ALTER TABLE products 
DROP COLUMN detailed_description;
```

## Performance Considerations

### Indexing Strategy

```sql
-- Primary key index (automatic)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY, -- Automatically indexed
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Foreign key indexes (manual)
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);

-- Composite indexes for common query patterns
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_date_status ON orders(order_date, status);

-- Partial indexes for filtered queries
CREATE INDEX idx_orders_pending ON orders(customer_id) 
WHERE status = 'pending';

-- Functional indexes
CREATE INDEX idx_customers_email_lower ON customers(LOWER(email));
CREATE INDEX idx_orders_year ON orders(EXTRACT(YEAR FROM order_date));

-- Covering indexes (include additional columns)
CREATE INDEX idx_orders_customer_covering 
ON orders(customer_id) 
INCLUDE (order_date, status, total_amount);
```

### Query-Optimized Design

```sql
-- Materialized views for complex aggregations
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
    EXTRACT(YEAR FROM order_date) as year,
    EXTRACT(MONTH FROM order_date) as month,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales,
    AVG(total_amount) as avg_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders 
WHERE status = 'completed'
GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date);

-- Refresh strategy
CREATE INDEX idx_monthly_sales_year_month ON monthly_sales(year, month);

-- Partitioning for large tables
CREATE TABLE order_items (
    order_item_id BIGSERIAL,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE order_items_2024_q1 PARTITION OF order_items
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE order_items_2024_q2 PARTITION OF order_items
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Indexes on partitions
CREATE INDEX idx_order_items_2024_q1_order_id 
ON order_items_2024_q1(order_id);
```

## Best Practices

### Design Principles
1. **Start with business requirements** - Understand the domain first
2. **Normalize first, denormalize later** - Begin with proper normalization
3. **Use meaningful names** - Clear, consistent naming conventions
4. **Plan for growth** - Consider future scalability needs
5. **Document your design** - Maintain clear schema documentation

### Data Integrity
1. **Use appropriate constraints** - Enforce business rules at database level
2. **Implement referential integrity** - Foreign key relationships
3. **Validate data types** - Choose appropriate column types
4. **Handle NULL values** - Explicit NULL handling strategy
5. **Use transactions** - Maintain consistency across operations

### Performance Optimization
1. **Index strategically** - Balance query performance and write overhead
2. **Avoid over-normalization** - Consider denormalization for read-heavy workloads
3. **Use appropriate data types** - Optimize storage and performance
4. **Plan for archiving** - Strategy for historical data
5. **Monitor and analyze** - Regular performance review and optimization

Database design is fundamental to application performance and maintainability. A well-designed schema provides a solid foundation for scalable, efficient applications while maintaining data integrity and consistency.
