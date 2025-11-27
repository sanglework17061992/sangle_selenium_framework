/**
 * LoginPage - Page Object for Login Form
 * Encapsulates all interactions with the login page
 */

import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

export class LoginPage extends BasePage {
  // ===== LOCATORS =====
  // Using ID locators ONLY (no fallbacks)
  // This will trigger HEALING when IDs don't match in HTML
  // The HTML has _sangle suffix (id="username-input_sangle")
  // but we're looking for original ID (id="username-input")
  // Healing should kick in and find the element using hints/DOM scanning
  readonly usernameInput: SanElement = this.id('username-input');
  readonly passwordInput: SanElement = this.id('password-input');
  readonly loginButton: SanElement = this.id('login-button');

  // Error/Success messages - using data-testid for stability
  readonly errorMessage: SanElement = this.css('[data-testid="error-message"]');
  readonly successMessage: SanElement = this.css('[data-testid="success-message"]');

  // ===== PAGE ACTIONS =====

  /**
   * Navigate to login page
   */
  async open(): Promise<void> {
    await this.driver.get('http://localhost:3000');
  }

  /**
   * Perform login with username and password
   */
  async login(username: string, password: string): Promise<void> {
    // Clear any existing input
    await this.usernameInput.click({ force: true });
    await this.usernameInput.type(username);

    await this.passwordInput.click({ force: true });
    await this.passwordInput.type(password);

    // Submit form
    await this.loginButton.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      const message = await this.errorMessage.getText();
      return message;
    } catch (error: unknown) {
      return '';
    }
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    try {
      const message = await this.successMessage.getText();
      return message;
    } catch (error: unknown) {
      return '';
    }
  }

  /**
   * Check if username input is visible
   */
  async isUsernameInputDisplayed(): Promise<boolean> {
    return await this.usernameInput.isDisplayed();
  }

  /**
   * Check if password input is visible
   */
  async isPasswordInputDisplayed(): Promise<boolean> {
    return await this.passwordInput.isDisplayed();
  }

  /**
   * Check if login button is visible
   */
  async isLoginButtonDisplayed(): Promise<boolean> {
    return await this.loginButton.isDisplayed();
  }

  /**
   * Wait for error message to appear
   */
  async waitForErrorMessage(timeout: number = 5000): Promise<void> {
    // Wait for element to appear with .show class
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const classes = await this.errorMessage.getAttribute('class');
        if (classes?.includes('show')) {
          return;
        }
      // eslint-disable-next-line no-empty
      } catch (error: unknown) {
        // Element not found yet, keep trying
      }
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Error message did not show within timeout');
  }

  /**
   * Wait for success message to appear
   */
  async waitForSuccessMessage(timeout: number = 5000): Promise<void> {
    // Wait for element to appear with .show class
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const classes = await this.successMessage.getAttribute('class');
        if (classes?.includes('show')) {
          return;
        }
      // eslint-disable-next-line no-empty
      } catch (error: unknown) {
        // Element not found yet, keep trying
      }
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Success message did not show within timeout');
  }

  /**
   * Get username input value
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.getText();
  }
}

export default LoginPage;
