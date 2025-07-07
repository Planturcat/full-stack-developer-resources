# Creational Design Patterns

Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation. These patterns provide flexibility in deciding which objects need to be created for a given use case.

## Singleton Pattern

The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance.

### Implementation Examples

```python
# Thread-safe Singleton in Python
import threading

class DatabaseConnection:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.connection_string = "database://localhost:5432"
            self.is_connected = False
            self._initialized = True
    
    def connect(self):
        if not self.is_connected:
            print(f"Connecting to {self.connection_string}")
            self.is_connected = True
        return self
    
    def execute_query(self, query):
        if not self.is_connected:
            self.connect()
        print(f"Executing: {query}")
        return f"Result for: {query}"

# Usage
db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True - same instance

# Java implementation
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private String connectionString;
    private boolean isConnected;
    
    private DatabaseConnection() {
        this.connectionString = "database://localhost:5432";
        this.isConnected = false;
    }
    
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
    
    public DatabaseConnection connect() {
        if (!isConnected) {
            System.out.println("Connecting to " + connectionString);
            isConnected = true;
        }
        return this;
    }
    
    public String executeQuery(String query) {
        if (!isConnected) {
            connect();
        }
        System.out.println("Executing: " + query);
        return "Result for: " + query;
    }
}
```

### When to Use Singleton
- **Database connections** - Single connection pool
- **Logging services** - Centralized logging
- **Configuration managers** - Application settings
- **Cache managers** - Shared cache instance

### Alternatives to Consider
- **Dependency injection** - More testable and flexible
- **Static classes** - For stateless utilities
- **Monostate pattern** - Multiple instances, shared state

## Factory Pattern

The Factory pattern creates objects without specifying their exact classes, using a common interface.

### Simple Factory

```python
from abc import ABC, abstractmethod
from enum import Enum

class VehicleType(Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"

class Vehicle(ABC):
    @abstractmethod
    def start_engine(self):
        pass
    
    @abstractmethod
    def get_max_speed(self):
        pass

class Car(Vehicle):
    def start_engine(self):
        return "Car engine started with key"
    
    def get_max_speed(self):
        return 180

class Motorcycle(Vehicle):
    def start_engine(self):
        return "Motorcycle engine started with button"
    
    def get_max_speed(self):
        return 200

class Truck(Vehicle):
    def start_engine(self):
        return "Truck engine started with key"
    
    def get_max_speed(self):
        return 120

class VehicleFactory:
    @staticmethod
    def create_vehicle(vehicle_type: VehicleType) -> Vehicle:
        if vehicle_type == VehicleType.CAR:
            return Car()
        elif vehicle_type == VehicleType.MOTORCYCLE:
            return Motorcycle()
        elif vehicle_type == VehicleType.TRUCK:
            return Truck()
        else:
            raise ValueError(f"Unknown vehicle type: {vehicle_type}")

# Usage
factory = VehicleFactory()
car = factory.create_vehicle(VehicleType.CAR)
print(car.start_engine())  # "Car engine started with key"
print(f"Max speed: {car.get_max_speed()} km/h")
```

### Abstract Factory

```python
# Abstract Factory for different UI themes
class Button(ABC):
    @abstractmethod
    def render(self):
        pass

class Checkbox(ABC):
    @abstractmethod
    def render(self):
        pass

# Windows theme implementations
class WindowsButton(Button):
    def render(self):
        return "Rendering Windows-style button"

class WindowsCheckbox(Checkbox):
    def render(self):
        return "Rendering Windows-style checkbox"

# Mac theme implementations
class MacButton(Button):
    def render(self):
        return "Rendering Mac-style button"

class MacCheckbox(Checkbox):
    def render(self):
        return "Rendering Mac-style checkbox"

# Abstract factory
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button:
        pass
    
    @abstractmethod
    def create_checkbox(self) -> Checkbox:
        pass

# Concrete factories
class WindowsUIFactory(UIFactory):
    def create_button(self) -> Button:
        return WindowsButton()
    
    def create_checkbox(self) -> Checkbox:
        return WindowsCheckbox()

class MacUIFactory(UIFactory):
    def create_button(self) -> Button:
        return MacButton()
    
    def create_checkbox(self) -> Checkbox:
        return MacCheckbox()

# Client code
class Application:
    def __init__(self, factory: UIFactory):
        self.factory = factory
        self.button = factory.create_button()
        self.checkbox = factory.create_checkbox()
    
    def render_ui(self):
        return f"{self.button.render()}\n{self.checkbox.render()}"

# Usage
def create_app(os_type: str) -> Application:
    if os_type == "windows":
        return Application(WindowsUIFactory())
    elif os_type == "mac":
        return Application(MacUIFactory())
    else:
        raise ValueError(f"Unsupported OS: {os_type}")

windows_app = create_app("windows")
print(windows_app.render_ui())
```

## Builder Pattern

The Builder pattern constructs complex objects step by step, allowing you to create different representations using the same construction process.

### Basic Builder

```python
class Computer:
    def __init__(self):
        self.cpu = None
        self.memory = None
        self.storage = None
        self.graphics_card = None
        self.operating_system = None
    
    def __str__(self):
        specs = []
        if self.cpu: specs.append(f"CPU: {self.cpu}")
        if self.memory: specs.append(f"Memory: {self.memory}")
        if self.storage: specs.append(f"Storage: {self.storage}")
        if self.graphics_card: specs.append(f"Graphics: {self.graphics_card}")
        if self.operating_system: specs.append(f"OS: {self.operating_system}")
        return "Computer Specs:\n" + "\n".join(specs)

class ComputerBuilder:
    def __init__(self):
        self.computer = Computer()
    
    def set_cpu(self, cpu):
        self.computer.cpu = cpu
        return self
    
    def set_memory(self, memory):
        self.computer.memory = memory
        return self
    
    def set_storage(self, storage):
        self.computer.storage = storage
        return self
    
    def set_graphics_card(self, graphics_card):
        self.computer.graphics_card = graphics_card
        return self
    
    def set_operating_system(self, os):
        self.computer.operating_system = os
        return self
    
    def build(self):
        return self.computer

# Usage with method chaining
gaming_computer = (ComputerBuilder()
                  .set_cpu("Intel i9-12900K")
                  .set_memory("32GB DDR4")
                  .set_storage("1TB NVMe SSD")
                  .set_graphics_card("NVIDIA RTX 4080")
                  .set_operating_system("Windows 11")
                  .build())

print(gaming_computer)
```

### Director Pattern with Builder

```python
class ComputerDirector:
    def __init__(self, builder: ComputerBuilder):
        self.builder = builder
    
    def build_gaming_computer(self):
        return (self.builder
                .set_cpu("Intel i9-12900K")
                .set_memory("32GB DDR4")
                .set_storage("1TB NVMe SSD")
                .set_graphics_card("NVIDIA RTX 4080")
                .set_operating_system("Windows 11")
                .build())
    
    def build_office_computer(self):
        return (self.builder
                .set_cpu("Intel i5-12400")
                .set_memory("16GB DDR4")
                .set_storage("512GB SSD")
                .set_operating_system("Windows 11")
                .build())
    
    def build_server(self):
        return (self.builder
                .set_cpu("AMD EPYC 7763")
                .set_memory("128GB DDR4")
                .set_storage("2TB NVMe SSD")
                .set_operating_system("Ubuntu Server 22.04")
                .build())

# Usage
director = ComputerDirector(ComputerBuilder())
gaming_pc = director.build_gaming_computer()
office_pc = director.build_office_computer()
server = director.build_server()
```

### Fluent Builder with Validation

```python
class DatabaseConfig:
    def __init__(self):
        self.host = None
        self.port = None
        self.database = None
        self.username = None
        self.password = None
        self.ssl_enabled = False
        self.connection_timeout = 30
        self.max_connections = 10
    
    def get_connection_string(self):
        if not all([self.host, self.port, self.database, self.username]):
            raise ValueError("Missing required configuration")
        
        ssl_param = "?sslmode=require" if self.ssl_enabled else ""
        return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}{ssl_param}"

class DatabaseConfigBuilder:
    def __init__(self):
        self.config = DatabaseConfig()
    
    def host(self, host):
        if not host:
            raise ValueError("Host cannot be empty")
        self.config.host = host
        return self
    
    def port(self, port):
        if not isinstance(port, int) or port <= 0 or port > 65535:
            raise ValueError("Port must be a valid integer between 1 and 65535")
        self.config.port = port
        return self
    
    def database(self, database):
        if not database:
            raise ValueError("Database name cannot be empty")
        self.config.database = database
        return self
    
    def credentials(self, username, password):
        if not username or not password:
            raise ValueError("Username and password cannot be empty")
        self.config.username = username
        self.config.password = password
        return self
    
    def enable_ssl(self):
        self.config.ssl_enabled = True
        return self
    
    def connection_timeout(self, timeout):
        if timeout <= 0:
            raise ValueError("Timeout must be positive")
        self.config.connection_timeout = timeout
        return self
    
    def max_connections(self, max_conn):
        if max_conn <= 0:
            raise ValueError("Max connections must be positive")
        self.config.max_connections = max_conn
        return self
    
    def build(self):
        # Validate required fields
        if not all([self.config.host, self.config.port, self.config.database, 
                   self.config.username, self.config.password]):
            raise ValueError("Missing required configuration fields")
        return self.config

# Usage
try:
    db_config = (DatabaseConfigBuilder()
                .host("localhost")
                .port(5432)
                .database("myapp")
                .credentials("admin", "secret123")
                .enable_ssl()
                .connection_timeout(60)
                .max_connections(20)
                .build())
    
    print(db_config.get_connection_string())
except ValueError as e:
    print(f"Configuration error: {e}")
```

## Prototype Pattern

The Prototype pattern creates objects by cloning existing instances rather than creating new ones from scratch.

```python
import copy
from abc import ABC, abstractmethod

class Prototype(ABC):
    @abstractmethod
    def clone(self):
        pass

class Document(Prototype):
    def __init__(self, title="", content="", author="", template_type="basic"):
        self.title = title
        self.content = content
        self.author = author
        self.template_type = template_type
        self.metadata = {}
        self.formatting = {
            "font": "Arial",
            "font_size": 12,
            "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1}
        }
    
    def clone(self):
        # Deep copy to avoid shared references
        return copy.deepcopy(self)
    
    def __str__(self):
        return f"Document: {self.title} by {self.author} ({self.template_type})"

class DocumentRegistry:
    def __init__(self):
        self._prototypes = {}
    
    def register_prototype(self, name, prototype):
        self._prototypes[name] = prototype
    
    def create_document(self, prototype_name):
        if prototype_name not in self._prototypes:
            raise ValueError(f"Unknown prototype: {prototype_name}")
        return self._prototypes[prototype_name].clone()

# Setup prototypes
registry = DocumentRegistry()

# Create template documents
report_template = Document(
    title="Monthly Report Template",
    content="## Executive Summary\n\n## Key Metrics\n\n## Recommendations",
    author="Template",
    template_type="report"
)
report_template.formatting["font"] = "Times New Roman"
report_template.formatting["font_size"] = 11

letter_template = Document(
    title="Business Letter Template",
    content="Dear [Recipient],\n\n[Body]\n\nSincerely,\n[Sender]",
    author="Template",
    template_type="letter"
)

# Register prototypes
registry.register_prototype("report", report_template)
registry.register_prototype("letter", letter_template)

# Create new documents from prototypes
monthly_report = registry.create_document("report")
monthly_report.title = "January 2024 Sales Report"
monthly_report.author = "Sales Team"
monthly_report.content = monthly_report.content.replace("## Key Metrics", "## Key Metrics\n- Revenue: $100K\n- Growth: 15%")

business_letter = registry.create_document("letter")
business_letter.title = "Partnership Proposal"
business_letter.author = "Business Development"
business_letter.content = business_letter.content.replace("[Recipient]", "ABC Corp")

print(monthly_report)
print(business_letter)
```

## Best Practices

### When to Use Creational Patterns

1. **Singleton** - Use sparingly, prefer dependency injection
   - Good for: Logging, configuration, connection pools
   - Avoid for: General object creation, testability concerns

2. **Factory** - Use when object creation is complex
   - Good for: Plugin systems, different implementations
   - Avoid for: Simple object creation

3. **Builder** - Use for complex objects with many parameters
   - Good for: Configuration objects, complex domain objects
   - Avoid for: Simple objects with few properties

4. **Prototype** - Use when object creation is expensive
   - Good for: Template systems, object copying
   - Avoid for: Simple object creation

### Common Pitfalls

1. **Overusing Singleton** - Makes testing difficult
2. **Complex factories** - Keep factory logic simple
3. **Builder without validation** - Validate in build() method
4. **Shallow copying in Prototype** - Use deep copy for complex objects

### Testing Considerations

1. **Mock dependencies** - Use dependency injection instead of Singletons
2. **Test factory logic** - Ensure correct object types are created
3. **Validate builder constraints** - Test edge cases and validation
4. **Test prototype independence** - Ensure cloned objects are independent

Creational patterns provide flexible ways to create objects while hiding the creation logic from client code. Choose the appropriate pattern based on your specific needs for object creation complexity, performance requirements, and maintainability.
