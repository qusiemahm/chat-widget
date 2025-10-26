/**
 * TharwahChat Widget with Suggestions - Complete Implementation
 * 
 * Features:
 * - Welcome screen with suggestions
 * - Backend API integration
 * - AI agent support
 * - Product cards and quick replies
 * 
 * INSTRUCTIONS:
 * Replace the content of TharwahChat-V1.js with this code
 */

(function(window, document) {
  'use strict';

  class TharwahChat {
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
        showSuggestions: config.showSuggestions !== false, // Default: true
        suggestionsLimit: config.suggestionsLimit || 6,
        ...config
      };

      this.isOpen = false;
      this.conversationId = null;
      this.messages = [];
      this.suggestions = [];
      this.isTyping = false;
      this.isRendered = false;
      this.showingWelcome = true; // Start with welcome screen

      this.log('TharwahChat initialized', this.config);
      
      if (!this.config.apiKey) {
        console.error('[TharwahChat] ERROR: apiKey is required in config!');
      }
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
      return this;
    }

    async render() {
      if (this.isRendered) {
        this.log('Widget already rendered, skipping...');
        return;
      }

      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();

      // Load suggestions if enabled
      if (this.config.showSuggestions) {
        await this.loadSuggestions();
      }

      // Show welcome screen or normal message
      setTimeout(() => {
        if (this.showingWelcome && this.suggestions.length > 0) {
          this.showWelcomeScreen();
        } else {
          this.addMessage(this.config.welcomeMessage, 'bot');
        }
      }, 500);

      this.isRendered = true;

      if (this.config.autoOpen) {
        setTimeout(() => {
          this.open();
        }, this.config.autoOpenDelay);
      }

      this.log('Widget rendered successfully');
    }

    // ============================================
    // SUGGESTIONS
    // ============================================

    async loadSuggestions() {
      try {
        const response = await fetch(
          `${this.config.apiEndpoint}/widget/suggestions/welcome/?bot_id=${this.config.botId}&limit=${this.config.suggestionsLimit}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load suggestions: ${response.status}`);
        }

        const data = await response.json();
        this.suggestions = data.suggestions || [];
        
        this.log('Loaded suggestions:', this.suggestions.length);
      } catch (error) {
        this.log('Error loading suggestions:', error);
        this.suggestions = [];
      }
    }

    showWelcomeScreen() {
      if (!this.suggestions || this.suggestions.length === 0) {
        this.addMessage(this.config.welcomeMessage, 'bot');
        return;
      }

      // Add welcome message
      this.addMessage(this.config.welcomeMessage, 'bot');

      // Add suggestions as clickable chips
      const suggestionsHtml = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
          ${this.suggestions.map(suggestion => `
            <button 
              class="tharwah-suggestion-chip" 
              data-suggestion-id="${suggestion.id}"
              data-action-text="${this.escapeHtml(suggestion.action_text).replace(/"/g, '&quot;')}"
              style="
                padding: 10px 16px;
                background: white;
                border: 2px solid ${this.config.primaryColor};
                color: ${this.config.primaryColor};
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
              "
              onmouseover="this.style.background='${this.config.primaryColor}'; this.style.color='white';"
              onmouseout="this.style.background='white'; this.style.color='${this.config.primaryColor}';"
              onclick="window.tharwahChatWidget.handleSuggestionClick(${suggestion.id}, this.getAttribute('data-action-text'))"
            >
              ${suggestion.icon ? suggestion.icon + ' ' : ''}${this.escapeHtml(suggestion.title)}
            </button>
          `).join('')}
        </div>
      `;

      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot';
      messageDiv.innerHTML = `<div class="tharwah-chat-message-content" style="max-width: 100%; background: transparent; box-shadow: none; padding: 8px 0;">${suggestionsHtml}</div>`;
      this.elements.messages.appendChild(messageDiv);
      
      this.scrollToBottom();
    }

    async handleSuggestionClick(suggestionId, actionText) {
      this.log('Suggestion clicked:', suggestionId, actionText);

      // Hide welcome screen
      this.showingWelcome = false;

      // Track the click
      try {
        await fetch(
          `${this.config.apiEndpoint}/widget/suggestions/${suggestionId}/track-click/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              session_id: this.getSessionId(),
              page_url: window.location.href,
              page_title: document.title
            })
          }
        );
      } catch (error) {
        this.log('Error tracking suggestion click:', error);
      }

      // Send the action text as a message
      this.elements.input.value = actionText;
      await this.sendMessage();
    }

    // ============================================
    // CONVERSATION
    // ============================================

    async createConversation() {
      try {
        const sessionId = this.getSessionId();

        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              bot_id: this.config.botId,
              external_ref: sessionId,
              metadata: {
                user_agent: navigator.userAgent,
                page_url: window.location.href,
                referrer: document.referrer,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString()
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to create conversation: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.conversationId = data.id;
        
        this.log('Conversation created:', this.conversationId);

        localStorage.setItem('tharwah_conversation_id', this.conversationId);
        localStorage.setItem('tharwah_conversation_created', Date.now().toString());

        return data;

      } catch (error) {
        this.log('Error creating conversation:', error);
        throw error;
      }
    }

    getSessionId() {
      let sessionId = localStorage.getItem('tharwah_session_id');
      
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tharwah_session_id', sessionId);
        this.log('Generated new session ID:', sessionId);
      }
      
      return sessionId;
    }

    // ============================================
    // MESSAGING
    // ============================================

    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message) return;

      this.elements.input.value = '';
      this.addMessage(message, 'user');

      this.trackEvent('chat_message_sent', {
        message_length: message.length
      });

      this.showTyping();

      await this.getResponse(message);
    }

    async getResponse(userMessage) {
      try {
        // Ensure we have a conversation
        if (!this.conversationId) {
          this.log('No conversation ID, creating new conversation...');
          await this.createConversation();
        }

        if (!this.config.apiKey) {
          throw new Error('API key is not configured.');
        }

        this.log('Sending message to backend:', userMessage);
        
        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/${this.conversationId}/send-agent/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              content: userMessage
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.log('Received response from backend:', data);

        this.hideTyping();

        // Show assistant's response
        const botMessage = data.assistant_message.content;
        this.addMessage(botMessage, 'bot');

        // Show products if any
        if (data.composed_response?.products?.length > 0) {
          this.log('Showing products:', data.composed_response.products.length);
          this.showProducts(data.composed_response.products);
        }

        // Show quick replies if any
        if (data.composed_response?.quick_replies?.length > 0) {
          this.log('Showing quick replies:', data.composed_response.quick_replies.length);
          this.showQuickReplies(data.composed_response.quick_replies);
        }

        this.trackEvent('chat_response_received', {
          agent: data.routing_info?.selected_agent?.name,
          agent_type: data.routing_info?.selected_agent?.type,
          had_products: data.composed_response?.products?.length > 0,
          had_quick_replies: data.composed_response?.quick_replies?.length > 0
        });

      } catch (error) {
        this.hideTyping();
        
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        
        if (error.message.includes('API key')) {
          errorMessage = 'Configuration error. Please contact support.';
        }
        
        this.addMessage(errorMessage, 'bot');
        this.log('Error getting response:', error);
        
        this.trackEvent('chat_error', {
          error: error.message
        });
      }
    }

    showProducts(products) {
      products.forEach(product => {
        const productHtml = `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 4px; margin-bottom: 8px; object-fit: cover; max-height: 150px;" onerror="this.style.display='none'" />` : ''}
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #2d3748;">${this.escapeHtml(product.name)}</h4>
            ${product.description ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #718096; line-height: 1.4;">${this.escapeHtml(product.description.substring(0, 100))}${product.description.length > 100 ? '...' : ''}</p>` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center;">
              ${product.price ? `<span style="font-weight: 600; color: #667eea; font-size: 16px;">${this.escapeHtml(product.price)}</span>` : ''}
              ${product.rating ? `<span style="font-size: 12px; color: #ecc94b;">⭐ ${product.rating}</span>` : ''}
            </div>
            ${product.link ? `<a href="${product.link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%); color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-align: center; width: 100%; box-sizing: border-box;">View Course →</a>` : ''}
          </div>
        `;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'tharwah-chat-message bot';
        messageDiv.innerHTML = `<div class="tharwah-chat-message-content" style="max-width: 90%; padding: 0;">${productHtml}</div>`;
        this.elements.messages.appendChild(messageDiv);
      });
      
      this.scrollToBottom();
    }

    showQuickReplies(quickReplies) {
      const repliesHtml = quickReplies.map(reply => 
        `<button 
          onclick="window.tharwahChatWidget.handleQuickReply('${this.escapeHtml(reply.reply_text).replace(/'/g, "\\'")}', ${reply.id})" 
          style="margin: 4px; padding: 8px 16px; background: white; border: 2px solid ${this.config.primaryColor}; color: ${this.config.primaryColor}; border-radius: 16px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s;"
          onmouseover="this.style.background='${this.config.primaryColor}'; this.style.color='white';"
          onmouseout="this.style.background='white'; this.style.color='${this.config.primaryColor}';"
        >${this.escapeHtml(reply.title)}</button>`
      ).join('');
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot';
      messageDiv.innerHTML = `<div class="tharwah-chat-message-content" style="max-width: 90%; padding: 8px; background: transparent; box-shadow: none;">${repliesHtml}</div>`;
      this.elements.messages.appendChild(messageDiv);
      
      this.scrollToBottom();
    }

    handleQuickReply(replyText, replyId) {
      this.log('Quick reply clicked:', replyText, replyId);
      
      this.trackEvent('chat_quick_reply_clicked', {
        reply_id: replyId,
        reply_text: replyText
      });
      
      this.elements.input.value = replyText;
      this.sendMessage();
    }

    // ============================================
    // UI METHODS (unchanged)
    // ============================================

    injectStyles() {
      const styles = `
        /* Base styles */
        .tharwah-chat-widget * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Chat button */
        .tharwah-chat-button {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          bottom: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: transform 0.3s, box-shadow 0.3s;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tharwah-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }

        .tharwah-chat-button.open {
          background: #4a5568;
        }

        /* Chat window */
        .tharwah-chat-window {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          bottom: 90px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 999998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .tharwah-chat-window.active {
          display: flex;
          animation: slideInUp 0.3s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .tharwah-chat-header {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tharwah-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tharwah-chat-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .tharwah-chat-header-text h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .tharwah-chat-header-text p {
          font-size: 12px;
          opacity: 0.9;
        }

        .tharwah-chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .tharwah-chat-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Messages */
        .tharwah-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }

        .tharwah-chat-message {
          margin-bottom: 12px;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .tharwah-chat-message.user {
          text-align: right;
        }

        .tharwah-chat-message.bot {
          text-align: left;
        }

        .tharwah-chat-message-content {
          display: inline-block;
          padding: 10px 14px;
          border-radius: 18px;
          max-width: 80%;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }

        .tharwah-chat-message.bot .tharwah-chat-message-content {
          background: white;
          color: #2d3748;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tharwah-chat-message.user .tharwah-chat-message-content {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        /* Typing indicator */
        .tharwah-chat-typing {
          display: inline-flex;
          gap: 4px;
          padding: 10px 14px;
          background: white;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tharwah-chat-typing span {
          width: 8px;
          height: 8px;
          background: #a0aec0;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .tharwah-chat-typing span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .tharwah-chat-typing span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        /* Input */
        .tharwah-chat-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }

        .tharwah-chat-input {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .tharwah-chat-input:focus {
          border-color: ${this.config.primaryColor};
        }

        .tharwah-chat-send {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .tharwah-chat-send:hover {
          opacity: 0.9;
        }

        .tharwah-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .tharwah-chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 140px);
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const container = document.createElement('div');
      container.className = 'tharwah-chat-widget';
      container.innerHTML = `
        <button class="tharwah-chat-button" id="tharwah-chat-button" aria-label="Open chat">
          ${this.config.buttonIcon}
        </button>
        
        <div class="tharwah-chat-window" id="tharwah-chat-window">
          <div class="tharwah-chat-header">
            <div class="tharwah-chat-header-info">
              <div class="tharwah-chat-avatar">${this.config.buttonIcon}</div>
              <div class="tharwah-chat-header-text">
                <h3>${this.config.title}</h3>
                <p>${this.config.subtitle}</p>
              </div>
            </div>
            <button class="tharwah-chat-close" id="tharwah-chat-close" aria-label="Close chat">×</button>
          </div>
          
          <div class="tharwah-chat-messages" id="tharwah-chat-messages"></div>
          
          <div class="tharwah-chat-input-container">
            <input 
              type="text" 
              class="tharwah-chat-input" 
              id="tharwah-chat-input"
              placeholder="Type your message..."
              aria-label="Chat message"
            />
            <button class="tharwah-chat-send" id="tharwah-chat-send">Send</button>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      this.elements = {
        button: document.getElementById('tharwah-chat-button'),
        window: document.getElementById('tharwah-chat-window'),
        close: document.getElementById('tharwah-chat-close'),
        messages: document.getElementById('tharwah-chat-messages'),
        input: document.getElementById('tharwah-chat-input'),
        send: document.getElementById('tharwah-chat-send')
      };
    }

    attachEventListeners() {
      this.elements.button.addEventListener('click', () => this.toggle());
      this.elements.close.addEventListener('click', () => this.close());
      this.elements.send.addEventListener('click', () => this.sendMessage());
      
      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.elements.window.classList.add('active');
      this.elements.button.classList.add('open');
      this.elements.button.textContent = '×';
      this.elements.input.focus();

      this.trackEvent('chat_opened');
      this.log('Chat opened');
    }

    close() {
      this.isOpen = false;
      this.elements.window.classList.remove('active');
      this.elements.button.classList.remove('open');
      this.elements.button.textContent = this.config.buttonIcon;

      this.trackEvent('chat_closed');
      this.log('Chat closed');
    }

    addMessage(content, sender = 'bot') {
      const message = {
        id: Date.now(),
        content,
        sender,
        timestamp: new Date()
      };

      this.messages.push(message);

      const messageDiv = document.createElement('div');
      messageDiv.className = `tharwah-chat-message ${sender}`;
      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content">${this.escapeHtml(content)}</div>
      `;

      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();

      return message;
    }

    showTyping() {
      if (this.isTyping) return;
      this.isTyping = true;

      const typingDiv = document.createElement('div');
      typingDiv.className = 'tharwah-chat-message bot';
      typingDiv.id = 'tharwah-typing-indicator';
      typingDiv.innerHTML = `
        <div class="tharwah-chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;

      this.elements.messages.appendChild(typingDiv);
      this.scrollToBottom();
    }

    hideTyping() {
      this.isTyping = false;
      const typingDiv = document.getElementById('tharwah-typing-indicator');
      if (typingDiv) {
        typingDiv.remove();
      }
    }

    scrollToBottom() {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    trackEvent(eventName, data = {}) {
      if (window.tracker && typeof window.tracker.event === 'function') {
        window.tracker.event(eventName, {
          ...data,
          source: 'tharwah_chat_widget',
          timestamp: Date.now()
        });
      }

      const event = new CustomEvent('tharwah-chat:event', {
        detail: { event: eventName, data }
      });
      window.dispatchEvent(event);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    log(...args) {
      if (this.config.debug) {
        console.log('[TharwahChat]', ...args);
      }
    }

    destroy() {
      const widget = document.querySelector('.tharwah-chat-widget');
      if (widget) {
        widget.remove();
      }
      this.log('Widget destroyed');
    }

    sendMessageProgrammatically(message) {
      this.elements.input.value = message;
      this.sendMessage();
    }
  }

  // ============================================
  // GLOBAL EXPOSURE
  // ============================================

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TharwahChat;
  }

  window.TharwahChat = TharwahChat;

  // Auto-initialize
  if (window.tharwahChatConfig) {
    window.tharwahChatWidget = new TharwahChat(window.tharwahChatConfig).init();
  }

})(window, document);
