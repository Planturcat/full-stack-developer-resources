# File-Based Routing and Dynamic Routes

Next.js uses a file-based routing system where the file structure in the `pages` directory (or `app` directory in App Router) automatically becomes your application's routes. This guide covers routing fundamentals, dynamic routes, and advanced routing patterns.

## File-Based Routing Basics

### Pages Router Structure

```
pages/
├── index.js                    // Route: /
├── about.js                    // Route: /about
├── contact.js                  // Route: /contact
├── blog/
│   ├── index.js               // Route: /blog
│   ├── [slug].js              // Route: /blog/[slug]
│   └── [...params].js         // Route: /blog/[...params]
├── products/
│   ├── index.js               // Route: /products
│   ├── [id].js                // Route: /products/[id]
│   └── categories/
│       ├── index.js           // Route: /products/categories
│       └── [category].js      // Route: /products/categories/[category]
└── api/
    ├── users.js               // API Route: /api/users
    └── products/
        └── [id].js            // API Route: /api/products/[id]
```

### App Router Structure (Next.js 13+)

```
app/
├── layout.js                  // Root layout
├── page.js                    // Route: /
├── loading.js                 // Loading UI
├── error.js                   // Error UI
├── not-found.js              // 404 UI
├── about/
│   └── page.js               // Route: /about
├── blog/
│   ├── page.js               // Route: /blog
│   ├── loading.js            // Loading UI for /blog
│   └── [slug]/
│       └── page.js           // Route: /blog/[slug]
├── products/
│   ├── page.js               // Route: /products
│   ├── [id]/
│   │   └── page.js           // Route: /products/[id]
│   └── categories/
│       ├── page.js           // Route: /products/categories
│       └── [category]/
│           └── page.js       // Route: /products/categories/[category]
└── api/
    ├── users/
    │   └── route.js          // API Route: /api/users
    └── products/
        └── [id]/
            └── route.js      // API Route: /api/products/[id]
```

## Dynamic Routes

### Single Dynamic Segment

```jsx
// pages/blog/[slug].js or app/blog/[slug]/page.js
import { useRouter } from 'next/router';

export default function BlogPost({ post }) {
    const router = useRouter();
    const { slug } = router.query;
    
    // Handle loading state for fallback pages
    if (router.isFallback) {
        return <div>Loading...</div>;
    }
    
    return (
        <article>
            <h1>{post.title}</h1>
            <p>Slug: {slug}</p>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

export async function getStaticPaths() {
    // Fetch all blog post slugs
    const posts = await fetchAllPosts();
    
    const paths = posts.map(post => ({
        params: { slug: post.slug }
    }));
    
    return {
        paths,
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const post = await fetchPost(params.slug);
    
    if (!post) {
        return {
            notFound: true,
        };
    }
    
    return {
        props: { post },
        revalidate: 3600,
    };
}
```

### Multiple Dynamic Segments

```jsx
// pages/products/[category]/[id].js
export default function Product({ product, category }) {
    return (
        <div>
            <nav>
                <a href="/products">Products</a> &gt; 
                <a href={`/products/${category}`}>{category}</a> &gt; 
                {product.name}
            </nav>
            <h1>{product.name}</h1>
            <p>Category: {category}</p>
            <p>Price: ${product.price}</p>
        </div>
    );
}

export async function getStaticPaths() {
    const products = await fetchAllProducts();
    
    const paths = products.map(product => ({
        params: { 
            category: product.category,
            id: product.id.toString()
        }
    }));
    
    return {
        paths,
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const { category, id } = params;
    const product = await fetchProduct(id);
    
    if (!product || product.category !== category) {
        return {
            notFound: true,
        };
    }
    
    return {
        props: {
            product,
            category,
        },
    };
}
```

### Catch-All Routes

```jsx
// pages/docs/[...params].js
export default function Docs({ content, breadcrumbs }) {
    return (
        <div>
            <nav>
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        <a href={crumb.href}>{crumb.label}</a>
                        {index < breadcrumbs.length - 1 && ' > '}
                    </span>
                ))}
            </nav>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}

export async function getStaticPaths() {
    // Generate paths for all documentation pages
    const docPaths = await fetchAllDocPaths();
    
    const paths = docPaths.map(path => ({
        params: { params: path.split('/') }
    }));
    
    return {
        paths,
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const { params: pathParams } = params;
    const path = pathParams.join('/');
    
    const content = await fetchDocContent(path);
    
    if (!content) {
        return {
            notFound: true,
        };
    }
    
    const breadcrumbs = generateBreadcrumbs(pathParams);
    
    return {
        props: {
            content,
            breadcrumbs,
        },
    };
}

function generateBreadcrumbs(pathParams) {
    const breadcrumbs = [{ label: 'Docs', href: '/docs' }];
    
    let currentPath = '/docs';
    pathParams.forEach((param, index) => {
        currentPath += `/${param}`;
        breadcrumbs.push({
            label: param.charAt(0).toUpperCase() + param.slice(1),
            href: currentPath,
        });
    });
    
    return breadcrumbs;
}
```

### Optional Catch-All Routes

```jsx
// pages/shop/[[...params]].js
// Matches: /shop, /shop/category, /shop/category/subcategory, etc.

export default function Shop({ products, filters, currentPath }) {
    return (
        <div>
            <h1>Shop</h1>
            <p>Current path: /{currentPath.join('/')}</p>
            
            <div className="filters">
                {filters.map(filter => (
                    <FilterComponent key={filter.id} filter={filter} />
                ))}
            </div>
            
            <div className="products">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export async function getStaticPaths() {
    // Generate paths for different shop configurations
    const paths = [
        { params: { params: [] } },                    // /shop
        { params: { params: ['electronics'] } },       // /shop/electronics
        { params: { params: ['electronics', 'phones'] } }, // /shop/electronics/phones
        // ... more paths
    ];
    
    return {
        paths,
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const pathParams = params.params || [];
    
    const { products, filters } = await fetchShopData(pathParams);
    
    return {
        props: {
            products,
            filters,
            currentPath: pathParams,
        },
    };
}
```

## Navigation and Linking

### Using Next.js Link Component

```jsx
import Link from 'next/link';

export default function Navigation() {
    return (
        <nav>
            {/* Basic link */}
            <Link href="/about">About</Link>
            
            {/* Dynamic link */}
            <Link href="/blog/my-first-post">My First Post</Link>
            
            {/* Link with query parameters */}
            <Link href="/products?category=electronics">Electronics</Link>
            
            {/* Link with object href */}
            <Link href={{
                pathname: '/products/[id]',
                query: { id: '123' }
            }}>
                Product 123
            </Link>
            
            {/* External link (opens in new tab) */}
            <Link href="https://example.com" target="_blank" rel="noopener">
                External Link
            </Link>
            
            {/* Link with custom styling */}
            <Link href="/contact" className="nav-link">
                Contact
            </Link>
        </nav>
    );
}
```

### Programmatic Navigation

```jsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    
    const handleLogin = async (credentials) => {
        try {
            await login(credentials);
            
            // Redirect to dashboard after successful login
            router.push('/dashboard');
            
            // Or redirect to the page they were trying to access
            const returnUrl = router.query.returnUrl || '/dashboard';
            router.push(returnUrl);
            
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    
    const handleBack = () => {
        router.back(); // Go back to previous page
    };
    
    const handleReplace = () => {
        // Replace current history entry (user can't go back)
        router.replace('/new-page');
    };
    
    // Redirect based on authentication status
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);
    
    return (
        <div>
            <LoginForm onSubmit={handleLogin} />
            <button onClick={handleBack}>Go Back</button>
        </div>
    );
}
```

### Route Guards and Middleware

```jsx
// components/RouteGuard.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function RouteGuard({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [authorized, setAuthorized] = useState(false);
    
    useEffect(() => {
        // Check if user is authorized on route change
        const authCheck = (url) => {
            const publicPaths = ['/login', '/register', '/'];
            const path = url.split('?')[0];
            
            if (!user && !publicPaths.includes(path)) {
                setAuthorized(false);
                router.push({
                    pathname: '/login',
                    query: { returnUrl: router.asPath }
                });
            } else {
                setAuthorized(true);
            }
        };
        
        if (!loading) {
            authCheck(router.asPath);
        }
        
        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);
        router.events.on('routeChangeComplete', authCheck);
        
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        };
    }, [user, loading, router]);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return authorized ? children : null;
}
```

## Advanced Routing Patterns

### Nested Layouts

```jsx
// components/layouts/BlogLayout.js
export default function BlogLayout({ children }) {
    return (
        <div className="blog-layout">
            <aside className="blog-sidebar">
                <BlogSidebar />
            </aside>
            <main className="blog-content">
                {children}
            </main>
        </div>
    );
}

// pages/blog/[slug].js
import BlogLayout from '../../components/layouts/BlogLayout';

export default function BlogPost({ post }) {
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

BlogPost.getLayout = function getLayout(page) {
    return <BlogLayout>{page}</BlogLayout>;
};

// pages/_app.js
export default function MyApp({ Component, pageProps }) {
    const getLayout = Component.getLayout || ((page) => page);
    
    return getLayout(<Component {...pageProps} />);
}
```

### Route-Based Code Splitting

```jsx
import dynamic from 'next/dynamic';

// Lazy load components based on routes
const AdminPanel = dynamic(() => import('../components/AdminPanel'), {
    loading: () => <p>Loading admin panel...</p>,
    ssr: false, // Disable server-side rendering for this component
});

const UserDashboard = dynamic(() => import('../components/UserDashboard'));

export default function Dashboard({ user }) {
    return (
        <div>
            <h1>Dashboard</h1>
            {user.isAdmin ? <AdminPanel /> : <UserDashboard />}
        </div>
    );
}
```

### Custom 404 and Error Pages

```jsx
// pages/404.js
export default function Custom404() {
    return (
        <div className="error-page">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <Link href="/">Go back home</Link>
        </div>
    );
}

// pages/500.js
export default function Custom500() {
    return (
        <div className="error-page">
            <h1>500 - Server Error</h1>
            <p>Something went wrong on our end.</p>
            <Link href="/">Go back home</Link>
        </div>
    );
}

// pages/_error.js
function Error({ statusCode, hasGetInitialPropsRun, err }) {
    if (!hasGetInitialPropsRun && err) {
        // Log client-side errors
        console.error('Client-side error:', err);
    }
    
    return (
        <div>
            <h1>
                {statusCode
                    ? `A ${statusCode} error occurred on server`
                    : 'An error occurred on client'}
            </h1>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
```

## App Router (Next.js 13+)

### Basic App Router Structure

```jsx
// app/layout.js
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <header>
                    <Navigation />
                </header>
                <main>{children}</main>
                <footer>
                    <Footer />
                </footer>
            </body>
        </html>
    );
}

// app/page.js
export default function HomePage() {
    return (
        <div>
            <h1>Welcome to our website</h1>
        </div>
    );
}

// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
    const { slug } = params;
    
    return (
        <article>
            <h1>Blog Post: {slug}</h1>
        </article>
    );
}

// Generate static params for dynamic routes
export async function generateStaticParams() {
    const posts = await fetchPosts();
    
    return posts.map((post) => ({
        slug: post.slug,
    }));
}
```

### Loading and Error UI

```jsx
// app/blog/loading.js
export default function Loading() {
    return (
        <div className="loading">
            <div className="spinner" />
            <p>Loading blog posts...</p>
        </div>
    );
}

// app/blog/error.js
'use client';

export default function Error({ error, reset }) {
    return (
        <div className="error">
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}

// app/blog/not-found.js
export default function NotFound() {
    return (
        <div>
            <h2>Blog post not found</h2>
            <p>Could not find the requested blog post.</p>
        </div>
    );
}
```

## Best Practices

1. **Use descriptive file names** that match your URL structure
2. **Implement proper error handling** with custom error pages
3. **Use dynamic imports** for code splitting when appropriate
4. **Implement route guards** for protected pages
5. **Use shallow routing** for URL updates without data fetching
6. **Optimize for SEO** with proper meta tags and structured data
7. **Handle loading states** gracefully
8. **Use TypeScript** for better route parameter typing
9. **Test your routes** thoroughly, including edge cases
10. **Monitor route performance** and optimize slow routes

Understanding Next.js routing enables you to build complex, navigable applications with clean URLs and excellent user experience.
