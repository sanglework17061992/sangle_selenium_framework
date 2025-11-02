// Utility Functions Module
// Common utility functions used throughout the Smart Locator Inspector

export class SLIUtils {
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