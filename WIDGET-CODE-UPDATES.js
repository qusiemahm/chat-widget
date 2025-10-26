/**
 * CODE TO ADD TO TharwahChat-V1.js
 * 
 * Replace the existing getResponse() and generateResponse() methods with these:
 */

// ============================================
// STEP 1: Update constructor to initialize conversationId
// ============================================
constructor(config = {}) {
  this.config = {
    apiEndpoint: config.apiEndpoint || 'http://localhost:8000/api',
    apiKey: config.apiKey, // REQUIRED: Organization's API key
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
    ...config
  };

  this.isOpen = false;
  this.conversationId = null; // Will be set after creating conversation
  this.messages = [];
  this.isTyping = false;
  this.isRendered = false;

  this.log('TharwahChat initialized', this.config);
  
  // Check if API key is provided
  if (!this.config.apiKey) {
    console.error('[TharwahChat] ERROR: apiKey is required in config!');
  }
}

// ============================================
// STEP 2: Add method to create/get conversation
// ============================================
async createConversation() {
  try {
    // Generate or get session ID
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

    // Store in localStorage for returning users
    localStorage.setItem('tharwah_conversation_id', this.conversationId);
    localStorage.setItem('tharwah_conversation_created', Date.now().toString());

    return data;

  } catch (error) {
    this.log('Error creating conversation:', error);
    throw error;
  }
}

// ============================================
// STEP 3: Add method to get/generate session ID
// ============================================
getSessionId() {
  // Try to get existing session ID
  let sessionId = localStorage.getItem('tharwah_session_id');
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tharwah_session_id', sessionId);
    this.log('Generated new session ID:', sessionId);
  } else {
    this.log('Using existing session ID:', sessionId);
  }
  
  return sessionId;
}

// ============================================
// STEP 4: Replace getResponse() method
// ============================================
async getResponse(userMessage) {
  try {
    // Ensure we have a conversation
    if (!this.conversationId) {
      this.log('No conversation ID, creating new conversation...');
      await this.createConversation();
    }

    // Validate API key
    if (!this.config.apiKey) {
      throw new Error('API key is not configured. Please set apiKey in widget config.');
    }

    // Call backend API with agent support
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

    // Hide typing indicator
    this.hideTyping();

    // Show assistant's response
    const botMessage = data.assistant_message.content;
    this.addMessage(botMessage, 'bot');

    // If there are products, show them
    if (data.composed_response?.products?.length > 0) {
      this.log('Showing products:', data.composed_response.products.length);
      this.showProducts(data.composed_response.products);
    }

    // If there are quick replies, show them
    if (data.composed_response?.quick_replies?.length > 0) {
      this.log('Showing quick replies:', data.composed_response.quick_replies.length);
      this.showQuickReplies(data.composed_response.quick_replies);
    }

    // Track response received
    this.trackEvent('chat_response_received', {
      agent: data.routing_info?.selected_agent?.name,
      agent_type: data.routing_info?.selected_agent?.type,
      had_products: data.composed_response?.products?.length > 0,
      had_quick_replies: data.composed_response?.quick_replies?.length > 0,
      tool_calls: data.tool_calls?.length || 0,
      tokens_used: data.assistant_message.tokens_input + data.assistant_message.tokens_output
    });

  } catch (error) {
    this.hideTyping();
    
    // Show user-friendly error message
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error.message.includes('API key')) {
      errorMessage = 'Configuration error: API key is missing. Please contact support.';
    } else if (error.message.includes('404')) {
      errorMessage = 'Service not found. Please check your configuration.';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      errorMessage = 'Authentication error. Please contact support.';
    }
    
    this.addMessage(errorMessage, 'bot');
    this.log('Error getting response:', error);
    
    // Track error
    this.trackEvent('chat_error', {
      error: error.message,
      userMessage: userMessage
    });
  }
}

// ============================================
// STEP 5: Add method to show products
// ============================================
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
  
  // Track product display
  this.trackEvent('chat_products_displayed', {
    count: products.length
  });
}

// ============================================
// STEP 6: Add method to show quick replies
// ============================================
showQuickReplies(quickReplies) {
  const repliesHtml = quickReplies.map((reply, index) => 
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

// ============================================
// STEP 7: Add method to handle quick reply clicks
// ============================================
handleQuickReply(replyText, replyId) {
  this.log('Quick reply clicked:', replyText, replyId);
  
  // Track click
  this.trackEvent('chat_quick_reply_clicked', {
    reply_id: replyId,
    reply_text: replyText
  });
  
  // Send the reply text as a message
  this.elements.input.value = replyText;
  this.sendMessage();
}

// ============================================
// STEP 8: Remove the old generateResponse() method
// ============================================
// DELETE THIS METHOD - it's no longer needed!
// The getResponse() method now calls the real API

// ============================================
// USAGE EXAMPLE IN HTML
// ============================================
/*
<script>
  window.tharwahChatConfig = {
    // Backend API
    apiEndpoint: 'http://localhost:8000/api',
    apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
    botId: 5,
    
    // UI
    title: 'Tharwah Support',
    welcomeMessage: '👋 Hi! How can I help you today?',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    
    // Debug
    debug: true
  };
</script>
<script src="./dist/TharwahChat-V1.js"></script>
*/
