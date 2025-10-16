/**
 * OTI Detail View - OTI Management System
 * 
 * Handles the OTI detail view including information display,
 * progress tracking, timeline, notes, and detail-specific functionality.
 */

import { formatDate, formatNumber, formatPercentage } from './utils.js';

/**
 * OTIDetailView class for rendering OTI details
 */
class OTIDetailView {
  constructor(container, otiService, otiId) {
    this.container = container;
    this.otiService = otiService;
    this.otiId = otiId;
    this.oti = null;
  }

  /**
   * Initialize OTI detail view
   */
  async init() {
    try {
      console.log(`📄 Initializing OTI Detail for ${this.otiId}...`);
      
      // Load OTI data
      this.oti = this.otiService.getOTIById(this.otiId);
      
      if (!this.oti) {
        this.showNotFound();
        return;
      }

      this.render();
      this.setupEventListeners();
      
      console.log('✅ OTI Detail initialized');
      
    } catch (error) {
      console.error('❌ Error initializing OTI detail:', error);
      this.showError('Failed to load OTI details');
    }
  }

  /**
   * Render OTI detail view
   */
  render() {
    if (!this.oti) return;

    this.container.innerHTML = `
      <div class="oti-detail">
        <!-- OTI Header -->
        <div class="oti-detail-header">
          <div class="header-top">
            <div class="header-info">
              <div class="oti-id-large">${this.oti.id}</div>
              <h1 class="oti-title-large">${this.oti.title}</h1>
              <div class="header-badges">
                <span class="badge badge-${this.getOTITypeClass(this.oti.otiType)}">${this.getOTITypeName(this.oti.otiType)}</span>
                <span class="badge badge-${this.oti.priority}">${this.formatPriorityLabel(this.oti.priority)}</span>
                <span class="badge badge-${this.oti.status}">${this.formatStatusLabel(this.oti.status)}</span>
              </div>
            </div>
            <div class="header-actions">
              <a href="#edit-oti/${this.oti.id}" class="button button-outline" id="edit-oti-btn">Edit</a>
              <button class="button button-secondary" id="change-status-btn">Change Status</button>
              <button class="button button-primary" id="add-note-btn">Add Note</button>
              ${this.oti.status !== 'stalled' ? `<button class="button button-secondary" id="mark-stalled-btn">Mark as Stalled</button>` : ''}
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="oti-detail-content">
          <div class="oti-main-info">
            <!-- Description Card -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Description</h2>
              </div>
              <div class="info-value description">${this.oti.description || 'No description provided'}</div>
            </div>

            <!-- Business Context Card -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Business Context</h2>
              </div>
              <div class="info-section">
                <div class="info-label">Business Justification</div>
                <div class="info-value">${this.oti.businessJustification || 'No justification provided'}</div>
              </div>
              ${this.oti.expectedBenefits ? `
                <div class="info-section">
                  <div class="info-label">Expected Benefits</div>
                  <div class="info-value">${this.oti.expectedBenefits}</div>
                </div>
              ` : ''}
              ${this.oti.dependencies ? `
                <div class="info-section">
                  <div class="info-label">Dependencies & Constraints</div>
                  <div class="info-value">${this.oti.dependencies}</div>
                </div>
              ` : ''}
            </div>

            <!-- Requestor Information -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Requestor Information</h2>
              </div>
              <div class="requestor-info">
                <div class="requestor-avatar">
                  ${this.getInitials(this.oti.requestor?.name || 'Unknown')}
                </div>
                <div class="requestor-details">
                  <div class="requestor-name">${this.oti.requestor?.name || 'Unknown'}</div>
                  ${this.oti.requestor?.email ? `
                    <a href="mailto:${this.oti.requestor.email}" class="requestor-email">${this.oti.requestor.email}</a>
                  ` : ''}
                  ${this.oti.requestor?.department ? `
                    <div class="requestor-department">${this.oti.requestor.department}</div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Team Information -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Team Assignment</h2>
              </div>
              <div class="team-info">
                <div class="team-item">
                  <div class="team-label">Lead Team</div>
                  <div class="team-name">${this.oti.leadTeam}</div>
                </div>
                ${this.oti.leadCoordinator ? `
                  <div class="team-item">
                    <div class="team-label">Lead Coordinator</div>
                    <div class="team-name">${this.oti.leadCoordinator}</div>
                  </div>
                ` : ''}
                ${this.oti.supportingTeams && this.oti.supportingTeams.length > 0 ? `
                  <div class="team-item">
                    <div class="team-label">Supporting Teams</div>
                    <div class="supporting-teams">
                      ${this.oti.supportingTeams.map(team => `
                        <span class="team-tag">${team}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Timeline/History -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Timeline & History</h2>
              </div>
              <div class="timeline" id="status-timeline">
                ${this.renderTimeline()}
              </div>
            </div>

            <!-- Notes Section -->
            <div class="notes-section">
              <div class="info-card-header">
                <h2 class="info-card-title">Notes & Comments</h2>
              </div>
              <div class="notes-list" id="notes-list">
                ${this.renderNotes()}
              </div>
              <div class="note-form" id="note-form" style="display: none;">
                <textarea class="note-textarea" id="note-textarea" placeholder="Add a note..."></textarea>
                <div class="note-form-actions">
                  <button class="button button-secondary" id="cancel-note-btn">Cancel</button>
                  <button class="button button-primary" id="save-note-btn">Save Note</button>
                </div>
              </div>
            </div>
          </div>

          <div class="oti-sidebar">
            <!-- Progress Section -->
            <div class="progress-section">
              <div class="progress-header">
                <h2 class="info-card-title">Progress</h2>
              </div>
              <div class="progress-percentage">${this.oti.progressPercentage || 0}%</div>
              <div class="progress-bar-large">
                <div class="progress-fill-large ${this.getProgressClass(this.oti.progressPercentage || 0)}" 
                     style="width: ${this.oti.progressPercentage || 0}%"></div>
              </div>
              
              <!-- Progress Update Control -->
              <div class="progress-update-control" style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
                <label for="progress-slider" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  Update Progress
                </label>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input 
                    type="range" 
                    id="progress-slider" 
                    min="0" 
                    max="100" 
                    step="5" 
                    value="${this.oti.progressPercentage || 0}"
                    style="flex: 1;"
                  />
                  <span id="progress-display" style="font-weight: 600; min-width: 3rem; text-align: right;">
                    ${this.oti.progressPercentage || 0}%
                  </span>
                </div>
                <button id="update-progress-btn" class="button button-primary" style="width: 100%; margin-top: 0.75rem;">
                  💾 Update Progress
                </button>
              </div>

              <div class="progress-details" style="margin-top: 1rem;">
                <div class="progress-detail">
                  <div class="progress-detail-value">${this.otiService.calculateDaysActive(this.oti)}</div>
                  <div class="progress-detail-label">Days Active</div>
                </div>
                <div class="progress-detail">
                  <div class="progress-detail-value">${this.getTaskSummary()}</div>
                  <div class="progress-detail-label">Tasks</div>
                </div>
              </div>
              ${this.oti.serviceNowParentId ? `
                <div style="margin-top: 1rem;">
                  <a href="#" class="servicenow-link" target="_blank">
                    <span>📋</span>
                    View in ServiceNow
                  </a>
                </div>
              ` : ''}
            </div>

            <!-- Status Change Section -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Change Status</h2>
              </div>
              <div class="status-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                <button class="status-btn ${this.oti.status === 'received' ? 'status-active' : ''}" data-status="received" style="padding: 0.5rem; border: 2px solid #e5e7eb; border-radius: 0.375rem; background: ${this.oti.status === 'received' ? '#3b82f6' : 'white'}; color: ${this.oti.status === 'received' ? 'white' : '#374151'}; font-weight: 500; cursor: pointer;">
                  📥 Received
                </button>
                <button class="status-btn ${this.oti.status === 'in-progress' ? 'status-active' : ''}" data-status="in-progress" style="padding: 0.5rem; border: 2px solid #e5e7eb; border-radius: 0.375rem; background: ${this.oti.status === 'in-progress' ? '#3b82f6' : 'white'}; color: ${this.oti.status === 'in-progress' ? 'white' : '#374151'}; font-weight: 500; cursor: pointer;">
                  ⚙️ In Progress
                </button>
                <button class="status-btn ${this.oti.status === 'stalled' ? 'status-active' : ''}" data-status="stalled" style="padding: 0.5rem; border: 2px solid #e5e7eb; border-radius: 0.375rem; background: ${this.oti.status === 'stalled' ? '#ef4444' : 'white'}; color: ${this.oti.status === 'stalled' ? 'white' : '#374151'}; font-weight: 500; cursor: pointer;">
                  ⚠️ Stalled
                </button>
                <button class="status-btn ${this.oti.status === 'done' ? 'status-active' : ''}" data-status="done" style="padding: 0.5rem; border: 2px solid #e5e7eb; border-radius: 0.375rem; background: ${this.oti.status === 'done' ? '#10b981' : 'white'}; color: ${this.oti.status === 'done' ? 'white' : '#374151'}; font-weight: 500; cursor: pointer;">
                  ✅ Done
                </button>
              </div>
              <div id="status-note-section" style="display: none;">
                <label for="status-note" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                  Status Change Note (required)
                </label>
                <textarea 
                  id="status-note" 
                  rows="3" 
                  placeholder="Why are you changing the status?"
                  style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; margin-bottom: 0.75rem;"
                ></textarea>
                <div style="display: flex; gap: 0.5rem;">
                  <button id="cancel-status-btn" class="button button-secondary" style="flex: 1;">
                    Cancel
                  </button>
                  <button id="confirm-status-btn" class="button button-primary" style="flex: 1;">
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>

            <!-- Key Dates -->
            <div class="info-card">
              <div class="info-card-header">
                <h2 class="info-card-title">Key Dates</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Submitted</div>
                  <div class="info-value">${formatDate(this.oti.dateSubmitted)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Target Completion</div>
                  <div class="info-value ${this.otiService.isOverdue(this.oti) ? 'text-error' : ''}">
                    ${formatDate(this.oti.targetCompletionDate)}
                    ${this.otiService.isOverdue(this.oti) ? ' (Overdue)' : ''}
                  </div>
                </div>
                ${this.oti.actualCompletionDate ? `
                  <div class="info-item">
                    <div class="info-label">Actual Completion</div>
                    <div class="info-value text-success">${formatDate(this.oti.actualCompletionDate)}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- ServiceNow Integration -->
            ${this.oti.serviceNowParentId || (this.oti.taskIds && this.oti.taskIds.length > 0) ? `
              <div class="info-card">
                <div class="info-card-header">
                  <h2 class="info-card-title">ServiceNow Integration</h2>
                </div>
                ${this.oti.serviceNowParentId ? `
                  <div class="info-section">
                    <div class="info-label">Parent Incident</div>
                    <div class="info-value">${this.oti.serviceNowParentId}</div>
                  </div>
                ` : ''}
                ${this.oti.taskIds && this.oti.taskIds.length > 0 ? `
                  <div class="info-section">
                    <div class="info-label">Task IDs</div>
                    <div class="info-value">${this.oti.taskIds.join(', ')}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render timeline/history
   */
  renderTimeline() {
    if (!this.oti.statusHistory || this.oti.statusHistory.length === 0) {
      return '<div class="empty-state">No status history available</div>';
    }

    return this.oti.statusHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(entry => `
        <div class="timeline-item status-change">
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-status">${this.formatStatusLabel(entry.status)}</span>
              <span class="timeline-date">${formatDate(entry.date, 'datetime')}</span>
            </div>
            ${entry.notes ? `<div class="timeline-notes">${entry.notes}</div>` : ''}
            ${entry.updatedBy ? `<div class="timeline-author">Updated by: ${entry.updatedBy}</div>` : ''}
          </div>
        </div>
      `).join('');
  }

  /**
   * Render notes
   */
  renderNotes() {
    if (!this.oti.notes || this.oti.notes.length === 0) {
      return '<div class="empty-state">No notes yet. Add the first note below.</div>';
    }

    return this.oti.notes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(note => `
        <div class="note-item">
          <div class="note-header">
            <span class="note-author">${note.author}</span>
            <span class="note-date">${formatDate(note.date, 'datetime')}</span>
          </div>
          <div class="note-content">${note.text}</div>
        </div>
      `).join('');
  }

  /**
   * Get task summary text
   */
  getTaskSummary() {
    if (!this.oti.taskIds || this.oti.taskIds.length === 0) {
      return 'No tasks';
    }
    
    // In a real implementation, this would check ServiceNow for task completion
    // For now, return a placeholder
    return `${this.oti.taskIds.length} tasks`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Progress slider - update display as user moves slider
    const progressSlider = document.getElementById('progress-slider');
    const progressDisplay = document.getElementById('progress-display');
    if (progressSlider && progressDisplay) {
      progressSlider.addEventListener('input', (e) => {
        progressDisplay.textContent = `${e.target.value}%`;
      });
    }

    // Update progress button
    const updateProgressBtn = document.getElementById('update-progress-btn');
    if (updateProgressBtn) {
      updateProgressBtn.addEventListener('click', () => {
        this.handleProgressUpdate();
      });
    }

    // Status change buttons
    const statusButtons = document.querySelectorAll('.status-btn');
    let selectedStatus = null;
    
    statusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newStatus = btn.dataset.status;
        
        // Don't allow changing to current status
        if (newStatus === this.oti.status) {
          return;
        }
        
        // Show note section
        selectedStatus = newStatus;
        document.getElementById('status-note-section').style.display = 'block';
        
        // Highlight selected button
        statusButtons.forEach(b => {
          b.style.opacity = b === btn ? '1' : '0.5';
        });
      });
    });

    // Cancel status change
    const cancelStatusBtn = document.getElementById('cancel-status-btn');
    if (cancelStatusBtn) {
      cancelStatusBtn.addEventListener('click', () => {
        document.getElementById('status-note-section').style.display = 'none';
        document.getElementById('status-note').value = '';
        statusButtons.forEach(b => {
          b.style.opacity = '1';
        });
        selectedStatus = null;
      });
    }

    // Confirm status change
    const confirmStatusBtn = document.getElementById('confirm-status-btn');
    if (confirmStatusBtn) {
      confirmStatusBtn.addEventListener('click', () => {
        if (selectedStatus) {
          this.handleStatusChange(selectedStatus);
        }
      });
    }

    // Edit button
    const editBtn = document.getElementById('edit-oti-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.handleEdit();
      });
    }

    // Change status button
    const changeStatusBtn = document.getElementById('change-status-btn');
    if (changeStatusBtn) {
      changeStatusBtn.addEventListener('click', () => {
        this.showStatusChangeModal();
      });
    }

    // Add note button
    const addNoteBtn = document.getElementById('add-note-btn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        this.showNoteForm();
      });
    }

    // Mark as stalled button
    const markStalledBtn = document.getElementById('mark-stalled-btn');
    if (markStalledBtn) {
      markStalledBtn.addEventListener('click', () => {
        this.handleMarkAsStalled();
      });
    }

    // Note form actions
    const cancelNoteBtn = document.getElementById('cancel-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteTextarea = document.getElementById('note-textarea');

    if (cancelNoteBtn) {
      cancelNoteBtn.addEventListener('click', () => {
        this.hideNoteForm();
      });
    }

    if (saveNoteBtn && noteTextarea) {
      saveNoteBtn.addEventListener('click', () => {
        this.handleSaveNote();
      });
    }
  }

  /**
   * Handle edit OTI
   */
  handleEdit() {
    // Navigate to edit form (to be implemented in Phase 4)
    window.location.hash = `#edit-oti/${this.otiId}`;
  }

  /**
   * Show status change modal
   */
  showStatusChangeModal() {
    // Create simple status change form
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Change Status</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>New Status</label>
            <select id="new-status-select">
              <option value="received">Received</option>
              <option value="in-progress">In Progress</option>
              <option value="stalled">Stalled</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="status-change-notes" placeholder="Add notes about this status change..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button button-secondary modal-cancel">Cancel</button>
          <button class="button button-primary modal-save">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set current status as selected
    const statusSelect = modal.querySelector('#new-status-select');
    if (statusSelect) {
      statusSelect.value = this.oti.status;
    }

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('.modal-cancel').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('.modal-save').addEventListener('click', async () => {
      const newStatus = statusSelect.value;
      const notes = modal.querySelector('#status-change-notes').value;

      try {
        await this.otiService.changeStatus(this.otiId, newStatus, notes, 'Current User');
        this.oti = this.otiService.getOTIById(this.otiId);
        this.render();
        document.body.removeChild(modal);
      } catch (error) {
        console.error('❌ Error changing status:', error);
        alert('Failed to change status. Please try again.');
      }
    });
  }

  /**
   * Show note form
   */
  showNoteForm() {
    const noteForm = document.getElementById('note-form');
    if (noteForm) {
      noteForm.style.display = 'block';
      document.getElementById('note-textarea').focus();
    }
  }

  /**
   * Hide note form
   */
  hideNoteForm() {
    const noteForm = document.getElementById('note-form');
    if (noteForm) {
      noteForm.style.display = 'none';
      document.getElementById('note-textarea').value = '';
    }
  }

  /**
   * Handle save note
   */
  async handleSaveNote() {
    const noteTextarea = document.getElementById('note-textarea');
    const noteText = noteTextarea.value.trim();

    if (!noteText) {
      alert('Please enter a note');
      return;
    }

    try {
      await this.otiService.addNote(this.otiId, noteText, 'Current User');
      this.oti = this.otiService.getOTIById(this.otiId);
      this.render();
      this.hideNoteForm();
    } catch (error) {
      console.error('❌ Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  }

  /**
   * Handle mark as stalled
   */
  async handleMarkAsStalled() {
    if (confirm('Are you sure you want to mark this OTI as stalled? This will trigger escalation procedures.')) {
      try {
        await this.otiService.changeStatus(this.otiId, 'stalled', 'Marked as stalled by user', 'Current User');
        this.oti = this.otiService.getOTIById(this.otiId);
        this.render();
      } catch (error) {
        console.error('❌ Error marking as stalled:', error);
        alert('Failed to mark as stalled. Please try again.');
      }
    }
  }

  /**
   * Get initials from name
   */
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Get OTI type display name
   */
  getOTITypeName(typeId) {
    const otiType = this.otiService.getOTIType(typeId);
    return otiType ? otiType.name : typeId;
  }

  /**
   * Get OTI type CSS class
   */
  getOTITypeClass(typeId) {
    // Simple class based on type
    const classes = {
      'software-purchase': 'primary',
      'system-enhancement': 'primary',
      'data-reporting': 'success',
      'website-digital': 'info',
      'hardware-equipment': 'warning',
      'ai-solutions': 'primary',
      'process-automation': 'primary',
      'spatial-gis': 'success',
      'professional-services': 'info',
      'custom-solution': 'warning'
    };
    return classes[typeId] || 'secondary';
  }

  /**
   * Get progress bar class
   */
  getProgressClass(progress) {
    if (progress >= 75) return 'high';
    if (progress >= 50) return 'medium';
    return 'low';
  }

  /**
   * Format priority label
   */
  formatPriorityLabel(priority) {
    const labels = {
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || priority;
  }

  /**
   * Format status label
   */
  formatStatusLabel(status) {
    const labels = {
      'received': 'Received',
      'in-progress': 'In Progress',
      'stalled': 'Stalled',
      'done': 'Done'
    };
    return labels[status] || status;
  }

  /**
   * Show not found message
   */
  showNotFound() {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>404 - OTI Not Found</h2>
        <p>The OTI with ID "${this.otiId}" could not be found.</p>
        <a href="#oti-list" class="button button-primary">Back to OTI List</a>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>⚠️ OTI Detail Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="button button-primary">Refresh Page</button>
      </div>
    `;
  }

  /**
   * Handle progress update
   */
  async handleProgressUpdate() {
    const progressSlider = document.getElementById('progress-slider');
    const newProgress = parseInt(progressSlider.value);
    
    if (newProgress === this.oti.progressPercentage) {
      alert('Progress value has not changed.');
      return;
    }

    // Show confirmation
    if (!confirm(`Update progress from ${this.oti.progressPercentage}% to ${newProgress}%?`)) {
      return;
    }

    try {
      // Update progress
      const updatedOTI = await this.otiService.updateProgress(
        this.otiId,
        newProgress,
        'Current User' // In production, get from auth system
      );

      // Reload data and re-render
      this.oti = updatedOTI;
      
      // Show success message
      alert(`✅ Progress updated to ${newProgress}%`);
      
      // Reload the page to show updated data
      await this.init();
      
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  }

  /**
   * Handle status change
   */
  async handleStatusChange(newStatus) {
    const statusNote = document.getElementById('status-note').value.trim();
    
    if (!statusNote) {
      alert('Please provide a note explaining the status change.');
      return;
    }

    try {
      // Update status
      const updatedOTI = await this.otiService.updateStatus(
        this.otiId,
        newStatus,
        statusNote,
        'Current User' // In production, get from auth system
      );

      // Reload data and re-render
      this.oti = updatedOTI;
      
      // Show success message
      alert(`✅ Status changed to ${newStatus}`);
      
      // Reload the page to show updated data
      await this.init();
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  }

  /**
   * Destroy view and cleanup
   */
  destroy() {
    // Cleanup any event listeners or resources
  }
}

// Export for use in other modules
export default OTIDetailView;
