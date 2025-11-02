// Locator Generators Module
// All locator generation strategies (XPath, CSS, etc.)

import { SLIUtils } from './utils.js';

export class SLILocatorGenerators {
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