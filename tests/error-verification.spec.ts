import { describe, it, before, after } from 'mocha';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { DynamicControlsPage } from '@pages/DynamicControlsPage';

class ErrorVerificationTest extends BaseTest<DynamicControlsPage> {
    protected createPage(): DynamicControlsPage {
        return new DynamicControlsPage();
    }
}

describe('Error Verification', () => {
    const test = new ErrorVerificationTest();
    let dynamicControlsPage: DynamicControlsPage;

    before(async () => {
        await test.setupDriver();
        dynamicControlsPage = test.page;
    });

    after(async () => {
        await test.teardownDriver();
    });

    it('should show error when element is not visible', async function () {
        this.timeout(15000);
        await dynamicControlsPage.navigateTo();
        
        const fakeElement = dynamicControlsPage.checkboxExample.findChild({ 
            using: 'xpath', 
            value: '//button[@id="non-existent"]' 
        });
        
        await sanExpect(fakeElement).toBeVisible();
    });

    it('should show error when element is not enabled', async function () {
        this.timeout(15000);
        await dynamicControlsPage.navigateTo();
        
        const disabledInput = dynamicControlsPage.inputField;
        
        await sanExpect(disabledInput).toBeEnabled();
    });

    it('should show error when text does not match', async function () {
        this.timeout(15000);
        await dynamicControlsPage.navigateTo();
        const removeButton = dynamicControlsPage.removeCheckboxButton;
        
        await sanExpect(removeButton).toHaveText('Wrong Text Here');
    });

    it('should show error when visible element should be hidden', async function () {
        this.timeout(15000);
        await dynamicControlsPage.navigateTo();
        const removeButton = dynamicControlsPage.removeCheckboxButton;
        
        await sanExpect(removeButton).toBeHidden();
    });

    it('should show error when enabled element should be disabled', async function () {
        this.timeout(15000);
        await dynamicControlsPage.navigateTo();
        
        await dynamicControlsPage.enableDisableButton.click();
        
        const enabledInput = dynamicControlsPage.inputField;
        
        await sanExpect(enabledInput).toBeDisabled();
    });
});


