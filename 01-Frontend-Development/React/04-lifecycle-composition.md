# Component Lifecycle and Composition

Understanding React component lifecycle and composition patterns is essential for building maintainable and efficient applications. This guide covers lifecycle methods, component composition patterns, and best practices for organizing components.

## Component Lifecycle in Functional Components

With hooks, functional components can handle all lifecycle phases that were previously only available in class components.

### Mounting Phase

The mounting phase occurs when a component is being created and inserted into the DOM.

```jsx
import React, { useState, useEffect } from 'react';

function MountingExample() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Equivalent to componentDidMount
    useEffect(() => {
        console.log('Component mounted');
        
        // Initialize component
        const initializeComponent = async () => {
            try {
                // Fetch initial data
                const response = await fetch('/api/data');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initializeComponent();
        
        // Set up subscriptions
        const subscription = subscribeToUpdates((update) => {
            setData(prevData => ({ ...prevData, ...update }));
        });
        
        // Cleanup function (componentWillUnmount equivalent)
        return () => {
            console.log('Component will unmount');
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array = runs once on mount
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            <h2>Component Data</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
```

### Updating Phase

The updating phase occurs when a component's props or state change.

```jsx
function UpdatingExample({ userId, theme }) {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    
    // Effect for user data - runs when userId changes
    useEffect(() => {
        console.log('User ID changed, fetching new user data');
        
        const fetchUser = async () => {
            const response = await fetch(`/api/users/${userId}`);
            const userData = await response.json();
            setUser(userData);
        };
        
        fetchUser();
    }, [userId]);
    
    // Effect for posts - runs when user changes
    useEffect(() => {
        if (user) {
            console.log('User changed, fetching posts');
            
            const fetchPosts = async () => {
                const response = await fetch(`/api/users/${user.id}/posts`);
                const postsData = await response.json();
                setPosts(postsData);
            };
            
            fetchPosts();
        }
    }, [user]);
    
    // Effect for theme changes
    useEffect(() => {
        console.log('Theme changed to:', theme);
        document.body.className = `theme-${theme}`;
        
        return () => {
            document.body.className = '';
        };
    }, [theme]);
    
    return (
        <div>
            {user && (
                <div>
                    <h2>{user.name}</h2>
                    <div className="posts">
                        {posts.map(post => (
                            <div key={post.id}>{post.title}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
```

### Unmounting Phase

The unmounting phase occurs when a component is being removed from the DOM.

```jsx
function UnmountingExample() {
    const [isVisible, setIsVisible] = useState(true);
    
    return (
        <div>
            <button onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? 'Hide' : 'Show'} Component
            </button>
            
            {isVisible && <CleanupComponent />}
        </div>
    );
}

function CleanupComponent() {
    useEffect(() => {
        // Set up resources
        const timer = setInterval(() => {
            console.log('Timer tick');
        }, 1000);
        
        const eventListener = (e) => {
            console.log('Window resized');
        };
        window.addEventListener('resize', eventListener);
        
        // Cleanup function - runs when component unmounts
        return () => {
            console.log('Cleaning up resources');
            clearInterval(timer);
            window.removeEventListener('resize', eventListener);
        };
    }, []);
    
    return <div>Component with cleanup</div>;
}
```

## Component Composition Patterns

### Children Prop Pattern

The children prop allows components to be composed together flexibly.

```jsx
// Container component that uses children
function Card({ title, className = '', children }) {
    return (
        <div className={`card ${className}`}>
            {title && (
                <div className="card-header">
                    <h3>{title}</h3>
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}

// Usage
function App() {
    return (
        <Card title="User Profile">
            <img src="/avatar.jpg" alt="User Avatar" />
            <h4>John Doe</h4>
            <p>Software Developer</p>
            <button>Edit Profile</button>
        </Card>
    );
}
```

### Render Props Pattern

Render props allow sharing code between components using a prop whose value is a function.

```jsx
// Component that provides data via render prop
function DataProvider({ render, url }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [url]);
    
    return render({ data, loading, error });
}

// Usage with render prop
function UserList() {
    return (
        <DataProvider
            url="/api/users"
            render={({ data, loading, error }) => {
                if (loading) return <div>Loading users...</div>;
                if (error) return <div>Error: {error}</div>;
                
                return (
                    <ul>
                        {data?.map(user => (
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>
                );
            }}
        />
    );
}

// Alternative: children as function
function DataProviderWithChildren({ children, url }) {
    // ... same logic as above
    
    return children({ data, loading, error });
}

// Usage with children as function
function ProductList() {
    return (
        <DataProviderWithChildren url="/api/products">
            {({ data, loading, error }) => {
                if (loading) return <div>Loading products...</div>;
                if (error) return <div>Error: {error}</div>;
                
                return (
                    <div className="products">
                        {data?.map(product => (
                            <div key={product.id}>{product.name}</div>
                        ))}
                    </div>
                );
            }}
        </DataProviderWithChildren>
    );
}
```

### Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new component with additional functionality.

```jsx
// HOC for adding loading functionality
function withLoading(WrappedComponent) {
    return function WithLoadingComponent(props) {
        const { isLoading, loadingText = 'Loading...', ...restProps } = props;
        
        if (isLoading) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>{loadingText}</p>
                </div>
            );
        }
        
        return <WrappedComponent {...restProps} />;
    };
}

// HOC for adding error boundary functionality
function withErrorBoundary(WrappedComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
            return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
            console.error('Error caught by HOC:', error, errorInfo);
        }
        
        render() {
            if (this.state.hasError) {
                return (
                    <div className="error-boundary">
                        <h2>Something went wrong</h2>
                        <p>{this.state.error?.message}</p>
                        <button onClick={() => this.setState({ hasError: false, error: null })}>
                            Try Again
                        </button>
                    </div>
                );
            }
            
            return <WrappedComponent {...this.props} />;
        }
    };
}

// Usage
const UserListWithLoading = withLoading(UserList);
const SafeUserList = withErrorBoundary(UserListWithLoading);

function App() {
    const [isLoading, setIsLoading] = useState(true);
    
    return (
        <SafeUserList 
            isLoading={isLoading}
            loadingText="Fetching users..."
        />
    );
}
```

### Compound Components Pattern

Compound components work together to form a complete UI component.

```jsx
// Tabs compound component
function Tabs({ children, defaultTab = 0 }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    // Clone children and pass down props
    const enhancedChildren = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                isActive: index === activeTab,
                onActivate: () => setActiveTab(index),
                index
            });
        }
        return child;
    });
    
    return <div className="tabs">{enhancedChildren}</div>;
}

function TabList({ children }) {
    return <div className="tab-list">{children}</div>;
}

function Tab({ children, isActive, onActivate, index }) {
    return (
        <button
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={onActivate}
        >
            {children}
        </button>
    );
}

function TabPanels({ children, activeIndex }) {
    return (
        <div className="tab-panels">
            {React.Children.toArray(children)[activeIndex]}
        </div>
    );
}

function TabPanel({ children }) {
    return <div className="tab-panel">{children}</div>;
}

// Usage
function TabsExample() {
    return (
        <Tabs defaultTab={0}>
            <TabList>
                <Tab>Profile</Tab>
                <Tab>Settings</Tab>
                <Tab>History</Tab>
            </TabList>
            
            <TabPanels>
                <TabPanel>
                    <h3>Profile Content</h3>
                    <p>User profile information...</p>
                </TabPanel>
                <TabPanel>
                    <h3>Settings Content</h3>
                    <p>Application settings...</p>
                </TabPanel>
                <TabPanel>
                    <h3>History Content</h3>
                    <p>User activity history...</p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
```

### Provider Pattern

The provider pattern uses React Context to share data across components.

```jsx
// Create context
const UserContext = createContext();

// Provider component
function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState({});
    
    const login = async (credentials) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setPreferences(userData.preferences || {});
        }
    };
    
    const logout = () => {
        setUser(null);
        setPreferences({});
    };
    
    const updatePreferences = (newPreferences) => {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
    };
    
    const value = {
        user,
        preferences,
        login,
        logout,
        updatePreferences,
        isAuthenticated: !!user
    };
    
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use the context
function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Components using the context
function Header() {
    const { user, logout, isAuthenticated } = useUser();
    
    return (
        <header>
            <h1>My App</h1>
            {isAuthenticated ? (
                <div>
                    <span>Welcome, {user.name}!</span>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <LoginForm />
            )}
        </header>
    );
}

function LoginForm() {
    const { login } = useUser();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        login(credentials);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
            />
            <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
}
```

## Component Organization Patterns

### Container and Presentational Components

Separate logic from presentation for better maintainability.

```jsx
// Presentational component (UI only)
function UserCard({ user, onEdit, onDelete, isEditing }) {
    return (
        <div className="user-card">
            <img src={user.avatar} alt={`${user.name}'s avatar`} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>{user.role}</p>
            
            <div className="actions">
                <button onClick={() => onEdit(user.id)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button onClick={() => onDelete(user.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
}

// Container component (logic)
function UserCardContainer({ userId }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]);
    
    const handleEdit = (id) => {
        setIsEditing(!isEditing);
    };
    
    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await deleteUser(id);
            // Handle deletion logic
        }
    };
    
    if (!user) return <div>Loading...</div>;
    
    return (
        <UserCard
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={isEditing}
        />
    );
}
```

### Custom Hooks for Logic Reuse

Extract component logic into custom hooks for reusability.

```jsx
// Custom hook for managing form state
function useForm(initialValues, validationRules) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const setValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
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
            
            if (rule.required && !value) {
                newErrors[field] = `${field} is required`;
            } else if (rule.minLength && value.length < rule.minLength) {
                newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    return {
        values,
        errors,
        touched,
        setValue,
        setTouched,
        validate,
        isValid: Object.keys(errors).length === 0
    };
}

// Component using the custom hook
function ContactForm() {
    const { values, errors, touched, setValue, setTouched, validate } = useForm(
        { name: '', email: '', message: '' },
        {
            name: { required: true, minLength: 2 },
            email: { required: true },
            message: { required: true, minLength: 10 }
        }
    );
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Form submitted:', values);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={values.name}
                onChange={(e) => setValue('name', e.target.value)}
                onBlur={() => setTouched('name')}
                placeholder="Name"
            />
            {touched.name && errors.name && <span className="error">{errors.name}</span>}
            
            <input
                type="email"
                value={values.email}
                onChange={(e) => setValue('email', e.target.value)}
                onBlur={() => setTouched('email')}
                placeholder="Email"
            />
            {touched.email && errors.email && <span className="error">{errors.email}</span>}
            
            <textarea
                value={values.message}
                onChange={(e) => setValue('message', e.target.value)}
                onBlur={() => setTouched('message')}
                placeholder="Message"
            />
            {touched.message && errors.message && <span className="error">{errors.message}</span>}
            
            <button type="submit">Send</button>
        </form>
    );
}
```

## Best Practices

1. **Use functional components with hooks** instead of class components
2. **Separate concerns** - keep logic and presentation separate
3. **Use composition over inheritance** - prefer composition patterns
4. **Create reusable components** - design components to be flexible and reusable
5. **Extract custom hooks** - move reusable logic to custom hooks
6. **Use proper cleanup** - always clean up subscriptions and timers
7. **Optimize with React.memo** - prevent unnecessary re-renders
8. **Use Context sparingly** - don't put everything in global state

Understanding lifecycle and composition patterns helps you build more maintainable and efficient React applications.
