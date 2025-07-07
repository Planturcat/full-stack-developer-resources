# Middleware and Authentication

Next.js middleware allows you to run code before a request is completed, enabling powerful features like authentication, redirects, rewriting, and request/response modification. This guide covers middleware implementation and authentication patterns.

## Next.js Middleware Basics

### Creating Middleware

```javascript
// middleware.js (in project root)
import { NextResponse } from 'next/server';

export function middleware(request) {
    // Log all requests
    console.log(`${request.method} ${request.url}`);
    
    // Add custom headers
    const response = NextResponse.next();
    response.headers.set('X-Custom-Header', 'middleware-value');
    
    return response;
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
```

### Advanced Middleware Configuration

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Different logic for different routes
    if (pathname.startsWith('/admin')) {
        return handleAdminRoutes(request);
    }
    
    if (pathname.startsWith('/api/')) {
        return handleApiRoutes(request);
    }
    
    if (pathname.startsWith('/auth/')) {
        return handleAuthRoutes(request);
    }
    
    return NextResponse.next();
}

function handleAdminRoutes(request) {
    const token = request.cookies.get('admin-token');
    
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Add admin-specific headers
    const response = NextResponse.next();
    response.headers.set('X-Admin-Access', 'true');
    return response;
}

function handleApiRoutes(request) {
    // Add CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
}

function handleAuthRoutes(request) {
    const isAuthenticated = request.cookies.get('auth-token');
    
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && request.nextUrl.pathname !== '/auth/logout') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/:path*',
        '/auth/:path*',
        '/dashboard/:path*',
        '/profile/:path*',
    ],
};
```

## Authentication Patterns

### JWT-Based Authentication

```javascript
// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Protected routes
    const protectedPaths = ['/dashboard', '/profile', '/admin'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    
    if (isProtectedPath) {
        const token = request.cookies.get('auth-token')?.value;
        
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        
        const decoded = verifyToken(token);
        
        if (!decoded) {
            // Invalid token, redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth-token');
            return response;
        }
        
        // Add user info to headers for API routes
        const response = NextResponse.next();
        response.headers.set('X-User-ID', decoded.userId);
        response.headers.set('X-User-Email', decoded.email);
        
        return response;
    }
    
    return NextResponse.next();
}
```

### Session-Based Authentication

```javascript
// lib/session.js
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
}

export async function verifySession(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

// middleware.js
import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Check if route requires authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
        const sessionToken = request.cookies.get('session')?.value;
        
        if (!sessionToken) {
            return redirectToLogin(request);
        }
        
        const session = await verifySession(sessionToken);
        
        if (!session) {
            return redirectToLogin(request);
        }
        
        // Check role-based access
        if (pathname.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        // Refresh session if it's close to expiring
        const response = NextResponse.next();
        if (shouldRefreshSession(session)) {
            const newToken = await createSession({
                userId: session.userId,
                email: session.email,
                role: session.role,
            });
            
            response.cookies.set('session', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
            });
        }
        
        return response;
    }
    
    return NextResponse.next();
}

function redirectToLogin(request) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

function shouldRefreshSession(session) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.exp - now;
    return timeUntilExpiry < 60 * 60; // Refresh if less than 1 hour remaining
}
```

### OAuth Integration

```javascript
// lib/oauth.js
export const oauthProviders = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        scope: 'openid email profile',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI,
        scope: 'user:email',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
    },
};

export function generateOAuthUrl(provider, state) {
    const config = oauthProviders[provider];
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        response_type: 'code',
        state,
    });
    
    return `${config.authUrl}?${params.toString()}`;
}

// pages/api/auth/[...nextauth].js (using NextAuth.js)
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../lib/prisma';

export default NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                token.accessToken = account.access_token;
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.userId = token.userId;
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
    },
});

// middleware.js with NextAuth
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Additional middleware logic
        console.log('Authenticated user:', req.nextauth.token?.email);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Check if user has required permissions
                if (req.nextUrl.pathname.startsWith('/admin')) {
                    return token?.role === 'admin';
                }
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*'],
};
```

## Advanced Middleware Use Cases

### Rate Limiting

```javascript
// lib/rateLimit.js
const rateLimitMap = new Map();

export function rateLimit(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create rate limit data for this identifier
    let requests = rateLimitMap.get(identifier) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= limit) {
        return {
            success: false,
            remaining: 0,
            resetTime: requests[0] + windowMs,
        };
    }
    
    // Add current request
    requests.push(now);
    rateLimitMap.set(identifier, requests);
    
    return {
        success: true,
        remaining: limit - requests.length,
        resetTime: now + windowMs,
    };
}

// middleware.js
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rateLimit';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
        const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
        const result = rateLimit(ip, 100, 60000); // 100 requests per minute
        
        if (!result.success) {
            return new NextResponse(
                JSON.stringify({ error: 'Rate limit exceeded' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': result.resetTime.toString(),
                    },
                }
            );
        }
        
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
        
        return response;
    }
    
    return NextResponse.next();
}
```

### Geolocation-Based Routing

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const country = request.geo?.country || 'US';
    const { pathname } = request.nextUrl;
    
    // Redirect based on country
    if (pathname === '/' && !pathname.startsWith('/en') && !pathname.startsWith('/es')) {
        if (country === 'ES' || country === 'MX' || country === 'AR') {
            return NextResponse.redirect(new URL('/es', request.url));
        }
        return NextResponse.redirect(new URL('/en', request.url));
    }
    
    // Block access from certain countries
    const blockedCountries = ['XX', 'YY']; // Replace with actual country codes
    if (blockedCountries.includes(country)) {
        return new NextResponse('Access denied', { status: 403 });
    }
    
    // Add country info to headers
    const response = NextResponse.next();
    response.headers.set('X-User-Country', country);
    
    return response;
}
```

### A/B Testing

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // A/B test for homepage
    if (pathname === '/') {
        const variant = getABTestVariant(request);
        
        if (variant === 'B') {
            return NextResponse.rewrite(new URL('/homepage-variant-b', request.url));
        }
    }
    
    return NextResponse.next();
}

function getABTestVariant(request) {
    // Check if user already has a variant assigned
    const existingVariant = request.cookies.get('ab-test-homepage')?.value;
    if (existingVariant) {
        return existingVariant;
    }
    
    // Assign new variant (50/50 split)
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    
    const response = NextResponse.next();
    response.cookies.set('ab-test-homepage', variant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
    });
    
    return variant;
}
```

## Security Middleware

### CSRF Protection

```javascript
// lib/csrf.js
import crypto from 'crypto';

export function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token, sessionToken) {
    return token === sessionToken;
}

// middleware.js
import { NextResponse } from 'next/server';
import { generateCSRFToken, verifyCSRFToken } from './lib/csrf';

export function middleware(request) {
    const { pathname, method } = request.nextUrl;
    
    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && pathname.startsWith('/api/')) {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionCSRF = request.cookies.get('csrf-token')?.value;
        
        if (!csrfToken || !sessionCSRF || !verifyCSRFToken(csrfToken, sessionCSRF)) {
            return new NextResponse('CSRF token mismatch', { status: 403 });
        }
    }
    
    // Generate CSRF token for new sessions
    const response = NextResponse.next();
    if (!request.cookies.get('csrf-token')) {
        const token = generateCSRFToken();
        response.cookies.set('csrf-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }
    
    return response;
}
```

### Content Security Policy

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const response = NextResponse.next();
    
    // Set security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.example.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com",
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
    
    return response;
}
```

## Testing Middleware

```javascript
// __tests__/middleware.test.js
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

describe('Middleware', () => {
    it('should redirect unauthenticated users to login', async () => {
        const request = new NextRequest('http://localhost:3000/dashboard');
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('http://localhost:3000/login');
    });
    
    it('should allow authenticated users to access protected routes', async () => {
        const request = new NextRequest('http://localhost:3000/dashboard');
        request.cookies.set('auth-token', 'valid-token');
        
        const response = await middleware(request);
        
        expect(response.status).toBe(200);
    });
    
    it('should apply rate limiting to API routes', async () => {
        const request = new NextRequest('http://localhost:3000/api/data');
        
        // Make multiple requests to trigger rate limit
        for (let i = 0; i < 101; i++) {
            await middleware(request);
        }
        
        const response = await middleware(request);
        expect(response.status).toBe(429);
    });
});
```

## Best Practices

1. **Keep middleware lightweight** - avoid heavy computations
2. **Use appropriate matchers** to limit middleware execution
3. **Handle errors gracefully** with proper fallbacks
4. **Implement proper logging** for debugging and monitoring
5. **Use environment variables** for configuration
6. **Test middleware thoroughly** including edge cases
7. **Consider performance impact** of middleware on all requests
8. **Implement proper security measures** like CSRF protection
9. **Use TypeScript** for better type safety
10. **Monitor middleware performance** in production
11. **Cache expensive operations** when possible
12. **Follow the principle of least privilege** for access control

Middleware provides powerful capabilities for implementing cross-cutting concerns like authentication, security, and request modification in Next.js applications.
