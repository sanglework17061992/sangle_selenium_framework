"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePage = void 0;
const BasePage_1 = require("./BasePage");
const ConfigLoader_1 = require("../config/ConfigLoader");
const selenium_webdriver_1 = require("selenium-webdriver");
class ExamplePage extends BasePage_1.BasePage {
    constructor() {
        super(...arguments);
        // Page elements using CSS selectors (most common and reliable)
        this.title = this.byCss('h1');
        this.moreInfo = this.byCss('a');
        // Form elements - using ID selectors for speed and reliability
        this.usernameField = this.byId('username');
        this.passwordField = this.byId('password');
        this.loginButton = this.byId('login-btn');
        // Navigation elements
        this.header = this.byCss('header');
        this.footer = this.byId('footer');
        this.navMenu = this.byCss('nav');
        // Links and buttons - using CSS selectors for links
        this.forgotPasswordLink = this.byCss('a[href*="forgot"]');
        this.signupLink = this.byCss('a[href*="signup"]');
        // Status messages - using CSS classes for dynamic content
        this.errorMessage = this.byCss('.error-message');
        this.successMessage = this.byCss('.success-message');
        // Complex cases - XPath when CSS isn't sufficient
        this.submitButton = this.byXpath('//button[@type="submit"]');
        this.loadingSpinner = this.byXpath('//div[contains(@class, "loading")]');
        // ==========================================
        // DYNAMIC XPATH EXAMPLES: Parameterized XPath
        // ==========================================
        // Dynamic XPath with single parameter
        this.categoryLink = (categoryName) => this.byXpath("//a[contains(text(), '%s')]", categoryName);
        // Dynamic XPath with multiple parameters
        this.productCard = (category, productName) => this.byXpath("//div[@class='%s']//h3[text()='%s']", category, productName);
        // Dynamic XPath for table rows
        this.tableRow = (rowIndex) => this.byXpath("//table//tr[%s]", rowIndex);
        // Dynamic XPath for form fields by label
        this.formField = (fieldLabel) => this.byXpath("//label[text()='%s']/following-sibling::input", fieldLabel);
    }
    async open() {
        const appConfig = ConfigLoader_1.configLoader.getAppConfig();
        await this.driver.get(appConfig.baseUrl);
    }
    async login(username, password) {
        await this.usernameField.type(username);
        await this.passwordField.type(password);
        await this.loginButton.click();
    }
    async getPageTitle() {
        return await this.title.getText();
    }
    async isLoggedIn() {
        try {
            return await this.successMessage.isDisplayed();
        }
        catch {
            return false; // Element not found = not logged in
        }
    }
    async getErrorMessage() {
        try {
            return await this.errorMessage.getText();
        }
        catch {
            return ''; // No error message present
        }
    }
    async navigateToSignup() {
        await this.signupLink.click();
    }
    async resetPassword() {
        await this.forgotPasswordLink.click();
    }
    // ==========================================
    // DYNAMIC XPATH USAGE EXAMPLES
    // ==========================================
    async clickCategory(categoryName) {
        const categoryElement = this.categoryLink(categoryName);
        await categoryElement.click();
    }
    async getProductPrice(category, productName) {
        // Navigate to price element relative to product card
        const priceElement = this.byXpath("//div[@class='%s']//h3[text()='%s']/following-sibling::span[@class='price']", category, productName);
        return await priceElement.getText();
    }
    async selectTableRow(rowIndex) {
        const rowElement = this.tableRow(rowIndex.toString());
        await rowElement.click();
    }
    async fillFormField(fieldLabel, value) {
        const fieldElement = this.formField(fieldLabel);
        await fieldElement.type(value);
    }
    // ==========================================
    // WAIT HELPER USAGE EXAMPLES
    // ==========================================
    async waitForPageToLoad() {
        await this.wait.waitForPageLoad();
    }
    async waitForAjaxRequests() {
        await this.wait.waitForAjaxComplete();
    }
    async waitForSuccessMessage() {
        await this.wait.waitForTextInElement(selenium_webdriver_1.By.css('.success-message'), 'Login successful');
    }
    async waitForUrlChange(expectedUrlPart) {
        await this.wait.waitForUrlToContain(expectedUrlPart);
    }
    async waitForLoadingToComplete() {
        // Use WaitHelper for more reliable waiting
        await this.wait.waitForLoadingSpinner();
    }
}
exports.ExamplePage = ExamplePage;
