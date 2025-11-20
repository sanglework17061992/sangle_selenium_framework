/**
 * Utility for formatting values in error messages and logs
 */

/**
 * Format any value for readable error/log output
 * Handles strings, null, undefined, functions, arrays, and objects
 */
export function formatValue(value: any): string {
  const type = typeof value;
  
  switch (type) {
    case 'string':
      return `"${value}"`;
    case 'function':
      return '[Function]';
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return `[${value.map(v => formatValue(v)).join(', ')}]`;
      }
      return String(value);
    case 'undefined':
      return 'undefined';
    default:
      return String(value);
  }
}
