# Epic Examples for Software Projects

This document provides examples of well-structured epics for software development projects, demonstrating how to break down large features into manageable stories.

## Epic Structure Template

```
Epic Name: [Feature/Initiative Name]
Epic Description: [High-level description of the feature]
Business Value: [Why this epic is important]
Acceptance Criteria: [High-level success criteria]
Stories: [List of user stories that comprise this epic]
```

## Example 1: User Authentication System

### Epic Details
**Epic Name:** User Authentication System
**Epic Key:** PROJ-100
**Epic Description:** Implement a comprehensive user authentication system that allows users to register, login, reset passwords, and manage their accounts securely.

**Business Value:**
- Enable user personalization and data persistence
- Provide foundation for user-specific features
- Ensure security and compliance requirements
- Support business analytics and user tracking

**High-Level Acceptance Criteria:**
- [ ] Users can register new accounts
- [ ] Users can login with email/password
- [ ] Users can reset forgotten passwords
- [ ] Users can update their profile information
- [ ] System maintains security best practices
- [ ] Integration with existing user database

### Stories Breakdown

#### Story 1: User Registration
**Story Key:** PROJ-101
**Story:** As a new user, I want to create an account so that I can access personalized features.

**Acceptance Criteria:**
- [ ] Registration form with email, password, confirm password
- [ ] Email validation (format and uniqueness)
- [ ] Password strength requirements
- [ ] Email verification process
- [ ] Account activation workflow
- [ ] Error handling for duplicate emails

**Story Points:** 8
**Priority:** High

#### Story 2: User Login
**Story Key:** PROJ-102
**Story:** As a registered user, I want to login to my account so that I can access my personal data.

**Acceptance Criteria:**
- [ ] Login form with email and password
- [ ] Authentication against user database
- [ ] Session management and cookies
- [ ] "Remember me" functionality
- [ ] Account lockout after failed attempts
- [ ] Redirect to intended page after login

**Story Points:** 5
**Priority:** High

#### Story 3: Password Reset
**Story Key:** PROJ-103
**Story:** As a user who forgot my password, I want to reset it so that I can regain access to my account.

**Acceptance Criteria:**
- [ ] "Forgot password" link on login page
- [ ] Email input for password reset request
- [ ] Secure token generation and email delivery
- [ ] Password reset form with token validation
- [ ] New password confirmation
- [ ] Token expiration (24 hours)

**Story Points:** 8
**Priority:** Medium

#### Story 4: User Profile Management
**Story Key:** PROJ-104
**Story:** As a logged-in user, I want to update my profile information so that I can keep my account current.

**Acceptance Criteria:**
- [ ] Profile page with current user information
- [ ] Editable fields: name, email, phone, preferences
- [ ] Email change requires verification
- [ ] Password change with current password confirmation
- [ ] Profile picture upload functionality
- [ ] Save and cancel options

**Story Points:** 13
**Priority:** Medium

#### Story 5: Two-Factor Authentication
**Story Key:** PROJ-105
**Story:** As a security-conscious user, I want to enable two-factor authentication so that my account is more secure.

**Acceptance Criteria:**
- [ ] 2FA setup page in user settings
- [ ] QR code generation for authenticator apps
- [ ] Backup codes generation and display
- [ ] 2FA verification during login
- [ ] Option to disable 2FA with password confirmation
- [ ] Recovery process for lost authenticator

**Story Points:** 21
**Priority:** Low

### Technical Tasks

#### Task 1: Database Schema Design
**Task Key:** PROJ-106
**Description:** Design and implement database schema for user authentication

**Subtasks:**
- [ ] Design user table structure
- [ ] Create password reset tokens table
- [ ] Design 2FA secrets table
- [ ] Create database migration scripts
- [ ] Set up indexes for performance

**Story Points:** 5

#### Task 2: Security Implementation
**Task Key:** PROJ-107
**Description:** Implement security measures for authentication system

**Subtasks:**
- [ ] Password hashing with bcrypt
- [ ] JWT token implementation
- [ ] Rate limiting for login attempts
- [ ] CSRF protection
- [ ] Input validation and sanitization

**Story Points:** 8

## Example 2: E-commerce Shopping Cart

### Epic Details
**Epic Name:** Shopping Cart Functionality
**Epic Key:** PROJ-200
**Epic Description:** Implement shopping cart functionality that allows users to add products, manage quantities, and proceed to checkout.

**Business Value:**
- Enable product sales and revenue generation
- Improve user experience with persistent cart
- Support promotional campaigns and discounts
- Provide foundation for order management

### Stories Breakdown

#### Story 1: Add Products to Cart
**Story Key:** PROJ-201
**Story:** As a shopper, I want to add products to my cart so that I can purchase multiple items together.

**Acceptance Criteria:**
- [ ] "Add to Cart" button on product pages
- [ ] Quantity selector for products
- [ ] Cart icon with item count in header
- [ ] Success message when item added
- [ ] Handle out-of-stock products
- [ ] Persist cart across browser sessions

**Story Points:** 8

#### Story 2: View and Manage Cart
**Story Key:** PROJ-202
**Story:** As a shopper, I want to view my cart contents so that I can review my selections before checkout.

**Acceptance Criteria:**
- [ ] Cart page showing all added products
- [ ] Product images, names, and prices
- [ ] Quantity adjustment controls
- [ ] Remove item functionality
- [ ] Subtotal calculation
- [ ] Continue shopping option

**Story Points:** 13

#### Story 3: Cart Persistence
**Story Key:** PROJ-203
**Story:** As a shopper, I want my cart to be saved so that I don't lose my selections when I return.

**Acceptance Criteria:**
- [ ] Save cart for logged-in users
- [ ] Merge guest cart with user cart on login
- [ ] Cart expiration after 30 days
- [ ] Restore cart on browser refresh
- [ ] Handle product availability changes

**Story Points:** 8

## Example 3: Reporting Dashboard

### Epic Details
**Epic Name:** Analytics Dashboard
**Epic Key:** PROJ-300
**Epic Description:** Create a comprehensive analytics dashboard for business users to track key performance indicators and make data-driven decisions.

**Business Value:**
- Provide visibility into business performance
- Enable data-driven decision making
- Support strategic planning and forecasting
- Improve operational efficiency

### Stories Breakdown

#### Story 1: Sales Performance Dashboard
**Story Key:** PROJ-301
**Story:** As a sales manager, I want to view sales performance metrics so that I can track team progress and identify trends.

**Acceptance Criteria:**
- [ ] Daily, weekly, monthly sales charts
- [ ] Sales by product category
- [ ] Sales by team member
- [ ] Comparison with previous periods
- [ ] Export functionality for reports
- [ ] Real-time data updates

**Story Points:** 21

#### Story 2: User Engagement Analytics
**Story Key:** PROJ-302
**Story:** As a product manager, I want to see user engagement metrics so that I can understand how users interact with our platform.

**Acceptance Criteria:**
- [ ] Active users (daily, weekly, monthly)
- [ ] Page views and session duration
- [ ] Feature usage statistics
- [ ] User journey visualization
- [ ] Conversion funnel analysis
- [ ] Cohort analysis charts

**Story Points:** 34

## Epic Planning Best Practices

### Epic Sizing Guidelines
- **Small Epic:** 20-40 story points (1-2 sprints)
- **Medium Epic:** 40-80 story points (2-4 sprints)
- **Large Epic:** 80+ story points (4+ sprints, consider breaking down)

### Epic Breakdown Process
1. **Define Epic Goal:** Clear business objective
2. **Identify User Personas:** Who will use this feature
3. **Map User Journey:** How users will interact
4. **Create User Stories:** Specific user needs
5. **Add Technical Tasks:** Infrastructure and setup work
6. **Estimate and Prioritize:** Size and order stories

### Epic Management Tips
- **Regular Reviews:** Update epic progress weekly
- **Scope Management:** Resist adding stories mid-epic
- **Dependency Tracking:** Identify and manage dependencies
- **Stakeholder Communication:** Keep business stakeholders informed
- **Definition of Done:** Clear completion criteria for epic

These examples demonstrate how to structure epics for maximum clarity and effective team execution.
