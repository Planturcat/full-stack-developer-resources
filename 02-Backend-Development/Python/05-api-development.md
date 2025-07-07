# API Development

API development is a core aspect of modern backend systems. This guide covers building RESTful APIs, GraphQL APIs, authentication, validation, documentation, and best practices using Python frameworks.

## RESTful API Development

### Flask REST API with Authentication

```python
# app.py
from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///api.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat()
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    products = db.relationship('Product', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user or not current_user.is_active:
                return jsonify({'error': 'Invalid token'}), 401
                
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Validation helpers
def validate_json(required_fields):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            return f(*args, **kwargs)
        return decorated
    return decorator

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
@validate_json(['username', 'email', 'password'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201

@app.route('/api/auth/login', methods=['POST'])
@validate_json(['username', 'password'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

# Product CRUD operations
@app.route('/api/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    products = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'pagination': {
            'page': products.page,
            'pages': products.pages,
            'per_page': products.per_page,
            'total': products.total,
            'has_next': products.has_next,
            'has_prev': products.has_prev
        }
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@app.route('/api/products', methods=['POST'])
@token_required
@validate_json(['name', 'price'])
def create_product():
    data = request.get_json()
    
    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        category_id=data.get('category_id')
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify(product.to_dict()), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@token_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'category_id' in data:
        product.category_id = data['category_id']
    
    db.session.commit()
    return jsonify(product.to_dict())

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    
    return '', 204

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

### FastAPI Advanced Features

```python
# main.py
from fastapi import FastAPI, HTTPException, Depends, status, Query, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from datetime import datetime, timedelta

app = FastAPI(
    title="Advanced API",
    description="A comprehensive API with authentication and validation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: Optional[int] = None
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be positive')
        return v

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class PaginatedResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    per_page: int
    pages: int

# Authentication
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Advanced API endpoints with validation
@app.get("/products", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    search: Optional[str] = Query(None, min_length=3, description="Search term"),
    db: Session = Depends(get_db)
):
    """Get products with advanced filtering and pagination."""
    query = db.query(Product)
    
    # Apply filters
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int = Path(..., gt=0, description="Product ID"),
    db: Session = Depends(get_db)
):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.patch("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int = Path(..., gt=0),
    product_update: ProductUpdate = ...,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a product (partial update)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

# Background tasks
from fastapi import BackgroundTasks

def send_email_notification(email: str, message: str):
    """Simulate sending email notification."""
    print(f"Sending email to {email}: {message}")

@app.post("/products/{product_id}/notify")
async def notify_product_update(
    product_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send notification about product update."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    background_tasks.add_task(
        send_email_notification,
        current_user.email,
        f"Product {product.name} has been updated"
    )
    
    return {"message": "Notification will be sent"}
```

## GraphQL API Development

```python
# graphql_api.py
import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from graphene import relay
from database import User, Product, Category

# GraphQL Types
class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        interfaces = (relay.Node,)

class ProductType(SQLAlchemyObjectType):
    class Meta:
        model = Product
        interfaces = (relay.Node,)

class CategoryType(SQLAlchemyObjectType):
    class Meta:
        model = Category
        interfaces = (relay.Node,)

# Mutations
class CreateProduct(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        price = graphene.Float(required=True)
        category_id = graphene.Int()
    
    product = graphene.Field(ProductType)
    
    def mutate(self, info, name, price, description=None, category_id=None):
        db = info.context['db']
        
        product = Product(
            name=name,
            description=description,
            price=price,
            category_id=category_id
        )
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        return CreateProduct(product=product)

class UpdateProduct(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        description = graphene.String()
        price = graphene.Float()
        category_id = graphene.Int()
    
    product = graphene.Field(ProductType)
    
    def mutate(self, info, id, **kwargs):
        db = info.context['db']
        product = db.query(Product).filter(Product.id == id).first()
        
        if not product:
            raise Exception("Product not found")
        
        for key, value in kwargs.items():
            if value is not None:
                setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        
        return UpdateProduct(product=product)

# Query
class Query(graphene.ObjectType):
    node = relay.Node.Field()
    
    # Single object queries
    user = graphene.Field(UserType, id=graphene.Int())
    product = graphene.Field(ProductType, id=graphene.Int())
    category = graphene.Field(CategoryType, id=graphene.Int())
    
    # List queries
    all_users = SQLAlchemyConnectionField(UserType.connection)
    all_products = SQLAlchemyConnectionField(ProductType.connection)
    all_categories = SQLAlchemyConnectionField(CategoryType.connection)
    
    # Custom queries
    products_by_category = graphene.List(ProductType, category_id=graphene.Int())
    search_products = graphene.List(ProductType, search_term=graphene.String())
    
    def resolve_user(self, info, id):
        return info.context['db'].query(User).filter(User.id == id).first()
    
    def resolve_product(self, info, id):
        return info.context['db'].query(Product).filter(Product.id == id).first()
    
    def resolve_category(self, info, id):
        return info.context['db'].query(Category).filter(Category.id == id).first()
    
    def resolve_products_by_category(self, info, category_id):
        return info.context['db'].query(Product).filter(Product.category_id == category_id).all()
    
    def resolve_search_products(self, info, search_term):
        return info.context['db'].query(Product).filter(
            Product.name.ilike(f'%{search_term}%')
        ).all()

# Mutation
class Mutation(graphene.ObjectType):
    create_product = CreateProduct.Field()
    update_product = UpdateProduct.Field()

# Schema
schema = graphene.Schema(query=Query, mutation=Mutation)

# Flask-GraphQL integration
from flask import Flask
from flask_graphql import GraphQLView

app = Flask(__name__)

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,  # Enable GraphiQL interface
        context={'db': db.session}
    )
)
```

## API Documentation

```python
# documentation.py
from flask import Flask
from flask_restx import Api, Resource, fields
from flask_restx import reqparse

app = Flask(__name__)
api = Api(
    app,
    version='1.0',
    title='Product API',
    description='A comprehensive product management API',
    doc='/docs/'
)

# Namespaces
ns_auth = api.namespace('auth', description='Authentication operations')
ns_products = api.namespace('products', description='Product operations')

# Models for documentation
user_model = api.model('User', {
    'id': fields.Integer(readonly=True, description='User ID'),
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'created_at': fields.DateTime(readonly=True, description='Creation timestamp')
})

product_model = api.model('Product', {
    'id': fields.Integer(readonly=True, description='Product ID'),
    'name': fields.String(required=True, description='Product name'),
    'description': fields.String(description='Product description'),
    'price': fields.Float(required=True, description='Product price'),
    'category_id': fields.Integer(description='Category ID'),
    'created_at': fields.DateTime(readonly=True, description='Creation timestamp')
})

# Request parsers
product_parser = reqparse.RequestParser()
product_parser.add_argument('name', type=str, required=True, help='Product name')
product_parser.add_argument('description', type=str, help='Product description')
product_parser.add_argument('price', type=float, required=True, help='Product price')
product_parser.add_argument('category_id', type=int, help='Category ID')

@ns_products.route('/')
class ProductList(Resource):
    @ns_products.doc('list_products')
    @ns_products.marshal_list_with(product_model)
    def get(self):
        """Get all products"""
        return products
    
    @ns_products.doc('create_product')
    @ns_products.expect(product_parser)
    @ns_products.marshal_with(product_model, code=201)
    def post(self):
        """Create a new product"""
        args = product_parser.parse_args()
        # Create product logic here
        return product, 201

@ns_products.route('/<int:id>')
@ns_products.response(404, 'Product not found')
@ns_products.param('id', 'Product identifier')
class Product(Resource):
    @ns_products.doc('get_product')
    @ns_products.marshal_with(product_model)
    def get(self, id):
        """Get a product by ID"""
        # Get product logic here
        return product
    
    @ns_products.doc('update_product')
    @ns_products.expect(product_parser)
    @ns_products.marshal_with(product_model)
    def put(self, id):
        """Update a product"""
        args = product_parser.parse_args()
        # Update product logic here
        return product
    
    @ns_products.doc('delete_product')
    @ns_products.response(204, 'Product deleted')
    def delete(self, id):
        """Delete a product"""
        # Delete product logic here
        return '', 204
```

## API Testing

```python
# test_api.py
import pytest
import json
from app import app, db, User, Product

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def auth_headers(client):
    # Create test user
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpassword')
    db.session.add(user)
    db.session.commit()
    
    # Login and get token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

def test_user_registration(client):
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'newpassword'
    })
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['user']['username'] == 'newuser'

def test_user_login(client):
    # Create user first
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpassword')
    db.session.add(user)
    db.session.commit()
    
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data

def test_create_product(client, auth_headers):
    response = client.post('/api/products', 
        json={
            'name': 'Test Product',
            'description': 'A test product',
            'price': 99.99
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Product'

def test_get_products(client):
    # Create test products
    product1 = Product(name='Product 1', price=10.0)
    product2 = Product(name='Product 2', price=20.0)
    db.session.add_all([product1, product2])
    db.session.commit()
    
    response = client.get('/api/products')
    
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['products']) == 2

def test_unauthorized_access(client):
    response = client.post('/api/products', json={
        'name': 'Test Product',
        'price': 99.99
    })
    
    assert response.status_code == 401
```

## Best Practices

### API Design
1. **Use RESTful conventions** - Standard HTTP methods and status codes
2. **Version your APIs** - Include version in URL or headers
3. **Implement proper pagination** - Don't return all data at once
4. **Use consistent naming** - Follow naming conventions
5. **Provide comprehensive documentation** - Auto-generated docs preferred

### Security
1. **Implement authentication** - JWT, OAuth, or session-based
2. **Use HTTPS** - Encrypt data in transit
3. **Validate all inputs** - Sanitize and validate request data
4. **Implement rate limiting** - Prevent API abuse
5. **Use CORS properly** - Configure cross-origin requests

### Performance
1. **Implement caching** - Cache frequently accessed data
2. **Use database indexes** - Optimize database queries
3. **Implement compression** - Reduce response sizes
4. **Monitor performance** - Track API metrics
5. **Use async operations** - For I/O intensive operations

API development requires careful consideration of design, security, performance, and maintainability. Following these patterns and best practices will help you build robust, scalable APIs.
