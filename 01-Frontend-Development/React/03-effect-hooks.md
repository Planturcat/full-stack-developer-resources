# Effect Hooks in React

Effect hooks allow you to perform side effects in functional components. They replace lifecycle methods from class components and provide powerful ways to handle data fetching, subscriptions, timers, and DOM manipulation.

## useEffect Hook

The `useEffect` hook is the most commonly used effect hook. It runs after every render by default, but can be controlled with dependencies.

### Basic useEffect

```jsx
import React, { useState, useEffect } from 'react';

function BasicEffect() {
    const [count, setCount] = useState(0);
    
    // Runs after every render
    useEffect(() => {
        document.title = `Count: ${count}`;
    });
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
```

### useEffect with Dependencies

```jsx
function DataFetcher({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Runs only when userId changes
    useEffect(() => {
        let isCancelled = false;
        
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                
                const userData = await response.json();
                
                if (!isCancelled) {
                    setUser(userData);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        
        fetchUser();
        
        // Cleanup function
        return () => {
            isCancelled = true;
        };
    }, [userId]); // Only re-run when userId changes
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>No user found</div>;
    
    return (
        <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}
```

### useEffect Cleanup

```jsx
function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    
    useEffect(() => {
        let intervalId;
        
        if (isRunning) {
            intervalId = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        }
        
        // Cleanup function - runs when effect is cleaned up
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning]); // Re-run when isRunning changes
    
    return (
        <div>
            <h2>Timer: {seconds}s</h2>
            <button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? 'Stop' : 'Start'}
            </button>
            <button onClick={() => setSeconds(0)}>Reset</button>
        </div>
    );
}
```

### Multiple useEffect Hooks

```jsx
function UserDashboard({ userId }) {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    
    // Effect for fetching user data
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]);
    
    // Effect for fetching posts
    useEffect(() => {
        if (user) {
            fetchUserPosts(user.id).then(setPosts);
        }
    }, [user]);
    
    // Effect for setting up notifications
    useEffect(() => {
        const subscription = subscribeToNotifications(userId);
        
        subscription.onMessage = (notification) => {
            setNotifications(prev => [...prev, notification]);
        };
        
        return () => {
            subscription.unsubscribe();
        };
    }, [userId]);
    
    // Effect for updating document title
    useEffect(() => {
        if (user) {
            document.title = `${user.name}'s Dashboard`;
        }
        
        return () => {
            document.title = 'My App';
        };
    }, [user]);
    
    return (
        <div>
            {user && <UserProfile user={user} />}
            <PostList posts={posts} />
            <NotificationList notifications={notifications} />
        </div>
    );
}
```

## useLayoutEffect Hook

`useLayoutEffect` is similar to `useEffect`, but it fires synchronously after all DOM mutations. Use it when you need to read layout from the DOM and synchronously re-render.

```jsx
import React, { useState, useLayoutEffect, useRef } from 'react';

function MeasureComponent() {
    const [height, setHeight] = useState(0);
    const divRef = useRef(null);
    
    useLayoutEffect(() => {
        // This runs synchronously after DOM mutations
        // but before the browser paints
        if (divRef.current) {
            setHeight(divRef.current.offsetHeight);
        }
    });
    
    return (
        <div>
            <div ref={divRef} style={{ padding: '20px', border: '1px solid black' }}>
                <p>This div's height is: {height}px</p>
                <p>Content that affects height...</p>
            </div>
        </div>
    );
}

// Tooltip positioning example
function Tooltip({ children, content }) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    
    useLayoutEffect(() => {
        if (visible && tooltipRef.current && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            let top = triggerRect.bottom + 5;
            let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
            
            // Adjust if tooltip goes off screen
            if (left < 0) left = 5;
            if (left + tooltipRect.width > window.innerWidth) {
                left = window.innerWidth - tooltipRect.width - 5;
            }
            
            setPosition({ top, left });
        }
    }, [visible]);
    
    return (
        <>
            <span
                ref={triggerRef}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
            >
                {children}
            </span>
            
            {visible && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        background: 'black',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        zIndex: 1000
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
}
```

## useMemo Hook

`useMemo` memoizes expensive calculations and only recalculates when dependencies change.

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveCalculation({ items, filter }) {
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Expensive filtering and sorting operation
    const processedItems = useMemo(() => {
        console.log('Processing items...'); // This should only log when dependencies change
        
        // Filter items
        const filtered = items.filter(item => 
            item.name.toLowerCase().includes(filter.toLowerCase())
        );
        
        // Sort items
        const sorted = filtered.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
        
        return sorted;
    }, [items, filter, sortOrder]); // Only recalculate when these change
    
    return (
        <div>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
            </button>
            
            <ul>
                {processedItems.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}

// Complex calculation example
function FibonacciCalculator() {
    const [number, setNumber] = useState(10);
    const [count, setCount] = useState(0);
    
    // Expensive fibonacci calculation
    const fibonacci = useMemo(() => {
        console.log('Calculating fibonacci...');
        
        const fib = (n) => {
            if (n <= 1) return n;
            return fib(n - 1) + fib(n - 2);
        };
        
        return fib(number);
    }, [number]); // Only recalculate when number changes
    
    return (
        <div>
            <input
                type="number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                max="40" // Prevent browser freeze
            />
            <p>Fibonacci of {number} is: {fibonacci}</p>
            
            {/* This button updates count but doesn't trigger fibonacci recalculation */}
            <button onClick={() => setCount(count + 1)}>
                Count: {count}
            </button>
        </div>
    );
}
```

## useCallback Hook

`useCallback` memoizes functions to prevent unnecessary re-renders of child components.

```jsx
import React, { useState, useCallback, memo } from 'react';

// Child component that only re-renders when props change
const ExpensiveChild = memo(({ onButtonClick, value }) => {
    console.log('ExpensiveChild rendered');
    
    return (
        <div>
            <p>Value: {value}</p>
            <button onClick={onButtonClick}>Click me</button>
        </div>
    );
});

function CallbackExample() {
    const [count, setCount] = useState(0);
    const [otherState, setOtherState] = useState(0);
    
    // Without useCallback - function is recreated on every render
    const handleClickBad = () => {
        setCount(count + 1);
    };
    
    // With useCallback - function is memoized
    const handleClickGood = useCallback(() => {
        setCount(prevCount => prevCount + 1);
    }, []); // Empty dependency array means function never changes
    
    // Callback with dependencies
    const handleClickWithDeps = useCallback(() => {
        console.log(`Current count: ${count}`);
        setCount(count + 1);
    }, [count]); // Function changes when count changes
    
    return (
        <div>
            <h2>Count: {count}</h2>
            
            {/* This will cause ExpensiveChild to re-render every time */}
            <ExpensiveChild 
                onButtonClick={handleClickBad} 
                value={count}
            />
            
            {/* This will only re-render ExpensiveChild when value changes */}
            <ExpensiveChild 
                onButtonClick={handleClickGood} 
                value={count}
            />
            
            <button onClick={() => setOtherState(otherState + 1)}>
                Other State: {otherState}
            </button>
        </div>
    );
}

// Real-world example: Search with debouncing
function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchQuery) => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }
            
            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${searchQuery}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );
    
    // Effect to trigger search when query changes
    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);
    
    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
            />
            
            {loading && <div>Searching...</div>}
            
            <ul>
                {results.map(result => (
                    <li key={result.id}>{result.title}</li>
                ))}
            </ul>
        </div>
    );
}

// Utility function for debouncing
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
}
```

## Custom Effect Hooks

Creating custom hooks to encapsulate effect logic:

```jsx
// Custom hook for data fetching
function useApi(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let isCancelled = false;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (!isCancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };
        
        fetchData();
        
        return () => {
            isCancelled = true;
        };
    }, [url]);
    
    return { data, loading, error };
}

// Custom hook for window size
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return windowSize;
}

// Custom hook for local storage
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

// Usage of custom hooks
function MyComponent() {
    const { data: users, loading, error } = useApi('/api/users');
    const { width, height } = useWindowSize();
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            <p>Window size: {width} x {height}</p>
            <p>Current theme: {theme}</p>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Theme
            </button>
            
            <ul>
                {users?.map(user => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

## Best Practices

1. **Use the dependency array correctly** - include all values from component scope that are used inside the effect
2. **Clean up effects** - always clean up subscriptions, timers, and event listeners
3. **Separate concerns** - use multiple useEffect hooks for different concerns
4. **Use useCallback and useMemo judiciously** - only when you have performance issues
5. **Prefer useLayoutEffect for DOM measurements** - when you need to read layout and synchronously re-render
6. **Create custom hooks** - to encapsulate and reuse effect logic
7. **Handle race conditions** - use cleanup functions to cancel async operations

Understanding effect hooks is crucial for managing side effects and optimizing performance in React applications.
