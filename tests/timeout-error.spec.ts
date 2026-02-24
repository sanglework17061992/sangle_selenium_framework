import { describe, it, before, after } from 'mocha';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { DynamicControlsPage } from '@pages/DynamicControlsPage';

class TimeoutErrorTest extends BaseTest<DynamicControlsPage> {
    protected createPage(): DynamicControlsPage {
        return new DynamicControlsPage();
    }
}

/**
 * Timeout Error Test Suite
 */
describe('Timeout Error Formatting', () => {
    const test = new TimeoutErrorTest();
    let dynamicControlsPage: DynamicControlsPage;

    before(async () => {
        await test.setupDriver();
        dynamicControlsPage = test.page;
    });

    after(async () => {
        await test.teardownDriver();
    });

    it('should display timeout error when element is never visible (custom timeout 3s)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        const fakeElement = dynamicControlsPage.checkboxExample.findChild({ 
            using: 'xpath', 
            value: '//button[@id="non-existent"]' 
        });
        
        await sanExpect(fakeElement, 3000).toBeVisible();
    });

    it('should show timeout error with custom CSS selector (4s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        const fakeElement = dynamicControlsPage.checkboxExample.findChild({ 
            using: 'css', 
            value: 'button.does-not-exist' 
        });
        
        await sanExpect(fakeElement, 4000).toBeVisible();
    });

    it('should timeout waiting for element that never appears (5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();

        const neverAppearingElement = dynamicControlsPage.checkboxExample.findChild({
            using: 'xpath',
            value: '//span[@id="element-that-never-appears"]'
        });
        
        await sanExpect(neverAppearingElement, 5000).toBeVisible();
    });

    it('should display assertion timeout error for non-existent button (3.5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        const nonExistentButton = dynamicControlsPage.inputExample.findChild({
            using: 'css',
            value: 'button.hidden-button'
        });
        
        await sanExpect(nonExistentButton, 3500).toBeVisible();
    });

    it('should show timeout error for hidden element lookup (2.5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        const hiddenElement = dynamicControlsPage.inputExample.findChild({
            using: 'xpath',
            value: '//button[@aria-hidden="true"]'
        });
        
        await sanExpect(hiddenElement, 2500).toBeVisible();
    });
});
