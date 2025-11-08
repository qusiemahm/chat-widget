/**
 * MOBILE-RESPONSIVE POPOVER CODE
 * 
 * This file contains the updated methods to replace in TharwahTracker-V2.js
 * 
 * INSTRUCTIONS:
 * 1. Find each method in TharwahTracker-V2.js
 * 2. Replace with the version below
 * 3. Test on mobile devices
 */

// ========================================
// METHOD 1: injectPopoverStyles()
// Replace the entire method (around line 1339)
// ========================================

injectPopoverStyles() {
  const styles = document.createElement('style');
  styles.id = 'tharwah-popover-styles';
  styles.textContent = `
    /* BASE STYLES */
    .tharwah-popover {
      position: fixed !important;
      bottom: 100px !important;
      right: 30px !important;
      left: auto !important;
      z-index: 999998 !important;
      max-width: 380px !important;
      width: auto !important;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      pointer-events: none;
    }
    
    .tharwah-popover-visible {
      opacity: 1 !important;
      transform: translateY(0) scale(1) !important;
      pointer-events: auto;
    }
    
    .tharwah-popover-card {
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
      border: 0 !important;
      position: relative !important;
      overflow: hidden !important;
    }
    
    /* CLOSE BUTTON */
    .tharwah-popover-close {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      background: rgba(255, 255, 255, 0.9) !important;
      border: none !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      color: #6b7280 !important;
      z-index: 10 !important;
      padding: 0 !important;
      border-radius: 8px !important;
    }
    
    .tharwah-popover-close:hover {
      background: rgba(255, 255, 255, 1) !important;
      color: #374151 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
    
    .tharwah-popover-close:active {
      transform: scale(0.95) !important;
    }
    
    .tharwah-popover-close svg {
      width: 18px !important;
      height: 18px !important;
    }
    
    /* HORIZONTAL LAYOUT */
    .tharwah-popover-horizontal {
      padding: 16px !important;
      padding-right: 48px !important;
      display: flex !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }
    
    .tharwah-popover-icon-wrapper {
      width: 36px !important;
      height: 36px !important;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
      color: #059669 !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    
    .tharwah-popover-icon-wrapper svg {
      width: 20px !important;
      height: 20px !important;
      stroke: #059669 !important;
    }
    
    .tharwah-popover-text-content {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }
    
    .tharwah-popover-description {
      margin: 0 !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
      color: #374151 !important;
      font-weight: 400 !important;
    }
    
    .tharwah-popover-cta {
      width: 100% !important;
      padding: 10px 16px !important;
      background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2) !important;
      text-align: center !important;
      min-height: 40px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .tharwah-popover-cta:hover {
      background: linear-gradient(135deg, #047857 0%, #065f46 100%) !important;
      box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3) !important;
      transform: translateY(-1px) !important;
    }
    
    .tharwah-popover-cta:active {
      transform: translateY(0) scale(0.98) !important;
    }
    
    /* TABLET */
    @media (max-width: 1024px) and (min-width: 641px) {
      .tharwah-popover {
        bottom: 90px !important;
        right: 20px !important;
        max-width: 360px !important;
      }
    }
    
    /* MOBILE PORTRAIT */
    @media (max-width: 640px) {
      .tharwah-popover {
        bottom: 90px !important;
        left: 12px !important;
        right: 12px !important;
        max-width: none !important;
        width: calc(100% - 24px) !important;
        
        /* Notched devices support */
        bottom: max(90px, calc(80px + env(safe-area-inset-bottom))) !important;
        left: max(12px, env(safe-area-inset-left)) !important;
        right: max(12px, env(safe-area-inset-right)) !important;
        
        transform: translateY(30px) !important;
      }
      
      .tharwah-popover-visible {
        transform: translateY(0) !important;
      }
      
      .tharwah-popover-card {
        border-radius: 16px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
      }
      
      .tharwah-popover-horizontal {
        padding: 20px !important;
        padding-right: 52px !important;
        gap: 14px !important;
      }
      
      .tharwah-popover-icon-wrapper {
        width: 44px !important;
        height: 44px !important;
        border-radius: 12px !important;
      }
      
      .tharwah-popover-icon-wrapper svg {
        width: 24px !important;
        height: 24px !important;
      }
      
      .tharwah-popover-description {
        font-size: 15px !important;
        line-height: 1.6 !important;
        color: #1f2937 !important;
      }
      
      .tharwah-popover-cta {
        padding: 14px 20px !important;
        font-size: 15px !important;
        min-height: 48px !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
      }
      
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
    
    /* MOBILE LANDSCAPE */
    @media (max-height: 500px) {
      .tharwah-popover {
        bottom: 60px !important;
        max-width: 360px !important;
      }
      
      .tharwah-popover-horizontal {
        padding: 14px !important;
        padding-right: 48px !important;
        gap: 10px !important;
      }
      
      .tharwah-popover-icon-wrapper {
        width: 36px !important;
        height: 36px !important;
      }
      
      .tharwah-popover-description {
        font-size: 13px !important;
      }
      
      .tharwah-popover-cta {
        padding: 10px 16px !important;
        font-size: 13px !important;
        min-height: 40px !important;
      }
    }
    
    /* SMALL MOBILE */
    @media (max-width: 360px) {
      .tharwah-popover {
        bottom: 85px !important;
        left: 8px !important;
        right: 8px !important;
        width: calc(100% - 16px) !important;
      }
      
      .tharwah-popover-horizontal {
        padding: 16px !important;
        padding-right: 48px !important;
        gap: 12px !important;
      }
      
      .tharwah-popover-icon-wrapper {
        width: 40px !important;
        height: 40px !important;
      }
      
      .tharwah-popover-description {
        font-size: 14px !important;
      }
      
      .tharwah-popover-cta {
        padding: 12px 16px !important;
        font-size: 14px !important;
      }
    }
    
    /* ACCESSIBILITY */
    @media (prefers-reduced-motion: reduce) {
      .tharwah-popover,
      .tharwah-popover-visible,
      .tharwah-popover-close,
      .tharwah-popover-cta {
        transition: none !important;
        animation: none !important;
      }
      
      .tharwah-popover {
        transform: none !important;
      }
      
      .tharwah-popover-visible {
        transform: none !important;
      }
    }
    
    .tharwah-popover-close:focus,
    .tharwah-popover-cta:focus {
      outline: 2px solid #059669 !important;
      outline-offset: 2px !important;
    }
    
    /* DARK MODE */
    @media (prefers-color-scheme: dark) {
      .tharwah-popover-card {
        background: #1f2937 !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
      }
      
      .tharwah-popover-description {
        color: #e5e7eb !important;
      }
      
      .tharwah-popover-close {
        background: rgba(31, 41, 55, 0.9) !important;
        color: #9ca3af !important;
      }
      
      .tharwah-popover-close:hover {
        background: rgba(31, 41, 55, 1) !important;
        color: #d1d5db !important;
      }
    }
    
    /* HIDE WHEN CHAT OPEN */
    .tharwah-chat-window.active ~ .tharwah-popover,
    body.tharwah-chat-active .tharwah-popover {
      display: none !important;
    }
  `;
  document.head.appendChild(styles);
}


// ========================================
// METHOD 2: addSwipeGesture() - NEW METHOD
// Add this method after renderPopover()
// ========================================

addSwipeGesture(container, popoverId) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  const minSwipeDistance = 50;
  
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Swipe right to dismiss
    if (deltaX > minSwipeDistance && Math.abs(deltaY) < 50) {
      this.trackPopoverInteraction(popoverId, 'swipe_dismiss');
      this.hidePopover();
    }
    // Swipe down to dismiss
    else if (deltaY > minSwipeDistance && Math.abs(deltaX) < 50) {
      this.trackPopoverInteraction(popoverId, 'swipe_dismiss');
      this.hidePopover();
    }
  }, { passive: true });
}


// ========================================
// METHOD 3: renderPopover() - UPDATED
// Add swipe gesture support
// Find this line: document.body.appendChild(container);
// Add the swipe gesture call after it
// ========================================

// In renderPopover(), after document.body.appendChild(container);
// Add this line:
this.addSwipeGesture(container, popover.id);


// ========================================
// METHOD 4: setupOrientationHandling() - NEW METHOD
// Add this method
// ========================================

setupOrientationHandling() {
  window.addEventListener('orientationchange', () => {
    if (this.popoverState.currentPopover) {
      this.hidePopover();
      
      setTimeout(() => {
        this.checkForPopover('orientation_change');
      }, 500);
    }
  });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const popover = document.getElementById('tharwah-popover');
      if (popover) {
        popover.style.display = 'none';
        popover.offsetHeight;
        popover.style.display = '';
      }
    }, 300);
  });
}


// ========================================
// METHOD 5: startPopoverSystem() - UPDATE
// Add orientation handling call
// Find this method and add the call
// ========================================

// In startPopoverSystem(), after the first setTimeout, add:
this.setupOrientationHandling();


// ========================================
// COMPLETE INTEGRATION EXAMPLE
// ========================================

/*
Here's how your renderPopover() should look after the update:

renderPopover(popover, suggestion) {
  const container = document.createElement('div');
  container.id = 'tharwah-popover';
  container.className = 'tharwah-popover';
  container.dataset.popoverId = popover.id;
  
  container.innerHTML = `
    <div class="tharwah-popover-card">
      <button class="tharwah-popover-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
      
      <div class="tharwah-popover-horizontal">
        <div class="tharwah-popover-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
            <circle cx="12" cy="8" r="6"></circle>
          </svg>
        </div>
        
        <div class="tharwah-popover-text-content">
          <p class="tharwah-popover-description">${popover.content}</p>
          <button class="tharwah-popover-cta">Start Chat</button>
        </div>
      </div>
    </div>
  `;
  
  if (!document.getElementById('tharwah-popover-styles')) {
    this.injectPopoverStyles();
  }
  
  if (popover.custom_css) {
    const style = document.createElement('style');
    style.textContent = popover.custom_css;
    container.appendChild(style);
  }
  
  document.body.appendChild(container);
  
  // ✨ ADD SWIPE GESTURE SUPPORT
  this.addSwipeGesture(container, popover.id);
  
  setTimeout(() => container.classList.add('tharwah-popover-visible'), 10);
  
  // ... rest of event listeners ...
}
*/
