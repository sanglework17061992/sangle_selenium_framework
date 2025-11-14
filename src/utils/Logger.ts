import { LogLevel } from '../types/Enums';

export class Logger {
  private currentLevel: LogLevel;

  private static readonly levels: LogLevel[] = [
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR
  ];

  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.levels.indexOf(level) >= Logger.levels.indexOf(this.currentLevel);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message));
    }
  }

  error(message: string, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMessage = error ? `${message}: ${error.message}` : message;
      console.error(this.formatMessage(LogLevel.ERROR, errorMessage));
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }
}

// Export a default instance
export const logger = new Logger();
