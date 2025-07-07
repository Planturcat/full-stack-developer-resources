# Error Boundaries and Suspense

Error boundaries and Suspense are React features that help you handle errors gracefully and manage loading states for asynchronous operations. This guide covers error handling patterns, loading states, and creating robust user experiences.

## Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

### Basic Error Boundary

```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Error caught by boundary:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // You can also log the error to an error reporting service
        // logErrorToService(error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Advanced Error Boundary

```jsx
class AdvancedErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null
        };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        const errorDetails = {
            error: error.toString(),
            errorInfo: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.props.userId || 'anonymous'
        };
        
        // Log to external service
        const eventId = this.logError(errorDetails);
        
        this.setState({
            error,
            errorInfo,
            eventId
        });
    }
    
    logError = (errorDetails) => {
        // Simulate logging to external service
        const eventId = Math.random().toString(36).substr(2, 9);
        console.error('Error logged with ID:', eventId, errorDetails);
        
        // In real app, send to service like Sentry, LogRocket, etc.
        // Sentry.captureException(error, { extra: errorDetails });
        
        return eventId;
    }
    
    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null
        });
    }
    
    render() {
        if (this.state.hasError) {
            const { fallback: Fallback } = this.props;
            
            if (Fallback) {
                return (
                    <Fallback
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        eventId={this.state.eventId}
                        onRetry={this.handleRetry}
                    />
                );
            }
            
            return (
                <div className="error-boundary">
                    <div className="error-icon">⚠️</div>
                    <h2>Oops! Something went wrong</h2>
                    <p>We're sorry for the inconvenience. The error has been logged.</p>
                    
                    {this.state.eventId && (
                        <p className="error-id">
                            Error ID: <code>{this.state.eventId}</code>
                        </p>
                    )}
                    
                    <div className="error-actions">
                        <button onClick={this.handleRetry} className="retry-button">
                            Try Again
                        </button>
                        <button onClick={() => window.location.reload()} className="reload-button">
                            Reload Page
                        </button>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && (
                        <details className="error-details">
                            <summary>Error Details (Development Only)</summary>
                            <pre>{this.state.error?.toString()}</pre>
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </details>
                    )}
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Error Boundary Hook (React 18+)

```jsx
// Custom hook for error boundaries in functional components
function useErrorBoundary() {
    const [error, setError] = useState(null);
    
    const resetError = useCallback(() => {
        setError(null);
    }, []);
    
    const captureError = useCallback((error) => {
        setError(error);
    }, []);
    
    useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    
    return { captureError, resetError };
}

// Usage in functional component
function RiskyComponent() {
    const { captureError } = useErrorBoundary();
    
    const handleRiskyOperation = async () => {
        try {
            await riskyAsyncOperation();
        } catch (error) {
            captureError(error);
        }
    };
    
    return (
        <button onClick={handleRiskyOperation}>
            Perform Risky Operation
        </button>
    );
}
```

## React Suspense

Suspense lets you declaratively specify the loading state for a part of the component tree if it's not yet ready to be displayed.

### Basic Suspense Usage

```jsx
import { Suspense, lazy } from 'react';

// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));
const AnotherLazyComponent = lazy(() => import('./AnotherLazyComponent'));

function App() {
    return (
        <div>
            <h1>My App</h1>
            
            <Suspense fallback={<div>Loading component...</div>}>
                <LazyComponent />
            </Suspense>
            
            <Suspense fallback={<LoadingSpinner />}>
                <AnotherLazyComponent />
            </Suspense>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
        </div>
    );
}
```

### Suspense with Data Fetching

```jsx
// Custom hook that integrates with Suspense
function useSuspenseData(url) {
    const [data, setData] = useState(null);
    const [promise, setPromise] = useState(null);
    
    useEffect(() => {
        if (!data) {
            const fetchPromise = fetch(url)
                .then(response => response.json())
                .then(result => {
                    setData(result);
                    setPromise(null);
                });
            
            setPromise(fetchPromise);
        }
    }, [url, data]);
    
    if (promise) {
        throw promise; // This triggers Suspense
    }
    
    return data;
}

// Component that uses Suspense for data fetching
function UserProfile({ userId }) {
    const user = useSuspenseData(`/api/users/${userId}`);
    
    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <img src={user.avatar} alt="Avatar" />
        </div>
    );
}

// Usage with Suspense
function App() {
    return (
        <Suspense fallback={<UserProfileSkeleton />}>
            <UserProfile userId="123" />
        </Suspense>
    );
}

function UserProfileSkeleton() {
    return (
        <div className="user-profile-skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-avatar"></div>
        </div>
    );
}
```

### Nested Suspense Boundaries

```jsx
function BlogPost({ postId }) {
    return (
        <article>
            <Suspense fallback={<PostHeaderSkeleton />}>
                <PostHeader postId={postId} />
            </Suspense>
            
            <Suspense fallback={<PostContentSkeleton />}>
                <PostContent postId={postId} />
            </Suspense>
            
            <Suspense fallback={<CommentsSkeleton />}>
                <Comments postId={postId} />
            </Suspense>
        </article>
    );
}

function PostHeader({ postId }) {
    const post = useSuspenseData(`/api/posts/${postId}`);
    
    return (
        <header>
            <h1>{post.title}</h1>
            <p>By {post.author} on {post.date}</p>
        </header>
    );
}

function PostContent({ postId }) {
    const content = useSuspenseData(`/api/posts/${postId}/content`);
    
    return (
        <div className="post-content">
            {content.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    );
}

function Comments({ postId }) {
    const comments = useSuspenseData(`/api/posts/${postId}/comments`);
    
    return (
        <section className="comments">
            <h3>Comments ({comments.length})</h3>
            {comments.map(comment => (
                <div key={comment.id} className="comment">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                </div>
            ))}
        </section>
    );
}
```

## Combining Error Boundaries and Suspense

```jsx
function RobustComponent({ children }) {
    return (
        <ErrorBoundary
            fallback={({ error, onRetry }) => (
                <ErrorFallback error={error} onRetry={onRetry} />
            )}
        >
            <Suspense fallback={<LoadingFallback />}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
}

function ErrorFallback({ error, onRetry }) {
    return (
        <div className="error-fallback">
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
            <button onClick={onRetry}>Try again</button>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="loading-fallback">
            <div className="loading-animation"></div>
            <p>Loading...</p>
        </div>
    );
}

// Usage
function App() {
    return (
        <div>
            <RobustComponent>
                <UserDashboard />
            </RobustComponent>
            
            <RobustComponent>
                <ProductList />
            </RobustComponent>
        </div>
    );
}
```

## Advanced Patterns

### Retry Logic with Error Boundaries

```jsx
class RetryErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            retryCount: 0
        };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error, errorInfo);
    }
    
    handleRetry = () => {
        const { maxRetries = 3 } = this.props;
        
        if (this.state.retryCount < maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                retryCount: prevState.retryCount + 1
            }));
        }
    }
    
    render() {
        if (this.state.hasError) {
            const { maxRetries = 3 } = this.props;
            const canRetry = this.state.retryCount < maxRetries;
            
            return (
                <div className="retry-error-boundary">
                    <h2>Something went wrong</h2>
                    <p>Attempt {this.state.retryCount + 1} of {maxRetries + 1}</p>
                    
                    {canRetry ? (
                        <button onClick={this.handleRetry}>
                            Retry ({maxRetries - this.state.retryCount} attempts left)
                        </button>
                    ) : (
                        <div>
                            <p>Maximum retry attempts reached.</p>
                            <button onClick={() => window.location.reload()}>
                                Reload Page
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Progressive Loading with Suspense

```jsx
function ProgressiveLoader({ children, stages }) {
    const [currentStage, setCurrentStage] = useState(0);
    
    useEffect(() => {
        if (currentStage < stages.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStage(prev => prev + 1);
            }, 2000);
            
            return () => clearTimeout(timer);
        }
    }, [currentStage, stages.length]);
    
    const currentFallback = stages[currentStage];
    
    return (
        <Suspense fallback={currentFallback}>
            {children}
        </Suspense>
    );
}

// Usage
function App() {
    const loadingStages = [
        <div>Initializing...</div>,
        <div>Loading data...</div>,
        <div>Almost ready...</div>
    ];
    
    return (
        <ProgressiveLoader stages={loadingStages}>
            <ComplexComponent />
        </ProgressiveLoader>
    );
}
```

### Error Recovery Strategies

```jsx
function useErrorRecovery() {
    const [error, setError] = useState(null);
    const [isRecovering, setIsRecovering] = useState(false);
    
    const recover = useCallback(async (recoveryFn) => {
        setIsRecovering(true);
        try {
            await recoveryFn();
            setError(null);
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
        } finally {
            setIsRecovering(false);
        }
    }, []);
    
    const reportError = useCallback((error) => {
        setError(error);
    }, []);
    
    return {
        error,
        isRecovering,
        recover,
        reportError,
        hasError: !!error
    };
}

function ResilientComponent() {
    const { error, isRecovering, recover, reportError, hasError } = useErrorRecovery();
    const [data, setData] = useState(null);
    
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            setData(result);
        } catch (err) {
            reportError(err);
        }
    }, [reportError]);
    
    const handleRecovery = () => {
        recover(fetchData);
    };
    
    if (hasError) {
        return (
            <div className="error-recovery">
                <p>Error: {error.message}</p>
                <button onClick={handleRecovery} disabled={isRecovering}>
                    {isRecovering ? 'Recovering...' : 'Try Again'}
                </button>
            </div>
        );
    }
    
    return (
        <div>
            {data ? (
                <DataDisplay data={data} />
            ) : (
                <button onClick={fetchData}>Load Data</button>
            )}
        </div>
    );
}
```

## Best Practices

### Error Boundary Placement

```jsx
function App() {
    return (
        <div>
            {/* Global error boundary */}
            <ErrorBoundary>
                <Header />
                
                {/* Feature-specific error boundaries */}
                <main>
                    <ErrorBoundary fallback={DashboardError}>
                        <Dashboard />
                    </ErrorBoundary>
                    
                    <ErrorBoundary fallback={SidebarError}>
                        <Sidebar />
                    </ErrorBoundary>
                </main>
                
                <Footer />
            </ErrorBoundary>
        </div>
    );
}
```

### Graceful Degradation

```jsx
function FeatureWithFallback() {
    return (
        <ErrorBoundary
            fallback={() => (
                <div className="feature-unavailable">
                    <p>This feature is temporarily unavailable.</p>
                    <p>Please try again later.</p>
                </div>
            )}
        >
            <Suspense fallback={<FeatureLoading />}>
                <AdvancedFeature />
            </Suspense>
        </ErrorBoundary>
    );
}
```

## Key Points

1. **Error boundaries only catch errors in child components**, not in themselves
2. **Error boundaries don't catch errors in event handlers** - use try-catch for those
3. **Suspense works with lazy loading and data fetching** that throws promises
4. **Combine error boundaries and Suspense** for robust error handling
5. **Use multiple error boundaries** to isolate failures
6. **Provide meaningful fallback UIs** that help users understand what happened
7. **Log errors to external services** for monitoring and debugging
8. **Test error scenarios** to ensure your error boundaries work correctly

Error boundaries and Suspense help create resilient React applications that handle failures gracefully and provide smooth loading experiences for users.
