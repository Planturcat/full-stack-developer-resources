# Object-Oriented Programming in Python

Object-Oriented Programming (OOP) is a programming paradigm that organizes code into classes and objects. Python's OOP features enable you to build scalable, maintainable backend applications with clean architecture.

## Classes and Objects

### Basic Class Definition

```python
class User:
    """A class representing a user in our system."""
    
    # Class variable (shared by all instances)
    total_users = 0
    
    def __init__(self, name, email, age):
        """Initialize a new user instance."""
        # Instance variables (unique to each instance)
        self.name = name
        self.email = email
        self.age = age
        self.is_active = True
        
        # Increment class variable
        User.total_users += 1
    
    def __str__(self):
        """String representation of the user."""
        return f"User(name='{self.name}', email='{self.email}')"
    
    def __repr__(self):
        """Developer-friendly representation."""
        return f"User('{self.name}', '{self.email}', {self.age})"
    
    def activate(self):
        """Activate the user account."""
        self.is_active = True
        return f"{self.name}'s account has been activated"
    
    def deactivate(self):
        """Deactivate the user account."""
        self.is_active = False
        return f"{self.name}'s account has been deactivated"
    
    @classmethod
    def get_total_users(cls):
        """Get the total number of users created."""
        return cls.total_users
    
    @staticmethod
    def is_valid_email(email):
        """Check if an email address is valid."""
        return "@" in email and "." in email

# Creating objects
user1 = User("Alice Johnson", "alice@example.com", 28)
user2 = User("Bob Smith", "bob@example.com", 32)

print(user1)  # User(name='Alice Johnson', email='alice@example.com')
print(repr(user2))  # User('Bob Smith', 'bob@example.com', 32)

# Accessing attributes and methods
print(user1.name)  # Alice Johnson
print(user1.activate())  # Alice Johnson's account has been activated

# Class methods and static methods
print(User.get_total_users())  # 2
print(User.is_valid_email("test@example.com"))  # True
```

### Properties and Encapsulation

```python
class BankAccount:
    """A bank account with encapsulated balance."""
    
    def __init__(self, account_number, initial_balance=0):
        self.account_number = account_number
        self._balance = initial_balance  # Protected attribute
        self.__pin = None  # Private attribute
    
    @property
    def balance(self):
        """Get the current balance."""
        return self._balance
    
    @balance.setter
    def balance(self, amount):
        """Set the balance with validation."""
        if amount < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = amount
    
    @property
    def formatted_balance(self):
        """Get formatted balance as currency."""
        return f"${self._balance:.2f}"
    
    def deposit(self, amount):
        """Deposit money to the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount
        return f"Deposited ${amount:.2f}. New balance: {self.formatted_balance}"
    
    def withdraw(self, amount):
        """Withdraw money from the account."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        return f"Withdrew ${amount:.2f}. New balance: {self.formatted_balance}"
    
    def set_pin(self, pin):
        """Set a PIN for the account."""
        if len(str(pin)) != 4:
            raise ValueError("PIN must be 4 digits")
        self.__pin = pin
    
    def verify_pin(self, pin):
        """Verify the PIN."""
        return self.__pin == pin

# Usage
account = BankAccount("12345", 1000)
print(account.balance)  # 1000
print(account.formatted_balance)  # $1000.00

account.deposit(500)
print(account.withdraw(200))  # Withdrew $200.00. New balance: $1300.00

# Property setter
account.balance = 2000
print(account.balance)  # 2000

# Private attribute access (name mangling)
account.set_pin(1234)
print(account.verify_pin(1234))  # True
# print(account.__pin)  # AttributeError
```

## Inheritance

### Basic Inheritance

```python
class Animal:
    """Base class for all animals."""
    
    def __init__(self, name, species):
        self.name = name
        self.species = species
        self.is_alive = True
    
    def eat(self, food):
        return f"{self.name} is eating {food}"
    
    def sleep(self):
        return f"{self.name} is sleeping"
    
    def make_sound(self):
        return f"{self.name} makes a sound"

class Dog(Animal):
    """Dog class inheriting from Animal."""
    
    def __init__(self, name, breed):
        super().__init__(name, "Canine")  # Call parent constructor
        self.breed = breed
        self.is_trained = False
    
    def make_sound(self):  # Method overriding
        return f"{self.name} barks: Woof!"
    
    def fetch(self, item):
        return f"{self.name} fetches the {item}"
    
    def train(self):
        self.is_trained = True
        return f"{self.name} has been trained"

class Cat(Animal):
    """Cat class inheriting from Animal."""
    
    def __init__(self, name, breed):
        super().__init__(name, "Feline")
        self.breed = breed
        self.lives_remaining = 9
    
    def make_sound(self):
        return f"{self.name} meows: Meow!"
    
    def climb(self, object_name):
        return f"{self.name} climbs the {object_name}"

# Usage
dog = Dog("Buddy", "Golden Retriever")
cat = Cat("Whiskers", "Persian")

print(dog.eat("kibble"))  # Buddy is eating kibble
print(dog.make_sound())   # Buddy barks: Woof!
print(dog.fetch("ball"))  # Buddy fetches the ball

print(cat.make_sound())   # Whiskers meows: Meow!
print(cat.climb("tree"))  # Whiskers climbs the tree

# Check inheritance
print(isinstance(dog, Animal))  # True
print(isinstance(dog, Dog))     # True
print(issubclass(Dog, Animal))  # True
```

### Multiple Inheritance

```python
class Flyable:
    """Mixin for flying capability."""
    
    def fly(self):
        return f"{self.name} is flying"
    
    def land(self):
        return f"{self.name} has landed"

class Swimmable:
    """Mixin for swimming capability."""
    
    def swim(self):
        return f"{self.name} is swimming"
    
    def dive(self, depth):
        return f"{self.name} dives to {depth} meters"

class Bird(Animal, Flyable):
    """Bird class with flying capability."""
    
    def __init__(self, name, species, wingspan):
        Animal.__init__(self, name, species)
        self.wingspan = wingspan
    
    def make_sound(self):
        return f"{self.name} chirps"

class Duck(Bird, Swimmable):
    """Duck class that can fly and swim."""
    
    def __init__(self, name, wingspan):
        super().__init__(name, "Duck", wingspan)
    
    def make_sound(self):
        return f"{self.name} quacks"

# Usage
duck = Duck("Donald", 60)
print(duck.make_sound())  # Donald quacks
print(duck.fly())         # Donald is flying
print(duck.swim())        # Donald is swimming
print(duck.dive(5))       # Donald dives to 5 meters

# Method Resolution Order (MRO)
print(Duck.__mro__)
```

## Polymorphism

### Method Overriding and Polymorphism

```python
class Shape:
    """Base class for geometric shapes."""
    
    def __init__(self, name):
        self.name = name
    
    def area(self):
        raise NotImplementedError("Subclass must implement area method")
    
    def perimeter(self):
        raise NotImplementedError("Subclass must implement perimeter method")
    
    def describe(self):
        return f"This is a {self.name} with area {self.area():.2f}"

class Rectangle(Shape):
    """Rectangle implementation."""
    
    def __init__(self, width, height):
        super().__init__("Rectangle")
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

class Circle(Shape):
    """Circle implementation."""
    
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius
    
    def area(self):
        import math
        return math.pi * self.radius ** 2
    
    def perimeter(self):
        import math
        return 2 * math.pi * self.radius

class Triangle(Shape):
    """Triangle implementation."""
    
    def __init__(self, base, height, side1, side2, side3):
        super().__init__("Triangle")
        self.base = base
        self.height = height
        self.side1 = side1
        self.side2 = side2
        self.side3 = side3
    
    def area(self):
        return 0.5 * self.base * self.height
    
    def perimeter(self):
        return self.side1 + self.side2 + self.side3

# Polymorphism in action
shapes = [
    Rectangle(5, 3),
    Circle(4),
    Triangle(6, 4, 5, 5, 6)
]

for shape in shapes:
    print(shape.describe())
    print(f"Perimeter: {shape.perimeter():.2f}")
    print("-" * 30)

# Function that works with any shape
def calculate_total_area(shapes):
    """Calculate total area of all shapes."""
    return sum(shape.area() for shape in shapes)

total_area = calculate_total_area(shapes)
print(f"Total area: {total_area:.2f}")
```

## Abstract Base Classes

```python
from abc import ABC, abstractmethod

class DatabaseConnection(ABC):
    """Abstract base class for database connections."""
    
    def __init__(self, host, port, database):
        self.host = host
        self.port = port
        self.database = database
        self.is_connected = False
    
    @abstractmethod
    def connect(self):
        """Connect to the database."""
        pass
    
    @abstractmethod
    def disconnect(self):
        """Disconnect from the database."""
        pass
    
    @abstractmethod
    def execute_query(self, query):
        """Execute a database query."""
        pass
    
    def get_connection_info(self):
        """Get connection information."""
        return f"{self.host}:{self.port}/{self.database}"

class PostgreSQLConnection(DatabaseConnection):
    """PostgreSQL database connection implementation."""
    
    def connect(self):
        # Simulate connection logic
        self.is_connected = True
        return f"Connected to PostgreSQL at {self.get_connection_info()}"
    
    def disconnect(self):
        self.is_connected = False
        return "Disconnected from PostgreSQL"
    
    def execute_query(self, query):
        if not self.is_connected:
            raise ConnectionError("Not connected to database")
        return f"Executing PostgreSQL query: {query}"

class MySQLConnection(DatabaseConnection):
    """MySQL database connection implementation."""
    
    def connect(self):
        self.is_connected = True
        return f"Connected to MySQL at {self.get_connection_info()}"
    
    def disconnect(self):
        self.is_connected = False
        return "Disconnected from MySQL"
    
    def execute_query(self, query):
        if not self.is_connected:
            raise ConnectionError("Not connected to database")
        return f"Executing MySQL query: {query}"

# Usage
# db = DatabaseConnection("localhost", 5432, "mydb")  # TypeError: Can't instantiate abstract class

postgres_db = PostgreSQLConnection("localhost", 5432, "mydb")
mysql_db = MySQLConnection("localhost", 3306, "mydb")

print(postgres_db.connect())
print(postgres_db.execute_query("SELECT * FROM users"))
print(postgres_db.disconnect())
```

## Design Patterns

### Singleton Pattern

```python
class DatabaseManager:
    """Singleton database manager."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.connections = {}
            self.config = {}
            self._initialized = True
    
    def add_connection(self, name, connection):
        self.connections[name] = connection
    
    def get_connection(self, name):
        return self.connections.get(name)

# Usage
db_manager1 = DatabaseManager()
db_manager2 = DatabaseManager()

print(db_manager1 is db_manager2)  # True (same instance)
```

### Factory Pattern

```python
class ShapeFactory:
    """Factory for creating shapes."""
    
    @staticmethod
    def create_shape(shape_type, **kwargs):
        """Create a shape based on type."""
        if shape_type.lower() == "rectangle":
            return Rectangle(kwargs["width"], kwargs["height"])
        elif shape_type.lower() == "circle":
            return Circle(kwargs["radius"])
        elif shape_type.lower() == "triangle":
            return Triangle(
                kwargs["base"], kwargs["height"],
                kwargs["side1"], kwargs["side2"], kwargs["side3"]
            )
        else:
            raise ValueError(f"Unknown shape type: {shape_type}")

# Usage
rectangle = ShapeFactory.create_shape("rectangle", width=5, height=3)
circle = ShapeFactory.create_shape("circle", radius=4)

print(rectangle.describe())
print(circle.describe())
```

### Observer Pattern

```python
class Subject:
    """Subject in observer pattern."""
    
    def __init__(self):
        self._observers = []
        self._state = None
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def detach(self, observer):
        self._observers.remove(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update(self)
    
    def set_state(self, state):
        self._state = state
        self.notify()
    
    def get_state(self):
        return self._state

class Observer:
    """Observer interface."""
    
    def update(self, subject):
        raise NotImplementedError

class EmailNotifier(Observer):
    """Email notification observer."""
    
    def __init__(self, email):
        self.email = email
    
    def update(self, subject):
        print(f"Email sent to {self.email}: State changed to {subject.get_state()}")

class SMSNotifier(Observer):
    """SMS notification observer."""
    
    def __init__(self, phone):
        self.phone = phone
    
    def update(self, subject):
        print(f"SMS sent to {self.phone}: State changed to {subject.get_state()}")

# Usage
order_status = Subject()

email_notifier = EmailNotifier("customer@example.com")
sms_notifier = SMSNotifier("+1234567890")

order_status.attach(email_notifier)
order_status.attach(sms_notifier)

order_status.set_state("Processing")
order_status.set_state("Shipped")
order_status.set_state("Delivered")
```

## Advanced OOP Concepts

### Descriptors

```python
class ValidatedAttribute:
    """Descriptor for validated attributes."""
    
    def __init__(self, validator=None):
        self.validator = validator
        self.name = None
    
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        if self.validator:
            self.validator(value)
        obj.__dict__[self.name] = value

def positive_number(value):
    """Validator for positive numbers."""
    if not isinstance(value, (int, float)) or value <= 0:
        raise ValueError("Value must be a positive number")

def non_empty_string(value):
    """Validator for non-empty strings."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Value must be a non-empty string")

class Product:
    """Product with validated attributes."""
    
    name = ValidatedAttribute(non_empty_string)
    price = ValidatedAttribute(positive_number)
    quantity = ValidatedAttribute(positive_number)
    
    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.quantity = quantity

# Usage
product = Product("Laptop", 999.99, 10)
print(f"{product.name}: ${product.price}")

# This will raise ValueError
# product.price = -100
```

### Context Managers

```python
class DatabaseTransaction:
    """Context manager for database transactions."""
    
    def __init__(self, connection):
        self.connection = connection
        self.transaction = None
    
    def __enter__(self):
        print("Starting transaction")
        self.transaction = self.connection.begin_transaction()
        return self.transaction
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print("Committing transaction")
            self.transaction.commit()
        else:
            print(f"Rolling back transaction due to {exc_type.__name__}")
            self.transaction.rollback()
        return False  # Don't suppress exceptions

# Usage
class MockConnection:
    def begin_transaction(self):
        return MockTransaction()

class MockTransaction:
    def commit(self):
        print("Transaction committed")
    
    def rollback(self):
        print("Transaction rolled back")

connection = MockConnection()

# Successful transaction
with DatabaseTransaction(connection) as transaction:
    print("Performing database operations")

# Failed transaction
try:
    with DatabaseTransaction(connection) as transaction:
        print("Performing database operations")
        raise ValueError("Something went wrong")
except ValueError:
    print("Exception handled")
```

## Best Practices

1. **Use meaningful class names** - PascalCase for classes
2. **Follow the Single Responsibility Principle** - One class, one purpose
3. **Prefer composition over inheritance** - Use "has-a" instead of "is-a" when appropriate
4. **Use abstract base classes** - Define clear interfaces
5. **Implement `__str__` and `__repr__`** - For better debugging
6. **Use properties for validation** - Control attribute access
7. **Follow the DRY principle** - Don't repeat yourself
8. **Use type hints** - Improve code documentation and IDE support
9. **Write docstrings** - Document classes and methods
10. **Keep inheritance hierarchies shallow** - Avoid deep inheritance chains

Object-oriented programming in Python provides powerful tools for building scalable and maintainable backend applications. Understanding these concepts is essential for designing clean, modular code architectures.
