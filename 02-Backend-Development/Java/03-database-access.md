# Database Access in Java

Java provides multiple approaches for database access, from low-level JDBC to high-level ORM frameworks like JPA/Hibernate. This guide covers database integration patterns, transaction management, and best practices.

## JDBC Fundamentals

### Basic JDBC Operations

```java
// Database connection and basic operations
public class JdbcUserDao {
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/mydb";
    private static final String USER = "username";
    private static final String PASS = "password";
    
    // Connection management
    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, USER, PASS);
    }
    
    // Create operation
    public void createUser(User user) throws SQLException {
        String sql = "INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setTimestamp(3, Timestamp.valueOf(user.getCreatedAt()));
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    user.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Creating user failed, no ID obtained.");
                }
            }
        }
    }
    
    // Read operations
    public Optional<User> findById(Long id) throws SQLException {
        String sql = "SELECT id, username, email, created_at FROM users WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUser(rs));
                }
            }
        }
        return Optional.empty();
    }
    
    public List<User> findAll() throws SQLException {
        String sql = "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC";
        List<User> users = new ArrayList<>();
        
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        }
        return users;
    }
    
    // Update operation
    public void updateUser(User user) throws SQLException {
        String sql = "UPDATE users SET username = ?, email = ? WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setLong(3, user.getId());
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating user failed, user not found.");
            }
        }
    }
    
    // Delete operation
    public void deleteUser(Long id) throws SQLException {
        String sql = "DELETE FROM users WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Deleting user failed, user not found.");
            }
        }
    }
    
    // Batch operations
    public void createUsers(List<User> users) throws SQLException {
        String sql = "INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            conn.setAutoCommit(false);
            
            for (User user : users) {
                stmt.setString(1, user.getUsername());
                stmt.setString(2, user.getEmail());
                stmt.setTimestamp(3, Timestamp.valueOf(user.getCreatedAt()));
                stmt.addBatch();
            }
            
            stmt.executeBatch();
            conn.commit();
        }
    }
    
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return user;
    }
}
```

### Connection Pooling

```java
// HikariCP connection pool configuration
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
        config.setUsername("username");
        config.setPassword("password");
        config.setDriverClassName("org.postgresql.Driver");
        
        // Pool settings
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setLeakDetectionThreshold(60000);
        
        // Performance settings
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        
        return new HikariDataSource(config);
    }
}
```

## JPA and Hibernate

### Entity Mapping

```java
// Basic entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
    
    // One-to-many relationship
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> posts = new ArrayList<>();
    
    // Many-to-many relationship
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors, getters, setters...
}

// Complex entity with inheritance
@Entity
@Table(name = "posts")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "post_type")
public abstract class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Lob
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();
    
    // Constructors, getters, setters...
}

@Entity
@DiscriminatorValue("BLOG")
public class BlogPost extends Post {
    @Column(name = "publish_date")
    private LocalDateTime publishDate;
    
    private String tags;
    
    // Blog-specific methods...
}

@Entity
@DiscriminatorValue("NEWS")
public class NewsPost extends Post {
    @Column(name = "breaking_news")
    private Boolean breakingNews;
    
    @Column(name = "source")
    private String source;
    
    // News-specific methods...
}
```

### Repository Pattern with Spring Data JPA

```java
// Basic repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Query methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByStatus(UserStatus status);
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Custom queries with JPQL
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    // Native SQL queries
    @Query(value = "SELECT * FROM users WHERE created_at > :date ORDER BY created_at DESC", 
           nativeQuery = true)
    List<User> findRecentUsers(@Param("date") LocalDateTime date);
    
    // Modifying queries
    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    int updateUserStatus(@Param("id") Long id, @Param("status") UserStatus status);
    
    @Modifying
    @Query("DELETE FROM User u WHERE u.status = :status AND u.createdAt < :date")
    int deleteInactiveUsers(@Param("status") UserStatus status, @Param("date") LocalDateTime date);
    
    // Pagination and sorting
    Page<User> findByUsernameContaining(String username, Pageable pageable);
    
    // Projections
    @Query("SELECT new com.example.dto.UserSummary(u.id, u.username, u.email, u.createdAt) FROM User u")
    List<UserSummary> findUserSummaries();
    
    // Specifications for dynamic queries
    default List<User> findWithSpecification(Specification<User> spec) {
        return findAll(spec);
    }
}

// Custom repository implementation
public interface UserRepositoryCustom {
    List<User> findUsersWithComplexCriteria(UserSearchCriteria criteria);
    Page<User> findUsersWithDynamicQuery(Map<String, Object> filters, Pageable pageable);
}

@Repository
public class UserRepositoryCustomImpl implements UserRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public List<User> findUsersWithComplexCriteria(UserSearchCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> user = query.from(User.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        if (criteria.getUsername() != null) {
            predicates.add(cb.like(cb.lower(user.get("username")), 
                                 "%" + criteria.getUsername().toLowerCase() + "%"));
        }
        
        if (criteria.getEmail() != null) {
            predicates.add(cb.like(cb.lower(user.get("email")), 
                                 "%" + criteria.getEmail().toLowerCase() + "%"));
        }
        
        if (criteria.getStatus() != null) {
            predicates.add(cb.equal(user.get("status"), criteria.getStatus()));
        }
        
        if (criteria.getCreatedAfter() != null) {
            predicates.add(cb.greaterThan(user.get("createdAt"), criteria.getCreatedAfter()));
        }
        
        if (criteria.getCreatedBefore() != null) {
            predicates.add(cb.lessThan(user.get("createdAt"), criteria.getCreatedBefore()));
        }
        
        query.where(predicates.toArray(new Predicate[0]));
        query.orderBy(cb.desc(user.get("createdAt")));
        
        return entityManager.createQuery(query).getResultList();
    }
    
    @Override
    public Page<User> findUsersWithDynamicQuery(Map<String, Object> filters, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> user = query.from(User.class);
        
        List<Predicate> predicates = buildPredicatesFromFilters(cb, user, filters);
        
        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }
        
        // Apply sorting
        if (pageable.getSort().isSorted()) {
            List<Order> orders = new ArrayList<>();
            for (Sort.Order sortOrder : pageable.getSort()) {
                if (sortOrder.isAscending()) {
                    orders.add(cb.asc(user.get(sortOrder.getProperty())));
                } else {
                    orders.add(cb.desc(user.get(sortOrder.getProperty())));
                }
            }
            query.orderBy(orders);
        }
        
        TypedQuery<User> typedQuery = entityManager.createQuery(query);
        
        // Apply pagination
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        
        List<User> users = typedQuery.getResultList();
        
        // Count query for total elements
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<User> countRoot = countQuery.from(User.class);
        countQuery.select(cb.count(countRoot));
        
        if (!predicates.isEmpty()) {
            countQuery.where(buildPredicatesFromFilters(cb, countRoot, filters).toArray(new Predicate[0]));
        }
        
        Long total = entityManager.createQuery(countQuery).getSingleResult();
        
        return new PageImpl<>(users, pageable, total);
    }
    
    private List<Predicate> buildPredicatesFromFilters(CriteriaBuilder cb, Root<User> user, 
                                                      Map<String, Object> filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        filters.forEach((key, value) -> {
            if (value != null) {
                switch (key) {
                    case "username":
                        predicates.add(cb.like(cb.lower(user.get("username")), 
                                             "%" + value.toString().toLowerCase() + "%"));
                        break;
                    case "email":
                        predicates.add(cb.like(cb.lower(user.get("email")), 
                                             "%" + value.toString().toLowerCase() + "%"));
                        break;
                    case "status":
                        predicates.add(cb.equal(user.get("status"), value));
                        break;
                    // Add more filter cases as needed
                }
            }
        });
        
        return predicates;
    }
}
```

## Transaction Management

### Declarative Transactions

```java
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuditService auditService;
    
    public UserService(UserRepository userRepository, 
                      EmailService emailService, 
                      AuditService auditService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.auditService = auditService;
    }
    
    // Read-only transaction
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Default transaction (read-write)
    public User createUser(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        
        // This will be part of the same transaction
        auditService.logUserCreation(savedUser);
        
        // If this fails, the entire transaction will be rolled back
        emailService.sendWelcomeEmail(savedUser);
        
        return savedUser;
    }
    
    // Transaction with specific propagation
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        user.setStatus(status);
        userRepository.save(user);
        
        // This runs in a new transaction regardless of caller's transaction
        auditService.logStatusChange(user, status);
    }
    
    // Transaction with rollback rules
    @Transactional(rollbackFor = {Exception.class}, 
                   noRollbackFor = {EmailSendException.class})
    public User createUserWithEmailNotification(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        User savedUser = userRepository.save(user);
        
        try {
            emailService.sendWelcomeEmail(savedUser);
        } catch (EmailSendException e) {
            // This exception won't cause rollback
            log.warn("Failed to send welcome email to user: {}", savedUser.getEmail(), e);
        }
        
        return savedUser;
    }
    
    // Programmatic transaction management
    public void performComplexOperation() {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        
        transactionTemplate.execute(status -> {
            try {
                // Perform operations
                User user = userRepository.findById(1L).orElseThrow();
                user.setUsername("updated");
                userRepository.save(user);
                
                // Manually rollback if needed
                if (someCondition) {
                    status.setRollbackOnly();
                }
                
                return user;
            } catch (Exception e) {
                status.setRollbackOnly();
                throw e;
            }
        });
    }
}

// Transaction configuration
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
    
    @Bean
    public TransactionTemplate transactionTemplate(PlatformTransactionManager transactionManager) {
        return new TransactionTemplate(transactionManager);
    }
}
```

## Database Migration with Flyway

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- V2__Create_posts_table.sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id BIGINT NOT NULL,
    post_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_created ON posts(created_at);

-- V3__Add_user_roles.sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Administrator role'),
('USER', 'Regular user role'),
('MODERATOR', 'Moderator role');
```

```yaml
# application.yml - Flyway configuration
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
    clean-disabled: true
    schemas: public
```

## Best Practices

### Database Design
1. **Use appropriate data types** - Choose efficient column types
2. **Create proper indexes** - Index frequently queried columns
3. **Normalize data** - Eliminate redundancy
4. **Use foreign key constraints** - Maintain referential integrity
5. **Plan for scalability** - Consider partitioning and sharding

### JPA/Hibernate Optimization
1. **Use lazy loading** - Load data only when needed
2. **Implement proper caching** - First and second-level caching
3. **Optimize queries** - Use projections and pagination
4. **Avoid N+1 queries** - Use fetch joins or batch fetching
5. **Monitor SQL generation** - Enable SQL logging in development

### Transaction Management
1. **Keep transactions short** - Minimize lock duration
2. **Use read-only transactions** - For query-only operations
3. **Handle exceptions properly** - Understand rollback behavior
4. **Choose appropriate isolation levels** - Balance consistency and performance
5. **Monitor transaction performance** - Track long-running transactions

Database access is a critical component of backend applications. Understanding both low-level JDBC and high-level ORM approaches provides flexibility to choose the right tool for each situation.
