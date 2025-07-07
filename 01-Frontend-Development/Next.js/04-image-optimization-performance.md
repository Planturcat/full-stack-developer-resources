# Image Optimization and Performance

Next.js provides built-in image optimization and performance features that help create fast, efficient web applications. This guide covers image optimization, performance best practices, and monitoring techniques.

## Next.js Image Component

### Basic Image Usage

```jsx
import Image from 'next/image';

export default function Gallery() {
    return (
        <div>
            {/* Basic image with required props */}
            <Image
                src="/hero-image.jpg"
                alt="Hero image"
                width={800}
                height={600}
            />
            
            {/* Image with priority loading (above the fold) */}
            <Image
                src="/logo.png"
                alt="Company logo"
                width={200}
                height={100}
                priority
            />
            
            {/* Responsive image */}
            <Image
                src="/banner.jpg"
                alt="Banner"
                width={1200}
                height={400}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
            />
        </div>
    );
}
```

### Advanced Image Features

```jsx
import Image from 'next/image';

export default function ProductGallery({ product }) {
    return (
        <div className="product-gallery">
            {/* Image with custom loader */}
            <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={400}
                loader={({ src, width, quality }) => {
                    return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
                }}
            />
            
            {/* Image with placeholder */}
            <Image
                src="/product-image.jpg"
                alt="Product"
                width={400}
                height={300}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            
            {/* Fill container image */}
            <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                <Image
                    src="/background.jpg"
                    alt="Background"
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            
            {/* Image with custom sizes for responsive design */}
            <Image
                src="/responsive-image.jpg"
                alt="Responsive image"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
}
```

### Dynamic Images and External Sources

```jsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['example.com', 'cdn.example.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
                port: '',
                pathname: '/bucket-name/**',
            },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = nextConfig;

// Component using external images
import Image from 'next/image';

export default function UserProfile({ user }) {
    return (
        <div className="user-profile">
            <Image
                src={user.avatarUrl || '/default-avatar.png'}
                alt={`${user.name}'s avatar`}
                width={150}
                height={150}
                className="rounded-full"
                onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                }}
            />
            
            {/* Gallery with dynamic images */}
            <div className="image-gallery">
                {user.photos.map((photo, index) => (
                    <Image
                        key={photo.id}
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        width={300}
                        height={200}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        placeholder="blur"
                        blurDataURL={photo.blurDataUrl}
                    />
                ))}
            </div>
        </div>
    );
}
```

## Performance Optimization Techniques

### Code Splitting and Dynamic Imports

```jsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import with loading component
const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
    loading: () => <div>Loading heavy component...</div>,
    ssr: false, // Disable server-side rendering for this component
});

// Dynamic import with named export
const Chart = dynamic(() => import('../components/Charts').then(mod => mod.LineChart), {
    loading: () => <div>Loading chart...</div>,
});

// Conditional dynamic import
const AdminPanel = dynamic(() => import('../components/AdminPanel'), {
    loading: () => <div>Loading admin panel...</div>,
});

export default function Dashboard({ user }) {
    return (
        <div>
            <h1>Dashboard</h1>
            
            {/* Always loaded */}
            <UserStats user={user} />
            
            {/* Conditionally loaded */}
            {user.isAdmin && (
                <Suspense fallback={<div>Loading admin features...</div>}>
                    <AdminPanel />
                </Suspense>
            )}
            
            {/* Lazy loaded chart */}
            <Chart data={user.analytics} />
            
            {/* Heavy component loaded only when needed */}
            <HeavyComponent />
        </div>
    );
}
```

### Font Optimization

```jsx
// app/layout.js (App Router)
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto-mono',
});

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.className} ${robotoMono.variable}`}>
            <body>{children}</body>
        </html>
    );
}

// pages/_app.js (Pages Router)
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }) {
    return (
        <main className={inter.className}>
            <Component {...pageProps} />
        </main>
    );
}

// Local font usage
import localFont from 'next/font/local';

const myFont = localFont({
    src: './my-font.woff2',
    display: 'swap',
});

export default function MyComponent() {
    return (
        <div className={myFont.className}>
            <p>This text uses a local font</p>
        </div>
    );
}
```

### Bundle Analysis and Optimization

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for better performance
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lodash', 'date-fns'],
    },
    
    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    
    // Webpack optimizations
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Optimize bundle size
        if (!dev && !isServer) {
            config.optimization.splitChunks.chunks = 'all';
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            };
        }
        
        return config;
    },
};

module.exports = withBundleAnalyzer(nextConfig);

// package.json scripts
{
    "scripts": {
        "analyze": "ANALYZE=true npm run build",
        "build": "next build",
        "start": "next start"
    }
}
```

### Caching Strategies

```jsx
// pages/api/data.js
export default function handler(req, res) {
    // Set cache headers
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    
    const data = getExpensiveData();
    res.json(data);
}

// lib/cache.js
const cache = new Map();

export function getCachedData(key, fetcher, ttl = 60000) {
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    
    const data = fetcher();
    cache.set(key, {
        data,
        timestamp: Date.now(),
    });
    
    return data;
}

// Using SWR for client-side caching
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Profile() {
    const { data, error, isLoading } = useSWR('/api/user', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 60000, // Refresh every minute
    });
    
    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading...</div>;
    
    return <div>Hello {data.name}!</div>;
}
```

## Core Web Vitals Optimization

### Largest Contentful Paint (LCP)

```jsx
import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="hero">
            {/* Optimize LCP by prioritizing hero image */}
            <Image
                src="/hero-image.jpg"
                alt="Hero image"
                width={1200}
                height={600}
                priority // Load immediately
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,..."
                style={{
                    width: '100%',
                    height: 'auto',
                }}
            />
            
            {/* Preload critical resources */}
            <link
                rel="preload"
                href="/critical-font.woff2"
                as="font"
                type="font/woff2"
                crossOrigin=""
            />
        </section>
    );
}
```

### First Input Delay (FID) and Interaction to Next Paint (INP)

```jsx
import { useCallback, useMemo } from 'react';

export default function InteractiveComponent({ data }) {
    // Memoize expensive calculations
    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            processed: expensiveCalculation(item),
        }));
    }, [data]);
    
    // Memoize event handlers
    const handleClick = useCallback((id) => {
        // Use requestIdleCallback for non-critical work
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                performNonCriticalWork(id);
            });
        } else {
            setTimeout(() => performNonCriticalWork(id), 0);
        }
        
        // Handle critical work immediately
        handleCriticalWork(id);
    }, []);
    
    return (
        <div>
            {processedData.map(item => (
                <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className="interactive-button"
                >
                    {item.name}
                </button>
            ))}
        </div>
    );
}
```

### Cumulative Layout Shift (CLS)

```jsx
import Image from 'next/image';

export default function StableLayout() {
    return (
        <div>
            {/* Reserve space for images to prevent layout shift */}
            <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                <Image
                    src="/banner.jpg"
                    alt="Banner"
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            
            {/* Use CSS to reserve space for dynamic content */}
            <div className="content-container">
                <div className="sidebar" style={{ minHeight: '400px' }}>
                    {/* Sidebar content */}
                </div>
                <main className="main-content">
                    {/* Main content */}
                </main>
            </div>
        </div>
    );
}

// CSS to prevent layout shift
.content-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 20px;
}

.sidebar {
    /* Reserve minimum height to prevent shift */
    min-height: 400px;
}

/* Use aspect-ratio for responsive images */
.image-container {
    aspect-ratio: 16 / 9;
    position: relative;
}
```

## Performance Monitoring

### Web Vitals Measurement

```jsx
// lib/vitals.js
export function reportWebVitals(metric) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(metric);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', metric.name, {
                custom_parameter_1: metric.value,
                custom_parameter_2: metric.id,
                custom_parameter_3: metric.name,
            });
        }
        
        // Custom analytics endpoint
        fetch('/api/analytics/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metric),
        });
    }
}

// pages/_app.js
import { reportWebVitals } from '../lib/vitals';

export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export { reportWebVitals };

// pages/api/analytics/vitals.js
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { name, value, id } = req.body;
    
    // Store metrics in your analytics system
    console.log(`Web Vital: ${name} = ${value} (${id})`);
    
    res.status(200).json({ success: true });
}
```

### Performance Profiling

```jsx
// lib/performance.js
export class PerformanceProfiler {
    constructor() {
        this.marks = new Map();
    }
    
    mark(name) {
        if (typeof window !== 'undefined' && 'performance' in window) {
            performance.mark(name);
            this.marks.set(name, performance.now());
        }
    }
    
    measure(name, startMark, endMark) {
        if (typeof window !== 'undefined' && 'performance' in window) {
            performance.measure(name, startMark, endMark);
            
            const entries = performance.getEntriesByName(name);
            const duration = entries[entries.length - 1]?.duration;
            
            console.log(`${name}: ${duration}ms`);
            return duration;
        }
    }
    
    getMetrics() {
        if (typeof window !== 'undefined' && 'performance' in window) {
            return {
                navigation: performance.getEntriesByType('navigation')[0],
                paint: performance.getEntriesByType('paint'),
                resource: performance.getEntriesByType('resource'),
            };
        }
    }
}

// Usage in components
import { useEffect } from 'react';
import { PerformanceProfiler } from '../lib/performance';

const profiler = new PerformanceProfiler();

export default function MyComponent() {
    useEffect(() => {
        profiler.mark('component-mount-start');
        
        // Simulate component initialization
        setTimeout(() => {
            profiler.mark('component-mount-end');
            profiler.measure('component-mount', 'component-mount-start', 'component-mount-end');
        }, 0);
    }, []);
    
    return <div>My Component</div>;
}
```

## Advanced Optimization Techniques

### Service Worker for Caching

```javascript
// public/sw.js
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/static/images/logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Register service worker
// pages/_app.js
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }, []);
    
    return <Component {...pageProps} />;
}
```

### Resource Hints and Preloading

```jsx
import Head from 'next/head';

export default function OptimizedPage() {
    return (
        <>
            <Head>
                {/* Preload critical resources */}
                <link rel="preload" href="/critical-font.woff2" as="font" type="font/woff2" crossOrigin="" />
                <link rel="preload" href="/hero-image.jpg" as="image" />
                
                {/* Prefetch likely next pages */}
                <link rel="prefetch" href="/about" />
                <link rel="prefetch" href="/contact" />
                
                {/* Preconnect to external domains */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                
                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//example.com" />
            </Head>
            
            <main>
                {/* Page content */}
            </main>
        </>
    );
}
```

## Best Practices

1. **Use Next.js Image component** for automatic optimization
2. **Implement proper caching strategies** at multiple levels
3. **Monitor Core Web Vitals** regularly
4. **Optimize fonts** with next/font
5. **Use dynamic imports** for code splitting
6. **Minimize JavaScript bundle size** with tree shaking
7. **Implement proper loading states** for better perceived performance
8. **Use CDN** for static assets
9. **Optimize database queries** and API responses
10. **Test performance** on various devices and network conditions
11. **Use performance profiling tools** to identify bottlenecks
12. **Implement progressive enhancement** for better user experience

Performance optimization is an ongoing process that requires continuous monitoring and improvement to ensure the best user experience across all devices and network conditions.
