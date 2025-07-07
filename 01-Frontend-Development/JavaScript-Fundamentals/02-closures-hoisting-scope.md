# Closures, Hoisting, and Scope

Understanding how JavaScript handles variable scope, hoisting, and closures is crucial for writing effective JavaScript code and avoiding common pitfalls.

## Scope

Scope determines where variables and functions are accessible in your code. JavaScript has several types of scope.

### Global Scope

Variables declared outside any function or block have global scope and are accessible everywhere.

```javascript
var globalVar = "I'm global";
let globalLet = "I'm also global";
const globalConst = "Me too!";

function anyFunction() {
    console.log(globalVar); // Accessible
    console.log(globalLet); // Accessible
    console.log(globalConst); // Accessible
}
```

### Function Scope

Variables declared inside a function are only accessible within that function.

```javascript
function myFunction() {
    var functionScoped = "Only accessible inside this function";
    let alsoFunctionScoped = "Same here";
    
    console.log(functionScoped); // Works
}

console.log(functionScoped); // ReferenceError: functionScoped is not defined
```

### Block Scope

`let` and `const` have block scope, while `var` does not.

```javascript
if (true) {
    var varVariable = "I'm var";
    let letVariable = "I'm let";
    const constVariable = "I'm const";
}

console.log(varVariable); // "I'm var" - accessible
console.log(letVariable); // ReferenceError - not accessible
console.log(constVariable); // ReferenceError - not accessible
```

### Lexical Scope

JavaScript uses lexical scoping, meaning inner functions have access to variables in their outer scope.

```javascript
function outerFunction(x) {
    // Outer scope
    
    function innerFunction(y) {
        // Inner scope
        console.log(x + y); // Can access 'x' from outer scope
    }
    
    return innerFunction;
}

const addFive = outerFunction(5);
addFive(3); // 8
```

## Hoisting

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation.

### Variable Hoisting

#### `var` Hoisting
```javascript
console.log(myVar); // undefined (not ReferenceError)
var myVar = 5;

// This is how JavaScript interprets it:
// var myVar; // Declaration hoisted
// console.log(myVar); // undefined
// myVar = 5; // Assignment stays in place
```

#### `let` and `const` Hoisting
```javascript
console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization
let myLet = 5;

console.log(myConst); // ReferenceError: Cannot access 'myConst' before initialization
const myConst = 10;
```

`let` and `const` are hoisted but remain in a "temporal dead zone" until their declaration is reached.

### Function Hoisting

#### Function Declarations
```javascript
sayHello(); // "Hello!" - works due to hoisting

function sayHello() {
    console.log("Hello!");
}
```

#### Function Expressions
```javascript
sayGoodbye(); // TypeError: sayGoodbye is not a function

var sayGoodbye = function() {
    console.log("Goodbye!");
};
```

## Closures

A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.

### Basic Closure Example

```javascript
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// 'count' is still accessible even though createCounter has finished executing
```

### Why Closures Work

When a function is created, it maintains a reference to its lexical environment, which includes any local variables that were in-scope at the time the closure was created.

```javascript
function outerFunction(x) {
    // This variable is captured by the closure
    let outerVariable = x;
    
    function innerFunction(y) {
        // This inner function has access to outerVariable
        return outerVariable + y;
    }
    
    return innerFunction;
}

const addTen = outerFunction(10);
console.log(addTen(5)); // 15

// Even though outerFunction has finished executing,
// innerFunction still has access to outerVariable
```

### Practical Closure Examples

#### Data Privacy
```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit(amount) {
            balance += amount;
            return balance;
        },
        
        withdraw(amount) {
            if (amount <= balance) {
                balance -= amount;
                return balance;
            } else {
                throw new Error("Insufficient funds");
            }
        },
        
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
console.log(account.deposit(50)); // 150
console.log(account.withdraw(30)); // 120
console.log(account.getBalance()); // 120

// balance is private and cannot be accessed directly
console.log(account.balance); // undefined
```

#### Module Pattern
```javascript
const calculator = (function() {
    let result = 0;
    
    return {
        add(x) {
            result += x;
            return this;
        },
        
        subtract(x) {
            result -= x;
            return this;
        },
        
        multiply(x) {
            result *= x;
            return this;
        },
        
        divide(x) {
            if (x !== 0) {
                result /= x;
            }
            return this;
        },
        
        getResult() {
            return result;
        },
        
        reset() {
            result = 0;
            return this;
        }
    };
})();

calculator.add(10).multiply(2).subtract(5).divide(3);
console.log(calculator.getResult()); // 5
```

## Common Pitfalls and Solutions

### The Loop Problem

A common closure pitfall occurs when creating functions in loops:

```javascript
// Problem: All functions log 3
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i); // 3, 3, 3
    }, 100);
}

// Solution 1: Use let instead of var
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i); // 0, 1, 2
    }, 100);
}

// Solution 2: Create a closure with IIFE
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log(index); // 0, 1, 2
        }, 100);
    })(i);
}

// Solution 3: Use bind
for (var i = 0; i < 3; i++) {
    setTimeout(function(index) {
        console.log(index); // 0, 1, 2
    }.bind(null, i), 100);
}
```

### Memory Leaks

Closures can cause memory leaks if they hold references to large objects:

```javascript
function attachListeners() {
    let largeData = new Array(1000000).fill('data');
    
    document.getElementById('button').addEventListener('click', function() {
        // This closure keeps largeData in memory
        console.log('Button clicked');
    });
}

// Better approach: Don't capture unnecessary variables
function attachListeners() {
    let largeData = new Array(1000000).fill('data');
    
    // Process data and extract only what's needed
    let processedData = processLargeData(largeData);
    largeData = null; // Allow garbage collection
    
    document.getElementById('button').addEventListener('click', function() {
        console.log('Button clicked', processedData);
    });
}
```

## Scope Chain

JavaScript resolves variables by looking up the scope chain:

```javascript
let globalVar = 'global';

function level1() {
    let level1Var = 'level1';
    
    function level2() {
        let level2Var = 'level2';
        
        function level3() {
            let level3Var = 'level3';
            
            // JavaScript looks for variables in this order:
            // 1. level3 scope
            // 2. level2 scope  
            // 3. level1 scope
            // 4. global scope
            
            console.log(level3Var); // Found in level3
            console.log(level2Var); // Found in level2
            console.log(level1Var); // Found in level1
            console.log(globalVar);  // Found in global
        }
        
        return level3;
    }
    
    return level2;
}

const func = level1()();
func();
```

## Best Practices

1. **Use `let` and `const`** instead of `var` to avoid hoisting confusion
2. **Understand closure implications** for memory usage
3. **Use closures for data privacy** and module patterns
4. **Be careful with loops** and asynchronous operations
5. **Clean up event listeners** to prevent memory leaks
6. **Use strict mode** to catch common scope-related errors

```javascript
'use strict';

function strictFunction() {
    // This will throw an error in strict mode
    undeclaredVariable = 'This will cause an error';
}
```

## Advanced Concepts

### Temporal Dead Zone

The time between entering scope and variable declaration where the variable cannot be accessed:

```javascript
console.log(typeof myVar); // "undefined"
console.log(typeof myLet); // ReferenceError

var myVar = 1;
let myLet = 2;
```

### Function vs Block Scope with var

```javascript
function scopeExample() {
    if (true) {
        var functionScoped = 'I am function scoped';
        let blockScoped = 'I am block scoped';
    }
    
    console.log(functionScoped); // Works
    console.log(blockScoped); // ReferenceError
}
```

Understanding these concepts is essential for writing robust JavaScript applications and avoiding common bugs related to variable access and lifetime.
