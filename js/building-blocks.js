/**
 * Building Blocks View - OTI Management System
 * 
 * Manages display and CRUD operations for reusable building block components
 */

import { formatDate } from './utils.js';

class BuildingBlocksView {
  constructor(container, otiService) {
    this.container = container;
    this.otiService = otiService;
    this.currentFilter = 'all'; // all, Security, Development, etc.
    this.editingBlockId = null;
  }

  /**
   * Initialize the view
   */
  async init() {
    console.log('🧱 Initializing Building Blocks view...');
    await this.render();
    this.setupEventListeners();
    console.log('✅ Building Blocks view initialized');
  }

  /**
   * Render the building blocks view
   */
  async render() {
    const blocks = this.otiService.getAllBuildingBlocks();
    const filteredBlocks = this.filterBlocks(blocks);
    const categories = this.getCategories(blocks);

    this.container.innerHTML = `
      <div class="building-blocks-view">
        <div class="view-header">
          <div>
            <h1 class="view-title">Building Blocks Library</h1>
            <p class="view-subtitle">Reusable workflow components for OTI management</p>
          </div>
          <button id="add-block-btn" class="button button-primary">+ New Building Block</button>
        </div>

        <div class="filter-bar">
          <label for="category-filter">Category:</label>
          <select id="category-filter" class="filter-select">
            <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Categories</option>
            ${categories.map(cat => `
              <option value="${cat}" ${this.currentFilter === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
          <span class="filter-count">${filteredBlocks.length} block${filteredBlocks.length !== 1 ? 's' : ''}</span>
        </div>

        <div class="blocks-grid">
          ${filteredBlocks.length > 0 ? filteredBlocks.map(block => this.renderBlockCard(block)).join('') : `
            <div class="empty-state">
              <p>No building blocks found${this.currentFilter !== 'all' ? ' in this category' : ''}.</p>
              <button class="button button-primary" onclick="document.getElementById('add-block-btn').click()">
                Create Your First Block
              </button>
            </div>
          `}
        </div>

        <!-- Add/Edit Modal -->
        <div id="block-modal" class="modal" style="display: none;">
          <div class="modal-content modal-large">
            <div class="modal-header">
              <h2 class="modal-title" id="modal-title">Add Building Block</h2>
              <button class="modal-close" id="close-modal">&times;</button>
            </div>
            <div class="modal-body">
              ${this.renderBlockForm()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a single building block card
   */
  renderBlockCard(block) {
    return `
      <div class="block-card" data-block-id="${block.id}">
        <div class="block-card-header" style="background: ${block.color}; color: white;">
          <span class="block-icon">${block.icon}</span>
          <span class="block-category">${block.category}</span>
        </div>
        <div class="block-card-body">
          <h3 class="block-title">${block.name}</h3>
          <p class="block-description">${block.description}</p>
          <div class="block-meta">
            <div class="meta-item">
              <span class="meta-label">Team:</span>
              <span class="meta-value">${block.team}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Duration:</span>
              <span class="meta-value">${block.estimatedDays} day${block.estimatedDays !== 1 ? 's' : ''}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Used in:</span>
              <span class="meta-value">${block.usageCount} OTI${block.usageCount !== 1 ? 's' : ''}</span>
            </div>
            ${block.required ? '<div class="block-badge block-badge-required">Required</div>' : ''}
            ${block.canRunInParallel ? '<div class="block-badge block-badge-parallel">Can Run in Parallel</div>' : ''}
          </div>
        </div>
        <div class="block-card-footer">
          <button class="button button-secondary button-sm edit-block-btn" data-block-id="${block.id}">Edit</button>
          <button class="button button-outline button-sm view-usage-btn" data-block-id="${block.id}">View Usage</button>
          <button class="button button-danger button-sm delete-block-btn" data-block-id="${block.id}">Archive</button>
        </div>
      </div>
    `;
  }

  /**
   * Render the add/edit block form
   */
  renderBlockForm() {
    const block = this.editingBlockId ? this.otiService.getBuildingBlockById(this.editingBlockId) : null;
    const teams = this.otiService.teams;
    
    return `
      <form id="block-form" class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="block-name">Block Name *</label>
            <input type="text" id="block-name" class="form-input" required 
              value="${block?.name || ''}" placeholder="e.g., Cyber Security Review">
          </div>
          <div class="form-group">
            <label for="block-category">Category *</label>
            <select id="block-category" class="form-input" required>
              <option value="">Select category...</option>
              <option value="Security" ${block?.category === 'Security' ? 'selected' : ''}>Security</option>
              <option value="Development" ${block?.category === 'Development' ? 'selected' : ''}>Development</option>
              <option value="Infrastructure" ${block?.category === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
              <option value="Procurement" ${block?.category === 'Procurement' ? 'selected' : ''}>Procurement</option>
              <option value="Testing" ${block?.category === 'Testing' ? 'selected' : ''}>Testing</option>
              <option value="Deployment" ${block?.category === 'Deployment' ? 'selected' : ''}>Deployment</option>
              <option value="Documentation" ${block?.category === 'Documentation' ? 'selected' : ''}>Documentation</option>
              <option value="Training" ${block?.category === 'Training' ? 'selected' : ''}>Training</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="block-description">Description *</label>
          <textarea id="block-description" class="form-input" rows="3" required 
            placeholder="Brief description of what this block involves">${block?.description || ''}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="block-team">Responsible Team *</label>
            <select id="block-team" class="form-input" required>
              <option value="">Select team...</option>
              ${teams.map(team => `
                <option value="${team.id}" ${block?.team === team.id ? 'selected' : ''}>${team.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="block-duration">Estimated Duration (days) *</label>
            <input type="number" id="block-duration" class="form-input" min="1" max="90" required 
              value="${block?.estimatedDays || 3}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="block-icon">Icon (emoji)</label>
            <input type="text" id="block-icon" class="form-input" maxlength="2" 
              value="${block?.icon || '🔧'}" placeholder="🔧">
          </div>
          <div class="form-group">
            <label for="block-color">Color</label>
            <input type="color" id="block-color" class="form-input" 
              value="${block?.color || '#009BDB'}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="block-sla-warning">SLA Warning (days)</label>
            <input type="number" id="block-sla-warning" class="form-input" min="1" 
              value="${block?.slaWarningDays || 2}"
              placeholder="Alert if block takes longer than this">
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="block-required" ${block?.required ? 'checked' : ''}>
            <span>Required block (cannot be skipped)</span>
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="block-parallel" ${block?.canRunInParallel ? 'checked' : ''}>
            <span>Can run in parallel with other blocks</span>
          </label>
        </div>

        <div class="form-group">
          <label for="block-checklist">Checklist Items (one per line)</label>
          <textarea id="block-checklist" class="form-input" rows="5" 
            placeholder="Review architecture diagram&#10;Assess data flows&#10;Evaluate vendor">${block?.checklistItems?.join('\n') || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="block-outputs">Expected Outputs (comma-separated)</label>
          <textarea id="block-outputs" class="form-input" rows="2" 
            placeholder="Security approval document, Risk assessment report">${block?.outputs?.join(', ') || ''}</textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="button button-secondary" id="cancel-block-form">Cancel</button>
          <button type="submit" class="button button-primary">
            ${block ? 'Update' : 'Create'} Building Block
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add block button
    const addBtn = document.getElementById('add-block-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.editingBlockId = null;
        this.showModal();
      });
    }

    // Category filter
    const filterSelect = document.getElementById('category-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.render();
        this.setupEventListeners();
      });
    }

    // Edit buttons
    document.querySelectorAll('.edit-block-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.editingBlockId = e.target.dataset.blockId;
        this.showModal();
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-block-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleDeleteBlock(e.target.dataset.blockId);
      });
    });

    // View usage buttons
    document.querySelectorAll('.view-usage-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.showBlockUsage(e.target.dataset.blockId);
      });
    });

    // Modal close
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideModal());
    }

    // Cancel form
    const cancelBtn = document.getElementById('cancel-block-form');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideModal());
    }

    // Form submit
    const form = document.getElementById('block-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Close modal on backdrop click
    const modal = document.getElementById('block-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal();
        }
      });
    }
  }

  /**
   * Show the add/edit modal
   */
  showModal() {
    const modal = document.getElementById('block-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.textContent = this.editingBlockId ? 'Edit Building Block' : 'Add Building Block';
    modalBody.innerHTML = this.renderBlockForm();
    
    modal.style.display = 'flex';
    
    // Re-setup form event listeners
    this.setupEventListeners();
  }

  /**
   * Hide the modal
   */
  hideModal() {
    const modal = document.getElementById('block-modal');
    modal.style.display = 'none';
    this.editingBlockId = null;
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit() {
    try {
      const formData = {
        name: document.getElementById('block-name').value.trim(),
        category: document.getElementById('block-category').value,
        description: document.getElementById('block-description').value.trim(),
        team: document.getElementById('block-team').value,
        estimatedDays: parseInt(document.getElementById('block-duration').value),
        icon: document.getElementById('block-icon').value || '🔧',
        color: document.getElementById('block-color').value,
        slaWarningDays: parseInt(document.getElementById('block-sla-warning').value) || 2,
        required: document.getElementById('block-required').checked,
        canRunInParallel: document.getElementById('block-parallel').checked,
        checklistItems: document.getElementById('block-checklist').value
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        outputs: document.getElementById('block-outputs').value
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        prerequisites: [], // Will be managed in advanced editor later
        createdBy: 'Current User' // Replace with actual user when auth is implemented
      };

      if (this.editingBlockId) {
        await this.otiService.updateBuildingBlock(this.editingBlockId, formData);
        alert('✅ Building block updated successfully!');
      } else {
        await this.otiService.createBuildingBlock(formData);
        alert('✅ Building block created successfully!');
      }

      this.hideModal();
      await this.render();
      this.setupEventListeners();

    } catch (error) {
      console.error('❌ Error saving building block:', error);
      alert('Failed to save building block. Please try again.');
    }
  }

  /**
   * Handle delete block
   */
  async handleDeleteBlock(blockId) {
    const block = this.otiService.getBuildingBlockById(blockId);
    if (!block) return;

    if (block.usageCount > 0) {
      const confirmMsg = `This block is used in ${block.usageCount} workflow template(s). Archiving it will not affect existing OTIs, but it won't be available for new workflows. Continue?`;
      if (!confirm(confirmMsg)) return;
    } else {
      if (!confirm(`Archive building block "${block.name}"?`)) return;
    }

    try {
      await this.otiService.deleteBuildingBlock(blockId);
      alert('✅ Building block archived successfully!');
      await this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Error deleting building block:', error);
      alert('Failed to archive building block. Please try again.');
    }
  }

  /**
   * Show block usage modal
   */
  showBlockUsage(blockId) {
    const block = this.otiService.getBuildingBlockById(blockId);
    if (!block) return;

    // Find templates using this block
    const templates = this.otiService.getAllWorkflowTemplates()
      .filter(template => template.blocks.some(b => b.blockId === blockId));

    // Find OTIs using this block (in their workflows)
    const otis = this.otiService.getAllOTIs()
      .filter(oti => oti.workflow && oti.workflow.blocks.some(b => b.blockId === blockId));

    alert(`Building Block: ${block.name}\n\nUsed in:\n- ${templates.length} template(s)\n- ${otis.length} OTI(s)\n\nTotal usage: ${block.usageCount}`);
  }

  /**
   * Filter blocks by category
   */
  filterBlocks(blocks) {
    if (this.currentFilter === 'all') {
      return blocks;
    }
    return blocks.filter(block => block.category === this.currentFilter);
  }

  /**
   * Get unique categories from blocks
   */
  getCategories(blocks) {
    const categories = new Set(blocks.map(block => block.category));
    return Array.from(categories).sort();
  }

  /**
   * Cleanup when view is destroyed
   */
  destroy() {
    console.log('🧹 Destroying Building Blocks view');
    this.container.innerHTML = '';
  }
}

export default BuildingBlocksView;

