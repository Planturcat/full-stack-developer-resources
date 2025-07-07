        # Server-Side Rendering (SSR) vs Static Site Generation (SSG)

Understanding the different rendering strategies in Next.js is crucial for building performant and SEO-friendly applications. This guide covers SSR, SSG, ISR, and when to use each approach.

## Rendering Strategies Overview

### Client-Side Rendering (CSR)
Traditional React apps render on the client side. The server sends a minimal HTML file, and JavaScript builds the page in the browser.

**Pros:**
- Rich interactivity
- Reduced server load
- Good for authenticated content

**Cons:**
- Poor initial SEO
- Slower initial page load
- Requires JavaScript to function

### Server-Side Rendering (SSR)
Pages are rendered on the server for each request, sending fully formed HTML to the client.

**Pros:**
- Excellent SEO
- Fast initial page load
- Works without JavaScript
- Always fresh data

**Cons:**
- Higher server load
- Slower navigation between pages
- More complex caching

### Static Site Generation (SSG)
Pages are pre-rendered at build time and served as static files.

**Pros:**
- Fastest possible loading
- Excellent SEO
- Highly cacheable
- Low server costs

**Cons:**
- Data can become stale
- Longer build times
- Not suitable for dynamic content

### Incremental Static Regeneration (ISR)
Combines the benefits of SSG with the ability to update static content after build time.

**Pros:**
- Fast loading like SSG
- Fresh data when needed
- Reduced build times
- Automatic cache invalidation

**Cons:**
- Complexity in cache management
- Potential for serving stale data briefly
- Requires careful revalidation strategy

## Detailed Implementation Examples

### Static Site Generation (SSG) with getStaticProps

```javascript
// pages/blog/index.js
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  tags: string[]
  readingTime: number
  featured: boolean
}

interface BlogPageProps {
  posts: BlogPost[]
  featuredPost: BlogPost | null
  totalPosts: number
}

export default function BlogPage({ posts, featuredPost, totalPosts }: BlogPageProps) {
  return (
    <>
      <Head>
        <title>Blog - {totalPosts} Articles</title>
        <meta name="description" content={`Read our latest ${totalPosts} blog articles on web development, technology, and more.`} />
        <meta property="og:title" content="Our Blog" />
        <meta property="og:description" content="Latest articles and insights" />
        <link rel="canonical" href="https://example.com/blog" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <FeaturedPostCard post={featuredPost} />
          </section>
        )}

        {/* All Posts */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Latest Articles</h1>
            <span className="text-gray-600">{totalPosts} articles</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <Image
            src={`/images/blog/${post.id}-featured.jpg`}
            alt={post.title}
            width={600}
            height={400}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 p-8">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Featured
            </span>
            <span className="ml-2 text-sm text-gray-500">{post.readingTime} min read</span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
              {post.title}
            </Link>
          </h3>

          <p className="text-gray-600 mb-4">{post.excerpt}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">{new Date(post.publishedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <Link
              href={`/blog/${post.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Image
        src={`/images/blog/${post.id}-thumb.jpg`}
        alt={post.title}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />

      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-500">{post.readingTime} min read</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="ml-2 text-sm text-gray-600">{post.author.name}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  try {
    // Fetch blog posts at build time
    const response = await fetch(`${process.env.CMS_API_URL}/posts?published=true`, {
      headers: {
        'Authorization': `Bearer ${process.env.CMS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const allPosts: BlogPost[] = await response.json()

    // Sort posts by publication date
    const sortedPosts = allPosts.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    // Find featured post
    const featuredPost = sortedPosts.find(post => post.featured) || null

    // Filter out featured post from regular posts
    const posts = sortedPosts.filter(post => !post.featured)

    return {
      props: {
        posts,
        featuredPost,
        totalPosts: allPosts.length,
      },
      // Revalidate every 30 minutes
      revalidate: 1800,
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)

    return {
      props: {
        posts: [],
        featuredPost: null,
        totalPosts: 0,
      },
      // Retry more frequently on error
      revalidate: 300,
    }
  }
}
```

### Dynamic SSG with getStaticPaths

```javascript
// pages/blog/[slug].js
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

interface BlogPostPageProps {
  post: BlogPost & {
    content: MDXRemoteSerializeResult
  }
  relatedPosts: BlogPost[]
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "image": `https://example.com/images/blog/${post.id}-featured.jpg`,
    "publisher": {
      "@type": "Organization",
      "name": "Your Company",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  }

  return (
    <>
      <Head>
        <title>{post.title} | Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={`https://example.com/images/blog/${post.id}-featured.jpg`} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:published_time" content={post.publishedAt} />
        {post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://example.com/blog/${post.id}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-6">
            <Image
              src={`/images/blog/${post.id}-featured.jpg`}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              priority
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-gray-600 mb-6">
            <div className="flex items-center">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm">{new Date(post.publishedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className="text-sm">{post.readingTime} min read</span>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <MDXRemote {...post.content} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map(relatedPost => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Fetch all published posts
    const response = await fetch(`${process.env.CMS_API_URL}/posts?published=true&fields=id`, {
      headers: {
        'Authorization': `Bearer ${process.env.CMS_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch posts for paths')
    }

    const posts = await response.json()

    // Generate paths for all posts
    const paths = posts.map((post: { id: string }) => ({
      params: { slug: post.id }
    }))

    return {
      paths,
      // Enable ISR for new posts
      fallback: 'blocking'
    }
  } catch (error) {
    console.error('Error generating static paths:', error)

    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string

    // Fetch the specific post
    const [postResponse, allPostsResponse] = await Promise.all([
      fetch(`${process.env.CMS_API_URL}/posts/${slug}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CMS_API_TOKEN}`,
        },
      }),
      fetch(`${process.env.CMS_API_URL}/posts?published=true&limit=4`, {
        headers: {
          'Authorization': `Bearer ${process.env.CMS_API_TOKEN}`,
        },
      })
    ])

    if (!postResponse.ok) {
      return { notFound: true }
    }

    const post = await postResponse.json()
    const allPosts = await allPostsResponse.json()

    // Serialize MDX content
    const mdxSource = await serialize(post.content)

    // Find related posts (same tags, excluding current post)
    const relatedPosts = allPosts
      .filter((p: BlogPost) =>
        p.id !== post.id &&
        p.tags.some((tag: string) => post.tags.includes(tag))
      )
      .slice(0, 2)

    return {
      props: {
        post: {
          ...post,
          content: mdxSource,
        },
        relatedPosts,
      },
      // Revalidate every hour
      revalidate: 3600,
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return { notFound: true }
  }
}
```

## Server-Side Rendering (SSR) with getServerSideProps

```javascript
// pages/dashboard/index.js
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useState, useEffect } from 'react'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string
  }
  stats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }
  recentOrders: Order[]
  notifications: Notification[]
}

interface DashboardPageProps {
  initialData: DashboardData
  timestamp: string
}

export default function DashboardPage({ initialData, timestamp }: DashboardPageProps) {
  const [data, setData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/dashboard')
      const newData = await response.json()
      setData(newData)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard - {data.user.name}</title>
        <meta name="description" content="Your personal dashboard with real-time data" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <img
                  src={data.user.avatar}
                  alt={data.user.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {data.user.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Orders"
              value={data.stats.totalOrders}
              icon="📦"
              color="blue"
            />
            <StatCard
              title="Total Revenue"
              value={`$${data.stats.totalRevenue.toLocaleString()}`}
              icon="💰"
              color="green"
            />
            <StatCard
              title="Pending Orders"
              value={data.stats.pendingOrders}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              title="Completed Orders"
              value={data.stats.completedOrders}
              icon="✅"
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <RecentOrdersTable orders={data.recentOrders} />
            </div>

            {/* Notifications */}
            <div>
              <NotificationsList notifications={data.notifications} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'yellow'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (context) => {
  try {
    // Check authentication
    const session = await getSession(context)

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    // Fetch user-specific data
    const [userResponse, statsResponse, ordersResponse, notificationsResponse] = await Promise.all([
      fetch(`${process.env.API_BASE_URL}/users/${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Cookie': context.req.headers.cookie || '',
        },
      }),
      fetch(`${process.env.API_BASE_URL}/users/${session.user.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Cookie': context.req.headers.cookie || '',
        },
      }),
      fetch(`${process.env.API_BASE_URL}/users/${session.user.id}/orders?limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Cookie': context.req.headers.cookie || '',
        },
      }),
      fetch(`${process.env.API_BASE_URL}/users/${session.user.id}/notifications?unread=true`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Cookie': context.req.headers.cookie || '',
        },
      })
    ])

    // Check if all requests were successful
    if (!userResponse.ok || !statsResponse.ok || !ordersResponse.ok || !notificationsResponse.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const [user, stats, recentOrders, notifications] = await Promise.all([
      userResponse.json(),
      statsResponse.json(),
      ordersResponse.json(),
      notificationsResponse.json()
    ])

    return {
      props: {
        initialData: {
          user,
          stats,
          recentOrders,
          notifications,
        },
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('Dashboard SSR error:', error)

    // Return error page or redirect
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    }
  }
}
```

## Incremental Static Regeneration (ISR)

```javascript
// pages/products/[id].js
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

interface ProductPageProps {
  product: Product
  relatedProducts: Product[]
  reviews: Review[]
  lastUpdated: string
}

export default function ProductPage({
  product,
  relatedProducts,
  reviews,
  lastUpdated
}: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <>
      <Head>
        <title>{product.name} | Our Store</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        <link rel="canonical" href={`https://example.com/products/${product.id}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Images */}
          <div className="flex flex-col-reverse">
            {/* Image thumbnails */}
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-25 ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover object-center rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main image */}
            <div className="w-full aspect-square">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-center object-cover sm:rounded-lg"
                priority
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">${product.price}</p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <span
                      key={rating}
                      className={`h-5 w-5 flex-shrink-0 ${
                        product.averageRating > rating
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="sr-only">{product.averageRating} out of 5 stars</p>
                <a href="#reviews" className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                  {reviews.length} reviews
                </a>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-10 flex sm:flex-col1">
              <button
                type="button"
                className="max-w-xs flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-full"
              >
                Add to cart
              </button>
            </div>

            {/* Product details */}
            <section className="mt-12">
              <h2 className="text-sm font-medium text-gray-900">Details</h2>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">{product.details}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Reviews section */}
        <section id="reviews" className="mt-16">
          <h2 className="text-lg font-medium text-gray-900">Customer Reviews</h2>
          <div className="mt-6 space-y-10">
            {reviews.map((review) => (
              <div key={review.id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={review.author.avatar}
                    alt={review.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{review.author.name}</h4>
                  <div className="flex items-center mt-1">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <span
                        key={rating}
                        className={`h-4 w-4 flex-shrink-0 ${
                          review.rating > rating ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related products */}
        <section className="mt-16">
          <h2 className="text-lg font-medium text-gray-900">Related Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="group relative">
                <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                  <Image
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href={`/products/${relatedProduct.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {relatedProduct.name}
                      </a>
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${relatedProduct.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Last updated info */}
        <div className="mt-8 text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Only pre-render the most popular products
    const response = await fetch(`${process.env.API_BASE_URL}/products?popular=true&limit=100`)
    const popularProducts = await response.json()

    const paths = popularProducts.map((product: Product) => ({
      params: { id: product.id }
    }))

    return {
      paths,
      // Enable ISR for other products
      fallback: 'blocking'
    }
  } catch (error) {
    console.error('Error generating product paths:', error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<ProductPageProps> = async ({ params }) => {
  try {
    const productId = params?.id as string

    const [productResponse, reviewsResponse] = await Promise.all([
      fetch(`${process.env.API_BASE_URL}/products/${productId}`),
      fetch(`${process.env.API_BASE_URL}/products/${productId}/reviews?limit=10`)
    ])

    if (!productResponse.ok) {
      return { notFound: true }
    }

    const product = await productResponse.json()
    const reviews = await reviewsResponse.json()

    // Fetch related products
    const relatedResponse = await fetch(
      `${process.env.API_BASE_URL}/products?category=${product.category}&exclude=${productId}&limit=4`
    )
    const relatedProducts = await relatedResponse.json()

    return {
      props: {
        product,
        relatedProducts,
        reviews,
        lastUpdated: new Date().toISOString(),
      },
      // Revalidate every 5 minutes for product data
      // Reviews and inventory can change frequently
      revalidate: 300,
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { notFound: true }
  }
}
```

## Hybrid Approaches and Advanced Patterns

### Client-Side Data Fetching with SWR

```javascript
// pages/profile.js
import useSWR from 'swr'
import { useState } from 'react'
import Head from 'next/head'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Client-side data fetching with SWR
  const { data: profile, error: profileError, mutate: mutateProfile } = useSWR(
    '/api/user/profile',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: activities, error: activitiesError } = useSWR(
    activeTab === 'activity' ? '/api/user/activities' : null,
    fetcher
  )

  const { data: settings, error: settingsError, mutate: mutateSettings } = useSWR(
    activeTab === 'settings' ? '/api/user/settings' : null,
    fetcher
  )

  if (profileError) return <ErrorPage error={profileError} />
  if (!profile) return <LoadingSpinner />

  return (
    <>
      <Head>
        <title>{profile.name} - Profile</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-20 w-20 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {['overview', 'activity', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <ProfileOverview profile={profile} />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                activities={activities}
                loading={!activities && !activitiesError}
                error={activitiesError}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                loading={!settings && !settingsError}
                error={settingsError}
                onUpdate={mutateSettings}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// This page uses CSR - no getServerSideProps or getStaticProps
```

### Combining SSG with Client-Side Updates

```javascript
// pages/news/index.js
import { GetStaticProps } from 'next'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

interface NewsPageProps {
  initialArticles: Article[]
  categories: Category[]
  buildTime: string
}

export default function NewsPage({ initialArticles, categories, buildTime }: NewsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [articles, setArticles] = useState(initialArticles)

  // Client-side data fetching for real-time updates
  const { data: liveArticles } = useSWR(
    `/api/articles?category=${selectedCategory}&live=true`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      fallbackData: initialArticles,
    }
  )

  useEffect(() => {
    if (liveArticles) {
      setArticles(liveArticles)
    }
  }, [liveArticles])

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

  return (
    <>
      <Head>
        <title>Latest News</title>
        <meta name="description" content="Stay updated with the latest news and articles" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Stay updated with breaking news and featured articles
            </p>
            <span className="text-sm text-gray-500">
              Last built: {new Date(buildTime).toLocaleString()}
            </span>
          </div>
        </header>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All News
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found in this category.</p>
          </div>
        )}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<NewsPageProps> = async () => {
  try {
    const [articlesResponse, categoriesResponse] = await Promise.all([
      fetch(`${process.env.API_BASE_URL}/articles?featured=true&limit=20`),
      fetch(`${process.env.API_BASE_URL}/categories`)
    ])

    const initialArticles = await articlesResponse.json()
    const categories = await categoriesResponse.json()

    return {
      props: {
        initialArticles,
        categories,
        buildTime: new Date().toISOString(),
      },
      // Revalidate every 5 minutes
      revalidate: 300,
    }
  } catch (error) {
    console.error('Error fetching news data:', error)
    return {
      props: {
        initialArticles: [],
        categories: [],
        buildTime: new Date().toISOString(),
      },
      revalidate: 60,
    }
  }
}
```

## Performance Optimization Strategies

### Image Optimization

```javascript
// components/OptimizedImage.js
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  sizes?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Failed to load image</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      )}
    </div>
  )
}
```

### Code Splitting and Dynamic Imports

```javascript
// pages/admin/dashboard.js
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'

// Dynamic imports for code splitting
const AdminChart = dynamic(() => import('../components/AdminChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Disable SSR for this component
})

const UserManagement = dynamic(() => import('../components/UserManagement'), {
  loading: () => <div>Loading user management...</div>
})

const ReportsPanel = dynamic(() => import('../components/ReportsPanel'))

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Charts loaded only on client-side */}
      <Suspense fallback={<LoadingSpinner />}>
        <AdminChart />
      </Suspense>

      {/* User management with custom loading */}
      <UserManagement />

      {/* Reports panel */}
      <ReportsPanel />
    </div>
  )
}
```

## Best Practices and Decision Matrix

### When to Use Each Rendering Method

| Scenario | Recommended Method | Reasoning |
|----------|-------------------|-----------|
| **Blog/Documentation** | SSG | Content rarely changes, excellent SEO needed |
| **E-commerce Product Pages** | ISR | Product info changes, but not frequently |
| **User Dashboard** | SSR | Personalized, real-time data required |
| **Admin Panel** | CSR | Highly interactive, behind authentication |
| **News/Content Site** | SSG + CSR | Static content with real-time updates |
| **Social Media Feed** | CSR | Highly dynamic, personalized content |
| **Landing Pages** | SSG | Marketing content, performance critical |
| **Search Results** | SSR | Dynamic content, SEO important |

### Performance Optimization Checklist

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['mongoose'],
  },

  // Image optimization
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Headers for caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ]
  },

  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/node': '@sentry/browser',
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### Error Handling and Fallbacks

```javascript
// pages/_error.js
import { NextPageContext } from 'next'
import Head from 'next/head'

interface ErrorPageProps {
  statusCode: number
  hasGetInitialPropsRun: boolean
  err?: Error
}

export default function ErrorPage({ statusCode, hasGetInitialPropsRun, err }: ErrorPageProps) {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - Error` : 'Client Error'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              {statusCode || 'Error'}
            </h1>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {statusCode === 404
                ? 'Page Not Found'
                : statusCode === 500
                ? 'Internal Server Error'
                : 'An Error Occurred'}
            </h2>

            <p className="text-gray-600 mb-6">
              {statusCode === 404
                ? 'The page you are looking for does not exist.'
                : 'Sorry, something went wrong. Please try again later.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>

              <a
                href="/"
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}
```

## Key Takeaways

### SSG Best Practices
- Use for content that doesn't change frequently
- Implement ISR for content that needs occasional updates
- Pre-render popular pages, use fallback for others
- Optimize build times with selective pre-rendering

### SSR Best Practices
- Use for personalized or frequently changing content
- Implement proper caching strategies
- Handle errors gracefully with fallbacks
- Optimize server response times

### ISR Best Practices
- Set appropriate revalidation intervals
- Use on-demand revalidation for immediate updates
- Monitor cache hit rates and performance
- Implement proper error handling for regeneration failures

### Performance Tips
- Use Next.js Image component for automatic optimization
- Implement code splitting with dynamic imports
- Optimize bundle size with proper tree shaking
- Use appropriate caching headers
- Monitor Core Web Vitals and performance metrics

Understanding these rendering strategies and their trade-offs enables you to build fast, SEO-friendly, and scalable Next.js applications that provide excellent user experiences.
Combines SSG with the ability to update static content without rebuilding the entire site.

**Pros:**
- Fast loading like SSG
- Can update stale content
- Reduced build times
- Good for semi-dynamic content

**Cons:**
- More complex setup
- Potential for serving stale data
- Cache invalidation complexity

## Static Site Generation (SSG)

### Basic SSG with getStaticProps

```jsx
// pages/products.js
export default function Products({ products }) {
    return (
        <div>
            <h1>Our Products</h1>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        <span>${product.price}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// This function runs at build time
export async function getStaticProps() {
    // Fetch data from API, database, or file system
    const res = await fetch('https://api.example.com/products');
    const products = await res.json();
    
    return {
        props: {
            products,
        },
        // Optional: regenerate the page at most once every hour
        revalidate: 3600, // ISR - revalidate every hour
    };
}
```

### Dynamic SSG with getStaticPaths

```jsx
// pages/products/[id].js
export default function Product({ product }) {
    if (!product) {
        return <div>Product not found</div>;
    }
    
    return (
        <div>
            <h1>{product.name}</h1>
            <img src={product.image} alt={product.name} />
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>In Stock: {product.stock}</p>
        </div>
    );
}

// Generate static paths at build time
export async function getStaticPaths() {
    // Fetch all product IDs
    const res = await fetch('https://api.example.com/products');
    const products = await res.json();
    
    // Generate paths for each product
    const paths = products.map(product => ({
        params: { id: product.id.toString() }
    }));
    
    return {
        paths,
        fallback: 'blocking', // or false, true, or 'blocking'
    };
}

export async function getStaticProps({ params }) {
    try {
        const res = await fetch(`https://api.example.com/products/${params.id}`);
        
        if (!res.ok) {
            return {
                notFound: true,
            };
        }
        
        const product = await res.json();
        
        return {
            props: {
                product,
            },
            revalidate: 3600, // ISR
        };
    } catch (error) {
        return {
            notFound: true,
        };
    }
}
```

### Fallback Options

```jsx
export async function getStaticPaths() {
    // Pre-generate only the most popular products
    const popularProducts = await fetchPopularProducts();
    
    const paths = popularProducts.map(product => ({
        params: { id: product.id.toString() }
    }));
    
    return {
        paths,
        fallback: 'blocking', // Options: false, true, 'blocking'
    };
}

// fallback: false
// - Only pre-generated paths are valid
// - 404 for any other path

// fallback: true
// - Shows loading state while generating
// - Good for large number of pages
// - Requires handling loading state in component

// fallback: 'blocking'
// - Waits for generation before showing page
// - No loading state needed
// - Better for SEO
```

## Server-Side Rendering (SSR)

### Basic SSR with getServerSideProps

```jsx
// pages/dashboard.js
export default function Dashboard({ user, notifications }) {
    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <div className="notifications">
                <h2>Recent Notifications</h2>
                {notifications.map(notification => (
                    <div key={notification.id} className="notification">
                        <p>{notification.message}</p>
                        <small>{notification.timestamp}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

// This function runs on every request
export async function getServerSideProps(context) {
    const { req, res, query, params } = context;
    
    // Access cookies, headers, etc.
    const token = req.cookies.authToken;
    
    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }
    
    try {
        // Fetch user-specific data
        const [userRes, notificationsRes] = await Promise.all([
            fetch('https://api.example.com/user', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch('https://api.example.com/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);
        
        const user = await userRes.json();
        const notifications = await notificationsRes.json();
        
        return {
            props: {
                user,
                notifications,
            },
        };
    } catch (error) {
        return {
            redirect: {
                destination: '/error',
                permanent: false,
            },
        };
    }
}
```

### SSR with Error Handling

```jsx
export async function getServerSideProps(context) {
    try {
        const data = await fetchData();
        
        return {
            props: { data },
        };
    } catch (error) {
        console.error('SSR Error:', error);
        
        // Return error props instead of crashing
        return {
            props: {
                error: 'Failed to load data',
                data: null,
            },
        };
    }
}

export default function Page({ data, error }) {
    if (error) {
        return <ErrorComponent message={error} />;
    }
    
    return <DataComponent data={data} />;
}
```

## Incremental Static Regeneration (ISR)

### Basic ISR Implementation

```jsx
// pages/blog/[slug].js
export default function BlogPost({ post, lastUpdated }) {
    return (
        <article>
            <h1>{post.title}</h1>
            <p>Published: {post.publishedAt}</p>
            <p>Last updated: {lastUpdated}</p>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}

export async function getStaticPaths() {
    // Pre-generate popular posts
    const popularPosts = await fetchPopularPosts();
    
    const paths = popularPosts.map(post => ({
        params: { slug: post.slug }
    }));
    
    return {
        paths,
        fallback: 'blocking',
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
        props: {
            post,
            lastUpdated: new Date().toISOString(),
        },
        // Regenerate the page at most once every 60 seconds
        revalidate: 60,
    };
}
```

### On-Demand ISR (Next.js 12.2+)

```jsx
// pages/api/revalidate.js
export default async function handler(req, res) {
    // Check for secret to confirm this is a valid request
    if (req.query.secret !== process.env.REVALIDATION_SECRET) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    
    try {
        // Revalidate specific paths
        await res.revalidate('/blog');
        await res.revalidate(`/blog/${req.query.slug}`);
        
        return res.json({ revalidated: true });
    } catch (err) {
        return res.status(500).send('Error revalidating');
    }
}

// Trigger revalidation from your CMS webhook
// POST /api/revalidate?secret=YOUR_SECRET&slug=post-slug
```

## Choosing the Right Strategy

### Decision Matrix

| Content Type | Frequency of Updates | User-Specific | Recommended Strategy |
|--------------|---------------------|---------------|---------------------|
| Marketing pages | Rarely | No | SSG |
| Blog posts | Occasionally | No | SSG with ISR |
| Product catalog | Daily | No | SSG with ISR |
| User dashboard | Real-time | Yes | SSR |
| Search results | Real-time | Varies | SSR |
| Comments | Real-time | No | CSR + API |

### Use SSG When:
- Content doesn't change frequently
- Same content for all users
- SEO is important
- Performance is critical
- You can predict the pages needed

### Use SSR When:
- Content changes frequently
- Content is user-specific
- You need real-time data
- Pages can't be pre-generated
- Authentication is required

### Use ISR When:
- Content changes occasionally
- You want SSG benefits with some freshness
- You have many pages to generate
- Build times are becoming too long
- You can tolerate slightly stale data

## Performance Considerations

### Optimizing SSG Build Times

```jsx
// Limit the number of pages generated at build time
export async function getStaticPaths() {
    // Only pre-generate the most important pages
    const importantPosts = await fetchImportantPosts(100); // Limit to 100
    
    const paths = importantPosts.map(post => ({
        params: { slug: post.slug }
    }));
    
    return {
        paths,
        fallback: 'blocking', // Generate others on-demand
    };
}
```

### Caching Strategies

```jsx
export async function getServerSideProps(context) {
    // Set cache headers
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    );
    
    const data = await fetchData();
    
    return {
        props: { data },
    };
}
```

### Parallel Data Fetching

```jsx
export async function getStaticProps() {
    // Fetch data in parallel
    const [posts, categories, tags] = await Promise.all([
        fetchPosts(),
        fetchCategories(),
        fetchTags(),
    ]);
    
    return {
        props: {
            posts,
            categories,
            tags,
        },
        revalidate: 3600,
    };
}
```

## Best Practices

1. **Start with SSG** and move to SSR only when necessary
2. **Use ISR for semi-dynamic content** that doesn't need real-time updates
3. **Implement proper error handling** in data fetching functions
4. **Cache API responses** to improve build times and reduce API calls
5. **Use fallback: 'blocking'** for better SEO than fallback: true
6. **Monitor your build times** and optimize when they become too long
7. **Implement proper loading states** for fallback pages
8. **Use environment variables** for API endpoints and secrets
9. **Test your pages** in different scenarios (build time, runtime, etc.)
10. **Monitor Core Web Vitals** to ensure good performance

Understanding these rendering strategies allows you to build Next.js applications that are both performant and provide excellent user experiences while maintaining good SEO characteristics.
