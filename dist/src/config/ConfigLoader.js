"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configLoader = exports.ConfigLoader = exports.LogLevel = exports.EnvironmentType = exports.BrowserType = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables from .env file
(0, dotenv_1.config)();
// Enums for type-safe configuration
var BrowserType;
(function (BrowserType) {
    BrowserType["CHROME"] = "chrome";
    BrowserType["FIREFOX"] = "firefox";
})(BrowserType || (exports.BrowserType = BrowserType = {}));
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType["DEV"] = "dev";
    EnvironmentType["QA"] = "qa";
    EnvironmentType["STAGING"] = "staging";
    EnvironmentType["PROD"] = "prod";
})(EnvironmentType || (exports.EnvironmentType = EnvironmentType = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Configuration loader for the SaniumTS framework
 * Loads configuration from environment variables (.env file)
 */
class ConfigLoader {
    constructor() {
        this.config = this.loadConfiguration();
    }
    static getInstance() {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }
    loadConfiguration() {
        return {
            browser: this.loadBrowserConfig(),
            timeouts: this.loadTimeoutConfig(),
            test: this.loadTestConfig(),
            logging: this.loadLoggingConfig(),
            reporting: this.loadReportingConfig(),
            app: this.loadAppConfig()
        };
    }
    loadBrowserConfig() {
        const browserName = this.getEnvBrowserType('BROWSER', BrowserType.CHROME);
        const headless = this.getEnvBoolean('HEADLESS', false);
        const noSandbox = this.getEnvBoolean('NO_SANDBOX', true);
        let args = [];
        if (browserName === BrowserType.CHROME) {
            const chromeArgs = this.getEnvString('CHROME_ARGS', '');
            args = chromeArgs ? chromeArgs.split(',') : [];
        }
        else if (browserName === BrowserType.FIREFOX) {
            const firefoxArgs = this.getEnvString('FIREFOX_ARGS', '');
            args = firefoxArgs ? firefoxArgs.split(',') : [];
        }
        return {
            name: browserName,
            headless,
            noSandbox,
            args
        };
    }
    loadTimeoutConfig() {
        return {
            default: this.getEnvNumber('DEFAULT_TIMEOUT', 5000),
            element: this.getEnvNumber('ELEMENT_TIMEOUT', 10000),
            pageLoad: this.getEnvNumber('PAGE_LOAD_TIMEOUT', 30000)
        };
    }
    loadTestConfig() {
        return {
            environment: this.getEnvEnvironmentType('ENVIRONMENT', EnvironmentType.QA),
            retryCount: this.getEnvNumber('RETRY_COUNT', 3),
            retryInterval: this.getEnvNumber('RETRY_INTERVAL', 500),
            parallel: this.getEnvBoolean('PARALLEL', false),
            threadCount: this.getEnvNumber('THREAD_COUNT', 2)
        };
    }
    loadLoggingConfig() {
        return {
            level: this.getEnvLogLevel('LOG_LEVEL', LogLevel.INFO),
            file: this.getEnvString('LOG_FILE', './logs/test.log')
        };
    }
    loadReportingConfig() {
        return {
            screenshotOnFailure: this.getEnvBoolean('SCREENSHOT_ON_FAILURE', true),
            videoRecording: this.getEnvBoolean('VIDEO_RECORDING', false)
        };
    }
    loadAppConfig() {
        return {
            baseUrl: this.getEnvString('BASE_URL', 'https://example.com'),
            loginUrl: this.getEnvString('LOGIN_URL', 'https://example.com/login'),
            productsUrl: this.getEnvString('PRODUCTS_URL', 'https://example.com/products'),
            username: this.getEnvString('USERNAME', 'testuser'),
            password: this.getEnvString('PASSWORD', 'testpass123')
        };
    }
    getEnvString(key, defaultValue) {
        return process.env[key] || defaultValue;
    }
    getEnvNumber(key, defaultValue) {
        const value = process.env[key];
        if (!value)
            return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    getEnvBoolean(key, defaultValue) {
        const value = process.env[key];
        if (!value)
            return defaultValue;
        return value.toLowerCase() === 'true';
    }
    getEnvBrowserType(key, defaultValue) {
        const value = this.getEnvString(key, defaultValue);
        const upperValue = value.toUpperCase();
        return Object.values(BrowserType).includes(upperValue)
            ? upperValue
            : defaultValue;
    }
    getEnvEnvironmentType(key, defaultValue) {
        const value = this.getEnvString(key, defaultValue);
        const upperValue = value.toUpperCase();
        return Object.values(EnvironmentType).includes(upperValue)
            ? upperValue
            : defaultValue;
    }
    getEnvLogLevel(key, defaultValue) {
        const value = this.getEnvString(key, defaultValue);
        const upperValue = value.toUpperCase();
        return Object.values(LogLevel).includes(upperValue)
            ? upperValue
            : defaultValue;
    }
    /**
     * Get the complete configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Get browser configuration
     */
    getBrowserConfig() {
        return this.config.browser;
    }
    /**
     * Get timeout configuration
     */
    getTimeoutConfig() {
        return this.config.timeouts;
    }
    /**
     * Get test configuration
     */
    getTestConfig() {
        return this.config.test;
    }
    /**
     * Get logging configuration
     */
    getLoggingConfig() {
        return this.config.logging;
    }
    /**
     * Get reporting configuration
     */
    getReportingConfig() {
        return this.config.reporting;
    }
    /**
     * Get application configuration
     */
    getAppConfig() {
        return this.config.app;
    }
    /**
     * Reload configuration (useful for dynamic config changes)
     */
    reload() {
        this.config = this.loadConfiguration();
    }
    /**
     * Print current configuration to console
     */
    printConfig() {
        console.log('=== Framework Configuration ===');
        console.log('Browser:', this.config.browser);
        console.log('Timeouts:', this.config.timeouts);
        console.log('Test:', this.config.test);
        console.log('Logging:', this.config.logging);
        console.log('Reporting:', this.config.reporting);
        console.log('App:', {
            ...this.config.app,
            password: '***' // Hide password in logs
        });
        console.log('===============================');
    }
}
exports.ConfigLoader = ConfigLoader;
// Export singleton instance
exports.configLoader = ConfigLoader.getInstance();
exports.default = exports.configLoader;
