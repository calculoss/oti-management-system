# GitHub Setup & Hosting Guide - OTI Management System

## 🎯 Goals

1. **Version Control**: Use GitHub to track all code changes
2. **Collaboration**: Easy for workmates to see progress and provide feedback
3. **Live Demo**: Host on GitHub Pages so anyone can access it via URL
4. **Continuous Deployment**: Push to GitHub, site updates automatically

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new

2. **Create new repository**:
   - Repository name: `oti-management-system`
   - Description: `OTI Management System for Lake Macquarie City Council`
   - Visibility: **Private** (since it's for internal council use)
   - ✅ Initialize with README
   - ✅ Add .gitignore (choose "Node" template)
   - License: None needed for internal tool

3. **Click "Create repository"**

### Step 2: Clone to Your Local Machine

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/oti-management-system.git
cd oti-management-system

# Verify it worked
git status
```

### Step 3: Add Your Project Files

```bash
# Copy all your development documents
cp /path/to/OTI-Management-Requirements.md .
cp /path/to/CURSOR-PROMPT.md .
cp /path/to/TASKS.md .
cp /path/to/QUICK-START.md .
cp /path/to/PROJECT-SUMMARY.md .

# Create initial commit
git add .
git commit -m "Add project documentation and requirements"
git push origin main
```

---

## 🌐 GitHub Pages Hosting Setup

### Option A: Automatic Deployment (Recommended)

**Setup GitHub Actions for automatic deployment:**

1. **Create workflow file**:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: "GitHub Actions"
   - Click Save

3. **Push the workflow**:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

4. **Your site will be live at**:
   ```
   https://YOUR-USERNAME.github.io/oti-management-system/
   ```

### Option B: Manual Deployment (Simple)

If you prefer manual control:

```bash
# Build/prepare your files (if needed)
# For this project, no build step needed

# Push to GitHub
git add .
git commit -m "Update site"
git push origin main

# Enable GitHub Pages
# Go to Settings → Pages → Source: main branch → Save
```

---

## 📁 Project Structure for Hosting

Your repository should look like this:

```
oti-management-system/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── docs/                        # Documentation (keep separate)
│   ├── OTI-Management-Requirements.md
│   ├── CURSOR-PROMPT.md
│   ├── TASKS.md
│   ├── QUICK-START.md
│   ├── PROJECT-SUMMARY.md
│   └── GITHUB-HOSTING-GUIDE.md
├── index.html                   # Main application file
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   ├── oti-list.css
│   ├── oti-detail.css
│   └── charts.css
├── js/
│   ├── app.js
│   ├── data-manager.js
│   ├── oti-service.js
│   ├── chart-service.js
│   ├── dashboard.js
│   ├── oti-list.js
│   ├── oti-detail.js
│   └── utils.js
├── data/
│   ├── otis/
│   │   └── otis.json
│   └── config/
│       ├── oti-types.json
│       ├── teams.json
│       └── priorities.json
├── lib/
│   └── d3.v7.min.js
├── assets/
│   ├── icons/
│   └── images/
├── .gitignore
└── README.md
```

---

## 🔄 Daily Development Workflow

### Morning: Start Working

```bash
# Pull latest changes (in case workmates contributed)
git pull origin main

# Create a new branch for today's work (optional but good practice)
git checkout -b feature/dashboard-metrics

# Start Cursor and begin working on tasks
```

### During Development: Regular Commits

```bash
# After completing TASK-001
git add .
git commit -m "TASK-001: Setup project structure - Complete"
git push origin main

# After completing TASK-002
git add .
git commit -m "TASK-002: Implement data manager - Complete"
git push origin main

# Continue for each task...
```

**Commit Message Format**:
```
TASK-XXX: [Brief description] - [Status]

Examples:
✅ "TASK-001: Setup project structure - Complete"
🚧 "TASK-007: OTI list view - In Progress"
🐛 "TASK-007: Fix filtering bug - Complete"
📝 "Update TASKS.md with Phase 1 completion notes"
```

### End of Day: Push Everything

```bash
# Make sure everything is committed
git status

# Push all changes
git push origin main

# Your live demo updates automatically!
# Share URL with workmates: https://YOUR-USERNAME.github.io/oti-management-system/
```

---

## 🎨 GitHub Pages URL Structure

Your site will be accessible at different paths:

**Main Application**:
```
https://YOUR-USERNAME.github.io/oti-management-system/
```

**Direct Access to Views** (with hash routing):
```
https://YOUR-USERNAME.github.io/oti-management-system/#dashboard
https://YOUR-USERNAME.github.io/oti-management-system/#oti-list
https://YOUR-USERNAME.github.io/oti-management-system/#oti-detail/OTI-2025-001
```

**Documentation** (if you want to share docs):
```
https://YOUR-USERNAME.github.io/oti-management-system/docs/PROJECT-SUMMARY.md
```

---

## 👥 Sharing with Workmates

### Option 1: Share the Live URL

Simply send them:
```
Check out the OTI Management System prototype:
https://YOUR-USERNAME.github.io/oti-management-system/

Let me know what you think!
```

### Option 2: Create a Short URL

Use a URL shortener for easier sharing:
- Bitly: https://bitly.com/
- TinyURL: https://tinyurl.com/

Example: `bit.ly/lakemac-oti`

### Option 3: QR Code for Presentations

Generate a QR code pointing to your demo:
- https://www.qr-code-generator.com/

Print it on a handout or display during presentations!

### Option 4: Create a Landing Page

Add a simple landing page as your README.md:

```markdown
# OTI Management System

🚀 **[Launch Application](https://YOUR-USERNAME.github.io/oti-management-system/)**

## About
This is a prototype OTI Management System for Lake Macquarie City Council's IT department.

## Features
- 📊 Dashboard with pipeline metrics
- 📋 OTI list with filtering and sorting
- 🔍 Detailed OTI views
- ➕ Add/edit OTI functionality

## Status
Currently in development. See [TASKS.md](docs/TASKS.md) for progress.

## Feedback
Please open an issue or contact [your-name]@lakemac.nsw.gov.au
```

---

## 🔒 Data Persistence Considerations

### Important: GitHub Pages is Static

Since your app uses local JSON files and localStorage:

**What Works**:
- ✅ Everyone can view the demo
- ✅ Everyone can interact with sample data
- ✅ Changes persist in their browser session

**What Doesn't Work**:
- ❌ Changes don't sync between users
- ❌ Data resets when browser clears localStorage
- ❌ Each user sees their own version of data

### Solutions for Demo

**1. Pre-load Sample Data** (Recommended for demo):
```javascript
// In data-manager.js
async initialize() {
  // Try to load from localStorage first
  let otis = this.loadFromLocalStorage('otis');
  
  // If not found, load sample data from JSON
  if (!otis) {
    otis = await this.loadJSON('otis/otis.json');
    this.saveToLocalStorage('otis', otis);
  }
  
  return otis;
}
```

**2. Add a "Reset to Sample Data" Button**:
```javascript
// In your UI
function resetToSampleData() {
  if (confirm('This will reset all data to sample values. Continue?')) {
    localStorage.clear();
    location.reload();
  }
}
```

**3. Display a Demo Banner**:
```html
<div class="demo-banner">
  ⚠️ This is a prototype. Data is stored locally in your browser. 
  <button onclick="resetToSampleData()">Reset to Sample Data</button>
</div>
```

---

## 🎯 Demonstration Strategy

### Before Showing to Workmates

**1. Prepare Sample Data**:
- Create realistic OTI records with varied statuses
- Include some "stalled" OTIs to show alerts
- Have OTIs from different teams
- Ensure date ranges span last 6 months for trend charts

**2. Create a Demo Script**:

```markdown
## OTI Management System Demo Script

### 1. Dashboard (2 minutes)
- Show pipeline overview: "See how OTIs flow from Received to Done"
- Point out stalled items: "Red indicators show problems"
- Explain metrics: "We can see we're completing X OTIs per month"
- Show trends: "Are we improving or getting worse?"

### 2. OTI List (2 minutes)
- Demonstrate filtering: "Find all urgent items"
- Show sorting: "Sort by days active to find oldest"
- Use search: "Find specific OTI by name or ID"

### 3. OTI Detail (2 minutes)
- Open a specific OTI
- Walk through all information
- Show progress tracking
- Demonstrate adding notes

### 4. Adding New OTI (2 minutes)
- Click "Add OTI"
- Fill in form
- Show how type selection auto-populates teams
- Show target date calculation

### 5. Q&A and Feedback (5 minutes)
- Ask: "What do you think?"
- Ask: "What's missing?"
- Ask: "Would this solve the 'black hole' problem?"
```

**3. Have Backup**:
- Take screenshots in case internet issues
- Have the demo script printed
- Be ready to explain technical choices

### During the Demo

**Do**:
- ✅ Start with the problem: "Ideas became a black hole"
- ✅ Show the solution: "Now we have visibility"
- ✅ Be specific: "Here's how I'd use this daily"
- ✅ Ask for feedback: "What do you think?"
- ✅ Take notes on suggestions

**Don't**:
- ❌ Apologize for incomplete features
- ❌ Get lost in technical details
- ❌ Focus on what's not working
- ❌ Oversell it as finished product

### After the Demo

**1. Collect Feedback**:
- What did they like?
- What's confusing?
- What's missing?
- Would they use it?

**2. Create GitHub Issues**:

```bash
# For each piece of feedback
# Go to GitHub → Issues → New Issue

Title: "Dashboard: Add export to PDF functionality"
Description: "From demo feedback: Users want to export dashboard metrics to PDF for monthly reports"
Labels: enhancement, feedback

Title: "OTI List: Filter by date range"
Description: "From demo feedback: Need ability to filter OTIs by submission date range"
Labels: enhancement, feedback
```

**3. Update TASKS.md**:
```markdown
## Feedback from Demo - [Date]

**Attendees**: John, Sarah, Mike, Lisa

**What Worked Well**:
- Dashboard metrics very clear
- Love the visual pipeline
- Filtering is intuitive

**Improvement Suggestions**:
- Add PDF export
- Need date range filtering
- Want email notifications

**Action Items**:
- [ ] Create GitHub issues for each suggestion
- [ ] Prioritize top 3 improvements
- [ ] Schedule follow-up demo in 2 weeks
```

---

## 🔧 Updating the Live Site

### Making Changes

```bash
# 1. Make your changes locally
# Edit files in Cursor

# 2. Test locally
# Open index.html in browser, verify changes work

# 3. Commit changes
git add .
git commit -m "Add PDF export functionality to dashboard"

# 4. Push to GitHub
git push origin main

# 5. GitHub Pages updates automatically (takes 1-2 minutes)
# Tell workmates: "I've updated the demo based on your feedback!"
```

### Rolling Back if Needed

```bash
# If something breaks, revert to previous commit
git log                          # Find the good commit hash
git revert abc123                # Revert to that commit
git push origin main             # Push the fix
```

---

## 📱 Mobile Testing

Since GitHub Pages is publicly accessible:

**Test on Your Phone**:
```
1. Grab your phone
2. Open browser
3. Go to: https://YOUR-USERNAME.github.io/oti-management-system/
4. Test responsive design
5. Take screenshots to share!
```

**Share with Mobile Users**:
- Text the URL to workmates
- They can test on their devices
- Collect feedback on mobile experience

---

## 🎓 GitHub Best Practices

### Branching Strategy (Optional but Recommended)

```bash
# Create feature branches for major work
git checkout -b feature/dashboard
# Work on dashboard
git commit -m "Build dashboard metrics"
git push origin feature/dashboard

# When ready, merge to main
git checkout main
git merge feature/dashboard
git push origin main
```

### Commit Messages

**Good Commits**:
```
✅ "TASK-010: Setup D3.js chart service - Complete"
✅ "Fix: Dashboard not loading on mobile Safari"
✅ "Add: Export to CSV functionality"
✅ "Update: TASKS.md with Phase 2 completion"
✅ "Docs: Add deployment instructions"
```

**Bad Commits**:
```
❌ "updates"
❌ "fix stuff"
❌ "asdf"
❌ "changes"
```

### .gitignore Configuration

Make sure your `.gitignore` includes:

```
# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log

# Temporary files
*.tmp
.cache/

# Node modules (if you add any build tools later)
node_modules/

# Don't ignore these (common mistake)
# We WANT to commit:
# - lib/d3.v7.min.js (D3 library)
# - data/*.json (sample data)
```

---

## 🚀 Alternative Hosting Options

If GitHub Pages doesn't work for some reason:

### Netlify (Also Free)

1. **Sign up**: https://www.netlify.com/
2. **Connect GitHub**: Link your repository
3. **Deploy**: Automatic on every push
4. **URL**: `your-site.netlify.app`

**Advantages**:
- Faster than GitHub Pages
- Better custom domain support
- Form handling (if needed later)

### Vercel (Also Free)

1. **Sign up**: https://vercel.com/
2. **Import GitHub repo**
3. **Deploy**: Automatic
4. **URL**: `your-site.vercel.app`

**Advantages**:
- Very fast
- Great developer experience
- Preview deployments for PRs

### Council Internal Hosting

If your council has internal hosting:
- Talk to IT infrastructure team
- They might have an internal web server
- Could deploy there for full privacy
- Would be accessible only on council network

---

## 🔐 Security Considerations

### GitHub Private Repository

**Recommended for Council Work**:
```
✅ Make repository PRIVATE
✅ Only invite council staff as collaborators
✅ Don't put sensitive data in code
✅ Don't commit real passwords or API keys
```

### Sample Data Only

**For the demo**:
```
✅ Use only fake/sample data
✅ No real requestor names or emails
✅ No actual ServiceNow IDs
✅ Generic team member names
```

### Before Production

**When moving to production**:
```
⚠️ Move to council's internal hosting
⚠️ Add proper authentication
⚠️ Connect to real database
⚠️ Implement access controls
⚠️ Add audit logging
```

---

## 📊 Tracking Demo Engagement

### GitHub Insights

**See who's viewing your code**:
- GitHub → Repository → Insights → Traffic
- See views, clones, visitor stats

### Add Basic Analytics (Optional)

Add to your `index.html`:

```html
<!-- Simple page view tracking -->
<script>
  // Log to console (you can replace with actual analytics)
  console.log('OTI Management System loaded:', new Date());
  
  // Track which view they navigate to
  window.addEventListener('hashchange', () => {
    console.log('Navigated to:', window.location.hash);
  });
</script>
```

---

## ✅ Setup Checklist

Use this to verify everything is working:

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Repository cloned to local machine
- [ ] Documentation files committed
- [ ] .gitignore configured
- [ ] README.md updated with demo link

### GitHub Pages
- [ ] GitHub Pages enabled in repository settings
- [ ] Deployment workflow configured (.github/workflows/deploy.yml)
- [ ] Site is live and accessible
- [ ] URL tested on desktop
- [ ] URL tested on mobile

### Development Workflow
- [ ] Can commit and push changes
- [ ] Changes appear on live site within 2 minutes
- [ ] Can view commit history
- [ ] Can revert if needed

### Demo Preparation
- [ ] Sample data is realistic and varied
- [ ] All features work on live site
- [ ] Demo script prepared
- [ ] Feedback collection method ready
- [ ] Backup screenshots taken

---

## 🎉 You're Ready to Demo!

Now you can:
- ✅ Develop locally with version control
- ✅ Push changes and they go live automatically
- ✅ Share a simple URL with workmates
- ✅ Collect feedback through GitHub issues
- ✅ Show progress as you complete tasks

**Your Demo URL**:
```
https://YOUR-USERNAME.github.io/oti-management-system/
```

**Next Steps**:
1. Create GitHub repository
2. Enable GitHub Pages
3. Complete TASK-001 through TASK-005
4. Push to GitHub
5. Share URL with first workmate for feedback!

---

**Good luck with your demo! 🚀**
