/**
 * HTTP Utility for Capacitor Apps
 * Handles HTTP requests with proper Capacitor compatibility
 */
class HttpUtil {
    constructor() {
        this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
        this.capacitorHttp = null;
        this.capacitorAvailable = false;
        
        console.log('🌐 HttpUtil initialized:', {
            isCapacitor: this.isCapacitor,
            platform: this.isCapacitor ? window.Capacitor.getPlatform() : 'web'
        });
    }

    /**
     * Initialize Capacitor HTTP if needed
     */
    async initCapacitorHttp() {
        if (this.isCapacitor && !this.capacitorHttp && !this.capacitorAvailable) {
            try {
                console.log('🔍 Attempting to initialize Capacitor HTTP...');
                console.log('🔍 Capacitor object:', window.Capacitor);
                console.log('🔍 Capacitor.Plugins:', window.Capacitor?.Plugins);
                
                // First priority: Community HTTP plugin via Capacitor.Plugins
                if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Http) {
                    this.capacitorHttp = window.Capacitor.Plugins.Http;
                    this.capacitorAvailable = true;
                    console.log('✅ Capacitor Community HTTP plugin available via Plugins.Http');
                    return;
                }
                
                // Second priority: Try CapacitorHttp (deprecated but might be available)
                if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp) {
                    this.capacitorHttp = window.Capacitor.Plugins.CapacitorHttp;
                    this.capacitorAvailable = true;
                    console.log('✅ Capacitor HTTP plugin available via Plugins.CapacitorHttp');
                    return;
                }
                
                // Third priority: Check if it's accessible via direct property
                if (window.CapacitorHttp) {
                    this.capacitorHttp = window.CapacitorHttp;
                    this.capacitorAvailable = true;
                    console.log('✅ Capacitor HTTP plugin available via window.CapacitorHttp');
                    return;
                }
                
                // If no plugin found, log available plugins for debugging
                const availablePlugins = window.Capacitor?.Plugins ? Object.keys(window.Capacitor.Plugins) : [];
                console.warn('⚠️ No HTTP plugin found. Available plugins:', availablePlugins);
                
                this.capacitorHttp = null;
                this.capacitorAvailable = false;
                
            } catch (error) {
                console.warn('⚠️ Capacitor HTTP initialization failed, will use fetch only:', error);
                console.log('🔍 Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                this.capacitorHttp = null;
                this.capacitorAvailable = false;
            }
        }
    }

    /**
     * Force plugin initialization and return detailed status
     */
    async forcePluginInit() {
        console.log('🔧 Forcing Capacitor HTTP plugin initialization...');
        
        if (!this.isCapacitor) {
            return {
                success: false,
                reason: 'Not in Capacitor environment',
                details: { isCapacitor: false }
            };
        }
        
        try {
            // Clear any existing state
            this.capacitorHttp = null;
            this.capacitorAvailable = false;
            
            // Try to initialize
            await this.initCapacitorHttp();
            
            if (this.capacitorAvailable && this.capacitorHttp) {
                return {
                    success: true,
                    pluginType: this.capacitorHttp.constructor.name,
                    details: {
                        isCapacitor: this.isCapacitor,
                        capacitorAvailable: this.capacitorAvailable,
                        capacitorHttp: !!this.capacitorHttp,
                        pluginName: this.capacitorHttp.constructor.name
                    }
                };
            } else {
                return {
                    success: false,
                    reason: 'Plugin initialization failed',
                    details: {
                        isCapacitor: this.isCapacitor,
                        capacitorAvailable: this.capacitorAvailable,
                        capacitorHttp: !!this.capacitorHttp,
                        capacitorObject: !!window.Capacitor,
                        capacitorPlugins: !!(window.Capacitor && window.Capacitor.Plugins),
                        availablePlugins: window.Capacitor?.Plugins ? Object.keys(window.Capacitor.Plugins) : []
                    }
                };
            }
        } catch (error) {
            return {
                success: false,
                reason: `Initialization error: ${error.message}`,
                error: error,
                details: {
                    isCapacitor: this.isCapacitor,
                    capacitorObject: !!window.Capacitor,
                    capacitorPlugins: !!(window.Capacitor && window.Capacitor.Plugins)
                }
            };
        }
    }

    /**
     * Make HTTP request with platform detection
     */
    async request(url, options = {}) {
        console.log(`🌐 HttpUtil making request to: ${url}`);
        console.log(`🔍 Request options:`, options);
        
        try {
            // For Capacitor native environment, always try Capacitor HTTP first
            if (this.isCapacitor) {
                await this.initCapacitorHttp();
                
                if (this.capacitorAvailable && this.capacitorHttp) {
                    try {
                        console.log('📡 Using Capacitor HTTP plugin...');
                        const response = await this.makeCapacitorRequest(url, options);
                        console.log('✅ Capacitor HTTP request successful');
                        return response;
                    } catch (capacitorError) {
                        console.warn('⚠️ Capacitor HTTP failed:', capacitorError);
                        // Don't fall back to fetch in Capacitor - this will cause CORS
                        throw new Error(`Capacitor HTTP failed: ${capacitorError.message}. Cannot use fetch in Capacitor due to CORS restrictions.`);
                    }
                } else {
                    console.error('❌ Capacitor HTTP plugin not available in native environment');
                    throw new Error('Capacitor HTTP plugin not available. This is required for network requests in native apps.');
                }
            }
            
            // For web environment, use fetch
            console.log('📡 Using standard fetch for web environment...');
            const response = await this.makeFetchRequest(url, options);
            console.log('✅ Fetch request successful');
            return response;
            
        } catch (error) {
            console.error('❌ HttpUtil request failed:', error);
            throw error;
        }
    }

    /**
     * Make request using Capacitor HTTP
     */
    async makeCapacitorRequest(url, options) {
        try {
            const requestOptions = {
                url: url,
                method: options.method || 'GET',
                headers: options.headers || {},
                connectTimeout: 30000,
                readTimeout: 30000
            };

            // Handle request body for POST/PUT requests
            if (options.body) {
                // If body is already a string (JSON), parse it back to object for Capacitor HTTP
                if (typeof options.body === 'string') {
                    try {
                        requestOptions.data = JSON.parse(options.body);
                    } catch (e) {
                        // If parsing fails, treat as plain text
                        requestOptions.data = options.body;
                    }
                } else {
                    requestOptions.data = options.body;
                }
            }

            console.log('📡 Using Capacitor HTTP:', {
                url: requestOptions.url,
                method: requestOptions.method,
                headers: requestOptions.headers,
                hasData: !!requestOptions.data
            });
            
            const response = await this.capacitorHttp.request(requestOptions);
            
            console.log('✅ Capacitor HTTP response:', {
                status: response.status,
                headers: response.headers,
                dataType: typeof response.data
            });

            // Create fetch-compatible response object
            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                statusText: this.getStatusText(response.status),
                headers: new Map(Object.entries(response.headers || {})),
                json: async () => {
                    // If data is already an object, return it; if string, parse it
                    return typeof response.data === 'object' ? response.data : JSON.parse(response.data);
                },
                text: async () => {
                    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                }
            };
        } catch (error) {
            console.error('❌ Capacitor HTTP request failed:', error);
            // Provide more detailed error information
            throw new Error(`Capacitor HTTP Error: ${error.message || 'Unknown error'} (${error.code || 'NO_CODE'})`);
        }
    }
    
    /**
     * Get HTTP status text for a given status code
     */
    getStatusText(status) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
        return statusTexts[status] || `Status ${status}`;
    }

    /**
     * Make request using standard fetch
     */
    async makeFetchRequest(url, options) {
        try {
            console.log('📡 Using standard fetch:', { url, method: options.method || 'GET' });
            
            // Ensure we're not using file:// URLs
            if (url.startsWith('file://')) {
                throw new Error('File:// URLs are not supported');
            }
            
            const response = await fetch(url, {
                ...options,
                // Add timeout using AbortController
                signal: AbortSignal.timeout(30000)
            });

            console.log('✅ Fetch response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            return response;
        } catch (error) {
            console.error('❌ Fetch request failed:', error);
            console.log('🔍 Fetch error details:', {
                name: error.name,
                message: error.message
            });
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(url, headers = {}) {
        return this.request(url, {
            method: 'GET',
            headers: headers
        });
    }

    /**
     * POST request
     */
    async post(url, data = null, headers = {}) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        return this.request(url, options);
    }

    /**
     * PUT request
     */
    async put(url, data = null, headers = {}) {
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        return this.request(url, options);
    }

    /**
     * DELETE request
     */
    async delete(url, headers = {}) {
        return this.request(url, {
            method: 'DELETE',
            headers: headers
        });
    }

    /**
     * Test HTTP functionality
     */
    async testHttpFunctionality() {
        console.log('🧪 Testing HTTP functionality...');
        
        const testUrl = 'https://httpbin.org/get';
        const results = {
            capacitorAvailable: false,
            capacitorWorking: false,
            fetchWorking: false,
            pluginType: 'none',
            pluginDetails: {},
            errors: []
        };
        
        try {
            // Test Capacitor HTTP availability
            if (this.isCapacitor) {
                console.log('🔍 Testing Capacitor environment...');
                console.log('🔍 Capacitor object:', window.Capacitor);
                console.log('🔍 Capacitor.Plugins:', window.Capacitor?.Plugins);
                
                await this.initCapacitorHttp();
                results.capacitorAvailable = this.capacitorAvailable;
                results.pluginDetails = {
                    isCapacitor: this.isCapacitor,
                    capacitorAvailable: this.capacitorAvailable,
                    capacitorHttp: !!this.capacitorHttp,
                    pluginName: this.capacitorHttp ? this.capacitorHttp.constructor.name : 'none'
                };
                
                if (this.capacitorAvailable && this.capacitorHttp) {
                    try {
                        console.log('🧪 Testing Capacitor HTTP...');
                        const response = await this.makeCapacitorRequest(testUrl, {});
                        results.capacitorWorking = true;
                        
                        // Determine plugin type
                        if (this.capacitorHttp.constructor.name.includes('HttpCommunity')) {
                            results.pluginType = 'community';
                        } else if (this.capacitorHttp.constructor.name.includes('CapacitorHttp')) {
                            results.pluginType = 'deprecated';
                        } else {
                            results.pluginType = 'unknown';
                        }
                        
                        console.log('✅ Capacitor HTTP test successful');
                    } catch (error) {
                        results.errors.push(`Capacitor HTTP: ${error.message}`);
                        console.error('❌ Capacitor HTTP test failed:', error);
                    }
                } else {
                    console.log('⚠️ Capacitor HTTP plugin not available');
                    results.errors.push('Capacitor HTTP plugin not available');
                }
            }
            
            // Test standard fetch
            try {
                console.log('🧪 Testing standard fetch...');
                const response = await this.makeFetchRequest(testUrl, {});
                results.fetchWorking = true;
                console.log('✅ Standard fetch test successful');
            } catch (error) {
                results.errors.push(`Standard fetch: ${error.message}`);
                console.error('❌ Standard fetch test failed:', error);
            }
            
        } catch (error) {
            results.errors.push(`General test: ${error.message}`);
            console.error('❌ HTTP functionality test failed:', error);
        }
        
        console.log('📊 HTTP functionality test results:', results);
        return results;
    }
}

// Create global instance
if (!window.httpUtil) {
    window.httpUtil = new HttpUtil();
    
    // Expose test method globally for debugging
    window.testHttpFunctionality = () => {
        return window.httpUtil.testHttpFunctionality();
    };
    
    // Expose force plugin init method
    window.forcePluginInit = () => {
        return window.httpUtil.forcePluginInit();
    };
    
    // Expose diagnostic info
    window.getHttpDiagnostics = () => {
        const diagnostics = {
            isCapacitor: window.httpUtil.isCapacitor,
            capacitorAvailable: window.httpUtil.capacitorAvailable,
            capacitorHttp: !!window.httpUtil.capacitorHttp,
            platform: window.Capacitor ? window.Capacitor.getPlatform() : 'web',
            capacitorObject: !!window.Capacitor,
            capacitorPlugins: !!(window.Capacitor && window.Capacitor.Plugins),
            pluginType: 'none'
        };
        
        if (window.httpUtil.capacitorHttp) {
            try {
                if (window.httpUtil.capacitorHttp.constructor.name.includes('HttpCommunity')) {
                    diagnostics.pluginType = 'community';
                } else if (window.httpUtil.capacitorHttp.constructor.name.includes('CapacitorHttp')) {
                    diagnostics.pluginType = 'deprecated';
                } else {
                    diagnostics.pluginType = 'unknown';
                }
            } catch (e) {
                diagnostics.pluginType = 'error';
            }
        }
        
        return diagnostics;
    };
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HttpUtil;
}