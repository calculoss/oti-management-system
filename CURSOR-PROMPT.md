# CURSOR AI DEVELOPMENT PROMPT: OTI Management System

## Project Overview

You are building an **OTI (Operational Technology Initiative) Management System** for Lake Macquarie City Council's IT department. This system replaces a problematic "Ideas" process that became a "black hole" with no visibility or accountability.

### Core Problem
The previous system lacked:
- Understanding of current state of individual initiatives
- Universal view of the overall pipeline  
- Visibility into bottlenecks and stalled items
- Metrics to assess departmental performance
- Clear accountability and progress tracking

### Solution Goals
Create a transparent, metrics-driven system that provides:
1. **Visibility**: Clear status of individual OTIs and overall pipeline health
2. **Accountability**: Track ownership, progress, and blockers
3. **Performance Insight**: Metrics showing where the department excels or struggles
4. **Early Warning**: Identify stalled OTIs before they become critical
5. **Improvement Tracking**: Trends showing if processes are getting better or worse

---

## Technical Constraints & Decisions

### Must Use
- **Vanilla HTML/CSS/JavaScript** (NO React - security restrictions prevent installation)
- **D3.js v7** for sophisticated data visualization
- **Local JSON files** for data storage (designed for easy database migration later)
- **No authentication** in prototype (add later for production)

### Design Requirements
- Follow **Lake Macquarie City Council brand guidelines**:
  - Typography: Shentox Bold (headings), Fira Sans (body)
  - Colors: Light Blue (#009BDB), Dark Blue (#3F457E)
  - Modern, clean, accessible design
  - Minimum 10pt font size for accessibility
- **Responsive design** (desktop priority, but mobile-friendly)
- **WCAG 2.1 AA compliant** accessibility

### File Structure
```
/oti-management-system
  /index.html                  # Main SPA
  /css
    - styles.css               # Global styles + design tokens
    - dashboard.css
    - oti-list.css
    - oti-detail.css
    - charts.css
  /js
    - app.js                   # Main app, routing, initialization
    - data-manager.js          # JSON CRUD operations
    - oti-service.js           # OTI business logic
    - chart-service.js         # D3.js chart rendering
    - dashboard.js             # Dashboard view logic
    - oti-list.js              # OTI list view
    - oti-detail.js            # OTI detail view
    - utils.js                 # Date formatting, validation, etc.
  /data
    /otis
      - otis.json              # Array of OTI records
    /config
      - oti-types.json         # 10 OTI type definitions
      - teams.json             # IT teams and members
      - priorities.json        # Priority definitions
    /archive
      - completed-otis-YYYY.json
  /assets
    /icons
    /images
  /lib
    - d3.v7.min.js
```

---

## Task Tracking Methodology

Follow the **snarktank/ai-dev-tasks** approach for development:

### 1. Maintain Development Tasks File

Create and maintain `TASKS.md` in project root:

```markdown
# OTI Management System - Development Tasks

## Project Context
[Brief description of project]

## Current Status
- [x] Completed tasks
- [ ] In progress tasks
- [ ] Upcoming tasks

## Active Task
**TASK-XXX**: [Current task name]
- Status: In Progress
- Started: [timestamp]
- Blockers: [any issues]

## Task List

### Phase 1: Foundation
- [ ] TASK-001: Setup project structure
- [ ] TASK-002: Implement data manager
- [ ] TASK-003: Create sample data
[...]

## Development Log
### [Date]
- [What was done]
- [Decisions made]
- [Problems encountered]

## Notes & Decisions
[Key architectural decisions, open questions, risks]
```

### 2. Task Structure Template

Each task should include:

```markdown
### TASK-XXX: [Task Name]
**Status**: Not Started | In Progress | Blocked | Done
**Priority**: High | Medium | Low
**Estimated Effort**: [hours/days]
**Actual Effort**: [hours/days] (when complete)

**Objectives**:
- Clear, specific goals for this task

**Implementation Notes**:
```[language]
// Code snippets, architectural notes, specific approaches
```

**Dependencies**: 
- TASK-XXX must be completed first
- Requires [file/feature] to exist

**Acceptance Criteria**:
- [ ] Specific, testable criteria
- [ ] Can be verified objectively
- [ ] Covers success scenarios

**Testing**:
- Steps to verify the task is complete
- Edge cases to check
- Browser/device testing if UI

**Completion Notes**: (filled when done)
- Date completed
- Actual effort
- Any deviations from plan
- Lessons learned
```

### 3. Development Workflow

For each coding session:

1. **Start of Session**:
   - Review TASKS.md
   - Identify next task to work on
   - Update task status to "In Progress"
   - Add session start time to development log

2. **During Development**:
   - Focus on ONE task at a time
   - Document decisions in task notes
   - If you discover new tasks, add them to the list
   - If blocked, note blockers and move to next task

3. **End of Session**:
   - Update task status (Done, Blocked, or still In Progress)
   - Add completion notes if done
   - Update development log with progress
   - Commit code with reference to task number

4. **Task Completion**:
   - Mark task as Done with checkmark
   - Fill in completion notes
   - Verify all acceptance criteria met
   - Move to next task

### 4. Progress Tracking

Maintain clear visibility:
- Always show current active task at top of TASKS.md
- Keep development log updated daily
- Document blockers immediately
- Track actual vs estimated effort

---

## Data Structures

### OTI Record
```javascript
{
  "id": "OTI-2025-001",
  "title": "SharePoint Integration for HR System",
  "description": "Full description...",
  "otiType": "system-enhancement",
  "priority": "high", // urgent | high | medium | low
  "status": "in-progress", // received | in-progress | stalled | done
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
    {
      "status": "received",
      "date": "2025-01-15",
      "notes": "Initial assessment by BA",
      "updatedBy": "Business Analyst"
    },
    {
      "status": "in-progress",
      "date": "2025-01-18",
      "notes": "Tasks assigned to teams",
      "updatedBy": "Jane Doe"
    }
  ],
  "notes": [
    {
      "date": "2025-01-20",
      "author": "Jane Doe",
      "text": "Cyber assessment approved, proceeding with installation"
    }
  ]
}
```

### OTI Type Definition
```javascript
{
  "id": "software-purchase",
  "name": "Software Purchase & Setup",
  "leadTeam": "Apps & Dev",
  "supportingTeams": ["Cyber", "Apps & Dev", "IT Support"],
  "standardTasks": [
    {
      "name": "Requirements validation",
      "team": "Apps & Dev",
      "sequence": 1,
      "estimatedDays": 2
    },
    {
      "name": "Cyber security assessment",
      "team": "Cyber",
      "sequence": 2,
      "estimatedDays": 3
    },
    {
      "name": "Installation",
      "team": "Apps & Dev",
      "sequence": 3,
      "estimatedDays": 5
    },
    {
      "name": "User setup",
      "team": "IT Support",
      "sequence": 4,
      "estimatedDays": 2
    }
  ],
  "targetDays": {
    "urgent": 5,
    "high": 20,
    "medium": 30,
    "low": 60
  }
}
```

### Complete OTI Types List
1. **Software Purchase & Setup** (Lead: Apps & Dev)
2. **System Enhancement** (Lead: Apps & Dev)
3. **Data & Reporting Solutions** (Lead: Data Team)
4. **Website & Digital Updates** (Lead: Web Development)
5. **IT Hardware & Equipment** (Lead: Infrastructure)
6. **AI Solutions Request** (Lead: Apps & Dev)
7. **Process Automation** (Lead: Apps & Dev)
8. **Spatial Solutions & Analysis (GIS)** (Lead: GIS Team)
9. **Professional Services & Advisory** (Lead: Digital Solutions)
10. **Custom Solution** (Lead: Digital Solutions)

### Priority Definitions
```javascript
{
  "priorities": {
    "urgent": {
      "name": "Urgent",
      "targetDays": 5,
      "color": "#DC2626",
      "criteria": [
        "System failures affecting business operations",
        "Compliance or security requirements with deadlines",
        "Director-level requests with business justification"
      ]
    },
    "high": {
      "name": "High",
      "targetDays": 20,
      "color": "#F59E0B",
      "criteria": [
        "Department efficiency improvements with measurable impact",
        "Customer service enhancements",
        "Process automation with clear ROI"
      ]
    },
    "medium": {
      "name": "Medium",
      "targetDays": 30,
      "color": "#FCD34D",
      "criteria": [
        "General system enhancements",
        "Reporting and analytics requests",
        "Standard software implementations"
      ]
    },
    "low": {
      "name": "Low",
      "targetDays": 60,
      "color": "#10B981",
      "criteria": [
        "Nice-to-have improvements",
        "Exploratory or pilot projects",
        "Non-urgent equipment purchases"
      ]
    }
  }
}
```

---

## Key Features to Implement

### 1. Dashboard (Priority: HIGH)

**Requirements**:
- **Pipeline Overview**: Visual funnel/Sankey showing Received → In Progress → Stalled → Done
- **Key Metrics Cards**:
  - Total Active OTIs
  - Urgent Items Requiring Attention (red highlight)
  - Average Time to Completion (last 30 days)
  - On-Time Completion Rate (percentage)
  
- **Health Metrics**:
  - OTIs by status (donut chart)
  - Time in each status (horizontal bar chart, average days)
  - Stalled OTIs table (ID, title, days stalled, escalation status)
  - OTIs exceeding target dates (table, grouped by priority)
  
- **Team Performance**:
  - OTIs by lead team (bar chart)
  - Average completion time by team
  - Team capacity view (active OTIs count per team)
  
- **Trend Analysis**:
  - Completion rate over time (line chart, last 6 months)
  - Volume: New vs Completed (dual-axis chart)
  - Average completion time trend (with improving/declining indicator)
  
- **OTI Type Analysis**:
  - Distribution by type (horizontal bar)
  - Average completion time by type
  - Success rate by type

**D3.js Visualizations Needed**:
- Sankey/funnel diagram for pipeline
- Donut chart for status distribution
- Horizontal bar charts for team/type metrics
- Line charts with dual axes for trends
- Interactive tooltips on all charts
- Responsive sizing

### 2. OTI List View (Priority: HIGH)

**Requirements**:
- **Table columns**:
  - ID (clickable to detail view)
  - Title (truncate long titles)
  - Type (icon + label, color-coded)
  - Priority (visual badge: Urgent=red, High=orange, Medium=yellow, Low=green)
  - Status (badge with icon)
  - Lead Team
  - Days Active (calculated from submission date)
  - Progress (percentage with visual bar)
  - Target Date (with red overdue indicator if past)
  
- **Filtering**:
  - By Status (multi-select)
  - By Priority (multi-select)
  - By Type (dropdown)
  - By Lead Team (dropdown)
  - Show only Overdue (toggle)
  - Show only Stalled (toggle)
  
- **Sorting**:
  - Click column headers to sort
  - Support ascending/descending
  - Default: Most recent first
  
- **Search**:
  - Search box for title, ID, requestor name
  - Live search (update as typing)
  
- **Actions**:
  - "Add New OTI" button (top right)
  - "Export to CSV" button
  - Row click navigates to detail view

### 3. OTI Detail View (Priority: HIGH)

**Requirements**:
- **Header Section**:
  - Large ID and title
  - Type badge, priority indicator, status badge
  - Quick actions: Edit, Add Note, Change Status, Mark as Stalled, Escalate
  
- **Main Information Card**:
  - Description (full text, preserve formatting)
  - Business justification
  - Requestor: Name, email, department
  - Lead team & coordinator
  - Supporting teams (as tags/pills)
  - Dates: Submitted, Target, Actual (if completed)
  - ServiceNow link (if provided)
  
- **Progress Section**:
  - Large progress percentage with visual bar
  - Task summary: "3 of 8 tasks completed"
  - Link to ServiceNow tasks (button)
  - "Update Progress" button (manual entry if no ServiceNow)
  
- **Timeline/History**:
  - Vertical timeline visualization
  - Status changes with dates and notes
  - Escalation events highlighted in red
  - Key milestones
  
- **Notes Section**:
  - Chronological list of notes
  - Each note: Date, author, text
  - "Add Note" form at bottom
  - Notes saved to JSON

**Interactions**:
- Edit button opens edit form (same as create, pre-filled)
- Change status opens modal with status dropdown + notes field
- Add note shows inline form, saves to notes array
- Mark as Stalled: Changes status, adds escalation timestamp

### 4. Add/Edit OTI Form (Priority: MEDIUM)

**Requirements**:
- **Multi-step form** (or single long form with sections):
  
  **Section 1: Basic Information**
  - Title (text input, required, max 100 chars)
  - Description (textarea, required, rich text editor if possible)
  - OTI Type (dropdown, required, loads from oti-types.json)
  - Priority (radio buttons or dropdown, required)
  
  **Section 2: Requestor & Teams**
  - Requestor Name (text, required)
  - Requestor Email (email input, validated)
  - Requestor Department (text)
  - Lead Team (dropdown, auto-filled from selected type, editable)
  - Lead Coordinator (dropdown of team members, loads from teams.json)
  - Supporting Teams (multi-select, pre-filled from type, editable)
  
  **Section 3: Business Context**
  - Business Justification (textarea, required)
  - Expected Benefits (textarea, optional)
  - Dependencies/Constraints (textarea, optional)
  
  **Section 4: Integration**
  - ServiceNow Parent ID (text, optional)
  - Task IDs (text, comma-separated, optional)

**Behavior**:
- On type selection, auto-populate lead team and supporting teams
- On priority selection, calculate and show target date
- Validate required fields before save
- Show validation errors inline
- "Save" button creates/updates OTI in otis.json
- "Cancel" button returns to previous view
- Success: Redirect to detail view of created/updated OTI

### 5. OTI Type Management (Priority: LOW)

**Requirements**:
- **Configuration Interface**:
  - List of 10 OTI types (table or cards)
  - Each type shows: Name, Lead Team, Supporting Teams count, Tasks count
  - Edit button for each type
  
- **Edit Type Form**:
  - Type Name (text, required)
  - Lead Team (dropdown)
  - Supporting Teams (multi-select)
  - Standard Tasks (editable table):
    - Columns: Task Name, Team, Sequence, Est. Days
    - Add row, delete row, reorder rows (drag or up/down buttons)
  - Target Days by Priority (4 number inputs: Urgent, High, Medium, Low)
  - Save button updates oti-types.json

**Behavior**:
- Changes to types affect NEW OTIs only (don't modify existing)
- Validation: Names must be unique, sequences must be sequential
- Confirmation before save: "This will affect new OTIs"

---

## Development Phases & Task Breakdown

### Phase 1: Foundation (Est. 6-8 hours)

**TASK-001: Setup project structure** (1 hour)
- Create all folders and files
- Setup index.html with basic HTML5 structure
- Include D3.js library (CDN or local)
- Create empty CSS/JS files with file headers
- Create empty JSON data files with basic structure

**TASK-002: Implement data-manager.js** (2 hours)
- Create DataManager class
- Methods: loadJSON(), saveJSON(), backup()
- Error handling for file operations
- Test with sample data

**TASK-003: Create sample data** (1 hour)
- Create sample otis.json with 15-20 varied OTIs
- Create complete oti-types.json with all 10 types
- Create teams.json with sample teams and members
- Create priorities.json with definitions
- Ensure data variety (different statuses, priorities, types)

**TASK-004: Build app.js framework** (2 hours)
- Initialize app on DOMContentLoaded
- Implement simple hash-based routing
- Create view switching logic
- Load all data on startup
- Setup global state management

**TASK-005: Create global styles** (2 hours)
- Setup CSS design tokens (colors, typography, spacing)
- Import Lake Macquarie brand fonts
- Create utility classes
- Setup responsive breakpoints
- Create reusable component styles (buttons, badges, cards)

### Phase 2: OTI List & Detail Views (Est. 8-10 hours)

**TASK-006: Implement oti-service.js** (2 hours)
- Create OTIService class with methods:
  - getAllOTIs()
  - getOTIById(id)
  - createOTI(data)
  - updateOTI(id, data)
  - deleteOTI(id)
  - filterOTIs(filters)
  - sortOTIs(field, order)
  - searchOTIs(query)
  - calculateProgress(oti)
  - calculateDaysActive(oti)
  - isOverdue(oti)

**TASK-007: Build OTI list view** (3 hours)
- Create oti-list.js with rendering logic
- Build HTML table structure
- Implement filtering UI and logic
- Implement sorting (clickable headers)
- Implement search box
- Add "Add New" and "Export CSV" buttons
- Style with oti-list.css
- Make table responsive

**TASK-008: Build OTI detail view** (3 hours)
- Create oti-detail.js
- Render OTI header with badges
- Render main information cards
- Render progress section
- Render timeline/history
- Render notes section
- Add "Add Note" functionality
- Style with oti-detail.css
- Add quick action buttons

**TASK-009: Implement status transitions** (2 hours)
- Create status change modal/form
- Validate status transitions
- Update OTI record
- Add to status history
- Update UI after save
- Handle "Mark as Stalled" action

### Phase 3: Dashboard & Metrics (Est. 10-12 hours)

**TASK-010: Setup chart-service.js** (2 hours)
- Create ChartService class
- Setup D3.js utility methods
- Create responsive chart base
- Setup color scales from brand colors
- Create tooltip component

**TASK-011: Build key metrics cards** (2 hours)
- Calculate metrics from OTI data
- Create metric card component
- Render 4 key metrics at top of dashboard
- Add visual indicators (up/down arrows, colors)
- Update on data change

**TASK-012: Create pipeline visualization** (3 hours)
- Use D3.js to build Sankey or funnel diagram
- Show flow: Received → In Progress → Stalled → Done
- Include counts and percentages
- Make interactive (hover shows details)
- Responsive sizing

**TASK-013: Build status and team charts** (3 hours)
- Donut chart for OTIs by status
- Horizontal bar chart for OTIs by team
- Horizontal bar chart for time in each status
- All charts interactive with tooltips
- Responsive and accessible

**TASK-014: Build trend analysis charts** (2 hours)
- Line chart: Completion rate over 6 months
- Dual-axis chart: New vs Completed volume
- Line chart: Average completion time trend
- Add improving/declining indicators
- Responsive design

### Phase 4: Forms & Data Entry (Est. 6-8 hours)

**TASK-015: Build add/edit OTI form** (4 hours)
- Create form HTML structure
- Implement 4-section form
- Load OTI types and teams dynamically
- Auto-populate fields based on type
- Calculate target date on priority change
- Implement validation
- Save to otis.json
- Handle create vs edit mode

**TASK-016: Implement auto-calculations** (2 hours)
- Target date calculation (business days)
- Progress percentage calculation
- Days active calculation
- Overdue detection
- Stalled auto-detection logic

**TASK-017: Build OTI type management** (2 hours)
- List all 10 types
- Edit type form
- Editable task table with add/delete rows
- Save to oti-types.json
- Validation

### Phase 5: Polish & Testing (Est. 6-8 hours)

**TASK-018: Apply Lake Macquarie branding** (2 hours)
- Ensure Shentox and Fira Sans fonts used correctly
- Apply brand color palette throughout
- Add gradient effects where appropriate
- Polish button and badge styles
- Ensure consistent spacing

**TASK-019: Implement responsive design** (2 hours)
- Test on different screen sizes
- Adjust layouts for mobile
- Make charts responsive
- Ensure touch-friendly interactions
- Test on tablet size

**TASK-020: Accessibility compliance** (2 hours)
- Add ARIA labels
- Ensure keyboard navigation works
- Check color contrast ratios
- Add focus indicators
- Test with screen reader
- Ensure minimum 10pt font size

**TASK-021: Cross-browser testing** (1 hour)
- Test in Chrome, Firefox, Edge
- Fix any browser-specific issues
- Verify D3.js compatibility
- Test JSON file operations

**TASK-022: User acceptance testing** (1 hour)
- Test all user workflows
- Add test data if needed
- Fix any bugs found
- Document any known issues

---

## Coding Standards & Best Practices

### JavaScript

```javascript
// Use ES6+ features
// Use const/let, not var
// Use arrow functions for callbacks
// Use template literals for strings
// Use async/await for async operations

// Example: Good structure for a service
class OTIService {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.otis = [];
  }

  async initialize() {
    this.otis = await this.dataManager.loadJSON('otis/otis.json');
  }

  getAllOTIs() {
    return this.otis;
  }

  getOTIById(id) {
    return this.otis.find(oti => oti.id === id);
  }

  // More methods...
}

// Use descriptive names
// Add comments for complex logic
// Keep functions small and focused
// Handle errors gracefully
```

### CSS

```css
/* Use BEM naming convention or similar */
.oti-list {}
.oti-list__header {}
.oti-list__table {}
.oti-list__row {}
.oti-list__cell {}

/* Use CSS custom properties for theming */
:root {
  --color-primary: #009BDB;
  --color-primary-dark: #3F457E;
  --font-heading: 'Shentox', sans-serif;
  --font-body: 'Fira Sans', Arial, sans-serif;
  --spacing-unit: 8px;
}

/* Mobile-first responsive design */
.container {
  width: 100%;
  padding: var(--spacing-unit);
}

@media (min-width: 768px) {
  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### HTML

```html
<!-- Use semantic HTML5 elements -->
<header></header>
<nav></nav>
<main></main>
<section></section>
<article></article>
<aside></aside>
<footer></footer>

<!-- Add accessibility attributes -->
<button aria-label="Add new OTI" role="button">
  <span class="icon"></span>
  Add OTI
</button>

<!-- Use data attributes for JavaScript hooks -->
<div class="oti-card" data-oti-id="OTI-2025-001"></div>
```

---

## Testing Checklist

For each feature:

### Functionality Testing
- [ ] Feature works as described in requirements
- [ ] All user interactions function correctly
- [ ] Data saves and loads correctly
- [ ] Error handling works (try to break it)

### UI/UX Testing
- [ ] Matches Lake Macquarie brand guidelines
- [ ] Layout is clean and intuitive
- [ ] Visual feedback for all actions
- [ ] Loading states for async operations
- [ ] Success/error messages are clear

### Responsive Testing
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (test with NVDA/JAWS)
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Form labels properly associated

### Data Testing
- [ ] JSON saves correctly
- [ ] Backup created before save
- [ ] Data loads on refresh
- [ ] Handles empty data
- [ ] Handles corrupted data

---

## Common Patterns & Code Snippets

### Loading JSON Data
```javascript
// In data-manager.js
async loadJSON(filename) {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}
```

### Saving JSON Data
```javascript
async saveJSON(filename, data) {
  try {
    // In a real file system environment, you'd write to file
    // For now, use localStorage as a fallback
    localStorage.setItem(filename, JSON.stringify(data, null, 2));
    console.log(`Saved ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    return false;
  }
}
```

### Calculating Business Days
```javascript
// In utils.js
function addBusinessDays(startDate, days) {
  const date = new Date(startDate);
  let remaining = days;
  
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--;
    }
  }
  
  return date;
}

function getBusinessDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  
  while (start <= end) {
    if (start.getDay() !== 0 && start.getDay() !== 6) {
      days++;
    }
    start.setDate(start.getDate() + 1);
  }
  
  return days;
}
```

### Filtering OTIs
```javascript
// In oti-service.js
filterOTIs(filters) {
  return this.otis.filter(oti => {
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(oti.status)) return false;
    }
    
    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(oti.priority)) return false;
    }
    
    // Filter by type
    if (filters.type && oti.otiType !== filters.type) {
      return false;
    }
    
    // Filter by team
    if (filters.team && oti.leadTeam !== filters.team) {
      return false;
    }
    
    // Filter overdue only
    if (filters.overdueOnly && !this.isOverdue(oti)) {
      return false;
    }
    
    // Filter stalled only
    if (filters.stalledOnly && oti.status !== 'stalled') {
      return false;
    }
    
    return true;
  });
}
```

### Creating D3 Chart Base
```javascript
// In chart-service.js
class ChartService {
  createChart(containerId, config) {
    const container = d3.select(`#${containerId}`);
    const margin = config.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = (config.height || 400) - margin.top - margin.bottom;
    
    // Clear existing
    container.selectAll('*').remove();
    
    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    return { svg, width, height, margin };
  }
  
  createDonutChart(containerId, data) {
    const { svg, width, height } = this.createChart(containerId, { height: 300 });
    const radius = Math.min(width, height) / 2;
    
    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
    
    // Create arc
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);
    
    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#009BDB', '#3F457E', '#40BA8D', '#FFE17F', '#DE6328']);
    
    // Draw slices
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    const slices = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        // Show tooltip
        d3.select(this).transition()
          .duration(200)
          .attr('opacity', 0.8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).transition()
          .duration(200)
          .attr('opacity', 1);
      });
    
    // Add labels
    slices.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '14px')
      .text(d => d.data.label);
  }
}
```

---

## Critical Reminders

1. **Always update TASKS.md** as you work
2. **Test after each task** before moving to the next
3. **Use semantic HTML** for accessibility
4. **Follow brand guidelines** for visual consistency
5. **Comment complex logic** for future maintenance
6. **Handle errors gracefully** with user-friendly messages
7. **Keep code modular** for easy database migration later
8. **Test responsive design** at multiple breakpoints
9. **Validate all user input** before saving
10. **Back up data** before any write operation

---

## Getting Started

When you begin development:

1. Create the project structure (TASK-001)
2. Create TASKS.md file with all tasks listed
3. Create sample JSON data files
4. Start with Phase 1 foundation tasks
5. Update TASKS.md as you complete each task
6. Test each feature thoroughly before moving on
7. Document any design decisions or deviations

---

## Success Criteria

The prototype is complete when:

- [ ] Dashboard displays all key metrics and visualizations
- [ ] Can view list of all OTIs with filtering and sorting
- [ ] Can view detailed information for any OTI
- [ ] Can add and edit OTIs through forms
- [ ] Can change OTI status and add notes
- [ ] Can manage OTI type configurations
- [ ] All visualizations are interactive and responsive
- [ ] Design follows Lake Macquarie brand guidelines
- [ ] Works in Chrome, Firefox, and Edge
- [ ] Meets WCAG 2.1 AA accessibility standards
- [ ] All JSON data operations work correctly
- [ ] TASKS.md is complete and up to date

---

## Questions to Ask If Stuck

If you encounter uncertainty during development:

1. **Does this align with the requirements?**
2. **Is this the simplest solution that works?**
3. **Will this be easy to migrate to a database later?**
4. **Is this accessible to all users?**
5. **Does this follow the Lake Macquarie brand guidelines?**
6. **Have I tested this thoroughly?**
7. **Is this documented in TASKS.md?**

---

## Final Notes

This is a **prototype** designed to prove the concept and gather user feedback. Focus on:

- **Functionality**: Does it solve the "black hole" problem?
- **Visibility**: Can users see what they need to see?
- **Usability**: Is it intuitive for non-technical staff?
- **Performance**: Does it load and respond quickly?

Don't worry about:
- Perfect polish (it's a prototype)
- Advanced features (save for Phase 2)
- Production deployment details
- Authentication (add later)

**The goal**: Demonstrate that transparent OTI management is possible and valuable for the IT department.

---

Ready to start? Begin with TASK-001 and update TASKS.md as you go!
