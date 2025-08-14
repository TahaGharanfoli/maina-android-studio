/*!
 * Sonic AI Style Guide Validator
 * Ensures consistent component usage across the application
 */

class StyleGuideValidator {
    constructor() {
        this.violations = [];
        this.componentRules = {
            // Button validation rules
            buttons: {
                selector: 'button, input[type="button"], input[type="submit"]',
                requiredClasses: ['btn'],
                validVariants: ['btn-primary', 'btn-secondary', 'btn-ghost'],
                validSizes: ['btn-sm', 'btn-md', 'btn-lg'],
                message: 'Buttons must use standardized .btn classes with variant and size'
            },
            
            // Input validation rules
            inputs: {
                selector: 'input[type="text"], input[type="password"], input[type="email"], input[type="tel"], input[type="number"], textarea',
                requiredClasses: ['form-input'],
                message: 'Form inputs must use .form-input class'
            },
            
            // Label validation rules
            labels: {
                selector: 'label',
                requiredClasses: ['form-label'],
                message: 'Form labels must use .form-label class'
            },
            
            // Card validation rules
            cards: {
                selector: '.card',
                validChildren: ['.card-header', '.card-body', '.card-footer'],
                message: 'Cards should use .card-header, .card-body, .card-footer structure'
            },
            
            // Typography validation rules
            typography: {
                headings: {
                    selector: 'h1, h2, h3, h4, h5, h6',
                    validClasses: ['text-xs', 'text-sm', 'text-base', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
                    message: 'Headings should use standardized text size classes'
                }
            }
        };
        
        this.deprecatedClasses = [
            'action-button',
            'loading-container',
            'logo', 
            'spinner-old',
            'btn-blue',
            'btn-green'
        ];
        
        this.init();
    }
    
    init() {
        // Run validation when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.validateAll());
        } else {
            this.validateAll();
        }
        
        // Set up mutation observer for dynamic content
        this.setupMutationObserver();
    }
    
    validateAll() {
        console.log('🔍 Sonic AI Style Guide Validation Starting...');
        this.violations = [];
        
        this.validateButtons();
        this.validateInputs();
        this.validateLabels();
        this.validateCards();
        this.validateTypography();
        this.validateDeprecatedClasses();
        
        this.reportResults();
    }
    
    validateButtons() {
        const buttons = document.querySelectorAll(this.componentRules.buttons.selector);
        
        buttons.forEach(button => {
            const classes = Array.from(button.classList);
            
            // Check if button has .btn class
            if (!classes.includes('btn')) {
                this.addViolation('button', button, 'Missing required .btn class');
                return;
            }
            
            // Check for variant class
            const hasVariant = this.componentRules.buttons.validVariants.some(variant => 
                classes.includes(variant)
            );
            
            if (!hasVariant) {
                this.addViolation('button', button, 'Missing variant class (btn-primary, btn-secondary, btn-ghost)');
            }
            
            // Check for size class
            const hasSize = this.componentRules.buttons.validSizes.some(size => 
                classes.includes(size)
            );
            
            if (!hasSize) {
                this.addViolation('button', button, 'Missing size class (btn-sm, btn-md, btn-lg)');
            }
        });
    }
    
    validateInputs() {
        const inputs = document.querySelectorAll(this.componentRules.inputs.selector);
        
        inputs.forEach(input => {
            if (!input.classList.contains('form-input')) {
                this.addViolation('input', input, 'Missing required .form-input class');
            }
        });
    }
    
    validateLabels() {
        const labels = document.querySelectorAll('label');
        
        labels.forEach(label => {
            if (!label.classList.contains('form-label')) {
                this.addViolation('label', label, 'Missing required .form-label class');
            }
        });
    }
    
    validateCards() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const hasValidStructure = card.querySelector('.card-body') || 
                                    card.querySelector('.card-header') || 
                                    card.querySelector('.card-footer');
            
            if (!hasValidStructure) {
                this.addViolation('card', card, 'Card should contain .card-header, .card-body, or .card-footer');
            }
        });
    }
    
    validateTypography() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach(heading => {
            const classes = Array.from(heading.classList);
            const hasTextSize = this.componentRules.typography.headings.validClasses.some(cls => 
                classes.includes(cls)
            );
            
            if (!hasTextSize && !heading.closest('.brand-logo')) {
                this.addViolation('heading', heading, 'Heading should use standardized text size classes');
            }
        });
    }
    
    validateDeprecatedClasses() {
        this.deprecatedClasses.forEach(deprecatedClass => {
            const elements = document.querySelectorAll(`.${deprecatedClass}`);
            
            elements.forEach(element => {
                this.addViolation('deprecated', element, `Using deprecated class: .${deprecatedClass}`);
            });
        });
    }
    
    addViolation(type, element, message) {
        this.violations.push({
            type,
            element,
            message,
            location: this.getElementLocation(element)
        });
    }
    
    getElementLocation(element) {
        let location = element.tagName.toLowerCase();
        
        if (element.id) {
            location += `#${element.id}`;
        }
        
        if (element.className) {
            location += `.${Array.from(element.classList).join('.')}`;
        }
        
        return location;
    }
    
    reportResults() {
        if (this.violations.length === 0) {
            console.log('✅ Style Guide Validation: All components are compliant!');
            return;
        }
        
        console.group('⚠️ Style Guide Violations Found:');
        
        // Group violations by type
        const violationsByType = this.violations.reduce((acc, violation) => {
            if (!acc[violation.type]) acc[violation.type] = [];
            acc[violation.type].push(violation);
            return acc;
        }, {});
        
        Object.entries(violationsByType).forEach(([type, violations]) => {
            console.group(`${type.toUpperCase()} (${violations.length} issues):`);
            
            violations.forEach(violation => {
                console.warn(`${violation.location}: ${violation.message}`, violation.element);
            });
            
            console.groupEnd();
        });
        
        console.groupEnd();
        
        // Show suggestions
        this.showSuggestions();
    }
    
    showSuggestions() {
        console.group('💡 Fix Suggestions:');
        
        const suggestions = {
            button: 'Replace custom button classes with: <button class="btn btn-primary btn-md">Text</button>',
            input: 'Add form-input class: <input class="form-input" type="text">',
            label: 'Add form-label class: <label class="form-label">Text</label>',
            card: 'Use card structure: <div class="card"><div class="card-body">Content</div></div>',
            heading: 'Add text size class: <h1 class="text-2xl">Heading</h1>',
            deprecated: 'Replace deprecated classes with standardized components'
        };
        
        const usedTypes = [...new Set(this.violations.map(v => v.type))];
        
        usedTypes.forEach(type => {
            if (suggestions[type]) {
                console.info(`${type}: ${suggestions[type]}`);
            }
        });
        
        console.groupEnd();
    }
    
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldValidate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain form elements or buttons
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const hasFormElements = node.querySelector && (
                                node.querySelector('button, input, label, .card') ||
                                node.matches && node.matches('button, input, label, .card')
                            );
                            
                            if (hasFormElements) {
                                shouldValidate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldValidate) {
                // Debounce validation
                clearTimeout(this.validationTimeout);
                this.validationTimeout = setTimeout(() => {
                    console.log('🔄 Re-validating due to DOM changes...');
                    this.validateAll();
                }, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Manual validation method for specific elements
    validateElement(element) {
        this.violations = this.violations.filter(v => v.element !== element);
        
        if (element.matches(this.componentRules.buttons.selector)) {
            this.validateButtons();
        }
        
        if (element.matches(this.componentRules.inputs.selector)) {
            this.validateInputs();
        }
        
        if (element.matches('label')) {
            this.validateLabels();
        }
        
        this.reportResults();
    }
    
    // Auto-fix method (experimental)
    autoFix() {
        console.log('🔧 Attempting auto-fix of style guide violations...');
        
        // Fix buttons without .btn class
        document.querySelectorAll('button:not(.btn), input[type="button"]:not(.btn), input[type="submit"]:not(.btn)').forEach(button => {
            button.classList.add('btn', 'btn-primary', 'btn-md');
            console.log('🔧 Fixed button:', button);
        });
        
        // Fix inputs without .form-input class
        document.querySelectorAll('input:not(.form-input), textarea:not(.form-input)').forEach(input => {
            if (input.type !== 'button' && input.type !== 'submit') {
                input.classList.add('form-input');
                console.log('🔧 Fixed input:', input);
            }
        });
        
        // Fix labels without .form-label class
        document.querySelectorAll('label:not(.form-label)').forEach(label => {
            label.classList.add('form-label');
            console.log('🔧 Fixed label:', label);
        });
        
        // Re-validate after fixes
        setTimeout(() => this.validateAll(), 100);
    }
}

// Initialize validator
const styleGuideValidator = new StyleGuideValidator();

// Expose to window for manual usage
window.styleGuideValidator = styleGuideValidator;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleGuideValidator;
}
