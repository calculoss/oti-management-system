/**
 * OTI Service - OTI Management System
 * 
 * Handles all OTI-related business logic including CRUD operations,
 * filtering, sorting, searching, and calculations.
 */

import { generateId, deepClone, isOverdue, getBusinessDaysBetween } from './utils.js';

/**
 * OTIService class for managing OTI operations
 */
class OTIService {
  constructor(dataManager, initialData = {}) {
    this.dataManager = dataManager;
    this.otis = initialData.otis || [];
    this.otiTypes = initialData.otiTypes || [];
    this.teams = initialData.teams || [];
    this.priorities = initialData.priorities || {};
    this.buildingBlocks = initialData.buildingBlocks || [];
    this.workflowTemplates = initialData.workflowTemplates || [];
  }

  /**
   * Initialize service with data
   * @param {Object} data - Initial data object
   */
  initialize(data) {
    this.otis = data.otis || [];
    this.otiTypes = data.otiTypes || [];
    this.teams = data.teams || [];
    this.priorities = data.priorities || {};
    this.buildingBlocks = data.buildingBlocks || [];
    this.workflowTemplates = data.workflowTemplates || [];
  }

  /**
   * Get all OTIs
   * @returns {Array} Array of OTI objects
   */
  getAllOTIs() {
    return deepClone(this.otis);
  }

  /**
   * Get OTI by ID
   * @param {string} id - OTI ID
   * @returns {Object|null} OTI object or null if not found
   */
  getOTIById(id) {
    const oti = this.otis.find(oti => oti.id === id);
    return oti ? deepClone(oti) : null;
  }

  /**
   * Create new OTI
   * @param {Object} otiData - OTI data
   * @returns {Promise<Object>} Created OTI with generated ID
   */
  async createOTI(otiData) {
    try {
      const newOTI = {
        id: generateId('OTI'),
        ...otiData,
        dateSubmitted: new Date().toISOString(),
        actualCompletionDate: null,
        progressPercentage: 0,
        escalationNotes: [],
        statusHistory: [{
          status: 'received',
          date: new Date().toISOString(),
          notes: 'OTI submitted and under initial assessment',
          updatedBy: otiData.submittedBy || 'System'
        }],
        notes: []
      };

      // Calculate target completion date based on priority
      if (otiData.priority && otiData.otiType) {
        const otiType = this.getOTIType(otiData.otiType);
        if (otiType && otiType.targetDays && otiType.targetDays[otiData.priority]) {
          const targetDays = otiType.targetDays[otiData.priority];
          newOTI.targetCompletionDate = this.calculateTargetDate(targetDays);
        }
      }

      this.otis.push(newOTI);
      
      // Save to data manager
      await this.dataManager.saveJSON('otis/otis.json', this.otis);
      
      console.log(`✅ Created OTI: ${newOTI.id}`);
      return deepClone(newOTI);
      
    } catch (error) {
      console.error('❌ Error creating OTI:', error);
      throw error;
    }
  }

  /**
   * Update existing OTI
   * @param {string} id - OTI ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated OTI or null if not found
   */
  async updateOTI(id, updateData) {
    try {
      const index = this.otis.findIndex(oti => oti.id === id);
      if (index === -1) {
        throw new Error(`OTI with ID ${id} not found`);
      }

      const existingOTI = this.otis[index];
      const updatedOTI = {
        ...existingOTI,
        ...updateData,
        id: existingOTI.id, // Ensure ID cannot be changed
        lastModified: new Date().toISOString()
      };

      this.otis[index] = updatedOTI;
      
      // Save to data manager
      await this.dataManager.saveJSON('otis/otis.json', this.otis);
      
      console.log(`✅ Updated OTI: ${id}`);
      return deepClone(updatedOTI);
      
    } catch (error) {
      console.error(`❌ Error updating OTI ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update OTI progress percentage
   * @param {string} id - OTI ID
   * @param {number} progressPercentage - Progress (0-100)
   * @param {string} updatedBy - Name of person updating
   * @returns {Promise<Object>} Updated OTI
   */
  async updateProgress(id, progressPercentage, updatedBy = 'System') {
    try {
      const oti = this.getOTIById(id);
      if (!oti) {
        throw new Error(`OTI with ID ${id} not found`);
      }

      // Validate progress
      const progress = Math.max(0, Math.min(100, progressPercentage));

      // Add note about progress update
      const note = {
        date: new Date().toISOString(),
        author: updatedBy,
        text: `Progress updated from ${oti.progressPercentage}% to ${progress}%`
      };

      const notes = [...(oti.notes || []), note];

      return await this.updateOTI(id, {
        progressPercentage: progress,
        notes: notes,
        lastModifiedBy: updatedBy
      });
      
    } catch (error) {
      console.error(`❌ Error updating progress for OTI ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update OTI status with history tracking
   * @param {string} id - OTI ID
   * @param {string} newStatus - New status (received|in-progress|stalled|done)
   * @param {string} statusNote - Note explaining status change
   * @param {string} updatedBy - Name of person updating
   * @returns {Promise<Object>} Updated OTI
   */
  async updateStatus(id, newStatus, statusNote, updatedBy = 'System') {
    try {
      const oti = this.getOTIById(id);
      if (!oti) {
        throw new Error(`OTI with ID ${id} not found`);
      }

      // Validate status
      const validStatuses = ['received', 'in-progress', 'stalled', 'done'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      // Add to status history
      const historyEntry = {
        status: newStatus,
        date: new Date().toISOString(),
        notes: statusNote || `Status changed to ${newStatus}`,
        updatedBy: updatedBy
      };

      const statusHistory = [...(oti.statusHistory || []), historyEntry];

      // If status is 'done', set actual completion date
      const updateData = {
        status: newStatus,
        statusHistory: statusHistory,
        lastModifiedBy: updatedBy
      };

      if (newStatus === 'done') {
        updateData.actualCompletionDate = new Date().toISOString();
        updateData.progressPercentage = 100;
      }

      return await this.updateOTI(id, updateData);
      
    } catch (error) {
      console.error(`❌ Error updating status for OTI ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete OTI
   * @param {string} id - OTI ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteOTI(id) {
    try {
      const index = this.otis.findIndex(oti => oti.id === id);
      if (index === -1) {
        throw new Error(`OTI with ID ${id} not found`);
      }

      this.otis.splice(index, 1);
      
      // Save to data manager
      await this.dataManager.saveJSON('otis/otis.json', this.otis);
      
      console.log(`✅ Deleted OTI: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error deleting OTI ${id}:`, error);
      throw error;
    }
  }

  /**
   * Filter OTIs based on criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered OTIs
   */
  filterOTIs(filters = {}) {
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

  /**
   * Search OTIs by query
   * @param {string} query - Search query
   * @returns {Array} Matching OTIs
   */
  searchOTIs(query) {
    if (!query || typeof query !== 'string') return this.otis;
    
    const lowercaseQuery = query.toLowerCase();
    
    return this.otis.filter(oti => {
      return (
        oti.id.toLowerCase().includes(lowercaseQuery) ||
        oti.title.toLowerCase().includes(lowercaseQuery) ||
        (oti.requestor && oti.requestor.name.toLowerCase().includes(lowercaseQuery)) ||
        (oti.description && oti.description.toLowerCase().includes(lowercaseQuery))
      );
    });
  }

  /**
   * Sort OTIs by field and direction
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted OTIs
   */
  sortOTIs(field, direction = 'asc') {
    return [...this.otis].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Handle nested properties
      if (field.includes('.')) {
        const keys = field.split('.');
        aVal = keys.reduce((obj, key) => obj && obj[key], a);
        bVal = keys.reduce((obj, key) => obj && obj[key], b);
      }
      
      // Handle dates
      if (field.includes('Date') || field === 'dateSubmitted') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return direction === 'asc' ? comparison : -comparison;
      }
      
      // Handle date values
      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }

  /**
   * Calculate progress percentage for OTI
   * @param {Object} oti - OTI object
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(oti) {
    // If workflow exists, calculate from workflow blocks
    if (oti.workflow && oti.workflow.blocks) {
      return this.calculateWorkflowProgress(oti.workflow);
    }
    
    // Otherwise use manual progress
    if (oti.progressPercentage !== undefined) {
      return Math.max(0, Math.min(100, oti.progressPercentage));
    }
    
    return 0;
  }

  /**
   * Calculate days active for OTI
   * @param {Object} oti - OTI object
   * @returns {number} Days active
   */
  calculateDaysActive(oti) {
    if (!oti.dateSubmitted) return 0;
    
    const submittedDate = new Date(oti.dateSubmitted);
    const currentDate = new Date();
    
    return getBusinessDaysBetween(submittedDate, currentDate);
  }

  /**
   * Check if OTI is overdue
   * @param {Object} oti - OTI object
   * @returns {boolean} True if overdue
   */
  isOverdue(oti) {
    if (!oti.targetCompletionDate) return false;
    
    const targetDate = new Date(oti.targetCompletionDate);
    const currentDate = new Date();
    
    return currentDate > targetDate && oti.status !== 'done';
  }

  /**
   * Get OTI type definition
   * @param {string} typeId - OTI type ID
   * @returns {Object|null} OTI type definition
   */
  getOTIType(typeId) {
    return this.otiTypes.find(type => type.id === typeId) || null;
  }

  /**
   * Get team definition
   * @param {string} teamId - Team ID
   * @returns {Object|null} Team definition
   */
  getTeam(teamId) {
    return this.teams.find(team => team.id === teamId) || null;
  }

  /**
   * Get priority definition
   * @param {string} priorityId - Priority ID
   * @returns {Object|null} Priority definition
   */
  getPriority(priorityId) {
    return this.priorities[priorityId] || null;
  }

  /**
   * Calculate target completion date
   * @param {number} businessDays - Number of business days
   * @returns {string} ISO date string
   */
  calculateTargetDate(businessDays) {
    const today = new Date();
    const targetDate = this.addBusinessDays(today, businessDays);
    return targetDate.toISOString();
  }

  /**
   * Add business days to date
   * @param {Date} startDate - Start date
   * @param {number} businessDays - Number of business days to add
   * @returns {Date} New date
   */
  addBusinessDays(startDate, businessDays) {
    const date = new Date(startDate);
    let remaining = businessDays;
    
    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remaining--;
      }
    }
    
    return date;
  }

  /**
   * Add note to OTI
   * @param {string} otiId - OTI ID
   * @param {string} noteText - Note text
   * @param {string} author - Note author
   * @returns {Promise<Object|null>} Updated OTI or null
   */
  async addNote(otiId, noteText, author) {
    try {
      const oti = this.getOTIById(otiId);
      if (!oti) {
        throw new Error(`OTI with ID ${otiId} not found`);
      }

      const newNote = {
        date: new Date().toISOString(),
        author: author,
        text: noteText
      };

      oti.notes = oti.notes || [];
      oti.notes.push(newNote);

      return await this.updateOTI(otiId, { notes: oti.notes });
      
    } catch (error) {
      console.error(`❌ Error adding note to OTI ${otiId}:`, error);
      throw error;
    }
  }

  /**
   * Change OTI status
   * @param {string} otiId - OTI ID
   * @param {string} newStatus - New status
   * @param {string} notes - Status change notes
   * @param {string} updatedBy - User who made the change
   * @returns {Promise<Object|null>} Updated OTI or null
   */
  async changeStatus(otiId, newStatus, notes = '', updatedBy = 'System') {
    try {
      const oti = this.getOTIById(otiId);
      if (!oti) {
        throw new Error(`OTI with ID ${otiId} not found`);
      }

      const statusChange = {
        status: newStatus,
        date: new Date().toISOString(),
        notes: notes,
        updatedBy: updatedBy
      };

      oti.status = newStatus;
      oti.statusHistory = oti.statusHistory || [];
      oti.statusHistory.push(statusChange);

      // If marking as done, set completion date
      if (newStatus === 'done' && !oti.actualCompletionDate) {
        oti.actualCompletionDate = new Date().toISOString();
      }

      return await this.updateOTI(otiId, {
        status: oti.status,
        statusHistory: oti.statusHistory,
        actualCompletionDate: oti.actualCompletionDate
      });
      
    } catch (error) {
      console.error(`❌ Error changing status for OTI ${otiId}:`, error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   * @returns {Object} Dashboard metrics
   */
  getDashboardMetrics() {
    const activeOTIs = this.otis.filter(oti => oti.status !== 'done');
    const urgentOTIs = activeOTIs.filter(oti => oti.priority === 'urgent');
    const stalledOTIs = this.otis.filter(oti => oti.status === 'stalled');
    const overdueOTIs = this.otis.filter(oti => this.isOverdue(oti));
    
    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCompleted = this.otis.filter(oti => {
      if (oti.status !== 'done' || !oti.actualCompletionDate) return false;
      return new Date(oti.actualCompletionDate) >= thirtyDaysAgo;
    });
    
    const onTimeCompleted = recentCompleted.filter(oti => {
      if (!oti.targetCompletionDate) return false;
      return new Date(oti.actualCompletionDate) <= new Date(oti.targetCompletionDate);
    });
    
    const completionRate = recentCompleted.length > 0 
      ? (onTimeCompleted.length / recentCompleted.length) * 100 
      : 0;
    
    // Calculate average completion time (last 30 days)
    const avgCompletionTime = recentCompleted.length > 0
      ? recentCompleted.reduce((sum, oti) => {
          const submitted = new Date(oti.dateSubmitted);
          const completed = new Date(oti.actualCompletionDate);
          return sum + getBusinessDaysBetween(submitted, completed);
        }, 0) / recentCompleted.length
      : 0;

    return {
      totalActive: activeOTIs.length,
      urgentItems: urgentOTIs.length,
      stalledItems: stalledOTIs.length,
      overdueItems: overdueOTIs.length,
      completionRate: Math.round(completionRate),
      avgCompletionTime: Math.round(avgCompletionTime),
      totalOTIs: this.otis.length,
      completedOTIs: this.otis.filter(oti => oti.status === 'done').length
    };
  }

  // ========================================
  // BUILDING BLOCK MANAGEMENT METHODS
  // ========================================

  /**
   * Get all building blocks
   * @returns {Array} Array of building block objects
   */
  getAllBuildingBlocks() {
    return deepClone(this.buildingBlocks.filter(block => block.isActive));
  }

  /**
   * Get building block by ID
   * @param {string} id - Building block ID
   * @returns {Object|null} Building block object or null if not found
   */
  getBuildingBlockById(id) {
    const block = this.buildingBlocks.find(block => block.id === id);
    return block ? deepClone(block) : null;
  }

  /**
   * Create new building block
   * @param {Object} blockData - Building block data
   * @returns {Promise<Object>} Created building block
   */
  async createBuildingBlock(blockData) {
    try {
      const newBlock = {
        id: generateId('block'),
        ...blockData,
        createdDate: new Date().toISOString(),
        usageCount: 0,
        isActive: true
      };

      this.buildingBlocks.push(newBlock);
      
      // Save to data manager
      await this.dataManager.saveJSON('config/building-blocks.json', this.buildingBlocks);
      
      console.log(`✅ Created building block: ${newBlock.id}`);
      return deepClone(newBlock);
      
    } catch (error) {
      console.error('❌ Error creating building block:', error);
      throw error;
    }
  }

  /**
   * Update existing building block
   * @param {string} id - Building block ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated building block or null if not found
   */
  async updateBuildingBlock(id, updateData) {
    try {
      const index = this.buildingBlocks.findIndex(block => block.id === id);
      if (index === -1) {
        throw new Error(`Building block with ID ${id} not found`);
      }

      const existingBlock = this.buildingBlocks[index];
      const updatedBlock = {
        ...existingBlock,
        ...updateData,
        id: existingBlock.id // Ensure ID cannot be changed
      };

      this.buildingBlocks[index] = updatedBlock;
      
      // Save to data manager
      await this.dataManager.saveJSON('config/building-blocks.json', this.buildingBlocks);
      
      console.log(`✅ Updated building block: ${id}`);
      return deepClone(updatedBlock);
      
    } catch (error) {
      console.error(`❌ Error updating building block ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (archive) building block
   * @param {string} id - Building block ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBuildingBlock(id) {
    try {
      const index = this.buildingBlocks.findIndex(block => block.id === id);
      if (index === -1) {
        throw new Error(`Building block with ID ${id} not found`);
      }

      // Soft delete - mark as inactive
      this.buildingBlocks[index].isActive = false;
      
      // Save to data manager
      await this.dataManager.saveJSON('config/building-blocks.json', this.buildingBlocks);
      
      console.log(`✅ Archived building block: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error deleting building block ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get building blocks by category
   * @param {string} category - Category name
   * @returns {Array} Filtered building blocks
   */
  getBuildingBlocksByCategory(category) {
    return this.buildingBlocks.filter(
      block => block.isActive && block.category === category
    );
  }

  // ========================================
  // WORKFLOW TEMPLATE MANAGEMENT METHODS
  // ========================================

  /**
   * Get all workflow templates
   * @returns {Array} Array of template objects
   */
  getAllWorkflowTemplates() {
    return deepClone(this.workflowTemplates.filter(template => template.isActive));
  }

  /**
   * Get workflow template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Template object or null if not found
   */
  getWorkflowTemplateById(id) {
    const template = this.workflowTemplates.find(template => template.id === id);
    return template ? deepClone(template) : null;
  }

  /**
   * Create new workflow template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createWorkflowTemplate(templateData) {
    try {
      const newTemplate = {
        id: generateId('template'),
        ...templateData,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: 0,
        isActive: true
      };

      // Calculate estimated total days
      newTemplate.estimatedTotalDays = this.calculateTemplateEstimate(newTemplate.blocks);

      this.workflowTemplates.push(newTemplate);
      
      // Save to data manager
      await this.dataManager.saveJSON('config/workflow-templates.json', this.workflowTemplates);
      
      console.log(`✅ Created workflow template: ${newTemplate.id}`);
      return deepClone(newTemplate);
      
    } catch (error) {
      console.error('❌ Error creating workflow template:', error);
      throw error;
    }
  }

  /**
   * Update existing workflow template
   * @param {string} id - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated template or null if not found
   */
  async updateWorkflowTemplate(id, updateData) {
    try {
      const index = this.workflowTemplates.findIndex(template => template.id === id);
      if (index === -1) {
        throw new Error(`Workflow template with ID ${id} not found`);
      }

      const existingTemplate = this.workflowTemplates[index];
      const updatedTemplate = {
        ...existingTemplate,
        ...updateData,
        id: existingTemplate.id, // Ensure ID cannot be changed
        lastModified: new Date().toISOString()
      };

      // Recalculate estimated total days if blocks changed
      if (updateData.blocks) {
        updatedTemplate.estimatedTotalDays = this.calculateTemplateEstimate(updatedTemplate.blocks);
      }

      this.workflowTemplates[index] = updatedTemplate;
      
      // Save to data manager
      await this.dataManager.saveJSON('config/workflow-templates.json', this.workflowTemplates);
      
      console.log(`✅ Updated workflow template: ${id}`);
      return deepClone(updatedTemplate);
      
    } catch (error) {
      console.error(`❌ Error updating workflow template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (archive) workflow template
   * @param {string} id - Template ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteWorkflowTemplate(id) {
    try {
      const index = this.workflowTemplates.findIndex(template => template.id === id);
      if (index === -1) {
        throw new Error(`Workflow template with ID ${id} not found`);
      }

      // Soft delete - mark as inactive
      this.workflowTemplates[index].isActive = false;
      
      // Save to data manager
      await this.dataManager.saveJSON('config/workflow-templates.json', this.workflowTemplates);
      
      console.log(`✅ Archived workflow template: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error deleting workflow template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate estimated total days for template
   * @param {Array} blocks - Array of template blocks
   * @returns {number} Total estimated days
   */
  calculateTemplateEstimate(blocks) {
    if (!blocks || blocks.length === 0) return 0;
    
    return blocks.reduce((total, block) => {
      const buildingBlock = this.getBuildingBlockById(block.blockId);
      if (!buildingBlock) return total;
      
      const duration = block.customDuration || buildingBlock.estimatedDays;
      return total + duration;
    }, 0);
  }

  /**
   * Create workflow from template for an OTI
   * @param {string} templateId - Template ID
   * @returns {Object} Workflow object ready to attach to OTI
   */
  createWorkflowFromTemplate(templateId) {
    const template = this.getWorkflowTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Create workflow blocks with status tracking
    const workflowBlocks = template.blocks.map(templateBlock => {
      const buildingBlock = this.getBuildingBlockById(templateBlock.blockId);
      
      return {
        blockId: templateBlock.blockId,
        sequence: templateBlock.sequence,
        assignedTo: null,
        status: templateBlock.sequence === 1 ? 'not-started' : 'waiting',
        startDate: null,
        completedDate: null,
        actualDays: null,
        notes: templateBlock.notes || '',
        completionNotes: '',
        customDuration: templateBlock.customDuration,
        estimatedDays: templateBlock.customDuration || buildingBlock?.estimatedDays || 0,
        checklistProgress: {
          completed: [],
          total: buildingBlock?.checklistItems?.length || 0
        }
      };
    });

    return {
      templateId: templateId,
      blocks: workflowBlocks,
      overallProgress: 0,
      currentBlock: 1,
      blocksCompleted: 0,
      blocksTotal: workflowBlocks.length
    };
  }

  /**
   * Calculate workflow progress
   * @param {Object} workflow - Workflow object
   * @returns {number} Progress percentage (0-100)
   */
  calculateWorkflowProgress(workflow) {
    if (!workflow || !workflow.blocks || workflow.blocks.length === 0) {
      return 0;
    }

    const completedBlocks = workflow.blocks.filter(
      block => block.status === 'completed'
    ).length;

    return Math.round((completedBlocks / workflow.blocks.length) * 100);
  }

  /**
   * Update workflow block status
   * @param {string} otiId - OTI ID
   * @param {number} blockSequence - Block sequence number
   * @param {string} newStatus - New status
   * @param {Object} blockUpdateData - Additional block data to update
   * @returns {Promise<Object>} Updated OTI
   */
  async updateWorkflowBlock(otiId, blockSequence, newStatus, blockUpdateData = {}) {
    try {
      const oti = this.getOTIById(otiId);
      if (!oti || !oti.workflow) {
        throw new Error(`OTI ${otiId} has no workflow`);
      }

      const blockIndex = oti.workflow.blocks.findIndex(
        block => block.sequence === blockSequence
      );

      if (blockIndex === -1) {
        throw new Error(`Block ${blockSequence} not found in workflow`);
      }

      // Update block
      oti.workflow.blocks[blockIndex] = {
        ...oti.workflow.blocks[blockIndex],
        ...blockUpdateData,
        status: newStatus
      };

      // If marking as completed
      if (newStatus === 'completed') {
        oti.workflow.blocks[blockIndex].completedDate = new Date().toISOString();
        
        // Calculate actual days if start date exists
        if (oti.workflow.blocks[blockIndex].startDate) {
          const start = new Date(oti.workflow.blocks[blockIndex].startDate);
          const end = new Date();
          oti.workflow.blocks[blockIndex].actualDays = getBusinessDaysBetween(start, end);
        }

        // Update next block to 'not-started'
        const nextBlock = oti.workflow.blocks.find(
          block => block.sequence === blockSequence + 1
        );
        if (nextBlock && nextBlock.status === 'waiting') {
          nextBlock.status = 'not-started';
        }
      }

      // If starting a block
      if (newStatus === 'in-progress' && !oti.workflow.blocks[blockIndex].startDate) {
        oti.workflow.blocks[blockIndex].startDate = new Date().toISOString();
      }

      // Recalculate workflow progress
      oti.workflow.blocksCompleted = oti.workflow.blocks.filter(
        block => block.status === 'completed'
      ).length;
      
      oti.workflow.overallProgress = this.calculateWorkflowProgress(oti.workflow);
      
      // Update current block
      const currentBlockInProgress = oti.workflow.blocks.find(
        block => block.status === 'in-progress'
      );
      oti.workflow.currentBlock = currentBlockInProgress 
        ? currentBlockInProgress.sequence 
        : oti.workflow.blocks.findIndex(block => block.status === 'not-started') + 1;

      // Update OTI progress percentage to match workflow
      oti.progressPercentage = oti.workflow.overallProgress;

      // If all blocks complete, mark OTI as done
      if (oti.workflow.blocksCompleted === oti.workflow.blocksTotal) {
        oti.status = 'done';
        oti.actualCompletionDate = new Date().toISOString();
      }

      return await this.updateOTI(otiId, {
        workflow: oti.workflow,
        progressPercentage: oti.progressPercentage,
        status: oti.status,
        actualCompletionDate: oti.actualCompletionDate
      });

    } catch (error) {
      console.error(`❌ Error updating workflow block:`, error);
      throw error;
    }
  }
}

// Export for use in other modules
export default OTIService;
