/**
 * OTI List View - OTI Management System
 * 
 * Handles the OTI list view including table display, filtering,
 * sorting, search, and list-specific functionality.
 */

import { formatDate, truncateText, exportToCSV } from './utils.js';

/**
 * OTIListView class for rendering OTI list
 */
class OTIListView {
  constructor(container, otiService) {
    this.container = container;
    this.otiService = otiService;
    this.currentFilters = {};
    this.currentSort = { field: 'dateSubmitted', direction: 'desc' };
    this.searchQuery = '';
  }

  /**
   * Initialize OTI list view
   */
  async init() {
    try {
      console.log('📋 Initializing OTI List...');
      
      this.render();
      this.setupEventListeners();
      this.renderOTITable();
      
      console.log('✅ OTI List initialized');
      
    } catch (error) {
      console.error('❌ Error initializing OTI list:', error);
      this.showError('Failed to initialize OTI list');
    }
  }

  /**
   * Render OTI list view
   */
  render() {
    this.container.innerHTML = `
      <div class="oti-list">
        <div class="oti-list-header">
          <h1 class="oti-list-title">OTI List</h1>
          <div class="oti-list-actions">
            <button id="export-csv-btn" class="button button-outline">📊 Export CSV</button>
            <a href="#add-oti" class="button button-primary">+ Add OTI</a>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filters-bar">
            <!-- Search -->
            <div class="filter-item filter-search">
              <div class="search-box">
                <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input type="text" class="filter-input" id="search-input" placeholder="Search by title, ID, or description...">
              </div>
            </div>

            <!-- Status -->
            <div class="filter-item">
              <select class="filter-select" id="status-filter">
                <option value="">All Status</option>
                <option value="received">Received</option>
                <option value="in-progress">In Progress</option>
                <option value="stalled">Stalled</option>
                <option value="done">Done</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="filter-item">
              <select class="filter-select" id="priority-filter">
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <!-- Type -->
            <div class="filter-item">
              <select class="filter-select" id="type-filter">
                <option value="">All Types</option>
                <!-- Options will be populated dynamically -->
              </select>
            </div>

            <!-- Team -->
            <div class="filter-item">
              <select class="filter-select" id="team-filter">
                <option value="">All Teams</option>
                <!-- Options will be populated dynamically -->
              </select>
            </div>

            <!-- Quick Filter: Overdue -->
            <div class="filter-item filter-checkbox">
              <label class="checkbox-filter">
                <input type="checkbox" id="overdue-checkbox">
                <span>Overdue</span>
              </label>
            </div>

            <!-- Quick Filter: Stalled -->
            <div class="filter-item filter-checkbox">
              <label class="checkbox-filter">
                <input type="checkbox" id="stalled-checkbox">
                <span>Issues</span>
              </label>
            </div>

            <!-- Clear Button -->
            <div class="filter-item">
              <button id="clear-filters-btn" class="button button-text">✕ Clear</button>
            </div>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="results-summary" id="results-summary">
          <div class="results-count" id="results-count">
            <!-- Results count will be populated -->
          </div>
          <div class="results-actions">
            <button class="button button-sm button-secondary" id="clear-filters">Clear Filters</button>
          </div>
        </div>

        <!-- OTI Table -->
        <div class="oti-table-container">
          <div class="table-loading" id="table-loading" style="display: none;">
            <div class="spinner"></div>
            <span>Loading OTIs...</span>
          </div>
          
          <div class="empty-state" id="empty-state" style="display: none;">
            <div class="empty-state-icon">📭</div>
            <h3 class="empty-state-title">No OTIs Found</h3>
            <p class="empty-state-message">Try adjusting your filters or search terms</p>
          </div>

          <table class="oti-table" id="oti-table" style="display: none;">
            <thead>
              <tr>
                <th class="sortable" data-field="id">ID</th>
                <th class="sortable" data-field="title">Title</th>
                <th class="sortable" data-field="otiType">Type</th>
                <th class="sortable" data-field="priority">Priority</th>
                <th class="sortable" data-field="status">Status</th>
                <th class="sortable" data-field="leadTeam">Lead Team</th>
                <th class="sortable" data-field="dateSubmitted">Days Active</th>
                <th class="sortable" data-field="progressPercentage">Progress</th>
                <th class="sortable" data-field="targetCompletionDate">Target Date</th>
              </tr>
            </thead>
            <tbody id="oti-table-body">
              <!-- Table rows will be populated -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.populateFilterOptions();
  }

  /**
   * Populate filter dropdown options
   */
  populateFilterOptions() {
    // Populate OTI types
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      const otiTypes = this.otiService.otiTypes || [];
      otiTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        typeFilter.appendChild(option);
      });
    }

    // Populate teams
    const teamFilter = document.getElementById('team-filter');
    if (teamFilter) {
      const teams = this.otiService.teams || [];
      teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        teamFilter.appendChild(option);
      });
    }
  }

  /**
   * Render OTI table with current filters and sort
   */
  renderOTITable() {
    const tableLoading = document.getElementById('table-loading');
    const emptyState = document.getElementById('empty-state');
    const otiTable = document.getElementById('oti-table');
    const tableBody = document.getElementById('oti-table-body');
    const resultsCount = document.getElementById('results-count');

    if (!tableLoading || !emptyState || !otiTable || !tableBody || !resultsCount) return;

    // Show loading
    tableLoading.style.display = 'flex';
    emptyState.style.display = 'none';
    otiTable.style.display = 'none';

    // Simulate loading delay for better UX
    setTimeout(() => {
      try {
        // Get filtered and sorted OTIs
        let otis = this.otiService.getAllOTIs();

        // Apply search
        if (this.searchQuery) {
          otis = this.otiService.searchOTIs(this.searchQuery);
        }

        // Apply filters
        if (Object.keys(this.currentFilters).length > 0) {
          otis = this.otiService.filterOTIs(this.currentFilters);
        }

        // Apply sorting
        otis = this.otiService.sortOTIs(this.currentSort.field, this.currentSort.direction);

        // Update results count
        resultsCount.textContent = `${otis.length} OTI${otis.length !== 1 ? 's' : ''} found`;

        // Render table or empty state
        if (otis.length === 0) {
          this.showEmptyState();
        } else {
          this.renderTableRows(otis);
          this.showTable();
        }

        // Hide loading
        tableLoading.style.display = 'none';

      } catch (error) {
        console.error('❌ Error rendering OTI table:', error);
        tableLoading.style.display = 'none';
        this.showError('Failed to load OTI data');
      }
    }, 300);
  }

  /**
   * Render table rows
   */
  renderTableRows(otis) {
    const tableBody = document.getElementById('oti-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = otis.map(oti => this.createTableRow(oti)).join('');
  }

  /**
   * Create table row for OTI
   */
  createTableRow(oti) {
    const daysActive = this.otiService.calculateDaysActive(oti);
    const progress = this.otiService.calculateProgress(oti);
    const isOverdue = this.otiService.isOverdue(oti);
    const otiType = this.otiService.getOTIType(oti.otiType);

    return `
      <tr class="oti-row" data-oti-id="${oti.id}">
        <td>
          <a href="#oti-detail/${oti.id}" class="oti-id">${oti.id}</a>
        </td>
        <td>
          <div class="oti-title" title="${oti.title}">${truncateText(oti.title, 50)}</div>
        </td>
        <td>
          <div class="oti-type">
            <div class="type-icon" style="background-color: ${this.getTypeColor(oti.otiType)}"></div>
            <span class="type-label">${otiType ? otiType.name : oti.otiType}</span>
          </div>
        </td>
        <td>
          <div class="oti-priority">
            <div class="priority-indicator ${oti.priority}"></div>
            <span class="badge badge-${oti.priority}">${this.formatPriorityLabel(oti.priority)}</span>
          </div>
        </td>
        <td>
          <div class="oti-status">
            <span class="badge badge-${oti.status}">${this.formatStatusLabel(oti.status)}</span>
          </div>
        </td>
        <td>
          <span class="oti-team">${oti.leadTeam}</span>
        </td>
        <td>
          <span class="oti-days">${daysActive}</span>
        </td>
        <td>
          <div class="oti-progress">
            <div class="progress-bar">
              <div class="progress-fill ${this.getProgressClass(progress)}" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}%</span>
          </div>
        </td>
        <td>
          <span class="oti-date ${isOverdue ? 'overdue' : ''}" title="${formatDate(oti.targetCompletionDate)}">
            ${formatDate(oti.targetCompletionDate)}
          </span>
        </td>
      </tr>
    `;
  }

  /**
   * Show table
   */
  showTable() {
    const emptyState = document.getElementById('empty-state');
    const otiTable = document.getElementById('oti-table');

    if (emptyState) emptyState.style.display = 'none';
    if (otiTable) otiTable.style.display = 'table';
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const otiTable = document.getElementById('oti-table');

    if (emptyState) emptyState.style.display = 'block';
    if (otiTable) otiTable.style.display = 'none';
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Export CSV button
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.handleExportCSV();
      });
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderOTITable();
      });
    }

    // Filter dropdowns
    const filters = ['status-filter', 'priority-filter', 'type-filter', 'team-filter'];
    filters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => {
          this.updateFilters();
        });
      }
    });

    // Toggle filters (checkboxes)
    const overdueCheckbox = document.getElementById('overdue-checkbox');
    const stalledCheckbox = document.getElementById('stalled-checkbox');
    
    if (overdueCheckbox) {
      overdueCheckbox.addEventListener('change', () => {
        this.updateFilters();
      });
    }
    
    if (stalledCheckbox) {
      stalledCheckbox.addEventListener('change', () => {
        this.updateFilters();
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Table sorting
    const table = document.getElementById('oti-table');
    if (table) {
      const headers = table.querySelectorAll('th.sortable');
      headers.forEach(header => {
        header.addEventListener('click', () => {
          this.handleSort(header.dataset.field);
        });
      });
    }

    // Table row clicks
    document.addEventListener('click', (e) => {
      const row = e.target.closest('.oti-row');
      if (row) {
        const otiId = row.dataset.otiId;
        if (otiId && !e.target.closest('a')) {
          window.location.hash = `#oti-detail/${otiId}`;
        }
      }
    });
  }

  /**
   * Update filters based on form inputs
   */
  updateFilters() {
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const typeFilter = document.getElementById('type-filter');
    const teamFilter = document.getElementById('team-filter');
    const overdueCheckbox = document.getElementById('overdue-checkbox');
    const stalledCheckbox = document.getElementById('stalled-checkbox');

    this.currentFilters = {};

    // Status filter
    if (statusFilter && statusFilter.selectedOptions.length > 0) {
      this.currentFilters.status = Array.from(statusFilter.selectedOptions).map(opt => opt.value);
    }

    // Priority filter
    if (priorityFilter && priorityFilter.selectedOptions.length > 0) {
      this.currentFilters.priority = Array.from(priorityFilter.selectedOptions).map(opt => opt.value);
    }

    // Type filter
    if (typeFilter && typeFilter.value) {
      this.currentFilters.type = typeFilter.value;
    }

    // Team filter
    if (teamFilter && teamFilter.value) {
      this.currentFilters.team = teamFilter.value;
    }

    // Toggle filters
    if (overdueCheckbox && overdueCheckbox.checked) {
      this.currentFilters.overdueOnly = true;
    }

    if (stalledCheckbox && stalledCheckbox.checked) {
      this.currentFilters.stalledOnly = true;
    }

    // Update toggle visual states
    this.updateToggleStates();

    // Re-render table
    this.renderOTITable();
  }

  /**
   * Update toggle filter visual states
   */
  updateToggleStates() {
    const overdueCheckbox = document.getElementById('overdue-checkbox');
    const stalledCheckbox = document.getElementById('stalled-checkbox');

    if (overdueCheckbox) {
      overdueCheckbox.checked = this.currentFilters.overdueOnly;
    }

    if (stalledCheckbox) {
      stalledCheckbox.checked = this.currentFilters.stalledOnly;
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Reset filter inputs
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const typeFilter = document.getElementById('type-filter');
    const teamFilter = document.getElementById('team-filter');
    const overdueCheckbox = document.getElementById('overdue-checkbox');
    const stalledCheckbox = document.getElementById('stalled-checkbox');
    const searchInput = document.getElementById('search-input');

    if (statusFilter) statusFilter.selectedIndex = -1;
    if (priorityFilter) priorityFilter.selectedIndex = -1;
    if (typeFilter) typeFilter.selectedIndex = 0;
    if (teamFilter) teamFilter.selectedIndex = 0;
    if (overdueCheckbox) overdueCheckbox.checked = false;
    if (stalledCheckbox) stalledCheckbox.checked = false;
    if (searchInput) searchInput.value = '';

    // Reset state
    this.currentFilters = {};
    this.searchQuery = '';
    this.updateToggleStates();

    // Re-render table
    this.renderOTITable();
  }

  /**
   * Handle table sorting
   */
  handleSort(field) {
    // Toggle sort direction
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }

    // Update sort indicators
    this.updateSortIndicators();

    // Re-render table
    this.renderOTITable();
  }

  /**
   * Update sort indicators on table headers
   */
  updateSortIndicators() {
    const headers = document.querySelectorAll('th.sortable');
    headers.forEach(header => {
      header.classList.remove('asc', 'desc');
      if (header.dataset.field === this.currentSort.field) {
        header.classList.add(this.currentSort.direction);
      }
    });
  }

  /**
   * Get type color for visual indicator
   */
  getTypeColor(typeId) {
    const colors = [
      '#009BDB', '#3F457E', '#40BA8D', '#FFE17F',
      '#DE6328', '#CE819C', '#00C7FF', '#00E39D'
    ];
    
    // Simple hash function to get consistent color for type
    let hash = 0;
    for (let i = 0; i < typeId.length; i++) {
      hash = ((hash << 5) - hash + typeId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get progress bar class based on percentage
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
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>⚠️ OTI List Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="button button-primary">Refresh Page</button>
      </div>
    `;
  }

  /**
   * Handle CSV export
   */
  handleExportCSV() {
    try {
      // Get current filtered/searched OTIs
      let otis = this.otiService.getAllOTIs();

      // Apply search
      if (this.searchQuery) {
        otis = this.otiService.searchOTIs(this.searchQuery);
      }

      // Apply filters
      if (Object.keys(this.currentFilters).length > 0) {
        otis = this.otiService.filterOTIs(otis, this.currentFilters);
      }

      // Apply sort
      otis = this.otiService.sortOTIs(otis, this.currentSort.field, this.currentSort.direction);

      if (otis.length === 0) {
        alert('No OTIs to export with current filters');
        return;
      }

      // Define columns for export
      const columns = [
        { key: 'id', label: 'OTI ID' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'otiType', label: 'OTI Type' },
        { key: 'leadTeam', label: 'Lead Team' },
        { key: 'leadCoordinator', label: 'Lead Coordinator' },
        { key: 'requestor', label: 'Requestor' },
        { key: 'dateSubmitted', label: 'Date Submitted' },
        { key: 'targetCompletionDate', label: 'Target Completion' },
        { key: 'actualCompletionDate', label: 'Actual Completion' },
        { key: 'progressPercentage', label: 'Progress %' },
        { key: 'businessJustification', label: 'Business Justification' },
        { key: 'supportingTeams', label: 'Supporting Teams' }
      ];

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `OTI-Export-${timestamp}.csv`;

      // Export to CSV
      exportToCSV(otis, filename, columns);

      // Show success message
      alert(`✅ Exported ${otis.length} OTIs to ${filename}`);
      
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
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
export default OTIListView;
