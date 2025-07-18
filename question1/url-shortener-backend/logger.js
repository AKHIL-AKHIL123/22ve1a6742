
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, 'access.log');

function logToFile(message) {
  fs.appendFile(logFile, message + '\n', err => {
    if (err) throw err;
  });
}

function logger(req, res, next) {
  const { method, url } = req;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = `${new Date().toISOString()} ${method} ${url} ${res.statusCode} ${duration}ms`;
    logToFile(logEntry);
  });
  next();
}
export default logger;