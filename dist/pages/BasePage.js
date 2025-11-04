import SanElement from '../core/SanElement.js';
export class BasePage {
    constructor(driver) {
        this.driver = driver;
    }
    $(locator) {
        return new SanElement(this.driver, locator);
    }
}
