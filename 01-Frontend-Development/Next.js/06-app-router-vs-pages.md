# App Router vs Pages Router

Next.js 13 introduced the App Router as a new paradigm for building applications, offering improved developer experience, better performance, and new features. This guide compares the App Router with the traditional Pages Router and provides migration strategies.

## Architecture Comparison

### Pages Router (Traditional)

```
pages/
├── _app.js                 // Custom App component
├── _document.js            // Custom Document component
├── index.js               // Home page (/)
├── about.js               // About page (/about)
├── blog/
│   ├── index.js           // Blog listing (/blog)
│   └── [slug].js          // Blog post (/blog/[slug])
├── api/
│   ├── users.js           // API route (/api/users)
│   └── posts/
│       └── [id].js        // API route (/api/posts/[id])
└── 404.js                 // Custom 404 page
```

### App Router (New)

```
app/
├── layout.js              // Root layout
├── page.js                // Home page (/)
├── loading.js             // Loading UI
├── error.js               // Error UI
├── not-found.js           // 404 UI
├── about/
│   └── page.js            // About page (/about)
├── blog/
│   ├── page.js            // Blog listing (/blog)
│   ├── loading.js         // Loading UI for blog
│   └── [slug]/
│       ├── page.js        // Blog post (/blog/[slug])
│       └── loading.js     // Loading UI for blog post
└── api/
    ├── users/
    │   └── route.js       // API route (/api/users)
    └── posts/
        └── [id]/
            └── route.js   // API route (/api/posts/[id])
```

## Key Differences

### Data Fetching

#### Pages Router

```jsx
// pages/blog/[slug].js
export default function BlogPost({ post }) {
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

// Server-side data fetching
export async function getServerSideProps({ params }) {
    const post = await fetchPost(params.slug);
    
    return {
        props: { post },
    };
}

// Static generation
export async function getStaticProps({ params }) {
    const post = await fetchPost(params.slug);
    
    return {
        props: { post },
        revalidate: 3600,
    };
}

export async function getStaticPaths() {
    const posts = await fetchAllPosts();
    
    return {
        paths: posts.map(post => ({ params: { slug: post.slug } })),
        fallback: 'blocking',
    };
}
```

#### App Router

```jsx
// app/blog/[slug]/page.js
async function fetchPost(slug) {
    const res = await fetch(`https://api.example.com/posts/${slug}`, {
        next: { revalidate: 3600 } // ISR
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch post');
    }
    
    return res.json();
}

export default async function BlogPost({ params }) {
    const post = await fetchPost(params.slug);
    
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

// Generate static params
export async function generateStaticParams() {
    const posts = await fetchAllPosts();
    
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// Generate metadata
export async function generateMetadata({ params }) {
    const post = await fetchPost(params.slug);
    
    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.featuredImage],
        },
    };
}
```

### Layouts

#### Pages Router

```jsx
// pages/_app.js
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

// components/Layout.js
export default function Layout({ children }) {
    return (
        <div>
            <header>
                <nav>Navigation</nav>
            </header>
            <main>{children}</main>
            <footer>Footer</footer>
        </div>
    );
}
```

#### App Router

```jsx
// app/layout.js
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <header>
                    <nav>Navigation</nav>
                </header>
                <main>{children}</main>
                <footer>Footer</footer>
            </body>
        </html>
    );
}

// app/blog/layout.js
export default function BlogLayout({ children }) {
    return (
        <div className="blog-layout">
            <aside>
                <BlogSidebar />
            </aside>
            <div className="blog-content">
                {children}
            </div>
        </div>
    );
}
```

### Loading and Error States

#### Pages Router

```jsx
// pages/blog/index.js
import { useState, useEffect } from 'react';

export default function BlogIndex() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchPosts()
            .then(setPosts)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <div>
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
```

#### App Router

```jsx
// app/blog/page.js
async function fetchPosts() {
    const res = await fetch('https://api.example.com/posts');
    
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    
    return res.json();
}

export default async function BlogIndex() {
    const posts = await fetchPosts();
    
    return (
        <div>
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

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
```

### API Routes

#### Pages Router

```javascript
// pages/api/posts/[id].js
export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;
    
    switch (method) {
        case 'GET':
            try {
                const post = await getPost(id);
                res.status(200).json(post);
            } catch (error) {
                res.status(404).json({ error: 'Post not found' });
            }
            break;
            
        case 'PUT':
            try {
                const post = await updatePost(id, req.body);
                res.status(200).json(post);
            } catch (error) {
                res.status(500).json({ error: 'Failed to update post' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
```

#### App Router

```javascript
// app/api/posts/[id]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const post = await getPost(params.id);
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const body = await request.json();
        const post = await updatePost(params.id, body);
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}
```

## Advanced App Router Features

### Parallel Routes

```jsx
// app/dashboard/layout.js
export default function DashboardLayout({ children, analytics, team }) {
    return (
        <div className="dashboard">
            <div className="main-content">{children}</div>
            <div className="sidebar">
                <div className="analytics-section">{analytics}</div>
                <div className="team-section">{team}</div>
            </div>
        </div>
    );
}

// app/dashboard/@analytics/page.js
export default function Analytics() {
    return (
        <div>
            <h2>Analytics</h2>
            {/* Analytics content */}
        </div>
    );
}

// app/dashboard/@team/page.js
export default function Team() {
    return (
        <div>
            <h2>Team</h2>
            {/* Team content */}
        </div>
    );
}
```

### Intercepting Routes

```jsx
// app/photos/[id]/page.js
export default function PhotoPage({ params }) {
    return (
        <div>
            <img src={`/photos/${params.id}.jpg`} alt="Photo" />
        </div>
    );
}

// app/photos/(..)photos/[id]/page.js (Intercepting route)
export default function PhotoModal({ params }) {
    return (
        <div className="modal">
            <div className="modal-content">
                <img src={`/photos/${params.id}.jpg`} alt="Photo" />
            </div>
        </div>
    );
}
```

### Route Groups

```
app/
├── (marketing)/
│   ├── layout.js          // Marketing layout
│   ├── page.js            // Home page
│   └── about/
│       └── page.js        // About page
├── (shop)/
│   ├── layout.js          // Shop layout
│   ├── products/
│   │   └── page.js        // Products page
│   └── cart/
│       └── page.js        // Cart page
└── layout.js              // Root layout
```

```jsx
// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
    return (
        <div className="marketing-layout">
            <MarketingHeader />
            {children}
            <MarketingFooter />
        </div>
    );
}

// app/(shop)/layout.js
export default function ShopLayout({ children }) {
    return (
        <div className="shop-layout">
            <ShopHeader />
            <ShopSidebar />
            {children}
        </div>
    );
}
```

## Migration Strategies

### Gradual Migration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
};

module.exports = nextConfig;
```

### Step-by-Step Migration

1. **Start with new routes in App Router**
```jsx
// Keep existing pages in pages/
// Add new routes in app/
app/
├── new-feature/
│   └── page.js
└── layout.js

pages/
├── existing-page.js
└── api/
    └── existing-api.js
```

2. **Migrate layouts**
```jsx
// Move from pages/_app.js to app/layout.js
// app/layout.js
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
```

3. **Migrate data fetching**
```jsx
// Before (Pages Router)
export async function getServerSideProps() {
    const data = await fetchData();
    return { props: { data } };
}

// After (App Router)
async function fetchData() {
    const res = await fetch('...');
    return res.json();
}

export default async function Page() {
    const data = await fetchData();
    return <div>{/* Use data */}</div>;
}
```

### Common Migration Patterns

```jsx
// Migrating custom hooks for client-side data fetching
// Before (Pages Router)
function usePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchPosts().then(setPosts).finally(() => setLoading(false));
    }, []);
    
    return { posts, loading };
}

// After (App Router) - Server Component
async function PostsList() {
    const posts = await fetchPosts();
    
    return (
        <div>
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

// Client Component when needed
'use client';

function InteractivePostsList() {
    const { posts, loading } = usePosts();
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {posts.map(post => (
                <InteractivePostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
```

## Performance Comparison

### Bundle Size
- **App Router**: Smaller client bundles due to Server Components
- **Pages Router**: Larger client bundles as everything runs on client

### Rendering
- **App Router**: Server Components by default, opt-in to client
- **Pages Router**: Client-side rendering by default, opt-in to server

### Caching
- **App Router**: More granular caching with fetch API
- **Pages Router**: Page-level caching with ISR

## Best Practices

### When to Use App Router
1. **New projects** - Start with App Router for modern features
2. **Server-heavy applications** - Benefit from Server Components
3. **Complex layouts** - Nested layouts and parallel routes
4. **SEO-critical applications** - Better server-side rendering

### When to Stick with Pages Router
1. **Existing large applications** - Migration cost may be high
2. **Heavy client-side interactivity** - If most components need client-side features
3. **Third-party dependencies** - Some libraries may not be compatible yet

### Migration Tips
1. **Start small** - Migrate one route at a time
2. **Use both routers** - They can coexist during migration
3. **Test thoroughly** - Behavior differences may affect functionality
4. **Update dependencies** - Ensure compatibility with App Router
5. **Monitor performance** - Compare before and after metrics

The App Router represents the future of Next.js development, offering improved performance, better developer experience, and more powerful features for building modern web applications.
