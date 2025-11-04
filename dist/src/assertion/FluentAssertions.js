"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementAssertions = void 0;
exports.expectElement = expectElement;
const ConfigLoader_1 = require("../config/ConfigLoader");
const chai_1 = require("chai");
const testConfig = ConfigLoader_1.configLoader.getTestConfig();
const defaultRetryTimeout = testConfig.retryCount * testConfig.retryInterval;
/**
 * Fluent assertion wrapper for SanElement
 * Provides Playwright-style assertions with retry logic
 */
class ElementAssertions {
    constructor(element, timeout) {
        this.element = element;
        this.timeout = timeout ?? defaultRetryTimeout;
    }
    /**
     * Assert that the element has the exact text
     */
    async toHaveText(expectedText) {
        await this.retryAssert(async () => {
            const actualText = await this.element.getText();
            (0, chai_1.expect)(actualText.trim()).to.equal(expectedText);
        }, `Expected element to have text "${expectedText}"`);
    }
    /**
     * Assert that the element contains the specified text
     */
    async toContainText(expectedSubstring) {
        await this.retryAssert(async () => {
            const actualText = await this.element.getText();
            (0, chai_1.expect)(actualText.trim()).to.include(expectedSubstring);
        }, `Expected element to contain text "${expectedSubstring}"`);
    }
    /**
     * Assert that the element has the specified attribute with the expected value
     */
    async toHaveAttribute(attributeName, expectedValue) {
        await this.retryAssert(async () => {
            const actualValue = await this.element.getAttribute(attributeName);
            (0, chai_1.expect)(actualValue).to.equal(expectedValue);
        }, `Expected element to have attribute "${attributeName}" with value "${expectedValue}"`);
    }
    /**
     * Assert that the element has the specified attribute containing the expected value
     */
    async toHaveAttributeContaining(attributeName, expectedSubstring) {
        await this.retryAssert(async () => {
            const actualValue = await this.element.getAttribute(attributeName);
            (0, chai_1.expect)(actualValue).to.include(expectedSubstring);
        }, `Expected element to have attribute "${attributeName}" containing "${expectedSubstring}"`);
    }
    /**
     * Assert that the element is visible
     */
    async toBeVisible() {
        await this.retryAssert(async () => {
            const isVisible = await this.element.isDisplayed();
            (0, chai_1.expect)(isVisible).to.be.true;
        }, 'Expected element to be visible');
    }
    /**
     * Assert that the element is not visible
     */
    async toBeHidden() {
        await this.retryAssert(async () => {
            const isVisible = await this.element.isDisplayed();
            (0, chai_1.expect)(isVisible).to.be.false;
        }, 'Expected element to be hidden');
    }
    /**
     * Assert that the element is enabled
     */
    async toBeEnabled() {
        await this.retryAssert(async () => {
            const isEnabled = await (await this.element.raw()).isEnabled();
            (0, chai_1.expect)(isEnabled).to.be.true;
        }, 'Expected element to be enabled');
    }
    /**
     * Assert that the element is disabled
     */
    async toBeDisabled() {
        await this.retryAssert(async () => {
            const isEnabled = await (await this.element.raw()).isEnabled();
            (0, chai_1.expect)(isEnabled).to.be.false;
        }, 'Expected element to be disabled');
    }
    /**
     * Assert that the element has the specified CSS class
     */
    async toHaveClass(className) {
        await this.retryAssert(async () => {
            const classAttribute = await this.element.getAttribute('class');
            const classes = classAttribute ? classAttribute.split(/\s+/) : [];
            (0, chai_1.expect)(classes).to.include(className);
        }, `Expected element to have CSS class "${className}"`);
    }
    /**
     * Assert that the element's value attribute equals the expected value
     */
    async toHaveValue(expectedValue) {
        await this.toHaveAttribute('value', expectedValue);
    }
    /**
     * Assert that the element's value attribute contains the expected substring
     */
    async toHaveValueContaining(expectedSubstring) {
        await this.toHaveAttributeContaining('value', expectedSubstring);
    }
    /**
     * Retry assertion with configurable timeout and interval
     */
    async retryAssert(assertFn, errorMessage) {
        const start = Date.now();
        let lastErr = null;
        while (Date.now() - start < this.timeout) {
            try {
                await assertFn();
                return;
            }
            catch (err) {
                lastErr = err;
                await new Promise(r => setTimeout(r, testConfig.retryInterval));
            }
        }
        const error = lastErr || new Error('Assertion timed out');
        error.message = `${errorMessage}\n${error.message}`;
        throw error;
    }
}
exports.ElementAssertions = ElementAssertions;
/**
 * Create fluent assertions for a SanElement
 * Usage: expect(element).toHaveText('expected')
 */
function expectElement(element, timeout) {
    return new ElementAssertions(element, timeout);
}
