# Apache Airflow for Workflow Management

Apache Airflow is an open-source platform for developing, scheduling, and monitoring workflows. It allows you to programmatically author, schedule, and monitor data pipelines using Python.

## Core Concepts

### DAGs (Directed Acyclic Graphs)

```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
from airflow.operators.email_operator import EmailOperator
from airflow.sensors.filesystem import FileSensor
import pandas as pd
import logging

# Default arguments for all tasks
default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'email': ['admin@company.com']
}

# Define the DAG
dag = DAG(
    'daily_sales_pipeline',
    default_args=default_args,
    description='Daily sales data processing pipeline',
    schedule_interval='0 6 * * *',  # Run daily at 6 AM
    catchup=False,  # Don't run for past dates
    max_active_runs=1,  # Only one instance at a time
    tags=['sales', 'daily', 'etl']
)

def extract_sales_data(**context):
    """Extract sales data from source systems"""
    execution_date = context['execution_date']
    
    # Simulate data extraction
    logging.info(f"Extracting sales data for {execution_date}")
    
    # In real implementation, this would connect to databases, APIs, etc.
    data = {
        'date': [execution_date.date()] * 100,
        'sales_amount': [100 + i for i in range(100)],
        'customer_id': [f'CUST_{i:04d}' for i in range(100)]
    }
    
    df = pd.DataFrame(data)
    
    # Save to temporary location
    temp_file = f"/tmp/sales_data_{execution_date.strftime('%Y%m%d')}.csv"
    df.to_csv(temp_file, index=False)
    
    logging.info(f"Extracted {len(df)} records to {temp_file}")
    return temp_file

def validate_data(**context):
    """Validate extracted data"""
    # Get the file path from previous task
    temp_file = context['task_instance'].xcom_pull(task_ids='extract_sales_data')
    
    df = pd.read_csv(temp_file)
    
    # Data validation checks
    validation_results = {
        'total_records': len(df),
        'null_values': df.isnull().sum().sum(),
        'duplicate_records': df.duplicated().sum(),
        'date_range_valid': True,  # Add actual validation logic
        'amount_range_valid': (df['sales_amount'] >= 0).all()
    }
    
    # Check if validation passes
    if validation_results['null_values'] > 0:
        raise ValueError(f"Found {validation_results['null_values']} null values")
    
    if validation_results['duplicate_records'] > 0:
        logging.warning(f"Found {validation_results['duplicate_records']} duplicate records")
    
    logging.info(f"Data validation passed: {validation_results}")
    return validation_results

def transform_data(**context):
    """Transform and clean the data"""
    temp_file = context['task_instance'].xcom_pull(task_ids='extract_sales_data')
    
    df = pd.read_csv(temp_file)
    
    # Data transformations
    df['sales_amount_usd'] = df['sales_amount'] * 1.0  # Currency conversion
    df['sales_category'] = df['sales_amount'].apply(
        lambda x: 'High' if x > 150 else 'Medium' if x > 100 else 'Low'
    )
    df['processed_at'] = datetime.now()
    
    # Save transformed data
    transformed_file = temp_file.replace('.csv', '_transformed.csv')
    df.to_csv(transformed_file, index=False)
    
    logging.info(f"Transformed data saved to {transformed_file}")
    return transformed_file

def load_to_warehouse(**context):
    """Load data to data warehouse"""
    transformed_file = context['task_instance'].xcom_pull(task_ids='transform_data')
    
    df = pd.read_csv(transformed_file)
    
    # In real implementation, this would load to actual warehouse
    # For demo, we'll just log the operation
    logging.info(f"Loading {len(df)} records to data warehouse")
    
    # Simulate warehouse loading
    warehouse_table = 'sales_fact'
    logging.info(f"Data loaded to {warehouse_table}")
    
    return {
        'table': warehouse_table,
        'records_loaded': len(df),
        'load_timestamp': datetime.now().isoformat()
    }

def send_success_notification(**context):
    """Send success notification"""
    load_result = context['task_instance'].xcom_pull(task_ids='load_to_warehouse')
    
    message = f"""
    Daily sales pipeline completed successfully!
    
    Records processed: {load_result['records_loaded']}
    Load timestamp: {load_result['load_timestamp']}
    Table: {load_result['table']}
    """
    
    logging.info(message)
    return message

# Define tasks
wait_for_file = FileSensor(
    task_id='wait_for_source_file',
    filepath='/tmp/sales_trigger.txt',
    fs_conn_id='fs_default',
    poke_interval=60,  # Check every minute
    timeout=300,  # Timeout after 5 minutes
    dag=dag
)

extract_task = PythonOperator(
    task_id='extract_sales_data',
    python_callable=extract_sales_data,
    dag=dag
)

validate_task = PythonOperator(
    task_id='validate_data',
    python_callable=validate_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_to_warehouse',
    python_callable=load_to_warehouse,
    dag=dag
)

# Data quality check
quality_check = BashOperator(
    task_id='data_quality_check',
    bash_command="""
    echo "Running data quality checks..."
    # Add actual quality check commands here
    echo "Quality checks passed"
    """,
    dag=dag
)

notification_task = PythonOperator(
    task_id='send_notification',
    python_callable=send_success_notification,
    dag=dag
)

# Cleanup task
cleanup_task = BashOperator(
    task_id='cleanup_temp_files',
    bash_command='rm -f /tmp/sales_data_*.csv',
    dag=dag
)

# Define task dependencies
wait_for_file >> extract_task >> validate_task >> transform_task >> load_task
load_task >> quality_check >> notification_task >> cleanup_task
```

### Advanced DAG Patterns

```python
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.subdag_operator import SubDagOperator
from airflow.models import Variable
from airflow.hooks.base_hook import BaseHook

# Dynamic task generation
def create_processing_tasks(dag, data_sources):
    """Dynamically create tasks for multiple data sources"""
    
    start_task = DummyOperator(task_id='start_processing', dag=dag)
    end_task = DummyOperator(task_id='end_processing', dag=dag)
    
    for source in data_sources:
        # Create extract task for each source
        extract_task = PythonOperator(
            task_id=f'extract_{source}',
            python_callable=extract_data_from_source,
            op_kwargs={'source': source},
            dag=dag
        )
        
        # Create transform task for each source
        transform_task = PythonOperator(
            task_id=f'transform_{source}',
            python_callable=transform_data_for_source,
            op_kwargs={'source': source},
            dag=dag
        )
        
        # Set dependencies
        start_task >> extract_task >> transform_task >> end_task
    
    return start_task, end_task

# Configuration-driven DAG
def create_config_driven_dag():
    """Create DAG based on configuration"""
    
    # Get configuration from Airflow Variables
    config = Variable.get("pipeline_config", deserialize_json=True)
    
    dag = DAG(
        config['dag_id'],
        default_args=config['default_args'],
        schedule_interval=config['schedule_interval'],
        description=config['description']
    )
    
    # Create tasks based on configuration
    for task_config in config['tasks']:
        if task_config['type'] == 'python':
            task = PythonOperator(
                task_id=task_config['task_id'],
                python_callable=globals()[task_config['function']],
                op_kwargs=task_config.get('kwargs', {}),
                dag=dag
            )
        elif task_config['type'] == 'bash':
            task = BashOperator(
                task_id=task_config['task_id'],
                bash_command=task_config['command'],
                dag=dag
            )
    
    return dag

# Branching logic
from airflow.operators.python_operator import BranchPythonOperator

def decide_processing_path(**context):
    """Decide which processing path to take based on data characteristics"""
    
    # Get data size from previous task
    data_info = context['task_instance'].xcom_pull(task_ids='analyze_data')
    
    if data_info['size_mb'] > 1000:
        return 'heavy_processing_path'
    else:
        return 'light_processing_path'

branch_task = BranchPythonOperator(
    task_id='decide_path',
    python_callable=decide_processing_path,
    dag=dag
)

heavy_processing = PythonOperator(
    task_id='heavy_processing_path',
    python_callable=heavy_data_processing,
    dag=dag
)

light_processing = PythonOperator(
    task_id='light_processing_path',
    python_callable=light_data_processing,
    dag=dag
)

# Both paths converge
join_task = DummyOperator(
    task_id='join_paths',
    trigger_rule='none_failed_or_skipped',
    dag=dag
)

branch_task >> [heavy_processing, light_processing] >> join_task
```

## Operators and Hooks

### Custom Operators

```python
from airflow.models.baseoperator import BaseOperator
from airflow.utils.decorators import apply_defaults
import requests

class APIExtractOperator(BaseOperator):
    """Custom operator for extracting data from APIs"""
    
    @apply_defaults
    def __init__(self, 
                 api_url,
                 headers=None,
                 params=None,
                 output_path=None,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_url = api_url
        self.headers = headers or {}
        self.params = params or {}
        self.output_path = output_path
    
    def execute(self, context):
        """Execute the API extraction"""
        
        # Add authentication if needed
        if 'api_key' in context['dag_run'].conf:
            self.headers['Authorization'] = f"Bearer {context['dag_run'].conf['api_key']}"
        
        # Make API request
        response = requests.get(
            self.api_url,
            headers=self.headers,
            params=self.params
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed: {response.status_code}")
        
        data = response.json()
        
        # Save data if output path specified
        if self.output_path:
            import json
            with open(self.output_path, 'w') as f:
                json.dump(data, f)
        
        self.log.info(f"Extracted {len(data)} records from API")
        return data

# Usage of custom operator
api_extract = APIExtractOperator(
    task_id='extract_from_api',
    api_url='https://api.example.com/data',
    headers={'Content-Type': 'application/json'},
    params={'date': '{{ ds }}'},  # Use Airflow template
    output_path='/tmp/api_data_{{ ds }}.json',
    dag=dag
)
```

### Database Operators

```python
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.mysql_operator import MySqlOperator
from airflow.hooks.postgres_hook import PostgresHook

# SQL operations
create_table_task = PostgresOperator(
    task_id='create_staging_table',
    postgres_conn_id='postgres_default',
    sql="""
    CREATE TABLE IF NOT EXISTS staging_sales (
        id SERIAL PRIMARY KEY,
        sale_date DATE,
        amount DECIMAL(10,2),
        customer_id VARCHAR(50),
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    dag=dag
)

# Data quality check with SQL
quality_check_sql = PostgresOperator(
    task_id='sql_quality_check',
    postgres_conn_id='postgres_default',
    sql="""
    SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN amount < 0 THEN 1 END) as negative_amounts,
        COUNT(CASE WHEN customer_id IS NULL THEN 1 END) as null_customers
    FROM staging_sales
    WHERE sale_date = '{{ ds }}'
    """,
    dag=dag
)

# Custom database operation
def custom_db_operation(**context):
    """Custom database operation using hooks"""
    
    postgres_hook = PostgresHook(postgres_conn_id='postgres_default')
    
    # Execute custom query
    sql = """
    INSERT INTO sales_summary (date, total_sales, customer_count)
    SELECT 
        sale_date,
        SUM(amount),
        COUNT(DISTINCT customer_id)
    FROM staging_sales
    WHERE sale_date = %s
    GROUP BY sale_date
    """
    
    postgres_hook.run(sql, parameters=[context['ds']])
    
    # Get results
    result = postgres_hook.get_first(
        "SELECT COUNT(*) FROM sales_summary WHERE date = %s",
        parameters=[context['ds']]
    )
    
    logging.info(f"Inserted {result[0]} summary records")
    return result[0]

db_operation_task = PythonOperator(
    task_id='custom_db_operation',
    python_callable=custom_db_operation,
    dag=dag
)
```

## Monitoring and Alerting

### Custom Sensors

```python
from airflow.sensors.base_sensor_operator import BaseSensorOperator
from airflow.utils.decorators import apply_defaults
import os

class DataQualitySensor(BaseSensorOperator):
    """Sensor that waits for data quality to meet thresholds"""
    
    @apply_defaults
    def __init__(self, 
                 table_name,
                 quality_threshold=0.95,
                 *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.table_name = table_name
        self.quality_threshold = quality_threshold
    
    def poke(self, context):
        """Check if data quality meets threshold"""
        
        postgres_hook = PostgresHook(postgres_conn_id='postgres_default')
        
        # Calculate data quality score
        quality_sql = f"""
        SELECT 
            1.0 - (
                COUNT(CASE WHEN amount IS NULL THEN 1 END) + 
                COUNT(CASE WHEN customer_id IS NULL THEN 1 END)
            )::float / COUNT(*) as quality_score
        FROM {self.table_name}
        WHERE sale_date = %s
        """
        
        result = postgres_hook.get_first(quality_sql, parameters=[context['ds']])
        quality_score = result[0] if result else 0
        
        self.log.info(f"Data quality score: {quality_score}")
        
        return quality_score >= self.quality_threshold

# Usage
quality_sensor = DataQualitySensor(
    task_id='wait_for_quality',
    table_name='staging_sales',
    quality_threshold=0.95,
    poke_interval=300,  # Check every 5 minutes
    timeout=3600,  # Timeout after 1 hour
    dag=dag
)
```

### Error Handling and Notifications

```python
from airflow.operators.email_operator import EmailOperator
from airflow.models import Variable

def handle_failure(context):
    """Custom failure handler"""
    
    # Get task instance that failed
    task_instance = context['task_instance']
    
    # Send custom notification
    error_message = f"""
    Task Failed: {task_instance.task_id}
    DAG: {task_instance.dag_id}
    Execution Date: {context['execution_date']}
    Log URL: {task_instance.log_url}
    """
    
    # Send to Slack, PagerDuty, etc.
    send_slack_notification(error_message)
    
    # Log to monitoring system
    log_to_monitoring_system(task_instance, context)

def send_slack_notification(message):
    """Send notification to Slack"""
    # Implementation for Slack webhook
    pass

def log_to_monitoring_system(task_instance, context):
    """Log failure to monitoring system"""
    # Implementation for logging to monitoring system
    pass

# Apply failure handler to tasks
task_with_handler = PythonOperator(
    task_id='critical_task',
    python_callable=some_critical_function,
    on_failure_callback=handle_failure,
    dag=dag
)

# SLA monitoring
sla_task = PythonOperator(
    task_id='sla_monitored_task',
    python_callable=time_sensitive_function,
    sla=timedelta(hours=2),  # Task should complete within 2 hours
    dag=dag
)
```

## Best Practices

### DAG Design
1. **Keep DAGs simple** - Avoid complex logic in DAG definition
2. **Use meaningful names** - Clear task and DAG naming
3. **Set appropriate timeouts** - Prevent hanging tasks
4. **Handle failures gracefully** - Implement retry logic and error handling
5. **Use templates** - Leverage Jinja templating for dynamic values

### Performance Optimization
1. **Optimize task parallelism** - Use appropriate max_active_runs
2. **Resource management** - Set memory and CPU limits
3. **Connection pooling** - Reuse database connections
4. **Efficient data transfer** - Use XCom sparingly for large data
5. **Monitor resource usage** - Track CPU, memory, and disk usage

### Security and Maintenance
1. **Secure connections** - Use encrypted connections and secrets
2. **Version control** - Keep DAGs in version control
3. **Testing** - Unit test DAG logic and task functions
4. **Documentation** - Document DAG purpose and dependencies
5. **Regular cleanup** - Clean up old logs and metadata

Apache Airflow provides a powerful platform for orchestrating complex data workflows with features for monitoring, error handling, and scalability.
