import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message, data = {}) => {
    const log = `[${timestamp()}] INFO: ${message} ${JSON.stringify(data)}`;
    console.log(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log + '\n');
  },

  error: (message, error = {}) => {
    const log = `[${timestamp()}] ERROR: ${message} ${JSON.stringify(error)}`;
    console.error(log);
    fs.appendFileSync(path.join(logDir, 'error.log'), log + '\n');
  },

  warn: (message, data = {}) => {
    const log = `[${timestamp()}] WARN: ${message} ${JSON.stringify(data)}`;
    console.warn(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log + '\n');
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const log = `[${timestamp()}] DEBUG: ${message} ${JSON.stringify(data)}`;
      console.log(log);
    }
  }
};

export default logger;
