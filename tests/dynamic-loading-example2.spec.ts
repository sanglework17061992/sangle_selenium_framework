import { describe, it, before, beforeEach, after } from 'mocha';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { DynamicLoadingPage } from '@pages/DynamicLoadingPage';
import { DynamicLoadingExample2Page } from '@pages/DynamicLoadingExample2Page';

/**
 * DynamicLoadingExample2Test - Tests dynamic loading of rendered elements
 * Scenario: Element rendered after the fact
 * - The element does NOT exist on the page initially
 * - Clicking Start triggers a loading process
 * - The element is created and rendered after loading completes
 */
class DynamicLoadingExample2Test extends BaseTest<DynamicLoadingExample2Page> {
    protected createPage(): DynamicLoadingExample2Page {
        return new DynamicLoadingExample2Page();
    }
}

describe('Dynamic Loading - Example 2: Rendered Element', () => {
    const test = new DynamicLoadingExample2Test();
    let parentPage: DynamicLoadingPage;
    let example2Page: DynamicLoadingExample2Page;

    before(async () => {
        await test.setupDriver();
        example2Page = test.page;
        parentPage = new DynamicLoadingPage();
        logger.info('Test setup complete - Driver initialized for Dynamic Loading Example 2');
    });

    beforeEach(async () => {
        logger.info('Navigating to Dynamic Loading Example 2 page before test');
        await parentPage.navigateTo();
        await parentPage.clickExample2Link();
        example2Page = new DynamicLoadingExample2Page();
    });

    after(async () => {
        logger.info('Tearing down test - Closing driver');
        await test.teardownDriver();
    });

    describe('Rendered Element Loading', () => {
        it('should render element dynamically with auto-wait and auto-assertion', async () => {
            logger.info('Step 1: Verify we are on Example 2 page with correct heading');
            await example2Page.verifyPageLoaded();

            logger.info('Step 2: Clicking Start button to trigger dynamic rendering');
            await example2Page.clickStartButton();

            logger.info('Step 3: Verifying finish message has expected text with auto-retry');
            await sanExpect(example2Page.finishMessage).toHaveText('Hello World!');
        });
    });
});
