/**
 * Persian Loading Animation Utility
 * 
 * A centralized loading system with beautiful Persian animations and interaction blocking
 * Usage: PersianLoader.show('text'), PersianLoader.hide()
 * 
 * Features:
 * - Beautiful animated bars with gradient colors
 * - Persian/Farsi text support with RTL direction
 * - Full-screen overlay with backdrop blur
 * - Complete interaction blocking (clicks, touches, keyboard, scrolling)
 * - Customizable loading messages
 * - Thread-safe show/hide operations
 * - Auto-cleanup and memory management
 * - Mobile-optimized touch event blocking
 */

class PersianLoaderUtil {
    constructor() {
        this.container = null;
        this.loadingText = null;
        this.loadingEmoji = null;
        this.isVisible = false;
        this.isInitialized = false;
        this.showTimeout = null;
        this.hideTimeout = null;
        
        // Initialize immediately
        this.init();
    }
    
    /**
     * Initialize the loading animation elements
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            // Create loading container
            this.container = document.createElement('div');
            this.container.id = 'persian-loader-container';
            this.container.className = 'persian-loader-container';
            
            // Create loading animation structure
            this.container.innerHTML = `
                <div class="persian-loader-wrapper">
                    <div class="persian-loading-emoji" id="persian-loading-emoji">⏳</div>
                    <div class="persian-loader">
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                        <div class="persian-bar"></div>
                    </div>
                    <div class="persian-loading-text" id="persian-loading-text">در حال بارگذاری...</div>
                </div>
            `;
            
            // Get loading text and emoji element references
            this.loadingText = this.container.querySelector('#persian-loading-text');
            this.loadingEmoji = this.container.querySelector('#persian-loading-emoji');
            
            // Add click blocking event listeners
            this.addClickBlockingListeners();
            
            // Add to document body
            document.body.appendChild(this.container);
            
            // Inject CSS styles
            this.injectStyles();
            
            this.isInitialized = true;
            console.log('🎨 PersianLoader initialized successfully with click blocking');
            
        } catch (error) {
            console.error('❌ PersianLoader initialization failed:', error);
        }
    }
    
    /**
     * Inject CSS styles for the loading animation
     */
    injectStyles() {
        // Check if styles already exist
        if (document.getElementById('persian-loader-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'persian-loader-styles';
        style.textContent = `
            /* Persian Loader - Auth.html Design System Integration */
            .persian-loader-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                gap: 2rem;
                /* Auth.html gradient background matching style guide */
                background: linear-gradient(135deg, #000000 0%, #1F2937 100%);
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                /* Enhanced glassmorphism from auth.html */
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                /* Prevent all user interactions when visible */
                pointer-events: none;
                /* Prevent text selection */
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                /* Prevent touch interactions on mobile */
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
            }

            .persian-loader-container.visible {
                display: flex;
                opacity: 1;
                /* Enable pointer events when visible to capture all clicks */
                pointer-events: all;
            }

            /* Loading content wrapper with auth.html glassmorphism */
            .persian-loader-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 40px rgba(99, 102, 241, 0.15);
                max-width: 320px;
                width: 90%;
                position: relative;
            }

            .persian-loader {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                height: 100px;
                margin-bottom: 0.5rem;
            }

            .persian-bar {
                width: 14px;
                height: 12px;
                /* Exact auth.html purple gradient */
                background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
                border-radius: 8px;
                animation: persian-pulse 2.2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                /* Enhanced purple glow matching auth.html */
                box-shadow: 
                    0 0 20px rgba(99, 102, 241, 0.4), 
                    0 0 40px rgba(139, 92, 246, 0.3),
                    0 4px 15px rgba(168, 85, 247, 0.2);
                position: relative;
                overflow: hidden;
            }

            @keyframes persian-pulse {
                0% {
                    height: 12px;
                    opacity: 0.4;
                    transform: scaleY(1) scaleX(1);
                    box-shadow: 
                        0 0 8px rgba(99, 102, 241, 0.2), 
                        0 0 15px rgba(139, 92, 246, 0.1);
                }
                25% {
                    height: 40px;
                    opacity: 0.7;
                    transform: scaleY(1.05) scaleX(1.02);
                    box-shadow: 
                        0 0 15px rgba(99, 102, 241, 0.35), 
                        0 0 25px rgba(139, 92, 246, 0.25);
                }
                50% {
                    height: 100px;
                    opacity: 1;
                    transform: scaleY(1.15) scaleX(1.05);
                    box-shadow: 
                        0 0 25px rgba(99, 102, 241, 0.6), 
                        0 0 50px rgba(139, 92, 246, 0.4),
                        0 6px 20px rgba(168, 85, 247, 0.3);
                }
                75% {
                    height: 60px;
                    opacity: 0.8;
                    transform: scaleY(1.08) scaleX(1.03);
                    box-shadow: 
                        0 0 20px rgba(99, 102, 241, 0.45), 
                        0 0 35px rgba(139, 92, 246, 0.3);
                }
                100% {
                    height: 12px;
                    opacity: 0.4;
                    transform: scaleY(1) scaleX(1);
                    box-shadow: 
                        0 0 8px rgba(99, 102, 241, 0.2), 
                        0 0 15px rgba(139, 92, 246, 0.1);
                }
            }

            .persian-bar:nth-child(1) { animation-delay: 0s; }
            .persian-bar:nth-child(2) { animation-delay: 0.15s; }
            .persian-bar:nth-child(3) { animation-delay: 0.3s; }
            .persian-bar:nth-child(4) { animation-delay: 0.45s; }
            .persian-bar:nth-child(5) { animation-delay: 0.6s; }
            .persian-bar:nth-child(6) { animation-delay: 0.75s; }
            .persian-bar:nth-child(7) { animation-delay: 0.9s; }

            .persian-loading-text {
                font-size: 1.4rem;
                font-weight: 600;
                /* Auth.html gradient text */
                background: linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-align: center;
                direction: rtl;
                /* Auth.html font family */
                font-family: 'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                letter-spacing: 0.5px;
                line-height: 1.4;
                margin-top: 0.5rem;
                position: relative;
                overflow: hidden;
                white-space: nowrap;
                animation: persian-typing 3s infinite;
            }
            
            @keyframes persian-typing {
                0% {
                    width: 0;
                }
                50% {
                    width: 100%;
                }
                100% {
                    width: 100%;
                }
            }
            
            .persian-loading-emoji {
                font-size: 3rem;
                margin-bottom: 0.5rem;
                animation: persian-emoji-telegram 1.8s infinite ease-out;
                display: block;
                filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.3));
                transform-origin: center bottom;
            }
            
            @keyframes persian-emoji-telegram {
                0% {
                    transform: scale(1) rotate(0deg);
                }
                15% {
                    transform: scale(1.3) rotate(-5deg);
                }
                30% {
                    transform: scale(0.9) rotate(3deg);
                }
                45% {
                    transform: scale(1.1) rotate(-2deg);
                }
                60% {
                    transform: scale(0.95) rotate(1deg);
                }
                75% {
                    transform: scale(1.05) rotate(-1deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            


            /* Mobile optimizations with auth.html responsive design */
            @media (max-width: 768px) {
                .persian-loader-wrapper {
                    padding: 1.5rem;
                    max-width: 280px;
                    gap: 1.25rem;
                }
                
                .persian-loading-text {
                    font-size: 1.2rem;
                    padding: 0 0.5rem;
                    letter-spacing: 0.3px;
                }
                
                .persian-loading-emoji {
                    font-size: 2.5rem;
                }
                
                .persian-loader {
                    gap: 10px;
                    height: 80px;
                }
                
                .persian-bar {
                    width: 12px;
                    height: 10px;
                }
                
                @keyframes persian-pulse {
                    0% {
                        height: 10px;
                        opacity: 0.4;
                        transform: scaleY(1) scaleX(1);
                    }
                    25% {
                        height: 30px;
                        opacity: 0.7;
                        transform: scaleY(1.05) scaleX(1.02);
                    }
                    50% {
                        height: 80px;
                        opacity: 1;
                        transform: scaleY(1.15) scaleX(1.05);
                    }
                    75% {
                        height: 50px;
                        opacity: 0.8;
                        transform: scaleY(1.08) scaleX(1.03);
                    }
                    100% {
                        height: 10px;
                        opacity: 0.4;
                        transform: scaleY(1) scaleX(1);
                    }
                }
            }

            @media (max-width: 480px) {
                .persian-loader-wrapper {
                    padding: 1.25rem;
                    max-width: 260px;
                    gap: 1rem;
                    border-radius: 16px;
                }
                
                .persian-loading-text {
                    font-size: 1rem;
                    padding: 0 0.25rem;
                }
                
                .persian-loading-emoji {
                    font-size: 2rem;
                }
                
                .persian-loader {
                    gap: 8px;
                    height: 60px;
                }
                
                .persian-bar {
                    width: 10px;
                    height: 8px;
                }
                
                @keyframes persian-pulse {
                    0% {
                        height: 8px;
                        opacity: 0.4;
                        transform: scaleY(1) scaleX(1);
                    }
                    25% {
                        height: 25px;
                        opacity: 0.7;
                        transform: scaleY(1.05) scaleX(1.02);
                    }
                    50% {
                        height: 60px;
                        opacity: 1;
                        transform: scaleY(1.15) scaleX(1.05);
                    }
                    75% {
                        height: 35px;
                        opacity: 0.8;
                        transform: scaleY(1.08) scaleX(1.03);
                    }
                    100% {
                        height: 8px;
                        opacity: 0.4;
                        transform: scaleY(1) scaleX(1);
                    }
                }
            }

            /* Enhanced shimmer effect for loading bars */
            .persian-bar::before {
                content: '';
                position: absolute;
                top: 0;
                left: -150%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 255, 255, 0.4), 
                    rgba(255, 255, 255, 0.6),
                    rgba(255, 255, 255, 0.4),
                    transparent);
                animation: shimmer 3s infinite ease-in-out;
                border-radius: 8px;
            }
            
            @keyframes shimmer {
                0% { 
                    left: -150%;
                    opacity: 0;
                }
                20% {
                    left: -50%;
                    opacity: 1;
                }
                80% {
                    left: 100%;
                    opacity: 1;
                }
                100% { 
                    left: 150%;
                    opacity: 0;
                }
            }

        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Add event listeners to block user interactions when loader is visible
     */
    addClickBlockingListeners() {
        if (!this.container) return;
        
        // Block all mouse events
        const mouseEvents = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout'];
        mouseEvents.forEach(eventType => {
            this.container.addEventListener(eventType, this.blockEvent.bind(this), {
                capture: true,
                passive: false
            });
        });
        
        // Block all touch events (mobile)
        const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
        touchEvents.forEach(eventType => {
            this.container.addEventListener(eventType, this.blockEvent.bind(this), {
                capture: true,
                passive: false
            });
        });
        
        // Block keyboard events
        const keyboardEvents = ['keydown', 'keyup', 'keypress'];
        keyboardEvents.forEach(eventType => {
            this.container.addEventListener(eventType, this.blockEvent.bind(this), {
                capture: true,
                passive: false
            });
        });
        
        // Block form events
        const formEvents = ['submit', 'reset', 'change', 'input'];
        formEvents.forEach(eventType => {
            this.container.addEventListener(eventType, this.blockEvent.bind(this), {
                capture: true,
                passive: false
            });
        });
        
        console.log('🚫 Click blocking listeners added');
    }
    
    /**
     * Block event and prevent propagation
     * @param {Event} event - The event to block
     */
    blockEvent(event) {
        // Only block events when the loader is visible
        if (this.isVisible) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            // Log blocked interactions for debugging (optional)
            if (event.type === 'click') {
                console.log('🚫 Blocked click interaction while loading');
            }
            
            return false;
        }
    }
    
    /**
     * Disable body scrolling when loader is visible
     */
    disableBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }
    
    /**
     * Enable body scrolling when loader is hidden
     */
    enableBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
    }
    
    /**
     * Start typing animation for text
     * @param {string} text - The text to type
     */
    startTypingAnimation(text) {
        if (!this.loadingText) return;
        
        // Set the text content
        this.loadingText.textContent = text;
        
        // Restart the typing animation
        this.loadingText.style.animation = 'none';
        setTimeout(() => {
            this.loadingText.style.animation = 'persian-typing 3s infinite';
        }, 10);
    }
    
    /**
     * Show the Persian loading animation
     * @param {string} text - The Persian text to display (optional)
     * @param {number} delay - Delay before showing (optional, default: 0)
     * @param {string} emoji - The emoji to display (optional)
     */
    show(text = 'در حال بارگذاری...', delay = 0, emoji = null) {
        // Clear any pending hide operations
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        // Clear any pending show operations
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
        }
        
        // Ensure initialization
        if (!this.isInitialized) {
            this.init();
        }
        
        const showOperation = () => {
            try {
                // Update text if provided
                if (this.loadingText && text) {
                    this.startTypingAnimation(text);
                }
                
                // Update emoji if provided
                if (this.loadingEmoji && emoji) {
                    this.loadingEmoji.textContent = emoji;
                }
                
                // Show the container and block interactions
                if (this.container && !this.isVisible) {
                    this.container.classList.add('visible');
                    this.isVisible = true;
                    
                    // Disable body scrolling and interactions
                    this.disableBodyScroll();
                    
                    console.log('🎨 PersianLoader shown with interaction blocking:', text, emoji || '');
                }
            } catch (error) {
                console.error('❌ PersianLoader show failed:', error);
            }
        };
        
        if (delay > 0) {
            this.showTimeout = setTimeout(showOperation, delay);
        } else {
            showOperation();
        }
    }
    
    /**
     * Hide the Persian loading animation
     * @param {number} delay - Delay before hiding (optional, default: 0)
     */
    hide(delay = 0) {
        // Clear any pending show operations
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        
        // Clear any pending hide operations
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        const hideOperation = () => {
            try {
                if (this.container && this.isVisible) {
                    this.container.classList.remove('visible');
                    this.isVisible = false;
                    
                    // Re-enable body scrolling and interactions
                    this.enableBodyScroll();
                    
                    console.log('🎨 PersianLoader hidden, interactions restored');
                }
            } catch (error) {
                console.error('❌ PersianLoader hide failed:', error);
            }
        };
        
        if (delay > 0) {
            this.hideTimeout = setTimeout(hideOperation, delay);
        } else {
            hideOperation();
        }
    }
    
    /**
     * Update the loading text without showing/hiding
     * @param {string} text - The new Persian text to display
     * @param {string} emoji - The new emoji to display (optional)
     */
    updateText(text, emoji = null) {
        try {
            if (this.loadingText && text) {
                this.startTypingAnimation(text);
            }
            if (this.loadingEmoji && emoji) {
                this.loadingEmoji.textContent = emoji;
            }
            console.log('🎨 PersianLoader text updated:', text, emoji || '');
        } catch (error) {
            console.error('❌ PersianLoader updateText failed:', error);
        }
    }
    
    /**
     * Update only the emoji without changing text
     * @param {string} emoji - The new emoji to display
     */
    updateEmoji(emoji) {
        try {
            if (this.loadingEmoji && emoji) {
                this.loadingEmoji.textContent = emoji;
                console.log('🎨 PersianLoader emoji updated:', emoji);
            }
        } catch (error) {
            console.error('❌ PersianLoader updateEmoji failed:', error);
        }
    }
    
    /**
     * Check if the loader is currently visible
     * @returns {boolean} - True if visible, false otherwise
     */
    isShown() {
        return this.isVisible;
    }
    
    /**
     * Force enable interaction blocking (even when loader is not visible)
     * Use with caution - mainly for debugging or special cases
     */
    forceBlockInteractions() {
        if (this.container) {
            this.container.style.pointerEvents = 'all';
            this.container.style.display = 'flex';
            this.container.style.opacity = '0'; // Invisible but still blocking
            this.disableBodyScroll();
            console.log('🚫 Force blocking interactions enabled');
        }
    }
    
    /**
     * Force disable interaction blocking and restore normal behavior
     */
    forceUnblockInteractions() {
        if (this.container) {
            this.container.style.pointerEvents = '';
            this.container.style.display = '';
            this.container.style.opacity = '';
            this.enableBodyScroll();
            console.log('✅ Force blocking interactions disabled');
        }
    }
    
    /**
     * Cleanup and destroy the loader instance
     */
    destroy() {
        try {
            // Clear timeouts
            if (this.showTimeout) {
                clearTimeout(this.showTimeout);
                this.showTimeout = null;
            }
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
            
            // Restore body scrolling if it was disabled
            if (this.isVisible) {
                this.enableBodyScroll();
            }
            
            // Remove from DOM
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            
            // Remove styles
            const styleElement = document.getElementById('persian-loader-styles');
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            
            // Reset state
            this.container = null;
            this.loadingText = null;
            this.isVisible = false;
            this.isInitialized = false;
            
            console.log('🎨 PersianLoader destroyed and interactions restored');
        } catch (error) {
            console.error('❌ PersianLoader destroy failed:', error);
        }
    }
}

// Create singleton instance
const PersianLoader = new PersianLoaderUtil();

// Global exports for compatibility
if (typeof window !== 'undefined') {
    window.PersianLoader = PersianLoader;
    window.persianLoader = PersianLoader; // Alternative lowercase reference
}

// Module exports for modern environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersianLoader;
}

// Common loading messages in Persian with emojis for easy reference - Auth.html Style
PersianLoader.messages = {
    // General loading - friendly and welcoming
    loading: 'در حال بارگذاری... 🚀',
    processing: 'در حال پردازش... ⚙️',
    waiting: 'لطفاً صبر کنید 🙏',
    
    // File operations - more descriptive
    uploading: 'در حال آپلود فایل... 📄',
    downloading: 'در حال دانلود... ⬇️',
    converting: 'در حال تبدیل فرمت... 🔄',
    
    // Audio operations - more engaging
    voiceConversion: 'در حال تبدیل صدا با هوش مصنوعی... 🎤',
    audioProcessing: 'پردازش صوتی در حال انجام... 🎵',
    recording: 'در حال ضبط... 🎤',
    
    // API operations - technical but friendly
    fetchingModels: 'دریافت مدل‌های هوش مصنوعی... 🤖',
    authenticating: 'در حال احراز هویت... 🔐',
    connecting: 'اتصال به سرور... 🌐',
    
    // Navigation - smooth transitions
    navigating: 'آماده‌سازی برای انتقال... ➡️',
    redirecting: 'در حال هدایت... 🔄',
    
    // Preparation - reassuring
    preparing: 'آماده‌سازی فایل... 🛠️',
    initializing: 'راه‌اندازی سیستم... 🚀',
    finalizing: 'نهایی‌سازی... ✨',
    
    // Success states - celebratory  
    success: 'موفقیت‌آمیز بود! ✅',
    completed: 'با موفقیت به پایان رسید 🎉',
    
    // Welcome messages like auth.html
    welcome: 'خوش آمدید! 👋',
    ready: 'آماده برای شروع 🎆'
};

// Emoji mappings for different operations - Auth.html Interactive Style
PersianLoader.emojis = {
    // General - welcoming and friendly
    loading: '🚀',
    processing: '⚙️',
    waiting: '⏳',
    success: '✅',
    completed: '🎉',
    error: '❌',
    
    // File operations - visual and clear
    uploading: '📄',
    downloading: '⬇️',
    converting: '🔄',
    
    // Audio operations - music and sound themed
    voiceConversion: '🎤',
    audioProcessing: '🎵',
    recording: '🎙️',
    
    // API operations - technical but approachable
    fetchingModels: '🤖',
    authenticating: '🔐',
    connecting: '🌐',
    
    // Navigation - directional and smooth
    navigating: '➡️',
    redirecting: '🔄',
    
    // Preparation - building and setup
    preparing: '🛠️',
    initializing: '🚀',
    finalizing: '✨',
    
    // Welcome and interaction - matching auth.html
    welcome: '👋',
    ready: '🎆',
    secure: '🔒',
    magic: '✨',
    sparkles: '✨',
    
    // Advanced states
    analyzing: '🔍',
    optimizing: '📊',
    syncing: '🔄',
    backup: '💾',
    cloud: '☁️',
    
    // Emotional states for better UX
    happy: '😊',
    excited: '🎉',
    thoughtful: '🤔',
    working: '💪'
};

// Helper method to show with emoji
PersianLoader.showWithEmoji = function(messageKey, customText = null, customEmoji = null) {
    const text = customText || PersianLoader.messages[messageKey] || PersianLoader.messages.loading;
    const emoji = customEmoji || PersianLoader.emojis[messageKey] || PersianLoader.emojis.loading;
    PersianLoader.show(text, 0, emoji);
};

// Helper method to update with emoji
PersianLoader.updateWithEmoji = function(messageKey, customText = null, customEmoji = null) {
    const text = customText || PersianLoader.messages[messageKey] || PersianLoader.messages.loading;
    const emoji = customEmoji || PersianLoader.emojis[messageKey] || PersianLoader.emojis.loading;
    PersianLoader.updateText(text, emoji);
};

console.log('🎨 PersianLoader utility loaded successfully with interaction blocking');