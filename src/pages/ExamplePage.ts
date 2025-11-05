import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';

export class ExamplePage extends BasePage {
  // Page elements using CSS selectors (most common and reliable)
  title = this.byCss('h1');
  moreInfo = this.byCss('a');

  // Form elements - using ID selectors for speed and reliability
  usernameField = this.byId('username');
  passwordField = this.byId('password');
  loginButton = this.byId('login-btn');

  // Navigation elements
  header = this.byCss('header');
  footer = this.byId('footer');
  navMenu = this.byCss('nav');

  // Links and buttons - using CSS selectors for links
  forgotPasswordLink = this.byCss('a[href*="forgot"]');
  signupLink = this.byCss('a[href*="signup"]');

  // Status messages - using CSS classes for dynamic content
  errorMessage = this.byCss('.error-message');
  successMessage = this.byCss('.success-message');

  // Complex cases - XPath when CSS isn't sufficient
  submitButton = this.byXpath('//button[@type="submit"]');
  loadingSpinner = this.byXpath('//div[contains(@class, "loading")]');

  async open() {
    const appConfig = configLoader.getAppConfig();
    await this.driver.get(appConfig.baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.type(username);
    await this.passwordField.type(password);
    await this.loginButton.click();
  }

  async getPageTitle(): Promise<string> {
    return await this.title.getText();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.successMessage.isDisplayed();
    } catch {
      return false; // Element not found = not logged in
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      return await this.errorMessage.getText();
    } catch {
      return ''; // No error message present
    }
  }

  async navigateToSignup(): Promise<void> {
    await this.signupLink.click();
  }

  async resetPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async waitForLoadingToComplete(): Promise<void> {
    const { By, until } = await import('selenium-webdriver');
    await this.driver.wait(
      until.elementIsNotVisible(
        await this.driver.findElement(By.xpath('//div[contains(@class, "loading")]'))
      ),
      10000
    );
  }
}