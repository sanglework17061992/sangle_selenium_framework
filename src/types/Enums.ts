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

/**
 * Driver execution modes
 * Determines whether tests run in parallel or sequential mode
 */
export enum ExecutionMode {
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential'
}

/**
 * Error type enum for categorizing different error scenarios
 * Used for the readonly type property in error classes
 */
export enum ErrorType {
  AssertionError = 'AssertionError',
  TimeoutError = 'TimeoutError',
  ElementError = 'ElementError',
  ActionabilityError = 'ActionabilityError',
  ConfigurationError = 'ConfigurationError',
  NavigationError = 'NavigationError',
  UnexpectedError = 'UnexpectedError'
}
