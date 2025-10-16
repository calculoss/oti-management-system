/**
 * Chart Service - OTI Management System
 * 
 * Handles D3.js chart rendering and data visualization
 * including donut charts, bar charts, line charts, and Sankey diagrams.
 */

/**
 * ChartService class for D3.js visualizations
 */
class ChartService {
  constructor() {
    this.defaultColors = [
      '#009BDB', // Primary light blue
      '#3F457E', // Primary dark blue
      '#40BA8D', // Green
      '#FFE17F', // Yellow
      '#DE6328', // Orange
      '#CE819C', // Pink
      '#00C7FF', // Bright blue
      '#00E39D'  // Bright green
    ];
    
    this.statusColors = {
      'received': '#9CA3AF',
      'in-progress': '#00C7FF',
      'stalled': '#DC2626',
      'done': '#00E39D'
    };
    
    this.priorityColors = {
      'urgent': '#DC2626',
      'high': '#F59E0B',
      'medium': '#FCD34D',
      'low': '#10B981'
    };
  }

  /**
   * Create base chart configuration
   * @param {string} containerId - Container element ID
   * @param {Object} config - Chart configuration
   * @returns {Object} Chart base with SVG and dimensions
   */
  createChart(containerId, config = {}) {
    const container = d3.select(`#${containerId}`);
    if (container.empty()) {
      console.error(`❌ Container #${containerId} not found`);
      return null;
    }

    const margin = config.margin || { top: 20, right: 20, bottom: 20, left: 20 };
    const containerRect = container.node().getBoundingClientRect();
    
    // Use container width if available, otherwise default
    let containerWidth = containerRect.width > 0 ? containerRect.width : 400;
    const width = (config.width || containerWidth) - margin.left - margin.right;
    const height = (config.height || 300) - margin.top - margin.bottom;
    
    // Clear existing content
    container.selectAll('*').remove();
    
    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart')
      .style('background', 'transparent');
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    return {
      svg,
      g,
      width,
      height,
      margin
    };
  }

  /**
   * Create donut chart
   * @param {string} containerId - Container element ID
   * @param {Array} data - Chart data
   * @param {Object} options - Chart options
   */
  createDonutChart(containerId, data, options = {}) {
    const chart = this.createChart(containerId, options);
    if (!chart) return;

    const { g, width, height } = chart;
    
    // Calculate radius based on available space (with padding)
    const radius = (Math.min(width, height) / 2) * 0.85; // 85% to add more padding
    const innerRadius = radius * (options.innerRadius || 0.6);
    
    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(options.padAngle || 0.02);
    
    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(options.colors || this.defaultColors);
    
    // Center the chart
    const centerGroup = g
      .append('g')
      .attr('class', 'donut-center')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Draw slices
    const slices = centerGroup
      .selectAll('.donut-slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'donut-slice');
    
    slices
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        // Highlight slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1.05)');
        
        // Show tooltip
        if (options.tooltip) {
          options.tooltip.show(event, d);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
        
        if (options.tooltip) {
          options.tooltip.hide();
        }
      })
      .on('click', function(event, d) {
        if (options.onClick) {
          options.onClick(d.data);
        }
      })
      .style('cursor', options.onClick ? 'pointer' : 'default');
    
    // Add labels
    if (options.showLabels) {
      slices
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d => d.data.value);
    }
    
    // Add center text
    if (options.centerText) {
      centerGroup
        .append('text')
        .attr('class', 'donut-center-value')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text(options.centerText.value || '');
      
      centerGroup
        .append('text')
        .attr('class', 'donut-center-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('dy', '20px')
        .style('font-size', '12px')
        .style('fill', '#6B7280')
        .text(options.centerText.label || '');
    }
  }

  /**
   * Create horizontal bar chart
   * @param {string} containerId - Container element ID
   * @param {Array} data - Chart data
   * @param {Object} options - Chart options
   */
  createHorizontalBarChart(containerId, data, options = {}) {
    // Increase left margin for horizontal bar charts to fit labels
    const chartOptions = { ...options, margin: { top: 20, right: 40, bottom: 20, left: 150 } };
    const chart = this.createChart(containerId, chartOptions);
    if (!chart) return;

    const { g, width, height } = chart;
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, width]);
    
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, height])
      .padding(0.1);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(options.colors || this.defaultColors);
    
    // Draw bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');
    
    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.label))
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.label))
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
        
        if (options.tooltip) {
          options.tooltip.show(event, d);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        if (options.tooltip) {
          options.tooltip.hide();
        }
      })
      .on('click', function(event, d) {
        if (options.onClick) {
          options.onClick(d);
        }
      })
      .style('cursor', options.onClick ? 'pointer' : 'default');
    
    // Add labels
    bars
      .append('text')
      .attr('x', d => xScale(d.value) + 5)
      .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(d => d.value);
    
    // Add y-axis labels
    g
      .selectAll('.y-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6B7280')
      .text(d => d.label);
  }

  /**
   * Create line chart
   * @param {string} containerId - Container element ID
   * @param {Array} data - Chart data
   * @param {Object} options - Chart options
   */
  createLineChart(containerId, data, options = {}) {
    const chart = this.createChart(containerId, options);
    if (!chart) return;

    const { g, width, height } = chart;
    
    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(d => {
      d.date = parseDate(d.date);
      d.value = +d.value;
    });
    
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value))
      .range([height, 0]);
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Draw line
    g
      .append('path')
      .attr('class', 'line-path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', options.color || this.defaultColors[0])
      .attr('stroke-width', 3)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 4);
        
        if (options.tooltip) {
          options.tooltip.show(event, d);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 3);
        
        if (options.tooltip) {
          options.tooltip.hide();
        }
      });
    
    // Add dots
    if (options.showDots) {
      g
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', options.color || this.defaultColors[0])
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    }
    
    // Add axes
    if (options.showAxes) {
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%b %d'));
      
      const yAxis = d3.axisLeft(yScale);
      
      g
        .append('g')
        .attr('class', 'chart-axis chart-axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
      
      g
        .append('g')
        .attr('class', 'chart-axis chart-axis-y')
        .call(yAxis);
    }
  }

  /**
   * Create Sankey diagram for pipeline flow
   * @param {string} containerId - Container element ID
   * @param {Array} data - Chart data
   * @param {Object} options - Chart options
   */
  createSankeyChart(containerId, data, options = {}) {
    const chart = this.createChart(containerId, options);
    if (!chart) return;

    const { g, width, height } = chart;
    
    // Sankey data structure
    const sankeyData = {
      nodes: data.nodes || [],
      links: data.links || []
    };
    
    // Create Sankey generator
    const sankey = d3.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 1]]);
    
    const { nodes, links } = sankey(sankeyData);
    
    // Color scale for nodes
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.name))
      .range(options.colors || this.defaultColors);
    
    // Draw links
    g
      .selectAll('.sankey-link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        // Color based on source or target
        return colorScale(d.source.name);
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke-opacity', 0.6)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.8);
        
        if (options.tooltip) {
          options.tooltip.show(event, d);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6);
        
        if (options.tooltip) {
          options.tooltip.hide();
        }
      });
    
    // Draw nodes
    const nodeGroups = g
      .selectAll('.sankey-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node');
    
    nodeGroups
      .append('rect')
      .attr('class', 'node-rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale(d.name))
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 2);
        
        if (options.tooltip) {
          options.tooltip.show(event, d);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 1);
        
        if (options.tooltip) {
          options.tooltip.hide();
        }
      });
    
    // Add node labels
    nodeGroups
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(d => d.name);
    
    // Add node values
    nodeGroups
      .append('text')
      .attr('class', 'node-value')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2 + 14)
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('fill', '#6B7280')
      .text(d => d.value);
  }

  /**
   * Create tooltip
   * @param {string} containerId - Container element ID
   * @returns {Object} Tooltip object with show/hide methods
   */
  createTooltip(containerId) {
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(31, 41, 55, 0.95)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('z-index', '1000');
    
    return {
      show: (event, data) => {
        tooltip
          .style('opacity', 1)
          .html(this.formatTooltipContent(data))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      },
      hide: () => {
        tooltip.style('opacity', 0);
      }
    };
  }

  /**
   * Format tooltip content
   * @param {Object} data - Data for tooltip
   * @returns {string} HTML content for tooltip
   */
  formatTooltipContent(data) {
    if (data.data) {
      // Donut chart data
      return `
        <div class="tooltip-title">${data.data.label}</div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">Count:</span>
            <span class="tooltip-value">${data.data.value}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Percentage:</span>
            <span class="tooltip-value">${data.data.percentage || 0}%</span>
          </div>
        </div>
      `;
    } else if (data.label && data.value) {
      // Bar chart data
      return `
        <div class="tooltip-title">${data.label}</div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">Value:</span>
            <span class="tooltip-value">${data.value}</span>
          </div>
        </div>
      `;
    } else if (data.source && data.target) {
      // Sankey data
      return `
        <div class="tooltip-title">${data.source.name} → ${data.target.name}</div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">Flow:</span>
            <span class="tooltip-value">${data.value}</span>
          </div>
        </div>
      `;
    }
    
    return '<div class="tooltip-title">Data Point</div>';
  }

  /**
   * Update chart data
   * @param {string} containerId - Container element ID
   * @param {Array} newData - New data
   * @param {Object} options - Update options
   */
  updateChart(containerId, newData, options = {}) {
    // Clear existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();
    
    // Recreate chart with new data
    if (options.type === 'donut') {
      this.createDonutChart(containerId, newData, options);
    } else if (options.type === 'horizontalBar') {
      this.createHorizontalBarChart(containerId, newData, options);
    } else if (options.type === 'line') {
      this.createLineChart(containerId, newData, options);
    } else if (options.type === 'sankey') {
      this.createSankeyChart(containerId, newData, options);
    }
  }

  /**
   * Resize chart to fit container
   * @param {string} containerId - Container element ID
   */
  resizeChart(containerId) {
    const container = d3.select(`#${containerId}`);
    const svg = container.select('svg');
    
    if (svg.empty()) return;
    
    const containerRect = container.node().getBoundingClientRect();
    svg
      .attr('width', containerRect.width)
      .attr('height', containerRect.height);
  }
}

// Export for use in other modules
export default ChartService;
