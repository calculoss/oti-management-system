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
        id: existingOTI.id // Ensure ID cannot be changed
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
    // If progress is manually set, use that
    if (oti.progressPercentage !== undefined) {
      return Math.max(0, Math.min(100, oti.progressPercentage));
    }
    
    // Otherwise calculate based on task completion
    if (oti.taskIds && oti.taskIds.length > 0) {
      // This would integrate with ServiceNow in production
      // For now, return a placeholder calculation
      return Math.floor(Math.random() * 100);
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
}

// Export for use in other modules
export default OTIService;
