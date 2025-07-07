# Advanced SQL Queries

Advanced SQL techniques enable complex data analysis, reporting, and manipulation. This guide covers window functions, Common Table Expressions (CTEs), complex joins, subqueries, and advanced query optimization techniques.

## Window Functions

### Basic Window Functions

```sql
-- Sample data setup
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    salesperson VARCHAR(50),
    region VARCHAR(50),
    sale_date DATE,
    amount DECIMAL(10,2)
);

INSERT INTO sales (salesperson, region, sale_date, amount) VALUES
('Alice', 'North', '2024-01-15', 1000.00),
('Bob', 'South', '2024-01-16', 1500.00),
('Alice', 'North', '2024-01-17', 1200.00),
('Charlie', 'East', '2024-01-18', 800.00),
('Bob', 'South', '2024-01-19', 2000.00),
('Alice', 'North', '2024-01-20', 900.00),
('Charlie', 'East', '2024-01-21', 1100.00);

-- ROW_NUMBER() - Assigns unique sequential numbers
SELECT 
    salesperson,
    region,
    amount,
    ROW_NUMBER() OVER (ORDER BY amount DESC) as overall_rank,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) as region_rank
FROM sales;

-- RANK() and DENSE_RANK() - Handle ties differently
SELECT 
    salesperson,
    amount,
    RANK() OVER (ORDER BY amount DESC) as rank_with_gaps,
    DENSE_RANK() OVER (ORDER BY amount DESC) as dense_rank,
    ROW_NUMBER() OVER (ORDER BY amount DESC) as row_number
FROM sales;

-- NTILE() - Divides rows into buckets
SELECT 
    salesperson,
    amount,
    NTILE(3) OVER (ORDER BY amount DESC) as quartile
FROM sales;
```

### Aggregate Window Functions

```sql
-- Running totals and moving averages
SELECT 
    salesperson,
    sale_date,
    amount,
    -- Running total
    SUM(amount) OVER (ORDER BY sale_date) as running_total,
    -- Running total by salesperson
    SUM(amount) OVER (PARTITION BY salesperson ORDER BY sale_date) as person_running_total,
    -- Moving average (3-day window)
    AVG(amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_3day,
    -- Percentage of total
    amount / SUM(amount) OVER () * 100 as pct_of_total
FROM sales
ORDER BY sale_date;

-- Cumulative distribution and percentiles
SELECT 
    salesperson,
    amount,
    CUME_DIST() OVER (ORDER BY amount) as cumulative_distribution,
    PERCENT_RANK() OVER (ORDER BY amount) as percent_rank,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) OVER () as median_amount
FROM sales;

-- LAG and LEAD functions
SELECT 
    salesperson,
    sale_date,
    amount,
    LAG(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) as previous_sale,
    LEAD(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) as next_sale,
    amount - LAG(amount, 1) OVER (PARTITION BY salesperson ORDER BY sale_date) as change_from_previous
FROM sales
ORDER BY salesperson, sale_date;

-- FIRST_VALUE and LAST_VALUE
SELECT 
    salesperson,
    sale_date,
    amount,
    FIRST_VALUE(amount) OVER (PARTITION BY salesperson ORDER BY sale_date) as first_sale,
    LAST_VALUE(amount) OVER (
        PARTITION BY salesperson 
        ORDER BY sale_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_sale
FROM sales
ORDER BY salesperson, sale_date;
```

## Common Table Expressions (CTEs)

### Basic CTEs

```sql
-- Simple CTE
WITH high_performers AS (
    SELECT 
        salesperson,
        SUM(amount) as total_sales
    FROM sales
    GROUP BY salesperson
    HAVING SUM(amount) > 2000
)
SELECT 
    hp.salesperson,
    hp.total_sales,
    s.sale_date,
    s.amount
FROM high_performers hp
JOIN sales s ON hp.salesperson = s.salesperson
ORDER BY hp.total_sales DESC, s.sale_date;

-- Multiple CTEs
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', sale_date) as month,
        salesperson,
        SUM(amount) as monthly_total
    FROM sales
    GROUP BY DATE_TRUNC('month', sale_date), salesperson
),
avg_monthly_sales AS (
    SELECT 
        month,
        AVG(monthly_total) as avg_monthly_total
    FROM monthly_sales
    GROUP BY month
)
SELECT 
    ms.month,
    ms.salesperson,
    ms.monthly_total,
    ams.avg_monthly_total,
    ms.monthly_total - ams.avg_monthly_total as difference_from_avg
FROM monthly_sales ms
JOIN avg_monthly_sales ams ON ms.month = ams.month
ORDER BY ms.month, ms.monthly_total DESC;
```

### Recursive CTEs

```sql
-- Employee hierarchy example
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    manager_id INTEGER REFERENCES employees(id),
    salary DECIMAL(10,2)
);

INSERT INTO employees (name, manager_id, salary) VALUES
('CEO', NULL, 200000),
('VP Sales', 1, 150000),
('VP Engineering', 1, 160000),
('Sales Manager', 2, 100000),
('Engineering Manager', 3, 110000),
('Sales Rep 1', 4, 60000),
('Sales Rep 2', 4, 65000),
('Developer 1', 5, 80000),
('Developer 2', 5, 85000);

-- Recursive CTE to show organizational hierarchy
WITH RECURSIVE org_chart AS (
    -- Base case: top-level employees (no manager)
    SELECT 
        id,
        name,
        manager_id,
        salary,
        0 as level,
        name as path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT 
        e.id,
        e.name,
        e.manager_id,
        e.salary,
        oc.level + 1,
        oc.path || ' -> ' || e.name
    FROM employees e
    INNER JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT 
    REPEAT('  ', level) || name as hierarchy,
    salary,
    level,
    path
FROM org_chart
ORDER BY path;

-- Calculate total team size for each manager
WITH RECURSIVE team_size AS (
    -- Base case: individual employees
    SELECT 
        id,
        name,
        manager_id,
        1 as team_count
    FROM employees
    
    UNION ALL
    
    -- Recursive case: add subordinates
    SELECT 
        e.id,
        e.name,
        e.manager_id,
        ts.team_count + 1
    FROM employees e
    INNER JOIN team_size ts ON e.id = ts.manager_id
)
SELECT 
    e.name as manager,
    COUNT(ts.team_count) as total_team_size
FROM employees e
LEFT JOIN team_size ts ON e.id = ts.id
GROUP BY e.id, e.name
ORDER BY total_team_size DESC;
```

## Complex Joins and Subqueries

### Advanced Join Patterns

```sql
-- Self-join to find employees earning more than their manager
SELECT 
    e.name as employee,
    e.salary as employee_salary,
    m.name as manager,
    m.salary as manager_salary
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- Cross join with conditions (Cartesian product)
SELECT 
    s1.salesperson as person1,
    s2.salesperson as person2,
    ABS(s1.amount - s2.amount) as amount_difference
FROM sales s1
CROSS JOIN sales s2
WHERE s1.salesperson < s2.salesperson  -- Avoid duplicates
  AND s1.sale_date = s2.sale_date
  AND ABS(s1.amount - s2.amount) < 500;

-- Multiple table joins with aggregations
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10,2)
);

-- Complex join with multiple aggregations
SELECT 
    p.category,
    p.name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue,
    AVG(oi.unit_price) as avg_selling_price,
    p.price as list_price,
    (AVG(oi.unit_price) / p.price) * 100 as avg_discount_pct
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.category, p.name, p.price
HAVING COUNT(oi.id) > 0
ORDER BY total_revenue DESC;
```

### Correlated Subqueries

```sql
-- Find employees earning above average in their department
SELECT 
    e.name,
    e.salary,
    (SELECT AVG(salary) 
     FROM employees e2 
     WHERE e2.manager_id = e.manager_id) as dept_avg_salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.manager_id = e.manager_id
);

-- Exists vs In subqueries
-- Find salespersons who made sales in January 2024
SELECT DISTINCT salesperson
FROM sales s1
WHERE EXISTS (
    SELECT 1 
    FROM sales s2 
    WHERE s2.salesperson = s1.salesperson 
      AND s2.sale_date >= '2024-01-01' 
      AND s2.sale_date < '2024-02-01'
);

-- Alternative using IN
SELECT DISTINCT salesperson
FROM sales
WHERE salesperson IN (
    SELECT salesperson
    FROM sales
    WHERE sale_date >= '2024-01-01' 
      AND sale_date < '2024-02-01'
);

-- NOT EXISTS for finding missing relationships
SELECT p.name as product_never_ordered
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.id
);
```

## Advanced Aggregations

### GROUPING SETS, CUBE, and ROLLUP

```sql
-- GROUPING SETS for multiple grouping combinations
SELECT 
    region,
    salesperson,
    SUM(amount) as total_sales,
    COUNT(*) as sale_count
FROM sales
GROUP BY GROUPING SETS (
    (region, salesperson),  -- Group by both
    (region),               -- Group by region only
    (salesperson),          -- Group by salesperson only
    ()                      -- Grand total
)
ORDER BY region NULLS LAST, salesperson NULLS LAST;

-- ROLLUP for hierarchical aggregations
SELECT 
    region,
    salesperson,
    SUM(amount) as total_sales,
    GROUPING(region) as region_grouping,
    GROUPING(salesperson) as salesperson_grouping
FROM sales
GROUP BY ROLLUP(region, salesperson)
ORDER BY region NULLS LAST, salesperson NULLS LAST;

-- CUBE for all possible combinations
SELECT 
    region,
    EXTRACT(MONTH FROM sale_date) as month,
    SUM(amount) as total_sales
FROM sales
GROUP BY CUBE(region, EXTRACT(MONTH FROM sale_date))
ORDER BY region NULLS LAST, month NULLS LAST;
```

### Conditional Aggregations

```sql
-- CASE statements in aggregations
SELECT 
    salesperson,
    COUNT(*) as total_sales,
    COUNT(CASE WHEN amount > 1000 THEN 1 END) as high_value_sales,
    COUNT(CASE WHEN amount <= 1000 THEN 1 END) as low_value_sales,
    SUM(CASE WHEN amount > 1000 THEN amount ELSE 0 END) as high_value_revenue,
    AVG(CASE WHEN amount > 1000 THEN amount END) as avg_high_value_sale
FROM sales
GROUP BY salesperson;

-- FILTER clause (PostgreSQL 9.4+)
SELECT 
    salesperson,
    COUNT(*) as total_sales,
    COUNT(*) FILTER (WHERE amount > 1000) as high_value_sales,
    SUM(amount) FILTER (WHERE amount > 1000) as high_value_revenue,
    AVG(amount) FILTER (WHERE amount > 1000) as avg_high_value_sale
FROM sales
GROUP BY salesperson;

-- Pivot-like operations
SELECT 
    salesperson,
    SUM(CASE WHEN region = 'North' THEN amount ELSE 0 END) as north_sales,
    SUM(CASE WHEN region = 'South' THEN amount ELSE 0 END) as south_sales,
    SUM(CASE WHEN region = 'East' THEN amount ELSE 0 END) as east_sales,
    SUM(CASE WHEN region = 'West' THEN amount ELSE 0 END) as west_sales
FROM sales
GROUP BY salesperson;
```

## Query Optimization Techniques

### Index Usage and Query Plans

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT s.salesperson, SUM(s.amount)
FROM sales s
WHERE s.sale_date >= '2024-01-01'
GROUP BY s.salesperson
HAVING SUM(s.amount) > 1000;

-- Create indexes for better performance
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_salesperson ON sales(salesperson);
CREATE INDEX idx_sales_amount ON sales(amount);

-- Composite index for multiple columns
CREATE INDEX idx_sales_date_salesperson ON sales(sale_date, salesperson);

-- Partial index for filtered queries
CREATE INDEX idx_sales_high_value ON sales(salesperson, amount) 
WHERE amount > 1000;

-- Functional index
CREATE INDEX idx_sales_month ON sales(EXTRACT(MONTH FROM sale_date));
```

### Query Rewriting for Performance

```sql
-- Instead of this (slow with large datasets):
SELECT *
FROM sales s1
WHERE amount = (SELECT MAX(amount) FROM sales s2 WHERE s2.salesperson = s1.salesperson);

-- Use this (faster with window functions):
WITH ranked_sales AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY salesperson ORDER BY amount DESC) as rn
    FROM sales
)
SELECT *
FROM ranked_sales
WHERE rn = 1;

-- Instead of multiple EXISTS subqueries:
SELECT salesperson
FROM sales
WHERE EXISTS (SELECT 1 FROM sales s2 WHERE s2.salesperson = sales.salesperson AND s2.amount > 1000)
  AND EXISTS (SELECT 1 FROM sales s3 WHERE s3.salesperson = sales.salesperson AND s3.region = 'North');

-- Use joins:
SELECT DISTINCT s1.salesperson
FROM sales s1
JOIN sales s2 ON s1.salesperson = s2.salesperson AND s2.amount > 1000
JOIN sales s3 ON s1.salesperson = s3.salesperson AND s3.region = 'North';
```

## Best Practices

### Query Writing
1. **Use appropriate indexes** - Create indexes for frequently queried columns
2. **Limit result sets** - Use LIMIT/TOP and WHERE clauses effectively
3. **Use window functions** - Instead of self-joins when possible
4. **Prefer CTEs** - For complex queries that need to be readable
5. **Use EXISTS over IN** - For better performance with large datasets

### Performance Optimization
1. **Analyze query plans** - Use EXPLAIN to understand execution
2. **Avoid SELECT \*** - Only select needed columns
3. **Use appropriate data types** - Choose efficient column types
4. **Consider partitioning** - For very large tables
5. **Update statistics** - Keep query optimizer informed

### Code Organization
1. **Format queries consistently** - Use proper indentation and spacing
2. **Use meaningful aliases** - Clear table and column aliases
3. **Comment complex logic** - Explain business rules and calculations
4. **Break down complex queries** - Use CTEs for readability
5. **Test with realistic data** - Performance testing with production-like datasets

Advanced SQL techniques enable sophisticated data analysis and reporting capabilities. Mastering these concepts allows you to write efficient, maintainable queries that can handle complex business requirements and large datasets effectively.
