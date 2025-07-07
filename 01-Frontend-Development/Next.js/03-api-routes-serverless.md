# API Routes and Serverless Functions

Next.js API routes allow you to build backend functionality directly within your Next.js application. These routes run as serverless functions, providing a scalable and cost-effective way to handle server-side logic, database operations, and third-party integrations.

## API Routes Basics

### Creating API Routes (Pages Router)

```javascript
// pages/api/hello.js
export default function handler(req, res) {
    res.status(200).json({ message: 'Hello from Next.js API!' });
}
```

### Creating API Routes (App Router)

```javascript
// app/api/hello/route.js
export async function GET(request) {
    return Response.json({ message: 'Hello from Next.js API!' });
}

export async function POST(request) {
    const body = await request.json();
    return Response.json({ received: body });
}
```

### HTTP Methods Handling

```javascript
// pages/api/users.js
export default function handler(req, res) {
    const { method } = req;
    
    switch (method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        case 'PUT':
            return handlePut(req, res);
        case 'DELETE':
            return handleDelete(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function handleGet(req, res) {
    try {
        const users = await fetchUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

async function handlePost(req, res) {
    try {
        const { name, email } = req.body;
        
        // Validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const user = await createUser({ name, email });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
}

async function handlePut(req, res) {
    try {
        const { id } = req.query;
        const updates = req.body;
        
        const user = await updateUser(id, updates);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
}

async function handleDelete(req, res) {
    try {
        const { id } = req.query;
        
        const deleted = await deleteUser(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
}
```

## Dynamic API Routes

### Single Dynamic Parameter

```javascript
// pages/api/users/[id].js
export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;
    
    switch (method) {
        case 'GET':
            try {
                const user = await getUserById(id);
                
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                res.status(200).json(user);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch user' });
            }
            break;
            
        case 'PUT':
            try {
                const user = await updateUser(id, req.body);
                res.status(200).json(user);
            } catch (error) {
                res.status(500).json({ error: 'Failed to update user' });
            }
            break;
            
        case 'DELETE':
            try {
                await deleteUser(id);
                res.status(204).end();
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete user' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
```

### Catch-All API Routes

```javascript
// pages/api/files/[...path].js
export default async function handler(req, res) {
    const { path } = req.query;
    const filePath = Array.isArray(path) ? path.join('/') : path;
    
    switch (req.method) {
        case 'GET':
            try {
                const file = await getFile(filePath);
                
                if (!file) {
                    return res.status(404).json({ error: 'File not found' });
                }
                
                // Set appropriate headers for file download
                res.setHeader('Content-Type', file.mimeType);
                res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
                res.send(file.buffer);
            } catch (error) {
                res.status(500).json({ error: 'Failed to retrieve file' });
            }
            break;
            
        case 'POST':
            try {
                const file = await uploadFile(filePath, req.body);
                res.status(201).json(file);
            } catch (error) {
                res.status(500).json({ error: 'Failed to upload file' });
            }
            break;
            
        case 'DELETE':
            try {
                await deleteFile(filePath);
                res.status(204).end();
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete file' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
```

## Request and Response Handling

### Request Processing

```javascript
// pages/api/contact.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Parse request body
    const { name, email, message } = req.body;
    
    // Access headers
    const userAgent = req.headers['user-agent'];
    const contentType = req.headers['content-type'];
    
    // Access cookies
    const sessionId = req.cookies.sessionId;
    
    // Access query parameters
    const { source } = req.query;
    
    // Validation
    const errors = validateContactForm({ name, email, message });
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    try {
        // Process the contact form
        await sendContactEmail({ name, email, message, source, userAgent });
        
        // Set response headers
        res.setHeader('X-Contact-Processed', 'true');
        
        // Set cookies
        res.setHeader('Set-Cookie', 'contact-sent=true; Path=/; HttpOnly');
        
        res.status(200).json({ 
            success: true, 
            message: 'Contact form submitted successfully' 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}

function validateContactForm({ name, email, message }) {
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.push('Valid email is required');
    }
    
    if (!message || message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
}
```

### File Upload Handling

```javascript
// pages/api/upload.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disable body parsing for file uploads
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const form = formidable({
        uploadDir: './uploads',
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    try {
        const [fields, files] = await form.parse(req);
        
        const uploadedFile = files.file[0];
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(uploadedFile.mimetype)) {
            // Clean up uploaded file
            fs.unlinkSync(uploadedFile.filepath);
            return res.status(400).json({ error: 'Invalid file type' });
        }
        
        // Generate unique filename
        const fileName = `${Date.now()}-${uploadedFile.originalFilename}`;
        const newPath = path.join('./uploads', fileName);
        
        // Move file to final location
        fs.renameSync(uploadedFile.filepath, newPath);
        
        res.status(200).json({
            success: true,
            fileName,
            size: uploadedFile.size,
            type: uploadedFile.mimetype,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
}
```

## Database Integration

### MongoDB Integration

```javascript
// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;

// pages/api/products.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('ecommerce');
    
    switch (req.method) {
        case 'GET':
            try {
                const { category, page = 1, limit = 10 } = req.query;
                const skip = (page - 1) * limit;
                
                let query = {};
                if (category) {
                    query.category = category;
                }
                
                const products = await db
                    .collection('products')
                    .find(query)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .toArray();
                
                const total = await db.collection('products').countDocuments(query);
                
                res.status(200).json({
                    products,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit),
                    },
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch products' });
            }
            break;
            
        case 'POST':
            try {
                const product = req.body;
                
                // Add timestamps
                product.createdAt = new Date();
                product.updatedAt = new Date();
                
                const result = await db.collection('products').insertOne(product);
                
                res.status(201).json({
                    ...product,
                    _id: result.insertedId,
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to create product' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
```

### PostgreSQL with Prisma

```javascript
// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// pages/api/users/[id].js
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    
    switch (req.method) {
        case 'GET':
            try {
                const user = await prisma.user.findUnique({
                    where: { id: parseInt(id) },
                    include: {
                        posts: true,
                        profile: true,
                    },
                });
                
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                res.status(200).json(user);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch user' });
            }
            break;
            
        case 'PUT':
            try {
                const user = await prisma.user.update({
                    where: { id: parseInt(id) },
                    data: req.body,
                });
                
                res.status(200).json(user);
            } catch (error) {
                if (error.code === 'P2025') {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.status(500).json({ error: 'Failed to update user' });
            }
            break;
            
        case 'DELETE':
            try {
                await prisma.user.delete({
                    where: { id: parseInt(id) },
                });
                
                res.status(204).end();
            } catch (error) {
                if (error.code === 'P2025') {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.status(500).json({ error: 'Failed to delete user' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
```

## Authentication and Authorization

### JWT Authentication

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

export function requireAuth(handler) {
    return async (req, res) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = decoded;
        return handler(req, res);
    };
}

// pages/api/auth/login.js
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { email, password } = req.body;
    
    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });
        
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
}

// pages/api/protected.js
import { requireAuth } from '../../lib/auth';

export default requireAuth(async function handler(req, res) {
    // This handler only runs if the user is authenticated
    res.status(200).json({
        message: 'This is protected data',
        user: req.user,
    });
});
```

## Error Handling and Validation

### Centralized Error Handling

```javascript
// lib/apiHandler.js
export function apiHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            console.error('API Error:', error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.details,
                });
            }
            
            if (error.name === 'UnauthorizedError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                });
            }
            
            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    error: 'Resource not found',
                });
            }
            
            // Generic server error
            res.status(500).json({
                error: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    details: error.message,
                    stack: error.stack,
                }),
            });
        }
    };
}

// lib/validation.js
import Joi from 'joi';

export function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.details = error.details.map(detail => detail.message);
            throw validationError;
        }
        
        next();
    };
}

export const userSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

// pages/api/users.js
import { apiHandler } from '../../lib/apiHandler';
import { validate, userSchema } from '../../lib/validation';

export default apiHandler(async function handler(req, res) {
    if (req.method === 'POST') {
        // Validate request body
        validate(userSchema)(req, res, () => {});
        
        // Create user logic here
        const user = await createUser(req.body);
        res.status(201).json(user);
    }
});
```

## Best Practices

1. **Use environment variables** for sensitive configuration
2. **Implement proper error handling** and logging
3. **Validate all inputs** before processing
4. **Use HTTPS** in production
5. **Implement rate limiting** to prevent abuse
6. **Use CORS** appropriately for cross-origin requests
7. **Keep functions small and focused** on single responsibilities
8. **Use TypeScript** for better type safety
9. **Implement proper authentication** and authorization
10. **Monitor and log** API usage and errors
11. **Use database connection pooling** for better performance
12. **Implement caching** where appropriate

API routes in Next.js provide a powerful way to build full-stack applications with serverless architecture, offering scalability and cost-effectiveness while maintaining excellent developer experience.
