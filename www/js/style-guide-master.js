/*!
 * Sonic AI Style Guide Master
 * Centralized style guide management and enforcement system
 */

class StyleGuideMaster {
    constructor() {
        this.config = null;
        this.validator = null;
        this.autoFixEnabled = false;
        this.isProduction = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Load configuration
            await this.loadConfig();
            
            // Initialize validator
            if (window.StyleGuideValidator) {
                this.validator = new window.StyleGuideValidator();
            }
            
            // Set up environment detection
            this.detectEnvironment();
            
            // Apply global styles if needed
            this.ensureStyleGuideLoaded();
            
            // Set up auto-migration for deprecated classes
            this.setupAutoMigration();
            
            console.log('🎨 Sonic AI Style Guide Master initialized');
            
        } catch (error) {
            console.error('❌ Style Guide Master initialization failed:', error);
        }
    }
    
    async loadConfig() {
        try {
            const response = await fetch('sonic-ai-style-config.json');
            this.config = await response.json();
            console.log('📝 Style guide configuration loaded');
        } catch (error) {
            console.warn('⚠️ Could not load style guide config, using defaults');
            this.config = this.getDefaultConfig();
        }
    }
    
    detectEnvironment() {
        // Simple production detection
        this.isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' &&
                           !window.location.hostname.includes('dev');
        
        // Enable auto-fix in development
        this.autoFixEnabled = !this.isProduction && this.config?.styleGuide?.enforcement?.autoFix;
        
        console.log(`🏗️ Environment: ${this.isProduction ? 'Production' : 'Development'}`);
    }
    
    ensureStyleGuideLoaded() {
        // Check if style guide CSS is loaded
        const styleGuideLink = document.querySelector('link[href*="sonic-ai-style-guide.css"]');
        
        if (!styleGuideLink) {
            console.warn('⚠️ Style guide CSS not found, injecting...');
            this.injectStyleGuide();
        }
    }
    
    injectStyleGuide() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/sonic-ai-style-guide.css';
        link.onload = () => console.log('✅ Style guide CSS injected successfully');
        link.onerror = () => console.error('❌ Failed to inject style guide CSS');
        document.head.appendChild(link);
    }
    
    setupAutoMigration() {
        if (!this.config?.styleGuide?.migration?.deprecated) return;
        
        const deprecatedClasses = this.config.styleGuide.migration.deprecated;
        
        // Set up mutation observer for deprecated class migration
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.migrateDeprecatedClasses(node, deprecatedClasses);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial migration of existing elements
        this.migrateDeprecatedClasses(document.body, deprecatedClasses);
    }
    
    migrateDeprecatedClasses(element, deprecatedClasses) {
        Object.entries(deprecatedClasses).forEach(([oldClass, newClasses]) => {
            // Find elements with deprecated classes
            const elementsWithDeprecated = element.querySelectorAll(`.${oldClass}`);
            
            elementsWithDeprecated.forEach(el => {
                if (this.autoFixEnabled) {
                    // Auto-fix: replace deprecated class
                    el.classList.remove(oldClass);
                    newClasses.split(' ').forEach(newClass => {
                        el.classList.add(newClass);
                    });
                    
                    console.log(`🔧 Auto-migrated .${oldClass} to .${newClasses}`, el);
                } else {
                    // Just warn in production
                    console.warn(`⚠️ Deprecated class .${oldClass} found. Replace with: ${newClasses}`, el);
                }
            });
        });
    }
    
    // Manual validation trigger
    validatePage() {
        if (this.validator) {
            this.validator.validateAll();
        } else {
            console.warn('⚠️ Style Guide Validator not available');
        }
    }
    
    // Manual auto-fix trigger
    autoFixPage() {
        if (this.validator && this.validator.autoFix) {
            this.validator.autoFix();
        } else {
            console.warn('⚠️ Auto-fix not available');
        }
    }
    
    // Component validation for specific elements
    validateComponent(element, componentType) {
        if (!this.config?.styleGuide?.components?.[componentType]) {
            console.warn(`⚠️ Unknown component type: ${componentType}`);
            return false;
        }
        
        const componentConfig = this.config.styleGuide.components[componentType];
        const violations = [];
        
        // Validate based on component type
        switch (componentType) {
            case 'buttons':
                violations.push(...this.validateButton(element, componentConfig));
                break;
            case 'forms':
                violations.push(...this.validateForm(element, componentConfig));
                break;
            case 'cards':
                violations.push(...this.validateCard(element, componentConfig));
                break;
        }
        
        if (violations.length > 0) {
            console.group(`⚠️ Component validation failed for ${componentType}:`);
            violations.forEach(violation => console.warn(violation));
            console.groupEnd();
            return false;
        }
        
        return true;
    }
    
    validateButton(element, config) {
        const violations = [];
        const classes = Array.from(element.classList);
        
        if (!classes.includes(config.baseClass)) {
            violations.push(`Missing base class: ${config.baseClass}`);
        }
        
        const hasVariant = config.variants.some(variant => 
            classes.includes(variant.class)
        );
        
        if (!hasVariant) {
            violations.push(`Missing variant class: ${config.variants.map(v => v.class).join(', ')}`);
        }
        
        return violations;
    }
    
    validateForm(element, config) {
        const violations = [];
        
        // Check inputs
        const inputs = element.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.classList.contains('form-input')) {
                violations.push(`Input missing .form-input class: ${input.outerHTML}`);
            }
        });
        
        // Check labels
        const labels = element.querySelectorAll('label');
        labels.forEach(label => {
            if (!label.classList.contains('form-label')) {
                violations.push(`Label missing .form-label class: ${label.outerHTML}`);
            }
        });
        
        return violations;
    }
    
    validateCard(element, config) {
        const violations = [];
        
        if (!element.classList.contains(config.baseClass)) {
            violations.push(`Missing base class: ${config.baseClass}`);
        }
        
        const hasValidStructure = config.structure.some(part => 
            element.querySelector(`.${part.class}`)
        );
        
        if (!hasValidStructure) {
            violations.push(`Card should contain: ${config.structure.map(s => s.class).join(', ')}`);
        }
        
        return violations;
    }
    
    // Get component usage statistics
    getUsageStats() {
        const stats = {
            buttons: {
                total: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length,
                compliant: document.querySelectorAll('.btn').length,
                deprecated: 0
            },
            inputs: {
                total: document.querySelectorAll('input, textarea').length,
                compliant: document.querySelectorAll('.form-input').length,
                deprecated: 0
            },
            cards: {
                total: document.querySelectorAll('.card').length,
                compliant: document.querySelectorAll('.card .card-body').length,
                deprecated: 0
            }
        };
        
        // Count deprecated classes
        if (this.config?.styleGuide?.migration?.deprecated) {
            Object.keys(this.config.styleGuide.migration.deprecated).forEach(deprecatedClass => {
                const count = document.querySelectorAll(`.${deprecatedClass}`).length;
                
                if (deprecatedClass.includes('btn') || deprecatedClass.includes('button')) {
                    stats.buttons.deprecated += count;
                } else if (deprecatedClass.includes('input') || deprecatedClass.includes('field')) {
                    stats.inputs.deprecated += count;
                } else if (deprecatedClass.includes('card') || deprecatedClass.includes('panel')) {
                    stats.cards.deprecated += count;
                }
            });
        }
        
        return stats;
    }
    
    // Generate compliance report
    generateComplianceReport() {
        const stats = this.getUsageStats();
        
        console.group('📊 Style Guide Compliance Report');
        
        Object.entries(stats).forEach(([component, data]) => {
            const complianceRate = data.total > 0 ? (data.compliant / data.total * 100).toFixed(1) : 100;
            const deprecatedRate = data.total > 0 ? (data.deprecated / data.total * 100).toFixed(1) : 0;
            
            console.log(`${component.toUpperCase()}:`);
            console.log(`  Total: ${data.total}`);
            console.log(`  Compliant: ${data.compliant} (${complianceRate}%)`);
            console.log(`  Deprecated: ${data.deprecated} (${deprecatedRate}%)`);
        });
        
        console.groupEnd();
        
        return stats;
    }
    
    getDefaultConfig() {
        return {
            styleGuide: {
                enforcement: {
                    strict: false,
                    autoFix: false,
                    warnings: true
                },
                migration: {
                    deprecated: {
                        'action-button': 'btn btn-primary btn-lg',
                        'submit-btn': 'btn btn-primary btn-md',
                        'cancel-btn': 'btn btn-secondary btn-md'
                    }
                }
            }
        };
    }
}

// Initialize Style Guide Master
const styleGuideMaster = new StyleGuideMaster();

// Expose to window for manual usage
window.styleGuideMaster = styleGuideMaster;

// Add global keyboard shortcuts for development
if (!styleGuideMaster.isProduction) {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+V = Validate
        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            styleGuideMaster.validatePage();
        }
        
        // Ctrl+Shift+F = Auto Fix
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            styleGuideMaster.autoFixPage();
        }
        
        // Ctrl+Shift+R = Compliance Report
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            styleGuideMaster.generateComplianceReport();
        }
    });
    
    console.log('🔧 Style Guide Development Shortcuts:');
    console.log('  Ctrl+Shift+V: Validate Page');
    console.log('  Ctrl+Shift+F: Auto Fix');
    console.log('  Ctrl+Shift+R: Compliance Report');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleGuideMaster;
}
