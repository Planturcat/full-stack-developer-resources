# Issues and Workflow

Issues are the fundamental building blocks of work in Jira. Understanding how to create, manage, and organize issues effectively is essential for successful project management.

## Understanding Issue Types

### Epic
**Purpose:** Large body of work that can be broken down into smaller pieces

**Characteristics:**
- **Scope**: Major feature, initiative, or project phase
- **Duration**: Spans multiple sprints or weeks
- **Breakdown**: Contains multiple stories or tasks
- **Planning**: Used for high-level roadmap planning

**Example Epic:**
```
Epic: User Authentication System
├── Story: User registration
├── Story: User login
├── Story: Password reset
├── Story: Two-factor authentication
└── Story: Social media login
```

**When to Use:**
- Large features that take multiple sprints
- Major initiatives or projects
- Grouping related functionality
- High-level planning and roadmapping

### Story
**Purpose:** Feature or requirement from the user's perspective

**Characteristics:**
- **User-focused**: Written from user's point of view
- **Valuable**: Delivers value to end users
- **Estimable**: Can be sized and estimated
- **Testable**: Has clear acceptance criteria

**Story Format:**
```
As a [user type]
I want [functionality]
So that [benefit/value]
```

**Example Stories:**
- "As a customer, I want to reset my password so that I can regain access to my account"
- "As an admin, I want to view user activity logs so that I can monitor system usage"

**When to Use:**
- User-facing features
- Functional requirements
- Work that delivers direct value
- Items that can be completed in one sprint

### Task
**Purpose:** Work that needs to be done but isn't necessarily user-facing

**Characteristics:**
- **Technical**: Often technical or administrative work
- **Specific**: Clear, actionable work item
- **Independent**: Can be completed by one person
- **Measurable**: Has clear completion criteria

**Example Tasks:**
- "Set up development environment"
- "Create database backup script"
- "Update project documentation"
- "Configure CI/CD pipeline"

**When to Use:**
- Technical work
- Administrative tasks
- Infrastructure setup
- Documentation work

### Bug
**Purpose:** Problem or defect that needs to be fixed

**Characteristics:**
- **Problem-focused**: Describes what's wrong
- **Reproducible**: Steps to reproduce the issue
- **Impact**: Severity and priority information
- **Resolution**: How the problem was fixed

**Bug Information:**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details**
- **Screenshots/logs**

**Example Bug:**
```
Summary: Login button not working on mobile Safari
Steps to reproduce:
1. Open website on iPhone Safari
2. Navigate to login page
3. Enter valid credentials
4. Tap login button
Expected: User should be logged in
Actual: Nothing happens, no error message
```

**When to Use:**
- Software defects
- System errors
- User-reported problems
- Performance issues

### Subtask
**Purpose:** Breakdown of larger work items into smaller, manageable pieces

**Characteristics:**
- **Child item**: Belongs to parent issue
- **Specific**: Focused on one aspect of work
- **Assignable**: Can be assigned to different team members
- **Trackable**: Individual progress tracking

**Example Subtask Breakdown:**
```
Story: User Registration
├── Subtask: Design registration form UI
├── Subtask: Create user registration API
├── Subtask: Implement form validation
├── Subtask: Add email verification
└── Subtask: Write unit tests
```

**When to Use:**
- Breaking down complex work
- Parallel work by multiple team members
- Detailed progress tracking
- Skill-specific assignments

## Issue Hierarchy and Relationships

### Hierarchical Structure
```
Epic (Largest)
├── Story/Task
│   ├── Subtask
│   └── Subtask
├── Story/Task
│   └── Subtask
└── Bug (Can be standalone or under Epic)
```

### Issue Relationships

#### Parent-Child Relationships
- **Epic → Stories**: Epic contains multiple stories
- **Story → Subtasks**: Story broken into subtasks
- **Task → Subtasks**: Task divided into smaller pieces

#### Linking Relationships
- **Blocks/Blocked by**: One issue prevents another
- **Relates to**: General relationship between issues
- **Duplicates**: Same issue reported multiple times
- **Clones**: Copy of existing issue for different context

#### Example Relationships:
```
Epic: E-commerce Checkout
├── Story: Shopping cart functionality
│   ├── Subtask: Add items to cart
│   ├── Subtask: Remove items from cart
│   └── Subtask: Calculate totals
├── Story: Payment processing
│   ├── Subtask: Credit card integration
│   └── Subtask: PayPal integration
└── Story: Order confirmation
    ├── Subtask: Send confirmation email
    └── Subtask: Update inventory
```

## Creating and Managing Issues

### Issue Creation Best Practices

#### Essential Information
1. **Clear Summary**: Concise, descriptive title
2. **Detailed Description**: Sufficient context and requirements
3. **Acceptance Criteria**: Definition of done
4. **Priority**: Business importance
5. **Assignee**: Who will work on it
6. **Labels/Components**: Categorization and filtering

#### Writing Effective Summaries
**Good Examples:**
- "Implement user password reset functionality"
- "Fix mobile navigation menu not displaying"
- "Add search filters to product catalog"

**Poor Examples:**
- "Fix bug" (too vague)
- "Update the thing we discussed" (no context)
- "Make it work better" (not specific)

#### Writing Clear Descriptions

**Template for Stories:**
```
User Story:
As a [user type], I want [functionality] so that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Additional Notes:
- Technical considerations
- Design requirements
- Dependencies
```

**Template for Bugs:**
```
Environment:
- Browser: Chrome 91
- OS: Windows 10
- Version: 2.1.3

Steps to Reproduce:
1. Step one
2. Step two
3. Step three

Expected Result:
What should happen

Actual Result:
What actually happens

Additional Information:
- Screenshots
- Error logs
- Workarounds
```

### Issue Fields and Customization

#### Standard Fields
- **Summary**: Brief description
- **Description**: Detailed information
- **Issue Type**: Epic, Story, Task, Bug, Subtask
- **Status**: Current workflow state
- **Priority**: Critical, High, Medium, Low
- **Assignee**: Person responsible
- **Reporter**: Person who created the issue
- **Labels**: Tags for categorization
- **Components**: Project areas or modules
- **Fix Version**: Target release
- **Due Date**: Deadline (if applicable)

#### Custom Fields
Organizations often add custom fields for specific needs:
- **Business Value**: Scoring system for prioritization
- **Effort Estimate**: Story points or hours
- **Customer**: External stakeholder
- **Department**: Organizational unit
- **Severity**: Impact level for bugs

### Issue Lifecycle Management

#### Status Progression
```
Created → To Do → In Progress → Review → Done
```

#### Workflow Transitions
- **Start Progress**: Move from To Do to In Progress
- **Stop Progress**: Move back to To Do
- **Submit for Review**: Move to Review status
- **Approve**: Move from Review to Done
- **Reject**: Move from Review back to In Progress

#### Workflow Rules and Validators
- **Required fields**: Must be filled before transition
- **Permissions**: Who can perform transitions
- **Conditions**: When transitions are available
- **Post-functions**: Actions after transition

## Advanced Issue Management

### Bulk Operations

#### Bulk Edit
1. Select multiple issues from issue navigator
2. Choose "Bulk Change" → "Edit Issues"
3. Modify fields for all selected issues
4. Confirm changes

**Common Bulk Operations:**
- Change assignee for multiple issues
- Update priority or labels
- Move issues to different project
- Transition multiple issues

#### Bulk Transition
1. Select issues in same status
2. Choose "Bulk Change" → "Transition Issues"
3. Select target status
4. Apply to all selected issues

### Issue Cloning and Templates

#### When to Clone Issues
- **Similar work**: Repetitive tasks with slight variations
- **Bug reproduction**: Create test cases from bugs
- **Template creation**: Standard issue formats

#### Cloning Process
1. Open source issue
2. Click "More" → "Clone"
3. Modify summary and description
4. Update relevant fields
5. Create cloned issue

### Issue Linking and Dependencies

#### Link Types
- **Blocks**: This issue prevents another from being completed
- **Clones**: Copy of another issue
- **Duplicates**: Same issue as another
- **Relates to**: General relationship

#### Managing Dependencies
```
Story A (Login) → Blocks → Story B (User Profile)
Story C (Database) → Blocks → Story A (Login)
```

**Dependency Management:**
1. Identify blocking relationships
2. Prioritize blocking issues
3. Communicate dependencies to team
4. Track resolution of blockers

### Issue Search and Filtering

#### Basic Search
- **Quick search**: Text search across summaries
- **Basic filters**: Project, assignee, status
- **Recent issues**: Recently viewed or updated

#### Advanced Search (JQL)
Jira Query Language for complex searches:

```jql
project = "Website Redesign" 
AND assignee = currentUser() 
AND status != Done 
ORDER BY priority DESC
```

**Common JQL Examples:**
```jql
# My open issues
assignee = currentUser() AND status != Done

# High priority bugs
type = Bug AND priority = High

# Issues updated today
updated >= startOfDay()

# Overdue issues
due < now() AND status != Done
```

#### Saved Filters
1. Create complex search
2. Click "Save as" → "Save filter"
3. Name and share filter
4. Use for dashboards and reports

## Workflow Design Principles

### Simple vs Complex Workflows

#### Simple Workflow (Recommended for beginners)
```
To Do → In Progress → Done
```

#### Complex Workflow (For mature teams)
```
To Do → In Progress → Code Review → Testing → Done
                ↓
            Blocked ← → On Hold
```

### Workflow Best Practices

#### Keep It Simple
- Start with basic workflow
- Add complexity gradually
- Ensure every status has purpose
- Minimize number of transitions

#### Clear Status Definitions
- **To Do**: Work not yet started
- **In Progress**: Actively being worked on
- **Review**: Waiting for approval or feedback
- **Done**: Completed and accepted

#### Consistent Naming
- Use organization-wide standards
- Avoid technical jargon
- Make statuses self-explanatory
- Consider user perspective

Understanding issues and workflows provides the foundation for effective project management in Jira. The next topic covers Agile Scrum methodology and its implementation in Jira.
