# Error Handling and Debugging

Effective error handling and debugging are crucial skills for JavaScript developers. This guide covers various error types, handling strategies, and debugging techniques.

## Types of JavaScript Errors

### Syntax Errors

Syntax errors occur when the JavaScript engine cannot parse your code due to incorrect syntax.

```javascript
// Syntax errors (these won't run)
// Missing closing bracket
function broken() {
    console.log("Hello"
// Missing semicolon in strict mode
"use strict";
const x = 5
const y = 10;

// Invalid syntax
const 123invalid = "variable name";
```

### Runtime Errors

Runtime errors occur during code execution when something goes wrong.

```javascript
// ReferenceError: Variable not defined
console.log(undefinedVariable);

// TypeError: Cannot read property of undefined
const obj = null;
console.log(obj.property);

// RangeError: Invalid array length
const arr = new Array(-1);

// URIError: Invalid URI
decodeURIComponent('%');
```

### Logical Errors

Logical errors don't throw exceptions but produce incorrect results.

```javascript
// Logical error: infinite loop
function infiniteLoop() {
    let i = 0;
    while (i < 10) {
        console.log(i);
        // Forgot to increment i
    }
}

// Logical error: wrong calculation
function calculateArea(radius) {
    return Math.PI * radius; // Should be radius * radius
}
```

## Error Objects

JavaScript has several built-in error types:

### Built-in Error Types

```javascript
// Generic Error
throw new Error("Something went wrong");

// ReferenceError
throw new ReferenceError("Variable not found");

// TypeError
throw new TypeError("Expected a function");

// RangeError
throw new RangeError("Number out of range");

// SyntaxError (usually thrown by parser)
throw new SyntaxError("Invalid syntax");

// URIError
throw new URIError("Invalid URI");
```

### Custom Error Classes

```javascript
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "NetworkError";
        this.statusCode = statusCode;
    }
}

class BusinessLogicError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "BusinessLogicError";
        this.code = code;
    }
}

// Usage
throw new ValidationError("Email is required", "email");
throw new NetworkError("Server unavailable", 503);
throw new BusinessLogicError("Insufficient funds", "INSUFFICIENT_FUNDS");
```

## Try-Catch-Finally

### Basic Try-Catch

```javascript
try {
    // Code that might throw an error
    const result = riskyOperation();
    console.log("Success:", result);
} catch (error) {
    // Handle the error
    console.log("Error occurred:", error.message);
} finally {
    // Always executes (optional)
    console.log("Cleanup operations");
}
```

### Catching Specific Error Types

```javascript
try {
    performOperation();
} catch (error) {
    if (error instanceof ValidationError) {
        console.log("Validation failed:", error.field);
    } else if (error instanceof NetworkError) {
        console.log("Network error:", error.statusCode);
    } else if (error instanceof TypeError) {
        console.log("Type error:", error.message);
    } else {
        console.log("Unknown error:", error);
        // Re-throw if we can't handle it
        throw error;
    }
}
```

### Nested Try-Catch

```javascript
function complexOperation() {
    try {
        // First risky operation
        const data = fetchData();
        
        try {
            // Second risky operation
            const processed = processData(data);
            return processed;
        } catch (processingError) {
            console.log("Processing failed:", processingError.message);
            // Try alternative processing
            return processDataAlternative(data);
        }
    } catch (fetchError) {
        console.log("Fetch failed:", fetchError.message);
        // Return default data
        return getDefaultData();
    }
}
```

## Async Error Handling

### Promises

```javascript
// Promise error handling
fetchUserData(userId)
    .then(user => {
        console.log("User:", user);
        return fetchUserPosts(user.id);
    })
    .then(posts => {
        console.log("Posts:", posts);
    })
    .catch(error => {
        console.log("Error in promise chain:", error.message);
    })
    .finally(() => {
        console.log("Promise chain completed");
    });

// Multiple catch blocks
fetchUserData(userId)
    .then(user => {
        return fetchUserPosts(user.id);
    })
    .catch(error => {
        if (error instanceof NetworkError) {
            console.log("Network error, retrying...");
            return retryFetchUserPosts(userId);
        }
        throw error; // Re-throw other errors
    })
    .then(posts => {
        console.log("Posts:", posts);
    })
    .catch(error => {
        console.log("Final error:", error.message);
    });
```

### Async/Await

```javascript
async function handleAsyncOperations() {
    try {
        const user = await fetchUser();
        const posts = await fetchUserPosts(user.id);
        const comments = await fetchPostComments(posts[0].id);
        
        return { user, posts, comments };
    } catch (error) {
        if (error instanceof NetworkError) {
            console.log("Network error:", error.statusCode);
            // Try alternative approach
            return await getDataFromCache();
        } else if (error instanceof ValidationError) {
            console.log("Validation error:", error.field);
            throw error; // Re-throw validation errors
        } else {
            console.log("Unexpected error:", error.message);
            return getDefaultData();
        }
    }
}

// Multiple try-catch blocks with async/await
async function robustAsyncOperation() {
    let user, posts, comments;
    
    try {
        user = await fetchUser();
    } catch (error) {
        console.log("User fetch failed:", error.message);
        user = getGuestUser();
    }
    
    try {
        posts = await fetchUserPosts(user.id);
    } catch (error) {
        console.log("Posts fetch failed:", error.message);
        posts = [];
    }
    
    if (posts.length > 0) {
        try {
            comments = await fetchPostComments(posts[0].id);
        } catch (error) {
            console.log("Comments fetch failed:", error.message);
            comments = [];
        }
    }
    
    return { user, posts, comments };
}
```

## Error Boundaries and Global Error Handling

### Global Error Handlers

```javascript
// Unhandled errors
window.addEventListener('error', (event) => {
    console.log('Global error:', event.error);
    console.log('File:', event.filename);
    console.log('Line:', event.lineno);
    console.log('Column:', event.colno);
    
    // Send error to logging service
    logError({
        message: event.error.message,
        stack: event.error.stack,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
    });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.log('Unhandled promise rejection:', event.reason);
    
    // Prevent the default behavior (logging to console)
    event.preventDefault();
    
    // Handle the error
    logError({
        message: 'Unhandled promise rejection',
        reason: event.reason,
        promise: event.promise
    });
});
```

### Error Logging Service

```javascript
class ErrorLogger {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushErrorQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    logError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context
        };
        
        if (this.isOnline) {
            this.sendError(errorData);
        } else {
            this.errorQueue.push(errorData);
        }
    }
    
    async sendError(errorData) {
        try {
            await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            });
        } catch (error) {
            console.log('Failed to send error log:', error);
            this.errorQueue.push(errorData);
        }
    }
    
    flushErrorQueue() {
        while (this.errorQueue.length > 0) {
            const errorData = this.errorQueue.shift();
            this.sendError(errorData);
        }
    }
}

// Usage
const errorLogger = new ErrorLogger('/api/errors');

function logError(error, context) {
    errorLogger.logError(error, context);
}
```

## Debugging Techniques

### Console Methods

```javascript
// Basic logging
console.log("Simple message");
console.info("Information message");
console.warn("Warning message");
console.error("Error message");

// Formatted logging
const user = { name: "John", age: 30 };
console.log("User data: %o", user);
console.log("User name: %s, age: %d", user.name, user.age);

// Grouping
console.group("User Operations");
console.log("Fetching user data...");
console.log("Processing user data...");
console.groupEnd();

// Tables
const users = [
    { name: "John", age: 30, city: "New York" },
    { name: "Jane", age: 25, city: "Boston" }
];
console.table(users);

// Timing
console.time("operation");
// ... some operation
console.timeEnd("operation");

// Assertions
console.assert(user.age > 0, "Age should be positive");

// Stack trace
console.trace("Execution path");
```

### Debugging with Breakpoints

```javascript
function complexCalculation(data) {
    // Set breakpoint here in DevTools
    debugger; // Programmatic breakpoint
    
    let result = 0;
    for (let item of data) {
        result += item.value * item.multiplier;
    }
    
    return result;
}

// Conditional debugging
function processItems(items) {
    items.forEach((item, index) => {
        if (index === 5) {
            debugger; // Only break on 6th item
        }
        processItem(item);
    });
}
```

### Performance Debugging

```javascript
// Performance measurement
function measurePerformance(fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`Function ${fn.name} took ${end - start} milliseconds`);
    return result;
}

// Memory usage monitoring
function monitorMemory() {
    if (performance.memory) {
        console.log({
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
    }
}

// Performance marks and measures
performance.mark('start-operation');
// ... some operation
performance.mark('end-operation');
performance.measure('operation-duration', 'start-operation', 'end-operation');

const measures = performance.getEntriesByType('measure');
console.log(measures);
```

## Best Practices

### Defensive Programming

```javascript
function safeFunction(data) {
    // Input validation
    if (!data || typeof data !== 'object') {
        throw new ValidationError("Data must be an object");
    }
    
    // Null checks
    const name = data.name?.trim() || 'Unknown';
    const age = Number(data.age) || 0;
    
    // Range validation
    if (age < 0 || age > 150) {
        throw new ValidationError("Age must be between 0 and 150");
    }
    
    return { name, age };
}

// Safe property access
function getNestedProperty(obj, path, defaultValue = null) {
    try {
        return path.split('.').reduce((current, key) => current[key], obj);
    } catch (error) {
        return defaultValue;
    }
}

// Usage
const user = { profile: { settings: { theme: 'dark' } } };
const theme = getNestedProperty(user, 'profile.settings.theme', 'light');
```

### Error Recovery Strategies

```javascript
// Retry mechanism
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
}

// Circuit breaker pattern
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
        }
    }
}
```

### Testing Error Scenarios

```javascript
// Unit testing error cases
function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

// Test cases
function testDivide() {
    // Test normal case
    console.assert(divide(10, 2) === 5, "Normal division failed");
    
    // Test error case
    try {
        divide(10, 0);
        console.assert(false, "Should have thrown error");
    } catch (error) {
        console.assert(error.message === "Division by zero", "Wrong error message");
    }
}

// Mock functions for testing
function createMockFunction(shouldFail = false, errorMessage = "Mock error") {
    return function(...args) {
        if (shouldFail) {
            throw new Error(errorMessage);
        }
        return "Mock success";
    };
}
```

## Error Handling Patterns

### Result Pattern

```javascript
class Result {
    constructor(value, error) {
        this.value = value;
        this.error = error;
    }
    
    static success(value) {
        return new Result(value, null);
    }
    
    static failure(error) {
        return new Result(null, error);
    }
    
    isSuccess() {
        return this.error === null;
    }
    
    isFailure() {
        return this.error !== null;
    }
    
    map(fn) {
        if (this.isFailure()) {
            return this;
        }
        
        try {
            return Result.success(fn(this.value));
        } catch (error) {
            return Result.failure(error);
        }
    }
    
    flatMap(fn) {
        if (this.isFailure()) {
            return this;
        }
        
        try {
            return fn(this.value);
        } catch (error) {
            return Result.failure(error);
        }
    }
}

// Usage
function safeDivide(a, b) {
    if (b === 0) {
        return Result.failure(new Error("Division by zero"));
    }
    return Result.success(a / b);
}

const result = safeDivide(10, 2)
    .map(x => x * 2)
    .map(x => x + 1);

if (result.isSuccess()) {
    console.log("Result:", result.value);
} else {
    console.log("Error:", result.error.message);
}
```

Effective error handling and debugging are essential skills that improve code reliability and make development more efficient.
