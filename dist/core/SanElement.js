import { By, until } from 'selenium-webdriver';
function toBy(locator) {
    switch (locator.using) {
        case 'css': return By.css(locator.value);
        case 'xpath': return By.xpath(locator.value);
        case 'id': return By.id(locator.value);
        case 'name': return By.name(locator.value);
        case 'tag': return By.tagName(locator.value);
        case 'class': return By.className(locator.value);
        default: throw new Error('Unsupported locator');
    }
}
export class SanElement {
    constructor(driver, locator, defaultTimeout = 5000) {
        this.driver = driver;
        this.locator = locator;
        this.defaultTimeout = defaultTimeout;
    }
    async findElement(timeout) {
        const by = toBy(this.locator);
        const t = timeout ?? this.defaultTimeout;
        // Wait until located and visible
        await this.driver.wait(until.elementLocated(by), t);
        const el = await this.driver.findElement(by);
        await this.driver.wait(until.elementIsVisible(el), t);
        return el;
    }
    // Core interactions: click, type, getText, isDisplayed, getAttribute
    async click(timeout) {
        const el = await this.findElement(timeout);
        await this.driver.wait(until.elementIsEnabled(el), timeout ?? this.defaultTimeout);
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
export default SanElement;
