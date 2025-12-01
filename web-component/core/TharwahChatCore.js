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

})(window);