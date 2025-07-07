# Python Syntax and Data Structures

Python's clean and readable syntax makes it an excellent choice for backend development. This guide covers Python fundamentals including syntax, built-in data structures, control flow, and functions.

## Basic Syntax

### Variables and Data Types

```python
# Variables (no declaration needed)
name = "John Doe"
age = 30
height = 5.9
is_active = True

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0

# Type checking
print(type(name))    # <class 'str'>
print(type(age))     # <class 'int'>
print(type(height))  # <class 'float'>
print(type(is_active))  # <class 'bool'>

# Type conversion
age_str = str(age)
height_int = int(height)
is_active_str = str(is_active)

# Constants (by convention, use uppercase)
PI = 3.14159
MAX_CONNECTIONS = 100
DATABASE_URL = "postgresql://localhost:5432/mydb"
```

### Strings

```python
# String creation
single_quote = 'Hello World'
double_quote = "Hello World"
triple_quote = """This is a
multi-line string"""

# String formatting
name = "Alice"
age = 25

# f-strings (Python 3.6+)
message = f"My name is {name} and I am {age} years old"

# .format() method
message = "My name is {} and I am {} years old".format(name, age)
message = "My name is {name} and I am {age} years old".format(name=name, age=age)

# % formatting (older style)
message = "My name is %s and I am %d years old" % (name, age)

# String methods
text = "  Hello World  "
print(text.strip())        # "Hello World"
print(text.lower())        # "  hello world  "
print(text.upper())        # "  HELLO WORLD  "
print(text.replace("World", "Python"))  # "  Hello Python  "
print(text.split())        # ['Hello', 'World']

# String slicing
text = "Python Programming"
print(text[0:6])    # "Python"
print(text[7:])     # "Programming"
print(text[:6])     # "Python"
print(text[-11:])   # "Programming"
print(text[::-1])   # "gnimmargorP nohtyP" (reverse)
```

### Numbers and Operations

```python
# Integer operations
a = 10
b = 3

print(a + b)    # 13 (addition)
print(a - b)    # 7 (subtraction)
print(a * b)    # 30 (multiplication)
print(a / b)    # 3.333... (division)
print(a // b)   # 3 (floor division)
print(a % b)    # 1 (modulus)
print(a ** b)   # 1000 (exponentiation)

# Float operations
x = 10.5
y = 2.5
print(x + y)    # 13.0
print(round(x / y, 2))  # 4.2

# Math module
import math

print(math.sqrt(16))    # 4.0
print(math.ceil(4.3))   # 5
print(math.floor(4.7))  # 4
print(math.pi)          # 3.141592653589793
```

## Data Structures

### Lists

```python
# List creation
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
empty_list = []

# List operations
fruits.append("grape")          # Add to end
fruits.insert(1, "kiwi")        # Insert at index
fruits.remove("banana")         # Remove by value
popped = fruits.pop()           # Remove and return last item
popped_index = fruits.pop(0)    # Remove and return item at index

# List methods
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()                  # Sort in place
print(numbers)                  # [1, 1, 2, 3, 4, 5, 6, 9]

sorted_numbers = sorted([3, 1, 4, 1, 5])  # Return new sorted list
numbers.reverse()               # Reverse in place
print(numbers.count(1))         # Count occurrences
print(numbers.index(4))         # Find index of value

# List slicing
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numbers[2:7])     # [2, 3, 4, 5, 6]
print(numbers[::2])     # [0, 2, 4, 6, 8] (every 2nd element)
print(numbers[::-1])    # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] (reverse)

# List comprehensions
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]
words = ["hello", "world", "python"]
lengths = [len(word) for word in words]
```

### Tuples

```python
# Tuple creation (immutable)
coordinates = (10, 20)
person = ("John", 30, "Engineer")
single_item = (42,)  # Note the comma for single item tuple

# Tuple unpacking
x, y = coordinates
name, age, job = person

# Tuple methods
numbers = (1, 2, 3, 2, 4, 2)
print(numbers.count(2))    # 3
print(numbers.index(3))    # 2

# Named tuples
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)    # 10 20

Person = namedtuple('Person', ['name', 'age', 'email'])
john = Person('John Doe', 30, 'john@example.com')
print(john.name)   # John Doe
```

### Dictionaries

```python
# Dictionary creation
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}

# Alternative creation methods
person2 = dict(name="Bob", age=30, city="Boston")
person3 = dict([("name", "Charlie"), ("age", 35)])

# Dictionary operations
person["email"] = "alice@example.com"  # Add/update
age = person["age"]                    # Access value
age = person.get("age", 0)            # Safe access with default
del person["city"]                     # Delete key

# Dictionary methods
keys = person.keys()        # dict_keys(['name', 'age', 'email'])
values = person.values()    # dict_values(['Alice', 25, 'alice@example.com'])
items = person.items()      # dict_items([('name', 'Alice'), ('age', 25), ('email', 'alice@example.com')])

# Dictionary comprehensions
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

filtered_dict = {k: v for k, v in person.items() if isinstance(v, str)}

# Nested dictionaries
users = {
    "user1": {"name": "Alice", "age": 25},
    "user2": {"name": "Bob", "age": 30}
}
print(users["user1"]["name"])  # Alice
```

### Sets

```python
# Set creation (unique elements)
fruits = {"apple", "banana", "orange"}
numbers = {1, 2, 3, 4, 5}
empty_set = set()  # Note: {} creates an empty dict, not set

# Set operations
fruits.add("grape")         # Add element
fruits.remove("banana")     # Remove element (raises error if not found)
fruits.discard("kiwi")      # Remove element (no error if not found)

# Set operations
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}

union = set1 | set2         # {1, 2, 3, 4, 5, 6}
intersection = set1 & set2  # {3, 4}
difference = set1 - set2    # {1, 2}
symmetric_diff = set1 ^ set2  # {1, 2, 5, 6}

# Set methods
print(set1.issubset(set2))      # False
print(set1.issuperset({1, 2}))  # True
print(set1.isdisjoint({7, 8}))  # True

# Set comprehensions
even_squares = {x**2 for x in range(10) if x % 2 == 0}
```

## Control Flow

### Conditional Statements

```python
# Basic if-elif-else
age = 18

if age < 13:
    category = "child"
elif age < 20:
    category = "teenager"
elif age < 60:
    category = "adult"
else:
    category = "senior"

# Ternary operator
status = "adult" if age >= 18 else "minor"

# Multiple conditions
score = 85
grade = 'A' if score >= 90 else 'B' if score >= 80 else 'C' if score >= 70 else 'F'

# Checking membership
fruits = ["apple", "banana", "orange"]
if "apple" in fruits:
    print("Apple is available")

# Checking truthiness
data = [1, 2, 3]
if data:  # Non-empty list is truthy
    print("Data is available")

# Checking for None
value = None
if value is None:
    print("Value is None")
```

### Loops

```python
# For loops
fruits = ["apple", "banana", "orange"]

# Iterate over items
for fruit in fruits:
    print(fruit)

# Iterate with index
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# Iterate over range
for i in range(5):          # 0 to 4
    print(i)

for i in range(2, 8):       # 2 to 7
    print(i)

for i in range(0, 10, 2):   # 0, 2, 4, 6, 8
    print(i)

# Iterate over dictionary
person = {"name": "Alice", "age": 25, "city": "NYC"}

for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# While loops
count = 0
while count < 5:
    print(count)
    count += 1

# Loop control
for i in range(10):
    if i == 3:
        continue  # Skip this iteration
    if i == 7:
        break     # Exit loop
    print(i)

# Else clause with loops
for i in range(5):
    print(i)
else:
    print("Loop completed normally")  # Executes if no break
```

## Functions

### Basic Functions

```python
# Function definition
def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

# Function call
message = greet("Alice")
print(message)

# Function with multiple parameters
def add_numbers(a, b):
    """Add two numbers and return the result."""
    return a + b

result = add_numbers(5, 3)

# Default parameters
def greet_with_title(name, title="Mr."):
    return f"Hello, {title} {name}!"

print(greet_with_title("Smith"))           # Hello, Mr. Smith!
print(greet_with_title("Johnson", "Dr."))  # Hello, Dr. Johnson!

# Keyword arguments
def create_user(name, age, email, active=True):
    return {
        "name": name,
        "age": age,
        "email": email,
        "active": active
    }

user = create_user(name="Alice", email="alice@example.com", age=25)
```

### Advanced Function Features

```python
# Variable arguments (*args)
def sum_all(*numbers):
    """Sum all provided numbers."""
    return sum(numbers)

print(sum_all(1, 2, 3, 4, 5))  # 15

# Keyword arguments (**kwargs)
def create_config(**settings):
    """Create configuration dictionary."""
    return settings

config = create_config(debug=True, port=8000, host="localhost")

# Combining *args and **kwargs
def flexible_function(*args, **kwargs):
    print("Positional arguments:", args)
    print("Keyword arguments:", kwargs)

flexible_function(1, 2, 3, name="Alice", age=25)

# Lambda functions
square = lambda x: x**2
print(square(5))  # 25

# Lambda with multiple arguments
add = lambda x, y: x + y
print(add(3, 4))  # 7

# Using lambda with built-in functions
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))

# Function as first-class objects
def multiply_by_two(x):
    return x * 2

def apply_function(func, value):
    return func(value)

result = apply_function(multiply_by_two, 5)  # 10
```

### Decorators

```python
# Basic decorator
def my_decorator(func):
    def wrapper():
        print("Before function call")
        result = func()
        print("After function call")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()

# Decorator with arguments
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # Prints 3 times

# Built-in decorators
class Calculator:
    @staticmethod
    def add(x, y):
        return x + y
    
    @classmethod
    def from_string(cls, calculation):
        # Parse string and create instance
        pass
    
    @property
    def version(self):
        return "1.0"
```

## Error Handling

```python
# Basic try-except
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")

# Multiple exceptions
try:
    value = int(input("Enter a number: "))
    result = 10 / value
except ValueError:
    print("Invalid number format!")
except ZeroDivisionError:
    print("Cannot divide by zero!")

# Catching multiple exceptions
try:
    # Some risky operation
    pass
except (ValueError, TypeError) as e:
    print(f"Error occurred: {e}")

# Finally block
try:
    file = open("data.txt", "r")
    data = file.read()
except FileNotFoundError:
    print("File not found!")
finally:
    if 'file' in locals():
        file.close()

# Raising exceptions
def validate_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age > 150:
        raise ValueError("Age seems unrealistic")
    return age

# Custom exceptions
class CustomError(Exception):
    """Custom exception class."""
    pass

def risky_operation():
    raise CustomError("Something went wrong!")

try:
    risky_operation()
except CustomError as e:
    print(f"Custom error: {e}")
```

## File Operations

```python
# Reading files
# Method 1: Manual file handling
file = open("data.txt", "r")
content = file.read()
file.close()

# Method 2: Using with statement (recommended)
with open("data.txt", "r") as file:
    content = file.read()

# Reading line by line
with open("data.txt", "r") as file:
    for line in file:
        print(line.strip())

# Writing files
with open("output.txt", "w") as file:
    file.write("Hello, World!\n")
    file.write("This is a new line.\n")

# Appending to files
with open("output.txt", "a") as file:
    file.write("This line is appended.\n")

# Working with JSON
import json

# Writing JSON
data = {"name": "Alice", "age": 25, "city": "NYC"}
with open("data.json", "w") as file:
    json.dump(data, file, indent=2)

# Reading JSON
with open("data.json", "r") as file:
    loaded_data = json.load(file)
    print(loaded_data)
```

## Decorators

### Basic Decorators

```python
# Simple decorator
def my_decorator(func):
    def wrapper():
        print("Before function call")
        result = func()
        print("After function call")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Output:
# Before function call
# Hello!
# After function call

# Decorator with arguments
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # Prints 3 times

# Decorator with functools.wraps
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)
    return "Done"

# Class-based decorators
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} of {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def add(a, b):
    return a + b

# Property decorators
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

    @staticmethod
    def from_diameter(diameter):
        return Circle(diameter / 2)

    @classmethod
    def unit_circle(cls):
        return cls(1)
```

### Advanced Decorators

```python
# Decorator factory with parameters
def validate_types(**expected_types):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get function signature
            import inspect
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()

            # Validate types
            for param_name, expected_type in expected_types.items():
                if param_name in bound_args.arguments:
                    value = bound_args.arguments[param_name]
                    if not isinstance(value, expected_type):
                        raise TypeError(
                            f"{param_name} must be {expected_type.__name__}, "
                            f"got {type(value).__name__}"
                        )

            return func(*args, **kwargs)
        return wrapper
    return decorator

@validate_types(name=str, age=int, email=str)
def create_user(name, age, email):
    return {"name": name, "age": age, "email": email}

# Caching decorator
def memoize(func):
    cache = {}

    @wraps(func)
    def wrapper(*args, **kwargs):
        # Create cache key
        key = str(args) + str(sorted(kwargs.items()))

        if key not in cache:
            cache[key] = func(*args, **kwargs)

        return cache[key]

    wrapper.cache = cache
    wrapper.cache_clear = lambda: cache.clear()
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Rate limiting decorator
import time
from collections import defaultdict

def rate_limit(max_calls, time_window):
    calls = defaultdict(list)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            func_calls = calls[func.__name__]

            # Remove old calls outside time window
            calls[func.__name__] = [call_time for call_time in func_calls
                                  if now - call_time < time_window]

            if len(calls[func.__name__]) >= max_calls:
                raise Exception(f"Rate limit exceeded for {func.__name__}")

            calls[func.__name__].append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_calls=5, time_window=60)  # 5 calls per minute
def api_call():
    return "API response"
```

## Generators

### Basic Generators

```python
# Generator function
def count_up_to(max_count):
    count = 1
    while count <= max_count:
        yield count
        count += 1

# Using generator
counter = count_up_to(5)
for num in counter:
    print(num)  # Prints 1, 2, 3, 4, 5

# Generator expressions
squares = (x**2 for x in range(10))
even_squares = (x**2 for x in range(10) if x % 2 == 0)

# Converting to list
print(list(squares))  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Fibonacci generator
def fibonacci_generator():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Use with itertools.islice for finite sequence
import itertools
fib_sequence = list(itertools.islice(fibonacci_generator(), 10))
print(fib_sequence)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# File reading generator
def read_large_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()

# Memory-efficient file processing
def process_log_file(file_path):
    for line in read_large_file(file_path):
        if 'ERROR' in line:
            yield line

# Generator with send() method
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is not None:
            total += value

acc = accumulator()
next(acc)  # Prime the generator
print(acc.send(10))  # 10
print(acc.send(5))   # 15
print(acc.send(3))   # 18
```

### Advanced Generator Patterns

```python
# Generator pipeline
def read_numbers(filename):
    with open(filename, 'r') as f:
        for line in f:
            yield int(line.strip())

def square_numbers(numbers):
    for num in numbers:
        yield num ** 2

def filter_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            yield num

# Pipeline usage
def process_numbers(filename):
    numbers = read_numbers(filename)
    squared = square_numbers(numbers)
    even_squared = filter_even(squared)
    return list(even_squared)

# Generator with exception handling
def safe_divide_generator(numbers, divisor):
    for num in numbers:
        try:
            yield num / divisor
        except ZeroDivisionError:
            yield float('inf')

# Coroutine pattern
def grep_coroutine(pattern):
    print(f"Looking for pattern: {pattern}")
    try:
        while True:
            line = yield
            if pattern in line:
                print(f"Found: {line}")
    except GeneratorExit:
        print("Coroutine closing")

# Using coroutine
grep = grep_coroutine("error")
next(grep)  # Prime the coroutine
grep.send("This is an error message")
grep.send("This is a normal message")
grep.send("Another error occurred")
grep.close()

# Generator delegation with yield from
def inner_generator():
    yield 1
    yield 2
    yield 3

def outer_generator():
    yield 'start'
    yield from inner_generator()  # Delegate to inner generator
    yield 'end'

print(list(outer_generator()))  # ['start', 1, 2, 3, 'end']

# Tree traversal generator
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def inorder_traversal(node):
    if node:
        yield from inorder_traversal(node.left)
        yield node.value
        yield from inorder_traversal(node.right)

# Create tree and traverse
root = TreeNode(1, TreeNode(2), TreeNode(3, TreeNode(4), TreeNode(5)))
print(list(inorder_traversal(root)))  # [2, 1, 4, 3, 5]
```

## Context Managers

### Basic Context Managers

```python
# Using built-in context managers
with open('file.txt', 'r') as f:
    content = f.read()
# File is automatically closed

# Multiple context managers
with open('input.txt', 'r') as infile, open('output.txt', 'w') as outfile:
    data = infile.read()
    outfile.write(data.upper())

# Custom context manager using class
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        print(f"Opening file {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"Closing file {self.filename}")
        if self.file:
            self.file.close()

        # Handle exceptions
        if exc_type is not None:
            print(f"Exception occurred: {exc_value}")

        # Return False to propagate exception, True to suppress
        return False

# Usage
with FileManager('test.txt', 'w') as f:
    f.write("Hello, World!")

# Context manager using contextlib
from contextlib import contextmanager

@contextmanager
def timer_context():
    import time
    start = time.time()
    print("Timer started")
    try:
        yield start
    finally:
        end = time.time()
        print(f"Timer ended. Elapsed: {end - start:.4f} seconds")

# Usage
with timer_context() as start_time:
    import time
    time.sleep(1)
    print(f"Started at: {start_time}")

# Database transaction context manager
@contextmanager
def database_transaction(connection):
    transaction = connection.begin()
    try:
        yield connection
        transaction.commit()
        print("Transaction committed")
    except Exception as e:
        transaction.rollback()
        print(f"Transaction rolled back: {e}")
        raise

# Temporary directory context manager
import tempfile
import shutil
import os

@contextmanager
def temporary_directory():
    temp_dir = tempfile.mkdtemp()
    try:
        yield temp_dir
    finally:
        shutil.rmtree(temp_dir)

# Usage
with temporary_directory() as temp_dir:
    temp_file = os.path.join(temp_dir, 'temp.txt')
    with open(temp_file, 'w') as f:
        f.write("Temporary content")
    print(f"Created temporary file: {temp_file}")
# Directory is automatically cleaned up
```

### Advanced Context Manager Patterns

```python
# Reentrant context manager
import threading
from contextlib import contextmanager

class ReentrantLock:
    def __init__(self):
        self._lock = threading.RLock()
        self._count = 0

    def __enter__(self):
        self._lock.acquire()
        self._count += 1
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self._count -= 1
        self._lock.release()

# Suppressing exceptions
from contextlib import suppress

# Instead of try-except
with suppress(FileNotFoundError):
    os.remove('nonexistent_file.txt')

# Redirecting stdout
from contextlib import redirect_stdout
import io

output_buffer = io.StringIO()
with redirect_stdout(output_buffer):
    print("This goes to the buffer")
    print("So does this")

captured_output = output_buffer.getvalue()
print(f"Captured: {captured_output}")

# Chaining context managers
from contextlib import ExitStack

def process_files(filenames):
    with ExitStack() as stack:
        files = [stack.enter_context(open(fname)) for fname in filenames]

        # Process all files
        for f in files:
            print(f"Processing {f.name}")
            # Do something with file

# Resource pool context manager
class ConnectionPool:
    def __init__(self, max_connections=10):
        self.max_connections = max_connections
        self.pool = []
        self.in_use = set()

    def get_connection(self):
        if self.pool:
            conn = self.pool.pop()
        else:
            conn = self._create_connection()

        self.in_use.add(conn)
        return conn

    def return_connection(self, conn):
        if conn in self.in_use:
            self.in_use.remove(conn)
            if len(self.pool) < self.max_connections:
                self.pool.append(conn)
            else:
                self._close_connection(conn)

    @contextmanager
    def connection(self):
        conn = self.get_connection()
        try:
            yield conn
        finally:
            self.return_connection(conn)

    def _create_connection(self):
        # Create actual connection
        return f"Connection-{len(self.in_use) + len(self.pool)}"

    def _close_connection(self, conn):
        # Close actual connection
        pass

# Usage
pool = ConnectionPool()
with pool.connection() as conn:
    print(f"Using {conn}")
```

## Best Practices

1. **Use meaningful variable names** - `user_count` instead of `uc`
2. **Follow PEP 8** - Python style guide for consistent code
3. **Use list comprehensions** - More Pythonic than traditional loops
4. **Handle exceptions properly** - Don't use bare `except:` clauses
5. **Use `with` statements** - For proper resource management
6. **Write docstrings** - Document your functions and classes
7. **Use type hints** - Improve code readability and IDE support
8. **Keep functions small** - Single responsibility principle
9. **Use built-in functions** - `sum()`, `max()`, `min()`, etc.
10. **Avoid global variables** - Use function parameters and return values
11. **Use decorators wisely** - For cross-cutting concerns like logging, timing
12. **Leverage generators** - For memory-efficient iteration over large datasets
13. **Use context managers** - For proper resource management and cleanup
14. **Cache expensive operations** - Use `@lru_cache` or custom memoization
15. **Prefer composition over inheritance** - Use mixins and decorators

Understanding Python syntax and data structures is fundamental for backend development. These concepts form the foundation for building web applications, APIs, and complex systems.
