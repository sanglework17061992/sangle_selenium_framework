import { BasePage } from '@pages/BasePage';
import { logger } from '@utils/Logger';
import { configLoader } from '@config/ConfigLoader';

/**
 * DynamicLoadingPage - Base Page Object for dynamic loading examples
 * URL: https://the-internet.herokuapp.com/dynamic_loading
 * 
 * This page is the entry point for dynamic loading test scenarios:
 * - Example 1: Element on page that is hidden (shown after loading)
 * - Example 2: Element rendered after the fact (created after loading)
 */
export class DynamicLoadingPage extends BasePage {
    private readonly PAGE_PATH = '/dynamic_loading';

    // Main page locators
    protected example1Link = this.css('[id="content"] a:nth-of-type(1)');
    protected example2Link = this.css('a:nth-of-type(2)');

    /**
     * Navigate to the dynamic loading page
     */
    public async navigateTo(): Promise<void> {
        const url = `${configLoader.getBaseUrl()}${this.PAGE_PATH}`;
        logger.info(`Navigating to Dynamic Loading page: ${url}`);
        await this.open(url);
        logger.info('Successfully navigated to Dynamic Loading page');
    }

    /**
     * Click on Example 1 link (Element on page that is hidden)
     */
    public async clickExample1Link(): Promise<void> {
        logger.info('Clicking on Example 1: Element on page that is hidden');
        await this.example1Link.click();
    }

    /**
     * Click on Example 2 link (Element rendered after the fact)
     */
    public async clickExample2Link(): Promise<void> {
        logger.info('Clicking on Example 2: Element rendered after the fact');
        await this.example2Link.click();
    }
}

export default DynamicLoadingPage;
