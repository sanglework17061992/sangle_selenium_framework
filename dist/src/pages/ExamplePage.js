"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePage = void 0;
const BasePage_1 = require("./BasePage");
const ConfigLoader_1 = require("../config/ConfigLoader");
class ExamplePage extends BasePage_1.BasePage {
    constructor() {
        super(...arguments);
        this.title = this.$({ using: 'css', value: 'h1' });
        this.moreInfo = this.$({ using: 'css', value: 'a' });
    }
    async open() {
        const appConfig = ConfigLoader_1.configLoader.getAppConfig();
        await this.driver.get(appConfig.baseUrl);
    }
}
exports.ExamplePage = ExamplePage;
