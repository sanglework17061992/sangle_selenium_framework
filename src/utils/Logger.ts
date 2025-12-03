import winston from 'winston';
import { LogLevel } from '@enums';
import path from 'node:path';
import { configLoader } from '@config/ConfigLoader';

// Create logs directory
const logDir = 'logs';

// Get log level from config or default to INFO
const logLevel = configLoader.getLogLevel();

// Global worker ID context - set when in parallel mode
let globalWorkerId: string | null = null;

// logger configuration
const winstonLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      const workerPrefix = globalWorkerId && globalWorkerId !== 'main' ? `[Worker ${globalWorkerId}] ` : '';
      const stackTrace = stack && typeof stack === 'string' ? '\n' + stack : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${workerPrefix}${message}${stackTrace}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// Wrapper class to maintain existing API
export class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  constructor(level: LogLevel = LogLevel.INFO, workerId?: string) {
    this.setLevel(level);
    if (workerId && workerId !== 'main') {
      globalWorkerId = workerId;
    }
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
      // Check if it's a SanError with getFormattedMessage method
      if ('getFormattedMessage' in error && typeof error.getFormattedMessage === 'function') {
        const sanError = error as any;
        winstonLogger.error(`${message} ${sanError.getFormattedMessage()}`);
      } else {
        winstonLogger.error(`${message}: ${error.message}`);
      }
    } else {
      winstonLogger.error(message);
    }
  }

  /**
   * Set worker ID for parallel test execution logging
   * Adds worker context to all subsequent logs
   */
  setWorkerId(workerId: string): void {
    if (workerId === 'main') {
      globalWorkerId = null;
    } else {
      globalWorkerId = workerId;
    }
  }
}

// Export - initialized with log level from config
export const logger = new Logger(logLevel, process.env.MOCHA_WORKER_ID);
