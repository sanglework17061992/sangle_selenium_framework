// Smart Locator Inspector - Chrome Extension Content Script
// Adapted from the original injector.js for Chrome Extension use

console.log('Smart Locator Inspector content script loaded');

class SmartLocatorInspector {
    constructor() {
        this.isActive = false;
        this.isFrozen = false;
        this.currentElement = null;
        this.modal = null;
        this.highlightBox = null;
        this.lastHoveredElement = null;
        
        this.config = {
            modalId: 'sli-modal',
            highlightId: 'sli-highlight',
            zIndex: 2147483647,
            excludeElements: ['sli-modal', 'sli-highlight'],
            ignoreTags: ['HTML', 'BODY']
        };
        
        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }
    
    init() {
        if (this.isActive) {
            this.deactivate();
            return;
        }
        
        console.log('[SLI] Smart Locator Inspector activated');
        this.isActive = true;
        
        this.cleanup();
        this.createModal();
        this.createHighlightBox();
        this.attachEventListeners();
        
        this.updateModal({
            message: 'Smart Locator Inspector Active! 🎯',
            instructions: [
                'CTRL - Freeze current element',
                'ESC - Toggle inspector on/off',
                'Click any locator to copy it'
            ]
        });
    }
    
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.init();
        }
    }
    
    deactivate() {
        console.log('[SLI] Inspector deactivated');
        this.isActive = false;
        this.isFrozen = false;
        this.currentElement = null;
        this.cleanup();
        this.removeEventListeners();
    }
    
    createModal() {
        // Remove existing modal
        const existing = document.getElementById(this.config.modalId);
        if (existing) existing.remove();
        
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.id = this.config.modalId;
        this.modal.innerHTML = `
            <div class="sli-header">
                <div class="sli-title">🎯 Smart Locator Inspector</div>
                <button class="sli-close" onclick="window.smartLocatorInspector.deactivate()">×</button>
            </div>
            <div class="sli-content">
                <div class="sli-loading">Hover over elements to inspect...</div>
            </div>
        `;
        
        // Inject CSS
        this.injectCSS();
        
        // Make modal draggable
        this.makeDraggable();
        
        document.body.appendChild(this.modal);
    }
    
    createHighlightBox() {
        const existing = document.getElementById(this.config.highlightId);
        if (existing) existing.remove();
        
        this.highlightBox = document.createElement('div');
        this.highlightBox.id = this.config.highlightId;
        this.highlightBox.className = 'sli-highlight';
        document.body.appendChild(this.highlightBox);
    }
    
    attachEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove, true);
        document.addEventListener('keydown', this.handleKeyDown, true);
        document.addEventListener('click', this.handleClick, true);
    }
    
    removeEventListeners() {
        document.removeEventListener('mousemove', this.handleMouseMove, true);
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('click', this.handleClick, true);
    }
    
    handleMouseMove(event) {
        if (!this.isActive || this.isFrozen) return;
        
        const element = this.getElementFromPoint(event.clientX, event.clientY);
        if (element && element !== this.lastHoveredElement) {
            this.inspectElement(element);
            this.lastHoveredElement = element;
        }
    }
    
    handleKeyDown(event) {
        if (!this.isActive) return;
        
        if (event.key === 'Escape') {
            event.preventDefault();
            this.deactivate();
        } else if (event.ctrlKey && !this.isFrozen) {
            event.preventDefault();
            this.freezeElement();
        } else if (event.ctrlKey && this.isFrozen) {
            event.preventDefault();
            this.unfreezeElement();
        }
    }
    
    handleClick(event) {
        if (!this.isActive) return;
        
        // Allow clicks on locator fields for copying
        if (event.target.closest('.sli-field')) {
            const field = event.target.closest('.sli-field');
            const locator = field.querySelector('.sli-field-value');
            if (locator) {
                this.copyToClipboard(locator.textContent);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    
    getElementFromPoint(x, y) {
        // Temporarily hide our UI elements
        const modal = document.getElementById(this.config.modalId);
        const highlight = document.getElementById(this.config.highlightId);
        
        if (modal) modal.style.pointerEvents = 'none';
        if (highlight) highlight.style.pointerEvents = 'none';
        
        const element = document.elementFromPoint(x, y);
        
        // Restore pointer events
        if (modal) modal.style.pointerEvents = 'auto';
        if (highlight) highlight.style.pointerEvents = 'none';
        
        return element && !this.isExcludedElement(element) ? element : null;
    }
    
    isExcludedElement(element) {
        if (!element) return true;
        if (this.config.ignoreTags.includes(element.tagName)) return true;
        
        let current = element;
        while (current) {
            if (current.id && this.config.excludeElements.some(id => current.id.includes(id))) {
                return true;
            }
            if (current.className && this.config.excludeElements.some(cls => 
                current.className.toString().includes(cls))) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
    
    inspectElement(element) {
        this.currentElement = element;
        this.highlightElement(element);
        
        // Generate locators
        const locators = this.generateAllLocators(element);
        this.updateModal({ locators });
    }
    
    freezeElement() {
        if (this.currentElement) {
            this.isFrozen = true;
            this.modal.classList.add('sli-frozen');
            this.highlightBox.classList.add('frozen');
            console.log('[SLI] Element frozen');
        }
    }
    
    unfreezeElement() {
        this.isFrozen = false;
        this.modal.classList.remove('sli-frozen');
        this.highlightBox.classList.remove('frozen');
        console.log('[SLI] Element unfrozen');
    }
    
    highlightElement(element) {
        if (!element || !this.highlightBox) return;
        
        const rect = element.getBoundingClientRect();
        const style = this.highlightBox.style;
        
        style.display = 'block';
        style.left = rect.left + 'px';
        style.top = rect.top + 'px';
        style.width = rect.width + 'px';
        style.height = rect.height + 'px';
    }
    
    generateAllLocators(element) {
        return {
            smartXPath: this.generateSmartXPath(element),
            id: element.id ? `#${element.id}` : null,
            className: this.generateClassSelector(element),
            cssSelector: this.generateCSSSelector(element),
            tagName: element.tagName.toLowerCase(),
            text: this.getElementText(element),
            attributes: this.getKeyAttributes(element)
        };
    }
    
    generateSmartXPath(element) {
        // Simplified XPath generation for extension
        const strategies = [
            () => this.xpathById(element),
            () => this.xpathByDataTestId(element),
            () => this.xpathByText(element),
            () => this.xpathByClass(element),
            () => this.xpathByPosition(element)
        ];
        
        for (const strategy of strategies) {
            const xpath = strategy();
            if (xpath && this.isUniqueXPath(xpath)) {
                return { xpath, score: 95, unique: true };
            }
        }
        
        return { xpath: this.generateBasicXPath(element), score: 70, unique: false };
    }
    
    xpathById(element) {
        if (element.id && !this.isDynamicValue(element.id)) {
            return `//*[@id="${element.id}"]`;
        }
        return null;
    }
    
    xpathByDataTestId(element) {
        const testId = element.getAttribute('data-testid') || element.getAttribute('data-test');
        if (testId) {
            return `//*[@data-testid="${testId}"]`;
        }
        return null;
    }
    
    xpathByText(element) {
        const text = this.getElementText(element).trim();
        if (text && text.length > 2 && text.length < 50) {
            return `//*[normalize-space(text())="${text}"]`;
        }
        return null;
    }
    
    xpathByClass(element) {
        const stableClasses = this.getStableClasses(element);
        if (stableClasses.length > 0) {
            const classXPath = stableClasses.map(cls => `contains(@class, "${cls}")`).join(' and ');
            return `//*[${classXPath}]`;
        }
        return null;
    }
    
    xpathByPosition(element) {
        const tag = element.tagName.toLowerCase();
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
            const index = siblings.indexOf(element) + 1;
            return `${this.generateBasicXPath(parent)}/${tag}[${index}]`;
        }
        return `//${tag}`;
    }
    
    generateBasicXPath(element) {
        const path = [];
        let current = element;
        
        while (current && current.nodeType === Node.ELEMENT_NODE) {
            const tag = current.tagName.toLowerCase();
            const siblings = current.parentElement ? 
                Array.from(current.parentElement.children).filter(el => el.tagName === current.tagName) : [];
            
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                path.unshift(`${tag}[${index}]`);
            } else {
                path.unshift(tag);
            }
            
            current = current.parentElement;
            if (current === document.body) break;
        }
        
        return '//' + path.join('/');
    }
    
    isUniqueXPath(xpath) {
        try {
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength === 1;
        } catch (e) {
            return false;
        }
    }
    
    isDynamicValue(value) {
        return /\d{4,}|random|temp|generated/.test(value);
    }
    
    getStableClasses(element) {
        if (!element.className) return [];
        
        const classes = element.className.toString().split(/\s+/).filter(cls => {
            return cls && !this.isDynamicValue(cls) && cls.length > 2;
        });
        
        return classes.slice(0, 3);
    }
    
    getElementText(element) {
        if (!element) return '';
        
        // Get direct text content, not including children
        const textNodes = Array.from(element.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .filter(text => text.length > 0);
            
        return textNodes.join(' ').substring(0, 50);
    }
    
    generateClassSelector(element) {
        const classes = this.getStableClasses(element);
        return classes.length > 0 ? '.' + classes.join('.') : null;
    }
    
    generateCSSSelector(element) {
        const tag = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = this.getStableClasses(element);
        const classStr = classes.length > 0 ? '.' + classes.join('.') : '';
        
        return tag + id + classStr;
    }
    
    getKeyAttributes(element) {
        const keyAttrs = ['data-testid', 'data-test', 'name', 'type', 'role', 'aria-label', 'placeholder'];
        const attributes = {};
        
        keyAttrs.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) {
                attributes[attr] = value;
            }
        });
        
        return attributes;
    }
    
    updateModal(data) {
        if (!this.modal) return;
        
        const content = this.modal.querySelector('.sli-content');
        if (!content) return;
        
        if (data.message) {
            content.innerHTML = `<div class="sli-message">${data.message}</div>`;
            
            if (data.instructions) {
                content.innerHTML += '<div class="sli-instructions">';
                data.instructions.forEach(instruction => {
                    content.innerHTML += `<div class="sli-instruction">${instruction}</div>`;
                });
                content.innerHTML += '</div>';
            }
        }
        
        if (data.locators) {
            content.innerHTML = this.generateLocatorHTML(data.locators);
        }
    }
    
    generateLocatorHTML(locators) {
        let html = '';
        
        // Smart XPath
        if (locators.smartXPath) {
            const { xpath, score, unique } = locators.smartXPath;
            const uniqueClass = unique ? 'sli-unique' : 'sli-non-unique';
            const uniqueText = unique ? 'UNIQUE' : 'NON-UNIQUE';
            
            html += `
                <div class="sli-field ${uniqueClass}" onclick="window.smartLocatorInspector.copyToClipboard('${this.escapeHtml(xpath)}')">
                    <div class="sli-field-header">
                        <div class="sli-field-label">Smart XPath</div>
                        <div class="sli-score-container">
                            <div class="sli-uniqueness">${uniqueText}</div>
                            <div class="sli-score">Score: ${score}/100</div>
                        </div>
                    </div>
                    <div class="sli-field-value">${this.escapeHtml(xpath)}</div>
                </div>
            `;
        }
        
        // Other locators
        const locatorTypes = [
            { key: 'id', label: 'ID Selector', prefix: '#' },
            { key: 'className', label: 'Class Selector', prefix: '' },
            { key: 'cssSelector', label: 'CSS Selector', prefix: '' },
            { key: 'tagName', label: 'Tag Name', prefix: '' }
        ];
        
        locatorTypes.forEach(type => {
            const value = locators[type.key];
            if (value) {
                html += `
                    <div class="sli-field" onclick="window.smartLocatorInspector.copyToClipboard('${this.escapeHtml(value)}')">
                        <div class="sli-field-label">${type.label}</div>
                        <div class="sli-field-value">${this.escapeHtml(type.prefix + value)}</div>
                    </div>
                `;
            }
        });
        
        // Attributes
        if (Object.keys(locators.attributes).length > 0) {
            html += '<div class="sli-xpath-header">Key Attributes</div>';
            Object.entries(locators.attributes).forEach(([attr, value]) => {
                html += `
                    <div class="sli-field" onclick="window.smartLocatorInspector.copyToClipboard('[${attr}=&quot;${this.escapeHtml(value)}&quot;]')">
                        <div class="sli-field-label">${attr}</div>
                        <div class="sli-field-value">${this.escapeHtml(value)}</div>
                    </div>
                `;
            });
        }
        
        return html;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    copyToClipboard(text) {
        // Use Chrome extension messaging for clipboard
        chrome.runtime.sendMessage({
            type: 'COPY_TO_CLIPBOARD',
            text: text
        }, (response) => {
            if (response && response.success) {
                console.log('[SLI] Copied to clipboard:', text);
                this.showNotification('Copied to clipboard! ✅');
            } else {
                console.error('[SLI] Failed to copy to clipboard');
                this.showNotification('Failed to copy ❌');
            }
        });
    }
    
    showNotification(message) {
        // Position notification relative to modal
        const modalRect = this.modal ? this.modal.getBoundingClientRect() : null;
        let notificationStyle;
        
        if (modalRect) {
            // Position notification above the modal
            notificationStyle = `
                position: fixed;
                left: ${modalRect.left}px;
                top: ${Math.max(10, modalRect.top - 60)}px;
                background: #4CAF50;
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: ${this.config.zIndex + 1};
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            `;
        } else {
            // Fallback to top-left if modal not available
            notificationStyle = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: ${this.config.zIndex + 1};
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            `;
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = notificationStyle;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    makeDraggable() {
        if (!this.modal) return;
        
        const header = this.modal.querySelector('.sli-header');
        if (!header) return;
        
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.modal.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            // Add visual feedback during drag
            this.modal.style.transition = 'none';
            this.modal.style.cursor = 'grabbing';
            header.style.cursor = 'grabbing';
            
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault();
        });
        
        const handleDrag = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Keep modal within viewport bounds
            const modalRect = this.modal.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            newLeft = Math.max(10, Math.min(newLeft, viewportWidth - modalRect.width - 10));
            newTop = Math.max(10, Math.min(newTop, viewportHeight - modalRect.height - 10));
            
            this.modal.style.left = newLeft + 'px';
            this.modal.style.top = newTop + 'px';
            this.modal.style.right = 'auto';
            this.modal.style.transform = 'none';
        };
        
        const stopDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Restore visual state
            this.modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            this.modal.style.cursor = 'default';
            header.style.cursor = 'move';
            
            // Optional: Snap to edges if close
            const rect = this.modal.getBoundingClientRect();
            const snapThreshold = 50;
            
            if (rect.left < snapThreshold) {
                this.modal.style.left = '10px';
            } else if (window.innerWidth - rect.right < snapThreshold) {
                this.modal.style.left = (window.innerWidth - rect.width - 10) + 'px';
            }
            
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        
        // Add double-click to reset position
        header.addEventListener('dblclick', () => {
            this.modal.style.left = '20px';
            this.modal.style.top = '50%';
            this.modal.style.transform = 'translateY(-50%)';
            this.modal.style.right = 'auto';
        });
    }
    
    cleanup() {
        const modal = document.getElementById(this.config.modalId);
        const highlight = document.getElementById(this.config.highlightId);
        const style = document.getElementById('sli-styles');
        
        if (modal) modal.remove();
        if (highlight) highlight.remove();
        if (style) style.remove();
    }
    
    injectCSS() {
        // Remove existing styles
        const existing = document.getElementById('sli-styles');
        if (existing) existing.remove();
        
        const style = document.createElement('style');
        style.id = 'sli-styles';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }
    
    getCSS() {
        return `
            .sli-modal {
                position: fixed !important;
                left: 20px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 440px !important;
                max-height: 80vh !important;
                background: rgba(28, 28, 30, 0.95) !important;
                border: 2px solid #007acc !important;
                border-radius: 12px !important;
                color: white !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                font-size: 13px !important;
                z-index: ${this.config.zIndex} !important;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(20px) !important;
                overflow: hidden !important;
                pointer-events: auto !important;
                user-select: none !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
                position: relative !important;
                transition: all 0.2s ease !important;
            }
            
            .sli-header:hover {
                background: linear-gradient(135deg, #0089e6 0%, #006bb8 100%) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3) !important;
            }
            
            .sli-header:active {
                transform: translateY(0) !important;
                box-shadow: 0 2px 8px rgba(0, 122, 204, 0.2) !important;
            }
            
            .sli-header::before {
                content: "⋮⋮" !important;
                position: absolute !important;
                left: 8px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                color: rgba(255, 255, 255, 0.6) !important;
                font-size: 14px !important;
                line-height: 0.8 !important;
                letter-spacing: -1px !important;
                pointer-events: none !important;
            }
            
            .sli-title {
                color: white !important;
                font-size: 15px !important;
                font-weight: 600 !important;
                margin-left: 20px !important;
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
                transform: scale(1.1) !important;
            }
            
            .sli-content {
                padding: 16px !important;
                max-height: calc(85vh - 60px) !important;
                overflow-y: auto !important;
            }
            
            .sli-field {
                margin-bottom: 10px !important;
                padding: 10px 12px !important;
                background: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            .sli-field:hover {
                background: rgba(0, 122, 204, 0.2) !important;
                border-color: #007acc !important;
                transform: translateY(-1px) !important;
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
            }
            
            .sli-field-value {
                color: #f8f8f2 !important;
                word-break: break-all !important;
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
                font-size: 11px !important;
                background: rgba(0, 0, 0, 0.2) !important;
                padding: 6px 8px !important;
                border-radius: 4px !important;
            }
            
            .sli-unique {
                border-left: 4px solid #98c379 !important;
            }
            
            .sli-non-unique {
                border-left: 4px solid #e5c07b !important;
            }
            
            .sli-highlight {
                position: fixed !important;
                pointer-events: none !important;
                z-index: ${this.config.zIndex - 1} !important;
                border: 4px solid #FF0000 !important;
                background: rgba(255, 0, 0, 0.2) !important;
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.8) !important;
                display: none !important;
                border-radius: 4px !important;
            }
            
            .sli-highlight.frozen {
                border-color: #00FF00 !important;
                background: rgba(0, 255, 0, 0.2) !important;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.8) !important;
            }
            
            .sli-message {
                color: #61dafb !important;
                font-weight: 600 !important;
                text-align: center !important;
                padding: 16px !important;
                font-size: 14px !important;
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
            
            @keyframes slideIn {
                from { 
                    transform: translateY(-20px); 
                    opacity: 0; 
                    scale: 0.9;
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                    scale: 1;
                }
            }
            
            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
                50% { box-shadow: 0 0 30px rgba(255, 0, 0, 1); }
            }
            
            .sli-highlight {
                animation: pulseGlow 2s infinite;
            }
        `;
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_INSPECTOR') {
        if (!window.smartLocatorInspector) {
            window.smartLocatorInspector = new SmartLocatorInspector();
        }
        console.log('Toggling inspector...');
        window.smartLocatorInspector.toggle();
        console.log('Inspector active status:', window.smartLocatorInspector.isActive);
        sendResponse({ active: window.smartLocatorInspector.isActive });
    } else if (message.type === 'CHECK_STATUS') {
        console.log('Checking status...');
        const active = window.smartLocatorInspector ? window.smartLocatorInspector.isActive : false;
        console.log('Current status:', active);
        sendResponse({ active });
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, Smart Locator Inspector ready');
        initializeInspector();
    });
} else {
    console.log('DOM already ready, Smart Locator Inspector ready');
    initializeInspector();
}

// Initialize the SmartLocatorInspector instance
function initializeInspector() {
    if (!window.smartLocatorInspector) {
        console.log('Creating new SmartLocatorInspector instance');
        window.smartLocatorInspector = new SmartLocatorInspector();
    } else {
        console.log('SmartLocatorInspector already exists');
    }
}