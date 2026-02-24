import { SanError } from '@errors/SanError';

/**
 * ConfigurationError - Thrown when configuration is missing or invalid
 * 
 * @example
 * throw new ConfigurationError('BASE_URL is not configured', {
 *   configKey: 'BASE_URL'
 * });
 */
export class ConfigurationError extends SanError {
  readonly configKey?: string;

  constructor(
    message: string,
    options?: {
      configKey?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options?.lastError, context: options?.context });
    this.configKey = options?.configKey;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      this.baseMessage,
      `  Error Type: ${this.type}`
    ];

    if (this.configKey) {
      lines.push(`  Config Key: ${this.configKey}`);
    }

    lines.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    return lines.join('\n');
  }
}
