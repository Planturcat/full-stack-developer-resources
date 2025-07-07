# JSX Syntax and Component Architecture

JSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like code within JavaScript. It's the foundation of React development and enables a declarative approach to building user interfaces.

## What is JSX?

JSX allows you to write HTML-like syntax directly in JavaScript, which gets transpiled to regular JavaScript function calls.

```jsx
// JSX syntax
const element = <h1>Hello, World!</h1>;

// Transpiled JavaScript
const element = React.createElement('h1', null, 'Hello, World!');
```

### JSX Rules

1. **Single Parent Element**: JSX expressions must have one parent element
2. **Self-Closing Tags**: All tags must be properly closed
3. **camelCase Attributes**: HTML attributes use camelCase (className, onClick)
4. **JavaScript Expressions**: Use curly braces {} for JavaScript expressions

```jsx
// Valid JSX
const validJSX = (
    <div>
        <h1>Title</h1>
        <p>Content</p>
        <img src="image.jpg" alt="Description" />
    </div>
);

// Using React Fragment to avoid extra div
const fragmentJSX = (
    <>
        <h1>Title</h1>
        <p>Content</p>
    </>
);

// JavaScript expressions in JSX
const name = "John";
const age = 30;
const greeting = (
    <div>
        <h1>Hello, {name}!</h1>
        <p>You are {age} years old</p>
        <p>Next year you'll be {age + 1}</p>
    </div>
);
```

## Functional Components

Functional components are the modern way to create React components. They're JavaScript functions that return JSX.

### Basic Functional Component

```jsx
// Simple functional component
function Welcome() {
    return <h1>Welcome to React!</h1>;
}

// Arrow function component
const Welcome = () => {
    return <h1>Welcome to React!</h1>;
};

// Implicit return for simple components
const Welcome = () => <h1>Welcome to React!</h1>;
```

### Components with Props

Props (properties) are how data is passed from parent to child components.

```jsx
// Component that accepts props
function Greeting({ name, age }) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>You are {age} years old</p>
        </div>
    );
}

// Using the component
function App() {
    return (
        <div>
            <Greeting name="Alice" age={25} />
            <Greeting name="Bob" age={30} />
        </div>
    );
}
```

### Props Destructuring and Default Values

```jsx
// Destructuring props in function parameters
function UserCard({ name, email, avatar, isOnline = false }) {
    return (
        <div className="user-card">
            <img src={avatar} alt={`${name}'s avatar`} />
            <h3>{name}</h3>
            <p>{email}</p>
            <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
}

// Alternative: destructuring in function body
function UserCard(props) {
    const { name, email, avatar, isOnline = false } = props;
    
    return (
        <div className="user-card">
            <img src={avatar} alt={`${name}'s avatar`} />
            <h3>{name}</h3>
            <p>{email}</p>
            <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
}
```

## Component Composition

Component composition is the practice of building complex UIs by combining simpler components.

### Container and Presentational Components

```jsx
// Presentational component (UI only)
function Button({ children, onClick, variant = 'primary', disabled = false }) {
    return (
        <button 
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

// Container component (logic and state)
function LoginForm() {
    const handleSubmit = () => {
        console.log('Form submitted');
    };
    
    const handleCancel = () => {
        console.log('Form cancelled');
    };
    
    return (
        <form>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <div className="button-group">
                <Button onClick={handleSubmit}>
                    Login
                </Button>
                <Button onClick={handleCancel} variant="secondary">
                    Cancel
                </Button>
            </div>
        </form>
    );
}
```

### Higher-Order Components (HOCs)

```jsx
// HOC that adds loading functionality
function withLoading(WrappedComponent) {
    return function WithLoadingComponent(props) {
        if (props.isLoading) {
            return <div>Loading...</div>;
        }
        
        return <WrappedComponent {...props} />;
    };
}

// Usage
const UserListWithLoading = withLoading(UserList);

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    
    return (
        <UserListWithLoading 
            users={users} 
            isLoading={isLoading} 
        />
    );
}
```

### Render Props Pattern

```jsx
// Component using render props
function DataFetcher({ url, render }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [url]);
    
    return render({ data, loading, error });
}

// Usage
function App() {
    return (
        <DataFetcher 
            url="/api/users"
            render={({ data, loading, error }) => {
                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error: {error.message}</div>;
                return <UserList users={data} />;
            }}
        />
    );
}
```

## JSX Advanced Patterns

### Conditional Rendering

```jsx
function UserProfile({ user, isLoggedIn }) {
    // Early return pattern
    if (!isLoggedIn) {
        return <LoginPrompt />;
    }
    
    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            
            {/* Conditional rendering with && */}
            {user.isAdmin && <AdminPanel />}
            
            {/* Conditional rendering with ternary */}
            {user.notifications.length > 0 ? (
                <NotificationList notifications={user.notifications} />
            ) : (
                <p>No new notifications</p>
            )}
            
            {/* Complex conditional logic */}
            {(() => {
                if (user.subscription === 'premium') {
                    return <PremiumFeatures />;
                } else if (user.subscription === 'basic') {
                    return <BasicFeatures />;
                } else {
                    return <FreeFeatures />;
                }
            })()}
        </div>
    );
}
```

### Dynamic Component Rendering

```jsx
// Component map for dynamic rendering
const componentMap = {
    text: TextComponent,
    image: ImageComponent,
    video: VideoComponent,
    button: ButtonComponent
};

function DynamicContent({ items }) {
    return (
        <div>
            {items.map(item => {
                const Component = componentMap[item.type];
                return Component ? (
                    <Component key={item.id} {...item.props} />
                ) : (
                    <div key={item.id}>Unknown component type: {item.type}</div>
                );
            })}
        </div>
    );
}
```

### Children and Composition

```jsx
// Component that uses children prop
function Card({ title, children, footer }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3>{title}</h3>
            </div>
            <div className="card-body">
                {children}
            </div>
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
}

// Usage with children
function App() {
    return (
        <Card 
            title="User Profile" 
            footer={<button>Edit Profile</button>}
        >
            <p>Name: John Doe</p>
            <p>Email: john@example.com</p>
            <img src="avatar.jpg" alt="Profile" />
        </Card>
    );
}

// Advanced children manipulation
function Tabs({ children, activeTab, onTabChange }) {
    const tabs = React.Children.toArray(children);
    
    return (
        <div className="tabs">
            <div className="tab-headers">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tab-header ${index === activeTab ? 'active' : ''}`}
                        onClick={() => onTabChange(index)}
                    >
                        {tab.props.title}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab]}
            </div>
        </div>
    );
}

function TabPanel({ title, children }) {
    return <div>{children}</div>;
}

// Usage
function App() {
    const [activeTab, setActiveTab] = useState(0);
    
    return (
        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
            <TabPanel title="Profile">
                <UserProfile />
            </TabPanel>
            <TabPanel title="Settings">
                <UserSettings />
            </TabPanel>
            <TabPanel title="History">
                <UserHistory />
            </TabPanel>
        </Tabs>
    );
}
```

## Component Architecture Best Practices

### Single Responsibility Principle

```jsx
// Bad: Component doing too many things
function UserDashboard() {
    // User data fetching
    // Profile management
    // Settings management
    // Notification handling
    // Analytics tracking
    // ... too much responsibility
}

// Good: Separated concerns
function UserDashboard() {
    return (
        <div className="dashboard">
            <UserProfile />
            <UserSettings />
            <NotificationCenter />
            <AnalyticsSummary />
        </div>
    );
}
```

### Prop Types and Validation

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, email, age, avatar, isOnline }) {
    return (
        <div className="user-card">
            <img src={avatar} alt={`${name}'s avatar`} />
            <h3>{name}</h3>
            <p>{email}</p>
            <p>Age: {age}</p>
            <span className={isOnline ? 'online' : 'offline'}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
}

UserCard.propTypes = {
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    age: PropTypes.number,
    avatar: PropTypes.string,
    isOnline: PropTypes.bool
};

UserCard.defaultProps = {
    age: 0,
    avatar: '/default-avatar.png',
    isOnline: false
};
```

### Component Organization

```jsx
// Good component structure
function ProductCard({ 
    product, 
    onAddToCart, 
    onToggleFavorite, 
    isInCart, 
    isFavorite 
}) {
    // Helper functions
    const formatPrice = (price) => `$${price.toFixed(2)}`;
    
    const handleAddToCart = () => {
        onAddToCart(product.id);
    };
    
    const handleToggleFavorite = () => {
        onToggleFavorite(product.id);
    };
    
    // Early returns for edge cases
    if (!product) {
        return <div>Product not found</div>;
    }
    
    // Main render
    return (
        <div className="product-card">
            <div className="product-image">
                <img src={product.image} alt={product.name} />
                <button 
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                >
                    ♥
                </button>
            </div>
            
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">{formatPrice(product.price)}</p>
                <p className="description">{product.description}</p>
                
                <button 
                    className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isInCart}
                >
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
```

Understanding JSX and component architecture is fundamental to building maintainable and scalable React applications. These patterns form the foundation for more advanced React concepts and patterns.
