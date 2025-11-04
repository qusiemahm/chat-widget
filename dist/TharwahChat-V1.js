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
        language: config.language || this.detectLanguage(), // NEW: Language support (ar/en)
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
      this.feedbackShown = false; // Track if feedback has been shown
      this.feedbackSubmitted = false; // Track if feedback has been submitted

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

    detectLanguage() {
      // Try to detect language from:
      // 1. HTML lang attribute
      // 2. Browser language
      // 3. Default to 'en'
      
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

    getTranslations() {
      return {
        en: {
          // Welcome screen
          welcomeTitle: 'Hi there! 👋',
          welcomeSubtitle: "Let's find what you're looking for",
          startConversation: 'Start a conversation',
          startConversationDesc: 'Ask us anything about our programs',
          
          // Email capture screen
          emailScreenTitle: 'Chat with Tharwah Academy',
          emailScreenSubtitle: 'To get started, please share your email address:',
          emailPlaceholder: 'your@email.com',
          termsText: "I agree to Tharwah Academy's Terms & Conditions and acknowledge that my personal information will be processed in accordance with data protection regulations.",
          submitButton: 'Submit',
          
          // Alert messages
          alertEnterEmail: 'Please enter your email address',
          alertAcceptTerms: 'Please accept the Terms & Conditions',
          alertValidEmail: 'Please enter a valid email address',
          alertConversationFailed: 'Failed to start conversation. Please try again.',
          alertSaveFailed: 'Failed to save your information. Please try again.',
          
          // Chat input
          inputPlaceholder: 'Type your message...',
          
          // Quick replies
          quickSuggestionsHeader: 'Quick suggestions',
          quickSuggestionsFooter: 'Based on your conversation',
          
          // Product cards
          enrollNow: 'Enroll Now',
          audioFeature: 'Audio description feature coming soon!',
          
          // Error messages
          errorGeneric: 'Sorry, I encountered an error. Please try again.',
          errorConfig: 'Configuration error. Please contact support.',
          
          // Tool indicator
          toolUsing: 'Using',
          toolExecuting: 'Executing',
          
          // Feedback
          feedbackTitle: 'Rate your experience',
          feedbackSubtitle: 'How was your conversation?',
          feedbackCategoryLabel: 'Category (optional)',
          feedbackCategoryPlaceholder: 'Select a category',
          feedbackTextLabel: 'Additional comments (optional)',
          feedbackTextPlaceholder: 'Tell us more about your experience...',
          feedbackSubmit: 'Submit Feedback',
          feedbackCancel: 'Maybe Later',
          feedbackSuccess: 'Thank you for your feedback!',
          feedbackError: 'Failed to submit feedback. Please try again.',
          feedbackButton: 'Rate Experience',
          // Category options
          categoryHelpful: 'Helpful',
          categoryUnhelpful: 'Unhelpful',
          categoryIncorrect: 'Incorrect Information',
          categorySlow: 'Slow Response',
          categoryBug: 'Bug/Issue',
          categoryFeature: 'Feature Request',
          categoryOther: 'Other'
        },
        ar: {
          // Welcome screen
          welcomeTitle: 'مرحباً! 👋',
          welcomeSubtitle: 'دعنا نجد ما تبحث عنه',
          startConversation: 'ابدأ محادثة',
          startConversationDesc: 'اسألنا أي شيء عن برامجنا',
          
          // Email capture screen
          emailScreenTitle: 'الدردشة مع أكاديمية ثروة',
          emailScreenSubtitle: 'للبدء، يرجى مشاركة عنوان بريدك الإلكتروني:',
          emailPlaceholder: 'your@email.com',
          termsText: 'أوافق على شروط وأحكام أكاديمية ثروة وأقر بأنه ستتم معالجة معلوماتي الشخصية وفقاً للوائح حماية البيانات.',
          submitButton: 'إرسال',
          
          // Alert messages
          alertEnterEmail: 'يرجى إدخال عنوان بريدك الإلكتروني',
          alertAcceptTerms: 'يرجى الموافقة على الشروط والأحكام',
          alertValidEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
          alertConversationFailed: 'فشل بدء المحادثة. يرجى المحاولة مرة أخرى.',
          alertSaveFailed: 'فشل حفظ معلوماتك. يرجى المحاولة مرة أخرى.',
          
          // Chat input
          inputPlaceholder: 'اكتب رسالتك...',
          
          // Quick replies
          quickSuggestionsHeader: 'اقتراحات سريعة',
          quickSuggestionsFooter: 'بناءً على محادثتك',
          
          // Product cards
          enrollNow: 'سجل الآن',
          audioFeature: 'ميزة الوصف الصوتي قريباً!',
          
          // Error messages
          errorGeneric: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
          errorConfig: 'خطأ في الإعدادات. يرجى الاتصال بالدعم.',
          
          // Tool indicator
          toolUsing: 'استخدام',
          toolExecuting: 'تنفيذ',
          
          // Feedback
          feedbackTitle: 'قيّم تجربتك',
          feedbackSubtitle: 'كيف كانت محادثتك؟',
          feedbackCategoryLabel: 'الفئة (اختياري)',
          feedbackCategoryPlaceholder: 'اختر فئة',
          feedbackTextLabel: 'تعليقات إضافية (اختياري)',
          feedbackTextPlaceholder: 'أخبرنا المزيد عن تجربتك...',
          feedbackSubmit: 'إرسال التقييم',
          feedbackCancel: 'ربما لاحقاً',
          feedbackSuccess: 'شكراً لك على تقييمك!',
          feedbackError: 'فشل إرسال التقييم. يرجى المحاولة مرة أخرى.',
          feedbackButton: 'قيّم التجربة',
          // Category options
          categoryHelpful: 'مفيد',
          categoryUnhelpful: 'غير مفيد',
          categoryIncorrect: 'معلومات خاطئة',
          categorySlow: 'استجابة بطيئة',
          categoryBug: 'خطأ/مشكلة',
          categoryFeature: 'طلب ميزة',
          categoryOther: 'أخرى'
        }
      };
    }

    t(key) {
      const translations = this.getTranslations();
      const lang = this.config.language || 'en';
      return translations[lang]?.[key] || translations.en[key] || key;
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
          `${this.config.apiEndpoint}/widget/suggestions/welcome/?bot_id=${this.config.botId}&limit=${this.config.suggestionsLimit}&language=${this.config.language}`,
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
        
        this.log(`Loaded ${this.suggestions.length} suggestions for language: ${this.config.language}`);
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
            <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0;">${this.t('welcomeTitle')}</h1>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0;">${this.t('welcomeSubtitle')}</p>
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
                <h3 style="font-size: 15px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">${this.t('startConversation')}</h3>
                <p style="font-size: 13px; color: #6b7280; margin: 0;">${this.t('startConversationDesc')}</p>
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
          <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">${this.t('emailScreenTitle')}</h2>
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
              ${this.t('emailScreenSubtitle')}
            </p>
          </div>

          <form id="tharwah-email-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <input
                type="email"
                id="tharwah-email-input"
                placeholder="${this.t('emailPlaceholder')}"
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
                ${this.t('termsText')}
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
              ${this.t('submitButton')}
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
        alert(this.t('alertEnterEmail'));
        return;
      }

      if (!termsAccepted) {
        alert(this.t('alertAcceptTerms'));
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert(this.t('alertValidEmail'));
        return;
      }

      // Create conversation first if it doesn't exist
      if (!this.conversationId) {
        this.log('Creating conversation before email capture...');
        try {
          await this.createConversation();
        } catch (error) {
          this.log('Error creating conversation:', error);
          alert(this.t('alertConversationFailed'));
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
        alert(this.t('alertSaveFailed'));
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
        
        // Show feedback button after first bot response
        this.showFeedbackButton();

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
        
        let errorMessage = this.t('errorGeneric');
        
        if (error.message.includes('API key')) {
          errorMessage = this.t('errorConfig');
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
        let textQueue = []; // Queue for gradual text display
        let isDisplaying = false; // Flag to prevent concurrent displays

        // Function to gradually display text character-by-character (ChatGPT-like)
        const displayTextGradually = async () => {
          if (isDisplaying) return;
          isDisplaying = true;
          
          while (textQueue.length > 0) {
            const chunk = textQueue.shift();
            
            // Display character by character for smooth effect
            for (let i = 0; i < chunk.length; i++) {
              fullText += chunk[i];
              this.updateStreamingMessage(messageId, fullText, false);
              
              // Small delay between characters (15ms = smooth like ChatGPT)
              // Skip delay for spaces to make words appear faster
              if (chunk[i] !== ' ') {
                await new Promise(resolve => setTimeout(resolve, 15));
              }
            }
          }
          
          isDisplaying = false;
        };

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
                // Add text to queue for gradual display
                textQueue.push(data.content);
                displayTextGradually();
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
                
                // Wait for text display to complete
                while (textQueue.length > 0 || isDisplaying) {
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                // Remove cursor from final message
                this.updateStreamingMessage(messageId, fullText, true);
                
                // Make sure tool indicator is hidden
                this.hideToolIndicator();
                
                // Show feedback button after streaming response completes
                this.showFeedbackButton();
                
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
        this.hideToolIndicator();

      } catch (error) {
        this.hideToolIndicator();
        
        if (this.currentStreamingMessage) {
          // Remove the empty streaming message
          this.currentStreamingMessage.remove();
          this.currentStreamingMessage = null;
        }
        
        let errorMessage = this.t('errorGeneric');
        
        if (error.message.includes('API key')) {
          errorMessage = this.t('errorConfig');
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

    updateStreamingMessage(messageId, text, isComplete = false) {
      const messageDiv = document.getElementById(messageId);
      if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.tharwah-chat-message-content');
        if (contentDiv) {
          // Add text with or without cursor
          if (isComplete) {
            // Remove cursor when complete and apply full formatting
            contentDiv.innerHTML = this.formatMessage(text);
          } else {
            // Add text with cursor while streaming
            // Use formatMessage for proper display of bold, lists, etc.
            contentDiv.innerHTML = this.formatMessage(text) + '<span class="streaming-cursor">▋</span>';
          }
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
            <span style="font-size: 12px; color: #1d4ed8;">${this.t('toolUsing')} ${toolName}...</span>
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
                <span style="font-size: 12px; color: #1d4ed8;">⚙️ ${this.t('toolExecuting')} ${toolName}...</span>
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
        let monthlyPrice = 0;
        if (price <= 5000) {
          monthlyPrice = Math.round((price / 4) * 100) / 100;
        } else {
          monthlyPrice = Math.round((price / 12) * 100) / 100;
        }
        
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
                " onmouseover="this.style.background='#dbeafe'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)'" onclick="alert(window.tharwahChatWidget.t('audioFeature'))" aria-label="Listen to description" title="Listen to description">
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
                  ${this.t('enrollNow')}
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
              <p style="font-size: 11px; font-weight: 500; color: #374151; margin: 0;">${this.t('quickSuggestionsHeader')}</p>
            </div>
            
            <!-- Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px;">
              ${repliesHtml}
            </div>
            
            <!-- Footer text -->
            <div style="padding: 0 2px;">
              <p style="font-size: 9px; color: #6b7280; font-style: italic; margin: 0;">${this.t('quickSuggestionsFooter')}</p>
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

        /* Feedback button in header */
        .tharwah-feedback-button {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #d97706;
          cursor: pointer;
          padding: 6px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .tharwah-feedback-button:hover {
          background: #fde68a;
          border-color: #fbbf24;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }

        /* Feedback dialog overlay */
        .tharwah-feedback-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Feedback dialog content */
        .tharwah-feedback-dialog-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 480px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .tharwah-feedback-header {
          padding: 24px 24px 16px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .tharwah-feedback-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .tharwah-feedback-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .tharwah-feedback-body {
          padding: 24px;
        }

        /* Star rating */
        .tharwah-star-rating {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tharwah-star {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .tharwah-star:hover {
          transform: scale(1.15);
        }

        .tharwah-star:active {
          transform: scale(0.95);
        }

        .tharwah-star svg {
          stroke: #d1d5db;
          transition: all 0.2s ease;
        }

        /* Feedback form fields */
        .tharwah-feedback-field {
          margin-bottom: 16px;
        }

        .tharwah-feedback-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .tharwah-feedback-select,
        .tharwah-feedback-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .tharwah-feedback-select:focus,
        .tharwah-feedback-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .tharwah-feedback-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Feedback actions */
        .tharwah-feedback-actions {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .tharwah-feedback-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .tharwah-feedback-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tharwah-feedback-btn-primary {
          background: #2563eb;
          color: white;
        }

        .tharwah-feedback-btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .tharwah-feedback-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .tharwah-feedback-btn-secondary:hover {
          background: #e5e7eb;
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
          animation: smoothBlink 1.2s ease-in-out infinite;
          color: ${this.config.primaryColor};
          font-weight: bold;
          margin-left: 2px;
        }

        @keyframes smoothBlink {
          0% { opacity: 1; }
          25% { opacity: 1; }
          50% { opacity: 0.3; }
          75% { opacity: 1; }
          100% { opacity: 1; }
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
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="tharwah-feedback-button" id="tharwah-feedback-button" aria-label="Rate experience" title="${this.t('feedbackButton')}" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
              <button class="tharwah-chat-close" id="tharwah-chat-close" aria-label="Close chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="tharwah-chat-messages" id="tharwah-chat-messages"></div>
          
          <div class="tharwah-chat-input-container">
            <input 
              type="text" 
              class="tharwah-chat-input" 
              id="tharwah-chat-input"
              placeholder="${this.t('inputPlaceholder')}"
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
        inputContainer: document.querySelector('.tharwah-chat-input-container'),
        feedbackButton: document.getElementById('tharwah-feedback-button')
      };
    }

    attachEventListeners() {
      this.elements.button.addEventListener('click', () => this.toggle());
      this.elements.close.addEventListener('click', () => this.close());
      this.elements.send.addEventListener('click', () => this.sendMessage());
      this.elements.feedbackButton.addEventListener('click', () => this.showFeedbackDialog());
      
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

    // ============================================
    // FEEDBACK METHODS
    // ============================================

    showFeedbackButton() {
      if (this.elements.feedbackButton && !this.feedbackSubmitted) {
        this.elements.feedbackButton.style.display = 'flex';
      }
    }

    hideFeedbackButton() {
      if (this.elements.feedbackButton) {
        this.elements.feedbackButton.style.display = 'none';
      }
    }

    showFeedbackDialog() {
      if (!this.conversationId) {
        this.log('No conversation to rate');
        return;
      }

      if (this.feedbackSubmitted) {
        this.log('Feedback already submitted for this conversation');
        return;
      }

      const feedbackDialog = document.createElement('div');
      feedbackDialog.id = 'tharwah-feedback-dialog';
      feedbackDialog.className = 'tharwah-feedback-overlay';
      
      const categories = [
        { value: '', label: this.t('feedbackCategoryPlaceholder') },
        { value: 'helpful', label: this.t('categoryHelpful') },
        { value: 'unhelpful', label: this.t('categoryUnhelpful') },
        { value: 'incorrect', label: this.t('categoryIncorrect') },
        { value: 'slow', label: this.t('categorySlow') },
        { value: 'bug', label: this.t('categoryBug') },
        { value: 'feature', label: this.t('categoryFeature') },
        { value: 'other', label: this.t('categoryOther') }
      ];

      feedbackDialog.innerHTML = `
        <div class="tharwah-feedback-dialog-content">
          <div class="tharwah-feedback-header">
            <h3>${this.t('feedbackTitle')}</h3>
            <p>${this.t('feedbackSubtitle')}</p>
          </div>
          
          <div class="tharwah-feedback-body">
            <!-- Star Rating -->
            <div class="tharwah-star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" class="tharwah-star" data-rating="${star}" aria-label="${star} stars">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              `).join('')}
            </div>
            
            <!-- Category Selection -->
            <div class="tharwah-feedback-field">
              <label>${this.t('feedbackCategoryLabel')}</label>
              <select id="tharwah-feedback-category" class="tharwah-feedback-select">
                ${categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
              </select>
            </div>
            
            <!-- Text Feedback -->
            <div class="tharwah-feedback-field">
              <label>${this.t('feedbackTextLabel')}</label>
              <textarea 
                id="tharwah-feedback-text" 
                class="tharwah-feedback-textarea" 
                placeholder="${this.t('feedbackTextPlaceholder')}"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div class="tharwah-feedback-actions">
            <button type="button" id="tharwah-feedback-cancel" class="tharwah-feedback-btn tharwah-feedback-btn-secondary">
              ${this.t('feedbackCancel')}
            </button>
            <button type="button" id="tharwah-feedback-submit" class="tharwah-feedback-btn tharwah-feedback-btn-primary" disabled>
              ${this.t('feedbackSubmit')}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(feedbackDialog);

      // Star rating functionality
      let selectedRating = 0;
      const stars = feedbackDialog.querySelectorAll('.tharwah-star');
      const submitBtn = feedbackDialog.querySelector('#tharwah-feedback-submit');
      
      const updateStars = (rating) => {
        stars.forEach((star, index) => {
          const svg = star.querySelector('svg');
          if (index < rating) {
            svg.style.fill = '#fbbf24';
            svg.style.stroke = '#fbbf24';
          } else {
            svg.style.fill = 'none';
            svg.style.stroke = '#d1d5db';
          }
        });
      };

      stars.forEach((star) => {
        star.addEventListener('mouseenter', (e) => {
          const rating = parseInt(e.currentTarget.dataset.rating);
          updateStars(rating);
        });
        
        star.addEventListener('click', (e) => {
          selectedRating = parseInt(e.currentTarget.dataset.rating);
          updateStars(selectedRating);
          submitBtn.disabled = false;
          this.log('Rating selected:', selectedRating);
        });
      });

      feedbackDialog.addEventListener('mouseleave', () => {
        updateStars(selectedRating);
      });

      // Cancel button
      feedbackDialog.querySelector('#tharwah-feedback-cancel').addEventListener('click', () => {
        document.body.removeChild(feedbackDialog);
        this.trackEvent('feedback_cancelled');
      });

      // Submit button
      submitBtn.addEventListener('click', async () => {
        const category = feedbackDialog.querySelector('#tharwah-feedback-category').value;
        const text = feedbackDialog.querySelector('#tharwah-feedback-text').value.trim();
        
        submitBtn.disabled = true;
        submitBtn.textContent = this.config.language === 'ar' ? 'جاري الإرسال...' : 'Submitting...';
        
        const success = await this.submitFeedback(selectedRating, category, text);
        
        if (success) {
          // Show success message
          feedbackDialog.querySelector('.tharwah-feedback-dialog-content').innerHTML = `
            <div style="text-align: center; padding: 32px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style="color: #10b981; margin-bottom: 8px;">${this.t('feedbackSuccess')}</h3>
            </div>
          `;
          
          setTimeout(() => {
            document.body.removeChild(feedbackDialog);
          }, 2000);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = this.t('feedbackSubmit');
          // Show error message
          const errorMsg = document.createElement('div');
          errorMsg.style.cssText = 'color: #ef4444; font-size: 14px; margin-top: 8px; text-align: center;';
          errorMsg.textContent = this.t('feedbackError');
          feedbackDialog.querySelector('.tharwah-feedback-actions').appendChild(errorMsg);
        }
      });

      this.trackEvent('feedback_dialog_opened');
    }

    async submitFeedback(rating, category, feedbackText) {
      try {
        if (!this.conversationId) {
          throw new Error('No conversation ID');
        }

        if (!this.config.apiKey) {
          throw new Error('API key is not configured');
        }

        const userEmail = sessionStorage.getItem('tharwah_user_email') || '';

        const payload = {
          rating: rating,
          feedback_text: feedbackText,
          language: this.config.language || 'en'
        };

        // Only add category if selected
        if (category) {
          payload.category = category;
        }

        // Only add email if provided
        if (userEmail) {
          payload.submitted_by_email = userEmail;
        }

        this.log('Submitting feedback:', payload);

        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/${this.conversationId}/feedback/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.log('Feedback submitted successfully:', data);

        // Mark feedback as submitted and hide button
        this.feedbackSubmitted = true;
        this.hideFeedbackButton();

        this.trackEvent('feedback_submitted', {
          rating: rating,
          has_category: !!category,
          has_text: !!feedbackText,
          has_email: !!userEmail
        });

        return true;
      } catch (error) {
        this.log('Error submitting feedback:', error);
        this.trackEvent('feedback_error', {
          error: error.message
        });
        return false;
      }
    }

    // ============================================
    // ANALYTICS & UTILITIES
    // ============================================

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
      
      // Convert **bold** to <strong> (more robust - handles any content including special chars)
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      
      // Convert line breaks to <br> tags
      formatted = formatted.replace(/\n/g, '<br>');
      
      // Add line break after colons when followed by content (like "could you tell me a bit more:")
      // But not for time formats like "12:30" or URLs like "http://"
      formatted = formatted.replace(/([a-zA-Z\?])\s*:\s*(?=<br>|$)/g, '$1:<br><br>');
      
      // Convert numbered lists (1. Item) to proper format
      // Each number on its own line with the content on the next line
      formatted = formatted.replace(/^(\d+)\.\s+\*\*(.+?)\*\*/gm, '<br><strong>$1. $2</strong><br>');
      formatted = formatted.replace(/^(\d+)\.\s+/gm, '<br><strong>$1.</strong> ');
      
      // Convert bullet points (- Item) to proper format with indentation
      formatted = formatted.replace(/^-\s+/gm, '<br>&nbsp;&nbsp;&nbsp;• ');
      
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
