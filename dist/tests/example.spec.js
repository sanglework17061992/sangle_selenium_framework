"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DriverManager_1 = __importDefault(require("../src/driver/DriverManager"));
const ExamplePage_1 = require("../src/pages/ExamplePage");
const FluentAssertions_1 = require("../src/assertion/FluentAssertions");
const mocha_1 = require("mocha");
let driver;
let page;
(0, mocha_1.describe)('Example site', function () {
    this.timeout(30000);
    (0, mocha_1.before)(async () => {
        driver = await DriverManager_1.default.getConfiguredDriver();
        page = new ExamplePage_1.ExamplePage(driver);
    });
    (0, mocha_1.after)(async () => {
        if (driver)
            await driver.quit();
    });
    (0, mocha_1.it)('should show example domain title', async () => {
        await page.open();
        // Playwright-style fluent assertions
        await (0, FluentAssertions_1.expectElement)(page.title).toHaveText('Example Domain');
        await (0, FluentAssertions_1.expectElement)(page.moreInfo).toBeVisible();
        await (0, FluentAssertions_1.expectElement)(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
    });
    (0, mocha_1.it)('should demonstrate various assertion types', async () => {
        await page.open();
        // Text assertions
        await (0, FluentAssertions_1.expectElement)(page.title).toHaveText('Example Domain');
        await (0, FluentAssertions_1.expectElement)(page.title).toContainText('Domain');
        // Visibility assertions
        await (0, FluentAssertions_1.expectElement)(page.title).toBeVisible();
        await (0, FluentAssertions_1.expectElement)(page.moreInfo).toBeVisible();
        // Attribute assertions
        await (0, FluentAssertions_1.expectElement)(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
        await (0, FluentAssertions_1.expectElement)(page.moreInfo).toHaveAttributeContaining('href', 'iana.org');
    });
});
