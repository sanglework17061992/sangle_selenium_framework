import { WebElement, ThenableWebDriver } from 'selenium-webdriver';

export interface ActionabilityOptions {
  visible?: boolean;
  stable?: boolean;
  receivesEvents?: boolean;
  enabled?: boolean;
  editable?: boolean;
  timeout?: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ActionabilityChecker {
  private static readonly STABILITY_CHECK_INTERVAL = 50; // ms between stability checks
  private static readonly STABILITY_REQUIRED_MATCHES = 2; // consecutive matching boxes
  private static readonly POLL_INTERVAL = 100; // ms between retries

  /**
   * Check if element is visible (non-empty bounding box, not visibility:hidden)
   * According to Playwright: element has non-empty bounding box and does not have visibility:hidden
   */
  static async isVisible(element: WebElement): Promise<boolean> {
    try {
      // Check if displayed (Selenium built-in)
      const displayed = await element.isDisplayed();
      if (!displayed) return false;

      // Check bounding box is non-empty
      const rect = await element.getRect();
      if (rect.width === 0 || rect.height === 0) return false;

      // Check computed style visibility
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

  /**
   * Check if element is stable (same bounding box for consecutive animation frames)
   * Element is stable when it maintains the same bounding box for at least two consecutive checks
   */
  static async isStable(element: WebElement): Promise<boolean> {
    try {
      const boxes: BoundingBox[] = [];
      
      // Collect bounding boxes over time
      for (let i = 0; i < this.STABILITY_REQUIRED_MATCHES; i++) {
        const rect = await element.getRect();
        boxes.push({
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
        
        if (i < this.STABILITY_REQUIRED_MATCHES - 1) {
          await new Promise(resolve => setTimeout(resolve, this.STABILITY_CHECK_INTERVAL));
        }
      }

      // Check all boxes are identical
      const firstBox = boxes[0];
      return boxes.every(box => 
        box.x === firstBox.x &&
        box.y === firstBox.y &&
        box.width === firstBox.width &&
        box.height === firstBox.height
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if element receives pointer events (not obscured by other elements)
   * Uses document.elementFromPoint to check if element is the hit target at its center point
   */
  static async receivesEvents(element: WebElement, driver: ThenableWebDriver): Promise<boolean> {
    try {
      const rect = await element.getRect();
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;

      // Use document.elementFromPoint to check hit target at center point
      const result = await driver.executeScript<boolean>(
        `
        const target = arguments[0];
        const x = arguments[1];
        const y = arguments[2];
        const hitElement = document.elementFromPoint(x, y);
        
        if (!hitElement) return false;
        
        // Check if hit element is the target or contains it or is contained by it
        return target === hitElement || target.contains(hitElement) || hitElement.contains(target);
        `,
        element,
        centerX,
        centerY
      );

      return result;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled (not disabled)
   * According to Playwright, element is disabled when:
   * - it has [disabled] attribute
   * - it's part of a <fieldset> with [disabled] attribute
   * - it has [aria-disabled=true] attribute
   */
  static async isEnabled(element: WebElement): Promise<boolean> {
    try {
      // Check Selenium's isEnabled (handles disabled attribute and fieldset)
      const enabled = await element.isEnabled();
      if (!enabled) return false;

      // Check aria-disabled
      const driver = element.getDriver() as ThenableWebDriver;
      const ariaDisabled = await driver.executeScript<boolean>(
        `
        const elem = arguments[0];
        const ariaDisabled = elem.getAttribute('aria-disabled');
        return ariaDisabled === 'true';
        `,
        element
      );

      return !ariaDisabled;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is editable (enabled and not readonly)
   * Element is readonly when:
   * - it has [readonly] attribute
   * - it has [aria-readonly=true] attribute with supporting role
   */
  static async isEditable(element: WebElement): Promise<boolean> {
    try {
      // First check if enabled
      const enabled = await this.isEnabled(element);
      if (!enabled) return false;

      // Check readonly attributes
      const driver = element.getDriver() as ThenableWebDriver;
      const isReadonly = await driver.executeScript<boolean>(
        `
        const elem = arguments[0];
        
        // Check readonly attribute
        if (elem.hasAttribute('readonly')) return true;
        
        // Check aria-readonly
        const ariaReadonly = elem.getAttribute('aria-readonly');
        return ariaReadonly === 'true';
        `,
        element
      );

      return !isReadonly;
    } catch {
      return false;
    }
  }

  /**
   * Main method: Wait for element to meet actionability requirements
   * Retries checks until timeout is reached or all checks pass
   */
  static async waitForActionability(
    element: WebElement,
    driver: ThenableWebDriver,
    options: ActionabilityOptions
  ): Promise<void> {
    const timeout = options.timeout ?? 10000;
    const startTime = Date.now();
    const errors: string[] = [];

    while (Date.now() - startTime < timeout) {
      errors.length = 0;

      try {
        // Perform required checks in order
        if (options.visible) {
          const visible = await this.isVisible(element);
          if (!visible) {
            errors.push('Element is not visible');
          }
        }

        if (options.stable && errors.length === 0) {
          const stable = await this.isStable(element);
          if (!stable) {
            errors.push('Element is not stable (still animating)');
          }
        }

        if (options.enabled && errors.length === 0) {
          const enabled = await this.isEnabled(element);
          if (!enabled) {
            errors.push('Element is not enabled (disabled)');
          }
        }

        if (options.editable && errors.length === 0) {
          const editable = await this.isEditable(element);
          if (!editable) {
            errors.push('Element is not editable (readonly or disabled)');
          }
        }

        if (options.receivesEvents && errors.length === 0) {
          const receivesEvents = await this.receivesEvents(element, driver);
          if (!receivesEvents) {
            errors.push('Element does not receive events (obscured by another element)');
          }
        }

        // If all checks passed, return successfully
        if (errors.length === 0) {
          return;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
      } catch (error) {
        // Element might have become stale, add to errors and retry
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Element check failed: ${errorMsg}`);
        await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
      }
    }

    // Timeout reached, throw error with details
    throw new Error(
      `Timeout waiting for element to be actionable after ${timeout}ms. ` +
      `Failed checks: ${errors.join(', ')}`
    );
  }
}
