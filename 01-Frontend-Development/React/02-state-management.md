# State Management in React

State management is crucial for building interactive React applications. React provides several built-in tools for managing state, from simple component state to complex application-wide state management.

## useState Hook

The `useState` hook is the most basic way to add state to functional components.

### Basic useState

```jsx
import React, { useState } from 'react';

function Counter() {
    // Declare state variable with initial value
    const [count, setCount] = useState(0);
    
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);
    
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}
```

### useState with Objects and Arrays

```jsx
function UserForm() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0
    });
    
    const [hobbies, setHobbies] = useState([]);
    
    // Update object state (always create new object)
    const updateUser = (field, value) => {
        setUser(prevUser => ({
            ...prevUser,
            [field]: value
        }));
    };
    
    // Update array state
    const addHobby = (hobby) => {
        setHobbies(prevHobbies => [...prevHobbies, hobby]);
    };
    
    const removeHobby = (index) => {
        setHobbies(prevHobbies => 
            prevHobbies.filter((_, i) => i !== index)
        );
    };
    
    return (
        <form>
            <input
                type="text"
                placeholder="Name"
                value={user.name}
                onChange={(e) => updateUser('name', e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => updateUser('email', e.target.value)}
            />
            <input
                type="number"
                placeholder="Age"
                value={user.age}
                onChange={(e) => updateUser('age', parseInt(e.target.value))}
            />
            
            <div>
                <h3>Hobbies:</h3>
                {hobbies.map((hobby, index) => (
                    <div key={index}>
                        {hobby}
                        <button onClick={() => removeHobby(index)}>Remove</button>
                    </div>
                ))}
                <button 
                    type="button"
                    onClick={() => addHobby('New Hobby')}
                >
                    Add Hobby
                </button>
            </div>
        </form>
    );
}
```

### Functional Updates

```jsx
function AsyncCounter() {
    const [count, setCount] = useState(0);
    
    // Problem: stale closure
    const incrementAsync = () => {
        setTimeout(() => {
            setCount(count + 1); // Uses stale count value
        }, 1000);
    };
    
    // Solution: functional update
    const incrementAsyncCorrect = () => {
        setTimeout(() => {
            setCount(prevCount => prevCount + 1); // Always uses latest value
        }, 1000);
    };
    
    // Multiple updates in sequence
    const incrementThreeTimes = () => {
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);
    };
    
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={incrementAsync}>Increment Async (Wrong)</button>
            <button onClick={incrementAsyncCorrect}>Increment Async (Correct)</button>
            <button onClick={incrementThreeTimes}>Increment 3 Times</button>
        </div>
    );
}
```

## useReducer Hook

For more complex state logic, `useReducer` provides a Redux-like pattern within components.

### Basic useReducer

```jsx
import React, { useReducer } from 'react';

// Reducer function
function counterReducer(state, action) {
    switch (action.type) {
        case 'INCREMENT':
            return { count: state.count + 1 };
        case 'DECREMENT':
            return { count: state.count - 1 };
        case 'RESET':
            return { count: 0 };
        case 'SET':
            return { count: action.payload };
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}

function Counter() {
    const [state, dispatch] = useReducer(counterReducer, { count: 0 });
    
    return (
        <div>
            <h2>Count: {state.count}</h2>
            <button onClick={() => dispatch({ type: 'INCREMENT' })}>
                +
            </button>
            <button onClick={() => dispatch({ type: 'DECREMENT' })}>
                -
            </button>
            <button onClick={() => dispatch({ type: 'RESET' })}>
                Reset
            </button>
            <button onClick={() => dispatch({ type: 'SET', payload: 10 })}>
                Set to 10
            </button>
        </div>
    );
}
```

### Complex State with useReducer

```jsx
// Complex state shape
const initialState = {
    user: null,
    posts: [],
    loading: false,
    error: null,
    filters: {
        category: 'all',
        sortBy: 'date'
    }
};

function appReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null
            };
            
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                [action.dataType]: action.payload
            };
            
        case 'FETCH_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
            
        case 'UPDATE_FILTER':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.filterType]: action.payload
                }
            };
            
        case 'ADD_POST':
            return {
                ...state,
                posts: [...state.posts, action.payload]
            };
            
        case 'DELETE_POST':
            return {
                ...state,
                posts: state.posts.filter(post => post.id !== action.payload)
            };
            
        case 'UPDATE_POST':
            return {
                ...state,
                posts: state.posts.map(post =>
                    post.id === action.payload.id
                        ? { ...post, ...action.payload.updates }
                        : post
                )
            };
            
        default:
            return state;
    }
}

function BlogApp() {
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    const fetchPosts = async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();
            dispatch({ 
                type: 'FETCH_SUCCESS', 
                dataType: 'posts', 
                payload: posts 
            });
        } catch (error) {
            dispatch({ 
                type: 'FETCH_ERROR', 
                payload: error.message 
            });
        }
    };
    
    const addPost = (post) => {
        dispatch({ type: 'ADD_POST', payload: post });
    };
    
    const updateFilter = (filterType, value) => {
        dispatch({ 
            type: 'UPDATE_FILTER', 
            filterType, 
            payload: value 
        });
    };
    
    return (
        <div>
            {state.loading && <div>Loading...</div>}
            {state.error && <div>Error: {state.error}</div>}
            
            <FilterControls 
                filters={state.filters}
                onFilterChange={updateFilter}
            />
            
            <PostList 
                posts={state.posts}
                filters={state.filters}
                onAddPost={addPost}
            />
        </div>
    );
}
```

## Context API

The Context API allows you to share state across components without prop drilling.

### Creating and Using Context

```jsx
import React, { createContext, useContext, useReducer } from 'react';

// Create context
const ThemeContext = createContext();

// Theme provider component
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    
    const value = {
        theme,
        toggleTheme
    };
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use theme context
function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Component using the context
function Header() {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <header className={`header theme-${theme}`}>
            <h1>My App</h1>
            <button onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'dark' : 'light'} theme
            </button>
        </header>
    );
}

// App with provider
function App() {
    return (
        <ThemeProvider>
            <div className="app">
                <Header />
                <main>
                    <Content />
                </main>
            </div>
        </ThemeProvider>
    );
}
```

### Complex Context with useReducer

```jsx
// Auth context with reducer
const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null
            };
            
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                user: action.payload,
                isAuthenticated: true
            };
            
        case 'LOGIN_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload,
                isAuthenticated: false
            };
            
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null
            };
            
        case 'UPDATE_PROFILE':
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload
                }
            };
            
        default:
            return state;
    }
};

function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    });
    
    const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }
            
            const user = await response.json();
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
            dispatch({ type: 'LOGIN_ERROR', payload: error.message });
        }
    };
    
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };
    
    const updateProfile = (updates) => {
        dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    };
    
    const value = {
        ...state,
        login,
        logout,
        updateProfile
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
```

## State Management Patterns

### Lifting State Up

```jsx
// Parent component manages shared state
function ShoppingApp() {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
    
    return (
        <div>
            <ProductList 
                products={products}
                onAddToCart={addToCart}
            />
            <Cart 
                items={cart}
                onRemoveItem={removeFromCart}
            />
        </div>
    );
}
```

### Custom Hooks for State Logic

```jsx
// Custom hook for form state
function useForm(initialValues, validationRules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const setValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const setTouched = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };
    
    const validate = () => {
        const newErrors = {};
        
        Object.keys(validationRules).forEach(field => {
            const rule = validationRules[field];
            const value = values[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                newErrors[field] = `${field} is required`;
            } else if (rule.minLength && value.length < rule.minLength) {
                newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
            } else if (rule.pattern && !rule.pattern.test(value)) {
                newErrors[field] = rule.message || `${field} is invalid`;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };
    
    return {
        values,
        errors,
        touched,
        setValue,
        setTouched,
        validate,
        reset,
        isValid: Object.keys(errors).length === 0
    };
}

// Usage of custom hook
function ContactForm() {
    const { values, errors, touched, setValue, setTouched, validate, reset } = useForm(
        {
            name: '',
            email: '',
            message: ''
        },
        {
            name: { required: true, minLength: 2 },
            email: { 
                required: true, 
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email'
            },
            message: { required: true, minLength: 10 }
        }
    );
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Form submitted:', values);
            reset();
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={values.name}
                    onChange={(e) => setValue('name', e.target.value)}
                    onBlur={() => setTouched('name')}
                />
                {touched.name && errors.name && (
                    <span className="error">{errors.name}</span>
                )}
            </div>
            
            <div>
                <input
                    type="email"
                    placeholder="Email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                />
                {touched.email && errors.email && (
                    <span className="error">{errors.email}</span>
                )}
            </div>
            
            <div>
                <textarea
                    placeholder="Message"
                    value={values.message}
                    onChange={(e) => setValue('message', e.target.value)}
                    onBlur={() => setTouched('message')}
                />
                {touched.message && errors.message && (
                    <span className="error">{errors.message}</span>
                )}
            </div>
            
            <button type="submit">Send Message</button>
        </form>
    );
}
```

## Best Practices

1. **Start with useState** for simple state, move to useReducer for complex state
2. **Use functional updates** when new state depends on previous state
3. **Avoid deep nesting** in state objects
4. **Use Context sparingly** - don't put everything in global state
5. **Create custom hooks** to encapsulate and reuse state logic
6. **Keep state as close to where it's used** as possible
7. **Use multiple state variables** instead of one large object when values are independent

Understanding these state management patterns is essential for building maintainable React applications that scale well as they grow in complexity.
