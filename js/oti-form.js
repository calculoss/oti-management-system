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
    this.totalSteps = 4;
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
      
      // Load existing OTI data if editing
      if (this.otiId) {
        this.otiData = await this.otiService.getOTIById(this.otiId);
        if (!this.otiData) {
          throw new Error('OTI not found');
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
              <span class="step-label">Integration</span>
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

            <!-- Step 4: Integration -->
            <div class="form-step ${this.currentStep === 4 ? 'active' : ''}" data-step="4">
              <div class="step-header">
                <h2 class="step-title">ServiceNow Integration</h2>
                <p class="step-description">Link to existing ServiceNow records (optional)</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="serviceNowParentId" class="form-label">ServiceNow Parent ID</label>
                  <input type="text" id="serviceNowParentId" name="serviceNowParentId" class="form-input">
                  <div class="form-help">Parent incident or request number</div>
                </div>

                <div class="form-group">
                  <label for="taskIds" class="form-label">Task IDs</label>
                  <input type="text" id="taskIds" name="taskIds" class="form-input">
                  <div class="form-help">Comma-separated list of related task IDs</div>
                </div>

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
    document.getElementById('serviceNowParentId').value = data.serviceNowParentId || '';
    document.getElementById('taskIds').value = data.taskIds?.join(', ') || '';
    
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
    const taskIds = [];
    const taskIdsInput = document.getElementById('taskIds').value;
    if (taskIdsInput) {
      taskIdsInput.split(',').forEach(id => {
        const trimmedId = id.trim();
        if (trimmedId) taskIds.push(trimmedId);
      });
    }
    
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
    
    return {
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
      serviceNowParentId: formData.get('serviceNowParentId'),
      taskIds: taskIds,
      targetCompletionDate: targetCompletionDate,
      dateSubmitted: this.otiId ? this.otiData.dateSubmitted : new Date().toISOString().split('T')[0]
    };
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
   * Destroy view
   */
  destroy() {
    // Clean up event listeners and DOM modifications
    console.log('🧹 Destroying OTI Form view');
  }
}

export default OTIFormView;
