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
  HOVER = 'hover'
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
