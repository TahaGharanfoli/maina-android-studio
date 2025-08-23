class TokenManager {
    constructor() {
        try {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
            this.tokenExpiry = localStorage.getItem('tokenExpiry');
            this.baseURL = 'https://api.seektir.com/v2';
            
            // Check if we're in Capacitor environment
            this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
        } catch (error) {
            console.error('❌ Error initializing TokenManager:', error);
            // Initialize with null values if localStorage fails
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.baseURL = 'https://api.seektir.com/v2';
            this.isCapacitor = false;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        // Check for temporary token first
        try {
            const tempToken = sessionStorage.getItem('tempAuthToken');
            if (tempToken) {
                console.log('🔑 Authenticated via temporary token');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Could not access sessionStorage for temp token check');
        }
        
        // Fall back to stored tokens
        return !!(this.accessToken && this.refreshToken);
    }

    // Check if token is expired
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        return Date.now() > parseInt(this.tokenExpiry);
    }

    // Save tokens to localStorage
    saveTokens(accessToken, refreshToken, expiresIn = 3600) {
        try {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenExpiry = Date.now() + (expiresIn * 1000);

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
        } catch (error) {
            console.error('❌ Error saving tokens:', error);
            // Still update the instance variables even if localStorage fails
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenExpiry = Date.now() + (expiresIn * 1000);
        }
    }

    // Clear all tokens
    clearTokens() {
        try {
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            
            // Also clear temporary tokens
            sessionStorage.removeItem('tempAuthToken');
        } catch (error) {
            console.error('❌ Error clearing tokens:', error);
            // Still clear the instance variables even if localStorage fails
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
        }
    }
    
    // Clear temporary tokens only (for cross-window auth cleanup)
    clearTempTokens() {
        try {
            sessionStorage.removeItem('tempAuthToken');
            console.log('🧹 Temporary tokens cleared');
        } catch (error) {
            console.error('❌ Error clearing temporary tokens:', error);
        }
    }

    // Get current access token
    getAccessToken() {
        // First check for temporary token from sessionStorage (for cross-window auth)
        try {
            const tempToken = sessionStorage.getItem('tempAuthToken');
            if (tempToken) {
                console.log('🔑 Using temporary token from sessionStorage');
                return tempToken;
            }
        } catch (error) {
            console.log('⚠️ Could not access sessionStorage for temp token');
        }
        
        // Fall back to stored token
        return this.accessToken;
    }

    // Refresh access token using refresh token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            // Use fetch for all environments (Capacitor will intercept when properly configured)
            const response = await fetch(`${this.baseURL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.refreshToken}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Token refresh failed');
            }

            // Save new tokens
            this.saveTokens(
                result.data.access_token,
                result.data.refresh_token,
                result.data.expires_in
            );

            return result.data.access_token;
        } catch (error) {
            // If refresh fails, clear tokens and redirect to auth
            this.clearTokens();
            this.redirectToAuth();
            throw error;
        }
    }

    // Make authenticated API request with automatic token refresh
    async makeAuthenticatedRequest(endpoint, data = null, method = 'POST') {
        // Check if token is expired and refresh if needed
        if (this.isTokenExpired()) {
            await this.refreshAccessToken();
        }

        const url = `${this.baseURL}${endpoint}`;
        
        // Use fetch for all environments (Capacitor will intercept when properly configured)
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAccessToken()}`
            }
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token is invalid, try to refresh
                    await this.refreshAccessToken();
                    // Retry the request with new token
                    config.headers.Authorization = `Bearer ${this.getAccessToken()}`;
                    const retryResponse = await fetch(url, config);
                    const retryResult = await retryResponse.json();
                    
                    if (!retryResponse.ok) {
                        throw new Error(retryResult.message || 'Request failed after token refresh');
                    }
                    return retryResult;
                }
                throw new Error(result.message || `HTTP ${response.status}: Request failed`);
            }

            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Redirect to authentication page
    redirectToAuth() {
        try {
            if (!window.location.pathname.includes('auth.html')) {
                window.location.href = 'auth.html';
            }
        } catch (error) {
            console.error('❌ Error redirecting to auth:', error);
        }
    }

    // Redirect to main app
    redirectToMain() {
        try {
            if (window.location.pathname.includes('auth.html')) {
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.error('❌ Error redirecting to main:', error);
        }
    }

    // Logout user
    logout() {
        this.clearTokens();
        this.redirectToAuth();
    }

    // Initialize authentication check
    initAuthCheck() {
        // If no tokens, redirect to auth
        if (!this.isAuthenticated()) {
            this.redirectToAuth();
            return false;
        }

        // If token is expired, try to refresh
        if (this.isTokenExpired()) {
            this.refreshAccessToken().catch(() => {
                this.redirectToAuth();
            });
        }

        return true;
    }
}

// Global token manager instance
window.tokenManager = new TokenManager();
