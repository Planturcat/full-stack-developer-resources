# Reporting and Analytics

Jira's reporting capabilities provide insights into team performance, project progress, and process effectiveness. Understanding how to create and interpret reports is essential for data-driven project management.

## Built-in Reports Overview

### Agile Reports (Scrum Projects)

#### Burndown Chart
**Purpose:** Track sprint progress and predict completion

**Key Metrics:**
- **Remaining Work**: Story points or hours left
- **Ideal Burndown**: Perfect linear progress
- **Actual Burndown**: Real team progress
- **Scope Changes**: Work added/removed during sprint

**Interpretation:**
- **Above Ideal Line**: Behind schedule
- **Below Ideal Line**: Ahead of schedule
- **Flat Lines**: No progress periods
- **Scope Increases**: Work added mid-sprint

**Example Analysis:**
```
Sprint Burndown Insights:
- Started with 40 story points
- Scope increased by 8 points on day 3
- Team caught up by day 7
- Finished with 2 points remaining
- Conclusion: Good recovery, but scope management needed
```

#### Velocity Chart
**Purpose:** Measure team delivery rate over multiple sprints

**Key Metrics:**
- **Commitment**: Work planned for sprint
- **Completed**: Work actually finished
- **Average Velocity**: Mean completion rate
- **Velocity Trend**: Improving, stable, or declining

**Uses:**
- **Sprint Planning**: Estimate capacity for next sprint
- **Release Planning**: Predict completion dates
- **Team Performance**: Track improvement over time
- **Capacity Planning**: Understand team capabilities

#### Sprint Report
**Purpose:** Detailed analysis of sprint execution

**Information Included:**
- **Completed Issues**: Work finished during sprint
- **Incomplete Issues**: Work not finished
- **Added Issues**: Work added mid-sprint
- **Removed Issues**: Work removed from sprint
- **Time Tracking**: Hours logged vs estimated

**Key Insights:**
- Sprint goal achievement
- Scope management effectiveness
- Estimation accuracy
- Team focus and discipline

#### Epic Burndown
**Purpose:** Track progress on large initiatives over time

**Features:**
- **Epic Progress**: Completion percentage
- **Story Completion**: Individual story status
- **Timeline View**: Progress over multiple sprints
- **Scope Changes**: Epic scope modifications

### Kanban Reports

#### Cumulative Flow Diagram
**Purpose:** Visualize work distribution and flow efficiency

**Key Elements:**
- **Colored Bands**: Each status represented by color
- **Band Width**: Amount of work in each status
- **Flow Patterns**: Smooth vs choppy flow
- **Bottlenecks**: Where work accumulates

**Analysis:**
- **Smooth Flow**: Consistent band widths
- **Bottlenecks**: Widening bands indicate constraints
- **WIP Growth**: Increasing total work in progress
- **Cycle Time**: Horizontal distance through system

#### Control Chart
**Purpose:** Analyze cycle time and delivery predictability

**Metrics:**
- **Cycle Time**: Time from start to completion
- **Average Cycle Time**: Mean delivery time
- **Control Limits**: Statistical boundaries
- **Outliers**: Issues taking unusually long

**Uses:**
- **Predictability**: Estimate delivery times
- **Process Improvement**: Identify inefficiencies
- **SLA Management**: Meet service commitments
- **Capacity Planning**: Understand throughput

#### Velocity Chart (Kanban)
**Purpose:** Measure throughput over time

**Metrics:**
- **Issues Completed**: Number of items finished
- **Story Points**: Points completed per period
- **Throughput Trend**: Increasing, stable, or declining
- **Capacity**: Average completion rate

## Custom Reporting

### Creating Custom Dashboards

#### Dashboard Components
**Gadgets Available:**
- **Filter Results**: Show issues matching criteria
- **Pie Charts**: Distribution by field values
- **Activity Stream**: Recent project activity
- **Burndown Charts**: Sprint progress tracking
- **Two-Dimensional Filter**: Cross-tabulated data

#### Dashboard Creation Process
1. Go to "Dashboards" → "Create dashboard"
2. Configure dashboard:
   - **Name**: Descriptive title
   - **Description**: Purpose and audience
   - **Sharing**: Public or private access
3. Add gadgets:
   - Click "Add gadget"
   - Select gadget type
   - Configure settings
   - Position on dashboard

#### Example Dashboard Layouts

**Team Performance Dashboard:**
```
┌─────────────────┬─────────────────┐
│   Sprint        │   Velocity      │
│   Burndown      │   Chart         │
├─────────────────┼─────────────────┤
│   Issues by     │   Recent        │
│   Assignee      │   Activity      │
└─────────────────┴─────────────────┘
```

**Executive Summary Dashboard:**
```
┌─────────────────┬─────────────────┐
│   Project       │   Budget        │
│   Status        │   Tracking      │
├─────────────────┼─────────────────┤
│   Risk          │   Milestone     │
│   Assessment    │   Progress      │
└─────────────────┴─────────────────┘
```

### Advanced Filtering and JQL

#### JQL (Jira Query Language)
**Basic Syntax:**
```jql
field operator value
```

**Common Operators:**
- **=**: Equals
- **!=**: Not equals
- **IN**: In list
- **NOT IN**: Not in list
- **>**: Greater than
- **<**: Less than
- **~**: Contains text

#### Useful JQL Examples

**Team Performance Queries:**
```jql
# My open issues
assignee = currentUser() AND status != Done

# Overdue issues
due < now() AND status != Done

# High priority bugs
type = Bug AND priority = High

# Issues updated this week
updated >= startOfWeek()

# Sprint completion rate
sprint in closedSprints() AND resolved >= startOfSprint()
```

**Project Tracking Queries:**
```jql
# Epic progress
"Epic Link" = PROJ-123 AND status = Done

# Component health
component = "User Interface" AND type = Bug

# Release readiness
fixVersion = "2.1.0" AND status != Done

# Team workload
assignee in membersOf("development-team") AND status = "In Progress"
```

### Time Tracking and Reporting

#### Time Tracking Setup
1. Enable time tracking in project settings
2. Configure time tracking fields:
   - **Original Estimate**: Initial time estimate
   - **Remaining Estimate**: Time left to complete
   - **Time Spent**: Actual time logged

#### Logging Work
**Methods:**
- **Issue View**: Log work directly on issue
- **Tempo**: Advanced time tracking app
- **Bulk Update**: Log time for multiple issues
- **API Integration**: Automated time logging

#### Time Reports
**Built-in Time Reports:**
- **Time Tracking Report**: Detailed time analysis
- **User Workload Report**: Individual capacity
- **Time Since Issues Report**: Age analysis
- **Recently Created Issues Report**: New work tracking

## Key Performance Indicators (KPIs)

### Agile Metrics

#### Velocity Metrics
**Team Velocity:**
- **Definition**: Story points completed per sprint
- **Calculation**: Sum of completed story points
- **Target**: Stable or improving trend
- **Use**: Sprint planning and capacity estimation

**Velocity Consistency:**
- **Definition**: Variation in velocity between sprints
- **Calculation**: Standard deviation of velocity
- **Target**: Low variation (predictable delivery)
- **Use**: Process improvement and planning accuracy

#### Sprint Metrics
**Sprint Goal Achievement:**
- **Definition**: Percentage of sprint goals met
- **Calculation**: (Goals achieved / Total goals) × 100
- **Target**: >80% achievement rate
- **Use**: Team focus and planning effectiveness

**Scope Creep:**
- **Definition**: Work added during sprint
- **Calculation**: (Added points / Original points) × 100
- **Target**: <10% scope increase
- **Use**: Planning discipline and stakeholder management

### Quality Metrics

#### Defect Metrics
**Bug Rate:**
- **Definition**: Bugs per feature delivered
- **Calculation**: Bugs created / Stories completed
- **Target**: <0.2 bugs per story
- **Use**: Quality assessment and process improvement

**Defect Resolution Time:**
- **Definition**: Average time to fix bugs
- **Calculation**: Mean time from bug creation to resolution
- **Target**: <5 days for critical bugs
- **Use**: Support effectiveness and customer satisfaction

#### Rework Metrics
**Rework Rate:**
- **Definition**: Issues returned for additional work
- **Calculation**: (Reopened issues / Total completed) × 100
- **Target**: <5% rework rate
- **Use**: Quality of initial work and definition clarity

### Flow Metrics

#### Cycle Time
**Definition:** Time from work start to completion
**Measurement:** Days from "In Progress" to "Done"
**Targets:**
- **Stories**: 3-5 days average
- **Tasks**: 1-2 days average
- **Bugs**: 1-3 days average

#### Lead Time
**Definition:** Time from request to delivery
**Measurement:** Days from "Created" to "Done"
**Use:** Customer expectation management

#### Throughput
**Definition:** Work items completed per time period
**Measurement:** Issues completed per week/sprint
**Use:** Capacity planning and forecasting

## Report Interpretation and Action

### Trend Analysis

#### Identifying Patterns
**Positive Trends:**
- Increasing velocity over time
- Decreasing cycle time
- Improving quality metrics
- Stable team performance

**Negative Trends:**
- Declining velocity
- Increasing defect rates
- Growing cycle times
- High scope creep

#### Root Cause Analysis
**Performance Issues:**
1. **Identify**: What metric is declining?
2. **Investigate**: What changed recently?
3. **Analyze**: What are potential causes?
4. **Test**: Implement small improvements
5. **Measure**: Track impact of changes

### Actionable Insights

#### Team Performance
**Low Velocity Indicators:**
- **Cause**: Overcommitment, technical debt, external dependencies
- **Action**: Reduce sprint scope, address technical debt, improve planning

**High Cycle Time:**
- **Cause**: Bottlenecks, complex work, insufficient skills
- **Action**: Identify constraints, simplify processes, provide training

#### Process Improvement
**High Scope Creep:**
- **Cause**: Poor planning, changing requirements, stakeholder pressure
- **Action**: Better backlog refinement, stakeholder education, change control

**Quality Issues:**
- **Cause**: Insufficient testing, unclear requirements, time pressure
- **Action**: Improve definition of done, add quality gates, adjust timelines

### Reporting Best Practices

#### Report Design
- **Audience-Specific**: Tailor to viewer needs
- **Clear Visualization**: Easy to understand charts
- **Actionable Data**: Focus on metrics that drive decisions
- **Regular Updates**: Keep data current and relevant

#### Communication
- **Context**: Explain what metrics mean
- **Trends**: Show changes over time
- **Actions**: Recommend specific improvements
- **Follow-up**: Track improvement initiatives

#### Data Quality
- **Accurate Input**: Ensure team updates issues properly
- **Consistent Definitions**: Standardize metric calculations
- **Regular Audits**: Verify data accuracy
- **Training**: Educate team on proper usage

Effective reporting and analytics enable data-driven decision making and continuous improvement. The next topic covers integrations and automation to enhance Jira's capabilities.
