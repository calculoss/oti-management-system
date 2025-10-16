/**
 * Main Application Controller - OTI Management System
 * 
 * Handles routing, initialization, and view coordination for the entire application.
 */

import DataManager from './data-manager.js';
import OTIService from './oti-service.js';
import BuildingBlocksView from './building-blocks.js';
import WorkflowTemplatesView from './workflow-templates.js';

/**
 * Main App class for coordinating the application
 */
class App {
  constructor() {
    this.dataManager = new DataManager();
    this.otiService = null;
    this.currentView = null;
    this.data = {};
    
    this.views = {
      dashboard: null,
      'oti-list': null,
      'oti-detail': null
    };
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      console.log('🚀 Starting OTI Management System...');
      
      // Show loading indicator
      this.showLoading();
      
      // Load all data
      this.data = await this.dataManager.initialize();
      
      // Initialize OTI service
      this.otiService = new OTIService(this.dataManager, this.data);
      
      // Setup navigation
      this.setupNavigation();
      
      // Setup routing
      this.setupRouting();
      
      // Handle initial route
      this.handleRoute();
      
      // Hide loading indicator
      this.hideLoading();
      
      console.log('✅ Application initialized');
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Setup navigation menu
   */
  setupNavigation() {
    const header = document.getElementById('app-header');
    header.innerHTML = `
      <nav class="main-nav">
        <div class="nav-brand">
          <div class="brand-logo">
            <div class="logo-icon">🏛️</div>
            <div class="brand-text">
              <h1>OTI Management</h1>
              <span class="nav-subtitle">Lake Macquarie City Council</span>
            </div>
          </div>
        </div>
        <ul class="nav-menu">
          <li><a href="#dashboard" class="nav-link">Dashboard</a></li>
          <li><a href="#oti-list" class="nav-link">OTI List</a></li>
          <li><a href="#building-blocks" class="nav-link">Building Blocks</a></li>
          <li><a href="#workflow-templates" class="nav-link">Templates</a></li>
          <li><a href="#add-oti" class="nav-link nav-link-primary">+ Add OTI</a></li>
        </ul>
      </nav>
    `;
  }

  /**
   * Setup hash-based routing
   */
  setupRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * Handle route changes
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [view, param] = hash.split('/');
    
    console.log(`🧭 Navigating to: ${view}${param ? '/' + param : ''}`);
    
    // Update active nav link
    this.updateActiveNavLink(view);
    
    // Render appropriate view
    this.renderView(view, param);
  }

  /**
   * Update active navigation link
   */
  updateActiveNavLink(view) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${view}`) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Render view based on route
   */
  async renderView(view, param) {
    const main = document.getElementById('app-main');
    
    // Destroy current view if exists
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy();
    }
    
    // Render new view
    switch(view) {
      case 'dashboard':
        await this.renderDashboard(main);
        break;
        
      case 'oti-list':
        await this.renderOTIList(main);
        break;
        
      case 'oti-detail':
        if (param) {
          await this.renderOTIDetail(main, param);
        } else {
          this.show404();
        }
        break;
        
      case 'add-oti':
        await this.renderOTIForm(main);
        break;
        
      case 'edit-oti':
        if (param) {
          await this.renderOTIForm(main, param);
        } else {
          this.show404();
        }
        break;
        
      case 'building-blocks':
        await this.renderBuildingBlocks(main);
        break;
        
      case 'workflow-templates':
        await this.renderWorkflowTemplates(main);
        break;
        
      default:
        this.show404();
    }
  }

  /**
   * Render dashboard view
   */
  async renderDashboard(container) {
    try {
      const { default: DashboardView } = await import('./dashboard.js');
      this.currentView = new DashboardView(container, this.otiService);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering dashboard:', error);
      this.showError('Failed to load dashboard');
    }
  }

  /**
   * Render OTI list view
   */
  async renderOTIList(container) {
    try {
      const { default: OTIListView } = await import('./oti-list.js');
      this.currentView = new OTIListView(container, this.otiService);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering OTI list:', error);
      this.showError('Failed to load OTI list');
    }
  }

  /**
   * Render OTI detail view
   */
  async renderOTIDetail(container, otiId) {
    try {
      const { default: OTIDetailView } = await import('./oti-detail.js');
      this.currentView = new OTIDetailView(container, this.otiService, otiId);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering OTI detail:', error);
      this.showError('Failed to load OTI details');
    }
  }

  /**
   * Render OTI form view
   */
  async renderOTIForm(container, otiId = null) {
    try {
      const { default: OTIFormView } = await import('./oti-form.js');
      this.currentView = new OTIFormView(container, this.otiService, otiId);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering OTI form:', error);
      this.showError('Failed to load OTI form');
    }
  }

  /**
   * Render Building Blocks view
   */
  async renderBuildingBlocks(container) {
    try {
      this.currentView = new BuildingBlocksView(container, this.otiService);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering building blocks:', error);
      this.showError('Failed to load building blocks');
    }
  }

  /**
   * Render Workflow Templates view
   */
  async renderWorkflowTemplates(container) {
    try {
      this.currentView = new WorkflowTemplatesView(container, this.otiService);
      await this.currentView.init();
    } catch (error) {
      console.error('❌ Error rendering workflow templates:', error);
      this.showError('Failed to load workflow templates');
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const main = document.getElementById('app-main');
    main.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading OTI Management System...</p>
      </div>
    `;
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    // Loading will be replaced by view render
  }

  /**
   * Show error message
   */
  showError(message) {
    const main = document.getElementById('app-main');
    main.innerHTML = `
      <div class="error-container">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="button button-primary">Refresh Page</button>
      </div>
    `;
  }

  /**
   * Show 404 page
   */
  show404() {
    const main = document.getElementById('app-main');
    main.innerHTML = `
      <div class="error-container">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#dashboard" class="button button-primary">Go to Dashboard</a>
      </div>
    `;
  }

  /**
   * Show coming soon message
   */
  showComingSoon(feature) {
    const main = document.getElementById('app-main');
    main.innerHTML = `
      <div class="info-container">
        <h2>🚧 Coming Soon</h2>
        <p>${feature} is under development.</p>
        <a href="#dashboard" class="button button-primary">Go to Dashboard</a>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

export default App;
