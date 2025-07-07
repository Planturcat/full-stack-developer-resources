// Component Lifecycle and Composition - Practical Examples

import React, { useState, useEffect, useContext, createContext, useCallback, useMemo, memo } from 'react';

// ============================================================================
// 1. LIFECYCLE EXAMPLES
// ============================================================================

// Component demonstrating mounting lifecycle
function MountingDemo() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        console.log('🚀 Component mounted - setting up resources');
        
        // Simulate component initialization
        const initializeComponent = async () => {
            try {
                setLoading(true);
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate random error
                if (Math.random() < 0.2) {
                    throw new Error('Failed to initialize component');
                }
                
                const mockData = {
                    id: 1,
                    title: 'Component Data',
                    description: 'This data was loaded during component mounting',
                    timestamp: new Date().toISOString()
                };
                
                setData(mockData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        initializeComponent();
        
        // Set up event listeners
        const handleVisibilityChange = () => {
            console.log('👁️ Page visibility changed:', document.hidden ? 'hidden' : 'visible');
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup function (componentWillUnmount equivalent)
        return () => {
            console.log('🧹 Component unmounting - cleaning up resources');
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []); // Empty dependency array = runs once on mount
    
    if (loading) {
        return (
            <div className="mounting-demo loading">
                <div className="spinner">⟳</div>
                <p>Initializing component...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="mounting-demo error">
                <h3>❌ Initialization Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }
    
    return (
        <div className="mounting-demo success">
            <h3>✅ Component Mounted Successfully</h3>
            <div className="data-display">
                <h4>{data.title}</h4>
                <p>{data.description}</p>
                <small>Loaded at: {new Date(data.timestamp).toLocaleString()}</small>
            </div>
        </div>
    );
}

// Component demonstrating updating lifecycle
function UpdatingDemo({ userId, theme }) {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [updateCount, setUpdateCount] = useState(0);
    
    // Effect for user data - runs when userId changes
    useEffect(() => {
        console.log('👤 User ID changed, fetching new user data:', userId);
        setUpdateCount(prev => prev + 1);
        
        const fetchUser = async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const userData = {
                id: userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                joinDate: new Date(2020 + userId, userId % 12, userId % 28).toLocaleDateString()
            };
            
            setUser(userData);
        };
        
        fetchUser();
    }, [userId]);
    
    // Effect for posts - runs when user changes
    useEffect(() => {
        if (user) {
            console.log('📝 User changed, fetching posts for:', user.name);
            
            const fetchPosts = async () => {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const postsData = Array.from({ length: 3 }, (_, index) => ({
                    id: index + 1,
                    title: `Post ${index + 1} by ${user.name}`,
                    content: `This is the content of post ${index + 1}`,
                    date: new Date(2023, index * 2, index * 5).toLocaleDateString()
                }));
                
                setPosts(postsData);
            };
            
            fetchPosts();
        }
    }, [user]);
    
    // Effect for theme changes
    useEffect(() => {
        console.log('🎨 Theme changed to:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, [theme]);
    
    return (
        <div className={`updating-demo theme-${theme}`}>
            <h3>Updating Demo (Updates: {updateCount})</h3>
            
            {user ? (
                <div className="user-section">
                    <div className="user-info">
                        <img src={user.avatar} alt={`${user.name}'s avatar`} width="50" height="50" />
                        <div>
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                            <small>Joined: {user.joinDate}</small>
                        </div>
                    </div>
                    
                    <div className="posts-section">
                        <h4>Recent Posts</h4>
                        {posts.length > 0 ? (
                            <div className="posts-list">
                                {posts.map(post => (
                                    <div key={post.id} className="post-item">
                                        <h5>{post.title}</h5>
                                        <p>{post.content}</p>
                                        <small>{post.date}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Loading posts...</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

// Component demonstrating unmounting
function UnmountingDemo() {
    const [showChild, setShowChild] = useState(true);
    const [mountCount, setMountCount] = useState(1);
    
    const toggleChild = () => {
        setShowChild(prev => {
            if (!prev) {
                setMountCount(count => count + 1);
            }
            return !prev;
        });
    };
    
    return (
        <div className="unmounting-demo">
            <h3>Unmounting Demo</h3>
            <button onClick={toggleChild}>
                {showChild ? 'Unmount' : 'Mount'} Child Component
            </button>
            <p>Mount count: {mountCount}</p>
            
            {showChild && <CleanupChild key={mountCount} />}
        </div>
    );
}

function CleanupChild() {
    const [seconds, setSeconds] = useState(0);
    
    useEffect(() => {
        console.log('⏰ Setting up timer and event listeners');
        
        // Set up timer
        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        
        // Set up event listener
        const handleKeyPress = (e) => {
            console.log('🔤 Key pressed:', e.key);
        };
        
        window.addEventListener('keydown', handleKeyPress);
        
        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up timer and event listeners');
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);
    
    return (
        <div className="cleanup-child">
            <p>Child component alive for: {seconds} seconds</p>
            <p>Press any key to see console logs</p>
        </div>
    );
}

// ============================================================================
// 2. COMPOSITION PATTERNS
// ============================================================================

// Children prop pattern
function Card({ title, subtitle, children, actions, className = '' }) {
    return (
        <div className={`card ${className}`}>
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            
            <div className="card-body">
                {children}
            </div>
            
            {actions && (
                <div className="card-actions">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Render props pattern
function DataProvider({ render, url, refreshInterval = 0 }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock data based on URL
            const mockData = {
                '/api/users': [
                    { id: 1, name: 'Alice Johnson', role: 'Developer' },
                    { id: 2, name: 'Bob Smith', role: 'Designer' },
                    { id: 3, name: 'Carol Davis', role: 'Manager' }
                ],
                '/api/products': [
                    { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
                    { id: 2, name: 'Book', price: 29, category: 'Education' },
                    { id: 3, name: 'Coffee Mug', price: 15, category: 'Kitchen' }
                ]
            };
            
            setData(mockData[url] || []);
            setLastFetch(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url]);
    
    useEffect(() => {
        fetchData();
        
        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);
    
    return render({ 
        data, 
        loading, 
        error, 
        refetch: fetchData,
        lastFetch 
    });
}

// Higher-Order Component (HOC)
function withLoading(WrappedComponent) {
    return function WithLoadingComponent(props) {
        const { isLoading, loadingText = 'Loading...', ...restProps } = props;
        
        if (isLoading) {
            return (
                <div className="loading-container">
                    <div className="spinner">⟳</div>
                    <p>{loadingText}</p>
                </div>
            );
        }
        
        return <WrappedComponent {...restProps} />;
    };
}

function withErrorBoundary(WrappedComponent) {
    return class WithErrorBoundaryComponent extends React.Component {
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
                        <h3>🚨 Something went wrong</h3>
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

// Compound components pattern
function Tabs({ children, defaultTab = 0 }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    const tabHeaders = [];
    const tabPanels = [];
    
    React.Children.forEach(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Tab) {
            tabHeaders.push(
                React.cloneElement(child, {
                    key: index,
                    isActive: index === activeTab,
                    onClick: () => setActiveTab(index)
                })
            );
        } else if (React.isValidElement(child) && child.type === TabPanel) {
            tabPanels.push(child);
        }
    });
    
    return (
        <div className="tabs">
            <div className="tab-headers">
                {tabHeaders}
            </div>
            <div className="tab-content">
                {tabPanels[activeTab]}
            </div>
        </div>
    );
}

function Tab({ children, isActive, onClick }) {
    return (
        <button
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function TabPanel({ children }) {
    return <div className="tab-panel">{children}</div>;
}

// ============================================================================
// 3. PROVIDER PATTERN
// ============================================================================

// Theme context
const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
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

// ============================================================================
// 4. CONTAINER AND PRESENTATIONAL COMPONENTS
// ============================================================================

// Presentational component (UI only)
const UserCard = memo(({ user, onEdit, onDelete, isEditing }) => {
    console.log('🎨 UserCard rendered for:', user.name);
    
    return (
        <div className="user-card">
            <div className="user-avatar">
                <img src={user.avatar} alt={`${user.name}'s avatar`} width="60" height="60" />
            </div>
            
            <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <span className="user-role">{user.role}</span>
            </div>
            
            <div className="user-actions">
                <button 
                    onClick={() => onEdit(user.id)}
                    className={isEditing ? 'cancel' : 'edit'}
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button 
                    onClick={() => onDelete(user.id)}
                    className="delete"
                >
                    Delete
                </button>
            </div>
        </div>
    );
});

// Container component (logic)
function UserCardContainer({ user }) {
    const [isEditing, setIsEditing] = useState(false);
    
    const handleEdit = useCallback((id) => {
        console.log('✏️ Edit user:', id);
        setIsEditing(prev => !prev);
    }, []);
    
    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            console.log('🗑️ Delete user:', id);
            // Handle deletion logic here
        }
    }, []);
    
    return (
        <UserCard
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={isEditing}
        />
    );
}

// ============================================================================
// 5. MAIN DEMO COMPONENT
// ============================================================================

function LifecycleCompositionDemo() {
    const [selectedUserId, setSelectedUserId] = useState(1);
    const [showMountingDemo, setShowMountingDemo] = useState(true);
    const { theme, toggleTheme, changeFontSize } = useTheme();
    
    const sampleUsers = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
        { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' }
    ];
    
    return (
        <div className="lifecycle-composition-demo">
            <header className="demo-header">
                <h1>Lifecycle & Composition Demo</h1>
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
            
            <div className="demo-sections">
                {/* Lifecycle Examples */}
                <section className="demo-section">
                    <h2>Lifecycle Examples</h2>
                    
                    <Card title="Mounting Demo" className="lifecycle-card">
                        <button onClick={() => setShowMountingDemo(!showMountingDemo)}>
                            {showMountingDemo ? 'Unmount' : 'Mount'} Component
                        </button>
                        {showMountingDemo && <MountingDemo />}
                    </Card>
                    
                    <Card title="Updating Demo" className="lifecycle-card">
                        <div className="user-selector">
                            <label>Select User: </label>
                            <select 
                                value={selectedUserId} 
                                onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                            >
                                <option value={1}>User 1</option>
                                <option value={2}>User 2</option>
                                <option value={3}>User 3</option>
                            </select>
                        </div>
                        <UpdatingDemo userId={selectedUserId} theme={theme} />
                    </Card>
                    
                    <Card title="Unmounting Demo" className="lifecycle-card">
                        <UnmountingDemo />
                    </Card>
                </section>
                
                {/* Composition Examples */}
                <section className="demo-section">
                    <h2>Composition Patterns</h2>
                    
                    <Card title="Render Props Pattern" className="composition-card">
                        <DataProvider
                            url="/api/users"
                            render={({ data, loading, error, refetch, lastFetch }) => {
                                if (loading) return <div>Loading users...</div>;
                                if (error) return <div>Error: {error}</div>;
                                
                                return (
                                    <div>
                                        <div className="data-header">
                                            <h4>Users Data</h4>
                                            <button onClick={refetch}>Refresh</button>
                                            {lastFetch && (
                                                <small>Last updated: {lastFetch.toLocaleTimeString()}</small>
                                            )}
                                        </div>
                                        <div className="users-list">
                                            {data?.map(user => (
                                                <div key={user.id} className="user-item">
                                                    {user.name} - {user.role}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </Card>
                    
                    <Card title="Compound Components" className="composition-card">
                        <Tabs defaultTab={0}>
                            <Tab>Profile</Tab>
                            <Tab>Settings</Tab>
                            <Tab>Activity</Tab>
                            
                            <TabPanel>
                                <h4>Profile Tab</h4>
                                <p>User profile information and settings.</p>
                            </TabPanel>
                            
                            <TabPanel>
                                <h4>Settings Tab</h4>
                                <p>Application preferences and configuration.</p>
                            </TabPanel>
                            
                            <TabPanel>
                                <h4>Activity Tab</h4>
                                <p>Recent user activity and history.</p>
                            </TabPanel>
                        </Tabs>
                    </Card>
                    
                    <Card title="Container/Presentational Pattern" className="composition-card">
                        <div className="user-cards-grid">
                            {sampleUsers.map(user => (
                                <UserCardContainer key={user.id} user={user} />
                            ))}
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}

// Enhanced components with HOCs
const SafeLifecycleDemo = withErrorBoundary(LifecycleCompositionDemo);

function App() {
    return (
        <ThemeProvider>
            <SafeLifecycleDemo />
        </ThemeProvider>
    );
}

export default App;
