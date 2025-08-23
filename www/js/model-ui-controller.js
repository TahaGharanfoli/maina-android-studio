class ModelUIController {
    constructor() {
        console.log('🚀 ModelUIController constructor called');
        this.currentTab = 'free';
        this.selectedModel = null;
        this.modelsData = {
            free: [],
            shop: [],
            orders: []
        };
        
        // Check token manager availability
        console.log('🔑 Token manager in constructor:', !!window.tokenManager);
        console.log('🔑 Token manager authenticated:', window.tokenManager?.isAuthenticated());
        
        this.modelService = new ModelService();
        console.log('🔧 ModelService created:', !!this.modelService);
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing ModelUIController...');
        this.attachEventListeners();
        this.loadModels('free');
    }

    attachEventListeners() {
        // Back arrow functionality
        document.getElementById('backArrow').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'home.html';
            }
        });

        // Tab functionality
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.handleTabChange(button);
            });
        });

        // Filter dropdown
        const toggleFilterBtn = document.getElementById('toggleFilterBtn');
        const filterDropdown = document.getElementById('filterDropdown');

        toggleFilterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!filterDropdown.contains(event.target) && !toggleFilterBtn.contains(event.target)) {
                filterDropdown.classList.remove('show');
            }
        });

        // Filter options
        document.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                option.classList.toggle('selected');
                this.applyFilters();
            });
        });

        // Use model button
        document.querySelector('.use-model-btn').addEventListener('click', () => {
            this.handleUseModel();
        });

        // Load more button
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            console.log('Load more models');
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', (event) => {
            this.handleSearch(event.target.value);
        });
    }

    handleTabChange(clickedButton) {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active to clicked tab
        clickedButton.classList.add('active');
        
        // Determine which tab was clicked
        const tabText = clickedButton.textContent.toLowerCase();
        if (tabText.includes('free')) {
            this.currentTab = 'free';
        } else if (tabText.includes('shop')) {
            this.currentTab = 'shop';
        } else if (tabText.includes('paid')) {
            this.currentTab = 'orders';
        }
        
        // Clear selection and hide use model button
        this.selectedModel = null;
        document.querySelector('.use-model-btn').classList.remove('show');
        
        // Load new models
        this.loadModels(this.currentTab);
    }

    async loadModels(tab = 'free') {
        try {
            console.log(`🔄 Loading models for tab: ${tab}`);
            
            let response;
            
            switch(tab) {
                case 'free':
                    response = await this.modelService.getFreeModels();
                    this.modelsData.free = response.data?.data || [];
                    this.renderModels(this.modelsData.free);
                    break;
                case 'shop':
                    response = await this.modelService.getShopModels();
                    this.modelsData.shop = response.data?.data || [];
                    this.renderModels(this.modelsData.shop);
                    break;
                case 'orders':
                    response = await this.modelService.getPaidModels();
                    this.modelsData.orders = response.data?.data || [];
                    this.renderModels(this.modelsData.orders);
                    break;
            }
            
            console.log(`✅ Models loaded for ${tab}:`, this.modelsData[tab]);
        } catch (error) {
            console.error('❌ Failed to load models:', error);
            
            // Try to discover available endpoints
            if (error.message.includes('API connection test failed') || error.message.includes('All free model endpoints failed')) {
                console.log('🔍 Attempting to discover available endpoints...');
                const availableEndpoints = await this.modelService.getAvailableEndpoints();
                
                if (availableEndpoints.length > 0) {
                    this.showErrorMessage(`API endpoints found: ${availableEndpoints.join(', ')}. Please check the correct endpoint for models.`);
                } else {
                    this.showErrorMessage('No API endpoints available. Please check your authentication and API configuration.');
                }
            } else {
                this.showErrorMessage(`Failed to load models: ${error.message}`);
            }
        }
    }

    renderModels(models) {
        const modelsGrid = document.getElementById('modelsGrid');
        
        if (!models || models.length === 0) {
            modelsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--black-400); padding: 2rem;">
                    <div>No models available</div>
                    <div style="margin-top: 1rem; font-size: 0.9em;">
                        <button onclick="window.modelUIController.discoverEndpoints()" 
                                style="background: var(--gradient-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
                            Discover API Endpoints
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        modelsGrid.innerHTML = models.map(model => this.createModelCard(model)).join('');
        
        // Add event listeners to new cards
        this.attachModelCardListeners();
    }

    createModelCard(model) {
        const displayName = model.display || model.name;
        const imageUrl = model.image_file || 'https://mynaa.ir/assets/images/orderpic.jpg';
        const epochValue = model.epoch || 0;
        
        return `
            <div class="model-card" data-model-id="${model.id}" data-model-name="${model.name}">
                <div class="card-epack">${epochValue}</div>
                <div class="card-play-btn" data-sample="${model.sample1 || ''}">
                    <i class="fas fa-play"></i>
                </div>
                <img src="${imageUrl}" alt="${displayName}" class="model-avatar" onerror="this.src='https://mynaa.ir/assets/images/orderpic.jpg'">
                <div class="model-name">${displayName}</div>
                <div class="model-tags">
                    <div class="tag-row">
                        <span class="tag">${model.category1 || ''}</span>
                        <span class="tag">${model.category2 || ''}</span>
                        <span class="tag">${model.category3 || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }

    attachModelCardListeners() {
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('.card-play-btn') || event.target.closest('.card-epack')) {
                    return;
                }
                
                this.selectModelCard(card);
            });
        });

        // Play button functionality
        document.querySelectorAll('.card-play-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.playSample(btn.dataset.sample);
            });
        });

        // Epack info
        document.querySelectorAll('.card-epack').forEach(epack => {
            epack.addEventListener('click', (event) => {
                event.stopPropagation();
                this.showEpackInfo();
            });
        });
    }

    selectModelCard(card) {
        // Remove selection from all cards
        document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
        
        // Select this card
        card.classList.add('selected');
        
        // Store selected model
        this.selectedModel = {
            id: card.dataset.modelId,
            name: card.dataset.modelName,
            displayName: card.querySelector('.model-name').textContent
        };
        
        // Show use model button
        document.querySelector('.use-model-btn').classList.add('show');
    }

    playSample(sampleUrl) {
        if (sampleUrl) {
            const audio = new Audio(sampleUrl);
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showEpackInfo() {
        alert('The Epoch metric indicates the quality of a voice model. Generally, a higher Epoch value signifies superior voice model quality and better pronunciation of words.');
    }

    applyFilters() {
        const selectedFilters = {
            type: [],
            gender: [],
            language: []
        };
        
        document.querySelectorAll('.filter-option.selected').forEach(option => {
            const filterType = option.dataset.filterType;
            const filterValue = option.textContent.trim();
            
            if (selectedFilters[filterType]) {
                selectedFilters[filterType].push(filterValue.toLowerCase());
            }
        });
        
        // Filter current models
        const currentModels = this.modelsData[this.currentTab] || [];
        const filteredModels = currentModels.filter(model => {
            // Check if model matches all selected filters
            const matchesType = selectedFilters.type.length === 0 || 
                selectedFilters.type.some(type => 
                    (model.category2 || '').toLowerCase().includes(type)
                );
            
            const matchesGender = selectedFilters.gender.length === 0 || 
                selectedFilters.gender.some(gender => 
                    (model.category1 || '').toLowerCase().includes(gender === 'male' ? 'مرد' : 'زن') ||
                    (model.category1 || '').toLowerCase().includes(gender)
                );
            
            const matchesLanguage = selectedFilters.language.length === 0 || 
                selectedFilters.language.some(lang => 
                    (model.category3 || '').toLowerCase().includes(lang === 'farsi' ? 'فارسی' : lang)
                );
            
            return matchesType && matchesGender && matchesLanguage;
        });
        
        this.renderModels(filteredModels);
    }

    handleSearch(searchTerm) {
        const currentModels = this.modelsData[this.currentTab] || [];
        
        if (searchTerm === '') {
            this.renderModels(currentModels);
            return;
        }
        
        const filteredModels = currentModels.filter(model => {
            return (model.display || model.name || '').toLowerCase().includes(searchTerm) ||
                   (model.category1 || '').toLowerCase().includes(searchTerm) ||
                   (model.category2 || '').toLowerCase().includes(searchTerm) ||
                   (model.category3 || '').toLowerCase().includes(searchTerm);
        });
        
        this.renderModels(filteredModels);
    }

    handleUseModel() {
        if (this.selectedModel) {
            // Store selected model in localStorage and navigate to voice-studio for actual voice generation
            localStorage.setItem('selectedModel', JSON.stringify(this.selectedModel));
            
            // Get current token and redirect to voice-studio.html
            const token = window.tokenManager ? window.tokenManager.getAccessToken() : null;
            if (token) {
                const url = `voice-studio.html?token=${encodeURIComponent(token)}&from=select-model`;
                window.location.href = url;
            } else {
                // Fallback without token
                window.location.href = 'voice-studio.html?from=select-model';
            }
        }
    }

    showErrorMessage(message) {
        document.getElementById('modelsGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--error-500); padding: 2rem;">
                <div>${message}</div>
                <div style="margin-top: 1rem; font-size: 0.9em;">
                    <button onclick="window.modelUIController.discoverEndpoints()" 
                            style="background: var(--gradient-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
                        Discover API Endpoints
                    </button>
                </div>
            </div>
        `;
    }

    async discoverEndpoints() {
        try {
            console.log('🔍 Discovering available API endpoints...');
            const availableEndpoints = await this.modelService.getAvailableEndpoints();
            
            // Update debug panel
            document.getElementById('endpointStatus').innerHTML = 
                availableEndpoints.length > 0 
                    ? `Found: ${availableEndpoints.join(', ')}` 
                    : 'No endpoints available';
            
            if (availableEndpoints.length > 0) {
                alert(`Available API endpoints:\n${availableEndpoints.join('\n')}\n\nPlease check the correct endpoint for models in your API documentation.`);
            } else {
                alert('No API endpoints available. Please check your authentication and API configuration.');
            }
        } catch (error) {
            console.error('❌ Failed to discover endpoints:', error);
            document.getElementById('endpointStatus').innerHTML = 'Error: ' + error.message;
            alert('Failed to discover endpoints. Please check the console for details.');
        }
    }

    toggleDebugPanel() {
        const debugContent = document.getElementById('debugContent');
        debugContent.classList.toggle('show');
        
        if (debugContent.classList.contains('show')) {
            this.updateDebugInfo();
        }
    }

    updateDebugInfo() {
        // Update authentication status
        const isAuth = window.tokenManager.isAuthenticated();
        document.getElementById('authStatus').innerHTML = isAuth ? '✅ Authenticated' : '❌ Not authenticated';
        
        // Update token info
        if (isAuth) {
            const token = window.tokenManager.getAccessToken();
            const tokenPreview = token ? `${token.substring(0, 20)}...` : 'No token';
            document.getElementById('tokenInfo').innerHTML = `Token: ${tokenPreview}`;
        } else {
            document.getElementById('tokenInfo').innerHTML = 'No tokens available';
        }
        
        // Show debug panel
        document.getElementById('debugPanel').style.display = 'block';
    }

    async testAPIConnection() {
        try {
            console.log('🧪 Testing API connection...');
            const isConnected = await this.modelService.testConnection();
            
            if (isConnected) {
                alert('✅ API connection successful!');
                document.getElementById('authStatus').innerHTML = '✅ API Connected';
            } else {
                alert('❌ API connection failed. Check console for details.');
                document.getElementById('authStatus').innerHTML = '❌ API Connection Failed';
            }
        } catch (error) {
            console.error('❌ API connection test failed:', error);
            alert('❌ API connection test failed: ' + error.message);
            document.getElementById('authStatus').innerHTML = '❌ Test Error: ' + error.message;
        }
    }

    async testAllEndpoints() {
        try {
            console.log('🧪 Testing all API endpoints...');
            
            // Test free models
            try {
                const freeResponse = await this.modelService.getFreeModels();
                console.log('✅ Free models endpoint working:', freeResponse);
                alert(`✅ Free models: ${freeResponse.data?.data?.length || 0} models found`);
            } catch (error) {
                console.error('❌ Free models endpoint failed:', error);
                alert('❌ Free models endpoint failed: ' + error.message);
            }
            
            // Test paid models
            try {
                const paidResponse = await this.modelService.getPaidModels();
                console.log('✅ Paid models endpoint working:', paidResponse);
                alert(`✅ Paid models: ${paidResponse.data?.data?.length || 0} models found`);
            } catch (error) {
                console.error('❌ Paid models endpoint failed:', error);
                alert('❌ Paid models endpoint failed: ' + error.message);
            }
            
            // Test shop models
            try {
                const shopResponse = await this.modelService.getShopModels();
                console.log('✅ Shop models endpoint working:', shopResponse);
                alert(`✅ Shop models: ${shopResponse.data?.data?.length || 0} models found`);
            } catch (error) {
                console.error('❌ Shop models endpoint failed:', error);
                alert('❌ Shop models endpoint failed: ' + error.message);
            }
            
        } catch (error) {
            console.error('❌ Testing all endpoints failed:', error);
            alert('❌ Testing all endpoints failed: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded - DISABLED for manual initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, but ModelUIController initialization is disabled');
    console.log('🔑 Waiting for manual initialization after token setup...');
    
    // Don't auto-initialize - let the select-model.html handle it
    // This prevents the "invalid token" error from happening too early
});

// If page is already loaded - DISABLED for manual initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM loading, but ModelUIController initialization is disabled');
    });
} else {
    console.log('🚀 DOM already loaded, but ModelUIController initialization is disabled');
}
