import { WebElement, ThenableWebDriver } from 'selenium-webdriver';
import { ActionType, Check } from '../../types/Enums';
import { getActionRequirements } from './ActionConfig';

export { Check } from '../../types/Enums';

export interface ActionabilityOptions {
  checks?: readonly Check[];
  timeout?: number;
}

/**
 * Single class to handle all element actionability checks
 * Uses strategy pattern internally for clean, maintainable code
 */
export class ActionabilityChecker {
  private readonly strategies: Record<Check, (element: WebElement) => Promise<void>>;
  private readonly DEFAULT_RETRY_INTERVAL = 100;

  constructor() {
    this.strategies = {
      [Check.VISIBLE]: this.checkVisible.bind(this),
      [Check.STABLE]: this.checkStable.bind(this),
      [Check.ENABLED]: this.checkEnabled.bind(this),
      [Check.EDITABLE]: this.checkEditable.bind(this),
    };
  }

  // Helper functions
  private getRemainingTimeout(startTime: number, totalTimeout: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, totalTimeout - elapsed);
  }

  /**
   * Ensure element meets all requirements for the specified action type
   */
  async ensure(actionType: ActionType, element: WebElement): Promise<void> {
    const { checks } = getActionRequirements(actionType);

    for (const check of checks) {
      const checkFn = this.strategies[check];
      if (!checkFn) {
        throw new Error(`Unknown actionability check: ${check}`);
      }
      await checkFn(element);
    }
  }

  /**
   * Wait for element to become actionable for the specified action type
   */
  async waitUntilReady(actionType: ActionType, element: WebElement, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (this.getRemainingTimeout(startTime, timeout) > 0) {
      try {
        await this.ensure(actionType, element);
        return; // All checks passed
      } catch {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, this.DEFAULT_RETRY_INTERVAL));
    }
    
    // Generate detailed error on timeout
    const { checks } = getActionRequirements(actionType);
    const failedChecks: string[] = [];
    
    for (const check of checks) {
      try {
        await this.strategies[check](element);
      } catch (error: any) {
        failedChecks.push(`${check} (${error.message})`);
      }
    }
    
    throw new Error(
      `Element not ready for ${actionType} within ${timeout}ms. ` +
      `Failed: ${failedChecks.join(', ')}`
    );
  }

  // -----------------------------------------------------
  // Internal check methods
  // -----------------------------------------------------

  private async checkVisible(element: WebElement): Promise<void> {
    if (!(await element.isDisplayed())) {
      throw new Error('Element is not displayed');
    }

    const rect = await element.getRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error('Element has zero size');
    }

    const driver = element.getDriver() as ThenableWebDriver;
    const visibility = await driver.executeScript<string>(
      'return window.getComputedStyle(arguments[0]).visibility;',
      element
    );
    
    if (visibility === 'hidden') {
      throw new Error('Element visibility is hidden');
    }
  }

  private async checkStable(element: WebElement): Promise<void> {
    const getPosition = async () => {
      const rect = await element.getRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    };

    const first = await getPosition();
    const second = await getPosition();

    if (
      first.x !== second.x ||
      first.y !== second.y ||
      first.width !== second.width ||
      first.height !== second.height
    ) {
      throw new Error('Element position is not stable');
    }
  }

  private async checkEnabled(element: WebElement): Promise<void> {
    if (!(await element.isEnabled())) {
      throw new Error('Element is disabled');
    }

    const driver = element.getDriver() as ThenableWebDriver;
    const ariaDisabled = await driver.executeScript<boolean>(
      "return arguments[0].getAttribute('aria-disabled') === 'true';",
      element
    );

    if (ariaDisabled) {
      throw new Error('Element is aria-disabled');
    }
  }

  private async checkEditable(element: WebElement): Promise<void> {
    const driver = element.getDriver() as ThenableWebDriver;
    const result = await driver.executeScript<boolean>(
      `
      const el = arguments[0];
      const tagName = el.tagName.toLowerCase();
      const type = el.type ? el.type.toLowerCase() : '';
      const readOnly = el.readOnly;
      const contentEditable = el.contentEditable;
      
      return (
        (tagName === 'input' && ['text', 'password', 'email', 'url', 'tel', 'search', 'number', 'date', 'time', 'datetime-local', 'month', 'week', 'color'].includes(type) && !readOnly) ||
        (tagName === 'textarea' && !readOnly) ||
        contentEditable === 'true'
      );
      `,
      element
    );

    if (!result) {
      throw new Error('Element is not editable');
    }
  }
}

// Create singleton instance for easy use
export const actionabilityChecker = new ActionabilityChecker();