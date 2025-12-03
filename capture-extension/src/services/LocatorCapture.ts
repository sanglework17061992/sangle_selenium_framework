import type { LocatorOption, ElementInfo } from '../types/index';

/**
 * LocatorCapture - Generates and ranks multiple locator strategies for elements
 */
export class LocatorCapture {
    /**
     * Generate multiple locator options for an element
     */
    static generateLocators(element: ElementInfo): LocatorOption[] {
        const locators: LocatorOption[] = [];

        // CSS selector strategy
        const cssLocator = this.generateCSSSelector(element);
        locators.push({
            type: 'css',
            value: cssLocator,
            confidence: 85,
            description: 'CSS Selector - Fast and reliable'
        });

        // XPath strategy
        const xpathLocator = this.generateXPath(element);
        locators.push({
            type: 'xpath',
            value: xpathLocator,
            confidence: 80,
            description: 'XPath - Powerful element selection'
        });

        // ID strategy (if available)
        if (element.id) {
            locators.push({
                type: 'id',
                value: element.id,
                confidence: 95,
                description: 'ID Selector - Most stable'
            });
        }

        // Smart XPath (relative path based on unique attributes)
        const smartXpath = this.generateSmartXPath(element);
        locators.push({
            type: 'smartXpath',
            value: smartXpath,
            confidence: 88,
            description: 'Smart XPath - Optimized for stability'
        });

        // Sort by confidence and return top 3
        return locators
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
    }

    /**
     * Generate CSS selector for element
     */
    private static generateCSSSelector(element: ElementInfo): string {
        // Prefer ID first
        if (element.id && !element.id.match(/^-?\d/)) { // Avoid ID starting with digits
            return `#${element.id}`;
        }

        // Try data-testid attribute
        const testId = element.attributes['data-testid'];
        if (testId) {
            return `[data-testid="${testId}"]`;
        }

        // Build from tag and classes
        let selector = element.tag;
        
        if (element.classes.length > 0) {
            const mainClasses = element.classes
                .filter(c => !c.match(/^(ng-|_|temp)/)) // Filter out generated classes
                .slice(0, 2) // Use first 2 classes max
                .join('.');
            if (mainClasses) {
                selector += `.${mainClasses}`;
            }
        }

        // Add attribute selectors if needed
        if (element.attributes['type']) {
            selector += `[type="${element.attributes['type']}"]`;
        }
        if (element.attributes['name']) {
            selector += `[name="${element.attributes['name']}"]`;
        }

        return selector;
    }

    /**
     * Generate XPath for element
     */
    private static generateXPath(element: ElementInfo): string {
        // Use absolute path from element.xpath if available
        if (element.xpath) {
            return element.xpath;
        }

        // Build XPath from tag
        let xpath = `//${element.tag}`;

        // Add attribute predicates
        const predicates = [];

        if (element.id && !element.id.match(/^-?\d/)) {
            predicates.push(`@id="${element.id}"`);
        }

        if (element.attributes['name']) {
            predicates.push(`@name="${element.attributes['name']}"`);
        }

        if (element.attributes['type']) {
            predicates.push(`@type="${element.attributes['type']}"`);
        }

        if (element.text && element.text.length < 50) {
            predicates.push(`text()="${element.text}"`);
        }

        if (predicates.length > 0) {
            xpath += `[${predicates.join(' and ')}]`;
        }

        return xpath;
    }

    /**
     * Generate smart XPath using unique attributes and positioning
     */
    private static generateSmartXPath(element: ElementInfo): string {
        // Prefer unique data-* attributes
        const dataAttrs = Object.entries(element.attributes)
            .filter(([key]) => key.startsWith('data-'));

        if (dataAttrs.length > 0) {
            const [key, value] = dataAttrs[0];
            return `//${element.tag}[@${key}="${value}"]`;
        }

        // Fall back to combination of tag and classes
        let xpath = `//${element.tag}`;
        
        if (element.classes.length > 0) {
            const classXpath = element.classes
                .filter(c => !c.match(/^(ng-|_|temp|css-|js-)/))
                .slice(0, 2)
                .map(c => `contains(@class, '${c}')`)
                .join(' and ');
            if (classXpath) {
                xpath += `[${classXpath}]`;
            }
        }

        return xpath;
    }
}
