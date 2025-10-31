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
        enableStreaming: config.enableStreaming || true, // NEW: Enable streaming responses
        ...config
      };

      this.isOpen = false;
      this.conversationId = null;
      this.messages = [];
      this.suggestions = [];
      this.isTyping = false;
      this.isRendered = false;
      this.showingWelcome = true; // Start with welcome screen
      this.currentStreamingMessage = null; // Track current streaming message

      this.log('TharwahChat initialized', this.config);
      this.log('Streaming enabled:', this.config.enableStreaming);
      
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
        // Check if user already provided email and accepted terms
        const userEmail = sessionStorage.getItem('tharwah_user_email');
        const termsAccepted = sessionStorage.getItem('tharwah_terms_accepted');

        if (this.showingWelcome && this.suggestions.length > 0 && !(userEmail && termsAccepted)) {
          this.showWelcomeScreen();
        } else {
          this.showingWelcome = false;
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

      // Hide the chat interface
      this.elements.messages.style.display = 'none';
      this.elements.inputContainer.style.display = 'none';
      
      // Create welcome screen overlay
      const welcomeScreen = document.createElement('div');
      welcomeScreen.id = 'tharwah-welcome-screen';
      welcomeScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
        display: flex;
        flex-direction: column;
        z-index: 10;
      `;

      welcomeScreen.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 24px; overflow-y: auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0;">Hi there! 👋</h1>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0;">Let's find what you're looking for</p>
          </div>
          
          <div style="background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 12px; margin-bottom: 16px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${this.suggestions.map(suggestion => `
                <button 
                  class="tharwah-welcome-suggestion"
                  data-suggestion-id="${suggestion.id}"
                  data-action-text="${this.escapeHtml(suggestion.action_text).replace(/"/g, '&quot;')}"
                  style="
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    background: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                  "
                  onmouseover="this.style.background='#f9fafb';"
                  onmouseout="this.style.background='white';"
                  onclick="window.tharwahChatWidget.handleWelcomeSuggestionClick(${suggestion.id}, this.getAttribute('data-action-text'))"
                >
                  <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${this.escapeHtml(suggestion.title)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; transition: stroke 0.2s;">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              `).join('')}
            </div>
          </div>
          
          <button 
            id="tharwah-start-conversation"
            style="
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              padding: 16px;
              border: none;
              cursor: pointer;
              width: 100%;
              transition: all 0.3s;
            "
            onmouseover="this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)';"
            onmouseout="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
            onclick="window.tharwahChatWidget.startConversation()"
          >
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="text-align: left; flex: 1;">
                <h3 style="font-size: 15px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">Start a conversation</h3>
                <p style="font-size: 13px; color: #6b7280; margin: 0;">Ask us anything about our programs</p>
              </div>
              <div style="background: #2563eb; padding: 10px; border-radius: 50%; transition: background 0.2s;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
              </div>
            </div>
          </button>
        </div>
      `;

      this.elements.window.appendChild(welcomeScreen);
    }

    async handleWelcomeSuggestionClick(suggestionId, actionText) {
      this.log('Welcome suggestion clicked:', suggestionId, actionText);

      // Check if user already provided email
      const userEmail = sessionStorage.getItem('tharwah_user_email');
      const termsAccepted = sessionStorage.getItem('tharwah_terms_accepted');

      if (userEmail && termsAccepted) {
        // User already registered, proceed normally
        await this.proceedAfterEmailCapture(suggestionId, actionText);
      } else {
        // Show email capture screen
        this.showEmailCaptureScreen({
          type: 'suggestion',
          source: 'suggestion_click',
          suggestionId: suggestionId,
          actionText: actionText
        });
      }
      
    }

    showEmailCaptureScreen(callbackData = {}) {
      // Remove welcome screen
      const welcomeScreen = document.getElementById('tharwah-welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.remove();
      }

      // Create email capture screen
      const emailScreen = document.createElement('div');
      emailScreen.id = 'tharwah-email-screen';
      emailScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        display: flex;
        flex-direction: column;
        z-index: 10;
        padding: 24px;
      `;

      emailScreen.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Chat with Tharwah Academy</h2>
          <button
            onclick="window.tharwahChatWidget.closeEmailScreen()"
            style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column;">
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">
              To get started, please share your email address:
            </p>
          </div>

          <form id="tharwah-email-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <input
                type="email"
                id="tharwah-email-input"
                placeholder="your@email.com"
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  font-size: 14px;
                  outline: none;
                  transition: border-color 0.2s;
                "
                onfocus="this.style.borderColor='#2563eb'"
                onblur="this.style.borderColor='#e5e7eb'"
                oninput="window.tharwahChatWidget.validateEmailForm()"
              />
            </div>

            <label style="display: flex; align-items: start; gap: 8px; cursor: pointer;">
              <input
                type="checkbox"
                id="tharwah-terms-checkbox"
                required
                style="
                  width: 18px;
                  height: 18px;
                  margin-top: 2px;
                  cursor: pointer;
                  accent-color: #2563eb;
                  flex-shrink: 0;
                "
                onchange="window.tharwahChatWidget.validateEmailForm()"
              />
              <span style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                I agree to Tharwah Academy's Terms & Conditions and acknowledge that my personal information will be processed in accordance with data protection regulations.
              </span>
            </label>

            <button
              type="submit"
              id="tharwah-submit-button"
              disabled
              style="
                width: 100%;
                padding: 14px;
                background: #d1d5db;
                color: #9ca3af;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: not-allowed;
                transition: all 0.2s;
                box-shadow: none;
              "
            >
              Submit
            </button>
          </form>
        </div>
      `;

      this.elements.window.appendChild(emailScreen);

      // Store callback data for later use
      this.emailCaptureCallback = callbackData;

      // Attach form submit handler
      const form = document.getElementById('tharwah-email-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEmailSubmit();
      });
    }

    async handleEmailSubmit() {
      const emailInput = document.getElementById('tharwah-email-input');
      const termsCheckbox = document.getElementById('tharwah-terms-checkbox');

      const email = emailInput.value.trim();
      const termsAccepted = termsCheckbox.checked;

      if (!email) {
        alert('Please enter your email address');
        return;
      }

      if (!termsAccepted) {
        alert('Please accept the Terms & Conditions');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Create conversation first if it doesn't exist
      if (!this.conversationId) {
        this.log('Creating conversation before email capture...');
        try {
          await this.createConversation();
        } catch (error) {
          this.log('Error creating conversation:', error);
          alert('Failed to start conversation. Please try again.');
          return;
        }
      }

      // Update conversation with email and terms acceptance
      try {
        this.log('Updating conversation with email:', email);

        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/${this.conversationId}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              user_email: email,
              terms_and_conditions_agreed: true
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to update conversation: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.log('Conversation updated successfully:', data);

        // Store email and terms acceptance in session
        sessionStorage.setItem('tharwah_user_email', email);
        sessionStorage.setItem('tharwah_terms_accepted', 'true');
        sessionStorage.setItem('tharwah_email_timestamp', Date.now().toString());

        // Track email capture
        this.trackEvent('email_captured', {
          email: email,
          source: this.emailCaptureCallback?.source || 'welcome_screen',
          conversation_id: this.conversationId
        });

        // Remove email screen
        const emailScreen = document.getElementById('tharwah-email-screen');
        if (emailScreen) {
          emailScreen.remove();
        }

        // Execute callback based on the stored data
        if (this.emailCaptureCallback?.type === 'suggestion' && this.emailCaptureCallback?.suggestionId && this.emailCaptureCallback?.actionText) {
          await this.proceedAfterEmailCapture(this.emailCaptureCallback.suggestionId, this.emailCaptureCallback.actionText);
        } else if (this.emailCaptureCallback?.type === 'startConversation') {
          await this.proceedToNormalChat();
        }

      } catch (error) {
        this.log('Error updating conversation with email:', error);
        alert('Failed to save your information. Please try again.');
      }
    }

    validateEmailForm() {
      const emailInput = document.getElementById('tharwah-email-input');
      const termsCheckbox = document.getElementById('tharwah-terms-checkbox');
      const submitButton = document.getElementById('tharwah-submit-button');

      if (!emailInput || !termsCheckbox || !submitButton) return;

      const email = emailInput.value.trim();
      const termsAccepted = termsCheckbox.checked;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailValid = emailRegex.test(email);

      // Enable submit button only if email is valid and terms are accepted
      if (isEmailValid && termsAccepted) {
        submitButton.disabled = false;
        submitButton.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)';
        submitButton.style.color = 'white';
        submitButton.style.cursor = 'pointer';
        submitButton.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
        submitButton.style.transition = 'all 0.2s';
        submitButton.setAttribute('onmouseover', 'this.style.transform=\'translateY(-1px)\'; this.style.boxShadow=\'0 4px 12px rgba(37, 99, 235, 0.4)\'');
        submitButton.setAttribute('onmouseout', 'this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 2px 8px rgba(37, 99, 235, 0.3)\'');
      } else {
        submitButton.disabled = true;
        submitButton.style.background = '#d1d5db';
        submitButton.style.color = '#9ca3af';
        submitButton.style.cursor = 'not-allowed';
        submitButton.style.boxShadow = 'none';
        submitButton.removeAttribute('onmouseover');
        submitButton.removeAttribute('onmouseout');
      }
    }

    closeEmailScreen() {
      // Remove email screen
      const emailScreen = document.getElementById('tharwah-email-screen');
      if (emailScreen) {
        emailScreen.remove();
      }

      // Show welcome screen again
      this.showWelcomeScreen();
    }

    async proceedAfterEmailCapture(suggestionId, actionText) {
      // Show chat interface
      this.elements.messages.style.display = '';
      this.elements.inputContainer.style.display = '';

      // Hide welcome screen flag
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
              page_title: document.title,
              user_email: sessionStorage.getItem('tharwah_user_email')
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

    async startConversation() {
      this.log('Starting conversation from welcome screen');

      // Check if user already provided email and accepted terms
      const userEmail = sessionStorage.getItem('tharwah_user_email');
      const termsAccepted = sessionStorage.getItem('tharwah_terms_accepted');

      if (userEmail && termsAccepted) {
        // User already registered, proceed normally
        await this.proceedToNormalChat();
      } else {
        // Show email capture screen
        this.showEmailCaptureScreen({
          type: 'startConversation',
          source: 'start_conversation'
        });
      }
    }

    
    async proceedToNormalChat() {
      // Remove welcome screen
      const welcomeScreen = document.getElementById('tharwah-welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.remove();
      }

      // Show chat interface
      this.elements.messages.style.display = '';
      this.elements.inputContainer.style.display = '';

      // Hide welcome screen flag
      this.showingWelcome = false;

      // Add welcome message
      this.addMessage(this.config.welcomeMessage, 'bot');

      // Focus on input
      this.elements.input.focus();
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

        sessionStorage.setItem('tharwah_conversation_id', this.conversationId);
        sessionStorage.setItem('tharwah_conversation_created', Date.now().toString());

        return data;

      } catch (error) {
        this.log('Error creating conversation:', error);
        throw error;
      }
    }

    getSessionId() {
      let sessionId = sessionStorage.getItem('tharwah_session_id');

      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('tharwah_session_id', sessionId);
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

      // Use streaming or non-streaming based on config
      if (this.config.enableStreaming) {
        await this.getResponseStreaming(message);
      } else {
        this.showTyping();
        await this.getResponse(message);
      }
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

        // Show products if any (check ui_elements first, fallback to direct products)
        const products = data.composed_response?.ui_elements?.products || data.composed_response?.products || [];
        if (products.length > 0) {
          this.log('Showing products:', products.length);
          this.showProducts(products);
        }

        // Show quick replies if any (check ui_elements first, fallback to direct quick_replies)
        const quickReplies = data.composed_response?.ui_elements?.quick_replies || data.composed_response?.quick_replies || [];
        if (quickReplies.length > 0) {
          this.log('Showing quick replies:', quickReplies.length);
          this.showQuickReplies(quickReplies);
        }

        this.trackEvent('chat_response_received', {
          agent: data.routing_info?.selected_agent?.name,
          agent_type: data.routing_info?.selected_agent?.type,
          had_products: products.length > 0,
          had_quick_replies: quickReplies.length > 0
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

    async getResponseStreaming(userMessage) {
      try {
        // Ensure we have a conversation
        if (!this.conversationId) {
          this.log('No conversation ID, creating new conversation...');
          await this.createConversation();
        }

        if (!this.config.apiKey) {
          throw new Error('API key is not configured.');
        }

        this.log('Sending streaming message to backend:', userMessage);
        
        // Create empty bot message for streaming
        const messageId = 'stream-msg-' + Date.now();
        this.currentStreamingMessage = this.createEmptyBotMessage(messageId);
        
        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/${this.conversationId}/send-agent-stream/`,
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

        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        let products = [];
        let quickReplies = [];
        let routingInfo = null;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              const eventType = data.type;
              
              this.log('Stream event:', eventType, data);
              
              if (eventType === 'routing') {
                routingInfo = data.routing_info;
                this.log('Routing to agent:', routingInfo.selected_agent.name);
              }
              else if (eventType === 'text') {
                // Append text to message
                fullText += data.content;
                this.updateStreamingMessage(messageId, fullText);
              }
              else if (eventType === 'tool_start') {
                // Show tool indicator
                this.showToolIndicator(data.tool_name);
              }
              else if (eventType === 'tool_executing') {
                // Update tool indicator
                this.updateToolIndicator(data.tool_name, 'executing');
              }
              else if (eventType === 'tool_complete') {
                // Hide tool indicator
                this.hideToolIndicator();
              }
              else if (eventType === 'products') {
                // Store products to show after text
                products = data.products;
              }
              else if (eventType === 'quick_replies') {
                // Store quick replies to show after text
                quickReplies = data.quick_replies;
              }
              else if (eventType === 'done') {
                this.log('Streaming complete. Message ID:', data.message_id);
                
                // Show products if any
                if (products.length > 0) {
                  this.showProducts(products);
                }
                
                // Show quick replies if any
                if (quickReplies.length > 0) {
                  this.showQuickReplies(quickReplies);
                }
                
                this.trackEvent('chat_response_received_streaming', {
                  agent: routingInfo?.selected_agent?.name,
                  agent_type: routingInfo?.selected_agent?.type,
                  had_products: products.length > 0,
                  had_quick_replies: quickReplies.length > 0,
                  streaming: true
                });
              }
              else if (eventType === 'error') {
                throw new Error(data.error);
              }
            }
          }
        }
        
        this.currentStreamingMessage = null;

      } catch (error) {
        this.hideToolIndicator();
        
        if (this.currentStreamingMessage) {
          // Remove the empty streaming message
          this.currentStreamingMessage.remove();
          this.currentStreamingMessage = null;
        }
        
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        
        if (error.message.includes('API key')) {
          errorMessage = 'Configuration error. Please contact support.';
        }
        
        this.addMessage(errorMessage, 'bot');
        this.log('Error getting streaming response:', error);
        
        this.trackEvent('chat_error_streaming', {
          error: error.message
        });
      }
    }

    createEmptyBotMessage(messageId) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot';
      messageDiv.id = messageId;
      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content">
          <span class="streaming-cursor">▋</span>
        </div>
      `;
      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();
      return messageDiv;
    }

    updateStreamingMessage(messageId, text) {
      const messageDiv = document.getElementById(messageId);
      if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.tharwah-chat-message-content');
        if (contentDiv) {
          // Add text with cursor
          contentDiv.innerHTML = this.escapeHtml(text) + '<span class="streaming-cursor">▋</span>';
          this.scrollToBottom();
        }
      }
    }

    showToolIndicator(toolName) {
      // Remove existing indicator if any
      this.hideToolIndicator();
      
      const indicator = document.createElement('div');
      indicator.className = 'tharwah-chat-message bot tool-indicator';
      indicator.id = 'tool-indicator';
      indicator.innerHTML = `
        <div class="tharwah-chat-message-content" style="background: #eff6ff; border: 1px solid #dbeafe;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="spinner-small"></div>
            <span style="font-size: 12px; color: #1d4ed8;">Using ${toolName}...</span>
          </div>
        </div>
      `;
      this.elements.messages.appendChild(indicator);
      this.scrollToBottom();
    }

    updateToolIndicator(toolName, status) {
      const indicator = document.getElementById('tool-indicator');
      if (indicator) {
        const contentDiv = indicator.querySelector('.tharwah-chat-message-content');
        if (contentDiv) {
          if (status === 'executing') {
            contentDiv.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="spinner-small"></div>
                <span style="font-size: 12px; color: #1d4ed8;">⚙️ Executing ${toolName}...</span>
              </div>
            `;
          }
        }
      }
    }

    hideToolIndicator() {
      const indicator = document.getElementById('tool-indicator');
      if (indicator) {
        indicator.remove();
      }
    }

    showProducts(products) {
      // Get base URL for images (remove /api/ from apiEndpoint)
      const baseUrl = this.config.apiEndpoint.replace(/\/api\/?$/, '');
      
      // Create horizontal scrollable container for products
      const productsHtml = products.map(product => {
        // Extract values from API response structure
        const name = product.name || '';
        const imageUrl = product.image_url || product.image || null;
        // Build full image URL
        const fullImageUrl = imageUrl ? `${baseUrl}${imageUrl}` : null;
        const imageAlt = product.image_alt || name;
        const productLink = product.product_link || product.enroll_link || product.external_link || product.link || null;
        const price = product.metadata?.price || product.price || null;
        const originalPrice = product.metadata?.original_price || product.original_price || null;
        const currency = product.metadata?.currency || product.currency || 'SAR';
        const rating = product.metadata?.rating || product.rating || null;
        const reviewCount = product.metadata?.enrollments || product.enrollments || null;
        
        // Format price
        const priceFormatted = price ? `${currency} ${price.toLocaleString()}` : '';
        const originalPriceFormatted = originalPrice ? `${currency} ${originalPrice.toLocaleString()}` : '';
        const monthlyPrice = price ? Math.round(price / 12).toLocaleString() : '';
        
        return `
          <div style="
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s;
            flex-shrink: 0;
            width: 180px;
          " onmouseover="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
            <!-- Image -->
            <div style="position: relative;">
              ${fullImageUrl ? 
                `<img src="${fullImageUrl}" alt="${this.escapeHtml(imageAlt)}" style="width: 100%; height: 96px; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'width: 100%; height: 96px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);\\' />';" />` :
                `<div style="width: 100%; height: 96px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);"></div>`
              }
            </div>
            
            <!-- Content -->
            <div style="padding: 8px;">
              <!-- Title with audio button -->
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                <h4 style="
                  font-size: 12px;
                  font-weight: 600;
                  color: #111827;
                  margin: 0;
                  line-height: 1.3;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                  height: 32px;
                  flex: 1;
                ">${this.escapeHtml(name)}</h4>
                <button style="
                  flex-shrink: 0;
                  padding: 4px;
                  border-radius: 50%;
                  background: #eff6ff;
                  color: #2563eb;
                  border: none;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 24px;
                  height: 24px;
                " onmouseover="this.style.background='#dbeafe'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)'" onclick="alert('Audio description feature coming soon!')" aria-label="Listen to description" title="Listen to description">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
                    <path d="M16 9a5 5 0 0 1 0 6"></path>
                    <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Rating -->
              ${rating ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span style="font-size: 10px; font-weight: 500; color: #111827;">${rating}</span>
                  ${reviewCount ? `<span style="font-size: 10px; color: #6b7280;">(${reviewCount > 1000 ? Math.floor(reviewCount/1000) + 'k+' : reviewCount})</span>` : ''}
                </div>
              ` : ''}
              
              <!-- Pricing -->
              ${priceFormatted ? `
                <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin-bottom: 8px;">
                  <div style="font-size: 14px; font-weight: 700; color: #2563eb; line-height: 1.2; margin-bottom: 2px;">${this.escapeHtml(priceFormatted)}</div>
                  ${originalPriceFormatted ? `<div style="font-size: 9px; color: #9ca3af; text-decoration: line-through; line-height: 1;">${this.escapeHtml(originalPriceFormatted)}</div>` : ''}
                  ${monthlyPrice ? `<div style="font-size: 9px; color: #16a34a; font-weight: 500; margin-top: 2px; line-height: 1;">${currency} ${monthlyPrice}/mo</div>` : ''}
                </div>
              ` : ''}
              
              <!-- Enroll Button -->
              ${productLink ? `
                <a href="${productLink}" target="_blank" rel="noopener noreferrer" style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  padding: 6px 16px;
                  background: #2563eb;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  transition: background 0.2s;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                  line-height: 1.5;
                " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                  Enroll Now
                </a>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      // Create message with horizontal scroll
      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot';
      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content" style="max-width: 100%; padding: 0; background: transparent; box-shadow: none;">
          <div style="
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding: 8px 4px;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          ">
            ${productsHtml}
          </div>
        </div>
      `;
      
      this.elements.messages.appendChild(messageDiv);
      // Don't auto-scroll for products - let user scroll to see them
    }

    showQuickReplies(quickReplies) {
      // Color schemes for variety
      const colorSchemes = [
        { bg: '#dbeafe', hover: '#bfdbfe', text: '#1d4ed8', border: '#93c5fd' }, // Blue
        { bg: '#dcfce7', hover: '#bbf7d0', text: '#15803d', border: '#86efac' }, // Green
        { bg: '#f3e8ff', hover: '#e9d5ff', text: '#7e22ce', border: '#d8b4fe' }, // Purple
        { bg: '#fef3c7', hover: '#fde68a', text: '#a16207', border: '#fcd34d' }, // Yellow
      ];
      
      const repliesHtml = quickReplies.map((reply, index) => {
        const title = reply.title || reply.text || '';
        const replyText = reply.reply_text || reply.text || title;
        const icon = reply.icon || '';
        const replyId = reply.id || '';
        const colorScheme = colorSchemes[index % colorSchemes.length];
        
        // Default sparkles icon if no icon provided
        const iconSvg = icon || `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
        </svg>`;
        
        return `<button 
          onclick="window.tharwahChatWidget.handleQuickReply('${this.escapeHtml(replyText).replace(/'/g, "\\'")}', '${replyId}')" 
          style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            height: 28px;
            background: ${colorScheme.bg};
            color: ${colorScheme.text};
            border: 1px solid ${colorScheme.border};
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            gap: 4px;
          "
          onmouseover="this.style.background='${colorScheme.hover}'; this.style.transform='scale(1.05)';"
          onmouseout="this.style.background='${colorScheme.bg}'; this.style.transform='scale(1)';"
          onmousedown="this.style.transform='scale(0.95)';"
          onmouseup="this.style.transform='scale(1.05)';"
        >
          <span style="display: flex; align-items: center;">${typeof icon === 'string' && icon.length <= 2 ? icon : iconSvg}</span>
          <span>${this.escapeHtml(title)}</span>
        </button>`;
      }).join('');
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot';
      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content" style="max-width: 100%; padding: 0; background: transparent; box-shadow: none;">
          <div style="border-top: 1px solid #e5e7eb; background: #f9fafb; padding: 6px 8px; border-radius: 6px; margin-top: 6px;">
            <!-- Header with sparkles icon -->
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px; padding: 0 2px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg>
              <p style="font-size: 11px; font-weight: 500; color: #374151; margin: 0;">Quick suggestions</p>
            </div>
            
            <!-- Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px;">
              ${repliesHtml}
            </div>
            
            <!-- Footer text -->
            <div style="padding: 0 2px;">
              <p style="font-size: 9px; color: #6b7280; font-style: italic; margin: 0;">Based on your conversation</p>
            </div>
          </div>
        </div>
      `;
      
      this.elements.messages.appendChild(messageDiv);
      // Don't auto-scroll for quick replies - let user scroll to see them
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
          ${this.config.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
          bottom: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .tharwah-chat-button:hover {
          background: #1d4ed8;
          transform: scale(1.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          animation: none;
        }

        .tharwah-chat-button.open {
          background: #1d4ed8;
          animation: none;
        }

        .tharwah-chat-button svg {
          width: 24px;
          height: 24px;
        }

        /* Notification badge */
        .tharwah-notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
        }

        .tharwah-notification-ping {
          position: absolute;
          display: inline-flex;
          height: 100%;
          width: 100%;
          border-radius: 50%;
          background-color: #f87171;
          opacity: 0.75;
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .tharwah-notification-dot {
          position: relative;
          display: inline-flex;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background-color: #ef4444;
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
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tharwah-chat-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .tharwah-chat-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .tharwah-chat-close:hover {
          background: #f3f4f6;
          color: #374151;
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
          padding: 10px 16px;
          border-radius: 16px;
          max-width: 85%;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.6;
        }

        .tharwah-chat-message.bot .tharwah-chat-message-content {
          background: #f3f4f6;
          color: #1f2937;
          box-shadow: none;
        }

        .tharwah-chat-message.user .tharwah-chat-message-content {
          background: #2563eb;
          color: white;
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
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
        }

        .tharwah-chat-send:hover {
          background: #1d4ed8;
        }

        .tharwah-chat-send:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .tharwah-chat-send svg {
          width: 16px;
          height: 16px;
        }

        /* Streaming cursor */
        .streaming-cursor {
          display: inline-block;
          animation: blink 1s infinite;
          color: ${this.config.primaryColor};
          font-weight: bold;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        /* Small spinner for tools */
        .spinner-small {
          border: 2px solid #dbeafe;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          animation: spin 1s linear infinite;
          display: inline-block;
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
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span class="tharwah-notification-badge">
            <span class="tharwah-notification-ping"></span>
            <span class="tharwah-notification-dot"></span>
          </span>
        </button>
        
        <div class="tharwah-chat-window" id="tharwah-chat-window">
          <div class="tharwah-chat-header">
            <h2>${this.config.title}</h2>
            <button class="tharwah-chat-close" id="tharwah-chat-close" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
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
            <button class="tharwah-chat-send" id="tharwah-chat-send" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                <path d="m21.854 2.147-10.94 10.939"></path>
              </svg>
            </button>
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
        send: document.getElementById('tharwah-chat-send'),
        inputContainer: document.querySelector('.tharwah-chat-input-container')
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

      // Hide popover when chat opens
      this.hidePopover();

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

    hidePopover() {
      // Hide any visible popover when chat opens
      const popover = document.getElementById('tharwah-popover');
      if (popover) {
        popover.style.display = 'none';
        this.log('Popover hidden because chat is open');
      }
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
      
      // Use formatMessage for bot messages to support markdown and line breaks
      // Keep escapeHtml for user messages for safety
      const formattedContent = sender === 'bot' ? this.formatMessage(content) : this.escapeHtml(content);
      
      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content">${formattedContent}</div>
      `;

      this.elements.messages.appendChild(messageDiv);
      
      // Smart scrolling: User messages scroll to bottom, bot messages scroll to show the start
      if (sender === 'user') {
        this.scrollToBottom();
      } else {
        this.scrollToMessage(messageDiv);
      }

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

    scrollToMessage(messageDiv) {
      // Scroll to show the user's input and the beginning of the bot's response
      // This allows users to manually scroll for long responses
      const container = this.elements.messages;
      
      // Find the previous user message (the one right before this bot message)
      const allMessages = container.querySelectorAll('.tharwah-chat-message');
      const botMessageIndex = Array.from(allMessages).indexOf(messageDiv);
      
      // Look for the user message right before this bot message
      let targetMessage = messageDiv; // Default to bot message
      for (let i = botMessageIndex - 1; i >= 0; i--) {
        if (allMessages[i].classList.contains('user')) {
          targetMessage = allMessages[i];
          break;
        }
      }
      
      // Scroll to show the user's message (or bot message if no user message found)
      // This ensures the context (user's question) is always visible
      const targetTop = targetMessage.offsetTop;
      
      // Scroll with some padding from the top (40px for better visibility)
      container.scrollTop = Math.max(0, targetTop - 40);
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

    formatMessage(text) {
      // First escape HTML to prevent XSS
      let formatted = this.escapeHtml(text);
      
      // Convert **bold** to <strong>
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Convert line breaks to <br> tags
      formatted = formatted.replace(/\n/g, '<br>');
      
      // Convert numbered lists (1. Item) to proper format with spacing
      formatted = formatted.replace(/^(\d+)\.\s+/gm, '<br><strong>$1.</strong> ');
      
      // Convert bullet points (- Item) to proper format
      formatted = formatted.replace(/^-\s+/gm, '<br>• ');
      
      // Clean up multiple consecutive <br> tags (max 2)
      formatted = formatted.replace(/(<br>){3,}/g, '<br><br>');
      
      // Remove leading <br> if present
      formatted = formatted.replace(/^<br>/, '');
      
      return formatted;
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
