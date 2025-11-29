import { DynamicLoadingPage } from '@pages/DynamicLoadingPage';
import { logger } from '@utils/Logger';

/**
 * DynamicLoadingExample1Page - Page Object for Example 1 dynamic loading scenario
 * URL: https://the-internet.herokuapp.com/dynamic_loading/1
 * 
 * Scenario: Element on page that is hidden
 * - The element exists on the page but is hidden initially
 * - Clicking Start triggers a loading process
 * - The hidden element becomes visible after loading completes
 */
export class DynamicLoadingExample1Page extends DynamicLoadingPage {
    // Example 1 specific locators - public for assertions in tests
    public startButton = this.css('button');
    public finishMessage = this.id('finish');
    public heading = this.css('div.example > h3');

    /**
     * Click the Start button to trigger dynamic loading
     */
    public async clickStartButton(): Promise<void> {
        logger.info('Clicking Start button to trigger loading for Example 1');
        await this.startButton.click();
    }
}

export default DynamicLoadingExample1Page;
