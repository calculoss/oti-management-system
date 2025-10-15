# OTI Management System - Requirements Specification

## Executive Summary

This system addresses the "black hole" problem of the previous Ideas process by providing transparency and visibility into the Operational Technology Initiatives (OTI) pipeline for Lake Macquarie City Council's IT department.

## Problem Statement

The previous "Ideas" system lacked:
- Understanding of current state of individual initiatives
- Universal view of the overall pipeline
- Visibility into bottlenecks and stalled items
- Metrics to assess departmental performance
- Clear accountability and progress tracking

## Solution Goals

1. **Transparency**: Clear visibility of individual OTI status and overall pipeline health
2. **Accountability**: Track ownership, progress, and blockers
3. **Performance Insight**: Metrics to understand where the department excels or struggles
4. **Early Warning System**: Identify stalled OTIs and bottlenecks before they become critical
5. **Continuous Improvement**: Trend analysis to show if processes are improving

---

## Phase 1: Core Prototype Features

### 1. OTI Data Management

#### 1.1 Core OTI Record Structure
```json
{
  "id": "OTI-2025-001",
  "title": "SharePoint Integration for HR System",
  "description": "Full description of the initiative",
  "otiType": "system-enhancement",
  "priority": "high",
  "status": "in-progress",
  "requestor": {
    "name": "John Smith",
    "email": "jsmith@lakemac.nsw.gov.au",
    "department": "Human Resources"
  },
  "leadTeam": "Apps & Dev",
  "leadCoordinator": "Jane Doe",
  "supportingTeams": ["Cyber", "IT Support"],
  "dateSubmitted": "2025-01-15",
  "targetCompletionDate": "2025-02-14",
  "actualCompletionDate": null,
  "progressPercentage": 45,
  "businessJustification": "Reduces manual data entry by 20 hours per week",
  "escalationNotes": [],
  "serviceNowParentId": "INC0012345",
  "taskIds": ["TASK-001", "TASK-002"],
  "statusHistory": [
    {"status": "received", "date": "2025-01-15", "notes": "Initial assessment"},
    {"status": "in-progress", "date": "2025-01-18", "notes": "Tasks assigned to teams"}
  ]
}
```

#### 1.2 OTI Type Configuration
```json
{
  "otiTypes": [
    {
      "id": "software-purchase",
      "name": "Software Purchase & Setup",
      "leadTeam": "Apps & Dev",
      "supportingTeams": ["Cyber", "Apps & Dev", "IT Support"],
      "standardTasks": [
        {
          "name": "Requirements validation",
          "team": "Apps & Dev",
          "sequence": 1
        },
        {
          "name": "Cyber security assessment",
          "team": "Cyber",
          "sequence": 2
        },
        {
          "name": "Installation",
          "team": "Apps & Dev",
          "sequence": 3
        },
        {
          "name": "User setup",
          "team": "IT Support",
          "sequence": 4
        }
      ],
      "targetDays": {
        "urgent": 5,
        "high": 20,
        "medium": 30,
        "low": 60
      }
    },
    {
      "id": "system-enhancement",
      "name": "System Enhancement",
      "leadTeam": "Apps & Dev",
      "supportingTeams": ["Apps & Dev", "SME", "IT Support"],
      "standardTasks": [
        {"name": "Requirements gathering", "team": "Apps & Dev", "sequence": 1},
        {"name": "Development", "team": "Apps & Dev", "sequence": 2},
        {"name": "Testing", "team": "SME", "sequence": 3},
        {"name": "Deployment", "team": "IT Support", "sequence": 4}
      ]
    },
    {
      "id": "data-reporting",
      "name": "Data & Reporting Solutions",
      "leadTeam": "Data Team",
      "supportingTeams": ["Data Team", "Apps & Dev"]
    },
    {
      "id": "website-digital",
      "name": "Website & Digital Updates",
      "leadTeam": "Web Development",
      "supportingTeams": ["Web Development", "Cyber", "Apps & Dev"]
    },
    {
      "id": "hardware-equipment",
      "name": "IT Hardware & Equipment",
      "leadTeam": "Infrastructure",
      "supportingTeams": ["Infrastructure", "Cyber", "IT Support"]
    },
    {
      "id": "ai-solutions",
      "name": "AI Solutions Request",
      "leadTeam": "Apps & Dev",
      "supportingTeams": ["Apps & Dev", "Business Area", "IT Support", "Infrastructure"]
    },
    {
      "id": "process-automation",
      "name": "Process Automation",
      "leadTeam": "Apps & Dev",
      "supportingTeams": ["Apps & Dev", "Data", "Infrastructure", "Cyber", "SME", "IT Support"]
    },
    {
      "id": "spatial-gis",
      "name": "Spatial Solutions & Analysis (GIS)",
      "leadTeam": "GIS Team",
      "supportingTeams": ["GIS Team", "Data Team"]
    },
    {
      "id": "professional-services",
      "name": "Professional Services & Advisory",
      "leadTeam": "Digital Solutions",
      "supportingTeams": ["Digital Solutions (BA)", "Relevant Technical Area"]
    },
    {
      "id": "custom-solution",
      "name": "Custom Solution",
      "leadTeam": "Digital Solutions",
      "supportingTeams": ["All Team Leads", "Digital Solutions (BA)", "PMO"]
    }
  ]
}
```

#### 1.3 Priority and Status Definitions

**Priorities:**
- **Urgent**: Target 5 business days
  - System failures affecting operations
  - Compliance/security with deadlines
  - Director-level requests with justification
  
- **High**: Target 20 business days
  - Efficiency improvements with measurable impact
  - Customer service enhancements
  - Process automation with clear ROI
  
- **Medium**: Target 30 business days
  - General system enhancements
  - Reporting and analytics
  - Standard software implementations
  
- **Low**: Target 60 business days
  - Nice-to-have improvements
  - Exploratory/pilot projects
  - Non-urgent equipment purchases

**Statuses:**
- **Received**: Initial submission, under assessment by BA
- **In Progress**: Tasks assigned, work commenced
- **Stalled**: One or more tasks cannot proceed (triggers escalation)
- **Done**: All tasks completed, solution delivered

---

### 2. Dashboard & Metrics

#### 2.1 Pipeline Overview (Top of Dashboard)

**Key Metrics Cards:**
- Total Active OTIs
- Urgent Items Requiring Attention
- Average Time to Completion (last 30 days)
- On-Time Completion Rate

**Visual Pipeline Status:**
- Funnel/Sankey diagram showing flow: Received → In Progress → Done
- Count and percentage in each status
- Highlight stalled items in red

#### 2.2 Health Metrics

**Bottleneck Analysis:**
- OTIs by status (pie/donut chart)
- Time spent in each status (bar chart showing average days)
- Stalled OTIs (table with days stalled, escalation status)
- OTIs exceeding target dates (grouped by priority)

**Team Performance:**
- OTIs by lead team (bar chart)
- Average completion time by team
- Team capacity view (active OTIs per team)

**Trend Analysis:**
- Completion rate over time (line chart, last 6 months)
- Volume of new OTIs vs completions (dual-axis chart)
- Average time to completion trend (improving/declining indicator)

#### 2.3 OTI Type Analysis
- Distribution of OTIs by type (bar chart)
- Average completion time by type
- Success rate by type
- Identification of problematic types

#### 2.4 Priority Analysis
- Distribution by priority
- Adherence to target timeframes
- Escalation frequency by priority

---

### 3. OTI Management Interface

#### 3.1 OTI List View
**Table with columns:**
- ID (clickable)
- Title
- Type (with icon/color coding)
- Priority (with visual indicator: Urgent=red, High=orange, Medium=yellow, Low=green)
- Status (with status badge)
- Lead Team
- Days Active
- Progress (percentage bar)
- Target Date (with overdue indicator)

**Filtering & Sorting:**
- Filter by: Status, Priority, Type, Lead Team, Overdue
- Sort by: Date, Priority, Progress, Days Active
- Search by: Title, ID, Requestor

**Quick Actions:**
- Add New OTI
- Export to CSV
- Bulk status update

#### 3.2 OTI Detail View
**Header:**
- ID, Title, Type badge, Priority indicator, Status badge
- Quick actions: Edit, Add Note, Change Status, Escalate

**Main Information:**
- Full description
- Business justification
- Requestor details
- Lead team & coordinator
- Supporting teams
- Dates: Submitted, Target, Actual completion

**Progress Section:**
- Progress percentage (visual progress bar)
- Link to ServiceNow parent record
- Task summary (count completed/total, link to ServiceNow for details)

**Timeline/History:**
- Status changes with dates and notes
- Escalation history
- Key milestones

**Notes/Comments:**
- Chronological list of notes
- Ability to add new notes with timestamp

#### 3.3 Add/Edit OTI Form
**Step 1: Basic Information**
- Title (required)
- Description (rich text)
- OTI Type (dropdown, required)
- Priority (dropdown, required)

**Step 2: Requestor & Teams**
- Requestor name, email, department
- Lead team (auto-populated from type, editable)
- Lead coordinator (dropdown of team members)
- Supporting teams (multi-select, pre-populated from type, editable)

**Step 3: Business Context**
- Business justification (textarea)
- Expected benefits
- Dependencies/constraints

**Step 4: ServiceNow Integration**
- ServiceNow parent ID (optional)
- Task IDs (optional, comma-separated)

**Validation:**
- Required fields highlighted
- Auto-calculate target completion date based on priority
- Confirm before saving

#### 3.4 OTI Type Management
**Configuration Interface:**
- List of 10 OTI types
- Edit type details:
  - Name
  - Lead team
  - Supporting teams (multi-select)
  - Standard tasks (table: name, team, sequence)
  - Target days by priority
- Add/remove/reorder standard tasks
- Save configuration (updates JSON)

---

### 4. Data Structure & Storage

#### 4.1 JSON Files
```
/data
  /otis
    - otis.json (array of all OTI records)
  /config
    - oti-types.json (OTI type definitions)
    - teams.json (list of teams and members)
    - priorities.json (priority definitions and targets)
  /archive
    - completed-otis-2024.json
    - completed-otis-2025.json
```

#### 4.2 Data Operations
- **Load**: Read JSON files on app initialization
- **Save**: Write to JSON files on any create/update/delete
- **Backup**: Automatic backup before any write operation
- **Archive**: Move completed OTIs to archive file at year-end

#### 4.3 Migration Path
Design data structure to easily migrate to:
- PostgreSQL database
- SharePoint list (read/write via API)
- MongoDB
- Internal council database

**Migration considerations:**
- Use IDs that will work as database primary keys
- Date format compatible with SQL
- Normalize data structure for relational databases
- JSON structure can flatten to database tables

---

### 5. Technical Architecture

#### 5.1 Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+
  - No React (due to security restrictions)
  - Modern JavaScript with modules
  - CSS Grid and Flexbox for layout
  
- **Data Visualization**: D3.js v7
  - Interactive charts
  - Custom visualizations for pipeline flow
  - Responsive and accessible
  
- **UI Framework**: Minimal custom CSS
  - Design tokens matching Lake Macquarie brand
  - Responsive design (mobile-friendly)
  - Accessibility (WCAG 2.1 AA compliant)
  
- **Data Storage**: Local JSON files
  - Simple file-based storage for prototype
  - Easy to migrate to database later

#### 5.2 File Structure
```
/oti-management-system
  /index.html                  # Main application
  /css
    - styles.css               # Global styles
    - dashboard.css            # Dashboard specific
    - oti-list.css             # OTI list view
    - oti-detail.css           # OTI detail view
    - charts.css               # Chart styling
  /js
    - app.js                   # Main application logic
    - data-manager.js          # JSON data operations
    - oti-service.js           # OTI CRUD operations
    - chart-service.js         # D3.js chart rendering
    - dashboard.js             # Dashboard logic
    - oti-list.js              # OTI list view logic
    - oti-detail.js            # OTI detail view logic
    - utils.js                 # Utility functions
  /data
    /otis
      - otis.json
    /config
      - oti-types.json
      - teams.json
      - priorities.json
    /archive
  /assets
    /icons
    /images
  /lib
    - d3.v7.min.js
```

#### 5.3 Application Flow
1. **Initialization**
   - Load JSON data files
   - Parse and validate data
   - Initialize D3.js
   - Render dashboard

2. **Navigation**
   - Single-page application (SPA) pattern
   - Client-side routing (hash-based)
   - Views: Dashboard, OTI List, OTI Detail, Config

3. **Data Flow**
   - User action → Event handler → Service method → Data manager → JSON file
   - JSON file → Data manager → Service method → UI update

#### 5.4 Brand Compliance
Use Lake Macquarie City Council brand guidelines:
- **Primary Colors**: Light Blue (#009BDB), Dark Blue (#3F457E)
- **Typography**: Shentox (headings), Fira Sans (body)
- **Design Patterns**: Modern, clean, accessible

---

### 6. Key Features Detail

#### 6.1 Stalled OTI Detection
**Logic:**
- OTI marked "Stalled" by coordinator
- Or automatically if:
  - In Progress for > 1.5x target timeframe with <50% progress
  - No status updates for 14 days
  
**Alerts:**
- Red indicator on dashboard
- Stalled OTIs section with escalation actions
- Notification logic (future: email alerts)

#### 6.2 Progress Calculation
**Automatic Calculation:**
- Based on task completion from ServiceNow
- If no task data: manual entry by coordinator
- Progress bar visual with percentage
- Color coding: Green >75%, Yellow 50-75%, Orange 25-50%, Red <25%

#### 6.3 Target Date Calculation
**Auto-calculated on creation:**
- Urgent: +5 business days
- High: +20 business days
- Medium: +30 business days
- Low: +60 business days

**Business days logic:**
- Exclude weekends
- Exclude Australian public holidays
- Exclude Lake Macquarie closure days

#### 6.4 Metrics Calculation
**Completion Rate:**
```
On-time completion rate = (OTIs completed by target date / Total completed) × 100
```

**Average Time:**
```
Average completion time = Sum(actual completion date - submission date) / Count
```

**Trend Analysis:**
- Rolling 30-day average
- Month-over-month comparison
- Year-over-year comparison

---

### 7. AI Development Task Tracking

Following the snarktank/ai-dev-tasks methodology:

#### 7.1 Task Structure
```markdown
# OTI Management System - Development Tasks

## Project Context
Building an OTI Management System for Lake Macquarie City Council IT department to replace the "Ideas" black hole with transparent pipeline management.

## Current Status
- [x] Requirements specification complete
- [ ] Initial prototype setup
- [ ] Data structure implementation
- [ ] Dashboard development
- [ ] OTI management interface
- [ ] Analytics and reporting

## Task List

### Phase 1: Foundation
- [ ] TASK-001: Setup project structure and files
- [ ] TASK-002: Implement data manager for JSON operations
- [ ] TASK-003: Create sample data files
- [ ] TASK-004: Build basic HTML structure

### Phase 2: Core OTI Management
- [ ] TASK-005: Implement OTI service (CRUD operations)
- [ ] TASK-006: Build OTI list view
- [ ] TASK-007: Build OTI detail view
- [ ] TASK-008: Create add/edit OTI form
- [ ] TASK-009: Implement status transitions

### Phase 3: Dashboard & Metrics
- [ ] TASK-010: Setup D3.js integration
- [ ] TASK-011: Build pipeline overview visualization
- [ ] TASK-012: Create health metrics charts
- [ ] TASK-013: Implement trend analysis charts
- [ ] TASK-014: Build OTI type analysis

### Phase 4: Configuration & Admin
- [ ] TASK-015: Build OTI type management interface
- [ ] TASK-016: Create team configuration
- [ ] TASK-017: Implement data export functionality

### Phase 5: Polish & Testing
- [ ] TASK-018: Apply Lake Macquarie brand styling
- [ ] TASK-019: Implement responsive design
- [ ] TASK-020: Accessibility compliance
- [ ] TASK-021: Cross-browser testing
- [ ] TASK-022: User acceptance testing

## Task Details

### TASK-001: Setup project structure and files
**Status**: Not Started
**Priority**: High
**Estimated Effort**: 1 hour

**Objectives**:
- Create folder structure as per architecture
- Setup initial HTML/CSS/JS files
- Add D3.js library

**Implementation Notes**:
```
Create:
- index.html with basic structure
- All CSS files with imports
- All JS files with module structure
- Data folder with empty JSON files
```

**Dependencies**: None

**Acceptance Criteria**:
- [ ] All folders and files created
- [ ] Files load without errors
- [ ] D3.js library accessible

**Testing**:
- Open index.html in browser
- Check console for errors
- Verify D3 is available

---

### TASK-002: Implement data manager for JSON operations
**Status**: Not Started
**Priority**: High
**Estimated Effort**: 2 hours

**Objectives**:
- Create data-manager.js with JSON CRUD operations
- Implement backup functionality
- Add error handling

**Implementation Notes**:
```javascript
class DataManager {
  constructor() {
    this.dataPath = '/data';
    this.backupPath = '/data/backup';
  }
  
  async loadJSON(filename) {
    // Load JSON file
    // Handle errors
    // Return parsed data
  }
  
  async saveJSON(filename, data) {
    // Create backup
    // Write JSON file
    // Handle errors
  }
  
  async backup(filename) {
    // Create timestamped backup
  }
}
```

**Dependencies**: TASK-001

**Acceptance Criteria**:
- [ ] Can load JSON files
- [ ] Can save JSON files
- [ ] Automatic backup before save
- [ ] Error handling works
- [ ] Returns appropriate success/error messages

**Testing**:
- Load sample JSON file
- Modify and save
- Verify backup created
- Test error scenarios

---

[Continue for all 22 tasks...]

## Development Log

### 2025-01-15
- Created requirements specification
- Defined technical architecture
- Setup task list

---

## Notes & Decisions

### Design Decisions
1. **Why JSON over database?**
   - Simpler prototype deployment
   - No infrastructure dependencies
   - Easy migration path defined

2. **Why vanilla JS over React?**
   - Security restrictions on desktop
   - Lower barrier to deployment
   - Sufficient for prototype complexity

3. **Why D3.js for visualization?**
   - Sophisticated, customizable charts
   - No framework dependencies
   - Council already uses D3 in other tools

### Open Questions
- [ ] ServiceNow integration approach?
- [ ] Authentication for production?
- [ ] Hosting environment?

### Risk Register
1. **JSON file concurrency**: Multiple users editing simultaneously
   - Mitigation: Add file locking or queue writes
   - For production: Move to database

2. **Browser compatibility**: D3.js v7 requires modern browsers
   - Mitigation: Test on council's standard browsers
   - Document minimum browser versions

3. **Data loss**: JSON files are fragile
   - Mitigation: Automatic backups, version control
   - For production: Database with proper backups
```

#### 7.2 Task Tracking Workflow
1. **Create task**: Add to task list with details
2. **Start task**: Update status to "In Progress"
3. **Work on task**: Follow implementation notes, update log
4. **Test task**: Complete acceptance criteria
5. **Complete task**: Mark as done, note completion date
6. **Review**: Periodic review of completed tasks

---

### 8. Success Criteria

The prototype will be considered successful when:

1. **Visibility Achieved**
   - [ ] Can see status of any OTI at a glance
   - [ ] Dashboard shows overall pipeline health
   - [ ] Stalled OTIs are immediately apparent
   - [ ] Bottlenecks are identified visually

2. **Accountability Established**
   - [ ] Clear ownership for each OTI
   - [ ] Status history tracked
   - [ ] Progress percentage visible
   - [ ] Escalation path documented

3. **Performance Measurable**
   - [ ] Key metrics calculated automatically
   - [ ] Trends visible over time
   - [ ] Team performance comparable
   - [ ] Improvement/decline evident

4. **Easy to Use**
   - [ ] Non-technical staff can add/edit OTIs
   - [ ] Dashboard loads quickly (<2 seconds)
   - [ ] Works on standard council devices
   - [ ] Intuitive navigation

5. **Scalable Foundation**
   - [ ] Data structure ready for database migration
   - [ ] Code is modular and maintainable
   - [ ] Can add authentication later
   - [ ] Can integrate with ServiceNow

---

### 9. Future Enhancements (Post-Prototype)

**Phase 2 Features:**
- Customer portal for OTI submission
- Email notifications for status changes
- ServiceNow integration for task sync
- Team member login for task updates
- Mobile app for coordinators

**Phase 3 Features:**
- Predictive analytics (forecasting completion)
- Resource allocation optimization
- Automated escalation workflows
- Integration with project management tools
- API for other council systems

**Production Requirements:**
- Move to database (PostgreSQL recommended)
- Implement authentication (council SSO)
- Deploy to internal hosting (Rails or similar)
- Setup automated backups
- Enable audit logging

---

### 10. Deployment Plan

#### 10.1 Prototype Deployment
1. **Development**: Local desktop development
2. **Testing**: IT team internal testing (5-10 users)
3. **Pilot**: One team using system for 2-4 weeks
4. **Rollout**: Full IT department

#### 10.2 Success Metrics
- User satisfaction (survey after pilot)
- Time saved in status reporting
- Reduction in "lost" OTIs
- Improved completion rates
- Better resource allocation

#### 10.3 Training & Support
- User guide (markdown document)
- Video walkthrough (for coordinators)
- FAQ document
- Support contact (during pilot)

---

## Appendix A: Glossary

**OTI**: Operational Technology Initiative - focused technology improvements between routine support and strategic projects

**BA**: Business Analyst - conducts initial assessment and classification

**Lead Team**: Primary team responsible for delivering the OTI

**Lead Coordinator**: Individual from lead team managing customer communication and overall delivery

**Supporting Teams**: Additional teams providing specialized input or implementation

**ServiceNow**: Council's IT service management platform for task tracking

**Stalled**: Status indicating OTI cannot proceed due to blockers

**Escalation**: Process of raising blocked/at-risk OTIs to management for resolution

---

## Appendix B: Sample Data

See separate file: `sample-data.json`

---

## Appendix C: Brand Guidelines

Based on Lake Macquarie City Council Brand Toolkit:
- Typography: Shentox Bold for headings, Fira Sans for body
- Primary Palette: Light Blue (#009BDB), Dark Blue (#3F457E)
- Use of gradient effects
- Clean, modern, accessible design
- Minimum 10pt font size for accessibility

---

## Document Control

**Version**: 1.0
**Date**: 15 October 2025
**Author**: Jack Nicholas (Digital Solutions Coordinator)
**Status**: Draft for Cursor prompt development
**Review Date**: After prototype completion

---
