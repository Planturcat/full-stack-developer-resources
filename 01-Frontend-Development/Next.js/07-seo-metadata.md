# SEO Optimization and Metadata

Search Engine Optimization (SEO) is crucial for web applications to be discoverable and rank well in search results. Next.js provides powerful built-in features for SEO optimization, including metadata management, structured data, and performance optimizations.

## Metadata Management

### Pages Router - Head Component

```jsx
import Head from 'next/head';

export default function BlogPost({ post }) {
    return (
        <>
            <Head>
                <title>{post.title} | My Blog</title>
                <meta name="description" content={post.excerpt} />
                <meta name="keywords" content={post.tags.join(', ')} />
                
                {/* Open Graph */}
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={post.featuredImage} />
                <meta property="og:url" content={`https://myblog.com/blog/${post.slug}`} />
                <meta property="og:type" content="article" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="twitter:image" content={post.featuredImage} />
                
                {/* Article specific */}
                <meta property="article:published_time" content={post.publishedAt} />
                <meta property="article:modified_time" content={post.updatedAt} />
                <meta property="article:author" content={post.author.name} />
                <meta property="article:section" content={post.category} />
                {post.tags.map(tag => (
                    <meta key={tag} property="article:tag" content={tag} />
                ))}
                
                {/* Canonical URL */}
                <link rel="canonical" href={`https://myblog.com/blog/${post.slug}`} />
                
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            "headline": post.title,
                            "description": post.excerpt,
                            "image": post.featuredImage,
                            "author": {
                                "@type": "Person",
                                "name": post.author.name
                            },
                            "publisher": {
                                "@type": "Organization",
                                "name": "My Blog",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://myblog.com/logo.png"
                                }
                            },
                            "datePublished": post.publishedAt,
                            "dateModified": post.updatedAt
                        })
                    }}
                />
            </Head>
            
            <article>
                <h1>{post.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
        </>
    );
}
```

### App Router - Metadata API

```jsx
// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';

async function getPost(slug) {
    const res = await fetch(`https://api.example.com/posts/${slug}`);
    
    if (!res.ok) {
        return null;
    }
    
    return res.json();
}

export async function generateMetadata({ params }) {
    const post = await getPost(params.slug);
    
    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }
    
    return {
        title: `${post.title} | My Blog`,
        description: post.excerpt,
        keywords: post.tags.join(', '),
        authors: [{ name: post.author.name }],
        
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://myblog.com/blog/${post.slug}`,
            siteName: 'My Blog',
            images: [
                {
                    url: post.featuredImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author.name],
            section: post.category,
            tags: post.tags,
        },
        
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.featuredImage],
            creator: '@myblog',
        },
        
        alternates: {
            canonical: `https://myblog.com/blog/${post.slug}`,
        },
        
        other: {
            'article:published_time': post.publishedAt,
            'article:modified_time': post.updatedAt,
            'article:author': post.author.name,
            'article:section': post.category,
        },
    };
}

export default async function BlogPost({ params }) {
    const post = await getPost(params.slug);
    
    if (!post) {
        notFound();
    }
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "description": post.excerpt,
                        "image": post.featuredImage,
                        "author": {
                            "@type": "Person",
                            "name": post.author.name
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "My Blog",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://myblog.com/logo.png"
                            }
                        },
                        "datePublished": post.publishedAt,
                        "dateModified": post.updatedAt
                    })
                }}
            />
            
            <article>
                <h1>{post.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
        </>
    );
}
```

## Structured Data and Schema.org

### Article Schema

```jsx
// components/ArticleSchema.js
export default function ArticleSchema({ article }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt,
        "image": {
            "@type": "ImageObject",
            "url": article.featuredImage,
            "width": 1200,
            "height": 630
        },
        "author": {
            "@type": "Person",
            "name": article.author.name,
            "url": article.author.profileUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "My Blog",
            "logo": {
                "@type": "ImageObject",
                "url": "https://myblog.com/logo.png",
                "width": 200,
                "height": 60
            }
        },
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://myblog.com/blog/${article.slug}`
        }
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
```

### Product Schema

```jsx
// components/ProductSchema.js
export default function ProductSchema({ product }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images,
        "brand": {
            "@type": "Brand",
            "name": product.brand
        },
        "offers": {
            "@type": "Offer",
            "url": `https://mystore.com/products/${product.slug}`,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "My Store"
            }
        },
        "aggregateRating": product.reviews.length > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.averageRating,
            "reviewCount": product.reviews.length
        } : undefined
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
```

### Organization Schema

```jsx
// components/OrganizationSchema.js
export default function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "My Company",
        "url": "https://mycompany.com",
        "logo": "https://mycompany.com/logo.png",
        "description": "We provide amazing services",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main St",
            "addressLocality": "City",
            "addressRegion": "State",
            "postalCode": "12345",
            "addressCountry": "US"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service"
        },
        "sameAs": [
            "https://facebook.com/mycompany",
            "https://twitter.com/mycompany",
            "https://linkedin.com/company/mycompany"
        ]
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
```

## Dynamic Metadata Generation

### SEO-Friendly URLs

```jsx
// lib/seo.js
export function generateSEOFriendlySlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
}

export function generateMetaTags(data) {
    const {
        title,
        description,
        image,
        url,
        type = 'website',
        siteName = 'My Website'
    } = data;
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName,
            images: image ? [{ url: image }] : [],
            type,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : [],
        },
    };
}
```

### Dynamic Sitemap Generation

```jsx
// app/sitemap.js
export default async function sitemap() {
    const baseUrl = 'https://mywebsite.com';
    
    // Get all posts
    const posts = await fetch(`${baseUrl}/api/posts`).then(res => res.json());
    
    // Get all products
    const products = await fetch(`${baseUrl}/api/products`).then(res => res.json());
    
    const postUrls = posts.map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));
    
    const productUrls = products.map(product => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
    }));
    
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        ...postUrls,
        ...productUrls,
    ];
}
```

### Robots.txt Generation

```jsx
// app/robots.js
export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/private/'],
        },
        sitemap: 'https://mywebsite.com/sitemap.xml',
    };
}
```

## SEO Best Practices

### Image Optimization for SEO

```jsx
import Image from 'next/image';

export default function SEOOptimizedImage({ src, alt, title, width, height }) {
    return (
        <Image
            src={src}
            alt={alt} // Descriptive alt text for accessibility and SEO
            title={title} // Additional context for SEO
            width={width}
            height={height}
            priority={false} // Set to true for above-the-fold images
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
    );
}
```

### Internal Linking Strategy

```jsx
// components/InternalLink.js
import Link from 'next/link';

export default function InternalLink({ href, children, title, ...props }) {
    return (
        <Link
            href={href}
            title={title} // Helps with SEO and accessibility
            {...props}
        >
            {children}
        </Link>
    );
}

// Usage for SEO-friendly internal linking
export default function BlogPost({ post, relatedPosts }) {
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* Related posts for internal linking */}
            <section>
                <h2>Related Posts</h2>
                {relatedPosts.map(relatedPost => (
                    <InternalLink
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        title={`Read more about ${relatedPost.title}`}
                    >
                        {relatedPost.title}
                    </InternalLink>
                ))}
            </section>
        </article>
    );
}
```

### Breadcrumb Navigation

```jsx
// components/Breadcrumbs.js
export default function Breadcrumbs({ items }) {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.href
        }))
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            
            <nav aria-label="Breadcrumb">
                <ol className="breadcrumbs">
                    {items.map((item, index) => (
                        <li key={index}>
                            {index < items.length - 1 ? (
                                <Link href={item.href}>{item.name}</Link>
                            ) : (
                                <span aria-current="page">{item.name}</span>
                            )}
                            {index < items.length - 1 && <span> / </span>}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}

// Usage
export default function ProductPage({ product, category }) {
    const breadcrumbItems = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: category.name, href: `/products/category/${category.slug}` },
        { name: product.name, href: `/products/${product.slug}` },
    ];
    
    return (
        <div>
            <Breadcrumbs items={breadcrumbItems} />
            {/* Product content */}
        </div>
    );
}
```

## Performance and Core Web Vitals

### Optimizing for SEO Performance

```jsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable compression
    compress: true,
    
    // Optimize images
    images: {
        formats: ['image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    
    // Enable experimental features for better performance
    experimental: {
        optimizeCss: true,
    },
    
    // Headers for SEO and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
```

### Monitoring SEO Performance

```jsx
// lib/analytics.js
export function trackSEOMetrics() {
    if (typeof window !== 'undefined') {
        // Track Core Web Vitals
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(console.log);
            getFID(console.log);
            getFCP(console.log);
            getLCP(console.log);
            getTTFB(console.log);
        });
        
        // Track page views for SEO analytics
        const trackPageView = (url) => {
            if (window.gtag) {
                window.gtag('config', 'GA_MEASUREMENT_ID', {
                    page_location: url,
                });
            }
        };
        
        // Track when page becomes visible (for SEO engagement metrics)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible');
            }
        });
    }
}
```

## SEO Testing and Validation

### SEO Checklist Component

```jsx
// components/SEOChecker.js (Development only)
export default function SEOChecker({ metadata }) {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    
    const checks = [
        {
            name: 'Title length',
            passed: metadata.title && metadata.title.length >= 30 && metadata.title.length <= 60,
            message: 'Title should be 30-60 characters',
        },
        {
            name: 'Description length',
            passed: metadata.description && metadata.description.length >= 120 && metadata.description.length <= 160,
            message: 'Description should be 120-160 characters',
        },
        {
            name: 'Open Graph image',
            passed: metadata.openGraph?.images?.length > 0,
            message: 'Open Graph image is required',
        },
        {
            name: 'Canonical URL',
            passed: metadata.alternates?.canonical,
            message: 'Canonical URL should be set',
        },
    ];
    
    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'white', border: '1px solid #ccc', padding: '10px', fontSize: '12px' }}>
            <h4>SEO Checklist</h4>
            {checks.map((check, index) => (
                <div key={index} style={{ color: check.passed ? 'green' : 'red' }}>
                    {check.passed ? '✓' : '✗'} {check.name}: {check.message}
                </div>
            ))}
        </div>
    );
}
```

## Best Practices Summary

1. **Use descriptive, keyword-rich titles** (30-60 characters)
2. **Write compelling meta descriptions** (120-160 characters)
3. **Implement structured data** for rich snippets
4. **Optimize images** with descriptive alt text and proper sizing
5. **Create SEO-friendly URLs** with meaningful slugs
6. **Build internal linking strategy** to distribute page authority
7. **Generate dynamic sitemaps** for better crawlability
8. **Monitor Core Web Vitals** for performance-based SEO
9. **Use semantic HTML** for better content understanding
10. **Implement breadcrumb navigation** for better user experience and SEO
11. **Optimize for mobile-first indexing** with responsive design
12. **Test with SEO tools** like Google Search Console and Lighthouse

Proper SEO implementation in Next.js helps ensure your application is discoverable, ranks well in search results, and provides an excellent user experience.
