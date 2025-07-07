// Error Boundaries and Suspense - Practical Examples

import React, { Component, Suspense, lazy, useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// 1. ERROR BOUNDARY IMPLEMENTATIONS
// ============================================================================

// Basic Error Boundary Class Component
class BasicErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null 
        };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by BasicErrorBoundary:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log to external service in real app
        this.logError(error, errorInfo);
    }
    
    logError = (error, errorInfo) => {
        // Simulate logging to external service
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Error logged:', errorReport);
        // In real app: send to Sentry, LogRocket, etc.
    }
    
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <h2>🚨 Something went wrong</h2>
                        <p>We're sorry for the inconvenience. The error has been logged.</p>
                        
                        <div className="error-actions">
                            <button onClick={this.handleReset} className="retry-btn">
                                Try Again
                            </button>
                            <button onClick={() => window.location.reload()} className="reload-btn">
                                Reload Page
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details (Development)</summary>
                                <div className="error-info">
                                    <h4>Error:</h4>
                                    <pre>{this.state.error?.toString()}</pre>
                                    
                                    <h4>Component Stack:</h4>
                                    <pre>{this.state.errorInfo?.componentStack}</pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// Advanced Error Boundary with Retry Logic
class RetryErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            retryCount: 0,
            eventId: null
        };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        const eventId = this.generateEventId();
        
        console.error(`Error ${eventId}:`, error, errorInfo);
        
        this.setState({
            error,
            eventId
        });
        
        // Report to error tracking service
        this.reportError(error, errorInfo, eventId);
    }
    
    generateEventId = () => {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    reportError = (error, errorInfo, eventId) => {
        const errorReport = {
            eventId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            retryCount: this.state.retryCount,
            props: this.props,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Error reported:', errorReport);
        // Send to monitoring service
    }
    
    handleRetry = () => {
        const { maxRetries = 3 } = this.props;
        
        if (this.state.retryCount < maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                retryCount: prevState.retryCount + 1,
                eventId: null
            }));
        }
    }
    
    render() {
        if (this.state.hasError) {
            const { maxRetries = 3, fallback: CustomFallback } = this.props;
            const canRetry = this.state.retryCount < maxRetries;
            
            if (CustomFallback) {
                return (
                    <CustomFallback
                        error={this.state.error}
                        eventId={this.state.eventId}
                        retryCount={this.state.retryCount}
                        maxRetries={maxRetries}
                        canRetry={canRetry}
                        onRetry={this.handleRetry}
                    />
                );
            }
            
            return (
                <div className="retry-error-boundary">
                    <div className="error-icon">⚠️</div>
                    <h2>Oops! Something went wrong</h2>
                    <p>We encountered an unexpected error.</p>
                    
                    {this.state.eventId && (
                        <div className="error-id">
                            <strong>Error ID:</strong> <code>{this.state.eventId}</code>
                        </div>
                    )}
                    
                    <div className="retry-info">
                        <p>Attempt {this.state.retryCount + 1} of {maxRetries + 1}</p>
                    </div>
                    
                    <div className="error-actions">
                        {canRetry ? (
                            <button onClick={this.handleRetry} className="retry-btn">
                                🔄 Retry ({maxRetries - this.state.retryCount} attempts left)
                            </button>
                        ) : (
                            <div className="max-retries-reached">
                                <p>Maximum retry attempts reached.</p>
                                <button onClick={() => window.location.reload()} className="reload-btn">
                                    🔄 Reload Page
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// ============================================================================
// 2. COMPONENTS THAT CAN THROW ERRORS
// ============================================================================

// Component that randomly throws errors
function BuggyComponent({ shouldThrow = false, errorRate = 0.3 }) {
    const [count, setCount] = useState(0);
    
    const handleClick = () => {
        setCount(prev => prev + 1);
        
        // Randomly throw error
        if (shouldThrow && Math.random() < errorRate) {
            throw new Error(`Random error occurred! Count was: ${count}`);
        }
    };
    
    // Throw error during render
    if (shouldThrow && count > 5) {
        throw new Error('Count exceeded maximum value!');
    }
    
    return (
        <div className="buggy-component">
            <h3>Buggy Component</h3>
            <p>Count: {count}</p>
            <p>Error rate: {(errorRate * 100).toFixed(0)}%</p>
            <button onClick={handleClick}>
                Increment (might throw error)
            </button>
            <p className="warning">
                ⚠️ This component randomly throws errors for demonstration
            </p>
        </div>
    );
}

// Component that throws async errors
function AsyncBuggyComponent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            // Simulate async operation that might fail
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (Math.random() < 0.4) {
                throw new Error('Async operation failed!');
            }
            
            setData({ message: 'Data loaded successfully!', timestamp: new Date().toISOString() });
        } catch (error) {
            // Note: Error boundaries don't catch async errors
            // You need to handle these manually
            console.error('Async error (not caught by error boundary):', error);
            setData({ error: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="async-buggy-component">
            <h3>Async Buggy Component</h3>
            <button onClick={fetchData} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Data (might fail)'}
            </button>
            
            {data && (
                <div className="data-result">
                    {data.error ? (
                        <div className="error">❌ {data.error}</div>
                    ) : (
                        <div className="success">
                            ✅ {data.message}
                            <br />
                            <small>{data.timestamp}</small>
                        </div>
                    )}
                </div>
            )}
            
            <p className="note">
                📝 Note: Async errors are not caught by error boundaries
            </p>
        </div>
    );
}

// ============================================================================
// 3. SUSPENSE IMPLEMENTATIONS
// ============================================================================

// Simulate a resource that can be suspended
function createResource(promise) {
    let status = 'pending';
    let result;
    
    const suspender = promise.then(
        (data) => {
            status = 'success';
            result = data;
        },
        (error) => {
            status = 'error';
            result = error;
        }
    );
    
    return {
        read() {
            if (status === 'pending') {
                throw suspender; // This triggers Suspense
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
        }
    };
}

// Mock API functions
const mockApi = {
    fetchUser: (id) => new Promise(resolve => 
        setTimeout(() => resolve({
            id,
            name: `User ${id}`,
            email: `user${id}@example.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
        }), 1500)
    ),
    
    fetchPosts: (userId) => new Promise(resolve =>
        setTimeout(() => resolve([
            { id: 1, title: 'First Post', content: 'This is the first post content' },
            { id: 2, title: 'Second Post', content: 'This is the second post content' },
            { id: 3, title: 'Third Post', content: 'This is the third post content' }
        ]), 2000)
    ),
    
    fetchComments: (postId) => new Promise(resolve =>
        setTimeout(() => resolve([
            { id: 1, author: 'Alice', text: 'Great post!' },
            { id: 2, author: 'Bob', text: 'Very informative, thanks!' },
            { id: 3, author: 'Carol', text: 'Looking forward to more content like this.' }
        ]), 1000)
    )
};

// Components that use Suspense
function SuspenseUserProfile({ userId }) {
    const userResource = createResource(mockApi.fetchUser(userId));
    const user = userResource.read();
    
    return (
        <div className="user-profile">
            <img src={user.avatar} alt={`${user.name}'s avatar`} width="80" height="80" />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
        </div>
    );
}

function SuspenseUserPosts({ userId }) {
    const postsResource = createResource(mockApi.fetchPosts(userId));
    const posts = postsResource.read();
    
    return (
        <div className="user-posts">
            <h3>Recent Posts</h3>
            <div className="posts-list">
                {posts.map(post => (
                    <div key={post.id} className="post-item">
                        <h4>{post.title}</h4>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SuspenseComments({ postId }) {
    const commentsResource = createResource(mockApi.fetchComments(postId));
    const comments = commentsResource.read();
    
    return (
        <div className="comments">
            <h4>Comments</h4>
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <strong>{comment.author}:</strong> {comment.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// 4. LOADING COMPONENTS
// ============================================================================

function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-spinner">
            <div className="spinner">⟳</div>
            <p>{message}</p>
        </div>
    );
}

function SkeletonLoader({ type = 'default' }) {
    const skeletonTypes = {
        user: (
            <div className="skeleton-user">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-info">
                    <div className="skeleton-line skeleton-name"></div>
                    <div className="skeleton-line skeleton-email"></div>
                </div>
            </div>
        ),
        posts: (
            <div className="skeleton-posts">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="skeleton-post">
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-line skeleton-content"></div>
                        <div className="skeleton-line skeleton-content short"></div>
                    </div>
                ))}
            </div>
        ),
        comments: (
            <div className="skeleton-comments">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="skeleton-comment">
                        <div className="skeleton-line skeleton-author"></div>
                        <div className="skeleton-line skeleton-text"></div>
                    </div>
                ))}
            </div>
        ),
        default: (
            <div className="skeleton-default">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
        )
    };
    
    return (
        <div className="skeleton-loader">
            {skeletonTypes[type]}
        </div>
    );
}

// ============================================================================
// 5. COMBINED ERROR BOUNDARY + SUSPENSE WRAPPER
// ============================================================================

function RobustWrapper({ children, errorFallback, loadingFallback, maxRetries = 2 }) {
    return (
        <RetryErrorBoundary maxRetries={maxRetries} fallback={errorFallback}>
            <Suspense fallback={loadingFallback || <LoadingSpinner />}>
                {children}
            </Suspense>
        </RetryErrorBoundary>
    );
}

// ============================================================================
// 6. MAIN DEMO COMPONENT
// ============================================================================

function ErrorBoundariesSuspenseDemo() {
    const [selectedUserId, setSelectedUserId] = useState(1);
    const [showBuggyComponent, setShowBuggyComponent] = useState(true);
    const [errorRate, setErrorRate] = useState(0.3);
    const [demoKey, setDemoKey] = useState(0);
    
    // Force re-render to reset error boundaries
    const resetDemo = () => {
        setDemoKey(prev => prev + 1);
    };
    
    const customErrorFallback = ({ error, eventId, canRetry, onRetry }) => (
        <div className="custom-error-fallback">
            <div className="error-icon">💥</div>
            <h3>Custom Error Fallback</h3>
            <p>Error: {error?.message}</p>
            {eventId && <p>ID: {eventId}</p>}
            {canRetry && (
                <button onClick={onRetry} className="custom-retry-btn">
                    Try Again
                </button>
            )}
        </div>
    );
    
    return (
        <div className="error-boundaries-suspense-demo" key={demoKey}>
            <h1>Error Boundaries & Suspense Demo</h1>
            
            <div className="demo-controls">
                <button onClick={resetDemo} className="reset-btn">
                    🔄 Reset All Demos
                </button>
                
                <label>
                    Error Rate: 
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={errorRate}
                        onChange={(e) => setErrorRate(parseFloat(e.target.value))}
                    />
                    {(errorRate * 100).toFixed(0)}%
                </label>
                
                <label>
                    User ID:
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(parseInt(e.target.value))}>
                        <option value={1}>User 1</option>
                        <option value={2}>User 2</option>
                        <option value={3}>User 3</option>
                    </select>
                </label>
            </div>
            
            <div className="demo-sections">
                {/* Error Boundaries Demo */}
                <section className="demo-section">
                    <h2>Error Boundaries Demo</h2>
                    
                    <div className="error-boundary-examples">
                        <div className="example">
                            <h3>Basic Error Boundary</h3>
                            <BasicErrorBoundary>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showBuggyComponent}
                                        onChange={(e) => setShowBuggyComponent(e.target.checked)}
                                    />
                                    Show Buggy Component
                                </label>
                                {showBuggyComponent && (
                                    <BuggyComponent shouldThrow={true} errorRate={errorRate} />
                                )}
                            </BasicErrorBoundary>
                        </div>
                        
                        <div className="example">
                            <h3>Retry Error Boundary</h3>
                            <RetryErrorBoundary maxRetries={2}>
                                <BuggyComponent shouldThrow={true} errorRate={0.6} />
                            </RetryErrorBoundary>
                        </div>
                        
                        <div className="example">
                            <h3>Custom Error Fallback</h3>
                            <RetryErrorBoundary maxRetries={1} fallback={customErrorFallback}>
                                <BuggyComponent shouldThrow={true} errorRate={0.8} />
                            </RetryErrorBoundary>
                        </div>
                        
                        <div className="example">
                            <h3>Async Errors (Not Caught)</h3>
                            <BasicErrorBoundary>
                                <AsyncBuggyComponent />
                            </BasicErrorBoundary>
                        </div>
                    </div>
                </section>
                
                {/* Suspense Demo */}
                <section className="demo-section">
                    <h2>Suspense Demo</h2>
                    
                    <div className="suspense-examples">
                        <div className="example">
                            <h3>User Profile with Suspense</h3>
                            <RobustWrapper
                                loadingFallback={<SkeletonLoader type="user" />}
                                errorFallback={customErrorFallback}
                            >
                                <SuspenseUserProfile userId={selectedUserId} />
                            </RobustWrapper>
                        </div>
                        
                        <div className="example">
                            <h3>User Posts with Suspense</h3>
                            <RobustWrapper
                                loadingFallback={<SkeletonLoader type="posts" />}
                                errorFallback={customErrorFallback}
                            >
                                <SuspenseUserPosts userId={selectedUserId} />
                            </RobustWrapper>
                        </div>
                        
                        <div className="example">
                            <h3>Comments with Suspense</h3>
                            <RobustWrapper
                                loadingFallback={<SkeletonLoader type="comments" />}
                                errorFallback={customErrorFallback}
                            >
                                <SuspenseComments postId={1} />
                            </RobustWrapper>
                        </div>
                    </div>
                </section>
                
                {/* Combined Demo */}
                <section className="demo-section">
                    <h2>Combined Error Boundary + Suspense</h2>
                    
                    <div className="combined-example">
                        <h3>Complete User Dashboard</h3>
                        <div className="dashboard">
                            <RobustWrapper
                                loadingFallback={<SkeletonLoader type="user" />}
                                errorFallback={customErrorFallback}
                                maxRetries={2}
                            >
                                <SuspenseUserProfile userId={selectedUserId} />
                            </RobustWrapper>
                            
                            <RobustWrapper
                                loadingFallback={<SkeletonLoader type="posts" />}
                                errorFallback={customErrorFallback}
                                maxRetries={2}
                            >
                                <SuspenseUserPosts userId={selectedUserId} />
                            </RobustWrapper>
                        </div>
                    </div>
                </section>
            </div>
            
            <div className="demo-info">
                <h3>Demo Information</h3>
                <ul>
                    <li>🚨 Error boundaries catch render errors in child components</li>
                    <li>⏳ Suspense handles loading states for async operations</li>
                    <li>🔄 Retry logic allows recovery from transient errors</li>
                    <li>💀 Async errors must be handled manually (not caught by error boundaries)</li>
                    <li>🎨 Custom fallbacks provide better user experience</li>
                    <li>🏗️ Combining both creates robust, user-friendly applications</li>
                </ul>
            </div>
        </div>
    );
}

export default ErrorBoundariesSuspenseDemo;
