import { WebElement } from 'selenium-webdriver';
import { ActionType, Check } from '@enums';
import { getActionRequirements } from '@core/elements/ActionConfig';
import { TIMING } from '@config/Constants';
import { TimeUtils } from '@utils/TimeUtils';
import { configLoader } from '@config/ConfigLoader';
import { defaultDriverManager } from '@driver/DriverManager';
import { ActionabilityError } from '@errors';

export { Check } from '@enums';

export interface ActionabilityOptions {
  checks?: readonly Check[];
  timeout?: number;
}

interface CheckResult {
  passed: boolean;
  failedCheck?: Check;
  lastPassedCheck?: Check;
  reason?: string;
}

/**
 * Class to handle all element actionability checks
 */
export class ActionabilityChecker {

  /**
   * Validate that element meets all requirements for the specified action type
   * Note: Check.VISIBLE is always checked first (implicit for all actions)
   * Returns early on first failed check to avoid unnecessary rechecks
   * 
   * @param actionType - The type of action being validated
   * @param element - The element to validate
   * @param skipChecks - Set of checks that already passed (skip rechecking them)
   */
  async validateActionRequirements(
    actionType: ActionType, 
    element: WebElement,
    skipChecks?: Set<Check>
  ): Promise<CheckResult> {
    // Defensive initialization: if skipChecks not provided, create empty Set
    skipChecks ??= new Set();

    // Always check visibility first (implicit for all actions) unless already passed
    if (!skipChecks.has(Check.VISIBLE)) {
      const isVisible = await this.checkVisible(element);
      if (!isVisible) {
        return { passed: false, failedCheck: Check.VISIBLE, reason: 'Element is not visible' };
      }
      // Visibility passed, track it
      skipChecks.add(Check.VISIBLE);
    }
    
    // Then check explicit requirements for the action type
    const { checks } = getActionRequirements(actionType);
    let lastPassedCheck: Check | undefined;
    
    for (const check of checks) {
      // Skip this check if it already passed in a previous loop
      if (skipChecks.has(check)) {
        lastPassedCheck = check;
        continue;
      }
      
      const isPassed = await this.executeElementCheck(check, element);
      if (!isPassed) {
        return { passed: false, failedCheck: check, reason: `Check failed: ${check}` };
      }
      
      // This check passed, track it
      lastPassedCheck = check;
      skipChecks.add(check);
    }
    
    return { passed: true, lastPassedCheck };
  }

  /**
   * Execute a specific check on an element and return result
   */
  private async executeElementCheck(check: Check, element: WebElement): Promise<boolean> {
    switch (check) {
      case Check.STABLE:
        return this.checkStable(element);
      case Check.ENABLED:
        return this.checkEnabled(element);
      case Check.EDITABLE:
        return this.checkEditable(element);
      default:
        return false;
    }
  }

  /**
   * Wait for element to become actionable for the specified action type
   * Tracks which checks fail and how many times to provide detailed diagnostics
   * Optimizes by skipping checks that have already passed in previous loops
   */
  async waitUntilReady(actionType: ActionType, element: WebElement, timeout?: number): Promise<void> {
    const effectiveTimeout = timeout ?? configLoader.getTimeoutConfig().element;
    const startTime = Date.now();
    
    const failedChecks: Map<Check, number> = new Map();
    const passedChecks: Set<Check> = new Set(); // Track checks that already passed

    while (TimeUtils.getRemainingTimeout(startTime, effectiveTimeout) > 0) {
      // Pass the passedChecks set to skip rechecking them
      const result = await this.validateActionRequirements(actionType, element, passedChecks);
      
      if (result.passed) {
        return; // All checks passed
      }
      
      // Track this failure
      if (result.failedCheck) {
        failedChecks.set(
          result.failedCheck,
          (failedChecks.get(result.failedCheck) ?? 0) + 1
        );
      }
      
      // Wait before retry
      await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
    }
    
    // Build detailed error message showing all failed checks
    const failureDetails = Array.from(failedChecks.entries())
      .map(([check, count]) => `${check} (failed ${count} times)`)
      .join(', ');
    
    throw new ActionabilityError(
      `Element not ready for ${actionType} within ${effectiveTimeout}ms`,
      {
        operation: actionType,
        reason: `Failed checks: ${failureDetails}`
      }
    );
  }

  // -----------------------------------------------------
  // Internal check methods
  // -----------------------------------------------------

  private getDriver() {
    return defaultDriverManager.getDriver();
  }

  private async executeScript<T>(script: string, element: WebElement): Promise<T> {
    const driver = this.getDriver();
    return driver.executeScript<T>(script, element);
  }

  private async checkVisible(element: WebElement): Promise<boolean> {
    try {
      if (!(await element.isDisplayed())) {
        return false;
      }

      const rect = await element.getRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }

      const visibility = await this.executeScript<string>(
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
      await TimeUtils.sleep(TIMING.STABILITY_CHECK_DELAY);
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

      const ariaDisabled = await this.executeScript<boolean>(
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
      // First check if element is enabled (implicit for editable)
      const isEnabled = await this.checkEnabled(element);
      if (!isEnabled) {
        return false;
      }

      const result = await this.executeScript<boolean>(
        `
        const el = arguments[0];
        const tagName = el.tagName.toLowerCase();
        
        // Check editable type and readonly state
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