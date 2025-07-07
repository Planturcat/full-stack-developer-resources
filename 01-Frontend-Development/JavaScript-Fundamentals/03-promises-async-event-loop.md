# Promises, Async/Await, and Event Loop

Understanding asynchronous JavaScript is crucial for modern web development. This guide covers promises, async/await syntax, and how JavaScript's event loop manages asynchronous operations.

## The Event Loop

JavaScript is single-threaded, but it can handle asynchronous operations through the event loop mechanism.

### How the Event Loop Works

1. **Call Stack**: Where function calls are executed
2. **Web APIs**: Browser-provided APIs (setTimeout, fetch, DOM events)
3. **Callback Queue**: Where callbacks wait to be executed
4. **Event Loop**: Moves callbacks from queue to call stack when stack is empty

```javascript
console.log('1'); // Synchronous

setTimeout(() => {
    console.log('2'); // Asynchronous - goes to callback queue
}, 0);

console.log('3'); // Synchronous

// Output: 1, 3, 2
```

### Microtasks vs Macrotasks

- **Microtasks**: Promises, queueMicrotask() - higher priority
- **Macrotasks**: setTimeout, setInterval, I/O operations

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0); // Macrotask

Promise.resolve().then(() => console.log('3')); // Microtask

console.log('4');

// Output: 1, 4, 3, 2
```

## Promises

Promises represent the eventual completion or failure of an asynchronous operation.

### Promise States

- **Pending**: Initial state, neither fulfilled nor rejected
- **Fulfilled**: Operation completed successfully
- **Rejected**: Operation failed

### Creating Promises

```javascript
// Basic promise creation
const myPromise = new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
        if (success) {
            resolve("Operation successful!");
        } else {
            reject(new Error("Operation failed!"));
        }
    }, 1000);
});

// Using the promise
myPromise
    .then(result => {
        console.log("Success:", result);
    })
    .catch(error => {
        console.log("Error:", error.message);
    })
    .finally(() => {
        console.log("Operation completed");
    });
```

### Promise Methods

#### Promise.resolve() and Promise.reject()

```javascript
// Immediately resolved promise
const resolvedPromise = Promise.resolve("Immediate success");

// Immediately rejected promise
const rejectedPromise = Promise.reject(new Error("Immediate failure"));

// Converting values to promises
const numberPromise = Promise.resolve(42);
const arrayPromise = Promise.resolve([1, 2, 3]);
```

#### Promise.all()

Waits for all promises to resolve or any to reject.

```javascript
const promise1 = fetch('/api/data1');
const promise2 = fetch('/api/data2');
const promise3 = fetch('/api/data3');

Promise.all([promise1, promise2, promise3])
    .then(responses => {
        // All requests completed successfully
        return Promise.all(responses.map(r => r.json()));
    })
    .then(data => {
        console.log("All data:", data);
    })
    .catch(error => {
        // If any request fails
        console.log("One or more requests failed:", error);
    });
```

#### Promise.allSettled()

Waits for all promises to settle (resolve or reject).

```javascript
const promises = [
    Promise.resolve("Success 1"),
    Promise.reject(new Error("Error 1")),
    Promise.resolve("Success 2")
];

Promise.allSettled(promises)
    .then(results => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index} succeeded:`, result.value);
            } else {
                console.log(`Promise ${index} failed:`, result.reason);
            }
        });
    });
```

#### Promise.race()

Resolves or rejects with the first promise that settles.

```javascript
const slowPromise = new Promise(resolve => 
    setTimeout(() => resolve("Slow"), 2000)
);

const fastPromise = new Promise(resolve => 
    setTimeout(() => resolve("Fast"), 1000)
);

Promise.race([slowPromise, fastPromise])
    .then(result => {
        console.log("Winner:", result); // "Fast"
    });
```

#### Promise.any()

Resolves with the first fulfilled promise, rejects only if all reject.

```javascript
const promises = [
    Promise.reject(new Error("Error 1")),
    Promise.resolve("Success"),
    Promise.reject(new Error("Error 2"))
];

Promise.any(promises)
    .then(result => {
        console.log("First success:", result); // "Success"
    })
    .catch(error => {
        console.log("All failed:", error);
    });
```

## Async/Await

Async/await provides a more readable way to work with promises.

### Basic Async/Await

```javascript
// Function that returns a promise
function fetchUserData(userId) {
    return fetch(`/api/users/${userId}`)
        .then(response => response.json());
}

// Using async/await
async function getUserData(userId) {
    try {
        const userData = await fetchUserData(userId);
        console.log("User data:", userData);
        return userData;
    } catch (error) {
        console.log("Error fetching user:", error);
        throw error;
    }
}

// Calling async function
getUserData(123)
    .then(data => console.log("Got data:", data))
    .catch(error => console.log("Failed:", error));
```

### Error Handling with Async/Await

```javascript
async function handleMultipleOperations() {
    try {
        // Sequential operations
        const user = await fetchUser();
        const profile = await fetchProfile(user.id);
        const preferences = await fetchPreferences(user.id);
        
        return { user, profile, preferences };
    } catch (error) {
        // Handle any error from the chain
        console.log("Operation failed:", error);
        throw error;
    }
}

// Multiple try-catch blocks for granular error handling
async function granularErrorHandling() {
    let user, profile, preferences;
    
    try {
        user = await fetchUser();
    } catch (error) {
        console.log("Failed to fetch user:", error);
        return null;
    }
    
    try {
        profile = await fetchProfile(user.id);
    } catch (error) {
        console.log("Failed to fetch profile:", error);
        profile = getDefaultProfile();
    }
    
    try {
        preferences = await fetchPreferences(user.id);
    } catch (error) {
        console.log("Failed to fetch preferences:", error);
        preferences = getDefaultPreferences();
    }
    
    return { user, profile, preferences };
}
```

### Parallel vs Sequential Execution

```javascript
// Sequential execution (slower)
async function sequentialExecution() {
    const start = Date.now();
    
    const result1 = await slowOperation1(); // Wait 1 second
    const result2 = await slowOperation2(); // Wait another 1 second
    const result3 = await slowOperation3(); // Wait another 1 second
    
    console.log(`Sequential took: ${Date.now() - start}ms`); // ~3000ms
    return [result1, result2, result3];
}

// Parallel execution (faster)
async function parallelExecution() {
    const start = Date.now();
    
    // Start all operations simultaneously
    const [result1, result2, result3] = await Promise.all([
        slowOperation1(),
        slowOperation2(),
        slowOperation3()
    ]);
    
    console.log(`Parallel took: ${Date.now() - start}ms`); // ~1000ms
    return [result1, result2, result3];
}

// Mixed approach
async function mixedExecution() {
    // Start independent operations in parallel
    const userPromise = fetchUser();
    const settingsPromise = fetchSettings();
    
    // Wait for user data first
    const user = await userPromise;
    
    // Use user data for dependent operation
    const profilePromise = fetchProfile(user.id);
    
    // Wait for all remaining operations
    const [settings, profile] = await Promise.all([
        settingsPromise,
        profilePromise
    ]);
    
    return { user, settings, profile };
}
```

## Common Patterns and Best Practices

### Promise Chaining vs Async/Await

```javascript
// Promise chaining
function promiseChaining() {
    return fetchUser()
        .then(user => {
            return fetchProfile(user.id)
                .then(profile => {
                    return fetchPreferences(user.id)
                        .then(preferences => {
                            return { user, profile, preferences };
                        });
                });
        })
        .catch(error => {
            console.log("Error:", error);
            throw error;
        });
}

// Async/await (cleaner)
async function asyncAwaitVersion() {
    try {
        const user = await fetchUser();
        const profile = await fetchProfile(user.id);
        const preferences = await fetchPreferences(user.id);
        
        return { user, profile, preferences };
    } catch (error) {
        console.log("Error:", error);
        throw error;
    }
}
```

### Handling Arrays of Promises

```javascript
// Process array items sequentially
async function processSequentially(items) {
    const results = [];
    
    for (const item of items) {
        const result = await processItem(item);
        results.push(result);
    }
    
    return results;
}

// Process array items in parallel
async function processInParallel(items) {
    const promises = items.map(item => processItem(item));
    return await Promise.all(promises);
}

// Process with concurrency limit
async function processWithLimit(items, limit = 3) {
    const results = [];
    
    for (let i = 0; i < items.length; i += limit) {
        const batch = items.slice(i, i + limit);
        const batchPromises = batch.map(item => processItem(item));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    
    return results;
}
```

### Timeout and Retry Patterns

```javascript
// Add timeout to promise
function withTimeout(promise, timeoutMs) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
}

// Retry with exponential backoff
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Usage
async function robustOperation() {
    const operation = () => withTimeout(fetch('/api/data'), 5000);
    return await retryWithBackoff(operation, 3, 1000);
}
```

## Common Pitfalls and Solutions

### Forgetting to Handle Rejections

```javascript
// Bad: Unhandled promise rejection
async function badExample() {
    const data = await fetch('/api/data'); // Could throw
    return data.json(); // Could also throw
}

// Good: Proper error handling
async function goodExample() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.log('Failed to fetch data:', error);
        throw error; // Re-throw if needed
    }
}
```

### Mixing Promises and Async/Await

```javascript
// Inconsistent: Mixing styles
async function mixedStyle() {
    const user = await fetchUser();
    return fetchProfile(user.id)
        .then(profile => ({ user, profile })); // Inconsistent
}

// Consistent: Pure async/await
async function consistentStyle() {
    const user = await fetchUser();
    const profile = await fetchProfile(user.id);
    return { user, profile };
}
```

### Not Awaiting Promises in Loops

```javascript
// Wrong: forEach doesn't wait for async operations
async function wrongLoop(items) {
    items.forEach(async (item) => {
        await processItem(item); // These run concurrently, not sequentially
    });
}

// Correct: Use for...of for sequential processing
async function correctSequentialLoop(items) {
    for (const item of items) {
        await processItem(item);
    }
}

// Correct: Use map + Promise.all for parallel processing
async function correctParallelLoop(items) {
    const promises = items.map(item => processItem(item));
    return await Promise.all(promises);
}
```

## Advanced Concepts

### Creating Custom Promise-based APIs

```javascript
// Promisify callback-based function
function promisify(callbackFunction) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            callbackFunction(...args, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Usage
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);

async function readConfig() {
    try {
        const data = await readFileAsync('config.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Failed to read config:', error);
        return getDefaultConfig();
    }
}
```

### Promise Cancellation Pattern

```javascript
class CancellablePromise {
    constructor(executor) {
        this.cancelled = false;
        
        this.promise = new Promise((resolve, reject) => {
            executor(
                (value) => {
                    if (!this.cancelled) resolve(value);
                },
                (reason) => {
                    if (!this.cancelled) reject(reason);
                }
            );
        });
    }
    
    cancel() {
        this.cancelled = true;
    }
    
    then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    }
    
    catch(onRejected) {
        return this.promise.catch(onRejected);
    }
}

// Usage
const cancellableOperation = new CancellablePromise((resolve, reject) => {
    setTimeout(() => resolve("Done"), 2000);
});

// Cancel after 1 second
setTimeout(() => cancellableOperation.cancel(), 1000);
```

Understanding these asynchronous patterns is essential for building responsive web applications and handling complex data flows effectively.
