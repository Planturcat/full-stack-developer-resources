// Prototypes and Inheritance - Practical Examples

// ============================================================================
// 1. BASIC PROTOTYPE DEMONSTRATION
// ============================================================================

console.log("=== Basic Prototype Chain ===");

// Every object has a prototype
const obj = { name: "John" };
console.log("obj.__proto__ === Object.prototype:", obj.__proto__ === Object.prototype);
console.log("Object.prototype.__proto__:", Object.prototype.__proto__); // null

// Function prototypes
function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

Person.prototype.species = "Homo sapiens";

const john = new Person("John");
const jane = new Person("Jane");

console.log("john.greet():", john.greet());
console.log("jane.greet():", jane.greet());
console.log("john.species:", john.species); // Inherited from prototype
console.log("john.__proto__ === Person.prototype:", john.__proto__ === Person.prototype);

// ============================================================================
// 2. CONSTRUCTOR FUNCTIONS
// ============================================================================

console.log("=== Constructor Functions ===");

function Vehicle(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.isRunning = false;
}

// Prototype methods (shared by all instances)
Vehicle.prototype.start = function() {
    this.isRunning = true;
    return `${this.make} ${this.model} started`;
};

Vehicle.prototype.stop = function() {
    this.isRunning = false;
    return `${this.make} ${this.model} stopped`;
};

Vehicle.prototype.getInfo = function() {
    return `${this.year} ${this.make} ${this.model}`;
};

Vehicle.prototype.getAge = function() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.year;
};

// Static method (on constructor, not prototype)
Vehicle.compareAge = function(vehicle1, vehicle2) {
    return vehicle1.getAge() - vehicle2.getAge();
};

const car = new Vehicle("Toyota", "Camry", 2020);
const truck = new Vehicle("Ford", "F-150", 2018);

console.log("car.getInfo():", car.getInfo());
console.log("car.start():", car.start());
console.log("truck.getAge():", truck.getAge());
console.log("Vehicle.compareAge(car, truck):", Vehicle.compareAge(car, truck));

// ============================================================================
// 3. PROTOTYPE-BASED INHERITANCE
// ============================================================================

console.log("=== Prototype-based Inheritance ===");

// Parent constructor
function Animal(name, species) {
    this.name = name;
    this.species = species;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

Animal.prototype.move = function() {
    return `${this.name} moves`;
};

Animal.prototype.getInfo = function() {
    return `${this.name} is a ${this.species}`;
};

// Child constructor
function Dog(name, breed) {
    // Call parent constructor
    Animal.call(this, name, "Canis lupus");
    this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Override parent method
Dog.prototype.speak = function() {
    return `${this.name} barks`;
};

// Add new methods
Dog.prototype.wagTail = function() {
    return `${this.name} wags tail happily`;
};

Dog.prototype.fetch = function(item) {
    return `${this.name} fetches the ${item}`;
};

// Another child constructor
function Cat(name, breed) {
    Animal.call(this, name, "Felis catus");
    this.breed = breed;
}

Cat.prototype = Object.create(Animal.prototype);
Cat.prototype.constructor = Cat;

Cat.prototype.speak = function() {
    return `${this.name} meows`;
};

Cat.prototype.purr = function() {
    return `${this.name} purrs contentedly`;
};

Cat.prototype.climb = function() {
    return `${this.name} climbs gracefully`;
};

// Create instances
const dog = new Dog("Buddy", "Golden Retriever");
const cat = new Cat("Whiskers", "Persian");

console.log("dog.speak():", dog.speak());
console.log("dog.move():", dog.move()); // Inherited from Animal
console.log("dog.wagTail():", dog.wagTail());
console.log("dog.getInfo():", dog.getInfo());

console.log("cat.speak():", cat.speak());
console.log("cat.purr():", cat.purr());
console.log("cat instanceof Animal:", cat instanceof Animal);
console.log("cat instanceof Cat:", cat instanceof Cat);

// ============================================================================
// 4. ES6 CLASSES
// ============================================================================

console.log("=== ES6 Classes ===");

class Shape {
    constructor(color) {
        this.color = color;
    }
    
    // Instance method
    getColor() {
        return this.color;
    }
    
    // Abstract method (to be overridden)
    getArea() {
        throw new Error("getArea() must be implemented by subclass");
    }
    
    // Static method
    static compareAreas(shape1, shape2) {
        return shape1.getArea() - shape2.getArea();
    }
    
    // Getter
    get description() {
        return `A ${this.color} shape with area ${this.getArea()}`;
    }
}

class Rectangle extends Shape {
    constructor(color, width, height) {
        super(color); // Call parent constructor
        this.width = width;
        this.height = height;
    }
    
    // Override parent method
    getArea() {
        return this.width * this.height;
    }
    
    // New method
    getPerimeter() {
        return 2 * (this.width + this.height);
    }
    
    // Override getter
    get description() {
        return `A ${this.color} rectangle (${this.width}x${this.height}) with area ${this.getArea()}`;
    }
}

class Circle extends Shape {
    constructor(color, radius) {
        super(color);
        this.radius = radius;
    }
    
    getArea() {
        return Math.PI * this.radius * this.radius;
    }
    
    getCircumference() {
        return 2 * Math.PI * this.radius;
    }
    
    get description() {
        return `A ${this.color} circle (radius ${this.radius}) with area ${this.getArea().toFixed(2)}`;
    }
}

const rectangle = new Rectangle("red", 5, 3);
const circle = new Circle("blue", 4);

console.log("rectangle.description:", rectangle.description);
console.log("circle.description:", circle.description);
console.log("Shape.compareAreas(rectangle, circle):", Shape.compareAreas(rectangle, circle));

// ============================================================================
// 5. ADVANCED INHERITANCE PATTERNS
// ============================================================================

console.log("=== Advanced Inheritance Patterns ===");

// Mixin pattern
const CanFly = {
    fly() {
        return `${this.name} soars through the sky`;
    },
    
    land() {
        return `${this.name} lands gracefully`;
    }
};

const CanSwim = {
    swim() {
        return `${this.name} swims through the water`;
    },
    
    dive() {
        return `${this.name} dives deep`;
    }
};

// Mixin function
function mixin(target, ...sources) {
    Object.assign(target, ...sources);
    return target;
}

class Bird extends Animal {
    constructor(name, species, wingspan) {
        super(name, species);
        this.wingspan = wingspan;
    }
    
    speak() {
        return `${this.name} chirps`;
    }
}

// Apply flying mixin
mixin(Bird.prototype, CanFly);

class Duck extends Bird {
    constructor(name, wingspan) {
        super(name, "Anas platyrhynchos", wingspan);
    }
    
    speak() {
        return `${this.name} quacks`;
    }
}

// Apply swimming mixin to Duck
mixin(Duck.prototype, CanSwim);

const eagle = new Bird("Eagle", "Aquila chrysaetos", 200);
const duck = new Duck("Donald", 80);

console.log("eagle.fly():", eagle.fly());
console.log("duck.fly():", duck.fly());
console.log("duck.swim():", duck.swim());
console.log("duck.speak():", duck.speak());

// ============================================================================
// 6. FACTORY FUNCTIONS
// ============================================================================

console.log("=== Factory Functions ===");

// Factory function with closure
function createCounter(initialValue = 0, step = 1) {
    let count = initialValue;
    
    return {
        increment() {
            count += step;
            return count;
        },
        
        decrement() {
            count -= step;
            return count;
        },
        
        getValue() {
            return count;
        },
        
        reset() {
            count = initialValue;
            return count;
        }
    };
}

// Factory function with prototype
function createPerson(name, age) {
    const person = Object.create(createPerson.prototype);
    person.name = name;
    person.age = age;
    return person;
}

createPerson.prototype.greet = function() {
    return `Hello, I'm ${this.name}, ${this.age} years old`;
};

createPerson.prototype.haveBirthday = function() {
    this.age++;
    return `Happy birthday! Now ${this.age} years old`;
};

const counter1 = createCounter(0, 1);
const counter2 = createCounter(100, 5);

console.log("counter1.increment():", counter1.increment());
console.log("counter2.decrement():", counter2.decrement());

const person1 = createPerson("Alice", 25);
const person2 = createPerson("Bob", 30);

console.log("person1.greet():", person1.greet());
console.log("person2.haveBirthday():", person2.haveBirthday());

// ============================================================================
// 7. PROTOTYPE MANIPULATION
// ============================================================================

console.log("=== Prototype Manipulation ===");

// Object.create with properties
const animalPrototype = {
    speak() {
        return `${this.name} makes a sound`;
    },
    
    move() {
        return `${this.name} moves`;
    }
};

const rabbit = Object.create(animalPrototype, {
    name: {
        value: "Bunny",
        writable: true,
        enumerable: true
    },
    species: {
        value: "Oryctolagus cuniculus",
        writable: false,
        enumerable: true
    }
});

rabbit.hop = function() {
    return `${this.name} hops around`;
};

console.log("rabbit.speak():", rabbit.speak());
console.log("rabbit.hop():", rabbit.hop());

// Checking prototype relationships
console.log("animalPrototype.isPrototypeOf(rabbit):", animalPrototype.isPrototypeOf(rabbit));
console.log("rabbit.hasOwnProperty('name'):", rabbit.hasOwnProperty('name'));
console.log("rabbit.hasOwnProperty('speak'):", rabbit.hasOwnProperty('speak'));

// ============================================================================
// 8. PRACTICAL EXAMPLE: GAME ENTITIES
// ============================================================================

console.log("=== Game Entities Example ===");

class GameEntity {
    constructor(x, y, health = 100) {
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
    }
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        return `Moved to (${this.x}, ${this.y})`;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health > 0 ? `Health: ${this.health}` : "Destroyed!";
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        return `Health: ${this.health}`;
    }
    
    get isAlive() {
        return this.health > 0;
    }
}

class Player extends GameEntity {
    constructor(x, y, name) {
        super(x, y, 100);
        this.name = name;
        this.level = 1;
        this.experience = 0;
    }
    
    attack(target) {
        const damage = 20 + (this.level * 5);
        target.takeDamage(damage);
        return `${this.name} attacks for ${damage} damage`;
    }
    
    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.level * 100) {
            this.level++;
            this.experience = 0;
            this.maxHealth += 20;
            this.health = this.maxHealth;
            return `${this.name} leveled up to ${this.level}!`;
        }
        return `${this.name} gained ${amount} experience`;
    }
}

class Enemy extends GameEntity {
    constructor(x, y, type, health = 50) {
        super(x, y, health);
        this.type = type;
    }
    
    attack(target) {
        const damage = 10;
        target.takeDamage(damage);
        return `${this.type} attacks for ${damage} damage`;
    }
    
    onDefeat() {
        return Math.floor(Math.random() * 50) + 25; // Random experience
    }
}

// Game simulation
const player = new Player(0, 0, "Hero");
const goblin = new Enemy(5, 5, "Goblin", 30);

console.log("=== Battle Simulation ===");
console.log("Player:", player.name, "at", `(${player.x}, ${player.y})`);
console.log("Enemy:", goblin.type, "at", `(${goblin.x}, ${goblin.y})`);

while (player.isAlive && goblin.isAlive) {
    console.log(player.attack(goblin));
    if (goblin.isAlive) {
        console.log(goblin.attack(player));
    }
}

if (player.isAlive) {
    const exp = goblin.onDefeat();
    console.log(player.gainExperience(exp));
}

// ============================================================================
// 9. PERFORMANCE AND MEMORY CONSIDERATIONS
// ============================================================================

console.log("=== Performance Considerations ===");

// Bad: Methods on instance (memory inefficient)
function BadConstructor(name) {
    this.name = name;
    
    // Each instance gets its own copy of this function
    this.greet = function() {
        return `Hello, I'm ${this.name}`;
    };
}

// Good: Methods on prototype (memory efficient)
function GoodConstructor(name) {
    this.name = name;
}

GoodConstructor.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// Demonstrate memory usage difference
const badInstances = [];
const goodInstances = [];

for (let i = 0; i < 1000; i++) {
    badInstances.push(new BadConstructor(`Bad${i}`));
    goodInstances.push(new GoodConstructor(`Good${i}`));
}

console.log("Created 1000 instances of each constructor type");
console.log("Bad instances share methods:", badInstances[0].greet === badInstances[1].greet);
console.log("Good instances share methods:", goodInstances[0].greet === goodInstances[1].greet);

// Export for module usage
// module.exports = {
//     Vehicle,
//     Animal,
//     Dog,
//     Cat,
//     Shape,
//     Rectangle,
//     Circle,
//     createCounter,
//     createPerson,
//     GameEntity,
//     Player,
//     Enemy,
//     mixin
// };
