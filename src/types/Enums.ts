/**
 * Browser types supported by the framework
 */
export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox'
}

/**
 * Log levels for framework logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Action types for element interactions
 */
export enum ActionType {
  CLICK = 'click',
  TYPE = 'type',
  CLEAR = 'clear',
  CHECK = 'check',
  UNCHECK = 'uncheck',
  HOVER = 'hover',
  // Read operation
  READ = 'read'
}

/**
 * Check types for element actionability
 * These define what conditions must be met before performing actions
 */
export enum Check {
  VISIBLE = 'visible',
  STABLE = 'stable',
  ENABLED = 'enabled',
  EDITABLE = 'editable',
}

/**
 * Locator types for element selection
 */
export enum LocatorType {
  CSS = 'css',
  XPATH = 'xpath',
  ID = 'id',
  NAME = 'name',
  CLASS = 'class'
}

/**
 * Configuration value types for parsing
 */
export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean'
}

/**
 * Configuration keys for environment variables
 * Add new keys here when extending configuration
 */
export enum ConfigKey {
  BROWSER = 'BROWSER',
  HEADLESS = 'HEADLESS',
  NO_SANDBOX = 'NO_SANDBOX',
  BASE_URL = 'BASE_URL',
  LOG_LEVEL = 'LOG_LEVEL',
  ELEMENT_TIMEOUT = 'ELEMENT_TIMEOUT'
}
