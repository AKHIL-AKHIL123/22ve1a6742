// Custom Logging Middleware (no console.log or built-in logging)
const fs = require('fs');
const path = require('path');

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
module.exports = logger;

