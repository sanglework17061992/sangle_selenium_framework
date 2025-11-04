"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverManager = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_js_1 = __importDefault(require("selenium-webdriver/chrome.js"));
const firefox_js_1 = __importDefault(require("selenium-webdriver/firefox.js"));
const ConfigLoader_1 = require("../config/ConfigLoader");
class DefaultChromeFactory {
    async build(options) {
        const config = ConfigLoader_1.configLoader.getBrowserConfig();
        const opts = new chrome_js_1.default.Options();
        if (config.headless || options?.headless)
            opts.addArguments('--headless=new');
        if (config.noSandbox || options?.noSandbox)
            opts.addArguments('--no-sandbox', '--disable-dev-shm-usage');
        // Add custom args from config
        if (config.args && config.args.length > 0) {
            opts.addArguments(...config.args);
        }
        // Add any additional args from options
        if (options?.args) {
            opts.addArguments(...options.args);
        }
        return new selenium_webdriver_1.Builder().forBrowser('chrome').setChromeOptions(opts).build();
    }
}
class DefaultFirefoxFactory {
    async build(options) {
        const config = ConfigLoader_1.configLoader.getBrowserConfig();
        const opts = new firefox_js_1.default.Options();
        if (config.headless || options?.headless)
            opts.addArguments('-headless');
        // Add custom args from config
        if (config.args && config.args.length > 0) {
            opts.addArguments(...config.args);
        }
        // Add any additional args from options
        if (options?.args) {
            opts.addArguments(...options.args);
        }
        return new selenium_webdriver_1.Builder().forBrowser('firefox').setFirefoxOptions(opts).build();
    }
}
class DriverManager {
    static register(name, factory) {
        this.factories.set(name.toLowerCase(), factory);
    }
    static async getDriver(name, options) {
        const config = ConfigLoader_1.configLoader.getBrowserConfig();
        const browserName = name || config.name;
        const factory = this.factories.get(browserName.toLowerCase());
        if (!factory)
            throw new Error(`No browser registered for: ${browserName}`);
        return factory.build(options);
    }
    /**
     * Get driver using configuration from .env file
     */
    static async getConfiguredDriver() {
        const config = ConfigLoader_1.configLoader.getBrowserConfig();
        return this.getDriver(config.name);
    }
}
exports.DriverManager = DriverManager;
DriverManager.factories = new Map();
// register defaults
DriverManager.register('chrome', new DefaultChromeFactory());
DriverManager.register('firefox', new DefaultFirefoxFactory());
exports.default = DriverManager;
