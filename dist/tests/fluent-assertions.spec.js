"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FluentAssertions_1 = require("../src/assertion/FluentAssertions");
const SanElement_1 = require("../src/core/elements/SanElement");
const mocha_1 = require("mocha");
(0, mocha_1.describe)('Fluent Assertions API', function () {
    this.timeout(10000);
    // Create mock elements for testing
    const createMockElement = (text, attributes = {}, visible = true, enabled = true) => {
        const mockDriver = {
            wait: async () => { },
            findElement: async () => ({
                getText: async () => text,
                getAttribute: async (name) => attributes[name] || null,
                isDisplayed: async () => visible,
                isEnabled: async () => enabled
            })
        };
        return new SanElement_1.SanElement(mockDriver, { using: 'css', value: '.mock' }, 1000);
    };
    (0, mocha_1.it)('should support text assertions', async () => {
        const element = createMockElement('Hello World');
        await (0, FluentAssertions_1.expectElement)(element).toHaveText('Hello World');
        await (0, FluentAssertions_1.expectElement)(element).toContainText('World');
        await (0, FluentAssertions_1.expectElement)(element).toContainText('Hello');
    });
    (0, mocha_1.it)('should support visibility assertions', async () => {
        const visibleElement = createMockElement('Visible', {}, true);
        const hiddenElement = createMockElement('Hidden', {}, false);
        await (0, FluentAssertions_1.expectElement)(visibleElement).toBeVisible();
        await (0, FluentAssertions_1.expectElement)(hiddenElement).toBeHidden();
    });
    (0, mocha_1.it)('should support enabled/disabled assertions', async () => {
        const enabledElement = createMockElement('Enabled', {}, true, true);
        const disabledElement = createMockElement('Disabled', {}, true, false);
        await (0, FluentAssertions_1.expectElement)(enabledElement).toBeEnabled();
        await (0, FluentAssertions_1.expectElement)(disabledElement).toBeDisabled();
    });
    (0, mocha_1.it)('should support attribute assertions', async () => {
        const element = createMockElement('Test', {
            'class': 'btn btn-primary',
            'href': 'https://example.com',
            'data-id': '123'
        });
        await (0, FluentAssertions_1.expectElement)(element).toHaveAttribute('class', 'btn btn-primary');
        await (0, FluentAssertions_1.expectElement)(element).toHaveAttribute('href', 'https://example.com');
        await (0, FluentAssertions_1.expectElement)(element).toHaveAttributeContaining('href', 'example.com');
        await (0, FluentAssertions_1.expectElement)(element).toHaveAttributeContaining('class', 'btn');
    });
    (0, mocha_1.it)('should support CSS class assertions', async () => {
        const element = createMockElement('Button', { 'class': 'btn btn-primary active' });
        await (0, FluentAssertions_1.expectElement)(element).toHaveClass('btn');
        await (0, FluentAssertions_1.expectElement)(element).toHaveClass('btn-primary');
        await (0, FluentAssertions_1.expectElement)(element).toHaveClass('active');
    });
    (0, mocha_1.it)('should support value assertions', async () => {
        const inputElement = createMockElement('Input', { 'value': 'test@example.com' });
        await (0, FluentAssertions_1.expectElement)(inputElement).toHaveValue('test@example.com');
        await (0, FluentAssertions_1.expectElement)(inputElement).toHaveValueContaining('example.com');
        await (0, FluentAssertions_1.expectElement)(inputElement).toHaveValueContaining('test@');
    });
    (0, mocha_1.it)('should provide clear error messages', async () => {
        const element = createMockElement('Wrong Text');
        try {
            await (0, FluentAssertions_1.expectElement)(element).toHaveText('Expected Text');
            throw new Error('Should have failed');
        }
        catch (error) {
            if (!error.message.includes('Expected element to have text "Expected Text"')) {
                throw new Error('Error message should be descriptive');
            }
        }
    });
    (0, mocha_1.it)('should support custom timeout', async () => {
        const element = createMockElement('Test');
        // This should work with custom timeout
        await (0, FluentAssertions_1.expectElement)(element, 2000).toHaveText('Test');
    });
});
