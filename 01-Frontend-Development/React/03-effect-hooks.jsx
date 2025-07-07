// Effect Hooks in React - Practical Examples

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef, memo } from 'react';

// ============================================================================
// 1. BASIC useEffect EXAMPLES
// ============================================================================

// Document title updater
function DocumentTitleUpdater() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('');
    
    // Effect runs after every render
    useEffect(() => {
        document.title = `${name || 'App'} - Count: ${count}`;
    });
    
    // Effect with cleanup
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // Empty dependency array - runs once on mount
    
    return (
        <div className="document-title-updater">
            <h2>Document Title Updater</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
            />
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <p>Check the browser tab title!</p>
        </div>
    );
}

// Data fetcher with loading and error states
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let isCancelled = false;
        
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Simulate random error
                if (Math.random() < 0.2) {
                    throw new Error('Failed to fetch user data');
                }
                
                const userData = {
                    id: userId,
                    name: `User ${userId}`,
                    email: `user${userId}@example.com`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                    bio: `This is the bio for user ${userId}`,
                    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString()
                };
                
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
        
        return () => {
            isCancelled = true;
        };
    }, [userId]);
    
    if (loading) {
        return <div className="loading">Loading user profile...</div>;
    }
    
    if (error) {
        return (
            <div className="error">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }
    
    if (!user) {
        return <div>No user found</div>;
    }
    
    return (
        <div className="user-profile">
            <img src={user.avatar} alt={`${user.name}'s avatar`} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>{user.bio}</p>
            <p>Joined: {user.joinDate}</p>
        </div>
    );
}

// Timer with start/stop functionality
function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    
    useEffect(() => {
        let intervalId;
        
        if (isRunning) {
            intervalId = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning]);
    
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        setSeconds(0);
        setIsRunning(false);
        setLaps([]);
    };
    
    const handleLap = () => {
        setLaps(prevLaps => [...prevLaps, seconds]);
    };
    
    return (
        <div className="timer">
            <h2>Timer</h2>
            <div className="time-display">
                {formatTime(seconds)}
            </div>
            
            <div className="timer-controls">
                {!isRunning ? (
                    <button onClick={handleStart}>Start</button>
                ) : (
                    <button onClick={handleStop}>Stop</button>
                )}
                <button onClick={handleLap} disabled={!isRunning}>Lap</button>
                <button onClick={handleReset}>Reset</button>
            </div>
            
            {laps.length > 0 && (
                <div className="laps">
                    <h3>Laps</h3>
                    <ul>
                        {laps.map((lapTime, index) => (
                            <li key={index}>
                                Lap {index + 1}: {formatTime(lapTime)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 2. useLayoutEffect EXAMPLES
// ============================================================================

// Component that measures its own height
function MeasuredComponent() {
    const [height, setHeight] = useState(0);
    const [content, setContent] = useState('Short content');
    const divRef = useRef(null);
    
    useLayoutEffect(() => {
        if (divRef.current) {
            setHeight(divRef.current.offsetHeight);
        }
    });
    
    const addContent = () => {
        setContent(prev => prev + '\nMore content added to increase height.');
    };
    
    return (
        <div className="measured-component">
            <h2>Measured Component</h2>
            <p>Current height: {height}px</p>
            
            <div 
                ref={divRef}
                style={{ 
                    border: '2px solid #333', 
                    padding: '20px', 
                    margin: '10px 0',
                    whiteSpace: 'pre-line'
                }}
            >
                {content}
            </div>
            
            <button onClick={addContent}>Add Content</button>
        </div>
    );
}

// Tooltip with dynamic positioning
function Tooltip({ children, content }) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    
    useLayoutEffect(() => {
        if (visible && tooltipRef.current && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            let top = triggerRect.bottom + window.scrollY + 5;
            let left = triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
            
            // Adjust if tooltip goes off screen
            if (left < 5) left = 5;
            if (left + tooltipRect.width > window.innerWidth - 5) {
                left = window.innerWidth - tooltipRect.width - 5;
            }
            
            // If tooltip would go below viewport, show above trigger
            if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
                top = triggerRect.top + window.scrollY - tooltipRect.height - 5;
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
                style={{ cursor: 'help', textDecoration: 'underline' }}
            >
                {children}
            </span>
            
            {visible && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        background: '#333',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        zIndex: 1000,
                        maxWidth: '200px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
}

// ============================================================================
// 3. useMemo EXAMPLES
// ============================================================================

// Expensive calculation with memoization
function ExpensiveCalculator() {
    const [number, setNumber] = useState(10);
    const [multiplier, setMultiplier] = useState(1);
    const [count, setCount] = useState(0);
    
    // Expensive fibonacci calculation
    const fibonacci = useMemo(() => {
        console.log('Calculating fibonacci for:', number);
        
        const fib = (n) => {
            if (n <= 1) return n;
            return fib(n - 1) + fib(n - 2);
        };
        
        return fib(Math.min(number, 35)); // Limit to prevent browser freeze
    }, [number]);
    
    // Another expensive calculation
    const result = useMemo(() => {
        console.log('Calculating result...');
        return fibonacci * multiplier;
    }, [fibonacci, multiplier]);
    
    return (
        <div className="expensive-calculator">
            <h2>Expensive Calculator</h2>
            
            <div>
                <label>
                    Number (max 35): 
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(Math.min(35, parseInt(e.target.value) || 0))}
                        max="35"
                    />
                </label>
            </div>
            
            <div>
                <label>
                    Multiplier: 
                    <input
                        type="number"
                        value={multiplier}
                        onChange={(e) => setMultiplier(parseInt(e.target.value) || 1)}
                    />
                </label>
            </div>
            
            <p>Fibonacci of {number}: {fibonacci}</p>
            <p>Result (fibonacci × multiplier): {result}</p>
            
            {/* This button doesn't trigger expensive calculations */}
            <button onClick={() => setCount(count + 1)}>
                Unrelated Counter: {count}
            </button>
        </div>
    );
}

// List filtering and sorting with memoization
function ProductList({ products, searchTerm, sortBy }) {
    const filteredAndSortedProducts = useMemo(() => {
        console.log('Filtering and sorting products...');
        
        // Filter products
        let filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }, [products, searchTerm, sortBy]);
    
    return (
        <div className="product-list">
            <h3>Products ({filteredAndSortedProducts.length})</h3>
            <div className="products-grid">
                {filteredAndSortedProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <h4>{product.name}</h4>
                        <p>Category: {product.category}</p>
                        <p>Price: ${product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// 4. useCallback EXAMPLES
// ============================================================================

// Memoized child component
const ExpensiveChild = memo(({ onButtonClick, data, title }) => {
    console.log(`ExpensiveChild "${title}" rendered`);
    
    return (
        <div className="expensive-child">
            <h4>{title}</h4>
            <p>Data: {JSON.stringify(data)}</p>
            <button onClick={onButtonClick}>Click me</button>
        </div>
    );
});

function CallbackDemo() {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [otherState, setOtherState] = useState(0);
    
    // Without useCallback - recreated on every render
    const handleClick1Bad = () => {
        setCount1(count1 + 1);
    };
    
    // With useCallback - memoized function
    const handleClick1Good = useCallback(() => {
        setCount1(prev => prev + 1);
    }, []);
    
    // Callback with dependencies
    const handleClick2 = useCallback(() => {
        setCount2(prev => prev + 1);
        console.log(`Count2 will be: ${count2 + 1}`);
    }, [count2]);
    
    // Memoized data
    const data1 = useMemo(() => ({ value: count1 }), [count1]);
    const data2 = useMemo(() => ({ value: count2 }), [count2]);
    
    return (
        <div className="callback-demo">
            <h2>useCallback Demo</h2>
            
            <p>Count 1: {count1}</p>
            <p>Count 2: {count2}</p>
            <p>Other State: {otherState}</p>
            
            <button onClick={() => setOtherState(otherState + 1)}>
                Update Other State
            </button>
            
            {/* These children will re-render differently based on callback memoization */}
            <ExpensiveChild
                title="Bad Callback"
                onButtonClick={handleClick1Bad}
                data={data1}
            />
            
            <ExpensiveChild
                title="Good Callback"
                onButtonClick={handleClick1Good}
                data={data1}
            />
            
            <ExpensiveChild
                title="Callback with Deps"
                onButtonClick={handleClick2}
                data={data2}
            />
        </div>
    );
}

// ============================================================================
// 5. CUSTOM HOOKS
// ============================================================================

// Custom hook for window size
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });
    
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return windowSize;
}

// Custom hook for debounced value
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
}

// Custom hook for API calls
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
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock data based on URL
                const mockData = {
                    '/api/users': [
                        { id: 1, name: 'John Doe', email: 'john@example.com' },
                        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                    ],
                    '/api/products': [
                        { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
                        { id: 2, name: 'Book', price: 29, category: 'Education' }
                    ]
                };
                
                if (!isCancelled) {
                    setData(mockData[url] || []);
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

// ============================================================================
// 6. MAIN DEMO COMPONENT
// ============================================================================

function EffectHooksDemo() {
    const [selectedUser, setSelectedUser] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const windowSize = useWindowSize();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { data: products } = useApi('/api/products');
    
    const sampleProducts = products || [
        { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
        { id: 2, name: 'Book', price: 29, category: 'Education' },
        { id: 3, name: 'Phone', price: 699, category: 'Electronics' },
        { id: 4, name: 'Desk', price: 299, category: 'Furniture' }
    ];
    
    return (
        <div className="effect-hooks-demo">
            <h1>Effect Hooks Demo</h1>
            
            <div className="window-info">
                <p>Window size: {windowSize.width} × {windowSize.height}</p>
            </div>
            
            <div className="demo-section">
                <DocumentTitleUpdater />
            </div>
            
            <div className="demo-section">
                <h2>User Profile</h2>
                <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(parseInt(e.target.value))}
                >
                    <option value={1}>User 1</option>
                    <option value={2}>User 2</option>
                    <option value={3}>User 3</option>
                </select>
                <UserProfile userId={selectedUser} />
            </div>
            
            <div className="demo-section">
                <Timer />
            </div>
            
            <div className="demo-section">
                <MeasuredComponent />
            </div>
            
            <div className="demo-section">
                <h2>Tooltip Example</h2>
                <p>
                    Hover over <Tooltip content="This is a tooltip with dynamic positioning!">this text</Tooltip> to see the tooltip.
                </p>
            </div>
            
            <div className="demo-section">
                <ExpensiveCalculator />
            </div>
            
            <div className="demo-section">
                <h2>Product Search</h2>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="category">Sort by Category</option>
                </select>
                <p>Searching for: "{debouncedSearchTerm}"</p>
                <ProductList 
                    products={sampleProducts}
                    searchTerm={debouncedSearchTerm}
                    sortBy={sortBy}
                />
            </div>
            
            <div className="demo-section">
                <CallbackDemo />
            </div>
        </div>
    );
}

export default EffectHooksDemo;
