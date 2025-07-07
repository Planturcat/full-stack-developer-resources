# ES6+ Features

ES6 (ECMAScript 2015) and later versions introduced many powerful features that make JavaScript more expressive and easier to work with.

## Arrow Functions

Arrow functions provide a more concise syntax for writing functions and have lexical `this` binding.

### Syntax
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With single parameter (parentheses optional)
const square = x => x * x;

// With no parameters
const greet = () => "Hello World!";

// With block body
const processData = (data) => {
    const processed = data.map(item => item * 2);
    return processed.filter(item => item > 10);
};
```

### Key Differences
- **No `this` binding**: Arrow functions inherit `this` from enclosing scope
- **Cannot be used as constructors**: No `new` keyword
- **No `arguments` object**: Use rest parameters instead

## Destructuring

Destructuring allows extracting values from arrays and objects into distinct variables.

### Array Destructuring
```javascript
const numbers = [1, 2, 3, 4, 5];

// Basic destructuring
const [first, second] = numbers;

// Skip elements
const [, , third] = numbers;

// Rest operator
const [head, ...tail] = numbers;

// Default values
const [a, b, c = 0] = [1, 2];
```

### Object Destructuring
```javascript
const person = {
    name: "John",
    age: 30,
    city: "New York",
    country: "USA"
};

// Basic destructuring
const { name, age } = person;

// Rename variables
const { name: fullName, age: years } = person;

// Default values
const { name, profession = "Developer" } = person;

// Nested destructuring
const user = {
    id: 1,
    profile: {
        name: "Jane",
        settings: {
            theme: "dark"
        }
    }
};

const { profile: { name, settings: { theme } } } = user;
```

## Spread and Rest Operators

The spread (`...`) operator expands elements, while rest collects them.

### Spread Operator
```javascript
// Array spreading
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Object spreading
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// Function arguments
const numbers = [1, 2, 3];
Math.max(...numbers); // equivalent to Math.max(1, 2, 3)
```

### Rest Parameters
```javascript
// Function parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

// Array destructuring
const [first, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, ...otherProps } = { name: "John", age: 30, city: "NYC" };
```

## Template Literals

Template literals provide an easy way to create strings with embedded expressions.

```javascript
const name = "World";
const greeting = `Hello, ${name}!`;

// Multi-line strings
const multiLine = `
    This is a
    multi-line
    string
`;

// Expression evaluation
const a = 5;
const b = 10;
const result = `The sum of ${a} and ${b} is ${a + b}`;

// Tagged templates
function highlight(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i] ? `<mark>${values[i]}</mark>` : '';
        return result + string + value;
    }, '');
}

const name = "JavaScript";
const highlighted = highlight`Learning ${name} is fun!`;
```

## Enhanced Object Literals

ES6 introduced shorthand syntax for object properties and methods.

```javascript
const name = "John";
const age = 30;

// Property shorthand
const person = { name, age }; // equivalent to { name: name, age: age }

// Method shorthand
const calculator = {
    add(a, b) {
        return a + b;
    },
    // equivalent to: add: function(a, b) { return a + b; }
};

// Computed property names
const propName = "dynamicProp";
const obj = {
    [propName]: "value",
    [`${propName}2`]: "another value"
};

// Getter and setter shorthand
const user = {
    _name: "",
    get name() {
        return this._name;
    },
    set name(value) {
        this._name = value.toUpperCase();
    }
};
```

## Default Parameters

Functions can have default parameter values.

```javascript
function greet(name = "World", punctuation = "!") {
    return `Hello, ${name}${punctuation}`;
}

greet(); // "Hello, World!"
greet("John"); // "Hello, John!"
greet("Jane", "?"); // "Hello, Jane?"

// Default parameters can reference other parameters
function createUser(name, role = "user", id = generateId(name)) {
    return { name, role, id };
}

// Default parameters are evaluated at call time
function addToArray(value, array = []) {
    array.push(value);
    return array;
}
```

## Classes

ES6 introduced class syntax for creating objects and implementing inheritance.

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello, I'm ${this.name}`;
    }

    static species() {
        return "Homo sapiens";
    }
}

class Developer extends Person {
    constructor(name, age, language) {
        super(name, age);
        this.language = language;
    }

    code() {
        return `${this.name} is coding in ${this.language}`;
    }

    greet() {
        return `${super.greet()} and I'm a developer`;
    }
}

const dev = new Developer("Alice", 25, "JavaScript");
console.log(dev.greet()); // "Hello, I'm Alice and I'm a developer"
console.log(dev.code()); // "Alice is coding in JavaScript"
```

## Modules (Import/Export)

ES6 modules provide a way to organize and share code between files.

```javascript
// math.js - Named exports
export const PI = 3.14159;
export function add(a, b) {
    return a + b;
}
export class Calculator {
    multiply(a, b) {
        return a * b;
    }
}

// utils.js - Default export
export default function formatDate(date) {
    return date.toLocaleDateString();
}

// main.js - Importing
import formatDate from './utils.js'; // Default import
import { PI, add, Calculator } from './math.js'; // Named imports
import * as MathUtils from './math.js'; // Namespace import

// Re-exporting
export { add, Calculator } from './math.js';
export { default as formatDate } from './utils.js';
```

## Key Benefits of ES6+ Features

1. **Cleaner Syntax**: More readable and concise code
2. **Better Functionality**: Enhanced capabilities for common tasks
3. **Improved Performance**: Some features are optimized by JavaScript engines
4. **Modern Standards**: Industry-standard practices for JavaScript development
5. **Better Tooling**: Enhanced IDE support and debugging capabilities

## Browser Support and Transpilation

While modern browsers support most ES6+ features, you may need transpilation for older browsers:

- **Babel**: Transpiles modern JavaScript to older versions
- **TypeScript**: Adds type safety and transpiles to JavaScript
- **Webpack/Vite**: Bundle and optimize modern JavaScript code

## Best Practices

1. Use arrow functions for short, simple functions
2. Prefer `const` and `let` over `var`
3. Use destructuring for cleaner variable assignments
4. Leverage template literals for string interpolation
5. Use modules to organize code into reusable components
6. Apply default parameters to make functions more robust
