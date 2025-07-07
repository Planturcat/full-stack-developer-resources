# Testing and Debugging

Testing and debugging are essential skills for backend development. This guide covers unit testing, integration testing, debugging techniques, and best practices for maintaining high-quality Python code.

## Unit Testing with pytest

### Basic Test Setup

```python
# conftest.py
import pytest
import tempfile
import os
from app import create_app, db
from app.models import User, Post, Category

@pytest.fixture
def app():
    """Create application for testing."""
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'SECRET_KEY': 'test-secret-key'
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()

@pytest.fixture
def sample_user(app):
    """Create a sample user for testing."""
    user = User(
        username='testuser',
        email='test@example.com',
        full_name='Test User'
    )
    user.set_password('testpassword')
    
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def sample_category(app):
    """Create a sample category for testing."""
    category = Category(name='Technology', description='Tech posts')
    db.session.add(category)
    db.session.commit()
    return category

@pytest.fixture
def auth_headers(client, sample_user):
    """Get authentication headers for API requests."""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}
```

### Model Testing

```python
# tests/test_models.py
import pytest
from datetime import datetime
from app.models import User, Post, Category

class TestUser:
    def test_user_creation(self, app):
        """Test user model creation."""
        user = User(
            username='newuser',
            email='newuser@example.com',
            full_name='New User'
        )
        user.set_password('password123')
        
        assert user.username == 'newuser'
        assert user.email == 'newuser@example.com'
        assert user.check_password('password123')
        assert not user.check_password('wrongpassword')
    
    def test_user_password_hashing(self, app):
        """Test password hashing functionality."""
        user = User(username='testuser', email='test@example.com')
        user.set_password('secret')
        
        assert user.password_hash != 'secret'
        assert user.check_password('secret')
        assert not user.check_password('wrong')
    
    def test_user_repr(self, sample_user):
        """Test user string representation."""
        assert repr(sample_user) == '<User testuser>'
    
    def test_user_to_dict(self, sample_user):
        """Test user serialization."""
        user_dict = sample_user.to_dict()
        
        assert user_dict['username'] == 'testuser'
        assert user_dict['email'] == 'test@example.com'
        assert 'password_hash' not in user_dict
        assert 'created_at' in user_dict

class TestPost:
    def test_post_creation(self, app, sample_user, sample_category):
        """Test post model creation."""
        post = Post(
            title='Test Post',
            content='This is a test post content.',
            author=sample_user,
            category=sample_category
        )
        
        db.session.add(post)
        db.session.commit()
        
        assert post.title == 'Test Post'
        assert post.author == sample_user
        assert post.category == sample_category
        assert post.slug == 'test-post'
    
    def test_post_slug_generation(self, app, sample_user):
        """Test automatic slug generation."""
        post = Post(
            title='This is a Long Title with Special Characters!',
            content='Content',
            author=sample_user
        )
        
        db.session.add(post)
        db.session.commit()
        
        assert post.slug == 'this-is-a-long-title-with-special-characters'
    
    def test_post_published_property(self, app, sample_user):
        """Test published property."""
        post = Post(
            title='Test Post',
            content='Content',
            author=sample_user,
            status='published'
        )
        
        assert post.is_published
        
        post.status = 'draft'
        assert not post.is_published

class TestCategory:
    def test_category_creation(self, app):
        """Test category model creation."""
        category = Category(
            name='Science',
            description='Science related posts'
        )
        
        db.session.add(category)
        db.session.commit()
        
        assert category.name == 'Science'
        assert category.slug == 'science'
    
    def test_category_post_relationship(self, app, sample_user, sample_category):
        """Test category-post relationship."""
        post1 = Post(title='Post 1', content='Content 1', author=sample_user, category=sample_category)
        post2 = Post(title='Post 2', content='Content 2', author=sample_user, category=sample_category)
        
        db.session.add_all([post1, post2])
        db.session.commit()
        
        assert len(sample_category.posts) == 2
        assert post1 in sample_category.posts
        assert post2 in sample_category.posts
```

### API Testing

```python
# tests/test_api.py
import pytest
import json
from app.models import User, Post, Category

class TestAuthAPI:
    def test_user_registration(self, client):
        """Test user registration endpoint."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['user']['username'] == 'newuser'
        assert data['user']['email'] == 'newuser@example.com'
        assert 'password' not in data['user']
    
    def test_user_registration_duplicate_username(self, client, sample_user):
        """Test registration with duplicate username."""
        response = client.post('/api/auth/register', json={
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'Username already exists' in data['error']
    
    def test_user_login_success(self, client, sample_user):
        """Test successful user login."""
        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'testpassword'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'token' in data
        assert data['user']['username'] == 'testuser'
    
    def test_user_login_invalid_credentials(self, client, sample_user):
        """Test login with invalid credentials."""
        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'Invalid credentials' in data['error']

class TestPostAPI:
    def test_get_posts(self, client, sample_user, sample_category):
        """Test getting posts."""
        # Create test posts
        post1 = Post(title='Post 1', content='Content 1', author=sample_user, status='published')
        post2 = Post(title='Post 2', content='Content 2', author=sample_user, status='published')
        
        db.session.add_all([post1, post2])
        db.session.commit()
        
        response = client.get('/api/posts')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['posts']) == 2
    
    def test_get_post_by_id(self, client, sample_user):
        """Test getting a specific post."""
        post = Post(title='Test Post', content='Test Content', author=sample_user, status='published')
        db.session.add(post)
        db.session.commit()
        
        response = client.get(f'/api/posts/{post.id}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Test Post'
    
    def test_create_post_authenticated(self, client, auth_headers):
        """Test creating a post with authentication."""
        response = client.post('/api/posts', 
            json={
                'title': 'New Post',
                'content': 'New post content'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == 'New Post'
    
    def test_create_post_unauthenticated(self, client):
        """Test creating a post without authentication."""
        response = client.post('/api/posts', json={
            'title': 'New Post',
            'content': 'New post content'
        })
        
        assert response.status_code == 401
    
    def test_update_post(self, client, auth_headers, sample_user):
        """Test updating a post."""
        post = Post(title='Original Title', content='Original Content', author=sample_user)
        db.session.add(post)
        db.session.commit()
        
        response = client.put(f'/api/posts/{post.id}',
            json={'title': 'Updated Title'},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Updated Title'
    
    def test_delete_post(self, client, auth_headers, sample_user):
        """Test deleting a post."""
        post = Post(title='To Delete', content='Content', author=sample_user)
        db.session.add(post)
        db.session.commit()
        post_id = post.id
        
        response = client.delete(f'/api/posts/{post_id}', headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify post is deleted
        deleted_post = Post.query.get(post_id)
        assert deleted_post is None

class TestAPIValidation:
    def test_missing_required_fields(self, client, auth_headers):
        """Test API validation for missing required fields."""
        response = client.post('/api/posts',
            json={'title': 'Only Title'},  # Missing content
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'content' in data['error'].lower()
    
    def test_invalid_json(self, client, auth_headers):
        """Test API response to invalid JSON."""
        response = client.post('/api/posts',
            data='invalid json',
            headers=auth_headers,
            content_type='application/json'
        )
        
        assert response.status_code == 400
```

### Parameterized Testing

```python
# tests/test_validation.py
import pytest
from app.utils.validation import validate_email, validate_password, validate_username

class TestValidation:
    @pytest.mark.parametrize("email,expected", [
        ("test@example.com", True),
        ("user.name@domain.co.uk", True),
        ("invalid-email", False),
        ("@domain.com", False),
        ("user@", False),
        ("", False),
    ])
    def test_email_validation(self, email, expected):
        """Test email validation with various inputs."""
        assert validate_email(email) == expected
    
    @pytest.mark.parametrize("password,expected", [
        ("password123", True),
        ("short", False),
        ("", False),
        ("a" * 100, True),
        ("12345678", True),
    ])
    def test_password_validation(self, password, expected):
        """Test password validation with various inputs."""
        assert validate_password(password) == expected
    
    @pytest.mark.parametrize("username,expected", [
        ("validuser", True),
        ("user123", True),
        ("user_name", True),
        ("ab", False),  # Too short
        ("a" * 51, False),  # Too long
        ("user@name", False),  # Invalid character
        ("", False),
    ])
    def test_username_validation(self, username, expected):
        """Test username validation with various inputs."""
        assert validate_username(username) == expected
```

## Integration Testing

```python
# tests/test_integration.py
import pytest
from app import create_app, db
from app.models import User, Post, Category

class TestUserWorkflow:
    """Test complete user workflows."""
    
    def test_user_registration_and_login_workflow(self, client):
        """Test complete user registration and login workflow."""
        # Register user
        register_response = client.post('/api/auth/register', json={
            'username': 'workflowuser',
            'email': 'workflow@example.com',
            'password': 'password123'
        })
        
        assert register_response.status_code == 201
        
        # Login with registered user
        login_response = client.post('/api/auth/login', json={
            'username': 'workflowuser',
            'password': 'password123'
        })
        
        assert login_response.status_code == 200
        token = login_response.get_json()['token']
        
        # Use token to access protected endpoint
        headers = {'Authorization': f'Bearer {token}'}
        profile_response = client.get('/api/auth/profile', headers=headers)
        
        assert profile_response.status_code == 200
        profile_data = profile_response.get_json()
        assert profile_data['username'] == 'workflowuser'
    
    def test_post_creation_workflow(self, client, auth_headers, sample_category):
        """Test complete post creation workflow."""
        # Create post
        create_response = client.post('/api/posts', json={
            'title': 'Integration Test Post',
            'content': 'This is an integration test post.',
            'category_id': sample_category.id
        }, headers=auth_headers)
        
        assert create_response.status_code == 201
        post_data = create_response.get_json()
        post_id = post_data['id']
        
        # Retrieve created post
        get_response = client.get(f'/api/posts/{post_id}')
        assert get_response.status_code == 200
        
        # Update post
        update_response = client.put(f'/api/posts/{post_id}', json={
            'title': 'Updated Integration Test Post'
        }, headers=auth_headers)
        
        assert update_response.status_code == 200
        updated_data = update_response.get_json()
        assert updated_data['title'] == 'Updated Integration Test Post'
        
        # Delete post
        delete_response = client.delete(f'/api/posts/{post_id}', headers=auth_headers)
        assert delete_response.status_code == 204
        
        # Verify deletion
        get_deleted_response = client.get(f'/api/posts/{post_id}')
        assert get_deleted_response.status_code == 404

class TestDatabaseIntegration:
    """Test database operations and constraints."""
    
    def test_foreign_key_constraints(self, app, sample_user):
        """Test foreign key constraint enforcement."""
        # Create post with valid user
        post = Post(title='Test Post', content='Content', author=sample_user)
        db.session.add(post)
        db.session.commit()
        
        # Try to delete user with existing posts (should handle gracefully)
        with pytest.raises(Exception):
            db.session.delete(sample_user)
            db.session.commit()
    
    def test_unique_constraints(self, app):
        """Test unique constraint enforcement."""
        # Create first user
        user1 = User(username='uniqueuser', email='unique@example.com')
        db.session.add(user1)
        db.session.commit()
        
        # Try to create second user with same username
        user2 = User(username='uniqueuser', email='different@example.com')
        db.session.add(user2)
        
        with pytest.raises(Exception):
            db.session.commit()
```

## Debugging Techniques

### Logging and Debug Information

```python
# app/utils/logging.py
import logging
import sys
from logging.handlers import RotatingFileHandler
from flask import request, g
import time

def setup_logging(app):
    """Set up application logging."""
    if not app.debug and not app.testing:
        # File logging for production
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            'logs/app.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')
    
    # Console logging for development
    if app.debug:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(console_handler)
        app.logger.setLevel(logging.DEBUG)

def log_request_info():
    """Log request information for debugging."""
    app.logger.info(f'Request: {request.method} {request.url}')
    app.logger.info(f'Headers: {dict(request.headers)}')
    if request.is_json:
        app.logger.info(f'JSON: {request.get_json()}')

@app.before_request
def before_request():
    """Log request start time."""
    g.start_time = time.time()
    if app.debug:
        log_request_info()

@app.after_request
def after_request(response):
    """Log request completion time."""
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        app.logger.info(f'Request completed in {duration:.3f}s - Status: {response.status_code}')
    return response
```

### Custom Debug Decorators

```python
# app/utils/debug.py
import functools
import time
import logging
from flask import current_app

def debug_timer(func):
    """Decorator to time function execution."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        if current_app.debug:
            current_app.logger.debug(
                f'{func.__name__} executed in {end_time - start_time:.4f} seconds'
            )
        
        return result
    return wrapper

def debug_args(func):
    """Decorator to log function arguments."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if current_app.debug:
            current_app.logger.debug(
                f'{func.__name__} called with args: {args}, kwargs: {kwargs}'
            )
        
        return func(*args, **kwargs)
    return wrapper

def debug_sql_queries(func):
    """Decorator to log SQL queries."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if current_app.debug:
            from flask_sqlalchemy import get_debug_queries
            
            result = func(*args, **kwargs)
            
            queries = get_debug_queries()
            for query in queries:
                current_app.logger.debug(
                    f'SQL Query: {query.statement}\n'
                    f'Parameters: {query.parameters}\n'
                    f'Duration: {query.duration:.4f}s'
                )
            
            return result
        
        return func(*args, **kwargs)
    return wrapper

# Usage examples
@debug_timer
@debug_args
def create_user(username, email, password):
    """Create a new user with debugging."""
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user

@debug_sql_queries
def get_user_posts(user_id):
    """Get user posts with SQL query debugging."""
    return Post.query.filter_by(author_id=user_id).all()
```

### Error Handling and Monitoring

```python
# app/utils/error_handling.py
from flask import jsonify, current_app
import traceback
import sys

class APIError(Exception):
    """Custom API error class."""
    
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.message
        return rv

@app.errorhandler(APIError)
def handle_api_error(error):
    """Handle custom API errors."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    """Handle unexpected errors."""
    # Log the full traceback
    current_app.logger.error(
        f'Unexpected error: {str(error)}\n'
        f'Traceback: {traceback.format_exc()}'
    )
    
    if current_app.debug:
        # Return detailed error in debug mode
        return jsonify({
            'error': str(error),
            'traceback': traceback.format_exc().split('\n')
        }), 500
    else:
        # Return generic error in production
        return jsonify({'error': 'Internal server error'}), 500

def log_exception(exc_type, exc_value, exc_traceback):
    """Custom exception handler for logging."""
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    
    current_app.logger.error(
        "Uncaught exception",
        exc_info=(exc_type, exc_value, exc_traceback)
    )

# Set custom exception handler
sys.excepthook = log_exception
```

## Performance Testing

```python
# tests/test_performance.py
import pytest
import time
from concurrent.futures import ThreadPoolExecutor
import requests

class TestPerformance:
    def test_api_response_time(self, client):
        """Test API response time."""
        start_time = time.time()
        response = client.get('/api/posts')
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond within 1 second
    
    def test_database_query_performance(self, app, sample_user):
        """Test database query performance."""
        # Create many posts for testing
        posts = []
        for i in range(100):
            post = Post(
                title=f'Post {i}',
                content=f'Content for post {i}',
                author=sample_user
            )
            posts.append(post)
        
        db.session.add_all(posts)
        db.session.commit()
        
        # Test query performance
        start_time = time.time()
        result = Post.query.filter_by(author=sample_user).all()
        end_time = time.time()
        
        assert len(result) == 100
        assert (end_time - start_time) < 0.1  # Should complete within 100ms
    
    @pytest.mark.slow
    def test_concurrent_requests(self, client):
        """Test handling concurrent requests."""
        def make_request():
            return client.get('/api/posts')
        
        # Make 10 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in futures]
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
```

## Best Practices

### Testing Best Practices
1. **Write tests first** - Test-driven development (TDD)
2. **Test one thing at a time** - Single responsibility per test
3. **Use descriptive test names** - Clearly describe what is being tested
4. **Arrange, Act, Assert** - Structure tests clearly
5. **Use fixtures for setup** - Reusable test data and configuration
6. **Mock external dependencies** - Isolate units under test
7. **Test edge cases** - Include boundary conditions and error cases

### Debugging Best Practices
1. **Use proper logging** - Log at appropriate levels
2. **Add debug information** - Include context in error messages
3. **Use debugger effectively** - Step through code systematically
4. **Reproduce issues consistently** - Create minimal test cases
5. **Monitor performance** - Track response times and resource usage
6. **Handle errors gracefully** - Provide meaningful error messages
7. **Use profiling tools** - Identify performance bottlenecks

Testing and debugging are continuous processes that improve code quality and reliability. Implementing comprehensive testing strategies and effective debugging techniques is essential for maintaining robust backend applications.
