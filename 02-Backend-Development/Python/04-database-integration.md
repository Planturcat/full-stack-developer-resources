# Database Integration

Database integration is crucial for backend applications. This guide covers working with databases in Python using SQLAlchemy ORM, Django ORM, and raw SQL, along with best practices for database design and optimization.

## SQLAlchemy - The Python SQL Toolkit

### Basic SQLAlchemy Setup

```python
# database.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/mydb')
# For SQLite: 'sqlite:///./app.db'
# For MySQL: 'mysql+pymysql://user:password@localhost/mydb'

engine = create_engine(DATABASE_URL, echo=True)  # echo=True for SQL logging
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user")

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    
    # Relationships
    posts = relationship("Post", back_populates="category")

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    slug = Column(String(200), unique=True, index=True)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # Relationships
    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")

# Create tables
Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### CRUD Operations with SQLAlchemy

```python
# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from database import User, Post, Category, Comment
from typing import List, Optional

class UserCRUD:
    @staticmethod
    def create_user(db: Session, username: str, email: str, full_name: str = None) -> User:
        """Create a new user."""
        db_user = User(
            username=username,
            email=email,
            full_name=full_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get multiple users with pagination."""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> Optional[User]:
        """Update user information."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False

class PostCRUD:
    @staticmethod
    def create_post(db: Session, title: str, content: str, author_id: int, 
                   category_id: int = None, slug: str = None) -> Post:
        """Create a new post."""
        if not slug:
            slug = title.lower().replace(' ', '-').replace(',', '').replace('.', '')
        
        db_post = Post(
            title=title,
            content=content,
            slug=slug,
            author_id=author_id,
            category_id=category_id
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    
    @staticmethod
    def get_posts(db: Session, skip: int = 0, limit: int = 10, 
                 published_only: bool = True) -> List[Post]:
        """Get posts with pagination and filtering."""
        query = db.query(Post)
        
        if published_only:
            query = query.filter(Post.published == True)
        
        return query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_posts_by_category(db: Session, category_id: int, 
                            skip: int = 0, limit: int = 10) -> List[Post]:
        """Get posts by category."""
        return (db.query(Post)
                .filter(and_(Post.category_id == category_id, Post.published == True))
                .order_by(desc(Post.created_at))
                .offset(skip)
                .limit(limit)
                .all())
    
    @staticmethod
    def search_posts(db: Session, search_term: str, skip: int = 0, limit: int = 10) -> List[Post]:
        """Search posts by title or content."""
        return (db.query(Post)
                .filter(and_(
                    or_(
                        Post.title.ilike(f'%{search_term}%'),
                        Post.content.ilike(f'%{search_term}%')
                    ),
                    Post.published == True
                ))
                .order_by(desc(Post.created_at))
                .offset(skip)
                .limit(limit)
                .all())
    
    @staticmethod
    def get_post_with_comments(db: Session, post_id: int) -> Optional[Post]:
        """Get post with all comments loaded."""
        return (db.query(Post)
                .filter(Post.id == post_id)
                .first())

# Advanced queries
class AdvancedQueries:
    @staticmethod
    def get_user_post_count(db: Session) -> List[tuple]:
        """Get users with their post counts."""
        return (db.query(User.username, func.count(Post.id).label('post_count'))
                .outerjoin(Post)
                .group_by(User.id, User.username)
                .all())
    
    @staticmethod
    def get_popular_categories(db: Session, limit: int = 5) -> List[tuple]:
        """Get categories with most posts."""
        return (db.query(Category.name, func.count(Post.id).label('post_count'))
                .join(Post)
                .group_by(Category.id, Category.name)
                .order_by(desc('post_count'))
                .limit(limit)
                .all())
    
    @staticmethod
    def get_recent_activity(db: Session, days: int = 7) -> List[Post]:
        """Get recent posts within specified days."""
        from datetime import datetime, timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return (db.query(Post)
                .filter(Post.created_at >= cutoff_date)
                .order_by(desc(Post.created_at))
                .all())
```

### Database Migrations with Alembic

```python
# alembic/env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig
import os
import sys

# Add your project directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from database import Base

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# Set target metadata
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

# Migration commands:
# alembic init alembic
# alembic revision --autogenerate -m "Create initial tables"
# alembic upgrade head
# alembic downgrade -1
```

## Django ORM

### Django Models with Advanced Features

```python
# models.py
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.text import slugify
from django.core.validators import MinLengthValidator, EmailValidator

class TimestampedModel(models.Model):
    """Abstract base class with timestamp fields."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Category(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blog:category_detail', kwargs={'slug': self.slug})

class PostManager(models.Manager):
    """Custom manager for Post model."""
    
    def published(self):
        return self.filter(status='published')
    
    def by_category(self, category_slug):
        return self.published().filter(category__slug=category_slug)
    
    def search(self, query):
        return self.published().filter(
            models.Q(title__icontains=query) | 
            models.Q(content__icontains=query)
        )

class Post(TimestampedModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=300, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    featured_image = models.ImageField(upload_to='posts/', blank=True, null=True)
    view_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    
    objects = PostManager()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        if not self.excerpt and self.content:
            self.excerpt = self.content[:297] + '...' if len(self.content) > 300 else self.content
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={'slug': self.slug})
    
    @property
    def is_published(self):
        return self.status == 'published'

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Comment(TimestampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(validators=[MinLengthValidator(10)])
    is_approved = models.BooleanField(default=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
```

### Django QuerySet Operations

```python
# queries.py
from django.db.models import Q, Count, Avg, Max, Min, Sum, F, Value
from django.db.models.functions import Concat, Lower, Upper
from .models import Post, Category, Comment, Tag

class BlogQueries:
    @staticmethod
    def get_published_posts():
        """Get all published posts."""
        return Post.objects.published()
    
    @staticmethod
    def get_posts_with_comments_count():
        """Get posts with comment count."""
        return Post.objects.published().annotate(
            comment_count=Count('comments', filter=Q(comments__is_approved=True))
        )
    
    @staticmethod
    def get_popular_posts(limit=5):
        """Get most viewed posts."""
        return Post.objects.published().order_by('-view_count')[:limit]
    
    @staticmethod
    def get_posts_by_tag(tag_name):
        """Get posts by tag name."""
        return Post.objects.published().filter(tags__name__iexact=tag_name)
    
    @staticmethod
    def search_posts(query):
        """Search posts by title and content."""
        return Post.objects.published().filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query) |
            Q(tags__name__icontains=query)
        ).distinct()
    
    @staticmethod
    def get_category_stats():
        """Get category statistics."""
        return Category.objects.annotate(
            post_count=Count('post', filter=Q(post__status='published')),
            avg_views=Avg('post__view_count', filter=Q(post__status='published'))
        ).filter(post_count__gt=0)
    
    @staticmethod
    def get_author_stats():
        """Get author statistics."""
        from django.contrib.auth.models import User
        return User.objects.annotate(
            post_count=Count('posts', filter=Q(posts__status='published')),
            total_views=Sum('posts__view_count', filter=Q(posts__status='published')),
            avg_views=Avg('posts__view_count', filter=Q(posts__status='published'))
        ).filter(post_count__gt=0)
    
    @staticmethod
    def get_recent_comments(days=7):
        """Get recent comments within specified days."""
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        
        return Comment.objects.filter(
            created_at__gte=cutoff_date,
            is_approved=True
        ).select_related('post', 'author')
    
    @staticmethod
    def get_posts_with_related_data():
        """Get posts with optimized related data loading."""
        return Post.objects.published().select_related(
            'author', 'category'
        ).prefetch_related(
            'tags', 'comments__author'
        )
    
    @staticmethod
    def bulk_update_view_counts(post_ids):
        """Bulk update view counts for multiple posts."""
        Post.objects.filter(id__in=post_ids).update(
            view_count=F('view_count') + 1
        )
```

## Raw SQL and Database Optimization

### Using Raw SQL

```python
# raw_sql.py
from django.db import connection
from sqlalchemy import text
from database import SessionLocal

class RawSQLQueries:
    @staticmethod
    def django_raw_sql():
        """Execute raw SQL in Django."""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.title, u.username, COUNT(c.id) as comment_count
                FROM blog_post p
                JOIN auth_user u ON p.author_id = u.id
                LEFT JOIN blog_comment c ON p.id = c.post_id AND c.is_approved = true
                WHERE p.status = 'published'
                GROUP BY p.id, p.title, u.username
                ORDER BY comment_count DESC
                LIMIT 10
            """)
            return cursor.fetchall()
    
    @staticmethod
    def sqlalchemy_raw_sql():
        """Execute raw SQL with SQLAlchemy."""
        db = SessionLocal()
        try:
            result = db.execute(text("""
                SELECT u.username, COUNT(p.id) as post_count, AVG(p.view_count) as avg_views
                FROM users u
                LEFT JOIN posts p ON u.id = p.author_id AND p.published = true
                GROUP BY u.id, u.username
                HAVING COUNT(p.id) > 0
                ORDER BY post_count DESC
            """))
            return result.fetchall()
        finally:
            db.close()
    
    @staticmethod
    def complex_analytics_query():
        """Complex analytics query with raw SQL."""
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH monthly_stats AS (
                    SELECT 
                        DATE_TRUNC('month', created_at) as month,
                        COUNT(*) as post_count,
                        AVG(view_count) as avg_views
                    FROM blog_post 
                    WHERE status = 'published'
                    GROUP BY DATE_TRUNC('month', created_at)
                ),
                category_stats AS (
                    SELECT 
                        c.name as category_name,
                        COUNT(p.id) as post_count,
                        SUM(p.view_count) as total_views
                    FROM blog_category c
                    LEFT JOIN blog_post p ON c.id = p.category_id AND p.status = 'published'
                    GROUP BY c.id, c.name
                )
                SELECT 
                    ms.month,
                    ms.post_count,
                    ms.avg_views,
                    cs.category_name,
                    cs.total_views
                FROM monthly_stats ms
                CROSS JOIN category_stats cs
                ORDER BY ms.month DESC, cs.total_views DESC
            """)
            return cursor.fetchall()

# Database optimization techniques
class DatabaseOptimization:
    @staticmethod
    def create_indexes():
        """Create database indexes for better performance."""
        with connection.cursor() as cursor:
            # Composite index for filtering and sorting
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_post_status_created 
                ON blog_post(status, created_at DESC)
            """)
            
            # Index for search functionality
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_post_title_content 
                ON blog_post USING gin(to_tsvector('english', title || ' ' || content))
            """)
            
            # Index for foreign key relationships
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_comment_post_approved 
                ON blog_comment(post_id, is_approved)
            """)
    
    @staticmethod
    def analyze_query_performance():
        """Analyze query performance with EXPLAIN."""
        with connection.cursor() as cursor:
            cursor.execute("""
                EXPLAIN ANALYZE
                SELECT p.title, u.username, COUNT(c.id)
                FROM blog_post p
                JOIN auth_user u ON p.author_id = u.id
                LEFT JOIN blog_comment c ON p.id = c.post_id
                WHERE p.status = 'published'
                GROUP BY p.id, p.title, u.username
                ORDER BY COUNT(c.id) DESC
                LIMIT 10
            """)
            return cursor.fetchall()
```

## Database Connection Pooling

```python
# connection_pool.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
import redis
from contextlib import contextmanager

class DatabasePool:
    def __init__(self, database_url, pool_size=10, max_overflow=20):
        self.engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=3600,   # Recycle connections every hour
        )
    
    @contextmanager
    def get_connection(self):
        """Get database connection from pool."""
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()

# Redis connection pool
class RedisPool:
    def __init__(self, host='localhost', port=6379, db=0, max_connections=10):
        self.pool = redis.ConnectionPool(
            host=host,
            port=port,
            db=db,
            max_connections=max_connections,
            decode_responses=True
        )
    
    def get_client(self):
        """Get Redis client from pool."""
        return redis.Redis(connection_pool=self.pool)

# Usage
db_pool = DatabasePool('postgresql://user:pass@localhost/db')
redis_pool = RedisPool()

def get_user_with_cache(user_id):
    """Get user with Redis caching."""
    redis_client = redis_pool.get_client()
    
    # Try cache first
    cached_user = redis_client.get(f'user:{user_id}')
    if cached_user:
        return json.loads(cached_user)
    
    # Query database
    with db_pool.get_connection() as conn:
        result = conn.execute(
            text("SELECT * FROM users WHERE id = :user_id"),
            user_id=user_id
        ).fetchone()
        
        if result:
            user_data = dict(result)
            # Cache for 1 hour
            redis_client.setex(
                f'user:{user_id}', 
                3600, 
                json.dumps(user_data, default=str)
            )
            return user_data
    
    return None
```

## Best Practices

### Database Design
1. **Normalize your data** - Eliminate redundancy
2. **Use appropriate data types** - Choose efficient column types
3. **Create proper indexes** - Index frequently queried columns
4. **Use foreign key constraints** - Maintain referential integrity
5. **Plan for scalability** - Consider partitioning and sharding

### Query Optimization
1. **Use select_related and prefetch_related** - Reduce database queries
2. **Avoid N+1 queries** - Load related data efficiently
3. **Use database functions** - Leverage database capabilities
4. **Implement pagination** - Don't load all data at once
5. **Monitor query performance** - Use EXPLAIN to analyze queries

### Security
1. **Use parameterized queries** - Prevent SQL injection
2. **Validate input data** - Check data before database operations
3. **Implement proper permissions** - Control database access
4. **Use connection pooling** - Manage database connections efficiently
5. **Regular backups** - Implement backup and recovery strategies

Database integration is fundamental to backend development. Understanding both ORM and raw SQL approaches gives you flexibility to choose the right tool for each situation.
