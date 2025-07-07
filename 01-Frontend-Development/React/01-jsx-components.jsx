// JSX Syntax and Component Architecture - Practical Examples

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// ============================================================================
// 1. BASIC JSX AND FUNCTIONAL COMPONENTS
// ============================================================================

// Simple functional component
function Welcome() {
    return <h1>Welcome to React!</h1>;
}

// Component with props
function Greeting({ name, age, isVip = false }) {
    return (
        <div className="greeting">
            <h2>Hello, {name}!</h2>
            <p>You are {age} years old</p>
            {isVip && <span className="vip-badge">VIP Member</span>}
        </div>
    );
}

// Component with complex JSX
function UserProfile({ user }) {
    const { name, email, avatar, bio, skills, socialLinks } = user;
    
    return (
        <div className="user-profile">
            <div className="profile-header">
                <img 
                    src={avatar || '/default-avatar.png'} 
                    alt={`${name}'s avatar`}
                    className="avatar"
                />
                <div className="user-info">
                    <h1>{name}</h1>
                    <p className="email">{email}</p>
                    {bio && <p className="bio">{bio}</p>}
                </div>
            </div>
            
            {skills && skills.length > 0 && (
                <div className="skills-section">
                    <h3>Skills</h3>
                    <div className="skills-list">
                        {skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="social-links">
                    <h3>Connect</h3>
                    {Object.entries(socialLinks).map(([platform, url]) => (
                        <a 
                            key={platform} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`social-link ${platform}`}
                        >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 2. COMPONENT COMPOSITION PATTERNS
// ============================================================================

// Reusable Button component
function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'medium',
    disabled = false,
    loading = false,
    icon = null,
    ...props 
}) {
    const baseClasses = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const disabledClass = disabled || loading ? 'btn-disabled' : '';
    
    const className = [baseClasses, variantClass, sizeClass, disabledClass]
        .filter(Boolean)
        .join(' ');
    
    return (
        <button 
            className={className}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="spinner">⟳</span>}
            {icon && <span className="icon">{icon}</span>}
            {children}
        </button>
    );
}

// Card component with composition
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

// Modal component with portal-like behavior
function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
    if (!isOpen) return null;
    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className={`modal modal-${size}`}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 3. ADVANCED COMPONENT PATTERNS
// ============================================================================

// Higher-Order Component (HOC) for loading states
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

// Render props component for data fetching
function DataFetcher({ url, render, fallback = null }) {
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
                
                if (!isCancelled) {
                    // Mock data based on URL
                    const mockData = {
                        '/api/users': [
                            { id: 1, name: 'John Doe', email: 'john@example.com' },
                            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                        ],
                        '/api/posts': [
                            { id: 1, title: 'First Post', content: 'Hello World' },
                            { id: 2, title: 'Second Post', content: 'React is awesome' }
                        ]
                    };
                    
                    setData(mockData[url] || []);
                    setLoading(false);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err);
                    setLoading(false);
                }
            }
        };
        
        fetchData();
        
        return () => {
            isCancelled = true;
        };
    }, [url]);
    
    return render({ data, loading, error }) || fallback;
}

// Compound component pattern
function Tabs({ children, defaultTab = 0 }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const tabs = React.Children.toArray(children);
    
    return (
        <div className="tabs">
            <div className="tab-headers">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tab-header ${index === activeTab ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
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
    return <div className="tab-panel">{children}</div>;
}

// ============================================================================
// 4. CONDITIONAL RENDERING PATTERNS
// ============================================================================

function ConditionalRenderingExamples({ user, notifications, theme }) {
    // Early return pattern
    if (!user) {
        return <LoginPrompt />;
    }
    
    return (
        <div className={`app theme-${theme}`}>
            {/* Simple conditional with && */}
            {user.isAdmin && (
                <div className="admin-panel">
                    <h3>Admin Panel</h3>
                    <AdminControls />
                </div>
            )}
            
            {/* Ternary operator */}
            {notifications.length > 0 ? (
                <NotificationList notifications={notifications} />
            ) : (
                <div className="no-notifications">
                    <p>No new notifications</p>
                </div>
            )}
            
            {/* Complex conditional logic with IIFE */}
            {(() => {
                switch (user.subscription) {
                    case 'premium':
                        return <PremiumDashboard user={user} />;
                    case 'basic':
                        return <BasicDashboard user={user} />;
                    default:
                        return <FreeDashboard user={user} />;
                }
            })()}
            
            {/* Conditional styling */}
            <div 
                className={`status-indicator ${user.isOnline ? 'online' : 'offline'}`}
                style={{
                    backgroundColor: user.isOnline ? '#4CAF50' : '#f44336',
                    color: 'white'
                }}
            >
                {user.isOnline ? 'Online' : 'Offline'}
            </div>
        </div>
    );
}

// ============================================================================
// 5. DYNAMIC COMPONENT RENDERING
// ============================================================================

// Component registry for dynamic rendering
const componentRegistry = {
    text: ({ content, style }) => <p style={style}>{content}</p>,
    heading: ({ content, level = 1, style }) => {
        const Tag = `h${level}`;
        return <Tag style={style}>{content}</Tag>;
    },
    image: ({ src, alt, style }) => <img src={src} alt={alt} style={style} />,
    button: ({ text, onClick, variant = 'primary' }) => (
        <Button onClick={onClick} variant={variant}>{text}</Button>
    ),
    list: ({ items, ordered = false }) => {
        const Tag = ordered ? 'ol' : 'ul';
        return (
            <Tag>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </Tag>
        );
    }
};

function DynamicRenderer({ components }) {
    return (
        <div className="dynamic-content">
            {components.map((component, index) => {
                const { type, props } = component;
                const Component = componentRegistry[type];
                
                if (!Component) {
                    return (
                        <div key={index} className="unknown-component">
                            Unknown component type: {type}
                        </div>
                    );
                }
                
                return <Component key={index} {...props} />;
            })}
        </div>
    );
}

// ============================================================================
// 6. PRACTICAL EXAMPLES
// ============================================================================

// Product card with all patterns combined
function ProductCard({ product, onAddToCart, onToggleFavorite, isInCart, isFavorite }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };
    
    const handleImageLoad = () => setImageLoaded(true);
    const handleImageError = () => setImageError(true);
    
    const handleAddToCart = () => {
        onAddToCart(product.id);
    };
    
    const handleToggleFavorite = () => {
        onToggleFavorite(product.id);
    };
    
    if (!product) {
        return <div className="product-card-error">Product not found</div>;
    }
    
    return (
        <Card className="product-card">
            <div className="product-image-container">
                {!imageLoaded && !imageError && (
                    <div className="image-placeholder">Loading...</div>
                )}
                
                {imageError ? (
                    <div className="image-error">Image not available</div>
                ) : (
                    <img
                        src={product.image}
                        alt={product.name}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                )}
                
                <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="price-container">
                    <span className="current-price">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                
                {product.rating && (
                    <div className="rating">
                        <span className="stars">
                            {'★'.repeat(Math.floor(product.rating))}
                            {'☆'.repeat(5 - Math.floor(product.rating))}
                        </span>
                        <span className="rating-text">
                            {product.rating} ({product.reviewCount} reviews)
                        </span>
                    </div>
                )}
                
                <div className="product-actions">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isInCart || !product.inStock}
                        variant={isInCart ? 'success' : 'primary'}
                        icon={isInCart ? '✓' : '🛒'}
                    >
                        {isInCart ? 'In Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Main App component demonstrating all patterns
function App() {
    const [user] = useState({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg',
        bio: 'Full-stack developer passionate about React',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        socialLinks: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe'
        },
        isAdmin: true,
        isOnline: true,
        subscription: 'premium'
    });
    
    const [notifications] = useState([
        { id: 1, message: 'Welcome to the app!', type: 'info' },
        { id: 2, message: 'Your profile is 90% complete', type: 'warning' }
    ]);
    
    const [products] = useState([
        {
            id: 1,
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: 199.99,
            originalPrice: 249.99,
            image: '/headphones.jpg',
            rating: 4.5,
            reviewCount: 128,
            inStock: true,
            discount: 20
        }
    ]);
    
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    
    const handleAddToCart = (productId) => {
        setCart(prev => [...prev, productId]);
    };
    
    const handleToggleFavorite = (productId) => {
        setFavorites(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };
    
    return (
        <div className="app">
            <UserProfile user={user} />
            
            <Tabs defaultTab={0}>
                <TabPanel title="Products">
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onToggleFavorite={handleToggleFavorite}
                                isInCart={cart.includes(product.id)}
                                isFavorite={favorites.includes(product.id)}
                            />
                        ))}
                    </div>
                </TabPanel>
                
                <TabPanel title="Data">
                    <DataFetcher
                        url="/api/users"
                        render={({ data, loading, error }) => {
                            if (loading) return <div>Loading users...</div>;
                            if (error) return <div>Error: {error.message}</div>;
                            return (
                                <div>
                                    <h3>Users</h3>
                                    {data.map(user => (
                                        <div key={user.id}>{user.name} - {user.email}</div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                </TabPanel>
            </Tabs>
            
            <ConditionalRenderingExamples
                user={user}
                notifications={notifications}
                theme="light"
            />
        </div>
    );
}

// PropTypes for type checking
UserProfile.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        bio: PropTypes.string,
        skills: PropTypes.arrayOf(PropTypes.string),
        socialLinks: PropTypes.object
    }).isRequired
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    icon: PropTypes.node
};

export default App;
