// Closures Examples

// 1. Basic Closure Example
function outerFunction(x) {
    // Outer function's variable
    const outerVariable = x;
    
    // Inner function (closure)
    function innerFunction(y) {
        console.log(outerVariable + y); // Can access outerVariable
    }
    
    return innerFunction;
}

const closure = outerFunction(10);
closure(5); // Output: 15

// 2. Creating Private Variables with Closures
function createCounter() {
    let count = 0; // Private variable
    
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count,
        reset: () => { count = 0; }
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1.increment()); // 1
console.log(counter1.increment()); // 2
console.log(counter2.increment()); // 1 (independent counter)
console.log(counter1.getCount());  // 2

// 3. Module Pattern using Closures
const userModule = (function() {
    let users = [];
    let nextId = 1;
    
    return {
        addUser: function(name, email) {
            const user = {
                id: nextId++,
                name: name,
                email: email,
                createdAt: new Date()
            };
            users.push(user);
            return user;
        },
        
        getUsers: function() {
            return [...users]; // Return copy to prevent mutation
        },
        
        getUserById: function(id) {
            return users.find(user => user.id === id);
        },
        
        removeUser: function(id) {
            const index = users.findIndex(user => user.id === id);
            if (index !== -1) {
                return users.splice(index, 1)[0];
            }
            return null;
        },
        
        getUserCount: function() {
            return users.length;
        }
    };
})();

// Usage
userModule.addUser('John Doe', 'john@example.com');
userModule.addUser('Jane Smith', 'jane@example.com');
console.log(userModule.getUsers());
console.log(userModule.getUserCount()); // 2

// 4. Function Factory with Closures
function createMultiplier(multiplier) {
    return function(x) {
        return x * multiplier;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// 5. Event Handler with Closures
function setupEventHandlers() {
    const buttons = document.querySelectorAll('.btn');
    
    for (let i = 0; i < buttons.length; i++) {
        // Closure captures the current value of i
        buttons[i].addEventListener('click', function() {
            console.log(`Button ${i} clicked`);
        });
    }
}

// 6. Memoization using Closures
function memoize(fn) {
    const cache = {};
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (key in cache) {
            console.log('Cache hit!');
            return cache[key];
        }
        
        console.log('Computing result...');
        const result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

// Example: Expensive fibonacci calculation
const fibonacci = memoize(function(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(10)); // Computing result...
console.log(fibonacci(10)); // Cache hit!

// 7. Closure in Loops (Common Pitfall and Solution)
// Problem: All functions reference the same variable
console.log('--- Problem Example ---');
var functions = [];
for (var i = 0; i < 3; i++) {
    functions[i] = function() {
        console.log('Function ' + i); // All will print "Function 3"
    };
}

functions[0](); // Function 3
functions[1](); // Function 3
functions[2](); // Function 3

// Solution 1: Use IIFE (Immediately Invoked Function Expression)
console.log('--- Solution 1: IIFE ---');
var functions2 = [];
for (var i = 0; i < 3; i++) {
    functions2[i] = (function(index) {
        return function() {
            console.log('Function ' + index);
        };
    })(i);
}

functions2[0](); // Function 0
functions2[1](); // Function 1
functions2[2](); // Function 2

// Solution 2: Use let instead of var
console.log('--- Solution 2: let ---');
var functions3 = [];
for (let i = 0; i < 3; i++) {
    functions3[i] = function() {
        console.log('Function ' + i);
    };
}

functions3[0](); // Function 0
functions3[1](); // Function 1
functions3[2](); // Function 2

// 8. Practical Example: Configuration Manager
function createConfigManager(initialConfig = {}) {
    let config = { ...initialConfig };
    
    return {
        get: function(key) {
            return config[key];
        },
        
        set: function(key, value) {
            config[key] = value;
        },
        
        getAll: function() {
            return { ...config }; // Return copy
        },
        
        reset: function() {
            config = { ...initialConfig };
        },
        
        merge: function(newConfig) {
            config = { ...config, ...newConfig };
        }
    };
}

const appConfig = createConfigManager({
    apiUrl: 'https://api.example.com',
    timeout: 5000
});

appConfig.set('debug', true);
console.log(appConfig.get('apiUrl')); // https://api.example.com
console.log(appConfig.getAll()); // { apiUrl: '...', timeout: 5000, debug: true }

// 9. Closure with setTimeout
function delayedGreeting(name, delay) {
    setTimeout(function() {
        console.log(`Hello, ${name}!`);
    }, delay);
}

delayedGreeting('Alice', 1000); // Prints after 1 second

// 10. Closure for Data Privacy
function createBankAccount(initialBalance = 0) {
    let balance = initialBalance;
    let transactionHistory = [];
    
    function addTransaction(type, amount) {
        transactionHistory.push({
            type,
            amount,
            timestamp: new Date(),
            balanceAfter: balance
        });
    }
    
    return {
        deposit: function(amount) {
            if (amount > 0) {
                balance += amount;
                addTransaction('deposit', amount);
                return balance;
            }
            throw new Error('Deposit amount must be positive');
        },
        
        withdraw: function(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                addTransaction('withdrawal', amount);
                return balance;
            }
            throw new Error('Invalid withdrawal amount');
        },
        
        getBalance: function() {
            return balance;
        },
        
        getTransactionHistory: function() {
            return [...transactionHistory]; // Return copy
        }
    };
}

const account = createBankAccount(1000);
console.log(account.deposit(500)); // 1500
console.log(account.withdraw(200)); // 1300
console.log(account.getBalance()); // 1300
console.log(account.getTransactionHistory());

// Note: balance and transactionHistory are completely private
// console.log(account.balance); // undefined
