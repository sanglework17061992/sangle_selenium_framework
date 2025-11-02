// Smart Locator Inspector - LEGACY BACKUP VERSION (DEPRECATED)
// ================================================================
// ⚠️  WARNING: This file is DEPRECATED and kept only for reference.
// ⚠️  Use injector-modular.js instead - it contains all latest improvements.
// ================================================================
// This script runs in the browser context to provide real-time element inspection

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.SmartLocatorInspector) {
        console.log('[SLI] Already injected, refreshing...');
        window.SmartLocatorInspector.cleanup();
    }

    // Global state
    let isActive = true;
    let isFrozen = false;
    let currentElement = null;
    let modal = null;
    let highlightBox = null;
    let lastHoveredElement = null;

    // Configuration
    const config = {
        modalId: 'sli-modal',
        highlightId: 'sli-highlight',
        zIndex: 2147483647, // Maximum z-index
        excludeElements: ['sli-modal', 'sli-highlight'],
        ignoreTags: ['HTML', 'BODY']
    };

    // Initialize the inspector
    function init() {
        console.log('[SLI] Smart Locator Inspector initialized');
        
        // Clean up any existing instances
        cleanup();
        
        // Create UI elements
        createModal();
        createHighlightBox();
        
        // Attach event listeners
        attachEventListeners();
        
        // Show initial message
        updateModal({
            message: 'Hover over elements to inspect them!',
            instructions: [
                'CTRL - Freeze current element',
                'ESC - Toggle inspector on/off', 
                'Click any locator to copy it'
            ]
        });

        // Setup navigation persistence
        setupNavigationPersistence();
    }

    // Create the floating modal with robust CSS
    function createModal() {
        modal = document.createElement('div');
        modal.id = config.modalId;
        modal.className = 'sli-modal';
        
        modal.innerHTML = '<div class="sli-header"><span class="sli-title">🎯 Smart Locator Inspector</span><button class="sli-close" onclick="window.SLI.toggle()" title="Hide (ESC)">×</button></div><div class="sli-content"><div class="sli-loading">Hover over an element...</div></div>';

        // Inject comprehensive styles
        injectStyles();
        
        // Add to page
        document.documentElement.appendChild(modal);
        
        // Make draggable
        makeDraggable(modal);
    }

    // Inject comprehensive CSS styles
    function injectStyles() {
        let styleSheet = document.getElementById('sli-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
        
        styleSheet = document.createElement('style');
        styleSheet.id = 'sli-styles';
        styleSheet.textContent = getCSS();

        document.head.appendChild(styleSheet);
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get comprehensive CSS styles
    function getCSS() {
        return '.sli-modal { position: fixed !important; top: 20px !important; right: 20px !important; width: 440px !important; max-height: 85vh !important; background: rgba(28, 28, 30, 0.95) !important; border: 2px solid #007acc !important; border-radius: 12px !important; color: white !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; font-size: 13px !important; z-index: ' + config.zIndex + ' !important; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(20px) !important; overflow: hidden !important; pointer-events: auto !important; user-select: none !important; transform: translateZ(0) !important; } .sli-header { background: linear-gradient(135deg, #007acc 0%, #005a9e 100%) !important; padding: 12px 16px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; font-weight: 600 !important; cursor: move !important; border-radius: 10px 10px 0 0 !important; } .sli-title { color: white !important; font-size: 15px !important; font-weight: 600 !important; } .sli-close { background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; color: white !important; font-size: 16px !important; cursor: pointer !important; padding: 4px 8px !important; width: 28px !important; height: 28px !important; border-radius: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s ease !important; } .sli-close:hover { background: rgba(255, 255, 255, 0.2) !important; border-color: rgba(255, 255, 255, 0.4) !important; transform: scale(1.1) !important; } .sli-content { padding: 16px !important; max-height: calc(85vh - 60px) !important; overflow-y: auto !important; } .sli-content::-webkit-scrollbar { width: 6px !important; } .sli-content::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1) !important; border-radius: 3px !important; } .sli-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3) !important; border-radius: 3px !important; } .sli-field { margin-bottom: 10px !important; padding: 10px 12px !important; background: rgba(255, 255, 255, 0.08) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 8px !important; cursor: pointer !important; transition: all 0.2s ease !important; position: relative !important; } .sli-field:hover { background: rgba(0, 122, 204, 0.2) !important; border-color: #007acc !important; transform: translateY(-1px) !important; } .sli-smart-xpath { border-left: 4px solid #61dafb !important; } .sli-smart-xpath:hover { border-left-color: #007acc !important; } .sli-table-xpath { border-left: 4px solid #ff9500 !important; background: rgba(255, 149, 0, 0.05) !important; } .sli-table-xpath:hover { border-left-color: #ff7700 !important; background: rgba(255, 149, 0, 0.15) !important; } .sli-unique { border-left-color: #98c379 !important; } .sli-unique:hover { border-left-color: #27ae60 !important; } .sli-non-unique { border-left-color: #e5c07b !important; } .sli-non-unique:hover { border-left-color: #f39c12 !important; } .sli-field-header { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 6px !important; } .sli-field-label { color: #61dafb !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; flex: 1 !important; } .sli-score-container { display: flex !important; flex-direction: column !important; align-items: flex-end !important; min-width: 90px !important; } .sli-uniqueness { font-weight: 600 !important; font-size: 10px !important; margin-bottom: 2px !important; text-transform: uppercase !important; } .sli-score { font-weight: 700 !important; font-size: 11px !important; margin-bottom: 2px !important; } .sli-score-bar { font-family: monospace !important; font-size: 8px !important; line-height: 1 !important; opacity: 0.7 !important; } .sli-field-description { color: #98c379 !important; font-size: 11px !important; font-style: italic !important; margin-bottom: 6px !important; opacity: 0.9 !important; } .sli-field-value { color: #f8f8f2 !important; word-break: break-all !important; font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; font-size: 11px !important; line-height: 1.4 !important; background: rgba(0, 0, 0, 0.2) !important; padding: 6px 8px !important; border-radius: 4px !important; } .sli-xpath-header { color: #e5c07b !important; font-weight: 700 !important; font-size: 13px !important; margin: 16px 0 8px 0 !important; padding: 8px 12px !important; background: rgba(229, 192, 123, 0.1) !important; border-radius: 6px !important; border-left: 4px solid #e5c07b !important; } .sli-instruction { color: #98c379 !important; font-size: 11px !important; margin-bottom: 6px !important; padding: 4px 8px !important; background: rgba(152, 195, 121, 0.1) !important; border-radius: 4px !important; border-left: 3px solid #98c379 !important; } .sli-message { color: #61dafb !important; font-weight: 600 !important; text-align: center !important; padding: 16px !important; font-size: 14px !important; } .sli-loading { color: #98c379 !important; text-align: center !important; padding: 24px !important; font-style: italic !important; font-size: 14px !important; } .sli-frozen { border-color: #e06c75 !important; box-shadow: 0 0 20px rgba(224, 108, 117, 0.4) !important; } .sli-frozen .sli-header { background: linear-gradient(135deg, #e06c75 0%, #c94a4a 100%) !important; } .sli-highlight { position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; pointer-events: none !important; z-index: 999999999 !important; border: 4px solid #FF0000 !important; background: rgba(255, 0, 0, 0.2) !important; box-shadow: 0 0 20px rgba(255, 0, 0, 0.8) !important; display: none !important; opacity: 0.8 !important; border-radius: 0 !important; } .sli-highlight.frozen { border-color: #00FF00 !important; background: rgba(0, 255, 0, 0.2) !important; box-shadow: 0 0 20px rgba(0, 255, 0, 0.8) !important; } .sli-hierarchy-container { margin-top: 16px !important; padding: 12px !important; background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; border-left: 4px solid #c678dd !important; } .sli-hierarchy-header { color: #c678dd !important; font-weight: 700 !important; font-size: 13px !important; margin-bottom: 12px !important; padding: 8px 12px !important; background: rgba(198, 120, 221, 0.1) !important; border-radius: 6px !important; display: flex !important; align-items: center !important; } .sli-hierarchy-tree { font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; font-size: 11px !important; line-height: 1.6 !important; } .sli-hierarchy-item { padding: 2px 8px !important; margin-bottom: 1px !important; background: rgba(0, 0, 0, 0.1) !important; border-radius: 3px !important; cursor: pointer !important; transition: all 0.2s ease !important; position: relative !important; white-space: pre !important; overflow-x: auto !important; } .sli-hierarchy-item:hover { background: rgba(0, 122, 204, 0.2) !important; transform: translateX(2px) !important; } .sli-hierarchy-item.current { background: rgba(152, 195, 121, 0.2) !important; border: 1px solid #98c379 !important; font-weight: 600 !important; color: #98c379 !important; } .sli-tree-line { color: #f8f8f2 !important; } .sli-hierarchy-item.current .sli-tree-line { color: #98c379 !important; } .sli-hierarchy-highlight { border: 2px solid #c678dd !important; background: rgba(198, 120, 221, 0.3) !important; box-shadow: 0 0 12px rgba(198, 120, 221, 0.6) !important; }';
    }

    // Create the highlight box
    function createHighlightBox() {
        // Remove any existing highlight box first
        const existing = document.getElementById(config.highlightId);
        if (existing) {
            existing.remove();
        }
        
        highlightBox = document.createElement('div');
        highlightBox.id = config.highlightId;
        highlightBox.className = 'sli-highlight';
        
        // Set initial styles directly
        highlightBox.style.position = 'fixed';
        highlightBox.style.top = '0px';
        highlightBox.style.left = '0px';
        highlightBox.style.width = '0px';
        highlightBox.style.height = '0px';
        highlightBox.style.pointerEvents = 'none';
        highlightBox.style.zIndex = '999999999';
        highlightBox.style.border = '4px solid #FF0000';
        highlightBox.style.background = 'rgba(255, 0, 0, 0.2)';
        highlightBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
        highlightBox.style.display = 'none';
        highlightBox.style.opacity = '0.8';
        
        document.body.appendChild(highlightBox);
        console.log('[SLI] Highlight box created and appended to body:', highlightBox);
    }

    // Make modal draggable
    function makeDraggable(element) {
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

    // Setup navigation persistence
    function setupNavigationPersistence() {
        // Monitor for page changes and re-inject
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if our modal was removed
                    if (!document.getElementById(config.modalId)) {
                        console.log('[SLI] Modal removed, re-injecting...');
                        setTimeout(init, 100);
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
                    if (!document.getElementById(config.modalId)) {
                        init();
                    }
                }, 500);
            }
        };

        // Check for URL changes periodically
        setInterval(checkForUrlChange, 1000);

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                if (!document.getElementById(config.modalId)) {
                    init();
                }
            }, 500);
        });
    }

    // Attach event listeners
    function attachEventListeners() {
        // Mouse move for hover detection
        document.addEventListener('mousemove', handleMouseMove, true);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyDown, true);
        
        // Prevent accidental interactions with our UI
        if (modal) {
            modal.addEventListener('click', handleModalClick, true);
            modal.addEventListener('mousemove', (e) => e.stopPropagation(), true);
        }
    }

    // Handle mouse movement
    function handleMouseMove(event) {
        if (!isActive || isFrozen) {
            return;
        }

        const element = event.target;
        
        // Skip our own elements
        if (isExcludedElement(element)) {
            return;
        }
        
        // Skip certain elements
        if (config.ignoreTags.includes(element.tagName)) {
            return;
        }

        if (element !== lastHoveredElement) {
            console.log('[SLI] Hovering over:', element.tagName, element.className, element.id);
            lastHoveredElement = element;
            currentElement = element;
            highlightElement(element);
            updateModalWithElement(element);
        }
    }

    // Handle keyboard shortcuts
    function handleKeyDown(event) {
        switch(event.key) {
            case 'Control':
                event.preventDefault();
                toggleFreeze();
                break;
            case 'Escape':
                event.preventDefault();
                toggle();
                break;
        }
    }

    // Handle modal clicks
    function handleModalClick(event) {
        event.stopPropagation();
        
        const field = event.target.closest('.sli-field');
        if (field) {
            const value = field.querySelector('.sli-field-value').textContent;
            copyToClipboard(value);
        }
    }

    // Check if element should be excluded
    function isExcludedElement(element) {
        if (!element) return true;
        
        // Check element itself
        if (config.excludeElements.some(cls => element.id === cls || element.classList.contains(cls))) {
            return true;
        }
        
        // Check parents
        let parent = element.parentElement;
        while (parent) {
            if (config.excludeElements.some(cls => parent.id === cls || parent.classList.contains(cls))) {
                return true;
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    // Highlight an element
    function highlightElement(element) {
        if (!element || !highlightBox) {
            console.log('[SLI] Cannot highlight - missing element or highlightBox');
            return;
        }

        const rect = element.getBoundingClientRect();
        
        // Ensure we have valid dimensions
        if (rect.width === 0 || rect.height === 0) {
            highlightBox.style.display = 'none';
            return;
        }

        console.log('[SLI] Highlighting element at:', rect.left, rect.top, rect.width, rect.height);

        // Position the highlight box directly over the element
        highlightBox.style.display = 'block';
        highlightBox.style.position = 'fixed';
        highlightBox.style.left = rect.left + 'px';
        highlightBox.style.top = rect.top + 'px';
        highlightBox.style.width = rect.width + 'px';
        highlightBox.style.height = rect.height + 'px';
        highlightBox.style.zIndex = '999999999';
        highlightBox.style.pointerEvents = 'none';
        highlightBox.style.border = '4px solid #FF0000';
        highlightBox.style.background = 'rgba(255, 0, 0, 0.2)';
        highlightBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
        highlightBox.style.opacity = '0.8';
        
        // Update frozen state styling
        if (isFrozen) {
            highlightBox.classList.add('frozen');
            highlightBox.style.border = '4px solid #00FF00';
            highlightBox.style.background = 'rgba(0, 255, 0, 0.2)';
            highlightBox.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
            modal.classList.add('sli-frozen');
        } else {
            highlightBox.classList.remove('frozen');
            highlightBox.style.border = '4px solid #FF0000';
            highlightBox.style.background = 'rgba(255, 0, 0, 0.2)';
            highlightBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
            modal.classList.remove('sli-frozen');
        }
    }

    // Update modal with element information
    function updateModalWithElement(element) {
        if (!element) return;

        const locators = generateLocators(element);
        updateModal(locators);
    }

    // Generate locators for an element
    function generateLocators(element) {
        const smartXPaths = generateSmartXPaths(element);
        const hierarchy = generateDOMHierarchy(element);
        
        const locators = {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            name: element.name || '',
            className: element.className || '',
            text: getElementText(element),
            css: generateCSSSelector(element),
            xpath: smartXPaths.length > 0 ? smartXPaths[0].xpath : getHierarchicalXPath(element),
            smartXPaths: smartXPaths, // All smart XPath suggestions with scores
            hierarchy: hierarchy, // DOM structure hierarchy
            attributes: getRelevantAttributes(element)
        };

        return locators;
    }

    // Generate DOM hierarchy structure in tree format
    function generateDOMHierarchy(element) {
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
        buildTreeNodes(root, element, '', true, treeNodes);
        
        return { treeNodes };
    }
    
    // Recursively build tree nodes
    function buildTreeNodes(node, targetElement, prefix, isLast, treeNodes) {
        const isTarget = node === targetElement;
        const nodeInfo = getElementInfo(node);
        
        // Create tree line with proper prefix
        const connector = prefix === '' ? '' : (isLast ? '└── ' : '├── ');
        const display = formatTreeNode(nodeInfo, isTarget);
        
        treeNodes.push({
            ...nodeInfo,
            display: connector + display,
            prefix: prefix,
            isTarget: isTarget,
            level: (prefix.match(/[│ ]/g) || []).length / 4
        });
        
        // Only show children if this is the target element or an ancestor of it
        const children = Array.from(node.children);
        if (isTarget || isAncestorOf(node, targetElement)) {
            // For target element, show all siblings and children
            if (isTarget) {
                // Show children
                children.slice(0, 5).forEach((child, index) => {
                    const childIsLast = index === Math.min(4, children.length - 1);
                    const childPrefix = prefix + (isLast ? '    ' : '│   ');
                    buildTreeNodes(child, targetElement, childPrefix, childIsLast, treeNodes);
                });
            } else {
                // For ancestors, only show the path to target
                const pathChild = children.find(child => 
                    child === targetElement || isAncestorOf(child, targetElement)
                );
                if (pathChild) {
                    const childPrefix = prefix + (isLast ? '    ' : '│   ');
                    buildTreeNodes(pathChild, targetElement, childPrefix, true, treeNodes);
                }
            }
        }
    }
    
    // Check if element is ancestor of target
    function isAncestorOf(element, target) {
        let child = target.parentElement;
        while (child) {
            if (child === element) return true;
            child = child.parentElement;
        }
        return false;
    }
    
    // Format tree node display
    function formatTreeNode(nodeInfo, isTarget) {
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
    function getElementInfo(element) {
        const text = getElementText(element);
        const info = {
            tagName: element.tagName.toLowerCase(),
            id: element.id || '',
            className: element.className || '',
            text: text.length > 30 ? text.substring(0, 27) + '...' : text,
            attributes: {},
            locator: generateQuickLocator(element),
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
    function generateQuickLocator(element) {
        if (element.id && !isDynamicValue(element.id)) {
            return '#' + element.id;
        }
        
        const testId = element.getAttribute('data-testid');
        if (testId) {
            return '[data-testid="' + testId + '"]';
        }

        const stableClasses = getStableClasses(element);
        if (stableClasses.length > 0) {
            return '.' + stableClasses[0];
        }

        return element.tagName.toLowerCase();
    }

    // Create hierarchy section HTML in tree format
    function createHierarchySection(hierarchy) {
        let html = '<div class="sli-hierarchy-container">';
        html += '<div class="sli-hierarchy-header">🌳 DOM Tree Structure</div>';
        html += '<div class="sli-hierarchy-tree">';
        
        hierarchy.treeNodes.forEach((node, index) => {
            const itemClass = node.isTarget ? 'sli-hierarchy-item current' : 'sli-hierarchy-item';
            const elementId = 'hierarchy-' + Math.random().toString(36).substr(2, 9);
            
            html += `<div class="${itemClass}" `;
            html += `data-element-id="${elementId}" `;
            html += `onmouseover="highlightHierarchyElement(this)" `;
            html += `onmouseout="unhighlightHierarchyElement(this)">`;
            html += `<span class="sli-tree-line">${escapeHtml(node.display)}</span>`;
            html += '</div>';
            
            // Store element reference for highlighting
            window.hierarchyElements = window.hierarchyElements || {};
            window.hierarchyElements[elementId] = node.elementRef;
        });
        
        html += '</div>';
        html += '</div>';
        return html;
    }

    // Create individual hierarchy item
    function createHierarchyItem(item, type) {
        const elementId = 'hierarchy-' + Math.random().toString(36).substr(2, 9);
        const typeClass = 'sli-hierarchy-' + type;
        
        let html = '<div class="sli-hierarchy-item ' + typeClass + '" ';
        html += 'data-element-id="' + elementId + '" ';
        html += 'onmouseover="window.SLI.highlightHierarchyElement(this)" ';
        html += 'onmouseout="window.SLI.unhighlightHierarchyElement()" ';
        html += 'onclick="window.SLI.copyToClipboard(\'' + item.locator.replace(/'/g, "\\'") + '\')">';
        
        // Tag and basic info
        html += '<div class="sli-hierarchy-header">';
        html += '<span class="sli-hierarchy-tag">' + item.tagName.toUpperCase() + '</span>';
        
        if (item.relationship) {
            html += '<span class="sli-hierarchy-relationship">' + item.relationship + '</span>';
        }
        html += '</div>';

        // ID and classes
        if (item.id || item.className) {
            html += '<div class="sli-hierarchy-details">';
            if (item.id) {
                html += '<span class="sli-hierarchy-id">#' + item.id + '</span>';
            }
            if (item.className) {
                const classes = item.className.split(' ').slice(0, 2);
                html += '<span class="sli-hierarchy-class">.' + classes.join('.') + '</span>';
            }
            html += '</div>';
        }

        // Text content
        if (item.text) {
            html += '<div class="sli-hierarchy-text">"' + item.text + '"</div>';
        }

        // Key attributes
        if (Object.keys(item.attributes).length > 0) {
            html += '<div class="sli-hierarchy-attrs">';
            Object.keys(item.attributes).forEach(attr => {
                html += '<span class="sli-hierarchy-attr">' + attr + '="' + item.attributes[attr] + '"</span>';
            });
            html += '</div>';
        }

        // Quick locator
        html += '<div class="sli-hierarchy-locator">' + item.locator + '</div>';

        html += '</div>';

        // Store element reference for highlighting
        setTimeout(() => {
            const hierarchyItem = document.querySelector('[data-element-id="' + elementId + '"]');
            if (hierarchyItem && item.elementRef) {
                hierarchyItem._elementRef = item.elementRef;
            }
        }, 0);

        return html;
    }

    // Get element text content
    function getElementText(element) {
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

    // Generate CSS selector
    function generateCSSSelector(element) {
        // Prefer ID if available and not dynamic
        if (element.id && !isDynamicValue(element.id)) {
            return '#' + element.id;
        }

        // Try name attribute
        if (element.name && !isDynamicValue(element.name)) {
            return element.tagName.toLowerCase() + '[name="' + element.name + '"]';
        }

        // Try stable classes
        const stableClasses = getStableClasses(element);
        if (stableClasses.length > 0) {
            return element.tagName.toLowerCase() + '.' + stableClasses.join('.');
        }

        // Try data attributes
        const dataAttrs = getDataAttributes(element);
        if (dataAttrs.length > 0) {
            const attr = dataAttrs[0];
            return element.tagName.toLowerCase() + '[' + attr.name + '="' + attr.value + '"]';
        }

        // Fallback to nth-child
        return getNthChildSelector(element);
    }

    // Generate multiple smart XPath strategies with scoring
    function generateSmartXPaths(element) {
        const xpaths = [];
        
        // Strategy 1: Framework-aware selectors (Angular, React, Vue)
        const frameworkXPaths = generateFrameworkXPaths(element);
        xpaths.push(...frameworkXPaths);
        
        // Strategy 2: Semantic/accessible attributes
        const semanticXPaths = generateSemanticXPaths(element);
        xpaths.push(...semanticXPaths);
        
        // Strategy 3: Text-based locators
        const textXPaths = generateTextBasedXPaths(element);
        xpaths.push(...textXPaths);
        
        // Strategy 4: Structural patterns
        const structuralXPaths = generateStructuralXPaths(element);
        xpaths.push(...structuralXPaths);
        
        // Strategy 5: Dynamic templates
        const dynamicXPaths = generateDynamicXPaths(element);
        xpaths.push(...dynamicXPaths);
        
        // Strategy 6: Table-specific locators (NEW!)
        const tableXPaths = generateTableSpecificXPaths(element);
        xpaths.push(...tableXPaths);
        
        // Validate uniqueness and enhance XPaths
        const enhancedXPaths = [];
        
        xpaths.forEach(xpathObj => {
            // Ensure xpath is valid before validation
            if (!xpathObj.xpath || typeof xpathObj.xpath !== 'string') {
                return;
            }
            
            const isUnique = isXPathUnique(xpathObj.xpath);
            const matchCount = getXPathMatchCount(xpathObj.xpath);
            
            // Add uniqueness information
            xpathObj.isUnique = isUnique;
            xpathObj.matchCount = matchCount;
            xpathObj.uniqueness = isUnique ? 'Unique' : matchCount + ' matches';
            
            // Adjust score based on uniqueness
            if (isUnique) {
                xpathObj.score += 5; // Bonus for uniqueness
                xpathObj.description += ' (Unique ✓)';
            } else if (matchCount > 0) {
                xpathObj.description += ' (' + matchCount + ' matches)';
                
                // Try to make it unique
                const uniqueXPath = makeXPathUnique(element, xpathObj.xpath);
                if (uniqueXPath !== xpathObj.xpath && isXPathUnique(uniqueXPath)) {
                    enhancedXPaths.push({
                        xpath: uniqueXPath,
                        score: xpathObj.score + 10,
                        type: xpathObj.type + ' (Enhanced)',
                        description: 'Made unique by adding parent context',
                        isUnique: true,
                        matchCount: 1,
                        uniqueness: 'Unique'
                    });
                }
                
                // Add collection options for non-unique XPaths
                if (matchCount > 1) {
                    const collectionXPaths = generateCollectionXPath(element, xpathObj.xpath);
                    if (collectionXPaths) {
                        collectionXPaths.forEach((colXPath, index) => {
                            enhancedXPaths.push({
                                xpath: colXPath.xpath,
                                score: xpathObj.score - 5 - index, // Lower score for collection patterns
                                type: 'Collection Pattern',
                                description: colXPath.description,
                                isUnique: colXPath.count === 1,
                                matchCount: colXPath.count,
                                uniqueness: colXPath.count === 1 ? 'Unique' : colXPath.count + ' matches'
                            });
                        });
                    }
                }
            }
            
            enhancedXPaths.push(xpathObj);
        });
        
        // Sort by score (higher is better) and return top suggestions
        return enhancedXPaths.sort((a, b) => b.score - a.score).slice(0, 8);
    }

    // Generate framework-aware XPath locators
    function generateFrameworkXPaths(element) {
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
        const vueAttrs = ['v-model', 'v-if', 'v-for', 'v-show', 'v-on', 'v-bind'];
        vueAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                const value = element.getAttribute(attr);
                xpaths.push({
                    xpath: '//*[@' + attr + (value ? '="' + value + '"' : '') + ']',
                    score: 95,
                    type: 'Vue.js Framework',
                    description: 'Vue directive attribute'
                });
            }
        });
        
        // Check for framework class patterns
        if (element.className) {
            const classes = element.className.split(' ');
            
            // Angular Material
            const ngMatClass = classes.find(cls => cls.startsWith('mat-'));
            if (ngMatClass) {
                xpaths.push({
                    xpath: '//*[contains(@class, "' + ngMatClass + '")]',
                    score: 90,
                    type: 'Angular Material',
                    description: 'Material Design component'
                });
            }
            
            // Bootstrap/CSS frameworks
            const bsClass = classes.find(cls => cls.startsWith('btn-') || cls.startsWith('form-') || cls.startsWith('card-'));
            if (bsClass) {
                xpaths.push({
                    xpath: '//*[contains(@class, "' + bsClass + '")]',
                    score: 85,
                    type: 'CSS Framework',
                    description: 'Framework component class'
                });
            }
        }
        
        return xpaths;
    }

    // Generate semantic/accessible XPath locators
    function generateSemanticXPaths(element) {
        const xpaths = [];
        
        // ID (if stable)
        if (element.id && !isDynamicValue(element.id)) {
            xpaths.push({
                xpath: '//*[@id="' + element.id + '"]',
                score: 100,
                type: 'ID Selector',
                description: 'Unique ID attribute'
            });
        }
        
        // Name attribute
        if (element.name && !isDynamicValue(element.name)) {
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
            if (value && !isDynamicValue(value)) {
                xpaths.push({
                    xpath: '//*[@' + attr + '="' + value + '"]',
                    score: 92,
                    type: 'Accessibility',
                    description: 'ARIA/accessibility attribute'
                });
            }
        });
        
        // Type attribute for inputs
        if (element.tagName === 'INPUT' && element.type) {
            const placeholder = element.placeholder;
            if (placeholder) {
                xpaths.push({
                    xpath: '//input[@type="' + element.type + '" and @placeholder="' + placeholder + '"]',
                    score: 88,
                    type: 'Input Pattern',
                    description: 'Input with type and placeholder'
                });
            }
        }
        
        return xpaths;
    }

    // Generate text-based XPath locators
    function generateTextBasedXPaths(element) {
        const xpaths = [];
        const text = getElementText(element);
        
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
            const normalizedText = text.replace(/\d+/g, '%s').replace(/[A-Z0-9]{8,}/g, '%s');
            if (normalizedText !== text && normalizedText.includes('%s')) {
                xpaths.push({
                    xpath: '//' + tag + '[contains(text(), "' + normalizedText.split('%s')[0] + '")]',
                    score: 75,
                    type: 'Dynamic Text',
                    description: 'Template for dynamic content'
                });
            }
        }
        
        return xpaths;
    }

    // Generate structural XPath patterns
    function generateStructuralXPaths(element) {
        const xpaths = [];
        
        // Position-based with semantic context
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
            const index = siblings.indexOf(element) + 1;
            
            // If parent has meaningful attributes
            if (parent.id && !isDynamicValue(parent.id)) {
                xpaths.push({
                    xpath: '//*[@id="' + parent.id + '"]/' + element.tagName.toLowerCase() + '[' + index + ']',
                    score: 70,
                    type: 'Structural',
                    description: 'Position within identified parent'
                });
            }
            
            if (parent.className) {
                const stableClass = getStableClasses(parent)[0];
                if (stableClass) {
                    xpaths.push({
                        xpath: '//*[contains(@class, "' + stableClass + '")]/' + element.tagName.toLowerCase() + '[' + index + ']',
                        score: 65,
                        type: 'Class-based Structure',
                        description: 'Position within classed parent'
                    });
                }
            }
        }
        
        // Form field patterns
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
            const label = findAssociatedLabel(element);
            if (label) {
                xpaths.push({
                    xpath: '//label[text()="' + getElementText(label) + '"]/following-sibling::' + element.tagName.toLowerCase(),
                    score: 88,
                    type: 'Form Label',
                    description: 'Field associated with label'
                });
            }
        }
        
        return xpaths;
    }

    // Generate dynamic template XPaths
    function generateDynamicXPaths(element) {
        const xpaths = [];
        
        // Attribute pattern templates
        ['id', 'class', 'data-testid'].forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && isDynamicValue(value)) {
                // Create template with %s placeholder
                const template = value.replace(/\d{3,}/g, '%s').replace(/[a-f0-9]{8,}/g, '%s');
                if (template !== value && template.includes('%s')) {
                    const staticPart = template.split('%s')[0];
                    if (staticPart.length > 2) {
                        xpaths.push({
                            xpath: '//*[starts-with(@' + attr + ', "' + staticPart + '")]',
                            score: 78,
                            type: 'Dynamic Template',
                            description: 'Template: ' + template
                        });
                    }
                }
            }
        });
        
        // Position-based templates for lists/tables
        if (isInRepeatingStructure(element)) {
            const position = getPositionInRepeatingStructure(element);
            if (position) {
                xpaths.push({
                    xpath: position.xpath,
                    score: 72,
                    type: 'List/Table Pattern',
                    description: 'Template for repeating elements'
                });
            }
        }
        
        return xpaths;
    }

    // Generate table-specific XPath locators
    function generateTableSpecificXPaths(element) {
        const xpaths = [];
        
        // Check if element is table-related
        const tableContext = getTableContext(element);
        if (!tableContext.isTableRelated) {
            return xpaths;
        }
        
        // Generate different types of table-specific XPaths
        if (tableContext.type === 'cell') {
            // For TD/TH elements, generate content-based and position-based XPaths
            const cellXPaths = generateCellBasedXPaths(element, tableContext);
            xpaths.push(...cellXPaths);
            
            // Generate row-based XPaths using sibling cell values
            const rowXPaths = generateRowBasedXPaths(element, tableContext);
            xpaths.push(...rowXPaths);
            
            // Generate column-based XPaths using header information
            const columnXPaths = generateColumnBasedXPaths(element, tableContext);
            xpaths.push(...columnXPaths);
        }
        
        if (tableContext.type === 'row') {
            // For TR elements, generate row-content based XPaths
            const rowContentXPaths = generateRowContentXPaths(element, tableContext);
            xpaths.push(...rowContentXPaths);
        }
        
        if (tableContext.type === 'table') {
            // For TABLE elements, generate table-wide XPaths
            const tableWideXPaths = generateTableWideXPaths(element, tableContext);
            xpaths.push(...tableWideXPaths);
        }
        
        return xpaths;
    }

    // Determine if element is table-related and gather context
    function getTableContext(element) {
        const tagName = element.tagName.toLowerCase();
        let tableContext = {
            isTableRelated: false,
            type: null,
            table: null,
            row: null,
            columnIndex: -1,
            headers: []
        };
        
        // Direct table elements
        if (tagName === 'table') {
            tableContext.isTableRelated = true;
            tableContext.type = 'table';
            tableContext.table = element;
        } else if (tagName === 'tr') {
            tableContext.isTableRelated = true;
            tableContext.type = 'row';
            tableContext.row = element;
            tableContext.table = element.closest('table');
        } else if (tagName === 'td' || tagName === 'th') {
            tableContext.isTableRelated = true;
            tableContext.type = 'cell';
            tableContext.row = element.closest('tr');
            tableContext.table = element.closest('table');
            
            // Calculate column index
            if (tableContext.row) {
                const cells = Array.from(tableContext.row.children);
                tableContext.columnIndex = cells.indexOf(element);
            }
        }
        
        // Elements inside table cells
        if (!tableContext.isTableRelated) {
            const parentCell = element.closest('td, th');
            if (parentCell) {
                tableContext.isTableRelated = true;
                tableContext.type = 'cell-content';
                tableContext.cell = parentCell;
                tableContext.row = parentCell.closest('tr');
                tableContext.table = parentCell.closest('table');
                
                // Calculate column index
                if (tableContext.row) {
                    const cells = Array.from(tableContext.row.children);
                    tableContext.columnIndex = cells.indexOf(parentCell);
                }
            }
        }
        
        // Get table headers for context
        if (tableContext.table) {
            tableContext.headers = getTableHeaders(tableContext.table);
        }
        
        return tableContext;
    }

    // Get table headers
    function getTableHeaders(table) {
        const headers = [];
        
        // Look for thead th elements
        const theadHeaders = table.querySelectorAll('thead th');
        if (theadHeaders.length > 0) {
            theadHeaders.forEach(th => {
                headers.push({
                    text: th.textContent.trim(),
                    element: th
                });
            });
        } else {
            // Look for first row th elements
            const firstRowHeaders = table.querySelectorAll('tr:first-child th');
            if (firstRowHeaders.length > 0) {
                firstRowHeaders.forEach(th => {
                    headers.push({
                        text: th.textContent.trim(),
                        element: th
                    });
                });
            } else {
                // Use first row td elements as headers
                const firstRowCells = table.querySelectorAll('tr:first-child td');
                firstRowCells.forEach(td => {
                    headers.push({
                        text: td.textContent.trim(),
                        element: td
                    });
                });
            }
        }
        
        return headers;
    }

    // Generate cell-based XPaths
    function generateCellBasedXPaths(element, tableContext) {
        const xpaths = [];
        const cellText = element.textContent.trim();
        
        // XPath by cell content
        if (cellText && cellText.length > 0 && cellText.length < 50) {
            xpaths.push({
                xpath: `//td[normalize-space(text())="${cellText}"]`,
                score: 85,
                type: 'Table Cell Content',
                description: `Find cell containing "${cellText}"`
            });
            
            // More flexible text matching
            xpaths.push({
                xpath: `//td[contains(normalize-space(text()), "${cellText}")]`,
                score: 80,
                type: 'Table Cell Partial',
                description: `Find cell containing text "${cellText}"`
            });
        }
        
        // XPath by column position
        if (tableContext.columnIndex >= 0) {
            const columnPos = tableContext.columnIndex + 1;
            xpaths.push({
                xpath: `//tr/td[${columnPos}]`,
                score: 75,
                type: 'Table Column Position',
                description: `Column ${columnPos} cells`
            });
        }
        
        return xpaths;
    }

    // Generate row-based XPaths using sibling cell values
    function generateRowBasedXPaths(element, tableContext) {
        const xpaths = [];
        
        if (!tableContext.row) return xpaths;
        
        const cells = Array.from(tableContext.row.children);
        const targetColumnIndex = tableContext.columnIndex;
        
        // Generate XPaths based on other cells in the same row
        cells.forEach((cell, index) => {
            const cellText = cell.textContent.trim();
            if (cellText && cellText.length > 0 && cellText.length < 50 && index !== targetColumnIndex) {
                // Find target cell by referencing sibling cell content
                const direction = index < targetColumnIndex ? 'following-sibling' : 'preceding-sibling';
                const siblingCount = Math.abs(targetColumnIndex - index);
                
                xpaths.push({
                    xpath: `//td[normalize-space(text())="${cellText}"]/${direction}::td[${siblingCount}]`,
                    score: 90,
                    type: 'Table Row Context',
                    description: `Based on row containing "${cellText}"`
                });
                
                // Alternative: using parent row
                xpaths.push({
                    xpath: `//tr[td[normalize-space(text())="${cellText}"]]/td[${targetColumnIndex + 1}]`,
                    score: 88,
                    type: 'Table Row Reference',
                    description: `Column ${targetColumnIndex + 1} in row with "${cellText}"`
                });
            }
        });
        
        return xpaths;
    }

    // Generate column-based XPaths using header information
    function generateColumnBasedXPaths(element, tableContext) {
        const xpaths = [];
        
        if (!tableContext.headers || tableContext.columnIndex < 0) return xpaths;
        
        const header = tableContext.headers[tableContext.columnIndex];
        if (!header || !header.text) return xpaths;
        
        const headerText = header.text;
        const columnPos = tableContext.columnIndex + 1;
        
        // XPath using header text to identify column
        xpaths.push({
            xpath: `//table//th[normalize-space(text())="${headerText}"]/ancestor::table//tr/td[${columnPos}]`,
            score: 92,
            type: 'Table Header Column',
            description: `"${headerText}" column cells`
        });
        
        // More specific: find specific row by combining header and row content
        const rowCells = Array.from(tableContext.row.children);
        rowCells.forEach((cell, index) => {
            const cellText = cell.textContent.trim();
            if (cellText && cellText.length > 0 && cellText.length < 50 && index !== tableContext.columnIndex) {
                const otherColumnHeader = tableContext.headers[index];
                if (otherColumnHeader && otherColumnHeader.text) {
                    xpaths.push({
                        xpath: `//table[.//th[normalize-space(text())="${headerText}"]]//tr[td[normalize-space(text())="${cellText}"]]/td[${columnPos}]`,
                        score: 95,
                        type: 'Table Coordinate',
                        description: `"${headerText}" column where "${otherColumnHeader.text}" = "${cellText}"`
                    });
                }
            }
        });
        
        return xpaths;
    }

    // Generate row content-based XPaths
    function generateRowContentXPaths(element, tableContext) {
        const xpaths = [];
        
        const cells = Array.from(element.children);
        
        // Generate XPath based on multiple cell contents
        const cellTexts = cells.map(cell => cell.textContent.trim()).filter(text => text && text.length < 30);
        
        if (cellTexts.length >= 2) {
            // Use first two significant cell contents
            const firstText = cellTexts[0];
            const secondText = cellTexts[1];
            
            xpaths.push({
                xpath: `//tr[td[normalize-space(text())="${firstText}"] and td[normalize-space(text())="${secondText}"]]`,
                score: 93,
                type: 'Table Row Multi-Content',
                description: `Row containing "${firstText}" and "${secondText}"`
            });
        }
        
        if (cellTexts.length >= 1) {
            const firstText = cellTexts[0];
            xpaths.push({
                xpath: `//tr[td[normalize-space(text())="${firstText}"]]`,
                score: 85,
                type: 'Table Row Content',
                description: `Row containing "${firstText}"`
            });
        }
        
        return xpaths;
    }

    // Generate table-wide XPaths
    function generateTableWideXPaths(element, tableContext) {
        const xpaths = [];
        
        // Generate XPath based on table attributes
        if (element.className) {
            xpaths.push({
                xpath: `//table[@class="${element.className}"]`,
                score: 80,
                type: 'Table Class',
                description: `Table with class "${element.className}"`
            });
        }
        
        // Generate XPath based on table headers
        if (tableContext.headers.length > 0) {
            const firstHeader = tableContext.headers[0].text;
            const lastHeader = tableContext.headers[tableContext.headers.length - 1].text;
            
            if (firstHeader && lastHeader && firstHeader !== lastHeader) {
                xpaths.push({
                    xpath: `//table[.//th[normalize-space(text())="${firstHeader}"] and .//th[normalize-space(text())="${lastHeader}"]]`,
                    score: 88,
                    type: 'Table Headers',
                    description: `Table with headers "${firstHeader}" to "${lastHeader}"`
                });
            }
        }
        
        return xpaths;
    }

    // Helper function to find associated label
    function findAssociatedLabel(element) {
        // Check for explicit label association
        if (element.id) {
            const label = document.querySelector('label[for="' + element.id + '"]');
            if (label) return label;
        }
        
        // Check for wrapping label
        let parent = element.parentElement;
        while (parent && parent.tagName !== 'FORM') {
            if (parent.tagName === 'LABEL') return parent;
            parent = parent.parentElement;
        }
        
        // Check for preceding label sibling
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === 'LABEL') return sibling;
            sibling = sibling.previousElementSibling;
        }
        
        return null;
    }

    // Helper function to detect repeating structures
    function isInRepeatingStructure(element) {
        const parent = element.parentElement;
        if (!parent) return false;
        
        const siblings = Array.from(parent.children);
        const sameTagSiblings = siblings.filter(el => el.tagName === element.tagName);
        
        return sameTagSiblings.length > 2;
    }

    // Helper function to get position in repeating structure
    function getPositionInRepeatingStructure(element) {
        const parent = element.parentElement;
        if (!parent) return null;
        
        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        const index = siblings.indexOf(element) + 1;
        
        // Check if parent has list/table indicators
        const parentClasses = parent.className.toLowerCase();
        if (parentClasses.includes('list') || parentClasses.includes('table') || parentClasses.includes('row')) {
            return {
                xpath: '//*[contains(@class, "' + parent.className.split(' ')[0] + '")]/' + element.tagName.toLowerCase() + '[' + index + ']',
                index: index
            };
        }
        
        return null;
    }

    // Check if XPath is unique in the DOM
    function isXPathUnique(xpath) {
        try {
            // Sanitize XPath to prevent evaluation errors
            if (!xpath || typeof xpath !== 'string' || xpath.trim() === '') {
                return false;
            }
            
            // Skip problematic XPath patterns
            if (xpath.includes('undefined') || xpath.includes('null') || xpath.includes('NaN')) {
                return false;
            }
            
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength === 1;
        } catch (error) {
            console.log('[SLI] XPath validation failed for:', xpath, error.message);
            return false;
        }
    }

    // Get count of elements matching XPath
    function getXPathMatchCount(xpath) {
        try {
            // Sanitize XPath to prevent evaluation errors
            if (!xpath || typeof xpath !== 'string' || xpath.trim() === '') {
                return 0;
            }
            
            // Skip problematic XPath patterns
            if (xpath.includes('undefined') || xpath.includes('null') || xpath.includes('NaN')) {
                return 0;
            }
            
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength;
        } catch (error) {
            console.log('[SLI] XPath count failed for:', xpath, error.message);
            return 0;
        }
    }

    // Make XPath unique by adding parent context
    function makeXPathUnique(element, baseXPath) {
        if (isXPathUnique(baseXPath)) {
            return baseXPath;
        }

        // Try adding parent context step by step
        let current = element.parentElement;
        let attempts = 0;
        const maxAttempts = 5;

        while (current && attempts < maxAttempts) {
            attempts++;
            
            // Create descendant XPath - remove leading //* from baseXPath to avoid double //
            const descendantPath = baseXPath.startsWith('//*') ? baseXPath.substring(3) : baseXPath;
            
            // Try ID-based parent context
            if (current.id && !isDynamicValue(current.id)) {
                const uniqueXPath = '//*[@id="' + current.id + '"]' + descendantPath;
                if (isXPathUnique(uniqueXPath)) {
                    return uniqueXPath;
                }
            }

            // Try class-based parent context
            const stableClasses = getStableClasses(current);
            if (stableClasses.length > 0) {
                const classXPath = '//*[contains(@class, "' + stableClasses[0] + '")]' + descendantPath;
                if (isXPathUnique(classXPath)) {
                    return classXPath;
                }
            }

            // Try data attribute parent context
            const dataAttrs = getDataAttributes(current);
            if (dataAttrs.length > 0) {
                const attr = dataAttrs[0];
                const dataXPath = '//*[@' + attr.name + '="' + attr.value + '"]' + descendantPath;
                if (isXPathUnique(dataXPath)) {
                    return dataXPath;
                }
            }

            // Try semantic parent tags
            if (['FORM', 'TABLE', 'SECTION', 'ARTICLE', 'NAV', 'HEADER', 'FOOTER', 'MAIN'].includes(current.tagName)) {
                const tagXPath = '//' + current.tagName.toLowerCase() + descendantPath;
                if (isXPathUnique(tagXPath)) {
                    return tagXPath;
                }
            }

            current = current.parentElement;
        }

        // If still not unique, return the base XPath
        return baseXPath;
    }

    // Generate collection-based XPath for list items
    function generateCollectionXPath(element, baseXPath) {
        const matchCount = getXPathMatchCount(baseXPath);
        if (matchCount <= 1) return null;

        // Check if element is in a repeating structure
        const parent = element.parentElement;
        if (!parent) return null;

        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        if (siblings.length <= 1) return null;

        const index = siblings.indexOf(element) + 1;
        
        // Generate collection patterns
        const collectionXPaths = [];
        
        // Pattern 1: All similar elements
        collectionXPaths.push({
            xpath: baseXPath,
            description: 'All ' + matchCount + ' matching elements (collection)',
            count: matchCount
        });
        
        // Pattern 2: First element
        const firstXPath = '(' + baseXPath + ')[1]';
        collectionXPaths.push({
            xpath: firstXPath,
            description: 'First element in collection',
            count: 1
        });
        
        // Pattern 3: Last element
        const lastXPath = '(' + baseXPath + ')[last()]';
        collectionXPaths.push({
            xpath: lastXPath,
            description: 'Last element in collection',
            count: 1
        });
        
        // Pattern 4: Current position
        const positionXPath = '(' + baseXPath + ')[' + index + ']';
        collectionXPaths.push({
            xpath: positionXPath,
            description: 'Element at position ' + index + ' in collection',
            count: 1
        });
        
        return collectionXPaths;
    }

    // Updated main XPath generation function
    function generateXPath(element) {
        const smartXPaths = generateSmartXPaths(element);
        return smartXPaths.length > 0 ? smartXPaths[0].xpath : getHierarchicalXPath(element);
    }

    // Check if a value looks dynamic
    function isDynamicValue(value) {
        return /\d{3,}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(value);
    }

    // Get stable CSS classes
    function getStableClasses(element) {
        if (!element.className) return [];
        
        return element.className.split(/\s+/)
            .filter(cls => cls && !isDynamicValue(cls))
            .slice(0, 3);
    }

    // Get data attributes
    function getDataAttributes(element) {
        const dataAttrs = [];
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-') && !isDynamicValue(attr.value)) {
                dataAttrs.push({ name: attr.name, value: attr.value });
            }
        }
        return dataAttrs;
    }

    // Get relevant attributes for display
    function getRelevantAttributes(element) {
        const relevantAttrs = ['data-testid', 'data-test', 'aria-label', 'title', 'role', 'type'];
        const attrs = {};
        
        for (let attrName of relevantAttrs) {
            const value = element.getAttribute(attrName);
            if (value) {
                attrs[attrName] = value;
            }
        }
        
        return attrs;
    }

    // Generate nth-child selector
    function getNthChildSelector(element) {
        const parent = element.parentElement;
        if (!parent) return element.tagName.toLowerCase();

        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        const index = siblings.indexOf(element) + 1;
        
        return element.tagName.toLowerCase() + ':nth-child(' + index + ')';
    }

    // Generate hierarchical XPath
    function getHierarchicalXPath(element) {
        const parts = [];
        let current = element;

        while (current && current.tagName !== 'HTML') {
            let part = current.tagName.toLowerCase();
            
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(el => el.tagName === current.tagName);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    part += '[' + index + ']';
                }
            }
            
            parts.unshift(part);
            current = current.parentElement;
        }

        return '//' + parts.join('/');
    }

    // Update modal content
    function updateModal(data) {
        if (!modal) return;

        const content = modal.querySelector('.sli-content');
        if (!content) return;

        if (data.message) {
            content.innerHTML = '<div class="sli-message">' + data.message + '</div>' + (data.instructions ? data.instructions.map(inst => '<div class="sli-instruction">💡 ' + inst + '</div>').join('') : '');
            return;
        }

        const fields = [];

        // Element info
        fields.push(createField('Tag', data.tag.toUpperCase()));
        
        if (data.id) fields.push(createField('ID', data.id));
        if (data.name) fields.push(createField('Name', data.name));
        if (data.className) fields.push(createField('Class', data.className));
        if (data.text) fields.push(createField('Text', data.text));

        // CSS Selector
        fields.push(createField('CSS Selector', data.css));

        // Smart XPath suggestions with scores
        if (data.smartXPaths && data.smartXPaths.length > 0) {
            fields.push('<div class="sli-xpath-header">🎯 Smart XPath Suggestions</div>');
            
            data.smartXPaths.forEach((xpathObj, index) => {
                const scoreColor = getScoreColor(xpathObj.score);
                const scoreBar = getScoreBar(xpathObj.score);
                
                fields.push(createSmartXPathField(
                    'XPath ' + (index + 1),
                    xpathObj.xpath,
                    xpathObj.score,
                    xpathObj.type,
                    xpathObj.description,
                    scoreColor,
                    scoreBar,
                    xpathObj.isUnique || false,
                    xpathObj.matchCount || 0
                ));
            });
        } else {
            // Fallback to basic XPath
            fields.push(createField('XPath', data.xpath));
        }

        // DOM Structure Hierarchy
        if (data.hierarchy) {
            fields.push('<div class="sli-xpath-header">🏗️ DOM Structure Hierarchy</div>');
            fields.push(createHierarchySection(data.hierarchy));
        }

        // Attributes
        if (data.attributes && Object.keys(data.attributes).length > 0) {
            fields.push('<div class="sli-xpath-header">📋 Additional Attributes</div>');
            for (let key of Object.keys(data.attributes)) {
                fields.push(createField(key, data.attributes[key]));
            }
        }

        content.innerHTML = fields.join('');
    }

    // Create a smart XPath field with scoring and uniqueness info
    function createSmartXPathField(label, xpath, score, type, description, scoreColor, scoreBar, isUnique, matchCount) {
        const escapedXPath = xpath.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const uniquenessIcon = isUnique ? '🎯' : '📋';
        const uniquenessClass = isUnique ? 'sli-unique' : 'sli-non-unique';
        const uniquenessInfo = isUnique ? 'Unique' : matchCount + ' matches';
        
        // Add special styling for table-related XPaths
        let tableIcon = '';
        let tableClass = '';
        if (type && (type.includes('Table') || type.includes('Cell') || type.includes('Row') || type.includes('Column'))) {
            tableIcon = '📊 ';
            tableClass = ' sli-table-xpath';
        }
        
        return '<div class="sli-field sli-smart-xpath ' + uniquenessClass + tableClass + '" onclick="window.SLI.copyToClipboard(\'' + escapedXPath + '\')">' +
            '<div class="sli-field-header">' +
                '<div class="sli-field-label">' + tableIcon + uniquenessIcon + ' ' + label + ' - ' + type + '</div>' +
                '<div class="sli-score-container">' +
                    '<div class="sli-uniqueness" style="color: ' + (isUnique ? '#98c379' : '#e5c07b') + '">' + uniquenessInfo + '</div>' +
                    '<div class="sli-score" style="color: ' + scoreColor + '">' + score + '/100</div>' +
                    '<div class="sli-score-bar">' + scoreBar + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="sli-field-description">' + description + '</div>' +
            '<div class="sli-field-value">' + xpath + '</div>' +
        '</div>';
    }

    // Get color based on score
    function getScoreColor(score) {
        if (score >= 90) return '#98c379'; // Green
        if (score >= 80) return '#61dafb'; // Blue  
        if (score >= 70) return '#e5c07b'; // Yellow
        return '#e06c75'; // Red
    }

    // Get visual score bar
    function getScoreBar(score) {
        const filled = Math.round(score / 10);
        const empty = 10 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    // Create a field HTML
    function createField(label, value) {
        const escapedValue = value.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return '<div class="sli-field" onclick="window.SLI.copyToClipboard(\'' + escapedValue + '\')"><div class="sli-field-label">' + label + '</div><div class="sli-field-value">' + value + '</div></div>';
    }

    // Copy to clipboard with visual feedback
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('[SLI] Copied to clipboard: ' + text);
                showCopyFeedback();
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log('[SLI] Copied to clipboard: ' + text);
            showCopyFeedback();
        }
    }

    // Show copy feedback
    function showCopyFeedback() {
        const header = modal.querySelector('.sli-title');
        const originalText = header.textContent;
        header.textContent = '📋 Copied!';
        header.style.color = '#98c379';
        
        setTimeout(() => {
            header.textContent = originalText;
            header.style.color = '';
        }, 1000);
    }

    // Toggle freeze state
    function toggleFreeze() {
        isFrozen = !isFrozen;
        
        if (isFrozen && currentElement) {
            highlightElement(currentElement);
            console.log('[SLI] Element frozen');
        } else {
            console.log('[SLI] Element unfrozen');
        }
    }

    // Toggle inspector on/off
    function toggle() {
        isActive = !isActive;
        
        if (isActive) {
            modal.style.display = 'block';
            console.log('[SLI] Inspector activated');
        } else {
            modal.style.display = 'none';
            highlightBox.style.display = 'none';
            console.log('[SLI] Inspector deactivated');
        }
    }

    // Cleanup function
    function cleanup() {
        // Remove existing elements
        const existingModal = document.getElementById(config.modalId);
        const existingHighlight = document.getElementById(config.highlightId);
        const existingStyles = document.getElementById('sli-styles');
        
        if (existingModal) existingModal.remove();
        if (existingHighlight) existingHighlight.remove();
        if (existingStyles) existingStyles.remove();
    }

    // Expose public API
    window.SLI = {
        toggle,
        toggleFreeze,
        copyToClipboard,
        cleanup,
        highlightHierarchyElement,
        unhighlightHierarchyElement,
        isActive: () => isActive,
        isFrozen: () => isFrozen
    };

    // Hierarchy element highlighting functions
    function highlightHierarchyElement(hierarchyItem) {
        const element = hierarchyItem._elementRef;
        if (!element) return;

        // Create temporary highlight for hierarchy element
        let tempHighlight = document.getElementById('sli-temp-highlight');
        if (!tempHighlight) {
            tempHighlight = document.createElement('div');
            tempHighlight.id = 'sli-temp-highlight';
            tempHighlight.style.position = 'fixed';
            tempHighlight.style.pointerEvents = 'none';
            tempHighlight.style.zIndex = '999999998';
            tempHighlight.style.border = '3px dashed #FFA500';
            tempHighlight.style.background = 'rgba(255, 165, 0, 0.2)';
            tempHighlight.style.borderRadius = '4px';
            tempHighlight.style.transition = 'all 0.2s ease';
            document.body.appendChild(tempHighlight);
        }

        const rect = element.getBoundingClientRect();
        tempHighlight.style.display = 'block';
        tempHighlight.style.left = rect.left + 'px';
        tempHighlight.style.top = rect.top + 'px';
        tempHighlight.style.width = rect.width + 'px';
        tempHighlight.style.height = rect.height + 'px';

        // Highlight the hierarchy item in the modal
        document.querySelectorAll('.sli-hierarchy-item').forEach(item => {
            item.classList.remove('sli-hierarchy-active');
        });
        hierarchyItem.classList.add('sli-hierarchy-active');
    }

    function unhighlightHierarchyElement() {
        const tempHighlight = document.getElementById('sli-temp-highlight');
        if (tempHighlight) {
            tempHighlight.style.display = 'none';
        }

        // Remove active state from hierarchy items
        document.querySelectorAll('.sli-hierarchy-item').forEach(item => {
            item.classList.remove('sli-hierarchy-active');
        });
    }

    // Initialize the inspector
    window.SmartLocatorInspector = {
        init,
        toggle,
        cleanup,
        isActive: () => isActive
    };

    // Auto-initialize
    init();

})();