"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePage = void 0;
const BasePage_1 = require("./BasePage");
const ConfigLoader_1 = require("../config/ConfigLoader");
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
    async waitForLoadingToComplete() {
        const { By, until } = await Promise.resolve().then(() => __importStar(require('selenium-webdriver')));
        await this.driver.wait(until.elementIsNotVisible(await this.driver.findElement(By.xpath('//div[contains(@class, "loading")]'))), 10000);
    }
}
exports.ExamplePage = ExamplePage;
