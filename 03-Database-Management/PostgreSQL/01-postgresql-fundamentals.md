# PostgreSQL Fundamentals

PostgreSQL is a powerful, open-source object-relational database system with advanced features, strong ACID compliance, and excellent performance. This guide covers PostgreSQL-specific features, administration, and optimization techniques.

## PostgreSQL Architecture

### Core Components

```sql
-- PostgreSQL system information
SELECT version();
SELECT current_database();
SELECT current_user;
SELECT current_timestamp;

-- Database and schema structure
\l                    -- List databases
\c database_name      -- Connect to database
\dn                   -- List schemas
\dt                   -- List tables in current schema
\dt schema_name.*     -- List tables in specific schema
\d table_name         -- Describe table structure
\di                   -- List indexes
\df                   -- List functions
```

### Data Types and Features

```sql
-- PostgreSQL-specific data types
CREATE TABLE postgresql_features (
    id SERIAL PRIMARY KEY,
    
    -- Numeric types
    small_int SMALLINT,
    big_int BIGINT,
    decimal_val DECIMAL(10,2),
    real_val REAL,
    double_val DOUBLE PRECISION,
    
    -- Character types
    char_fixed CHAR(10),
    varchar_var VARCHAR(255),
    text_unlimited TEXT,
    
    -- Date/Time types
    date_only DATE,
    time_only TIME,
    timestamp_val TIMESTAMP,
    timestamp_tz TIMESTAMPTZ,
    interval_val INTERVAL,
    
    -- Boolean
    is_active BOOLEAN DEFAULT TRUE,
    
    -- PostgreSQL-specific types
    uuid_val UUID DEFAULT gen_random_uuid(),
    json_data JSON,
    jsonb_data JSONB,
    array_data INTEGER[],
    text_array TEXT[],
    ip_address INET,
    mac_address MACADDR,
    geometric_point POINT,
    geometric_circle CIRCLE,
    
    -- Range types
    int_range INT4RANGE,
    timestamp_range TSRANGE,
    
    -- Custom enum type
    status user_status DEFAULT 'active'
);

-- Create custom enum type
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Working with arrays
INSERT INTO postgresql_features (array_data, text_array) VALUES 
(ARRAY[1, 2, 3, 4], ARRAY['apple', 'banana', 'cherry']);

-- Array operations
SELECT 
    array_data[1] as first_element,
    array_length(array_data, 1) as array_length,
    array_data || ARRAY[5, 6] as concatenated_array,
    'apple' = ANY(text_array) as contains_apple
FROM postgresql_features;

-- Working with JSON/JSONB
INSERT INTO postgresql_features (json_data, jsonb_data) VALUES 
('{"name": "John", "age": 30, "skills": ["Python", "SQL"]}',
 '{"name": "John", "age": 30, "skills": ["Python", "SQL"], "address": {"city": "New York", "zip": "10001"}}');

-- JSON queries
SELECT 
    jsonb_data->>'name' as name,
    jsonb_data->'age' as age,
    jsonb_data->'address'->>'city' as city,
    jsonb_data->'skills'->>0 as first_skill,
    jsonb_data ? 'skills' as has_skills,
    jsonb_data @> '{"age": 30}' as age_match
FROM postgresql_features
WHERE jsonb_data IS NOT NULL;
```

## Advanced PostgreSQL Features

### Window Functions and CTEs

```sql
-- Sample sales data
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    salesperson VARCHAR(50),
    region VARCHAR(50),
    sale_date DATE,
    amount DECIMAL(10,2),
    product_category VARCHAR(50)
);

INSERT INTO sales (salesperson, region, sale_date, amount, product_category) VALUES
('Alice', 'North', '2024-01-15', 1000.00, 'Electronics'),
('Bob', 'South', '2024-01-16', 1500.00, 'Clothing'),
('Alice', 'North', '2024-01-17', 1200.00, 'Electronics'),
('Charlie', 'East', '2024-01-18', 800.00, 'Books'),
('Bob', 'South', '2024-01-19', 2000.00, 'Electronics'),
('Alice', 'North', '2024-01-20', 900.00, 'Clothing');

-- Advanced window functions
SELECT 
    salesperson,
    region,
    sale_date,
    amount,
    -- Running totals
    SUM(amount) OVER (ORDER BY sale_date) as running_total,
    SUM(amount) OVER (PARTITION BY salesperson ORDER BY sale_date) as person_running_total,
    
    -- Rankings
    ROW_NUMBER() OVER (ORDER BY amount DESC) as overall_rank,
    RANK() OVER (PARTITION BY region ORDER BY amount DESC) as region_rank,
    DENSE_RANK() OVER (ORDER BY amount DESC) as dense_rank,
    
    -- Percentiles
    PERCENT_RANK() OVER (ORDER BY amount) as percent_rank,
    CUME_DIST() OVER (ORDER BY amount) as cumulative_distribution,
    NTILE(4) OVER (ORDER BY amount) as quartile,
    
    -- Lag/Lead
    LAG(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) as previous_sale,
    LEAD(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) as next_sale,
    
    -- First/Last values
    FIRST_VALUE(amount) OVER (PARTITION BY salesperson ORDER BY sale_date) as first_sale,
    LAST_VALUE(amount) OVER (
        PARTITION BY salesperson 
        ORDER BY sale_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_sale
FROM sales
ORDER BY sale_date;

-- Recursive CTE example - organizational hierarchy
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    manager_id INTEGER REFERENCES employees(id),
    salary DECIMAL(10,2),
    department VARCHAR(50)
);

INSERT INTO employees (name, manager_id, salary, department) VALUES
('CEO', NULL, 200000, 'Executive'),
('VP Sales', 1, 150000, 'Sales'),
('VP Engineering', 1, 160000, 'Engineering'),
('Sales Manager', 2, 100000, 'Sales'),
('Engineering Manager', 3, 110000, 'Engineering'),
('Sales Rep 1', 4, 60000, 'Sales'),
('Sales Rep 2', 4, 65000, 'Sales'),
('Developer 1', 5, 80000, 'Engineering'),
('Developer 2', 5, 85000, 'Engineering');

-- Recursive CTE for hierarchy
WITH RECURSIVE org_hierarchy AS (
    -- Base case: top-level employees
    SELECT 
        id,
        name,
        manager_id,
        salary,
        department,
        0 as level,
        name as path,
        ARRAY[id] as id_path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        e.id,
        e.name,
        e.manager_id,
        e.salary,
        e.department,
        oh.level + 1,
        oh.path || ' -> ' || e.name,
        oh.id_path || e.id
    FROM employees e
    INNER JOIN org_hierarchy oh ON e.manager_id = oh.id
)
SELECT 
    REPEAT('  ', level) || name as hierarchy,
    salary,
    department,
    level,
    path
FROM org_hierarchy
ORDER BY id_path;
```

### Indexes and Performance

```sql
-- Different index types
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    category_id INTEGER,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR
);

-- B-tree index (default)
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

-- Composite index
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Partial index
CREATE INDEX idx_products_expensive ON products(price) 
WHERE price > 1000;

-- Functional index
CREATE INDEX idx_products_name_lower ON products(LOWER(name));
CREATE INDEX idx_products_created_month ON products(EXTRACT(MONTH FROM created_at));

-- GIN index for arrays and JSONB
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_metadata ON products USING GIN(metadata);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Update search vector
UPDATE products SET search_vector = 
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''));

-- Full-text search queries
SELECT name, description,
       ts_rank(search_vector, query) as rank
FROM products, 
     to_tsquery('english', 'laptop & fast') as query
WHERE search_vector @@ query
ORDER BY rank DESC;

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM products 
WHERE price BETWEEN 100 AND 500 
  AND category_id = 1;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Stored Procedures and Functions

```sql
-- PL/pgSQL function
CREATE OR REPLACE FUNCTION calculate_order_total(
    p_order_id INTEGER
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total DECIMAL(10,2) := 0;
    v_tax_rate DECIMAL(4,3) := 0.08;
    v_discount DECIMAL(4,3) := 0;
BEGIN
    -- Calculate subtotal
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_total
    FROM order_items
    WHERE order_id = p_order_id;
    
    -- Apply discount for large orders
    IF v_total > 1000 THEN
        v_discount := 0.1;
    ELSIF v_total > 500 THEN
        v_discount := 0.05;
    END IF;
    
    -- Calculate final total with tax and discount
    v_total := v_total * (1 - v_discount) * (1 + v_tax_rate);
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Function with error handling
CREATE OR REPLACE FUNCTION transfer_funds(
    p_from_account INTEGER,
    p_to_account INTEGER,
    p_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_from_balance DECIMAL(10,2);
BEGIN
    -- Start transaction
    BEGIN
        -- Check source account balance
        SELECT balance INTO v_from_balance
        FROM accounts
        WHERE account_id = p_from_account
        FOR UPDATE;
        
        IF v_from_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient funds. Balance: %, Required: %', 
                          v_from_balance, p_amount;
        END IF;
        
        -- Perform transfer
        UPDATE accounts 
        SET balance = balance - p_amount
        WHERE account_id = p_from_account;
        
        UPDATE accounts 
        SET balance = balance + p_amount
        WHERE account_id = p_to_account;
        
        -- Log transaction
        INSERT INTO transaction_log (from_account, to_account, amount, transaction_date)
        VALUES (p_from_account, p_to_account, p_amount, CURRENT_TIMESTAMP);
        
        RETURN TRUE;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error
            INSERT INTO error_log (error_message, error_time)
            VALUES (SQLERRM, CURRENT_TIMESTAMP);
            
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger function
CREATE OR REPLACE FUNCTION update_modified_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_modified_time
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_time();
```

### Transactions and Concurrency

```sql
-- Transaction isolation levels
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- Default level, sees committed changes from other transactions

BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- Sees snapshot of data at transaction start

BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- Highest isolation level, prevents phantom reads

-- Explicit locking
BEGIN;

-- Row-level locks
SELECT * FROM accounts WHERE account_id = 1 FOR UPDATE;
SELECT * FROM accounts WHERE account_id = 1 FOR SHARE;

-- Table-level locks
LOCK TABLE accounts IN ACCESS EXCLUSIVE MODE;

COMMIT;

-- Advisory locks for application-level coordination
SELECT pg_advisory_lock(12345);
-- Perform critical section
SELECT pg_advisory_unlock(12345);

-- Deadlock handling example
CREATE OR REPLACE FUNCTION safe_transfer(
    p_from_account INTEGER,
    p_to_account INTEGER,
    p_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_retry_count INTEGER := 0;
    v_max_retries INTEGER := 3;
BEGIN
    LOOP
        BEGIN
            -- Always lock accounts in consistent order to prevent deadlocks
            IF p_from_account < p_to_account THEN
                PERFORM * FROM accounts WHERE account_id = p_from_account FOR UPDATE;
                PERFORM * FROM accounts WHERE account_id = p_to_account FOR UPDATE;
            ELSE
                PERFORM * FROM accounts WHERE account_id = p_to_account FOR UPDATE;
                PERFORM * FROM accounts WHERE account_id = p_from_account FOR UPDATE;
            END IF;
            
            -- Perform transfer logic here
            RETURN transfer_funds(p_from_account, p_to_account, p_amount);
            
        EXCEPTION
            WHEN deadlock_detected THEN
                v_retry_count := v_retry_count + 1;
                IF v_retry_count >= v_max_retries THEN
                    RAISE EXCEPTION 'Transfer failed after % retries due to deadlocks', v_max_retries;
                END IF;
                
                -- Wait random time before retry
                PERFORM pg_sleep(random() * 0.1);
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## PostgreSQL Administration

### Database Maintenance

```sql
-- Vacuum and analyze
VACUUM VERBOSE products;
VACUUM FULL products;  -- Reclaims space but requires exclusive lock
ANALYZE products;
VACUUM ANALYZE products;

-- Auto-vacuum settings (in postgresql.conf)
-- autovacuum = on
-- autovacuum_vacuum_threshold = 50
-- autovacuum_analyze_threshold = 50
-- autovacuum_vacuum_scale_factor = 0.2
-- autovacuum_analyze_scale_factor = 0.1

-- Reindex
REINDEX INDEX idx_products_name;
REINDEX TABLE products;
REINDEX DATABASE myapp;

-- Check table and index sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                   pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Database statistics
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database
WHERE datname = current_database();
```

### Backup and Recovery

```bash
# Physical backup (pg_dump)
pg_dump -h localhost -U username -d database_name > backup.sql
pg_dump -h localhost -U username -d database_name -f backup.sql -v

# Compressed backup
pg_dump -h localhost -U username -d database_name | gzip > backup.sql.gz

# Custom format (recommended for large databases)
pg_dump -h localhost -U username -d database_name -Fc > backup.dump

# Parallel backup
pg_dump -h localhost -U username -d database_name -Fd -j 4 -f backup_dir

# Restore
psql -h localhost -U username -d database_name < backup.sql
pg_restore -h localhost -U username -d database_name backup.dump
pg_restore -h localhost -U username -d database_name -j 4 backup_dir

# Point-in-time recovery setup
# In postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /path/to/archive/%f'
# max_wal_senders = 3
```

### Monitoring and Performance Tuning

```sql
-- Current activity
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state = 'active';

-- Long-running queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  AND state = 'active';

-- Blocking queries
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

-- Cache hit ratio
SELECT 
    'cache hit ratio' as metric,
    CASE 
        WHEN blks_hit + blks_read = 0 THEN 0
        ELSE round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2)
    END as percentage
FROM pg_stat_database
WHERE datname = current_database();

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Best Practices

### Performance Optimization
1. **Use appropriate indexes** - B-tree for equality/range, GIN for arrays/JSON
2. **Analyze query plans** - Use EXPLAIN ANALYZE regularly
3. **Optimize queries** - Avoid SELECT *, use appropriate JOINs
4. **Configure memory settings** - shared_buffers, work_mem, maintenance_work_mem
5. **Monitor statistics** - Keep track of cache hit ratios and query performance

### Security
1. **Use roles and permissions** - Principle of least privilege
2. **Enable SSL** - Encrypt connections
3. **Regular updates** - Keep PostgreSQL updated
4. **Audit logging** - Track database access and changes
5. **Backup encryption** - Encrypt backup files

### Maintenance
1. **Regular VACUUM** - Prevent table bloat
2. **Update statistics** - Run ANALYZE regularly
3. **Monitor disk space** - Watch for growth trends
4. **Test backups** - Verify backup integrity
5. **Plan for growth** - Monitor performance trends

PostgreSQL offers powerful features for building robust, scalable applications. Understanding these fundamentals helps you leverage PostgreSQL's capabilities effectively while maintaining good performance and reliability.
