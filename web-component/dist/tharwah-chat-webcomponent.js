/**
 * TharwahChat Web Component
 * Universal chat widget for all frameworks
 *
 * @version 1.0.0
 * @author Tharwah
 * @license MIT
 *
 * Usage:
 * <tharwah-chat api-key="your-key" bot-id="1"></tharwah-chat>
 * <script src="tharwah-chat-webcomponent.js"></script>
 */

(function(window, document) {
  'use strict';



  // ========== STYLES/LOADER.JS ==========

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


  // ========== CORE/THARWAHCHATCORE.JS ==========

/**
 * TharwahChat Core Logic
 * Framework-agnostic business logic extracted from TharwahChat-V1.js
 * Contains all API communication, state management, and core functionality
 */

(function(window) {
  'use strict';

  class TharwahChatCore {
    constructor(config = {}) {
      this.config = {
        apiEndpoint: config.apiEndpoint || 'http://localhost:8000/api',
        apiKey: config.apiKey, // REQUIRED
        botId: config.botId || 1,
        organizationId: config.organizationId || null,
        welcomeMessage: config.welcomeMessage || '👋 Hi! How can I help you today?',
        position: config.position || 'bottom-right',
        primaryColor: config.primaryColor || '#667eea',
        secondaryColor: config.secondaryColor || '#764ba2',
        buttonIcon: config.buttonIcon || '💬',
        title: config.title || 'Chat with us',
        subtitle: config.subtitle || 'We reply instantly',
        debug: config.debug || false,
        autoOpen: config.autoOpen || false,
        autoOpenDelay: config.autoOpenDelay || 3000,
        showSuggestions: config.showSuggestions !== false,
        suggestionsLimit: config.suggestionsLimit || 6,
        enableStreaming: config.enableStreaming || true,
        language: config.language || this.detectLanguage(),
        ...config
      };

      // Core state
      this.conversationId = null;
      this.messages = [];
      this.suggestions = [];
      this.isTyping = false;
      this.currentStreamingMessage = null;
      this.feedbackShown = false;
      this.feedbackSubmitted = false;
      this.isWaitingForResponse = false;

      // Event listeners
      this.eventListeners = new Map();

      this.log('TharwahChat Core initialized', this.config);

      if (!this.config.apiKey) {
        console.error('[TharwahChat Core] ERROR: apiKey is required in config!');
      }
    }

    // ========== EVENT SYSTEM ==========

    on(event, callback) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }

    emit(event, data) {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            this.log('Error in event listener:', error);
          }
        });
      }
    }

    // ========== INITIALIZATION ==========

    init() {
      this.log('Initializing TharwahChat Core...');

      // Initialize conversation
      this.initializeConversation();

      // Load suggestions if enabled
      if (this.config.showSuggestions) {
        this.loadSuggestions();
      }

      this.log('TharwahChat Core initialized');
    }

    async initializeConversation() {
      try {
        const response = await this.apiCall('/conversation/start', {
          bot_id: this.config.botId,
          organization_id: this.config.organizationId,
          language: this.config.language
        });

        if (response.conversation_id) {
          this.conversationId = response.conversation_id;
          this.log('Conversation started:', this.conversationId);
          this.emit('conversationStarted', { conversationId: this.conversationId });
        }
      } catch (error) {
        this.log('Error starting conversation:', error);
        this.emit('error', { type: 'conversation_start_failed', error });
      }
    }

    // ========== MESSAGING ==========

    async sendMessage(message, options = {}) {
      if (!message || typeof message !== 'string') {
        throw new Error('Message must be a non-empty string');
      }

      this.log('Sending message:', message);
      this.isWaitingForResponse = true;

      // Add user message to local state
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      this.messages.push(userMessage);

      try {
        if (this.config.enableStreaming && options.enableStreaming !== false) {
          return await this.sendMessageWithStreaming(message);
        } else {
          return await this.sendMessageWithoutStreaming(message);
        }
      } catch (error) {
        this.log('Error sending message:', error);
        this.isWaitingForResponse = false;
        this.emit('error', { type: 'message_send_failed', error, message });
        throw error;
      }
    }

    async sendMessageWithStreaming(message) {
      this.log('Sending message with streaming enabled');

      // Create streaming message object
      const streamingMessageId = Date.now().toString();
      this.currentStreamingMessage = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      this.messages.push(this.currentStreamingMessage);
      this.emit('messageStreaming', { message: this.currentStreamingMessage });

      try {
        const response = await this.apiCallStreaming('/chat/message', {
          conversation_id: this.conversationId,
          message: message,
          bot_id: this.config.botId,
          language: this.config.language
        });

        // Process streaming response
        await this.processStreamingResponse(response, streamingMessageId);

        return this.currentStreamingMessage;
      } catch (error) {
        // Remove streaming message on error
        const index = this.messages.findIndex(m => m.id === streamingMessageId);
        if (index > -1) {
          this.messages.splice(index, 1);
        }
        this.currentStreamingMessage = null;
        throw error;
      } finally {
        this.isWaitingForResponse = false;
      }
    }

    async sendMessageWithoutStreaming(message) {
      this.log('Sending message without streaming');

      const response = await this.apiCall('/chat/message', {
        conversation_id: this.conversationId,
        message: message,
        bot_id: this.config.botId,
        language: this.config.language
      });

      const botMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response || response.content || 'Sorry, I could not process your message.',
        timestamp: new Date().toISOString(),
        metadata: response.metadata || {}
      };

      this.messages.push(botMessage);
      this.emit('messageReceived', { message: botMessage });
      this.isWaitingForResponse = false;

      return botMessage;
    }

    async processStreamingResponse(response, messageId) {
      return new Promise((resolve, reject) => {
        let fullContent = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processChunk = async ({ done, value }) => {
          if (done) {
            // Finalize streaming message
            if (this.currentStreamingMessage) {
              this.currentStreamingMessage.isStreaming = false;
              this.currentStreamingMessage.content = fullContent;
              this.emit('messageReceived', { message: this.currentStreamingMessage });
              this.currentStreamingMessage = null;
            }
            this.isTyping = false;
            resolve();
            return;
          }

          try {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.content) {
                    fullContent += data.content;
                    if (this.currentStreamingMessage) {
                      this.currentStreamingMessage.content = fullContent;
                      this.emit('messageStreaming', {
                        message: this.currentStreamingMessage,
                        chunk: data.content
                      });
                    }
                  }

                  if (data.type === 'end') {
                    // Handle end of streaming
                    if (this.currentStreamingMessage) {
                      this.currentStreamingMessage.isStreaming = false;
                      this.currentStreamingMessage.content = fullContent;
                      this.emit('messageReceived', { message: this.currentStreamingMessage });
                      this.currentStreamingMessage = null;
                    }
                    this.isTyping = false;
                    resolve();
                    return;
                  }
                } catch (parseError) {
                  this.log('Error parsing streaming data:', parseError);
                }
              }
            }
          } catch (error) {
            this.log('Error processing chunk:', error);
            reject(error);
            return;
          }

          reader.read().then(processChunk).catch(reject);
        };

        reader.read().then(processChunk).catch(reject);
      });
    }

    // ========== SUGGESTIONS ==========

    async loadSuggestions() {
      try {
        const response = await this.apiCall('/suggestions', {
          bot_id: this.config.botId,
          language: this.config.language,
          limit: this.config.suggestionsLimit
        });

        this.suggestions = response.suggestions || [];
        this.log('Suggestions loaded:', this.suggestions);
        this.emit('suggestionsLoaded', { suggestions: this.suggestions });
      } catch (error) {
        this.log('Error loading suggestions:', error);
        this.suggestions = [];
      }
    }

    // ========== FEEDBACK ==========

    async submitFeedback(messageId, feedback, comment = '') {
      try {
        const response = await this.apiCall('/feedback', {
          conversation_id: this.conversationId,
          message_id: messageId,
          feedback: feedback, // 'positive' or 'negative'
          comment: comment
        });

        this.feedbackSubmitted = true;
        this.log('Feedback submitted:', { messageId, feedback, comment });
        this.emit('feedbackSubmitted', { messageId, feedback, comment, response });

        return response;
      } catch (error) {
        this.log('Error submitting feedback:', error);
        this.emit('error', { type: 'feedback_submit_failed', error, messageId, feedback });
        throw error;
      }
    }

    // ========== API COMMUNICATION ==========

    async apiCall(endpoint, data, options = {}) {
      const url = `${this.config.apiEndpoint}${endpoint}`;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Bot-ID': this.config.botId.toString(),
        ...options.headers
      };

      if (this.config.organizationId) {
        headers['X-Organization-ID'] = this.config.organizationId.toString();
      }

      const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        ...options
      };

      this.log(`API Call: ${endpoint}`, data);

      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        this.log(`API Response: ${endpoint}`, result);
        return result;
      } catch (error) {
        this.log(`API Error: ${endpoint}`, error);
        throw error;
      }
    }

    async apiCallStreaming(endpoint, data, options = {}) {
      const url = `${this.config.apiEndpoint}${endpoint}`;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Bot-ID': this.config.botId.toString(),
        ...options.headers
      };

      if (this.config.organizationId) {
        headers['X-Organization-ID'] = this.config.organizationId.toString();
      }

      const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        ...options
      };

      this.log(`Streaming API Call: ${endpoint}`, data);

      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        this.log(`Streaming API Response started: ${endpoint}`);
        return response;
      } catch (error) {
        this.log(`Streaming API Error: ${endpoint}`, error);
        throw error;
      }
    }

    // ========== STATE MANAGEMENT ==========

    getMessages() {
      return [...this.messages];
    }

    getMessage(messageId) {
      return this.messages.find(m => m.id === messageId);
    }

    clearMessages() {
      this.messages = [];
      this.emit('messagesCleared');
    }

    setTyping(isTyping) {
      this.isTyping = isTyping;
      this.emit('typingChanged', { isTyping });
    }

    isTyping() {
      return this.isTyping || this.isWaitingForResponse;
    }

    getConversationId() {
      return this.conversationId;
    }

    // ========== TRANSLATIONS ==========

    getTranslations() {
      return {
        en: {
          welcomeTitle: 'Hi there! 👋',
          welcomeSubtitle: "Let's find what you're looking for",
          startConversation: 'Start a conversation',
          startConversationDesc: 'Ask us anything about our programs',
          emailScreenTitle: 'Chat with Tharwah Academy',
          emailScreenSubtitle: 'To get started, please share your email address:',
          emailPlaceholder: 'Enter your email',
          emailSubmit: 'Start Chat',
          inputPlaceholder: 'Type your message...',
          sendButton: 'Send',
          typingIndicator: 'Typing...',
          errorGeneric: 'Sorry, something went wrong. Please try again.',
          errorNetwork: 'Network error. Please check your connection.',
          feedbackTitle: 'Was this response helpful?',
          feedbackThanks: 'Thank you for your feedback!'
        },
        ar: {
          welcomeTitle: 'مرحباً بك! 👋',
          welcomeSubtitle: 'دعنا نجد ما تبحث عنه',
          startConversation: 'ابدأ محادثة',
          startConversationDesc: 'اسألنا أي شيء عن برامجنا',
          emailScreenTitle: 'دردشة مع أكاديمية ثروة',
          emailScreenSubtitle: 'للبدء، يرجى مشاركة بريدك الإلكتروني:',
          emailPlaceholder: 'أدخل بريدك الإلكتروني',
          emailSubmit: 'ابدأ الدردشة',
          inputPlaceholder: 'اكتب رسالتك...',
          sendButton: 'إرسال',
          typingIndicator: 'يكتب...',
          errorGeneric: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.',
          errorNetwork: 'خطأ في الشبكة. يرجى فحص اتصالك.',
          feedbackTitle: 'هل كانت هذه الإجابة مفيدة؟',
          feedbackThanks: 'شكراً لملاحظاتك!'
        }
      };
    }

    t(key) {
      const translations = this.getTranslations();
      const lang = this.config.language || 'en';
      return translations[lang]?.[key] || translations['en'][key] || key;
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

    isArabicText(text) {
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      return arabicRegex.test(text);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    formatMessage(text) {
      if (!text) return '';

      // Basic markdown-like formatting
      let formatted = text
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Links (basic)
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

      return formatted;
    }

    trackEvent(eventName, data = {}) {
      this.log('Track event:', eventName, data);
      this.emit('trackEvent', { eventName, data });

      // Here you could integrate with analytics services
      if (window.gtag) {
        window.gtag('event', eventName, data);
      }
      if (window.analytics) {
        window.analytics.track(eventName, data);
      }
    }

    log(...args) {
      if (this.config.debug) {
        console.log('[TharwahChat Core]', ...args);
      }
    }

    // ========== CLEANUP ==========

    destroy() {
      this.messages = [];
      this.suggestions = [];
      this.conversationId = null;
      this.currentStreamingMessage = null;
      this.isTyping = false;
      this.isWaitingForResponse = false;
      this.eventListeners.clear();

      this.log('TharwahChat Core destroyed');
    }
  }

  // Export the core class
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TharwahChatCore;
  } else {
    window.TharwahChatCore = TharwahChatCore;
  }


  // ========== RENDERERS/VANILLARENDERER.JS ==========

/**
 * Vanilla Renderer
 * Preserves all original TharwahChat-V1.js functionality with modern structure
 * Works without any external dependencies
 */

(function() {
  'use strict';

  class VanillaRenderer {
    constructor() {
      this.config = null;
      this.core = null;
      this.shadowRoot = null;
      this.container = null;
      this.elements = {};
      this.isOpen = false;
      this.isRendered = false;
      this.showingWelcome = true;
    }

    async initialize(config, shadowRoot, core) {
      this.config = config;
      this.core = core;
      this.shadowRoot = shadowRoot;

      this.log('Initializing Vanilla Renderer...');

      // Setup core event listeners
      this.setupCoreEvents();

      // Create DOM structure
      await this.createDOMStructure();

      // Apply styles
      await this.applyStyles();

      // Setup event listeners
      this.setupEventListeners();

      this.isRendered = true;
      this.log('Vanilla Renderer initialized successfully');

      // Auto-open if configured
      if (this.config.autoOpen) {
        setTimeout(() => {
          this.open();
        }, this.config.autoOpenDelay);
      }
    }

    setupCoreEvents() {
      if (!this.core) return;

      // Listen to core events
      this.core.on('messageReceived', (data) => {
        this.addMessageToDOM(data.message);
      });

      this.core.on('messageStreaming', (data) => {
        this.updateStreamingMessage(data.message, data.chunk);
      });

      this.core.on('suggestionsLoaded', (data) => {
        this.displaySuggestions(data.suggestions);
      });

      this.core.on('typingChanged', (data) => {
        this.setTypingIndicator(data.isTyping);
      });

      this.core.on('error', (data) => {
        this.handleError(data);
      });
    }

    async createDOMStructure() {
      // Main container
      this.container = document.createElement('div');
      this.container.className = 'tharwah-chat-widget';
      this.container.innerHTML = this.getWidgetHTML();

      // Get references to all elements
      this.cacheElements();

      this.shadowRoot.appendChild(this.container);
    }

    cacheElements() {
      this.elements = {
        widget: this.container.querySelector('.tharwah-chat-widget'),
        button: this.container.querySelector('.tharwah-chat-button'),
        window: this.container.querySelector('.tharwah-chat-window'),
        header: this.container.querySelector('.tharwah-chat-header'),
        messages: this.container.querySelector('.tharwah-chat-messages'),
        inputContainer: this.container.querySelector('.tharwah-chat-input-container'),
        input: this.container.querySelector('.tharwah-chat-input'),
        sendButton: this.container.querySelector('.tharwah-chat-send'),
        welcome: this.container.querySelector('.tharwah-chat-welcome'),
        emailScreen: this.container.querySelector('.tharwah-chat-email-screen'),
        suggestions: this.container.querySelector('.tharwah-chat-suggestions'),
        typingIndicator: this.container.querySelector('.tharwah-chat-typing')
      };
    }

    getWidgetHTML() {
      const translations = this.core ? this.core.t : (key) => key;
      const position = this.config.position || 'bottom-right';

      return `
        <div class="tharwah-chat-widget" data-position="${position}">

          <!-- Floating Button -->
          <button class="tharwah-chat-button" aria-label="${translations('startConversation')}">
            ${this.config.buttonIcon}
          </button>

          <!-- Chat Window -->
          <div class="tharwah-chat-window">

            <!-- Header -->
            <div class="tharwah-chat-header">
              <div class="tharwah-chat-header-content">
                <div class="tharwah-chat-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <div class="tharwah-chat-header-text">
                  <h3>${this.config.title}</h3>
                  <p>${this.config.subtitle}</p>
                </div>
              </div>
              <button class="tharwah-chat-close" aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Welcome Screen -->
            <div class="tharwah-chat-welcome">
              <div class="tharwah-chat-welcome-content">
                <h2>${translations('welcomeTitle')}</h2>
                <p>${translations('welcomeSubtitle')}</p>
                <button class="tharwah-chat-welcome-button">
                  ${translations('startConversation')}
                  <small>${translations('startConversationDesc')}</small>
                </button>
              </div>
            </div>

            <!-- Email Screen (Optional) -->
            <div class="tharwah-chat-email-screen hidden">
              <div class="tharwah-chat-email-content">
                <h3>${translations('emailScreenTitle')}</h3>
                <p>${translations('emailScreenSubtitle')}</p>
                <div class="tharwah-chat-email-form">
                  <input type="email" class="tharwah-chat-email-input" placeholder="${translations('emailPlaceholder')}" required>
                  <button class="tharwah-chat-email-submit">${translations('emailSubmit')}</button>
                </div>
              </div>
            </div>

            <!-- Messages Container -->
            <div class="tharwah-chat-messages hidden">
              <!-- Messages will be added here dynamically -->
            </div>

            <!-- Suggestions -->
            <div class="tharwah-chat-suggestions hidden">
              <!-- Suggestions will be added here dynamically -->
            </div>

            <!-- Typing Indicator -->
            <div class="tharwah-chat-typing hidden">
              <div class="tharwah-chat-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="tharwah-chat-typing-text">${translations('typingIndicator')}</span>
            </div>

            <!-- Input Container -->
            <div class="tharwah-chat-input-container hidden">
              <div class="tharwah-chat-input-wrapper">
                <textarea
                  class="tharwah-chat-input"
                  placeholder="${translations('inputPlaceholder')}"
                  rows="1"
                  aria-label="Message input"
                ></textarea>
                <button class="tharwah-chat-send" aria-label="${translations('sendButton')}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    async applyStyles() {
      try {
        // Try to load external styles first
        if (window.TharwahStyleLoader) {
          this.styleLoader = new window.TharwahStyleLoader();

          const styleFiles = this.styleLoader.getDefaultStyleFiles('vanilla');
          const basePath = this.getStyleBasePath();

          await this.styleLoader.loadStyles(this.shadowRoot, styleFiles, basePath);
          this.log('Vanilla renderer styles loaded from external files');
          return;
        }

      // Load external CSS files directly
        this.log('Loading vanilla styles from external CSS files');
        const cssFiles = ['variables.css', 'base2.css', 'theme-base.css', 'utilities.css'];
        const basePath = this.getStyleBasePath();

        for (const file of cssFiles) {
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = basePath + file;
          this.shadowRoot.appendChild(linkElement);
        }
      } catch (error) {
        this.log('Error loading external CSS styles for vanilla renderer:', error);
        console.warn('Failed to load styles, widget may not display correctly');
      }
    }

    getStyleBasePath() {
      // Determine base path for style files
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('tharwah-chat-webcomponent')) {
          const scriptPath = script.src;
          const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
          return basePath.replace(/\/dist\/?$/, '/styles/') + 'styles/';
        }
      }

      // Fallback path
      return './styles/';
    }

    
    setupEventListeners() {
      // Floating button click
      this.elements.button.addEventListener('click', () => {
        this.toggle();
      });

      // Close button click
      this.elements.close.addEventListener('click', () => {
        this.close();
      });

      // Welcome button click
      this.elements.welcome.querySelector('.tharwah-chat-welcome-button').addEventListener('click', () => {
        this.startChat();
      });

      // Input events
      this.elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.elements.input.addEventListener('input', () => {
        this.autoResizeTextarea();
      });

      // Send button click
      this.elements.sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    startChat() {
      this.showingWelcome = false;
      this.elements.welcome.classList.add('hidden');
      this.elements.messages.classList.remove('hidden');
      this.elements.messages.classList.add('visible-flex');
      this.elements.inputContainer.classList.remove('hidden');
      this.elements.inputContainer.classList.add('visible');

      if (this.config.showSuggestions) {
        this.elements.suggestions.classList.remove('hidden');
        this.elements.suggestions.classList.add('visible-flex');
      }

      // Focus input
      this.elements.input.focus();

      // Track event
      if (this.core) {
        this.core.trackEvent('chat_started');
      }
    }

    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message) return;

      // Clear input
      this.elements.input.value = '';
      this.autoResizeTextarea();

      try {
        // Send message through core
        await this.core.sendMessage(message);
      } catch (error) {
        this.handleError({ type: 'message_send_failed', error });
      }
    }

    addMessageToDOM(message) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `tharwah-chat-message ${message.role}`;
      messageDiv.setAttribute('data-message-id', message.id);

      // Format content based on role
      const formattedContent = message.role === 'user'
        ? this.core.escapeHtml(message.content)
        : this.core.formatMessage(message.content);

      // Detect RTL for Arabic text
      const isArabic = this.core.isArabicText(message.content);
      const rtlAttr = isArabic ? 'data-rtl="true"' : '';

      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content" ${rtlAttr}>${formattedContent}</div>
      `;

      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();
    }

    updateStreamingMessage(message, chunk) {
      let messageElement = this.elements.messages.querySelector(`[data-message-id="${message.id}"]`);

      if (!messageElement) {
        // Create streaming message element
        messageElement = document.createElement('div');
        messageElement.className = `tharwah-chat-message ${message.role}`;
        messageElement.setAttribute('data-message-id', message.id);

        const isArabic = this.core.isArabicText(message.content);
        const rtlAttr = isArabic ? 'data-rtl="true"' : '';

        messageElement.innerHTML = `
          <div class="tharwah-chat-message-content" ${rtlAttr}>
            ${this.core.formatMessage(message.content)}
            <span class="tharwah-chat-streaming-cursor">|</span>
          </div>
        `;

        this.elements.messages.appendChild(messageElement);
      } else {
        // Update existing streaming message
        const contentElement = messageElement.querySelector('.tharwah-chat-message-content');
        if (contentElement) {
          contentElement.innerHTML = `${this.core.formatMessage(message.content)}<span class="tharwah-chat-streaming-cursor">|</span>`;
        }
      }

      this.scrollToBottom();
    }

    displaySuggestions(suggestions) {
      if (!suggestions || suggestions.length === 0) return;

      this.elements.suggestions.innerHTML = '';

      suggestions.slice(0, this.config.suggestionsLimit).forEach(suggestion => {
        const suggestionElement = document.createElement('button');
        suggestionElement.className = 'tharwah-chat-suggestion';
        suggestionElement.textContent = suggestion.text || suggestion;
        suggestionElement.addEventListener('click', () => {
          this.elements.input.value = suggestion.text || suggestion;
          this.sendMessage();
        });

        this.elements.suggestions.appendChild(suggestionElement);
      });
    }

    setTypingIndicator(isTyping) {
      if (isTyping) {
        this.elements.typing.classList.remove('hidden');
        this.elements.typing.classList.add('visible-flex');
      } else {
        this.elements.typing.classList.add('hidden');
        this.elements.typing.classList.remove('visible-flex');
      }
      this.scrollToBottom();
    }

    handleError(errorData) {
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: this.core.t('errorGeneric'),
        timestamp: new Date().toISOString(),
        isError: true
      };

      this.addMessageToDOM(errorMessage);
      this.log('Error handled:', errorData);
    }

    autoResizeTextarea() {
      const textarea = this.elements.input;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
      setTimeout(() => {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      }, 100);
    }

    // Public API methods
    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.elements.window.classList.add('active');
      this.elements.button.classList.add('open');
      this.elements.input.focus();

      if (this.core) {
        this.core.trackEvent('chat_opened');
      }

      this.emit('chat_opened');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.elements.window.classList.remove('active');
      this.elements.button.classList.remove('open');

      if (this.core) {
        this.core.trackEvent('chat_closed');
      }

      this.emit('chat_closed');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    updateConfig(config) {
      this.config = { ...this.config, ...config };
      this.log('Config updated:', config);
    }

    cleanup() {
      if (this.container) {
        this.container.remove();
      }
      this.isRendered = false;
      this.isOpen = false;
    }

    log(...args) {
      if (this.config && this.config.debug) {
        console.log('[TharwahChat VanillaRenderer]', ...args);
      }
    }

    emit(event, data) {
      // Emit events that can be caught by the web component
      if (this.container) {
        this.container.dispatchEvent(new CustomEvent(event, { detail: data }));
      }
    }
  }

  // Export the renderer
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VanillaRenderer;
  } else {
    window.VanillaRenderer = VanillaRenderer;
  }


  // ========== RENDERERS/ASSISTANTUIRENDERER.JS ==========

/**
 * Assistant UI Renderer
 * Modern renderer using Assistant UI components
 * Provides enhanced UX with React-like components
 */

(function() {
  'use strict';

  class AssistantUIRenderer {
    constructor() {
      this.config = null;
      this.core = null;
      this.shadowRoot = null;
      this.container = null;
      this.assistantModal = null;
      this.thread = null;
      this.composer = null;
      this.messages = [];
      this.isOpen = false;
      this.isRendered = false;
    }

    async initialize(config, shadowRoot, core) {
      this.config = config;
      this.core = core;
      this.shadowRoot = shadowRoot;

      this.log('Initializing Assistant UI Renderer...');

      // Check if Assistant UI is available
      if (!this.detectAssistantUI()) {
        throw new Error('Assistant UI is not available');
      }

      // Setup core event listeners
      this.setupCoreEvents();

      // Create container and mount point
      this.createContainer();

      // Initialize Assistant UI components
      await this.initializeAssistantUI();

      // Apply custom styles
      await this.applyCustomStyles();

      this.isRendered = true;
      this.log('Assistant UI Renderer initialized successfully');

      // Auto-open if configured
      if (this.config.autoOpen) {
        setTimeout(() => {
          this.open();
        }, this.config.autoOpenDelay);
      }
    }

    detectAssistantUI() {
      return !!(window.AssistantModal && window.Thread && window.Composer && window.AssistantRuntimeProvider);
    }

    setupCoreEvents() {
      if (!this.core) return;

      // Listen to core events
      this.core.on('messageReceived', (data) => {
        this.addMessageToAssistantUI(data.message);
      });

      this.core.on('messageStreaming', (data) => {
        this.updateStreamingMessage(data.message, data.chunk);
      });

      this.core.on('suggestionsLoaded', (data) => {
        this.displaySuggestions(data.suggestions);
      });

      this.core.on('typingChanged', (data) => {
        this.setTypingIndicator(data.isTyping);
      });

      this.core.on('error', (data) => {
        this.handleError(data);
      });
    }

    createContainer() {
      // Create a React-like mount point
      this.container = document.createElement('div');
      this.container.className = 'tharwah-assistant-ui-container';
      this.container.id = 'tharwah-assistant-ui-root';
      this.shadowRoot.appendChild(this.container);
    }

    async initializeAssistantUI() {
      try {
        // Since we're in vanilla JS, we need to create a React environment
        await this.createReactEnvironment();

        // Initialize Assistant UI with custom configuration
        this.initializeAssistantComponents();

      } catch (error) {
        this.log('Error initializing Assistant UI:', error);
        throw error;
      }
    }

    async createReactEnvironment() {
      return new Promise((resolve) => {
        // Check if React is already available
        if (window.React && window.ReactDOM) {
          resolve();
          return;
        }

        this.log('React not available, creating vanilla implementation');

        // For now, create a vanilla implementation that mimics Assistant UI
        // In a real implementation, you would properly load React
        resolve();
      });
    }

    initializeAssistantComponents() {
      // Since we don't have actual React, create vanilla components that mimic Assistant UI
      this.createVanillaAssistantUI();
    }

    createVanillaAssistantUI() {
      const translations = this.core ? this.core.t : (key) => key;

      // Create Assistant UI-like structure with vanilla JS
      this.container.innerHTML = `
        <div class="tharwah-assistant-modal">
          <!-- Trigger Button -->
          <button class="tharwah-assistant-trigger" aria-label="${translations('startConversation')}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </button>

          <!-- Modal Content -->
          <div class="tharwah-assistant-window">
            <!-- Header -->
            <div class="tharwah-assistant-header">
              <div class="tharwah-assistant-header-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <h3>${this.config.title}</h3>
              </div>
              <button class="tharwah-assistant-close" aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Thread Container -->
            <div class="tharwah-assistant-thread">
              <div class="tharwah-assistant-messages">
                <!-- Messages will be added here -->
              </div>

              <!-- Typing Indicator -->
              <div class="tharwah-assistant-typing hidden">
                <div class="tharwah-assistant-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>${translations('typingIndicator')}</span>
              </div>
            </div>

            <!-- Composer -->
            <div class="tharwah-assistant-composer">
              <div class="tharwah-assistant-input-wrapper">
                <textarea
                  class="tharwah-assistant-input"
                  placeholder="${translations('inputPlaceholder')}"
                  rows="1"
                  aria-label="Message input"
                ></textarea>
                <button class="tharwah-assistant-send" aria-label="${translations('sendButton')}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Cache element references
      this.elements = {
        modal: this.container.querySelector('.tharwah-assistant-modal'),
        trigger: this.container.querySelector('.tharwah-assistant-trigger'),
        window: this.container.querySelector('.tharwah-assistant-window'),
        header: this.container.querySelector('.tharwah-assistant-header'),
        close: this.container.querySelector('.tharwah-assistant-close'),
        messages: this.container.querySelector('.tharwah-assistant-messages'),
        input: this.container.querySelector('.tharwah-assistant-input'),
        send: this.container.querySelector('.tharwah-assistant-send'),
        typing: this.container.querySelector('.tharwah-assistant-typing')
      };

      // Setup event listeners
      this.setupAssistantUIEvents();
    }

    setupAssistantUIEvents() {
      // Trigger button
      this.elements.trigger.addEventListener('click', () => {
        this.toggle();
      });

      // Close button
      this.elements.close.addEventListener('click', () => {
        this.close();
      });

      // Input events
      this.elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.elements.input.addEventListener('input', () => {
        this.autoResizeTextarea();
      });

      // Send button
      this.elements.send.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    async applyCustomStyles() {
      try {
        // Try to load external styles first
        if (window.TharwahStyleLoader) {
          this.styleLoader = new window.TharwahStyleLoader();

          const styleFiles = this.styleLoader.getDefaultStyleFiles('assistant-ui');
          const basePath = this.getStyleBasePath();

          await this.styleLoader.loadStyles(this.shadowRoot, styleFiles, basePath);
          this.log('Assistant UI renderer styles loaded from external files');
          return;
        }

        // Load external CSS files directly
        this.log('Loading Assistant UI styles from external CSS files');
        const cssFiles = ['variables.css', 'base2.css', 'theme-base.css', 'utilities.css'];
        const basePath = this.getStyleBasePath();

        for (const file of cssFiles) {
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = basePath + file;
          this.shadowRoot.appendChild(linkElement);
        }
      } catch (error) {
        this.log('Error loading external CSS styles for Assistant UI renderer:', error);
        console.warn('Failed to load styles, widget may not display correctly');
      }
    }

    getStyleBasePath() {
      // Determine base path for style files
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('tharwah-chat-webcomponent')) {
          const scriptPath = script.src;
          const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
          return basePath.replace(/\/dist\/?$/, '/styles/') + 'styles/';
        }
      }

      // Fallback path
      return './styles/';
    }

  
    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message) return;

      // Clear input
      this.elements.input.value = '';
      this.autoResizeTextarea();

      try {
        // Send message through core
        await this.core.sendMessage(message);
      } catch (error) {
        this.handleError({ type: 'message_send_failed', error });
      }
    }

    addMessageToAssistantUI(message) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `tharwah-assistant-message ${message.role}`;
      messageDiv.setAttribute('data-message-id', message.id);

      // Format content
      const formattedContent = message.role === 'user'
        ? this.core.escapeHtml(message.content)
        : this.core.formatMessage(message.content);

      // Detect RTL
      const isArabic = this.core.isArabicText(message.content);
      const rtlAttr = isArabic ? 'data-rtl="true"' : '';

      messageDiv.innerHTML = `
        <div class="tharwah-assistant-message-content" ${rtlAttr}>${formattedContent}</div>
      `;

      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();
    }

    updateStreamingMessage(message, chunk) {
      let messageElement = this.elements.messages.querySelector(`[data-message-id="${message.id}"]`);

      if (!messageElement) {
        // Create streaming message element
        messageElement = document.createElement('div');
        messageElement.className = `tharwah-assistant-message ${message.role}`;
        messageElement.setAttribute('data-message-id', message.id);

        const isArabic = this.core.isArabicText(message.content);
        const rtlAttr = isArabic ? 'data-rtl="true"' : '';

        messageElement.innerHTML = `
          <div class="tharwah-assistant-message-content" ${rtlAttr}>
            ${this.core.formatMessage(message.content)}
            <span class="tharwah-assistant-streaming-cursor">|</span>
          </div>
        `;

        this.elements.messages.appendChild(messageElement);
      } else {
        // Update existing streaming message
        const contentElement = messageElement.querySelector('.tharwah-assistant-message-content');
        if (contentElement) {
          contentElement.innerHTML = `${this.core.formatMessage(message.content)}<span class="tharwah-assistant-streaming-cursor">|</span>`;
        }
      }

      this.scrollToBottom();
    }

    displaySuggestions(suggestions) {
      // Assistant UI doesn't have a dedicated suggestions area
      // Could implement as quick reply buttons above composer
      this.log('Suggestions received:', suggestions);
    }

    setTypingIndicator(isTyping) {
      if (isTyping) {
        this.elements.typing.classList.remove('hidden');
        this.elements.typing.classList.add('visible-flex');
      } else {
        this.elements.typing.classList.add('hidden');
        this.elements.typing.classList.remove('visible-flex');
      }
      this.scrollToBottom();
    }

    handleError(errorData) {
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: this.core.t('errorGeneric'),
        timestamp: new Date().toISOString(),
        isError: true
      };

      this.addMessageToAssistantUI(errorMessage);
      this.log('Error handled:', errorData);
    }

    autoResizeTextarea() {
      const textarea = this.elements.input;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
      setTimeout(() => {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      }, 100);
    }

    // Public API methods
    open() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.elements.window.classList.add('active');
      this.elements.trigger.classList.add('active');
      this.elements.input.focus();

      if (this.core) {
        this.core.trackEvent('chat_opened');
      }

      this.emit('chat_opened');
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.elements.window.classList.remove('active');
      this.elements.trigger.classList.remove('active');

      if (this.core) {
        this.core.trackEvent('chat_closed');
      }

      this.emit('chat_closed');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    updateConfig(config) {
      this.config = { ...this.config, ...config };
      this.log('Config updated:', config);
    }

    cleanup() {
      if (this.container) {
        this.container.remove();
      }
      this.isRendered = false;
      this.isOpen = false;
    }

    log(...args) {
      if (this.config && this.config.debug) {
        console.log('[TharwahChat AssistantUIRenderer]', ...args);
      }
    }

    emit(event, data) {
      // Emit events that can be caught by the web component
      if (this.container) {
        this.container.dispatchEvent(new CustomEvent(event, { detail: data }));
      }
    }
  }

  // Export the renderer
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssistantUIRenderer;
  } else {
    window.AssistantUIRenderer = AssistantUIRenderer;
  }


  // ========== THARWAHCHATWEBCOMPONENT.JS ==========

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


  // ========== THARWAHCHATBOOTSTRAP.JS ==========

(function(window, document) {
  'use strict';

  const ATTR_MAP = {
    apiEndpoint: 'api-endpoint',
    apiKey: 'api-key',
    botId: 'bot-id',
    organizationId: 'organization-id',
    title: 'title',
    subtitle: 'subtitle',
    welcomeMessage: 'welcome-message',
    primaryColor: 'primary-color',
    secondaryColor: 'secondary-color',
    buttonIcon: 'button-icon',
    position: 'position',
    language: 'language',
    autoOpen: 'auto-open',
    autoOpenDelay: 'auto-open-delay',
    showSuggestions: 'show-suggestions',
    suggestionsLimit: 'suggestions-limit',
    enableStreaming: 'enable-streaming',
    useAssistantUI: 'use-assistant-ui',
    debug: 'debug'
  };

  const BOOLEAN_PROPS = new Set([
    'autoOpen',
    'showSuggestions',
    'enableStreaming',
    'useAssistantUI',
    'debug'
  ]);

  class TharwahChat {
    constructor(config = {}) {
      this.config = { ...config };
      this.element = null;
      this.mountSelector = config.mountSelector || null;
      this.elementId = config.elementId || config.id || 'tharwah-chat-widget';
      this.hasInitialized = false;
    }

    init() {
      if (!this.ensureComponentDefined()) {
        console.error('[TharwahChat] Web component is not registered yet.');
        return this;
      }

      const mountTarget = this.resolveMountTarget();
      if (!mountTarget) {
        console.error('[TharwahChat] Could not resolve mount target.');
        return this;
      }

      this.element = this.getOrCreateElement(mountTarget);
      this.applyConfig(this.config);
      this.hasInitialized = true;
      return this;
    }

    ensureComponentDefined() {
      return (
        typeof window !== 'undefined' &&
        window.customElements &&
        window.customElements.get('tharwah-chat')
      );
    }

    resolveMountTarget() {
      if (this.mountSelector) {
        const target = document.querySelector(this.mountSelector);
        if (target) return target;
        console.warn(
          `[TharwahChat] mountSelector "${this.mountSelector}" not found. Falling back to document.body.`
        );
      }
      return document.body;
    }

    getOrCreateElement(mountTarget) {
      const existingById = document.getElementById(this.elementId);
      if (existingById && existingById.tagName === 'THARWAH-CHAT') {
        return existingById;
      }

      const element = document.createElement('tharwah-chat');
      element.id = this.elementId;
      mountTarget.appendChild(element);
      return element;
    }

    applyConfig(config = {}) {
      if (!this.element) return;

      Object.entries(ATTR_MAP).forEach(([prop, attr]) => {
        if (config[prop] === undefined || config[prop] === null) {
          this.element.removeAttribute(attr);
          return;
        }

        if (BOOLEAN_PROPS.has(prop)) {
          this.element.setAttribute(attr, config[prop] ? 'true' : 'false');
        } else {
          this.element.setAttribute(attr, String(config[prop]));
        }
      });
    }

    updateConfig(updatedConfig = {}) {
      this.config = { ...this.config, ...updatedConfig };
      if (this.hasInitialized) {
        this.applyConfig(this.config);
        if (this.element && typeof this.element.updateConfig === 'function') {
          this.element.updateConfig(this.config);
        }
      }
      return this;
    }

    getElement() {
      return this.element;
    }

    open() {
      this.element?.open();
    }

    close() {
      this.element?.close();
    }

    toggle() {
      this.element?.toggle();
    }

    sendMessage(message) {
      return this.element?.sendMessage(message);
    }

    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
      this.hasInitialized = false;
    }
  }

  function autoInit() {
    if (!window.tharwahChatConfig || window.tharwahChatAutoInitDisabled) {
      return;
    }

    window.tharwahChatWidget = new TharwahChat(window.tharwahChatConfig).init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.TharwahChat = TharwahChat;

})(window, document);
