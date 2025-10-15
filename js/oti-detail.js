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
              <div class="progress-details">
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
   * Destroy view and cleanup
   */
  destroy() {
    // Cleanup any event listeners or resources
  }
}

// Export for use in other modules
export default OTIDetailView;
