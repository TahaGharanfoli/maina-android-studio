class VoiceConversionService {
    constructor() {
        this.baseURL = 'https://api.seektir.com/v2';
        this.httpUtil = window.httpUtil;
        this.tokenManager = window.tokenManager;
        this.authService = window.authService;
        
        // Check if we're in Capacitor environment
        this.isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
        
        console.log('🔧 VoiceConversionService initialized:', {
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

    /**
     * Upload voice file to the server
     * @param {File} audioFile - The audio file to upload
     * @returns {Promise<Object>} Upload response with voice_id, duration, format
     */
    async uploadVoice(audioFile) {
        try {
            console.log('🎵 Uploading voice file:');
            console.log('  - Name:', audioFile.name);
            console.log('  - Type:', audioFile.type);
            console.log('  - Size:', audioFile.size);
            console.log('  - Last Modified:', new Date(audioFile.lastModified));
            
            // Check authentication
            if (!this.tokenManager || !this.tokenManager.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const accessToken = this.tokenManager.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            // Validate file type - prioritize WAV and MP3 for server compatibility
            const validAudioTypes = [
                'audio/wav', 'audio/mp3', 'audio/mpeg',  // Preferred formats
                'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac',  // Supported formats
                'audio/webm', 'audio/mp4', 'audio/x-m4a'  // Fallback formats
            ];

            const isValidAudio = audioFile.type.startsWith('audio/') ||
                               validAudioTypes.includes(audioFile.type) ||
                               /\.(wav|mp3|ogg|aac|m4a|flac|webm|mp4)$/i.test(audioFile.name);

            console.log('🔍 File validation:');
            console.log('  - File type:', audioFile.type);
            console.log('  - File name:', audioFile.name);
            console.log('  - Starts with audio/:', audioFile.type.startsWith('audio/'));
            console.log('  - In valid types:', validAudioTypes.includes(audioFile.type));
            console.log('  - Extension match:', /\.(wav|mp3|ogg|aac|m4a|flac|webm|mp4)$/i.test(audioFile.name));
            console.log('  - Final result:', isValidAudio);

            if (!isValidAudio) {
                throw new Error('Invalid audio file format. Please select a valid audio file.');
            }

            // Check file size (limit to 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (audioFile.size > maxSize) {
                throw new Error('File is too large. Please select a file smaller than 50MB.');
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('voice', audioFile);

            console.log('📡 Uploading to:', `${this.baseURL}/upload-voice`);
            console.log('📝 FormData contents:');
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`  - ${pair[0]}: File(${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)`);
                } else {
                    console.log(`  - ${pair[0]}: ${pair[1]}`);
                }
            }

            // Use fetch for all environments (file uploads work consistently with fetch)
            // Capacitor can handle fetch for file uploads when properly configured
            console.log('📡 Using fetch for file upload (works in all environments)');
            
            const response = await fetch(`${this.baseURL}/upload-voice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData
            });

            console.log('📡 Upload response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Upload failed:');
                console.error('  - Status:', response.status);
                console.error('  - Status Text:', response.statusText);
                console.error('  - Response:', errorText);
                
                // Try to parse error response for more details
                try {
                    const errorData = JSON.parse(errorText);
                    console.error('  - Parsed Error:', errorData);
                    if (errorData.message) {
                        console.error('  - Server Message:', errorData.message);
                    }
                } catch (parseError) {
                    console.error('  - Could not parse error response');
                }
                
                // Handle token expiration
                if (response.status === 401) {
                    if (this.tokenManager.refreshAccessToken) {
                        try {
                            await this.tokenManager.refreshAccessToken();
                            // Retry upload with new token
                            return await this.uploadVoice(audioFile);
                        } catch (refreshError) {
                            console.error('❌ Token refresh failed:', refreshError);
                            throw new Error('Authentication failed - please login again');
                        }
                    }
                }
                
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Voice uploaded successfully:', result);

            if (!result.success) {
                throw new Error(result.message || 'Upload failed');
            }

            return result.data;

        } catch (error) {
            console.error('❌ Voice upload error:', error);
            throw error;
        }
    }

    /**
     * Start voice conversion process using WebSocket for real-time updates
     * @param {Object} conversionParams - Conversion parameters
     * @param {Function} onProgress - Progress callback function
     * @param {Function} onComplete - Completion callback function
     * @param {Function} onError - Error callback function
     * @returns {WebSocket} WebSocket connection
     */
    startConversionWebSocket(conversionParams, onProgress, onComplete, onError) {
        try {
            console.log('🔌 Starting WebSocket voice conversion with params:', conversionParams);
            
            // Check authentication
            if (!this.tokenManager || !this.tokenManager.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const accessToken = this.tokenManager.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            // Validate required parameters
            if (!conversionParams.voice_id || !conversionParams.model_id) {
                throw new Error('Missing required parameters: voice_id and model_id');
            }

            // Validate conversion parameters
            this.validateConversionParams(conversionParams);

            const wsUrl = 'wss://api.seektir.com/tel/convert';
            console.log('📡 Connecting to WebSocket:', wsUrl);
            
            const ws = new WebSocket(wsUrl);
            let conversionStarted = false;
            
            ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                
                // Send authentication and conversion data
                const wsData = {
                    token: accessToken,
                    ...conversionParams
                };
                
                console.log('📤 Sending conversion request:', wsData);
                ws.send(JSON.stringify(wsData));
                conversionStarted = true;
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message:', data);
                    
                    switch (data.type) {
                        case 'progress':
                            if (onProgress) onProgress(data.progress, data.message);
                            break;
                        case 'complete':
                        case 'completed':
                            if (onComplete) onComplete(data.result || data);
                            ws.close();
                            break;
                        case 'error':
                            if (onError) onError(data.error || data.message);
                            ws.close();
                            break;
                        case 'started':
                            console.log('🚀 Conversion started');
                            if (onProgress) onProgress(5, 'Conversion started...');
                            break;
                        default:
                            console.log('ℹ️ WebSocket info:', data);
                            if (data.message && onProgress) {
                                onProgress(data.progress || 10, data.message);
                            }
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse WebSocket message:', parseError);
                    if (onError) onError('Failed to parse server response');
                }
            };
            
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                if (onError) onError('WebSocket connection failed');
            };
            
            ws.onclose = (event) => {
                console.log('🔌 WebSocket closed:', event.code, event.reason);
                
                if (!conversionStarted && onError) {
                    onError('Connection closed before conversion started');
                } else if (event.code !== 1000 && onError) {
                    onError(`Connection lost: ${event.reason || 'Unknown error'}`);
                }
            };
            
            return ws;
            
        } catch (error) {
            console.error('❌ WebSocket conversion setup failed:', error);
            if (onError) onError(error.message);
            return null;
        }
    }

    /**
     * Check conversion status (for future WebSocket implementation)
     * @param {string} conversionId - Conversion job ID
     * @returns {Promise<Object>} Status response
     */
    async checkConversionStatus(conversionId) {
        try {
            console.log('🔍 Checking conversion status for:', conversionId);
            
            await this.ensureServices();
            
            if (!this.tokenManager.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const accessToken = this.tokenManager.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            let result;
            
            // Use HttpUtil for standardized network requests
            const url = `${this.baseURL}/convert/status/${conversionId}`;
            const response = await this.httpUtil.get(url, {
                'Authorization': `Bearer ${accessToken}`
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status check failed: ${response.status} - ${errorText}`);
            }

            result = await response.json();
            
            console.log('📊 Conversion status:', result);

            return result.data;

        } catch (error) {
            console.error('❌ Status check error:', error);
            throw error;
        }
    }

    /**
     * Setup WebSocket connection for real-time conversion updates (Legacy method)
     * @param {string} conversionId - Conversion job ID (optional for new implementation)
     * @param {Function} onProgress - Progress callback function
     * @param {Function} onComplete - Completion callback function
     * @param {Function} onError - Error callback function
     * @returns {WebSocket} WebSocket connection
     */
    setupWebSocketConnection(conversionId, onProgress, onComplete, onError) {
        console.log('⚠️ Legacy setupWebSocketConnection method called. Use startConversionWebSocket instead.');
        
        // For backward compatibility, create a basic WebSocket connection
        try {
            const wsUrl = 'wss://api.seektir.com/v2/convert';
            console.log('🔌 Setting up WebSocket for conversion:', conversionId || 'direct');
            
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                // Send authentication token for legacy compatibility
                const token = this.tokenManager.getAccessToken();
                if (token) {
                    ws.send(JSON.stringify({ type: 'auth', token: token }));
                }
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message:', data);
                    
                    switch (data.type) {
                        case 'progress':
                            if (onProgress) onProgress(data.progress, data.message);
                            break;
                        case 'complete':
                            if (onComplete) onComplete(data.result);
                            ws.close();
                            break;
                        case 'error':
                            if (onError) onError(data.error);
                            ws.close();
                            break;
                    }
                } catch (parseError) {
                    console.error('❌ WebSocket message parse error:', parseError);
                }
            };
            
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                if (onError) onError('WebSocket connection error');
            };
            
            ws.onclose = () => {
                console.log('🔌 WebSocket connection closed');
            };
            
            return ws;
            
        } catch (error) {
            console.error('❌ WebSocket setup error:', error);
            if (onError) onError('Failed to setup WebSocket connection');
            return null;
        }
    }

    /**
     * Validate conversion parameters
     * @param {Object} params - Conversion parameters to validate
     * @returns {boolean} Whether parameters are valid
     */
    validateConversionParams(params) {
        const required = ['voice_id', 'model_id', 'export_format'];
        
        for (const field of required) {
            if (params[field] === undefined || params[field] === null) {
                throw new Error(`Missing required parameter: ${field}`);
            }
        }

        // Validate export format
        const validFormats = ['wav', 'mp3', 'flac'];
        if (!validFormats.includes(params.export_format)) {
            throw new Error(`Invalid export format. Must be one of: ${validFormats.join(', ')}`);
        }

        // Validate numeric ranges
        if (params.f0UpKey !== undefined) {
            if (params.f0UpKey < -12 || params.f0UpKey > 12) {
                throw new Error('f0UpKey must be between -12 and 12');
            }
        }

        if (params.filter_radius !== undefined) {
            if (params.filter_radius < 0 || params.filter_radius > 7) {
                throw new Error('filter_radius must be between 0 and 7');
            }
        }

        if (params.index_rate !== undefined) {
            if (params.index_rate < 0 || params.index_rate > 1) {
                throw new Error('index_rate must be between 0 and 1');
            }
        }

        return true;
    }
}

// Export for use in other files
window.VoiceConversionService = VoiceConversionService;