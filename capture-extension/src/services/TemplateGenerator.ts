import type { TestTemplate } from '../types/index';

/**
 * TemplateGenerator - Generates test case boilerplate templates
 */
export class TemplateGenerator {
    /**
     * Generate a test template with boilerplate code
     */
    static generateTemplate(testName: string, url: string, className: string = 'BasePage'): TestTemplate {
        const template = `import { describe, it, before, beforeEach, after } from 'mocha';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { BasePage } from '@pages/BasePage';

class ${this.toPascalCase(testName)}Test extends BaseTest<BasePage> {
    protected createPage(): BasePage {
        return new BasePage();
    }
}

describe('${testName} - Captured Flow', () => {
    const test = new ${this.toPascalCase(testName)}Test();
    let page: BasePage;

    before(async () => {
        await test.setupDriver();
        page = test.page;
        logger.info('Test setup complete');
    });

    beforeEach(async () => {
        logger.info('Navigating to application');
        await page.open('${url}');
    });

    after(async () => {
        logger.info('Tearing down test');
        await test.teardownDriver();
    });

    describe('${testName} Flow', () => {
        it('should execute captured actions successfully', async () => {
            // CAPTURED ACTIONS START
            
            // CAPTURED ACTIONS END
        });
    });
});
`;

        // Find insertion point (where to insert captured actions)
        const insertionMarker = '// CAPTURED ACTIONS START\n            ';
        const insertionPoint = template.indexOf(insertionMarker) + insertionMarker.length;

        return {
            testName,
            url,
            template,
            insertionPoint
        };
    }

    /**
     * Convert string to PascalCase
     */
    private static toPascalCase(str: string): string {
        return str
            .split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    /**
     * Insert captured action code into template at the insertion point
     */
    static insertAction(template: string, code: string, insertionPoint: number): { newTemplate: string; newInsertionPoint: number } {
        const before = template.substring(0, insertionPoint);
        const after = template.substring(insertionPoint);
        const newTemplate = before + code + '\n            ' + after;
        const newInsertionPoint = insertionPoint + code.length + 13; // 13 = length of '\n            '
        return { newTemplate, newInsertionPoint };
    }
}
