import { describe, it, before, beforeEach, after } from 'mocha';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { DynamicLoadingPage } from '@pages/DynamicLoadingPage';
import { DynamicLoadingExample1Page } from '@pages/DynamicLoadingExample1Page';

/**
 * DynamicLoadingExample1Test - Tests dynamic loading of hidden elements
 * Scenario: Element on page that is hidden
 * - The element exists on the page but is hidden initially
 * - Clicking Start triggers a loading process
 * - The hidden element becomes visible after loading completes
 */
class DynamicLoadingExample1Test extends BaseTest<DynamicLoadingExample1Page> {
    protected createPage(): DynamicLoadingExample1Page {
        return new DynamicLoadingExample1Page();
    }
}

describe.skip('Dynamic Loading - Example 1: Hidden Element', () => {
    const test = new DynamicLoadingExample1Test();
    let parentPage: DynamicLoadingPage;
    let example1Page: DynamicLoadingExample1Page;

    before(async () => {
        await test.setupDriver();
        example1Page = test.page;
        parentPage = new DynamicLoadingPage();
        logger.info('Test setup complete - Driver initialized for Dynamic Loading Example 1');
    });

    beforeEach(async () => {
        logger.info('Navigating to Dynamic Loading Example 1 page before test');
        await parentPage.navigateTo();
        await parentPage.clickExample1Link();
        example1Page = new DynamicLoadingExample1Page();
    });

    after(async () => {
        logger.info('Tearing down test - Closing driver');
        await test.teardownDriver();
    });

    describe('Hidden Element Loading', () => {
        it('should load hidden element with auto-wait and auto-assertion', async () => {
            logger.info('Step 1: Verify we are on Example 1 page with correct heading');
            await example1Page.verifyPageLoaded();

            logger.info('Step 2: Clicking Start button to trigger loading');
            await example1Page.clickStartButton();

            logger.info('Step 3: Verifying finish message has expected text with auto-retry');
            await sanExpect(example1Page.finishMessage).toHaveText('Hello World!');
        });
    });
});
