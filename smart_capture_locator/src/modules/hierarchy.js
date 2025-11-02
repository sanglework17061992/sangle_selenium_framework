// DOM Hierarchy Module
// Handles DOM tree structure generation and visualization

import { SLIUtils } from './utils.js';

export class SLIDOMHierarchy {
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