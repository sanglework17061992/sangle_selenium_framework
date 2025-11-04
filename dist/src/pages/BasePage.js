"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const SanElement_1 = __importDefault(require("../core/SanElement"));
class BasePage {
    constructor(driver) {
        this.driver = driver;
    }
    $(locator) {
        return new SanElement_1.default(this.driver, locator);
    }
}
exports.BasePage = BasePage;
