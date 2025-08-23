/**
 * Network Debug Helper
 * Add this script to any page for quick network testing
 */
window.debugNetwork = {
    /**
     * Test basic network connectivity
     */
    async testBasicConnection() {
        console.log('🧪 Testing basic network connection...');
        
        try {
            const response = await fetch('https://httpbin.org/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Basic network test: SUCCESS');
                return true;
            } else {
                console.log('❌ Basic network test: FAILED -', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ Basic network test: ERROR -', error.message);
            return false;
        }
    },

    /**
     * Test API endpoint with HttpUtil
     */
    async testWithHttpUtil() {
        console.log('🧪 Testing with HttpUtil...');
        
        if (!window.httpUtil) {
            console.log('❌ HttpUtil not available');
            return false;
        }
        
        try {
            const response = await window.httpUtil.get('https://httpbin.org/get');
            
            if (response.ok) {
                console.log('✅ HttpUtil test: SUCCESS');
                return true;
            } else {
                console.log('❌ HttpUtil test: FAILED -', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ HttpUtil test: ERROR -', error.message);
            return false;
        }
    },

    /**
     * Test SeekTir API endpoint
     */
    async testSeekTirAPI() {
        console.log('🧪 Testing SeekTir API...');
        
        try {
            let response;
            
            if (window.httpUtil) {
                response = await window.httpUtil.get('https://api.seektir.com/v2/free');
            } else {
                response = await fetch('https://api.seektir.com/v2/free');
            }
            
            console.log('📡 SeekTir API response status:', response.status);
            
            if (response.status === 401) {
                console.log('✅ SeekTir API test: Expected 401 (authentication required)');
                return true;
            } else if (response.ok) {
                console.log('✅ SeekTir API test: SUCCESS');
                return true;
            } else {
                console.log('❌ SeekTir API test: Unexpected status -', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ SeekTir API test: ERROR -', error.message);
            
            // Check for specific Capacitor interceptor error
            if (error.message.includes('_capacitor_http_interceptor_')) {
                console.log('🔴 CAPACITOR HTTP INTERCEPTOR ERROR DETECTED!');
                console.log('This indicates the Capacitor HTTP plugin configuration needs adjustment.');
                return false;
            }
            
            return false;
        }
    },

    /**
     * Run all network tests
     */
    async runAllTests() {
        console.log('🚀 Running comprehensive network tests...');
        console.log('Environment:', {
            isCapacitor: window.Capacitor && window.Capacitor.isNativePlatform(),
            hasHttpUtil: !!window.httpUtil,
            hasAuthService: !!window.authService,
            hasTokenManager: !!window.tokenManager,
            userAgent: navigator.userAgent
        });
        
        const results = {
            basicConnection: await this.testBasicConnection(),
            httpUtil: await this.testWithHttpUtil(),
            seekTirAPI: await this.testSeekTirAPI()
        };
        
        console.log('📊 Test Results:', results);
        
        const allPassed = Object.values(results).every(Boolean);
        
        if (allPassed) {
            console.log('🎉 All network tests PASSED! The application should work correctly.');
        } else {
            console.log('⚠️ Some network tests FAILED. Check the logs above for details.');
        }
        
        return results;
    },

    /**
     * Show network environment info
     */
    showEnvironmentInfo() {
        const info = {
            platform: {
                isCapacitor: window.Capacitor && window.Capacitor.isNativePlatform(),
                capacitorPlatform: window.Capacitor ? window.Capacitor.getPlatform() : 'Not available',
                userAgent: navigator.userAgent,
                onLine: navigator.onLine
            },
            services: {
                httpUtil: !!window.httpUtil,
                authService: !!window.authService,
                tokenManager: !!window.tokenManager,
                modelService: !!window.ModelService
            },
            screen: {
                width: screen.width,
                height: screen.height,
                orientation: screen.orientation ? screen.orientation.type : 'Not available'
            }
        };
        
        console.log('🔍 Network Environment Info:', info);
        return info;
    }
};

// Auto-run basic tests when script loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 Network Debug Helper loaded');
    
    // Wait a bit for other scripts to load
    setTimeout(async () => {
        console.log('🧪 Running auto network diagnostics...');
        window.debugNetwork.showEnvironmentInfo();
        
        // Just test the problematic API call
        const apiResult = await window.debugNetwork.testSeekTirAPI();
        
        if (!apiResult) {
            console.log('⚠️ API test failed - this indicates the network connectivity issue is still present');
        } else {
            console.log('✅ API test passed - network connectivity appears to be working');
        }
    }, 2000);
});

// Make it easy to run tests from console
console.log('💡 Network Debug Helper available:');
console.log('   window.debugNetwork.runAllTests() - Run all tests');
console.log('   window.debugNetwork.testSeekTirAPI() - Test API only');
console.log('   window.debugNetwork.showEnvironmentInfo() - Show environment');