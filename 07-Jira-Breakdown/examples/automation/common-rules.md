# Common Automation Rules

This document provides examples of frequently used automation rules that can improve team productivity and ensure consistent processes.

## Issue Management Automation

### Auto-Assignment Rules

#### Rule 1: Auto-assign Bugs to QA Lead
**Purpose:** Ensure all bugs are immediately assigned for triage

**Configuration:**
```
Trigger: Issue Created
Conditions: 
  - Issue Type = Bug
Actions:
  - Assign issue to QA Lead
  - Add comment: "Bug automatically assigned to QA Lead for triage"
```

**Benefits:**
- Immediate bug ownership
- Consistent triage process
- No bugs left unassigned

#### Rule 2: Auto-assign Stories to Product Owner
**Purpose:** Ensure Product Owner reviews all new stories

**Configuration:**
```
Trigger: Issue Created
Conditions:
  - Issue Type = Story
  - Reporter != Product Owner
Actions:
  - Assign issue to Product Owner
  - Add comment: "Story assigned to Product Owner for review and acceptance criteria"
```

### Status Transition Automation

#### Rule 3: Auto-transition to Testing
**Purpose:** Move completed development work to testing automatically

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - From Status = In Progress
  - To Status = Done
  - Issue Type in (Story, Task)
Actions:
  - Transition issue to Testing
  - Assign to QA Engineer
  - Add comment: "Development complete, moved to testing"
```

#### Rule 4: Auto-close Resolved Issues
**Purpose:** Close issues that have been resolved for 7 days

**Configuration:**
```
Trigger: Scheduled (Daily at 9:00 AM)
Conditions:
  - Status = Resolved
  - Resolved date < -7d
Actions:
  - Transition issue to Closed
  - Add comment: "Automatically closed after 7 days in resolved status"
```

## Sprint Management Automation

### Sprint Planning Automation

#### Rule 5: Sprint Start Notifications
**Purpose:** Notify team when sprint starts

**Configuration:**
```
Trigger: Sprint Started
Actions:
  - Send email to project team
  - Create announcement in Slack channel
  - Add comment to sprint issues: "Sprint {{sprint.name}} has started"
```

**Email Template:**
```
Subject: Sprint {{sprint.name}} Started
Body: 
Hello Team,

Sprint {{sprint.name}} has officially started!

Sprint Goal: {{sprint.goal}}
Sprint Duration: {{sprint.startDate}} to {{sprint.endDate}}
Committed Story Points: {{sprint.storyPoints}}

Please update your issue statuses daily and attend the daily standup.

Best regards,
Jira Automation
```

#### Rule 6: Sprint Cleanup
**Purpose:** Clean up incomplete issues when sprint ends

**Configuration:**
```
Trigger: Sprint Completed
Conditions:
  - Issue Status != Done
Actions:
  - Move issue to next sprint (if exists)
  - Add comment: "Moved from {{sprint.previousName}} to {{sprint.currentName}}"
  - Add label: "carried-over"
```

### Backlog Management

#### Rule 7: Epic Progress Updates
**Purpose:** Update epic description with completion percentage

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - To Status = Done
  - Epic Link is not empty
Actions:
  - Update Epic description with progress percentage
  - Add comment to Epic: "Story {{issue.key}} completed. Epic is now {{epic.percentComplete}}% complete"
```

**Smart Value for Progress:**
```
Epic Progress: {{#epic.issues}}{{#if(equals(fields.status.name, "Done"))}}1{{else}}0{{/}}{{/}}{{/epic.issues}} of {{epic.issues.size}} stories completed ({{epic.percentComplete}}%)
```

## Quality Assurance Automation

### Bug Management

#### Rule 8: Critical Bug Escalation
**Purpose:** Escalate critical bugs that remain unresolved

**Configuration:**
```
Trigger: Scheduled (Every 4 hours)
Conditions:
  - Issue Type = Bug
  - Priority = Critical
  - Status != Resolved
  - Created > 24h ago
Actions:
  - Send email to Development Manager
  - Add comment: "Critical bug escalated due to age"
  - Add label: "escalated"
```

#### Rule 9: Bug Verification Reminder
**Purpose:** Remind QA to verify resolved bugs

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - To Status = Resolved
  - Issue Type = Bug
Actions:
  - Assign to Reporter (if QA team member)
  - Add comment: "Please verify this bug fix and close if resolved"
  - Set due date to +2 days
```

### Code Review Automation

#### Rule 10: Code Review Assignment
**Purpose:** Assign code reviews based on component

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - To Status = Code Review
  - Component = Frontend
Actions:
  - Assign to Frontend Lead
  - Add comment: "Code review assigned to Frontend Lead"
  - Send Slack notification to #frontend-team
```

## Communication Automation

### Stakeholder Notifications

#### Rule 11: Epic Completion Notification
**Purpose:** Notify stakeholders when epics are completed

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - Issue Type = Epic
  - To Status = Done
Actions:
  - Send email to stakeholder group
  - Create Confluence page with epic summary
  - Add comment: "Epic completed and stakeholders notified"
```

**Email Template:**
```
Subject: Epic Completed: {{issue.summary}}
Body:
Dear Stakeholders,

We're pleased to announce that Epic "{{issue.summary}}" has been completed!

Epic Details:
- Key: {{issue.key}}
- Completion Date: {{now}}
- Stories Delivered: {{epic.storiesCompleted}}
- Business Value: {{issue.customfield_businessvalue}}

The features are now available in the latest release.

Best regards,
{{trigger.user.displayName}}
```

#### Rule 12: Release Notes Generation
**Purpose:** Automatically generate release notes from completed issues

**Configuration:**
```
Trigger: Version Released
Actions:
  - Create Confluence page with release notes
  - Send email to all users
  - Update project dashboard
```

**Release Notes Template:**
```
# Release {{version.name}} - {{now.format("MMMM dd, yyyy")}}

## New Features
{{#version.issues}}
{{#if(equals(fields.issuetype.name, "Story"))}}
- {{fields.summary}} ({{key}})
{{/}}
{{/version.issues}}

## Bug Fixes
{{#version.issues}}
{{#if(equals(fields.issuetype.name, "Bug"))}}
- {{fields.summary}} ({{key}})
{{/}}
{{/version.issues}}

## Technical Improvements
{{#version.issues}}
{{#if(equals(fields.issuetype.name, "Task"))}}
- {{fields.summary}} ({{key}})
{{/}}
{{/version.issues}}
```

## Time Tracking Automation

### Work Logging

#### Rule 13: Automatic Time Logging
**Purpose:** Log time when issues are transitioned

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - From Status = In Progress
  - To Status in (Done, Code Review, Testing)
Actions:
  - Log work: 4 hours (default estimate)
  - Add comment: "Time automatically logged based on status transition"
```

#### Rule 14: Time Tracking Reminders
**Purpose:** Remind team to log time daily

**Configuration:**
```
Trigger: Scheduled (Daily at 5:00 PM)
Conditions:
  - Assignee = current user
  - Status = In Progress
  - Work logged today = 0
Actions:
  - Send email reminder to log time
  - Add comment: "Reminder: Please log your time for today"
```

## Project Management Automation

### Milestone Tracking

#### Rule 15: Milestone Progress Updates
**Purpose:** Update milestone progress automatically

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - To Status = Done
  - Fix Version is not empty
Actions:
  - Update milestone dashboard
  - Calculate completion percentage
  - Send progress update to project manager
```

#### Rule 16: Overdue Issue Alerts
**Purpose:** Alert team about overdue issues

**Configuration:**
```
Trigger: Scheduled (Daily at 9:00 AM)
Conditions:
  - Due Date < now()
  - Status != Done
Actions:
  - Send email to assignee and manager
  - Add comment: "This issue is overdue"
  - Set priority to High (if not already)
```

## Advanced Automation Patterns

### Conditional Logic Example

#### Rule 17: Smart Bug Assignment
**Purpose:** Assign bugs based on component and severity

**Configuration:**
```
Trigger: Issue Created
Conditions:
  - Issue Type = Bug
Actions:
  - IF Component = "Frontend" AND Priority = Critical
    THEN Assign to Frontend Lead
  - ELSE IF Component = "Backend" AND Priority = Critical  
    THEN Assign to Backend Lead
  - ELSE IF Priority in (High, Critical)
    THEN Assign to Development Manager
  - ELSE
    THEN Assign to QA Lead
```

### Multi-Step Automation

#### Rule 18: Feature Completion Workflow
**Purpose:** Complete workflow when all epic stories are done

**Configuration:**
```
Trigger: Issue Transitioned
Conditions:
  - Issue Type = Story
  - To Status = Done
  - Epic Link is not empty
Actions:
  - Check if all epic stories are complete
  - IF all stories complete:
    - Transition epic to Done
    - Send completion notification
    - Create release planning task
    - Update roadmap dashboard
```

## Automation Best Practices

### Rule Design Guidelines
1. **Single Purpose:** Each rule should have one clear objective
2. **Clear Naming:** Use descriptive rule names
3. **Documentation:** Add comments explaining rule purpose
4. **Testing:** Test rules in non-production environment first
5. **Monitoring:** Regularly review rule execution logs

### Performance Considerations
- **Limit Frequency:** Avoid too many scheduled rules
- **Efficient Conditions:** Use specific conditions to reduce processing
- **Batch Operations:** Group related actions together
- **Error Handling:** Include fallback actions for failures

### Maintenance Schedule
- **Weekly:** Review rule execution logs
- **Monthly:** Analyze rule effectiveness and usage
- **Quarterly:** Update rules based on process changes
- **Annually:** Complete rule audit and cleanup

These automation examples demonstrate how to streamline common Jira workflows and improve team productivity through intelligent automation.
