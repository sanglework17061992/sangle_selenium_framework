// Smart Locator Inspector - Modular Template
// This is a template file used by the build script to generate the final injector
// The build script will replace the MODULE_PLACEHOLDER comments with actual module code

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.SmartLocatorInspector) {
        console.log('[SLI] Already injected, refreshing...');
        window.SmartLocatorInspector.cleanup();
    }

    // === MODULES WILL BE INSERTED HERE BY BUILD SCRIPT ===
    // === CONFIG.JS ===
// Configuration and Global State Management
// Centralized configuration and state for Smart Locator Inspector

class SLIConfig {
    static config = {
        modalId: 'sli-modal',
        highlightId: 'sli-highlight',
        zIndex: 2147483647, // Maximum z-index
        excludeElements: ['sli-modal', 'sli-highlight'],
        ignoreTags: ['HTML', 'BODY']
    };

    static state = {
        isActive: true,
        isFrozen: false,
        currentElement: null,
        modal: null,
        highlightBox: null,
        lastHoveredElement: null
    };

    static getConfig() {
        return this.config;
    }

    static getState() {
        return this.state;
    }

    static setState(newState) {
        Object.assign(this.state, newState);
    }

    static resetState() {
        this.state = {
            isActive: true,
            isFrozen: false,
            currentElement: null,
            modal: null,
            highlightBox: null,
            lastHoveredElement: null
        };
    }
}

    // === UTILS.JS ===
// Utility Functions Module
// Common utility functions used throughout the Smart Locator Inspector

class SLIUtils {
    // Utility function to escape HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Check if a value looks dynamic (generated IDs, UUIDs, etc.)
    static isDynamicValue(value) {
        if (!value || typeof value !== 'string') return false;
        
        // Common patterns for dynamic values
        const dynamicPatterns = [
            /^[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+$/,  // UUID pattern
            /^\d{10,}$/,                                    // Long numbers
            /^(react|vue|ng)-[\w\d]+$/,                     // Framework generated
            /^[\w\d]{20,}$/,                                // Long random strings
            /\d{4}-\d{2}-\d{2}/,                           // Dates
            /session|token|temp|tmp/i,                      // Temporary values
            /^auto-gen/i                                    // Auto-generated
        ];
        
        return dynamicPatterns.some(pattern => pattern.test(value));
    }

    // Get stable CSS classes (filter out dynamic/framework classes)
    static getStableClasses(element) {
        if (!element.className) return [];
        
        const classes = element.className.split(' ').filter(cls => {
            cls = cls.trim();
            if (!cls) return false;
            
            // Filter out dynamic classes
            const dynamicPatterns = [
                /^[\w\d]+-[\w\d]+-[\w\d]+$/,    // Generated classes
                /^css-[\w\d]+$/,                 // CSS-in-JS
                /^sc-[\w\d]+$/,                  // Styled-components
                /^emotion-[\w\d]+$/,             // Emotion
                /^\d+$/,                         // Numeric only
                /^_[\w\d]+$/,                    // Underscore prefixed
                /active|selected|hover|focus/i   // State classes (often dynamic)
            ];
            
            return !dynamicPatterns.some(pattern => pattern.test(cls)) && !this.isDynamicValue(cls);
        });
        
        return classes;
    }

    // Get data attributes (prioritize test attributes)
    static getDataAttributes(element) {
        const dataAttrs = [];
        const priorityAttrs = ['data-testid', 'data-test', 'data-cy', 'data-selenium'];
        
        // Check priority attributes first
        priorityAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && !this.isDynamicValue(value)) {
                dataAttrs.push({ name: attr, value: value });
            }
        });
        
        // Check other data attributes
        if (dataAttrs.length === 0) {
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-') && 
                    !priorityAttrs.includes(attr.name) && 
                    !this.isDynamicValue(attr.value)) {
                    dataAttrs.push({ name: attr.name, value: attr.value });
                }
            });
        }
        
        return dataAttrs;
    }

    // Get relevant attributes for display
    static getRelevantAttributes(element) {
        const attributes = {};
        const relevantAttrs = [
            'id', 'name', 'class', 'type', 'role', 'aria-label', 'aria-labelledby', 
            'aria-describedby', 'title', 'placeholder', 'value', 'href', 'src', 
            'alt', 'data-testid', 'data-test', 'data-cy'
        ];
        
        relevantAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
                attributes[attr] = value.length > 50 ? value.substring(0, 47) + '...' : value;
            }
        });
        
        return attributes;
    }

    // Get element text content
    static getElementText(element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return element.value || element.placeholder || '';
        }
        
        // Get direct text content (not from children)
        let text = '';
        for (let node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent.trim();
            }
        }
        
        if (text.length > 50) {
            text = text.substring(0, 47) + '...';
        }
        
        return text;
    }

    // Check if element should be excluded from inspection
    static isExcludedElement(element) {
        if (!element || !element.tagName) return true;
        
        const config = { excludeElements: ['sli-modal', 'sli-highlight'], ignoreTags: ['HTML', 'BODY'] };
        
        // Check if it's our own element
        if (element.id && config.excludeElements.includes(element.id)) return true;
        if (element.className && config.excludeElements.some(cls => element.className.includes(cls))) return true;
        
        // Check ignored tags
        if (config.ignoreTags.includes(element.tagName.toUpperCase())) return true;
        
        // Check if it's invisible
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return true;
        
        return false;
    }

    // Generate nth-child selector as fallback
    static getNthChildSelector(element) {
        const parent = element.parentElement;
        if (!parent) return element.tagName.toLowerCase();
        
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(element) + 1;
        
        return element.tagName.toLowerCase() + ':nth-child(' + index + ')';
    }

    // Validate XPath syntax
    static isValidXPath(xpath) {
        try {
            if (!xpath || typeof xpath !== 'string' || xpath.trim() === '') {
                return false;
            }
            
            // Skip problematic XPath patterns
            if (xpath.includes('undefined') || xpath.includes('null') || xpath.includes('NaN')) {
                return false;
            }
            
            document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Check if XPath is unique in the DOM
    static isXPathUnique(xpath) {
        try {
            if (!this.isValidXPath(xpath)) return false;
            
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength === 1;
        } catch (error) {
            console.log('[SLI] XPath validation failed for:', xpath, error.message);
            return false;
        }
    }

    // Get count of elements matching XPath
    static getXPathMatchCount(xpath) {
        try {
            if (!this.isValidXPath(xpath)) return 0;
            
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength;
        } catch (error) {
            return 0;
        }
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        if (!text) {
            console.error('[SLI] Cannot copy empty text');
            return false;
        }

        console.log('[SLI] Attempting to copy:', text);

        try {
            // Method 1: Modern Clipboard API (preferred)
            if (navigator.clipboard && window.isSecureContext) {
                console.log('[SLI] Using modern clipboard API');
                await navigator.clipboard.writeText(text);
                console.log('[SLI] ✅ Successfully copied using clipboard API');
                return true;
            }
            
            // Method 2: Fallback using execCommand
            console.log('[SLI] Using fallback execCommand method');
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            textArea.setAttribute('readonly', '');
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, text.length);
            
            const successful = document.execCommand('copy');
            textArea.remove();
            
            if (successful) {
                console.log('[SLI] ✅ Successfully copied using execCommand');
                return true;
            } else {
                console.error('[SLI] ❌ execCommand copy failed');
                return false;
            }
            
        } catch (error) {
            console.error('[SLI] ❌ Failed to copy to clipboard:', error);
            
            // Method 3: Manual selection fallback
            try {
                console.log('[SLI] Trying manual selection fallback');
                const range = document.createRange();
                const selection = window.getSelection();
                const span = document.createElement('span');
                span.textContent = text;
                span.style.position = 'fixed';
                span.style.left = '-999999px';
                
                document.body.appendChild(span);
                range.selectNode(span);
                selection.removeAllRanges();
                selection.addRange(range);
                
                const success = document.execCommand('copy');
                span.remove();
                selection.removeAllRanges();
                
                if (success) {
                    console.log('[SLI] ✅ Successfully copied using manual selection');
                    return true;
                }
            } catch (fallbackError) {
                console.error('[SLI] ❌ Manual selection fallback also failed:', fallbackError);
            }
            
            return false;
        }
    }

    // Generate score bar visualization
    static generateScoreBar(score, maxScore = 100) {
        const barLength = 10;
        const filledLength = Math.round((score / maxScore) * barLength);
        const emptyLength = barLength - filledLength;
        
        return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    }

    // Get score color based on value
    static getScoreColor(score) {
        if (score >= 90) return '#98c379';      // Green
        if (score >= 75) return '#61dafb';      // Blue
        if (score >= 60) return '#e5c07b';      // Yellow
        return '#e06c75';                       // Red
    }
}

    // === STYLES.JS ===
// CSS Styles Module
// Comprehensive CSS styles for the Smart Locator Inspector UI

class SLIStyles {
    static getCSS() {
        return `
            .sli-modal { 
                position: fixed !important; 
                top: 20px !important; 
                right: 20px !important; 
                width: 440px !important; 
                max-height: 85vh !important; 
                background: rgba(28, 28, 30, 0.95) !important; 
                border: 2px solid #007acc !important; 
                border-radius: 12px !important; 
                color: white !important; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; 
                font-size: 13px !important; 
                z-index: 2147483647 !important; 
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important; 
                backdrop-filter: blur(5px) !important; 
                overflow: hidden !important; 
                pointer-events: auto !important; 
                user-select: none !important; 
                transform: translateZ(0) !important; 
            }
            
            .sli-header { 
                background: linear-gradient(135deg, #007acc 0%, #005a9e 100%) !important; 
                padding: 12px 16px !important; 
                display: flex !important; 
                justify-content: space-between !important; 
                align-items: center !important; 
                font-weight: 600 !important; 
                cursor: move !important; 
                border-radius: 10px 10px 0 0 !important; 
            }
            
            .sli-title { 
                color: white !important; 
                font-size: 15px !important; 
                font-weight: 600 !important; 
            }
            
            .sli-close { 
                background: rgba(255, 255, 255, 0.1) !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important; 
                color: white !important; 
                font-size: 16px !important; 
                cursor: pointer !important; 
                padding: 4px 8px !important; 
                width: 28px !important; 
                height: 28px !important; 
                border-radius: 6px !important; 
                display: flex !important; 
                align-items: center !important; 
                justify-content: center !important; 
                transition: all 0.2s ease !important; 
            }
            
            .sli-close:hover { 
                background: rgba(255, 255, 255, 0.2) !important; 
                border-color: rgba(255, 255, 255, 0.4) !important; 
                transform: scale(1.1) !important; 
            }
            
            .sli-content { 
                padding: 16px !important; 
                max-height: calc(85vh - 60px) !important; 
                overflow-y: auto !important; 
            }
            
            .sli-content::-webkit-scrollbar { 
                width: 6px !important; 
            }
            
            .sli-content::-webkit-scrollbar-track { 
                background: rgba(255, 255, 255, 0.1) !important; 
                border-radius: 3px !important; 
            }
            
            .sli-content::-webkit-scrollbar-thumb { 
                background: rgba(255, 255, 255, 0.3) !important; 
                border-radius: 3px !important; 
            }
            
            .sli-field { 
                margin-bottom: 10px !important; 
                padding: 10px 12px !important; 
                background: rgba(255, 255, 255, 0.08) !important; 
                border: 1px solid rgba(255, 255, 255, 0.15) !important; 
                border-radius: 8px !important; 
                cursor: pointer !important; 
                transition: all 0.2s ease !important; 
                position: relative !important; 
            }
            
            .sli-field:hover { 
                background: rgba(0, 122, 204, 0.2) !important; 
                border-color: #007acc !important; 
                transform: translateY(-1px) !important; 
            }
            
            .sli-smart-xpath { 
                border-left: 4px solid #61dafb !important; 
            }
            
            .sli-smart-xpath:hover { 
                border-left-color: #007acc !important; 
            }
            
            .sli-table-xpath { 
                border-left: 4px solid #ff9500 !important; 
                background: rgba(255, 149, 0, 0.05) !important; 
            }
            
            .sli-table-xpath:hover { 
                border-left-color: #ff7700 !important; 
                background: rgba(255, 149, 0, 0.15) !important; 
            }
            
            .sli-playwright-xpath { 
                border-left: 4px solid #2D8659 !important; 
                background: rgba(45, 134, 89, 0.08) !important; 
            }
            
            .sli-playwright-xpath:hover { 
                border-left-color: #228B22 !important; 
                background: rgba(45, 134, 89, 0.18) !important; 
            }
            
            .sli-playwright-xpath .sli-field-label {
                color: #2D8659 !important;
            }
            
            .sli-unique { 
                border-left-color: #98c379 !important; 
            }
            
            .sli-unique:hover { 
                border-left-color: #27ae60 !important; 
            }
            
            .sli-non-unique { 
                border-left-color: #e5c07b !important; 
            }
            
            .sli-non-unique:hover { 
                border-left-color: #f39c12 !important; 
            }
            
            .sli-field-header { 
                display: flex !important; 
                justify-content: space-between !important; 
                align-items: flex-start !important; 
                margin-bottom: 6px !important; 
            }
            
            .sli-field-label { 
                color: #61dafb !important; 
                font-weight: 600 !important; 
                font-size: 12px !important; 
                text-transform: uppercase !important; 
                letter-spacing: 0.5px !important; 
                flex: 1 !important; 
            }
            
            .sli-score-container { 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: flex-end !important; 
                min-width: 90px !important; 
            }
            
            .sli-uniqueness { 
                font-weight: 600 !important; 
                font-size: 10px !important; 
                margin-bottom: 2px !important; 
                text-transform: uppercase !important; 
            }
            
            .sli-score { 
                font-weight: 700 !important; 
                font-size: 11px !important; 
                margin-bottom: 2px !important; 
            }
            
            .sli-score-bar { 
                font-family: monospace !important; 
                font-size: 8px !important; 
                line-height: 1 !important; 
                opacity: 0.7 !important; 
            }
            
            .sli-field-description { 
                color: #98c379 !important; 
                font-size: 11px !important; 
                font-style: italic !important; 
                margin-bottom: 6px !important; 
                opacity: 0.9 !important; 
            }
            
            .sli-field-value { 
                color: #f8f8f2 !important; 
                word-break: break-all !important; 
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; 
                font-size: 11px !important; 
                line-height: 1.4 !important; 
                background: rgba(0, 0, 0, 0.2) !important; 
                padding: 6px 8px !important; 
                border-radius: 4px !important; 
            }
            
            .sli-xpath-header { 
                color: #e5c07b !important; 
                font-weight: 700 !important; 
                font-size: 13px !important; 
                margin: 16px 0 8px 0 !important; 
                padding: 8px 12px !important; 
                background: rgba(229, 192, 123, 0.1) !important; 
                border-radius: 6px !important; 
                border-left: 4px solid #e5c07b !important; 
            }
            
            .sli-instruction { 
                color: #98c379 !important; 
                font-size: 11px !important; 
                margin-bottom: 6px !important; 
                padding: 4px 8px !important; 
                background: rgba(152, 195, 121, 0.1) !important; 
                border-radius: 4px !important; 
                border-left: 3px solid #98c379 !important; 
            }
            
            .sli-message { 
                color: #61dafb !important; 
                font-weight: 600 !important; 
                text-align: center !important; 
                padding: 16px !important; 
                font-size: 14px !important; 
            }
            
            .sli-loading { 
                color: #98c379 !important; 
                text-align: center !important; 
                padding: 24px !important; 
                font-style: italic !important; 
                font-size: 14px !important; 
            }
            
            .sli-frozen { 
                border-color: #e06c75 !important; 
                box-shadow: 0 0 20px rgba(224, 108, 117, 0.4) !important; 
            }
            
            .sli-frozen .sli-header { 
                background: linear-gradient(135deg, #e06c75 0%, #c94a4a 100%) !important; 
            }
            
            .sli-highlight { 
                position: fixed !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 0 !important; 
                height: 0 !important; 
                pointer-events: none !important; 
                z-index: 999999999 !important; 
                border: 2px solid #007acc !important; 
                background: rgba(0, 122, 204, 0.15) !important; 
                box-shadow: 0 0 0 1px rgba(0, 122, 204, 0.3), inset 0 0 0 1px rgba(0, 122, 204, 0.3) !important; 
                display: none !important; 
                opacity: 1 !important; 
                border-radius: 2px !important; 
                transition: all 0.1s ease !important;
            }
            
            .sli-highlight.frozen { 
                border: 2px solid #00FF00 !important; 
                background: rgba(0, 255, 0, 0.15) !important; 
                box-shadow: 0 0 0 1px rgba(0, 255, 0, 0.3), inset 0 0 0 1px rgba(0, 255, 0, 0.3) !important; 
                animation: sli-pulse 1.5s infinite !important;
            }
            
            @keyframes sli-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .sli-element-info {
                position: fixed !important;
                background: rgba(0, 0, 0, 0.85) !important;
                color: white !important;
                padding: 6px 10px !important;
                border-radius: 4px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace !important;
                font-size: 11px !important;
                font-weight: normal !important;
                line-height: 1.4 !important;
                z-index: 1000000000 !important;
                pointer-events: none !important;
                white-space: nowrap !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                max-width: 300px !important;
                word-break: break-all !important;
                opacity: 1 !important;
                display: none !important;
            }
            
            .sli-element-info .tag {
                color: #569cd6 !important;
                font-weight: bold !important;
            }
            
            .sli-element-info .attr {
                color: #9cdcfe !important;
            }
            
            .sli-element-info .value {
                color: #ce9178 !important;
            }
            
            .sli-element-info .size {
                color: #d4d4d4 !important;
                margin-left: 8px !important;
            }
            
            .sli-hierarchy-container { 
                margin-top: 16px !important; 
                padding: 12px !important; 
                background: rgba(255, 255, 255, 0.05) !important; 
                border: 1px solid rgba(255, 255, 255, 0.1) !important; 
                border-radius: 8px !important; 
                border-left: 4px solid #c678dd !important; 
            }
            
            .sli-hierarchy-header { 
                color: #c678dd !important; 
                font-weight: 700 !important; 
                font-size: 13px !important; 
                margin-bottom: 12px !important; 
                padding: 8px 12px !important; 
                background: rgba(198, 120, 221, 0.1) !important; 
                border-radius: 6px !important; 
                display: flex !important; 
                align-items: center !important; 
            }
            
            .sli-hierarchy-tree { 
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; 
                font-size: 11px !important; 
                line-height: 1.6 !important; 
            }
            
            .sli-hierarchy-item { 
                padding: 2px 8px !important; 
                margin-bottom: 1px !important; 
                background: rgba(0, 0, 0, 0.1) !important; 
                border-radius: 3px !important; 
                cursor: pointer !important; 
                transition: all 0.2s ease !important; 
                position: relative !important; 
                white-space: pre !important; 
                overflow-x: auto !important; 
            }
            
            .sli-hierarchy-item:hover { 
                background: rgba(0, 122, 204, 0.2) !important; 
                transform: translateX(2px) !important; 
            }
            
            .sli-hierarchy-item.current { 
                background: rgba(152, 195, 121, 0.2) !important; 
                border: 1px solid #98c379 !important; 
                font-weight: 600 !important; 
                color: #98c379 !important; 
            }
            
            .sli-tree-line { 
                color: #f8f8f2 !important; 
            }
            
            .sli-hierarchy-item.current .sli-tree-line { 
                color: #98c379 !important; 
            }
            
            .sli-hierarchy-highlight { 
                border: 2px solid #c678dd !important; 
                background: rgba(198, 120, 221, 0.3) !important; 
                box-shadow: 0 0 12px rgba(198, 120, 221, 0.6) !important; 
            }
        `;
    }

    static injectStyles() {
        let styleSheet = document.getElementById('sli-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
        
        styleSheet = document.createElement('style');
        styleSheet.id = 'sli-styles';
        styleSheet.textContent = this.getCSS();

        document.head.appendChild(styleSheet);
    }
}

    // === HIERARCHY.JS ===
// DOM Hierarchy Module
// Handles DOM tree structure generation and visualization

class SLIDOMHierarchy {
    // Generate DOM hierarchy structure in tree format
    static generateDOMHierarchy(element) {
        const treeNodes = [];
        
        // Find the root ancestor (up to 3 levels up)
        let root = element;
        let ancestors = [];
        let parent = element.parentElement;
        
        while (parent && parent.tagName !== 'HTML' && ancestors.length < 3) {
            ancestors.unshift(parent);
            root = parent;
            parent = parent.parentElement;
        }
        
        // Build tree starting from root
        this.buildTreeNodes(root, element, '', true, treeNodes);
        
        return { treeNodes };
    }
    
    // Recursively build tree nodes
    static buildTreeNodes(node, targetElement, prefix, isLast, treeNodes) {
        if (!node) return;
        
        const isTarget = node === targetElement;
        const nodeInfo = this.getElementInfo(node);
        
        // Create the tree line prefix
        const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        
        // Add current node
        treeNodes.push({
            content: currentPrefix + this.formatTreeNode(nodeInfo, isTarget),
            isTarget: isTarget,
            element: node,
            locator: nodeInfo.locator
        });
        
        // Process children, but only show relevant ones
        const children = Array.from(node.children).filter(child => {
            // Show child if it's the target or contains the target
            return child === targetElement || this.isAncestorOf(child, targetElement);
        });
        
        children.forEach((child, index) => {
            const isLastChild = index === children.length - 1;
            this.buildTreeNodes(child, targetElement, nextPrefix, isLastChild, treeNodes);
        });
    }
    
    // Check if element is ancestor of target
    static isAncestorOf(element, target) {
        let current = target.parentElement;
        while (current) {
            if (current === element) return true;
            current = current.parentElement;
        }
        return false;
    }
    
    // Format tree node display
    static formatTreeNode(nodeInfo, isTarget) {
        let result = nodeInfo.tagName;
        
        if (nodeInfo.id) {
            result += '#' + nodeInfo.id;
        }
        
        if (nodeInfo.className) {
            const classes = nodeInfo.className.split(' ').filter(c => c.trim()).slice(0, 2);
            if (classes.length > 0) {
                result += '.' + classes.join('.');
            }
        }
        
        // Add key attributes
        const keyAttrs = Object.keys(nodeInfo.attributes);
        if (keyAttrs.length > 0) {
            const firstAttr = keyAttrs[0];
            result += `[${firstAttr}="${nodeInfo.attributes[firstAttr]}"]`;
        }
        
        if (nodeInfo.text && nodeInfo.text.trim()) {
            result += ` "${nodeInfo.text}"`;
        }
        
        if (isTarget) {
            result = '● ' + result + ' ◄ CURRENT';
        }
        
        return result;
    }

    // Get element information for hierarchy
    static getElementInfo(element) {
        const text = SLIUtils.getElementText(element);
        const info = {
            tagName: element.tagName.toLowerCase(),
            id: element.id || '',
            className: element.className || '',
            text: text.length > 30 ? text.substring(0, 27) + '...' : text,
            attributes: {},
            locator: this.generateQuickLocator(element),
            elementRef: element // Store reference for highlighting
        };

        // Get key attributes
        const keyAttrs = ['data-testid', 'data-test', 'name', 'type', 'role', 'aria-label'];
        keyAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
                info.attributes[attr] = value.length > 20 ? value.substring(0, 17) + '...' : value;
            }
        });

        return info;
    }

    // Generate a quick locator for hierarchy elements
    static generateQuickLocator(element) {
        if (element.id && !SLIUtils.isDynamicValue(element.id)) {
            return '#' + element.id;
        }
        
        const testId = element.getAttribute('data-testid');
        if (testId) {
            return '[data-testid="' + testId + '"]';
        }

        const stableClasses = SLIUtils.getStableClasses(element);
        if (stableClasses.length > 0) {
            return '.' + stableClasses[0];
        }

        return element.tagName.toLowerCase();
    }

    // Create hierarchy section HTML in tree format
    static createHierarchySection(hierarchy) {
        if (!hierarchy || !hierarchy.treeNodes || hierarchy.treeNodes.length === 0) {
            return '';
        }

        let html = `
            <div class="sli-hierarchy-container">
                <div class="sli-hierarchy-header">
                    🌳 DOM Hierarchy Tree
                </div>
                <div class="sli-hierarchy-tree">
        `;

        hierarchy.treeNodes.forEach(node => {
            const classes = ['sli-hierarchy-item'];
            if (node.isTarget) classes.push('current');
            
            html += `<div class="${classes.join(' ')}" data-locator="${SLIUtils.escapeHtml(node.locator)}">`;
            html += `<span class="sli-tree-line">${SLIUtils.escapeHtml(node.content)}</span>`;
            html += `</div>`;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    // Create individual hierarchy item
    static createHierarchyItem(item, type) {
        const copyClass = type === 'current' ? 'sli-field sli-hierarchy-current' : 'sli-field';
        const icon = type === 'current' ? '🎯' : '📍';
        
        return `
            <div class="${copyClass}" data-copy="${SLIUtils.escapeHtml(item.locator)}">
                <div class="sli-field-header">
                    <span class="sli-field-label">${icon} ${item.tagName}</span>
                </div>
                <div class="sli-field-description">${item.description || 'Click to copy locator'}</div>
                <div class="sli-field-value">${SLIUtils.escapeHtml(item.locator)}</div>
            </div>
        `;
    }
}

    // === LOCATORS.JS ===
// Locator Generators Module
// All locator generation strategies (XPath, CSS, etc.)

class SLILocatorGenerators {
    // Generate CSS selector
    static generateCSSSelector(element) {
        // Prefer ID if available and not dynamic
        if (element.id && !SLIUtils.isDynamicValue(element.id)) {
            return '#' + element.id;
        }

        // Try name attribute
        if (element.name && !SLIUtils.isDynamicValue(element.name)) {
            return element.tagName.toLowerCase() + '[name="' + element.name + '"]';
        }

        // Try stable classes
        const stableClasses = SLIUtils.getStableClasses(element);
        if (stableClasses.length > 0) {
            return element.tagName.toLowerCase() + '.' + stableClasses.join('.');
        }

        // Try data attributes
        const dataAttrs = SLIUtils.getDataAttributes(element);
        if (dataAttrs.length > 0) {
            const attr = dataAttrs[0];
            return element.tagName.toLowerCase() + '[' + attr.name + '="' + attr.value + '"]';
        }

        // Fallback to nth-child
        return SLIUtils.getNthChildSelector(element);
    }

    // Generate multiple smart XPath strategies with scoring
    static generateSmartXPaths(element) {
        const xpaths = [];
        
        // Strategy 1: Framework-aware selectors (Angular, React, Vue)
        const frameworkXPaths = this.generateFrameworkXPaths(element);
        xpaths.push(...frameworkXPaths);
        
        // Strategy 2: Semantic/accessible attributes
        const semanticXPaths = this.generateSemanticXPaths(element);
        xpaths.push(...semanticXPaths);
        
        // Strategy 3: Text-based locators
        const textXPaths = this.generateTextBasedXPaths(element);
        xpaths.push(...textXPaths);
        
        // Strategy 4: Structural patterns
        const structuralXPaths = this.generateStructuralXPaths(element);
        xpaths.push(...structuralXPaths);
        
        // Strategy 5: Dynamic templates
        const dynamicXPaths = this.generateDynamicXPaths(element);
        xpaths.push(...dynamicXPaths);
        
        // Strategy 6: Table-specific locators
        const tableXPaths = this.generateTableSpecificXPaths(element);
        xpaths.push(...tableXPaths);
        
        // Strategy 7: Playwright-specific locators
        const playwrightXPaths = this.generatePlaywrightLocators(element);
        console.log('[SLI] Generated Playwright locators:', playwrightXPaths.length, playwrightXPaths.map(x => ({type: x.type, xpath: x.xpath})));
        xpaths.push(...playwrightXPaths);
        
        // Validate and score XPaths
        const validXPaths = xpaths.filter(xpath => {
            // Skip validation for Playwright locators (they're not XPath syntax)
            if (xpath.type && xpath.type.toLowerCase().includes('playwright')) {
                return true; // Playwright locators are always valid
            }
            
            // Only validate traditional XPath syntax
            if (!SLIUtils.isValidXPath(xpath.xpath)) return false;
            
            // Add uniqueness scoring (only for traditional XPath)
            const isUnique = SLIUtils.isXPathUnique(xpath.xpath);
            xpath.isUnique = isUnique;
            if (!isUnique) xpath.score = Math.max(10, xpath.score - 20);
            
            return true;
        });
        
        // Sort by score (highest first)
        validXPaths.sort((a, b) => b.score - a.score);
        
        return validXPaths;
    }

    // Generate framework-aware XPath locators
    static generateFrameworkXPaths(element) {
        const xpaths = [];
        
        // Angular specific
        const ngAttrs = ['ng-model', 'ng-click', 'ng-submit', 'ng-if', 'ng-repeat', 'ng-class'];
        ngAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
                xpaths.push({
                    xpath: '//*[@' + attr + '="' + value + '"]',
                    score: 95,
                    type: 'Angular Framework',
                    description: 'Angular directive attribute'
                });
            }
        });
        
        // React specific
        const reactAttrs = ['data-testid', 'data-test', 'data-cy'];
        reactAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
                xpaths.push({
                    xpath: '//*[@' + attr + '="' + value + '"]',
                    score: 98,
                    type: 'React/Testing',
                    description: 'Test-specific attribute'
                });
            }
        });
        
        // Vue specific
        const vueAttrs = ['v-model', 'v-if', 'v-for', 'v-bind', 'v-on'];
        vueAttrs.forEach(attr => {
            const value = element.getAttribute(attr) || element.getAttribute(':' + attr);
            if (value) {
                xpaths.push({
                    xpath: '//*[@' + attr + '="' + value + '"]',
                    score: 95,
                    type: 'Vue Framework',
                    description: 'Vue directive attribute'
                });
            }
        });
        
        return xpaths;
    }

    // Generate semantic/accessible XPath locators
    static generateSemanticXPaths(element) {
        const xpaths = [];
        
        // ID (if stable)
        if (element.id && !SLIUtils.isDynamicValue(element.id)) {
            xpaths.push({
                xpath: '//*[@id="' + element.id + '"]',
                score: 100,
                type: 'ID Selector',
                description: 'Unique ID attribute'
            });
        }
        
        // Name attribute
        if (element.name && !SLIUtils.isDynamicValue(element.name)) {
            xpaths.push({
                xpath: '//' + element.tagName.toLowerCase() + '[@name="' + element.name + '"]',
                score: 95,
                type: 'Name Attribute',
                description: 'Form element name'
            });
        }
        
        // Accessibility attributes
        const accessAttrs = ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'title'];
        accessAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && !SLIUtils.isDynamicValue(value)) {
                xpaths.push({
                    xpath: '//*[@' + attr + '="' + value + '"]',
                    score: 90,
                    type: 'Accessibility',
                    description: attr + ' attribute'
                });
            }
        });
        
        return xpaths;
    }

    // Generate text-based XPath locators
    static generateTextBasedXPaths(element) {
        const xpaths = [];
        const text = SLIUtils.getElementText(element);
        
        if (text && text.length > 0 && text.length < 50) {
            const tag = element.tagName.toLowerCase();
            
            // Exact text match
            if (['button', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'].includes(tag)) {
                xpaths.push({
                    xpath: '//' + tag + '[text()="' + text + '"]',
                    score: 85,
                    type: 'Text Match',
                    description: 'Exact text content'
                });
                
                // Contains text (more flexible)
                xpaths.push({
                    xpath: '//' + tag + '[contains(text(), "' + text + '")]',
                    score: 80,
                    type: 'Text Contains',
                    description: 'Partial text match'
                });
            }
            
            // Normalize text for dynamic templates
            const normalizedText = text.replace(/\s+/g, ' ').trim();
            if (normalizedText !== text) {
                xpaths.push({
                    xpath: '//' + tag + '[normalize-space(text())="' + normalizedText + '"]',
                    score: 82,
                    type: 'Normalized Text',
                    description: 'Normalized text content'
                });
            }
        }
        
        return xpaths;
    }

    // Generate structural XPath patterns
    static generateStructuralXPaths(element) {
        const xpaths = [];
        
        // Position-based with semantic context
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
            const index = siblings.indexOf(element) + 1;
            
            // If parent has meaningful attributes
            if (parent.id && !SLIUtils.isDynamicValue(parent.id)) {
                xpaths.push({
                    xpath: '//*[@id="' + parent.id + '"]/' + element.tagName.toLowerCase() + '[' + index + ']',
                    score: 70,
                    type: 'Structural',
                    description: 'Position within identified parent'
                });
            }
            
            if (parent.className) {
                const stableClass = SLIUtils.getStableClasses(parent)[0];
                if (stableClass) {
                    xpaths.push({
                        xpath: '//*[contains(@class, "' + stableClass + '")]/' + element.tagName.toLowerCase() + '[' + index + ']',
                        score: 65,
                        type: 'Class Structure',
                        description: 'Position within class container'
                    });
                }
            }
        }
        
        return xpaths;
    }

    // Generate dynamic template XPaths
    static generateDynamicXPaths(element) {
        const xpaths = [];
        
        // Attribute combination patterns
        const attrs = SLIUtils.getRelevantAttributes(element);
        const attrKeys = Object.keys(attrs).filter(key => 
            !['id', 'class'].includes(key) && !SLIUtils.isDynamicValue(attrs[key])
        );
        
        if (attrKeys.length >= 2) {
            const firstTwo = attrKeys.slice(0, 2);
            const xpath = '//' + element.tagName.toLowerCase() + 
                firstTwo.map(key => '[@' + key + '="' + attrs[key] + '"]').join('');
            
            xpaths.push({
                xpath: xpath,
                score: 75,
                type: 'Multi-Attribute',
                description: 'Multiple attribute combination'
            });
        }
        
        return xpaths;
    }

    // Generate table-specific XPath locators
    static generateTableSpecificXPaths(element) {
        const xpaths = [];
        
        // Check if element is in a table context
        let table = element.closest('table');
        if (!table) return xpaths;
        
        const tag = element.tagName.toLowerCase();
        
        // For table cells
        if (tag === 'td' || tag === 'th') {
            const text = SLIUtils.getElementText(element);
            if (text) {
                // Direct cell content match
                xpaths.push({
                    xpath: '//' + tag + '[normalize-space(text())="' + text + '"]',
                    score: 90,
                    type: '📊 Table Cell',
                    description: 'Table cell by content'
                });
                
                // Cell with row context
                const row = element.closest('tr');
                if (row) {
                    const cellIndex = Array.from(row.children).indexOf(element) + 1;
                    const rowCells = Array.from(row.children).map(cell => SLIUtils.getElementText(cell)).filter(t => t);
                    
                    if (rowCells.length > 1) {
                        const firstCell = rowCells[0];
                        xpaths.push({
                            xpath: '//tr[td[normalize-space(text())="' + firstCell + '"]]/td[' + cellIndex + ']',
                            score: 85,
                            type: '📊 Table Row Context',
                            description: 'Cell by row context'
                        });
                    }
                }
            }
        }
        
        // For elements inside table cells
        if (tag !== 'td' && tag !== 'th') {
            const cell = element.closest('td, th');
            if (cell) {
                const cellText = SLIUtils.getElementText(cell);
                if (cellText) {
                    xpaths.push({
                        xpath: '//td[normalize-space(text())="' + cellText + '"]//' + tag,
                        score: 80,
                        type: '📊 Table Element',
                        description: 'Element within table cell'
                    });
                }
            }
        }
        
        return xpaths;
    }

    // Generate Playwright-specific locators
    static generatePlaywrightLocators(element) {
        const xpaths = [];
        const tag = element.tagName.toLowerCase();
        
        // Playwright role-based locators
        const roleLocators = this.generateRoleBasedLocators(element);
        xpaths.push(...roleLocators);
        
        // Playwright text locators
        const textLocators = this.generatePlaywrightTextLocators(element);
        xpaths.push(...textLocators);
        
        // Playwright accessibility locators  
        const accessibilityLocators = this.generatePlaywrightAccessibilityLocators(element);
        xpaths.push(...accessibilityLocators);
        
        // Playwright filter locators
        const filterLocators = this.generatePlaywrightFilterLocators(element);
        xpaths.push(...filterLocators);
        
        return xpaths;
    }

    // Generate role-based locators for Playwright
    static generateRoleBasedLocators(element) {
        const locators = [];
        const tag = element.tagName.toLowerCase();
        
        console.log('[SLI] Generating role locators for:', tag, element);
        
        // Check explicit role attribute
        const explicitRole = element.getAttribute('role');
        if (explicitRole) {
            console.log('[SLI] Found explicit role:', explicitRole);
            locators.push({
                xpath: `page.getByRole('${explicitRole}')`,
                score: 95,
                type: '🎭 Playwright Role',
                description: `Explicit role: ${explicitRole}`
            });
        }
        
        // Implicit roles based on HTML semantics
        const implicitRole = this.getImplicitRole(element);
        console.log('[SLI] Implicit role for', tag, ':', implicitRole);
        if (implicitRole) {
            const text = this.getAccessibleName(element);
            console.log('[SLI] Accessible name for', tag, ':', text);
            
            if (text) {
                locators.push({
                    xpath: `page.getByRole('${implicitRole}', { name: '${text}' })`,
                    score: 92,
                    type: '🎭 Playwright Role + Name',
                    description: `Implicit ${implicitRole} with accessible name`
                });
                
                // Partial text match
                locators.push({
                    xpath: `page.getByRole('${implicitRole}', { name: /${text}/i })`,
                    score: 88,
                    type: '🎭 Playwright Role + Regex',
                    description: `${implicitRole} with partial name match`
                });
            } else {
                locators.push({
                    xpath: `page.getByRole('${implicitRole}')`,
                    score: 85,
                    type: '🎭 Playwright Role',
                    description: `Implicit ${implicitRole} role`
                });
            }
        }
        
        console.log('[SLI] Generated role locators:', locators.length, locators);
        return locators;
    }

    // Generate Playwright text-based locators
    static generatePlaywrightTextLocators(element) {
        const locators = [];
        const text = this.getAccessibleName(element) || SLIUtils.getElementText(element);
        
        if (text && text.trim()) {
            const cleanText = text.trim();
            
            // Exact text match
            locators.push({
                xpath: `page.getByText('${cleanText}')`,
                score: 88,
                type: '📝 Playwright Text',
                description: 'Exact text match'
            });
            
            // Partial text match
            if (cleanText.length > 5) {
                locators.push({
                    xpath: `page.getByText('${cleanText}', { exact: false })`,
                    score: 82,
                    type: '📝 Playwright Text (Partial)',
                    description: 'Partial text match'
                });
            }
            
            // Regex text match
            locators.push({
                xpath: `page.getByText(/${cleanText}/i)`,
                score: 85,
                type: '📝 Playwright Text (Regex)',
                description: 'Case-insensitive regex match'
            });
        }
        
        return locators;
    }

    // Generate Playwright accessibility locators
    static generatePlaywrightAccessibilityLocators(element) {
        const locators = [];
        
        // Label locators
        const label = this.getAccessibleName(element);
        if (label) {
            locators.push({
                xpath: `page.getByLabel('${label}')`,
                score: 95,
                type: '🏷️ Playwright Label',
                description: 'Form control by label'
            });
            
            // Partial label match
            if (label.length > 8) {
                locators.push({
                    xpath: `page.getByLabel(/${label}/i)`,
                    score: 90,
                    type: '🏷️ Playwright Label (Regex)',
                    description: 'Form control by partial label'
                });
            }
        }
        
        // Placeholder locators
        const placeholder = element.getAttribute('placeholder');
        if (placeholder) {
            locators.push({
                xpath: `page.getByPlaceholder('${placeholder}')`,
                score: 92,
                type: '📝 Playwright Placeholder',
                description: 'Input by placeholder text'
            });
        }
        
        // Alt text for images
        const altText = element.getAttribute('alt');
        if (altText && element.tagName.toLowerCase() === 'img') {
            locators.push({
                xpath: `page.getByAltText('${altText}')`,
                score: 95,
                type: '🖼️ Playwright Alt Text',
                description: 'Image by alt text'
            });
        }
        
        // Title attribute
        const title = element.getAttribute('title');
        if (title) {
            locators.push({
                xpath: `page.getByTitle('${title}')`,
                score: 88,
                type: '📋 Playwright Title',
                description: 'Element by title attribute'
            });
        }
        
        return locators;
    }

    // Generate Playwright filter locators
    static generatePlaywrightFilterLocators(element) {
        const locators = [];
        
        // Test ID locators (highest priority)
        const testId = element.getAttribute('data-testid') || 
                      element.getAttribute('data-test') || 
                      element.getAttribute('data-cy');
        if (testId) {
            locators.push({
                xpath: `page.getByTestId('${testId}')`,
                score: 98,
                type: '🧪 Playwright TestId',
                description: 'Test-specific identifier'
            });
        }
        
        // CSS selector as locator
        if (element.id && !SLIUtils.isDynamicValue(element.id)) {
            locators.push({
                xpath: `page.locator('#${element.id}')`,
                score: 85,
                type: '🎯 Playwright CSS',
                description: 'CSS ID selector locator'
            });
        } else if (element.className) {
            const stableClasses = SLIUtils.getStableClasses(element);
            if (stableClasses.length > 0) {
                const cssSelector = element.tagName.toLowerCase() + '.' + stableClasses.join('.');
                locators.push({
                    xpath: `page.locator('${cssSelector}')`,
                    score: 75,
                    type: '🎯 Playwright CSS',
                    description: 'CSS class selector locator'
                });
            }
        }
        
        // Combined locators (role + additional filters)
        const role = this.getImplicitRole(element);
        const text = this.getAccessibleName(element);
        
        if (role && element.hasAttribute('disabled')) {
            locators.push({
                xpath: `page.getByRole('${role}', { disabled: true })`,
                score: 88,
                type: '🎭 Playwright Role (Disabled)',
                description: `Disabled ${role} element`
            });
        }
        
        if (role && element.hasAttribute('checked')) {
            locators.push({
                xpath: `page.getByRole('${role}', { checked: true })`,
                score: 90,
                type: '🎭 Playwright Role (Checked)',
                description: `Checked ${role} element`
            });
        }
        
        return locators;
    }

    // Get implicit ARIA role based on HTML semantics
    static getImplicitRole(element) {
        const tag = element.tagName.toLowerCase();
        const type = element.getAttribute('type');
        
        // Button elements
        if (tag === 'button') return 'button';
        if (tag === 'input' && ['button', 'submit', 'reset'].includes(type)) return 'button';
        
        // Link elements
        if (tag === 'a' && element.hasAttribute('href')) return 'link';
        
        // Form controls
        if (tag === 'input' && type === 'text') return 'textbox';
        if (tag === 'input' && type === 'password') return 'textbox';
        if (tag === 'input' && type === 'email') return 'textbox';
        if (tag === 'input' && type === 'search') return 'searchbox';
        if (tag === 'textarea') return 'textbox';
        if (tag === 'input' && type === 'checkbox') return 'checkbox';
        if (tag === 'input' && type === 'radio') return 'radio';
        if (tag === 'select') return 'combobox';
        
        // Headings
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';
        
        // Lists
        if (tag === 'ul' || tag === 'ol') return 'list';
        if (tag === 'li') return 'listitem';
        
        // Table elements
        if (tag === 'table') return 'table';
        if (tag === 'tr') return 'row';
        if (tag === 'td') return 'cell';
        if (tag === 'th') return 'columnheader';
        
        // Navigation
        if (tag === 'nav') return 'navigation';
        
        // Landmarks
        if (tag === 'main') return 'main';
        if (tag === 'header') return 'banner';
        if (tag === 'footer') return 'contentinfo';
        if (tag === 'aside') return 'complementary';
        
        // Images
        if (tag === 'img' && element.hasAttribute('alt')) return 'img';
        
        // Generic
        if (tag === 'dialog') return 'dialog';
        if (tag === 'article') return 'article';
        if (tag === 'section') return 'region';
        
        return null;
    }

    // Get accessible name for an element
    static getAccessibleName(element) {
        // 1. aria-labelledby
        const labelledby = element.getAttribute('aria-labelledby');
        if (labelledby) {
            const labelElement = document.getElementById(labelledby);
            if (labelElement) {
                return SLIUtils.getElementText(labelElement);
            }
        }
        
        // 2. aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        // 3. Associated label (for form controls)
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return SLIUtils.getElementText(label);
            }
        }
        
        // 4. Parent label
        const parentLabel = element.closest('label');
        if (parentLabel) {
            return SLIUtils.getElementText(parentLabel);
        }
        
        // 5. Value for form controls
        if (['input', 'textarea', 'select'].includes(element.tagName.toLowerCase())) {
            if (element.value) return element.value;
            if (element.placeholder) return element.placeholder;
        }
        
        // 6. Alt attribute for images
        if (element.tagName.toLowerCase() === 'img') {
            return element.getAttribute('alt');
        }
        
        // 7. Text content
        const text = SLIUtils.getElementText(element);
        if (text && text.length < 100) return text;
        
        // 8. Title attribute
        return element.getAttribute('title');
    }

    // Generate hierarchical XPath (fallback)
    static getHierarchicalXPath(element) {
        const path = [];
        let current = element;
        
        while (current && current.tagName !== 'HTML') {
            const tag = current.tagName.toLowerCase();
            const parent = current.parentElement;
            
            if (parent) {
                const siblings = Array.from(parent.children).filter(el => el.tagName === current.tagName);
                const index = siblings.indexOf(current) + 1;
                path.unshift(tag + '[' + index + ']');
            } else {
                path.unshift(tag);
            }
            
            current = parent;
        }
        
        return '//' + path.join('/');
    }
}

    // === UI.JS ===
// UI Components Module
// Handles modal creation, highlighting, and UI interactions

class SLIUIComponents {
    // Create the floating modal with robust CSS
    static createModal() {
        const config = SLIConfig.getConfig();
        const state = SLIConfig.getState();
        
        const modal = document.createElement('div');
        modal.id = config.modalId;
        modal.className = 'sli-modal';
        
        modal.innerHTML = `
            <div class="sli-header">
                <span class="sli-title">🎯 Smart Locator Inspector</span>
                <button class="sli-close" onclick="window.SLI.toggle()" title="Hide (ESC)">×</button>
            </div>
            <div class="sli-content">
                <div class="sli-loading">Hover over an element...</div>
            </div>
        `;

        // Inject comprehensive styles
        SLIStyles.injectStyles();
        
        // Add to page
        document.documentElement.appendChild(modal);
        
        // Make draggable
        this.makeDraggable(modal);
        
        // Update state
        SLIConfig.setState({ modal });
        
        return modal;
    }

    // Create the highlight box
    static createHighlightBox() {
        const config = SLIConfig.getConfig();
        
        // Remove any existing highlight box first
        const existing = document.getElementById(config.highlightId);
        if (existing) {
            existing.remove();
        }
        
        const highlightBox = document.createElement('div');
        highlightBox.id = config.highlightId;
        highlightBox.className = 'sli-highlight';
        
        // Only set essential positioning styles, let CSS handle the rest
        highlightBox.style.position = 'fixed';
        highlightBox.style.top = '0px';
        highlightBox.style.left = '0px';
        highlightBox.style.width = '0px';
        highlightBox.style.height = '0px';
        highlightBox.style.pointerEvents = 'none';
        highlightBox.style.zIndex = '999999999';
        highlightBox.style.display = 'none';
        
        document.body.appendChild(highlightBox);
        console.log('[SLI] Highlight box created and appended to body:', highlightBox);
        
        // Update state
        SLIConfig.setState({ highlightBox });
        
        return highlightBox;
    }

    // Make modal draggable
    static makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const header = element.querySelector('.sli-header');
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = (initialX + deltaX) + 'px';
            element.style.top = (initialY + deltaY) + 'px';
            element.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'default';
            }
        });
    }

    // Highlight an element with Chrome DevTools-like behavior
    static highlightElement(element) {
        const state = SLIConfig.getState();
        
        if (!state.highlightBox || !element) {
            console.log('[SLI] Cannot highlight - missing highlightBox or element');
            return;
        }
        
        const rect = element.getBoundingClientRect();
        
        // Ensure element is visible and has dimensions
        if (rect.width === 0 || rect.height === 0 || !element.offsetParent) {
            this.hideHighlight();
            return;
        }
        
        console.log('[SLI] Highlighting element:', element.tagName, 'at:', rect.left, rect.top, rect.width, rect.height);
        
        // Use fixed positioning since we're showing overlay on viewport
        const highlightBox = state.highlightBox;
        
        // Position the highlight box
        highlightBox.style.left = rect.left + 'px';
        highlightBox.style.top = rect.top + 'px';
        highlightBox.style.width = rect.width + 'px';
        highlightBox.style.height = rect.height + 'px';
        
        // Show the highlight box
        highlightBox.style.display = 'block';
        
        // Apply frozen state class if needed
        if (state.isFrozen) {
            highlightBox.classList.add('frozen');
        } else {
            highlightBox.classList.remove('frozen');
        }
        
        console.log('[SLI] Highlight box positioned and shown:', highlightBox.style.left, highlightBox.style.top, highlightBox.style.width, highlightBox.style.height);
        
        // Add element info overlay (like Chrome DevTools)
        this.showElementInfo(element, rect);
    }

    // Show element info overlay (like Chrome DevTools)
    static showElementInfo(element, rect) {
        const state = SLIConfig.getState();
        
        // Remove existing info overlay
        const existingInfo = document.getElementById('sli-element-info');
        if (existingInfo) existingInfo.remove();
        
        // Create element info overlay
        const infoBox = document.createElement('div');
        infoBox.id = 'sli-element-info';
        infoBox.style.cssText = `
            position: fixed !important;
            z-index: 999999998 !important;
            pointer-events: none !important;
            background: rgba(0, 0, 0, 0.8) !important;
            color: white !important;
            padding: 4px 8px !important;
            border-radius: 3px !important;
            font-family: 'Segoe UI', sans-serif !important;
            font-size: 11px !important;
            font-weight: 500 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
            white-space: nowrap !important;
        `;
        
        // Build element info text
        const tag = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const className = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : '';
        const dimensions = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
        
        infoBox.textContent = `${tag}${id}${className} ${dimensions}`;
        
        // Position the info box
        let infoTop = rect.top - 25;
        let infoLeft = rect.left;
        
        // Adjust position if it would go off screen
        if (infoTop < 0) {
            infoTop = rect.bottom + 5;
        }
        if (infoLeft + 200 > window.innerWidth) {
            infoLeft = window.innerWidth - 200;
        }
        if (infoLeft < 0) {
            infoLeft = 5;
        }
        
        infoBox.style.top = infoTop + 'px';
        infoBox.style.left = infoLeft + 'px';
        
        document.body.appendChild(infoBox);
        
        // Auto-remove after a delay
        setTimeout(() => {
            if (infoBox.parentNode) {
                infoBox.remove();
            }
        }, 3000);
    }

    // Hide highlight
    static hideHighlight() {
        const state = SLIConfig.getState();
        if (state.highlightBox) {
            state.highlightBox.style.display = 'none';
        }
        
        // Also hide element info
        const existingInfo = document.getElementById('sli-element-info');
        if (existingInfo) existingInfo.remove();
    }

    // Update modal content
    static updateModal(data) {
        const state = SLIConfig.getState();
        if (!state.modal) return;

        const content = state.modal.querySelector('.sli-content');
        if (!content) return;

        if (data.message) {
            content.innerHTML = `
                <div class="sli-message">${data.message}</div>
                ${data.instructions ? data.instructions.map(inst => `<div class="sli-instruction">💡 ${inst}</div>`).join('') : ''}
            `;
            return;
        }

        const fields = [];

        // Basic element info
        fields.push(this.createField('Tag', data.tag.toUpperCase(), 'HTML element tag name'));
        
        if (data.id) fields.push(this.createField('ID', data.id, 'Element ID attribute'));
        if (data.name) fields.push(this.createField('Name', data.name, 'Name attribute'));
        if (data.className) fields.push(this.createField('Class', data.className, 'CSS classes'));
        if (data.text) fields.push(this.createField('Text', data.text, 'Visible text content'));

        // Primary locators
        fields.push(this.createField('CSS Selector', data.css, 'CSS selector for this element'));

        // Smart XPath suggestions
        if (data.smartXPaths && data.smartXPaths.length > 0) {
            console.log('[SLI] All smartXPaths:', data.smartXPaths.map(x => ({type: x.type, xpath: x.xpath})));
            
            // Log the actual type values to debug
            console.log('[SLI] All types debug:', data.smartXPaths.map(x => x.type));
            
            // Group locators by type  
            const playwrightLocators = data.smartXPaths.filter(xpath => {
                if (!xpath.type) {
                    console.log('[SLI] Locator with no type:', xpath);
                    return false;
                }
                const isPlaywright = xpath.type.toLowerCase().includes('playwright');
                console.log(`[SLI] Checking "${xpath.type}" - isPlaywright: ${isPlaywright}`);
                return isPlaywright;
            });
            const traditionalLocators = data.smartXPaths.filter(xpath => !playwrightLocators.includes(xpath));
            
            console.log('[SLI] Playwright locators found:', playwrightLocators.length, playwrightLocators.map(x => x.type));
            console.log('[SLI] Traditional locators found:', traditionalLocators.length, traditionalLocators.map(x => x.type));
            
            // Show Playwright locators first if any
            if (playwrightLocators.length > 0) {
                fields.push('<div class="sli-xpath-header">🎭 Playwright Locators</div>');
                playwrightLocators.slice(0, 8).forEach(xpath => {
                    fields.push(this.createSmartXPathField(xpath));
                });
            }
            
            // Then show traditional XPath locators
            if (traditionalLocators.length > 0) {
                fields.push('<div class="sli-xpath-header">🧠 Traditional XPath Suggestions</div>');
                traditionalLocators.slice(0, 5).forEach(xpath => {
                    fields.push(this.createSmartXPathField(xpath));
                });
            }
        } else {
            fields.push(this.createField('XPath', data.xpath, 'XPath locator for this element'));
        }

        // DOM Hierarchy
        if (data.hierarchy) {
            fields.push(SLIDOMHierarchy.createHierarchySection(data.hierarchy));
        }

        content.innerHTML = fields.join('');

        // Attach click handlers for copying
        this.attachCopyHandlers(content);
    }

    // Create a field in the modal
    static createField(label, value, description, options = {}) {
        const classes = ['sli-field'];
        if (options.unique) classes.push('sli-unique');
        if (options.nonUnique) classes.push('sli-non-unique');
        if (options.isSmartXPath) classes.push('sli-smart-xpath');
        if (options.isPlaywrightXPath) classes.push('sli-playwright-xpath');
        if (options.isTableXPath) classes.push('sli-table-xpath');

        let scoreSection = '';
        if (options.score !== undefined) {
            const scoreColor = SLIUtils.getScoreColor(options.score);
            const scoreBar = SLIUtils.generateScoreBar(options.score);
            const uniqueness = options.unique ? 'UNIQUE' : 'NON-UNIQUE';
            
            scoreSection = `
                <div class="sli-score-container">
                    <div class="sli-uniqueness" style="color: ${scoreColor};">${uniqueness}</div>
                    <div class="sli-score" style="color: ${scoreColor};">${options.score}/100</div>
                    <div class="sli-score-bar">${scoreBar}</div>
                </div>
            `;
        }

        const escapedValue = SLIUtils.escapeHtml(value);

        return `
            <div class="${classes.join(' ')}" style="position: relative; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 8px;">
                <div class="sli-field-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="sli-field-label" style="font-weight: bold; font-size: 12px; color: #61dafb;">${label}</span>
                    ${scoreSection}
                </div>
                ${description ? `<div class="sli-field-description" style="font-size: 10px; color: #ccc; margin-bottom: 4px;">${description}</div>` : ''}
                <div class="sli-field-value sli-selectable" 
                     style="background: rgba(40, 44, 52, 0.8); 
                            border: 1px solid rgba(255,255,255,0.1); 
                            border-radius: 3px; 
                            padding: 6px; 
                            font-family: 'Consolas', 'Monaco', monospace; 
                            font-size: 11px; 
                            color: #98c379;
                            cursor: text;
                            user-select: text;
                            -webkit-user-select: text;
                            -moz-user-select: text;
                            -ms-user-select: text;
                            word-break: break-all;
                            overflow-wrap: break-word;
                            min-height: 16px;
                            line-height: 1.2;"
                     onclick="this.focus(); this.select(); document.getSelection().selectAllChildren(this);"
                     onfocus="this.style.borderColor='#61dafb'; this.style.backgroundColor='rgba(97, 218, 251, 0.1)';"
                     onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.backgroundColor='rgba(40, 44, 52, 0.8)';"
                     tabindex="0">${escapedValue}</div>
            </div>
        `;
    }

    // Create smart XPath field with scoring
    static createSmartXPathField(xpath) {
        const isTableXPath = xpath.type && xpath.type.includes('📊');
        const isPlaywrightXPath = xpath.type && (
            xpath.type.includes('🎭') || 
            xpath.type.includes('📝') ||
            xpath.type.includes('🏷️') ||
            xpath.type.includes('🧪') ||
            xpath.type.includes('🖼️') ||
            xpath.type.includes('📋') ||
            xpath.type.includes('🎯')
        );
        
        return this.createField(
            xpath.type || 'XPath',
            xpath.xpath,
            xpath.description,
            {
                score: xpath.score,
                unique: xpath.isUnique,
                nonUnique: !xpath.isUnique,
                isSmartXPath: !isTableXPath && !isPlaywrightXPath,
                isPlaywrightXPath: isPlaywrightXPath,
                isTableXPath: isTableXPath
            }
        );
    }

    // Attach copy handlers to modal content
    // Setup text selection for manual copy (Ctrl+C)
    static attachCopyHandlers(content) {
        // Remove any existing listeners
        if (content._sliCopyListener) {
            content.removeEventListener('click', content._sliCopyListener, true);
        }
        
        // Make all selectable fields focusable and selectable
        const selectableFields = content.querySelectorAll('.sli-selectable');
        console.log('[SLI] Setting up manual text selection for', selectableFields.length, 'fields');
        
        selectableFields.forEach((field, index) => {
            // Ensure text is selectable
            field.style.userSelect = 'text';
            field.style.webkitUserSelect = 'text';
            field.style.mozUserSelect = 'text';
            field.style.msUserSelect = 'text';
            field.setAttribute('tabindex', '0');
            
            console.log(`[SLI] Field ${index}: Text selectable - "${field.textContent}"`);
            
            // Auto-select text when clicked
            field.addEventListener('click', function() {
                this.focus();
                
                // Select all text in the field
                if (window.getSelection) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(this);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else if (document.selection) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(this);
                    range.select();
                }
                
                console.log('[SLI] Text selected, use Ctrl+C to copy');
            });
            
            // Add keyboard support
            field.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'a') {
                    e.preventDefault();
                    this.click(); // Trigger text selection
                }
            });
        });
        
        // Add instruction tooltip to the modal
        const modal = content.closest('.sli-modal');
        if (modal && !modal.querySelector('.sli-copy-instruction')) {
            const instruction = document.createElement('div');
            instruction.className = 'sli-copy-instruction';
            instruction.innerHTML = `
                <div style="background: rgba(97, 218, 251, 0.1); 
                           border: 1px solid rgba(97, 218, 251, 0.3); 
                           border-radius: 4px; 
                           padding: 8px; 
                           margin: 8px 0; 
                           font-size: 11px; 
                           color: #61dafb;
                           text-align: center;">
                    💡 <strong>How to copy:</strong> Click any locator text to select it, then press <kbd style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">Ctrl+C</kbd>
                </div>
            `;
            content.insertBefore(instruction, content.firstChild);
        }
    }

    // Toggle modal visibility
    static toggle() {
        const state = SLIConfig.getState();
        
        if (state.modal) {
            state.modal.style.display = state.modal.style.display === 'none' ? 'block' : 'none';
        }
        
        SLIConfig.setState({ isActive: !state.isActive });
        
        if (!state.isActive) {
            this.hideHighlight();
        }
    }

    // Set frozen state
    static setFrozenState(frozen) {
        const state = SLIConfig.getState();
        
        SLIConfig.setState({ isFrozen: frozen });
        
        if (state.modal) {
            if (frozen) {
                state.modal.classList.add('sli-frozen');
            } else {
                state.modal.classList.remove('sli-frozen');
            }
        }
        
        if (state.highlightBox) {
            if (frozen) {
                state.highlightBox.classList.add('frozen');
            } else {
                state.highlightBox.classList.remove('frozen');
            }
        }
    }

    // Clean up UI elements
    static cleanup() {
        const config = SLIConfig.getConfig();
        
        // Remove modal
        const modal = document.getElementById(config.modalId);
        if (modal) modal.remove();
        
        // Remove highlight box
        const highlight = document.getElementById(config.highlightId);
        if (highlight) highlight.remove();
        
        // Remove styles
        const styles = document.getElementById('sli-styles');
        if (styles) styles.remove();
        
        // Reset state
        SLIConfig.resetState();
    }
    
    // Enhanced toast notification system
    static showToast(title, message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.sli-toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = 'sli-toast';
        
        const isSuccess = type === 'success';
        const backgroundColor = isSuccess ? 'rgba(152, 195, 121, 0.95)' : 'rgba(224, 108, 117, 0.95)';
        const borderColor = isSuccess ? '#98c379' : '#e06c75';
        
        toast.innerHTML = `
            <div class="sli-toast-content">
                <div class="sli-toast-title">${title}</div>
                <div class="sli-toast-message">${message}</div>
            </div>
            <div class="sli-toast-close">×</div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            background: ${backgroundColor};
            color: white;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            padding: 0;
            z-index: 999999999;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            animation: sli-toast-slide-in 0.3s ease-out;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: stretch;
        `;
        
        // Add animation styles if not already present
        if (!document.getElementById('sli-toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'sli-toast-styles';
            toastStyles.textContent = `
                @keyframes sli-toast-slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes sli-toast-slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .sli-toast-content {
                    flex: 1;
                    padding: 16px;
                }
                
                .sli-toast-title {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 4px;
                }
                
                .sli-toast-message {
                    font-size: 13px;
                    opacity: 0.9;
                    word-wrap: break-word;
                }
                
                .sli-toast-close {
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    opacity: 0.7;
                    border-left: 1px solid rgba(255,255,255,0.2);
                }
                
                .sli-toast-close:hover {
                    opacity: 1;
                    background: rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(toastStyles);
        }
        
        // Add close functionality
        const closeBtn = toast.querySelector('.sli-toast-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'sli-toast-slide-out 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto-hide after delay
        const autoHideDelay = isSuccess ? 3000 : 5000;
        const autoHideTimer = setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'sli-toast-slide-out 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, autoHideDelay);
        
        // Clear timer if manually closed
        closeBtn.addEventListener('click', () => clearTimeout(autoHideTimer));
        
        document.body.appendChild(toast);
        
        // Add click to copy full text functionality for success toasts
        if (isSuccess) {
            toast.querySelector('.sli-toast-content').addEventListener('click', () => {
                // Extract the full locator text from the message
                const fullText = message.replace('Locator copied: ', '');
                navigator.clipboard?.writeText(fullText);
            });
            toast.querySelector('.sli-toast-content').style.cursor = 'pointer';
            toast.querySelector('.sli-toast-content').title = 'Click to copy full locator text';
        }
    }
}

    // === EVENTS.JS ===
// Event Handlers Module
// Manages all event handling for mouse, keyboard, and navigation

class SLIEventHandlers {
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

    // === MAIN.JS ===
// Main Smart Locator Inspector Module
// Entry point that orchestrates all modules

class SmartLocatorInspector {
    // Initialize the inspector
    static init() {
        console.log('[SLI] Smart Locator Inspector initialized');
        
        // Clean up any existing instances
        this.cleanup();
        
        // Create UI elements
        SLIUIComponents.createModal();
        SLIUIComponents.createHighlightBox();
        
        // Attach event listeners
        SLIEventHandlers.attachEventListeners();
        
        // Show initial message
        SLIUIComponents.updateModal({
            message: 'Hover over elements to inspect them!',
            instructions: [
                'CTRL - Freeze current element',
                'ESC - Toggle inspector on/off', 
                'Click any locator to copy it'
            ]
        });

        // Setup navigation persistence
        SLIEventHandlers.setupNavigationPersistence();
    }

    // Toggle inspector visibility
    static toggle() {
        SLIUIComponents.toggle();
    }

    // Clean up all inspector elements and state
    static cleanup() {
        console.log('[SLI] Cleaning up Smart Locator Inspector...');
        
        // Remove event listeners
        SLIEventHandlers.removeEventListeners();
        
        // Clean up UI
        SLIUIComponents.cleanup();
    }

    // Get current state (for debugging)
    static getState() {
        return SLIConfig.getState();
    }

    // Get configuration (for debugging)
    static getConfig() {
        return SLIConfig.getConfig();
    }
}


    // === INITIALIZATION ===
    
    // Initialize the inspector
    SmartLocatorInspector.init();

    // Expose global interface
    window.SLI = {
        init: SmartLocatorInspector.init.bind(SmartLocatorInspector),
        toggle: SmartLocatorInspector.toggle.bind(SmartLocatorInspector),
        cleanup: SmartLocatorInspector.cleanup.bind(SmartLocatorInspector),
        getState: SmartLocatorInspector.getState.bind(SmartLocatorInspector),
        getConfig: SmartLocatorInspector.getConfig.bind(SmartLocatorInspector)
    };

    // Store reference for cleanup
    window.SmartLocatorInspector = SmartLocatorInspector;

})();