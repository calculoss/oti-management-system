/**
 * Utility Functions - OTI Management System
 * 
 * This file contains utility functions for date formatting, validation,
 * calculations, and other common operations used throughout the application.
 */

/**
 * Date and Time Utilities
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-AU', options[format] || options.short);
}

/**
 * Calculate business days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of business days
 */
export function getBusinessDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  let days = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Add business days to a date
 * @param {Date|string} startDate - Start date
 * @param {number} businessDays - Number of business days to add
 * @returns {Date} New date with business days added
 */
export function addBusinessDays(startDate, businessDays) {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) return new Date();
  
  let remaining = businessDays;
  
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--;
    }
  }
  
  return date;
}

/**
 * Check if a date is overdue
 * @param {Date|string} targetDate - Target completion date
 * @param {Date|string} actualDate - Actual completion date (optional)
 * @returns {boolean} True if overdue
 */
export function isOverdue(targetDate, actualDate = null) {
  if (!targetDate) return false;
  
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return false;
  
  const compareDate = actualDate ? new Date(actualDate) : new Date();
  return compareDate > target;
}

/**
 * Validation Utilities
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} Validation result
 */
export function validateRequired(value, fieldName) {
  const isValid = value !== null && value !== undefined && value !== '';
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`
  };
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} Validation result
 */
export function validateTextLength(text, minLength, maxLength, fieldName) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }
  
  const length = text.trim().length;
  const isValid = length >= minLength && length <= maxLength;
  
  let error = null;
  if (!isValid) {
    if (length < minLength) {
      error = `${fieldName} must be at least ${minLength} characters`;
    } else if (length > maxLength) {
      error = `${fieldName} must be no more than ${maxLength} characters`;
    }
  }
  
  return { isValid, error };
}

/**
 * Data Processing Utilities
 */

/**
 * Generate unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'OTI') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * String Utilities
 */

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Array Utilities
 */

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Calculate statistics
 * @param {Array} numbers - Array of numbers
 * @returns {Object} Statistics object
 */
export function calculateStats(numbers) {
  if (!numbers || numbers.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const avg = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  return { min, max, avg, sum, count: numbers.length };
}

/**
 * UI Utilities
 */

/**
 * Show loading state
 * @param {HTMLElement} element - Element to show loading in
 * @param {string} message - Loading message
 */
export function showLoading(element, message = 'Loading...') {
  if (!element) return;
  
  element.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Show error state
 * @param {HTMLElement} element - Element to show error in
 * @param {string} message - Error message
 */
export function showError(element, message = 'An error occurred') {
  if (!element) return;
  
  element.innerHTML = `
    <div class="error-container">
      <h2>⚠️ Error</h2>
      <p>${message}</p>
      <button onclick="location.reload()" class="button button-primary">Refresh Page</button>
    </div>
  `;
}

/**
 * Show empty state
 * @param {HTMLElement} element - Element to show empty state in
 * @param {string} message - Empty state message
 */
export function showEmpty(element, message = 'No data available') {
  if (!element) return;
  
  element.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h3 class="empty-state-title">No Data</h3>
      <p class="empty-state-message">${message}</p>
    </div>
  `;
}

/**
 * Create DOM element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} content - Element content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content) {
    element.textContent = content;
  }
  
  return element;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-AU');
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number') return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Color Utilities
 */

/**
 * Get priority color
 * @param {string} priority - Priority level
 * @returns {string} CSS color value
 */
export function getPriorityColor(priority) {
  const colors = {
    urgent: 'var(--color-urgent)',
    high: 'var(--color-high)',
    medium: 'var(--color-medium)',
    low: 'var(--color-low)'
  };
  return colors[priority] || colors.medium;
}

/**
 * Get status color
 * @param {string} status - Status value
 * @returns {string} CSS color value
 */
export function getStatusColor(status) {
  const colors = {
    received: 'var(--color-gray-500)',
    'in-progress': 'var(--color-bright-blue)',
    stalled: 'var(--color-urgent)',
    done: 'var(--color-success)'
  };
  return colors[status] || colors.received;
}

/**
 * Export all utilities as default object
 */
export default {
  // Date utilities
  formatDate,
  getBusinessDaysBetween,
  addBusinessDays,
  isOverdue,
  
  // Validation utilities
  isValidEmail,
  validateRequired,
  validateTextLength,
  
  // Data processing utilities
  generateId,
  deepClone,
  debounce,
  throttle,
  
  // String utilities
  truncateText,
  capitalize,
  toTitleCase,
  
  // Array utilities
  groupBy,
  sortBy,
  calculateStats,
  
  // UI utilities
  showLoading,
  showError,
  showEmpty,
  createElement,
  formatNumber,
  formatPercentage,
  
  // Color utilities
  getPriorityColor,
  getStatusColor,
  
  // Export utilities
  exportToCSV,
  downloadFile
};

/**
 * Export Utilities
 */

/**
 * Export array of objects to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Optional array of column definitions {key, label}
 */
export function exportToCSV(data, filename = 'export.csv', columns = null) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // If no columns specified, use all keys from first object
  if (!columns) {
    const firstItem = data[0];
    columns = Object.keys(firstItem).map(key => ({
      key: key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  }

  // Build CSV header
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Build CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        // Handle nested objects (like requestor)
        if (value.name) value = value.name;
        else if (Array.isArray(value)) value = value.join('; ');
        else value = JSON.stringify(value);
      } else if (typeof value === 'string') {
        // Escape quotes in strings
        value = value.replace(/"/g, '""');
      }
      
      return `"${value}"`;
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Download the file
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  
  console.log(`✅ Exported ${data.length} rows to ${filename}`);
}

/**
 * Download a file with given content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  // Create a Blob with the content
  const blob = new Blob([content], { type: mimeType });
  
  // Create a temporary download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
