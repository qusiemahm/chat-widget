/**
 * UniversalTracker - Comprehensive Event Tracking Library
 * A lightweight, generic analytics tracker for any website
 * 
 * @version 2.0.0
 * @license MIT
 */

(function(window) {
  'use strict';

  class UniversalTracker {
    constructor(config = {}) {
      // Core configuration
      this.config = {
        apiEndpoint: config.apiEndpoint || null,
        projectId: config.projectId || 'default',
        debug: config.debug || false,
        
        // Tracking options
        trackPageViews: config.trackPageViews !== false,
        trackClicks: config.trackClicks !== false,
        trackScrolls: config.trackScrolls !== false,
        trackForms: config.trackForms !== false,
        trackErrors: config.trackErrors !== false,
        trackPerformance: config.trackPerformance !== false,
        trackUserTiming: config.trackUserTiming !== false,
        
        // Batching configuration
        batchSize: config.batchSize || 20,
        batchInterval: config.batchInterval || 15000, // 15 seconds
        
        // Sampling
        sampleRate: config.sampleRate || 1.0, // Track 100% by default
        
        // Custom callbacks
        beforeSend: config.beforeSend || null,
        onError: config.onError || null,
        
        // Storage
        useLocalStorage: config.useLocalStorage !== false,
        storageDuration: config.storageDuration || 30 * 24 * 60 * 60 * 1000, // 30 days
        
        // Privacy
        anonymizeIP: config.anonymizeIP || false,
        respectDoNotTrack: config.respectDoNotTrack || false,
        
        // AI-Powered Popovers
        enablePopovers: config.enablePopovers !== false,
        popoverApiKey: config.popoverApiKey || null,
        popoverEnablePeriodicChecks: config.popoverEnablePeriodicChecks !== false, // Enable periodic background checks
        popoverCheckInterval: config.popoverCheckInterval || 30000, // 30 seconds
        popoverMinDelay: config.popoverMinDelay || 10000, // Wait 10s before first check
        popoverMaxPerSession: config.popoverMaxPerSession || 3,
        popoverUseFastEndpoint: config.popoverUseFastEndpoint !== false, // Use fast rule-based endpoint by default
        
        // Immediate popover triggering
        immediatePopoverEvents: config.immediatePopoverEvents || [
          'exit_intent',
          'rage_click',
          'form_abandon',
          'form_start',
          'scroll_depth'
        ]
      };

      // Should we track this user?
      if (this.config.respectDoNotTrack && navigator.doNotTrack === '1') {
        this.log('Tracking disabled: Do Not Track is enabled');
        this.enabled = false;
        return;
      }

      // Sampling check
      if (Math.random() > this.config.sampleRate) {
        this.log('User not sampled for tracking');
        this.enabled = false;
        return;
      }

      this.enabled = true;
      
      // Session & User identification
      this.sessionId = this.getOrCreateSession();
      this.visitorId = this.getOrCreateVisitor();
      this.userId = config.userId || null;
      
      // Event queue
      this.eventQueue = [];
      this.batchTimer = null;
      
      // Tracking state
      this.startTime = Date.now();
      this.lastActivityTime = Date.now();
      this.pageLoadTime = Date.now();
      
      // Page session state
      this.state = {
        // Page info
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        pageTitle: document.title,
        referrer: document.referrer,
        
        // Device & Browser
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Engagement metrics
        pageViews: 0,
        totalClicks: 0,
        totalScrolls: 0,
        maxScrollDepth: 0,
        currentScrollDepth: 0,
        timeOnPage: 0,
        activeTime: 0,
        idleTime: 0,
        
        // Interaction tracking
        formSubmissions: 0,
        formStarts: 0,
        formAbandons: 0,
        linkClicks: 0,
        buttonClicks: 0,
        downloadClicks: 0,
        outboundClicks: 0,
        
        // Content engagement
        videoPlays: 0,
        mediaInteractions: 0,
        searchQueries: [],
        
        // Technical
        errors: 0,
        pageLoadDuration: 0,
        
        // Flags
        isReturningVisitor: false,
        exitIntentDetected: false,
        rageClickDetected: false
      };
      
      // Throttled event handlers
      this.handlers = {};
      this.throttledEvents = new Set();
      this.rageClickData = { count: 0, lastTime: 0, element: null };
      
      // Popover state
      this.popoverState = {
        shown: new Set(), // Track shown popover IDs
        count: 0, // Count of popovers shown this session
        lastCheckTime: 0,
        currentPopover: null, // Currently displayed popover
        checkTimer: null
      };
      
      this.log('UniversalTracker initialized', {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        config: this.config
      });
    }

    // ============================================
    // INITIALIZATION & LIFECYCLE
    // ============================================

    init() {
      if (!this.enabled) return this;

      this.log('Starting tracking...');
      
      // Check if returning visitor
      this.state.isReturningVisitor = this.checkReturningVisitor();
      
      // Track initial page view
      if (this.config.trackPageViews) {
        this.trackPageView();
      }
      
      // Capture performance metrics
      if (this.config.trackPerformance) {
        this.trackPerformance();
      }
      
      // Set up all event listeners
      this.setupListeners();
      
      // Start batch timer
      this.startBatchTimer();
      
      // Track page visibility
      this.trackVisibility();
      
      // Track page exit
      this.setupExitTracking();
      
      // Start activity monitoring
      this.startActivityMonitoring();
      
      // Track errors
      if (this.config.trackErrors) {
        this.setupErrorTracking();
      }
      
      // Start AI-powered popover suggestions
      if (this.config.enablePopovers && this.config.popoverApiKey) {
        this.startPopoverSystem();
      }
      
      // Listen for chat open/close events to hide/show popover
      this.setupChatListeners();

      this.log('Tracking started successfully');
      return this;
    }
    
    setupChatListeners() {
      // Check for chat widget periodically and add listeners
      const checkChatWidget = () => {
        const chatButton = document.getElementById('tharwah-chat-button');
        const chatWindow = document.getElementById('tharwah-chat-window');
        
        if (chatButton && chatWindow) {
          // Monitor chat window visibility using MutationObserver
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const isVisible = chatWindow.style.display !== 'none';
                if (isVisible) {
                  // Chat is open, hide popover
                  this.hidePopover();
                  this.log('Chat opened, hiding popover');
                }
              }
            });
          });
          
          observer.observe(chatWindow, {
            attributes: true,
            attributeFilter: ['style']
          });
          
          this.log('Chat listeners setup complete');
        } else {
          // Chat widget not ready yet, try again
          setTimeout(checkChatWidget, 500);
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkChatWidget, 1000);
    }

    destroy() {
      this.log('Destroying tracker...');
      this.removeListeners();
      this.stopBatchTimer();
      this.flush();
      this.enabled = false;
    }

    // ============================================
    // SESSION & VISITOR MANAGEMENT
    // ============================================

    getOrCreateSession() {
      const key = '_ut_session';
      const timeout = 30 * 60 * 1000; // 30 minutes
      
      const stored = this.getStorage(key);
      if (stored && (Date.now() - stored.timestamp < timeout)) {
        return stored.id;
      }
      
      const sessionId = this.generateId('sess');
      this.setStorage(key, { id: sessionId, timestamp: Date.now() });
      return sessionId;
    }

    getOrCreateVisitor() {
      const key = '_ut_visitor';
      
      const stored = this.getStorage(key);
      if (stored) return stored.id;
      
      const visitorId = this.generateId('vis');
      this.setStorage(key, { 
        id: visitorId, 
        firstSeen: Date.now(),
        visits: 1
      });
      return visitorId;
    }

    checkReturningVisitor() {
      const stored = this.getStorage('_ut_visitor');
      if (!stored) return false;
      
      // Update visit count
      stored.visits = (stored.visits || 0) + 1;
      stored.lastSeen = Date.now();
      this.setStorage('_ut_visitor', stored);
      
      return stored.visits > 1;
    }

    generateId(prefix = 'id') {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================
    // STORAGE HELPERS
    // ============================================

    getStorage(key) {
      if (!this.config.useLocalStorage) return null;
      
      try {
        const item = localStorage.getItem(`ut_${this.config.projectId}_${key}`);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    }

    setStorage(key, value) {
      if (!this.config.useLocalStorage) return;
      
      try {
        localStorage.setItem(`ut_${this.config.projectId}_${key}`, JSON.stringify(value));
      } catch (e) {
        this.log('Storage error:', e);
      }
    }

    clearStorage(key) {
      if (!this.config.useLocalStorage) return;
      
      try {
        localStorage.removeItem(`ut_${this.config.projectId}_${key}`);
      } catch (e) {
        this.log('Storage error:', e);
      }
    }

    // ============================================
    // EVENT LISTENERS SETUP
    // ============================================

    setupListeners() {
      // Scroll tracking
      if (this.config.trackScrolls) {
        this.handlers.scroll = this.throttle(() => this.handleScroll(), 300);
        window.addEventListener('scroll', this.handlers.scroll, { passive: true });
      }

      // Click tracking
      if (this.config.trackClicks) {
        this.handlers.click = (e) => this.handleClick(e);
        document.addEventListener('click', this.handlers.click, true);
      }

      // Form tracking
      if (this.config.trackForms) {
        this.handlers.submit = (e) => this.handleFormSubmit(e);
        this.handlers.focus = (e) => this.handleFormFocus(e);
        this.handlers.blur = (e) => this.handleFormBlur(e);
        
        document.addEventListener('submit', this.handlers.submit, true);
        document.addEventListener('focus', this.handlers.focus, true);
        document.addEventListener('blur', this.handlers.blur, true);
      }

      // Visibility change
      this.handlers.visibility = () => this.handleVisibilityChange();
      document.addEventListener('visibilitychange', this.handlers.visibility);

      // Window resize
      this.handlers.resize = this.throttle(() => this.handleResize(), 1000);
      window.addEventListener('resize', this.handlers.resize);

      // Exit intent
      this.handlers.mouseout = (e) => this.detectExitIntent(e);
      document.addEventListener('mouseout', this.handlers.mouseout);

      // Page navigation (for SPAs)
      this.handlers.popstate = () => this.handleNavigation();
      window.addEventListener('popstate', this.handlers.popstate);
    }

    removeListeners() {
      if (this.handlers.scroll) window.removeEventListener('scroll', this.handlers.scroll);
      if (this.handlers.click) document.removeEventListener('click', this.handlers.click, true);
      if (this.handlers.submit) document.removeEventListener('submit', this.handlers.submit, true);
      if (this.handlers.focus) document.removeEventListener('focus', this.handlers.focus, true);
      if (this.handlers.blur) document.removeEventListener('blur', this.handlers.blur, true);
      if (this.handlers.visibility) document.removeEventListener('visibilitychange', this.handlers.visibility);
      if (this.handlers.resize) window.removeEventListener('resize', this.handlers.resize);
      if (this.handlers.mouseout) document.removeEventListener('mouseout', this.handlers.mouseout);
      if (this.handlers.popstate) window.removeEventListener('popstate', this.handlers.popstate);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    trackPageView(customData = {}) {
      this.state.pageViews++;
      
      this.track('page_view', {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        hash: window.location.hash,
        queryString: window.location.search,
        ...customData
      });
    }

    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      this.state.currentScrollDepth = scrollPercent;
      this.state.maxScrollDepth = Math.max(this.state.maxScrollDepth, scrollPercent);
      this.state.totalScrolls++;
      
      // Track scroll milestones
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        const key = `scroll_${milestone}`;
        if (scrollPercent >= milestone && !this.throttledEvents.has(key)) {
          this.throttledEvents.add(key);
          this.track('scroll_depth', { depth: milestone });
        }
      });
      
      this.updateActivity();
    }

    handleClick(event) {
      this.state.totalClicks++;
      
      const target = event.target.closest('a, button, [role="button"], [onclick]') || event.target;
      const elementData = this.getElementData(target);
      
      // Detect rage clicks (multiple clicks in same spot rapidly)
      this.detectRageClick(event, target);
      
      // Track different click types
      if (target.tagName === 'A') {
        this.state.linkClicks++;
        this.trackLinkClick(target, elementData);
      } else if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        this.state.buttonClicks++;
        this.track('button_click', elementData);
      } else {
        this.track('click', elementData);
      }
      
      this.updateActivity();
    }

    trackLinkClick(link, elementData) {
      const href = link.href || '';
      const isDownload = link.hasAttribute('download') || 
        /\.(pdf|zip|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(href);
      const isOutbound = href && 
        link.hostname !== window.location.hostname && 
        link.hostname !== '';
      
      if (isDownload) {
        this.state.downloadClicks++;
        this.track('download', { ...elementData, file: href });
      } else if (isOutbound) {
        this.state.outboundClicks++;
        this.track('outbound_link', { ...elementData, destination: href });
      } else {
        this.track('link_click', elementData);
      }
    }

    detectRageClick(event, target) {
      const now = Date.now();
      const threshold = 500; // 500ms between clicks
      const countLimit = 3; // 3 rapid clicks = rage click
      
      if (this.rageClickData.element === target && (now - this.rageClickData.lastTime) < threshold) {
        this.rageClickData.count++;
        
        if (this.rageClickData.count >= countLimit && !this.state.rageClickDetected) {
          this.state.rageClickDetected = true;
          this.track('rage_click', {
            element: this.getElementData(target),
            clickCount: this.rageClickData.count
          });
        }
      } else {
        this.rageClickData.count = 1;
        this.rageClickData.element = target;
      }
      
      this.rageClickData.lastTime = now;
    }

    handleFormSubmit(event) {
      const form = event.target;
      this.state.formSubmissions++;
      
      // Mark form as submitted to prevent abandon tracking
      this.throttledEvents.add(`form_submit_${form.id || 'default'}`);
      
      this.track('form_submit', {
        formId: form.id,
        formName: form.name,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: form.elements.length
      });
    }

    handleFormFocus(event) {
      const target = event.target;
      
      if (this.isFormField(target)) {
        const fieldKey = this.getFieldKey(target);
        
        if (!this.throttledEvents.has(`form_start_${fieldKey}`)) {
          this.throttledEvents.add(`form_start_${fieldKey}`);
          this.state.formStarts++;
          
          this.track('form_start', {
            formId: target.form?.id,
            fieldName: target.name || target.id,
            fieldType: target.type
          });
        }
      }
    }

    handleFormBlur(event) {
      const target = event.target;
      
      if (this.isFormField(target)) {
        this.track('form_field_complete', {
          formId: target.form?.id,
          fieldName: target.name || target.id,
          fieldType: target.type,
          filled: !!target.value
        });
        
        // Track form abandonment if user filled fields but hasn't submitted
        if (target.form && !this.throttledEvents.has(`form_abandon_${target.form.id || 'default'}`)) {
          setTimeout(() => {
            // Check if form was submitted
            if (!this.throttledEvents.has(`form_submit_${target.form.id || 'default'}`)) {
              this.throttledEvents.add(`form_abandon_${target.form.id || 'default'}`);
              this.track('form_abandon', {
                formId: target.form.id,
                formName: target.form.name,
                formAction: target.form.action,
                fieldsFilled: Array.from(target.form.elements).filter(el => 
                  this.isFormField(el) && el.value
                ).length,
                totalFields: target.form.elements.length
              });
            }
          }, 5000); // Track as abandoned after 5 seconds of inactivity
        }
      }
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
        this.updateActivity();
      }
    }

    handleResize() {
      this.track('window_resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    detectExitIntent(event) {
      if (event.clientY <= 0 && !this.state.exitIntentDetected) {
        this.state.exitIntentDetected = true;
        this.track('exit_intent', {
          timeOnPage: this.getTimeOnPage(),
          scrollDepth: this.state.maxScrollDepth,
          engagementLevel: this.calculateEngagement()
        });
      }
    }

    handleNavigation() {
      // For SPAs - detect route changes
      if (this.state.currentUrl !== window.location.href) {
        this.track('page_navigation', {
          from: this.state.currentUrl,
          to: window.location.href
        });
        
        this.state.currentUrl = window.location.href;
        this.state.currentPath = window.location.pathname;
        this.pageLoadTime = Date.now();
        
        // Track as new page view
        if (this.config.trackPageViews) {
          this.trackPageView({ type: 'spa_navigation' });
        }
      }
    }

    // ============================================
    // PERFORMANCE TRACKING
    // ============================================

    trackPerformance() {
      if (!window.performance || !window.performance.timing) return;

      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const navigation = window.performance.navigation;
          
          const metrics = {
            // Page load timing
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnection: timing.connectEnd - timing.connectStart,
            serverResponse: timing.responseEnd - timing.requestStart,
            domProcessing: timing.domComplete - timing.domLoading,
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            
            // Navigation type
            navigationType: ['navigate', 'reload', 'back_forward', 'prerender'][navigation.type] || 'unknown',
            redirectCount: navigation.redirectCount
          };
          
          this.state.pageLoadDuration = metrics.pageLoad;
          this.track('performance', metrics);
          
          // Track resources
          if (window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            this.track('resource_timing', {
              totalResources: resources.length,
              totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
              slowestResource: this.getSlowestResource(resources)
            });
          }
        }, 0);
      });
    }

    getSlowestResource(resources) {
      if (!resources.length) return null;
      
      const slowest = resources.reduce((max, r) => 
        r.duration > max.duration ? r : max
      );
      
      return {
        name: slowest.name,
        duration: Math.round(slowest.duration),
        type: slowest.initiatorType
      };
    }

    // ============================================
    // ERROR TRACKING
    // ============================================

    setupErrorTracking() {
      window.addEventListener('error', (event) => {
        this.state.errors++;
        this.track('error', {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.state.errors++;
        this.track('promise_rejection', {
          reason: event.reason?.toString(),
          promise: event.promise
        });
      });
    }

    // ============================================
    // VISIBILITY & ACTIVITY TRACKING
    // ============================================

    trackVisibility() {
      let hiddenTime = null;
      
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          hiddenTime = Date.now();
        } else if (hiddenTime) {
          const duration = Date.now() - hiddenTime;
          this.state.idleTime += duration;
          hiddenTime = null;
        }
      });
    }

    startActivityMonitoring() {
      setInterval(() => {
        if (!document.hidden) {
          const now = Date.now();
          const inactiveTime = now - this.lastActivityTime;
          
          if (inactiveTime < 5000) { // Active if interaction within 5 seconds
            this.state.activeTime += 1;
          } else {
            this.state.idleTime += 1;
          }
          
          this.state.timeOnPage = this.getTimeOnPage();
        }
      }, 1000);
    }

    updateActivity() {
      this.lastActivityTime = Date.now();
    }

    // ============================================
    // EXIT TRACKING
    // ============================================

    setupExitTracking() {
      window.addEventListener('beforeunload', () => {
        this.track('page_exit', {
          timeOnPage: this.getTimeOnPage(),
          activeTime: this.state.activeTime,
          scrollDepth: this.state.maxScrollDepth,
          interactions: this.state.totalClicks,
          engagement: this.calculateEngagement()
        });
        
        this.sendBeacon();
      });
    }

    sendBeacon() {
      if (!this.config.apiEndpoint || this.eventQueue.length === 0) return;
      
      const payload = JSON.stringify({
        events: this.eventQueue,
        meta: this.getMetadata()
      });
      
      navigator.sendBeacon(this.config.apiEndpoint, payload);
      this.log('Beacon sent:', this.eventQueue.length, 'events');
    }

    // ============================================
    // CORE TRACKING METHOD
    // ============================================

    track(eventName, eventData = {}) {
      if (!this.enabled) return;

      const event = {
        // Event info
        event: eventName,
        data: eventData,
        
        // Session info
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        userId: this.userId,
        projectId: this.config.projectId,
        
        // Timestamps
        timestamp: Date.now(),
        timeOnPage: this.getTimeOnPage(),
        
        // Context
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        
        // Device context
        screenWidth: this.state.screenWidth,
        screenHeight: this.state.screenHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };

      // Run beforeSend hook
      if (this.config.beforeSend) {
        const modified = this.config.beforeSend(event);
        if (modified === false) return; // Cancel event
        if (modified) Object.assign(event, modified);
      }

      // Add to queue
      this.eventQueue.push(event);
      this.log('Event tracked:', eventName, eventData);

      // Auto-flush if queue is full
      if (this.eventQueue.length >= this.config.batchSize) {
        this.flush();
      }

      // Emit custom event for external listeners
      this.emit('track', event);
      
      // Check if this event should trigger immediate popover request
      if (this.config.immediatePopoverEvents.includes(eventName)) {
        this.log('Event is in immediate trigger list:', eventName);
        
        if (!this.config.enablePopovers) {
          this.log('⚠️ Popover system is disabled. Set enablePopovers: true');
          return;
        }
        
        if (!this.config.popoverApiKey) {
          this.log('⚠️ No popover API key configured. Please set popoverApiKey');
          return;
        }
        
        this.log('✅ Event triggers immediate popover check:', eventName);
        
        // Flush tracking data immediately to ensure backend has latest data
        this.flush();
        
        // Request popover suggestion immediately
        setTimeout(() => {
          this.log('⚡ Requesting popover for event:', eventName);
          this.checkForPopover('event:' + eventName);
        }, 100); // Small delay to ensure flush completes
      }
    }

    // ============================================
    // BATCH SENDING
    // ============================================

    startBatchTimer() {
      this.batchTimer = setInterval(() => {
        if (this.eventQueue.length > 0) {
          this.flush();
        }
      }, this.config.batchInterval);
    }

    stopBatchTimer() {
      if (this.batchTimer) {
        clearInterval(this.batchTimer);
        this.batchTimer = null;
      }
    }

    async flush() {
      if (this.eventQueue.length === 0) return;
      if (!this.config.apiEndpoint) {
        this.log('No API endpoint configured, events not sent');
        return;
      }

      const events = [...this.eventQueue];
      this.eventQueue = [];

      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            events,
            meta: this.getMetadata()
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.log('Successfully sent', events.length, 'events');
        this.emit('flush', { success: true, count: events.length });

      } catch (error) {
        this.log('Error sending events:', error);
        
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
        
        if (this.config.onError) {
          this.config.onError(error, events);
        }
        
        this.emit('flush', { success: false, error, count: events.length });
      }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    getElementData(element) {
      return {
        tagName: element.tagName?.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        text: (element.textContent || element.innerText || '').trim().substring(0, 100),
        href: element.href || null,
        type: element.type || null,
        name: element.name || null,
        value: element.value || null,
        dataset: element.dataset ? { ...element.dataset } : null
      };
    }

    isFormField(element) {
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
    }

    getFieldKey(field) {
      return `${field.form?.id || 'form'}_${field.name || field.id}`;
    }

    getTimeOnPage() {
      return Math.floor((Date.now() - this.pageLoadTime) / 1000);
    }

    calculateEngagement() {
      let score = 0;
      
      // Time weight (max 30)
      score += Math.min(this.getTimeOnPage() / 10, 30);
      
      // Scroll weight (max 25)
      score += (this.state.maxScrollDepth / 100) * 25;
      
      // Interaction weight (max 25)
      score += Math.min(this.state.totalClicks * 2, 25);
      
      // Active time weight (max 20)
      const activeRatio = this.state.activeTime / (this.state.activeTime + this.state.idleTime || 1);
      score += activeRatio * 20;
      
      return Math.min(100, Math.round(score));
    }

    getMetadata() {
      return {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        userId: this.userId,
        projectId: this.config.projectId,
        state: this.state,
        engagement: this.calculateEngagement(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }

    throttle(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    log(...args) {
      if (this.config.debug) {
        console.log('[UniversalTracker]', ...args);
      }
    }

    // ============================================
    // EVENT EMITTER
    // ============================================

    emit(eventName, data) {
      const event = new CustomEvent(`tracker:${eventName}`, { detail: data });
      window.dispatchEvent(event);
    }

    on(eventName, callback) {
      window.addEventListener(`tracker:${eventName}`, (e) => callback(e.detail));
    }

    // ============================================
    // PUBLIC API
    // ============================================

    identify(userId, traits = {}) {
      this.userId = userId;
      this.track('identify', { userId, traits });
    }

    page(name, properties = {}) {
      this.trackPageView({ pageName: name, ...properties });
    }

    event(eventName, properties = {}) {
      this.track(eventName, properties);
    }

    setUserProperties(properties) {
      this.track('user_properties', properties);
    }

    getState() {
      return {
        ...this.state,
        engagement: this.calculateEngagement(),
        timeOnPage: this.getTimeOnPage()
      };
    }

    getSession() {
      return {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        userId: this.userId
      };
    }

    getVisitorId() {
      return this.visitorId;
    }

    getSessionId() {
      return this.sessionId;
    }

    reset() {
      this.clearStorage('_ut_session');
      this.clearStorage('_ut_visitor');
      this.sessionId = this.getOrCreateSession();
      this.visitorId = this.getOrCreateVisitor();
      this.userId = null;
      this.track('reset');
    }

    // ============================================
    // AI-POWERED POPOVER SYSTEM
    // ============================================

    startPopoverSystem() {
      if (!this.config.popoverEnablePeriodicChecks) {
        this.log('⏸️ Periodic popover checks disabled. Only event-based checks will run.');
        return;
      }
      
      // Wait before first check (give user time to interact)
      setTimeout(() => {
        this.checkForPopover('periodic');
        
        // Set up periodic checks
        this.popoverState.checkTimer = setInterval(() => {
          this.checkForPopover('periodic');
        }, this.config.popoverCheckInterval);
        
        this.log('🔄 Popover system started with periodic checks every', this.config.popoverCheckInterval / 1000, 'seconds');
      }, this.config.popoverMinDelay);
    }

    async checkForPopover(trigger = 'manual') {
      this.log(`🔍 checkForPopover() called [trigger: ${trigger}]`);
      
      // Don't check if max popovers reached
      if (this.popoverState.count >= this.config.popoverMaxPerSession) {
        this.log('❌ Max popovers reached for session:', this.popoverState.count, '/', this.config.popoverMaxPerSession);
        return;
      }

      // Don't check if a popover is currently shown
      if (this.popoverState.currentPopover) {
        this.log('❌ Popover already displayed:', this.popoverState.currentPopover.title);
        return;
      }

      try {
        // Construct popover endpoint
        // Fast endpoint: http://localhost:8000/api/track/suggest-popover-fast/
        // AI endpoint: http://localhost:8000/api/track/suggest-popover/
        const baseUrl = this.config.apiEndpoint.replace(/\/track\/?$/, '');
        const endpoint = this.config.popoverUseFastEndpoint ? 'suggest-popover/' : 'suggest-popover/';
        const apiEndpoint = baseUrl + '/' + endpoint;
        
        this.log('📡 Requesting popover from:', apiEndpoint);
        this.log('📦 Request data:', {
          session_id: this.sessionId,
          current_page: window.location.pathname,
          language_code: navigator.language.split('-')[0] || 'en'
        });
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.popoverApiKey}`
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            current_page: window.location.pathname,
            language_code: navigator.language.split('-')[0] || 'en'
          })
        });

        const data = await response.json();
        
        this.log('📥 Popover response:', data);
        
        if (data.success && data.popover_suggestion && data.popover_suggestion.suggested) {
          const popover = data.popover_suggestion.popover;
          
          this.log('✅ Popover suggested:', popover.title, 'Score:', data.popover_suggestion.score);
          
          // Check if already shown this session
          if (this.popoverState.shown.has(popover.id)) {
            if (popover.show_once_per_session) {
              this.log('⚠️ Popover already shown this session:', popover.id);
              return;
            }
          }
          
          // Show the popover
          this.showPopover(popover, data.popover_suggestion);
        } else {
          this.log('ℹ️ No popover suggested for current context');
          if (data.popover_suggestion) {
            this.log('Reason:', data.popover_suggestion.reasons || 'No reasons provided');
          }
        }
      } catch (error) {
        this.log('❌ Error checking for popover:', error);
        this.log('Error details:', error.message, error.stack);
      }
    }

    showPopover(popover, suggestion) {
      // Don't show popover if chat is open
      if (this.isChatOpen()) {
        this.log('Popover not shown - chat is currently open');
        return;
      }

      // Apply delay if configured
      const delay = popover.delay_seconds * 1000;
      
      setTimeout(() => {
        // Check again after delay in case chat was opened while waiting
        if (this.isChatOpen()) {
          this.log('Popover cancelled - chat opened during delay');
          return;
        }

          this.renderPopover(popover, suggestion);
          this.popoverState.currentPopover = popover;
          this.popoverState.shown.add(popover.id);
          this.popoverState.count++;
          
          // Track view
          this.trackPopoverInteraction(popover.id, 'view');
          
          // Auto dismiss if configured
          if (popover.auto_dismiss_seconds) {
            setTimeout(() => {
              this.hidePopover();
            }, popover.auto_dismiss_seconds * 1000);
          }
          
          this.log('Popover displayed:', popover.title);
      }, delay);
    }

    isChatOpen() {
      // Check if TharwahChat widget is open
      const chatWindow = document.getElementById('tharwah-chat-window');
      return chatWindow && chatWindow.classList.contains('active');
    }

    renderPopover(popover, suggestion) {
      // Create popover container
      const container = document.createElement('div');
      container.id = 'tharwah-chat-popover';
      container.className = 'tharwah-popover';
      container.dataset.popoverId = popover.id;
      
      // Build modern horizontal popover HTML
      container.innerHTML = `
        <div class="tharwah-popover-card">
          <!-- Close button -->
          <button class="tharwah-popover-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          
          <!-- Horizontal Content Layout -->
          <div class="tharwah-popover-horizontal">
            <!-- Icon on Left -->
            <div class="tharwah-popover-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                <circle cx="12" cy="8" r="6"></circle>
              </svg>
            </div>
            
            <!-- Text Content on Right -->
            <div class="tharwah-popover-text-content">
              <p class="tharwah-popover-description">${popover.content}</p>
              <button class="tharwah-popover-cta">Start Chat</button>
            </div>
          </div>
        </div>
      `;
      
      // Inject styles if not already present
      if (!document.getElementById('tharwah-chat-popover-styles')) {
        this.injectPopoverStyles();
      }
      
      // Apply custom CSS if provided
      if (popover.custom_css) {
        const style = document.createElement('style');
        style.textContent = popover.custom_css;
        container.appendChild(style);
      }
      
      // Add to page
      document.body.appendChild(container);
      
      // Animate in
      setTimeout(() => container.classList.add('tharwah-popover-visible'), 10);
      
      // Event listeners
      const closeBtn = container.querySelector('.tharwah-popover-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.trackPopoverInteraction(popover.id, 'dismiss');
          this.hidePopover();
        });
      }
      
      // Handle "Start chat" button
      const ctaBtn = container.querySelector('.tharwah-popover-cta');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
          this.trackPopoverInteraction(popover.id, 'click');
          this.hidePopover();
          
          // Open chat widget if available
          if (window.tharwahChatWidget && typeof window.tharwahChatWidget.open === 'function') {
            window.tharwahChatWidget.open();
            this.log('Opened chat widget from popover');
          } else if (window.tharwahChat && typeof window.tharwahChat.open === 'function') {
            window.tharwahChat.open();
            this.log('Opened chat widget from popover');
          } else {
            this.log('Warning: TharwahChat widget not found. Make sure to load TharwahChat-V1.js before popovers appear.');
          }
        });
      }
      
      // Track other button clicks
      container.addEventListener('click', (e) => {
        if ((e.target.tagName === 'A' || e.target.tagName === 'BUTTON') && 
            !e.target.classList.contains('tharwah-popover-close') &&
            !e.target.classList.contains('tharwah-popover-action')) {
          this.trackPopoverInteraction(popover.id, 'click');
        }
      });
    }

    hidePopover() {
      const popover = document.getElementById('tharwah-chat-popover');
      if (popover) {
        popover.classList.remove('tharwah-popover-visible');
        setTimeout(() => {
          popover.remove();
          this.popoverState.currentPopover = null;
        }, 300);
      }
    }

    trackPopoverInteraction(popoverId, action) {
      if (!this.config.apiEndpoint || !this.config.popoverApiKey) return;
      
      try {
        // Construct popover endpoint: http://localhost:8000/api/track/ -> http://localhost:8000/api/popover-interaction/
        const baseUrl = this.config.apiEndpoint.replace(/\/track\/?$/, '');
        const apiEndpoint = baseUrl + '/popover-interaction/';
        
        fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.popoverApiKey}`
          },
          body: JSON.stringify({
            popover_id: popoverId,
            action: action,
            session_id: this.sessionId,
            url: window.location.href
          })
        });
        
        this.log('Popover interaction tracked:', action, popoverId);
      } catch (error) {
        this.log('Error tracking popover interaction:', error);
      }
    }

    injectPopoverStyles() {
      const styles = document.createElement('style');
      styles.id = 'tharwah-chat-popover-styles';
      styles.textContent = `
        /* Popover Container */
        .tharwah-popover {
          position: fixed !important;
          bottom: 100px !important;
          right: 30px !important;
          z-index: 999998 !important;
          max-width: 380px !important;
          width: auto !important;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        
        .tharwah-popover-visible {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }
        
        /* Popover Card */
        .tharwah-popover-card {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          border: 0 !important;
          position: relative !important;
        }
        
        /* Close Button */
        .tharwah-popover-close {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          background: transparent !important;
          border: none !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          color: #9ca3af !important;
          z-index: 10 !important;
          padding: 0 !important;
        }
        
        .tharwah-popover-close:hover {
          color: #6b7280 !important;
        }
        
        .tharwah-popover-close svg {
          width: 16px !important;
          height: 16px !important;
        }
        
        /* Horizontal Content Layout */
        .tharwah-popover-horizontal {
          padding: 16px !important;
          padding-right: 40px !important;
          display: flex !important;
          align-items: flex-start !important;
          gap: 12px !important;
        }
        
        /* Icon Wrapper - Green color scheme */
        .tharwah-popover-icon-wrapper {
          width: 32px !important;
          height: 32px !important;
          background: #d1fae5 !important;
          color: #059669 !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
        }
        
        .tharwah-popover-icon-wrapper svg {
          width: 16px !important;
          height: 16px !important;
          stroke: #059669 !important;
        }
        
        /* Text Content */
        .tharwah-popover-text-content {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        
        .tharwah-popover-title {
          margin: 0 !important;
          margin-bottom: 4px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #111827 !important;
          line-height: 1.3 !important;
        }
        
        .tharwah-popover-description {
          margin: 0 !important;
          margin-bottom: 12px !important;
          font-size: 12px !important;
          line-height: 1.5 !important;
          color: #6b7280 !important;
        }
        
        /* CTA Button - Green color scheme */
        .tharwah-popover-cta {
          width: 100% !important;
          padding: 8px 12px !important;
          background: #059669 !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          text-align: center !important;
          height: 32px !important;
        }
        
        .tharwah-popover-cta:hover {
          background: #047857 !important;
        }
        
        .tharwah-popover-cta:active {
          transform: scale(0.98) !important;
        }
        
        /* Positioning - Above chat button */
        .tharwah-popover-bottom,
        .tharwah-popover-bottom-end {
          bottom: 90px;
          right: 20px;
        }
        
        .tharwah-popover-top,
        .tharwah-popover-top-end {
          top: 20px;
          right: 20px;
        }
        
        .tharwah-popover-bottom-start {
          bottom: 90px;
          left: 20px;
        }
        
        .tharwah-popover-top-start {
          top: 20px;
          left: 20px;
        }
        
        .tharwah-popover-left {
          top: 50%;
          left: 20px;
          transform: translateY(-50%);
        }
        
        .tharwah-popover-right {
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
        }
        
        .tharwah-popover-content {
          display: flex;
          padding: 20px;
          gap: 12px;
          position: relative;
        }
        
        .tharwah-popover-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .tharwah-popover-body {
          flex: 1;
        }
        
        .tharwah-popover-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
        }
        
        .tharwah-popover-text {
          margin: 0 0 16px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #6b7280;
        }
        
        .tharwah-popover-action {
          width: 100%;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .tharwah-popover-action:hover {
          background: #1d4ed8;
        }
        
        .tharwah-popover-action:active {
          transform: scale(0.98);
        }
        
        .tharwah-popover-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .tharwah-popover-close:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        /* Color schemes */
        .tharwah-popover-default {
          border-left: 4px solid #667eea;
        }
        
        .tharwah-popover-info {
          border-left: 4px solid #4299e1;
        }
        
        .tharwah-popover-success {
          border-left: 4px solid #48bb78;
        }
        
        .tharwah-popover-warning {
          border-left: 4px solid #ed8936;
        }
        
        .tharwah-popover-error {
          border-left: 4px solid #f56565;
        }
        
        /* MOBILE PORTRAIT - UPDATED FOR BETTER UX */
        @media (max-width: 640px) {
          .tharwah-popover {
            /* Full width with proper margins */
            bottom: 90px !important;
            left: 12px !important;
            right: 12px !important;
            max-width: none !important;
            width: calc(100% - 24px) !important;
            
            /* iPhone X+ notch support */
            bottom: max(90px, calc(80px + env(safe-area-inset-bottom))) !important;
            left: max(12px, env(safe-area-inset-left)) !important;
            right: max(12px, env(safe-area-inset-right)) !important;
            
            /* Mobile animation */
            transform: translateY(30px) !important;
          }
          
          .tharwah-popover-visible {
            transform: translateY(0) !important;
          }
          
          .tharwah-popover-card {
            border-radius: 16px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
          }
          
          /* Horizontal layout with more padding */
          .tharwah-popover-horizontal {
            padding: 20px !important;
            padding-right: 52px !important;
            gap: 14px !important;
          }
          
          /* Larger icon on mobile */
          .tharwah-popover-icon-wrapper {
            width: 44px !important;
            height: 44px !important;
            border-radius: 12px !important;
          }
          
          .tharwah-popover-icon-wrapper svg {
            width: 24px !important;
            height: 24px !important;
          }
          
          /* Larger, readable text */
          .tharwah-popover-description {
            font-size: 15px !important;
            line-height: 1.6 !important;
            color: #1f2937 !important;
            margin-bottom: 12px !important;
          }
          
          /* Touch-friendly button (48px minimum) */
          .tharwah-popover-cta {
            padding: 14px 20px !important;
            font-size: 15px !important;
            min-height: 48px !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
          }
          
          /* Larger close button for easier tapping */
          .tharwah-popover-close {
            width: 40px !important;
            height: 40px !important;
            top: 10px !important;
            right: 10px !important;
            background: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }
          
          .tharwah-popover-close svg {
            width: 20px !important;
            height: 20px !important;
          }
        }
        
        /* ========================================
           MOBILE RESPONSIVE STYLES
           ======================================== */
        
        /* Tablets and small laptops */
        @media (max-width: 1024px) {
          .tharwah-popover {
            max-width: 340px !important;
            right: 20px !important;
          }
        }
        
        /* ========================================
           ULTRA-COMPACT MOBILE DESIGN
           Minimal & Space-Efficient
           ======================================== */
        @media (max-width: 768px) {
          /* Floating Card Container - Ultra Compact */
          .tharwah-popover {
            bottom: 16px !important;
            left: 12px !important;
            right: 12px !important;
            max-width: none !important;
            width: auto !important;
            opacity: 0;
            transform: translateY(12px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          
          .tharwah-popover-visible {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
          }
          
          /* Card Styling - Minimal Shadow */
          .tharwah-popover-card {
            border-radius: 12px !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
            background: white !important;
          }
          
          /* Close Button - Tiny */
          .tharwah-popover-close {
            width: 24px !important;
            height: 24px !important;
            top: 6px !important;
            right: 6px !important;
            background: rgba(0, 0, 0, 0.04) !important;
            border-radius: 50% !important;
          }
          
          .tharwah-popover-close:hover {
            background: rgba(0, 0, 0, 0.08) !important;
          }
          
          .tharwah-popover-close svg {
            width: 12px !important;
            height: 12px !important;
          }
          
          /* Content Layout - Horizontal & Ultra Compact */
          .tharwah-popover-horizontal {
            padding: 10px 12px !important;
            padding-right: 34px !important;
            gap: 8px !important;
            flex-direction: row !important;
            align-items: center !important;
          }
          
          /* Icon - Tiny, Left Side */
          .tharwah-popover-icon-wrapper {
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
            margin: 0 !important;
            box-shadow: none !important;
            flex-shrink: 0 !important;
          }
          
          .tharwah-popover-icon-wrapper svg {
            width: 16px !important;
            height: 16px !important;
          }
          
          /* Text Content - Minimal Spacing */
          .tharwah-popover-text-content {
            flex: 1 !important;
            text-align: left !important;
          }
          
          .tharwah-popover-title {
            font-size: 13px !important;
            font-weight: 600 !important;
            margin-bottom: 2px !important;
            color: #111827 !important;
            line-height: 1.2 !important;
          }
          
          .tharwah-popover-description {
            font-size: 11px !important;
            line-height: 1.3 !important;
            margin-bottom: 8px !important;
            color: #6b7280 !important;
          }
          
          /* CTA Button - Ultra Compact */
          .tharwah-popover-cta {
            width: 100% !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            height: 32px !important;
            min-height: 32px !important;
            border-radius: 8px !important;
            background: #059669 !important;
            transition: all 0.2s !important;
          }
          
          .tharwah-popover-cta:hover {
            background: #047857 !important;
            transform: translateY(-1px) !important;
          }
          
          .tharwah-popover-cta:active {
            transform: translateY(0) !important;
          }
        }
        

        
        /* LANDSCAPE MODE (short screens) */
        @media (max-height: 500px) {
          .tharwah-popover {
            bottom: 60px !important;
            max-width: 360px !important;
          }
          
          .tharwah-popover-horizontal {
            padding: 14px !important;
            padding-right: 48px !important;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // ============================================
  // GLOBAL EXPOSURE
  // ============================================

  // UMD pattern
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalTracker;
  }

  window.UniversalTracker = UniversalTracker;

  // Auto-initialize if config is present
  if (window.trackerConfig) {
    window.tracker = new UniversalTracker(window.trackerConfig).init();
  }

})(window);