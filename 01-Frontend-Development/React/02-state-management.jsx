// State Management in React - Practical Examples

import React, { useState, useReducer, useContext, createContext, useCallback, useMemo } from 'react';

// ============================================================================
// 1. BASIC useState EXAMPLES
// ============================================================================

// Simple counter with useState
function Counter() {
    const [count, setCount] = useState(0);
    
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);
    
    // Functional update example
    const incrementByTwo = () => {
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);
    };
    
    return (
        <div className="counter">
            <h2>Count: {count}</h2>
            <div className="counter-buttons">
                <button onClick={increment}>+1</button>
                <button onClick={decrement}>-1</button>
                <button onClick={incrementByTwo}>+2</button>
                <button onClick={reset}>Reset</button>
            </div>
        </div>
    );
}

// Complex state with objects
function UserProfile() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0,
        preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
        }
    });
    
    const [errors, setErrors] = useState({});
    
    // Update nested object state
    const updateUser = (field, value) => {
        setUser(prevUser => ({
            ...prevUser,
            [field]: value
        }));
        
        // Clear error when user updates field
        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: ''
            }));
        }
    };
    
    const updatePreference = (preference, value) => {
        setUser(prevUser => ({
            ...prevUser,
            preferences: {
                ...prevUser.preferences,
                [preference]: value
            }
        }));
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!user.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!user.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (user.age < 0 || user.age > 120) {
            newErrors.age = 'Age must be between 0 and 120';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('User profile saved:', user);
        }
    };
    
    return (
        <div className="user-profile">
            <h2>User Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={user.name}
                        onChange={(e) => updateUser('name', e.target.value)}
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser('email', e.target.value)}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                    <label>Age:</label>
                    <input
                        type="number"
                        value={user.age}
                        onChange={(e) => updateUser('age', parseInt(e.target.value) || 0)}
                        className={errors.age ? 'error' : ''}
                    />
                    {errors.age && <span className="error-message">{errors.age}</span>}
                </div>
                
                <div className="preferences">
                    <h3>Preferences</h3>
                    
                    <div className="form-group">
                        <label>Theme:</label>
                        <select
                            value={user.preferences.theme}
                            onChange={(e) => updatePreference('theme', e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={user.preferences.notifications}
                                onChange={(e) => updatePreference('notifications', e.target.checked)}
                            />
                            Enable Notifications
                        </label>
                    </div>
                    
                    <div className="form-group">
                        <label>Language:</label>
                        <select
                            value={user.preferences.language}
                            onChange={(e) => updatePreference('language', e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>
                </div>
                
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
}

// ============================================================================
// 2. useReducer EXAMPLES
// ============================================================================

// Todo list with useReducer
const todoReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                ...state,
                todos: [
                    ...state.todos,
                    {
                        id: Date.now(),
                        text: action.payload,
                        completed: false,
                        createdAt: new Date().toISOString()
                    }
                ]
            };
            
        case 'TOGGLE_TODO':
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            };
            
        case 'DELETE_TODO':
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload)
            };
            
        case 'EDIT_TODO':
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload.id
                        ? { ...todo, text: action.payload.text }
                        : todo
                )
            };
            
        case 'SET_FILTER':
            return {
                ...state,
                filter: action.payload
            };
            
        case 'CLEAR_COMPLETED':
            return {
                ...state,
                todos: state.todos.filter(todo => !todo.completed)
            };
            
        default:
            return state;
    }
};

function TodoApp() {
    const [state, dispatch] = useReducer(todoReducer, {
        todos: [],
        filter: 'all' // all, active, completed
    });
    
    const [inputValue, setInputValue] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    
    const addTodo = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            dispatch({ type: 'ADD_TODO', payload: inputValue.trim() });
            setInputValue('');
        }
    };
    
    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditingText(todo.text);
    };
    
    const saveEdit = () => {
        if (editingText.trim()) {
            dispatch({
                type: 'EDIT_TODO',
                payload: { id: editingId, text: editingText.trim() }
            });
        }
        setEditingId(null);
        setEditingText('');
    };
    
    const cancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };
    
    // Filter todos based on current filter
    const filteredTodos = useMemo(() => {
        switch (state.filter) {
            case 'active':
                return state.todos.filter(todo => !todo.completed);
            case 'completed':
                return state.todos.filter(todo => todo.completed);
            default:
                return state.todos;
        }
    }, [state.todos, state.filter]);
    
    const stats = useMemo(() => {
        const total = state.todos.length;
        const completed = state.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        return { total, completed, active };
    }, [state.todos]);
    
    return (
        <div className="todo-app">
            <h2>Todo List</h2>
            
            <form onSubmit={addTodo} className="add-todo-form">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a new todo..."
                />
                <button type="submit">Add</button>
            </form>
            
            <div className="todo-filters">
                <button
                    className={state.filter === 'all' ? 'active' : ''}
                    onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
                >
                    All ({stats.total})
                </button>
                <button
                    className={state.filter === 'active' ? 'active' : ''}
                    onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}
                >
                    Active ({stats.active})
                </button>
                <button
                    className={state.filter === 'completed' ? 'active' : ''}
                    onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}
                >
                    Completed ({stats.completed})
                </button>
            </div>
            
            <div className="todo-list">
                {filteredTodos.map(todo => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
                        />
                        
                        {editingId === todo.id ? (
                            <div className="edit-todo">
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') saveEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                    }}
                                    autoFocus
                                />
                                <button onClick={saveEdit}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                            </div>
                        ) : (
                            <div className="todo-content">
                                <span className="todo-text">{todo.text}</span>
                                <div className="todo-actions">
                                    <button onClick={() => startEditing(todo)}>Edit</button>
                                    <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {stats.completed > 0 && (
                <button
                    className="clear-completed"
                    onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
                >
                    Clear Completed ({stats.completed})
                </button>
            )}
        </div>
    );
}

// ============================================================================
// 3. CONTEXT API EXAMPLES
// ============================================================================

// Theme Context
const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);
    
    const changeFontSize = useCallback((size) => {
        setFontSize(size);
    }, []);
    
    const value = useMemo(() => ({
        theme,
        fontSize,
        toggleTheme,
        changeFontSize
    }), [theme, fontSize, toggleTheme, changeFontSize]);
    
    return (
        <ThemeContext.Provider value={value}>
            <div className={`app-theme theme-${theme} font-${fontSize}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Shopping Cart Context with useReducer
const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }]
            };
            
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
            
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0)
            };
            
        case 'CLEAR_CART':
            return {
                ...state,
                items: []
            };
            
        case 'APPLY_DISCOUNT':
            return {
                ...state,
                discount: action.payload
            };
            
        default:
            return state;
    }
};

function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        discount: 0
    });
    
    const addItem = useCallback((product) => {
        dispatch({ type: 'ADD_ITEM', payload: product });
    }, []);
    
    const removeItem = useCallback((productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
    }, []);
    
    const updateQuantity = useCallback((productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }, []);
    
    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);
    
    const applyDiscount = useCallback((discount) => {
        dispatch({ type: 'APPLY_DISCOUNT', payload: discount });
    }, []);
    
    // Calculate totals
    const totals = useMemo(() => {
        const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = subtotal * (state.discount / 100);
        const total = subtotal - discountAmount;
        const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
            subtotal: subtotal.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            total: total.toFixed(2),
            itemCount
        };
    }, [state.items, state.discount]);
    
    const value = useMemo(() => ({
        ...state,
        totals,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyDiscount
    }), [state, totals, addItem, removeItem, updateQuantity, clearCart, applyDiscount]);
    
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// ============================================================================
// 4. CUSTOM HOOKS FOR STATE MANAGEMENT
// ============================================================================

// Custom hook for local storage state
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);
    
    return [storedValue, setValue];
}

// Custom hook for form management
function useForm(initialValues, validationSchema = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);
    
    const setFieldTouched = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);
    
    const validate = useCallback(() => {
        const newErrors = {};
        
        Object.keys(validationSchema).forEach(field => {
            const rules = validationSchema[field];
            const value = values[field];
            
            if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                newErrors[field] = `${field} is required`;
                return;
            }
            
            if (value && rules.minLength && value.length < rules.minLength) {
                newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
                return;
            }
            
            if (value && rules.maxLength && value.length > rules.maxLength) {
                newErrors[field] = `${field} must be no more than ${rules.maxLength} characters`;
                return;
            }
            
            if (value && rules.pattern && !rules.pattern.test(value)) {
                newErrors[field] = rules.message || `${field} is invalid`;
                return;
            }
            
            if (rules.custom) {
                const customError = rules.custom(value, values);
                if (customError) {
                    newErrors[field] = customError;
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationSchema]);
    
    const handleSubmit = useCallback((onSubmit) => {
        return async (e) => {
            if (e) e.preventDefault();
            
            setIsSubmitting(true);
            
            // Mark all fields as touched
            const allTouched = Object.keys(values).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(allTouched);
            
            if (validate()) {
                try {
                    await onSubmit(values);
                } catch (error) {
                    console.error('Form submission error:', error);
                }
            }
            
            setIsSubmitting(false);
        };
    }, [values, validate]);
    
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);
    
    return {
        values,
        errors,
        touched,
        isSubmitting,
        setValue,
        setFieldTouched,
        validate,
        handleSubmit,
        reset,
        isValid: Object.keys(errors).length === 0
    };
}

// ============================================================================
// 5. MAIN APP COMPONENT
// ============================================================================

function StateManagementDemo() {
    const { theme, toggleTheme, changeFontSize } = useTheme();
    const { items, totals, addItem, removeItem, updateQuantity, clearCart } = useCart();
    
    // Sample products
    const products = [
        { id: 1, name: 'Laptop', price: 999.99 },
        { id: 2, name: 'Mouse', price: 29.99 },
        { id: 3, name: 'Keyboard', price: 79.99 },
        { id: 4, name: 'Monitor', price: 299.99 }
    ];
    
    return (
        <div className="state-management-demo">
            <header className="demo-header">
                <h1>State Management Demo</h1>
                <div className="theme-controls">
                    <button onClick={toggleTheme}>
                        Switch to {theme === 'light' ? 'dark' : 'light'} theme
                    </button>
                    <select onChange={(e) => changeFontSize(e.target.value)}>
                        <option value="small">Small Font</option>
                        <option value="medium">Medium Font</option>
                        <option value="large">Large Font</option>
                    </select>
                </div>
            </header>
            
            <div className="demo-content">
                <div className="demo-section">
                    <Counter />
                </div>
                
                <div className="demo-section">
                    <TodoApp />
                </div>
                
                <div className="demo-section">
                    <UserProfile />
                </div>
                
                <div className="demo-section">
                    <h2>Shopping Cart</h2>
                    <div className="products">
                        <h3>Products</h3>
                        {products.map(product => (
                            <div key={product.id} className="product-item">
                                <span>{product.name} - ${product.price}</span>
                                <button onClick={() => addItem(product)}>
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="cart">
                        <h3>Cart ({totals.itemCount} items)</h3>
                        {items.map(item => (
                            <div key={item.id} className="cart-item">
                                <span>{item.name}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                />
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeItem(item.id)}>Remove</button>
                            </div>
                        ))}
                        
                        {items.length > 0 && (
                            <div className="cart-summary">
                                <p>Subtotal: ${totals.subtotal}</p>
                                <p>Total: ${totals.total}</p>
                                <button onClick={clearCart}>Clear Cart</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// App with all providers
function App() {
    return (
        <ThemeProvider>
            <CartProvider>
                <StateManagementDemo />
            </CartProvider>
        </ThemeProvider>
    );
}

export default App;
