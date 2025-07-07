"""
Python Decorators Examples
Comprehensive examples of decorators in Python
"""

import time
import functools
from datetime import datetime
from typing import Callable, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. Basic Decorator
def my_decorator(func):
    """Basic decorator that wraps a function"""
    def wrapper(*args, **kwargs):
        print(f"Before calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"After calling {func.__name__}")
        return result
    return wrapper

@my_decorator
def say_hello(name):
    print(f"Hello, {name}!")

# Usage
say_hello("Alice")

# 2. Decorator with functools.wraps (preserves metadata)
def better_decorator(func):
    """Decorator that preserves function metadata"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@better_decorator
def greet(name):
    """Greets a person by name"""
    return f"Hello, {name}!"

print(greet.__name__)  # greet (preserved)
print(greet.__doc__)   # Greets a person by name (preserved)

# 3. Timing Decorator
def timer(func):
    """Decorator to measure function execution time"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"{func.__name__} took {execution_time:.4f} seconds to execute")
        return result
    return wrapper

@timer
def slow_function():
    """A function that takes some time to execute"""
    time.sleep(1)
    return "Done!"

result = slow_function()

# 4. Decorator with Arguments
def repeat(times):
    """Decorator that repeats function execution"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")

say_hi()  # Prints "Hi!" three times

# 5. Retry Decorator
def retry(max_attempts=3, delay=1):
    """Decorator that retries function execution on failure"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay} seconds...")
                        time.sleep(delay)
                    else:
                        print(f"All {max_attempts} attempts failed.")
            
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def unreliable_function():
    """Function that fails randomly"""
    import random
    if random.random() < 0.7:  # 70% chance of failure
        raise Exception("Random failure!")
    return "Success!"

# 6. Logging Decorator
def log_calls(level=logging.INFO):
    """Decorator that logs function calls"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            args_str = ', '.join(map(str, args))
            kwargs_str = ', '.join(f"{k}={v}" for k, v in kwargs.items())
            all_args = ', '.join(filter(None, [args_str, kwargs_str]))
            
            logger.log(level, f"Calling {func.__name__}({all_args})")
            
            try:
                result = func(*args, **kwargs)
                logger.log(level, f"{func.__name__} returned: {result}")
                return result
            except Exception as e:
                logger.error(f"{func.__name__} raised {type(e).__name__}: {e}")
                raise
        return wrapper
    return decorator

@log_calls(logging.INFO)
def calculate_area(length, width):
    """Calculate rectangle area"""
    return length * width

area = calculate_area(5, 3)

# 7. Validation Decorator
def validate_types(**expected_types):
    """Decorator that validates function argument types"""
    def decorator(func):
        @functools.wraps(func)
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
    """Create a user with validated inputs"""
    return {"name": name, "age": age, "email": email}

user = create_user("John", 30, "john@example.com")
# create_user("John", "thirty", "john@example.com")  # Would raise TypeError

# 8. Caching/Memoization Decorator
def memoize(func):
    """Decorator that caches function results"""
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Create cache key
        key = str(args) + str(sorted(kwargs.items()))
        
        if key not in cache:
            print(f"Computing {func.__name__}{args}")
            cache[key] = func(*args, **kwargs)
        else:
            print(f"Cache hit for {func.__name__}{args}")
        
        return cache[key]
    
    # Add cache management methods
    wrapper.cache = cache
    wrapper.cache_clear = lambda: cache.clear()
    wrapper.cache_info = lambda: {"size": len(cache), "keys": list(cache.keys())}
    
    return wrapper

@memoize
def fibonacci(n):
    """Calculate fibonacci number (expensive recursive version)"""
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # Computed
print(fibonacci(10))  # Cache hit
print(fibonacci.cache_info())

# 9. Rate Limiting Decorator
def rate_limit(max_calls, time_window):
    """Decorator that limits function call rate"""
    calls = []
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            
            # Remove old calls outside time window
            calls[:] = [call_time for call_time in calls if now - call_time < time_window]
            
            if len(calls) >= max_calls:
                raise Exception(f"Rate limit exceeded: {max_calls} calls per {time_window} seconds")
            
            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_calls=3, time_window=10)  # 3 calls per 10 seconds
def api_call():
    """Simulated API call"""
    return "API response"

# 10. Class-based Decorator
class CountCalls:
    """Class-based decorator that counts function calls"""
    
    def __init__(self, func):
        self.func = func
        self.count = 0
        functools.update_wrapper(self, func)
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} of {self.func.__name__}")
        return self.func(*args, **kwargs)
    
    def reset_count(self):
        self.count = 0
    
    def get_count(self):
        return self.count

@CountCalls
def add_numbers(a, b):
    """Add two numbers"""
    return a + b

result1 = add_numbers(2, 3)  # Call 1
result2 = add_numbers(4, 5)  # Call 2
print(f"Total calls: {add_numbers.get_count()}")

# 11. Property Decorators
class Circle:
    """Example of property decorators"""
    
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        """Get the radius"""
        return self._radius
    
    @radius.setter
    def radius(self, value):
        """Set the radius with validation"""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
    
    @property
    def area(self):
        """Calculate area (read-only property)"""
        import math
        return math.pi * self._radius ** 2
    
    @property
    def circumference(self):
        """Calculate circumference (read-only property)"""
        import math
        return 2 * math.pi * self._radius
    
    @staticmethod
    def from_diameter(diameter):
        """Create circle from diameter"""
        return Circle(diameter / 2)
    
    @classmethod
    def unit_circle(cls):
        """Create unit circle"""
        return cls(1)

# Usage
circle = Circle(5)
print(f"Radius: {circle.radius}")
print(f"Area: {circle.area:.2f}")
print(f"Circumference: {circle.circumference:.2f}")

# 12. Context Manager Decorator
from contextlib import contextmanager

@contextmanager
def timer_context():
    """Context manager for timing code blocks"""
    start = time.time()
    print("Timer started")
    try:
        yield start
    finally:
        end = time.time()
        print(f"Timer ended. Elapsed: {end - start:.4f} seconds")

# Usage
with timer_context():
    time.sleep(0.5)
    print("Doing some work...")

# 13. Decorator Factory for Different Behaviors
def conditional_decorator(condition):
    """Apply decorator only if condition is True"""
    def decorator(func):
        if condition:
            return timer(func)  # Apply timer decorator
        else:
            return func  # Return function unchanged
    return decorator

DEBUG = True

@conditional_decorator(DEBUG)
def debug_function():
    """Function that's only timed in debug mode"""
    time.sleep(0.1)
    return "Debug result"

result = debug_function()

# 14. Multiple Decorators
@timer
@log_calls()
@validate_types(x=int, y=int)
def multiply(x, y):
    """Multiply two numbers with multiple decorators"""
    return x * y

result = multiply(4, 5)

# 15. Decorator with State
def stateful_decorator():
    """Decorator that maintains state across calls"""
    state = {"calls": 0, "total_time": 0}
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            
            state["calls"] += 1
            state["total_time"] += (end_time - start_time)
            
            print(f"Call #{state['calls']}, "
                  f"Average time: {state['total_time']/state['calls']:.4f}s")
            
            return result
        
        wrapper.get_stats = lambda: state.copy()
        wrapper.reset_stats = lambda: state.update({"calls": 0, "total_time": 0})
        
        return wrapper
    return decorator

@stateful_decorator()
def process_data(data):
    """Process some data"""
    time.sleep(0.1)  # Simulate processing
    return len(data)

# Multiple calls to see statistics
process_data([1, 2, 3])
process_data([4, 5, 6, 7])
process_data([8, 9])
print("Final stats:", process_data.get_stats())

if __name__ == "__main__":
    print("All decorator examples completed!")
