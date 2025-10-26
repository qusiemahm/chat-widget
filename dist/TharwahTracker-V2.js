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
        popoverCheckInterval: config.popoverCheckInterval || 30000, // 30 seconds
        popoverMinDelay: config.popoverMinDelay || 10000, // Wait 10s before first check
        popoverMaxPerSession: config.popoverMaxPerSession || 3
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
      // Wait before first check (give user time to interact)
      setTimeout(() => {
        this.checkForPopover();
        
        // Set up periodic checks
        this.popoverState.checkTimer = setInterval(() => {
          this.checkForPopover();
        }, this.config.popoverCheckInterval);
        
        this.log('Popover system started');
      }, this.config.popoverMinDelay);
    }

    async checkForPopover() {
      // Don't check if max popovers reached
      if (this.popoverState.count >= this.config.popoverMaxPerSession) {
        this.log('Max popovers reached for session');
        return;
      }

      // Don't check if a popover is currently shown
      if (this.popoverState.currentPopover) {
        this.log('Popover already displayed');
        return;
      }

      try {
        // Construct popover endpoint: http://localhost:8000/api/track/ -> http://localhost:8000/api/suggest-popover/
        const baseUrl = this.config.apiEndpoint.replace(/\/track\/?$/, '');
        const apiEndpoint = baseUrl + '/suggest-popover/';
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.popoverApiKey}`
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            current_page: window.location.pathname
          })
        });

        const data = await response.json();
        
        if (data.success && data.popover_suggestion && data.popover_suggestion.suggested) {
          const popover = data.popover_suggestion.popover;
          
          // Check if already shown this session
          if (this.popoverState.shown.has(popover.id)) {
            if (popover.show_once_per_session) {
              this.log('Popover already shown this session:', popover.id);
              return;
            }
          }
          
          // Show the popover
          this.showPopover(popover, data.popover_suggestion);
          
          this.log('Popover suggested:', popover.title, 'Score:', data.popover_suggestion.score);
        }
      } catch (error) {
        this.log('Error checking for popover:', error);
      }
    }

    showPopover(popover, suggestion) {
      // Apply delay if configured
      const delay = popover.delay_seconds * 1000;
      
      setTimeout(() => {
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

    renderPopover(popover, suggestion) {
      // Create popover container
      const container = document.createElement('div');
      container.id = 'tharwah-popover';
      container.className = 'tharwah-popover';
      container.dataset.popoverId = popover.id;
      
      // Build modern card-based popover HTML
      container.innerHTML = `
        <div class="tharwah-popover-card">
          <!-- Close button -->
          <button class="tharwah-popover-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          
          <!-- Content -->
          <div class="tharwah-popover-content-modern">
            <!-- Icon -->
            <div class="tharwah-popover-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            
            <!-- Text Content -->
            <div class="tharwah-popover-text-content">
              <h3 class="tharwah-popover-title-modern">${this.escapeHtml(popover.title)}</h3>
              <p class="tharwah-popover-description">${popover.content}</p>
              <button class="tharwah-popover-cta">Start chat</button>
            </div>
          </div>
        </div>
      `;
      
      // Inject styles if not already present
      if (!document.getElementById('tharwah-popover-styles')) {
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
      const popover = document.getElementById('tharwah-popover');
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
      styles.id = 'tharwah-popover-styles';
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
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
          overflow: hidden !important;
          position: relative !important;
          border-left: 4px solid #667eea !important;
        }
        
        /* Close Button */
        .tharwah-popover-close {
          position: absolute !important;
          top: 16px !important;
          right: 16px !important;
          background: rgba(0, 0, 0, 0.05) !important;
          border: none !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          color: #6b7280 !important;
          z-index: 10 !important;
          padding: 0 !important;
        }
        
        .tharwah-popover-close:hover {
          background: rgba(0, 0, 0, 0.1) !important;
          color: #374151 !important;
          transform: scale(1.1) !important;
        }
        
        .tharwah-popover-close svg {
          width: 14px !important;
          height: 14px !important;
        }
        
        /* Content Area */
        .tharwah-popover-content-modern {
          padding: 24px !important;
          padding-right: 50px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }
        
        /* Icon Wrapper */
        .tharwah-popover-icon-wrapper {
          width: 40px !important;
          height: 40px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
        }
        
        .tharwah-popover-icon-wrapper svg {
          width: 20px !important;
          height: 20px !important;
          color: white !important;
          stroke: white !important;
        }
        
        /* Text Content */
        .tharwah-popover-text-content {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
        
        .tharwah-popover-title-modern {
          margin: 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #1a202c !important;
          line-height: 1.4 !important;
        }
        
        .tharwah-popover-description {
          margin: 0 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #6b7280 !important;
        }
        
        /* CTA Button */
        .tharwah-popover-cta {
          width: 100% !important;
          padding: 12px 24px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 10px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.3s !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
          text-align: center !important;
        }
        
        .tharwah-popover-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
        }
        
        .tharwah-popover-cta:active {
          transform: translateY(0) !important;
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
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .tharwah-popover {
            bottom: 80px !important;
            right: 15px !important;
            left: 15px !important;
            max-width: none !important;
          }
          
          .tharwah-popover-content-modern {
            padding: 20px !important;
            padding-right: 45px !important;
          }
          
          .tharwah-popover-icon-wrapper {
            width: 36px !important;
            height: 36px !important;
          }
          
          .tharwah-popover-title-modern {
            font-size: 16px !important;
          }
          
          .tharwah-popover-description {
            font-size: 13px !important;
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