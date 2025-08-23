/**
 * Centralized Authentication Service
 * Handles token validation, refresh, and authentication checks across all pages
 */
class AuthService {
    constructor() {
        this.tokenManager = window.tokenManager;
        this.isInitialized = false;
        
        // Check if we're in Capacitor environment
        this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
    }

    /**
     * Initialize authentication service
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔐 Initializing AuthService...');
            
            // Wait for token manager to be available
            let attempts = 0;
            while (!this.tokenManager && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.tokenManager = window.tokenManager;
                attempts++;
            }
            
            if (!this.tokenManager) {
                throw new Error('Token manager not available');
            }
            
            this.isInitialized = true;
            console.log('✅ AuthService initialized successfully');
        } catch (error) {
            console.error('❌ AuthService initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        if (!this.tokenManager) {
            console.log('❌ Token manager not available');
            return false;
        }
        
        const isAuth = this.tokenManager.isAuthenticated();
        console.log('🔐 Authentication status:', isAuth ? '✅ Authenticated' : '❌ Not authenticated');
        return isAuth;
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        if (!this.tokenManager || !this.tokenManager.isTokenExpired) {
            return true;
        }
        
        const isExpired = this.tokenManager.isTokenExpired();
        console.log('⏰ Token expiration status:', isExpired ? '❌ Expired' : '✅ Valid');
        return isExpired;
    }

    /**
     * Get current access token
     */
    getAccessToken() {
        if (!this.tokenManager) return null;
        
        const token = this.tokenManager.getAccessToken();
        console.log('🔑 Access token:', token ? 'Available' : 'Not available');
        return token;
    }

    /**
     * Refresh access token
     */
    async refreshToken() {
        if (!this.tokenManager || !this.tokenManager.refreshAccessToken) {
            throw new Error('Token refresh not available');
        }
        
        try {
            console.log('🔄 Refreshing access token...');
            const newToken = await this.tokenManager.refreshAccessToken();
            console.log('✅ Token refreshed successfully');
            return newToken;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            throw error;
        }
    }

    /**
     * Perform authentication check and redirect if needed
     */
    async checkAuthenticationAndRedirect(currentPage = 'unknown') {
        try {
            console.log(`🔍 Checking authentication for page: ${currentPage}`);
            
            await this.init();
            
            // Check if authenticated
            if (!this.isAuthenticated()) {
                console.log('❌ User not authenticated, redirecting to auth page');
                this.redirectToAuth();
                return false;
            }
            
            // Check if token is expired and try to refresh
            if (this.isTokenExpired()) {
                console.log('⏰ Token expired, attempting refresh...');
                try {
                    await this.refreshToken();
                    console.log('✅ Token refresh successful, continuing...');
                } catch (error) {
                    console.error('❌ Token refresh failed, redirecting to auth');
                    this.redirectToAuth();
                    return false;
                }
            }
            
            console.log('✅ Authentication check passed');
            return true;
            
        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            this.redirectToAuth();
            return false;
        }
    }

    /**
     * Make authenticated API request with automatic token refresh
     */
    async makeAuthenticatedRequest(url, options = {}) {
        try {
            await this.init();
            
            // Ensure user is authenticated
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            // Check and refresh token if needed
            if (this.isTokenExpired()) {
                console.log('🔄 Token expired, refreshing before request...');
                await this.refreshToken();
            }
            
            // Get access token
            const accessToken = this.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }
            
            // Prepare request options
            const requestOptions = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    ...options.headers
                }
            };
            
            console.log(`🌐 Making authenticated request to: ${url}`);
            
            // Wait for HttpUtil to be available
            let httpUtil = window.httpUtil;
            if (!httpUtil) {
                // Wait a bit for HttpUtil to load
                let attempts = 0;
                while (!window.httpUtil && attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                httpUtil = window.httpUtil;
            }
            
            if (!httpUtil) {
                throw new Error('HttpUtil not available - required for network requests');
            }
            
            // Use HttpUtil for all network requests (Capacitor compatibility)
            const response = await httpUtil.request(url, requestOptions);
            
            // Handle 401 errors with token refresh
            if (response.status === 401) {
                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    result = { message: 'Unauthorized' };
                }
                
                // Check for specific expired token message
                if (result.message && 
                    (result.message.includes('توکن نامعتبر یا منقضی شده است') || 
                     result.message.includes('Invalid or expired token'))) {
                    
                    console.log('🔄 Detected expired token, refreshing and retrying...');
                    
                    try {
                        await this.refreshToken();
                        
                        // Retry the request with new token
                        const newToken = this.getAccessToken();
                        requestOptions.headers.Authorization = `Bearer ${newToken}`;
                        
                        console.log('🔄 Retrying request with new token...');
                        
                        // Retry with HttpUtil only
                        const retryResponse = await httpUtil.request(url, requestOptions);
                        
                        if (!retryResponse.ok) {
                            let retryResult;
                            try {
                                retryResult = await retryResponse.json();
                            } catch (e) {
                                retryResult = { message: `HTTP ${retryResponse.status}: Request failed after token refresh` };
                            }
                            throw new Error(retryResult.message || `HTTP ${retryResponse.status}: Request failed after token refresh`);
                        }
                        
                        return retryResponse;
                        
                    } catch (refreshError) {
                        console.error('❌ Token refresh failed during request:', refreshError);
                        this.clearTokensAndRedirect();
                        throw new Error('Authentication failed - please login again');
                    }
                } else {
                    throw new Error(result.message || `HTTP ${response.status}: Unauthorized`);
                }
            }
            
            if (!response.ok) {
                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    result = { message: `HTTP ${response.status}: Request failed` };
                }
                throw new Error(result.message || `HTTP ${response.status}: Request failed`);
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ Authenticated request failed:', error);
            throw error;
        }
    }

    /**
     * Clear tokens and redirect to authentication
     */
    clearTokensAndRedirect() {
        if (this.tokenManager && this.tokenManager.clearTokens) {
            this.tokenManager.clearTokens();
        }
        this.redirectToAuth();
    }

    /**
     * Redirect to authentication page
     */
    redirectToAuth() {
        try {
            if (!window.location.pathname.includes('auth.html')) {
                console.log('🔄 Redirecting to authentication page...');
                window.location.href = 'auth.html';
            }
        } catch (error) {
            console.error('❌ Failed to redirect to auth:', error);
        }
    }

    /**
     * Redirect to main application
     */
    redirectToHome() {
        try {
            console.log('🏠 Redirecting to home page...');
            window.location.href = 'home.html';
        } catch (error) {
            console.error('❌ Failed to redirect to home:', error);
        }
    }

    /**
     * Logout user
     */
    logout() {
        console.log('👋 Logging out user...');
        this.clearTokensAndRedirect();
    }

    /**
     * Get authentication status for debugging
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            hasTokenManager: !!this.tokenManager,
            isAuthenticated: this.isAuthenticated(),
            isTokenExpired: this.isTokenExpired(),
            hasAccessToken: !!this.getAccessToken(),
            hasRefreshToken: this.tokenManager ? !!this.tokenManager.refreshToken : false
        };
    }
}

// Create global instance
if (!window.authService) {
    window.authService = new AuthService();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}