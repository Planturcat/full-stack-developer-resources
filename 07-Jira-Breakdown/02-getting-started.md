# Getting Started with Jira

This guide walks you through setting up your Jira account, understanding the interface, and creating your first project.

## Creating Your Jira Account

### Free Plan Overview
Jira offers a generous free plan that's perfect for learning and small teams:

**Free Plan Includes:**
- **Up to 10 users**
- **Unlimited projects**
- **2GB storage**
- **Community support**
- **Basic reporting**
- **Mobile app access**

### Account Setup Process

#### Step 1: Sign Up
1. Visit [atlassian.com/software/jira](https://www.atlassian.com/software/jira)
2. Click "Get it free"
3. Enter your email address
4. Choose "Jira Software" (for software teams) or "Jira Work Management" (for business teams)
5. Create your site name (e.g., `yourcompany.atlassian.net`)

#### Step 2: Initial Configuration
1. **Choose your use case:**
   - Software development
   - Marketing
   - HR
   - Operations
   - Other business function

2. **Select team size:**
   - Just me
   - 2-10 people
   - 11-100 people
   - 100+ people

3. **Import data (optional):**
   - Import from Trello
   - Import from CSV
   - Start fresh

#### Step 3: Verify Email and Complete Setup
1. Check your email for verification link
2. Click verification link
3. Set up your password
4. Complete profile information

## Understanding the Jira Interface

### Main Navigation Areas

#### Top Navigation Bar
- **Jira Logo**: Returns to main dashboard
- **Projects**: Access all your projects
- **Filters**: Saved searches and custom filters
- **Dashboards**: Project and team dashboards
- **Apps**: Installed applications and marketplace
- **Create**: Quick issue creation button
- **Notifications**: System and project notifications
- **Profile**: Account settings and preferences

#### Left Sidebar (Project Context)
- **Backlog**: Product/sprint backlog management
- **Active Sprints**: Current sprint board
- **Reports**: Project analytics and reports
- **Issues**: Issue search and management
- **Components**: Project components and versions
- **Project Settings**: Configuration and administration

#### Main Content Area
- **Dashboard**: Project overview and widgets
- **Board View**: Kanban or Scrum board
- **List View**: Tabular issue display
- **Issue Detail**: Individual issue information

### Dashboard Overview

#### Your Work Dashboard
The default dashboard shows:
- **Assigned to me**: Issues you're responsible for
- **Recent activity**: Latest project updates
- **Worked on recently**: Issues you've recently viewed or updated
- **Created recently**: Issues you've created

#### Project Dashboard
Each project has its own dashboard with:
- **Sprint progress**: Current sprint status
- **Issue statistics**: Breakdown by type and status
- **Recent activity**: Project-specific updates
- **Quick actions**: Create issue, start sprint, etc.

## Initial Configuration

### Personal Settings

#### Profile Setup
1. Click your profile picture (top right)
2. Select "Profile"
3. Update:
   - **Display name**
   - **Profile picture**
   - **Time zone**
   - **Language preferences**

#### Notification Preferences
1. Go to Profile → "Personal Settings"
2. Click "Email" tab
3. Configure:
   - **Issue updates**: When you're assigned, mentioned, or watching
   - **Project notifications**: Project-wide announcements
   - **System notifications**: Account and billing updates

#### Dashboard Customization
1. Go to "Dashboards" in top navigation
2. Click "Create dashboard" or edit existing
3. Add widgets:
   - **Filter results**: Show issues matching criteria
   - **Activity stream**: Recent project activity
   - **Pie charts**: Issue distribution by status, assignee, etc.
   - **Gadgets**: Various project metrics and summaries

### System Preferences

#### Language and Locale
1. Profile → "Personal Settings"
2. Set:
   - **Language**: Interface language
   - **Time zone**: For accurate timestamps
   - **Date format**: Regional preferences

#### Keyboard Shortcuts
Enable keyboard shortcuts for faster navigation:
- **Press "?"**: View all available shortcuts
- **"c"**: Create new issue
- **"/"**: Quick search
- **"g" + "d"**: Go to dashboard
- **"g" + "p"**: Go to projects

## Creating Your First Project

### Project Creation Wizard

#### Step 1: Choose Project Type
1. Click "Projects" → "Create project"
2. Select template:
   - **Scrum**: For agile software development
   - **Kanban**: For continuous flow work
   - **Bug tracking**: For issue and bug management
   - **Task management**: For general business projects

#### Step 2: Project Details
1. **Project name**: Descriptive name (e.g., "Website Redesign")
2. **Project key**: Short identifier (e.g., "WR")
3. **Project lead**: Person responsible for the project
4. **Access level**: 
   - **Open**: Anyone can access
   - **Private**: Restricted access

#### Step 3: Initial Configuration
1. **Issue types**: Epic, Story, Task, Bug (can be customized later)
2. **Workflow**: Default workflow (To Do → In Progress → Done)
3. **Permissions**: Who can view, edit, and administer

### Project Setup Best Practices

#### Naming Conventions
- **Project Name**: Clear, descriptive (e.g., "Mobile App Development")
- **Project Key**: 2-4 letters, memorable (e.g., "MAD")
- **Issue Summary**: Action-oriented (e.g., "Implement user login")

#### Initial Project Structure
```
Project: Website Redesign (WR)
├── Epic: User Experience Improvements
│   ├── Story: Redesign homepage layout
│   ├── Story: Improve navigation menu
│   └── Story: Optimize mobile responsiveness
├── Epic: Performance Optimization
│   ├── Story: Reduce page load times
│   └── Story: Optimize images and assets
└── Epic: Content Management
    ├── Story: Update product descriptions
    └── Story: Create new landing pages
```

## Basic Navigation and Usage

### Creating Your First Issue

#### Using the Create Button
1. Click "Create" button (+ icon) in top navigation
2. Fill in required fields:
   - **Project**: Select your project
   - **Issue Type**: Story, Task, Bug, etc.
   - **Summary**: Brief description
   - **Description**: Detailed information
   - **Assignee**: Who will work on it
   - **Priority**: High, Medium, Low

#### Quick Create from Board
1. Go to your project board
2. Click "Create issue" in any column
3. Issue is automatically placed in that status

### Viewing and Managing Issues

#### Board View
- **Drag and drop**: Move issues between statuses
- **Quick edit**: Click issue to edit inline
- **Filters**: Show/hide specific issues
- **Swimlanes**: Group issues by assignee, epic, etc.

#### Backlog View
- **Prioritize**: Drag issues to reorder priority
- **Estimate**: Add story points or time estimates
- **Sprint planning**: Drag issues into sprints

#### Issue Detail View
- **Comments**: Team communication
- **Attachments**: Files and screenshots
- **Links**: Relationships to other issues
- **History**: All changes and updates

### Basic Workflow Operations

#### Moving Issues Through Workflow
1. **To Do → In Progress**: Start working on issue
2. **In Progress → Done**: Complete the work
3. **Custom transitions**: Organization-specific steps

#### Assigning and Updating Issues
- **Assign**: Click assignee field and select team member
- **Update status**: Drag on board or use workflow buttons
- **Add comments**: Communicate progress and blockers
- **Log work**: Track time spent (if enabled)

## Team Collaboration Basics

### Adding Team Members
1. Go to Project Settings → "People"
2. Click "Add people"
3. Enter email addresses
4. Assign roles:
   - **Administrator**: Full project control
   - **Member**: Can create and edit issues
   - **Viewer**: Read-only access

### Communication Features

#### Comments and Mentions
- **@mention**: Type @ followed by username to notify someone
- **Comments**: Add updates, questions, or information
- **Notifications**: Team members get email updates

#### Watching Issues
- **Watch**: Get notified of all changes to an issue
- **Auto-watch**: Automatically watch issues you create or are assigned

### Basic Reporting

#### Built-in Reports
1. Go to "Reports" in project sidebar
2. Available reports:
   - **Burndown chart**: Sprint progress tracking
   - **Velocity chart**: Team delivery rate over time
   - **Control chart**: Cycle time analysis
   - **Cumulative flow**: Work distribution over time

#### Creating Simple Filters
1. Go to "Issues" → "Search for issues"
2. Use basic search or JQL (Jira Query Language)
3. Save useful searches as filters
4. Share filters with team members

## Next Steps

### Immediate Actions
1. **Create 3-5 sample issues** to practice navigation
2. **Invite 1-2 team members** to test collaboration
3. **Explore the board view** and try moving issues
4. **Set up basic notifications** for your workflow

### Learning Path
1. **Master basic issue management** (this topic)
2. **Learn project types and templates** (next topic)
3. **Understand agile methodology** (if using Scrum)
4. **Explore reporting and analytics** (for tracking progress)

### Common Beginner Questions

#### "How do I organize my work?"
Start with a simple structure: Epic → Stories → Tasks. Don't over-complicate initially.

#### "What's the difference between Story and Task?"
- **Story**: User-focused feature ("As a user, I want...")
- **Task**: Technical or administrative work ("Set up database")

#### "How detailed should my issues be?"
Include enough information for someone else to understand and complete the work.

#### "Should I use Scrum or Kanban?"
- **Scrum**: If you work in planned iterations (sprints)
- **Kanban**: If you have continuous flow of work

Getting comfortable with these basics provides a solid foundation for effective Jira usage. The next topic covers understanding different project types and templates.
