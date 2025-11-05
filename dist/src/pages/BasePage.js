"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const SanElement_1 = __importDefault(require("../core/SanElement"));
class BasePage {
    constructor(driver) {
        // Shorthand aliases for common selectors
        this.css = this.byCss.bind(this);
        this.id = this.byId.bind(this);
        this.xpath = this.byXpath.bind(this);
        this.name = this.byName.bind(this);
        this.className = this.byClass.bind(this);
        this.driver = driver;
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
    byXpath(xpath) {
        return this.$({ using: 'xpath', value: xpath });
    }
    byName(name) {
        return this.$({ using: 'name', value: name });
    }
    byClass(className) {
        return this.$({ using: 'class', value: className });
    }
}
exports.BasePage = BasePage;
