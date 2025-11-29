import { DynamicLoadingPage } from '@pages/DynamicLoadingPage';
import { logger } from '@utils/Logger';

/**
 * DynamicLoadingExample2Page - Page Object for Example 2 dynamic loading scenario
 * URL: https://the-internet.herokuapp.com/dynamic_loading/2
 * 
 * Scenario: Element rendered after the fact
 * - The element does NOT exist on the page initially
 * - Clicking Start triggers a loading process
 * - The element is created and rendered after loading completes
 */
export class DynamicLoadingExample2Page extends DynamicLoadingPage {
    // Example 2 specific locators - public for assertions in tests
    public startButton = this.css('button');
    public finishMessage = this.id('finish');
    public heading = this.css('div.example > h3');

    /**
     * Click the Start button to trigger dynamic loading
     */
    public async clickStartButton(): Promise<void> {
        logger.info('Clicking Start button to trigger loading for Example 2');
        await this.startButton.click();
    }

    /**
     * Verify page loaded with correct URL and heading text
     * Combines verification of URL and page heading into single reusable method
     */
    public async verifyPageLoaded(): Promise<void> {
        logger.info('Verifying Example 2 page is loaded with correct URL and heading');
        const { expect: sanExpect } = await import('@assertion/index');
        
        await sanExpect(this).toHaveURL(/dynamic_loading\/2/);
        await sanExpect(this.heading).toHaveText('Dynamically Loaded Page Elements');
        
        logger.info('Example 2 page verification complete');
    }
}

export default DynamicLoadingExample2Page;
