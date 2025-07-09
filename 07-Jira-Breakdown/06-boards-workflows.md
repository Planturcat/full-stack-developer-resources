# Boards and Workflows

Boards provide visual representation of work, while workflows define how issues progress through different states. Understanding both is crucial for effective project management in Jira.

## Understanding Jira Boards

### Board Types

#### Scrum Board
**Purpose:** Manage work in time-boxed iterations (sprints)

**Key Features:**
- **Sprint Planning**: Plan work for upcoming sprints
- **Backlog Management**: Prioritize and estimate work
- **Sprint Execution**: Track progress during sprint
- **Burndown Charts**: Visualize remaining work

**Best For:**
- Teams working in fixed iterations
- Projects with regular release cycles
- Teams practicing Scrum methodology
- Work that can be planned in advance

#### Kanban Board
**Purpose:** Visualize continuous flow of work

**Key Features:**
- **Continuous Flow**: No fixed iterations
- **Work in Progress Limits**: Control flow efficiency
- **Cumulative Flow**: Track work distribution over time
- **Cycle Time**: Measure delivery speed

**Best For:**
- Support and maintenance teams
- Continuous delivery environments
- Teams with unpredictable work arrival
- Process improvement initiatives

### Board Configuration

#### Creating a Board
1. Go to "Boards" → "Create board"
2. Choose board type (Scrum or Kanban)
3. Select board source:
   - **Create new project**: Start fresh
   - **Use existing project**: Add board to project
   - **Use existing filter**: Base on saved search

#### Board Settings
Access via "Board" → "Board settings"

**General Settings:**
- **Board name**: Descriptive identifier
- **Administrators**: Who can configure board
- **Sharing**: Public or private access
- **Description**: Board purpose and usage

## Board Customization

### Columns Configuration

#### Default Columns
Most boards start with basic columns:
- **To Do**: Work not yet started
- **In Progress**: Work currently being done
- **Done**: Completed work

#### Adding Custom Columns
1. Go to Board Settings → "Columns"
2. Click "Add column"
3. Configure column:
   - **Name**: Column title
   - **Category**: Unmapped, To Do, In Progress, Done
   - **Statuses**: Which workflow statuses appear in column

#### Column Mapping Examples

**Software Development Board:**
```
Backlog → To Do → In Progress → Code Review → Testing → Done
```

**Marketing Campaign Board:**
```
Ideas → Planning → Design → Review → Approved → Launched
```

**Support Ticket Board:**
```
New → Assigned → In Progress → Waiting → Resolved → Closed
```

### Swimlanes Configuration

#### Purpose of Swimlanes
Swimlanes group issues horizontally across board columns:
- **Visual Organization**: Group related work
- **Priority Management**: Separate urgent from normal work
- **Team Organization**: Show work by assignee or team
- **Epic Tracking**: Group stories under epics

#### Swimlane Options
1. **None**: No swimlanes (default)
2. **Stories**: Group by parent epic
3. **Assignee**: Group by person assigned
4. **Queries**: Custom JQL-based grouping

#### Custom Swimlane Examples

**By Priority:**
```
Swimlane: Critical Issues
Query: priority = "Critical"

Swimlane: High Priority
Query: priority = "High"

Swimlane: Normal Priority
Query: priority in ("Medium", "Low")
```

**By Epic:**
```
Swimlane: User Authentication
Query: "Epic Link" = AUTH-1

Swimlane: Payment System
Query: "Epic Link" = PAY-1

Swimlane: Reporting Features
Query: "Epic Link" = REP-1
```

### Quick Filters

#### Purpose
Quick filters allow rapid board filtering without changing underlying configuration.

#### Common Quick Filter Examples

**By Assignee:**
```
Filter Name: My Issues
JQL: assignee = currentUser()
```

**By Issue Type:**
```
Filter Name: Bugs Only
JQL: type = Bug
```

**By Sprint:**
```
Filter Name: Current Sprint
JQL: sprint in openSprints()
```

**By Recently Updated:**
```
Filter Name: Updated Today
JQL: updated >= startOfDay()
```

### Card Layout and Information

#### Card Customization
1. Go to Board Settings → "Card layout"
2. Configure card fields:
   - **Card color**: Based on priority, issue type, or assignee
   - **Visible fields**: Show relevant information
   - **Days in column**: Track how long issues stay in status

#### Useful Card Fields
- **Assignee**: Who's working on it
- **Story Points**: Effort estimate
- **Due Date**: Deadline information
- **Labels**: Categorization tags
- **Epic Link**: Parent epic connection

## Workflow Design and Management

### Workflow Fundamentals

#### Workflow Components
- **Statuses**: States an issue can be in
- **Transitions**: Allowed movements between statuses
- **Conditions**: Rules for when transitions are available
- **Validators**: Requirements before transition can occur
- **Post-functions**: Actions performed after transition

#### Basic Workflow Structure
```
[Create] → To Do → [Start Progress] → In Progress → [Done] → Done
                     ↑                    ↓
                [Stop Progress]    [Resolve Issue]
```

### Workflow Customization

#### Adding Custom Statuses
1. Go to Project Settings → "Workflows"
2. Edit workflow or create new one
3. Add status:
   - **Name**: Status identifier
   - **Category**: To Do, In Progress, or Done
   - **Description**: Purpose and usage

#### Common Custom Statuses

**Software Development:**
- **Code Review**: Waiting for peer review
- **Testing**: In quality assurance
- **Blocked**: Cannot proceed due to impediment
- **Deployed**: Released to production

**Content Creation:**
- **Draft**: Initial creation
- **Review**: Editorial review
- **Approved**: Ready for publication
- **Published**: Live content

**Business Process:**
- **Submitted**: Initial request
- **Under Review**: Being evaluated
- **Approved**: Accepted for implementation
- **On Hold**: Temporarily paused

### Advanced Workflow Features

#### Conditions
Control when transitions are available:

**User-based Conditions:**
- Only assignee can transition
- Only project lead can approve
- Only specific groups can access

**Field-based Conditions:**
- Required fields must be filled
- Specific values must be selected
- Validation rules must pass

#### Validators
Ensure requirements are met before transition:

**Common Validators:**
- **Required fields**: Must be completed
- **User permission**: User has necessary rights
- **Field validation**: Values meet criteria
- **Custom validation**: Business rule compliance

#### Post-functions
Actions performed after transition:

**Standard Post-functions:**
- **Assign issue**: Set assignee automatically
- **Update fields**: Modify field values
- **Create issue**: Generate related issues
- **Send notification**: Email relevant parties

### Workflow Best Practices

#### Design Principles
1. **Keep it Simple**: Start with basic workflow
2. **User-Centric**: Design for actual users
3. **Consistent**: Use standard naming and patterns
4. **Flexible**: Allow for process evolution
5. **Documented**: Clear status definitions

#### Status Naming Guidelines
- **Action-Oriented**: "In Review" vs "Review"
- **Clear Meaning**: Avoid ambiguous terms
- **Consistent**: Same terms across projects
- **User-Friendly**: Non-technical language

#### Transition Guidelines
- **Logical Flow**: Natural progression
- **Bidirectional**: Allow backward movement when needed
- **Minimal Clicks**: Reduce unnecessary steps
- **Clear Labels**: Descriptive transition names

## Board Performance Optimization

### Work in Progress (WIP) Limits

#### Purpose of WIP Limits
- **Improve Flow**: Reduce multitasking and context switching
- **Identify Bottlenecks**: Highlight process constraints
- **Increase Quality**: Focus on completing work
- **Reduce Cycle Time**: Faster delivery

#### Setting WIP Limits
1. Go to Board Settings → "Columns"
2. Set limits for each column:
   - **Minimum**: Warn when below threshold
   - **Maximum**: Prevent exceeding limit
   - **Consider**: Include or exclude specific statuses

#### WIP Limit Examples

**Development Team (5 people):**
```
To Do: No limit
In Progress: 5 (one per person)
Code Review: 3 (limited review capacity)
Testing: 2 (QA bottleneck)
Done: No limit
```

### Board Filters and JQL

#### Board Filter Configuration
Every board is based on a filter (JQL query):

**Basic Board Filter:**
```jql
project = "My Project" 
AND type in (Story, Task, Bug) 
ORDER BY rank
```

**Advanced Board Filter:**
```jql
project in ("Project A", "Project B") 
AND assignee in membersOf("development-team") 
AND status != Done 
AND created >= -30d 
ORDER BY priority DESC, created ASC
```

#### Filter Optimization
- **Specific Projects**: Limit to relevant projects
- **Relevant Issue Types**: Exclude unnecessary types
- **Active Work**: Focus on current items
- **Performance**: Avoid complex queries

### Board Analytics and Metrics

#### Built-in Reports
Access via "Reports" in project sidebar:

**Scrum Reports:**
- **Burndown Chart**: Sprint progress tracking
- **Velocity Chart**: Team delivery rate
- **Sprint Report**: Detailed sprint summary
- **Epic Burndown**: Epic progress over time

**Kanban Reports:**
- **Cumulative Flow Diagram**: Work distribution over time
- **Control Chart**: Cycle time analysis
- **Velocity Chart**: Throughput measurement

#### Key Metrics to Track

**Flow Metrics:**
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion
- **Throughput**: Issues completed per time period
- **Work in Progress**: Current active work

**Quality Metrics:**
- **Defect Rate**: Bugs per feature delivered
- **Rework Rate**: Issues returned for fixes
- **Blocked Time**: Time spent in blocked status

## Troubleshooting Common Board Issues

### Performance Problems

#### Slow Board Loading
**Causes:**
- Complex JQL queries
- Large number of issues
- Too many custom fields
- Heavy board configuration

**Solutions:**
- Simplify board filter
- Archive old issues
- Reduce visible fields
- Optimize JQL queries

#### Board Not Updating
**Causes:**
- Browser cache issues
- Permission problems
- Workflow configuration errors

**Solutions:**
- Refresh browser/clear cache
- Check user permissions
- Verify workflow transitions

### Configuration Issues

#### Issues Not Appearing
**Troubleshooting Steps:**
1. Check board filter JQL
2. Verify issue matches filter criteria
3. Confirm user has view permissions
4. Review project and issue type settings

#### Workflow Transitions Not Working
**Common Causes:**
- Missing permissions
- Failed validators
- Condition not met
- Workflow configuration error

**Resolution Steps:**
1. Check user permissions for transition
2. Review validator requirements
3. Verify condition logic
4. Test workflow in isolation

Understanding boards and workflows enables teams to visualize work effectively and design processes that support their methodology. The next topic covers team collaboration and user management.
