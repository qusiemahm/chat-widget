/**
 * TharwahChat Web Component
 * Universal chat widget that works across all frameworks
 * Combines complete TharwahChat-V1.js logic with modern Assistant UI integration
 *
 * Usage:
 * <tharwah-chat
 *   api-endpoint="https://api.tharwah.com"
 *   api-key="your-key"
 *   bot-id="123"
 *   title="Chat Support"
 *   use-assistant-ui="true">
 * </tharwah-chat>
 */

(function(window, document) {
  'use strict';

  class TharwahChatWebComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      // Core properties
      this.core = null;
      this.renderer = null;
      this.isInitialized = false;

      // Configuration from attributes
      this.config = {};

      // Internal state
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;

      this.log('Web Component constructor called');
    }

    // ========== LIFECYCLE CALLBACKS ==========

    connectedCallback() {
      this.log('Web Component connected to DOM');
      this.initializeConfig();
      this.loadDependencies().then(() => {
        this.initializeComponent();
      });
    }

    disconnectedCallback() {
      this.log('Web Component disconnected from DOM');
      this.cleanup();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.log(`Attribute changed: ${name} from ${oldValue} to ${newValue}`);
      if (this.isInitialized && oldValue !== newValue) {
        this.updateConfig(name, newValue);
      }
    }

    // ========== OBSERVED ATTRIBUTES ==========

    static get observedAttributes() {
      return [
        'api-endpoint',
        'api-key',
        'bot-id',
        'organization-id',
        'title',
        'subtitle',
        'welcome-message',
        'primary-color',
        'secondary-color',
        'button-icon',
        'position',
        'language',
        'auto-open',
        'auto-open-delay',
        'show-suggestions',
        'suggestions-limit',
        'enable-streaming',
        'use-assistant-ui',
        'debug'
      ];
    }

    // ========== CONFIGURATION MANAGEMENT ==========

    initializeConfig() {
      this.config = {
        // API Configuration
        apiEndpoint: this.getAttribute('api-endpoint') || 'http://localhost:8000/api',
        apiKey: this.getAttribute('api-key'),
        botId: parseInt(this.getAttribute('bot-id')) || 1,
        organizationId: this.getAttribute('organization-id') || null,

        // UI Configuration
        title: this.getAttribute('title') || 'Chat with us',
        subtitle: this.getAttribute('subtitle') || 'We reply instantly',
        welcomeMessage: this.getAttribute('welcome-message') || '👋 Hi! How can I help you today?',
        primaryColor: this.getAttribute('primary-color') || '#007bff',
        secondaryColor: this.getAttribute('secondary-color') || '#0056b3',
        buttonIcon: this.getAttribute('button-icon') || '💬',
        position: this.getAttribute('position') || 'bottom-right',

        // Behavior Configuration
        language: this.getAttribute('language') || this.detectLanguage(),
        autoOpen: this.getAttribute('auto-open') === 'true',
        autoOpenDelay: parseInt(this.getAttribute('auto-open-delay')) || 3000,
        showSuggestions: this.getAttribute('show-suggestions') !== 'false',
        suggestionsLimit: parseInt(this.getAttribute('suggestions-limit')) || 6,
        enableStreaming: this.getAttribute('enable-streaming') !== 'false',

        // Feature Flags
        useAssistantUI: this.getAttribute('use-assistant-ui') !== 'false',
        debug: this.getAttribute('debug') === 'true',
      };

      this.log('Configuration initialized:', this.config);

      // Validate required configuration
      if (!this.config.apiKey) {
        console.error('[TharwahChat] ERROR: api-key attribute is required!');
      }
    }

    updateConfig(name, value) {
      // Convert attribute name to config key
      const configKey = this.attributeToConfigKey(name);
      if (configKey) {
        // Parse value based on type
        const parsedValue = this.parseAttributeValue(name, value);
        this.config[configKey] = parsedValue;

        // Notify renderer of configuration change
        if (this.renderer && this.renderer.updateConfig) {
          this.renderer.updateConfig(this.config);
        }

        this.log(`Configuration updated: ${configKey} = ${parsedValue}`);
      }
    }

    attributeToConfigKey(attributeName) {
      const keyMap = {
        'api-endpoint': 'apiEndpoint',
        'api-key': 'apiKey',
        'bot-id': 'botId',
        'organization-id': 'organizationId',
        'welcome-message': 'welcomeMessage',
        'primary-color': 'primaryColor',
        'secondary-color': 'secondaryColor',
        'button-icon': 'buttonIcon',
        'auto-open': 'autoOpen',
        'auto-open-delay': 'autoOpenDelay',
        'show-suggestions': 'showSuggestions',
        'suggestions-limit': 'suggestionsLimit',
        'enable-streaming': 'enableStreaming',
        'use-assistant-ui': 'useAssistantUI'
      };
      return keyMap[attributeName] || attributeName;
    }

    parseAttributeValue(name, value) {
      if (name === 'auto-open' || name === 'show-suggestions' || name === 'enable-streaming' || name === 'use-assistant-ui' || name === 'debug') {
        return value === 'true';
      }
      if (name === 'bot-id' || name === 'auto-open-delay' || name === 'suggestions-limit') {
        return parseInt(value) || 0;
      }
      return value;
    }

    // ========== DEPENDENCY LOADING ==========

    async loadDependencies() {
      this.log('Loading dependencies...');

      try {
        // Load core styles first
        await this.loadStyles();

        // Load Assistant UI if enabled
        if (this.config.useAssistantUI) {
          await this.loadAssistantUI();
        }

        // Load core logic
        await this.loadCoreLogic();

        this.log('All dependencies loaded successfully');
      } catch (error) {
        this.log('Error loading dependencies:', error);
        // Fallback to vanilla mode on error
        this.config.useAssistantUI = false;
      }
    }

    async loadStyles() {
      try {
        // Initialize style loader
        if (!window.TharwahStyleLoader) {
          // Load external styles directly
          return this.loadExternalStyles();
        }

        this.styleLoader = new window.TharwahStyleLoader();

        // Load all default styles
        const styleFiles = this.styleLoader.getDefaultStyleFiles('vanilla'); // Will be overridden by renderer
        const basePath = this.getStyleBasePath();

        await this.styleLoader.loadStyles(this.shadowRoot, styleFiles, basePath);

        this.log('Styles loaded successfully from files');
      } catch (error) {
        this.log('Error loading external styles, trying direct CSS loading:', error);
        return this.loadExternalStyles();
      }
    }

    loadExternalStyles() {
      return new Promise((resolve) => {
        const cssFiles = ['variables.css', 'base2.css', 'theme-base.css', 'utilities.css'];
        const basePath = this.getStyleBasePath();

        let loadedCount = 0;
        const totalFiles = cssFiles.length;

        cssFiles.forEach(file => {
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = basePath + file;
          linkElement.onload = () => {
            loadedCount++;
            if (loadedCount === totalFiles) {
              resolve();
            }
          };
          linkElement.onerror = () => {
            console.warn(`Failed to load ${file}`);
            loadedCount++;
            if (loadedCount === totalFiles) {
              resolve();
            }
          };
          this.shadowRoot.appendChild(linkElement);
        });
      });
    }

    getStyleBasePath() {
      // Determine the base path for global style files
      const currentScript = document.currentScript;
      if (currentScript && currentScript.src) {
        const scriptPath = currentScript.src;
        // If script is served from a dist directory, move up to project root and then into /styles/
        const distIndex = scriptPath.lastIndexOf('/dist/');
        if (distIndex !== -1) {
          const rootPath = scriptPath.substring(0, distIndex + 1); // include trailing slash
          return rootPath + 'styles/';
        }
        // Otherwise, resolve styles relative to the script directory
        const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
        return basePath + 'styles/';
      }

      // Fallback path (relative)
      return './styles/';
    }

    async loadAssistantUI() {
      return new Promise((resolve, reject) => {
        // Check if Assistant UI is already loaded
        if (window.AssistantModal) {
          this.log('Assistant UI already loaded');
          resolve();
          return;
        }

        this.log('Loading Assistant UI dependencies...');

        // Load Assistant UI from CDN (example URL)
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@assistant-ui/react@latest/dist/index.umd.js';
        script.onload = () => {
          this.log('Assistant UI loaded successfully');
          resolve();
        };
        script.onerror = () => {
          this.log('Failed to load Assistant UI, falling back to vanilla renderer');
          reject(new Error('Assistant UI loading failed'));
        };

        // Add React and ReactDOM as dependencies for Assistant UI
        const reactScript = document.createElement('script');
        reactScript.src = 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js';

        const reactDOMScript = document.createElement('script');
        reactDOMScript.src = 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js';

        document.head.appendChild(reactScript);
        document.head.appendChild(reactDOMScript);
        document.head.appendChild(script);
      });
    }

    async loadCoreLogic() {
      return new Promise((resolve, reject) => {
        try {
          // Initialize TharwahChatCore with our configuration
          this.core = new window.TharwahChatCore(this.config);

          // Set up core event listeners to forward to renderer
          this.setupCoreEventForwarding();

          this.log('Core logic loaded successfully');
          resolve(this.core);
        } catch (error) {
          this.log('Error loading core logic:', error);
          reject(error);
        }
      });
    }

    setupCoreEventForwarding() {
      if (!this.core) return;

      // Forward core events to web component level
      this.core.on('messageReceived', (data) => {
        this.dispatchCustomEvent('messageReceived', data);
      });

      this.core.on('messageStreaming', (data) => {
        this.dispatchCustomEvent('messageStreaming', data);
      });

      this.core.on('suggestionsLoaded', (data) => {
        this.dispatchCustomEvent('suggestionsLoaded', data);
      });

      this.core.on('typingChanged', (data) => {
        this.dispatchCustomEvent('typingChanged', data);
      });

      this.core.on('error', (data) => {
        this.dispatchCustomEvent('error', data);
      });

      this.core.on('conversationStarted', (data) => {
        this.dispatchCustomEvent('conversationStarted', data);
      });

      this.core.on('feedbackSubmitted', (data) => {
        this.dispatchCustomEvent('feedbackSubmitted', data);
      });
    }

    // ========== COMPONENT INITIALIZATION ==========

    async initializeComponent() {
      this.log('Initializing component...');

      try {
        // Create renderer based on dependency availability
        this.createRenderer();

        // Initialize renderer with core logic
        await this.renderer.initialize(this.config, this.shadowRoot, this.core);

        // Set up event listeners for renderer events
        this.setupRendererEventListeners();

        // Initialize core logic
        this.core.init();

        this.isInitialized = true;
        this.log('Component initialized successfully');

        // Auto-open if configured
        if (this.config.autoOpen) {
          setTimeout(() => {
            this.open();
          }, this.config.autoOpenDelay);
        }

      } catch (error) {
        this.log('Error initializing component:', error);
        // Fallback to vanilla mode
        this.config.useAssistantUI = false;
        this.createRenderer();
        await this.renderer.initialize(this.config, this.shadowRoot, this.core);
      }
    }

    createRenderer() {
      const hasAssistantUI = this.config.useAssistantUI && this.detectAssistantUI();

      if (hasAssistantUI && window.AssistantUIRenderer) {
        this.log('Creating Assistant UI renderer');
        this.renderer = new window.AssistantUIRenderer();
      } else if (window.VanillaRenderer) {
        this.log('Creating vanilla renderer');
        this.renderer = new window.VanillaRenderer();
      } else {
        throw new Error('No renderer available. Please ensure renderer classes are loaded.');
      }
    }

    detectAssistantUI() {
      return !!(window.AssistantModal && window.Thread && window.Composer);
    }

    setupRendererEventListeners() {
      // Listen for renderer events via DOM events
      if (this.renderer.container) {
        this.renderer.container.addEventListener('chat_opened', () => {
          this.isOpen = true;
          this.dispatchCustomEvent('chatOpened');
        });

        this.renderer.container.addEventListener('chat_closed', () => {
          this.isOpen = false;
          this.dispatchCustomEvent('chatClosed');
        });
      }
    }

    // ========== PUBLIC API ==========

    async sendMessage(message) {
      this.log('Sending message:', message);

      if (!this.isInitialized) {
        console.warn('[TharwahChat] Component not initialized yet');
        return;
      }

      try {
        // Show user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.setTyping(true);

        // Send to core logic
        const response = await this.core.sendMessage(message);

        // Hide typing indicator
        this.setTyping(false);

        // Show bot response
        if (response && response.content) {
          this.addMessage(response.content, 'assistant');
        }

        return response;
      } catch (error) {
        this.log('Error sending message:', error);
        this.setTyping(false);
        this.addMessage('Sorry, there was an error processing your message.', 'assistant');
      }
    }

    addMessage(content, role = 'assistant') {
      const message = {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date().toISOString()
      };

      this.messages.push(message);

      // Update renderer
      if (this.renderer.addMessage) {
        this.renderer.addMessage(message);
      }

      this.dispatchCustomEvent('messageAdded', { message });
      return message;
    }

    setTyping(isTyping) {
      this.isTyping = isTyping;

      if (this.renderer.setTyping) {
        this.renderer.setTyping(isTyping);
      }

      this.dispatchCustomEvent('typingChanged', { isTyping });
    }

    open() {
      if (this.renderer.open) {
        this.renderer.open();
      }
      this.isOpen = true;
    }

    close() {
      if (this.renderer.close) {
        this.renderer.close();
      }
      this.isOpen = false;
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    // ========== STYLING ==========

    getBaseStyles() {
      return `
        /* Base Web Component Styles */
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        :host * {
          box-sizing: border-box;
        }

        tharwah-chat-container {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Loading state */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }

        .loading::after {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
    }

    // ========== UTILITY METHODS ==========

    detectLanguage() {
      const htmlLang = document.documentElement.lang;
      if (htmlLang && htmlLang.toLowerCase().startsWith('ar')) {
        return 'ar';
      }

      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.toLowerCase().startsWith('ar')) {
        return 'ar';
      }

      return 'en';
    }

    dispatchCustomEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, {
        detail: { ...detail, component: this },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }

    log(...args) {
      if (this.config && this.config.debug) {
        console.log('[TharwahChat WebComponent]', ...args);
      }
    }

    cleanup() {
      if (this.renderer && this.renderer.cleanup) {
        this.renderer.cleanup();
      }

      this.messages = [];
      this.isTyping = false;
      this.isOpen = false;
      this.isInitialized = false;
    }
  }

  // ========== RENDERER CLASSES (PLACEHOLDERS) ==========

  class VanillaRenderer {
    async initialize(config, shadowRoot) {
      this.config = config;
      this.shadowRoot = shadowRoot;

      // Create container
      this.container = document.createElement('div');
      this.container.className = 'tharwah-chat-container';
      this.container.innerHTML = '<div class="loading">Loading TharwahChat...</div>';

      shadowRoot.appendChild(this.container);

      // In the next phase, we'll integrate the actual vanilla widget
      setTimeout(() => {
        this.container.innerHTML = `
          <div class="p-5 text-center border-2 border-primary rounded-lg bg-gray-50">
            <h3 class="text-primary mb-2-5 mt-0">${config.title}</h3>
            <p class="mb-0 text-gray-600">Vanilla Renderer Ready</p>
            <button onclick="this.closest('tharwah-chat').component.sendMessage('Hello')" class="mt-2-5 px-4 py-2 bg-primary text-white border-0 rounded cursor-pointer hover:bg-primary-dark">
              Send Test Message
            </button>
          </div>
        `;
      }, 1000);
    }

    addMessage(message) {
      console.log('Vanilla renderer: Add message', message);
    }

    setTyping(isTyping) {
      console.log('Vanilla renderer: Set typing', isTyping);
    }

    open() {
      console.log('Vanilla renderer: Open chat');
    }

    close() {
      console.log('Vanilla renderer: Close chat');
    }

    updateConfig(config) {
      this.config = config;
      console.log('Vanilla renderer: Config updated', config);
    }

    cleanup() {
      if (this.container) {
        this.container.remove();
      }
    }

    on(event, callback) {
      // Event handling would be implemented in the next phase
    }
  }

  class AssistantUIRenderer {
    async initialize(config, shadowRoot) {
      this.config = config;
      this.shadowRoot = shadowRoot;

      // Create container for Assistant UI
      this.container = document.createElement('div');
      this.container.className = 'tharwah-chat-container';
      this.container.innerHTML = '<div class="loading">Loading Assistant UI...</div>';

      shadowRoot.appendChild(this.container);

      // In the next phase, we'll integrate actual Assistant UI components
      setTimeout(() => {
        this.container.innerHTML = `
          <div class="p-5 text-center border-2 border-primary rounded-lg bg-gray-50">
            <h3 class="text-primary mb-2-5 mt-0">${config.title}</h3>
            <p class="mb-0 text-gray-600">Assistant UI Renderer Ready</p>
            <button onclick="this.closest('tharwah-chat').component.sendMessage('Hello')" class="mt-2-5 px-4 py-2 bg-primary text-white border-0 rounded cursor-pointer hover:bg-primary-dark">
              Send Test Message
            </button>
          </div>
        `;
      }, 1000);
    }

    addMessage(message) {
      console.log('Assistant UI renderer: Add message', message);
    }

    setTyping(isTyping) {
      console.log('Assistant UI renderer: Set typing', isTyping);
    }

    open() {
      console.log('Assistant UI renderer: Open chat');
    }

    close() {
      console.log('Assistant UI renderer: Close chat');
    }

    updateConfig(config) {
      this.config = config;
      console.log('Assistant UI renderer: Config updated', config);
    }

    cleanup() {
      if (this.container) {
        this.container.remove();
      }
    }

    on(event, callback) {
      // Event handling would be implemented in the next phase
    }
  }

  // ========== REGISTRATION ==========

  // Register the custom element
  customElements.define('tharwah-chat', TharwahChatWebComponent);

  // Make classes available globally for potential extension
  window.TharwahChatWebComponent = TharwahChatWebComponent;
  window.VanillaRenderer = VanillaRenderer;
  window.AssistantUIRenderer = AssistantUIRenderer;

  // Log successful registration
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[TharwahChat] Web Component registered successfully!');
    console.log('[TharwahChat] Usage: <tharwah-chat api-key="your-key"></tharwah-chat>');
  }

})(window, document);