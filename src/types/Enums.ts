/**
 * Centralized Enums for the Selenium Framework
 * This file contains all enum definitions used across the framework for easy management and control
 */

/**
 * Browser types supported by the framework
 */
export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox'
}

/**
 * Environment types for different deployment stages
 */
export enum EnvironmentType {
  DEV = 'dev',
  QA = 'qa',
  STAGING = 'staging',
  PROD = 'prod'
}

/**
 * Log levels for framework logging
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Reporter types for test reporting
 */
export enum ReporterType {
  ALLURE = 'allure',
  MOCHAWESOME = 'mochawesome',
  NONE = 'none'
}

/**
 * Action types for element interactions
 * These define the different types of actions that can be performed on elements
 */
export enum ActionType {
  CLICK = 'click',
  DOUBLE_CLICK = 'dblclick',
  RIGHT_CLICK = 'contextmenu',
  TYPE = 'type',
  CLEAR = 'clear',
  CHECK = 'check',
  UNCHECK = 'uncheck',
  HOVER = 'hover',
  FOCUS = 'focus',
  SELECT = 'select',
  DRAG = 'drag'
}
