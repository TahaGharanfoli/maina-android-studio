import { CapacitorHttp } from '@capacitor/http';

class ApiService {
    constructor() {
        this.baseURL = 'https://api.seektir.com/v2';
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');

        // Check if we're in Capacitor environment
        this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
    }

    async makeRequest(endpoint, data = null, method = 'POST') {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
        };

        const options = {
            url: url,
            method: method,
            headers: headers,
            ...(data && { data: data })
        };

        try {
            let response;

            if (this.isCapacitor) {
                // Use Capacitor HTTP for native apps
                response = await CapacitorHttp.request(options);
                const result = response.data;

                if (response.status >= 400) {
                    // Handle token expiration
                    if (response.status === 401 && this.refreshToken) {
                        const refreshed = await this.refreshAccessToken();
                        if (refreshed) {
                            return this.makeRequest(endpoint, data, method);
                        }
                    }
                    throw new Error(result.message || 'Request failed');
                }

                return result;
            } else {
                // Use fetch for web/development
                const config = {
                    method: method,
                    headers: headers
                };

                if (data) {
                    config.body = JSON.stringify(data);
                }

                response = await fetch(url, config);
                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 401 && this.refreshToken) {
                        const refreshed = await this.refreshAccessToken();
                        if (refreshed) {
                            return this.makeRequest(endpoint, data, method);
                        }
                    }
                    throw new Error(result.message || 'Request failed');
                }

                return result;
            }

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                })
            });

            const result = await response.json();
            
            if (response.ok && result.data.access_token) {
                this.saveTokens(result.data.access_token, result.data.refresh_token);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    // Authentication methods
    async checkUser(phoneNumber) {
        return this.makeRequest('/user', { phone_number: phoneNumber });
    }

    async login(phoneNumber, password) {
        return this.makeRequest('/login', { phone_number: phoneNumber, password: password });
    }

    async sendCode(phoneNumber) {
        return this.makeRequest('/send-code', { phone_number: phoneNumber });
    }

    async register(phoneNumber, password, code) {
        return this.makeRequest('/register', { phone_number: phoneNumber, password: password, code: code });
    }

    // User profile methods
    async getUserProfile() {
        return this.makeRequest('/user/profile', null, 'GET');
    }

    async updateUserProfile(profileData) {
        return this.makeRequest('/user/profile', profileData, 'PUT');
    }

    async changePassword(oldPassword, newPassword) {
        return this.makeRequest('/user/change-password', {
            old_password: oldPassword,
            new_password: newPassword
        });
    }

    // Token management
    saveTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    // Utility method to check if token is expired
    isTokenExpired() {
        if (!this.accessToken) return true;
        
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}



