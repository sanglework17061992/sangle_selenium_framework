import type { ActionType, AssertionType, LocatorOption, GeneratedCode } from '../types/index';

/**
 * CodeGenerator - Generates code snippets for captured actions
 */
export class CodeGenerator {
    /**
     * Generate code for a captured action (Option B format - Direct SanElement Locators)
     */
    static generateActionCode(locator: LocatorOption, actionType: ActionType, parameters?: Record<string, any>): GeneratedCode {
        const locatorCode = this.generateLocatorCode(locator);
        const actionCode = this.generateActionCall(locatorCode, actionType, parameters);
        const loggerStatement = this.generateLoggerStatement(actionType, parameters);

        const fullCode = `${loggerStatement}\n            ${actionCode}`;

        return {
            action: actionCode,
            logger: loggerStatement,
            fullCode
        };
    }

    /**
     * Generate assertion code
     */
    static generateAssertionCode(locator: LocatorOption, assertionType: AssertionType, parameters?: Record<string, any>): GeneratedCode {
        const locatorCode = this.generateLocatorCode(locator);
        const assertionCode = this.generateAssertionCall(locatorCode, assertionType, parameters);
        const loggerStatement = this.generateLoggerStatement(assertionType, parameters);

        const fullCode = `${loggerStatement}\n            ${assertionCode}`;

        return {
            action: assertionCode,
            logger: loggerStatement,
            fullCode
        };
    }

    /**
     * Generate locator code string
     */
    private static generateLocatorCode(locator: LocatorOption): string {
        switch (locator.type) {
            case 'css':
                return `this.page.css('${locator.value}')`;
            case 'xpath':
                return `this.page.xpath('${locator.value}')`;
            case 'id':
                return `this.page.id('${locator.value}')`;
            case 'smartXpath':
                return `this.page.xpath('${locator.value}')`;
            default:
                return `this.page.css('${locator.value}')`;
        }
    }

    /**
     * Generate action call based on action type
     */
    private static generateActionCall(locatorCode: string, actionType: ActionType, parameters?: Record<string, any>): string {
        switch (actionType) {
            case 'click':
                return `await ${locatorCode}.click();`;
            case 'type':
                const text = parameters?.text || 'text';
                return `await ${locatorCode}.type('${text}');`;
            case 'clear':
                return `await ${locatorCode}.clear();`;
            case 'submit':
                return `await ${locatorCode}.submit();`;
            case 'hover':
                return `await ${locatorCode}.hover();`;
            case 'focus':
                return `await ${locatorCode}.focus();`;
            case 'getText':
                return `const text = await ${locatorCode}.getText();`;
            case 'check':
                return `await ${locatorCode}.click();`;
            case 'uncheck':
                return `await ${locatorCode}.click();`;
            case 'select':
                const optionValue = parameters?.value || 'value';
                return `await ${locatorCode}.selectByValue('${optionValue}');`;
            default:
                return `await ${locatorCode}.click();`;
        }
    }

    /**
     * Generate assertion call based on assertion type
     */
    private static generateAssertionCall(locatorCode: string, assertionType: AssertionType, parameters?: Record<string, any>): string {
        switch (assertionType) {
            case 'toBeVisible':
                return `await sanExpect(${locatorCode}).toBeVisible();`;
            case 'toBeHidden':
                return `await sanExpect(${locatorCode}).toBeHidden();`;
            case 'toBeEnabled':
                return `await sanExpect(${locatorCode}).toBeEnabled();`;
            case 'toBeDisabled':
                return `await sanExpect(${locatorCode}).toBeDisabled();`;
            case 'toContain':
                const expectedText = parameters?.text || 'expected text';
                return `await sanExpect(${locatorCode}).toContain('${expectedText}');`;
            case 'toEqual':
                const expectedValue = parameters?.value || 'expected value';
                return `await sanExpect(${locatorCode}).toEqual('${expectedValue}');`;
            default:
                return `await sanExpect(${locatorCode}).toBeVisible();`;
        }
    }

    /**
     * Generate logger.info statement
     */
    private static generateLoggerStatement(actionType: ActionType | AssertionType, parameters?: Record<string, any>): string {
        const descriptions: Record<string, string> = {
            click: 'Click element',
            type: `Type '${parameters?.text || 'text'}'`,
            clear: 'Clear element',
            submit: 'Submit form',
            hover: 'Hover element',
            focus: 'Focus element',
            getText: 'Get element text',
            check: 'Check element',
            uncheck: 'Uncheck element',
            select: `Select option '${parameters?.value || 'value'}'`,
            toBeVisible: 'Verify element is visible',
            toBeHidden: 'Verify element is hidden',
            toBeEnabled: 'Verify element is enabled',
            toBeDisabled: 'Verify element is disabled',
            toContain: `Verify element contains '${parameters?.text || 'text'}'`,
            toEqual: `Verify element equals '${parameters?.value || 'value'}'`
        };

        const description = descriptions[actionType] || actionType;
        return `logger.info('Captured: ${description}');`;
    }

    /**
     * Generate multiple action codes at once (for bulk operations)
     */
    static generateMultipleActions(actions: Array<{ locator: LocatorOption; actionType: ActionType; parameters?: Record<string, any> }>): string {
        return actions
            .map(a => this.generateActionCode(a.locator, a.actionType, a.parameters).fullCode)
            .join('\n            ');
    }
}
