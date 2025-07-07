// DOM Manipulation and Event Handling - Practical Examples

// ============================================================================
// 1. DOM ELEMENT SELECTION
// ============================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== DOM Selection Examples ===");
    
    // Create sample HTML structure for demonstration
    createSampleHTML();
    
    // Basic selection methods
    const container = document.getElementById('demo-container');
    const titles = document.getElementsByClassName('title');
    const paragraphs = document.getElementsByTagName('p');
    
    // Modern query selectors
    const firstTitle = document.querySelector('.title');
    const allItems = document.querySelectorAll('.item');
    const nestedElements = document.querySelectorAll('#demo-container .content');
    
    console.log("Container:", container);
    console.log("Titles count:", titles.length);
    console.log("First title:", firstTitle?.textContent);
    console.log("All items count:", allItems.length);
    
    // Advanced selectors
    const firstChild = document.querySelector('#demo-container :first-child');
    const lastChild = document.querySelector('#demo-container :last-child');
    const evenItems = document.querySelectorAll('.item:nth-child(even)');
    
    console.log("First child:", firstChild?.tagName);
    console.log("Even items count:", evenItems.length);
});

// ============================================================================
// 2. CREATING AND MODIFYING ELEMENTS
// ============================================================================

function createSampleHTML() {
    // Create the demo structure
    const body = document.body;
    
    // Main container
    const container = document.createElement('div');
    container.id = 'demo-container';
    container.className = 'container';
    
    // Title
    const title = document.createElement('h1');
    title.className = 'title';
    title.textContent = 'DOM Manipulation Demo';
    
    // Content area
    const content = document.createElement('div');
    content.className = 'content';
    
    // Sample items
    for (let i = 1; i <= 5; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        item.dataset.id = i;
        item.innerHTML = `
            <h3>Item ${i}</h3>
            <p>This is item number ${i}</p>
            <button class="btn-edit" data-item="${i}">Edit</button>
            <button class="btn-delete" data-item="${i}">Delete</button>
        `;
        content.appendChild(item);
    }
    
    // Form for adding new items
    const form = document.createElement('form');
    form.id = 'add-item-form';
    form.innerHTML = `
        <h2>Add New Item</h2>
        <input type="text" id="item-name" placeholder="Item name" required>
        <textarea id="item-description" placeholder="Item description"></textarea>
        <button type="submit">Add Item</button>
    `;
    
    // Assemble the structure
    container.appendChild(title);
    container.appendChild(content);
    container.appendChild(form);
    body.appendChild(container);
    
    // Add some basic styles
    addBasicStyles();
}

function addBasicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #demo-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .item {
            border: 1px solid #ddd;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            background: #f9f9f9;
        }
        .item h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .item p {
            margin: 0 0 10px 0;
            color: #666;
        }
        button {
            margin: 5px;
            padding: 8px 15px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .btn-edit {
            background: #007bff;
            color: white;
        }
        .btn-delete {
            background: #dc3545;
            color: white;
        }
        form {
            margin-top: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        input, textarea {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        .error {
            border-color: #dc3545;
        }
        .error-message {
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        }
        .highlight {
            background-color: #fff3cd;
            border-color: #ffeaa7;
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// 3. ELEMENT MANIPULATION FUNCTIONS
// ============================================================================

class DOMManager {
    constructor() {
        this.container = null;
        this.itemCounter = 5; // Start after initial items
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        this.container = document.getElementById('demo-container');
        if (!this.container) return;
        
        // Event delegation for dynamic content
        this.container.addEventListener('click', (event) => this.handleClick(event));
        
        // Form submission
        const form = document.getElementById('add-item-form');
        if (form) {
            form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        }
        
        // Input validation
        const nameInput = document.getElementById('item-name');
        if (nameInput) {
            nameInput.addEventListener('input', (event) => this.validateInput(event));
        }
        
        console.log("Event listeners set up");
    }
    
    handleClick(event) {
        const target = event.target;
        
        if (target.classList.contains('btn-edit')) {
            const itemId = target.dataset.item;
            this.editItem(itemId);
        } else if (target.classList.contains('btn-delete')) {
            const itemId = target.dataset.item;
            this.deleteItem(itemId);
        }
    }
    
    handleFormSubmit(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('item-name');
        const descriptionInput = document.getElementById('item-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (this.validateForm(name, description)) {
            this.addItem(name, description);
            this.clearForm();
        }
    }
    
    validateForm(name, description) {
        this.clearErrors();
        
        let isValid = true;
        
        if (!name || name.length < 2) {
            this.showError('item-name', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        if (description && description.length > 200) {
            this.showError('item-description', 'Description must be less than 200 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateInput(event) {
        const input = event.target;
        const value = input.value.trim();
        
        // Real-time validation
        if (value.length > 0 && value.length < 2) {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }
    
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        field.parentElement.appendChild(errorElement);
    }
    
    clearErrors() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
        
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
    
    addItem(name, description) {
        this.itemCounter++;
        const content = document.querySelector('.content');
        
        const item = document.createElement('div');
        item.className = 'item';
        item.dataset.id = this.itemCounter;
        
        item.innerHTML = `
            <h3>${this.escapeHtml(name)}</h3>
            <p>${this.escapeHtml(description) || 'No description provided'}</p>
            <button class="btn-edit" data-item="${this.itemCounter}">Edit</button>
            <button class="btn-delete" data-item="${this.itemCounter}">Delete</button>
        `;
        
        // Add with animation
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        content.appendChild(item);
        
        // Animate in
        requestAnimationFrame(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });
        
        console.log(`Added item: ${name}`);
    }
    
    editItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        if (!item) return;
        
        const h3 = item.querySelector('h3');
        const p = item.querySelector('p');
        
        const currentName = h3.textContent;
        const currentDescription = p.textContent === 'No description provided' ? '' : p.textContent;
        
        // Create edit form
        const editForm = document.createElement('div');
        editForm.className = 'edit-form';
        editForm.innerHTML = `
            <input type="text" class="edit-name" value="${this.escapeHtml(currentName)}">
            <textarea class="edit-description">${this.escapeHtml(currentDescription)}</textarea>
            <button class="btn-save" data-item="${itemId}">Save</button>
            <button class="btn-cancel" data-item="${itemId}">Cancel</button>
        `;
        
        // Replace content temporarily
        const originalContent = item.innerHTML;
        item.innerHTML = '';
        item.appendChild(editForm);
        
        // Handle save/cancel
        editForm.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-save')) {
                const newName = editForm.querySelector('.edit-name').value.trim();
                const newDescription = editForm.querySelector('.edit-description').value.trim();
                
                if (newName.length >= 2) {
                    h3.textContent = newName;
                    p.textContent = newDescription || 'No description provided';
                    item.innerHTML = originalContent;
                    // Update the content with new values
                    item.querySelector('h3').textContent = newName;
                    item.querySelector('p').textContent = newDescription || 'No description provided';
                    console.log(`Updated item ${itemId}: ${newName}`);
                }
            } else if (event.target.classList.contains('btn-cancel')) {
                item.innerHTML = originalContent;
            }
        });
    }
    
    deleteItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        if (!item) return;
        
        // Confirm deletion
        if (confirm('Are you sure you want to delete this item?')) {
            // Animate out
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                item.remove();
                console.log(`Deleted item ${itemId}`);
            }, 300);
        }
    }
    
    clearForm() {
        const nameInput = document.getElementById('item-name');
        const descriptionInput = document.getElementById('item-description');
        
        if (nameInput) nameInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        
        this.clearErrors();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================================================
// 4. ADVANCED EVENT HANDLING
// ============================================================================

class EventManager {
    constructor() {
        this.setupAdvancedEvents();
    }
    
    setupAdvancedEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleKeyboard(event));
        
        // Mouse events
        document.addEventListener('mouseover', (event) => this.handleMouseOver(event));
        document.addEventListener('mouseout', (event) => this.handleMouseOut(event));
        
        // Window events
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));
        
        // Custom events
        document.addEventListener('itemAdded', (event) => this.handleCustomEvent(event));
    }
    
    handleKeyboard(event) {
        // Ctrl+N to add new item
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            const nameInput = document.getElementById('item-name');
            if (nameInput) nameInput.focus();
        }
        
        // Escape to clear form
        if (event.key === 'Escape') {
            const form = document.getElementById('add-item-form');
            if (form) form.reset();
        }
    }
    
    handleMouseOver(event) {
        if (event.target.classList.contains('item')) {
            event.target.classList.add('highlight');
        }
    }
    
    handleMouseOut(event) {
        if (event.target.classList.contains('item')) {
            event.target.classList.remove('highlight');
        }
    }
    
    handleResize() {
        console.log('Window resized:', window.innerWidth, 'x', window.innerHeight);
    }
    
    handleScroll() {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        console.log('Scroll progress:', Math.round(scrollPercent) + '%');
    }
    
    handleCustomEvent(event) {
        console.log('Custom event received:', event.detail);
    }
    
    // Utility functions
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ============================================================================
// 5. PERFORMANCE OPTIMIZATION EXAMPLES
// ============================================================================

class PerformanceOptimizer {
    constructor() {
        this.setupOptimizations();
    }
    
    setupOptimizations() {
        // Efficient DOM manipulation
        this.demonstrateEfficientUpdates();
        
        // Intersection Observer for lazy loading
        this.setupLazyLoading();
        
        // Virtual scrolling for large lists
        this.setupVirtualScrolling();
    }
    
    demonstrateEfficientUpdates() {
        // Bad: Multiple DOM manipulations
        const inefficientUpdate = (items) => {
            const container = document.querySelector('.content');
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                container.appendChild(div); // Triggers reflow each time
            });
        };
        
        // Good: Batch DOM manipulations
        const efficientUpdate = (items) => {
            const container = document.querySelector('.content');
            const fragment = document.createDocumentFragment();
            
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                fragment.appendChild(div);
            });
            
            container.appendChild(fragment); // Single reflow
        };
        
        // Store references for potential use
        this.inefficientUpdate = inefficientUpdate;
        this.efficientUpdate = efficientUpdate;
    }
    
    setupLazyLoading() {
        // Create intersection observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
        
        this.imageObserver = imageObserver;
    }
    
    setupVirtualScrolling() {
        // Simple virtual scrolling implementation
        const createVirtualList = (container, items, itemHeight = 50) => {
            const containerHeight = container.clientHeight;
            const visibleItems = Math.ceil(containerHeight / itemHeight);
            const totalHeight = items.length * itemHeight;
            
            let scrollTop = 0;
            let startIndex = 0;
            
            const viewport = document.createElement('div');
            viewport.style.height = totalHeight + 'px';
            viewport.style.position = 'relative';
            
            const renderItems = () => {
                startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(startIndex + visibleItems + 1, items.length);
                
                // Clear existing items
                viewport.innerHTML = '';
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = document.createElement('div');
                    item.style.position = 'absolute';
                    item.style.top = (i * itemHeight) + 'px';
                    item.style.height = itemHeight + 'px';
                    item.textContent = items[i];
                    viewport.appendChild(item);
                }
            };
            
            container.addEventListener('scroll', () => {
                scrollTop = container.scrollTop;
                renderItems();
            });
            
            container.appendChild(viewport);
            renderItems();
        };
        
        this.createVirtualList = createVirtualList;
    }
}

// ============================================================================
// 6. INITIALIZE EVERYTHING
// ============================================================================

// Initialize all managers when DOM is ready
let domManager, eventManager, performanceOptimizer;

document.addEventListener('DOMContentLoaded', function() {
    console.log("=== Initializing DOM Manipulation Demo ===");
    
    domManager = new DOMManager();
    eventManager = new EventManager();
    performanceOptimizer = new PerformanceOptimizer();
    
    console.log("All managers initialized");
    console.log("Try these keyboard shortcuts:");
    console.log("- Ctrl+N: Focus on name input");
    console.log("- Escape: Clear form");
    console.log("- Hover over items to highlight them");
});

// Export for module usage
// module.exports = {
//     DOMManager,
//     EventManager,
//     PerformanceOptimizer
// };
