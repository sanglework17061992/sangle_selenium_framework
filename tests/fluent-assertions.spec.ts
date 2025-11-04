import { expectElement } from '../src/assertion/FluentAssertions';
import { SanElement } from '../src/core/SanElement';

import { describe, it } from 'mocha';

describe('Fluent Assertions API', function() {
  this.timeout(10000);

  // Create mock elements for testing
  const createMockElement = (text: string, attributes: Record<string, string> = {}, visible = true, enabled = true) => {
    const mockDriver = {
      wait: async () => {},
      findElement: async () => ({
        getText: async () => text,
        getAttribute: async (name: string) => attributes[name] || null,
        isDisplayed: async () => visible,
        isEnabled: async () => enabled
      })
    };
    return new SanElement(mockDriver as any, { using: 'css', value: '.mock' }, 1000);
  };

  it('should support text assertions', async () => {
    const element = createMockElement('Hello World');

    await expectElement(element).toHaveText('Hello World');
    await expectElement(element).toContainText('World');
    await expectElement(element).toContainText('Hello');
  });

  it('should support visibility assertions', async () => {
    const visibleElement = createMockElement('Visible', {}, true);
    const hiddenElement = createMockElement('Hidden', {}, false);

    await expectElement(visibleElement).toBeVisible();
    await expectElement(hiddenElement).toBeHidden();
  });

  it('should support enabled/disabled assertions', async () => {
    const enabledElement = createMockElement('Enabled', {}, true, true);
    const disabledElement = createMockElement('Disabled', {}, true, false);

    await expectElement(enabledElement).toBeEnabled();
    await expectElement(disabledElement).toBeDisabled();
  });

  it('should support attribute assertions', async () => {
    const element = createMockElement('Test', {
      'class': 'btn btn-primary',
      'href': 'https://example.com',
      'data-id': '123'
    });

    await expectElement(element).toHaveAttribute('class', 'btn btn-primary');
    await expectElement(element).toHaveAttribute('href', 'https://example.com');
    await expectElement(element).toHaveAttributeContaining('href', 'example.com');
    await expectElement(element).toHaveAttributeContaining('class', 'btn');
  });

  it('should support CSS class assertions', async () => {
    const element = createMockElement('Button', { 'class': 'btn btn-primary active' });

    await expectElement(element).toHaveClass('btn');
    await expectElement(element).toHaveClass('btn-primary');
    await expectElement(element).toHaveClass('active');
  });

  it('should support value assertions', async () => {
    const inputElement = createMockElement('Input', { 'value': 'test@example.com' });

    await expectElement(inputElement).toHaveValue('test@example.com');
    await expectElement(inputElement).toHaveValueContaining('example.com');
    await expectElement(inputElement).toHaveValueContaining('test@');
  });

  it('should provide clear error messages', async () => {
    const element = createMockElement('Wrong Text');

    try {
      await expectElement(element).toHaveText('Expected Text');
      throw new Error('Should have failed');
    } catch (error: any) {
      if (!error.message.includes('Expected element to have text "Expected Text"')) {
        throw new Error('Error message should be descriptive');
      }
    }
  });

  it('should support custom timeout', async () => {
    const element = createMockElement('Test');

    // This should work with custom timeout
    await expectElement(element, 2000).toHaveText('Test');
  });
});