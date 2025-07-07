# Data Engineering

Data Engineering focuses on designing, building, and maintaining systems that collect, store, and analyze large volumes of data. This section covers data pipelines, ETL processes, big data technologies, and data architecture patterns.

## Topics Covered

### Data Pipeline Fundamentals
1. **ETL vs ELT Processes** - Extract, Transform, Load patterns and modern alternatives
2. **Data Pipeline Architecture** - Batch processing, stream processing, lambda architecture
3. **Data Quality and Validation** - Data profiling, cleansing, and monitoring
4. **Workflow Orchestration** - Apache Airflow, Prefect, and scheduling systems

### Big Data Technologies
1. **Distributed Storage** - HDFS, Amazon S3, data lakes and data warehouses
2. **Processing Frameworks** - Apache Spark, Hadoop MapReduce, distributed computing
3. **Streaming Systems** - Apache Kafka, Apache Storm, real-time data processing
4. **Data Warehousing** - Snowflake, BigQuery, Redshift, dimensional modeling

## Learning Path

1. **Master Data Fundamentals** - Data types, formats, storage systems
2. **Learn ETL/ELT Processes** - Data extraction, transformation, and loading
3. **Understand Big Data Concepts** - Distributed systems, scalability patterns
4. **Explore Processing Frameworks** - Batch and stream processing technologies
5. **Study Data Architecture** - Data lakes, warehouses, and modern architectures
6. **Implement Monitoring** - Data quality, pipeline monitoring, observability

## Files Structure

```
Data-Engineering/
├── README.md (this file)
├── Data-Pipelines/
│   ├── README.md
│   ├── 01-etl-elt-processes.md
│   ├── 01-pipeline-examples/
│   ├── 02-pipeline-architecture.md
│   ├── 02-architecture-examples/
│   ├── 03-data-quality.md
│   ├── 03-quality-examples/
│   ├── 04-workflow-orchestration.md
│   └── 04-orchestration-examples/
└── Big-Data-Technologies/
    ├── README.md
    ├── 01-distributed-storage.md
    ├── 01-storage-examples/
    ├── 02-processing-frameworks.md
    ├── 02-processing-examples/
    ├── 03-streaming-systems.md
    ├── 03-streaming-examples/
    ├── 04-data-warehousing.md
    └── 04-warehousing-examples/
```

## Prerequisites

- Understanding of databases and SQL
- Basic programming knowledge (Python, Java, or Scala)
- Familiarity with distributed systems concepts
- Knowledge of data formats (JSON, CSV, Parquet, Avro)

## Core Concepts

### Data Pipeline Patterns

#### ETL (Extract, Transform, Load)
```
Source Systems → Extract → Transform → Load → Target System
```
- **Traditional approach** - Transform data before loading
- **Structured processing** - Predefined transformations
- **Quality control** - Data validation before storage
- **Resource intensive** - Processing before storage

#### ELT (Extract, Load, Transform)
```
Source Systems → Extract → Load → Transform → Analytics
```
- **Modern approach** - Load raw data first, transform later
- **Flexible processing** - Transform as needed for analysis
- **Cloud-native** - Leverages cloud storage and compute
- **Scalable** - Separate storage and compute resources

### Data Architecture Patterns

#### Lambda Architecture
```
Data Sources → Speed Layer (Real-time) → Serving Layer
            → Batch Layer (Historical) → Serving Layer
```

#### Kappa Architecture
```
Data Sources → Stream Processing → Serving Layer
```

#### Data Mesh
```
Domain A → Data Product A
Domain B → Data Product B  → Data Consumers
Domain C → Data Product C
```

## Technology Stack

### Data Storage
- **Data Lakes** - Amazon S3, Azure Data Lake, Google Cloud Storage
- **Data Warehouses** - Snowflake, Amazon Redshift, Google BigQuery
- **NoSQL Databases** - MongoDB, Cassandra, DynamoDB
- **Time Series Databases** - InfluxDB, TimescaleDB, Amazon Timestream

### Processing Frameworks
- **Batch Processing** - Apache Spark, Hadoop MapReduce, Apache Beam
- **Stream Processing** - Apache Kafka, Apache Storm, Apache Flink
- **Serverless** - AWS Lambda, Azure Functions, Google Cloud Functions
- **Container Orchestration** - Kubernetes, Docker Swarm, Apache Mesos

### Orchestration Tools
- **Workflow Management** - Apache Airflow, Prefect, Dagster
- **Cloud Services** - AWS Step Functions, Azure Data Factory, Google Cloud Composer
- **CI/CD Integration** - Jenkins, GitLab CI, GitHub Actions
- **Monitoring** - Prometheus, Grafana, DataDog, New Relic

### Data Formats and Protocols
- **Structured** - CSV, JSON, XML, Parquet, ORC
- **Semi-structured** - Avro, Protocol Buffers, MessagePack
- **Streaming** - Apache Kafka, Apache Pulsar, Amazon Kinesis
- **APIs** - REST, GraphQL, gRPC, WebSockets

## Common Use Cases

### Real-time Analytics
```python
# Example: Real-time user behavior tracking
from kafka import KafkaConsumer, KafkaProducer
import json
from datetime import datetime

# Stream processing for user events
def process_user_events():
    consumer = KafkaConsumer(
        'user-events',
        bootstrap_servers=['localhost:9092'],
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    
    producer = KafkaProducer(
        bootstrap_servers=['localhost:9092'],
        value_serializer=lambda x: json.dumps(x).encode('utf-8')
    )
    
    for message in consumer:
        event = message.value
        
        # Real-time processing
        processed_event = {
            'user_id': event['user_id'],
            'event_type': event['event_type'],
            'timestamp': datetime.utcnow().isoformat(),
            'session_id': event.get('session_id'),
            'page_url': event.get('page_url'),
            'processed_at': datetime.utcnow().isoformat()
        }
        
        # Send to analytics topic
        producer.send('processed-events', processed_event)
```

### Batch Data Processing
```python
# Example: Daily sales report generation
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, avg, date_format

def generate_daily_sales_report():
    spark = SparkSession.builder \
        .appName("DailySalesReport") \
        .getOrCreate()
    
    # Read data from data lake
    orders_df = spark.read.parquet("s3://data-lake/orders/")
    order_items_df = spark.read.parquet("s3://data-lake/order_items/")
    products_df = spark.read.parquet("s3://data-lake/products/")
    
    # Join and aggregate data
    sales_report = orders_df \
        .join(order_items_df, "order_id") \
        .join(products_df, "product_id") \
        .filter(col("order_date") == "2024-01-15") \
        .groupBy("product_category", date_format("order_date", "yyyy-MM-dd").alias("date")) \
        .agg(
            sum(col("quantity") * col("unit_price")).alias("total_sales"),
            count("order_id").alias("order_count"),
            avg(col("quantity") * col("unit_price")).alias("avg_order_value")
        )
    
    # Write to data warehouse
    sales_report.write \
        .mode("overwrite") \
        .option("path", "s3://data-warehouse/sales_reports/daily/") \
        .saveAsTable("sales.daily_reports")
    
    spark.stop()
```

### Data Quality Monitoring
```python
# Example: Data quality checks
import pandas as pd
from typing import Dict, List, Any

class DataQualityChecker:
    def __init__(self):
        self.quality_rules = []
    
    def add_rule(self, rule_name: str, check_function, threshold: float = 0.95):
        self.quality_rules.append({
            'name': rule_name,
            'function': check_function,
            'threshold': threshold
        })
    
    def check_completeness(self, df: pd.DataFrame, column: str) -> float:
        """Check percentage of non-null values"""
        return df[column].notna().sum() / len(df)
    
    def check_uniqueness(self, df: pd.DataFrame, column: str) -> float:
        """Check percentage of unique values"""
        return df[column].nunique() / len(df)
    
    def check_validity(self, df: pd.DataFrame, column: str, valid_values: List) -> float:
        """Check percentage of valid values"""
        return df[column].isin(valid_values).sum() / len(df)
    
    def run_quality_checks(self, df: pd.DataFrame) -> Dict[str, Any]:
        results = {
            'total_records': len(df),
            'checks': [],
            'overall_score': 0,
            'passed': True
        }
        
        total_score = 0
        for rule in self.quality_rules:
            score = rule['function'](df)
            passed = score >= rule['threshold']
            
            results['checks'].append({
                'rule_name': rule['name'],
                'score': score,
                'threshold': rule['threshold'],
                'passed': passed
            })
            
            total_score += score
            if not passed:
                results['passed'] = False
        
        results['overall_score'] = total_score / len(self.quality_rules) if self.quality_rules else 0
        return results

# Usage example
def monitor_customer_data_quality():
    # Load customer data
    customers_df = pd.read_csv('customers.csv')
    
    # Initialize quality checker
    quality_checker = DataQualityChecker()
    
    # Add quality rules
    quality_checker.add_rule(
        'email_completeness',
        lambda df: quality_checker.check_completeness(df, 'email'),
        threshold=0.95
    )
    
    quality_checker.add_rule(
        'email_uniqueness',
        lambda df: quality_checker.check_uniqueness(df, 'email'),
        threshold=0.98
    )
    
    quality_checker.add_rule(
        'status_validity',
        lambda df: quality_checker.check_validity(df, 'status', ['active', 'inactive', 'pending']),
        threshold=1.0
    )
    
    # Run quality checks
    results = quality_checker.run_quality_checks(customers_df)
    
    # Alert if quality issues found
    if not results['passed']:
        send_quality_alert(results)
    
    return results
```

## Data Pipeline Orchestration

### Apache Airflow Example
```python
# Example: Daily ETL pipeline with Airflow
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
from datetime import datetime, timedelta
import pandas as pd

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'daily_sales_etl',
    default_args=default_args,
    description='Daily sales data ETL pipeline',
    schedule_interval='0 2 * * *',  # Run at 2 AM daily
    catchup=False,
    tags=['sales', 'etl', 'daily']
)

def extract_sales_data(**context):
    """Extract sales data from source systems"""
    execution_date = context['execution_date']
    
    # Extract from multiple sources
    orders_df = extract_from_database('orders', execution_date)
    payments_df = extract_from_api('payments', execution_date)
    
    # Save raw data
    orders_df.to_parquet(f'/tmp/raw_orders_{execution_date.strftime("%Y%m%d")}.parquet')
    payments_df.to_parquet(f'/tmp/raw_payments_{execution_date.strftime("%Y%m%d")}.parquet')
    
    return f"Extracted {len(orders_df)} orders and {len(payments_df)} payments"

def transform_sales_data(**context):
    """Transform and clean sales data"""
    execution_date = context['execution_date']
    date_str = execution_date.strftime("%Y%m%d")
    
    # Load raw data
    orders_df = pd.read_parquet(f'/tmp/raw_orders_{date_str}.parquet')
    payments_df = pd.read_parquet(f'/tmp/raw_payments_{date_str}.parquet')
    
    # Data transformations
    # 1. Clean and validate data
    orders_df = orders_df.dropna(subset=['order_id', 'customer_id'])
    payments_df = payments_df[payments_df['amount'] > 0]
    
    # 2. Join datasets
    sales_df = orders_df.merge(payments_df, on='order_id', how='inner')
    
    # 3. Calculate metrics
    sales_df['profit_margin'] = (sales_df['revenue'] - sales_df['cost']) / sales_df['revenue']
    sales_df['order_date'] = pd.to_datetime(sales_df['order_date'])
    
    # 4. Aggregate daily metrics
    daily_sales = sales_df.groupby('order_date').agg({
        'revenue': 'sum',
        'cost': 'sum',
        'profit_margin': 'mean',
        'order_id': 'count'
    }).rename(columns={'order_id': 'order_count'})
    
    # Save transformed data
    daily_sales.to_parquet(f'/tmp/transformed_sales_{date_str}.parquet')
    
    return f"Transformed data for {len(daily_sales)} days"

def load_to_warehouse(**context):
    """Load data to data warehouse"""
    execution_date = context['execution_date']
    date_str = execution_date.strftime("%Y%m%d")
    
    # Load transformed data
    daily_sales = pd.read_parquet(f'/tmp/transformed_sales_{date_str}.parquet')
    
    # Load to data warehouse (example with PostgreSQL)
    from sqlalchemy import create_engine
    engine = create_engine('postgresql://user:pass@warehouse:5432/analytics')
    
    daily_sales.to_sql(
        'daily_sales',
        engine,
        if_exists='append',
        index=True,
        method='multi'
    )
    
    return f"Loaded {len(daily_sales)} records to warehouse"

def data_quality_check(**context):
    """Perform data quality checks"""
    execution_date = context['execution_date']
    
    # Connect to warehouse and run quality checks
    from sqlalchemy import create_engine
    engine = create_engine('postgresql://user:pass@warehouse:5432/analytics')
    
    # Check for data completeness
    result = pd.read_sql("""
        SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN revenue IS NULL THEN 1 END) as null_revenue,
            COUNT(CASE WHEN revenue < 0 THEN 1 END) as negative_revenue
        FROM daily_sales 
        WHERE order_date = %s
    """, engine, params=[execution_date.date()])
    
    # Validate results
    if result['null_revenue'].iloc[0] > 0:
        raise ValueError("Found NULL revenue values")
    
    if result['negative_revenue'].iloc[0] > 0:
        raise ValueError("Found negative revenue values")
    
    return f"Quality check passed for {result['total_records'].iloc[0]} records"

# Define tasks
extract_task = PythonOperator(
    task_id='extract_sales_data',
    python_callable=extract_sales_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_sales_data',
    python_callable=transform_sales_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_to_warehouse',
    python_callable=load_to_warehouse,
    dag=dag
)

quality_check_task = PythonOperator(
    task_id='data_quality_check',
    python_callable=data_quality_check,
    dag=dag
)

cleanup_task = BashOperator(
    task_id='cleanup_temp_files',
    bash_command='rm -f /tmp/raw_* /tmp/transformed_*',
    dag=dag
)

# Define task dependencies
extract_task >> transform_task >> load_task >> quality_check_task >> cleanup_task
```

## Career Opportunities

### Data Engineering Roles
- **Data Engineer** - Building and maintaining data pipelines
- **Analytics Engineer** - Bridging data engineering and analytics
- **Platform Engineer** - Data infrastructure and tooling
- **ML Engineer** - Machine learning pipeline development
- **Data Architect** - Designing data systems and architecture

### Specialization Areas
- **Real-time Processing** - Stream processing and event-driven architectures
- **Cloud Data Platforms** - AWS, Azure, GCP data services
- **Big Data Technologies** - Hadoop, Spark, distributed systems
- **Data Quality** - Data governance, lineage, and monitoring
- **MLOps** - Machine learning operations and deployment

## Best Practices

### Pipeline Design
1. **Design for failure** - Implement retry logic and error handling
2. **Make pipelines idempotent** - Safe to run multiple times
3. **Use incremental processing** - Process only new or changed data
4. **Implement monitoring** - Track pipeline health and performance
5. **Version control everything** - Code, configurations, and schemas

### Data Quality
1. **Validate early and often** - Check data at each stage
2. **Implement data contracts** - Define expected data formats
3. **Monitor data drift** - Detect changes in data patterns
4. **Document data lineage** - Track data flow and transformations
5. **Automate quality checks** - Continuous data validation

### Performance Optimization
1. **Choose appropriate file formats** - Parquet, ORC for analytics
2. **Implement proper partitioning** - Optimize data access patterns
3. **Use columnar storage** - Better compression and query performance
4. **Cache frequently accessed data** - Reduce computation overhead
5. **Optimize resource allocation** - Right-size compute resources

Data Engineering is essential for organizations to derive value from their data. Building robust, scalable data pipelines enables reliable analytics, machine learning, and business intelligence capabilities.
