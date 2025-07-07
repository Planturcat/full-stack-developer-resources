# Core Java Concepts

Java is a statically-typed, object-oriented programming language that provides a robust foundation for backend development. This guide covers essential Java concepts including syntax, OOP principles, collections, and concurrency.

## Basic Syntax and Data Types

### Variables and Data Types

```java
public class BasicSyntax {
    public static void main(String[] args) {
        // Primitive data types
        byte byteValue = 127;
        short shortValue = 32767;
        int intValue = 2147483647;
        long longValue = 9223372036854775807L;
        
        float floatValue = 3.14f;
        double doubleValue = 3.14159265359;
        
        char charValue = 'A';
        boolean booleanValue = true;
        
        // Reference types
        String stringValue = "Hello, Java!";
        Integer integerObject = 42;
        
        // Constants
        final double PI = 3.14159;
        static final String COMPANY_NAME = "TechCorp";
        
        // Type conversion
        int num = 100;
        double decimal = num; // Implicit conversion (widening)
        int converted = (int) decimal; // Explicit conversion (narrowing)
        
        // String operations
        String firstName = "John";
        String lastName = "Doe";
        String fullName = firstName + " " + lastName;
        String formatted = String.format("Name: %s, Age: %d", fullName, 30);
        
        System.out.println(formatted);
    }
}
```

### Control Flow Statements

```java
public class ControlFlow {
    public static void demonstrateControlFlow() {
        // If-else statements
        int score = 85;
        String grade;
        
        if (score >= 90) {
            grade = "A";
        } else if (score >= 80) {
            grade = "B";
        } else if (score >= 70) {
            grade = "C";
        } else {
            grade = "F";
        }
        
        // Switch statement (Java 14+ enhanced)
        String dayType = switch (grade) {
            case "A", "B" -> "Excellent";
            case "C" -> "Good";
            case "D" -> "Average";
            default -> "Needs Improvement";
        };
        
        // For loops
        for (int i = 0; i < 10; i++) {
            System.out.println("Count: " + i);
        }
        
        // Enhanced for loop
        int[] numbers = {1, 2, 3, 4, 5};
        for (int number : numbers) {
            System.out.println("Number: " + number);
        }
        
        // While loop
        int count = 0;
        while (count < 5) {
            System.out.println("While count: " + count);
            count++;
        }
        
        // Do-while loop
        int doCount = 0;
        do {
            System.out.println("Do-while count: " + doCount);
            doCount++;
        } while (doCount < 3);
    }
}
```

## Object-Oriented Programming

### Classes and Objects

```java
public class User {
    // Instance variables (fields)
    private String username;
    private String email;
    private int age;
    private boolean active;
    
    // Static variable (class variable)
    private static int userCount = 0;
    
    // Constructors
    public User() {
        this("unknown", "unknown@example.com", 0);
    }
    
    public User(String username, String email, int age) {
        this.username = username;
        this.email = email;
        this.age = age;
        this.active = true;
        userCount++;
    }
    
    // Getter methods
    public String getUsername() {
        return username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public int getAge() {
        return age;
    }
    
    public boolean isActive() {
        return active;
    }
    
    // Setter methods
    public void setUsername(String username) {
        if (username != null && !username.trim().isEmpty()) {
            this.username = username;
        }
    }
    
    public void setEmail(String email) {
        if (isValidEmail(email)) {
            this.email = email;
        }
    }
    
    public void setAge(int age) {
        if (age >= 0 && age <= 150) {
            this.age = age;
        }
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    // Instance methods
    public void activate() {
        this.active = true;
    }
    
    public void deactivate() {
        this.active = false;
    }
    
    public String getDisplayName() {
        return username + " (" + email + ")";
    }
    
    // Static method
    public static int getUserCount() {
        return userCount;
    }
    
    // Private helper method
    private boolean isValidEmail(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }
    
    // Override Object methods
    @Override
    public String toString() {
        return String.format("User{username='%s', email='%s', age=%d, active=%s}", 
                           username, email, age, active);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return Objects.equals(username, user.username) && 
               Objects.equals(email, user.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(username, email);
    }
}
```

### Inheritance and Polymorphism

```java
// Base class
public abstract class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // Abstract method (must be implemented by subclasses)
    public abstract void makeSound();
    
    // Concrete method (can be overridden)
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
    
    // Final method (cannot be overridden)
    public final void breathe() {
        System.out.println(name + " is breathing");
    }
    
    // Getters
    public String getName() { return name; }
    public int getAge() { return age; }
}

// Subclass
public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, int age, String breed) {
        super(name, age); // Call parent constructor
        this.breed = breed;
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + " barks: Woof!");
    }
    
    @Override
    public void sleep() {
        System.out.println(name + " the dog is sleeping in a dog bed");
    }
    
    // Dog-specific method
    public void fetch() {
        System.out.println(name + " is fetching the ball");
    }
    
    public String getBreed() { return breed; }
}

public class Cat extends Animal {
    private boolean indoor;
    
    public Cat(String name, int age, boolean indoor) {
        super(name, age);
        this.indoor = indoor;
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + " meows: Meow!");
    }
    
    public void climb() {
        System.out.println(name + " is climbing");
    }
    
    public boolean isIndoor() { return indoor; }
}

// Interface
public interface Flyable {
    void fly();
    default void land() {
        System.out.println("Landing safely");
    }
}

public class Bird extends Animal implements Flyable {
    private double wingspan;
    
    public Bird(String name, int age, double wingspan) {
        super(name, age);
        this.wingspan = wingspan;
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + " chirps");
    }
    
    @Override
    public void fly() {
        System.out.println(name + " is flying with wingspan " + wingspan + " meters");
    }
    
    public double getWingspan() { return wingspan; }
}

// Polymorphism demonstration
public class AnimalDemo {
    public static void main(String[] args) {
        Animal[] animals = {
            new Dog("Buddy", 3, "Golden Retriever"),
            new Cat("Whiskers", 2, true),
            new Bird("Eagle", 5, 2.5)
        };
        
        // Polymorphic method calls
        for (Animal animal : animals) {
            animal.makeSound(); // Calls overridden method
            animal.sleep();     // May call overridden method
            animal.breathe();   // Calls final method from base class
            
            // Type checking and casting
            if (animal instanceof Dog) {
                Dog dog = (Dog) animal;
                dog.fetch();
            } else if (animal instanceof Flyable) {
                Flyable flyable = (Flyable) animal;
                flyable.fly();
            }
        }
    }
}
```

## Collections Framework

### Lists, Sets, and Maps

```java
import java.util.*;
import java.util.stream.Collectors;

public class CollectionsDemo {
    public static void demonstrateCollections() {
        // Lists - Ordered, allows duplicates
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Apple");
        arrayList.add("Banana");
        arrayList.add("Apple"); // Duplicate allowed
        
        List<String> linkedList = new LinkedList<>();
        linkedList.addAll(arrayList);
        
        // Sets - No duplicates
        Set<String> hashSet = new HashSet<>();
        hashSet.add("Red");
        hashSet.add("Green");
        hashSet.add("Blue");
        hashSet.add("Red"); // Duplicate ignored
        
        Set<String> treeSet = new TreeSet<>(); // Sorted set
        treeSet.addAll(hashSet);
        
        // Maps - Key-value pairs
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("Alice", 25);
        hashMap.put("Bob", 30);
        hashMap.put("Charlie", 35);
        
        Map<String, Integer> treeMap = new TreeMap<>(); // Sorted by keys
        treeMap.putAll(hashMap);
        
        // Iteration examples
        System.out.println("ArrayList iteration:");
        for (String fruit : arrayList) {
            System.out.println(fruit);
        }
        
        System.out.println("\nHashMap iteration:");
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // Stream operations (Java 8+)
        List<String> filteredFruits = arrayList.stream()
            .filter(fruit -> fruit.startsWith("A"))
            .collect(Collectors.toList());
        
        Map<String, Integer> adults = hashMap.entrySet().stream()
            .filter(entry -> entry.getValue() >= 30)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue
            ));
    }
}
```

### Generic Collections

```java
// Generic class
public class Container<T> {
    private T item;
    
    public Container(T item) {
        this.item = item;
    }
    
    public T getItem() {
        return item;
    }
    
    public void setItem(T item) {
        this.item = item;
    }
    
    public <U> void printWithType(U value) {
        System.out.println("Item: " + item + ", Value: " + value);
    }
}

// Generic interface
public interface Repository<T, ID> {
    void save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
}

// Implementation
public class UserRepository implements Repository<User, Long> {
    private Map<Long, User> users = new HashMap<>();
    private Long nextId = 1L;
    
    @Override
    public void save(User user) {
        users.put(nextId++, user);
    }
    
    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }
    
    @Override
    public List<User> findAll() {
        return new ArrayList<>(users.values());
    }
    
    @Override
    public void deleteById(Long id) {
        users.remove(id);
    }
    
    // Additional methods with wildcards
    public void addUsers(List<? extends User> userList) {
        for (User user : userList) {
            save(user);
        }
    }
    
    public void copyUsersTo(List<? super User> destination) {
        destination.addAll(findAll());
    }
}
```

## Exception Handling

```java
// Custom exceptions
public class UserNotFoundException extends Exception {
    public UserNotFoundException(String message) {
        super(message);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class InvalidUserDataException extends RuntimeException {
    public InvalidUserDataException(String message) {
        super(message);
    }
}

public class UserService {
    private UserRepository userRepository = new UserRepository();
    
    public User createUser(String username, String email) throws InvalidUserDataException {
        try {
            validateUserData(username, email);
            User user = new User(username, email, 0);
            userRepository.save(user);
            return user;
        } catch (IllegalArgumentException e) {
            throw new InvalidUserDataException("Invalid user data: " + e.getMessage());
        }
    }
    
    public User findUser(Long id) throws UserNotFoundException {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
    
    public void processUsers() {
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                processUser(user);
            }
        } catch (Exception e) {
            System.err.println("Error processing users: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Cleanup code
            System.out.println("User processing completed");
        }
    }
    
    // Try-with-resources for automatic resource management
    public void readUserData(String filename) {
        try (BufferedReader reader = Files.newBufferedReader(Paths.get(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                processUserLine(line);
            }
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
        }
    }
    
    private void validateUserData(String username, String email) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
    
    private void processUser(User user) {
        // User processing logic
    }
    
    private void processUserLine(String line) {
        // Line processing logic
    }
}
```

## Concurrency and Multithreading

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ConcurrencyDemo {
    private static final AtomicInteger counter = new AtomicInteger(0);
    
    public static void demonstrateConcurrency() {
        // Thread creation methods
        
        // 1. Extending Thread class
        Thread thread1 = new CustomThread("Thread-1");
        
        // 2. Implementing Runnable interface
        Thread thread2 = new Thread(new CustomRunnable(), "Thread-2");
        
        // 3. Lambda expression (Java 8+)
        Thread thread3 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                System.out.println("Lambda thread: " + i);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "Lambda-Thread");
        
        // Start threads
        thread1.start();
        thread2.start();
        thread3.start();
        
        // Wait for threads to complete
        try {
            thread1.join();
            thread2.join();
            thread3.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Executor Service
        demonstrateExecutorService();
        
        // Synchronization
        demonstrateSynchronization();
    }
    
    static class CustomThread extends Thread {
        public CustomThread(String name) {
            super(name);
        }
        
        @Override
        public void run() {
            for (int i = 0; i < 5; i++) {
                System.out.println(getName() + ": " + i);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    static class CustomRunnable implements Runnable {
        @Override
        public void run() {
            for (int i = 0; i < 5; i++) {
                System.out.println("Runnable thread: " + i);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    public static void demonstrateExecutorService() {
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        // Submit tasks
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("Task " + taskId + " executed by " + 
                                 Thread.currentThread().getName());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        // Shutdown executor
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
    
    public static void demonstrateSynchronization() {
        Object lock = new Object();
        
        // Synchronized method example
        Runnable incrementTask = () -> {
            for (int i = 0; i < 1000; i++) {
                incrementCounter();
            }
        };
        
        // Synchronized block example
        Runnable decrementTask = () -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (lock) {
                    counter.decrementAndGet();
                }
            }
        };
        
        Thread t1 = new Thread(incrementTask);
        Thread t2 = new Thread(decrementTask);
        
        t1.start();
        t2.start();
        
        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("Final counter value: " + counter.get());
    }
    
    public static synchronized void incrementCounter() {
        counter.incrementAndGet();
    }
}
```

## Best Practices

### Code Organization
1. **Follow naming conventions** - CamelCase for classes, methods
2. **Use packages properly** - Logical code organization
3. **Implement interfaces** - Program to interfaces, not implementations
4. **Apply SOLID principles** - Single responsibility, open/closed, etc.
5. **Use design patterns** - Common solutions to recurring problems

### Performance Optimization
1. **Use appropriate collections** - Choose efficient data structures
2. **Implement caching** - Reduce expensive operations
3. **Optimize loops** - Minimize object creation in loops
4. **Use StringBuilder** - For string concatenation in loops
5. **Profile applications** - Identify performance bottlenecks

### Memory Management
1. **Avoid memory leaks** - Close resources properly
2. **Use try-with-resources** - Automatic resource management
3. **Understand garbage collection** - JVM memory management
4. **Optimize object creation** - Reuse objects when possible
5. **Monitor memory usage** - Use profiling tools

Core Java concepts form the foundation for all Java development. Understanding these fundamentals is essential for building robust, efficient backend applications.
