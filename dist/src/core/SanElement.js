"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanElement = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const ConfigLoader_1 = require("../config/ConfigLoader");
function toBy(locator) {
    switch (locator.using) {
        case 'css': return selenium_webdriver_1.By.css(locator.value);
        case 'xpath': return selenium_webdriver_1.By.xpath(locator.value);
        case 'id': return selenium_webdriver_1.By.id(locator.value);
        case 'name': return selenium_webdriver_1.By.name(locator.value);
        case 'tag': return selenium_webdriver_1.By.tagName(locator.value);
        case 'class': return selenium_webdriver_1.By.className(locator.value);
        default: throw new Error('Unsupported locator');
    }
}
class SanElement {
    constructor(driver, locator, defaultTimeout) {
        this.driver = driver;
        this.locator = locator;
        this.defaultTimeout = defaultTimeout ?? ConfigLoader_1.configLoader.getTimeoutConfig().element;
    }
    async findElement(timeout) {
        const by = toBy(this.locator);
        const t = timeout ?? this.defaultTimeout;
        // Wait until located and visible
        await this.driver.wait(selenium_webdriver_1.until.elementLocated(by), t);
        const el = await this.driver.findElement(by);
        await this.driver.wait(selenium_webdriver_1.until.elementIsVisible(el), t);
        return el;
    }
    // Core interactions: click, type, getText, isDisplayed, getAttribute
    async click(timeout) {
        const el = await this.findElement(timeout);
        await this.driver.wait(selenium_webdriver_1.until.elementIsEnabled(el), timeout ?? this.defaultTimeout);
        await el.click();
    }
    async type(text, timeout) {
        const el = await this.findElement(timeout);
        await el.clear();
        await el.sendKeys(text);
    }
    async getText(timeout) {
        const el = await this.findElement(timeout);
        return el.getText();
    }
    async getAttribute(name, timeout) {
        const el = await this.findElement(timeout);
        return el.getAttribute(name);
    }
    async isDisplayed(timeout) {
        try {
            const el = await this.findElement(timeout);
            return el.isDisplayed();
        }
        catch (err) {
            return false;
        }
    }
    // expose raw element for advanced operations
    async raw(timeout) {
        return this.findElement(timeout);
    }
}
exports.SanElement = SanElement;
exports.default = SanElement;
