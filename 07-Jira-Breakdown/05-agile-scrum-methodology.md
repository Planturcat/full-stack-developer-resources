# Agile Scrum Methodology

Scrum is the most popular Agile framework for managing product development. This guide covers implementing Scrum methodology using Jira's built-in features.

## Scrum Framework Overview

### Core Principles
Scrum is built on three pillars:
1. **Transparency**: All aspects of work are visible to those responsible for outcomes
2. **Inspection**: Regular examination of artifacts and progress
3. **Adaptation**: Adjusting based on inspection results

### Scrum Values
- **Commitment**: Dedication to achieving team goals
- **Courage**: Doing the right thing and working on tough problems
- **Focus**: Concentrating on sprint work and goals
- **Openness**: Being open about work and challenges
- **Respect**: Respecting team members' capabilities and diversity

## Scrum Roles

### Product Owner
**Responsibilities:**
- **Product Vision**: Define and communicate product direction
- **Backlog Management**: Prioritize and maintain product backlog
- **Stakeholder Communication**: Interface between team and stakeholders
- **Acceptance Criteria**: Define what "done" means for each item
- **Value Maximization**: Ensure team delivers maximum business value

**In Jira:**
- Creates and prioritizes epics and stories
- Manages product backlog order
- Defines acceptance criteria in issue descriptions
- Reviews and accepts completed work

**Key Activities:**
- Writing user stories with clear acceptance criteria
- Prioritizing backlog based on business value
- Participating in sprint planning and review
- Making decisions about scope and requirements

### Scrum Master
**Responsibilities:**
- **Process Facilitation**: Ensure Scrum process is followed
- **Impediment Removal**: Help team overcome obstacles
- **Team Coaching**: Guide team in Scrum practices
- **Stakeholder Education**: Help organization understand Scrum
- **Continuous Improvement**: Facilitate retrospectives and improvements

**In Jira:**
- Manages sprint creation and configuration
- Tracks team velocity and metrics
- Identifies and helps resolve blockers
- Facilitates sprint ceremonies

**Key Activities:**
- Facilitating daily standups, planning, and retrospectives
- Monitoring sprint progress and team health
- Removing impediments and blockers
- Coaching team on Agile practices

### Development Team
**Responsibilities:**
- **Self-Organization**: Decide how to accomplish work
- **Cross-Functionality**: Possess all skills needed to create product
- **Collaboration**: Work together to achieve sprint goals
- **Quality**: Ensure work meets definition of done
- **Estimation**: Provide effort estimates for backlog items

**In Jira:**
- Updates issue status and logs work
- Estimates story points for backlog items
- Creates subtasks for detailed work breakdown
- Participates in sprint planning and retrospectives

**Key Activities:**
- Estimating and committing to sprint work
- Daily collaboration and communication
- Delivering potentially shippable increments
- Participating in all Scrum ceremonies

## Scrum Artifacts

### Product Backlog
**Definition:** Prioritized list of features, requirements, and improvements

**Characteristics:**
- **Ordered**: Items prioritized by business value
- **Detailed**: Higher priority items more detailed
- **Estimated**: Items sized for planning purposes
- **Emergent**: Continuously refined and updated

**In Jira:**
- Represented as list of epics, stories, and tasks
- Ordered by dragging items in backlog view
- Estimated using story points or time
- Refined through regular backlog grooming

**Backlog Management:**
```
Product Backlog (Ordered by Priority)
├── Epic: User Authentication (High Priority)
│   ├── Story: User registration (8 points)
│   ├── Story: User login (5 points)
│   └── Story: Password reset (3 points)
├── Epic: Product Catalog (Medium Priority)
│   ├── Story: Browse products (13 points)
│   └── Story: Search functionality (8 points)
└── Epic: Shopping Cart (Lower Priority)
    ├── Story: Add to cart (5 points)
    └── Story: Checkout process (21 points)
```

### Sprint Backlog
**Definition:** Product backlog items selected for current sprint plus plan for delivering them

**Characteristics:**
- **Sprint Goal**: Clear objective for the sprint
- **Committed Work**: Items team commits to complete
- **Detailed Tasks**: Breakdown of work into daily tasks
- **Owned by Team**: Development team manages sprint backlog

**In Jira:**
- Created by moving items from product backlog to sprint
- Managed in active sprint board
- Tracked with burndown charts
- Updated daily as work progresses

### Product Increment
**Definition:** Sum of all product backlog items completed during sprint plus previous increments

**Characteristics:**
- **Potentially Shippable**: Could be released to users
- **Meets Definition of Done**: Satisfies quality standards
- **Integrated**: Works with existing product
- **Valuable**: Provides value to end users

**In Jira:**
- Represented by completed stories and tasks
- Tracked through sprint reports
- Documented in release notes
- Linked to version/release management

## Scrum Events

### Sprint Planning
**Purpose:** Plan work for upcoming sprint

**Duration:** 2-4 hours for 2-week sprint

**Participants:** Product Owner, Scrum Master, Development Team

**Activities in Jira:**
1. **Review Product Backlog**
   - Product Owner presents prioritized items
   - Team asks clarifying questions
   - Acceptance criteria reviewed

2. **Select Sprint Items**
   - Team estimates capacity
   - Items moved from backlog to sprint
   - Sprint goal defined

3. **Task Breakdown**
   - Stories broken into tasks/subtasks
   - Tasks estimated and assigned
   - Dependencies identified

**Sprint Planning Process:**
```
1. Product Owner presents top priority items
2. Team estimates effort (story points)
3. Team selects items for sprint based on capacity
4. Sprint goal is defined and agreed upon
5. Selected items moved to sprint backlog
6. Tasks created and estimated
```

### Daily Scrum (Standup)
**Purpose:** Synchronize team and plan next 24 hours

**Duration:** 15 minutes maximum

**Participants:** Development Team (Scrum Master and Product Owner optional)

**Three Questions:**
1. What did I accomplish yesterday?
2. What will I work on today?
3. What impediments are blocking me?

**In Jira:**
- Review active sprint board
- Update issue statuses
- Identify blocked items
- Assign new work

### Sprint Review
**Purpose:** Demonstrate completed work and gather feedback

**Duration:** 1-2 hours for 2-week sprint

**Participants:** Scrum Team plus stakeholders

**Activities:**
1. **Demo Completed Work**
   - Show working software/features
   - Demonstrate against acceptance criteria
   - Gather stakeholder feedback

2. **Review Sprint Metrics**
   - Velocity achieved
   - Burndown chart analysis
   - Completed vs planned work

**In Jira:**
- Review completed issues
- Generate sprint report
- Update product backlog based on feedback
- Close sprint and move incomplete items

### Sprint Retrospective
**Purpose:** Reflect on process and identify improvements

**Duration:** 1 hour for 2-week sprint

**Participants:** Scrum Team only

**Format:**
1. **What went well?** (Keep doing)
2. **What didn't go well?** (Stop doing)
3. **What should we try?** (Start doing)

**In Jira:**
- Review sprint metrics and reports
- Analyze team velocity trends
- Identify process improvements
- Create action items for next sprint

## Sprint Management in Jira

### Creating Sprints

#### Sprint Setup
1. Go to Backlog view
2. Click "Create sprint"
3. Configure sprint details:
   - **Sprint name**: Sprint 1, Sprint 2, etc.
   - **Duration**: 1-4 weeks (2 weeks recommended)
   - **Start date**: When sprint begins
   - **End date**: When sprint ends
   - **Goal**: Sprint objective

#### Adding Items to Sprint
1. Drag items from product backlog to sprint
2. Ensure team capacity isn't exceeded
3. Verify sprint goal is achievable
4. Start sprint when ready

### Sprint Execution

#### Active Sprint Board
- **Columns**: To Do, In Progress, Done (customizable)
- **Swimlanes**: Group by assignee, epic, or priority
- **Quick actions**: Update status, assign work, add comments
- **Burndown**: Real-time progress tracking

#### Daily Management
- Update issue statuses as work progresses
- Add comments and log time
- Create new tasks as needed
- Flag blockers and impediments

### Sprint Completion

#### Closing Sprint
1. Review incomplete items
2. Move unfinished work to backlog or next sprint
3. Complete sprint in Jira
4. Generate sprint report

#### Sprint Reports
- **Burndown Chart**: Work remaining over time
- **Velocity Chart**: Story points completed per sprint
- **Sprint Report**: Detailed completion summary
- **Control Chart**: Cycle time analysis

## Estimation and Velocity

### Story Point Estimation

#### Fibonacci Sequence
Common scale: 1, 2, 3, 5, 8, 13, 21, 34

**Guidelines:**
- **1 point**: Very small, simple task
- **2-3 points**: Small feature or bug fix
- **5-8 points**: Medium complexity story
- **13+ points**: Large story (consider breaking down)

#### Planning Poker
1. Product Owner reads story
2. Team discusses and asks questions
3. Each member privately selects estimate
4. Estimates revealed simultaneously
5. Discuss differences and re-estimate
6. Repeat until consensus

#### Relative Sizing
- Compare new stories to previously estimated ones
- Use reference stories as benchmarks
- Focus on relative effort, not absolute time
- Consider complexity, uncertainty, and effort

### Velocity Tracking

#### Calculating Velocity
- **Sprint Velocity**: Story points completed in single sprint
- **Average Velocity**: Mean over last 3-5 sprints
- **Velocity Trend**: Increasing, stable, or decreasing

#### Using Velocity for Planning
- **Sprint Planning**: Use average velocity to select work
- **Release Planning**: Estimate completion dates
- **Capacity Planning**: Understand team capability
- **Continuous Improvement**: Track velocity trends

**Example Velocity Calculation:**
```
Sprint 1: 23 points completed
Sprint 2: 27 points completed
Sprint 3: 25 points completed
Sprint 4: 29 points completed
Sprint 5: 26 points completed

Average Velocity: (23+27+25+29+26) ÷ 5 = 26 points per sprint
```

## Scrum Best Practices

### Team Practices
- **Consistent Sprint Length**: Use same duration for predictability
- **Definition of Done**: Clear criteria for completion
- **Cross-Training**: Share knowledge across team members
- **Continuous Integration**: Integrate work frequently

### Product Owner Practices
- **Available and Engaged**: Accessible for questions and decisions
- **Clear Priorities**: Maintain ordered product backlog
- **Acceptance Criteria**: Define clear requirements
- **Stakeholder Management**: Balance competing interests

### Scrum Master Practices
- **Servant Leadership**: Support team rather than direct
- **Impediment Removal**: Actively help overcome obstacles
- **Process Improvement**: Facilitate continuous improvement
- **Metrics Tracking**: Monitor and share team metrics

### Common Pitfalls to Avoid
- **Scope Creep**: Adding work mid-sprint
- **Overcommitment**: Taking on too much work
- **Skipping Ceremonies**: Missing important Scrum events
- **Lack of Definition of Done**: Unclear completion criteria
- **Poor Estimation**: Inconsistent or inaccurate estimates

Implementing Scrum methodology effectively in Jira requires understanding both the framework principles and the tool's capabilities. The next topic covers boards and workflow customization.
