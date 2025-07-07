# Scalability Concepts

Scalability is the ability of a system to handle increased load by adding resources. Understanding scalability concepts is crucial for designing systems that can grow with user demand and business requirements.

## Types of Scalability

### Vertical Scaling (Scale Up)

Adding more power to existing machines by increasing CPU, RAM, or storage.

```python
# Example: Database server scaling
class DatabaseServer:
    def __init__(self, cpu_cores=4, ram_gb=16, storage_gb=500):
        self.cpu_cores = cpu_cores
        self.ram_gb = ram_gb
        self.storage_gb = storage_gb
        self.connections = []
        self.max_connections = cpu_cores * 100  # Simple calculation
    
    def scale_up(self, new_cpu_cores, new_ram_gb, new_storage_gb):
        """Vertical scaling - upgrade hardware"""
        print(f"Scaling up from {self.cpu_cores} cores to {new_cpu_cores} cores")
        print(f"RAM: {self.ram_gb}GB -> {new_ram_gb}GB")
        print(f"Storage: {self.storage_gb}GB -> {new_storage_gb}GB")
        
        self.cpu_cores = new_cpu_cores
        self.ram_gb = new_ram_gb
        self.storage_gb = new_storage_gb
        self.max_connections = new_cpu_cores * 100
        
        return f"Server upgraded: {new_cpu_cores} cores, {new_ram_gb}GB RAM"
    
    def get_capacity(self):
        return {
            'max_connections': self.max_connections,
            'current_connections': len(self.connections),
            'utilization': len(self.connections) / self.max_connections * 100
        }

# Usage
db_server = DatabaseServer()
print(db_server.get_capacity())

# Scale up when hitting limits
db_server.scale_up(cpu_cores=8, ram_gb=32, storage_gb=1000)
print(db_server.get_capacity())
```

**Pros:**
- Simple to implement
- No application changes needed
- Better performance per unit

**Cons:**
- Hardware limits
- Single point of failure
- Expensive at scale
- Downtime during upgrades

### Horizontal Scaling (Scale Out)

Adding more machines to the pool of resources.

```python
import random
from typing import List

class WebServer:
    def __init__(self, server_id: str, max_requests_per_second=1000):
        self.server_id = server_id
        self.max_rps = max_requests_per_second
        self.current_load = 0
        self.is_healthy = True
    
    def handle_request(self, request):
        if self.current_load < self.max_rps and self.is_healthy:
            self.current_load += 1
            return f"Server {self.server_id} handled request: {request}"
        else:
            raise Exception(f"Server {self.server_id} overloaded or unhealthy")
    
    def get_load_percentage(self):
        return (self.current_load / self.max_rps) * 100
    
    def reset_load(self):
        self.current_load = 0

class LoadBalancer:
    def __init__(self):
        self.servers: List[WebServer] = []
        self.current_server_index = 0
    
    def add_server(self, server: WebServer):
        """Horizontal scaling - add more servers"""
        self.servers.append(server)
        print(f"Added server {server.server_id} to the pool")
        return f"Total servers: {len(self.servers)}"
    
    def remove_server(self, server_id: str):
        """Scale down - remove servers"""
        self.servers = [s for s in self.servers if s.server_id != server_id]
        print(f"Removed server {server_id}")
        return f"Total servers: {len(self.servers)}"
    
    def round_robin_request(self, request):
        """Simple round-robin load balancing"""
        if not self.servers:
            raise Exception("No servers available")
        
        server = self.servers[self.current_server_index]
        self.current_server_index = (self.current_server_index + 1) % len(self.servers)
        
        try:
            return server.handle_request(request)
        except Exception as e:
            # Try next server if current one fails
            return self.least_connections_request(request)
    
    def least_connections_request(self, request):
        """Route to server with least load"""
        available_servers = [s for s in self.servers if s.is_healthy]
        if not available_servers:
            raise Exception("No healthy servers available")
        
        least_loaded_server = min(available_servers, key=lambda s: s.current_load)
        return least_loaded_server.handle_request(request)
    
    def get_cluster_status(self):
        return {
            'total_servers': len(self.servers),
            'healthy_servers': len([s for s in self.servers if s.is_healthy]),
            'average_load': sum(s.get_load_percentage() for s in self.servers) / len(self.servers) if self.servers else 0,
            'server_details': [
                {
                    'id': s.server_id,
                    'load_percentage': s.get_load_percentage(),
                    'healthy': s.is_healthy
                } for s in self.servers
            ]
        }

# Usage example
load_balancer = LoadBalancer()

# Start with 2 servers
load_balancer.add_server(WebServer("web-1"))
load_balancer.add_server(WebServer("web-2"))

# Simulate traffic
for i in range(10):
    try:
        response = load_balancer.round_robin_request(f"request-{i}")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

print("\nCluster Status:")
print(load_balancer.get_cluster_status())

# Scale out - add more servers when load increases
load_balancer.add_server(WebServer("web-3"))
load_balancer.add_server(WebServer("web-4"))

print("\nAfter scaling out:")
print(load_balancer.get_cluster_status())
```

**Pros:**
- No theoretical limit
- Better fault tolerance
- Cost-effective
- No downtime for scaling

**Cons:**
- Application complexity
- Data consistency challenges
- Network overhead
- More moving parts

## Load Balancing Strategies

### Round Robin

```python
class RoundRobinBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.current = 0
    
    def get_server(self):
        server = self.servers[self.current]
        self.current = (self.current + 1) % len(self.servers)
        return server
```

### Weighted Round Robin

```python
class WeightedRoundRobinBalancer:
    def __init__(self, servers_with_weights):
        # servers_with_weights: [(server, weight), ...]
        self.servers = []
        for server, weight in servers_with_weights:
            self.servers.extend([server] * weight)
        self.current = 0
    
    def get_server(self):
        server = self.servers[self.current]
        self.current = (self.current + 1) % len(self.servers)
        return server

# Usage
servers = [
    (WebServer("powerful-server"), 3),  # Gets 3x more requests
    (WebServer("standard-server"), 1)
]
balancer = WeightedRoundRobinBalancer(servers)
```

### Least Connections

```python
class LeastConnectionsBalancer:
    def __init__(self, servers):
        self.servers = servers
    
    def get_server(self):
        return min(self.servers, key=lambda s: s.current_load)
```

### Health Check Based

```python
import time
import threading

class HealthCheckBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.health_check_interval = 30  # seconds
        self.start_health_checks()
    
    def health_check(self, server):
        """Simulate health check"""
        try:
            # In real implementation, this would be an HTTP health check
            response_time = random.uniform(0.1, 2.0)
            server.is_healthy = response_time < 1.0  # Healthy if response < 1s
            return server.is_healthy
        except:
            server.is_healthy = False
            return False
    
    def start_health_checks(self):
        def check_all_servers():
            while True:
                for server in self.servers:
                    self.health_check(server)
                    print(f"Health check: {server.server_id} - {'Healthy' if server.is_healthy else 'Unhealthy'}")
                time.sleep(self.health_check_interval)
        
        health_thread = threading.Thread(target=check_all_servers, daemon=True)
        health_thread.start()
    
    def get_healthy_server(self):
        healthy_servers = [s for s in self.servers if s.is_healthy]
        if not healthy_servers:
            raise Exception("No healthy servers available")
        return min(healthy_servers, key=lambda s: s.current_load)
```

## Caching Strategies

### Application-Level Caching

```python
import time
from functools import wraps

class Cache:
    def __init__(self, ttl=300):  # 5 minutes default TTL
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key):
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key, value):
        self.cache[key] = (value, time.time())
    
    def invalidate(self, key):
        if key in self.cache:
            del self.cache[key]

def cached(cache_instance, key_func=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try cache first
            cached_result = cache_instance.get(cache_key)
            if cached_result is not None:
                print(f"Cache hit for {cache_key}")
                return cached_result
            
            # Execute function and cache result
            print(f"Cache miss for {cache_key}")
            result = func(*args, **kwargs)
            cache_instance.set(cache_key, result)
            return result
        
        return wrapper
    return decorator

# Usage
app_cache = Cache(ttl=60)

@cached(app_cache)
def expensive_database_query(user_id):
    # Simulate expensive operation
    time.sleep(2)
    return f"User data for {user_id}"

# First call - cache miss
result1 = expensive_database_query(123)

# Second call - cache hit
result2 = expensive_database_query(123)
```

### Distributed Caching

```python
import json
import hashlib

class DistributedCache:
    def __init__(self, cache_nodes):
        self.nodes = cache_nodes
    
    def _get_node(self, key):
        """Consistent hashing to determine which node to use"""
        hash_value = int(hashlib.md5(key.encode()).hexdigest(), 16)
        node_index = hash_value % len(self.nodes)
        return self.nodes[node_index]
    
    def get(self, key):
        node = self._get_node(key)
        return node.get(key)
    
    def set(self, key, value):
        node = self._get_node(key)
        return node.set(key, value)
    
    def invalidate(self, key):
        node = self._get_node(key)
        return node.invalidate(key)

class CacheNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.cache = Cache()
    
    def get(self, key):
        print(f"Getting {key} from node {self.node_id}")
        return self.cache.get(key)
    
    def set(self, key, value):
        print(f"Setting {key} in node {self.node_id}")
        return self.cache.set(key, value)
    
    def invalidate(self, key):
        return self.cache.invalidate(key)

# Usage
nodes = [CacheNode(f"cache-{i}") for i in range(3)]
distributed_cache = DistributedCache(nodes)

distributed_cache.set("user:123", {"name": "John", "email": "john@example.com"})
distributed_cache.set("user:456", {"name": "Jane", "email": "jane@example.com"})

print(distributed_cache.get("user:123"))
print(distributed_cache.get("user:456"))
```

## Database Scaling Patterns

### Read Replicas

```python
import random

class DatabaseCluster:
    def __init__(self, master_db, read_replicas):
        self.master = master_db
        self.read_replicas = read_replicas
        self.replication_lag = {}  # Track replication lag
    
    def write(self, query, data):
        """All writes go to master"""
        result = self.master.execute_write(query, data)
        
        # Simulate replication to read replicas
        for replica in self.read_replicas:
            replica.replicate_from_master(query, data)
        
        return result
    
    def read(self, query, consistency_level="eventual"):
        """Reads can go to replicas or master based on consistency needs"""
        if consistency_level == "strong":
            # Strong consistency - read from master
            return self.master.execute_read(query)
        else:
            # Eventual consistency - read from replica
            replica = random.choice(self.read_replicas)
            return replica.execute_read(query)
    
    def get_cluster_status(self):
        return {
            'master_status': self.master.get_status(),
            'replica_count': len(self.read_replicas),
            'replica_status': [r.get_status() for r in self.read_replicas]
        }

class Database:
    def __init__(self, db_id, is_master=False):
        self.db_id = db_id
        self.is_master = is_master
        self.data = {}
        self.write_count = 0
        self.read_count = 0
    
    def execute_write(self, query, data):
        if not self.is_master:
            raise Exception("Writes only allowed on master")
        
        self.data.update(data)
        self.write_count += 1
        return f"Write executed on {self.db_id}"
    
    def execute_read(self, query):
        self.read_count += 1
        return f"Read executed on {self.db_id}: {self.data}"
    
    def replicate_from_master(self, query, data):
        if self.is_master:
            return
        
        # Simulate replication delay
        self.data.update(data)
        return f"Replicated to {self.db_id}"
    
    def get_status(self):
        return {
            'id': self.db_id,
            'is_master': self.is_master,
            'writes': self.write_count,
            'reads': self.read_count,
            'data_size': len(self.data)
        }

# Usage
master_db = Database("master-db", is_master=True)
read_replicas = [
    Database("replica-1"),
    Database("replica-2"),
    Database("replica-3")
]

cluster = DatabaseCluster(master_db, read_replicas)

# Write operations
cluster.write("INSERT", {"user:1": {"name": "Alice"}})
cluster.write("INSERT", {"user:2": {"name": "Bob"}})

# Read operations
print(cluster.read("SELECT", consistency_level="eventual"))
print(cluster.read("SELECT", consistency_level="strong"))

print("\nCluster Status:")
print(cluster.get_cluster_status())
```

### Sharding

```python
class ShardedDatabase:
    def __init__(self, shards):
        self.shards = shards
    
    def _get_shard(self, key):
        """Determine which shard to use based on key"""
        shard_index = hash(key) % len(self.shards)
        return self.shards[shard_index]
    
    def write(self, key, data):
        shard = self._get_shard(key)
        return shard.execute_write(f"INSERT {key}", {key: data})
    
    def read(self, key):
        shard = self._get_shard(key)
        return shard.execute_read(f"SELECT {key}")
    
    def read_all(self, query):
        """Query across all shards - expensive operation"""
        results = []
        for shard in self.shards:
            result = shard.execute_read(query)
            results.append(result)
        return results

# Usage
shards = [Database(f"shard-{i}") for i in range(4)]
sharded_db = ShardedDatabase(shards)

# Data automatically distributed across shards
sharded_db.write("user:1", {"name": "Alice", "region": "US"})
sharded_db.write("user:2", {"name": "Bob", "region": "EU"})
sharded_db.write("user:3", {"name": "Charlie", "region": "ASIA"})

print(sharded_db.read("user:1"))
print(sharded_db.read("user:2"))
```

## Auto-Scaling Implementation

```python
import time
import threading

class AutoScaler:
    def __init__(self, load_balancer, min_servers=2, max_servers=10):
        self.load_balancer = load_balancer
        self.min_servers = min_servers
        self.max_servers = max_servers
        self.scale_up_threshold = 70  # CPU percentage
        self.scale_down_threshold = 30
        self.monitoring = True
        self.server_counter = len(load_balancer.servers)
    
    def start_monitoring(self):
        def monitor():
            while self.monitoring:
                self.check_and_scale()
                time.sleep(30)  # Check every 30 seconds
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
    
    def check_and_scale(self):
        status = self.load_balancer.get_cluster_status()
        avg_load = status['average_load']
        current_servers = status['total_servers']
        
        print(f"Current load: {avg_load:.1f}%, Servers: {current_servers}")
        
        if avg_load > self.scale_up_threshold and current_servers < self.max_servers:
            self.scale_up()
        elif avg_load < self.scale_down_threshold and current_servers > self.min_servers:
            self.scale_down()
    
    def scale_up(self):
        self.server_counter += 1
        new_server = WebServer(f"auto-web-{self.server_counter}")
        self.load_balancer.add_server(new_server)
        print(f"🔼 Scaled UP: Added {new_server.server_id}")
    
    def scale_down(self):
        if len(self.load_balancer.servers) > self.min_servers:
            server_to_remove = self.load_balancer.servers[-1]
            self.load_balancer.remove_server(server_to_remove.server_id)
            print(f"🔽 Scaled DOWN: Removed {server_to_remove.server_id}")
    
    def stop_monitoring(self):
        self.monitoring = False

# Usage
load_balancer = LoadBalancer()
load_balancer.add_server(WebServer("web-1"))
load_balancer.add_server(WebServer("web-2"))

auto_scaler = AutoScaler(load_balancer)
auto_scaler.start_monitoring()

# Simulate varying load
print("Auto-scaler started. Simulating load...")
```

## Best Practices for Scalability

1. **Design for Failure** - Assume components will fail
2. **Stateless Services** - Make services stateless for easy scaling
3. **Asynchronous Processing** - Use queues for non-critical operations
4. **Database Optimization** - Proper indexing and query optimization
5. **Monitoring and Alerting** - Track performance metrics
6. **Gradual Rollouts** - Deploy changes incrementally
7. **Circuit Breakers** - Prevent cascade failures
8. **Resource Limits** - Set appropriate limits and timeouts

Understanding these scalability concepts helps you design systems that can handle growth efficiently while maintaining performance and reliability.
