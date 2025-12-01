/**
 * TharwahChat Web Component - Style Loader
 * Utility for loading CSS files into Shadow DOM
 */

(function(window) {
  'use strict';

  class TharwahStyleLoader {
    constructor() {
      this.loadedStyles = new Set();
      this.styleCache = new Map();
    }

    /**
     * Load CSS content into a shadow root
     * @param {ShadowRoot} shadowRoot - The shadow root to inject styles into
     * @param {string[]} styleFiles - Array of CSS file paths to load
     * @param {string} basePath - Base path for the style files
     * @returns {Promise<void>}
     */
    async loadStyles(shadowRoot, styleFiles = [], basePath = '') {
      try {
        // Load all CSS files
        const stylePromises = styleFiles.map(file => this.loadCSSFile(file, basePath));
        const styles = await Promise.all(stylePromises);

        // Create and inject style element
        const styleElement = document.createElement('style');
        styleElement.textContent = styles.join('\n');
        shadowRoot.appendChild(styleElement);

        return styleElement;
      } catch (error) {
        console.error('[TharwahStyleLoader] Error loading styles:', error);
        throw error;
      }
    }

    /**
     * Load a single CSS file
     * @param {string} file - CSS file name
     * @param {string} basePath - Base path for the CSS file
     * @returns {Promise<string>} CSS content
     */
    async loadCSSFile(file, basePath = '') {
      const fullPath = `${basePath}${file}`;

      // Return cached content if available
      if (this.styleCache.has(fullPath)) {
        return this.styleCache.get(fullPath);
      }

      try {
        const response = await fetch(fullPath);
        if (!response.ok) {
          throw new Error(`Failed to load CSS file: ${file}`);
        }

        const cssContent = await response.text();

        // Cache the content
        this.styleCache.set(fullPath, cssContent);
        this.loadedStyles.add(file);

        return cssContent;
      } catch (error) {
        console.error(`[TharwahStyleLoader] Error loading ${file}:`, error);

        // Return fallback empty CSS
        return `/* Error loading ${file}: ${error.message} */`;
      }
    }

    /**
     * Get default style files for TharwahChat
     * @param {string} theme - Theme name ('vanilla' or 'assistant-ui')
     * @returns {string[]} Array of CSS file paths
     */
    getDefaultStyleFiles(theme = 'vanilla') {
      const baseFiles = ['variables.css', 'base2.css', 'utilities.css'];
      const themeFiles = theme === 'assistant-ui'
        ? ['assistant-ui-theme.css']
        : ['vanilla-theme.css'];

      return [...baseFiles, ...themeFiles, 'main.css'];
    }

    /**
     * Inject inline CSS (fallback method)
     * @param {ShadowRoot} shadowRoot - The shadow root to inject styles into
     * @param {string} cssContent - CSS content to inject
     * @returns {HTMLStyleElement} The created style element
     */
    injectInlineStyles(shadowRoot, cssContent) {
      const styleElement = document.createElement('style');
      styleElement.textContent = cssContent;
      shadowRoot.appendChild(styleElement);
      return styleElement;
    }

    /**
     * Clear the style cache
     */
    clearCache() {
      this.styleCache.clear();
      this.loadedStyles.clear();
    }

    /**
     * Get loaded styles information
     * @returns {Object} Information about loaded styles
     */
    getLoadedStylesInfo() {
      return {
        loadedStyles: Array.from(this.loadedStyles),
        cachedStyles: Array.from(this.styleCache.keys()),
        cacheSize: this.styleCache.size
      };
    }
  }

  // Export the style loader
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TharwahStyleLoader;
  } else {
    window.TharwahStyleLoader = TharwahStyleLoader;
  }

})(window);