/**
 * Data Manager - OTI Management System
 * 
 * Handles all JSON data operations including loading, saving,
 * backup, and caching of data files.
 */

/**
 * DataManager class for handling JSON file operations
 */
class DataManager {
  constructor() {
    this.dataPath = './data';
    this.cache = {}; // Cache loaded data
  }

  /**
   * Load JSON file from data directory
   * @param {string} filename - Path relative to /data (e.g., 'otis/otis.json')
   * @returns {Promise<Object|Array>} Parsed JSON data
   */
  async loadJSON(filename) {
    try {
      // Check cache first
      if (this.cache[filename]) {
        console.log(`📦 Loading from cache: ${filename}`);
        return this.cache[filename];
      }

      console.log(`📥 Loading: ${filename}`);
      const response = await fetch(`${this.dataPath}/${filename}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.cache[filename] = data;
      
      console.log(`✅ Loaded: ${filename}`);
      return data;
      
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error);
      return null;
    }
  }

  /**
   * Save JSON file to data directory
   * Creates backup before saving
   * @param {string} filename - Path relative to /data
   * @param {Object|Array} data - Data to save
   * @returns {Promise<boolean>} Success status
   */
  async saveJSON(filename, data) {
    try {
      console.log(`💾 Saving: ${filename}`);
      
      // Create backup first
      await this.createBackup(filename);
      
      // In browser environment, we'll use localStorage as a fallback
      // In production with server, this would write to actual file
      const key = `oti-data-${filename.replace(/\//g, '-')}`;
      localStorage.setItem(key, JSON.stringify(data, null, 2));
      
      // Update cache
      this.cache[filename] = data;
      
      console.log(`✅ Saved: ${filename}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error saving ${filename}:`, error);
      return false;
    }
  }

  /**
   * Create timestamped backup of data file
   * @param {string} filename - File to backup
   */
  async createBackup(filename) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `oti-backup-${filename.replace(/\//g, '-')}-${timestamp}`;
      
      // Get current data
      const currentData = this.cache[filename];
      if (currentData) {
        localStorage.setItem(backupKey, JSON.stringify(currentData, null, 2));
        console.log(`📋 Backup created: ${backupKey}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not create backup for ${filename}:`, error);
    }
  }

  /**
   * Clear cache for specific file or all files
   * @param {string} filename - Optional, clear specific file only
   */
  clearCache(filename = null) {
    if (filename) {
      delete this.cache[filename];
      console.log(`🗑️ Cache cleared: ${filename}`);
    } else {
      this.cache = {};
      console.log(`🗑️ All cache cleared`);
    }
  }

  /**
   * Initialize data manager - load all required files
   * @returns {Promise<Object>} All loaded data
   */
  async initialize() {
    console.log('🚀 Initializing DataManager...');
    
    const data = {
      otis: await this.loadJSON('otis/otis.json'),
      otiTypes: await this.loadJSON('config/oti-types.json'),
      teams: await this.loadJSON('config/teams.json'),
      priorities: await this.loadJSON('config/priorities.json')
    };
    
    console.log('✅ DataManager initialized');
    return data;
  }
}

// Export for use in other modules
export default DataManager;
