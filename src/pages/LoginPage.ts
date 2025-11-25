import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

/**
 * LoginPage - Page object for Self-Healing Demo login form
 */
export class LoginPage extends BasePage {
  // Locators - Field initialization
  readonly usernameField: SanElement = this.id('username');
  readonly passwordField: SanElement = this.id('password');
  readonly loginButton: SanElement = this.id('login-button');
  readonly statusContainer: SanElement = this.css('.status');

  // Alternative locators for broken selectors testing
  readonly usernameFieldBroken: SanElement = this.id('user-input-broken');
  readonly passwordFieldBroken: SanElement = this.id('pass-input-broken');
  readonly loginButtonBroken: SanElement = this.id('login-btn-broken');

  // Page actions
  async login(username: string, password: string): Promise<void> {
    await this.usernameField.type(username);
    await this.passwordField.type(password);
    await this.loginButton.click();
  }

  async getStatusText(): Promise<string> {
    return await this.statusContainer.getText();
  }

  async isStatusBroken(): Promise<boolean> {
    const statusText = await this.getStatusText();
    return statusText.includes('BROKEN');
  }

  async breakSelectors(): Promise<void> {
    await fetch('http://localhost:5000/api/break-selectors', { method: 'POST' });
  }

  async restoreSelectors(): Promise<void> {
    await fetch('http://localhost:5000/api/restore-selectors', { method: 'POST' });
  }

  async getServerState(): Promise<{ breakSelector: boolean }> {
    const response = await fetch('http://localhost:5000/api/state');
    return response.json();
  }
}
