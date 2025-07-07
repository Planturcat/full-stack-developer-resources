// Promises, Async/Await, and Event Loop - Practical Examples

// ============================================================================
// 1. EVENT LOOP DEMONSTRATION
// ============================================================================

console.log("=== Event Loop Demonstration ===");

// Demonstrating the order of execution
console.log("1 - Synchronous");

setTimeout(() => {
    console.log("2 - Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
    console.log("3 - Microtask (Promise)");
});

queueMicrotask(() => {
    console.log("4 - Microtask (queueMicrotask)");
});

console.log("5 - Synchronous");

// Output order: 1, 5, 3, 4, 2

// ============================================================================
// 2. BASIC PROMISE EXAMPLES
// ============================================================================

// Creating a basic promise
function createDelayedPromise(value, delay, shouldReject = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldReject) {
                reject(new Error(`Failed to process: ${value}`));
            } else {
                resolve(`Processed: ${value}`);
            }
        }, delay);
    });
}

// Using the promise with .then/.catch
console.log("=== Basic Promise Usage ===");

createDelayedPromise("Hello World", 1000)
    .then(result => {
        console.log("Success:", result);
        return createDelayedPromise("Second operation", 500);
    })
    .then(result => {
        console.log("Chained success:", result);
    })
    .catch(error => {
        console.log("Error:", error.message);
    })
    .finally(() => {
        console.log("Promise chain completed");
    });

// ============================================================================
// 3. PROMISE STATIC METHODS
// ============================================================================

// Promise.all - waits for all to resolve
async function demonstratePromiseAll() {
    console.log("=== Promise.all Example ===");
    
    const promises = [
        createDelayedPromise("Task 1", 1000),
        createDelayedPromise("Task 2", 1500),
        createDelayedPromise("Task 3", 800)
    ];
    
    try {
        const results = await Promise.all(promises);
        console.log("All tasks completed:", results);
    } catch (error) {
        console.log("One task failed:", error.message);
    }
}

// Promise.allSettled - waits for all to settle
async function demonstratePromiseAllSettled() {
    console.log("=== Promise.allSettled Example ===");
    
    const promises = [
        createDelayedPromise("Success 1", 500),
        createDelayedPromise("Failure", 700, true),
        createDelayedPromise("Success 2", 600)
    ];
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`Task ${index + 1} succeeded:`, result.value);
        } else {
            console.log(`Task ${index + 1} failed:`, result.reason.message);
        }
    });
}

// Promise.race - first to settle wins
async function demonstratePromiseRace() {
    console.log("=== Promise.race Example ===");
    
    const promises = [
        createDelayedPromise("Slow task", 2000),
        createDelayedPromise("Fast task", 800),
        createDelayedPromise("Medium task", 1200)
    ];
    
    try {
        const winner = await Promise.race(promises);
        console.log("First to complete:", winner);
    } catch (error) {
        console.log("First to fail:", error.message);
    }
}

// ============================================================================
// 4. ASYNC/AWAIT EXAMPLES
// ============================================================================

// Simulated API functions
async function fetchUser(userId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`
    };
}

async function fetchUserPosts(userId) {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
        { id: 1, title: "First Post", userId },
        { id: 2, title: "Second Post", userId }
    ];
}

async function fetchUserProfile(userId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
        userId,
        bio: "Software developer",
        location: "New York"
    };
}

// Sequential execution (slower)
async function fetchUserDataSequential(userId) {
    console.log("=== Sequential Execution ===");
    const start = Date.now();
    
    try {
        const user = await fetchUser(userId);
        console.log("Fetched user:", user.name);
        
        const posts = await fetchUserPosts(userId);
        console.log("Fetched posts:", posts.length);
        
        const profile = await fetchUserProfile(userId);
        console.log("Fetched profile:", profile.bio);
        
        const duration = Date.now() - start;
        console.log(`Sequential execution took: ${duration}ms`);
        
        return { user, posts, profile };
    } catch (error) {
        console.log("Error in sequential fetch:", error.message);
        throw error;
    }
}

// Parallel execution (faster)
async function fetchUserDataParallel(userId) {
    console.log("=== Parallel Execution ===");
    const start = Date.now();
    
    try {
        // Start all operations simultaneously
        const [user, posts, profile] = await Promise.all([
            fetchUser(userId),
            fetchUserPosts(userId),
            fetchUserProfile(userId)
        ]);
        
        const duration = Date.now() - start;
        console.log(`Parallel execution took: ${duration}ms`);
        
        return { user, posts, profile };
    } catch (error) {
        console.log("Error in parallel fetch:", error.message);
        throw error;
    }
}

// Mixed execution (optimized dependencies)
async function fetchUserDataMixed(userId) {
    console.log("=== Mixed Execution ===");
    const start = Date.now();
    
    try {
        // Fetch user first (required for other operations)
        const user = await fetchUser(userId);
        console.log("Fetched user:", user.name);
        
        // Now fetch posts and profile in parallel
        const [posts, profile] = await Promise.all([
            fetchUserPosts(userId),
            fetchUserProfile(userId)
        ]);
        
        const duration = Date.now() - start;
        console.log(`Mixed execution took: ${duration}ms`);
        
        return { user, posts, profile };
    } catch (error) {
        console.log("Error in mixed fetch:", error.message);
        throw error;
    }
}

// ============================================================================
// 5. ERROR HANDLING PATTERNS
// ============================================================================

// Comprehensive error handling
async function robustDataFetching(userId) {
    console.log("=== Robust Error Handling ===");
    
    let user, posts, profile;
    
    // Fetch user (critical - fail if this fails)
    try {
        user = await fetchUser(userId);
    } catch (error) {
        console.log("Critical error - cannot fetch user:", error.message);
        throw new Error("User data is required");
    }
    
    // Fetch posts (optional - use default if fails)
    try {
        posts = await fetchUserPosts(userId);
    } catch (error) {
        console.log("Warning - using default posts:", error.message);
        posts = [];
    }
    
    // Fetch profile (optional - use default if fails)
    try {
        profile = await fetchUserProfile(userId);
    } catch (error) {
        console.log("Warning - using default profile:", error.message);
        profile = { userId, bio: "No bio available", location: "Unknown" };
    }
    
    return { user, posts, profile };
}

// ============================================================================
// 6. ADVANCED PATTERNS
// ============================================================================

// Timeout wrapper
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
                throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Batch processing with concurrency limit
async function processBatch(items, processor, concurrencyLimit = 3) {
    const results = [];
    
    for (let i = 0; i < items.length; i += concurrencyLimit) {
        const batch = items.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(item => processor(item));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        console.log(`Processed batch ${Math.floor(i / concurrencyLimit) + 1}`);
    }
    
    return results;
}

// ============================================================================
// 7. PRACTICAL EXAMPLES
// ============================================================================

// Simulated API client
class APIClient {
    constructor(baseURL, timeout = 5000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.timeout);
        
        try {
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
            
            // Simulate random failures
            if (Math.random() < 0.1) {
                throw new Error("Network error");
            }
            
            clearTimeout(timeoutId);
            
            return {
                ok: true,
                data: { endpoint, timestamp: new Date().toISOString() },
                status: 200
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    }
}

// Data service using the API client
class DataService {
    constructor() {
        this.api = new APIClient('https://api.example.com');
        this.cache = new Map();
    }
    
    async getUserWithCache(userId) {
        const cacheKey = `user_${userId}`;
        
        if (this.cache.has(cacheKey)) {
            console.log("Cache hit for user:", userId);
            return this.cache.get(cacheKey);
        }
        
        try {
            const response = await retryWithBackoff(
                () => this.api.get(`/users/${userId}`),
                3,
                500
            );
            
            this.cache.set(cacheKey, response.data);
            console.log("Cached user data for:", userId);
            
            return response.data;
        } catch (error) {
            console.log("Failed to fetch user:", error.message);
            throw error;
        }
    }
    
    async getUsersInBatch(userIds) {
        console.log("=== Batch Processing ===");
        
        const processor = async (userId) => {
            try {
                return await this.getUserWithCache(userId);
            } catch (error) {
                return { error: error.message, userId };
            }
        };
        
        return await processBatch(userIds, processor, 2);
    }
}

// ============================================================================
// 8. RUNNING THE EXAMPLES
// ============================================================================

async function runAllExamples() {
    try {
        // Wait a bit for the event loop demo to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Promise static methods
        await demonstratePromiseAll();
        await demonstratePromiseAllSettled();
        await demonstratePromiseRace();
        
        // Execution patterns
        await fetchUserDataSequential(1);
        await fetchUserDataParallel(2);
        await fetchUserDataMixed(3);
        
        // Error handling
        await robustDataFetching(4);
        
        // Advanced patterns
        console.log("=== Timeout Example ===");
        try {
            const result = await withTimeout(
                createDelayedPromise("Slow operation", 2000),
                1000
            );
            console.log("Result:", result);
        } catch (error) {
            console.log("Timeout error:", error.message);
        }
        
        // Retry example
        console.log("=== Retry Example ===");
        try {
            const result = await retryWithBackoff(
                () => createDelayedPromise("Unreliable operation", 500, Math.random() < 0.7),
                3,
                200
            );
            console.log("Retry success:", result);
        } catch (error) {
            console.log("Retry failed:", error.message);
        }
        
        // Data service example
        const dataService = new DataService();
        const userIds = [1, 2, 3, 4, 5];
        const batchResults = await dataService.getUsersInBatch(userIds);
        console.log("Batch results:", batchResults.length);
        
    } catch (error) {
        console.log("Example execution error:", error.message);
    }
}

// Start the examples
runAllExamples();

// ============================================================================
// 9. UTILITY FUNCTIONS FOR EXPORT
// ============================================================================

// Promisify callback-based functions
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

// Debounced async function
function debounceAsync(asyncFn, delay) {
    let timeoutId;
    
    return function(...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(timeoutId);
            
            timeoutId = setTimeout(async () => {
                try {
                    const result = await asyncFn.apply(this, args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}

// Export for module usage
// module.exports = {
//     createDelayedPromise,
//     withTimeout,
//     retryWithBackoff,
//     processBatch,
//     APIClient,
//     DataService,
//     promisify,
//     debounceAsync
// };
