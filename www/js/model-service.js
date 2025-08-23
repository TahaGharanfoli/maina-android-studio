class ModelService {
    constructor() {
        this.baseURL = 'https://api.seektir.com/v2';
        this.httpUtil = window.httpUtil;
        this.tokenManager = window.tokenManager;
        
        // Check if we're in Capacitor environment
        this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
        
        console.log('🔧 ModelService initialized:', {
            baseURL: this.baseURL,
            httpUtil: !!this.httpUtil,
            tokenManager: !!this.tokenManager,
            isCapacitor: this.isCapacitor
        });
    }

    // Ensure required services are available
    async ensureServices() {
        // Wait for HttpUtil to be available
        if (!this.httpUtil) {
            let attempts = 0;
            while (!window.httpUtil && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            this.httpUtil = window.httpUtil;
        }
        
        // Wait for TokenManager to be available
        if (!this.tokenManager) {
            let attempts = 0;
            while (!window.tokenManager && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            this.tokenManager = window.tokenManager;
        }
        
        if (!this.httpUtil) {
            throw new Error('HttpUtil not available');
        }
        
        if (!this.tokenManager) {
            throw new Error('TokenManager not available');
        }
    }

    // Test API connection
    async testConnection() {
        try {
            console.log('🔍 Testing API connection...');
            await this.ensureServices();
            
            // Try to get free models as a test endpoint
            const testData = await this.getFreeModels();
            console.log('✅ API connection successful:', testData);
            return true;
        } catch (error) {
            console.error('❌ API connection test failed:', error);
            return false;
        }
    }

    // Make authenticated request using HttpUtil
    async makeRequest(endpoint, method = 'GET', data = null) {
        await this.ensureServices();
        
        // Check if user is authenticated
        if (!this.tokenManager.isAuthenticated()) {
            throw new Error('User not authenticated');
        }
        
        const url = `${this.baseURL}${endpoint}`;
        console.log(`🌐 Making ${method} request to: ${url}`);
        
        // Check and refresh token if needed
        if (this.tokenManager.isTokenExpired()) {
            console.log('🔄 Token expired, refreshing before request...');
            try {
                await this.tokenManager.refreshAccessToken();
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                throw new Error('Authentication failed - please login again');
            }
        }
        
        // Get access token
        const accessToken = this.tokenManager.getAccessToken();
        if (!accessToken) {
            throw new Error('No access token available');
        }
        
        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'User-Agent': 'SonicAI-Mobile/1.0'
            }
        };

        if (data) {
            requestOptions.body = JSON.stringify(data);
        }

        try {
            const response = await this.httpUtil.request(url, requestOptions);
            
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
                        await this.tokenManager.refreshAccessToken();
                        
                        // Retry the request with new token
                        const newToken = this.tokenManager.getAccessToken();
                        requestOptions.headers.Authorization = `Bearer ${newToken}`;
                        
                        console.log('🔄 Retrying request with new token...');
                        const retryResponse = await this.httpUtil.request(url, requestOptions);
                        
                        if (!retryResponse.ok) {
                            let retryResult;
                            try {
                                retryResult = await retryResponse.json();
                            } catch (e) {
                                retryResult = { message: `HTTP ${retryResponse.status}: Request failed after token refresh` };
                            }
                            throw new Error(retryResult.message || `HTTP ${retryResponse.status}: Request failed after token refresh`);
                        }
                        
                        const result = await retryResponse.json();
                        console.log('✅ Request successful after token refresh:', result);
                        return result;
                        
                    } catch (refreshError) {
                        console.error('❌ Token refresh failed during request:', refreshError);
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
            
            const result = await response.json();
            console.log('✅ Request successful:', result);
            return result;
            
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    async getFreeModels() {
        try {
            console.log('🔍 Getting free models from /free endpoint...');
            const response = await this.makeRequest('/free');
            console.log('✅ Free models retrieved successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to get free models:', error);
            throw error;
        }
    }

    async getPaidModels() {
        try {
            console.log('🔍 Getting paid models from /paid endpoint...');
            const response = await this.makeRequest('/paid');
            console.log('✅ Paid models retrieved successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to get paid models:', error);
            throw error;
        }
    }

    async getShopModels() {
        try {
            console.log('🔍 Getting shop models from /shop endpoint...');
            const response = await this.makeRequest('/shop');
            console.log('✅ Shop models retrieved successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to get shop models:', error);
            throw error;
        }
    }

    // Get available API endpoints
    async getAvailableEndpoints() {
        try {
            console.log('🔍 Discovering available API endpoints...');
            
            // Test the known working endpoints
            const knownEndpoints = ['/free', '/paid', '/shop'];
            const availableEndpoints = [];
            
            for (const endpoint of knownEndpoints) {
                try {
                    await this.makeRequest(endpoint);
                    availableEndpoints.push(endpoint);
                    console.log(`✅ Endpoint available: ${endpoint}`);
                } catch (error) {
                    console.log(`❌ Endpoint test failed: ${endpoint}`, error.message);
                }
            }
            
            console.log('📋 Available endpoints:', availableEndpoints);
            return availableEndpoints;
        } catch (error) {
            console.error('❌ Failed to discover endpoints:', error);
            return [];
        }
    }
}

// Export for use in other files
window.ModelService = ModelService;
