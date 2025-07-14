# Complete TypeScript Guide

## Table of Contents
1. [What is TypeScript?](#what-is-typescript)
2. [Getting Started](#getting-started)
3. [Variable Declarations](#variable-declarations)
4. [Types in TypeScript](#types-in-typescript)
5. [Type Assertions](#type-assertions)
6. [Arrow Functions](#arrow-functions)
7. [Interfaces](#interfaces)
8. [Classes](#classes)
9. [Constructors](#constructors)
10. [Access Modifiers](#access-modifiers)
11. [Properties](#properties)
12. [Modules](#modules)

## What is TypeScript?

TypeScript is **not an entirely new language** - it's a **superset of JavaScript**. This means:
- Any valid JavaScript code is also valid TypeScript code
- TypeScript adds additional features not available in current JavaScript versions

### Key Benefits:

1. **Strong/Static Typing** (optional)
   - Makes applications more predictable
   - Easier to debug when something goes wrong

2. **Object-Oriented Features**
   - Classes, interfaces, constructors
   - Access modifiers (public, private)
   - Properties, generics

3. **Compile-time Error Detection**
   - Catch errors before runtime
   - Fix issues before deploying

4. **Better Tooling**
   - Excellent IntelliSense in code editors
   - Auto-completion and type checking

### Important Note:
- Browsers don't understand TypeScript
- We need to **compile/transpile** TypeScript to JavaScript
- This happens automatically when building Angular applications

## Getting Started

### Installation
```bash
npm install -g typescript
```

### Check Version
```bash
tsc --version
```

### Creating Your First TypeScript File

1. Create a file `main.ts`:
```typescript
function log(message: string) {
    console.log(message);
}

let message = "Hello World";
log(message);
```

2. Compile to JavaScript:
```bash
tsc main.ts
```

3. Run the compiled JavaScript:
```bash
node main.js
```

## Variable Declarations

### Use `let` instead of `var`

```typescript
// ❌ Avoid var - function scoped
function doSomething() {
    for (var i = 0; i < 5; i++) {
        // i is available here
    }
    console.log(i); // i is still available here (5)
}

// ✅ Use let - block scoped
function doSomething() {
    for (let i = 0; i < 5; i++) {
        // i is available here
    }
    console.log(i); // ❌ Error: cannot find name 'i'
}
```

**Key Takeaway**: Always use `let` for variable declarations to avoid scoping issues.

## Types in TypeScript

### Basic Types

```typescript
// Number
let count: number = 5;

// Boolean
let isComplete: boolean = true;

// String
let name: string = "John";

// Any (avoid when possible)
let value: any = 42;
value = true;
value = "hello";

// Array
let numbers: number[] = [1, 2, 3];
let mixed: any[] = [1, true, "hello"];
```

### Type Inference
```typescript
let count = 5; // TypeScript infers type as number
// count = "hello"; // ❌ Error: not assignable to type number
```

### Type Annotations
```typescript
let a; // Type is 'any'
let b: number; // Explicitly typed as number
```

### Enums
```typescript
// ❌ Verbose JavaScript way
const COLOR_RED = 0;
const COLOR_GREEN = 1;
const COLOR_BLUE = 2;

// ✅ TypeScript enum
enum Color {
    Red = 0,
    Green = 1,
    Blue = 2
}

let backgroundColor = Color.Red;
```

**Best Practice**: Always explicitly set enum values to prevent issues when adding new members.

## Type Assertions

When TypeScript is confused about a variable's type:

```typescript
let message: any = "Hello World";

// Method 1: Angle bracket syntax
let lengthA = (<string>message).length;

// Method 2: 'as' syntax (preferred)
let lengthB = (message as string).length;
```

**Important**: Type assertions don't change the runtime type - they only tell TypeScript what type to expect.

## Arrow Functions

### Traditional Function
```typescript
let log = function(message: string) {
    console.log(message);
}
```

### Arrow Function
```typescript
let log = (message: string) => {
    console.log(message);
}

// Single line - no braces needed
let log = (message: string) => console.log(message);

// No parameters
let doSomething = () => console.log("Done");

// Multiple parameters
let add = (a: number, b: number) => a + b;
```

**Note**: Keep parentheses around parameters for better readability, even with single parameters.

## Interfaces

### Problem: Repetitive Parameter Lists
```typescript
// ❌ Bad: Too many parameters
function drawPoint(x: number, y: number) {
    // drawing logic
}
```

### Solution 1: Inline Annotation
```typescript
function drawPoint(point: { x: number; y: number }) {
    // drawing logic
}
```

### Solution 2: Interface (Recommended)
```typescript
interface Point {
    x: number;
    y: number;
}

function drawPoint(point: Point) {
    // drawing logic
}

// Usage
let point: Point = { x: 1, y: 2 };
drawPoint(point);
```

**Naming Convention**: Use PascalCase for interface names (e.g., `Point`, `UserProfile`).

## Classes

### The Cohesion Principle
Related functionality should be grouped together in a single unit (class).

```typescript
// ❌ Poor cohesion - separate interface and functions
interface Point {
    x: number;
    y: number;
}

function drawPoint(point: Point) { /* ... */ }
function getDistance(a: Point, b: Point) { /* ... */ }

// ✅ Good cohesion - everything in one class
class Point {
    x: number;
    y: number;
    
    draw() {
        console.log(`Point at (${this.x}, ${this.y})`);
    }
    
    getDistance(other: Point) {
        // calculation logic
    }
}
```

### Creating Objects
```typescript
let point = new Point();
point.x = 1;
point.y = 2;
point.draw();
```

**Key Terms**:
- **Class**: The blueprint/template
- **Object**: An instance of a class
- **Field**: Data storage in a class
- **Method**: Function that belongs to a class

## Constructors

### Basic Constructor
```typescript
class Point {
    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    draw() {
        console.log(`Point at (${this.x}, ${this.y})`);
    }
}

// Usage
let point = new Point(1, 2);
point.draw();
```

### Optional Parameters
```typescript
class Point {
    x: number;
    y: number;
    
    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
}

// Both are valid
let point1 = new Point();
let point2 = new Point(1, 2);
```

## Access Modifiers

### Types of Access Modifiers
- **public**: Accessible from anywhere (default)
- **private**: Only accessible within the class
- **protected**: Accessible within the class and its subclasses

```typescript
class Point {
    private x: number;
    private y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    public draw() {
        console.log(`Point at (${this.x}, ${this.y})`);
    }
}

let point = new Point(1, 2);
point.draw(); // ✅ Public method
// point.x = 3; // ❌ Error: x is private
```

### Constructor Shorthand
```typescript
// ❌ Verbose way
class Point {
    private x: number;
    private y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

// ✅ Shorthand with access modifiers
class Point {
    constructor(private x: number, private y: number) {
        // TypeScript automatically creates fields and assigns values
    }
}
```

## Properties

### Getters and Setters
When you need controlled access to private fields:

```typescript
class Point {
    constructor(private _x: number, private _y: number) {}
    
    get x() {
        return this._x;
    }
    
    set x(value: number) {
        if (value < 0) {
            throw new Error("Value cannot be less than 0");
        }
        this._x = value;
    }
    
    draw() {
        console.log(`Point at (${this._x}, ${this._y})`);
    }
}

// Usage (like a field, not a method)
let point = new Point(1, 2);
console.log(point.x); // Calls getter
point.x = 10; // Calls setter
```

### Read-only Properties
```typescript
class Point {
    constructor(private _x: number, private _y: number) {}
    
    get x() {
        return this._x;
    }
    
    // No setter = read-only
}
```

**Convention**: Use underscore prefix for private fields backing properties (e.g., `_x`, `_y`).

## Modules

### File-based Modules
In TypeScript, each file can be a module when it has import/export statements.

### Exporting from a Module
```typescript
// point.ts
export class Point {
    constructor(private x: number, private y: number) {}
    
    draw() {
        console.log(`Point at (${this.x}, ${this.y})`);
    }
}
```

### Importing into Another Module
```typescript
// main.ts
import { Point } from './point';

let point = new Point(1, 2);
point.draw();
```

### Multiple Exports/Imports
```typescript
// shapes.ts
export class Point { /* ... */ }
export class Circle { /* ... */ }

// main.ts
import { Point, Circle } from './shapes';
```

### Angular Module Imports
```typescript
// Angular framework imports
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
```

## Key Takeaways

1. **Use TypeScript for large applications** - Better tooling and error detection
2. **Always use `let` instead of `var`** - Proper block scoping
3. **Leverage type annotations** - Make your code more predictable
4. **Use interfaces for object shapes** - Better code organization
5. **Apply access modifiers appropriately** - Control access to class members
6. **Use properties for controlled access** - Validation and read-only scenarios
7. **Organize code into modules** - Better maintainability and reusability

## Best Practices

- Use PascalCase for classes and interfaces
- Use camelCase for variables, functions, and properties
- Use underscore prefix for private fields backing properties
- Keep constructors simple using parameter property shorthand
- Group related functionality in classes (cohesion principle)
- Export only what needs to be used outside the module

This guide covers the fundamental TypeScript concepts needed to start building Angular applications. As you work with TypeScript more, you'll discover additional advanced features that make it a powerful language for large-scale application development.