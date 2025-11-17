import { WebElement, ThenableWebDriver } from 'selenium-webdriver';
import { ActionType, Check } from '../../types/Enums';
import { getActionRequirements } from './ActionConfig';
import { TIMING } from '../../config/Constants';
import { sleep, TimeUtils } from '../../utils/TimeUtils';

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

  // Helper functions

  /**
   * Ensure element meets all requirements for the specified action type
   */
  async ensure(actionType: ActionType, element: WebElement): Promise<void> {
    const { checks } = getActionRequirements(actionType);

    for (const check of checks) {
      await this.runCheck(check, element);
    }
  }

  /**
   * Run a specific check on an element
   */
  private async runCheck(check: Check, element: WebElement): Promise<void> {
    switch (check) {
      case Check.VISIBLE:
        return this.checkVisible(element);
      case Check.STABLE:
        return this.checkStable(element);
      case Check.ENABLED:
        return this.checkEnabled(element);
      case Check.EDITABLE:
        return this.checkEditable(element);
      default:
        throw new Error(`Unknown actionability check: ${check}`);
    }
  }

  /**
   * Wait for element to become actionable for the specified action type
   */
  async waitUntilReady(actionType: ActionType, element: WebElement, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (TimeUtils.getRemainingTimeout(startTime, timeout) > 0) {
      try {
        await this.ensure(actionType, element);
        return; // All checks passed
      } catch {
        // Continue waiting
      }
      
      await sleep(TIMING.DEFAULT_RETRY_INTERVAL);
    }
    
    // Generate detailed error on timeout
    const { checks } = getActionRequirements(actionType);
    const failedChecks: string[] = [];
    
    for (const check of checks) {
      try {
        await this.runCheck(check, element);
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
      
      // Simple editable checks for common cases
      if (tagName === 'input') {
        const type = (el.type || 'text').toLowerCase();
        const isTextInput = ['text', 'password', 'email', 'search', 'tel', 'url'].includes(type);
        return isTextInput && !el.readOnly && !el.disabled;
      }
      
      if (tagName === 'textarea') {
        return !el.readOnly && !el.disabled;
      }
      
      // ContentEditable
      return el.contentEditable === 'true';
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