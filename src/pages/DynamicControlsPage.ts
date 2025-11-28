import { BasePage } from './BasePage';
import { logger } from '@utils/Logger';
import { configLoader } from '@config/ConfigLoader';

/**
 * DynamicControlsPage - Page Object for testing dynamic controls
 * URL: https://the-internet.herokuapp.com/dynamic_controls
 * 
 * This page tests:
 * - Dynamic checkbox that can be removed
 * - Dynamic input field that can be enabled/disabled
 */
export class DynamicControlsPage extends BasePage {
    private readonly PAGE_PATH = '/dynamic_controls';

    // Checkbox section locators - public for assertions in tests
    public checkboxInput = this.id('checkbox');
    public checkboxExample = this.id('checkbox-example');
    public removeCheckboxButton = this.css('[id="checkbox-example"] > button');

    // Input section locators - public for assertions in tests
    public inputField = this.css('[id="input-example"] > input');
    public inputExample = this.id('input-example');
    public enableDisableButton = this.css('[id="input-example"] > button');

    /**
     * Navigate to the dynamic controls page
     */
    public async navigateTo(): Promise<void> {
        const url = `${configLoader.getBaseUrl()}${this.PAGE_PATH}`;
        logger.info(`Navigating to Dynamic Controls page: ${url}`);
        await this.open(url);
        logger.info('Successfully navigated to Dynamic Controls page');
    }

    /**
     * Verify we are on the Dynamic Controls page using framework assertion with auto-retry
     */
    public async isOnThePage(): Promise<void> {
        logger.info('Verifying on Dynamic Controls page with auto-retry');
        await this.toHaveURL(/dynamic_controls/);
        logger.info('Successfully verified on Dynamic Controls page');
    }

    /**
     * Click on the checkbox element
     */
    public async clickCheckbox(): Promise<void> {
        logger.info('Clicking on checkbox element');
        await this.checkboxInput.click();
    }

    /**
     * Click the remove button in checkbox section
     */
    public async clickRemoveCheckboxButton(): Promise<void> {
        logger.info('Clicking Remove button for checkbox');
        await this.removeCheckboxButton.click();
    }

    /**
     * Enable the input field by clicking enable button
     */
    public async enableInputField(): Promise<void> {
        logger.info('Clicking Enable button for input field');
        await this.enableDisableButton.click();
    }

    /**
     * Type text into the input field
     */
    public async typeInInputField(text: string): Promise<void> {
        logger.info(`Typing text into input field: ${text}`);
        await this.inputField.type(text);
    }

    /**
     * Disable the input field by clicking disable button
     */
    public async disableInputField(): Promise<void> {
        logger.info('Clicking Disable button for input field');
        await this.enableDisableButton.click();
    }
}

export default DynamicControlsPage;
