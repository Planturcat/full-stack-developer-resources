// Error Handling and Debugging - Practical Examples

// ============================================================================
// 1. CUSTOM ERROR CLASSES
// ============================================================================

// Base custom error class
class AppError extends Error {
    constructor(message, code, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Specific error types
class ValidationError extends AppError {
    constructor(message, field, value) {
        super(message, 'VALIDATION_ERROR', 400);
        this.field = field;
        this.value = value;
    }
}

class NetworkError extends AppError {
    constructor(message, statusCode, url) {
        super(message, 'NETWORK_ERROR', statusCode);
        this.url = url;
    }
}

class BusinessLogicError extends AppError {
    constructor(message, code) {
        super(message, code, 422);
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 'AUTH_ERROR', 401);
    }
}

// ============================================================================
// 2. ERROR HANDLING UTILITIES
// ============================================================================

class ErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event.reason);
            event.preventDefault(); // Prevent console logging
        });
    }
    
    handleGlobalError(errorInfo) {
        console.error('Global error caught:', errorInfo);
        
        // Track error frequency
        const errorKey = `${errorInfo.filename}:${errorInfo.lineno}`;
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        
        // Log to external service
        this.logError(errorInfo);
    }
    
    handleUnhandledRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        // Convert to standard error format
        const errorInfo = {
            message: reason?.message || 'Unhandled promise rejection',
            stack: reason?.stack,
            type: 'unhandled_rejection'
        };
        
        this.logError(errorInfo);
    }
    
    logError(errorInfo) {
        // Simulate logging to external service
        console.log('Logging error to service:', {
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
    
    getErrorStats() {
        return {
            totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
            uniqueErrors: this.errorCounts.size,
            errorBreakdown: Object.fromEntries(this.errorCounts)
        };
    }
}

// ============================================================================
// 3. SAFE OPERATION WRAPPERS
// ============================================================================

// Safe function execution wrapper
function safeExecute(fn, fallback = null, context = null) {
    try {
        return fn.call(context);
    } catch (error) {
        console.warn('Safe execution caught error:', error.message);
        return fallback;
    }
}

// Safe async function execution
async function safeExecuteAsync(asyncFn, fallback = null, context = null) {
    try {
        return await asyncFn.call(context);
    } catch (error) {
        console.warn('Safe async execution caught error:', error.message);
        return fallback;
    }
}

// Safe property access
function safeGet(obj, path, defaultValue = undefined) {
    try {
        return path.split('.').reduce((current, key) => {
            if (current === null || current === undefined) {
                throw new Error('Path not found');
            }
            return current[key];
        }, obj);
    } catch (error) {
        return defaultValue;
    }
}

// Safe JSON parsing
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('JSON parse error:', error.message);
        return defaultValue;
    }
}

// ============================================================================
// 4. RETRY MECHANISMS
// ============================================================================

// Basic retry function
async function retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                throw new Error(`Operation failed after ${maxAttempts} attempts: ${error.message}`);
            }
            
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Retry with exponential backoff
async function retryWithBackoff(operation, maxAttempts = 3, baseDelay = 1000, maxDelay = 30000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                throw new Error(`Operation failed after ${maxAttempts} attempts: ${error.message}`);
            }
            
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Conditional retry (only retry certain errors)
async function retryConditional(operation, shouldRetry, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts || !shouldRetry(error)) {
                throw error;
            }
            
            console.log(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// ============================================================================
// 5. CIRCUIT BREAKER PATTERN
// ============================================================================

class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000, monitoringPeriod = 10000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.monitoringPeriod = monitoringPeriod;
        
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        
        this.resetCounters();
    }
    
    async execute(operation, fallback = null) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                console.log('Circuit breaker moving to HALF_OPEN state');
            } else {
                console.log('Circuit breaker is OPEN, using fallback');
                if (fallback) {
                    return fallback();
                }
                throw new Error('Circuit breaker is OPEN and no fallback provided');
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
        this.successCount++;
        
        if (this.state === 'HALF_OPEN') {
            console.log('Circuit breaker moving to CLOSED state');
            this.state = 'CLOSED';
            this.failureCount = 0;
        }
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.threshold) {
            console.log('Circuit breaker moving to OPEN state');
            this.state = 'OPEN';
        }
    }
    
    resetCounters() {
        setInterval(() => {
            this.failureCount = 0;
            this.successCount = 0;
        }, this.monitoringPeriod);
    }
    
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}

// ============================================================================
// 6. RESULT PATTERN IMPLEMENTATION
// ============================================================================

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
    
    static from(fn) {
        try {
            const value = fn();
            return Result.success(value);
        } catch (error) {
            return Result.failure(error);
        }
    }
    
    static async fromAsync(asyncFn) {
        try {
            const value = await asyncFn();
            return Result.success(value);
        } catch (error) {
            return Result.failure(error);
        }
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
    
    mapError(fn) {
        if (this.isSuccess()) {
            return this;
        }
        
        try {
            return Result.failure(fn(this.error));
        } catch (error) {
            return Result.failure(error);
        }
    }
    
    getOrElse(defaultValue) {
        return this.isSuccess() ? this.value : defaultValue;
    }
    
    getOrThrow() {
        if (this.isFailure()) {
            throw this.error;
        }
        return this.value;
    }
}

// ============================================================================
// 7. PRACTICAL EXAMPLES
// ============================================================================

// User service with comprehensive error handling
class UserService {
    constructor() {
        this.circuitBreaker = new CircuitBreaker(3, 30000);
        this.cache = new Map();
    }
    
    async getUser(userId) {
        // Input validation
        if (!userId || typeof userId !== 'string') {
            throw new ValidationError('User ID must be a non-empty string', 'userId', userId);
        }
        
        // Check cache first
        const cacheKey = `user_${userId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Use circuit breaker for external API call
        return await this.circuitBreaker.execute(
            async () => {
                const user = await this.fetchUserFromAPI(userId);
                this.cache.set(cacheKey, user);
                return user;
            },
            () => this.getUserFallback(userId)
        );
    }
    
    async fetchUserFromAPI(userId) {
        // Simulate API call with potential failures
        const shouldFail = Math.random() < 0.3; // 30% failure rate
        
        if (shouldFail) {
            throw new NetworkError('Failed to fetch user from API', 500, `/api/users/${userId}`);
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
            createdAt: new Date().toISOString()
        };
    }
    
    getUserFallback(userId) {
        console.log(`Using fallback for user ${userId}`);
        return {
            id: userId,
            name: 'Unknown User',
            email: 'unknown@example.com',
            createdAt: new Date().toISOString(),
            isFallback: true
        };
    }
    
    async createUser(userData) {
        const validationResult = this.validateUserData(userData);
        if (validationResult.isFailure()) {
            throw validationResult.error;
        }
        
        return await retryWithBackoff(
            async () => {
                // Simulate user creation
                const shouldFail = Math.random() < 0.2; // 20% failure rate
                
                if (shouldFail) {
                    throw new NetworkError('Failed to create user', 500, '/api/users');
                }
                
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    ...userData,
                    createdAt: new Date().toISOString()
                };
            },
            3,
            1000
        );
    }
    
    validateUserData(userData) {
        return Result.from(() => {
            if (!userData || typeof userData !== 'object') {
                throw new ValidationError('User data must be an object', 'userData', userData);
            }
            
            if (!userData.name || userData.name.trim().length < 2) {
                throw new ValidationError('Name must be at least 2 characters', 'name', userData.name);
            }
            
            if (!userData.email || !this.isValidEmail(userData.email)) {
                throw new ValidationError('Invalid email format', 'email', userData.email);
            }
            
            return userData;
        });
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ============================================================================
// 8. DEBUGGING UTILITIES
// ============================================================================

class DebugLogger {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.logs = [];
        this.timers = new Map();
    }
    
    log(message, data = null) {
        if (!this.enabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            message,
            data,
            stack: new Error().stack
        };
        
        this.logs.push(logEntry);
        console.log(`[DEBUG] ${message}`, data);
    }
    
    error(message, error) {
        if (!this.enabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        };
        
        this.logs.push(logEntry);
        console.error(`[ERROR] ${message}`, error);
    }
    
    time(label) {
        if (!this.enabled) return;
        this.timers.set(label, performance.now());
    }
    
    timeEnd(label) {
        if (!this.enabled) return;
        
        const startTime = this.timers.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.log(`Timer ${label}: ${duration.toFixed(2)}ms`);
            this.timers.delete(label);
        }
    }
    
    getLogs() {
        return this.logs;
    }
    
    clearLogs() {
        this.logs = [];
    }
    
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// ============================================================================
// 9. DEMONSTRATION AND TESTING
// ============================================================================

async function demonstrateErrorHandling() {
    console.log("=== Error Handling Demonstration ===");
    
    // Initialize services
    const errorHandler = new ErrorHandler();
    const userService = new UserService();
    const debugLogger = new DebugLogger();
    
    // Test 1: Successful operation
    try {
        debugLogger.time('getUserSuccess');
        const user = await userService.getUser('123');
        debugLogger.timeEnd('getUserSuccess');
        debugLogger.log('User fetched successfully', user);
    } catch (error) {
        debugLogger.error('Failed to fetch user', error);
    }
    
    // Test 2: Validation error
    try {
        await userService.createUser({ name: 'A' }); // Too short name
    } catch (error) {
        debugLogger.error('Validation failed as expected', error);
    }
    
    // Test 3: Network errors with retry
    try {
        debugLogger.time('retryOperation');
        await retry(
            async () => {
                if (Math.random() < 0.7) {
                    throw new NetworkError('Simulated network error', 500);
                }
                return 'Success!';
            },
            3,
            500
        );
        debugLogger.timeEnd('retryOperation');
    } catch (error) {
        debugLogger.error('Retry operation failed', error);
    }
    
    // Test 4: Result pattern
    const result = await Result.fromAsync(async () => {
        if (Math.random() < 0.5) {
            throw new Error('Random failure');
        }
        return 'Success!';
    });
    
    if (result.isSuccess()) {
        debugLogger.log('Result pattern success', result.value);
    } else {
        debugLogger.error('Result pattern failure', result.error);
    }
    
    // Test 5: Safe operations
    const safeResult = safeGet({ user: { profile: { name: 'John' } } }, 'user.profile.name', 'Unknown');
    debugLogger.log('Safe property access', safeResult);
    
    const unsafeResult = safeGet({ user: null }, 'user.profile.name', 'Unknown');
    debugLogger.log('Safe property access with fallback', unsafeResult);
    
    // Show error statistics
    console.log('Error statistics:', errorHandler.getErrorStats());
    console.log('Circuit breaker stats:', userService.circuitBreaker.getStats());
    
    // Export debug logs
    console.log('Debug logs exported:', debugLogger.exportLogs());
}

// Run demonstration
demonstrateErrorHandling().catch(console.error);

// Export for module usage
// module.exports = {
//     AppError,
//     ValidationError,
//     NetworkError,
//     BusinessLogicError,
//     AuthenticationError,
//     ErrorHandler,
//     CircuitBreaker,
//     Result,
//     UserService,
//     DebugLogger,
//     retry,
//     retryWithBackoff,
//     safeExecute,
//     safeGet,
//     safeJsonParse
// };
