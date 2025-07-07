# Conditional Rendering and Lists

Conditional rendering and list rendering are fundamental concepts in React that allow you to create dynamic user interfaces based on state and data. This guide covers various patterns and best practices for rendering content conditionally and working with lists.

## Conditional Rendering

Conditional rendering in React allows you to render different components or elements based on certain conditions.

### Basic Conditional Rendering

```jsx
function UserGreeting({ user, isLoggedIn }) {
    // Early return pattern
    if (!isLoggedIn) {
        return <div>Please log in to continue</div>;
    }
    
    // Conditional rendering with &&
    return (
        <div>
            <h1>Welcome back, {user.name}!</h1>
            {user.isAdmin && <AdminPanel />}
            {user.notifications.length > 0 && (
                <NotificationBadge count={user.notifications.length} />
            )}
        </div>
    );
}
```

### Ternary Operator

```jsx
function StatusIndicator({ isOnline, lastSeen }) {
    return (
        <div className="status">
            {isOnline ? (
                <span className="online">🟢 Online</span>
            ) : (
                <span className="offline">
                    🔴 Last seen {lastSeen}
                </span>
            )}
        </div>
    );
}

function UserProfile({ user }) {
    return (
        <div className="profile">
            <img 
                src={user.avatar || '/default-avatar.png'} 
                alt="Avatar" 
            />
            <h2>{user.name}</h2>
            
            {/* Nested ternary (use sparingly) */}
            <p>
                {user.role === 'admin' ? (
                    'Administrator'
                ) : user.role === 'moderator' ? (
                    'Moderator'
                ) : (
                    'User'
                )}
            </p>
            
            {/* Better approach for multiple conditions */}
            <p>{getRoleDisplayName(user.role)}</p>
        </div>
    );
}

function getRoleDisplayName(role) {
    const roleNames = {
        admin: 'Administrator',
        moderator: 'Moderator',
        user: 'User',
        guest: 'Guest'
    };
    return roleNames[role] || 'Unknown';
}
```

### Complex Conditional Logic

```jsx
function Dashboard({ user, permissions, features }) {
    // Helper function for complex conditions
    const canAccessFeature = (featureName) => {
        return features[featureName] && 
               permissions.includes(featureName) && 
               user.subscription !== 'free';
    };
    
    // Switch-like pattern with object
    const renderContent = () => {
        const contentMap = {
            loading: () => <LoadingSpinner />,
            error: () => <ErrorMessage />,
            empty: () => <EmptyState />,
            success: () => <DashboardContent user={user} />
        };
        
        return contentMap[user.status] || contentMap.error;
    };
    
    return (
        <div className="dashboard">
            <header>
                <h1>Dashboard</h1>
                {user.isPremium && <PremiumBadge />}
            </header>
            
            <nav>
                {canAccessFeature('analytics') && (
                    <NavItem to="/analytics">Analytics</NavItem>
                )}
                {canAccessFeature('reports') && (
                    <NavItem to="/reports">Reports</NavItem>
                )}
                {user.isAdmin && (
                    <NavItem to="/admin">Admin Panel</NavItem>
                )}
            </nav>
            
            <main>
                {renderContent()()}
            </main>
        </div>
    );
}
```

### Conditional Styling

```jsx
function Button({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false,
    loading = false 
}) {
    // Conditional classes
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'btn-disabled',
        loading && 'btn-loading'
    ].filter(Boolean).join(' ');
    
    // Conditional styles
    const buttonStyles = {
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...(loading && { pointerEvents: 'none' })
    };
    
    return (
        <button 
            className={buttonClasses}
            style={buttonStyles}
            disabled={disabled || loading}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
}
```

## List Rendering

Rendering lists is a common pattern in React applications. The `map()` function is typically used to transform arrays into JSX elements.

### Basic List Rendering

```jsx
function UserList({ users }) {
    // Early return for empty list
    if (!users || users.length === 0) {
        return <div className="empty-state">No users found</div>;
    }
    
    return (
        <div className="user-list">
            <h2>Users ({users.length})</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id} className="user-item">
                        <img src={user.avatar} alt={`${user.name}'s avatar`} />
                        <div>
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### Keys in Lists

Keys help React identify which items have changed, been added, or removed.

```jsx
function TodoList({ todos, onToggle, onDelete }) {
    return (
        <ul className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id} // Use unique, stable ID
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}

// Bad: Using array index as key (can cause issues)
function BadExample({ items }) {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item.name}</li> // Avoid this
            ))}
        </ul>
    );
}

// Good: Using stable unique identifier
function GoodExample({ items }) {
    return (
        <ul>
            {items.map(item => (
                <li key={item.id}>{item.name}</li> // Use this
            ))}
        </ul>
    );
}
```

### Filtering and Sorting Lists

```jsx
function ProductList({ products, searchTerm, sortBy, category }) {
    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products;
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by category
        if (category && category !== 'all') {
            filtered = filtered.filter(product => product.category === category);
        }
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }, [products, searchTerm, sortBy, category]);
    
    return (
        <div className="product-list">
            <div className="list-header">
                <h2>Products ({filteredProducts.length})</h2>
                {filteredProducts.length === 0 && searchTerm && (
                    <p>No products found for "{searchTerm}"</p>
                )}
            </div>
            
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
```

### Nested Lists

```jsx
function CategoryList({ categories }) {
    return (
        <div className="category-list">
            {categories.map(category => (
                <div key={category.id} className="category-section">
                    <h2>{category.name}</h2>
                    
                    {category.subcategories && category.subcategories.length > 0 && (
                        <div className="subcategories">
                            {category.subcategories.map(subcategory => (
                                <div key={subcategory.id} className="subcategory">
                                    <h3>{subcategory.name}</h3>
                                    
                                    {subcategory.items && (
                                        <ul className="items-list">
                                            {subcategory.items.map(item => (
                                                <li key={item.id}>
                                                    <ItemComponent item={item} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
```

### Dynamic List Operations

```jsx
function ManageableList({ initialItems }) {
    const [items, setItems] = useState(initialItems);
    const [newItemName, setNewItemName] = useState('');
    
    const addItem = () => {
        if (newItemName.trim()) {
            const newItem = {
                id: Date.now(), // In real app, use proper ID generation
                name: newItemName.trim(),
                createdAt: new Date().toISOString()
            };
            setItems(prev => [...prev, newItem]);
            setNewItemName('');
        }
    };
    
    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };
    
    const updateItem = (id, newName) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, name: newName } : item
        ));
    };
    
    const moveItem = (fromIndex, toIndex) => {
        setItems(prev => {
            const newItems = [...prev];
            const [movedItem] = newItems.splice(fromIndex, 1);
            newItems.splice(toIndex, 0, movedItem);
            return newItems;
        });
    };
    
    return (
        <div className="manageable-list">
            <div className="add-item">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add new item..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
                <button onClick={addItem}>Add</button>
            </div>
            
            <ul className="items">
                {items.map((item, index) => (
                    <EditableListItem
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        onMove={moveItem}
                    />
                ))}
            </ul>
            
            {items.length === 0 && (
                <div className="empty-state">
                    No items yet. Add one above!
                </div>
            )}
        </div>
    );
}

function EditableListItem({ item, index, onUpdate, onRemove, onMove }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.name);
    
    const handleSave = () => {
        if (editValue.trim() && editValue !== item.name) {
            onUpdate(item.id, editValue.trim());
        }
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditValue(item.name);
        setIsEditing(false);
    };
    
    return (
        <li className="list-item">
            <div className="item-controls">
                <button onClick={() => onMove(index, Math.max(0, index - 1))}>
                    ↑
                </button>
                <button onClick={() => onMove(index, index + 1)}>
                    ↓
                </button>
            </div>
            
            <div className="item-content">
                {isEditing ? (
                    <div className="edit-mode">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
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
                        <span>{item.name}</span>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button onClick={() => onRemove(item.id)}>Delete</button>
                    </div>
                )}
            </div>
        </li>
    );
}
```

## Advanced Patterns

### Virtualized Lists

For large lists, consider virtualization to improve performance:

```jsx
function VirtualizedList({ items, itemHeight = 50, containerHeight = 400 }) {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );
    
    const visibleItems = items.slice(visibleStart, visibleEnd);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleStart * itemHeight;
    
    return (
        <div
            className="virtual-list-container"
            style={{ height: containerHeight, overflow: 'auto' }}
            onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div
                            key={items[visibleStart + index].id}
                            style={{ height: itemHeight }}
                            className="virtual-list-item"
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

### Grouped Lists

```jsx
function GroupedList({ items, groupBy }) {
    const groupedItems = useMemo(() => {
        const groups = {};
        
        items.forEach(item => {
            const groupKey = item[groupBy];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });
        
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [items, groupBy]);
    
    return (
        <div className="grouped-list">
            {groupedItems.map(([groupName, groupItems]) => (
                <div key={groupName} className="group">
                    <h3 className="group-header">
                        {groupName} ({groupItems.length})
                    </h3>
                    <ul className="group-items">
                        {groupItems.map(item => (
                            <li key={item.id}>{item.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
```

### Infinite Scrolling

```jsx
function InfiniteScrollList({ loadMore, hasMore, loading }) {
    const [items, setItems] = useState([]);
    const observerRef = useRef();
    
    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore().then(newItems => {
                    setItems(prev => [...prev, ...newItems]);
                });
            }
        });
        
        if (node) observerRef.current.observe(node);
    }, [loading, hasMore, loadMore]);
    
    return (
        <div className="infinite-scroll-list">
            {items.map((item, index) => (
                <div
                    key={item.id}
                    ref={index === items.length - 1 ? lastItemRef : null}
                    className="list-item"
                >
                    {item.name}
                </div>
            ))}
            
            {loading && <div className="loading">Loading more...</div>}
            {!hasMore && <div className="end">No more items</div>}
        </div>
    );
}
```

## Best Practices

1. **Use unique, stable keys** for list items
2. **Avoid using array indices as keys** when the list can change
3. **Memoize expensive filtering/sorting operations** with useMemo
4. **Use early returns** for cleaner conditional rendering
5. **Extract complex conditions** into helper functions
6. **Consider virtualization** for large lists
7. **Handle empty states** gracefully
8. **Use semantic HTML** (ul/ol for lists, proper headings)
9. **Optimize re-renders** with React.memo for list items
10. **Handle loading and error states** appropriately

Understanding these patterns will help you build dynamic, efficient user interfaces that handle data presentation effectively.
