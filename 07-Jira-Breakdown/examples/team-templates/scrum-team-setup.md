# Scrum Team Setup Template

This template provides a comprehensive guide for setting up a Scrum team in Jira, including roles, permissions, and initial configuration.

## Team Structure

### Core Scrum Roles

#### Product Owner
**Name:** [Product Owner Name]
**Email:** [Email Address]
**Responsibilities:**
- Define and prioritize product backlog
- Write user stories with acceptance criteria
- Make product decisions and trade-offs
- Participate in sprint planning and review
- Communicate with stakeholders

**Jira Permissions:**
- Create and edit epics and stories
- Prioritize backlog items
- Manage product backlog
- View all project reports
- Comment on all issues

#### Scrum Master
**Name:** [Scrum Master Name]
**Email:** [Email Address]
**Responsibilities:**
- Facilitate Scrum ceremonies
- Remove impediments and blockers
- Coach team on Agile practices
- Manage sprint logistics
- Track team metrics and improvement

**Jira Permissions:**
- Create and manage sprints
- Access all project reports
- Manage board configuration
- Create and edit all issue types
- Administer project settings

#### Development Team
**Team Members:**
1. **Senior Developer:** [Name] - [Email]
2. **Frontend Developer:** [Name] - [Email]
3. **Backend Developer:** [Name] - [Email]
4. **QA Engineer:** [Name] - [Email]
5. **DevOps Engineer:** [Name] - [Email]

**Collective Responsibilities:**
- Estimate story points for backlog items
- Commit to sprint goals
- Deliver potentially shippable increments
- Participate in all Scrum ceremonies
- Self-organize and collaborate

**Jira Permissions:**
- Create and edit tasks and subtasks
- Transition issues through workflow
- Log work and add comments
- View team reports and metrics
- Update issue status and progress

## Project Configuration

### Project Setup
**Project Name:** [Team Name] Scrum Project
**Project Key:** [3-4 Letter Code]
**Project Type:** Scrum Software Development
**Project Lead:** [Scrum Master or Product Owner]

### Issue Types Configuration

#### Epic
**Purpose:** Large features or initiatives
**Workflow:** To Do → In Progress → Done
**Required Fields:**
- Summary
- Description
- Epic Name
- Business Value
- Assignee (Product Owner)

#### Story
**Purpose:** User-focused features and requirements
**Workflow:** To Do → In Progress → Code Review → Testing → Done
**Required Fields:**
- Summary
- Description (with acceptance criteria)
- Story Points
- Epic Link
- Assignee

#### Task
**Purpose:** Technical work and non-user-facing activities
**Workflow:** To Do → In Progress → Done
**Required Fields:**
- Summary
- Description
- Story Points (optional)
- Assignee

#### Bug
**Purpose:** Defects and issues to be fixed
**Workflow:** Open → In Progress → Resolved → Closed
**Required Fields:**
- Summary
- Description (with reproduction steps)
- Priority
- Severity
- Assignee

#### Subtask
**Purpose:** Breakdown of larger work items
**Workflow:** To Do → In Progress → Done
**Required Fields:**
- Summary
- Description
- Parent Issue
- Assignee

### Custom Fields

#### Story Points
**Type:** Number Field
**Purpose:** Effort estimation for planning
**Context:** Stories and Tasks only
**Options:** 1, 2, 3, 5, 8, 13, 21, 34

#### Business Value
**Type:** Select List
**Purpose:** Prioritization support
**Context:** Epics and Stories
**Options:** High, Medium, Low

#### Sprint Goal
**Type:** Text Field
**Purpose:** Sprint objective tracking
**Context:** Sprint level (if supported)

#### Acceptance Criteria
**Type:** Text Field (Multi-line)
**Purpose:** Story completion criteria
**Context:** Stories only

## Board Configuration

### Scrum Board Setup
**Board Name:** [Team Name] Scrum Board
**Board Type:** Scrum
**Filter:** project = "[PROJECT_KEY]" ORDER BY Rank

### Column Configuration
```
Backlog → To Do → In Progress → Code Review → Testing → Done
```

**Column Mapping:**
- **Backlog:** Unmapped (for backlog view)
- **To Do:** To Do status
- **In Progress:** In Progress status
- **Code Review:** Code Review status
- **Testing:** Testing status
- **Done:** Done, Resolved, Closed statuses

### Swimlane Configuration
**Swimlane Type:** Stories
**Purpose:** Group subtasks under parent stories
**Benefits:**
- Visual story progress tracking
- Clear work organization
- Easy identification of story completion

### Quick Filters
```
1. My Issues: assignee = currentUser()
2. Current Sprint: sprint in openSprints()
3. Bugs Only: type = Bug
4. High Priority: priority = High
5. Unassigned: assignee is EMPTY
```

## Sprint Configuration

### Sprint Settings
**Sprint Duration:** 2 weeks (recommended)
**Sprint Start Day:** Monday
**Sprint Planning:** Friday before sprint start
**Sprint Review:** Thursday of sprint end week
**Sprint Retrospective:** Friday of sprint end week

### Sprint Naming Convention
```
Sprint [Number] - [Start Date] to [End Date]
Examples:
- Sprint 1 - Jan 15 to Jan 26
- Sprint 2 - Jan 29 to Feb 9
- Sprint 3 - Feb 12 to Feb 23
```

### Sprint Capacity Planning
**Team Capacity Calculation:**
- Total team members: 5
- Sprint duration: 10 working days
- Capacity per person: 6 hours/day (accounting for meetings, etc.)
- Total team capacity: 5 × 10 × 6 = 300 hours
- Story point capacity: Based on team velocity (start with 20-30 points)

## Scrum Ceremonies

### Sprint Planning
**Duration:** 4 hours for 2-week sprint
**Participants:** Entire Scrum team
**Agenda:**
1. Review sprint goal and priorities
2. Select stories from product backlog
3. Break down stories into tasks
4. Estimate and commit to sprint backlog
5. Finalize sprint goal

**Jira Activities:**
- Move stories from backlog to sprint
- Create tasks and subtasks
- Assign initial work
- Set sprint goal

### Daily Standup
**Duration:** 15 minutes
**Participants:** Development team (Scrum Master and Product Owner optional)
**Format:** Three questions per team member
1. What did I complete yesterday?
2. What will I work on today?
3. What impediments are blocking me?

**Jira Activities:**
- Update issue statuses
- Log work completed
- Flag blockers and impediments
- Assign new work

### Sprint Review
**Duration:** 2 hours for 2-week sprint
**Participants:** Scrum team + stakeholders
**Agenda:**
1. Demo completed work
2. Review sprint metrics
3. Gather stakeholder feedback
4. Update product backlog

**Jira Activities:**
- Review completed issues
- Generate sprint report
- Update backlog based on feedback
- Close sprint

### Sprint Retrospective
**Duration:** 1 hour for 2-week sprint
**Participants:** Scrum team only
**Format:**
1. What went well?
2. What didn't go well?
3. What should we try next sprint?

**Jira Activities:**
- Review sprint metrics
- Create improvement action items
- Update team processes

## Team Metrics and Reporting

### Key Metrics to Track
**Velocity:**
- Story points completed per sprint
- Trend over multiple sprints
- Capacity planning for future sprints

**Burndown:**
- Daily progress within sprint
- Scope changes during sprint
- Predictability of delivery

**Quality:**
- Bug rate per sprint
- Defect resolution time
- Rework percentage

**Flow:**
- Cycle time for stories
- Lead time from creation to completion
- Work in progress limits

### Reporting Schedule
**Daily:** Burndown chart review during standup
**Weekly:** Progress update to stakeholders
**Sprint End:** Velocity and sprint metrics review
**Monthly:** Trend analysis and process improvement

## Team Onboarding Checklist

### New Team Member Setup
- [ ] Create Jira account
- [ ] Add to project with appropriate permissions
- [ ] Assign to development team group
- [ ] Provide Jira training and orientation
- [ ] Explain team processes and ceremonies
- [ ] Assign mentor for first sprint
- [ ] Add to team communication channels

### Initial Training Topics
- [ ] Jira navigation and basic usage
- [ ] Scrum methodology overview
- [ ] Team workflow and processes
- [ ] Issue creation and management
- [ ] Time logging and reporting
- [ ] Board usage and updates

## Success Criteria

### Team Performance Indicators
**Sprint Success:**
- 80%+ sprint goal achievement
- Stable or improving velocity
- Low scope creep (<10%)
- High team satisfaction

**Process Maturity:**
- Consistent ceremony execution
- Effective impediment removal
- Continuous improvement implementation
- Strong team collaboration

**Quality Metrics:**
- Low defect rate
- Fast issue resolution
- High stakeholder satisfaction
- Minimal rework

This template provides a comprehensive foundation for establishing an effective Scrum team in Jira, ensuring proper setup, clear processes, and measurable success.
