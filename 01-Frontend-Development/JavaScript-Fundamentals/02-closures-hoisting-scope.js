// Closures, Hoisting, and Scope - Practical Examples

// ============================================================================
// 1. SCOPE EXAMPLES
// ============================================================================

// Global scope
var globalVar = "I'm accessible everywhere";
let globalLet = "Me too";
const globalConst = "And me";

function demonstrateScope() {
    // Function scope
    var functionVar = "I'm function scoped";
    let functionLet = "I'm also function scoped";
    
    if (true) {
        // Block scope
        var blockVar = "I'm still function scoped (var)";
        let blockLet = "I'm block scoped (let)";
        const blockConst = "I'm block scoped (const)";
        
        console.log("Inside block:");
        console.log(blockVar, blockLet, blockConst); // All accessible
    }
    
    console.log("Outside block:");
    console.log(blockVar); // Accessible (var is function scoped)
    // console.log(blockLet); // ReferenceError
    // console.log(blockConst); // ReferenceError
}

// ============================================================================
// 2. HOISTING EXAMPLES
// ============================================================================

// Variable hoisting demonstration
console.log("=== Variable Hoisting ===");

// This works due to hoisting (but returns undefined)
console.log("varExample before declaration:", varExample);
var varExample = "I'm a var";
console.log("varExample after declaration:", varExample);

// This throws an error (temporal dead zone)
try {
    console.log("letExample before declaration:", letExample);
} catch (error) {
    console.log("Error accessing let before declaration:", error.message);
}
let letExample = "I'm a let";

// Function hoisting demonstration
console.log("=== Function Hoisting ===");

// Function declarations are fully hoisted
hoistedFunction(); // This works!

function hoistedFunction() {
    console.log("I'm a hoisted function declaration");
}

// Function expressions are not hoisted
try {
    notHoistedFunction(); // This throws an error
} catch (error) {
    console.log("Error calling function expression before declaration:", error.message);
}

var notHoistedFunction = function() {
    console.log("I'm a function expression");
};

// ============================================================================
// 3. CLOSURE EXAMPLES
// ============================================================================

// Basic closure - counter example
function createCounter(initialValue = 0) {
    let count = initialValue;
    
    return function() {
        count++;
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter(10);

console.log("=== Basic Closure - Counters ===");
console.log("Counter 1:", counter1()); // 1
console.log("Counter 1:", counter1()); // 2
console.log("Counter 2:", counter2()); // 11
console.log("Counter 2:", counter2()); // 12

// Advanced closure - private variables and methods
function createBankAccount(accountHolder, initialBalance = 0) {
    let balance = initialBalance;
    let transactionHistory = [];
    
    function addTransaction(type, amount) {
        transactionHistory.push({
            type,
            amount,
            balance: balance,
            timestamp: new Date().toISOString()
        });
    }
    
    return {
        getAccountHolder() {
            return accountHolder;
        },
        
        deposit(amount) {
            if (amount > 0) {
                balance += amount;
                addTransaction('deposit', amount);
                return balance;
            }
            throw new Error("Deposit amount must be positive");
        },
        
        withdraw(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                addTransaction('withdrawal', amount);
                return balance;
            }
            throw new Error("Invalid withdrawal amount");
        },
        
        getBalance() {
            return balance;
        },
        
        getTransactionHistory() {
            // Return a copy to prevent external modification
            return [...transactionHistory];
        },
        
        transfer(targetAccount, amount) {
            if (amount > 0 && amount <= balance) {
                this.withdraw(amount);
                targetAccount.deposit(amount);
                return `Transferred $${amount} to ${targetAccount.getAccountHolder()}`;
            }
            throw new Error("Invalid transfer amount");
        }
    };
}

console.log("=== Bank Account Closure ===");
const johnAccount = createBankAccount("John Doe", 1000);
const janeAccount = createBankAccount("Jane Smith", 500);

console.log("John's balance:", johnAccount.getBalance()); // 1000
johnAccount.deposit(200);
console.log("After deposit:", johnAccount.getBalance()); // 1200
johnAccount.withdraw(150);
console.log("After withdrawal:", johnAccount.getBalance()); // 1050

console.log(johnAccount.transfer(janeAccount, 300));
console.log("John's balance after transfer:", johnAccount.getBalance()); // 750
console.log("Jane's balance after transfer:", janeAccount.getBalance()); // 800

// ============================================================================
// 4. MODULE PATTERN WITH CLOSURES
// ============================================================================

const mathModule = (function() {
    let history = [];
    
    function addToHistory(operation, operands, result) {
        history.push({
            operation,
            operands: [...operands],
            result,
            timestamp: new Date().toISOString()
        });
    }
    
    return {
        add(...numbers) {
            const result = numbers.reduce((sum, num) => sum + num, 0);
            addToHistory('addition', numbers, result);
            return result;
        },
        
        multiply(...numbers) {
            const result = numbers.reduce((product, num) => product * num, 1);
            addToHistory('multiplication', numbers, result);
            return result;
        },
        
        power(base, exponent) {
            const result = Math.pow(base, exponent);
            addToHistory('power', [base, exponent], result);
            return result;
        },
        
        getHistory() {
            return [...history];
        },
        
        clearHistory() {
            history = [];
            return "History cleared";
        }
    };
})();

console.log("=== Math Module ===");
console.log("Add:", mathModule.add(5, 3, 2)); // 10
console.log("Multiply:", mathModule.multiply(4, 3, 2)); // 24
console.log("Power:", mathModule.power(2, 8)); // 256
console.log("History:", mathModule.getHistory());

// ============================================================================
// 5. CLOSURE IN LOOPS - COMMON PITFALL AND SOLUTIONS
// ============================================================================

console.log("=== Loop Closure Problem ===");

// Problem: All functions will log 3
console.log("Problem - using var:");
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("var i:", i); // 3, 3, 3
    }, 100 * (i + 1));
}

// Solution 1: Use let instead of var
console.log("Solution 1 - using let:");
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("let i:", i); // 0, 1, 2
    }, 200 + (100 * i));
}

// Solution 2: Create closure with IIFE
console.log("Solution 2 - IIFE:");
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log("IIFE index:", index); // 0, 1, 2
        }, 400 + (100 * index));
    })(i);
}

// Solution 3: Use bind
console.log("Solution 3 - bind:");
for (var i = 0; i < 3; i++) {
    setTimeout(function(index) {
        console.log("bind index:", index); // 0, 1, 2
    }.bind(null, i), 600 + (100 * i));
}

// ============================================================================
// 6. PRACTICAL CLOSURE APPLICATIONS
// ============================================================================

// Memoization using closures
function createMemoizedFunction(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            console.log("Cache hit for:", key);
            return cache.get(key);
        }
        
        console.log("Computing result for:", key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Expensive function to memoize
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFibonacci = createMemoizedFunction(fibonacci);

console.log("=== Memoization ===");
console.log("First call:", memoizedFibonacci(10)); // Computes
console.log("Second call:", memoizedFibonacci(10)); // Cache hit

// Event handler with closure
function createButtonHandler(buttonName) {
    let clickCount = 0;
    
    return function(event) {
        clickCount++;
        console.log(`${buttonName} clicked ${clickCount} times`);
        
        // Access to both the event and the closure variables
        if (clickCount >= 5) {
            console.log(`${buttonName} has been clicked too many times!`);
            event.target.disabled = true;
        }
    };
}

// Simulating button clicks
const saveButtonHandler = createButtonHandler("Save Button");
const deleteButtonHandler = createButtonHandler("Delete Button");

// Simulate events
const mockEvent = { target: { disabled: false } };
saveButtonHandler(mockEvent);
saveButtonHandler(mockEvent);
deleteButtonHandler(mockEvent);

// ============================================================================
// 7. SCOPE CHAIN DEMONSTRATION
// ============================================================================

let globalScope = "global";

function outerFunction(outerParam) {
    let outerScope = "outer";
    
    function middleFunction(middleParam) {
        let middleScope = "middle";
        
        function innerFunction(innerParam) {
            let innerScope = "inner";
            
            // Demonstrating scope chain lookup
            console.log("=== Scope Chain ===");
            console.log("innerScope:", innerScope);     // Found in inner scope
            console.log("middleScope:", middleScope);   // Found in middle scope
            console.log("outerScope:", outerScope);     // Found in outer scope
            console.log("globalScope:", globalScope);   // Found in global scope
            
            console.log("innerParam:", innerParam);     // Inner parameter
            console.log("middleParam:", middleParam);   // Middle parameter
            console.log("outerParam:", outerParam);     // Outer parameter
            
            return {
                inner: innerScope,
                middle: middleScope,
                outer: outerScope,
                global: globalScope
            };
        }
        
        return innerFunction;
    }
    
    return middleFunction;
}

const scopeDemo = outerFunction("outer-value")("middle-value")("inner-value");

// ============================================================================
// 8. TEMPORAL DEAD ZONE DEMONSTRATION
// ============================================================================

function temporalDeadZoneDemo() {
    console.log("=== Temporal Dead Zone ===");
    
    // This works - var is hoisted and initialized with undefined
    console.log("var before declaration:", typeof varVariable); // "undefined"
    
    // This throws an error - let is hoisted but not initialized
    try {
        console.log("let before declaration:", typeof letVariable);
    } catch (error) {
        console.log("TDZ Error:", error.message);
    }
    
    var varVariable = "var value";
    let letVariable = "let value";
    
    console.log("After declarations:", varVariable, letVariable);
}

temporalDeadZoneDemo();

// ============================================================================
// 9. MEMORY MANAGEMENT WITH CLOSURES
// ============================================================================

// Example of potential memory leak
function createPotentialMemoryLeak() {
    let largeArray = new Array(1000000).fill("data");
    let smallData = "important";
    
    // This closure keeps the entire largeArray in memory
    return function() {
        return smallData;
    };
}

// Better approach - clean up unnecessary references
function createMemoryEfficientClosure() {
    let largeArray = new Array(1000000).fill("data");
    let smallData = "important";
    
    // Process large data if needed
    let processedData = largeArray.length; // Just get what we need
    
    // Clear reference to large array
    largeArray = null;
    
    return function() {
        return { smallData, arraySize: processedData };
    };
}

console.log("=== Memory Management ===");
const efficientClosure = createMemoryEfficientClosure();
console.log("Efficient closure result:", efficientClosure());

// Export functions for testing (if using modules)
// module.exports = {
//     createCounter,
//     createBankAccount,
//     mathModule,
//     createMemoizedFunction,
//     createButtonHandler
// };
