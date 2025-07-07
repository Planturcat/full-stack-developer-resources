# SOLID Principles

SOLID is an acronym for five design principles that make software designs more understandable, flexible, and maintainable. These principles form the foundation of good object-oriented design.

## Single Responsibility Principle (SRP)

A class should have only one reason to change, meaning it should have only one job or responsibility.

### Bad Example - Multiple Responsibilities

```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def save_to_database(self):
        # Database logic - responsibility 1
        print(f"Saving {self.name} to database")
    
    def send_email(self):
        # Email logic - responsibility 2
        print(f"Sending email to {self.email}")
    
    def validate_email(self):
        # Validation logic - responsibility 3
        return "@" in self.email
    
    def generate_report(self):
        # Reporting logic - responsibility 4
        return f"User Report: {self.name} ({self.email})"
```

### Good Example - Single Responsibility

```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class UserRepository:
    def save(self, user):
        print(f"Saving {user.name} to database")
    
    def find_by_email(self, email):
        print(f"Finding user by email: {email}")

class EmailService:
    def send_welcome_email(self, user):
        print(f"Sending welcome email to {user.email}")
    
    def send_notification(self, user, message):
        print(f"Sending notification to {user.email}: {message}")

class EmailValidator:
    @staticmethod
    def is_valid(email):
        return "@" in email and "." in email

class UserReportGenerator:
    def generate_user_report(self, user):
        return f"User Report: {user.name} ({user.email})"

# Usage
user = User("John Doe", "john@example.com")
repository = UserRepository()
email_service = EmailService()
validator = EmailValidator()
report_generator = UserReportGenerator()

if validator.is_valid(user.email):
    repository.save(user)
    email_service.send_welcome_email(user)
    report = report_generator.generate_user_report(user)
```

## Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification.

### Bad Example - Modifying Existing Code

```python
class DiscountCalculator:
    def calculate_discount(self, customer_type, amount):
        if customer_type == "regular":
            return amount * 0.05
        elif customer_type == "premium":
            return amount * 0.10
        elif customer_type == "vip":
            return amount * 0.15
        # Adding new customer type requires modifying this method
        elif customer_type == "corporate":
            return amount * 0.20
        else:
            return 0
```

### Good Example - Open for Extension

```python
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate_discount(self, amount):
        pass

class RegularCustomerDiscount(DiscountStrategy):
    def calculate_discount(self, amount):
        return amount * 0.05

class PremiumCustomerDiscount(DiscountStrategy):
    def calculate_discount(self, amount):
        return amount * 0.10

class VIPCustomerDiscount(DiscountStrategy):
    def calculate_discount(self, amount):
        return amount * 0.15

# New discount type - no modification of existing code
class CorporateCustomerDiscount(DiscountStrategy):
    def calculate_discount(self, amount):
        return amount * 0.20

class DiscountCalculator:
    def __init__(self, strategy: DiscountStrategy):
        self.strategy = strategy
    
    def calculate_discount(self, amount):
        return self.strategy.calculate_discount(amount)

# Usage
regular_calculator = DiscountCalculator(RegularCustomerDiscount())
premium_calculator = DiscountCalculator(PremiumCustomerDiscount())
corporate_calculator = DiscountCalculator(CorporateCustomerDiscount())

print(regular_calculator.calculate_discount(100))  # 5.0
print(premium_calculator.calculate_discount(100))  # 10.0
print(corporate_calculator.calculate_discount(100))  # 20.0
```

## Liskov Substitution Principle (LSP)

Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.

### Bad Example - Violating LSP

```python
class Bird:
    def fly(self):
        return "Flying high"

class Sparrow(Bird):
    def fly(self):
        return "Sparrow flying"

class Penguin(Bird):
    def fly(self):
        # Penguins can't fly - violates LSP
        raise Exception("Penguins can't fly!")

# This will break when penguin is used
def make_bird_fly(bird: Bird):
    return bird.fly()

sparrow = Sparrow()
penguin = Penguin()

print(make_bird_fly(sparrow))  # Works
# print(make_bird_fly(penguin))  # Throws exception!
```

### Good Example - Following LSP

```python
from abc import ABC, abstractmethod

class Bird(ABC):
    @abstractmethod
    def move(self):
        pass

class FlyingBird(Bird):
    @abstractmethod
    def fly(self):
        pass
    
    def move(self):
        return self.fly()

class SwimmingBird(Bird):
    @abstractmethod
    def swim(self):
        pass
    
    def move(self):
        return self.swim()

class Sparrow(FlyingBird):
    def fly(self):
        return "Sparrow flying through the air"

class Penguin(SwimmingBird):
    def swim(self):
        return "Penguin swimming in water"

# Now both can be used interchangeably
def make_bird_move(bird: Bird):
    return bird.move()

sparrow = Sparrow()
penguin = Penguin()

print(make_bird_move(sparrow))  # Sparrow flying through the air
print(make_bird_move(penguin))  # Penguin swimming in water
```

## Interface Segregation Principle (ISP)

Clients should not be forced to depend on interfaces they don't use.

### Bad Example - Fat Interface

```python
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self):
        pass
    
    @abstractmethod
    def eat(self):
        pass
    
    @abstractmethod
    def sleep(self):
        pass

class HumanWorker(Worker):
    def work(self):
        return "Human working"
    
    def eat(self):
        return "Human eating"
    
    def sleep(self):
        return "Human sleeping"

class RobotWorker(Worker):
    def work(self):
        return "Robot working"
    
    def eat(self):
        # Robots don't eat - forced to implement unused method
        raise NotImplementedError("Robots don't eat")
    
    def sleep(self):
        # Robots don't sleep - forced to implement unused method
        raise NotImplementedError("Robots don't sleep")
```

### Good Example - Segregated Interfaces

```python
from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self):
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self):
        pass

class Sleepable(ABC):
    @abstractmethod
    def sleep(self):
        pass

class HumanWorker(Workable, Eatable, Sleepable):
    def work(self):
        return "Human working"
    
    def eat(self):
        return "Human eating"
    
    def sleep(self):
        return "Human sleeping"

class RobotWorker(Workable):
    def work(self):
        return "Robot working"

# Usage
def manage_work(worker: Workable):
    return worker.work()

def manage_break(worker: Eatable):
    return worker.eat()

human = HumanWorker()
robot = RobotWorker()

print(manage_work(human))  # Human working
print(manage_work(robot))  # Robot working
print(manage_break(human))  # Human eating
# manage_break(robot) would cause a type error - which is good!
```

## Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules. Both should depend on abstractions.

### Bad Example - High-level depending on Low-level

```python
class MySQLDatabase:
    def save(self, data):
        print(f"Saving {data} to MySQL database")

class EmailService:
    def send_email(self, message):
        print(f"Sending email: {message}")

class UserService:
    def __init__(self):
        # Directly depending on concrete implementations
        self.database = MySQLDatabase()
        self.email_service = EmailService()
    
    def create_user(self, user_data):
        self.database.save(user_data)
        self.email_service.send_email("Welcome!")
        return "User created"
```

### Good Example - Depending on Abstractions

```python
from abc import ABC, abstractmethod

# Abstractions
class DatabaseInterface(ABC):
    @abstractmethod
    def save(self, data):
        pass

class EmailServiceInterface(ABC):
    @abstractmethod
    def send_email(self, message):
        pass

# Low-level modules implementing abstractions
class MySQLDatabase(DatabaseInterface):
    def save(self, data):
        print(f"Saving {data} to MySQL database")

class PostgreSQLDatabase(DatabaseInterface):
    def save(self, data):
        print(f"Saving {data} to PostgreSQL database")

class SMTPEmailService(EmailServiceInterface):
    def send_email(self, message):
        print(f"Sending email via SMTP: {message}")

class SendGridEmailService(EmailServiceInterface):
    def send_email(self, message):
        print(f"Sending email via SendGrid: {message}")

# High-level module depending on abstractions
class UserService:
    def __init__(self, database: DatabaseInterface, email_service: EmailServiceInterface):
        self.database = database
        self.email_service = email_service
    
    def create_user(self, user_data):
        self.database.save(user_data)
        self.email_service.send_email("Welcome!")
        return "User created"

# Dependency injection
mysql_db = MySQLDatabase()
smtp_email = SMTPEmailService()
user_service = UserService(mysql_db, smtp_email)

# Easy to switch implementations
postgres_db = PostgreSQLDatabase()
sendgrid_email = SendGridEmailService()
user_service_v2 = UserService(postgres_db, sendgrid_email)

print(user_service.create_user("John Doe"))
print(user_service_v2.create_user("Jane Smith"))
```

## Real-World Example: E-commerce Order System

```python
from abc import ABC, abstractmethod
from typing import List
from enum import Enum

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

# SRP: Each class has a single responsibility
class Order:
    def __init__(self, order_id: str, customer_id: str):
        self.order_id = order_id
        self.customer_id = customer_id
        self.items = []
        self.status = OrderStatus.PENDING
        self.total = 0.0

class OrderItem:
    def __init__(self, product_id: str, quantity: int, price: float):
        self.product_id = product_id
        self.quantity = quantity
        self.price = price

# ISP: Segregated interfaces
class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order):
        pass
    
    @abstractmethod
    def find_by_id(self, order_id: str) -> Order:
        pass

class NotificationService(ABC):
    @abstractmethod
    def send_notification(self, customer_id: str, message: str):
        pass

class PaymentProcessor(ABC):
    @abstractmethod
    def process_payment(self, amount: float, customer_id: str) -> bool:
        pass

# OCP: Open for extension, closed for modification
class OrderStatusHandler(ABC):
    @abstractmethod
    def handle(self, order: Order):
        pass

class PendingOrderHandler(OrderStatusHandler):
    def handle(self, order: Order):
        print(f"Processing pending order {order.order_id}")

class ConfirmedOrderHandler(OrderStatusHandler):
    def handle(self, order: Order):
        print(f"Confirming order {order.order_id}")

class ShippedOrderHandler(OrderStatusHandler):
    def handle(self, order: Order):
        print(f"Shipping order {order.order_id}")

# DIP: High-level module depending on abstractions
class OrderService:
    def __init__(self, 
                 repository: OrderRepository,
                 notification_service: NotificationService,
                 payment_processor: PaymentProcessor):
        self.repository = repository
        self.notification_service = notification_service
        self.payment_processor = payment_processor
        self.status_handlers = {
            OrderStatus.PENDING: PendingOrderHandler(),
            OrderStatus.CONFIRMED: ConfirmedOrderHandler(),
            OrderStatus.SHIPPED: ShippedOrderHandler()
        }
    
    def process_order(self, order: Order):
        # LSP: Can use any implementation of the interfaces
        if self.payment_processor.process_payment(order.total, order.customer_id):
            order.status = OrderStatus.CONFIRMED
            self.repository.save(order)
            self.notification_service.send_notification(
                order.customer_id, 
                f"Order {order.order_id} confirmed"
            )
            
            # Handle order status
            handler = self.status_handlers.get(order.status)
            if handler:
                handler.handle(order)
```

## Benefits of Following SOLID Principles

1. **Maintainability** - Code is easier to modify and extend
2. **Testability** - Classes with single responsibilities are easier to test
3. **Flexibility** - Easy to swap implementations
4. **Reusability** - Well-designed components can be reused
5. **Readability** - Code is more understandable and self-documenting

## Common Violations and How to Avoid Them

1. **God Classes** - Classes that do too much (violates SRP)
2. **Rigid Code** - Hard to extend without modification (violates OCP)
3. **Fragile Hierarchies** - Subclasses break parent contracts (violates LSP)
4. **Fat Interfaces** - Interfaces with too many methods (violates ISP)
5. **Tight Coupling** - Direct dependencies on concrete classes (violates DIP)

SOLID principles guide you toward writing better object-oriented code that is more maintainable, testable, and flexible. While it may seem like more work initially, following these principles pays dividends in the long run.
