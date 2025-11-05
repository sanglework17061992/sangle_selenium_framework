"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const SanElement_1 = __importDefault(require("../core/elements/SanElement"));
const WaitHelper_1 = __importDefault(require("../helpers/WaitHelper"));
class BasePage {
    constructor(driver) {
        // Shorthand aliases for common selectors
        this.css = this.byCss.bind(this);
        this.id = this.byId.bind(this);
        this.xpath = this.byXpath.bind(this);
        this.name = this.byName.bind(this);
        this.className = this.byClass.bind(this);
        this.driver = driver;
        this.wait = new WaitHelper_1.default(driver);
    }
    $(locator) {
        return new SanElement_1.default(this.driver, locator);
    }
    // User-friendly locator helper methods
    byCss(selector) {
        return this.$({ using: 'css', value: selector });
    }
    byId(id) {
        return this.$({ using: 'id', value: id });
    }
    byXpath(xpath, ...params) {
        const formattedXpath = params.length > 0 ? this.formatXpath(xpath, params) : xpath;
        return this.$({ using: 'xpath', value: formattedXpath });
    }
    formatXpath(xpath, params) {
        let result = xpath;
        for (const param of params) {
            // Replace %s placeholders with actual parameters
            result = result.replace('%s', param);
        }
        return result;
    }
    byName(name) {
        return this.$({ using: 'name', value: name });
    }
    byClass(className) {
        return this.$({ using: 'class', value: className });
    }
}
exports.BasePage = BasePage;
