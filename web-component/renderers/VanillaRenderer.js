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

})();