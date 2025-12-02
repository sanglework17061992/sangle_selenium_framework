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
 * 
 * Demonstrates the comprehensive timeout error handling system with:
 * - Custom timeout error type (TimeoutError) in error hierarchy
 * - Structured error formatting with operation, timeout, and reason
 * - AssertionError with timeout context for assertion timeouts
 * - Console logging of timeout errors for debugging
 * 
 * Expected Error Output:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ TimeoutError: Failed to find element within 20000ms         │
 * │                                                               │
 * │   Error Type: TimeoutError                                  │
 * │   Operation: Element visibility check                       │
 * │   Timeout: 20000ms                                          │
 * │   Locator: css('button')                                    │
 * │   Reason: Element was not found or did not become visible...│
 * └─────────────────────────────────────────────────────────────┘
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
        
        // Try to find a non-existent element with custom 3-second timeout
        // The error will show: AssertionError with timeout details
        // Console will log: TimeoutError with operation, timeout, and reason
        const fakeElement = dynamicControlsPage.checkboxExample.findChild({ 
            using: 'xpath', 
            value: '//button[@id="non-existent"]' 
        });
        
        // Custom timeout: 3 seconds (instead of default 30 seconds)
        await sanExpect(fakeElement, 3000).toBeVisible();
    });

    it('should show timeout error with custom CSS selector (4s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        // Create element with CSS selector that won't match
        // Uses custom 4-second timeout to fail faster
        const fakeElement = dynamicControlsPage.checkboxExample.findChild({ 
            using: 'css', 
            value: 'button.does-not-exist' 
        });
        
        // Custom 4 second timeout
        await sanExpect(fakeElement, 4000).toBeVisible();
    });

    it('should timeout waiting for element that never appears (5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        // Try to find an element that will never appear on the page
        // With custom 5 second timeout to demonstrate TimeoutError
        const neverAppearingElement = dynamicControlsPage.checkboxExample.findChild({
            using: 'xpath',
            value: '//span[@id="element-that-never-appears"]'
        });
        
        // Custom 5 second timeout
        await sanExpect(neverAppearingElement, 5000).toBeVisible();
    });

    it('should display assertion timeout error for non-existent button (3.5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        // Try to assert on a non-existent element with custom timeout
        // Demonstrates how timeout errors are formatted in logs and test output
        const nonExistentButton = dynamicControlsPage.inputExample.findChild({
            using: 'css',
            value: 'button.hidden-button'
        });
        
        // Custom 3.5 second timeout
        await sanExpect(nonExistentButton, 3500).toBeVisible();
    });

    it('should show timeout error for hidden element lookup (2.5s timeout)', async function () {
        this.timeout(40000);
        await dynamicControlsPage.navigateTo();
        
        // Try to find an element with minimal timeout
        // This demonstrates short timeout error messages
        const hiddenElement = dynamicControlsPage.inputExample.findChild({
            using: 'xpath',
            value: '//button[@aria-hidden="true"]'
        });
        
        // Very short 2.5 second timeout
        await sanExpect(hiddenElement, 2500).toBeVisible();
    });
});
