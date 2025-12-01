import React, { useState, useEffect } from 'react';
import {
  AssistantModal,
  Thread,
  ThreadMessage,
  Composer,

  // Import any additional components from Assistant UI
  Avatar,
  TooltipProvider
} from '@assistant-ui/react';
import './tharwah-assistant-ui-styles.css';

/**
 * TharwahChat-styled Assistant UI Modal
 *
 * This component applies the exact TharwahChat widget styling
 * to the Assistant UI Modal component.
 *
 * Features:
 * ✅ TharwahChat blue gradient theme
 * ✅ Smooth animations (bounce, slideIn)
 * ✅ Mobile responsive design
 * ✅ RTL support for Arabic
 * ✅ Professional shadows and depth
 * ✅ Touch-optimized for mobile
 * ✅ Accessibility improvements
 */
const TharwahAssistantModal = ({
  // Configuration options (matching TharwahChat)
  position = 'bottom-right',
  title = 'Chat with us',
  subtitle = 'We reply instantly',
  buttonIcon = '💬',
  primaryColor = '#007bff',
  secondaryColor = '#0056b3',

  // Assistant UI props
  onSend,
  messages,
  isTyping,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Detect RTL text direction for Arabic messages
  const detectRTL = (text) => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlRegex.test(text);
  };

  // Add data attributes for CSS targeting
  useEffect(() => {
    // Add data attributes to elements for CSS targeting
    const modal = document.querySelector('[data-aui="modal-root"]');
    const trigger = document.querySelector('[data-aui="modal-trigger"]');
    const header = document.querySelector('[data-aui="modal-header"]');
    const headerClose = document.querySelector('[data-aui="modal-header-close"]');
    const messagesContainer = document.querySelector('[data-aui="messages-container"]');
    const composerRoot = document.querySelector('[data-aui="composer-root"]');
    const composerInput = document.querySelector('[data-aui="composer-input"]');
    const composerSend = document.querySelector('[data-aui="composer-send"]');

    // Set data attributes for CSS targeting
    if (modal) {
      modal.setAttribute('data-aui', 'modal-root');
      modal.setAttribute('data-open', isOpen);
    }
    if (trigger) {
      trigger.setAttribute('data-aui', 'modal-trigger');
      trigger.setAttribute('data-open', isOpen);
      // Update position classes based on prop
      if (position.includes('left')) {
        trigger.style.right = 'auto';
        trigger.style.left = '24px';
      }
    }
    if (header) header.setAttribute('data-aui', 'modal-header');
    if (headerClose) headerClose.setAttribute('data-aui', 'modal-header-close');
    if (messagesContainer) messagesContainer.setAttribute('data-aui', 'messages-container');
    if (composerRoot) composerRoot.setAttribute('data-aui', 'composer-root');
    if (composerInput) composerInput.setAttribute('data-aui', 'composer-input');
    if (composerSend) {
      composerSend.setAttribute('data-aui', 'composer-send');
    }

    // Add data attributes to messages
    const messageElements = document.querySelectorAll('[data-aui="message"]');
    messageElements.forEach(el => {
      const content = el.textContent || '';
      if (detectRTL(content)) {
        el.setAttribute('data-rtl', 'true');
      }
    });

  }, [isOpen, messages, position]);

  // Custom message component with RTL support
  const CustomThreadMessage = ({ message, ...rest }) => {
    const isRTL = detectRTL(message.content || '');

    return (
      <ThreadMessage
        {...rest}
        data-aui="message"
        data-role={message.role}
        data-rtl={isRTL}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      />
    );
  };

  // Custom send button with TharwahChat styling
  const CustomSendButton = ({ ...props }) => (
    <button
      {...props}
      data-aui="composer-send"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
        <path d="m21.854 2.147-10.94 10.939"></path>
      </svg>
    </button>
  );

  return (
    <TooltipProvider>
      <div className="tharwah-assistant-modal-wrapper">
        {/* Override CSS variables for dynamic theming */}
        <style jsx global>{`
          :root {
            --tharwah-primary: ${primaryColor};
            --tharwah-secondary: ${secondaryColor};
          }
        `}</style>

        {/* Main Assistant Modal with TharwahChat styling */}
        <AssistantModal
          open={isOpen}
          onOpenChange={setIsOpen}
          {...props}
        >
          {/* Modal Trigger - Floating Chat Button */}
          <AssistantModal.Trigger
            data-aui="modal-trigger"
            data-open={isOpen}
            className="tharwah-modal-trigger"
            aria-label="Open chat"
          >
            {isOpen ? (
              // Close icon when open
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              // Chat icon when closed
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <path d="M65.1,12.1H54.3V3.4h-8.6v8.6H34.9C17,12.1,2.5,26.2,2.5,43.7c0,17.4,14.5,31.6,32.4,31.6H37v-8.6h-2.2c-13.1,0-23.8-10.3-23.8-22.9c0-12.7,10.7-22.9,23.8-22.9h30.2c13.1,0,23.8,10.3,23.8,22.9c0,12.7-10.7,22.9-23.8,22.9H52.7L37,80.3v11.5l18.9-16.5h9.2c17.9,0,32.4-14.2,32.4-31.6C97.5,26.2,83,12.1,65.1,12.1z"/>
                <circle cx="34.9" cy="44.5" r="6.5"/>
                <circle cx="65.1" cy="44.5" r="6.5"/>
              </svg>
            )}
          </AssistantModal.Trigger>

          {/* Modal Content */}
          <AssistantModal.Content
            data-aui="modal-root"
            data-open={isOpen}
            className="tharwah-modal-content"
          >
            {/* Modal Header */}
            <AssistantModal.Header
              data-aui="modal-header"
              className="tharwah-modal-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <h2>{title}</h2>
              </div>
              <AssistantModal.Close
                data-aui="modal-header-close"
                className="tharwah-modal-close"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </AssistantModal.Close>
            </AssistantModal.Header>

            {/* Messages Container */}
            <div data-aui="messages-container" className="tharwah-messages-container">
              <Thread>
                {messages?.map((message, index) => (
                  <CustomThreadMessage
                    key={message.id || index}
                    message={message}
                    data-aui="message"
                    data-role={message.role}
                  />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div data-aui="typing-indicator" className="tharwah-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </Thread>
            </div>

            {/* Input Area */}
            <div data-aui="composer-root" className="tharwah-composer-root">
              <Composer
                data-aui="composer-root"
                onSend={onSend}
              >
                <Composer.Input
                  data-aui="composer-input"
                  placeholder="Type your message..."
                  className="tharwah-composer-input"
                />
                <Composer.Send as={CustomSendButton} />
              </Composer>
            </div>
          </AssistantModal.Content>
        </AssistantModal>
      </div>
    </TooltipProvider>
  );
};

export default TharwahAssistantModal;

/**
 * USAGE EXAMPLE:
 *
 * import TharwahAssistantModal from './TharwahAssistantModal';
 *
 * function App() {
 *   const [messages, setMessages] = useState([
 *     { role: 'assistant', content: 'Hi! How can I help you today?' }
 *   ]);
 *   const [isTyping, setIsTyping] = useState(false);
 *
 *   const handleSend = async (message) => {
 *     setMessages(prev => [...prev, { role: 'user', content: message }]);
 *     setIsTyping(true);
 *
 *     // Simulate API call
 *     setTimeout(() => {
 *       setMessages(prev => [...prev, {
 *         role: 'assistant',
 *         content: 'Thanks for your message! This is a response.'
 *       }]);
 *       setIsTyping(false);
 *     }, 1000);
 *   };
 *
 *   return (
 *     <div>
 *       <h1>My Website</h1>
 *       <TharwahAssistantModal
 *         title="Tharwah Support"
 *         messages={messages}
 *         isTyping={isTyping}
 *         onSend={handleSend}
 *       />
 *     </div>
 *   );
 * }
 */