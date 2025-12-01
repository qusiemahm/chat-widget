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

})();