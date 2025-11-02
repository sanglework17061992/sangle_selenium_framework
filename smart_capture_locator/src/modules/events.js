// Event Handlers Module
// Manages all event handling for mouse, keyboard, and navigation

import { SLIConfig } from './config.js';
import { SLIUtils } from './utils.js';
import { SLIUIComponents } from './ui.js';
import { SLILocatorGenerators } from './locators.js';
import { SLIDOMHierarchy } from './hierarchy.js';

export class SLIEventHandlers {
    // Attach all event listeners
    static attachEventListeners() {
        // Mouse move for hover detection
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        
        // Prevent accidental interactions with our UI
        const config = SLIConfig.getConfig();
        document.addEventListener('click', (e) => {
            if (e.target.closest('#' + config.modalId)) {
                this.handleModalClick(e);
            }
        }, true);
    }

    // Handle mouse movement with improved highlighting
    static handleMouseMove(event) {
        const state = SLIConfig.getState();
        
        if (!state.isActive || state.isFrozen) return;
        
        const element = event.target;
        
        // Skip our own elements and invalid elements
        if (SLIUtils.isExcludedElement(element)) return;
        
        // Skip if same element or invalid elements
        if (state.lastHoveredElement === element) return;
        
        // Skip text nodes and comments
        if (element.nodeType !== Node.ELEMENT_NODE) return;
        
        // Skip script, style, head elements
        const skipTags = ['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'TITLE'];
        if (skipTags.includes(element.tagName)) return;
        
        // Skip elements that are not visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        console.log('[SLI] Hovering over:', element.tagName, element.className, element.id);
        
        SLIConfig.setState({ 
            lastHoveredElement: element,
            currentElement: element 
        });
        
        // Highlight element with improved visual feedback
        SLIUIComponents.highlightElement(element);
        
        // Update modal with element information (debounced)
        this.debouncedUpdateModal(element);
    }

    // Debounced modal update to prevent excessive updates
    static debouncedUpdateModal(element) {
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(() => {
            this.updateModalWithElement(element);
        }, 50);
    }

    // Handle keyboard shortcuts
    static handleKeyDown(event) {
        const state = SLIConfig.getState();
        
        if (event.key === 'Escape') {
            SLIUIComponents.toggle();
        } else if (event.ctrlKey || event.metaKey) {
            // Freeze/unfreeze current element
            SLIUIComponents.setFrozenState(!state.isFrozen);
        }
    }

    // Handle modal clicks
    static handleModalClick(event) {
        // Prevent propagation to avoid triggering page interactions
        event.stopPropagation();
        
        // Handle copy functionality (already handled in UI module)
        // This method can be extended for other modal interactions
    }

    // Update modal with element information
    static updateModalWithElement(element) {
        if (!element) return;

        const locators = this.generateLocators(element);
        SLIUIComponents.updateModal(locators);
    }

    // Generate locators for an element
    static generateLocators(element) {
        const smartXPaths = SLILocatorGenerators.generateSmartXPaths(element);
        const hierarchy = SLIDOMHierarchy.generateDOMHierarchy(element);
        
        const locators = {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            name: element.name || '',
            className: element.className || '',
            text: SLIUtils.getElementText(element),
            css: SLILocatorGenerators.generateCSSSelector(element),
            xpath: smartXPaths.length > 0 ? smartXPaths[0].xpath : SLILocatorGenerators.getHierarchicalXPath(element),
            smartXPaths: smartXPaths, // All smart XPath suggestions with scores
            hierarchy: hierarchy, // DOM structure hierarchy
            attributes: SLIUtils.getRelevantAttributes(element)
        };

        return locators;
    }

    // Setup navigation persistence
    static setupNavigationPersistence() {
        // Monitor for page changes and re-inject
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if our modal was removed
                    const config = SLIConfig.getConfig();
                    if (!document.getElementById(config.modalId)) {
                        console.log('[SLI] Modal removed, re-injecting...');
                        setTimeout(() => {
                            // Re-initialize if needed
                            window.SLI?.init?.();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Listen for page navigation events
        let lastUrl = location.href;
        const checkForUrlChange = () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                console.log('[SLI] Navigation detected, ensuring inspector persistence...');
                setTimeout(() => {
                    const config = SLIConfig.getConfig();
                    if (!document.getElementById(config.modalId)) {
                        window.SLI?.init?.();
                    }
                }, 200);
            }
        };

        // Check for URL changes periodically
        setInterval(checkForUrlChange, 1000);

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', () => {
            console.log('[SLI] Popstate event detected...');
            setTimeout(() => {
                const config = SLIConfig.getConfig();
                if (!document.getElementById(config.modalId)) {
                    window.SLI?.init?.();
                }
            }, 300);
        });
    }

    // Remove all event listeners
    static removeEventListeners() {
        document.removeEventListener('mousemove', this.handleMouseMove, true);
        document.removeEventListener('keydown', this.handleKeyDown, true);
        // Note: Modal click handlers are cleaned up when modal is removed
    }
}