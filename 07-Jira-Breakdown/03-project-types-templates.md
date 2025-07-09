# Project Types and Templates

Understanding different project types and templates is crucial for setting up Jira projects that match your team's workflow and methodology.

## Overview of Project Types

Jira offers several project templates designed for different work styles and team needs. Choosing the right template sets up appropriate issue types, workflows, and boards for your specific use case.

### Software Development Projects

#### Scrum Template
**Best For:** Teams that work in planned iterations (sprints)

**Key Features:**
- **Sprint planning**: Plan work in 1-4 week iterations
- **Backlog management**: Prioritized list of work
- **Burndown charts**: Track sprint progress
- **Velocity tracking**: Measure team delivery rate

**Default Issue Types:**
- **Epic**: Large feature or initiative
- **Story**: User-focused requirement
- **Task**: Technical work item
- **Bug**: Defect or problem
- **Subtask**: Breakdown of larger items

**Default Workflow:**
```
To Do → In Progress → Done
```

**Board Configuration:**
- **Scrum board**: Shows current sprint work
- **Backlog view**: For planning and prioritization
- **Sprint management**: Start/complete sprints

#### Kanban Template
**Best For:** Teams with continuous flow of work

**Key Features:**
- **Continuous flow**: No fixed iterations
- **Work in progress limits**: Control flow efficiency
- **Cumulative flow diagrams**: Visualize work distribution
- **Cycle time tracking**: Measure delivery speed

**Default Issue Types:**
- **Epic**: Large feature or initiative
- **Story**: User-focused requirement
- **Task**: Work item
- **Bug**: Defect or problem

**Default Workflow:**
```
To Do → In Progress → Done
```

**Board Configuration:**
- **Kanban board**: Continuous flow visualization
- **WIP limits**: Configurable per column
- **Swimlanes**: Group by assignee, priority, etc.

#### Bug Tracking Template
**Best For:** Teams focused on issue resolution and maintenance

**Key Features:**
- **Issue prioritization**: Critical, high, medium, low
- **Resolution tracking**: Fixed, won't fix, duplicate, etc.
- **Component management**: Organize by system areas
- **Version tracking**: Link issues to releases

**Default Issue Types:**
- **Bug**: Primary issue type for defects
- **Task**: General work items
- **Subtask**: Breakdown of larger work

**Default Workflow:**
```
Open → In Progress → Resolved → Closed
```

### Business Project Templates

#### Task Management Template
**Best For:** General business projects and non-software teams

**Key Features:**
- **Simple workflow**: Straightforward task progression
- **Flexible issue types**: Adaptable to various work types
- **Basic reporting**: Progress and completion tracking
- **Team collaboration**: Comments and file sharing

**Default Issue Types:**
- **Task**: Primary work item
- **Subtask**: Breakdown of tasks
- **Epic**: Large initiative (optional)

**Default Workflow:**
```
To Do → In Progress → Done
```

#### Project Management Template
**Best For:** Traditional project management with phases and milestones

**Key Features:**
- **Phase management**: Organize work by project phases
- **Milestone tracking**: Key project deliverables
- **Resource planning**: Assign team members and track capacity
- **Timeline view**: Gantt-style project visualization

**Default Issue Types:**
- **Epic**: Project phase or major deliverable
- **Task**: Specific work item
- **Subtask**: Detailed activities

**Default Workflow:**
```
To Do → In Progress → Review → Done
```

## Choosing the Right Template

### Decision Matrix

| Project Characteristic | Recommended Template |
|------------------------|---------------------|
| **Software development with sprints** | Scrum |
| **Continuous software delivery** | Kanban |
| **Bug fixes and maintenance** | Bug Tracking |
| **Marketing campaigns** | Task Management |
| **Product launches** | Project Management |
| **Research projects** | Kanban or Task Management |
| **Event planning** | Project Management |

### Questions to Ask

#### Work Style Questions
1. **Do you work in fixed time periods (sprints)?** → Scrum
2. **Do you have continuous flow of work?** → Kanban
3. **Is your work primarily fixing issues?** → Bug Tracking
4. **Do you need traditional project phases?** → Project Management

#### Team Questions
1. **Is your team familiar with Agile?** → Scrum/Kanban
2. **Does your team prefer simple workflows?** → Task Management
3. **Do you need detailed project planning?** → Project Management
4. **Is your team distributed or co-located?** → Any (with appropriate configuration)

#### Organizational Questions
1. **What methodology does your organization use?** → Match template to methodology
2. **Do you need integration with development tools?** → Software templates
3. **Are there compliance requirements?** → Consider workflow complexity
4. **What reporting is required?** → Templates with appropriate analytics

## Template Customization

### Modifying Issue Types

#### Adding Custom Issue Types
1. Go to Project Settings → "Issue types"
2. Click "Add issue type"
3. Configure:
   - **Name**: Descriptive name (e.g., "Research Task")
   - **Description**: Purpose and usage
   - **Icon**: Visual identifier
   - **Type**: Standard or subtask

#### Common Custom Issue Types
- **Research**: Investigation or analysis work
- **Spike**: Technical exploration or proof of concept
- **Improvement**: Enhancement to existing functionality
- **Documentation**: Writing or updating documentation
- **Training**: Learning or knowledge transfer activities

### Workflow Customization

#### Basic Workflow Modifications
1. Go to Project Settings → "Workflows"
2. Edit existing workflow or create new one
3. Add/modify statuses:
   - **In Review**: For peer review or approval
   - **Testing**: For quality assurance
   - **Blocked**: For work that cannot proceed
   - **On Hold**: For temporarily paused work

#### Example Custom Workflows

**Software Development Workflow:**
```
To Do → In Progress → Code Review → Testing → Done
```

**Content Creation Workflow:**
```
To Do → Draft → Review → Approved → Published
```

**Marketing Campaign Workflow:**
```
Planning → Design → Review → Approved → Launched → Analyzed
```

### Field Customization

#### Adding Custom Fields
1. Go to Project Settings → "Fields"
2. Click "Add field"
3. Choose field type:
   - **Text**: Short descriptions or identifiers
   - **Number**: Estimates, scores, or quantities
   - **Date**: Deadlines or milestones
   - **Select**: Predefined options
   - **Multi-select**: Multiple choice options

#### Common Custom Fields
- **Business Value**: Priority scoring
- **Effort Estimate**: Time or complexity estimate
- **Department**: Organizational unit
- **Customer**: External stakeholder
- **Release Version**: Target release

## Project Configuration Best Practices

### Initial Setup Guidelines

#### Start Simple
- Begin with default template configuration
- Add complexity gradually as team adapts
- Focus on essential fields and workflows
- Avoid over-customization initially

#### Team Involvement
- Include team members in configuration decisions
- Test workflows with sample issues
- Gather feedback before finalizing setup
- Provide training on new configurations

#### Documentation
- Document custom fields and their purposes
- Explain workflow transitions and requirements
- Create guidelines for issue creation
- Maintain configuration change log

### Common Configuration Mistakes

#### Over-Customization
- **Problem**: Too many custom fields and complex workflows
- **Solution**: Start minimal and add only necessary customizations
- **Impact**: Confusion and reduced adoption

#### Inconsistent Naming
- **Problem**: Similar fields with different names across projects
- **Solution**: Establish naming conventions organization-wide
- **Impact**: Reporting difficulties and user confusion

#### Complex Workflows
- **Problem**: Too many statuses and transitions
- **Solution**: Keep workflows simple and intuitive
- **Impact**: Slower work progression and user frustration

#### Missing Training
- **Problem**: Team doesn't understand new configuration
- **Solution**: Provide training and documentation
- **Impact**: Poor adoption and incorrect usage

## Template Migration and Evolution

### Changing Project Templates

#### Template Switching Process
1. **Assess current configuration**: Document existing setup
2. **Plan migration**: Identify what needs to change
3. **Test in sandbox**: Try new template with sample data
4. **Communicate changes**: Inform team of upcoming changes
5. **Execute migration**: Apply new template configuration
6. **Monitor adoption**: Ensure team adapts successfully

#### Data Preservation
- **Issues**: All existing issues remain
- **History**: Complete audit trail preserved
- **Attachments**: Files and comments maintained
- **Custom fields**: May need remapping

### Evolving Project Configuration

#### Regular Review Process
1. **Monthly assessment**: Review workflow effectiveness
2. **Team feedback**: Gather user experience input
3. **Metrics analysis**: Examine productivity and flow metrics
4. **Incremental improvements**: Make small, targeted changes

#### Scaling Considerations
- **Team growth**: Adjust permissions and roles
- **Process maturity**: Add sophistication gradually
- **Integration needs**: Connect with additional tools
- **Reporting requirements**: Enhance analytics capabilities

## Multi-Project Strategies

### Project Hierarchy

#### Program Management
```
Program: Digital Transformation
├── Project: Website Redesign
├── Project: Mobile App Development
└── Project: Customer Portal
```

#### Portfolio View
- **Cross-project reporting**: Aggregate metrics
- **Resource management**: Track team allocation
- **Dependency tracking**: Inter-project relationships
- **Strategic alignment**: Link to business objectives

### Standardization vs Flexibility

#### When to Standardize
- **Common processes**: Similar work across teams
- **Reporting needs**: Consistent metrics required
- **Compliance**: Regulatory or audit requirements
- **Training efficiency**: Reduce learning curve

#### When to Customize
- **Unique workflows**: Specialized team processes
- **Different methodologies**: Agile vs traditional
- **Tool integrations**: Specific technical requirements
- **Cultural fit**: Match organizational practices

Understanding project types and templates enables you to set up Jira projects that truly support your team's way of working. The next topic covers issues and workflow management in detail.
