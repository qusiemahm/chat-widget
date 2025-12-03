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

(function (window, document) {
  'use strict';

  class TharwahChat {
    constructor(config = {}) {
      this.config = {
        apiEndpoint: config.apiEndpoint || 'http://localhost:8000/api',
        apiKey: config.apiKey, // REQUIRED
        botId: config.botId || 1,
        organizationId: config.organizationId || null,
        welcomeMessage: '',
        position: config.position || 'bottom-right',
        primaryColor: config.primaryColor || '#667eea',
        secondaryColor: config.secondaryColor || '#764ba2',
        buttonIcon: config.buttonIcon || '💬',
        title: '',
        subtitle: '',
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
      this.isWaitingForResponse = false; // Track if waiting for bot response
      this.abortController = null; // Controller for aborting fetch requests

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
          emailScreenTitle: 'Chat with Our Tharwah Bot',
          emailScreenSubtitle: 'To get started, please share your email address:',
          emailPlaceholder: 'your@email.com',
          termsText: "I agree to The Terms & Conditions and acknowledge that my personal information will be processed in accordance with data protection regulations.",
          submitButton: 'Submit',

          // Alert messages
          alertEnterEmail: 'Please enter your email address',
          alertAcceptTerms: 'Please accept the Terms & Conditions',
          alertValidEmail: 'Please enter a valid email address',
          alertConversationFailed: 'Failed to start conversation. Please try again.',
          alertSaveFailed: 'Failed to save your information. Please try again.',

          // Chat input
          inputPlaceholder: 'Type your message...',
          waitingPlaceholder: 'Waiting for response...',

          // Quick replies
          quickSuggestionsHeader: 'Quick suggestions',
          quickSuggestionsFooter: 'Based on your conversation',

          // Product cards
          enrollNow: 'Enroll Now',
          downloadBrochure: 'Download Brochure',
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
          emailScreenTitle: 'الدردشة مع ثروة بوت',
          emailScreenSubtitle: 'للبدء، يرجى مشاركة عنوان بريدك الإلكتروني:',
          emailPlaceholder: 'your@email.com',
          termsText: 'أوافق على الشروط والأحكام وأقر بأنه ستتم معالجة معلوماتي الشخصية وفقاً للوائح حماية البيانات.',
          submitButton: 'إرسال',

          // Alert messages
          alertEnterEmail: 'يرجى إدخال عنوان بريدك الإلكتروني',
          alertAcceptTerms: 'يرجى الموافقة على الشروط والأحكام',
          alertValidEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
          alertConversationFailed: 'فشل بدء المحادثة. يرجى المحاولة مرة أخرى.',
          alertSaveFailed: 'فشل حفظ معلوماتك. يرجى المحاولة مرة أخرى.',

          // Chat input
          inputPlaceholder: 'اكتب رسالتك...',
          waitingPlaceholder: 'في انتظار الرد...',

          // Quick replies
          quickSuggestionsHeader: 'اقتراحات سريعة',
          quickSuggestionsFooter: 'بناءً على محادثتك',

          // Product cards
          enrollNow: 'سجل الآن',
          downloadBrochure: 'تحميل الكتيب',
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
          this.addMessage(this.getWelcomeMessage(), 'bot', null, true);
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
        this.addMessage(this.getWelcomeMessage(), 'bot', null, true);
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
          <button
            style="
              position: absolute;
              top: 16px;
              right: 16px;
              background: rgba(255, 255, 255, 0.2);
              border: none;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              color: white;
              transition: background 0.2s;
              z-index: 20;
            "
            onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'"
            onclick="window.tharwahChatWidget.close()"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0;">${this.t('welcomeTitle')}</h1>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0;">${this.t('welcomeSubtitle')}</p>
          </div>
          
          <div style="background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 12px; margin-bottom: 16px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${this.suggestions.map(suggestion => `
                <button
                  class="tharwah-welcome-suggestion"
                  id="tharwah-chat-suggestion-${suggestion.id}"
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
            <div style="display: flex; align-items: center; justify-content: space-between;" dir="ltr">
              <div style=" ${this.config.language === 'ar' ? 'text-align : right; margin-right: 10px; ' : 'text-align : left'}; flex: 1;">
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

          <form id="tharwah-chat-email-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <input
                type="email"
                id="tharwah-chat-email-input"
                placeholder="${this.t('emailPlaceholder')}"
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  outline: none;
                  transition: border-color 0.2s;
                  transform-origin: left;
                  transform: scale(0.875);
                "
                onfocus="this.style.borderColor='#2563eb'"
                onblur="this.style.borderColor='#e5e7eb'"
                oninput="window.tharwahChatWidget.validateEmailForm()"
              />
            </div>

            <label style="display: flex; align-items: start; gap: 8px; cursor: pointer;">
              <input
                type="checkbox"
                id="tharwah-chat-terms-checkbox"
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
              id="tharwah-chat-submit-button"
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
      const form = document.getElementById('tharwah-chat-email-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEmailSubmit();
      });
    }

    async handleEmailSubmit() {
      const emailInput = document.getElementById('tharwah-chat-email-input');
      const termsCheckbox = document.getElementById('tharwah-chat-terms-checkbox');

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
      const emailInput = document.getElementById('tharwah-chat-email-input');
      const termsCheckbox = document.getElementById('tharwah-chat-terms-checkbox');
      const submitButton = document.getElementById('tharwah-chat-submit-button');

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
      this.addMessage(this.getWelcomeMessage(), 'bot', null, true);

      // Focus on input
      this.elements.input.focus();
    }

    getWelcomeMessage() {
      return this.config.language === 'ar' ? 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟' : 'Hi! 👋 How can I help you today?';
    }

    getTitle() {
      return this.config.title ? this.config.title : this.config.language === 'ar' ? 'الدردشة مع ثروة بوت' : 'Chat with Our Tharwah Bot';
    }

    getSubtitle() {
      return this.config.subtitle ? this.config.subtitle : this.config.language === 'ar' ? 'الرد فوري' : 'We reply instantly';
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
        const visitorId = this.getVisitorId();

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
              visitor_id: visitorId,
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

    getVisitorId() {
      // Try to get visitor_id from the tracker if available
      if (window.tracker && typeof window.tracker.getVisitorId === 'function') {
        const visitorId = window.tracker.getVisitorId();
        if (visitorId) {
          this.log('Got visitor ID from tracker:', visitorId);
          return visitorId;
        }
      }

      // Fallback to localStorage - use SAME key as tracker!
      const trackerKey = '_ut_visitor';  // Same key as UniversalTracker
      let stored = null;

      try {
        const item = localStorage.getItem(trackerKey);
        if (item) {
          stored = JSON.parse(item);
        }
      } catch (e) {
        this.log('Error parsing tracker storage:', e);
      }

      if (stored && stored.id) {
        this.log('Got visitor ID from tracker storage:', stored.id);
        return stored.id;
      }

      // Generate new visitor ID with same format as tracker (vis_ prefix)
      const visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Store in same format as tracker
      localStorage.setItem(trackerKey, JSON.stringify({
        id: visitorId,
        firstSeen: Date.now(),
        visits: 1
      }));

      this.log('Generated new visitor ID:', visitorId);
      return visitorId;
    }

    // ============================================
    // MESSAGING
    // ============================================

    disableInput() {
      this.isWaitingForResponse = true;
      // Don't disable input, just change placeholder
      this.elements.input.placeholder = this.t('waitingPlaceholder') || 'Waiting for response...';

      // Change send button to stop button
      this.elements.send.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="6" width="12" height="12"></rect>
        </svg>
      `;
      this.elements.send.setAttribute('aria-label', 'Stop generation');
      this.elements.send.classList.add('stop-generation');

      this.log('Input state changed - waiting for response (stop button active)');
    }

    enableInput() {
      this.isWaitingForResponse = false;
      this.elements.input.disabled = false;
      this.elements.send.disabled = false;
      this.elements.input.placeholder = this.t('inputPlaceholder');

      // Revert send button
      this.elements.send.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
          <path d="m21.854 2.147-10.94 10.939"></path>
        </svg>
      `;
      this.elements.send.setAttribute('aria-label', 'Send message');
      this.elements.send.classList.remove('stop-generation');

      this.elements.send.style.opacity = '1';
      this.elements.send.style.cursor = 'pointer';
      this.elements.input.focus();
      this.log('Input enabled - ready for new message');
    }

    stopGeneration() {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
        this.log('Generation stopped by user');

        // 2. Instantly stop gradual displaying of the message
        this.isDisplaying = false;
        // Clear the text queue to stop any remaining text from being displayed
        if (this.textQueue) {
          this.textQueue.length = 0; // Clear the array immediately
        }

        // Add a system message or visual indicator that generation was stopped
        if (this.currentStreamingMessage) {
          const contentDiv = this.currentStreamingMessage.querySelector('.tharwah-chat-message-content');
          if (contentDiv) {
            // Remove cursor and finalize the message display
            const messageId = this.currentStreamingMessage.id;
            const currentText = contentDiv.textContent || '';
            // Update message to remove cursor
            this.updateStreamingMessage(messageId, currentText, true);

            // Add "Stopped" indicator
            const stoppedSpan = document.createElement('span');
            stoppedSpan.style.fontSize = '11px';
            stoppedSpan.style.color = '#6b7280';
            stoppedSpan.style.marginLeft = '8px';
            stoppedSpan.style.fontStyle = 'italic';
            stoppedSpan.textContent = '(Stopped)';
            contentDiv.appendChild(stoppedSpan);
          }
          this.currentStreamingMessage = null;
        }

        this.enableInput();
      }
    }

    async sendMessage() {
      // Check if we are waiting for response - if so, this is a stop action
      if (this.isWaitingForResponse) {
        this.stopGeneration();
        return;
      }

      const message = this.elements.input.value.trim();
      if (!message) return;

      this.elements.input.value = '';
      this.addMessage(message, 'user');

      // Disable input (switch to stop button) while waiting for response
      this.disableInput();

      this.trackEvent('chat_message_sent', {
        message_length: message.length
      });

      // Initialize AbortController
      this.abortController = new AbortController();

      // Use streaming or non-streaming based on config
      if (this.config.enableStreaming) {
        await this.getResponseStreaming(message);
      } else {
        this.showTyping();
        await this.getResponse(message);
      }

      // Re-enable input after response (if not already enabled by stop)
      if (this.isWaitingForResponse) {
        this.enableInput();
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
        const messageId = data.assistant_message.id;
        this.addMessage(botMessage, 'bot', messageId);

        // Update last-message class for non-streaming messages
        const allBotMessages = this.elements.messages.querySelectorAll('.tharwah-chat-message.bot');
        allBotMessages.forEach(msg => msg.classList.remove('last-message'));
        const currentMessage = this.elements.messages.querySelector(`[data-message-id="${messageId}"]`);
        if (currentMessage) {
          currentMessage.classList.add('last-message');
        }

        // Show feedback button after first bot response
        this.showFeedbackButton();

        // Play notification sound when response is complete
        this.playNotificationSound();

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
            }),
            signal: this.abortController.signal
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
        this.textQueue = []; // Queue for gradual text display
        this.isDisplaying = false; // Flag to prevent concurrent displays
        let products = [];
        let quickReplies = [];
        let b2bServices = [];
        let routingInfo = null;

        // Function to gradually display text character-by-character (ChatGPT-like)
        const displayTextGradually = async () => {
          if (this.isDisplaying) return;
          this.isDisplaying = true;

          while (this.textQueue.length > 0) {
            const chunk = this.textQueue.shift();

            // Display character by character for smooth effect
            for (let i = 0; i < chunk.length && this.isWaitingForResponse && this.isDisplaying; i++) {
              fullText += chunk[i];
              this.updateStreamingMessage(messageId, fullText, false);

              // Small delay between characters (15ms = smooth like ChatGPT)
              // Skip delay for spaces to make words appear faster
              if (chunk[i] !== ' ') {
                await new Promise(resolve => setTimeout(resolve, 15));
              }
            }
          }

          this.isDisplaying = false;

          // If we stopped early, finalize the message
          if (fullText.length > 0) {
            this.updateStreamingMessage(messageId, fullText, true);
          }
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // Keep incomplete line in buffer

          for (const line of lines) {
            // Split by "data:" to handle multiple data objects on same line
            const dataParts = line.split('data:').filter(part => part.trim());

            for (const part of dataParts) {
              try {
                // Clean the JSON string - remove trailing characters after the last closing brace
                let cleanJsonStr = part.trim();

                // Find the position of the last closing brace
                const lastBraceIndex = cleanJsonStr.lastIndexOf('}');
                if (lastBraceIndex !== -1) {
                  // Keep only the JSON part, remove any trailing characters
                  cleanJsonStr = cleanJsonStr.substring(0, lastBraceIndex + 1);
                }

                const data = JSON.parse(cleanJsonStr);
                const eventType = data.type;

                this.log('Stream event:', eventType, data);

                if (eventType === 'routing') {
                  routingInfo = data.routing_info;
                  this.log('Routing to agent:', routingInfo.selected_agent.name);
                }
                else if (eventType === 'text') {
                  // Add text to queue for gradual display
                  this.textQueue.push(data.content);
                  displayTextGradually();
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
                else if (eventType === 'b2b_services') {
                  // Store B2B services to show after text
                  b2bServices = data.b2b_services;
                }
                else if (eventType === 'done') {
                  this.log('Streaming complete. Message ID:', data.message_id);

                  // Wait for text display to complete
                  while (this.textQueue.length > 0 || this.isDisplaying) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                  }

                  // Remove cursor from final message
                  this.updateStreamingMessage(messageId, fullText, true);

                  // Update the message with the real backend message ID
                  const messageDiv = document.getElementById(messageId);
                  if (messageDiv && data.message_id) {
                    // Update the message div ID to the real message ID
                    messageDiv.id = 'msg-' + data.message_id;
                    messageDiv.setAttribute('data-message-id', data.message_id);

                    // Update feedback buttons data-message-id attribute
                    const feedbackDiv = messageDiv.querySelector('.tharwah-feedback-buttons');
                    if (feedbackDiv) {
                      feedbackDiv.setAttribute('data-message-id', data.message_id);
                    }

                    this.log('Updated streaming message ID from', messageId, 'to', data.message_id);
                  }

                  // Make sure tool indicator is hidden
                  this.hideToolIndicator();

                  // Update last-message class for streaming messages
                  const allBotMessages = this.elements.messages.querySelectorAll('.tharwah-chat-message.bot');
                  allBotMessages.forEach(msg => msg.classList.remove('last-message'));
                  const currentMessage = document.getElementById('msg-' + data.message_id);
                  if (currentMessage) {
                    currentMessage.classList.add('last-message');
                  }

                  // Show feedback button after streaming response completes
                  this.showFeedbackButton();

                  // Play notification sound when streaming response is complete
                  this.playNotificationSound();

                  // Show products if any
                  if (products.length > 0) {
                    this.showProducts(products);
                  }

                  // Show quick replies if any
                  if (quickReplies.length > 0) {
                    this.showQuickReplies(quickReplies);
                  }

                  // Show B2B service cards if B2B services data is available
                  if (b2bServices.length > 0) {
                    this.showB2BServiceCards(b2bServices);
                  }

                  this.trackEvent('chat_response_received_streaming', {
                    agent: routingInfo?.selected_agent?.name,
                    agent_type: routingInfo?.selected_agent?.type,
                    had_products: products.length > 0,
                    had_quick_replies: quickReplies.length > 0,
                    had_b2b_services: b2bServices.length > 0,
                    streaming: true
                  });
                }
                else if (eventType === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                // Skip invalid JSON parts (could be incomplete data)
                // Silent error handling for malformed streaming data
              }
            }
          }
        }

        this.currentStreamingMessage = null;
        this.hideToolIndicator();

      } catch (error) {
        this.hideToolIndicator();

        if (error.name === 'AbortError') {
          this.log('Streaming request aborted');
          return;
        }

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
        <div class="tharwah-chat-message-content" id="tharwah-chat-message-content-${messageId}">
          <span class="streaming-cursor" id="tharwah-chat-streaming-cursor-${messageId}">▋</span>
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
          // Detect Arabic and apply RTL styling
          const isArabic = this.isArabicText(text);
          if (isArabic) {
            contentDiv.style.direction = 'rtl';
            contentDiv.style.textAlign = 'right';
          }

          // Add text with or without cursor
          if (isComplete || !this.isWaitingForResponse) {
            // Remove cursor when complete and apply full formatting
            contentDiv.innerHTML = this.formatMessage(text);

            // Add feedback buttons when streaming is complete
            let feedbackDiv = messageDiv.querySelector('.tharwah-feedback-buttons');
            if (!feedbackDiv) {
              feedbackDiv = document.createElement('div');
              feedbackDiv.className = 'tharwah-feedback-buttons';
              feedbackDiv.setAttribute('data-message-id', messageId);
              feedbackDiv.innerHTML = `
                <button class="tharwah-feedback-btn thumbs-up" id="tharwah-chat-feedback-thumbs-up-streaming" data-feedback="positive" title="Thumbs up">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 10L9.74 9.877C9.7579 9.9844 9.7521 10.0945 9.7231 10.1995C9.6942 10.3045 9.6427 10.4019 9.5723 10.485C9.5018 10.5681 9.4142 10.6348 9.3153 10.6806C9.2165 10.7263 9.1089 10.75 9 10.75V10ZM20 10V9.25C20.1989 9.25 20.3897 9.329 20.5303 9.4697C20.671 9.6103 20.75 9.8011 20.75 10H20ZM18 20.75H6.64V19.25H18V20.75ZM5.44 9.25H9V10.75H5.44V9.25ZM8.26 10.123L7.454 5.288L8.934 5.041L9.74 9.877L8.26 10.123ZM9.18 3.25H9.394V4.75H9.181L9.18 3.25ZM12.515 4.92L15.03 8.693L13.782 9.525L11.267 5.752L12.515 4.92ZM16.07 9.25H20V10.75H16.07V9.25ZM20.75 10V18H19.25V10H20.75ZM3.943 18.54L2.743 12.54L4.213 12.245L5.413 18.245L3.943 18.54ZM15.03 8.693C15.1441 8.8643 15.2987 9.0037 15.4802 9.1009C15.6616 9.1981 15.8642 9.2489 16.07 9.249V10.749C15.15 10.749 14.292 10.29 13.782 9.525L15.03 8.693ZM7.454 5.288C7.4122 5.0373 7.4255 4.7795 7.4929 4.5344C7.5604 4.2894 7.6804 4.062 7.8447 3.868C8.009 3.6741 8.2135 3.5182 8.4441 3.4113C8.6747 3.3044 8.9258 3.25 9.18 3.25V4.749C9.1438 4.7491 9.108 4.7571 9.0751 4.7724C9.0422 4.7877 9.0131 4.8099 8.9897 4.8376C8.9663 4.8653 8.9492 4.8977 8.9396 4.9327C8.93 4.9676 8.9281 5.0052 8.934 5.041L7.454 5.288ZM5.44 10.749C5.2551 10.749 5.0724 10.79 4.9052 10.8691C4.738 10.9481 4.5905 11.0634 4.4732 11.2064C4.3559 11.3494 4.2718 11.5166 4.227 11.6961C4.1822 11.8755 4.1778 12.0626 4.214 12.244L2.743 12.539C2.6633 12.14 2.673 11.7273 2.7716 11.3326C2.8702 10.9378 3.0552 10.5699 3.3132 10.2553C3.5712 9.9407 3.8958 9.6872 4.2635 9.5132C4.6313 9.3392 5.0331 9.2489 5.44 9.249V10.749ZM6.64 20.75C6.0043 20.7501 5.3882 20.529 4.8965 20.1261C4.4048 19.7232 4.0678 19.1633 3.943 18.54L5.413 18.245C5.4695 18.5288 5.6227 18.7832 5.8464 18.9666C6.0702 19.1501 6.3506 19.2502 6.64 19.25V20.75ZM9.394 3.25C10.0113 3.25 10.6191 3.4015 11.1634 3.6928C11.7077 3.9841 12.1716 4.4053 12.514 4.919L11.267 5.751C11.0615 5.4427 10.7829 5.1899 10.4562 5.0151C10.1294 4.8403 9.7646 4.7499 9.394 4.75V3.25ZM18 19.25C18.69 19.25 19.25 18.69 19.25 18H20.75C20.75 18.7293 20.4603 19.4288 19.9445 19.9445C19.4288 20.4603 18.7293 20.75 18 20.75V19.25Z" fill="#AAAAAA"/>
                    <path d="M16 10V20" stroke="#AAAAAA" stroke-width="1.5"/>
                  </svg>
                </button>
                <button class="tharwah-feedback-btn thumbs-down" id="tharwah-chat-feedback-thumbs-down-streaming" data-feedback="negative" title="Thumbs down">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 14L14.26 14.123C14.2421 14.0156 14.2479 13.9055 14.2769 13.8005C14.3058 13.6955 14.3573 13.5981 14.4277 13.515C14.4982 13.432 14.5858 13.3652 14.6847 13.3194C14.7835 13.2737 14.8911 13.25 15 13.25V14ZM4 14V14.75C3.80109 14.75 3.61032 14.671 3.46967 14.5303C3.32902 14.3897 3.25 14.1989 3.25 14H4ZM6 3.25H17.36V4.75H6V3.25ZM18.56 14.75H15V13.25H18.56V14.75ZM15.74 13.877L16.546 18.712L15.066 18.959L14.26 14.123L15.74 13.877ZM14.82 20.75H14.606V19.25H14.819L14.82 20.75ZM11.485 19.08L8.97 15.307L10.218 14.475L12.733 18.248L11.485 19.08ZM7.93 14.75H4V13.25H7.93V14.75ZM3.25 14V6H4.75V14H3.25ZM20.057 5.46L21.257 11.46L19.787 11.755L18.587 5.755L20.057 5.46ZM8.97 15.307C8.8559 15.1357 8.70127 14.9963 8.51985 14.8991C8.33842 14.8019 8.13581 14.7511 7.93 14.751V13.251C8.85 13.251 9.708 13.71 10.218 14.475L8.97 15.307ZM16.546 18.712C16.5878 18.9627 16.5745 19.2205 16.5071 19.4656C16.4396 19.7106 16.3196 19.938 16.1553 20.132C15.991 20.3259 15.7865 20.4818 15.5559 20.5887C15.3253 20.6956 15.0742 20.75 14.82 20.75V19.251C14.8562 19.2509 14.892 19.2429 14.9249 19.2276C14.9578 19.2123 14.9869 19.1901 15.0103 19.1624C15.0337 19.1347 15.0508 19.1023 15.0604 19.0673C15.07 19.0324 15.0719 18.9948 15.066 18.959L16.546 18.712ZM18.56 13.251C18.7449 13.251 18.9276 13.21 19.0948 13.1309C19.262 13.0519 19.4095 12.9366 19.5268 12.7936C19.6441 12.6506 19.7282 12.4834 19.773 12.3039C19.8178 12.1245 19.8222 11.9374 19.786 11.756L21.257 11.461C21.3367 11.86 21.327 12.2727 21.2284 12.6674C21.1298 13.0622 20.9448 13.4301 20.6868 13.7447C20.4288 14.0593 20.1042 14.3128 19.7365 14.4868C19.3687 14.6608 18.9669 14.7511 18.56 14.751V13.251ZM17.36 3.25C17.9957 3.24988 18.6118 3.471 19.1035 3.87392C19.5952 4.27684 19.9322 4.83667 20.057 5.46L18.587 5.755C18.5305 5.47122 18.3773 5.21682 18.1536 5.03336C17.9298 4.84991 17.6494 4.74976 17.36 4.75V3.25ZM14.606 20.75C13.9887 20.75 13.3809 20.5985 12.8366 20.3072C12.2923 20.0159 11.8284 19.5947 11.486 19.081L12.733 18.249C12.9385 18.5573 13.2171 18.8101 13.5438 18.9849C13.8706 19.1597 14.2354 19.2501 14.606 19.25V20.75ZM6 4.75C5.31 4.75 4.75 5.31 4.75 6H3.25C3.25 5.27065 3.53973 4.57118 4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25V4.75Z" fill="#AAAAAA"/>
                    <path d="M8 14V4" stroke="#AAAAAA" stroke-width="1.5"/>
                  </svg>
                </button>
              `;

              messageDiv.appendChild(feedbackDiv);

              // Add click handlers
              const thumbsUpBtn = feedbackDiv.querySelector('.thumbs-up');
              const thumbsDownBtn = feedbackDiv.querySelector('.thumbs-down');

              // Get message ID from data attribute when clicked (not from closure)
              thumbsUpBtn?.addEventListener('click', () => {
                const msgId = feedbackDiv.getAttribute('data-message-id');
                this.submitMessageFeedback(msgId, 'positive', thumbsUpBtn, thumbsDownBtn);
              });
              thumbsDownBtn?.addEventListener('click', () => {
                const msgId = feedbackDiv.getAttribute('data-message-id');
                this.submitMessageFeedback(msgId, 'negative', thumbsUpBtn, thumbsDownBtn);
              });
            }
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
        <div class="tharwah-chat-message-content" id="tharwah-chat-tool-indicator-content" style="background: #eff6ff; border: 1px solid #dbeafe;">
          <div style="display: flex; align-items: center; gap: 8px;" id="tharwah-chat-tool-indicator-inner">
            <div class="spinner-small" id="tharwah-chat-tool-spinner"></div>
            <span style="font-size: 12px; color: #1d4ed8;" id="tharwah-chat-tool-text">${this.t('toolUsing')} ${toolName}...</span>
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
              <div style="display: flex; align-items: center; gap: 8px;" id="tharwah-chat-tool-executing-inner">
                <div class="spinner-small" id="tharwah-chat-tool-executing-spinner"></div>
                <span style="font-size: 12px; color: #1d4ed8;" id="tharwah-chat-tool-executing-text">⚙️ ${this.t('toolExecuting')} ${toolName}...</span>
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
        let price = product.metadata?.price || product.price || null;
        price = Math.round(price * 1.15)
        let regularPrice = product.metadata?.regular_price || 0;
        regularPrice = Math.round(regularPrice * 1.15)
        let salePrice = product.metadata?.sale_price || 0;
        salePrice = Math.round(salePrice * 1.15)
        const hasDiscount = product.metadata?.has_discount || false;
        const discountPercentage = product.metadata?.discount_percentage || 0;
        const onSale = product.metadata?.on_sale || false;
        const currency = product.metadata?.currency || product.currency || 'SAR';
        const rating = product.metadata?.rating || product.rating || null;
        const reviewCount = product.metadata?.enrollments || product.enrollments || null;
        const brochureUrl = product.metadata?.brochure_url || null;
        const audioUrl = product.metadata?.audio_url || product.metadata?.audio_url_en || product.metadata?.audio_url_ar || null;
        const fullAudioUrl = audioUrl ? `${baseUrl}${audioUrl}` : null;

        // Format price (show sale price if discount active)
        const displayPrice = hasDiscount && salePrice ? salePrice : price;
        const priceFormatted = displayPrice ? `${currency} ${displayPrice.toLocaleString()}` : '';
        const regularPriceFormatted = hasDiscount && regularPrice ? `${currency} ${regularPrice.toLocaleString()}` : '';
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
              ${hasDiscount && discountPercentage ? `
                <div style="
                  position: absolute;
                  top: 6px;
                  right: 6px;
                  background: #dc2626;
                  color: white;
                  padding: 2px 6px;
                  border-radius: 6px;
                  font-size: 10px;
                  font-weight: 700;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">
                  -${discountPercentage}%
                </div>
              ` : ''}
            </div>
            
            <!-- Content -->
            <div style="padding: 8px;">
              <!-- Title with audio button -->
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                ${productLink ? `
                <a href="${productLink}" target="_blank" rel="noopener noreferrer" style="
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
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#111827'">${this.escapeHtml(name)}</a>
                ` : `
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
                `}
                <button 
                  data-audio-url="${fullAudioUrl || ''}"
                  style="
                  flex-shrink: 0;
                  padding: 4px;
                  border-radius: 50%;
                  background: #eff6ff;
                  color: #2563eb;
                  border: none;
                  cursor: ${fullAudioUrl ? 'pointer' : 'not-allowed'};
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 24px;
                  height: 24px;
                  opacity: ${fullAudioUrl ? '1' : '0.5'};
                " 
                onmouseover="if(this.dataset.audioUrl) { this.style.background='#dbeafe'; this.style.transform='scale(1.1)' }" 
                onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)'" 
                onclick="window.tharwahChatWidget.playProductAudio(this.dataset.audioUrl, this)" 
                aria-label="Listen to description" 
                title="${fullAudioUrl ? 'Listen to description' : 'Audio not available'}">
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
                  ${reviewCount ? `<span style="font-size: 10px; color: #6b7280;">(${reviewCount > 1000 ? Math.floor(reviewCount / 1000) + 'k+' : reviewCount})</span>` : ''}
                </div>
              ` : ''}
              
              <!-- Pricing -->
              ${priceFormatted ? `
                <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin-bottom: 8px;">
                  ${hasDiscount && regularPriceFormatted ? `
                    <div style="font-size: 9px; color: #9ca3af; text-decoration: line-through; line-height: 1; margin-bottom: 2px;">${this.escapeHtml(regularPriceFormatted)}</div>
                  ` : ''}
                  <div style="font-size: 14px; font-weight: 700; color: ${hasDiscount ? '#dc2626' : '#2563eb'}; line-height: 1.2; margin-bottom: 2px;">${this.escapeHtml(priceFormatted)}</div>
                  ${monthlyPrice ? `<div style="font-size: 9px; color: #16a34a; font-weight: 500; margin-top: 2px; line-height: 1;">${currency} ${monthlyPrice}/mo</div>` : ''}
                </div>
              ` : ''}
              
              <!-- Enroll Button -->
              ${productLink ? `
                <button
                  id="tharwah-chat-enroll-now-${product.wp_id || product.id}"
                  data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'
                  onclick="window.tharwahChatWidget.showEnrollmentForm(JSON.parse(this.dataset.product))"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 6px 16px;
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    border: none;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    transition: background 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    line-height: 1.5;
                    cursor: pointer;
                  " 
                  onmouseover="this.style.background='#1d4ed8'" 
                  onmouseout="this.style.background='#2563eb'">
                    ${this.t('enrollNow')}
                </button>
              ` : ''}
              
              <!-- Download Brochure Button -->
              ${brochureUrl ? `
                <a id="tharwah-chat-download-brochure-${product.wp_id || product.id}" href="${brochureUrl}" target="_blank" rel="noopener noreferrer" download style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  width: 100%;
                  padding: 6px 16px;
                  margin-top: 6px;
                  background: white;
                  color: #2563eb;
                  text-decoration: none;
                  border: 1px solid #2563eb;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  transition: all 0.2s;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                  line-height: 1.5;
                " onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#1d4ed8'; this.style.color='#1d4ed8'" onmouseout="this.style.background='white'; this.style.borderColor='#2563eb'; this.style.color='#2563eb'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  ${this.t('downloadBrochure')}
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
        <div class="tharwah-chat-message-content" id="tharwah-chat-suggestions-content" style="max-width: 100%; padding: 0; background: transparent; box-shadow: none;">
          <div id="tharwah-chat-suggestions-container" style="
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

    playProductAudio(audioUrl,buttonElement){if(!audioUrl||audioUrl==='null'||audioUrl===''){alert(this.t('audioFeature'));return}

      // If clicking the same button that's currently playing, stop it
      if (this.currentAudioButton === buttonElement && this.currentAudio && !this.currentAudio.paused) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;

        // Reset button icon to speaker
        buttonElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
            <path d="M16 9a5 5 0 0 1 0 6"></path>
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
          </svg>
        `;

        this.currentAudio = null;
        this.currentAudioButton = null;
        return;
      }

      // Stop any OTHER currently playing audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;

        // Reset previous button icon
        if (this.currentAudioButton) {
          this.currentAudioButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
              <path d="M16 9a5 5 0 0 1 0 6"></path>
              <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
            </svg>
          `;
        }
      }

      // Create new audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudioButton = buttonElement;

      // Change button icon to pause/loading
      buttonElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;

      // Play audio
      this.currentAudio.play().catch(error => {
        console.error('Audio playback error:', error);
        alert('Failed to play audio. Please try again.');

        // Reset button
        buttonElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
            <path d="M16 9a5 5 0 0 1 0 6"></path>
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
          </svg>
        `;
        this.currentAudio = null;
        this.currentAudioButton = null;
      });

      // Reset button when audio ends
      this.currentAudio.addEventListener('ended', () => {
        buttonElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
            <path d="M16 9a5 5 0 0 1 0 6"></path>
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
          </svg>
        `;
        this.currentAudio = null;
        this.currentAudioButton = null;
      });
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
          id="tharwah-chat-quick-reply-${replyId || index}"
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
        <div class="tharwah-chat-message-content" id="tharwah-chat-similar-products-content" style="max-width: 100%; padding: 0; background: transparent; box-shadow: none;">
          <div id="tharwah-chat-similar-products-container" style="border-top: 1px solid #e5e7eb; background: #f9fafb; padding: 6px 8px; border-radius: 6px; margin-top: 6px;">
            <!-- Header with sparkles icon -->
            <div id="tharwah-chat-similar-products-header" style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px; padding: 0 2px;">
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
        /* Import Tajawal font from Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');

        /* Base styles */
        .tharwah-chat-widget * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          width: 28px;
          height: 28px;
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
          /* iOS touch handling */
          -webkit-overflow-scrolling: touch;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
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

        /* Menu Button (3-dots) */
        .tharwah-chat-menu {
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

        .tharwah-chat-menu:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Menu Dropdown */
        .tharwah-chat-menu-dropdown {
          position: absolute;
          top: 50px;
          right: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 8px;
          min-width: 240px;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .tharwah-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
          font-size: 14px;
          user-select: none;
        }

        .tharwah-menu-item:hover {
          background: #f9fafb;
        }

        .tharwah-menu-item:active {
          background: #f3f4f6;
        }

        .tharwah-menu-item svg {
          flex-shrink: 0;
          color: #6b7280;
        }

        .tharwah-menu-item span {
          flex: 1;
        }

        /* Toggle Switch */
        .tharwah-toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
        }

        .tharwah-toggle-switch input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .tharwah-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e0;
          transition: 0.3s;
          border-radius: 24px;
        }

        .tharwah-toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .tharwah-toggle-switch input:checked + .tharwah-toggle-slider {
          background-color: ${this.config.primaryColor};
        }

        .tharwah-toggle-switch input:checked + .tharwah-toggle-slider:before {
          transform: translateX(20px);
        }

        /* Feedback trigger line under input */
        .tharwah-feedback-section {
          padding: 0px 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: none;
          text-align: center;
        }

        .tharwah-feedback-section.show {
          display: block;
        }

        .tharwah-feedback-trigger {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 11px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          text-decoration: underline;
        }

        .tharwah-feedback-trigger:hover {
          color: #374151;
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
          align-items: center;
        }

        .tharwah-feedback-btn {
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          min-width: 140px;
          white-space: nowrap;
        }

        .tharwah-feedback-btn:disabled {
          cursor: not-allowed;
        }

        .tharwah-feedback-btn-primary {
          background: #2563eb !important;
          color: white !important;
        }

        .tharwah-feedback-btn-primary:disabled {
          background: #93c5fd !important;
          color: white !important;
          opacity: 1;
        }

        .tharwah-feedback-btn-primary:hover:not(:disabled) {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .tharwah-feedback-btn-secondary {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .tharwah-feedback-btn-secondary:hover {
          background: #e5e7eb;
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
          text-align: ${this.config.language === 'ar' ? 'left' : 'right'};
        }

        .tharwah-chat-message.bot {
          text-align: ${this.config.language === 'ar' ? 'right' : 'left'};
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

        /* Message Feedback Buttons */
        .tharwah-chat-message.bot {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .tharwah-feedback-buttons {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s;
          flex-shrink: 0;
          margin-bottom: 2px;
        }

        .tharwah-chat-message.bot:hover .tharwah-feedback-buttons {
          opacity: 1;
        }

        .tharwah-chat-message.bot.last-message .tharwah-feedback-buttons {
          opacity: 1;
        }

        .tharwah-feedback-btn {
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 3px 6px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 24px;
        }

        .tharwah-feedback-btn svg {
          width: 16px;
          height: 16px;
        }

        .tharwah-feedback-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .tharwah-feedback-btn:hover svg path,
        .tharwah-feedback-btn:hover svg {
          stroke: #374151;
        }

        .tharwah-feedback-btn.active {
          background: #f3f4f6;
          border-color: #6b7280;
        }

        .tharwah-feedback-btn.active.thumbs-up svg path,
        .tharwah-feedback-btn.active.thumbs-up svg {
          stroke: #374151;
          fill: none;
        }

        .tharwah-feedback-btn.active.thumbs-down svg path,
        .tharwah-feedback-btn.active.thumbs-down svg {
          stroke: #374151;
          fill: none;
        }

        .tharwah-feedback-btn:disabled {
          cursor: not-allowed;
          opacity: 0.3;
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
          /* Prevent iOS zoom */
          font-size: 16px;
          transform-origin: left;
          transform: scale(0.875);
        }

        /* Adjust font size for desktop */
        @media (min-width: 768px) {
          .tharwah-chat-input {
            font-size: 14px;
            transform: scale(1);
          }
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
            width: 100% !important;
            height: 100% !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 0 !important;
            max-height: 100vh !important;
            margin: 0 !important;
            /* Enhanced iOS touch handling for fullscreen */
            position: fixed;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
          }

          /* Prevent body scroll when chat is open on iOS */
          body.tharwah-chat-open {
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .tharwah-chat-window.active {
            display: flex !important;
          }

          .tharwah-chat-button.open {
            display: none !important;
          }
        }

        /* ========================================
           ENROLLMENT FORM MODAL
           ======================================== */
        .tharwah-enrollment-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tharwah-enrollment-modal.show {
          opacity: 1;
        }

        .tharwah-enrollment-form {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.9);
          transition: transform 0.3s;
          max-height: 90vh;
          overflow-y: auto;
        }

        .tharwah-enrollment-modal.show .tharwah-enrollment-form {
          transform: scale(1);
        }

        .tharwah-enrollment-form h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .tharwah-enrollment-form .product-name {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .tharwah-enrollment-form label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .tharwah-enrollment-form select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
          background: white;
          cursor: pointer;
        }

        .tharwah-enrollment-form select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .tharwah-enrollment-form .form-group {
          margin-bottom: 16px;
        }

        .tharwah-enrollment-form .button-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .tharwah-enrollment-form button {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tharwah-enrollment-form .btn-cancel {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .tharwah-enrollment-form .btn-cancel:hover {
          background: #f9fafb;
        }

        .tharwah-enrollment-form .btn-enroll {
          background: #2563eb;
          border: none;
          color: white;
        }

        .tharwah-enrollment-form .btn-enroll:hover {
          background: #1d4ed8;
        }

        .tharwah-enrollment-form .btn-enroll:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .tharwah-enrollment-form .price-info {
          background: #eff6ff;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .tharwah-enrollment-form .price-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .tharwah-enrollment-form .price-value {
          font-size: 24px;
          font-weight: 700;
          color: #2563eb;
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
            <path d="M65.1,12.1H54.3V3.4h-8.6v8.6H34.9C17,12.1,2.5,26.2,2.5,43.7c0,17.4,14.5,31.6,32.4,31.6H37v-8.6h-2.2c-13.1,0-23.8-10.3-23.8-22.9c0-12.7,10.7-22.9,23.8-22.9h30.2c13.1,0,23.8,10.3,23.8,22.9c0,12.7-10.7,22.9-23.8,22.9H52.7L37,80.3v11.5l18.9-16.5h9.2c17.9,0,32.4-14.2,32.4-31.6C97.5,26.2,83,12.1,65.1,12.1z"/>
            <circle cx="34.9" cy="44.5" r="6.5"/>
            <circle cx="65.1" cy="44.5" r="6.5"/>
          </svg>
          <span class="tharwah-notification-badge" id="tharwah-chat-notification-badge">
            <span class="tharwah-notification-ping" id="tharwah-chat-notification-ping"></span>
            <span class="tharwah-notification-dot" id="tharwah-chat-notification-dot"></span>
          </span>
        </button>
        
        <div class="tharwah-chat-window" id="tharwah-chat-window">
          <div class="tharwah-chat-header" id="tharwah-chat-header">
            <h2>${this.getTitle()}</h2>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="tharwah-chat-menu" id="tharwah-chat-menu" aria-label="Menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
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
          
          <!-- Menu Dropdown -->
          <div class="tharwah-chat-menu-dropdown" id="tharwah-chat-menu-dropdown" style="display: none;">
            <label class="tharwah-menu-item" for="tharwah-chat-sound-checkbox" id="tharwah-chat-sound-toggle">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>${this.config.language === 'ar' ? 'إشعارات الصوت' : 'Sound Notifications'}</span>
              <div class="tharwah-toggle-switch" id="tharwah-chat-toggle-switch">
                <input type="checkbox" id="tharwah-chat-sound-checkbox" checked>
                <span class="tharwah-toggle-slider" id="tharwah-chat-toggle-slider"></span>
              </div>
            </label>
          </div>
          
          <div class="tharwah-chat-messages" id="tharwah-chat-messages"></div>
          
          <div class="tharwah-chat-input-container" id="tharwah-chat-input-container">
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
          
          <div class="tharwah-feedback-section" id="tharwah-chat-feedback-section">
            <button class="tharwah-feedback-trigger" id="tharwah-chat-feedback-trigger">
              Give us your feedback
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      this.elements = {
        button: document.getElementById('tharwah-chat-button'),
        window: document.getElementById('tharwah-chat-window'),
        close: document.getElementById('tharwah-chat-close'),
        menu: document.getElementById('tharwah-chat-menu'),
        menuDropdown: document.getElementById('tharwah-chat-menu-dropdown'),
        soundCheckbox: document.getElementById('tharwah-chat-sound-checkbox'),
        messages: document.getElementById('tharwah-chat-messages'),
        input: document.getElementById('tharwah-chat-input'),
        send: document.getElementById('tharwah-chat-send'),
        inputContainer: document.querySelector('.tharwah-chat-input-container'),
        feedbackSection: document.getElementById('tharwah-chat-feedback-section'),
        feedbackTrigger: document.getElementById('tharwah-chat-feedback-trigger')
      };

      // Initialize sound notification state from localStorage
      const soundEnabled = localStorage.getItem('tharwah-sound-enabled');
      if (soundEnabled === 'false') {
        this.elements.soundCheckbox.checked = false;
      }
      this.isSoundEnabled = this.elements.soundCheckbox.checked;
    }

    attachEventListeners() {
      this.elements.button.addEventListener('click', () => this.toggle());
      this.elements.close.addEventListener('click', () => this.close());
      this.elements.menu.addEventListener('click', () => this.toggleMenu());
      this.elements.send.addEventListener('click', () => this.sendMessage());
      this.elements.feedbackTrigger.addEventListener('click', () => this.showFeedbackDialog());

      // Sound toggle event listener
      this.elements.soundCheckbox.addEventListener('change', (e) => {
        this.isSoundEnabled = e.target.checked;
        localStorage.setItem('tharwah-sound-enabled', this.isSoundEnabled);
        this.log('Sound notifications:', this.isSoundEnabled ? 'enabled' : 'disabled');

        // Keep menu open after toggling
        e.stopPropagation();
      });

      // Prevent menu from closing when clicking inside it
      this.elements.menuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.elements.menu.contains(e.target) && !this.elements.menuDropdown.contains(e.target)) {
          this.closeMenu();
        }
      });

      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    toggleMenu() {
      const isVisible = this.elements.menuDropdown.style.display === 'block';
      if (isVisible) {
        this.closeMenu();
      } else {
        this.elements.menuDropdown.style.display = 'block';
      }
    }

    closeMenu() {
      this.elements.menuDropdown.style.display = 'none';
    }

    playNotificationSound() {
      if (!this.isSoundEnabled) {
        this.log('Sound notification skipped (disabled by user)');
        return;
      }

      try {
        // Create a subtle notification sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Subtle notification tone (E6 note)
        oscillator.frequency.value = 1318.51;
        oscillator.type = 'sine';

        // Gentle volume curve
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        this.log('Notification sound played');
      } catch (error) {
        this.log('Error playing notification sound:', error);
      }
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

      // Prevent body scroll on iOS when chat opens
      if (window.innerWidth <= 768) {
        document.body.classList.add('tharwah-chat-open');
        // Save scroll position
        this.scrollPosition = window.pageYOffset;
      }

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

      // Restore body scroll on iOS when chat closes
      if (window.innerWidth <= 768) {
        document.body.classList.remove('tharwah-chat-open');
        // Restore scroll position
        if (this.scrollPosition !== undefined) {
          window.scrollTo(0, this.scrollPosition);
        }
      }

      this.trackEvent('chat_closed');
      this.log('Chat closed');
    }

    hidePopover() {
      // Hide any visible popover when chat opens
      const popover = document.getElementById('tharwah-chat-popover');
      if (popover) {
        popover.style.display = 'none';
        this.log('Popover hidden because chat is open');
      }
    }

    addMessage(content, sender = 'bot', messageId = null, isWelcomeMessage = false) {
      const message = {
        id: messageId || Date.now(),
        content,
        sender,
        timestamp: new Date()
      };

      this.messages.push(message);

      const messageDiv = document.createElement('div');
      messageDiv.className = `tharwah-chat-message ${sender}`;
      messageDiv.setAttribute('data-message-id', message.id);

      // Use formatMessage for bot messages to support markdown and line breaks
      // Keep escapeHtml for user messages for safety
      const formattedContent = sender === 'bot' ? this.formatMessage(content) : this.escapeHtml(content);

      // Detect if content is Arabic to apply RTL styling
      const isArabic = this.isArabicText(content);
      const rtlStyle = isArabic ? ' style="direction: rtl; text-align: right;"' : '';

      // Add feedback buttons for bot messages (except welcome message)
      const feedbackButtons = sender === 'bot' && !isWelcomeMessage ? `
        <div class="tharwah-feedback-buttons" data-message-id="${message.id}" id="tharwah-chat-feedback-buttons-${message.id}">
          <button class="tharwah-feedback-btn thumbs-up" data-feedback="positive" title="Thumbs up" id="tharwah-chat-feedback-thumbs-up-${message.id}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 10L9.74 9.877C9.7579 9.9844 9.7521 10.0945 9.7231 10.1995C9.6942 10.3045 9.6427 10.4019 9.5723 10.485C9.5018 10.5681 9.4142 10.6348 9.3153 10.6806C9.2165 10.7263 9.1089 10.75 9 10.75V10ZM20 10V9.25C20.1989 9.25 20.3897 9.329 20.5303 9.4697C20.671 9.6103 20.75 9.8011 20.75 10H20ZM18 20.75H6.64V19.25H18V20.75ZM5.44 9.25H9V10.75H5.44V9.25ZM8.26 10.123L7.454 5.288L8.934 5.041L9.74 9.877L8.26 10.123ZM9.18 3.25H9.394V4.75H9.181L9.18 3.25ZM12.515 4.92L15.03 8.693L13.782 9.525L11.267 5.752L12.515 4.92ZM16.07 9.25H20V10.75H16.07V9.25ZM20.75 10V18H19.25V10H20.75ZM3.943 18.54L2.743 12.54L4.213 12.245L5.413 18.245L3.943 18.54ZM15.03 8.693C15.1441 8.8643 15.2987 9.0037 15.4802 9.1009C15.6616 9.1981 15.8642 9.2489 16.07 9.249V10.749C15.15 10.749 14.292 10.29 13.782 9.525L15.03 8.693ZM7.454 5.288C7.4122 5.0373 7.4255 4.7795 7.4929 4.5344C7.5604 4.2894 7.6804 4.062 7.8447 3.868C8.009 3.6741 8.2135 3.5182 8.4441 3.4113C8.6747 3.3044 8.9258 3.25 9.18 3.25V4.749C9.1438 4.7491 9.108 4.7571 9.0751 4.7724C9.0422 4.7877 9.0131 4.8099 8.9897 4.8376C8.9663 4.8653 8.9492 4.8977 8.9396 4.9327C8.93 4.9676 8.9281 5.0052 8.934 5.041L7.454 5.288ZM5.44 10.749C5.2551 10.749 5.0724 10.79 4.9052 10.8691C4.738 10.9481 4.5905 11.0634 4.4732 11.2064C4.3559 11.3494 4.2718 11.5166 4.227 11.6961C4.1822 11.8755 4.1778 12.0626 4.214 12.244L2.743 12.539C2.6633 12.14 2.673 11.7273 2.7716 11.3326C2.8702 10.9378 3.0552 10.5699 3.3132 10.2553C3.5712 9.9407 3.8958 9.6872 4.2635 9.5132C4.6313 9.3392 5.0331 9.2489 5.44 9.249V10.749ZM6.64 20.75C6.0043 20.7501 5.3882 20.529 4.8965 20.1261C4.4048 19.7232 4.0678 19.1633 3.943 18.54L5.413 18.245C5.4695 18.5288 5.6227 18.7832 5.8464 18.9666C6.0702 19.1501 6.3506 19.2502 6.64 19.25V20.75ZM9.394 3.25C10.0113 3.25 10.6191 3.4015 11.1634 3.6928C11.7077 3.9841 12.1716 4.4053 12.514 4.919L11.267 5.751C11.0615 5.4427 10.7829 5.1899 10.4562 5.0151C10.1294 4.8403 9.7646 4.7499 9.394 4.75V3.25ZM18 19.25C18.69 19.25 19.25 18.69 19.25 18H20.75C20.75 18.7293 20.4603 19.4288 19.9445 19.9445C19.4288 20.4603 18.7293 20.75 18 20.75V19.25Z" fill="#AAAAAA"/>
              <path d="M16 10V20" stroke="#AAAAAA" stroke-width="1.5"/>
            </svg>
          </button>
          <button class="tharwah-feedback-btn thumbs-down" data-feedback="negative" title="Thumbs down" id="tharwah-chat-feedback-thumbs-down-${message.id}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 14L14.26 14.123C14.2421 14.0156 14.2479 13.9055 14.2769 13.8005C14.3058 13.6955 14.3573 13.5981 14.4277 13.515C14.4982 13.432 14.5858 13.3652 14.6847 13.3194C14.7835 13.2737 14.8911 13.25 15 13.25V14ZM4 14V14.75C3.80109 14.75 3.61032 14.671 3.46967 14.5303C3.32902 14.3897 3.25 14.1989 3.25 14H4ZM6 3.25H17.36V4.75H6V3.25ZM18.56 14.75H15V13.25H18.56V14.75ZM15.74 13.877L16.546 18.712L15.066 18.959L14.26 14.123L15.74 13.877ZM14.82 20.75H14.606V19.25H14.819L14.82 20.75ZM11.485 19.08L8.97 15.307L10.218 14.475L12.733 18.248L11.485 19.08ZM7.93 14.75H4V13.25H7.93V14.75ZM3.25 14V6H4.75V14H3.25ZM20.057 5.46L21.257 11.46L19.787 11.755L18.587 5.755L20.057 5.46ZM8.97 15.307C8.8559 15.1357 8.70127 14.9963 8.51985 14.8991C8.33842 14.8019 8.13581 14.7511 7.93 14.751V13.251C8.85 13.251 9.708 13.71 10.218 14.475L8.97 15.307ZM16.546 18.712C16.5878 18.9627 16.5745 19.2205 16.5071 19.4656C16.4396 19.7106 16.3196 19.938 16.1553 20.132C15.991 20.3259 15.7865 20.4818 15.5559 20.5887C15.3253 20.6956 15.0742 20.75 14.82 20.75V19.251C14.8562 19.2509 14.892 19.2429 14.9249 19.2276C14.9578 19.2123 14.9869 19.1901 15.0103 19.1624C15.0337 19.1347 15.0508 19.1023 15.0604 19.0673C15.07 19.0324 15.0719 18.9948 15.066 18.959L16.546 18.712ZM18.56 13.251C18.7449 13.251 18.9276 13.21 19.0948 13.1309C19.262 13.0519 19.4095 12.9366 19.5268 12.7936C19.6441 12.6506 19.7282 12.4834 19.773 12.3039C19.8178 12.1245 19.8222 11.9374 19.786 11.756L21.257 11.461C21.3367 11.86 21.327 12.2727 21.2284 12.6674C21.1298 13.0622 20.9448 13.4301 20.6868 13.7447C20.4288 14.0593 20.1042 14.3128 19.7365 14.4868C19.3687 14.6608 18.9669 14.7511 18.56 14.751V13.251ZM17.36 3.25C17.9957 3.24988 18.6118 3.471 19.1035 3.87392C19.5952 4.27684 19.9322 4.83667 20.057 5.46L18.587 5.755C18.5305 5.47122 18.3773 5.21682 18.1536 5.03336C17.9298 4.84991 17.6494 4.74976 17.36 4.75V3.25ZM14.606 20.75C13.9887 20.75 13.3809 20.5985 12.8366 20.3072C12.2923 20.0159 11.8284 19.5947 11.486 19.081L12.733 18.249C12.9385 18.5573 13.2171 18.8101 13.5438 18.9849C13.8706 19.1597 14.2354 19.2501 14.606 19.25V20.75ZM6 4.75C5.31 4.75 4.75 5.31 4.75 6H3.25C3.25 5.27065 3.53973 4.57118 4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25V4.75Z" fill="#AAAAAA"/>
              <path d="M8 14V4" stroke="#AAAAAA" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
      ` : '';

      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content"${rtlStyle}>${formattedContent}</div>
        ${feedbackButtons}
      `;

      // Add feedback button click handlers
      if (sender === 'bot' && !isWelcomeMessage) {
        const thumbsUpBtn = messageDiv.querySelector('.thumbs-up');
        const thumbsDownBtn = messageDiv.querySelector('.thumbs-down');
        const feedbackDiv = messageDiv.querySelector('.tharwah-feedback-buttons');

        // Get message ID from data attribute when clicked (not from closure)
        // This ensures we use the updated ID after streaming completes
        thumbsUpBtn?.addEventListener('click', () => {
          const messageId = feedbackDiv.getAttribute('data-message-id');
          this.submitMessageFeedback(messageId, 'positive', thumbsUpBtn, thumbsDownBtn);
        });
        thumbsDownBtn?.addEventListener('click', () => {
          const messageId = feedbackDiv.getAttribute('data-message-id');
          this.submitMessageFeedback(messageId, 'negative', thumbsUpBtn, thumbsDownBtn);
        });
      }

      this.elements.messages.appendChild(messageDiv);

      // Update last-message class for bot messages
      if (sender === 'bot') {
        // Remove last-message class from all bot messages
        const allBotMessages = this.elements.messages.querySelectorAll('.tharwah-chat-message.bot');
        allBotMessages.forEach(msg => msg.classList.remove('last-message'));

        // Add last-message class to this new bot message
        messageDiv.classList.add('last-message');
      }

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
      if (this.elements.feedbackSection && !this.feedbackSubmitted) {
        this.elements.feedbackSection.classList.add('show');
      }
    }

    hideFeedbackSection() {
      if (this.elements.feedbackSection) {
        this.elements.feedbackSection.classList.remove('show');
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
        <div class="tharwah-feedback-dialog-content" id="tharwah-chat-feedback-dialog-content">
          <div class="tharwah-feedback-header" id="tharwah-chat-feedback-header">
            <h3>${this.t('feedbackTitle')}</h3>
            <p>${this.t('feedbackSubtitle')}</p>
          </div>

          <div class="tharwah-feedback-body" id="tharwah-chat-feedback-body">
            <!-- Star Rating -->
            <div class="tharwah-star-rating" id="tharwah-chat-star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" class="tharwah-star" data-rating="${star}" aria-label="${star} stars" id="tharwah-chat-star-${star}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              `).join('')}
            </div>
            
            <!-- Category Selection -->
            <div class="tharwah-feedback-field" id="tharwah-chat-feedback-category-field">
              <label>${this.t('feedbackCategoryLabel')}</label>
              <select id="tharwah-chat-feedback-category" class="tharwah-feedback-select">
                ${categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
              </select>
            </div>

            <!-- Text Feedback -->
            <div class="tharwah-feedback-field" id="tharwah-chat-feedback-text-field">
              <label>${this.t('feedbackTextLabel')}</label>
              <textarea
                id="tharwah-chat-feedback-text"
                class="tharwah-feedback-textarea"
                placeholder="${this.t('feedbackTextPlaceholder')}"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="tharwah-feedback-actions" id="tharwah-chat-feedback-actions">
            <button type="button" id="tharwah-chat-feedback-cancel" class="tharwah-feedback-btn tharwah-feedback-btn-secondary">
              Cancel
            </button>
            <button type="button" id="tharwah-chat-feedback-submit" class="tharwah-feedback-btn tharwah-feedback-btn-primary" disabled>
              Submit Feedback
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(feedbackDialog);

      // Star rating functionality
      let selectedRating = 0;
      const stars = feedbackDialog.querySelectorAll('.tharwah-star');
      const submitBtn = feedbackDialog.querySelector('#tharwah-chat-feedback-submit');

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
      feedbackDialog.querySelector('#tharwah-chat-feedback-cancel').addEventListener('click', () => {
        document.body.removeChild(feedbackDialog);
        this.trackEvent('feedback_cancelled');
      });

      // Submit button
      submitBtn.addEventListener('click', async () => {
        const category = feedbackDialog.querySelector('#tharwah-chat-feedback-category').value;
        const text = feedbackDialog.querySelector('#tharwah-chat-feedback-text').value.trim();

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

        // Mark feedback as submitted and hide section
        this.feedbackSubmitted = true;
        this.hideFeedbackSection();

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

    async submitMessageFeedback(messageId, feedbackType, thumbsUpBtn, thumbsDownBtn) {
      try {
        this.log(`Submitting ${feedbackType} feedback for message ${messageId}`);

        // Disable both buttons while submitting
        thumbsUpBtn.disabled = true;
        thumbsDownBtn.disabled = true;

        // Extract numeric message ID (in case it's a string like 'msg-123' or 'stream-msg-123')
        let numericMessageId = messageId;
        if (typeof messageId === 'string') {
          // Try to extract number from formats like 'msg-123' or 'stream-msg-123'
          const match = messageId.match(/\d+$/);
          if (match) {
            numericMessageId = parseInt(match[0], 10);
          } else {
            numericMessageId = parseInt(messageId, 10);
          }
        }

        this.log(`Numeric message ID: ${numericMessageId}`);

        const response = await fetch(
          `${this.config.apiEndpoint}/widget/conversations/message-feedback/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              message: numericMessageId,
              conversation: this.conversationId,
              feedback_type: feedbackType,
              visitor_id: this.getVisitorId(),
              metadata: {
                user_agent: navigator.userAgent,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle duplicate feedback
          if (response.status === 400 && errorData.error) {
            this.log('Feedback already submitted for this message');
            return;
          }

          throw new Error(`Failed to submit feedback: ${response.status}`);
        }

        const data = await response.json();
        this.log('Feedback submitted successfully:', data);

        // Mark the clicked button as active
        if (feedbackType === 'positive') {
          thumbsUpBtn.classList.add('active');
          thumbsDownBtn.classList.remove('active');
        } else {
          thumbsDownBtn.classList.add('active');
          thumbsUpBtn.classList.remove('active');
        }

        // Track the feedback event
        this.trackEvent('message_feedback_submitted', {
          message_id: messageId,
          feedback_type: feedbackType
        });

      } catch (error) {
        this.log('Error submitting message feedback:', error);

        // Re-enable buttons on error
        thumbsUpBtn.disabled = false;
        thumbsDownBtn.disabled = false;

        this.trackEvent('message_feedback_error', {
          error: error.message
        });
      }
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    escapeHtmlExceptTables(text) {
      // Extract tables with placeholder
      const tables = [];
      const tableRegex = /<table[\s\S]*?<\/table>/g;

      // Replace tables with placeholders
      let processed = text.replace(tableRegex, (match) => {
        const placeholder = `___TABLE_${tables.length}___`;
        tables.push(match);
        return placeholder;
      });

      // Escape the rest of the content
      processed = this.escapeHtml(processed);

      // Restore tables
      tables.forEach((table, index) => {
        processed = processed.replace(`___TABLE_${index}___`, table);
      });

      return processed;
    }

    isArabicText(text) {
      // Check if text contains Arabic characters
      // Arabic Unicode range: \u0600-\u06FF (Arabic block) and \u0750-\u077F (Arabic Supplement)
      const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
      return arabicPattern.test(text);
    }

    formatMessage(text) {
      // Convert markdown tables FIRST (before any escaping)
      // We need raw text with \n for table detection
      let formatted = this.convertMarkdownTables(text);

      // Now escape HTML to prevent XSS (but preserve our table HTML)
      formatted = this.escapeHtmlExceptTables(formatted);

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

    convertMarkdownTables(text) {
      // Detect markdown tables pattern:
      // | Header 1 | Header 2 | Header 3 |
      // |----------|----------|----------|
      // | Cell 1   | Cell 2   | Cell 3   |

      // Updated regex to handle full table rows with multiple cells
      // The separator line has multiple cells like |-------|-------|-------|
      const tableRegex = /^\s*\|(.+)\|\s*\n\s*\|(?:[\s\-:]+\|)+\s*\n((?:\s*\|.+\|\s*\n?)+)/gm;

      return text.replace(tableRegex, (match, headerRow, bodyRows) => {
        console.log('[TharwahChat] Found markdown table!', { headerRow, bodyRows });

        // Parse header
        const headers = headerRow.split('|')
          .map(h => h.trim())
          .filter(h => h.length > 0);

        // Parse body rows
        const rows = bodyRows.trim().split('\n')
          .map(row => row.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0)
          );

        // Helper to escape HTML in cell content
        const escapeCell = (cell) => {
          const div = document.createElement('div');
          div.textContent = cell;
          return div.innerHTML;
        };

        // Build HTML table
        let html = '\n<table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">';

        // Header
        html += '<thead><tr style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white;">';
        headers.forEach(header => {
          html += `<th style="padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #1e40af;">${escapeCell(header)}</th>`;
        });
        html += '</tr></thead>';

        // Body
        html += '<tbody>';
        rows.forEach((row, idx) => {
          const bgColor = idx % 2 === 0 ? '#f9fafb' : 'white';
          html += `<tr style="background: ${bgColor}; transition: background 0.2s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='${bgColor}'">`;
          row.forEach(cell => {
            html += `<td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${escapeCell(cell)}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody>';

        html += '</table>\n';

        return html;
      });
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

    // ============================================
    // ENROLLMENT FORM METHODS
    // ============================================

    showEnrollmentForm(product) {
      const metadata = product.metadata || {};
      const courseType = metadata.course_type || 'both';
      const allDates = metadata.virtual_dates || [];
      const locations = metadata.locations || [];

      // Filter to only show future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const virtualDates = allDates.filter(date => {
        const courseDate = new Date(date);
        return courseDate >= today;
      });

      const wpId = metadata.wp_id || product.id;
      let price = metadata.price || product.price || 0;
      price = Math.round(price * 1.15)
      const currency = metadata.currency || product.currency || 'SAR';
      const productName = product.name || 'Course';
      const enrollLink = product.enroll_link || product.product_link || '';

      // Determine enrollment type:
      // Type 1: Date only (virtualDates exists, 0-1 locations)
      // Type 2: Date + Location (virtualDates exists, 2+ locations)
      // Type 3: No enrollment form needed (no dates, just redirect)

      const requiresDate = virtualDates.length > 0;
      const requiresLocation = locations.length > 1;

      // Type 3: No dates available - just redirect to enrollment link
      if (!requiresDate) {
        if (enrollLink) {
          window.open(enrollLink, '_blank');
          this.addMessage('✅ Opening enrollment page...', 'bot');
        } else {
          this.addMessage('Sorry, enrollment is not available at this time. Please contact support.', 'bot');
        }
        return;
      }

      // Create enrollment form as a chat message card
      const messageDiv = document.createElement('div');
      messageDiv.className = 'tharwah-chat-message bot enrollment-form-message';
      messageDiv.dataset.productId = wpId;
      messageDiv.dataset.enrollLink = enrollLink;

      messageDiv.innerHTML = `
        <div class="tharwah-chat-message-content" style="
          padding: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          max-width: 100%;
        ">
          <!-- Header -->
          <div style="
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 16px;
          ">
            <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #111827;">
              ${this.escapeHtml(productName)}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              ${currency} ${price.toLocaleString()}
            </p>
          </div>
          
          <!-- Form -->
          <form id="enrollmentFormData" style="padding: 16px;">
            
            <!-- Date Selection (Always shown if dates available) -->
            <div style="margin-bottom: 12px;">
              <label style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 4px;
              ">
                ${this.config.language === 'ar' ? 'تاريخ الدورة' : 'Course Date'}
                <span style="color: #ef4444;">*</span>
              </label>
              <select 
                id="virtual_date" 
                name="virtual_date" 
                required
                style="
                  width: 100%;
                  padding: 8px 10px;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  font-size: 13px;
                  color: #374151;
                  background: white;
                  cursor: pointer;
                "
              >
                <option value="">${this.config.language === 'ar' ? 'اختر التاريخ...' : 'Select date...'}</option>
                ${virtualDates.map(date => {
        const [year, month, day] = date.split('-');
        const formattedDate = day + '-' + month + '-' + year;

        // For Arabic: keep original format, For English: format nicely
        const displayDate = this.config.language === 'ar'
          ? date  // Keep original: 2025-11-30
          : new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });  // Format: Nov 30, 2025

        return '<option value="' + formattedDate + '">' + displayDate + '</option>';
      }).join('')}
              </select>
            </div>
            
            <!-- Location Selection (Only shown if multiple locations) -->
            ${requiresLocation ? `
            <div style="margin-bottom: 12px;">
              <label style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 4px;
              ">
                ${this.config.language === 'ar' ? 'الموقع' : 'Location'}
                <span style="color: #ef4444;">*</span>
              </label>
              <select 
                id="location" 
                name="location" 
                required
                style="
                  width: 100%;
                  padding: 8px 10px;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  font-size: 13px;
                  color: #374151;
                  background: white;
                  cursor: pointer;
                "
              >
                <option value="">${this.config.language === 'ar' ? 'اختر الموقع...' : 'Select location...'}</option>
                ${locations.map(location =>
        '<option value="' + this.escapeHtml(location) + '">' + this.escapeHtml(location) + '</option>'
      ).join('')}
              </select>
            </div>
            ` : ''}
            
            <input type="hidden" name="product_id" value="${wpId}">
            <input type="hidden" name="quantity" value="1">
            ${!requiresLocation && locations.length > 0 ? '<input type="hidden" name="location" value="' + this.escapeHtml(locations[0]) + '">' : ''}
            
            <!-- Buttons -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-top: 16px;
            ">
              <button
                type="button"
                id="tharwah-chat-enrollment-cancel"
                onclick="this.closest('.enrollment-form-message').remove()"
                style="
                  padding: 10px;
                  border: 1px solid #d1d5db;
                  background: white;
                  color: #6b7280;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                "
              >
                ${this.config.language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                id="tharwah-chat-enrollment-submit"
                style="
                  padding: 10px;
                  border: 1px solid #2563eb;
                  background: #2563eb;
                  color: white;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: background 0.2s;
                "
                onmouseover="this.style.background='#1d4ed8'"
                onmouseout="this.style.background='#2563eb'"
              >
                ${this.config.language === 'ar' ? '🎓 التسجيل الآن' : '🎓 Enroll Now'}
              </button>
            </div>
          </form>
        </div>
      `;

      // Add to chat messages
      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();

      // Handle form submission
      const form = messageDiv.querySelector('#enrollmentFormData');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitEnrollment(e.target, messageDiv);
      });
    }

    closeEnrollmentForm() {
      // Legacy method - no longer needed as form is in chat
      // Kept for compatibility
    }

    async submitEnrollment(form, messageDiv) {
      const formData = new FormData(form);
      const virtualDate = formData.get('virtual_date');
      const location = formData.get('location');
      const productId = formData.get('product_id');
      const quantity = formData.get('quantity');

      // Validate required fields
      if (!virtualDate) {
        this.addMessage(
          this.config.language === 'ar' ? '⚠️ يرجى اختيار التاريخ' : '⚠️ Please select a date',
          'bot'
        );
        return;
      }

      // Check if location is required (if location field exists and no value)
      const locationField = form.querySelector('#location');
      if (locationField && !location) {
        this.addMessage(
          this.config.language === 'ar' ? '⚠️ يرجى اختيار الموقع' : '⚠️ Please select a location',
          'bot'
        );
        return;
      }

      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = this.config.language === 'ar' ? '⏳ جاري الإضافة...' : '⏳ Adding to cart...';
      }

      try {
        // Build cart URL based on language
        const isArabic = this.config.language === 'ar';
        const cartUrl = isArabic
          ? 'https://academy.tharwah.net/ar/السلة/'
          : 'https://academy.tharwah.net/cart/';

        // Create form element for submission
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = cartUrl;
        hiddenForm.target = '_blank';  // Open in new tab
        hiddenForm.style.display = 'none';

        // Add form fields
        const fields = {
          'add-to-cart': productId,
          'quantity': quantity,
          'training_type': 'virtual',  // Always virtual
          'virtual_date': virtualDate
        };

        // Add location only if the location field exists in the form (i.e., product has multiple locations)
        // If product has 0-1 locations, the location field won't be shown in the form
        const locationField = form.querySelector('#location');
        if (locationField && location) {
          fields['location'] = location;
        }

        // Create hidden input fields
        Object.keys(fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = fields[key];
          hiddenForm.appendChild(input);
        });

        // Log enrollment data for debugging
        this.log('Submitting enrollment:', fields);

        // Append form to body and submit
        document.body.appendChild(hiddenForm);
        hiddenForm.submit();

        // Remove form after submission
        setTimeout(() => {
          document.body.removeChild(hiddenForm);
        }, 1000);

        // Remove enrollment form from chat
        if (messageDiv) {
          messageDiv.remove();
        }

        // Show success message in chat
        const successMessage = this.config.language === 'ar'
          ? '✅ تم إضافة الدورة إلى السلة! يرجى إكمال عملية الدفع في النافذة الجديدة.'
          : '✅ Course added to cart! Please complete checkout in the new tab.';
        this.addMessage(successMessage, 'bot');

        // Track enrollment event
        this.trackEvent('course_enrollment_submitted', {
          product_id: productId,
          date: virtualDate,
          location: location || 'N/A',
          training_type: 'virtual'
        });

      } catch (error) {
        this.log('Enrollment error:', error);

        const errorMessage = this.config.language === 'ar'
          ? '❌ فشل التسجيل. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
          : '❌ Enrollment failed. Please try again or contact support.';
        this.addMessage(errorMessage, 'bot');

        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }

        // Track error
        this.trackEvent('course_enrollment_error', {
          error: error.message,
          product_id: productId
        });
      }
    }

    // ============================================
    // B2B SERVICE REQUEST
    // ============================================

    showB2BServiceCards(services) {
      // Create horizontal scrollable container for B2B services
      const servicesHtml = services.map(service => {
        const serviceName = this.escapeHtml(service.name).replace(/'/g, "\\'");
        const imageUrl = service.attachment_url ? `${this.config.apiEndpoint.replace(/\/api\/?$/, '')}${service.attachment_url}` : null;
        console.log('[TharwahChat] Rendering B2B service:', serviceName, imageUrl);
        return `
          <div style="
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s;
            flex-shrink: 0;
            width: 200px;
            cursor: pointer;
          "
          onmouseover="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'"
          onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
          onclick="window.tharwahChatWidget.showB2BRequestForm('${service.id}', '${serviceName}')"
          >
            <!-- Image/Icon -->
            <div style="position: relative;">
              ${imageUrl ?
            `<img src="${imageUrl}" alt="${this.escapeHtml(service.name)}" style="width: 100%; height: 96px; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'width: 100%; height: 96px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem;\\'>🏢</div>';" />` :
            `<div style="width: 100%; height: 96px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                🏢
              </div>`
          }
            </div>

            <!-- Content -->
            <div style="padding: 12px;">
              <!-- Title -->
              <h4 style="
                font-size: 13px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 6px 0;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                height: 32px;
              ">${this.escapeHtml(service.name)}</h4>

              <!-- Description -->
              <p style="
                font-size: 11px;
                color: #6b7280;
                margin: 0 0 8px 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                height: 46px;
              ">${this.escapeHtml(service.description || (this.config.language === 'ar' ? 'احصل على استشارة متخصصة في هذه الخدمة' : 'Get specialized consultation for this service'))}</p>

              <!-- Request Button -->
              <button
                style="
                  width: 100%;
                  padding: 6px 12px;
                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                onmouseover="this.style.background='#1d4ed8'"
                onmouseout="this.style.background='#2563eb'"
                onclick="event.stopPropagation(); window.tharwahChatWidget.showB2BRequestForm('${service.id}', '${serviceName}')"
              >
                ${this.config.language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      const messageHtml = `
        <div class="tharwah-chat-message bot" style="margin-bottom: 12px;">
          <div class="tharwah-chat-message-content" style="max-width: 100%; padding: 0; background: transparent; box-shadow: none;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 8px;">
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
                padding: 0 4px;
              ">
                <span style="color: #2563eb;">🏢</span>
                <h4 style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #1f2937;
                  margin: 0;
                ">
                  ${this.config.language === 'ar' ? 'خدماتنا المتخصصة للشركات' : 'Our Specialized B2B Services'}
                </h4>
              </div>

              <div style="
                display: flex;
                gap: 8px;
                overflow-x: auto;
                padding-bottom: 4px;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
              ">
                ${servicesHtml}
              </div>

              <p style="
                font-size: 11px;
                color: #6b7280;
                margin: 8px 4px 0 0;
                text-align: center;
                font-style: italic;
              ">
                ${this.config.language === 'ar'
          ? '💡 انقر على أي خدمة للحصول على استشارة متخصصة'
          : '💡 Click on any service to get specialized consultation'}
              </p>
            </div>
          </div>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = messageHtml;
      const messageElement = tempDiv.firstElementChild;

      this.elements.messages.appendChild(messageElement);
      this.scrollToBottom();
    }

    showB2BRequestForm(serviceName = null) {
      // Close any existing B2B request form first
      const existingForm = document.querySelector('.b2b-request-form-message');
      if (existingForm) {
        existingForm.remove();
      }

      // Get user email from session if available
      const userEmail = sessionStorage.getItem('tharwah_user_email') || '';

      // Use the provided service name for pre-selection
      const selectedServiceName = serviceName || '';

      const formHtml = `
        <div class="tharwah-chat-message bot b2b-request-form-message" style="margin-bottom: 12px;">
          <div style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
          ">
            <h4 style="
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M9 11l3 3L22 4"></path>
              </svg>
              ${this.config.language === 'ar' ? 'نموذج طلب الخدمة' : 'Service Request Form'}
            </h4>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 16px 0;">
              ${this.config.language === 'ar' ? 'يرجى ملء التفاصيل الخاصة بك' : 'Please fill in your details'}
            </p>

            <form id="b2bRequestForm">
              <!-- First Name -->
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'الاسم الأول' : 'First Name'}
                  <span style="color: #ef4444;">*</span>
                </label>
                <input
                  type="text"
                  name="first-name"
                  required
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                  placeholder="${this.config.language === 'ar' ? 'أحمد' : 'Ahmad'}"
                />
              </div>

              <!-- Last Name -->
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                  <span style="color: #ef4444;">*</span>
                </label>
                <input
                  type="text"
                  name="last-name"
                  required
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                  placeholder="${this.config.language === 'ar' ? 'محمد' : 'Mohamed'}"
                />
              </div>

              <!-- Email -->
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  <span style="color: #ef4444;">*</span>
                </label>
                <input
                  type="email"
                  name="your-email"
                  required
                  value="${userEmail}"
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                  placeholder="your@email.com"
                />
              </div>

              <!-- Phone -->
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  <span style="color: #ef4444;">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="05[0-9]{8}"
                  maxlength="10"
                  title="${this.config.language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح يبدأ بـ 05' : 'Please enter a valid mobile number starts with 05'}"
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                  placeholder="${this.config.language === 'ar' ? '٠٥٠١٢٣٤٥٦٧' : '0501234567'}"
                />
              </div>

              <!-- Organization -->
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'اسم المنظمة' : 'Organization Name'}
                  <span style="color: #ef4444;">*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  required
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                  placeholder="${this.config.language === 'ar' ? 'اسم شركتك' : 'Your Company Name'}"
                />
              </div>

              <!-- Service Needed -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  ${this.config.language === 'ar' ? 'الخدمة المطلوبة' : 'Service Needed'}
                </label>
                <select
                  name="service-needed"
                  style="
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    background: white;
                    /* Prevent iOS zoom */
                    font-size: 16px;
                    transform-origin: left;
                    transform: scale(0.8125);
                  "
                >
                  <option value="">${this.config.language === 'ar' ? 'اختر خدمة' : 'Select a service'}</option>
                  <option value="Training Consulting" ${selectedServiceName === (this.config.language === 'ar' ? 'استشارات التدريب' : 'Training Consulting') ? 'selected' : ''}>${this.config.language === 'ar' ? 'استشارات التدريب' : 'Training Consulting'}</option>
                  <option value="Leadership Development" ${selectedServiceName === (this.config.language === 'ar' ? 'تطوير القيادة' : 'Leadership Development') ? 'selected' : ''}>${this.config.language === 'ar' ? 'تطوير القيادة' : 'Leadership Development'}</option>
                  <option value="HR Development" ${selectedServiceName === (this.config.language === 'ar' ? 'تطوير الموارد البشرية' : 'HR Development') ? 'selected' : ''}>${this.config.language === 'ar' ? 'تطوير الموارد البشرية' : 'HR Development'}</option>
                  <option value="Professional Skills Development" ${selectedServiceName === (this.config.language === 'ar' ? 'تطوير المهارات المهنية' : 'Professional Skills Development') ? 'selected' : ''}>${this.config.language === 'ar' ? 'تطوير المهارات المهنية' : 'Professional Skills Development'}</option>
                  <option value="Fresh Graduates Development" ${selectedServiceName === (this.config.language === 'ar' ? 'تطوير الخريجين الجدد' : 'Fresh Graduates Development') ? 'selected' : ''}>${this.config.language === 'ar' ? 'تطوير الخريجين الجدد' : 'Fresh Graduates Development'}</option>
                  <option value="Coaching Services" ${selectedServiceName === (this.config.language === 'ar' ? 'خدمات التدريب' : 'Coaching Services') ? 'selected' : ''}>${this.config.language === 'ar' ? 'خدمات التدريب' : 'Coaching Services'}</option>
                  <option value="General">${this.config.language === 'ar' ? 'عام' : 'General'}</option>
                </select>
              </div>

              <!-- Hidden fields -->
              <input type="hidden" name="page-url" value="${window.location.href}" />
              <input type="hidden" name="page-title" value="${document.title}" />
              <input type="hidden" name="language" value="${this.config.language}" />
              <input type="hidden" name="custom-thank-you" value="yes" />

              <!-- Buttons -->
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
              ">
                <button
                  type="button"
                  onclick="this.closest('.b2b-request-form-message').remove()"
                  style="
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #6b7280;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                  "
                >
                  ${this.config.language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style="
                    padding: 10px;
                    border: 1px solid #2563eb;
                    background: #2563eb;
                    color: white;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                  "
                  onmouseover="this.style.background='#1d4ed8'"
                  onmouseout="this.style.background='#2563eb'"
                >
                  📨 ${this.config.language === 'ar' ? 'إرسال' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formHtml;
      const formElement = tempDiv.firstElementChild;

      this.elements.messages.appendChild(formElement);
      this.scrollToBottom();

      // Attach form submit handler
      const form = formElement.querySelector('#b2bRequestForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitB2BRequest(e.target, formElement);
      });
    }

    async submitB2BRequest(form, messageDiv) {
      const formData = new FormData(form);

      // Validate required fields
      const requiredFields = ['first-name', 'last-name', 'your-email', 'phone', 'organization'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          this.addMessage(
            this.config.language === 'ar'
              ? `⚠️ يرجى ملء جميع الحقول المطلوبة`
              : `⚠️ Please fill in all required fields`,
            'bot'
          );
          // Scroll to bottom to show the validation error
          this.scrollToBottom();
          return;
        }
      }


      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = this.config.language === 'ar' ? '⏳ جاري الإرسال...' : '⏳ Submitting...';
      }

      try {
        // Build form data for CF7
        const cf7Data = new FormData();

        // Add all form fields
        for (const [key, value] of formData.entries()) {
          cf7Data.append(key, value);
        }

        // Add CF7 specific fields
        cf7Data.append('_wpcf7', '5229');
        cf7Data.append('_wpcf7_version', '6.1.2');
        cf7Data.append('_wpcf7_locale', this.config.language === 'ar' ? 'ar' : 'en_GB');
        cf7Data.append('_wpcf7_unit_tag', 'wpcf7-f5229-chatbot');
        cf7Data.append('_wpcf7_container_post', '0');
        cf7Data.append('_wpcf7_posted_data_hash', '');
        cf7Data.append('tharwah_service', formData.get('service-needed') || 'General');
        cf7Data.append('cf7_form_id', '5229');
        cf7Data.append('current_page_url', window.location.href);

        // Add tracking fields
        cf7Data.append('utm_source', '');
        cf7Data.append('utm_medium', '');
        cf7Data.append('utm_campaign', '');
        cf7Data.append('gclid', '');
        cf7Data.append('fbclid', '');
        cf7Data.append('main-line', '');
        cf7Data.append('subline', '');

        this.log('Submitting B2B service request:', Object.fromEntries(cf7Data));

        // Submit to chatbot endpoint
        const response = await fetch('https://academy.tharwah.net/mystaging01/wp-json/contact-form-7/v1/contact-forms/5229/feedback', {
          method: 'POST',
          body: cf7Data
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        this.log('B2B request response:', result);

        // Remove form from chat
        if (messageDiv) {
          messageDiv.remove();
        }

        // Show success message
        if (result.status === 'mail_sent') {
          const successMessage = this.config.language === 'ar'
            ? '✅ شكراً لك! تم إرسال طلبك بنجاح. سنتواصل معك قريباً.'
            : '✅ Thank you! Your request has been submitted successfully. We\'ll get back to you soon.';
          this.addMessage(successMessage, 'bot');
          // Scroll to bottom to show the success message
          this.scrollToBottom();
        } else {
          throw new Error(result.message || 'Submission failed');
        }

        // Track successful submission
        this.trackEvent('b2b_service_request_submitted', {
          service: formData.get('service-needed'),
          organization: formData.get('organization'),
          email: formData.get('your-email')
        });

      } catch (error) {
        this.log('B2B service request error:', error);

        const errorMessage = this.config.language === 'ar'
          ? '❌ فشل إرسال الطلب. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.'
          : '❌ Failed to submit request. Please try again or contact us directly.';
        this.addMessage(errorMessage, 'bot');
        // Scroll to bottom to show the error message
        this.scrollToBottom();

        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }

        // Track error
        this.trackEvent('b2b_service_request_error', {
          error: error.message
        });
      }
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