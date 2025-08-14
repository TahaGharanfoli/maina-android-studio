// App Initialization and Routing
class AppInitializer {
    constructor() {
        this.tokenManager = window.tokenManager;
        this.currentPage = this.getCurrentPage();
    }

    // Get current page name
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('auth.html')) return 'auth';
        if (path.includes('home.html')) return 'main';
        // Default: if it isn't auth, treat as main only when on home.html
        return 'auth';
    }

    // Initialize app routing
    async init() {
        console.log('🚀 Initializing app...');
        console.log('📍 Current page:', this.currentPage);
        console.log('🔐 Authentication status:', this.tokenManager.isAuthenticated());

        // Check authentication status
        if (this.tokenManager.isAuthenticated()) {
            console.log('✅ User is authenticated');
            
            if (this.currentPage === 'auth') {
                // User is on auth page but already authenticated, redirect to main
                console.log('🔄 Redirecting authenticated user to main app');
                this.tokenManager.redirectToMain();
                return;
            } else {
                // User is on main page and authenticated, check token expiry
                console.log('🔍 Checking token expiry...');
                if (this.tokenManager.isTokenExpired()) {
                    console.log('⏰ Token expired, attempting refresh...');
                    try {
                        await this.tokenManager.refreshAccessToken();
                        console.log('✅ Token refreshed successfully');
                    } catch (error) {
                        console.log('❌ Token refresh failed, redirecting to auth');
                        this.tokenManager.redirectToAuth();
                        return;
                    }
                }
                console.log('✅ User can access main app');
            }
        } else {
            console.log('❌ User is not authenticated');
            
            if (this.currentPage !== 'auth') {
                // User is not authenticated but trying to access main app
                console.log('🔄 Redirecting unauthenticated user to auth');
                this.tokenManager.redirectToAuth();
                return;
            } else {
                // User is on auth page and not authenticated, this is correct
                console.log('✅ User is on auth page as expected');
            }
        }

        // Initialize page-specific functionality
        this.initPageSpecific();
    }

    // Initialize page-specific functionality
    initPageSpecific() {
        switch (this.currentPage) {
            case 'auth':
                this.initAuthPage();
                break;
            case 'main':
                this.initMainPage();
                break;
            default:
                console.log('⚠️ Unknown page, defaulting to main');
                this.initMainPage();
        }
    }

    // Initialize authentication page
    initAuthPage() {
        console.log('🔐 Initializing auth page...');
        
        // Check if user is already authenticated
        if (this.tokenManager.isAuthenticated()) {
            console.log('✅ User already authenticated, redirecting to main');
            this.tokenManager.redirectToMain();
            return;
        }

        // Auth page is already initialized by AuthUI class
        console.log('✅ Auth page ready for login/registration');
    }

    // Initialize main app page
    initMainPage() {
        console.log('🏠 Initializing main app page...');
        
        // Ensure user is authenticated
        if (!this.tokenManager.isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to auth');
            this.tokenManager.redirectToAuth();
            return;
        }

        // Add logout functionality to logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('🚪 User logging out...');
                this.tokenManager.logout();
            });
        }

        // Initialize any other main app functionality here
        console.log('✅ Main app page initialized');
    }

    // Handle authentication success
    handleAuthSuccess(accessToken, refreshToken, expiresIn) {
        console.log('🎉 Authentication successful, saving tokens...');
        this.tokenManager.saveTokens(accessToken, refreshToken, expiresIn);
        
        // Redirect to main app
        setTimeout(() => {
            console.log('🔄 Redirecting to main app...');
            this.tokenManager.redirectToMain();
        }, 1500);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 App starting...');
    
    // Wait for token manager to be available
    if (window.tokenManager) {
        const app = new AppInitializer();
        await app.init();
        
        // Make app instance globally available
        window.app = app;
    } else {
        console.error('❌ Token manager not available');
    }
});

// Handle page visibility changes (when user returns to app)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        console.log('👁️ Page became visible, checking authentication...');
        window.app.init();
    }
});

