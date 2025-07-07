# DOM Manipulation and Event Handling

The Document Object Model (DOM) is the programming interface for HTML documents. Understanding DOM manipulation and event handling is essential for creating interactive web applications.

## Understanding the DOM

The DOM represents the document as a tree of nodes, where each HTML element is a node that can be accessed and manipulated with JavaScript.

### DOM Tree Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <div id="container">
        <h1 class="title">Welcome</h1>
        <p class="content">This is content</p>
    </div>
</body>
</html>
```

This creates a tree structure:
- Document
  - html
    - head
      - title
    - body
      - div#container
        - h1.title
        - p.content

## Selecting DOM Elements

### Basic Selection Methods

```javascript
// By ID
const container = document.getElementById('container');

// By class name (returns HTMLCollection)
const titles = document.getElementsByClassName('title');

// By tag name (returns HTMLCollection)
const paragraphs = document.getElementsByTagName('p');

// Query selector (returns first match)
const firstTitle = document.querySelector('.title');
const containerById = document.querySelector('#container');

// Query selector all (returns NodeList)
const allTitles = document.querySelectorAll('.title');
const allDivs = document.querySelectorAll('div');
```

### Advanced Selectors

```javascript
// CSS selectors
const nestedElements = document.querySelectorAll('#container .content');
const directChildren = document.querySelectorAll('#container > h1');
const siblings = document.querySelectorAll('h1 + p');

// Attribute selectors
const inputsWithType = document.querySelectorAll('input[type="text"]');
const linksWithHref = document.querySelectorAll('a[href^="https"]');

// Pseudo-selectors
const firstChild = document.querySelector('div :first-child');
const lastChild = document.querySelector('div :last-child');
const nthChild = document.querySelector('div :nth-child(2)');
```

## Creating and Modifying Elements

### Creating Elements

```javascript
// Create new element
const newDiv = document.createElement('div');
const newParagraph = document.createElement('p');
const newImage = document.createElement('img');

// Set attributes
newDiv.id = 'new-container';
newDiv.className = 'container-class';
newImage.src = 'image.jpg';
newImage.alt = 'Description';

// Set content
newParagraph.textContent = 'This is text content';
newDiv.innerHTML = '<strong>This is HTML content</strong>';

// Create text nodes
const textNode = document.createTextNode('Plain text');
```

### Modifying Element Content

```javascript
const element = document.getElementById('myElement');

// Text content (safe from XSS)
element.textContent = 'New text content';

// HTML content (be careful with user input)
element.innerHTML = '<strong>Bold text</strong>';

// Outer HTML (replaces entire element)
element.outerHTML = '<div class="new">Replacement</div>';

// Insert adjacent HTML
element.insertAdjacentHTML('beforebegin', '<p>Before element</p>');
element.insertAdjacentHTML('afterbegin', '<span>Start of element</span>');
element.insertAdjacentHTML('beforeend', '<span>End of element</span>');
element.insertAdjacentHTML('afterend', '<p>After element</p>');
```

### Modifying Attributes

```javascript
const element = document.getElementById('myElement');

// Set attributes
element.setAttribute('data-id', '123');
element.setAttribute('class', 'new-class');

// Get attributes
const dataId = element.getAttribute('data-id');
const className = element.getAttribute('class');

// Remove attributes
element.removeAttribute('data-id');

// Check if attribute exists
const hasClass = element.hasAttribute('class');

// Dataset for data attributes
element.dataset.userId = '456'; // Sets data-user-id
const userId = element.dataset.userId; // Gets data-user-id
```

### Modifying Styles

```javascript
const element = document.getElementById('myElement');

// Individual style properties
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.fontSize = '16px';

// CSS text
element.style.cssText = 'color: red; background-color: blue; font-size: 16px;';

// Computed styles (read-only)
const computedStyle = window.getComputedStyle(element);
const color = computedStyle.color;
const fontSize = computedStyle.fontSize;
```

### Managing Classes

```javascript
const element = document.getElementById('myElement');

// Add classes
element.classList.add('new-class');
element.classList.add('class1', 'class2', 'class3');

// Remove classes
element.classList.remove('old-class');
element.classList.remove('class1', 'class2');

// Toggle classes
element.classList.toggle('active'); // Adds if not present, removes if present
element.classList.toggle('visible', true); // Force add
element.classList.toggle('hidden', false); // Force remove

// Check if class exists
const hasClass = element.classList.contains('active');

// Replace class
element.classList.replace('old-class', 'new-class');
```

## DOM Traversal

### Parent, Child, and Sibling Navigation

```javascript
const element = document.getElementById('myElement');

// Parent elements
const parent = element.parentElement;
const parentNode = element.parentNode;
const closestDiv = element.closest('div'); // Closest ancestor matching selector

// Child elements
const children = element.children; // HTMLCollection of child elements
const childNodes = element.childNodes; // NodeList including text nodes
const firstChild = element.firstElementChild;
const lastChild = element.lastElementChild;

// Sibling elements
const nextSibling = element.nextElementSibling;
const previousSibling = element.previousElementSibling;

// All siblings
function getAllSiblings(element) {
    const siblings = [];
    let sibling = element.parentElement.firstElementChild;
    
    while (sibling) {
        if (sibling !== element) {
            siblings.push(sibling);
        }
        sibling = sibling.nextElementSibling;
    }
    
    return siblings;
}
```

## Adding and Removing Elements

### Inserting Elements

```javascript
const container = document.getElementById('container');
const newElement = document.createElement('div');

// Append to end
container.appendChild(newElement);

// Insert at beginning
container.insertBefore(newElement, container.firstChild);

// Insert at specific position
const referenceElement = container.children[2];
container.insertBefore(newElement, referenceElement);

// Modern insertion methods
container.prepend(newElement); // Add to beginning
container.append(newElement); // Add to end
container.before(newElement); // Insert before container
container.after(newElement); // Insert after container

// Insert multiple elements
container.append(element1, element2, 'text content');
```

### Removing Elements

```javascript
const element = document.getElementById('myElement');

// Remove element
element.remove(); // Modern method

// Remove child element
const parent = element.parentElement;
parent.removeChild(element); // Older method

// Remove all children
while (container.firstChild) {
    container.removeChild(container.firstChild);
}

// Modern way to remove all children
container.replaceChildren();
```

## Event Handling

### Adding Event Listeners

```javascript
const button = document.getElementById('myButton');

// Basic event listener
button.addEventListener('click', function(event) {
    console.log('Button clicked!');
});

// Arrow function
button.addEventListener('click', (event) => {
    console.log('Button clicked with arrow function!');
});

// Named function
function handleClick(event) {
    console.log('Button clicked with named function!');
}
button.addEventListener('click', handleClick);

// Event listener with options
button.addEventListener('click', handleClick, {
    once: true,      // Execute only once
    passive: true,   // Never calls preventDefault
    capture: true    // Capture phase instead of bubble phase
});
```

### Event Object

```javascript
function handleEvent(event) {
    // Event properties
    console.log('Event type:', event.type);
    console.log('Target element:', event.target);
    console.log('Current target:', event.currentTarget);
    console.log('Timestamp:', event.timeStamp);
    
    // Mouse events
    if (event.type === 'click') {
        console.log('Mouse position:', event.clientX, event.clientY);
        console.log('Button pressed:', event.button);
        console.log('Ctrl key:', event.ctrlKey);
        console.log('Shift key:', event.shiftKey);
    }
    
    // Keyboard events
    if (event.type === 'keydown') {
        console.log('Key pressed:', event.key);
        console.log('Key code:', event.keyCode);
        console.log('Alt key:', event.altKey);
    }
    
    // Prevent default behavior
    event.preventDefault();
    
    // Stop event propagation
    event.stopPropagation();
}
```

### Common Event Types

```javascript
const element = document.getElementById('myElement');

// Mouse events
element.addEventListener('click', handleEvent);
element.addEventListener('dblclick', handleEvent);
element.addEventListener('mousedown', handleEvent);
element.addEventListener('mouseup', handleEvent);
element.addEventListener('mouseover', handleEvent);
element.addEventListener('mouseout', handleEvent);
element.addEventListener('mouseenter', handleEvent);
element.addEventListener('mouseleave', handleEvent);
element.addEventListener('mousemove', handleEvent);

// Keyboard events
element.addEventListener('keydown', handleEvent);
element.addEventListener('keyup', handleEvent);
element.addEventListener('keypress', handleEvent); // Deprecated

// Form events
const form = document.getElementById('myForm');
form.addEventListener('submit', handleEvent);
form.addEventListener('reset', handleEvent);

const input = document.getElementById('myInput');
input.addEventListener('focus', handleEvent);
input.addEventListener('blur', handleEvent);
input.addEventListener('change', handleEvent);
input.addEventListener('input', handleEvent);

// Window events
window.addEventListener('load', handleEvent);
window.addEventListener('resize', handleEvent);
window.addEventListener('scroll', handleEvent);
window.addEventListener('beforeunload', handleEvent);
```

### Event Delegation

```javascript
// Instead of adding listeners to each item
const items = document.querySelectorAll('.item');
items.forEach(item => {
    item.addEventListener('click', handleItemClick);
});

// Use event delegation on parent
const container = document.getElementById('container');
container.addEventListener('click', function(event) {
    // Check if clicked element has the class we want
    if (event.target.classList.contains('item')) {
        handleItemClick(event);
    }
    
    // Or use closest() for nested elements
    const item = event.target.closest('.item');
    if (item) {
        handleItemClick(event);
    }
});

function handleItemClick(event) {
    console.log('Item clicked:', event.target);
}
```

## Form Handling

### Form Validation and Submission

```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get form data
    const formData = new FormData(form);
    
    // Validate form
    if (validateForm(formData)) {
        submitForm(formData);
    }
});

function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    
    // Clear previous errors
    clearErrors();
    
    let isValid = true;
    
    if (!name || name.trim().length < 2) {
        showError('name', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    field.parentElement.appendChild(errorElement);
    field.classList.add('error');
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}
```

## Performance Optimization

### Efficient DOM Manipulation

```javascript
// Bad: Multiple DOM manipulations
function inefficientUpdate(items) {
    const container = document.getElementById('container');
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.name;
        container.appendChild(div); // Triggers reflow each time
    });
}

// Good: Batch DOM manipulations
function efficientUpdate(items) {
    const container = document.getElementById('container');
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.name;
        fragment.appendChild(div);
    });
    
    container.appendChild(fragment); // Single reflow
}

// Alternative: Build HTML string
function efficientUpdateWithHTML(items) {
    const container = document.getElementById('container');
    const html = items.map(item => `<div>${item.name}</div>`).join('');
    container.innerHTML = html;
}
```

### Debouncing and Throttling

```javascript
// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(performSearch, 300);
searchInput.addEventListener('input', debouncedSearch);

const scrollHandler = throttle(handleScroll, 100);
window.addEventListener('scroll', scrollHandler);
```

## Modern DOM APIs

### Intersection Observer

```javascript
// Lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

const lazyImages = document.querySelectorAll('img[data-src]');
lazyImages.forEach(img => imageObserver.observe(img));
```

### Mutation Observer

```javascript
// Watch for DOM changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            console.log('Child nodes changed');
        } else if (mutation.type === 'attributes') {
            console.log('Attributes changed');
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true
});
```

## Best Practices

1. **Use event delegation** for dynamic content
2. **Batch DOM manipulations** to avoid multiple reflows
3. **Cache DOM references** instead of querying repeatedly
4. **Use DocumentFragment** for multiple insertions
5. **Debounce/throttle** expensive operations
6. **Prefer textContent over innerHTML** for security
7. **Use modern APIs** like Intersection Observer when appropriate
8. **Clean up event listeners** to prevent memory leaks

Understanding DOM manipulation and event handling is fundamental for creating interactive and responsive web applications.
