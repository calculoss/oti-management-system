/**
 * Dashboard View - OTI Management System
 * 
 * Handles the dashboard view including metrics cards,
 * charts, and dashboard-specific functionality.
 */

import { formatDate, formatNumber, formatPercentage } from './utils.js';

/**
 * DashboardView class for rendering dashboard
 */
class DashboardView {
  constructor(container, otiService) {
    this.container = container;
    this.otiService = otiService;
    this.chartService = null;
    this.charts = {};
  }

  /**
   * Initialize dashboard view
   */
  async init() {
    try {
      console.log('📊 Initializing Dashboard...');
      
      // Import chart service dynamically to avoid circular dependencies
      const { default: ChartService } = await import('./chart-service.js');
      this.chartService = new ChartService();
      
      this.render();
      this.setupEventListeners();
      
      console.log('✅ Dashboard initialized');
      
    } catch (error) {
      console.error('❌ Error initializing dashboard:', error);
      this.showError('Failed to initialize dashboard');
    }
  }

  /**
   * Render dashboard view
   */
  render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1 class="dashboard-title">OTI Pipeline Dashboard</h1>
          <p class="dashboard-subtitle">Lake Macquarie City Council IT Department</p>
        </div>

        <!-- Key Metrics Cards -->
        <div class="metrics-grid" id="metrics-grid">
          <!-- Metrics will be populated here -->
        </div>

        <!-- Pipeline Overview -->
        <div class="pipeline-container">
          <div class="chart-header">
            <h2 class="chart-title">Pipeline Flow</h2>
            <p class="chart-subtitle">Current status distribution and flow</p>
          </div>
          <div class="chart-content" id="pipeline-chart">
            <!-- Pipeline chart will be rendered here -->
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Status Distribution -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">Status Distribution</h3>
              <p class="chart-subtitle">OTIs by current status</p>
            </div>
            <div class="chart-content" id="status-chart">
              <!-- Status donut chart -->
            </div>
          </div>

          <!-- Team Performance -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">Team Performance</h3>
              <p class="chart-subtitle">Active OTIs by lead team</p>
            </div>
            <div class="chart-content" id="team-chart">
              <!-- Team bar chart -->
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">Priority Distribution</h3>
              <p class="chart-subtitle">OTIs by priority level</p>
            </div>
            <div class="chart-content" id="priority-chart">
              <!-- Priority donut chart -->
            </div>
          </div>

          <!-- OTI Type Analysis -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">OTI Type Analysis</h3>
              <p class="chart-subtitle">Distribution by OTI type</p>
            </div>
            <div class="chart-content" id="type-chart">
              <!-- Type bar chart -->
            </div>
          </div>
        </div>

        <!-- Health Metrics -->
        <div class="health-metrics">
          <!-- Stalled OTIs -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">Stalled OTIs</h3>
              <p class="chart-subtitle">Items requiring immediate attention</p>
            </div>
            <div class="chart-content" id="stalled-otis">
              <!-- Stalled OTIs table -->
            </div>
          </div>

          <!-- Overdue OTIs -->
          <div class="chart-container">
            <div class="chart-header">
              <h3 class="chart-title">Overdue OTIs</h3>
              <p class="chart-subtitle">Items past their target completion date</p>
            </div>
            <div class="chart-content" id="overdue-otis">
              <!-- Overdue OTIs table -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderMetrics();
    this.renderCharts();
  }

  /**
   * Render metrics cards
   */
  renderMetrics() {
    const metrics = this.otiService.getDashboardMetrics();
    const metricsGrid = document.getElementById('metrics-grid');
    
    if (!metricsGrid) return;

    metricsGrid.innerHTML = `
      <div class="metric-card">
        <div class="metric-header">
          <h4 class="metric-title">Total Active OTIs</h4>
          <div class="metric-icon">📋</div>
        </div>
        <div class="metric-value">${formatNumber(metrics.totalActive)}</div>
        <div class="metric-change positive">
          <span>↗</span>
          <span>${metrics.totalActive} items in progress</span>
        </div>
      </div>

      <div class="metric-card urgent">
        <div class="metric-header">
          <h4 class="metric-title">Urgent Items</h4>
          <div class="metric-icon">🚨</div>
        </div>
        <div class="metric-value">${formatNumber(metrics.urgentItems)}</div>
        <div class="metric-change ${metrics.urgentItems > 0 ? 'negative' : 'positive'}">
          <span>${metrics.urgentItems > 0 ? '⚠' : '✓'}</span>
          <span>${metrics.urgentItems > 0 ? 'Requires attention' : 'All clear'}</span>
        </div>
      </div>

      <div class="metric-card warning">
        <div class="metric-header">
          <h4 class="metric-title">Stalled Items</h4>
          <div class="metric-icon">⏸️</div>
        </div>
        <div class="metric-value">${formatNumber(metrics.stalledItems)}</div>
        <div class="metric-change ${metrics.stalledItems > 0 ? 'negative' : 'positive'}">
          <span>${metrics.stalledItems > 0 ? '⚠' : '✓'}</span>
          <span>${metrics.stalledItems > 0 ? 'Needs escalation' : 'No blockers'}</span>
        </div>
      </div>

      <div class="metric-card success">
        <div class="metric-header">
          <h4 class="metric-title">Completion Rate</h4>
          <div class="metric-icon">📈</div>
        </div>
        <div class="metric-value">${formatPercentage(metrics.completionRate)}</div>
        <div class="metric-change ${metrics.completionRate >= 80 ? 'positive' : metrics.completionRate >= 60 ? 'neutral' : 'negative'}">
          <span>${metrics.completionRate >= 80 ? '📈' : metrics.completionRate >= 60 ? '➡' : '📉'}</span>
          <span>Last 30 days</span>
        </div>
      </div>
    `;
  }

  /**
   * Render all charts
   */
  async renderCharts() {
    try {
      await Promise.all([
        this.renderPipelineChart(),
        this.renderStatusChart(),
        this.renderTeamChart(),
        this.renderPriorityChart(),
        this.renderTypeChart(),
        this.renderStalledOTIs(),
        this.renderOverdueOTIs()
      ]);
    } catch (error) {
      console.error('❌ Error rendering charts:', error);
    }
  }

  /**
   * Render pipeline flow chart
   */
  async renderPipelineChart() {
    const container = document.getElementById('pipeline-chart');
    if (!container || !this.chartService) return;

    try {
      const otis = this.otiService.getAllOTIs();
      const statusCounts = this.groupByStatus(otis);
      
      // Create pipeline flow data
      const pipelineData = {
        nodes: [
          { name: 'Received', value: statusCounts.received || 0 },
          { name: 'In Progress', value: statusCounts['in-progress'] || 0 },
          { name: 'Stalled', value: statusCounts.stalled || 0 },
          { name: 'Done', value: statusCounts.done || 0 }
        ],
        links: [
          { source: 'Received', target: 'In Progress', value: statusCounts['in-progress'] || 0 },
          { source: 'In Progress', target: 'Stalled', value: statusCounts.stalled || 0 },
          { source: 'In Progress', target: 'Done', value: statusCounts.done || 0 }
        ]
      };

      this.chartService.createSankeyChart('pipeline-chart', pipelineData, {
        colors: ['#9CA3AF', '#00C7FF', '#DC2626', '#00E39D'],
        tooltip: this.chartService.createTooltip('pipeline-chart')
      });

    } catch (error) {
      console.error('❌ Error rendering pipeline chart:', error);
      container.innerHTML = '<div class="chart-error">Failed to load pipeline data</div>';
    }
  }

  /**
   * Render status distribution chart
   */
  async renderStatusChart() {
    const container = document.getElementById('status-chart');
    if (!container || !this.chartService) return;

    try {
      const otis = this.otiService.getAllOTIs();
      const statusCounts = this.groupByStatus(otis);
      
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        label: this.formatStatusLabel(status),
        value: count
      }));

      this.chartService.createDonutChart('status-chart', statusData, {
        colors: ['#9CA3AF', '#00C7FF', '#DC2626', '#00E39D'],
        showLabels: true,
        centerText: {
          value: formatNumber(otis.length),
          label: 'Total OTIs'
        },
        tooltip: this.chartService.createTooltip('status-chart')
      });

    } catch (error) {
      console.error('❌ Error rendering status chart:', error);
      container.innerHTML = '<div class="chart-error">Failed to load status data</div>';
    }
  }

  /**
   * Render team performance chart
   */
  async renderTeamChart() {
    const container = document.getElementById('team-chart');
    if (!container || !this.chartService) return;

    try {
      const otis = this.otiService.getAllOTIs();
      const teamCounts = this.groupByTeam(otis);
      
      const teamData = Object.entries(teamCounts)
        .map(([team, count]) => ({
          label: team,
          value: count
        }))
        .sort((a, b) => b.value - a.value);

      this.chartService.createHorizontalBarChart('team-chart', teamData, {
        tooltip: this.chartService.createTooltip('team-chart')
      });

    } catch (error) {
      console.error('❌ Error rendering team chart:', error);
      container.innerHTML = '<div class="chart-error">Failed to load team data</div>';
    }
  }

  /**
   * Render priority distribution chart
   */
  async renderPriorityChart() {
    const container = document.getElementById('priority-chart');
    if (!container || !this.chartService) return;

    try {
      const otis = this.otiService.getAllOTIs();
      const priorityCounts = this.groupByPriority(otis);
      
      const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
        label: this.formatPriorityLabel(priority),
        value: count
      }));

      this.chartService.createDonutChart('priority-chart', priorityData, {
        colors: ['#DC2626', '#F59E0B', '#FCD34D', '#10B981'],
        tooltip: this.chartService.createTooltip('priority-chart')
      });

    } catch (error) {
      console.error('❌ Error rendering priority chart:', error);
      container.innerHTML = '<div class="chart-error">Failed to load priority data</div>';
    }
  }

  /**
   * Render OTI type analysis chart
   */
  async renderTypeChart() {
    const container = document.getElementById('type-chart');
    if (!container || !this.chartService) return;

    try {
      const otis = this.otiService.getAllOTIs();
      const typeCounts = this.groupByType(otis);
      
      const typeData = Object.entries(typeCounts)
        .map(([type, count]) => ({
          label: this.formatTypeLabel(type),
          value: count
        }))
        .sort((a, b) => b.value - a.value);

      this.chartService.createHorizontalBarChart('type-chart', typeData, {
        tooltip: this.chartService.createTooltip('type-chart')
      });

    } catch (error) {
      console.error('❌ Error rendering type chart:', error);
      container.innerHTML = '<div class="chart-error">Failed to load type data</div>';
    }
  }

  /**
   * Render stalled OTIs table
   */
  renderStalledOTIs() {
    const container = document.getElementById('stalled-otis');
    if (!container) return;

    try {
      const stalledOTIs = this.otiService.filterOTIs({ stalledOnly: true });
      
      if (stalledOTIs.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <h4 class="empty-state-title">No Stalled OTIs</h4>
            <p class="empty-state-message">All OTIs are progressing normally</p>
          </div>
        `;
        return;
      }

      const tableHTML = `
        <table class="stalled-otis-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Days Stalled</th>
              <th>Lead Team</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${stalledOTIs.map(oti => `
              <tr>
                <td><a href="#oti-detail/${oti.id}" class="oti-id">${oti.id}</a></td>
                <td class="oti-title">${this.truncateText(oti.title, 40)}</td>
                <td><span class="badge badge-${oti.priority}">${this.formatPriorityLabel(oti.priority)}</span></td>
                <td class="oti-days">${this.otiService.calculateDaysActive(oti)}</td>
                <td class="oti-team">${oti.leadTeam}</td>
                <td>
                  <a href="#oti-detail/${oti.id}" class="button button-sm button-primary">View</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      container.innerHTML = tableHTML;

    } catch (error) {
      console.error('❌ Error rendering stalled OTIs:', error);
      container.innerHTML = '<div class="chart-error">Failed to load stalled OTIs</div>';
    }
  }

  /**
   * Render overdue OTIs table
   */
  renderOverdueOTIs() {
    const container = document.getElementById('overdue-otis');
    if (!container) return;

    try {
      const allOTIs = this.otiService.getAllOTIs();
      const overdueOTIs = allOTIs.filter(oti => this.otiService.isOverdue(oti));
      
      if (overdueOTIs.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <h4 class="empty-state-title">No Overdue OTIs</h4>
            <p class="empty-state-message">All OTIs are on track to meet their targets</p>
          </div>
        `;
        return;
      }

      const tableHTML = `
        <table class="stalled-otis-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Days Overdue</th>
              <th>Target Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${overdueOTIs.map(oti => {
              const targetDate = new Date(oti.targetCompletionDate);
              const currentDate = new Date();
              const daysOverdue = this.otiService.getBusinessDaysBetween(targetDate, currentDate);
              
              return `
                <tr>
                  <td><a href="#oti-detail/${oti.id}" class="oti-id">${oti.id}</a></td>
                  <td class="oti-title">${this.truncateText(oti.title, 40)}</td>
                  <td><span class="badge badge-${oti.priority}">${this.formatPriorityLabel(oti.priority)}</span></td>
                  <td class="oti-days overdue">${daysOverdue}</td>
                  <td class="oti-date overdue">${formatDate(oti.targetCompletionDate)}</td>
                  <td>
                    <a href="#oti-detail/${oti.id}" class="button button-sm button-primary">View</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      container.innerHTML = tableHTML;

    } catch (error) {
      console.error('❌ Error rendering overdue OTIs:', error);
      container.innerHTML = '<div class="chart-error">Failed to load overdue OTIs</div>';
    }
  }

  /**
   * Group OTIs by status
   */
  groupByStatus(otis) {
    return otis.reduce((groups, oti) => {
      groups[oti.status] = (groups[oti.status] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group OTIs by team
   */
  groupByTeam(otis) {
    return otis.reduce((groups, oti) => {
      groups[oti.leadTeam] = (groups[oti.leadTeam] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group OTIs by priority
   */
  groupByPriority(otis) {
    return otis.reduce((groups, oti) => {
      groups[oti.priority] = (groups[oti.priority] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group OTIs by type
   */
  groupByType(otis) {
    return otis.reduce((groups, oti) => {
      groups[oti.otiType] = (groups[oti.otiType] || 0) + 1;
      return groups;
    }, {});
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
   * Format type label
   */
  formatTypeLabel(type) {
    // Get the display name from OTI types
    const otiType = this.otiService.getOTIType(type);
    return otiType ? otiType.name : type;
  }

  /**
   * Truncate text
   */
  truncateText(text, maxLength) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + '...';
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add any dashboard-specific event listeners here
    window.addEventListener('resize', () => {
      this.resizeCharts();
    });
  }

  /**
   * Resize charts on window resize
   */
  resizeCharts() {
    if (this.chartService) {
      const chartIds = ['pipeline-chart', 'status-chart', 'team-chart', 'priority-chart', 'type-chart'];
      chartIds.forEach(id => {
        this.chartService.resizeChart(id);
      });
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>⚠️ Dashboard Error</h2>
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
    window.removeEventListener('resize', this.resizeCharts);
  }
}

// Export for use in other modules
export default DashboardView;
