// UI Components Module
// Handles modal creation, highlighting, and UI interactions

import { SLIConfig } from './config.js';
import { SLIStyles } from './styles.js';
import { SLIUtils } from './utils.js';
import { SLIDOMHierarchy } from './hierarchy.js';

export class SLIUIComponents {
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