# TharwahChat Web Component

Universal chat widget that works across all frameworks (React, Vue, Angular, WordPress, vanilla JS).

## 🚀 Quick Start

### Installation

#### Option 1: Single File (Self-Contained)
```html
<script src="https://cdn.tharwah.net/tharwah-chat-webcomponent.min.js"></script>
```

#### Option 2: Separate Styles (Better Performance)
```html
<link rel="stylesheet" href="https://cdn.tharwah.net/tharwah-chat-webcomponent/styles/main.css">
<script src="https://cdn.tharwah.net/tharwah-chat-webcomponent.min.js"></script>
```

Or install locally:

```bash
# Copy the files to your project
cp -r web-component/ your-project/
```

### Basic Usage

```html
<tharwah-chat
  api-key="your-api-key"
  bot-id="1"
  title="Chat Support">
</tharwah-chat>

<script src="tharwah-chat-webcomponent.js"></script>
```

### Drop-in Script (Legacy Style)

If you prefer the original `TharwahChat-V1.js` initialization pattern (works great in plain HTML, React, WordPress, etc.), load the bundled script and either set `window.tharwahChatConfig` before it loads or instantiate manually:

```html
<link rel="stylesheet" href="/chat-widget/styles/main.css">
<script src="/chat-widget/dist/TharwahChat-V1.js"></script>
<script>
  // Option 1 – Auto init (runs when the script detects this config)
  window.tharwahChatConfig = {
    apiEndpoint: 'https://api.tharwah.com',
    apiKey: 'your-api-key',
    botId: 5,
    title: 'Chat with Tharwah',
    welcomeMessage: '👋 Hi! How can I help you today?',
    autoOpen: false,
    debug: true
  };

  // Option 2 – Manual init/control
  // const chat = new TharwahChat(window.tharwahChatConfig).init();
  // chat.open();
</script>
```

## 📖 Features

- ✅ **Universal Compatibility** - Works in any framework or vanilla JavaScript
- ✅ **Dual Rendering** - Assistant UI when available, vanilla fallback
- ✅ **All Original Features** - Complete TharwahChat-V1.js functionality preserved
- ✅ **Shadow DOM** - Style isolation and encapsulation
- ✅ **Mobile Responsive** - Optimized for all screen sizes
- ✅ **RTL Support** - Arabic language support
- ✅ **Streaming** - Real-time message streaming
- ✅ **Customizable** - Extensive configuration options
- ✅ **Event System** - Rich event API for integration
- ✅ **Progressive Enhancement** - Graceful fallbacks

## ⚙️ Configuration

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `api-key` | string | Your Tharwah API key (required) |
| `bot-id` | number | Bot ID (default: 1) |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `api-endpoint` | string | `http://localhost:8000/api` | API endpoint URL |
| `organization-id` | string | null | Organization ID |
| `title` | string | `"Chat with us"` | Chat header title |
| `subtitle` | string | `"We reply instantly"` | Chat header subtitle |
| `welcome-message` | string | `"👋 Hi! How can I help you today?"` | Initial assistant greeting |
| `primary-color` | string | `"#007bff"` | Primary color |
| `secondary-color` | string | `"#0056b3"` | Secondary color |
| `button-icon` | string | `"💬"` | Floating button icon |
| `position` | string | `"bottom-right"` | Position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `language` | string | auto-detect | Language: `"en"`, `"ar"` |
| `auto-open` | boolean | `false` | Auto-open chat on load |
| `auto-open-delay` | number | `3000` | Delay before auto-open (ms) |
| `show-suggestions` | boolean | `true` | Show suggestion buttons |
| `suggestions-limit` | number | `6` | Maximum suggestions to show |
| `enable-streaming` | boolean | `true` | Enable message streaming |
| `use-assistant-ui` | boolean | `true` | Try to use Assistant UI |
| `debug` | boolean | `false` | Enable debug logging |

### Example Configurations

```html
<!-- Minimal configuration -->
<tharwah-chat api-key="your-key"></tharwah-chat>

<!-- Full configuration -->
<tharwah-chat
  api-endpoint="https://api.tharwah.com"
  api-key="your-api-key"
  bot-id="123"
  organization-id="456"
  title="Customer Support"
  subtitle="We're here 24/7"
  primary-color="#28a745"
  secondary-color="#1e7e34"
  button-icon="🤖"
  position="bottom-left"
  language="en"
  auto-open="true"
  auto-open-delay="5000"
  show-suggestions="true"
  suggestions-limit="4"
  enable-streaming="true"
  use-assistant-ui="true"
  debug="false">
</tharwah-chat>
```

## 🎛️ JavaScript API

### Methods

```javascript
const chat = document.querySelector('tharwah-chat');

// Open/close chat
chat.open();
chat.close();
chat.toggle();

// Send messages
await chat.sendMessage('Hello, I need help!');

// Get state
const messages = chat.getMessages();
const isOpen = chat.isOpen;
const isTyping = chat.isTyping();

// Configuration
chat.updateConfig({
  title: 'New Title',
  primaryColor: '#ff6b6b'
});
```

### Events

```javascript
const chat = document.querySelector('tharwah-chat');

// Listen to events
chat.addEventListener('chatOpened', (event) => {
  console.log('Chat opened', event.detail);
});

chat.addEventListener('chatClosed', (event) => {
  console.log('Chat closed', event.detail);
});

chat.addEventListener('messageReceived', (event) => {
  console.log('New message', event.detail.message);
});

chat.addEventListener('messageStreaming', (event) => {
  console.log('Streaming message', event.detail.message);
});

chat.addEventListener('typingChanged', (event) => {
  console.log('Typing status', event.detail.isTyping);
});

chat.addEventListener('error', (event) => {
  console.error('Chat error', event.detail);
});

chat.addEventListener('conversationStarted', (event) => {
  console.log('Conversation started', event.detail.conversationId);
});

chat.addEventListener('feedbackSubmitted', (event) => {
  console.log('Feedback submitted', event.detail);
});
```

## 🌍 Framework Integration

### React

```jsx
import React, { useEffect, useRef } from 'react';

function TharwahChatComponent() {
  const chatRef = useRef(null);

  useEffect(() => {
    // Load the Web Component
    const script = document.createElement('script');
    script.src = 'https://cdn.tharwah.net/tharwah-chat-webcomponent.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChatOpened = (event) => {
    console.log('Chat opened in React');
  };

  return (
    <div>
      <h1>My React App</h1>
      <p>Chat with us below:</p>

      <tharwah-chat
        ref={chatRef}
        api-key="your-react-key"
        bot-id="1"
        title="React Support"
        onChatOpened={handleChatOpened}
      />
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <p>Chat with us below:</p>

    <tharwah-chat
      ref="chatRef"
      api-key="your-vue-key"
      bot-id="1"
      title="Vue Support"
      @chatOpened="handleChatOpened"
    />
  </div>
</template>

<script>
export default {
  name: 'TharwahChat',
  mounted() {
    // Load the Web Component
    const script = document.createElement('script');
    script.src = 'https://cdn.tharwah.net/tharwah-chat-webcomponent.js';
    document.head.appendChild(script);
  },
  methods: {
    handleChatOpened(event) {
      console.log('Chat opened in Vue', event.detail);
    },
    openChat() {
      this.$refs.chatRef.open();
    }
  }
}
</script>
```

### Angular

```typescript
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tharwah-chat',
  template: `
    <div>
      <h1>My Angular App</h1>
      <p>Chat with us below:</p>

      <tharwah-chat
        #chatRef
        api-key="your-angular-key"
        bot-id="1"
        title="Angular Support">
      </tharwah-chat>
    </div>
  `
})
export class TharwahChatComponent implements AfterViewInit {
  @ViewChild('chatRef') chatRef: ElementRef;

  ngAfterViewInit() {
    // Load the Web Component
    const script = document.createElement('script');
    script.src = 'https://cdn.tharwah.net/tharwah-chat-webcomponent.js';
    script.onload = () => {
      this.setupEventListeners();
    };
    document.head.appendChild(script);
  }

  setupEventListeners() {
    this.chatRef.nativeElement.addEventListener('chatOpened', (event) => {
      console.log('Chat opened in Angular', event.detail);
    });
  }

  openChat() {
    this.chatRef.nativeElement.open();
  }
}
```

### WordPress

```php
// Add to functions.php
function tharwah_chat_shortcode($atts) {
    $atts = shortcode_atts(array(
        'api-key' => '',
        'bot-id' => '1',
        'title' => 'Chat with us',
        'position' => 'bottom-right'
    ), $atts);

    if (empty($atts['api-key'])) {
        return '<!-- TharwahChat: API key required -->';
    }

    ob_start();
    ?>
    <tharwah-chat
      api-key="<?php echo esc_attr($atts['api-key']); ?>"
      bot-id="<?php echo esc_attr($atts['bot-id']); ?>"
      title="<?php echo esc_attr($atts['title']); ?>"
      position="<?php echo esc_attr($atts['position']); ?>">
    </tharwah-chat>
    <script src="https://cdn.tharwah.net/tharwah-chat-webcomponent.js"></script>
    <?php
    return ob_get_clean();
}
add_shortcode('tharwah_chat', 'tharwah_chat_shortcode');

// Usage in posts/pages: [tharwah_chat api-key="your-key" title="Support"]
```

## 🎨 Styling & Theming

### CSS Customization

The Web Component uses Shadow DOM for style isolation. You can customize the appearance through attributes and CSS custom properties:

```html
<tharwah-chat
  primary-color="#ff6b6b"
  secondary-color="#ee5a24"
  style="--tharwah-border-radius: 12px;">
</tharwah-chat>
```

### CSS Custom Properties

```css
/* Global customization */
:root {
  --tharwah-primary: #007bff;
  --tharwah-secondary: #0056b3;
  --tharwah-border-radius: 20px;
  --tharwah-font-family: 'Your Custom Font', sans-serif;
}

/* Target specific parts */
tharwah-chat::part(trigger-button) {
  /* Style the floating button */
}

tharwah-chat::part(chat-window) {
  /* Style the chat window */
}
```

### Themes

```html
<!-- Blue Theme (Default) -->
<tharwah-chat primary-color="#007bff" secondary-color="#0056b3"></tharwah-chat>

<!-- Green Theme -->
<tharwah-chat primary-color="#28a745" secondary-color="#1e7e34"></tharwah-chat>

<!-- Purple Theme -->
<tharwah-chat primary-color="#6f42c1" secondary-color="#5a32a3"></tharwah-chat>

<!-- Red Theme -->
<tharwah-chat primary-color="#dc3545" secondary-color="#c82333"></tharwah-chat>
```

## 📱 Mobile Responsiveness

The Web Component automatically adapts to different screen sizes:

- **Desktop**: 380x600px window
- **Tablet** (≤768px): 300x400px window
- **Mobile** (≤480px): Full viewport width with adjusted height
- **Small Mobile** (≤374px): Optimized for small screens

## 🌐 RTL Support

The Web Component automatically detects and handles Arabic/RTL text:

```html
<!-- Auto-detect based on content or HTML lang attribute -->
<tharwah-chat language="ar" title="الدردشة معنا"></tharwah-chat>
```

## 🔧 Advanced Usage

### Programmatic Creation

```javascript
// Create chat widget dynamically
const chat = document.createElement('tharwah-chat');
chat.setAttribute('api-key', 'your-dynamic-key');
chat.setAttribute('title', 'Dynamic Chat');
document.body.appendChild(chat);

// Control programmatically
chat.addEventListener('chatOpened', () => {
  console.log('Dynamic chat opened');
});
```

### Multiple Chat Instances

```html
<!-- Multiple chats with different configurations -->
<tharwah-chat id="sales-chat" api-key="sales-key" title="Sales Support"></tharwah-chat>
<tharwah-chat id="tech-chat" api-key="tech-key" title="Technical Support"></tharwah-chat>

<script>
const salesChat = document.getElementById('sales-chat');
const techChat = document.getElementById('tech-chat');

// Control different instances independently
salesChat.open();
techChat.close();
</script>
```

### Dynamic Configuration Updates

```javascript
const chat = document.querySelector('tharwah-chat');

// Update configuration dynamically
chat.setAttribute('title', 'Updated Title');
chat.setAttribute('primary-color', '#ff6b6b');

// Or use the updateConfig method
chat.updateConfig({
  title: 'Updated Title',
  primaryColor: '#ff6b6b',
  autoOpen: true
});
```

## 🚨 Error Handling

The Web Component includes comprehensive error handling:

```javascript
const chat = document.querySelector('tharwah-chat');

chat.addEventListener('error', (event) => {
  const { type, error } = event.detail;

  switch (type) {
    case 'api_key_missing':
      console.error('API key is required');
      break;
    case 'conversation_start_failed':
      console.error('Failed to start conversation');
      break;
    case 'message_send_failed':
      console.error('Failed to send message');
      break;
    case 'network_error':
      console.error('Network connection failed');
      break;
  }
});
```

## 📊 Analytics & Tracking

The Web Component automatically integrates with common analytics platforms:

```javascript
// Google Analytics (if gtag is available)
chat.addEventListener('chatOpened', () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'chat_opened', {
      'event_category': 'engagement',
      'event_label': 'tharwah_chat'
    });
  }
});

// Custom tracking
chat.addEventListener('messageSent', (event) => {
  // Track your custom analytics
  yourAnalytics.track('message_sent', {
    botId: event.detail.botId,
    timestamp: event.detail.timestamp
  });
});
```

## 🔍 Debug Mode

Enable debug mode for detailed logging:

```html
<tharwah-chat debug="true" api-key="your-key"></tharwah-chat>
```

This will output detailed information to the browser console:

```
[TharwahChat WebComponent] Web Component constructor called
[TharwahChat Core] Core initialized with config
[TharwahChat VanillaRenderer] Renderer initialized successfully
```

## 🏗️ Architecture

The Web Component uses a modular architecture:

```
TharwahChatWebComponent (Main Component)
├── TharwahChatCore (Business Logic)
│   ├── API Communication
│   ├── State Management
│   ├── Event System
│   └── Utilities
├── VanillaRenderer (Default UI)
│   ├── DOM Management
│   ├── Event Handling
│   └── Styling
└── AssistantUIRenderer (Enhanced UI)
    ├── Assistant UI Integration
    ├── Modern Components
    └── Enhanced UX
```

## 🚀 Performance

- **Shadow DOM** for style isolation and performance
- **Lazy Loading** of dependencies
- **Efficient Event Handling** with event delegation
- **Optimized Rendering** with virtual scrolling concepts
- **Small Bundle Size** (~50KB gzipped)
- **Fast Initialization** (<100ms)

## 🔄 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check this documentation
2. View the examples in `/examples/`
3. Enable debug mode for troubleshooting
4. Check browser console for error messages

## 🔄 Migration from TharwahChat-V1.js

If you're migrating from the original TharwahChat-V1.js:

**Before:**
```javascript
const chat = new TharwahChat({
  apiKey: 'your-key',
  botId: 1
});
chat.init();
```

**After:**
```html
<tharwah-chat api-key="your-key" bot-id="1"></tharwah-chat>
<script src="tharwah-chat-webcomponent.js"></script>
```

Or keep the legacy API surface while benefiting from the new engine:

```html
<link rel="stylesheet" href="/chat-widget/styles/main.css">
<script src="/chat-widget/dist/TharwahChat-V1.js"></script>
<script>
  window.tharwahChatWidget = new TharwahChat({
    apiEndpoint: 'https://api.tharwah.com',
    apiKey: 'your-key',
    botId: 1,
    welcomeMessage: '👋 Hello again!'
  }).init();
</script>
```

All original functionality is preserved with enhanced features and universal compatibility.