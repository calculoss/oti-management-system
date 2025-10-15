# Git Quick Reference Card
*For OTI Management System Development*

---

## 🔄 Daily Workflow Commands

### Starting Your Day
```bash
# Get latest changes
git pull origin main

# Check what branch you're on
git branch

# Check status of your files
git status
```

### During Development
```bash
# See what changed
git status

# See detailed changes
git diff

# Add specific file
git add index.html

# Add all changed files
git add .

# Commit with message
git commit -m "TASK-007: Build OTI list view - Complete"

# Push to GitHub (updates live site)
git push origin main
```

### End of Day
```bash
# Make sure everything is saved
git status

# Add and commit everything
git add .
git commit -m "End of day: Completed TASK-005, TASK-006 in progress"

# Push to GitHub
git push origin main
```

---

## 🎯 Common Scenarios

### "I finished a task"
```bash
git add .
git commit -m "TASK-XXX: [Task name] - Complete"
git push origin main
# ✅ Live site updates in 1-2 minutes
```

### "I want to save my work but it's not finished"
```bash
git add .
git commit -m "WIP: TASK-XXX in progress - [what you did]"
git push origin main
```

### "I made a mistake in my last commit message"
```bash
git commit --amend -m "TASK-007: Fixed typo in commit message"
git push origin main --force
```

### "I want to undo my last commit (but keep the changes)"
```bash
git reset HEAD~1
# Your changes are still there, just not committed
```

### "I want to see my commit history"
```bash
# Simple view
git log --oneline

# Detailed view
git log

# Visual graph
git log --graph --oneline --all
```

### "I want to see what changed in a specific commit"
```bash
git show abc123
# Replace abc123 with actual commit hash
```

---

## 🌿 Working with Branches (Optional)

### Create a feature branch
```bash
git checkout -b feature/dashboard-metrics
# Work on your feature
git add .
git commit -m "Add metrics cards to dashboard"
git push origin feature/dashboard-metrics
```

### Switch back to main
```bash
git checkout main
```

### Merge feature into main
```bash
git checkout main
git merge feature/dashboard-metrics
git push origin main
```

### Delete branch after merging
```bash
git branch -d feature/dashboard-metrics
git push origin --delete feature/dashboard-metrics
```

---

## 🐛 Fixing Mistakes

### "I committed something I shouldn't have"
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Remove unwanted file
git rm --cached sensitive-file.txt

# Commit again without that file
git add .
git commit -m "Fixed: Removed sensitive file"
git push origin main
```

### "I want to discard all uncommitted changes"
```bash
⚠️ WARNING: This deletes your changes!
git checkout .
# Or for specific file:
git checkout -- filename.js
```

### "My push was rejected"
```bash
# Someone else pushed first, pull their changes
git pull origin main
# Resolve any conflicts if needed
git push origin main
```

### "I pushed bad code and site is broken"
```bash
# Find the last good commit
git log --oneline

# Revert to that commit (creates new commit)
git revert abc123

# Push the fix
git push origin main
```

---

## 📝 Commit Message Templates

### Task completion
```bash
git commit -m "TASK-007: Build OTI list view - Complete"
```

### Bug fix
```bash
git commit -m "Fix: Dashboard charts not responsive on mobile"
```

### New feature
```bash
git commit -m "Add: Export to CSV functionality"
```

### Update documentation
```bash
git commit -m "Docs: Update TASKS.md with Phase 2 completion"
```

### Work in progress
```bash
git commit -m "WIP: TASK-012 - Pipeline visualization 50% complete"
```

### Refactoring
```bash
git commit -m "Refactor: Simplify data-manager error handling"
```

---

## 🔍 Checking Things

### "Did my code push successfully?"
```bash
# Check remote has your commits
git log origin/main --oneline -5
```

### "What's different between my local and GitHub?"
```bash
# Fetch latest info without pulling
git fetch origin

# Compare
git diff origin/main
```

### "Who changed this file?"
```bash
git blame filename.js
```

### "When was this line added?"
```bash
git log -p filename.js
```

---

## 🚨 Emergency Commands

### "Everything is messed up, start fresh"
```bash
⚠️ DANGER: Only use if you really need to!

# Discard ALL local changes
git reset --hard HEAD

# Get clean copy from GitHub
git pull origin main
```

### "I need to abandon everything and start over"
```bash
⚠️ DANGER: This deletes your local repository!

# Backup first!
cd ..
mv oti-management-system oti-management-system-backup

# Clone fresh from GitHub
git clone https://github.com/YOUR-USERNAME/oti-management-system.git
cd oti-management-system
```

---

## 📊 Viewing Changes

### "Show me files that changed"
```bash
git status
```

### "Show me what changed in those files"
```bash
git diff
```

### "Show me what I'm about to commit"
```bash
git diff --cached
```

### "Show me changes in a specific file"
```bash
git diff filename.js
```

---

## 🔧 Configuration

### Set your name and email (one time setup)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@lakemac.nsw.gov.au"
```

### See your configuration
```bash
git config --list
```

### Set default branch name to main
```bash
git config --global init.defaultBranch main
```

---

## 🎯 Cursor + Git Integration

When using Cursor IDE:

### View changes in Cursor
- **Source Control panel** (left sidebar)
- See all changed files
- Click file to see diff
- Stage files with + button
- Commit with message
- Push with sync button

### Commit from Cursor
1. Open Source Control (Ctrl+Shift+G)
2. Stage files (+ icon)
3. Type commit message
4. Press Ctrl+Enter to commit
5. Click "..." → Push to push to GitHub

### Best Practice
```
Use Cursor's UI for viewing changes
Use command line for complex operations
```

---

## 📱 Quick Status Check

### "Give me a quick overview"
```bash
git status              # What files changed
git log --oneline -5    # Last 5 commits
git branch              # What branch am I on
git remote -v           # Where does this repo push to
```

---

## 🎓 Learning More

### Built-in help
```bash
git help
git help commit
git help push
```

### Common workflow
```
1. git pull          (get latest)
2. [work on code]
3. git status        (see changes)
4. git add .         (stage all)
5. git commit -m     (commit)
6. git push          (upload)
7. [site updates automatically]
```

---

## ✅ Pre-Push Checklist

Before every `git push`:

- [ ] Did you test the changes locally?
- [ ] Did you update TASKS.md if completing a task?
- [ ] Is your commit message descriptive?
- [ ] Did you check `git status` looks right?
- [ ] Are you pushing to the right branch?

---

## 🆘 "I Don't Know What I'm Doing"

If you're confused about git state:

```bash
# This tells you everything
git status

# This shows you recent history
git log --oneline -10

# This shows what's different from GitHub
git fetch origin
git status
```

**Then ask yourself**:
- Do I have uncommitted changes? (git status shows them)
- Do I need to commit them? (git add . && git commit)
- Do I need to push? (git push)
- Do I need to pull? (git pull)

---

## 💡 Pro Tips

1. **Commit often**: Small commits are easier to understand and undo
2. **Pull before starting**: Always start with `git pull`
3. **Test before pushing**: Make sure your code works
4. **Descriptive messages**: "TASK-007: Complete" is better than "updates"
5. **Push at end of day**: Don't leave uncommitted work
6. **Check the site**: After pushing, verify site updated correctly

---

## 🎉 Common Success Patterns

### Pattern 1: Single Task Workflow
```bash
git pull                                    # Start fresh
# [Complete TASK-007]
git add .
git commit -m "TASK-007: Complete"
git push
# ✅ Done! Site updates automatically
```

### Pattern 2: Multiple Small Changes
```bash
git pull
# [Fix bug in dashboard]
git add .
git commit -m "Fix: Dashboard metric calculation"
# [Update styles]
git add css/
git commit -m "Style: Improve mobile responsiveness"
# [Update docs]
git add TASKS.md
git commit -m "Docs: Mark TASK-007 complete"
git push
# ✅ All three commits pushed at once
```

### Pattern 3: End of Day Save
```bash
git add .
git commit -m "EOD: Completed TASK-010, TASK-011. TASK-012 in progress (50%)"
git push
# ✅ Everything saved and backed up to GitHub
```

---

**Print this card and keep it by your desk!** 📄

---

**Remember**: 
- `git status` is your friend - use it constantly!
- When in doubt, commit and push - it's backed up on GitHub
- You can always revert if something breaks
- GitHub Pages updates automatically within 1-2 minutes of push

**Your live demo site**:
```
https://YOUR-USERNAME.github.io/oti-management-system/
```
