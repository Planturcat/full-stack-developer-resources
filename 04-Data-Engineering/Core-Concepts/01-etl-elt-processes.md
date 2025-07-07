# ETL vs ELT Processes

ETL (Extract, Transform, Load) and ELT (Extract, Load, Transform) are fundamental data integration patterns. Understanding when and how to use each approach is crucial for building effective data pipelines.

## ETL (Extract, Transform, Load)

Traditional approach where data is transformed before loading into the target system.

### ETL Process Flow

```
Source Systems → Extract → Transform → Load → Target System
```

### Python ETL Example

```python
import pandas as pd
import sqlite3
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ETLPipeline:
    def __init__(self, source_config, target_config):
        self.source_config = source_config
        self.target_config = target_config
        self.extracted_data = None
        self.transformed_data = None
    
    def extract(self):
        """Extract data from source systems"""
        logger.info("Starting data extraction...")
        
        try:
            # Extract from CSV file
            if self.source_config['type'] == 'csv':
                self.extracted_data = pd.read_csv(self.source_config['path'])
            
            # Extract from database
            elif self.source_config['type'] == 'database':
                conn = sqlite3.connect(self.source_config['connection'])
                self.extracted_data = pd.read_sql_query(
                    self.source_config['query'], conn
                )
                conn.close()
            
            # Extract from API
            elif self.source_config['type'] == 'api':
                import requests
                response = requests.get(self.source_config['url'])
                self.extracted_data = pd.DataFrame(response.json())
            
            logger.info(f"Extracted {len(self.extracted_data)} records")
            return self.extracted_data
            
        except Exception as e:
            logger.error(f"Extraction failed: {e}")
            raise
    
    def transform(self):
        """Transform extracted data"""
        logger.info("Starting data transformation...")
        
        if self.extracted_data is None:
            raise ValueError("No data to transform. Run extract() first.")
        
        try:
            df = self.extracted_data.copy()
            
            # Data cleaning
            df = self._clean_data(df)
            
            # Data validation
            df = self._validate_data(df)
            
            # Business logic transformations
            df = self._apply_business_rules(df)
            
            # Data enrichment
            df = self._enrich_data(df)
            
            self.transformed_data = df
            logger.info(f"Transformed data: {len(df)} records")
            return df
            
        except Exception as e:
            logger.error(f"Transformation failed: {e}")
            raise
    
    def load(self):
        """Load transformed data to target system"""
        logger.info("Starting data loading...")
        
        if self.transformed_data is None:
            raise ValueError("No transformed data to load. Run transform() first.")
        
        try:
            # Load to database
            if self.target_config['type'] == 'database':
                conn = sqlite3.connect(self.target_config['connection'])
                self.transformed_data.to_sql(
                    self.target_config['table'],
                    conn,
                    if_exists=self.target_config.get('if_exists', 'append'),
                    index=False
                )
                conn.close()
            
            # Load to CSV
            elif self.target_config['type'] == 'csv':
                self.transformed_data.to_csv(
                    self.target_config['path'], 
                    index=False
                )
            
            # Load to data warehouse
            elif self.target_config['type'] == 'warehouse':
                self._load_to_warehouse()
            
            logger.info("Data loading completed successfully")
            
        except Exception as e:
            logger.error(f"Loading failed: {e}")
            raise
    
    def _clean_data(self, df):
        """Data cleaning operations"""
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        df = df.fillna({
            'name': 'Unknown',
            'age': df['age'].median(),
            'salary': 0
        })
        
        # Standardize text fields
        text_columns = df.select_dtypes(include=['object']).columns
        for col in text_columns:
            df[col] = df[col].str.strip().str.title()
        
        # Remove invalid records
        df = df[df['age'] >= 0]
        df = df[df['salary'] >= 0]
        
        return df
    
    def _validate_data(self, df):
        """Data validation"""
        # Check required fields
        required_fields = ['name', 'email', 'age']
        for field in required_fields:
            if field not in df.columns:
                raise ValueError(f"Required field '{field}' missing")
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        invalid_emails = ~df['email'].str.match(email_pattern)
        if invalid_emails.any():
            logger.warning(f"Found {invalid_emails.sum()} invalid email addresses")
            df = df[~invalid_emails]
        
        # Validate age range
        invalid_ages = (df['age'] < 0) | (df['age'] > 150)
        if invalid_ages.any():
            logger.warning(f"Found {invalid_ages.sum()} invalid ages")
            df = df[~invalid_ages]
        
        return df
    
    def _apply_business_rules(self, df):
        """Apply business logic transformations"""
        # Calculate age groups
        df['age_group'] = pd.cut(
            df['age'], 
            bins=[0, 18, 35, 50, 65, 100],
            labels=['Minor', 'Young Adult', 'Adult', 'Middle Age', 'Senior']
        )
        
        # Calculate salary bands
        df['salary_band'] = pd.cut(
            df['salary'],
            bins=[0, 30000, 60000, 100000, float('inf')],
            labels=['Entry', 'Mid', 'Senior', 'Executive']
        )
        
        # Add derived fields
        df['full_name'] = df['first_name'] + ' ' + df['last_name']
        df['email_domain'] = df['email'].str.split('@').str[1]
        
        # Add metadata
        df['processed_at'] = datetime.now()
        df['data_source'] = self.source_config.get('name', 'unknown')
        
        return df
    
    def _enrich_data(self, df):
        """Enrich data with external sources"""
        # Add geographic information based on zip code
        if 'zip_code' in df.columns:
            # This would typically call an external service
            df['region'] = df['zip_code'].apply(self._get_region_from_zip)
        
        # Add company information based on email domain
        if 'email_domain' in df.columns:
            df['company_type'] = df['email_domain'].apply(self._classify_company)
        
        return df
    
    def _get_region_from_zip(self, zip_code):
        """Mock function to get region from zip code"""
        # In real implementation, this would query a geographic database
        zip_to_region = {
            '10001': 'Northeast',
            '90210': 'West',
            '60601': 'Midwest',
            '30301': 'Southeast'
        }
        return zip_to_region.get(str(zip_code), 'Unknown')
    
    def _classify_company(self, domain):
        """Classify company type based on email domain"""
        if domain.endswith('.edu'):
            return 'Education'
        elif domain.endswith('.gov'):
            return 'Government'
        elif domain.endswith('.org'):
            return 'Non-profit'
        else:
            return 'Commercial'
    
    def _load_to_warehouse(self):
        """Load data to data warehouse"""
        # This would implement warehouse-specific loading logic
        # e.g., Snowflake, Redshift, BigQuery
        pass
    
    def run_pipeline(self):
        """Execute the complete ETL pipeline"""
        logger.info("Starting ETL pipeline...")
        start_time = datetime.now()
        
        try:
            self.extract()
            self.transform()
            self.load()
            
            end_time = datetime.now()
            duration = end_time - start_time
            logger.info(f"ETL pipeline completed successfully in {duration}")
            
            return {
                'status': 'success',
                'records_processed': len(self.transformed_data),
                'duration': duration.total_seconds(),
                'start_time': start_time,
                'end_time': end_time
            }
            
        except Exception as e:
            logger.error(f"ETL pipeline failed: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'duration': (datetime.now() - start_time).total_seconds()
            }

# Usage example
if __name__ == "__main__":
    # Configuration
    source_config = {
        'type': 'csv',
        'path': 'raw_employees.csv',
        'name': 'HR_System'
    }
    
    target_config = {
        'type': 'database',
        'connection': 'data_warehouse.db',
        'table': 'employees_clean',
        'if_exists': 'replace'
    }
    
    # Run ETL pipeline
    etl = ETLPipeline(source_config, target_config)
    result = etl.run_pipeline()
    print(f"Pipeline result: {result}")
```

## ELT (Extract, Load, Transform)

Modern approach where raw data is loaded first, then transformed in the target system.

### ELT Process Flow

```
Source Systems → Extract → Load → Transform → Analytics
```

### Python ELT Example

```python
import pandas as pd
from sqlalchemy import create_engine, text
import logging
from datetime import datetime

class ELTPipeline:
    def __init__(self, source_config, target_config):
        self.source_config = source_config
        self.target_config = target_config
        self.engine = create_engine(target_config['connection_string'])
    
    def extract_and_load(self):
        """Extract data and load directly to data lake/warehouse"""
        logger.info("Starting extract and load...")
        
        try:
            # Extract from source
            if self.source_config['type'] == 'csv':
                df = pd.read_csv(self.source_config['path'])
            elif self.source_config['type'] == 'api':
                df = self._extract_from_api()
            elif self.source_config['type'] == 'database':
                df = self._extract_from_database()
            
            # Load raw data to staging area
            staging_table = f"staging_{self.source_config['name']}"
            df.to_sql(
                staging_table,
                self.engine,
                if_exists='replace',
                index=False,
                method='multi'
            )
            
            # Add metadata
            self._add_load_metadata(staging_table, len(df))
            
            logger.info(f"Loaded {len(df)} records to {staging_table}")
            return staging_table
            
        except Exception as e:
            logger.error(f"Extract and load failed: {e}")
            raise
    
    def transform_in_warehouse(self, staging_table):
        """Transform data using SQL in the data warehouse"""
        logger.info("Starting in-warehouse transformations...")
        
        try:
            # Data cleaning transformations
            self._clean_data_sql(staging_table)
            
            # Business logic transformations
            self._apply_business_rules_sql(staging_table)
            
            # Create final clean table
            final_table = staging_table.replace('staging_', 'clean_')
            self._create_final_table(staging_table, final_table)
            
            logger.info(f"Transformations completed. Final table: {final_table}")
            return final_table
            
        except Exception as e:
            logger.error(f"Warehouse transformation failed: {e}")
            raise
    
    def _clean_data_sql(self, table_name):
        """Data cleaning using SQL"""
        cleaning_queries = [
            # Remove duplicates
            f"""
            CREATE OR REPLACE TABLE {table_name}_dedup AS
            SELECT DISTINCT * FROM {table_name}
            """,
            
            # Handle missing values
            f"""
            CREATE OR REPLACE TABLE {table_name}_clean AS
            SELECT 
                COALESCE(name, 'Unknown') as name,
                COALESCE(email, 'unknown@example.com') as email,
                COALESCE(age, (SELECT AVG(age) FROM {table_name}_dedup WHERE age IS NOT NULL)) as age,
                COALESCE(salary, 0) as salary,
                *
            FROM {table_name}_dedup
            WHERE age >= 0 AND salary >= 0
            """
        ]
        
        for query in cleaning_queries:
            with self.engine.connect() as conn:
                conn.execute(text(query))
                conn.commit()
    
    def _apply_business_rules_sql(self, table_name):
        """Apply business rules using SQL"""
        business_rules_query = f"""
        CREATE OR REPLACE TABLE {table_name}_enriched AS
        SELECT *,
            CASE 
                WHEN age < 18 THEN 'Minor'
                WHEN age < 35 THEN 'Young Adult'
                WHEN age < 50 THEN 'Adult'
                WHEN age < 65 THEN 'Middle Age'
                ELSE 'Senior'
            END as age_group,
            
            CASE 
                WHEN salary < 30000 THEN 'Entry'
                WHEN salary < 60000 THEN 'Mid'
                WHEN salary < 100000 THEN 'Senior'
                ELSE 'Executive'
            END as salary_band,
            
            CONCAT(first_name, ' ', last_name) as full_name,
            SUBSTRING(email, POSITION('@' IN email) + 1) as email_domain,
            CURRENT_TIMESTAMP as processed_at,
            '{self.source_config.get('name', 'unknown')}' as data_source
            
        FROM {table_name}_clean
        """
        
        with self.engine.connect() as conn:
            conn.execute(text(business_rules_query))
            conn.commit()
    
    def _create_final_table(self, staging_table, final_table):
        """Create final production table"""
        final_query = f"""
        CREATE OR REPLACE TABLE {final_table} AS
        SELECT * FROM {staging_table}_enriched
        """
        
        with self.engine.connect() as conn:
            conn.execute(text(final_query))
            conn.commit()
    
    def _add_load_metadata(self, table_name, record_count):
        """Add metadata about the load process"""
        metadata_query = f"""
        CREATE TABLE IF NOT EXISTS load_metadata (
            table_name VARCHAR(255),
            load_timestamp TIMESTAMP,
            record_count INTEGER,
            source_system VARCHAR(255)
        )
        """
        
        insert_metadata = f"""
        INSERT INTO load_metadata VALUES (
            '{table_name}',
            CURRENT_TIMESTAMP,
            {record_count},
            '{self.source_config.get('name', 'unknown')}'
        )
        """
        
        with self.engine.connect() as conn:
            conn.execute(text(metadata_query))
            conn.execute(text(insert_metadata))
            conn.commit()
    
    def run_pipeline(self):
        """Execute the complete ELT pipeline"""
        logger.info("Starting ELT pipeline...")
        start_time = datetime.now()
        
        try:
            # Extract and Load
            staging_table = self.extract_and_load()
            
            # Transform in warehouse
            final_table = self.transform_in_warehouse(staging_table)
            
            end_time = datetime.now()
            duration = end_time - start_time
            logger.info(f"ELT pipeline completed successfully in {duration}")
            
            return {
                'status': 'success',
                'staging_table': staging_table,
                'final_table': final_table,
                'duration': duration.total_seconds(),
                'start_time': start_time,
                'end_time': end_time
            }
            
        except Exception as e:
            logger.error(f"ELT pipeline failed: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'duration': (datetime.now() - start_time).total_seconds()
            }
```

## ETL vs ELT Comparison

### When to Use ETL

**Best for:**
- Limited target system compute resources
- Complex transformations requiring specialized tools
- Data privacy/security requirements
- Structured data with well-defined schemas
- Real-time processing requirements

**Example Use Cases:**
- Legacy system integration
- Data migration projects
- Compliance-heavy industries
- Resource-constrained environments

### When to Use ELT

**Best for:**
- Cloud-based data warehouses (Snowflake, BigQuery, Redshift)
- Large volumes of data
- Flexible schema requirements
- Iterative analytics and exploration
- Modern cloud-native architectures

**Example Use Cases:**
- Data lakes and lakehouses
- Modern analytics platforms
- Machine learning pipelines
- Self-service analytics

## Hybrid Approach Example

```python
class HybridPipeline:
    """Combines ETL and ELT approaches based on data characteristics"""
    
    def __init__(self, config):
        self.config = config
        self.etl_pipeline = ETLPipeline(config['etl_source'], config['etl_target'])
        self.elt_pipeline = ELTPipeline(config['elt_source'], config['elt_target'])
    
    def process_data(self, data_source):
        """Route data through appropriate pipeline based on characteristics"""
        
        # Analyze data characteristics
        data_profile = self._profile_data(data_source)
        
        if self._should_use_etl(data_profile):
            logger.info("Using ETL approach for structured, small dataset")
            return self.etl_pipeline.run_pipeline()
        else:
            logger.info("Using ELT approach for large, semi-structured dataset")
            return self.elt_pipeline.run_pipeline()
    
    def _profile_data(self, data_source):
        """Profile data to determine processing approach"""
        # This would analyze data size, structure, quality, etc.
        return {
            'size_mb': 100,
            'structure': 'semi-structured',
            'quality_score': 0.8,
            'schema_stability': 'low'
        }
    
    def _should_use_etl(self, profile):
        """Decision logic for ETL vs ELT"""
        return (
            profile['size_mb'] < 1000 and
            profile['structure'] == 'structured' and
            profile['schema_stability'] == 'high'
        )
```

## Best Practices

### ETL Best Practices
1. **Validate early** - Check data quality at extraction
2. **Handle errors gracefully** - Implement retry logic and error handling
3. **Log everything** - Comprehensive logging for debugging
4. **Test transformations** - Unit test transformation logic
5. **Monitor performance** - Track pipeline execution times

### ELT Best Practices
1. **Preserve raw data** - Keep original data for reprocessing
2. **Use warehouse features** - Leverage native SQL capabilities
3. **Implement data lineage** - Track data transformations
4. **Version transformations** - Version control SQL transformation logic
5. **Optimize for scale** - Design for large data volumes

### Common Patterns
1. **Incremental processing** - Process only new/changed data
2. **Idempotent operations** - Safe to run multiple times
3. **Data quality checks** - Validate data at each stage
4. **Metadata management** - Track data lineage and quality
5. **Error handling** - Graceful failure and recovery mechanisms

Understanding ETL vs ELT helps you choose the right approach for your data integration needs, considering factors like data volume, target system capabilities, and processing requirements.
