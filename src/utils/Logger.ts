import winston from 'winston';
import { LogLevel } from '@enums';
import path from 'node:path';

// Create logs directory
const logDir = 'logs';

// logger configuration
const winstonLogger = winston.createLogger({
  level: LogLevel.INFO,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      const stackTrace = stack && typeof stack === 'string' ? '\n' + stack : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${stackTrace}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ],
  silent: process.env.NODE_ENV === 'test'
});

// Wrapper class to maintain existing API
export class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.setLevel(level);
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
    winstonLogger.level = level;
  }

  debug(message: string): void {
    winstonLogger.debug(message);
  }

  info(message: string): void {
    winstonLogger.info(message);
  }

  warn(message: string): void {
    winstonLogger.warn(message);
  }

  error(message: string, error?: Error): void {
    if (error) {
      winstonLogger.error(`${message}: ${error.message}`, { stack: error.stack });
    } else {
      winstonLogger.error(message);
    }
  }
}

// Export
export const logger = new Logger();
