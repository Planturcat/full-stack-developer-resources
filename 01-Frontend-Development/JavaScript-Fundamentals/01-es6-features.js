// ES6+ Features - Practical Examples

// ============================================================================
// 1. ARROW FUNCTIONS
// ============================================================================

// Traditional function vs Arrow function
function traditionalAdd(a, b) {
    return a + b;
}

const arrowAdd = (a, b) => a + b;

// Arrow functions with different syntaxes
const singleParam = x => x * 2;
const noParams = () => Math.random();
const multiLine = (name, age) => {
    const greeting = `Hello ${name}`;
    const ageInfo = `You are ${age} years old`;
    return `${greeting}. ${ageInfo}`;
};

// Lexical 'this' binding example
class Timer {
    constructor() {
        this.seconds = 0;
    }

    start() {
        // Arrow function preserves 'this' from the enclosing scope
        setInterval(() => {
            this.seconds++;
            console.log(`Timer: ${this.seconds} seconds`);
        }, 1000);
    }

    // Traditional function would lose 'this' context
    startTraditional() {
        const self = this; // Need to store reference
        setInterval(function() {
            self.seconds++;
        }, 1000);
    }
}

// ============================================================================
// 2. DESTRUCTURING
// ============================================================================

// Array destructuring examples
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

const [primary, secondary] = colors;
console.log(primary, secondary); // red green

const [, , third] = colors; // Skip first two
console.log(third); // blue

const [first, ...remaining] = colors;
console.log(first); // red
console.log(remaining); // ['green', 'blue', 'yellow', 'purple']

// Object destructuring examples
const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
    },
    preferences: {
        theme: 'dark',
        notifications: true
    }
};

// Basic destructuring
const { name, email } = user;

// Renaming variables
const { name: fullName, email: userEmail } = user;

// Default values
const { name: userName, role = 'user' } = user;

// Nested destructuring
const { address: { city, zipCode }, preferences: { theme } } = user;

// Function parameter destructuring
function displayUser({ name, email, role = 'guest' }) {
    return `${name} (${email}) - Role: ${role}`;
}

console.log(displayUser(user));

// ============================================================================
// 3. SPREAD AND REST OPERATORS
// ============================================================================

// Spread with arrays
const fruits = ['apple', 'banana'];
const vegetables = ['carrot', 'broccoli'];
const food = [...fruits, 'orange', ...vegetables];
console.log(food); // ['apple', 'banana', 'orange', 'carrot', 'broccoli']

// Spread with objects
const baseConfig = {
    theme: 'light',
    language: 'en',
    notifications: true
};

const userConfig = {
    ...baseConfig,
    theme: 'dark', // Override base theme
    username: 'johndoe'
};

// Rest parameters in functions
function calculateTotal(tax, ...prices) {
    const subtotal = prices.reduce((sum, price) => sum + price, 0);
    return subtotal + (subtotal * tax);
}

console.log(calculateTotal(0.1, 10, 20, 30)); // 66 (60 + 6 tax)

// Rest in destructuring
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const [firstNum, secondNum, ...restNumbers] = numbers;

const person = { name: 'Alice', age: 30, city: 'Boston', country: 'USA' };
const { name: personName, ...otherDetails } = person;

// ============================================================================
// 4. TEMPLATE LITERALS
// ============================================================================

const product = {
    name: 'Laptop',
    price: 999.99,
    category: 'Electronics'
};

// Basic template literal
const productDescription = `Product: ${product.name} - $${product.price}`;

// Multi-line template literal
const productCard = `
    <div class="product-card">
        <h3>${product.name}</h3>
        <p>Category: ${product.category}</p>
        <p>Price: $${product.price}</p>
        <p>Discounted: $${(product.price * 0.9).toFixed(2)}</p>
    </div>
`;

// Tagged template literal
function currency(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i];
        const formattedValue = typeof value === 'number' 
            ? `$${value.toFixed(2)}` 
            : value || '';
        return result + string + formattedValue;
    }, '');
}

const price = 29.99;
const tax = 2.40;
const receipt = currency`Total: ${price}, Tax: ${tax}, Final: ${price + tax}`;

// ============================================================================
// 5. ENHANCED OBJECT LITERALS
// ============================================================================

const name = 'JavaScript';
const version = 'ES2023';
const isPopular = true;

// Property shorthand
const language = { name, version, isPopular };

// Method shorthand and computed properties
const dynamicKey = 'getInfo';
const calculator = {
    value: 0,
    
    // Method shorthand
    add(num) {
        this.value += num;
        return this;
    },
    
    subtract(num) {
        this.value -= num;
        return this;
    },
    
    // Computed property name
    [dynamicKey]() {
        return `Current value: ${this.value}`;
    },
    
    // Getter and setter
    get result() {
        return this.value;
    },
    
    set result(newValue) {
        this.value = newValue;
    }
};

// Method chaining example
calculator.add(10).subtract(3).add(5);
console.log(calculator.getInfo()); // Current value: 12

// ============================================================================
// 6. DEFAULT PARAMETERS
// ============================================================================

// Basic default parameters
function createUser(name, role = 'user', isActive = true) {
    return {
        name,
        role,
        isActive,
        createdAt: new Date()
    };
}

// Default parameters with expressions
function generateId(prefix = 'user', timestamp = Date.now()) {
    return `${prefix}_${timestamp}`;
}

// Default parameters referencing other parameters
function createFullName(firstName, lastName, separator = ' ') {
    return `${firstName}${separator}${lastName}`;
}

// Default parameters with destructuring
function configureApp({ 
    theme = 'light', 
    language = 'en', 
    debug = false 
} = {}) {
    return {
        theme,
        language,
        debug,
        version: '1.0.0'
    };
}

// ============================================================================
// 7. CLASSES
// ============================================================================

class Vehicle {
    constructor(make, model, year) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        return `${this.make} ${this.model} started`;
    }

    stop() {
        this.isRunning = false;
        return `${this.make} ${this.model} stopped`;
    }

    getInfo() {
        return `${this.year} ${this.make} ${this.model}`;
    }

    static compareYears(vehicle1, vehicle2) {
        return vehicle1.year - vehicle2.year;
    }
}

class Car extends Vehicle {
    constructor(make, model, year, doors) {
        super(make, model, year);
        this.doors = doors;
        this.type = 'car';
    }

    honk() {
        return `${this.getInfo()} goes beep beep!`;
    }

    // Override parent method
    getInfo() {
        return `${super.getInfo()} (${this.doors} doors)`;
    }
}

// Usage examples
const car1 = new Car('Toyota', 'Camry', 2022, 4);
const car2 = new Car('Honda', 'Civic', 2021, 4);

console.log(car1.start()); // Toyota Camry started
console.log(car1.honk()); // 2022 Toyota Camry (4 doors) goes beep beep!
console.log(Vehicle.compareYears(car1, car2)); // 1

// ============================================================================
// 8. PRACTICAL EXAMPLES COMBINING MULTIPLE FEATURES
// ============================================================================

// E-commerce cart example using multiple ES6+ features
class ShoppingCart {
    constructor() {
        this.items = [];
        this.discountRate = 0;
    }

    addItem({ name, price, quantity = 1, category = 'general' }) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ name, price, quantity, category });
        }
        
        return this;
    }

    removeItem(name) {
        this.items = this.items.filter(item => item.name !== name);
        return this;
    }

    applyDiscount(rate = 0.1) {
        this.discountRate = rate;
        return this;
    }

    getTotal() {
        const subtotal = this.items.reduce((total, { price, quantity }) => {
            return total + (price * quantity);
        }, 0);
        
        return subtotal * (1 - this.discountRate);
    }

    getSummary() {
        const itemCount = this.items.reduce((count, { quantity }) => count + quantity, 0);
        const categories = [...new Set(this.items.map(({ category }) => category))];
        
        return {
            itemCount,
            categories,
            total: this.getTotal(),
            items: this.items.map(({ name, price, quantity }) => ({
                name,
                price,
                quantity,
                subtotal: price * quantity
            }))
        };
    }
}

// Usage
const cart = new ShoppingCart();

cart
    .addItem({ name: 'Laptop', price: 999.99, category: 'electronics' })
    .addItem({ name: 'Mouse', price: 29.99, category: 'electronics' })
    .addItem({ name: 'Book', price: 19.99, quantity: 2, category: 'books' })
    .applyDiscount(0.1);

console.log(cart.getSummary());

// Async/await with arrow functions and destructuring
const fetchUserData = async (userId) => {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const { data: userData, status } = await response.json();
        
        return {
            success: status === 'ok',
            user: userData,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Export for module usage (if using modules)
// export { ShoppingCart, fetchUserData, calculator, Vehicle, Car };
