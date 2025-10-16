/**
 * Workflow Templates View
 * Manages the display and interaction of workflow templates
 */

export default class WorkflowTemplatesView {
  constructor(container, otiService) {
    this.container = container;
    this.otiService = otiService;
    this.templates = [];
    this.buildingBlocks = [];
    this.currentView = 'list'; // 'list' or 'form'
    this.editingTemplateId = null;
  }

  /**
   * Initialize the view
   */
  async init() {
    console.log('📋 Initializing Workflow Templates...');
    try {
      this.templates = await this.otiService.getAllWorkflowTemplates();
      this.buildingBlocks = await this.otiService.getAllBuildingBlocks();
      this.render();
      this.setupEventListeners();
      console.log('✅ Workflow Templates initialized');
    } catch (error) {
      console.error('❌ Error initializing workflow templates:', error);
      this.showError('Failed to load workflow templates');
    }
  }

  /**
   * Render the view
   */
  render() {
    if (this.currentView === 'list') {
      this.renderList();
    } else {
      this.renderForm();
    }
  }

  /**
   * Render the templates list
   */
  renderList() {
    const activeTemplates = this.templates.filter(t => t.isActive !== false);
    
    this.container.innerHTML = `
      <div class="workflow-templates-view">
        <div class="view-header">
          <div class="header-content">
            <h1 class="view-title">📋 Workflow Templates</h1>
            <p class="view-description">Create and manage reusable workflow templates</p>
          </div>
          <button class="btn btn-primary" id="addTemplateBtn">
            <span>➕</span> Create Template
          </button>
        </div>

        <div class="templates-stats">
          <div class="stat-card">
            <div class="stat-value">${activeTemplates.length}</div>
            <div class="stat-label">Active Templates</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.getTotalUsage()}</div>
            <div class="stat-label">Total Uses</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.getAverageBlocks()}</div>
            <div class="stat-label">Avg Blocks per Template</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.getAverageDuration()}</div>
            <div class="stat-label">Avg Duration (days)</div>
          </div>
        </div>

        ${activeTemplates.length === 0 ? this.renderEmptyState() : this.renderTemplateCards(activeTemplates)}
      </div>
    `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h2>No Workflow Templates Yet</h2>
        <p>Create your first workflow template to streamline OTI processing</p>
        <button class="btn btn-primary" id="addTemplateEmptyBtn">
          <span>➕</span> Create First Template
        </button>
      </div>
    `;
  }

  /**
   * Render template cards
   */
  renderTemplateCards(templates) {
    // Group templates by category
    const categories = [...new Set(templates.map(t => t.category))];
    
    return `
      <div class="templates-container">
        ${categories.map(category => `
          <div class="template-category">
            <h2 class="category-title">${this.getCategoryIcon(category)} ${category}</h2>
            <div class="template-grid">
              ${templates
                .filter(t => t.category === category)
                .map(template => this.renderTemplateCard(template))
                .join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render a single template card
   */
  renderTemplateCard(template) {
    return `
      <div class="template-card" data-template-id="${template.id}">
        <div class="template-card-header">
          <h3 class="template-name">${template.name}</h3>
          <div class="template-actions">
            <button class="btn-icon" data-action="edit" data-template-id="${template.id}" title="Edit">
              ✏️
            </button>
            <button class="btn-icon" data-action="duplicate" data-template-id="${template.id}" title="Duplicate">
              📋
            </button>
            <button class="btn-icon" data-action="delete" data-template-id="${template.id}" title="Delete">
              🗑️
            </button>
          </div>
        </div>
        
        <p class="template-description">${template.description}</p>
        
        <div class="template-stats">
          <div class="template-stat">
            <span class="stat-icon">📦</span>
            <span class="stat-text">${template.blocks.length} blocks</span>
          </div>
          <div class="template-stat">
            <span class="stat-icon">⏱️</span>
            <span class="stat-text">${template.estimatedTotalDays} days</span>
          </div>
          <div class="template-stat">
            <span class="stat-icon">📊</span>
            <span class="stat-text">Used ${template.usageCount || 0}x</span>
          </div>
        </div>

        <div class="template-blocks-preview">
          ${template.blocks.slice(0, 3).map((block, index) => {
            const buildingBlock = this.buildingBlocks.find(b => b.id === block.blockId);
            return buildingBlock ? `
              <div class="block-chip" style="background: ${buildingBlock.color}20; color: ${buildingBlock.color};">
                ${buildingBlock.icon} ${buildingBlock.name}
              </div>
            ` : '';
          }).join('')}
          ${template.blocks.length > 3 ? `
            <div class="block-chip more">
              +${template.blocks.length - 3} more
            </div>
          ` : ''}
        </div>

        <div class="template-footer">
          <span class="template-date">Created ${this.formatDate(template.createdDate)}</span>
          <button class="btn btn-sm btn-primary" data-action="use" data-template-id="${template.id}">
            Use Template
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render the form for creating/editing a template
   */
  renderForm() {
    const template = this.editingTemplateId 
      ? this.templates.find(t => t.id === this.editingTemplateId)
      : null;

    const isEdit = !!template;

    this.container.innerHTML = `
      <div class="workflow-templates-form">
        <div class="form-header">
          <button class="btn-back" id="backToListBtn">
            ← Back to Templates
          </button>
          <h1 class="form-title">${isEdit ? 'Edit' : 'Create'} Workflow Template</h1>
        </div>

        <form id="templateForm" class="template-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h2 class="section-title">Basic Information</h2>
            
            <div class="form-group">
              <label for="templateName" class="form-label">Template Name *</label>
              <input 
                type="text" 
                id="templateName" 
                name="name" 
                class="form-input" 
                placeholder="e.g., Standard Software Procurement"
                value="${template?.name || ''}"
                required
              >
            </div>

            <div class="form-group">
              <label for="templateDescription" class="form-label">Description *</label>
              <textarea 
                id="templateDescription" 
                name="description" 
                class="form-input" 
                rows="3"
                placeholder="Describe what this workflow template is used for..."
                required
              >${template?.description || ''}</textarea>
            </div>

            <div class="form-group">
              <label for="templateCategory" class="form-label">Category *</label>
              <select id="templateCategory" name="category" class="form-input" required>
                <option value="">Select category...</option>
                <option value="Procurement" ${template?.category === 'Procurement' ? 'selected' : ''}>Procurement</option>
                <option value="Development" ${template?.category === 'Development' ? 'selected' : ''}>Development</option>
                <option value="Infrastructure" ${template?.category === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
                <option value="Enhancement" ${template?.category === 'Enhancement' ? 'selected' : ''}>Enhancement</option>
              </select>
            </div>
          </div>

          <!-- Building Blocks -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">Workflow Blocks</h2>
              <button type="button" class="btn btn-secondary btn-sm" id="addBlockBtn">
                ➕ Add Block
              </button>
            </div>

            <div id="blocksContainer" class="blocks-container">
              ${template?.blocks.map((block, index) => this.renderBlockForm(block, index)).join('') || 
                '<div class="empty-blocks">No blocks added yet. Click "Add Block" to get started.</div>'}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? 'Update' : 'Create'} Template
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Render a building block in the form
   */
  renderBlockForm(block, index) {
    const buildingBlock = this.buildingBlocks.find(b => b.id === block.blockId);
    
    return `
      <div class="block-form-item" data-block-index="${index}">
        <div class="block-form-header">
          <span class="block-sequence">#${block.sequence}</span>
          <span class="block-form-name">${buildingBlock?.name || 'Select Block'}</span>
          <div class="block-form-actions">
            <button type="button" class="btn-icon" data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-icon" data-action="move-down" data-index="${index}">↓</button>
            <button type="button" class="btn-icon" data-action="remove" data-index="${index}">🗑️</button>
          </div>
        </div>

        <div class="block-form-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Building Block *</label>
              <select name="blockId" class="form-input block-select" data-index="${index}" required>
                <option value="">Select a building block...</option>
                ${this.buildingBlocks
                  .filter(b => b.isActive !== false)
                  .map(b => `
                    <option value="${b.id}" ${block.blockId === b.id ? 'selected' : ''}>
                      ${b.icon} ${b.name} (${b.estimatedDays} days)
                    </option>
                  `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Custom Duration (days)</label>
              <input 
                type="number" 
                name="customDuration" 
                class="form-input" 
                placeholder="${buildingBlock?.estimatedDays || 'Auto'}"
                value="${block.customDuration || ''}"
                min="0"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea 
              name="notes" 
              class="form-input" 
              rows="2"
              placeholder="Any special instructions for this block..."
            >${block.notes || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.currentView === 'list') {
      this.setupListListeners();
    } else {
      this.setupFormListeners();
    }
  }

  /**
   * Setup list view event listeners
   */
  setupListListeners() {
    // Add template button
    const addBtn = document.getElementById('addTemplateBtn');
    const addEmptyBtn = document.getElementById('addTemplateEmptyBtn');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showForm());
    }
    if (addEmptyBtn) {
      addEmptyBtn.addEventListener('click', () => this.showForm());
    }

    // Template card actions
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleCardAction(e));
    });
  }

  /**
   * Setup form event listeners
   */
  setupFormListeners() {
    // Back button
    const backBtn = document.getElementById('backToListBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showList());
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.showList());
    }

    // Add block button
    const addBlockBtn = document.getElementById('addBlockBtn');
    if (addBlockBtn) {
      addBlockBtn.addEventListener('click', () => this.addBlock());
    }

    // Block actions (move up/down, remove)
    document.querySelectorAll('.block-form-item [data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleBlockAction(e));
    });

    // Form submission
    const form = document.getElementById('templateForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Handle card actions
   */
  async handleCardAction(e) {
    const action = e.currentTarget.dataset.action;
    const templateId = e.currentTarget.dataset.templateId;
    
    e.stopPropagation();

    switch (action) {
      case 'edit':
        this.editTemplate(templateId);
        break;
      case 'duplicate':
        await this.duplicateTemplate(templateId);
        break;
      case 'delete':
        await this.deleteTemplate(templateId);
        break;
      case 'use':
        this.useTemplate(templateId);
        break;
    }
  }

  /**
   * Handle block form actions
   */
  handleBlockAction(e) {
    const action = e.currentTarget.dataset.action;
    const index = parseInt(e.currentTarget.dataset.index);

    switch (action) {
      case 'move-up':
        this.moveBlock(index, -1);
        break;
      case 'move-down':
        this.moveBlock(index, 1);
        break;
      case 'remove':
        this.removeBlock(index);
        break;
    }
  }

  /**
   * Show the list view
   */
  showList() {
    this.currentView = 'list';
    this.editingTemplateId = null;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Show the form view
   */
  showForm(templateId = null) {
    this.currentView = 'form';
    this.editingTemplateId = templateId;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Edit a template
   */
  editTemplate(templateId) {
    this.showForm(templateId);
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`Duplicate template "${template.name}"?`)) {
      try {
        const newTemplate = {
          ...template,
          id: undefined, // Will be generated
          name: `${template.name} (Copy)`,
          usageCount: 0,
          createdDate: new Date().toISOString().split('T')[0],
          createdBy: 'Current User'
        };

        await this.otiService.createWorkflowTemplate(newTemplate);
        this.templates = await this.otiService.getAllWorkflowTemplates();
        this.render();
        this.setupEventListeners();
        alert('✅ Template duplicated successfully!');
      } catch (error) {
        console.error('Error duplicating template:', error);
        alert('Failed to duplicate template');
      }
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`Delete template "${template.name}"? This cannot be undone.`)) {
      try {
        await this.otiService.deleteWorkflowTemplate(templateId);
        this.templates = await this.otiService.getAllWorkflowTemplates();
        this.render();
        this.setupEventListeners();
        alert('✅ Template deleted successfully!');
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    }
  }

  /**
   * Use a template (navigate to create OTI with this template)
   */
  useTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    // Store template ID in session storage for use in OTI form
    sessionStorage.setItem('selectedTemplate', templateId);
    window.location.hash = '#add-oti';
  }

  /**
   * Add a new block to the form
   */
  addBlock() {
    const container = document.getElementById('blocksContainer');
    if (!container) return;

    // Remove empty state if present
    const emptyState = container.querySelector('.empty-blocks');
    if (emptyState) {
      emptyState.remove();
    }

    const currentBlocks = container.querySelectorAll('.block-form-item');
    const newIndex = currentBlocks.length;
    const newSequence = newIndex + 1;

    const newBlock = {
      blockId: '',
      sequence: newSequence,
      customDuration: null,
      notes: ''
    };

    const blockHtml = this.renderBlockForm(newBlock, newIndex);
    container.insertAdjacentHTML('beforeend', blockHtml);

    // Reattach event listeners
    this.setupFormListeners();
  }

  /**
   * Move a block up or down
   */
  moveBlock(index, direction) {
    const container = document.getElementById('blocksContainer');
    if (!container) return;

    const blocks = Array.from(container.querySelectorAll('.block-form-item'));
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= blocks.length) return;

    // Swap the blocks
    if (direction === -1) {
      blocks[index].parentNode.insertBefore(blocks[index], blocks[newIndex]);
    } else {
      blocks[index].parentNode.insertBefore(blocks[newIndex], blocks[index]);
    }

    // Update sequence numbers
    this.updateBlockSequences();
    this.setupFormListeners();
  }

  /**
   * Remove a block from the form
   */
  removeBlock(index) {
    const container = document.getElementById('blocksContainer');
    if (!container) return;

    const block = container.querySelector(`[data-block-index="${index}"]`);
    if (block) {
      block.remove();
      this.updateBlockSequences();

      // Show empty state if no blocks left
      if (container.querySelectorAll('.block-form-item').length === 0) {
        container.innerHTML = '<div class="empty-blocks">No blocks added yet. Click "Add Block" to get started.</div>';
      }

      this.setupFormListeners();
    }
  }

  /**
   * Update block sequence numbers after reordering
   */
  updateBlockSequences() {
    const container = document.getElementById('blocksContainer');
    if (!container) return;

    const blocks = container.querySelectorAll('.block-form-item');
    blocks.forEach((block, index) => {
      block.dataset.blockIndex = index;
      const sequenceSpan = block.querySelector('.block-sequence');
      if (sequenceSpan) {
        sequenceSpan.textContent = `#${index + 1}`;
      }

      // Update button states
      const moveUpBtn = block.querySelector('[data-action="move-up"]');
      const moveDownBtn = block.querySelector('[data-action="move-down"]');
      
      if (moveUpBtn) {
        moveUpBtn.dataset.index = index;
        moveUpBtn.disabled = index === 0;
      }
      if (moveDownBtn) {
        moveDownBtn.dataset.index = index;
        moveDownBtn.disabled = index === blocks.length - 1;
      }

      const removeBtn = block.querySelector('[data-action="remove"]');
      if (removeBtn) removeBtn.dataset.index = index;
    });
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const container = document.getElementById('blocksContainer');
    const blockItems = container.querySelectorAll('.block-form-item');

    // Collect blocks
    const blocks = [];
    blockItems.forEach((item, index) => {
      const blockId = item.querySelector('[name="blockId"]').value;
      if (!blockId) return; // Skip empty blocks

      const customDuration = item.querySelector('[name="customDuration"]').value;
      const notes = item.querySelector('[name="notes"]').value;

      blocks.push({
        blockId,
        sequence: index + 1,
        customDuration: customDuration ? parseInt(customDuration) : null,
        notes: notes || ''
      });
    });

    if (blocks.length === 0) {
      alert('Please add at least one building block to the workflow');
      return;
    }

    // Calculate total estimated days
    const estimatedTotalDays = blocks.reduce((total, block) => {
      if (block.customDuration) return total + block.customDuration;
      const buildingBlock = this.buildingBlocks.find(b => b.id === block.blockId);
      return total + (buildingBlock?.estimatedDays || 0);
    }, 0);

    const templateData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      blocks,
      estimatedTotalDays,
      createdDate: this.editingTemplateId 
        ? this.templates.find(t => t.id === this.editingTemplateId).createdDate
        : new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      usageCount: this.editingTemplateId 
        ? this.templates.find(t => t.id === this.editingTemplateId).usageCount
        : 0
    };

    try {
      if (this.editingTemplateId) {
        await this.otiService.updateWorkflowTemplate(this.editingTemplateId, templateData);
        alert('✅ Template updated successfully!');
      } else {
        await this.otiService.createWorkflowTemplate(templateData);
        alert('✅ Template created successfully!');
      }

      this.templates = await this.otiService.getAllWorkflowTemplates();
      this.showList();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  }

  /**
   * Get total usage across all templates
   */
  getTotalUsage() {
    return this.templates.reduce((total, t) => total + (t.usageCount || 0), 0);
  }

  /**
   * Get average blocks per template
   */
  getAverageBlocks() {
    if (this.templates.length === 0) return 0;
    const total = this.templates.reduce((sum, t) => sum + t.blocks.length, 0);
    return Math.round(total / this.templates.length);
  }

  /**
   * Get average duration
   */
  getAverageDuration() {
    if (this.templates.length === 0) return 0;
    const total = this.templates.reduce((sum, t) => sum + t.estimatedTotalDays, 0);
    return Math.round(total / this.templates.length);
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      'Procurement': '🛒',
      'Development': '💻',
      'Infrastructure': '🏗️',
      'Enhancement': '⚡'
    };
    return icons[category] || '📋';
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }

  /**
   * Destroy view and cleanup
   */
  destroy() {
    console.log('🧹 Destroying Workflow Templates view');
    this.container.innerHTML = '';
  }
}

