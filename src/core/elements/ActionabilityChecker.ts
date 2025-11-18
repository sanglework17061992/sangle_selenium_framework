import { WebElement, ThenableWebDriver } from 'selenium-webdriver';
import { ActionType, Check } from '../../types/Enums';
import { getActionRequirements } from './ActionConfig';
import { TIMING } from '../../config/Constants';
import { sleep, getRemainingTimeout } from '../../utils/TimeUtils';
import { configLoader } from '../../config/ConfigLoader';

export { Check } from '../../types/Enums';

export interface ActionabilityOptions {
  checks?: readonly Check[];
  timeout?: number;
}

/**
 * Class to handle all element actionability checks
 */
export class ActionabilityChecker {

  /**
   * Validate that element meets all requirements for the specified action type
   * Note: Check.VISIBLE is always checked first (implicit for all actions)
   */
  async validateActionRequirements(actionType: ActionType, element: WebElement): Promise<void> {
    // Always check visibility first (implicit for all actions)
    await this.checkVisible(element);
    
    // Then check explicit requirements for the action type
    const { checks } = getActionRequirements(actionType);
    for (const check of checks) {
      await this.executeElementCheck(check, element);
    }
  }

  /**
   * Execute a specific check on an element and throw error if failed
   */
  private async executeElementCheck(check: Check, element: WebElement): Promise<void> {
    let passed = false;
    let errorMessage = '';

    switch (check) {
      case Check.STABLE:
        passed = await this.checkStable(element);
        errorMessage = 'Element position is not stable';
        break;
      case Check.ENABLED:
        passed = await this.checkEnabled(element);
        errorMessage = 'Element is not enabled';
        break;
      case Check.EDITABLE:
        passed = await this.checkEditable(element);
        errorMessage = 'Element is not editable';
        break;
      default:
        throw new Error(`Unknown actionability check: ${check}`);
    }

    if (!passed) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Wait for element to become actionable for the specified action type
   */
  async waitUntilReady(actionType: ActionType, element: WebElement, timeout?: number): Promise<void> {
    const effectiveTimeout = timeout ?? configLoader.getTimeoutConfig().element;
    const startTime = Date.now();
    
    let lastError: Error | null = null;
    
    while (getRemainingTimeout(startTime, effectiveTimeout) > 0) {
      try {
        await this.validateActionRequirements(actionType, element);
        return; // All checks passed
      } catch (error: any) {
        lastError = error;
        await sleep(TIMING.DEFAULT_RETRY_INTERVAL);
      }
    }
    
    throw new Error(
      `Element not ready for ${actionType} within ${effectiveTimeout}ms. ` +
      `${lastError?.message || 'Unknown error'}`
    );
  }

  // -----------------------------------------------------
  // Internal check methods
  // -----------------------------------------------------

  private async checkVisible(element: WebElement): Promise<boolean> {
    try {
      if (!(await element.isDisplayed())) {
        return false;
      }

      const rect = await element.getRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }

      const driver = element.getDriver() as ThenableWebDriver;
      const visibility = await driver.executeScript<string>(
        'return window.getComputedStyle(arguments[0]).visibility;',
        element
      );
      
      return visibility !== 'hidden';
    } catch {
      return false;
    }
  }

  private async checkStable(element: WebElement): Promise<boolean> {
    try {
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
      // Wait to ensure element is truly stable
      await sleep(TIMING.DEFAULT_RETRY_INTERVAL);
      const second = await getPosition();

      return (
        first.x === second.x &&
        first.y === second.y &&
        first.width === second.width &&
        first.height === second.height
      );
    } catch {
      return false;
    }
  }

  private async checkEnabled(element: WebElement): Promise<boolean> {
    try {
      if (!(await element.isEnabled())) {
        return false;
      }

      const driver = element.getDriver() as ThenableWebDriver;
      const ariaDisabled = await driver.executeScript<boolean>(
        "return arguments[0].getAttribute('aria-disabled') === 'true';",
        element
      );

      return !ariaDisabled;
    } catch {
      return false;
    }
  }

  private async checkEditable(element: WebElement): Promise<boolean> {
    try {
      const driver = element.getDriver() as ThenableWebDriver;
      const result = await driver.executeScript<boolean>(
        `
        const el = arguments[0];
        const tagName = el.tagName.toLowerCase();
        
        // Check disabled state first - throw immediately if disabled
        if (el.disabled) {
          return false;
        }
        
        // Simple editable checks for common cases
        if (tagName === 'input') {
          const type = (el.type || 'text').toLowerCase();
          const isTextInput = ['text', 'password', 'email', 'search', 'tel', 'url'].includes(type);
          const isReadOnly = el.readOnly || el.getAttribute('aria-readonly') === 'true';
          return isTextInput && !isReadOnly;
        }
        
        if (tagName === 'textarea') {
          const isReadOnly = el.readOnly || el.getAttribute('aria-readonly') === 'true';
          return !isReadOnly;
        }
        
        // ContentEditable
        return el.contentEditable === 'true';
        `,
        element
      );

      return result;
    } catch {
      return false;
    }
  }
}

// Create singleton instance for easy use
export const actionabilityChecker = new ActionabilityChecker();