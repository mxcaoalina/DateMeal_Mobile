/**
 * Simple logging utility for server-side code
 */

type LogType = 'info' | 'error' | 'warning' | 'debug' | 'ai' | 'azure' | 'azure-bing' | 'bing';

/**
 * Log a message with the specified log type
 * @param message The message to log
 * @param type The type of log message
 */
export function log(message: string, type: LogType = 'info'): void {
  const timestamp = new Date().toISOString();
  
  switch (type) {
    case 'error':
      console.error(`[${timestamp}] [ERROR] ${message}`);
      break;
    case 'warning':
      console.warn(`[${timestamp}] [WARNING] ${message}`);
      break;
    case 'debug':
      console.debug(`[${timestamp}] [DEBUG] ${message}`);
      break;
    case 'ai':
      console.log(`[${timestamp}] [AI] ${message}`);
      break;
    case 'azure':
      console.log(`[${timestamp}] [AZURE] ${message}`);
      break;
    case 'azure-bing':
      console.log(`[${timestamp}] [AZURE+BING] ${message}`);
      break;
    case 'bing':
      console.log(`[${timestamp}] [BING] ${message}`);
      break;
    case 'info':
    default:
      console.log(`[${timestamp}] [INFO] ${message}`);
      break;
  }
} 