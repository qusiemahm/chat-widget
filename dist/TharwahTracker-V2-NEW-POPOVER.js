// This file contains the updated popover design code
// Copy these functions into TharwahTracker-V2.js

// Replace the renderPopover function (line ~1093-1172) with this:
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
            ${popover.icon || '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'}
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
        this.log('Warning: TharwahChat widget not found');
      }
    });
  }
}

// Replace the injectPopoverStyles function (line ~1213-1373) with this:
injectPopoverStyles() {
  const styles = document.createElement('style');
  styles.id = 'tharwah-popover-styles';
  styles.textContent = `
    /* Modern popover container */
    .tharwah-popover {
      position: fixed;
      bottom: 6rem;
      right: 1.5rem;
      z-index: 40;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .tharwah-popover-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    /* Modern card design */
    .tharwah-popover-card {
      position: relative;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1rem;
      max-width: 320px;
      transition: all 0.3s;
    }
    
    .tharwah-popover-card:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
    
    /* Close button - top right */
    .tharwah-popover-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      width: 24px;
      height: 24px;
      z-index: 10;
    }
    
    .tharwah-popover-close:hover {
      color: #4b5563;
      background: #f3f4f6;
    }
    
    /* Content layout */
    .tharwah-popover-content-modern {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    /* Icon wrapper - blue rounded box */
    .tharwah-popover-icon-wrapper {
      flex-shrink: 0;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background: #dbeafe;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }
    
    .tharwah-popover-icon-wrapper svg {
      width: 16px;
      height: 16px;
    }
    
    /* Text content */
    .tharwah-popover-text-content {
      flex: 1;
      min-width: 0;
    }
    
    /* Title */
    .tharwah-popover-title-modern {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.25rem 0;
      line-height: 1.25;
    }
    
    /* Description */
    .tharwah-popover-description {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0 0 0.75rem 0;
      line-height: 1.5;
    }
    
    /* CTA Button - "Start chat" */
    .tharwah-popover-cta {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .tharwah-popover-cta:hover {
      background: #1d4ed8;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    
    .tharwah-popover-cta:active {
      transform: scale(0.98);
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .tharwah-popover {
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
      
      .tharwah-popover-card {
        max-width: none;
      }
    }
    
    /* Animation variants */
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
    
    .tharwah-popover-visible {
      animation: slideInUp 0.3s ease-out;
    }
  `;
  
  document.head.appendChild(styles);
}
