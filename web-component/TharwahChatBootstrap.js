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

