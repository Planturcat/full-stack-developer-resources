# Prototypes and Inheritance

JavaScript uses prototype-based inheritance, which is different from classical inheritance found in languages like Java or C++. Understanding prototypes is crucial for mastering JavaScript's object-oriented features.

## Understanding Prototypes

Every JavaScript object has a prototype, which is another object from which it inherits properties and methods.

### The Prototype Chain

When you access a property on an object, JavaScript first looks for it on the object itself. If not found, it looks up the prototype chain until it finds the property or reaches the end of the chain.

```javascript
const obj = { name: "John" };

// obj has a prototype (Object.prototype)
console.log(obj.__proto__ === Object.prototype); // true

// Object.prototype has no prototype (end of chain)
console.log(Object.prototype.__proto__); // null
```

### Function Prototypes

Every function in JavaScript has a `prototype` property that becomes the prototype of objects created with that function as a constructor.

```javascript
function Person(name) {
    this.name = name;
}

// Add method to prototype
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const john = new Person("John");
console.log(john.greet()); // "Hello, I'm John"

// john inherits from Person.prototype
console.log(john.__proto__ === Person.prototype); // true
```

## Constructor Functions

Constructor functions are regular functions used with the `new` keyword to create objects.

### Basic Constructor Pattern

```javascript
function Car(make, model, year) {
    // Instance properties
    this.make = make;
    this.model = model;
    this.year = year;
    this.isRunning = false;
}

// Prototype methods (shared by all instances)
Car.prototype.start = function() {
    this.isRunning = true;
    return `${this.make} ${this.model} started`;
};

Car.prototype.stop = function() {
    this.isRunning = false;
    return `${this.make} ${this.model} stopped`;
};

Car.prototype.getInfo = function() {
    return `${this.year} ${this.make} ${this.model}`;
};

// Creating instances
const car1 = new Car("Toyota", "Camry", 2022);
const car2 = new Car("Honda", "Civic", 2021);

console.log(car1.getInfo()); // "2022 Toyota Camry"
console.log(car2.start()); // "Honda Civic started"
```

### What Happens with `new`

When you use `new` with a function:

1. A new empty object is created
2. The object's prototype is set to the function's prototype
3. The function is called with `this` bound to the new object
4. If the function doesn't return an object, the new object is returned

```javascript
function MyConstructor(value) {
    this.value = value;
}

// This is roughly equivalent to:
function simulateNew(constructor, ...args) {
    // 1. Create new object
    const obj = {};
    
    // 2. Set prototype
    Object.setPrototypeOf(obj, constructor.prototype);
    
    // 3. Call constructor with new object as 'this'
    const result = constructor.apply(obj, args);
    
    // 4. Return object or constructor result
    return (typeof result === 'object' && result !== null) ? result : obj;
}
```

## Prototype-based Inheritance

### Manual Prototype Setup

```javascript
// Parent constructor
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

Animal.prototype.move = function() {
    return `${this.name} moves`;
};

// Child constructor
function Dog(name, breed) {
    // Call parent constructor
    Animal.call(this, name);
    this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add child-specific methods
Dog.prototype.speak = function() {
    return `${this.name} barks`;
};

Dog.prototype.wagTail = function() {
    return `${this.name} wags tail`;
};

const dog = new Dog("Buddy", "Golden Retriever");
console.log(dog.speak()); // "Buddy barks"
console.log(dog.move()); // "Buddy moves" (inherited)
console.log(dog.wagTail()); // "Buddy wags tail"
```

### Using Object.create()

`Object.create()` creates a new object with a specified prototype.

```javascript
// Create object with specific prototype
const animalPrototype = {
    speak() {
        return `${this.name} makes a sound`;
    },
    
    move() {
        return `${this.name} moves`;
    }
};

// Create object inheriting from animalPrototype
const dog = Object.create(animalPrototype);
dog.name = "Rex";
dog.breed = "German Shepherd";

dog.speak = function() {
    return `${this.name} barks`;
};

console.log(dog.speak()); // "Rex barks"
console.log(dog.move()); // "Rex moves"
```

## ES6 Classes

ES6 introduced class syntax, which is syntactic sugar over prototype-based inheritance.

### Basic Class Syntax

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    // Instance method
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    // Static method
    static species() {
        return "Homo sapiens";
    }
    
    // Getter
    get info() {
        return `${this.name}, ${this.age} years old`;
    }
    
    // Setter
    set age(value) {
        if (value < 0) {
            throw new Error("Age cannot be negative");
        }
        this._age = value;
    }
    
    get age() {
        return this._age;
    }
}

const person = new Person("Alice", 30);
console.log(person.greet()); // "Hello, I'm Alice"
console.log(Person.species()); // "Homo sapiens"
console.log(person.info); // "Alice, 30 years old"
```

### Class Inheritance

```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return `${this.name} makes a sound`;
    }
    
    move() {
        return `${this.name} moves`;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name); // Call parent constructor
        this.breed = breed;
    }
    
    // Override parent method
    speak() {
        return `${this.name} barks`;
    }
    
    // New method
    wagTail() {
        return `${this.name} wags tail`;
    }
    
    // Call parent method
    describe() {
        return `${super.speak()} and ${this.wagTail()}`;
    }
}

const dog = new Dog("Max", "Labrador");
console.log(dog.speak()); // "Max barks"
console.log(dog.move()); // "Max moves" (inherited)
console.log(dog.describe()); // "Max makes a sound and Max wags tail"
```

## Advanced Prototype Concepts

### Prototype Property vs __proto__

```javascript
function Constructor() {}

const instance = new Constructor();

// Constructor.prototype is the prototype for instances
console.log(Constructor.prototype); // Object with constructor property

// instance.__proto__ points to Constructor.prototype
console.log(instance.__proto__ === Constructor.prototype); // true

// Constructor.__proto__ points to Function.prototype
console.log(Constructor.__proto__ === Function.prototype); // true
```

### Modifying Built-in Prototypes

```javascript
// Adding method to Array prototype (generally not recommended)
Array.prototype.last = function() {
    return this[this.length - 1];
};

const arr = [1, 2, 3, 4, 5];
console.log(arr.last()); // 5

// Better approach: extend built-in classes
class ExtendedArray extends Array {
    last() {
        return this[this.length - 1];
    }
    
    first() {
        return this[0];
    }
}

const extArr = new ExtendedArray(1, 2, 3, 4, 5);
console.log(extArr.last()); // 5
console.log(extArr.first()); // 1
```

### Prototype Pollution Prevention

```javascript
// Create object without prototype
const safeObject = Object.create(null);
safeObject.name = "Safe";

console.log(safeObject.toString); // undefined (no inherited methods)

// Using Map for safer key-value storage
const safeMap = new Map();
safeMap.set("name", "Safe");
safeMap.set("constructor", "Not a problem");

console.log(safeMap.get("name")); // "Safe"
```

## Mixins and Composition

### Mixin Pattern

```javascript
// Mixin objects
const CanFly = {
    fly() {
        return `${this.name} is flying`;
    }
};

const CanSwim = {
    swim() {
        return `${this.name} is swimming`;
    }
};

// Function to apply mixins
function mixin(target, ...sources) {
    Object.assign(target, ...sources);
    return target;
}

// Base class
class Bird {
    constructor(name) {
        this.name = name;
    }
}

// Apply mixins
mixin(Bird.prototype, CanFly);

class Duck extends Bird {
    constructor(name) {
        super(name);
    }
}

// Apply additional mixin to Duck
mixin(Duck.prototype, CanSwim);

const duck = new Duck("Donald");
console.log(duck.fly()); // "Donald is flying"
console.log(duck.swim()); // "Donald is swimming"
```

### Factory Functions

```javascript
// Factory function approach (alternative to classes)
function createPerson(name, age) {
    return {
        name,
        age,
        
        greet() {
            return `Hello, I'm ${this.name}`;
        },
        
        getAge() {
            return this.age;
        },
        
        setAge(newAge) {
            if (newAge >= 0) {
                this.age = newAge;
            }
        }
    };
}

// Factory with private variables
function createCounter(initialValue = 0) {
    let count = initialValue;
    
    return {
        increment() {
            count++;
            return count;
        },
        
        decrement() {
            count--;
            return count;
        },
        
        getValue() {
            return count;
        }
    };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getValue()); // 11
// count is private and cannot be accessed directly
```

## Common Patterns and Best Practices

### Checking Inheritance

```javascript
class Animal {}
class Dog extends Animal {}

const dog = new Dog();

// instanceof checks prototype chain
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true

// isPrototypeOf checks if object is in prototype chain
console.log(Dog.prototype.isPrototypeOf(dog)); // true
console.log(Animal.prototype.isPrototypeOf(dog)); // true

// hasOwnProperty checks own properties (not inherited)
dog.name = "Buddy";
console.log(dog.hasOwnProperty('name')); // true
console.log(dog.hasOwnProperty('constructor')); // false
```

### Property Descriptors

```javascript
class Person {
    constructor(name) {
        this._name = name;
    }
}

// Define property with descriptor
Object.defineProperty(Person.prototype, 'name', {
    get() {
        return this._name;
    },
    
    set(value) {
        if (typeof value !== 'string') {
            throw new Error('Name must be a string');
        }
        this._name = value;
    },
    
    enumerable: true,
    configurable: true
});

const person = new Person("John");
console.log(person.name); // "John"
person.name = "Jane";
console.log(person.name); // "Jane"
```

### Method Binding

```javascript
class EventHandler {
    constructor(name) {
        this.name = name;
        
        // Bind methods to maintain 'this' context
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick(event) {
        console.log(`${this.name} handled click`);
    }
    
    // Arrow function automatically binds 'this'
    handleHover = (event) => {
        console.log(`${this.name} handled hover`);
    }
}

const handler = new EventHandler("MyHandler");

// These will work correctly even when passed as callbacks
setTimeout(handler.handleClick, 100);
setTimeout(handler.handleHover, 200);
```

## Performance Considerations

### Prototype vs Instance Methods

```javascript
// Instance methods (created for each instance - memory inefficient)
function BadConstructor(name) {
    this.name = name;
    
    this.greet = function() {
        return `Hello, I'm ${this.name}`;
    };
}

// Prototype methods (shared by all instances - memory efficient)
function GoodConstructor(name) {
    this.name = name;
}

GoodConstructor.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// Class methods are automatically on prototype
class BestConstructor {
    constructor(name) {
        this.name = name;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
}
```

Understanding prototypes and inheritance is fundamental to mastering JavaScript's object-oriented programming capabilities and building efficient, maintainable applications.
