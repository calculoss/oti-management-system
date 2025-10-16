/**
 * OTI Form View - OTI Management System
 * 
 * Handles the add/edit OTI form including validation,
 * auto-calculations, and form submission.
 */

import { formatDate, formatNumber, truncateText } from './utils.js';

/**
 * OTIFormView class for rendering add/edit OTI form
 */
class OTIFormView {
  constructor(container, otiService, otiId = null) {
    this.container = container;
    this.otiService = otiService;
    this.otiId = otiId; // null for add, ID for edit
    this.otiData = null;
    this.otiTypes = [];
    this.teams = [];
    this.priorities = {};
    this.formData = {};
    this.currentStep = 1;
    this.totalSteps = 5;
    this.workflowTemplates = [];
    this.buildingBlocks = [];
    this.selectedWorkflowType = 'none'; // 'none', 'template', 'custom'
    this.selectedTemplateId = null;
    this.customWorkflowBlocks = [];
  }

  /**
   * Initialize OTI form view
   */
  async init() {
    try {
      console.log(`📝 Initializing OTI Form (${this.otiId ? 'Edit' : 'Add'} mode)...`);
      
      // Load required data
      await this.loadFormData();
      
      this.render();
      this.setupEventListeners();
      this.populateForm();
      
      console.log('✅ OTI Form initialized');
      
    } catch (error) {
      console.error('❌ Error initializing OTI form:', error);
      this.showError('Failed to initialize form');
    }
  }

  /**
   * Load all required data for the form
   */
  async loadFormData() {
    try {
      this.otiTypes = await this.otiService.dataManager.loadJSON('config/oti-types.json');
      this.teams = await this.otiService.dataManager.loadJSON('config/teams.json');
      const priorityData = await this.otiService.dataManager.loadJSON('config/priorities.json');
      this.priorities = priorityData.priorities;
      
      // Load workflow data
      this.workflowTemplates = await this.otiService.getAllWorkflowTemplates();
      this.buildingBlocks = await this.otiService.getAllBuildingBlocks();
      
      // Check if a template was pre-selected (from "Use Template" button)
      const preSelectedTemplate = sessionStorage.getItem('selectedTemplate');
      if (preSelectedTemplate) {
        this.selectedWorkflowType = 'template';
        this.selectedTemplateId = preSelectedTemplate;
        sessionStorage.removeItem('selectedTemplate');
      }
      
      // Load existing OTI data if editing
      if (this.otiId) {
        this.otiData = await this.otiService.getOTIById(this.otiId);
        if (!this.otiData) {
          throw new Error('OTI not found');
        }
        
        // Load existing workflow data
        if (this.otiData.workflow) {
          this.selectedWorkflowType = this.otiData.workflowType || 'custom';
          if (this.otiData.workflow.templateId) {
            this.selectedTemplateId = this.otiData.workflow.templateId;
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading form data:', error);
      throw error;
    }
  }

  /**
   * Render OTI form view
   */
  render() {
    const isEdit = !!this.otiId;
    
    this.container.innerHTML = `
      <div class="oti-form">
        <div class="form-header">
          <h1 class="form-title">${isEdit ? 'Edit OTI' : 'Add New OTI'}</h1>
          <p class="form-subtitle">${isEdit ? `Editing ${this.otiData?.id}` : 'Create a new Operational Technology Initiative'}</p>
        </div>

        <!-- Progress Indicator -->
        <div class="form-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
          </div>
          <div class="progress-steps">
            <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
              <span class="step-number">1</span>
              <span class="step-label">Basic Info</span>
            </div>
            <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
              <span class="step-number">2</span>
              <span class="step-label">Teams</span>
            </div>
            <div class="step ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}">
              <span class="step-number">3</span>
              <span class="step-label">Business Context</span>
            </div>
            <div class="step ${this.currentStep >= 4 ? 'active' : ''} ${this.currentStep > 4 ? 'completed' : ''}">
              <span class="step-number">4</span>
              <span class="step-label">Workflow</span>
            </div>
            <div class="step ${this.currentStep >= 5 ? 'active' : ''} ${this.currentStep > 5 ? 'completed' : ''}">
              <span class="step-number">5</span>
              <span class="step-label">Review</span>
            </div>
          </div>
        </div>

        <!-- Form Container -->
        <div class="form-container">
          <form id="oti-form" class="multi-step-form">
            
            <!-- Step 1: Basic Information -->
            <div class="form-step ${this.currentStep === 1 ? 'active' : ''}" data-step="1">
              <div class="step-header">
                <h2 class="step-title">Basic Information</h2>
                <p class="step-description">Provide the essential details for this OTI</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="title" class="form-label required">Title</label>
                  <input type="text" id="title" name="title" class="form-input" maxlength="100" required>
                  <div class="form-help">Brief, descriptive title (max 100 characters)</div>
                  <div class="form-error" id="title-error"></div>
                </div>

                <div class="form-group full-width">
                  <label for="description" class="form-label required">Description</label>
                  <textarea id="description" name="description" class="form-textarea" rows="4" required></textarea>
                  <div class="form-help">Detailed description of the OTI requirements and scope</div>
                  <div class="form-error" id="description-error"></div>
                </div>

                <div class="form-group">
                  <label for="otiType" class="form-label required">OTI Type</label>
                  <select id="otiType" name="otiType" class="form-select" required>
                    <option value="">Select OTI Type...</option>
                  </select>
                  <div class="form-help">Choose the type that best fits this request</div>
                  <div class="form-error" id="otiType-error"></div>
                </div>

                <div class="form-group">
                  <label for="priority" class="form-label required">Priority</label>
                  <select id="priority" name="priority" class="form-select" required>
                    <option value="">Select Priority...</option>
                  </select>
                  <div class="form-help">Priority level affects target completion date</div>
                  <div class="form-error" id="priority-error"></div>
                </div>
              </div>
            </div>

            <!-- Step 2: Requestor & Teams -->
            <div class="form-step ${this.currentStep === 2 ? 'active' : ''}" data-step="2">
              <div class="step-header">
                <h2 class="step-title">Requestor & Teams</h2>
                <p class="step-description">Define who requested this and which teams will be involved</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="requestorName" class="form-label required">Requestor Name</label>
                  <input type="text" id="requestorName" name="requestorName" class="form-input" required>
                  <div class="form-error" id="requestorName-error"></div>
                </div>

                <div class="form-group">
                  <label for="requestorEmail" class="form-label required">Requestor Email</label>
                  <input type="email" id="requestorEmail" name="requestorEmail" class="form-input" required>
                  <div class="form-error" id="requestorEmail-error"></div>
                </div>

                <div class="form-group">
                  <label for="requestorDepartment" class="form-label">Department</label>
                  <input type="text" id="requestorDepartment" name="requestorDepartment" class="form-input">
                  <div class="form-help">Requestor's department or business area</div>
                </div>

                <div class="form-group">
                  <label for="leadTeam" class="form-label required">Lead Team</label>
                  <select id="leadTeam" name="leadTeam" class="form-select" required>
                    <option value="">Select Lead Team...</option>
                  </select>
                  <div class="form-help">Auto-populated based on OTI type</div>
                  <div class="form-error" id="leadTeam-error"></div>
                </div>

                <div class="form-group">
                  <label for="leadCoordinator" class="form-label required">Lead Coordinator</label>
                  <select id="leadCoordinator" name="leadCoordinator" class="form-select" required>
                    <option value="">Select Coordinator...</option>
                  </select>
                  <div class="form-help">Team member responsible for coordination</div>
                  <div class="form-error" id="leadCoordinator-error"></div>
                </div>

                <div class="form-group full-width">
                  <label for="supportingTeams" class="form-label">Supporting Teams</label>
                  <div class="checkbox-group" id="supportingTeams">
                    <!-- Supporting teams checkboxes will be populated here -->
                  </div>
                  <div class="form-help">Additional teams that may be involved</div>
                </div>
              </div>
            </div>

            <!-- Step 3: Business Context -->
            <div class="form-step ${this.currentStep === 3 ? 'active' : ''}" data-step="3">
              <div class="step-header">
                <h2 class="step-title">Business Context</h2>
                <p class="step-description">Provide business justification and context</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="businessJustification" class="form-label required">Business Justification</label>
                  <textarea id="businessJustification" name="businessJustification" class="form-textarea" rows="4" required></textarea>
                  <div class="form-help">Explain why this OTI is needed and its business value</div>
                  <div class="form-error" id="businessJustification-error"></div>
                </div>

                <div class="form-group full-width">
                  <label for="expectedBenefits" class="form-label">Expected Benefits</label>
                  <textarea id="expectedBenefits" name="expectedBenefits" class="form-textarea" rows="3"></textarea>
                  <div class="form-help">Describe the expected outcomes and benefits</div>
                </div>

                <div class="form-group full-width">
                  <label for="dependencies" class="form-label">Dependencies & Constraints</label>
                  <textarea id="dependencies" name="dependencies" class="form-textarea" rows="3"></textarea>
                  <div class="form-help">Any dependencies, constraints, or special considerations</div>
                </div>
              </div>
            </div>

            <!-- Step 4: Workflow Selection -->
            <div class="form-step ${this.currentStep === 4 ? 'active' : ''}" data-step="4">
              <div class="step-header">
                <h2 class="step-title">Workflow Setup</h2>
                <p class="step-description">Choose how this OTI will be managed</p>
              </div>
              
              <div class="form-grid">
                <!-- Workflow Type Selection -->
                <div class="form-group full-width">
                  <label class="form-label">Workflow Type</label>
                  <div class="workflow-options">
                    <div class="workflow-option ${this.selectedWorkflowType === 'none' ? 'selected' : ''}" data-workflow-type="none">
                      <input type="radio" name="workflowType" value="none" id="workflow-none" ${this.selectedWorkflowType === 'none' ? 'checked' : ''}>
                      <label for="workflow-none">
                        <div class="option-icon">🚫</div>
                        <div class="option-title">No Workflow</div>
                        <div class="option-description">Manual progress tracking only</div>
                      </label>
                    </div>
                    
                    <div class="workflow-option ${this.selectedWorkflowType === 'template' ? 'selected' : ''}" data-workflow-type="template">
                      <input type="radio" name="workflowType" value="template" id="workflow-template" ${this.selectedWorkflowType === 'template' ? 'checked' : ''}>
                      <label for="workflow-template">
                        <div class="option-icon">📋</div>
                        <div class="option-title">Use Template</div>
                        <div class="option-description">Apply a pre-configured workflow</div>
                      </label>
                    </div>
                    
                    <div class="workflow-option ${this.selectedWorkflowType === 'custom' ? 'selected' : ''}" data-workflow-type="custom">
                      <input type="radio" name="workflowType" value="custom" id="workflow-custom" ${this.selectedWorkflowType === 'custom' ? 'checked' : ''}>
                      <label for="workflow-custom">
                        <div class="option-icon">⚙️</div>
                        <div class="option-title">Custom Workflow</div>
                        <div class="option-description">Build a custom workflow from blocks</div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Template Selection (shown when template is selected) -->
                <div class="form-group full-width ${this.selectedWorkflowType === 'template' ? '' : 'hidden'}" id="template-selection">
                  <label for="templateSelect" class="form-label">Select Template</label>
                  <select id="templateSelect" class="form-select">
                    <option value="">Choose a template...</option>
                    ${this.workflowTemplates.map(template => `
                      <option value="${template.id}" ${this.selectedTemplateId === template.id ? 'selected' : ''}>
                        ${template.name} (${template.blocks.length} blocks, ${template.estimatedTotalDays} days)
                      </option>
                    `).join('')}
                  </select>
                  
                  <!-- Template Preview -->
                  <div id="template-preview" class="template-preview ${this.selectedTemplateId ? '' : 'hidden'}">
                    ${this.selectedTemplateId ? this.renderTemplatePreview(this.selectedTemplateId) : ''}
                  </div>
                </div>

                <!-- Custom Workflow Builder (shown when custom is selected) -->
                <div class="form-group full-width ${this.selectedWorkflowType === 'custom' ? '' : 'hidden'}" id="custom-workflow-section">
                  <div class="workflow-builder">
                    <div class="builder-header">
                      <label class="form-label">Build Custom Workflow</label>
                      <button type="button" class="btn btn-sm btn-secondary" id="addCustomBlockBtn">
                        ➕ Add Block
                      </button>
                    </div>
                    
                    <div id="custom-blocks-container" class="custom-blocks-container">
                      ${this.customWorkflowBlocks.length === 0 ? 
                        '<div class="empty-workflow">No blocks added yet. Click "Add Block" to start building your workflow.</div>' : 
                        this.customWorkflowBlocks.map((block, index) => this.renderCustomBlockForm(block, index)).join('')
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Review & Summary -->
            <div class="form-step ${this.currentStep === 5 ? 'active' : ''}" data-step="5">
              <div class="step-header">
                <h2 class="step-title">Review & Submit</h2>
                <p class="step-description">Review your OTI details before submitting</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group full-width">
                  <div class="info-card">
                    <h3 class="info-title">Summary</h3>
                    <div class="summary-item">
                      <span class="summary-label">Target Completion:</span>
                      <span class="summary-value" id="targetDateSummary">-</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Estimated Duration:</span>
                      <span class="summary-value" id="durationSummary">-</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Lead Team:</span>
                      <span class="summary-value" id="leadTeamSummary">-</span>
                    </div>
                    ${this.selectedWorkflowType !== 'none' ? `
                      <div class="summary-item">
                        <span class="summary-label">Workflow:</span>
                        <span class="summary-value" id="workflowSummary">-</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <div class="form-actions-left">
            ${this.currentStep > 1 ? '<button type="button" id="prev-btn" class="button button-outline">Previous</button>' : ''}
            <a href="#oti-list" class="button button-outline">Cancel</a>
          </div>
          <div class="form-actions-right">
            ${this.currentStep < this.totalSteps ? 
              '<button type="button" id="next-btn" class="button button-primary">Next</button>' : 
              `<button type="submit" id="submit-btn" class="button button-primary">${isEdit ? 'Update OTI' : 'Create OTI'}</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Step navigation
    document.getElementById('next-btn')?.addEventListener('click', () => this.nextStep());
    document.getElementById('prev-btn')?.addEventListener('click', () => this.prevStep());
    
    // Form submission
    document.getElementById('oti-form').addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Auto-calculations
    document.getElementById('otiType')?.addEventListener('change', () => this.handleTypeChange());
    document.getElementById('priority')?.addEventListener('change', () => this.handlePriorityChange());
    document.getElementById('leadTeam')?.addEventListener('change', () => this.handleLeadTeamChange());
    
    // Workflow type selection
    document.querySelectorAll('input[name="workflowType"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.handleWorkflowTypeChange(e.target.value));
    });
    
    // Template selection
    document.getElementById('templateSelect')?.addEventListener('change', (e) => this.handleTemplateSelect(e.target.value));
    
    // Custom workflow: Add block button
    document.getElementById('addCustomBlockBtn')?.addEventListener('click', () => this.addCustomBlock());
    
    // Custom workflow: Block actions (move up/down, remove)
    document.querySelectorAll('.custom-block-item [data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleCustomBlockAction(e));
    });
    
    // Real-time validation
    const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Populate form with data
   */
  populateForm() {
    // Populate OTI types
    const otiTypeSelect = document.getElementById('otiType');
    this.otiTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.id;
      option.textContent = type.name;
      otiTypeSelect.appendChild(option);
    });

    // Populate priorities
    const prioritySelect = document.getElementById('priority');
    Object.entries(this.priorities).forEach(([key, priority]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = priority.name;
      prioritySelect.appendChild(option);
    });

    // Populate teams
    const leadTeamSelect = document.getElementById('leadTeam');
    this.teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team.name;
      option.textContent = team.name;
      leadTeamSelect.appendChild(option);
    });

    // Populate supporting teams
    this.populateSupportingTeams();

    // Populate form with existing data if editing
    if (this.otiData) {
      this.populateEditData();
    }

    // Update summary
    this.updateSummary();
  }

  /**
   * Populate supporting teams checkboxes
   */
  populateSupportingTeams() {
    const container = document.getElementById('supportingTeams');
    container.innerHTML = '';
    
    this.teams.forEach(team => {
      const checkbox = document.createElement('div');
      checkbox.className = 'checkbox-item';
      checkbox.innerHTML = `
        <input type="checkbox" id="supporting-${team.id}" name="supportingTeams" value="${team.name}">
        <label for="supporting-${team.id}">${team.name}</label>
      `;
      container.appendChild(checkbox);
    });
  }

  /**
   * Populate form with existing OTI data for editing
   */
  populateEditData() {
    const data = this.otiData;
    
    // Basic info
    document.getElementById('title').value = data.title || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('otiType').value = data.otiType || '';
    document.getElementById('priority').value = data.priority || '';
    
    // Requestor & teams
    document.getElementById('requestorName').value = data.requestor?.name || '';
    document.getElementById('requestorEmail').value = data.requestor?.email || '';
    document.getElementById('requestorDepartment').value = data.requestor?.department || '';
    document.getElementById('leadTeam').value = data.leadTeam || '';
    document.getElementById('leadCoordinator').value = data.leadCoordinator || '';
    
    // Business context
    document.getElementById('businessJustification').value = data.businessJustification || '';
    document.getElementById('expectedBenefits').value = data.expectedBenefits || '';
    document.getElementById('dependencies').value = data.dependencies || '';
    
    // Integration
    
    // Supporting teams
    if (data.supportingTeams) {
      data.supportingTeams.forEach(teamName => {
        const checkbox = document.querySelector(`input[name="supportingTeams"][value="${teamName}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    // Trigger change events to populate dependent fields
    this.handleTypeChange();
    this.handleLeadTeamChange();
  }

  /**
   * Handle OTI type change
   */
  handleTypeChange() {
    const typeId = document.getElementById('otiType').value;
    const selectedType = this.otiTypes.find(type => type.id === typeId);
    
    if (selectedType) {
      // Auto-populate lead team
      document.getElementById('leadTeam').value = selectedType.leadTeam;
      
      // Auto-populate supporting teams
      this.clearSupportingTeams();
      if (selectedType.supportingTeams) {
        selectedType.supportingTeams.forEach(teamName => {
          const checkbox = document.querySelector(`input[name="supportingTeams"][value="${teamName}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Update lead coordinator options
      this.handleLeadTeamChange();
    }
    
    this.updateSummary();
  }

  /**
   * Handle priority change
   */
  handlePriorityChange() {
    this.updateSummary();
  }

  /**
   * Handle lead team change
   */
  handleLeadTeamChange() {
    const leadTeam = document.getElementById('leadTeam').value;
    const leadCoordinatorSelect = document.getElementById('leadCoordinator');
    
    // Clear existing options
    leadCoordinatorSelect.innerHTML = '<option value="">Select Coordinator...</option>';
    
    // Find team and populate coordinators
    const team = this.teams.find(t => t.name === leadTeam);
    if (team && team.members) {
      team.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.name;
        option.textContent = `${member.name} (${member.role})`;
        leadCoordinatorSelect.appendChild(option);
      });
    }
    
    this.updateSummary();
  }

  /**
   * Clear supporting teams selection
   */
  clearSupportingTeams() {
    document.querySelectorAll('input[name="supportingTeams"]').forEach(checkbox => {
      checkbox.checked = false;
    });
  }

  /**
   * Update summary information
   */
  updateSummary() {
    const typeId = document.getElementById('otiType').value;
    const priority = document.getElementById('priority').value;
    const leadTeam = document.getElementById('leadTeam').value;
    
    // Update target date
    let targetDays = 0;
    if (typeId && priority) {
      const selectedType = this.otiTypes.find(type => type.id === typeId);
      if (selectedType && selectedType.targetDays) {
        targetDays = selectedType.targetDays[priority] || 0;
      }
    }
    
    const targetDate = targetDays > 0 ? this.calculateTargetDate(targetDays) : '-';
    document.getElementById('targetDateSummary').textContent = targetDate;
    
    // Update duration
    document.getElementById('durationSummary').textContent = targetDays > 0 ? `${targetDays} days` : '-';
    
    // Update lead team
    document.getElementById('leadTeamSummary').textContent = leadTeam || '-';
  }

  /**
   * Calculate target completion date
   */
  calculateTargetDate(targetDays) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + targetDays);
    return formatDate(targetDate);
  }

  /**
   * Navigate to next step
   */
  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      this.render();
      this.setupEventListeners();
      this.populateForm();
    }
  }

  /**
   * Navigate to previous step
   */
  prevStep() {
    this.currentStep--;
    this.render();
    this.setupEventListeners();
    this.populateForm();
  }

  /**
   * Validate current step
   */
  validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Validate individual field
   */
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldName === 'requestorEmail' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    // Title length validation
    if (fieldName === 'title' && value && value.length > 100) {
      isValid = false;
      errorMessage = 'Title must be 100 characters or less';
    }
    
    // Show/hide error
    this.showFieldError(field, errorMessage);
    
    return isValid;
  }

  /**
   * Show field error
   */
  showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
    
    if (message) {
      field.classList.add('error');
    } else {
      field.classList.remove('error');
    }
  }

  /**
   * Clear field error
   */
  clearFieldError(field) {
    this.showFieldError(field, '');
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    // Validate all steps
    if (!this.validateAllSteps()) {
      return;
    }
    
    try {
      // Show loading state
      this.setLoadingState(true);
      
      // Collect form data
      const formData = this.collectFormData();
      
      // Submit data
      if (this.otiId) {
        // Update existing OTI
        await this.otiService.updateOTI(this.otiId, formData);
        console.log('✅ OTI updated successfully');
      } else {
        // Create new OTI
        const newOTI = await this.otiService.createOTI(formData);
        console.log('✅ OTI created successfully:', newOTI.id);
      }
      
      // Redirect to OTI list
      window.location.hash = '#oti-list';
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      this.showError('Failed to save OTI. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Validate all steps
   */
  validateAllSteps() {
    let isValid = true;
    
    for (let step = 1; step <= this.totalSteps; step++) {
      const stepElement = document.querySelector(`[data-step="${step}"]`);
      const requiredFields = stepElement.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
    }
    
    return isValid;
  }

  /**
   * Collect form data
   */
  collectFormData() {
    const form = document.getElementById('oti-form');
    const formData = new FormData(form);
    
    // Collect supporting teams
    const supportingTeams = [];
    document.querySelectorAll('input[name="supportingTeams"]:checked').forEach(checkbox => {
      supportingTeams.push(checkbox.value);
    });
    
    // Collect task IDs
    
    // Calculate target completion date
    const typeId = document.getElementById('otiType').value;
    const priority = document.getElementById('priority').value;
    const selectedType = this.otiTypes.find(type => type.id === typeId);
    let targetCompletionDate = null;
    
    if (selectedType && selectedType.targetDays && selectedType.targetDays[priority]) {
      const targetDays = selectedType.targetDays[priority];
      const today = new Date();
      targetCompletionDate = new Date(today);
      targetCompletionDate.setDate(today.getDate() + targetDays);
      targetCompletionDate = targetCompletionDate.toISOString().split('T')[0];
    }
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      otiType: formData.get('otiType'),
      priority: formData.get('priority'),
      requestor: {
        name: formData.get('requestorName'),
        email: formData.get('requestorEmail'),
        department: formData.get('requestorDepartment')
      },
      leadTeam: formData.get('leadTeam'),
      leadCoordinator: formData.get('leadCoordinator'),
      supportingTeams: supportingTeams,
      businessJustification: formData.get('businessJustification'),
      expectedBenefits: formData.get('expectedBenefits'),
      dependencies: formData.get('dependencies'),
      targetCompletionDate: targetCompletionDate,
      dateSubmitted: this.otiId ? this.otiData.dateSubmitted : new Date().toISOString().split('T')[0]
    };

    // Add workflow data if applicable
    if (this.selectedWorkflowType !== 'none') {
      data.workflowType = this.selectedWorkflowType;
      
      if (this.selectedWorkflowType === 'template' && this.selectedTemplateId) {
        // Create workflow from template
        data.workflow = this.otiService.createWorkflowFromTemplate(this.selectedTemplateId);
      } else if (this.selectedWorkflowType === 'custom' && this.customWorkflowBlocks.length > 0) {
        // Create custom workflow
        const customBlocks = this.customWorkflowBlocks.map((block, index) => ({
          blockId: block.blockId,
          sequence: index + 1,
          assignedTo: null,
          status: index === 0 ? 'waiting' : 'waiting',
          startDate: null,
          completedDate: null,
          actualDays: null,
          notes: block.notes || '',
          completionNotes: '',
          customDuration: block.customDuration,
          estimatedDays: block.customDuration || this.buildingBlocks.find(b => b.id === block.blockId)?.estimatedDays || 0,
          checklistProgress: {
            completed: [],
            total: this.buildingBlocks.find(b => b.id === block.blockId)?.checklistItems?.length || 0
          }
        }));

        const totalEstimatedDays = customBlocks.reduce((sum, b) => sum + b.estimatedDays, 0);

        data.workflow = {
          blocks: customBlocks,
          overallProgress: 0,
          currentBlock: 1,
          blocksCompleted: 0,
          blocksTotal: customBlocks.length
        };
      }
    }

    return data;
  }

  /**
   * Set loading state
   */
  setLoadingState(loading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'Saving...' : (this.otiId ? 'Update OTI' : 'Create OTI');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Handle workflow type change
   */
  handleWorkflowTypeChange(type) {
    this.selectedWorkflowType = type;
    
    // Show/hide appropriate sections
    const templateSection = document.getElementById('template-selection');
    const customSection = document.getElementById('custom-workflow-section');
    
    if (type === 'template') {
      templateSection?.classList.remove('hidden');
      customSection?.classList.add('hidden');
    } else if (type === 'custom') {
      templateSection?.classList.add('hidden');
      customSection?.classList.remove('hidden');
    } else {
      templateSection?.classList.add('hidden');
      customSection?.classList.add('hidden');
    }
    
    // Update visual selection
    document.querySelectorAll('.workflow-option').forEach(option => {
      option.classList.remove('selected');
    });
    document.querySelector(`[data-workflow-type="${type}"]`)?.classList.add('selected');
  }

  /**
   * Handle template selection
   */
  handleTemplateSelect(templateId) {
    this.selectedTemplateId = templateId || null;
    
    const previewContainer = document.getElementById('template-preview');
    if (!previewContainer) return;
    
    if (templateId) {
      previewContainer.innerHTML = this.renderTemplatePreview(templateId);
      previewContainer.classList.remove('hidden');
    } else {
      previewContainer.classList.add('hidden');
    }
  }

  /**
   * Add a custom workflow block
   */
  addCustomBlock() {
    const newBlock = {
      blockId: '',
      sequence: this.customWorkflowBlocks.length + 1,
      customDuration: null,
      notes: ''
    };
    
    this.customWorkflowBlocks.push(newBlock);
    
    // Re-render the custom blocks section
    const container = document.getElementById('custom-blocks-container');
    if (container) {
      container.innerHTML = this.customWorkflowBlocks.map((block, index) => 
        this.renderCustomBlockForm(block, index)
      ).join('');
      
      // Reattach event listeners
      this.setupCustomBlockListeners();
    }
  }

  /**
   * Handle custom block actions (move up/down, remove)
   */
  handleCustomBlockAction(e) {
    const action = e.currentTarget.dataset.action;
    const index = parseInt(e.currentTarget.dataset.index);
    
    e.stopPropagation();
    
    switch (action) {
      case 'move-up':
        this.moveCustomBlock(index, -1);
        break;
      case 'move-down':
        this.moveCustomBlock(index, 1);
        break;
      case 'remove':
        this.removeCustomBlock(index);
        break;
    }
  }

  /**
   * Move a custom block up or down
   */
  moveCustomBlock(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.customWorkflowBlocks.length) return;
    
    // Swap the blocks
    [this.customWorkflowBlocks[index], this.customWorkflowBlocks[newIndex]] = 
    [this.customWorkflowBlocks[newIndex], this.customWorkflowBlocks[index]];
    
    // Update sequences
    this.customWorkflowBlocks.forEach((block, idx) => {
      block.sequence = idx + 1;
    });
    
    // Re-render
    const container = document.getElementById('custom-blocks-container');
    if (container) {
      container.innerHTML = this.customWorkflowBlocks.map((block, idx) => 
        this.renderCustomBlockForm(block, idx)
      ).join('');
      
      this.setupCustomBlockListeners();
    }
  }

  /**
   * Remove a custom block
   */
  removeCustomBlock(index) {
    this.customWorkflowBlocks.splice(index, 1);
    
    // Update sequences
    this.customWorkflowBlocks.forEach((block, idx) => {
      block.sequence = idx + 1;
    });
    
    // Re-render
    const container = document.getElementById('custom-blocks-container');
    if (container) {
      if (this.customWorkflowBlocks.length === 0) {
        container.innerHTML = '<div class="empty-workflow">No blocks added yet. Click "Add Block" to start building your workflow.</div>';
      } else {
        container.innerHTML = this.customWorkflowBlocks.map((block, idx) => 
          this.renderCustomBlockForm(block, idx)
        ).join('');
        
        this.setupCustomBlockListeners();
      }
    }
  }

  /**
   * Setup event listeners for custom block items
   */
  setupCustomBlockListeners() {
    document.querySelectorAll('.custom-block-item [data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleCustomBlockAction(e));
    });
    
    // Update block data when selects change
    document.querySelectorAll('.custom-block-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.customWorkflowBlocks[index].blockId = e.target.value;
        
        // Update the block name display
        const blockItem = document.querySelector(`[data-block-index="${index}"]`);
        const buildingBlock = this.buildingBlocks.find(b => b.id === e.target.value);
        if (blockItem && buildingBlock) {
          blockItem.querySelector('.custom-block-name').textContent = buildingBlock.name;
        }
      });
    });
  }

  /**
   * Render template preview
   */
  renderTemplatePreview(templateId) {
    const template = this.workflowTemplates.find(t => t.id === templateId);
    if (!template) return '';

    return `
      <div class="template-preview-card">
        <div class="preview-header">
          <h4>${template.name}</h4>
          <span class="preview-badge">${template.blocks.length} blocks • ${template.estimatedTotalDays} days</span>
        </div>
        <p class="preview-description">${template.description}</p>
        <div class="preview-blocks">
          ${template.blocks.map((block, index) => {
            const buildingBlock = this.buildingBlocks.find(b => b.id === block.blockId);
            if (!buildingBlock) return '';
            return `
              <div class="preview-block" style="border-left: 3px solid ${buildingBlock.color}">
                <div class="preview-block-header">
                  <span class="preview-block-sequence">#${index + 1}</span>
                  <span class="preview-block-icon">${buildingBlock.icon}</span>
                  <span class="preview-block-name">${buildingBlock.name}</span>
                  <span class="preview-block-duration">${block.customDuration || buildingBlock.estimatedDays} days</span>
                </div>
                ${block.notes ? `<div class="preview-block-notes">${block.notes}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render custom workflow block form
   */
  renderCustomBlockForm(block, index) {
    const buildingBlock = this.buildingBlocks.find(b => b.id === block.blockId);
    
    return `
      <div class="custom-block-item" data-block-index="${index}">
        <div class="custom-block-header">
          <span class="custom-block-sequence">#${index + 1}</span>
          <span class="custom-block-name">${buildingBlock?.name || 'Select Block'}</span>
          <div class="custom-block-actions">
            <button type="button" class="btn-icon" data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-icon" data-action="move-down" data-index="${index}">↓</button>
            <button type="button" class="btn-icon" data-action="remove" data-index="${index}">🗑️</button>
          </div>
        </div>
        <div class="custom-block-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Building Block *</label>
              <select name="customBlockId[]" class="form-select custom-block-select" data-index="${index}" required>
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
                name="customBlockDuration[]" 
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
              name="customBlockNotes[]" 
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
   * Destroy view
   */
  destroy() {
    // Clean up event listeners and DOM modifications
    console.log('🧹 Destroying OTI Form view');
  }
}

export default OTIFormView;
