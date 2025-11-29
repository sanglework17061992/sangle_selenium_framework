import { describe, it, before, beforeEach, after } from 'mocha';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { DynamicControlsPage } from '@pages/DynamicControlsPage';

/**
 * DynamicControlsTest - Demonstrates auto-wait and auto-assertion with dynamic controls
 * Tests checkbox removal and input enable/disable functionality
 */
class DynamicControlsTest extends BaseTest<DynamicControlsPage> {
    protected createPage(): DynamicControlsPage {
        return new DynamicControlsPage();
    }
}

describe('Dynamic Controls - Auto-Wait & Auto-Assertion', () => {
    const test = new DynamicControlsTest();
    let dynamicControlsPage: DynamicControlsPage;

    before(async () => {
        await test.setupDriver();
        dynamicControlsPage = test.page;
        logger.info('Test setup complete - Driver initialized and page object created');
    });

    beforeEach(async () => {
        logger.info('Navigating to Dynamic Controls page before test');
        await dynamicControlsPage.navigateTo();
    });

    after(async () => {
        logger.info('Tearing down test - Closing driver');
        await test.teardownDriver();
    });

    describe('Checkbox Remove Functionality', () => {
        it('should remove checkbox element with auto-wait and auto-assertion', async () => {
            logger.info('Step 1: Clicking checkbox to change state');
            await dynamicControlsPage.clickCheckbox();

            logger.info('Step 2: Clicking checkbox again to toggle state');
            await dynamicControlsPage.clickCheckbox();

            logger.info('Step 3: Clicking Remove button to remove checkbox');
            await dynamicControlsPage.clickRemoveCheckboxButton();

            logger.info('Step 4: Verifying checkbox element is removed with framework auto-retry');
            await sanExpect(dynamicControlsPage.checkboxInput).toBeHidden();
        });
    });

    describe('Input Enable/Disable Functionality', () => {
        it('should enable input field and verify enabled state', async () => {
            logger.info('Step 1: Clicking Enable button to enable input field');
            await dynamicControlsPage.enableInputField();

            logger.info('Step 2: Verifying input field is enabled with auto-retry');
            await sanExpect(dynamicControlsPage.inputField).toBeEnabled();

            logger.info('Step 3: Typing text into the input field');
            const testText = 'hello enable disable locator';
            await dynamicControlsPage.typeInInputField(testText);
        });

        it('should disable input field and verify disabled state', async () => {
            logger.info('Step 1: Clicking Enable button to enable input field first');
            await dynamicControlsPage.enableInputField();

            logger.info('Step 2: Verifying input field is enabled');
            await sanExpect(dynamicControlsPage.inputField).toBeEnabled();

            logger.info('Step 3: Typing text into the enabled input field');
            const testText = 'test disable';
            await dynamicControlsPage.typeInInputField(testText);

            logger.info('Step 4: Clicking Disable button to disable input field');
            await dynamicControlsPage.disableInputField();

            logger.info('Step 5: Verifying input field is disabled with auto-retry');
            await sanExpect(dynamicControlsPage.inputField).toBeDisabled();
        });
    });
});
