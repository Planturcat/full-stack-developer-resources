// Conditional Rendering and Lists - Practical Examples

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// 1. BASIC CONDITIONAL RENDERING
// ============================================================================

// Simple conditional rendering with early return
function UserGreeting({ user, isLoggedIn }) {
    // Early return pattern
    if (!isLoggedIn) {
        return (
            <div className="login-prompt">
                <h2>Welcome!</h2>
                <p>Please log in to access your account</p>
                <button className="login-btn">Log In</button>
            </div>
        );
    }
    
    if (!user) {
        return <div className="loading">Loading user data...</div>;
    }
    
    return (
        <div className="user-greeting">
            <h1>Welcome back, {user.name}! 👋</h1>
            
            {/* Conditional rendering with && */}
            {user.isAdmin && (
                <div className="admin-notice">
                    🔧 You have administrator privileges
                </div>
            )}
            
            {user.notifications && user.notifications.length > 0 && (
                <div className="notifications-badge">
                    📬 You have {user.notifications.length} new notifications
                </div>
            )}
            
            {user.isPremium && (
                <div className="premium-badge">
                    ⭐ Premium Member
                </div>
            )}
        </div>
    );
}

// Ternary operator examples
function StatusIndicator({ isOnline, lastSeen, status }) {
    const getStatusIcon = (status) => {
        const icons = {
            online: '🟢',
            away: '🟡',
            busy: '🔴',
            offline: '⚫'
        };
        return icons[status] || '❓';
    };
    
    return (
        <div className="status-indicator">
            {/* Simple ternary */}
            <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? (
                    <>🟢 Online</>
                ) : (
                    <>🔴 Last seen {lastSeen}</>
                )}
            </span>
            
            {/* Complex status with helper function */}
            <div className="detailed-status">
                {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            
            {/* Nested ternary (use sparingly) */}
            <div className="availability">
                {status === 'online' ? (
                    'Available now'
                ) : status === 'away' ? (
                    'Away - will respond later'
                ) : status === 'busy' ? (
                    'Busy - do not disturb'
                ) : (
                    'Offline'
                )}
            </div>
        </div>
    );
}

// Complex conditional logic
function Dashboard({ user, permissions, features, subscription }) {
    const canAccessFeature = useCallback((featureName) => {
        return features[featureName] && 
               permissions.includes(featureName) && 
               (subscription === 'premium' || subscription === 'enterprise');
    }, [features, permissions, subscription]);
    
    const renderMainContent = () => {
        switch (user.status) {
            case 'loading':
                return <LoadingSpinner message="Loading dashboard..." />;
            case 'error':
                return <ErrorMessage message="Failed to load dashboard" />;
            case 'empty':
                return <EmptyDashboard />;
            case 'success':
                return <DashboardContent user={user} />;
            default:
                return <ErrorMessage message="Unknown status" />;
        }
    };
    
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                {user.isPremium && <span className="premium-badge">Premium</span>}
                {user.isAdmin && <span className="admin-badge">Admin</span>}
            </header>
            
            <nav className="dashboard-nav">
                <NavItem to="/profile" icon="👤">Profile</NavItem>
                
                {canAccessFeature('analytics') && (
                    <NavItem to="/analytics" icon="📊">Analytics</NavItem>
                )}
                
                {canAccessFeature('reports') && (
                    <NavItem to="/reports" icon="📈">Reports</NavItem>
                )}
                
                {canAccessFeature('team') && (
                    <NavItem to="/team" icon="👥">Team</NavItem>
                )}
                
                {user.isAdmin && (
                    <NavItem to="/admin" icon="⚙️">Admin Panel</NavItem>
                )}
            </nav>
            
            <main className="dashboard-main">
                {renderMainContent()}
            </main>
        </div>
    );
}

// Helper components
function NavItem({ to, icon, children }) {
    return (
        <a href={to} className="nav-item">
            <span className="nav-icon">{icon}</span>
            <span className="nav-text">{children}</span>
        </a>
    );
}

function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-spinner">
            <div className="spinner">⟳</div>
            <p>{message}</p>
        </div>
    );
}

function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error-message">
            <div className="error-icon">❌</div>
            <p>{message}</p>
            {onRetry && <button onClick={onRetry}>Try Again</button>}
        </div>
    );
}

function EmptyDashboard() {
    return (
        <div className="empty-dashboard">
            <div className="empty-icon">📊</div>
            <h2>Welcome to your dashboard!</h2>
            <p>Start by adding some data or connecting your accounts.</p>
            <button className="cta-button">Get Started</button>
        </div>
    );
}

function DashboardContent({ user }) {
    return (
        <div className="dashboard-content">
            <h2>Welcome back, {user.name}!</h2>
            <p>Here's what's happening with your account.</p>
        </div>
    );
}

// ============================================================================
// 2. LIST RENDERING EXAMPLES
// ============================================================================

// Basic list with proper keys
function UserList({ users, onUserSelect, selectedUserId }) {
    if (!users || users.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No users found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        );
    }
    
    return (
        <div className="user-list">
            <h2>Users ({users.length})</h2>
            <ul className="users">
                {users.map(user => (
                    <UserListItem
                        key={user.id} // Always use unique, stable keys
                        user={user}
                        isSelected={user.id === selectedUserId}
                        onSelect={() => onUserSelect(user.id)}
                    />
                ))}
            </ul>
        </div>
    );
}

function UserListItem({ user, isSelected, onSelect }) {
    return (
        <li 
            className={`user-item ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={`${user.name}'s avatar`}
                className="user-avatar"
            />
            <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <span className="user-role">{user.role}</span>
            </div>
            <div className="user-status">
                {user.isOnline ? (
                    <span className="online">🟢 Online</span>
                ) : (
                    <span className="offline">⚫ Offline</span>
                )}
            </div>
        </li>
    );
}

// Filtered and sorted list
function ProductList({ products, searchTerm, sortBy, category, priceRange }) {
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products;
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term) ||
                product.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        // Filter by category
        if (category && category !== 'all') {
            filtered = filtered.filter(product => product.category === category);
        }
        
        // Filter by price range
        if (priceRange) {
            filtered = filtered.filter(product => 
                product.price >= priceRange.min && product.price <= priceRange.max
            );
        }
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'popular':
                    return b.sales - a.sales;
                default:
                    return 0;
            }
        });
        
        return filtered;
    }, [products, searchTerm, sortBy, category, priceRange]);
    
    return (
        <div className="product-list">
            <div className="list-header">
                <h2>Products</h2>
                <div className="list-stats">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                    {searchTerm && (
                        <span className="search-info">
                            for "{searchTerm}"
                        </span>
                    )}
                </div>
            </div>
            
            {filteredAndSortedProducts.length === 0 ? (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            ) : (
                <div className="products-grid">
                    {filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ProductCard({ product }) {
    const [isFavorite, setIsFavorite] = useState(false);
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };
    
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={index < rating ? 'star filled' : 'star'}>
                ⭐
            </span>
        ));
    };
    
    return (
        <div className="product-card">
            <div className="product-image">
                <img src={product.image} alt={product.name} />
                <button 
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => setIsFavorite(!isFavorite)}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
                {product.discount && (
                    <div className="discount-badge">
                        -{product.discount}%
                    </div>
                )}
            </div>
            
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-rating">
                    {renderStars(Math.floor(product.rating))}
                    <span className="rating-text">
                        {product.rating} ({product.reviewCount} reviews)
                    </span>
                </div>
                
                <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                
                <div className="product-tags">
                    {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
                
                <button className="add-to-cart-btn">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// 3. DYNAMIC LIST OPERATIONS
// ============================================================================

function TodoList() {
    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn React', completed: false, priority: 'high', createdAt: new Date('2024-01-01') },
        { id: 2, text: 'Build a project', completed: false, priority: 'medium', createdAt: new Date('2024-01-02') },
        { id: 3, text: 'Deploy to production', completed: true, priority: 'low', createdAt: new Date('2024-01-03') }
    ]);
    
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [sortBy, setSortBy] = useState('created'); // created, priority, alphabetical
    
    const addTodo = () => {
        if (newTodo.trim()) {
            const todo = {
                id: Date.now(),
                text: newTodo.trim(),
                completed: false,
                priority: 'medium',
                createdAt: new Date()
            };
            setTodos(prev => [...prev, todo]);
            setNewTodo('');
        }
    };
    
    const toggleTodo = (id) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    const deleteTodo = (id) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };
    
    const updateTodo = (id, newText) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, text: newText } : todo
        ));
    };
    
    const updatePriority = (id, priority) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, priority } : todo
        ));
    };
    
    const clearCompleted = () => {
        setTodos(prev => prev.filter(todo => !todo.completed));
    };
    
    const filteredAndSortedTodos = useMemo(() => {
        let filtered = todos;
        
        // Filter todos
        switch (filter) {
            case 'active':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
            default:
                // 'all' - no filtering
                break;
        }
        
        // Sort todos
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        return filtered;
    }, [todos, filter, sortBy]);
    
    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        return { total, completed, active };
    }, [todos]);
    
    return (
        <div className="todo-list">
            <h2>Todo List</h2>
            
            {/* Add new todo */}
            <div className="add-todo">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <button onClick={addTodo}>Add</button>
            </div>
            
            {/* Stats */}
            <div className="todo-stats">
                <span>Total: {stats.total}</span>
                <span>Active: {stats.active}</span>
                <span>Completed: {stats.completed}</span>
            </div>
            
            {/* Filters and sorting */}
            <div className="todo-controls">
                <div className="filters">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button 
                        className={filter === 'active' ? 'active' : ''}
                        onClick={() => setFilter('active')}
                    >
                        Active ({stats.active})
                    </button>
                    <button 
                        className={filter === 'completed' ? 'active' : ''}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({stats.completed})
                    </button>
                </div>
                
                <div className="sort-options">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="created">Date Created</option>
                        <option value="priority">Priority</option>
                        <option value="alphabetical">Alphabetical</option>
                    </select>
                </div>
                
                {stats.completed > 0 && (
                    <button onClick={clearCompleted} className="clear-completed">
                        Clear Completed
                    </button>
                )}
            </div>
            
            {/* Todo items */}
            {filteredAndSortedTodos.length === 0 ? (
                <div className="empty-todos">
                    {filter === 'all' ? (
                        <p>No todos yet. Add one above!</p>
                    ) : filter === 'active' ? (
                        <p>No active todos. Great job! 🎉</p>
                    ) : (
                        <p>No completed todos yet.</p>
                    )}
                </div>
            ) : (
                <ul className="todos">
                    {filteredAndSortedTodos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onUpdate={updateTodo}
                            onUpdatePriority={updatePriority}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

function TodoItem({ todo, onToggle, onDelete, onUpdate, onUpdatePriority }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    
    const handleSave = () => {
        if (editText.trim() && editText !== todo.text) {
            onUpdate(todo.id, editText.trim());
        }
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };
    
    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ff4757',
            medium: '#ffa502',
            low: '#2ed573'
        };
        return colors[priority] || '#gray';
    };
    
    return (
        <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-main">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                
                {isEditing ? (
                    <div className="edit-mode">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            autoFocus
                        />
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </div>
                ) : (
                    <div className="view-mode">
                        <span className="todo-text">{todo.text}</span>
                        <div className="todo-meta">
                            <span 
                                className="priority"
                                style={{ color: getPriorityColor(todo.priority) }}
                            >
                                {todo.priority} priority
                            </span>
                            <span className="created-date">
                                {todo.createdAt.toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="todo-actions">
                <select
                    value={todo.priority}
                    onChange={(e) => onUpdatePriority(todo.id, e.target.value)}
                    disabled={todo.completed}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                
                <button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
                
                <button onClick={() => onDelete(todo.id)} className="delete-btn">
                    Delete
                </button>
            </div>
        </li>
    );
}

// ============================================================================
// 4. MAIN DEMO COMPONENT
// ============================================================================

function ConditionalRenderingListsDemo() {
    const [selectedUserId, setSelectedUserId] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [category, setCategory] = useState('all');
    const [user, setUser] = useState({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: true,
        isPremium: true,
        isOnline: true,
        notifications: [1, 2, 3],
        status: 'success'
    });
    
    const sampleUsers = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer', isOnline: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', isOnline: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
        { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Manager', isOnline: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' }
    ];
    
    const sampleProducts = [
        { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 1299, originalPrice: 1499, category: 'electronics', rating: 4.5, reviewCount: 128, image: '/laptop.jpg', tags: ['computer', 'work', 'portable'], discount: 13, sales: 1500, createdAt: '2024-01-01' },
        { id: 2, name: 'Coffee Mug', description: 'Ceramic coffee mug', price: 15, category: 'kitchen', rating: 4.2, reviewCount: 45, image: '/mug.jpg', tags: ['coffee', 'ceramic', 'kitchen'], sales: 800, createdAt: '2024-01-15' },
        { id: 3, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 49, category: 'electronics', rating: 4.7, reviewCount: 89, image: '/mouse.jpg', tags: ['computer', 'wireless', 'ergonomic'], sales: 1200, createdAt: '2024-01-10' }
    ];
    
    return (
        <div className="conditional-rendering-lists-demo">
            <h1>Conditional Rendering & Lists Demo</h1>
            
            <section className="demo-section">
                <h2>Conditional Rendering</h2>
                
                <div className="demo-controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={user.isAdmin}
                            onChange={(e) => setUser(prev => ({ ...prev, isAdmin: e.target.checked }))}
                        />
                        Is Admin
                    </label>
                    
                    <label>
                        <input
                            type="checkbox"
                            checked={user.isPremium}
                            onChange={(e) => setUser(prev => ({ ...prev, isPremium: e.target.checked }))}
                        />
                        Is Premium
                    </label>
                    
                    <label>
                        <input
                            type="checkbox"
                            checked={user.isOnline}
                            onChange={(e) => setUser(prev => ({ ...prev, isOnline: e.target.checked }))}
                        />
                        Is Online
                    </label>
                </div>
                
                <UserGreeting user={user} isLoggedIn={true} />
                <StatusIndicator 
                    isOnline={user.isOnline} 
                    lastSeen="2 hours ago" 
                    status={user.isOnline ? 'online' : 'offline'} 
                />
                <Dashboard 
                    user={user} 
                    permissions={['analytics', 'reports', 'team']}
                    features={{ analytics: true, reports: true, team: true }}
                    subscription="premium"
                />
            </section>
            
            <section className="demo-section">
                <h2>User List</h2>
                <UserList 
                    users={sampleUsers}
                    onUserSelect={setSelectedUserId}
                    selectedUserId={selectedUserId}
                />
            </section>
            
            <section className="demo-section">
                <h2>Product List with Filtering</h2>
                
                <div className="product-controls">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                    />
                    
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Sort by Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Rating</option>
                        <option value="newest">Newest</option>
                    </select>
                    
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="electronics">Electronics</option>
                        <option value="kitchen">Kitchen</option>
                    </select>
                </div>
                
                <ProductList
                    products={sampleProducts}
                    searchTerm={searchTerm}
                    sortBy={sortBy}
                    category={category}
                    priceRange={{ min: 0, max: 2000 }}
                />
            </section>
            
            <section className="demo-section">
                <h2>Dynamic Todo List</h2>
                <TodoList />
            </section>
        </div>
    );
}

export default ConditionalRenderingListsDemo;
